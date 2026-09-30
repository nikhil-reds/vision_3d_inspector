import { cn } from "@/lib/cn";
import { issues, reportSummary, severityMeta, type Severity } from "@/lib/data";
import { ScoreRing } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";

export function severityTotals() {
  const out: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  issues.forEach((i) => out[i.severity]++);
  return out;
}

export function ReportSummary({ compact, className }: { compact?: boolean; className?: string }) {
  const s = reportSummary;
  const totals = severityTotals();
  return (
    <div className={cn("panel relative overflow-hidden", compact ? "p-5" : "p-6 sm:p-8", className)}>
      <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-accent-500/10 blur-3xl" />
      <div className={cn("relative flex flex-col gap-6", !compact && "md:flex-row md:items-center")}>
        <div className="flex items-center gap-5">
          <ScoreRing value={s.overallScore} size={compact ? 116 : 168} stroke={compact ? 9 : 12} label="Match" />
          {compact && (
            <div>
              <p className="text-xs text-mist-400">Verdict</p>
              <p className="mt-1 font-semibold text-amber-300">{s.grade}</p>
              <p className="mt-0.5 text-sm text-mist-300">{s.verdict}</p>
            </div>
          )}
        </div>
        {!compact && (
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-inset ring-amber-400/25">
                <Icon name="alert" size={13} /> {s.grade}
              </span>
              <span className="font-mono text-xs text-mist-400">{s.inspectedAt}</span>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{s.verdict}</h2>
            <p className="mt-2 max-w-xl text-sm text-mist-400">
              The fabricated bracket matches the reference design at {s.overallScore}% overall. One critical missing feature and one high-severity positional offset must be corrected before batch release.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Mean deviation", s.meanDeviation],
                ["Max deviation", s.maxDeviation],
                ["Surface coverage", s.coverage],
                ["Tolerance", s.tolerance],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-wider text-mist-400">{k}</dt>
                  <dd className="mt-1 font-mono text-lg text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
      <div className="relative mt-6 grid grid-cols-4 gap-2">
        {(Object.keys(totals) as Severity[]).map((sev) => (
          <div key={sev} className="rounded-xl bg-ink-950/40 p-3 ring-1 ring-inset ring-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" style={{ background: severityMeta[sev].color }} />
              <span className="truncate text-[11px] text-mist-400">{severityMeta[sev].label}</span>
            </div>
            <p className="mt-1 font-mono text-xl font-semibold text-white">{totals[sev]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
