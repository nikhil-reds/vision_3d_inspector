"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/Progress";

export interface UploadedFile {
  name: string;
  size: string;
}

type Phase = "idle" | "dragging" | "uploading" | "done" | "error";

interface UploadZoneProps {
  formats: string[];
  title?: string;
  subtitle?: string;
  icon?: IconName;
  maxSize?: string;
  onComplete?: (file: UploadedFile) => void;
  className?: string;
}

function formatSize(bytes: number) {
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

/**
 * Drag-and-drop area with simulated upload progress.
 * Files are never read or sent anywhere — only the name/size is used for display.
 */
export function UploadZone({ formats, title = "Drag & drop your file here", subtitle, icon = "upload", maxSize = "250 MB", onComplete, className }: UploadZoneProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = formats.map((f) => `.${f.toLowerCase()}`).join(",");

  useEffect(() => {
    if (phase !== "uploading") return;
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4 + Math.random() * 9);
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => setPhase("done"), 250);
        }
        return next;
      });
    }, 120);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "done" && file) onComplete?.(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const start = (name: string, bytes: number) => {
    const ext = name.split(".").pop()?.toUpperCase() ?? "";
    if (!formats.includes(ext)) {
      setError(`.${ext.toLowerCase() || "?"} files are not supported. Use ${formats.join(", ")}.`);
      setPhase("error");
      return;
    }
    setError(null);
    setFile({ name, size: formatSize(bytes) });
    setProgress(0);
    setPhase("uploading");
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) start(f.name, f.size);
    else setPhase("idle");
  };

  const simulateSample = () => start(`sample_part.${formats[0].toLowerCase()}`, 8_600_000);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (phase !== "uploading") setPhase("dragging");
      }}
      onDragLeave={() => phase === "dragging" && setPhase("idle")}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all sm:p-8",
        phase === "dragging" ? "scale-[1.01] border-accent-400/70 bg-accent-400/[0.06]" : phase === "error" ? "border-rose-400/40 bg-rose-500/[0.04]" : "border-white/10 bg-ink-850/60 hover:border-white/20",
        className
      )}
    >
      <div className={cn("bg-grid-fade pointer-events-none absolute inset-0 transition-opacity", phase === "dragging" ? "opacity-100" : "opacity-40")} />
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) start(f.name, f.size); e.target.value = ""; }} />

      {phase === "uploading" || phase === "done" ? (
        <div className="relative mx-auto max-w-md text-left">
          <div className="flex items-center gap-4">
            <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset", phase === "done" ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25" : "bg-accent-400/10 text-accent-300 ring-accent-400/25")}>
              <Icon name={phase === "done" ? "checkCircle" : "cube"} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{file?.name}</p>
              <p className="mt-0.5 text-xs text-mist-400">
                {file?.size} · {phase === "done" ? "Upload complete · validating geometry" : `Uploading… ${Math.round(progress)}%`}
              </p>
            </div>
            {phase === "done" && (
              <button onClick={() => { setPhase("idle"); setFile(null); }} className="rounded-lg p-2 text-mist-400 hover:bg-white/5 hover:text-white" aria-label="Upload another file">
                <Icon name="refresh" size={16} />
              </button>
            )}
          </div>
          <ProgressBar value={progress} tone={phase === "done" ? "emerald" : "accent"} className="mt-4" />
        </div>
      ) : (
        <div className="relative">
          <div className={cn("mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink-700 ring-1 ring-white/10 transition-transform", phase === "dragging" && "-translate-y-1 ring-accent-400/40")}>
            <Icon name={phase === "error" ? "alert" : icon} size={24} className={phase === "error" ? "text-rose-300" : "text-accent-300"} />
          </div>
          <p className="mt-4 font-medium text-white">{phase === "dragging" ? "Release to upload" : title}</p>
          <p className="mt-1 text-sm text-mist-400">
            {error ?? subtitle ?? (
              <>
                or{" "}
                <button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-accent-300 hover:underline">
                  browse your computer
                </button>
              </>
            )}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
            {formats.map((f) => (
              <span key={f} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-mist-300 ring-1 ring-inset ring-white/10">.{f.toLowerCase()}</span>
            ))}
          </div>
          <p className="mt-4 text-xs text-mist-400">
            Supports {formats.join(", ")} · Max {maxSize}
            <span className="mx-2 text-mist-400/40">|</span>
            <button type="button" onClick={simulateSample} className="text-mist-300 underline-offset-2 hover:text-white hover:underline">
              Try with sample file
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
