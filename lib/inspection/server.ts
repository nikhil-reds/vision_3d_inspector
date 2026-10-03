import { spawn } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GeminiReport, InspectionMeta, InspectionReport, InspectionResult, InspectionStatus } from "./types";
import { PIPELINE_STAGES } from "./types";

const ROOT = process.cwd();
export const INSPECTIONS_DIR = path.join(ROOT, "public", "inspections");
const BACKEND_DIR = path.join(ROOT, "backend");

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Only UUIDs we generated may be used as folder names (prevents path traversal). */
export function isInspectionId(id: string) {
  return ID_RE.test(id);
}

export function inspectionDir(id: string) {
  if (!isInspectionId(id)) throw new Error("Invalid inspection id");
  return path.join(INSPECTIONS_DIR, id);
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeJson(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2));
  await rename(tmp, file);
}

export function readStatus(id: string) {
  return readJson<InspectionStatus>(path.join(inspectionDir(id), "status.json"));
}

export function readMeta(id: string) {
  return readJson<InspectionMeta>(path.join(inspectionDir(id), "meta.json"));
}

export async function readReport(id: string): Promise<InspectionReport | null> {
  const dir = inspectionDir(id);
  const result = await readJson<InspectionResult>(path.join(dir, "report", "result.json"));
  if (!result) return null;
  const [meta, gemini] = await Promise.all([readMeta(id), readJson<GeminiReport>(path.join(dir, "report", "gemini-report.json"))]);
  return { meta, result, gemini };
}

export function writeStatus(id: string, status: InspectionStatus["status"], stageIndex: number, error?: { code: string; message: string }) {
  const data: InspectionStatus = {
    status,
    progress: status === "completed" ? 100 : Math.round((stageIndex / PIPELINE_STAGES.length) * 100),
    currentStage: status === "completed" ? "Completed" : PIPELINE_STAGES[Math.min(stageIndex, PIPELINE_STAGES.length - 1)],
    stageIndex,
    stages: [...PIPELINE_STAGES],
    updatedAt: new Date().toISOString(),
    ...(error && { error: error.message, errorCode: error.code }),
  };
  return writeJson(path.join(inspectionDir(id), "status.json"), data);
}

function pythonExecutable() {
  if (process.env.PIPELINE_PYTHON) return path.resolve(ROOT, process.env.PIPELINE_PYTHON);
  return process.platform === "win32"
    ? path.join(BACKEND_DIR, ".venv", "Scripts", "python.exe")
    : path.join(BACKEND_DIR, ".venv", "bin", "python");
}

/**
 * Start the Python pipeline as a background process. It writes status.json itself;
 * we only step in if the process can't start or dies without recording a result.
 */
export async function startPipeline(id: string) {
  const dir = inspectionDir(id);
  await writeStatus(id, "processing", 0);

  const python = pythonExecutable();
  if (!existsSync(python)) {
    await writeStatus(id, "failed", 0, {
      code: "pipeline_not_installed",
      message: `Python environment not found at ${python}. Set up backend/.venv (see README).`,
    });
    return;
  }

  const log = createWriteStream(path.join(dir, "pipeline.log"), { flags: "w" });
  await new Promise((resolve) => log.once("open", resolve));
  const child = spawn(python, ["-u", "-m", "pipeline.index", id], {
    cwd: BACKEND_DIR,
    env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    stdio: ["ignore", log, log],
    windowsHide: true,
    detached: process.platform !== "win32",
  });

  const failIfStillProcessing = async (message: string) => {
    const s = await readStatus(id);
    if (s?.status === "processing") await writeStatus(id, "failed", s.stageIndex, { code: "pipeline_crashed", message });
  };
  child.on("error", (err) => void failIfStillProcessing(`Could not start the pipeline: ${err.message}`));
  child.on("exit", (code) => {
    log.end();
    if (code !== 0) void failIfStillProcessing(`Pipeline process exited with code ${code}. See pipeline.log.`);
  });
  child.unref();
}
