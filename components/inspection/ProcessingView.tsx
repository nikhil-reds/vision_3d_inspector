"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/Progress";
import { PIPELINE_STAGES, type InspectionStatus } from "@/lib/inspection/types";

const POLL_MS = 2000;

export function ProcessingView({ id, projectName }: { id: string; projectName: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<InspectionStatus | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/inspection/${id}/status`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Status request failed (${res.status})`);
      setStatus(data);
      setFetchError(null);
      return data as InspectionStatus;
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Could not read status");
      return null;
    }
  }, [id]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const tick = async () => {
      const s = await poll();
      if (cancelled) return;
      if (s?.status === "completed") return router.replace(`/inspection/${id}/report`);
      if (s?.status === "failed") return;
      timer = setTimeout(tick, POLL_MS);
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id, poll, router, retrying]);

  const retry = async () => {
    setRetrying(true);
    try {
      const res = await fetch("/api/inspection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Retry failed (${res.status})`);
      setStatus(null);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  };

  const failed = status?.status === "failed";
  const stageIndex = status?.stageIndex ?? 0;

  return (
    <div className="panel space-y-6 p-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-400">{failed ? "Inspection failed" : "Inspection processing"}</p>
        <h1 className="mt-1 text-xl font-semibold text-white">{projectName ?? "Inspection"}</h1>
        <p className="mt-1 font-mono text-xs text-mist-400">{id}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist-300">{status ? status.currentStage : "Starting…"}</span>
          <span className="font-mono text-white">{status?.progress ?? 0}%</span>
        </div>
        <ProgressBar value={status?.progress ?? 0} tone={failed ? "amber" : "accent"} />
      </div>

      <ol className="space-y-2.5">
        {PIPELINE_STAGES.map((stage, i) => {
          const state = i < stageIndex ? "done" : i === stageIndex ? (failed ? "failed" : "active") : "pending";
          return (
            <li key={stage} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full ring-1 ring-inset",
                  state === "done" && "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
                  state === "active" && "bg-accent-400/15 text-accent-300 ring-accent-400/40",
                  state === "failed" && "bg-rose-500/15 text-rose-300 ring-rose-400/40",
                  state === "pending" && "text-mist-400 ring-white/10"
                )}
              >
                {state === "done" ? (
                  <Icon name="check" size={13} strokeWidth={2.5} />
                ) : state === "failed" ? (
                  <Icon name="x" size={13} strokeWidth={2.5} />
                ) : state === "active" ? (
                  <span className="size-2 animate-pulse-soft rounded-full bg-accent-300" />
                ) : (
                  <span className="font-mono text-[10px]">{i + 1}</span>
                )}
              </span>
              <span className={cn(state === "pending" ? "text-mist-400" : "text-white", state === "failed" && "text-rose-200")}>{stage}</span>
            </li>
          );
        })}
      </ol>

      {failed && (
        <div className="space-y-3 rounded-xl bg-rose-500/[0.08] p-4 ring-1 ring-inset ring-rose-400/25">
          <p className="text-sm font-medium text-rose-200">Failed at: {status.currentStage}</p>
          {status.errorCode && <p className="font-mono text-xs text-rose-300/80">{status.errorCode}</p>}
          <p className="break-words text-sm text-mist-200">{status.error}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button icon="refresh" onClick={retry} disabled={retrying}>
              {retrying ? "Retrying…" : "Retry"}
            </Button>
            <Button variant="secondary" href="/">
              New inspection
            </Button>
          </div>
        </div>
      )}

      {fetchError && <p className="text-sm text-rose-300">{fetchError}</p>}
    </div>
  );
}
