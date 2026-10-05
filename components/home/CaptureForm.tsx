"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { extractVideoFrames } from "@/lib/videoFrames";

const PHOTO_COUNT = 4;
const VIDEO_FRAME_COUNT = 12;

type Source = "video" | "photos";
const sourceTabs: { id: Source; label: string; icon: "video" | "camera" }[] = [
  { id: "video", label: "Walk-around video", icon: "video" },
  { id: "photos", label: `${PHOTO_COUNT} photos`, icon: "camera" },
];
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MODEL_EXTENSIONS = [".glb", ".obj", ".stl"];

// GLB is always in meters; OBJ and STL have no unit, so the user picks it.
type ModelUnit = "mm" | "cm" | "m";
const unitOptions: { value: ModelUnit; label: string }[] = [
  { value: "mm", label: "Millimeters (mm)" },
  { value: "cm", label: "Centimeters (cm)" },
  { value: "m", label: "Meters (m)" },
];

/** "OBJ" / "STL" when the file format stores no unit, otherwise null. */
const unitlessFormat = (file: File | null) => {
  const ext = file?.name.toLowerCase().split(".").pop();
  return ext === "obj" || ext === "stl" ? ext.toUpperCase() : null;
};

const MAX_UPLOAD_SIDE = 2048;

/** Re-encode any captured/picked image as a JPEG (fixes orientation, caps size for upload). */
async function toJpeg(dataUrl: string): Promise<Blob> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("Could not encode photo");
  return blob;
}

function formatSize(bytes: number) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

