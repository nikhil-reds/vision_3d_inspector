import Image from "next/image";
import Link from "next/link";
import { modeMeta, type Project } from "@/lib/data";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";

export function RecentProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Recent projects</h2>
          <p className="mt-0.5 text-xs text-mist-400">Latest inspections across your workspace</p>
        </div>
        <Link href="/projects" className="flex items-center gap-1 text-xs font-medium text-accent-300 hover:text-accent-300/80">
          View all <Icon name="arrowRight" size={13} />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y border-white/[0.06] bg-white/[0.015] font-mono text-[10px] uppercase tracking-[0.16em] text-mist-400">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Mode</th>
              <th className="px-3 py-3 font-medium">Match</th>
              <th className="px-3 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {projects.map((p) => (
              <tr key={p.id} className="group transition-colors hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <Link href={`/projects/${p.id}`} className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                      <Image src={p.thumbnail} alt={p.name} fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white group-hover:text-accent-300">{p.name}</p>
                      <p className="truncate text-xs text-mist-400">{p.client}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-3.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-3 py-3.5 text-mist-300">{modeMeta[p.mode].short}</td>
                <td className="px-3 py-3.5 font-mono text-white tabular-nums">{p.matchScore ? `${p.matchScore}%` : <span className="text-mist-400">—</span>}</td>
                <td className="w-36 px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={p.progress} size="sm" tone={p.status === "processing" ? "violet" : "accent"} />
                    <span className="w-8 text-right font-mono text-[11px] text-mist-400">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-xs text-mist-400">{p.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06] md:hidden">
        {projects.map((p) => (
          <li key={p.id}>
            <Link href={`/projects/${p.id}`} className="flex items-center gap-3 px-5 py-4">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10">
                <Image src={p.thumbnail} alt={p.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{p.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-mist-400">{p.updatedAt}</span>
                </div>
              </div>
              <Icon name="chevronRight" size={16} className="text-mist-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
