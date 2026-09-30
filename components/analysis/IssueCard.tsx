import Image from "next/image";
import { cn } from "@/lib/cn";
import { severityMeta, type Issue } from "@/lib/data";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

export function IssueCard({ issue, compact, className }: { issue: Issue; compact?: boolean; className?: string }) {
  const color = severityMeta[issue.severity].color;
  return (
    <article className={cn("group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-800/60 transition-colors hover:border-white/15", className)}>
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: color, boxShadow: `0 0 16px ${color}` }} />
      <div className={cn("flex gap-4", compact ? "p-4" : "p-5")}>
        {issue.images && !compact && (
          <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 sm:block">
            <Image src={issue.images.heat} alt={`${issue.title} deviation`} fill sizes="112px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <span className="font-mono text-[11px] text-mist-400">{issue.id}</span>
          </div>
          <h3 className="mt-2 font-medium text-white">{issue.title}</h3>
          <p className="mt-0.5 text-xs text-mist-400">{issue.location}</p>
          {!compact && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-mist-400">Expected</p>
                <p className="mt-0.5 text-mist-200">{issue.expected}</p>
              </div>
              <div>
                <p className="text-mist-400">Actual</p>
                <p className="mt-0.5 text-white">{issue.actual}</p>
              </div>
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm font-semibold text-white">{issue.deviation}</p>
          <p className="mt-1 text-[11px] text-mist-400">{issue.confidence}% conf.</p>
        </div>
      </div>
    </article>
  );
}
