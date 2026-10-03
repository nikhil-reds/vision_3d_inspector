"""Stage 3 — Multi-view reconstruction: fuse DUSt3R point maps into a cleaned point cloud."""
import numpy as np
import open3d as o3d

from . import config
from .errors import PipelineError
from .paths import InspectionPaths
from .pose import PoseResult


def _largest_cluster(pcd: o3d.geometry.PointCloud, eps: float) -> o3d.geometry.PointCloud:
    labels = np.asarray(pcd.cluster_dbscan(eps=eps, min_points=10))
    if labels.size == 0 or labels.max() < 0:
        return pcd
    biggest = np.bincount(labels[labels >= 0]).argmax()
    return pcd.select_by_index(np.flatnonzero(labels == biggest))


def reconstruct(paths: InspectionPaths, pose: PoseResult) -> tuple[o3d.geometry.PointCloud, dict]:
    try:
        pts = np.concatenate([p[m] for p, m in zip(pose.pts3d, pose.masks)])
        cols = np.concatenate([im[m] for im, m in zip(pose.images, pose.masks)])
    except ValueError as e:
        raise PipelineError("reconstruction_failed", f"Could not fuse point maps: {e}") from e

    pcd = o3d.geometry.PointCloud(o3d.utility.Vector3dVector(pts.astype(np.float64)))
    pcd.colors = o3d.utility.Vector3dVector(np.clip(cols, 0, 1).astype(np.float64))
    if pcd.is_empty():
        raise PipelineError("reconstruction_failed", "DUSt3R produced an empty point cloud.")
    raw_count = len(pcd.points)

    # Pass 1 (coarse, whole scene): find the object. Voxel size is relative to the cloud's
    # own extent because DUSt3R's scale is arbitrary.
    full = pcd
    diag = float(np.linalg.norm(full.get_max_bound() - full.get_min_bound()))
    voxel = diag / 200
    coarse = full.voxel_down_sample(voxel)
    coarse, _ = coarse.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)

    plane = None
    if config.REMOVE_SUPPORT_PLANE and len(coarse.points) > config.MIN_POINTS:
        model, inliers = coarse.segment_plane(distance_threshold=voxel * 1.5, ransac_n=3, num_iterations=1000)
        if len(inliers) >= config.SUPPORT_PLANE_MIN_FRACTION * len(coarse.points):
            rest = coarse.select_by_index(inliers, invert=True)
            if len(rest.points) >= config.MIN_POINTS:
                coarse, plane = rest, (np.asarray(model[:3]), float(model[3]), voxel * 1.5)
    coarse = _largest_cluster(coarse, eps=voxel * 4)
    if coarse.is_empty():
        raise PipelineError("reconstruction_failed", "Could not isolate the object in the point cloud.")

    # Pass 2 (fine, object only): re-sample the full-resolution points inside the object's
    # bounding box so the part keeps detail instead of the scene-sized voxel grid.
    box = coarse.get_axis_aligned_bounding_box()
    box = box.scale(1.05, box.get_center())
    pcd = full.crop(box)
    if plane is not None:
        normal, offset, margin = plane
        dist = np.abs(np.asarray(pcd.points) @ normal + offset)
        pcd = pcd.select_by_index(np.flatnonzero(dist > margin))
    obj_voxel = float(np.linalg.norm(box.get_extent())) / 300
    pcd = pcd.voxel_down_sample(obj_voxel)
    pcd, _ = pcd.remove_statistical_outlier(nb_neighbors=20, std_ratio=2.0)
    pcd = _largest_cluster(pcd, eps=obj_voxel * 4)
    plane_removed = plane is not None

    if pcd.is_empty():
        raise PipelineError("reconstruction_failed", "Point cloud is empty after cleaning.")
    if len(pcd.points) < config.MIN_POINTS:
        raise PipelineError(
            "insufficient_points",
            f"Only {len(pcd.points)} points after cleaning (need {config.MIN_POINTS}). "
            "Take photos with more overlap and surface texture.",
        )

    out = paths.sub("reconstruction", "reconstructed.ply")
    if not o3d.io.write_point_cloud(str(out), pcd):
        raise PipelineError("reconstruction_failed", "Could not write reconstructed.ply.")
    return pcd, {
        "rawPoints": raw_count,
        "points": len(pcd.points),
        "supportPlaneRemoved": plane_removed,
        "file": paths.url(out),
    }
