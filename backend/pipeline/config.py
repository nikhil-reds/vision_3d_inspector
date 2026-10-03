"""Single source of configuration for the inspection pipeline.

All geometry is computed in meters (glTF/GLB native unit) and reported in millimeters.
"""
from pathlib import Path

# --- Paths -------------------------------------------------------------------
BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = BACKEND_DIR.parent
INSPECTIONS_DIR = REPO_DIR / "public" / "inspections"
PUBLIC_URL_PREFIX = "/inspections"
DUST3R_DIR = BACKEND_DIR / "third_party" / "dust3r"
DUST3R_CHECKPOINT = BACKEND_DIR / "checkpoints" / "DUSt3R_ViTLarge_BaseDecoder_512_dpt"

# --- Verdict thresholds (TESTING THRESHOLDS — not validated for production QA) --
PASS_THRESHOLD_MM = 2.0   # verdict metric below this -> PASS
FAIL_THRESHOLD_MM = 5.0   # verdict metric above this -> FAIL; in between -> REVIEW
TOLERANCE_MM = PASS_THRESHOLD_MM  # a point deviating more than this is "outside tolerance"
VERDICT_METRIC = "meanDeviationMm"  # which metric the verdict is based on

# --- Input validation ----------------------------------------------------------
PHOTO_COUNT = 4
MAX_MODEL_BYTES = 100 * 1024 * 1024
MODEL_FORMATS = ("glb", "obj")
# GLB is meters by spec; OBJ is unitless, so the uploader states its unit.
UNIT_TO_METERS = {"mm": 0.001, "cm": 0.01, "m": 1.0}
MAX_IMAGE_BYTES = 20 * 1024 * 1024
MIN_IMAGE_SIDE_PX = 256
MAX_IMAGE_SIDE_PX = 8192

# --- DUSt3R ----------------------------------------------------------------------
DUST3R_IMAGE_SIZE = 512
DUST3R_NITER = 300
DUST3R_CONF_THRESHOLD = 3.0  # per-pixel confidence below this is discarded

# --- Reconstruction --------------------------------------------------------------
MIN_POINTS = 2000              # minimum points left after cleaning
REMOVE_SUPPORT_PLANE = True    # drop the dominant plane (table/floor) if one is found
SUPPORT_PLANE_MIN_FRACTION = 0.25

# --- Alignment ---------------------------------------------------------------------
MODEL_SAMPLE_POINTS = 60000
RANSAC_SCALE_CANDIDATES = (0.7, 0.85, 1.0, 1.15, 1.3)
ICP_MIN_FITNESS = 0.3          # below this, alignment is treated as failed
ICP_MAX_ITER = 100

# --- Rendering / visualization -------------------------------------------------------
HEATMAP_MAX_MM = FAIL_THRESHOLD_MM * 1.5  # colour scale saturates here
