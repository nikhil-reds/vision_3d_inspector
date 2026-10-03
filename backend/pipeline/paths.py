from dataclasses import dataclass
from pathlib import Path

from .config import INSPECTIONS_DIR, MODEL_FORMATS, PHOTO_COUNT, PUBLIC_URL_PREFIX


@dataclass(frozen=True)
class InspectionPaths:
    inspection_id: str

    @property
    def root(self) -> Path:
        return INSPECTIONS_DIR / self.inspection_id

    def sub(self, *parts: str) -> Path:
        p = self.root.joinpath(*parts)
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    def url(self, path: Path) -> str:
        rel = path.relative_to(self.root).as_posix()
        return f"{PUBLIC_URL_PREFIX}/{self.inspection_id}/{rel}"

    @property
    def model(self) -> Path:
        """input/model.glb or input/model.obj, whichever was uploaded."""
        for ext in MODEL_FORMATS:
            p = self.root / "input" / f"model.{ext}"
            if p.is_file():
                return p
        return self.root / "input" / "model.glb"

    @property
    def photos(self) -> list[Path]:
        return [self.root / "input" / f"photo-{i}.jpg" for i in range(1, PHOTO_COUNT + 1)]

    @property
    def status(self) -> Path:
        return self.root / "status.json"
