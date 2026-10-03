import json
import os
from datetime import datetime, timezone
from pathlib import Path

STAGES = [
    "Input Validation",
    "Camera Pose Estimation",
    "3D Reconstruction",
    "GLB Rendering",
    "Geometry Alignment",
    "Deviation Calculation",
    "Deviation Visualization",
    "Gemini Analysis",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def write_json(path: Path, data: dict) -> None:
    """Write atomically so readers never see a half-written file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
    os.replace(tmp, path)


def write_status(path: Path, status: str, stage_index: int, error: dict | None = None) -> None:
    """stage_index = number of stages fully completed (0..len(STAGES))."""
    done = status == "completed"
    data = {
        "status": status,
        "progress": 100 if done else round(stage_index / len(STAGES) * 100),
        "currentStage": "Completed" if done else STAGES[min(stage_index, len(STAGES) - 1)],
        "stageIndex": len(STAGES) if done else stage_index,
        "stages": STAGES,
        "updatedAt": _now(),
    }
    if error:
        data["error"] = error["message"]
        data["errorCode"] = error["code"]
    write_json(path, data)
