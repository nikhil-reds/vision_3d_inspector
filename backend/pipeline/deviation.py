"""Stage 6 — Geometric deviation between the aligned reconstruction and the GLB.

Distances are computed in meters (model frame) and reported in millimeters.
Model->reconstruction distances only use GLB surface points that at least one camera
could see, so unphotographed sides don't count as "missing".
"""
import numpy as np
import open3d as o3d
import trimesh
from scipy.spatial import cKDTree

from . import config
from .errors import PipelineError

MM = 1000.0


def _raycasting_scene(mesh: trimesh.Trimesh) -> o3d.t.geometry.RaycastingScene:
    scene = o3d.t.geometry.RaycastingScene()
    scene.add_triangles(
        o3d.core.Tensor(np.asarray(mesh.vertices, dtype=np.float32)),
        o3d.core.Tensor(np.asarray(mesh.faces, dtype=np.uint32)),
    )
    return scene


def _visible_model_points(scene, model_pts: np.ndarray, cams: list[np.ndarray], intrinsics, size, eps: float) -> np.ndarray:
    w, h = size
    visible = np.zeros(len(model_pts), dtype=bool)
    for cam, k in zip(cams, intrinsics):
        center = cam[:3, 3]
        # In-frustum test (OpenCV camera).
        local = (model_pts - center) @ cam[:3, :3]
        z = local[:, 2]
        with np.errstate(divide="ignore", invalid="ignore"):
            u = k[0, 0] * local[:, 0] / z + k[0, 2]
            v = k[1, 1] * local[:, 1] / z + k[1, 2]
        in_view = (z > 0) & (u >= 0) & (u < w) & (v >= 0) & (v < h)
        # Occlusion test: first hit along the ray must be the point itself.
        dirs = model_pts - center
        dist = np.linalg.norm(dirs, axis=1)
        rays = np.hstack([np.repeat(center[None], len(model_pts), 0), dirs / dist[:, None]]).astype(np.float32)
        t_hit = scene.cast_rays(o3d.core.Tensor(rays))["t_hit"].numpy()
        visible |= in_view & (t_hit >= dist - eps)
    return visible


def _location_label(c: np.ndarray, lo: np.ndarray, hi: np.ndarray) -> str:
    """Coarse human-readable location in glTF axes (+X right, +Y up, +Z front)."""
    n = (c - lo) / np.maximum(hi - lo, 1e-12)
    pick = lambda v, a, b, mid: a if v < 1 / 3 else b if v > 2 / 3 else mid  # noqa: E731
    parts = [pick(n[1], "lower", "upper", ""), pick(n[2], "rear", "front", ""), pick(n[0], "left", "right", "")]
    label = " ".join(p for p in parts if p)
    return label or "centre"


def _regions(pts: np.ndarray, d: np.ndarray, lo, hi, diag: float) -> list[dict]:
    tol = config.TOLERANCE_MM / MM
    out_idx = np.flatnonzero(d > tol)
    if len(out_idx) < 20:
        return []
    pcd = o3d.geometry.PointCloud(o3d.utility.Vector3dVector(pts[out_idx]))
    labels = np.asarray(pcd.cluster_dbscan(eps=diag * 0.03, min_points=20))
    regions = []
    for lab in range(labels.max() + 1 if labels.size else 0):
        sel = out_idx[labels == lab]
        c = pts[sel].mean(0)
        regions.append({
            "location": _location_label(c, lo, hi),
            "centroidMm": [round(float(x) * MM, 1) for x in c],
            "pointShare": round(len(sel) / len(pts) * 100, 2),
            "meanDeviationMm": round(float(d[sel].mean()) * MM, 2),
            "maxDeviationMm": round(float(d[sel].max()) * MM, 2),
        })
    regions.sort(key=lambda r: r["maxDeviationMm"] * r["pointShare"], reverse=True)
    return regions[:8]


def verdict(metrics: dict) -> str:
    v = metrics[config.VERDICT_METRIC]
    if v < config.PASS_THRESHOLD_MM:
        return "PASS"
    if v > config.FAIL_THRESHOLD_MM:
        return "FAIL"
    return "REVIEW"


def compute_deviation(aligned: o3d.geometry.PointCloud, mesh: trimesh.Trimesh, cams, intrinsics, size) -> tuple[np.ndarray, dict]:
    """Returns per-point deviation (meters) for `aligned` and the summary metrics."""
    try:
        pts = np.asarray(aligned.points)
        scene = _raycasting_scene(mesh)
        d_r2m = scene.compute_distance(o3d.core.Tensor(pts.astype(np.float32))).numpy().astype(np.float64)

        diag = float(np.linalg.norm(mesh.bounding_box.extents))
        model_pts, _ = trimesh.sample.sample_surface_even(mesh, config.MODEL_SAMPLE_POINTS, seed=1)
        visible = _visible_model_points(scene, model_pts, cams, intrinsics, size, eps=diag * 1e-3)
        if visible.sum() < 100:
            raise PipelineError("deviation_calculation_failed", "Almost none of the GLB surface is visible from the estimated cameras.")
        d_m2r = cKDTree(pts).query(model_pts[visible])[0]

        tol = config.TOLERANCE_MM / MM
        lo, hi = mesh.bounds
        metrics = {
            "meanDeviationMm": float(d_r2m.mean() * MM),
            "medianDeviationMm": float(np.median(d_r2m) * MM),
            "p95DeviationMm": float(np.percentile(d_r2m, 95) * MM),
            "maxDeviationMm": float(d_r2m.max() * MM),
            "rmseMm": float(np.sqrt((d_r2m ** 2).mean()) * MM),
            "chamferDistanceMm": float((d_r2m.mean() + d_m2r.mean()) / 2 * MM),
            "hausdorffDistanceMm": float(max(d_r2m.max(), d_m2r.max()) * MM),
            "pointsOutsideTolerance": int((d_r2m > tol).sum()),
            "outsideTolerancePercentage": float((d_r2m > tol).mean() * 100),
            "pointsCompared": int(len(pts)),
            "visibleModelCoverage": float(visible.mean() * 100),
        }
        metrics = {k: round(v, 3) if isinstance(v, float) else v for k, v in metrics.items()}
        return d_r2m, {"metrics": metrics, "regions": _regions(pts, d_r2m, lo, hi, diag)}
    except PipelineError:
        raise
    except Exception as e:  # noqa: BLE001
        raise PipelineError("deviation_calculation_failed", f"Deviation calculation failed: {e}") from e
