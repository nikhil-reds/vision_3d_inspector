"""Stage 7 — Deviation visualization: per-view heatmaps, photo/GLB overlays and a summary figure."""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import open3d as o3d  # noqa: E402
import trimesh  # noqa: E402
from matplotlib.colors import Normalize  # noqa: E402
from PIL import Image  # noqa: E402

from . import config  # noqa: E402
from .errors import PipelineError  # noqa: E402
from .paths import InspectionPaths  # noqa: E402
from .pose import PoseResult  # noqa: E402
from .rendering import MeshRenderer  # noqa: E402

CMAP = plt.get_cmap("turbo")


def _splat(base: np.ndarray, render_depth: np.ndarray, pts: np.ndarray, d_mm: np.ndarray, k, cam, radius: int = 1) -> np.ndarray:
    """Project coloured points onto `base`, hiding points behind the GLB surface."""
    h, w = base.shape[:2]
    local = (pts - cam[:3, 3]) @ cam[:3, :3]
    z = local[:, 2]
    ok = z > 0
    u = np.round(k[0, 0] * local[ok, 0] / z[ok] + k[0, 2]).astype(int)
    v = np.round(k[1, 1] * local[ok, 1] / z[ok] + k[1, 2]).astype(int)
    z, dd = z[ok], d_mm[ok]
    inside = (u >= 0) & (u < w) & (v >= 0) & (v < h)
    u, v, z, dd = u[inside], v[inside], z[inside], dd[inside]
    surf = render_depth[v, u]
    front = (surf == 0) | (z <= surf + max(float(np.median(z)) * 0.02, 1e-4))
    u, v, z, dd = u[front], v[front], z[front], dd[front]
    order = np.argsort(-z)  # far first, near overwrites
    colors = (CMAP(Normalize(0, config.HEATMAP_MAX_MM)(dd[order]))[:, :3] * 255).astype(np.uint8)
    out = base.copy()
    for du in range(-radius, radius + 1):
        for dv in range(-radius, radius + 1):
            uu = np.clip(u[order] + du, 0, w - 1)
            vv = np.clip(v[order] + dv, 0, h - 1)
            out[vv, uu] = colors
    return out


def visualize(
    paths: InspectionPaths, mesh: trimesh.Trimesh, aligned: o3d.geometry.PointCloud, d_m: np.ndarray,
    pose: PoseResult, cams: list[np.ndarray], metrics: dict,
) -> dict:
    try:
        pts = np.asarray(aligned.points)
        d_mm = d_m * 1000.0
        w, h = pose.size
        heatmaps, overlays, panels = [], [], []
        renderer = MeshRenderer(mesh, w, h)
        try:
            for i, (k, cam, photo) in enumerate(zip(pose.intrinsics, cams, pose.images), start=1):
                color, depth = renderer.render(k, cam)
                rgb = color[..., :3].astype(np.float32)
                alpha = color[..., 3:4].astype(np.float32) / 255
                photo_u8 = (np.clip(photo, 0, 1) * 255).astype(np.float32)

                # Overlay: photo with the GLB (refined pose) blended on top.
                overlay = (photo_u8 * (1 - 0.55 * alpha) + rgb * 0.55 * alpha).astype(np.uint8)
                out = paths.sub("comparison", f"overlay-{i}.png")
                Image.fromarray(overlay).save(out)
                overlays.append(paths.url(out))

                # Heatmap: dimmed photo + GLB silhouette + deviation-coloured points.
                base = (photo_u8 * 0.35 * (1 - alpha) + rgb * 0.6 * alpha).astype(np.uint8)
                heat = _splat(base, depth, pts, d_mm, k, cam)
                out = paths.sub("comparison", f"heatmap-{i}.png")
                Image.fromarray(heat).save(out)
                heatmaps.append(paths.url(out))
                panels.append(heat)
        finally:
            renderer.close()

        fig, axes = plt.subplots(2, 2, figsize=(11, 11 * h / w * 0.95 + 0.6), facecolor="#0b0f14")
        for i, (ax, img) in enumerate(zip(axes.flat, panels), start=1):
            ax.imshow(img)
            ax.set_title(f"View {i}", color="white", fontsize=10)
            ax.axis("off")
        sm = plt.cm.ScalarMappable(cmap=CMAP, norm=Normalize(0, config.HEATMAP_MAX_MM))
        cbar = fig.colorbar(sm, ax=axes, orientation="horizontal", fraction=0.04, pad=0.03)
        cbar.set_label("Deviation from GLB (mm)", color="white")
        cbar.ax.tick_params(colors="white")
        for t in (config.PASS_THRESHOLD_MM, config.FAIL_THRESHOLD_MM):
            cbar.ax.axvline(t, color="white", linestyle="--", linewidth=1)
        fig.suptitle(
            f"Mean {metrics['meanDeviationMm']:.2f} mm · Max {metrics['maxDeviationMm']:.2f} mm · "
            f"{metrics['outsideTolerancePercentage']:.1f}% outside ±{config.TOLERANCE_MM:g} mm",
            color="white",
        )
        out = paths.sub("comparison", "deviation-heatmap.png")
        fig.savefig(out, dpi=110, facecolor=fig.get_facecolor())
        plt.close(fig)

        hist_out = paths.sub("comparison", "deviation-histogram.png")
        fig, ax = plt.subplots(figsize=(6, 3), facecolor="white")
        ax.hist(np.clip(d_mm, 0, config.HEATMAP_MAX_MM * 2), bins=60, color="#1cc3e0")
        for t in (config.PASS_THRESHOLD_MM, config.FAIL_THRESHOLD_MM):
            ax.axvline(t, color="#e11d48", linestyle="--", linewidth=1)
        ax.set_xlabel("Deviation (mm)")
        ax.set_ylabel("Points")
        fig.tight_layout()
        fig.savefig(hist_out, dpi=110)
        plt.close(fig)

        return {"heatmap": paths.url(out), "histogram": paths.url(hist_out), "heatmaps": heatmaps, "overlays": overlays}
    except Exception as e:  # noqa: BLE001
        raise PipelineError("visualization_failed", f"Visualization failed: {e}") from e
