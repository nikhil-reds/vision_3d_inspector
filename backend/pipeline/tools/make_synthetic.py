"""Create a synthetic test case: a reference GLB plus 4 rendered "photos" of the part.

    python -m pipeline.tools.make_synthetic <out_dir> [--defect] [--video]

Without --defect the photos show exactly the reference part, so the pipeline should
report a small deviation (PASS). With --defect, the boss on the photographed part is
moved 8 mm, which should show up as a local deviation region.
"""
import argparse
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

from ..rendering import CV_TO_GL


def make_part(defect: bool) -> trimesh.Trimesh:
    """An asymmetric bracket-like part (meters): base plate, upright, gusset-ish block and a boss."""
    base = trimesh.creation.box((0.24, 0.02, 0.16))
    upright = trimesh.creation.box((0.02, 0.14, 0.16))
    upright.apply_translation((-0.11, 0.08, 0))
    block = trimesh.creation.box((0.06, 0.05, 0.04))
    block.apply_translation((-0.07, 0.035, 0.05))
    boss = trimesh.creation.cylinder(radius=0.022, height=0.04, sections=48)
    boss.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, (1, 0, 0)))
    boss.apply_translation((0.06 + (0.008 if defect else 0.0), 0.03, -0.03))
    return trimesh.util.concatenate([base, upright, block, boss])


def _textured(mesh: trimesh.Trimesh, seed: int = 0, levels: int = 3) -> trimesh.Trimesh:
    """Subdivide and give every face a random colour so DUSt3R has texture to match."""
    m = mesh.copy()
    for _ in range(levels):
        m = m.subdivide()
    rng = np.random.default_rng(seed)
    colors = rng.integers(60, 230, size=(len(m.faces), 4), dtype=np.uint8)
    colors[:, 3] = 255
    m.visual.face_colors = colors
    return m


def _look_at(eye: np.ndarray, target: np.ndarray) -> np.ndarray:
    """OpenCV camera-to-world pose looking from eye to target (+y down)."""
    z = target - eye
    z /= np.linalg.norm(z)
    x = np.cross(np.array([0.0, -1.0, 0.0]), z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    pose = np.eye(4)
    pose[:3, 0], pose[:3, 1], pose[:3, 2], pose[:3, 3] = x, y, z, eye
    return pose


def render_views(mesh: trimesh.Trimesh, azimuths, size=(1024, 768)):
    """Yield RGB renders of the part from cameras orbiting it at the given azimuths (degrees)."""
    import pyrender

    w, h = size
    scene = pyrender.Scene(bg_color=[0.55, 0.55, 0.58, 1.0], ambient_light=[0.45, 0.45, 0.45])
    scene.add(pyrender.Mesh.from_trimesh(_textured(mesh), smooth=False))
    # A speckled floor gives DUSt3R extra context (and exercises support-plane removal).
    floor = trimesh.creation.box((0.8, 0.002, 0.8))
    floor.apply_translation((0, -0.012, 0))
    scene.add(pyrender.Mesh.from_trimesh(_textured(floor, seed=7, levels=6), smooth=False))

    k = np.array([[0.9 * w, 0, w / 2], [0, 0.9 * w, h / 2], [0, 0, 1]])
    cam = pyrender.IntrinsicsCamera(k[0, 0], k[1, 1], k[0, 2], k[1, 2], znear=0.01, zfar=10)
    renderer = pyrender.OffscreenRenderer(w, h)
    target = np.array([0.0, 0.04, 0.0])
    try:
        for azimuth in azimuths:
            a = np.radians(azimuth)
            eye = target + np.array([np.cos(a) * 0.42, 0.26, np.sin(a) * 0.42])
            pose_gl = _look_at(eye, target) @ CV_TO_GL
            cam_node = scene.add(cam, pose=pose_gl)
            light = scene.add(pyrender.DirectionalLight(intensity=2.5), pose=pose_gl)
            color, _ = renderer.render(scene)
            scene.remove_node(cam_node)
            scene.remove_node(light)
            yield color
    finally:
        renderer.delete()


def write_video(mesh: trimesh.Trimesh, out: Path, seconds: int = 12, fps: int = 15) -> None:
    """A full 360° walk-around clip (VP8 WebM, which browsers can decode)."""
    import cv2

    n = seconds * fps
    writer = cv2.VideoWriter(str(out), cv2.VideoWriter_fourcc(*"VP80"), fps, (1024, 768))
    if not writer.isOpened():
        raise SystemExit("OpenCV could not open a VP8 video writer.")
    for color in render_views(mesh, np.linspace(0, 360, n, endpoint=False)):
        writer.write(cv2.cvtColor(color, cv2.COLOR_RGB2BGR))
    writer.release()


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--defect", action="store_true", help="photograph a part whose boss is moved 8 mm")
    ap.add_argument("--video", action="store_true", help="also write a 360° walk-around video (walkaround.webm)")
    args = ap.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    make_part(defect=False).export(args.out_dir / "model.glb")
    part = make_part(defect=args.defect)
    for i, color in enumerate(render_views(part, (20, 70, 120, 170)), start=1):
        Image.fromarray(color).save(args.out_dir / f"photo-{i}.jpg", quality=92)
    print(f"wrote model.glb and photo-1..4.jpg to {args.out_dir}")
    if args.video:
        write_video(part, args.out_dir / "walkaround.webm")
        print(f"wrote walkaround.webm to {args.out_dir}")


if __name__ == "__main__":
    main()
