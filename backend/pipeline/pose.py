"""Stage 2 — Camera pose estimation with DUSt3R.

Produces, per photo: camera-to-world pose (OpenCV convention), intrinsics, a dense
point map and a confidence mask — all in DUSt3R's arbitrary-scale world frame.
"""
import sys
from dataclasses import dataclass

import numpy as np
from PIL import Image

from . import config
from .errors import PipelineError
from .paths import InspectionPaths

_model = None


@dataclass
class PoseResult:
    images: list[np.ndarray]       # HxWx3 float [0,1], the DUSt3R-cropped views
    intrinsics: list[np.ndarray]   # 3x3 per view, in pixels of the cropped view
    poses: list[np.ndarray]        # 4x4 camera-to-world (OpenCV: +z forward, +y down)
    pts3d: list[np.ndarray]        # HxWx3 per view, world frame
    masks: list[np.ndarray]        # HxW bool confidence masks

    @property
    def size(self) -> tuple[int, int]:
        h, w = self.images[0].shape[:2]
        return w, h


def _import_dust3r():
    if not config.DUST3R_DIR.is_dir():
        raise PipelineError("pose_estimation_failed", f"DUSt3R not found at {config.DUST3R_DIR}.")
    if str(config.DUST3R_DIR) not in sys.path:
        sys.path.insert(0, str(config.DUST3R_DIR))
    from dust3r.cloud_opt import GlobalAlignerMode, global_aligner
    from dust3r.image_pairs import make_pairs
    from dust3r.inference import inference
    from dust3r.model import AsymmetricCroCo3DStereo
    from dust3r.utils.image import load_images
    return AsymmetricCroCo3DStereo, load_images, make_pairs, inference, global_aligner, GlobalAlignerMode


def _run(device: str, photo_paths) -> PoseResult:
    import torch

    Model, load_images, make_pairs, inference, global_aligner, Mode = _import_dust3r()
    global _model
    if _model is None:
        if not config.DUST3R_CHECKPOINT.is_dir():
            raise PipelineError("pose_estimation_failed", f"DUSt3R checkpoint not found at {config.DUST3R_CHECKPOINT}.")
        _model = Model.from_pretrained(str(config.DUST3R_CHECKPOINT))
    model = _model.to(device).eval()

    imgs = load_images([str(p) for p in photo_paths], size=config.DUST3R_IMAGE_SIZE, verbose=False)
    pairs = make_pairs(imgs, scene_graph="complete", prefilter=None, symmetrize=True)
    with torch.no_grad():
        output = inference(pairs, model, device, batch_size=1, verbose=False)
    scene = global_aligner(output, device=device, mode=Mode.PointCloudOptimizer, verbose=False)
    scene.compute_global_alignment(init="mst", niter=config.DUST3R_NITER, schedule="cosine", lr=0.01)
    scene.min_conf_thr = float(config.DUST3R_CONF_THRESHOLD)

    def to_np(t):
        return t.detach().cpu().numpy()

    return PoseResult(
        images=[np.asarray(im) for im in scene.imgs],
        intrinsics=list(to_np(scene.get_intrinsics())),
        poses=list(to_np(scene.get_im_poses())),
        pts3d=[to_np(p) for p in scene.get_pts3d()],
        masks=[to_np(m).astype(bool) for m in scene.get_masks()],
    )


def estimate_poses(paths: InspectionPaths, photo_paths) -> tuple[PoseResult, dict]:
    import torch

    device = "cuda" if torch.cuda.is_available() else "cpu"
    try:
        try:
            result = _run(device, photo_paths)
        except torch.cuda.OutOfMemoryError:
            # 4 GB laptop GPUs can run out of memory; CPU is slower but works.
            torch.cuda.empty_cache()
            device = "cpu"
            result = _run(device, photo_paths)
    except PipelineError:
        raise
    except Exception as e:  # noqa: BLE001
        raise PipelineError("pose_estimation_failed", f"DUSt3R failed: {e}") from e

    valid = [float(m.mean()) for m in result.masks]
    if max(valid) == 0:
        raise PipelineError("pose_estimation_failed", "DUSt3R produced no confident pixels.")

    # Save the exact (cropped) views DUSt3R used, so renders line up pixel-for-pixel.
    for i, im in enumerate(result.images, start=1):
        Image.fromarray((np.clip(im, 0, 1) * 255).astype(np.uint8)).save(paths.sub("renders", f"view-{i}.png"))
    np.savez_compressed(
        paths.sub("reconstruction", "dust3r.npz"),
        intrinsics=np.stack(result.intrinsics),
        poses=np.stack(result.poses),
        pts3d=np.stack(result.pts3d),
        masks=np.stack(result.masks),
    )
    w, h = result.size
    return result, {
        "device": device,
        "viewSize": [w, h],
        "focalsPx": [float(k[0, 0]) for k in result.intrinsics],
        "confidentPixelFraction": valid,
    }
