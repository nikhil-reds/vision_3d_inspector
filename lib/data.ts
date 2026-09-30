// Static demo data. Everything here is dummy content for the frontend prototype.

export type ProjectStatus = "draft" | "awaiting-photos" | "processing" | "completed" | "issues-found";
export type InspectionMode = "quick" | "precision";
export type Severity = "critical" | "high" | "medium" | "low";

export interface Project {
  id: string;
  name: string;
  code: string;
  client: string;
  type: string;
  description: string;
  status: ProjectStatus;
  mode: InspectionMode;
  thumbnail: string;
  updatedAt: string;
  createdAt: string;
  owner: string;
  matchScore: number | null;
  issues: number;
  photos: number;
  progress: number;
}

export const projects: Project[] = [
  {
    id: "hb-220-hydraulic-bracket",
    name: "HB-220 Hydraulic Mounting Bracket",
    code: "HB-220",
    client: "Northwind Fluid Systems",
    type: "Welded assembly",
    description:
      "Powder-coated steel bracket supporting a hydraulic manifold. First-article inspection before batch release of 40 units.",
    status: "issues-found",
    mode: "precision",
    thumbnail: "/images/projects/hydraulic-bracket.jpg",
    updatedAt: "12 min ago",
    createdAt: "Sep 24, 2026",
    owner: "Priya Raman",
    matchScore: 87.6,
    issues: 5,
    photos: 5,
    progress: 100,
  },
  {
    id: "ef-118-equipment-frame",
    name: "EF-118 Equipment Frame",
    code: "EF-118",
    client: "Atlas Machine Works",
    type: "Structural frame",
    description: "Safety-orange tubular frame for a CNC coolant station. Checking leg squareness and rail spacing.",
    status: "completed",
    mode: "quick",
    thumbnail: "/images/projects/equipment-frame.jpg",
    updatedAt: "2 h ago",
    createdAt: "Sep 21, 2026",
    owner: "Daniel Okafor",
    matchScore: 96.2,
    issues: 1,
    photos: 5,
    progress: 100,
  },
  {
    id: "ph-510-pump-housing",
    name: "PH-510 Pump Housing Skid",
    code: "PH-510",
    client: "Meridian Process Co.",
    type: "Machined housing",
    description: "Horizontal centrifugal pump housing with flanged ends and discharge nozzle mounted on a skid.",
    status: "processing",
    mode: "precision",
    thumbnail: "/images/projects/pump-housing.jpg",
    updatedAt: "34 min ago",
    createdAt: "Sep 27, 2026",
    owner: "Priya Raman",
    matchScore: null,
    issues: 0,
    photos: 5,
    progress: 62,
  },
  {
    id: "cc-900-control-cabinet",
    name: "CC-900 Control Cabinet",
    code: "CC-900",
    client: "Helios Automation",
    type: "Sheet metal enclosure",
    description: "Floor-standing electrical enclosure. Verifying door alignment, vent pattern and handle position.",
    status: "awaiting-photos",
    mode: "quick",
    thumbnail: "/images/projects/control-cabinet.jpg",
    updatedAt: "Yesterday",
    createdAt: "Sep 28, 2026",
    owner: "Marta Silva",
    matchScore: null,
    issues: 0,
    photos: 2,
    progress: 40,
  },
  {
    id: "cv-340-conveyor-section",
    name: "CV-340 Roller Conveyor Section",
    code: "CV-340",
    client: "Parcelline Logistics",
    type: "Conveyor module",
    description: "Gravity roller conveyor section, 9 rollers at 20 mm pitch. Checking roller parallelism.",
    status: "completed",
    mode: "quick",
    thumbnail: "/images/projects/conveyor-section.jpg",
    updatedAt: "3 days ago",
    createdAt: "Sep 18, 2026",
    owner: "Daniel Okafor",
    matchScore: 93.8,
    issues: 2,
    photos: 5,
    progress: 100,
  },
  {
    id: "tp-075-turbine-pedestal",
    name: "TP-075 Turbine Pedestal",
    code: "TP-075",
    client: "Vantor Energy",
    type: "Cast pedestal",
    description: "Cast and machined pedestal for an auxiliary turbine. Concentricity and bolt pattern inspection.",
    status: "issues-found",
    mode: "precision",
    thumbnail: "/images/projects/turbine-pedestal.jpg",
    updatedAt: "4 days ago",
    createdAt: "Sep 15, 2026",
    owner: "Marta Silva",
    matchScore: 81.4,
    issues: 7,
    photos: 5,
    progress: 100,
  },
  {
    id: "gm-012-gripper-mount",
    name: "GM-012 Robotic Gripper Mount",
    code: "GM-012",
    client: "Kinetic Cells Ltd.",
    type: "End effector",
    description: "Parallel gripper mount for a palletising robot. New design revision awaiting reference model.",
    status: "draft",
    mode: "quick",
    thumbnail: "/images/projects/gripper-mount.jpg",
    updatedAt: "1 week ago",
    createdAt: "Sep 22, 2026",
    owner: "Priya Raman",
    matchScore: null,
    issues: 0,
    photos: 0,
    progress: 10,
  },
];

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export const statusMeta: Record<ProjectStatus, { label: string; tone: "slate" | "sky" | "violet" | "emerald" | "amber" }> = {
  draft: { label: "Draft", tone: "slate" },
  "awaiting-photos": { label: "Awaiting photos", tone: "sky" },
  processing: { label: "Processing", tone: "violet" },
  completed: { label: "Completed", tone: "emerald" },
  "issues-found": { label: "Issues found", tone: "amber" },
};

