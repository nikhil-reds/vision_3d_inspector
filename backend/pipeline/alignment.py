"""Stage 5 — Geometry alignment: refine the coarse similarity with multi-scale ICP."""
import numpy as np
import open3d as o3d

from . import config
from .errors import PipelineError
from .paths import InspectionPaths
from .rendering import similarity_scale


def align(
    paths: InspectionPaths, recon: o3d.geometry.PointCloud, model_pcd: o3d.geometry.PointCloud, coarse: np.ndarray,
) -> tuple[o3d.geometry.PointCloud, np.ndarray, dict]:
    reg = o3d.pipelines.registration
    model_diag = float(np.linalg.norm(model_pcd.get_max_bound() - model_pcd.get_min_bound()))
    t = coarse
    result = None
    try:
        # Coarse -> fine correspondence distances, relative to the model size.
        for frac in (0.05, 0.02, 0.01):
            result = reg.registration_icp(
                recon, model_pcd, model_diag * frac, t,
                reg.TransformationEstimationPointToPoint(with_scaling=True),
                reg.ICPConvergenceCriteria(max_iteration=config.ICP_MAX_ITER),
            )
            t = result.transformation
    except Exception as e:  # noqa: BLE001
        raise PipelineError("alignment_failed", f"ICP raised an error: {e}") from e

    t = np.asarray(t)
    if result is None or not np.isfinite(t).all():
        raise PipelineError("alignment_failed", "ICP produced an invalid transformation.")
    scale, coarse_scale = similarity_scale(t), similarity_scale(coarse)
    if not 0.5 < scale / coarse_scale < 2.0:
        raise PipelineError("alignment_failed", f"ICP diverged (scale changed from {coarse_scale:.4g} to {scale:.4g}).")
    if result.fitness < config.ICP_MIN_FITNESS:
        raise PipelineError(
            "alignment_failed",
            f"ICP did not converge to a usable fit (fitness {result.fitness:.2f} < {config.ICP_MIN_FITNESS}).",
        )

    aligned = o3d.geometry.PointCloud(recon).transform(t)
    out = paths.sub("comparison", "aligned.ply")
    if not o3d.io.write_point_cloud(str(out), aligned):
        raise PipelineError("alignment_failed", "Could not write aligned.ply.")
    return aligned, t, {
        "fitness": float(result.fitness),
        "inlierRmse": float(result.inlier_rmse),
        "correspondenceDistanceM": model_diag * 0.01,
        "scale": scale,
        "transformation": t.tolist(),
        "file": paths.url(out),
    }
