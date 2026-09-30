"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { analysisSteps, captureAngles, comparisonImages, issues, reportSummary, severityMeta, type Severity } from "@/lib/data";
import { InspectionProgress } from "./InspectionProgress";
import { IssueCard } from "./IssueCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar, ScoreRing } from "@/components/ui/Progress";
import { Icon, type IconName } from "@/components/ui/Icon";

const TOTAL_TICKS = analysisSteps.length * 20;
const sevIcons: Record<Severity, IconName> = { critical: "flame", high: "alert", medium: "info", low: "eye" };

export function AnalysisWorkspace({ projectId }: { projectId: string }) {
  // tick 0..TOTAL_TICKS drives the fake progress; starts part-way so the page has content immediately.
  const [tick, setTick] = useState(Math.round(TOTAL_TICKS * 0.18));
  const [running, setRunning] = useState(true);
  const complete = tick >= TOTAL_TICKS;

  useEffect(() => {
    if (!running || complete) return;
    const t = setInterval(() => setTick((v) => Math.min(TOTAL_TICKS, v + 1)), 90);
    return () => clearInterval(t);
  }, [running, complete]);

  const steps = analysisSteps.map((s, i) => ({ ...s, progress: Math.max(0, Math.min(100, ((tick - i * 20) / 20) * 100)) }));
  const overall = (tick / TOTAL_TICKS) * 100;
  const activeStep = steps.find((s) => s.progress < 100);

  const counts = issues.reduce<Record<Severity, number>>((acc, i) => ({ ...acc, [i.severity]: acc[i.severity] + 1 }), { critical: 0, high: 0, medium: 0, low: 0 });

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={cn("panel relative overflow-hidden p-5 sm:p-6", complete && "border-emerald-400/20")}>
        <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className={cn("flex size-12 items-center justify-center rounded-2xl ring-1 ring-inset", complete ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30" : "bg-accent-400/10 text-accent-300 ring-accent-400/30")}>
              <Icon name={complete ? "checkCircle" : "activity"} size={22} className={cn(!complete && running && "animate-pulse-soft")} />
            </span>
            <div>
              <p className="text-lg font-semibold text-white">{complete ? "Analysis complete" : running ? "Analysis in progress" : "Analysis paused"}</p>
              <p className="text-sm text-mist-400">
                {complete ? `Finished in ${reportSummary.duration} · ${issues.length} findings` : `${activeStep?.label ?? ""} · Precision mode · ${captureAngles.length} photos`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {complete ? (
              <>
                <Button variant="secondary" icon="refresh" onClick={() => { setTick(0); setRunning(true); }}>Re-run</Button>
                <Button href={`/projects/${projectId}/report`} iconRight="arrowRight">Open full report</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" icon={running ? "clock" : "play"} onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Resume"}</Button>
                <Button variant="outline" icon="zap" onClick={() => setTick(TOTAL_TICKS)}>Skip to results</Button>
              </>
            )}
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-4">
          <ProgressBar value={overall} tone={complete ? "emerald" : "accent"} />
          <span className="w-12 shrink-0 text-right font-mono text-sm text-white">{Math.round(overall)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="panel self-start p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-white">Pipeline</h2>
            <span className="font-mono text-[11px] text-mist-400">{steps.filter((s) => s.progress >= 100).length}/{steps.length} steps</span>
          </div>
          <InspectionProgress steps={steps} />
        </section>

        {complete ? (
          <section className="animate-fade-up space-y-6">
            <div className="panel grid gap-6 p-5 sm:p-6 md:grid-cols-[auto_1fr] md:items-center">
              <ScoreRing value={reportSummary.overallScore} size={180} stroke={13} label="Overall match" className="mx-auto" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300">{reportSummary.grade}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{reportSummary.verdict}</h3>
                <p className="mt-2 text-sm text-mist-400">
                  Mean surface deviation {reportSummary.meanDeviation}, maximum {reportSummary.maxDeviation}. Confidence {reportSummary.confidence} across {reportSummary.coverage} surface coverage.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(counts) as Severity[]).map((sev) => (
                    <div key={sev} className="relative overflow-hidden rounded-2xl bg-ink-950/50 p-4 ring-1 ring-inset ring-white/[0.07]">
                      <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: severityMeta[sev].color }} />
                      <Icon name={sevIcons[sev]} size={16} style={{ color: severityMeta[sev].color }} />
                      <p className="mt-3 font-mono text-2xl font-semibold text-white">{counts[sev]}</p>
                      <p className="text-xs text-mist-400">{severityMeta[sev].label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {issues.map((i) => (
                <IssueCard key={i.id} issue={i} />
              ))}
            </div>
          </section>
        ) : (
          <section className="panel relative overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={comparisonImages.reference} alt="Reference model being aligned" fill sizes="(min-width:1280px) 55vw, 95vw" className="object-cover" priority />
              <Image
                src={comparisonImages.heatmap}
                alt="Deviation map building up"
                fill
                sizes="(min-width:1280px) 55vw, 95vw"
                className="object-cover transition-[clip-path] duration-300"
                style={{ clipPath: `inset(0 ${100 - Math.max(0, (tick - 60) / 60) * 100}% 0 0)` }}
              />
              <div className="absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent-300 to-transparent shadow-[0_0_20px_rgba(79,220,244,1)]" />
              <div className="hud-corners pointer-events-none absolute inset-5 opacity-60" />
              <div className="absolute left-5 top-5 space-y-1 font-mono text-[10px] uppercase tracking-wider text-mist-200">
                <p className="text-accent-300">{activeStep?.label}</p>
                <p>Points · {(tick * 18_412).toLocaleString("en-US")}</p>
                <p>RMS · {(2.6 - overall / 50).toFixed(2)} mm</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 border-t border-white/[0.06] p-3">
              {captureAngles.map((c, i) => (
                <div key={c.id} className="relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-white/10">
                  <Image src={c.image} alt={c.label} fill sizes="120px" className={cn("object-cover transition", tick < 20 + i * 4 ? "opacity-40 grayscale" : "opacity-100")} />
                  {tick >= 20 + i * 4 && <span className="absolute right-1 top-1 size-1.5 rounded-full bg-emerald-400" />}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