export const modeMeta: Record<InspectionMode, { label: string; short: string }> = {
  quick: { label: "Quick inspection", short: "Quick" },
  precision: { label: "Precision inspection", short: "Precision" },
};

// ---------------- Dashboard ----------------

export const dashboardStats = [
  { id: "projects", label: "Total projects", value: "48", delta: "+6", trend: "up" as const, hint: "this month", icon: "folder" as const, spark: [12, 14, 13, 18, 20, 19, 24, 27, 26, 31, 34, 38] },
  { id: "completed", label: "Completed inspections", value: "312", delta: "+18%", trend: "up" as const, hint: "vs last month", icon: "check" as const, spark: [20, 22, 21, 26, 25, 30, 32, 31, 35, 37, 36, 41] },
  { id: "processing", label: "Processing inspections", value: "7", delta: "3 queued", trend: "flat" as const, hint: "avg 6m 40s", icon: "activity" as const, spark: [4, 6, 5, 7, 6, 8, 5, 6, 7, 6, 8, 7] },
  { id: "issues", label: "Issues detected", value: "129", delta: "-9%", trend: "down" as const, hint: "vs last month", icon: "alert" as const, spark: [30, 28, 31, 27, 26, 24, 25, 22, 21, 20, 18, 17] },
];

export const throughput = [
  { day: "Mon", quick: 14, precision: 6 },
  { day: "Tue", quick: 18, precision: 8 },
  { day: "Wed", quick: 12, precision: 9 },
  { day: "Thu", quick: 21, precision: 7 },
  { day: "Fri", quick: 17, precision: 11 },
  { day: "Sat", quick: 6, precision: 3 },
  { day: "Sun", quick: 4, precision: 2 },
];

export type ActivityKind = "analysis" | "upload" | "capture" | "issue" | "report" | "project";

export const activity: { id: string; kind: ActivityKind; title: string; detail: string; time: string; user: string }[] = [
  { id: "a1", kind: "issue", title: "Critical deviation flagged", detail: "HB-220 · Right gusset plate not detected", time: "12 min ago", user: "System" },
  { id: "a2", kind: "analysis", title: "Analysis started", detail: "PH-510 · Precision mode, 5 photos", time: "34 min ago", user: "Priya Raman" },
  { id: "a3", kind: "report", title: "Report exported", detail: "EF-118 · Inspection report v2", time: "2 h ago", user: "Daniel Okafor" },
  { id: "a4", kind: "capture", title: "Photos captured", detail: "CC-900 · 2 of 5 angles", time: "Yesterday", user: "Marta Silva" },
  { id: "a5", kind: "upload", title: "Reference model uploaded", detail: "PH-510 · pump_housing_r3.glb (14.2 MB)", time: "Yesterday", user: "Priya Raman" },
  { id: "a6", kind: "project", title: "Project created", detail: "GM-012 · Robotic Gripper Mount", time: "1 week ago", user: "Priya Raman" },
];

