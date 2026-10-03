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


def _shape_difference(paths: InspectionPaths, mesh: trimesh.Trimesh, pts: np.ndarray, d_mm: np.ndarray) -> str:
    """Design outline (grey) vs built object (coloured by deviation) in front, side and top projections."""
    design, _ = trimesh.sample.sample_surface_even(mesh, 40000, seed=2)
    centre = mesh.bounds.mean(axis=0)  # CAD exports are often far from the origin
    design, pts = (design - centre) * 1000.0, (pts - centre) * 1000.0
    order = np.argsort(d_mm)  # largest deviations drawn last, on top
    pts, d_sorted = pts[order], d_mm[order]
    views = [
        ("Front", 0, 1, "X from centre (mm)", "Y from centre (mm)"),
        ("Side", 2, 1, "Z from centre (mm)", "Y from centre (mm)"),
        ("Top", 0, 2, "X from centre (mm)", "Z from centre (mm)"),
    ]
    fig, axes = plt.subplots(1, 3, figsize=(16, 5.6), facecolor="#0b0f14")
    norm = Normalize(0, config.HEATMAP_MAX_MM)
    for ax, (title, a, b, xl, yl) in zip(axes, views):
        ax.set_facecolor("#0b0f14")
        ax.scatter(design[:, a], design[:, b], s=0.6, c="#9aa4b2", alpha=0.35, linewidths=0, label="Design (3D model)")
        ax.scatter(pts[:, a], pts[:, b], s=1.2, c=CMAP(norm(d_sorted)), linewidths=0, label="Built object")
        ax.set_aspect("equal")
        ax.set_title(title, color="white", fontsize=11)
        ax.set_xlabel(xl, color="#9aa4b2", fontsize=8)
        ax.set_ylabel(yl, color="#9aa4b2", fontsize=8)
        ax.tick_params(colors="#9aa4b2", labelsize=7)
        if b == 2:
            ax.invert_yaxis()  # top view: front (+Z) at the bottom
        for s in ax.spines.values():
            s.set_color("#2a3340")
    legend = axes[0].legend(loc="upper left", fontsize=8, markerscale=8, facecolor="#141a22", edgecolor="#2a3340")
    for t in legend.get_texts():
        t.set_color("white")
    sm = plt.cm.ScalarMappable(cmap=CMAP, norm=norm)
    cbar = fig.colorbar(sm, ax=axes, orientation="horizontal", fraction=0.05, pad=0.14)
    cbar.set_label("Built object's distance from the design (mm)", color="white")
    cbar.ax.tick_params(colors="white")
    for t in (config.PASS_THRESHOLD_MM, config.FAIL_THRESHOLD_MM):
        cbar.ax.axvline(t, color="white", linestyle="--", linewidth=1)
    out = paths.sub("comparison", "shape-difference.png")
    fig.savefig(out, dpi=110, facecolor=fig.get_facecolor(), bbox_inches="tight")
    plt.close(fig)
    return paths.url(out)


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

        cols = 2 if len(panels) <= 4 else 4 if len(panels) <= 16 else 5
        rows = -(-len(panels) // cols)
        fig, axes = plt.subplots(
            rows, cols, figsize=(5.5 * cols, 5.5 * rows * h / w * 0.95 + 0.6), facecolor="#0b0f14", squeeze=False
        )
        for ax in axes.flat:
            ax.axis("off")
        for i, (ax, img) in enumerate(zip(axes.flat, panels), start=1):
            ax.imshow(img)
            ax.set_title(f"View {i}", color="white", fontsize=10)
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

        return {
            "heatmap": paths.url(out),
            "histogram": paths.url(hist_out),
            "heatmaps": heatmaps,
            "overlays": overlays,
            "shapeDifference": _shape_difference(paths, mesh, pts, d_mm),
        }
    except Exception as e:  # noqa: BLE001
        raise PipelineError("visualization_failed", f"Visualization failed: {e}") from e
