"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";

const PHOTO_COUNT = 4;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MODEL_EXTENSIONS = [".glb", ".obj"];

// GLB is always in meters; OBJ has no unit, so the user picks it.
type ObjUnit = "mm" | "cm" | "m";
const objUnitOptions: { value: ObjUnit; label: string }[] = [
  { value: "mm", label: "Millimeters (mm)" },
  { value: "cm", label: "Centimeters (cm)" },
  { value: "m", label: "Meters (m)" },
];

const isObj = (file: File | null) => !!file && file.name.toLowerCase().endsWith(".obj");

function formatSize(bytes: number) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

export function CaptureForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [name, setName] = useState("");
  const [model, setModel] = useState<File | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [objUnit, setObjUnit] = useState<ObjUnit>("mm");
  const [photos, setPhotos] = useState<string[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const pickModel = (file: File | undefined) => {
    if (!file) return;
    if (!MODEL_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setModel(null);
      setModelError("Only .glb and .obj files are supported.");
      return;
    }
    setModelError(null);
    setModel(file);
  };

  const canSubmit = name.trim().length > 0 && model !== null && photos.length === PHOTO_COUNT;

  if (submitted) {
    return (
      <div className="panel space-y-5 p-6 text-center">
        <Icon name="checkCircle" size={36} className="mx-auto text-emerald-300" />
        <div>
          <h2 className="text-lg font-semibold text-white">{name}</h2>
          <p className="mt-1 text-sm text-mist-400">
            {model?.name}
            {isObj(model) && ` (${objUnit})`} · {PHOTO_COUNT} photos
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={`Photo ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
          ))}
        </div>
        <Button
          variant="secondary"
          icon="refresh"
          onClick={() => {
            setName("");
            setModel(null);
            setPhotos([]);
            setSubmitted(false);
          }}
        >
          New project
        </Button>
      </div>
    );
  }

  return (
    <form
      className="panel space-y-6 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) setSubmitted(true);
      }}
    >
      <Field label="Project name" htmlFor="project-name">
        <TextInput id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HB-220 Hydraulic Bracket" required />
      </Field>

      <Field label="3D model (GLB / OBJ)" htmlFor="project-model" error={modelError ?? undefined}>
        <label
          htmlFor="project-model"
          className="flex cursor-pointer items-center gap-3 rounded-xl bg-ink-800 p-3 ring-1 ring-inset ring-white/10 transition hover:ring-white/20"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-accent-300">
            <Icon name="cube" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-white">{model ? model.name : "Choose .glb or .obj file"}</span>
            <span className="block text-xs text-mist-400">{model ? formatSize(model.size) : "Reference design to compare against"}</span>
          </span>
          {model && <Icon name="checkCircle" size={18} className="text-emerald-300" />}
        </label>
        <input
          id="project-model"
          type="file"
          accept=".glb,.obj,model/gltf-binary,model/obj"
          className="sr-only"
          onChange={(e) => pickModel(e.target.files?.[0])}
        />
      </Field>

      {isObj(model) && (
        <Field label="OBJ units" htmlFor="project-obj-unit" hint="OBJ files don't store units — pick the unit the model was exported in.">
          <Select id="project-obj-unit" value={objUnit} options={objUnitOptions} onChange={setObjUnit} />
        </Field>
      )}

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

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        Submit
      </Button>
    </form>
  );
}