// ---------------- Model ----------------

export const modelInfo = {
  fileName: "hb220_bracket_rev_c.glb",
  format: "GLB",
  fileSize: "8.6 MB",
  units: "Millimetres",
  width: "120.0 mm",
  height: "100.0 mm",
  depth: "80.0 mm",
  meshCount: 38,
  materialCount: 4,
  vertices: "24,816",
  triangles: "41,302",
  uploadedAt: "Sep 24, 2026 · 09:42",
  materials: [
    { name: "Powder coat — RAL 5014", color: "#3b4c63" },
    { name: "Machined steel", color: "#8a8f96" },
    { name: "Zinc plated fastener", color: "#c3c7cc" },
    { name: "Bore / cavity", color: "#0b0c0e" },
  ],
  checks: [
    { label: "Watertight geometry", ok: true },
    { label: "Scale & units detected", ok: true },
    { label: "Normals consistent", ok: true },
    { label: "Materials resolved", ok: true },
    { label: "Non-manifold edges", ok: false, note: "2 minor edges auto-repaired" },
  ],
};

export const modelViews = [
  { id: "iso", label: "Isometric", src: "/images/models/reference-iso.jpg" },
  { id: "front", label: "Front", src: "/images/models/reference-front.jpg" },
  { id: "side", label: "Side", src: "/images/models/reference-side.jpg" },
  { id: "top", label: "Top", src: "/images/models/reference-top.jpg" },
  { id: "wire", label: "Wireframe", src: "/images/models/reference-wireframe.jpg" },
] as const;

export const supportedFormats = ["GLB", "GLTF", "OBJ", "FBX", "STL"];

// ---------------- Capture ----------------

export interface CaptureAngle {
  id: string;
  label: string;
  short: string;
  angle: string;
  instruction: string;
  image: string;
  captured: boolean;
  quality?: number;
}

export const captureAngles: CaptureAngle[] = [
  { id: "front", label: "Front view", short: "Front", angle: "0°", instruction: "Stand square to the front face at ~1.2 m. Keep the base plate level with the frame guide.", image: "/images/captures/front-view.jpg", captured: true, quality: 96 },
  { id: "left-45", label: "Left 45°", short: "Left 45°", angle: "−45°", instruction: "Walk 45° to the left. Both the left gusset and the front edge must be visible.", image: "/images/captures/left-45.jpg", captured: true, quality: 94 },
  { id: "right-45", label: "Right 45°", short: "Right 45°", angle: "+45°", instruction: "Walk 45° to the right. Include the right side and top shelf edge in frame.", image: "/images/captures/right-45.jpg", captured: true, quality: 91 },
  { id: "rear", label: "Rear view", short: "Rear", angle: "180°", instruction: "Capture the rear face squarely. Avoid backlight from windows behind the object.", image: "/images/captures/rear-view.jpg", captured: false },
  { id: "top", label: "Top / detail", short: "Top", angle: "Top 60°", instruction: "Raise the camera above the object and tilt down ~60°. Focus on the central boss.", image: "/images/captures/top-detail.jpg", captured: false },
];

// ---------------- Analysis ----------------

export const analysisSteps = [
  { id: "validate", label: "Validate model", detail: "Geometry, scale and units verified", duration: "4s" },
  { id: "photos", label: "Process photos", detail: "Undistort, exposure-normalise, extract features", duration: "38s" },
  { id: "detect", label: "Detect object", detail: "Segment object and estimate camera poses", duration: "52s" },
  { id: "compare", label: "Compare design", detail: "Align reconstruction to reference model", duration: "1m 46s" },
  { id: "differences", label: "Analyze differences", detail: "Compute surface deviation and missing features", duration: "1m 12s" },
  { id: "report", label: "Generate report", detail: "Compile findings, crops and scoring", duration: "9s" },
];

// ---------------- Issues / report ----------------

export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  location: string;
  expected: string;
  actual: string;
  deviation: string;
  confidence: number;
  description: string;
  images?: { reference: string; actual: string; heat: string };
  marker?: { x: number; y: number };
}

