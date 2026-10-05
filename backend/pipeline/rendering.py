"""Stage 4 — Render the GLB at the camera poses estimated from the photos.

DUSt3R's cameras live in its own arbitrary-scale frame, so the GLB has to be placed
in that frame before it can be rendered from those cameras. This stage therefore
first computes a coarse similarity registration (scale + FPFH/RANSAC); Stage 5
refines it with ICP.
"""
import numpy as np
import open3d as o3d
import trimesh
from PIL import Image

from . import config
from .errors import PipelineError
from .paths import InspectionPaths
from .pose import PoseResult

# OpenCV camera (+z forward, +y down) -> OpenGL camera (-z forward, +y up)
CV_TO_GL = np.diag([1.0, -1.0, -1.0, 1.0])


def to_o3d(points: np.ndarray) -> o3d.geometry.PointCloud:
    return o3d.geometry.PointCloud(o3d.utility.Vector3dVector(np.asarray(points, dtype=np.float64)))


def sample_model(mesh: trimesh.Trimesh, n: int = config.MODEL_SAMPLE_POINTS) -> o3d.geometry.PointCloud:
    pts, _ = trimesh.sample.sample_surface_even(mesh, n, seed=0)
    return to_o3d(pts)


def similarity_scale(m: np.ndarray) -> float:
    return float(np.cbrt(np.linalg.det(m[:3, :3])))


def camera_in_model_frame(cam2world: np.ndarray, m: np.ndarray) -> np.ndarray:
    """Map a camera pose through the similarity transform m (recon -> model). Scale moves
    the camera centre but must not end up in the rotation."""
    s = similarity_scale(m)
    r = m[:3, :3] / s
    out = np.eye(4)
    out[:3, :3] = r @ cam2world[:3, :3]
    out[:3, 3] = m[:3, :3] @ cam2world[:3, 3] + m[:3, 3]
    return out


def _rms_radius(pts: np.ndarray) -> float:
    return float(np.sqrt(((pts - pts.mean(0)) ** 2).sum(1).mean()))


def _fpfh(pcd: o3d.geometry.PointCloud, voxel: float):
    down = pcd.voxel_down_sample(voxel)
    down.estimate_normals(o3d.geometry.KDTreeSearchParamHybrid(radius=voxel * 2, max_nn=30))
    feat = o3d.pipelines.registration.compute_fpfh_feature(
        down, o3d.geometry.KDTreeSearchParamHybrid(radius=voxel * 5, max_nn=100)
    )
    return down, feat


def coarse_register(recon: o3d.geometry.PointCloud, model_pcd: o3d.geometry.PointCloud) -> tuple[np.ndarray, dict]:
    """Similarity transform (4x4, scale folded into the rotation block) mapping recon -> model."""
    reg = o3d.pipelines.registration
    src_pts, tgt_pts = np.asarray(recon.points), np.asarray(model_pcd.points)
    model_diag = float(np.linalg.norm(model_pcd.get_max_bound() - model_pcd.get_min_bound()))
    voxel = model_diag / 50
    tgt_down, tgt_feat = _fpfh(model_pcd, voxel)
    base_scale = _rms_radius(tgt_pts) / max(_rms_radius(src_pts), 1e-12)

    best = None
    for k in config.RANSAC_SCALE_CANDIDATES:
        s = base_scale * k
        pre = np.eye(4)
        pre[:3, :3] *= s
        pre[:3, 3] = tgt_pts.mean(0) - s * src_pts.mean(0)
        src = to_o3d(src_pts).transform(pre)
        src_down, src_feat = _fpfh(src, voxel)
        ransac = reg.registration_ransac_based_on_feature_matching(
            src_down, tgt_down, src_feat, tgt_feat, True, voxel * 1.5,
            reg.TransformationEstimationPointToPoint(False), 3,
            [reg.CorrespondenceCheckerBasedOnEdgeLength(0.9), reg.CorrespondenceCheckerBasedOnDistance(voxel * 1.5)],
            reg.RANSACConvergenceCriteria(100000, 0.999),
        )
        icp = reg.registration_icp(
            src_down, tgt_down, voxel * 1.5, ransac.transformation,
            reg.TransformationEstimationPointToPoint(with_scaling=True),
            reg.ICPConvergenceCriteria(max_iteration=30),
        )
        # Source-side fitness alone rewards shrinking the reconstruction until it fits inside the
        # model, so also require the model to be covered (harmonic mean of both directions).
        moved = o3d.geometry.PointCloud(src_down).transform(icp.transformation)
        reverse = reg.evaluate_registration(tgt_down, moved, voxel * 1.5, np.eye(4)).fitness
        both = 2 * icp.fitness * reverse / max(icp.fitness + reverse, 1e-12)
        score = (both, -icp.inlier_rmse)
        if best is None or score > best[0]:
            best = (score, icp.transformation @ pre, k, icp.fitness)

    if best is None or best[3] == 0:
        raise PipelineError("glb_rendering_failed", "Could not place the GLB in the camera frame (coarse registration found no overlap).")
    m = np.asarray(best[1])
    return m, {"coarseFitness": float(best[3]), "coarseScale": similarity_scale(m), "scaleCandidate": best[2]}


