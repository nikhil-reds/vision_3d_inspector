"""Stage 1 — Input validation (GLB, OBJ or STL reference model + 4–40 photos or video frames)."""
from pathlib import Path

import trimesh
from PIL import Image, ImageOps

from . import config
from .errors import PipelineError


def load_model_mesh(model_path: Path, unit: str = "m") -> trimesh.Trimesh:
    """Load a GLB, OBJ or STL as a single triangle mesh in meters (scene transforms applied)."""
    fmt = model_path.suffix.lower().lstrip(".")
    try:
        mesh = trimesh.load(str(model_path), file_type=fmt, force="mesh", process=True)
    except Exception as e:  # noqa: BLE001 — any parser failure means an unusable file
        raise PipelineError("invalid_glb", f"{fmt.upper()} could not be parsed: {e}") from e
    if not isinstance(mesh, trimesh.Trimesh) or len(mesh.faces) == 0:
        raise PipelineError("invalid_glb", f"{fmt.upper()} contains no triangle geometry.")
    if fmt in config.UNITLESS_FORMATS:
        mesh.apply_scale(config.UNIT_TO_METERS[unit])
    return mesh


def validate_inputs(model_path: Path, photo_paths: list[Path], unit: str = "m") -> dict:
    fmt = model_path.suffix.lower().lstrip(".")
    if fmt not in config.MODEL_FORMATS:
        raise PipelineError("invalid_glb", f"Unsupported model format .{fmt} (use .glb, .obj or .stl).")
    if fmt in config.UNITLESS_FORMATS and unit not in config.UNIT_TO_METERS:
        raise PipelineError("invalid_glb", f"Unknown {fmt.upper()} unit {unit!r}.")
    if not model_path.is_file():
        raise PipelineError("invalid_glb", "3D model file is missing.")
    size = model_path.stat().st_size
    if size == 0 or size > config.MAX_MODEL_BYTES:
        raise PipelineError("invalid_glb", f"Model size {size} bytes is outside the allowed range.")
    if fmt == "glb":
        with model_path.open("rb") as f:
            if f.read(4) != b"glTF":
                raise PipelineError("invalid_glb", "File is not a binary glTF (.glb).")
    mesh = load_model_mesh(model_path, unit)
    extents = mesh.bounding_box.extents
    if not (extents > 0).all():
        raise PipelineError("invalid_glb", "Model geometry is degenerate (zero size along an axis).")

    if not config.MIN_PHOTOS <= len(photo_paths) <= config.MAX_PHOTOS:
        raise PipelineError(
            "invalid_image", f"Expected {config.MIN_PHOTOS}–{config.MAX_PHOTOS} photos, got {len(photo_paths)}."
        )
    images = []
    for i, p in enumerate(photo_paths, start=1):
        if not p.is_file():
            raise PipelineError("invalid_image", f"Photo {i} is missing.")
        if p.stat().st_size > config.MAX_IMAGE_BYTES:
            raise PipelineError("invalid_image", f"Photo {i} is larger than {config.MAX_IMAGE_BYTES // 2**20} MB.")
        try:
            with Image.open(p) as im:
                im = ImageOps.exif_transpose(im)
                im.load()
                w, h = im.size
        except Exception as e:  # noqa: BLE001
            raise PipelineError("invalid_image", f"Photo {i} could not be decoded: {e}") from e
        if min(w, h) < config.MIN_IMAGE_SIDE_PX or max(w, h) > config.MAX_IMAGE_SIDE_PX:
            raise PipelineError("invalid_image", f"Photo {i} has unsupported dimensions {w}x{h}.")
        images.append({"path": str(p), "width": w, "height": h})

    return {
        "valid": True,
        "model": {
            "path": str(model_path),
            "format": fmt,
            "unit": unit if fmt in config.UNITLESS_FORMATS else "m",
            "vertices": int(len(mesh.vertices)),
            "faces": int(len(mesh.faces)),
            "extentsM": [float(x) for x in extents],
        },
        "images": images,
    }
