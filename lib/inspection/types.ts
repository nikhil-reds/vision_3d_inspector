export const PIPELINE_STAGES = [
  "Input Validation",
  "Camera Pose Estimation",
  "3D Reconstruction",
  "GLB Rendering",
  "Geometry Alignment",
  "Deviation Calculation",
  "Deviation Visualization",
  "Gemini Analysis",
] as const;

export interface InspectionStatus {
  status: "processing" | "completed" | "failed";
  progress: number;
  currentStage: string;
  stageIndex: number;
  stages?: string[];
  updatedAt: string;
  error?: string;
  errorCode?: string;
}

export interface InspectionMeta {
  inspectionId: string;
  projectName: string;
  createdAt: string;
  modelFormat: "glb" | "obj";
  modelUnit: "mm" | "cm" | "m";
  modelFileName: string;
}

export type Verdict = "PASS" | "REVIEW" | "FAIL";

export interface InspectionResult {
  inspectionId: string;
  projectName: string | null;
  createdAt: string | null;
  completedAt: string;
  status: Verdict;
  verdictMetric: string;
  metrics: {
    meanDeviationMm: number;
    medianDeviationMm: number;
    p95DeviationMm: number;
    maxDeviationMm: number;
    rmseMm: number;
    chamferDistanceMm: number;
    hausdorffDistanceMm: number;
    pointsOutsideTolerance: number;
    outsideTolerancePercentage: number;
    pointsCompared: number;
    visibleModelCoverage: number;
  };
  alignment: { fitness: number; inlierRmse: number; scale: number; transformation: number[][] };
  thresholds: { passMm: number; failMm: number; toleranceMm: number; note: string };
  deviationRegions: {
    location: string;
    centroidMm: number[];
    pointShare: number;
    meanDeviationMm: number;
    maxDeviationMm: number;
  }[];
  timingsSec: Record<string, number>;
  files: {
    photos: string[];
    views: string[];
    renders: string[];
    overlays: string[];
    heatmaps: string[];
    heatmap: string;
    histogram: string;
    reconstruction: string;
    aligned: string;
    model: string;
  };
}

export type GeminiReport =
  | {
      available: true;
      model: string;
      summary: string;
      keyFindings: string[];
      affectedAreas: string[];
      possibleCauses: string[];
      recommendations: string[];
      limitations: string[];
    }
  | { available: false; error: string };

export interface InspectionReport {
  meta: InspectionMeta | null;
  result: InspectionResult;
  gemini: GeminiReport | null;
}
