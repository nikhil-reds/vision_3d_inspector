import { randomUUID } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { inspectionDir, isInspectionId, readStatus, startPipeline, writeJson } from "@/lib/inspection/server";
import type { InspectionMeta } from "@/lib/inspection/types";

// 4 hand-taken photos, or up to 40 frames extracted from a walk-around video.
const MIN_PHOTOS = 4;
const MAX_PHOTOS = 40;
const MAX_MODEL_BYTES = 100 * 1024 * 1024;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MODEL_FORMATS = ["glb", "obj"] as const;
const UNITS = ["mm", "cm", "m"] as const;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

const startsWith = (buf: Buffer, bytes: number[]) => bytes.every((b, i) => buf[i] === b);

/** Accept only JPEG/PNG/WebP by content, not by the (client-controlled) MIME type. */
function isImage(buf: Buffer) {
  return (
    startsWith(buf, [0xff, 0xd8, 0xff]) ||
    startsWith(buf, [0x89, 0x50, 0x4e, 0x47]) ||
    (buf.subarray(0, 4).toString("latin1") === "RIFF" && buf.subarray(8, 12).toString("latin1") === "WEBP")
  );
}

async function retry(retryId: unknown) {
  if (typeof retryId !== "string" || !isInspectionId(retryId)) return bad("Invalid inspection id.");
  const status = await readStatus(retryId);
  if (!status) return bad("Inspection not found.", 404);
  if (status.status === "processing") return bad("Inspection is already processing.", 409);
  const inputs = await readdir(path.join(inspectionDir(retryId), "input")).catch(() => []);
  if (!inputs.some((f) => f.startsWith("model."))) return bad("Original input files are missing; start a new inspection.", 409);
  await startPipeline(retryId);
  return Response.json({ inspectionId: retryId, status: "processing" });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return retry(body.retryId);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart form data.");
  }

  const projectName = String(form.get("projectName") ?? "").trim();
  if (!projectName) return bad("Project name is required.");
  if (projectName.length > 120) return bad("Project name is too long.");

  const model = form.get("model");
  if (!(model instanceof File) || model.size === 0) return bad("A 3D model file is required.");
  const ext = path.extname(model.name).slice(1).toLowerCase() as (typeof MODEL_FORMATS)[number];
  if (!MODEL_FORMATS.includes(ext)) return bad("The 3D model must be a .glb or .obj file.");
  if (model.size > MAX_MODEL_BYTES) return bad("The 3D model is larger than 100 MB.");
  const modelBuf = Buffer.from(await model.arrayBuffer());
  if (ext === "glb" && modelBuf.subarray(0, 4).toString("latin1") !== "glTF") return bad("The .glb file is not a valid binary glTF.");

  const unitRaw = String(form.get("modelUnit") ?? "m");
  const modelUnit = ext === "glb" ? "m" : (UNITS as readonly string[]).includes(unitRaw) ? (unitRaw as InspectionMeta["modelUnit"]) : null;
  if (!modelUnit) return bad("OBJ unit must be mm, cm or m.");

  const photos: Buffer[] = [];
  for (let i = 1; i <= MAX_PHOTOS; i++) {
    const photo = form.get(`photo-${i}`);
    if (photo === null && i > MIN_PHOTOS) break;
    if (!(photo instanceof File) || photo.size === 0) return bad(`Photo ${i} is missing — at least ${MIN_PHOTOS} photos are required.`);
    if (photo.size > MAX_PHOTO_BYTES) return bad(`Photo ${i} is larger than 20 MB.`);
    const buf = Buffer.from(await photo.arrayBuffer());
    if (!isImage(buf)) return bad(`Photo ${i} is not a JPEG, PNG or WebP image.`);
    photos.push(buf);
  }

  const inspectionId = randomUUID();
  const dir = inspectionDir(inspectionId);
  await mkdir(path.join(dir, "input"), { recursive: true });
  await writeFile(path.join(dir, "input", `model.${ext}`), modelBuf);
  // Saved under .jpg names as the pipeline expects; Pillow/DUSt3R decode by content.
  await Promise.all(photos.map((buf, i) => writeFile(path.join(dir, "input", `photo-${i + 1}.jpg`), buf)));

  const meta: InspectionMeta = {
    inspectionId,
    projectName,
    createdAt: new Date().toISOString(),
    modelFormat: ext,
    modelUnit,
    modelFileName: model.name,
  };
  await writeJson(path.join(dir, "meta.json"), meta);
  await startPipeline(inspectionId);

  return Response.json({ inspectionId, status: "processing" }, { status: 201 });
}