class MeshRenderer:
    """Offscreen pyrender renderer for one mesh, using OpenCV-style intrinsics/poses."""

    def __init__(self, mesh: trimesh.Trimesh, width: int, height: int):
        import pyrender

        self._pr = pyrender
        diag = float(np.linalg.norm(mesh.bounding_box.extents))
        self.znear, self.zfar = diag * 1e-3, diag * 100
        material = pyrender.MetallicRoughnessMaterial(baseColorFactor=[0.72, 0.75, 0.8, 1.0], metallicFactor=0.1, roughnessFactor=0.7)
        plain = trimesh.Trimesh(mesh.vertices, mesh.faces, process=False)
        self.scene = pyrender.Scene(bg_color=[0, 0, 0, 0], ambient_light=[0.35, 0.35, 0.35])
        self.scene.add(pyrender.Mesh.from_trimesh(plain, material=material, smooth=False))
        self.renderer = pyrender.OffscreenRenderer(width, height)

    def render(self, k: np.ndarray, cam2world_cv: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
        pr = self._pr
        cam = pr.IntrinsicsCamera(fx=k[0, 0], fy=k[1, 1], cx=k[0, 2], cy=k[1, 2], znear=self.znear, zfar=self.zfar)
        pose_gl = cam2world_cv @ CV_TO_GL
        cam_node = self.scene.add(cam, pose=pose_gl)
        light_node = self.scene.add(pr.DirectionalLight(color=np.ones(3), intensity=3.0), pose=pose_gl)
        try:
            color, depth = self.renderer.render(self.scene, flags=pr.RenderFlags.RGBA)
        finally:
            self.scene.remove_node(cam_node)
            self.scene.remove_node(light_node)
        return color, depth

    def close(self) -> None:
        self.renderer.delete()


def render_views(
    paths: InspectionPaths, mesh: trimesh.Trimesh, model_pcd: o3d.geometry.PointCloud,
    recon: o3d.geometry.PointCloud, pose: PoseResult,
) -> tuple[np.ndarray, list[np.ndarray], dict]:
    try:
        m, reg_info = coarse_register(recon, model_pcd)
    except PipelineError:
        raise
    except Exception as e:  # noqa: BLE001
        raise PipelineError("glb_rendering_failed", f"Coarse registration failed: {e}") from e

    cams = [camera_in_model_frame(p, m) for p in pose.poses]
    w, h = pose.size
    files = []
    try:
        renderer = MeshRenderer(mesh, w, h)
        try:
            for i, (k, cam) in enumerate(zip(pose.intrinsics, cams), start=1):
                color, depth = renderer.render(k, cam)
                if not (depth > 0).any():
                    raise PipelineError("glb_rendering_failed", f"GLB is not visible from camera {i}.")
                out = paths.sub("renders", f"render-{i}.png")
                Image.fromarray(color).save(out)
                files.append(paths.url(out))
        finally:
            renderer.close()
    except PipelineError:
        raise
    except Exception as e:  # noqa: BLE001
        raise PipelineError("glb_rendering_failed", f"GLB rendering failed: {e}") from e

    return m, cams, {**reg_info, "renders": files}
