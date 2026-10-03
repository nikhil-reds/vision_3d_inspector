import type { InspectionResult } from "./types";

export interface DifferencePoint {
  title: string;
  detail: string;
  severity: "ok" | "warn" | "bad";
}

const mm = (v: number) => `${v.toFixed(1)} mm`;
const signedMm = (v: number) => `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(0)} mm`;
const pct = (v: number) => `${v.toFixed(1)}%`;

/** Plain-language differences between the build and the design, derived only from measured values. */
export function explainDifferences(r: InspectionResult, count = 10): DifferencePoint[] {
  const m = r.metrics;
  const { passMm, failMm, toleranceMm } = r.thresholds;
  const level = (v: number): DifferencePoint["severity"] => (v < passMm ? "ok" : v > failMm ? "bad" : "warn");
  const partial = m.visibleModelCoverage < 60;
  const points: DifferencePoint[] = [];

  points.push({
    title: `Overall: ${r.status}`,
    detail: `On average the built surface sits ${mm(m.meanDeviationMm)} away from the design (PASS below ${passMm} mm, FAIL above ${failMm} mm).`,
    severity: level(m.meanDeviationMm),
  });

  points.push({
    title: `${pct(m.outsideTolerancePercentage)} of the surface is out of tolerance`,
    detail: `${m.pointsOutsideTolerance.toLocaleString()} of ${m.pointsCompared.toLocaleString()} measured points are more than ±${toleranceMm} mm from the design.`,
    severity: m.outsideTolerancePercentage < 5 ? "ok" : m.outsideTolerancePercentage > 25 ? "bad" : "warn",
  });

  if (r.shape) {
    r.shape.axes.forEach((axis, i) => {
      const design = r.shape!.designExtentsMm[i];
      const built = r.shape!.builtExtentsMm[i];
      const diff = built - design;
      const rel = design > 0 ? (diff / design) * 100 : 0;
      const name = axis.charAt(0).toUpperCase() + axis.slice(1);
      points.push({
        title: `${name}: ${signedMm(diff)} (${rel >= 0 ? "+" : "−"}${Math.abs(rel).toFixed(1)}%)`,
        detail: `Built ${mm(built)} vs design ${mm(design)}. ${
          diff >= 0
            ? "Larger than designed."
            : partial
              ? `Only ${pct(m.visibleModelCoverage)} of the object was captured, so this mostly reflects missing coverage, not a size error.`
              : "Smaller than designed, or this side was only partly captured."
        }`,
        severity: level(Math.abs(diff)),
      });
    });
  }

  const regions = r.deviationRegions;
  const regionPoint = (i: number): DifferencePoint => ({
    title: `${["Biggest", "Second", "Third"][i]} problem area: ${regions[i].location}`,
    detail: `Off by ${mm(regions[i].meanDeviationMm)} on average, up to ${mm(regions[i].maxDeviationMm)}, covering ${pct(regions[i].pointShare)} of the measured surface.`,
    severity: level(regions[i].meanDeviationMm),
  });
  regions.slice(0, 2).forEach((_, i) => points.push(regionPoint(i)));
  if (regions.length === 0) {
    points.push({
      title: "No problem areas",
      detail: `No cluster of the surface deviates by more than ${failMm} mm.`,
      severity: "ok",
    });
  }

  points.push({
    title: `Largest single difference: ${mm(m.maxDeviationMm)}`,
    detail: regions.length
      ? `Found in the ${regions[0].location} area. Isolated peaks can also be reconstruction noise — check that area in the photos.`
      : "Isolated peaks like this can be reconstruction noise rather than a real defect.",
    severity: level(m.p95DeviationMm),
  });

  points.push({
    title: `${pct(m.visibleModelCoverage)} of the design was checked`,
    detail:
      m.visibleModelCoverage < 60
        ? "Large parts of the design were not seen in the photos/video, so differences there are not measured."
        : "Most of the design was visible, so the comparison covers the object well.",
    severity: m.visibleModelCoverage < 40 ? "bad" : m.visibleModelCoverage < 70 ? "warn" : "ok",
  });

  points.push({
    title: `Alignment confidence: ${(r.alignment.fitness * 100).toFixed(0)}%`,
    detail:
      r.alignment.fitness < 0.5
        ? "Only part of the built object lined up with the design — some differences may come from misalignment."
        : partial
          ? "The captured part fits the design, but so little was captured that it may have been placed on the wrong spot — compare the shape view above."
          : "The built object lined up well with the design, so the differences above are reliable.",
    severity: r.alignment.fitness < 0.4 ? "bad" : r.alignment.fitness < 0.6 || partial ? "warn" : "ok",
  });

  // Lower-priority points fill the list up to `count` when there are no size or region results.
  points.push({
    title: `Most of the surface is within ${mm(m.p95DeviationMm)}`,
    detail: `Half the measured points are within ${mm(m.medianDeviationMm)} of the design, and 95% within ${mm(m.p95DeviationMm)}.`,
    severity: level(m.medianDeviationMm),
  });

  points.push({
    title: `Shape match (Chamfer): ${mm(m.chamferDistanceMm)}`,
    detail: `Average two-way gap between the built shape and the design (RMSE ${mm(m.rmseMm)}).`,
    severity: level(m.chamferDistanceMm),
  });

  if (regions.length > 2) points.push(regionPoint(2));

  points.push({
    title: `Worst-case gap (Hausdorff): ${mm(m.hausdorffDistanceMm)}`,
    detail: "The farthest any part of the built object or the visible design is from the other.",
    severity: level(m.p95DeviationMm),
  });

  points.push({
    title: `${m.pointsCompared.toLocaleString()} points measured`,
    detail: "Number of 3D points rebuilt from the photos/video and compared against the design.",
    severity: "ok",
  });

  return points.slice(0, count);
}
