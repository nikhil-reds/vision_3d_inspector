class PipelineError(Exception):
    """A pipeline failure with a stable machine-readable code."""

    CODES = {
        "invalid_glb",
        "invalid_image",
        "pose_estimation_failed",
        "reconstruction_failed",
        "insufficient_points",
        "glb_rendering_failed",
        "alignment_failed",
        "deviation_calculation_failed",
        "visualization_failed",
        "gemini_failed",
    }

    def __init__(self, code: str, message: str):
        assert code in self.CODES, code
        super().__init__(message)
        self.code = code
        self.message = message
