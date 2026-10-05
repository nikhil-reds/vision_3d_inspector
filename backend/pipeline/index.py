"""Pipeline entry point.

    python -m pipeline.index <inspection_id>      (run from the backend/ directory)

Reads inputs from public/inspections/<id>/input/, writes every output under
public/inspections/<id>/ and keeps status.json updated after each stage.
"""
import json
import shutil
import sys
import time
import traceback
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from . import config
from .errors import PipelineError
from .paths import InspectionPaths
from .status import STAGES, write_json, write_status

OUTPUT_DIRS = ("renders", "reconstruction", "comparison", "report")


def _log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)


def _read_meta(paths: InspectionPaths) -> dict:
    meta = paths.root / "meta.json"
    return json.loads(meta.read_text(encoding="utf-8")) if meta.is_file() else {}


@contextmanager
def _stage_imports(code: str):
    """Heavy libraries are imported per stage, so a broken install fails *that* stage with
    a readable message instead of crashing before status.json is written."""
    try:
        yield
    except (ImportError, OSError) as e:
        text = str(e)
        if "Application Control" in text or "WinError 4551" in text:
            raise PipelineError(
                code,
                "Windows Smart App Control blocked a native library (PyTorch/Open3D) from loading. "
                "Turn off Smart App Control or run the pipeline in WSL. Details: " + text,
            ) from e
        raise PipelineError(code, f"A required Python library could not be loaded: {text}") from e


def run_inspection(inspection_id: str, glb_path: Path, photo_paths: list[Path], model_unit: str = "m") -> dict:
    """glb_path may point to a .glb, .obj or .stl reference model (OBJ/STL use model_unit)."""
    paths = InspectionPaths(inspection_id)
    for d in OUTPUT_DIRS:  # a retry starts from clean outputs
        shutil.rmtree(paths.root / d, ignore_errors=True)

    stage = 0
    timings: dict[str, float] = {}

    def begin(i: int) -> float:
        nonlocal stage
        stage = i
        write_status(paths.status, "processing", i)
        _log(f"Stage {i + 1}/{len(STAGES)}: {STAGES[i]}")
        return time.perf_counter()

    def end(t0: float) -> None:
        timings[STAGES[stage]] = round(time.perf_counter() - t0, 2)

    try:
        t0 = begin(0)
        from .validation import load_model_mesh, validate_inputs
        validation = validate_inputs(glb_path, photo_paths, model_unit)
        mesh = load_model_mesh(glb_path, model_unit)
        end(t0)

        t0 = begin(1)
        with _stage_imports("pose_estimation_failed"):
            from .pose import estimate_poses
        pose, pose_info = estimate_poses(paths, photo_paths)
        end(t0)

        t0 = begin(2)
        with _stage_imports("reconstruction_failed"):
            from .reconstruction import reconstruct
        recon, recon_info = reconstruct(paths, pose)
        end(t0)

        t0 = begin(3)
        with _stage_imports("glb_rendering_failed"):
            from .rendering import camera_in_model_frame, render_views, sample_model
        model_pcd = sample_model(mesh)
        coarse, coarse_cams, render_info = render_views(paths, mesh, model_pcd, recon, pose)
        end(t0)

        t0 = begin(4)
        with _stage_imports("alignment_failed"):
            from .alignment import align
        aligned, transform, alignment = align(paths, recon, model_pcd, coarse)
        cams = [camera_in_model_frame(p, transform) for p in pose.poses]
        end(t0)

        t0 = begin(5)
        with _stage_imports("deviation_calculation_failed"):
            from .deviation import compute_deviation, verdict
        d_m, dev = compute_deviation(aligned, mesh, cams, pose.intrinsics, pose.size)
        status = verdict(dev["metrics"])
        end(t0)

        t0 = begin(6)
        with _stage_imports("visualization_failed"):
            from .visualization import visualize
        vis = visualize(paths, mesh, aligned, d_m, pose, cams, dev["metrics"])
        end(t0)

        meta = _read_meta(paths)
        result = {
            "inspectionId": inspection_id,
            "projectName": meta.get("projectName"),
            "createdAt": meta.get("createdAt"),
            "completedAt": datetime.now(timezone.utc).isoformat(),
            "status": status,
            "verdictMetric": config.VERDICT_METRIC,
            "metrics": dev["metrics"],
            "alignment": {k: alignment[k] for k in ("fitness", "inlierRmse", "scale", "transformation")},
            "thresholds": {
                "passMm": config.PASS_THRESHOLD_MM,
                "failMm": config.FAIL_THRESHOLD_MM,
                "toleranceMm": config.TOLERANCE_MM,
                "note": "Testing thresholds",
            },
            "deviationRegions": dev["regions"],
            "shape": dev["shape"],
            "stages": {
                "validation": validation,
                "pose": pose_info,
                "reconstruction": recon_info,
                "rendering": {k: v for k, v in render_info.items() if k != "renders"},
            },
            "timingsSec": timings,
            "files": {
                "photos": [paths.url(p) for p in photo_paths],
                "views": [paths.url(paths.root / "renders" / f"view-{i}.png") for i in range(1, len(photo_paths) + 1)],
                "renders": render_info["renders"],
                "overlays": vis["overlays"],
                "heatmaps": vis["heatmaps"],
                "heatmap": vis["heatmap"],
                "shapeDifference": vis["shapeDifference"],
                "histogram": vis["histogram"],
                "reconstruction": recon_info["file"],
                "aligned": alignment["file"],
                "model": paths.url(glb_path),
            },
        }
        write_json(paths.sub("report", "result.json"), result)
        _log(f"Geometry done: {status}, mean {dev['metrics']['meanDeviationMm']} mm")

        # Stage 8 — a Gemini failure must not fail the geometric inspection.
        t0 = begin(7)
        try:
            with _stage_imports("gemini_failed"):
                from .gemini import generate_report
            gemini = generate_report(result)
        except PipelineError as e:
            _log(f"Gemini unavailable: {e.message}")
            gemini = {"available": False, "error": e.message}
        end(t0)
        write_json(paths.sub("report", "gemini-report.json"), gemini)

        result["timingsSec"] = timings
        write_json(paths.sub("report", "result.json"), result)
        write_status(paths.status, "completed", len(STAGES))
        _log("Completed")
        return result

    except PipelineError as e:
        _log(f"FAILED at {STAGES[stage]}: [{e.code}] {e.message}")
        write_status(paths.status, "failed", stage, {"code": e.code, "message": e.message})
        raise
    except Exception as e:  # noqa: BLE001 — never leave status.json stuck on "processing"
        traceback.print_exc()
        write_status(paths.status, "failed", stage, {"code": "internal_error", "message": f"Unexpected error: {e}"})
        raise


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: python -m pipeline.index <inspection_id>", file=sys.stderr)
        return 2
    paths = InspectionPaths(argv[1])
    if not paths.root.is_dir():
        print(f"inspection folder not found: {paths.root}", file=sys.stderr)
        return 2
    try:
        unit = _read_meta(paths).get("modelUnit", "m")
        run_inspection(argv[1], paths.model, paths.photos, unit)
        return 0
    except Exception:  # noqa: BLE001 — already recorded in status.json
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