export function CaptureForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState("");
  const [model, setModel] = useState<File | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelUnit, setModelUnit] = useState<ModelUnit>("mm");
  const [source, setSource] = useState<Source>("video");
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [extracted, setExtracted] = useState<number | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => stopCamera, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setError("Camera access was blocked or no camera is available. Allow camera permission and try again.");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const next = [...photos, canvas.toDataURL("image/jpeg", 0.9)];
    setPhotos(next);
    if (next.length >= PHOTO_COUNT) stopCamera();
  };

  const addFromGallery = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const free = PHOTO_COUNT - photos.length;
    const picked = Array.from(files);
    const valid = picked.filter((f) => f.type.startsWith("image/") && f.size <= MAX_PHOTO_BYTES);
    if (valid.length < picked.length) setError("Some files were skipped — only images up to 20 MB are allowed.");
    else if (valid.length > free) setError(`Only ${free} more photo${free === 1 ? "" : "s"} needed — extra files were ignored.`);
    const urls = await Promise.all(
      valid.slice(0, free).map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(f);
          })
      )
    );
    setPhotos((p) => [...p, ...urls].slice(0, PHOTO_COUNT));
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, n) => n !== i));

  const pickVideo = async (file: File | undefined) => {
    if (!file) return;
    setVideoError(null);
    setFrames([]);
    if (!file.type.startsWith("video/")) {
      setVideo(null);
      setVideoError("Choose a video file (MP4, MOV or WebM).");
      return;
    }
    setVideo(file);
    setExtracted(0);
    try {
      setFrames(await extractVideoFrames(file, VIDEO_FRAME_COUNT, MAX_UPLOAD_SIDE, setExtracted));
    } catch (e) {
      setVideo(null);
      setVideoError(e instanceof Error ? e.message : "Could not read frames from this video.");
    } finally {
      setExtracted(null);
    }
  };

  const switchSource = (next: Source) => {
    if (next === "video") stopCamera();
    setSource(next);
  };

  const images = source === "video" ? frames : photos;
  const imagesReady = source === "video" ? frames.length === VIDEO_FRAME_COUNT : photos.length === PHOTO_COUNT;

  const pickModel = (file: File | undefined) => {
    if (!file) return;
    if (!MODEL_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setModel(null);
      setModelError("Only .glb, .obj and .stl files are supported.");
      return;
    }
    setModelError(null);
    setModel(file);
  };

  const canSubmit = name.trim().length > 0 && model !== null && imagesReady && !submitting;

  const submit = async () => {
    if (!canSubmit || !model) return;
    setSubmitting(true);
    setSubmitError(null);
    stopCamera();
    try {
      const body = new FormData();
      body.append("projectName", name.trim());
      body.append("model", model);
      body.append("modelUnit", unitlessFormat(model) ? modelUnit : "m");
      const blobs = await Promise.all(images.map(toJpeg));
      blobs.forEach((blob, i) => body.append(`photo-${i + 1}`, blob, `photo-${i + 1}.jpg`));
      const res = await fetch("/api/inspection", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.inspectionId) throw new Error(data.error ?? `Upload failed (${res.status})`);
      router.push(`/inspection/${data.inspectionId}/processing`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Upload failed");
      setSubmitting(false);
    }
  };

  return (
    <form
      className="panel space-y-6 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field label="Project name" htmlFor="project-name">
        <TextInput id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HB-220 Hydraulic Bracket" required />
      </Field>

      <Field label="3D model (GLB / OBJ / STL)" htmlFor="project-model" error={modelError ?? undefined}>
        <label
          htmlFor="project-model"
          className="flex cursor-pointer items-center gap-3 rounded-xl bg-ink-800 p-3 ring-1 ring-inset ring-white/10 transition hover:ring-white/20"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-accent-300">
            <Icon name="cube" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-white">{model ? model.name : "Choose .glb, .obj or .stl file"}</span>
            <span className="block text-xs text-mist-400">{model ? formatSize(model.size) : "Reference design to compare against"}</span>
          </span>
          {model && <Icon name="checkCircle" size={18} className="text-emerald-300" />}
        </label>
        <input
          id="project-model"
          type="file"
          accept=".glb,.obj,.stl,model/gltf-binary,model/obj,model/stl"
          className="sr-only"
          onChange={(e) => pickModel(e.target.files?.[0])}
        />
      </Field>

      {unitlessFormat(model) && (
        <Field
          label={`${unitlessFormat(model)} units`}
          htmlFor="project-model-unit"
          hint={`${unitlessFormat(model)} files don't store units — pick the unit the model was exported in.`}
        >
          <Select id="project-model-unit" value={modelUnit} options={unitOptions} onChange={setModelUnit} />
        </Field>
      )}

      <div className="space-y-3">
        <div className="text-sm font-medium text-mist-200">Real object</div>
        <Tabs items={sourceTabs} value={source} onChange={switchSource} size="sm" className="w-full [&>button]:flex-1 [&>button]:justify-center" />
      </div>

      {source === "video" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-mist-200">
            Video
            <span className="font-mono text-xs text-mist-400">
              {extracted !== null ? extracted : frames.length} / {VIDEO_FRAME_COUNT} frames
            </span>
          </div>
          <p className="text-xs leading-relaxed text-mist-400">
            Walk slowly all the way around the object, keeping the whole object in frame. {VIDEO_FRAME_COUNT} sharp frames are
            picked from the video in your browser — only those frames are uploaded.
          </p>

          <label
            htmlFor="project-video"
            className={`flex items-center gap-3 rounded-xl bg-ink-800 p-3 ring-1 ring-inset ring-white/10 transition ${
              extracted !== null ? "pointer-events-none opacity-60" : "cursor-pointer hover:ring-white/20"
            }`}
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-accent-300">
              <Icon name="video" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-white">{video ? video.name : "Choose or record a video"}</span>
              <span className="block text-xs text-mist-400">
                {extracted !== null
                  ? `Extracting frames… ${extracted} / ${VIDEO_FRAME_COUNT}`
                  : video
                    ? `${formatSize(video.size)} · tap to choose another`
                    : "MP4, MOV or WebM · 10–60 seconds works best"}
              </span>
            </span>
            {frames.length === VIDEO_FRAME_COUNT && <Icon name="checkCircle" size={18} className="text-emerald-300" />}
          </label>
          <input
            id="project-video"
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={extracted !== null}
            onChange={(e) => {
              void pickVideo(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {videoError && <p className="text-xs text-rose-300">{videoError}</p>}

          {(frames.length > 0 || extracted !== null) && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: VIDEO_FRAME_COUNT }, (_, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-ink-800 ring-1 ring-inset ring-white/10">
                  {frames[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={frames[i]} alt={`Video frame ${i + 1}`} className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full items-center justify-center font-mono text-xs text-mist-400">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {source === "photos" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-mist-200">
            Photos
            <span className="font-mono text-xs text-mist-400">
              {photos.length} / {PHOTO_COUNT}
            </span>
          </div>
  
          {cameraOn && (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full rounded-xl bg-black object-cover" />
              <div className="flex gap-2">
                <Button icon="camera" className="flex-1" onClick={takePhoto}>
                  Take photo {photos.length + 1}
                </Button>
                <Button variant="secondary" onClick={stopCamera}>
                  Close
                </Button>
              </div>
            </div>
          )}
  
          {!cameraOn && photos.length < PHOTO_COUNT && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon="camera" onClick={startCamera}>
                {photos.length === 0 ? "Open camera" : "Use camera"}
              </Button>
              <label
                htmlFor="project-photos"
                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 text-sm font-medium text-white ring-1 ring-inset ring-white/10 transition-all hover:bg-white/[0.1]"
              >
                <Icon name="image" size={16} />
                From gallery
              </label>
              <input
                id="project-photos"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addFromGallery(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
          )}
  
          {error && <p className="text-xs text-rose-300">{error}</p>}
  
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: PHOTO_COUNT }, (_, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-ink-800 ring-1 ring-inset ring-white/10">
                {photos[i] ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[i]} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${i + 1}`}
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink-950/80 text-white"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </>
                ) : (
                  <span className="flex size-full items-center justify-center font-mono text-xs text-mist-400">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {submitError && <p className="text-sm text-rose-300">{submitError}</p>}

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {submitting ? "Uploading…" : "Start inspection"}
      </Button>
    </form>
  );
}
