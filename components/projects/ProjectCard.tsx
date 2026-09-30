import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { modeMeta, type Project } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";

function MatchChip({ score }: { score: number | null }) {
  if (score === null) return <span className="font-mono text-xs text-mist-400">— %</span>;
  const tone = score >= 95 ? "text-emerald-300" : score >= 85 ? "text-accent-300" : "text-amber-300";
  return <span className={cn("font-mono text-sm font-semibold tabular-nums", tone)}>{score.toFixed(1)}%</span>;
}

export function ProjectCard({ project: p, layout = "grid" }: { project: Project; layout?: "grid" | "list" }) {
  if (layout === "list") {
    return (
      <Link href={`/projects/${p.id}`} className="panel group flex flex-col gap-4 p-3 transition-all hover:border-white/15 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:p-3 sm:pr-5">
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 sm:aspect-[4/3] sm:w-32">
          <Image src={p.thumbnail} alt={p.name} fill sizes="(min-width:640px) 128px, 90vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-accent-400">{p.code}</span>
            <StatusBadge status={p.status} />
          </div>
          <p className="mt-1.5 truncate font-medium text-white group-hover:text-accent-300">{p.name}</p>
          <p className="mt-0.5 truncate text-xs text-mist-400">
            {p.client} · {p.type}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-xs sm:flex sm:items-center sm:gap-8">
          <div>
            <p className="text-mist-400">Mode</p>
            <p className="mt-1 text-mist-200">{modeMeta[p.mode].short}</p>
          </div>
          <div>
            <p className="text-mist-400">Match</p>
            <p className="mt-0.5"><MatchChip score={p.matchScore} /></p>
          </div>
          <div>
            <p className="text-mist-400">Issues</p>
            <p className="mt-1 font-mono text-mist-200">{p.issues}</p>
          </div>
          <div className="hidden w-28 lg:block">
            <p className="text-mist-400">Updated</p>
            <p className="mt-1 text-mist-200">{p.updatedAt}</p>
          </div>
        </div>
        <Icon name="chevronRight" size={18} className="hidden text-mist-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-300 sm:block" />
      </Link>
    );
  }

  return (
    <Link href={`/projects/${p.id}`} className="panel group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_20px_50px_-20px_rgba(28,195,224,0.25)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={p.thumbnail} alt={p.name} fill sizes="(min-width:1280px) 25vw, (min-width:768px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/10 to-transparent" />
        <div className="hud-corners pointer-events-none absolute inset-3 opacity-0 transition-opacity group-hover:opacity-60" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <StatusBadge status={p.status} className="bg-ink-950/60 backdrop-blur" />
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-ink-950/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-mist-200 backdrop-blur">
          {modeMeta[p.mode].short}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <span className="font-mono text-[11px] text-accent-300">{p.code}</span>
          <p className="truncate font-medium text-white">{p.name.replace(`${p.code} `, "")}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-3">
        <p className="truncate text-xs text-mist-400">{p.client}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-xs">
          <div>
            <p className="text-mist-400">Match</p>
            <p className="mt-0.5"><MatchChip score={p.matchScore} /></p>
          </div>
          <div>
            <p className="text-mist-400">Issues</p>
            <p className={cn("mt-1 font-mono", p.issues > 3 ? "text-amber-300" : "text-mist-200")}>{p.issues}</p>
          </div>
          <div>
            <p className="text-mist-400">Photos</p>
            <p className="mt-1 font-mono text-mist-200">{p.photos}/5</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={p.progress} size="sm" tone={p.status === "processing" ? "violet" : "accent"} />
          <span className="shrink-0 text-[11px] text-mist-400">{p.updatedAt}</span>
        </div>
      </div>
    </Link>
  );
}
