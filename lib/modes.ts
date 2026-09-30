import type { InspectionMode } from "./data";
import type { IconName } from "@/components/ui/Icon";

export const modeDetails: Record<InspectionMode, { title: string; icon: IconName; tagline: string; specs: { label: string; value: string }[]; bullets: string[] }> = {
  quick: {
    title: "Quick inspection",
    icon: "zap",
    tagline: "Fast go / no-go check for missing features and gross deviations.",
    specs: [
      { label: "Photos", value: "3–5" },
      { label: "Tolerance", value: "±2.0 mm" },
      { label: "Turnaround", value: "~90 s" },
    ],
    bullets: ["Missing / extra features", "Major position offsets", "Visual summary report"],
  },
  precision: {
    title: "Precision inspection",
    icon: "target",
    tagline: "Dense reconstruction with full surface deviation mapping.",
    specs: [
      { label: "Photos", value: "5+" },
      { label: "Tolerance", value: "±0.5 mm" },
      { label: "Turnaround", value: "~5 min" },
    ],
    bullets: ["Per-surface deviation heatmap", "Dimensional measurements", "Detailed audit-ready report"],
  },
};
