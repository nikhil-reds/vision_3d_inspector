"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { projects } from "@/lib/data";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "./Logo";

const nav: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", match: (p) => p === "/dashboard" },
  { href: "/projects", label: "Projects", icon: "folder", match: (p) => p === "/projects" || (p.startsWith("/projects/") && !p.startsWith("/projects/new")) },
  { href: "/projects/new", label: "New inspection", icon: "plus", match: (p) => p === "/projects/new" },
  { href: "/settings", label: "Settings", icon: "settings", match: (p) => p.startsWith("/settings") },
];

const pinned = projects.slice(0, 3);

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} aria-hidden />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-y-auto border-r border-white/[0.06] bg-ink-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo href="/dashboard" />
          <button onClick={onClose} className="rounded-lg p-2 text-mist-400 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Close navigation">
            <Icon name="x" />
          </button>
        </div>

        <div className="px-4 pt-2">
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400/30 to-violet-500/20 font-mono text-xs font-semibold text-white ring-1 ring-white/10">NW</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Northwind QA Lab</p>
              <p className="truncate text-xs text-mist-400">Pro workspace · 6 seats</p>
            </div>
            <Icon name="chevronDown" size={15} className="text-mist-400" />
          </div>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-400/70">Workspace</p>
          {nav.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white/[0.06] text-white" : "text-mist-400 hover:bg-white/[0.03] hover:text-mist-200"
                )}
              >
                {active && <span className="absolute inset-y-2 -left-3 w-[3px] rounded-r-full bg-accent-400 shadow-[0_0_12px_rgba(79,220,244,0.9)]" />}
                <Icon name={item.icon} size={18} className={cn(active ? "text-accent-300" : "text-mist-400 group-hover:text-mist-200")} />
                {item.label}
                {item.href === "/projects" && <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-mist-400">{projects.length}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 px-3">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist-400/70">Pinned</p>
          <div className="space-y-0.5">
            {pinned.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  pathname.startsWith(`/projects/${p.id}`) ? "text-white" : "text-mist-400 hover:text-mist-200"
                )}
              >
                <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-accent-400/80">{p.code}</span>
                <span className="truncate">{p.name.replace(`${p.code} `, "")}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl border border-accent-400/15 bg-gradient-to-br from-accent-500/10 via-transparent to-violet-500/10 p-4">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
            <div className="relative">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Inspection credits</span>
                <span className="font-mono text-mist-300">184 / 250</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-accent-500 to-accent-300" />
              </div>
              <p className="mt-3 text-xs text-mist-400">Resets on Oct 1, 2026</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/80 to-rose-400/70 text-xs font-semibold text-ink-950">PR</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Priya Raman</p>
              <p className="truncate text-xs text-mist-400">QA Lead</p>
            </div>
            <Link href="/" className="rounded-lg p-1.5 text-mist-400 hover:bg-white/5 hover:text-white" aria-label="Back to site">
              <Icon name="logout" size={16} />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
