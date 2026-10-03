"""Stage 8 — Gemini report. Gemini only *explains* results the geometric pipeline already
computed; it never produces or changes measurements or the verdict."""
import json
import os

from . import config
from .errors import PipelineError

REPORT_KEYS = ("summary", "keyFindings", "affectedAreas", "possibleCauses", "recommendations", "limitations")

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING"},
        **{k: {"type": "ARRAY", "items": {"type": "STRING"}} for k in REPORT_KEYS[1:]},
    },
    "required": list(REPORT_KEYS),
}

PROMPT = """You are writing the explanation section of an automated 3D fabrication inspection report.

A deterministic geometry pipeline compared a reference design (GLB) with a 3D reconstruction built
from 4 photos of the fabricated part (DUSt3R reconstruction, Open3D ICP alignment). The numbers and
the verdict below are FINAL and AUTHORITATIVE.

Rules:
- Do NOT compute, estimate, round differently, or change any number. Quote values exactly as given, in mm.
- Do NOT change or second-guess the verdict ({status}). State it as the pipeline's classification.
- Only describe locations that appear in deviationRegions.
- possibleCauses are hypotheses (fabrication error, reconstruction noise, photo coverage, alignment) — say so.
- limitations must mention that the reconstruction scale was estimated by aligning to the GLB, so
  millimetre values are relative to the design size, not independently measured.
- The thresholds are testing thresholds.
- Plain, concise English for a QA engineer. Each list item one sentence.

Pipeline results (JSON):
{results}
"""


def _load_env_file() -> None:
    """When run from the CLI (not spawned by Next.js), pick up keys from the repo's .env."""
    env = config.REPO_DIR / ".env"
    if not env.is_file():
        return
    for line in env.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def build_gemini_input(result: dict) -> dict:
    m = result["metrics"]
    return {
        "status": result["status"],
        "verdictMetric": config.VERDICT_METRIC,
        "meanDeviationMm": m["meanDeviationMm"],
        "medianDeviationMm": m["medianDeviationMm"],
        "p95DeviationMm": m["p95DeviationMm"],
        "maxDeviationMm": m["maxDeviationMm"],
        "rmseMm": m["rmseMm"],
        "chamferDistanceMm": m["chamferDistanceMm"],
        "hausdorffDistanceMm": m["hausdorffDistanceMm"],
        "outsideTolerancePercentage": m["outsideTolerancePercentage"],
        "visibleModelCoveragePercentage": m["visibleModelCoverage"],
        "alignmentFitness": result["alignment"]["fitness"],
        "alignmentInlierRmseMm": round(result["alignment"]["inlierRmse"] * 1000, 3),
        "thresholds": result["thresholds"],
        "deviationRegions": result["deviationRegions"],
    }


def generate_report(result: dict) -> dict:
    """Returns the Gemini report. Raises PipelineError('gemini_failed') on any failure."""
    _load_env_file()
    api_key = os.environ.get("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_MODEL") or "gemini-3.8-flash"
    if not api_key:
        raise PipelineError("gemini_failed", "GEMINI_API_KEY is not set.")
    payload = build_gemini_input(result)
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=90_000))
        resp = client.models.generate_content(
            model=model,
            contents=PROMPT.format(status=payload["status"], results=json.dumps(payload, indent=2)),
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
                response_schema=RESPONSE_SCHEMA,
            ),
        )
        data = json.loads(resp.text)
    except Exception as e:  # noqa: BLE001
        raise PipelineError("gemini_failed", f"Gemini request failed: {e}") from e

    if not isinstance(data, dict) or not all(k in data for k in REPORT_KEYS):
        raise PipelineError("gemini_failed", "Gemini returned an incomplete report.")
    report = {"summary": str(data["summary"])}
    for k in REPORT_KEYS[1:]:
        report[k] = [str(x) for x in data[k]] if isinstance(data[k], list) else []
    return {"available": True, "model": model, "input": payload, **report}