export const issues: Issue[] = [
  {
    id: "ISS-001",
    title: "Right gusset plate missing",
    severity: "critical",
    category: "Missing feature",
    location: "Right side · base-to-wall junction",
    expected: "Gusset plate 8 × 44 × 44 mm present",
    actual: "No geometry detected",
    deviation: "Feature absent",
    confidence: 98.4,
    description: "The right-hand stiffening gusset between the base plate and back wall was not found in any capture angle. Structural load path is compromised.",
    images: { reference: "/images/comparisons/issue-gusset-reference.jpg", actual: "/images/comparisons/issue-gusset-actual.jpg", heat: "/images/comparisons/issue-gusset-heat.jpg" },
    marker: { x: 68.4, y: 67.7 },
  },
  {
    id: "ISS-002",
    title: "Top shelf lateral offset",
    severity: "high",
    category: "Position deviation",
    location: "Top shelf · +X edge",
    expected: "0.0 mm offset (±1.0 mm)",
    actual: "+4.2 mm along X-axis",
    deviation: "+4.2 mm",
    confidence: 94.1,
    description: "The top shelf is welded 4.2 mm to the right of its nominal position, overhanging the back wall edge.",
    images: { reference: "/images/comparisons/issue-shelf-reference.jpg", actual: "/images/comparisons/issue-shelf-actual.jpg", heat: "/images/comparisons/issue-shelf-heat.jpg" },
    marker: { x: 72.3, y: 33 },
  },
  {
    id: "ISS-003",
    title: "Centre boss height under tolerance",
    severity: "medium",
    category: "Dimensional",
    location: "Centre boss · top face",
    expected: "22.0 mm (±0.5 mm)",
    actual: "18.1 mm",
    deviation: "−3.9 mm",
    confidence: 91.7,
    description: "The machined centre boss is shorter than specified. Likely over-facing during machining.",
    images: { reference: "/images/comparisons/issue-boss-reference.jpg", actual: "/images/comparisons/issue-boss-actual.jpg", heat: "/images/comparisons/issue-boss-heat.jpg" },
    marker: { x: 48.4, y: 61.2 },
  },
  {
    id: "ISS-004",
    title: "Mounting hole position shift",
    severity: "low",
    category: "Hole pattern",
    location: "Back wall · upper-right hole",
    expected: "Ø10 at (35.0, 70.0)",
    actual: "Ø10 at (38.1, 66.8)",
    deviation: "4.4 mm radial",
    confidence: 86.3,
    description: "Upper-right mounting hole is displaced diagonally. Bolt fit is still possible with slotted washer.",
    images: { reference: "/images/comparisons/issue-hole-reference.jpg", actual: "/images/comparisons/issue-hole-actual.jpg", heat: "/images/comparisons/issue-hole-heat.jpg" },
    marker: { x: 66.4, y: 41.7 },
  },
  {
    id: "ISS-005",
    title: "Surface finish variance",
    severity: "low",
    category: "Surface",
    location: "Back wall · rear face",
    expected: "Uniform powder coat",
    actual: "Minor texture variance",
    deviation: "Cosmetic",
    confidence: 72.5,
    description: "Slight orange-peel texture detected on the rear face. Cosmetic only, no dimensional impact.",
  },
];

export const severityMeta: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "#f43f5e" },
  high: { label: "High", color: "#fb923c" },
  medium: { label: "Medium", color: "#facc15" },
  low: { label: "Low", color: "#38bdf8" },
};

export const reportSummary = {
  overallScore: 87.6,
  grade: "Conditional",
  verdict: "Rework required before release",
  inspectedAt: "Sep 30, 2026 · 10:18",
  inspector: "Priya Raman",
  duration: "4m 41s",
  photos: 5,
  meanDeviation: "0.84 mm",
  maxDeviation: "4.2 mm",
  coverage: "94%",
  confidence: "92.3%",
  tolerance: "±0.5 mm",
};

export const comparisonImages = {
  reference: "/images/comparisons/reference.jpg",
  actual: "/images/comparisons/actual.jpg",
  heatmap: "/images/comparisons/deviation-heatmap.jpg",
};

export const projectTypes = [
  "Welded assembly",
  "Structural frame",
  "Machined housing",
  "Sheet metal enclosure",
  "Cast part",
  "Conveyor module",
  "End effector",
  "Other",
];
