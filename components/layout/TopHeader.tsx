"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { activity } from "@/lib/data";
import { Icon } from "@/components/ui/Icon";

export function TopHeader({ onMenu }: { onMenu: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setNotifOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-ink-950/75 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button onClick={onMenu} className="rounded-lg p-2 text-mist-300 hover:bg-white/5 hover:text-white lg:hidden" aria-label="Open navigation">
        <Icon name="menu" size={20} />
      </button>

      <div className="relative max-w-md flex-1">
        <Icon name="search" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mist-400" />
        <input
          type="search"
          placeholder="Search projects, issues, reports…"
          className="h-10 w-full rounded-xl bg-white/[0.04] pl-10 pr-14 text-sm text-white ring-1 ring-inset ring-white/[0.07] placeholder:text-mist-400/80 focus:outline-none focus:ring-accent-400/50"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-mist-400 sm:flex">
          <Icon name="command" size={10} />K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="mr-2 hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-xs text-emerald-300 md:flex">
          <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          Engine online
        </div>
        <Link href="/settings" className="hidden rounded-xl p-2.5 text-mist-400 hover:bg-white/5 hover:text-white sm:inline-flex" aria-label="Help">
          <Icon name="help" />
        </Link>
        <div ref={ref} className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setUnread(0);
            }}
            className={cn("relative rounded-xl p-2.5 text-mist-400 hover:bg-white/5 hover:text-white", notifOpen && "bg-white/5 text-white")}
            aria-label="Notifications"
          >
            <Icon name="bell" />
            {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-accent-400 ring-2 ring-ink-950" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-ink-750/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <span className="text-xs text-mist-400">All caught up</span>
              </div>
              <ul className="max-h-80 overflow-auto p-2">
                {activity.slice(0, 4).map((a) => (
                  <li key={a.id} className="rounded-xl px-3 py-2.5 hover:bg-white/[0.04]">
                    <p className="text-sm text-white">{a.title}</p>
                    <p className="mt-0.5 text-xs text-mist-400">{a.detail}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-mist-400/70">{a.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="ml-1 flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/80 to-rose-400/70 text-xs font-semibold text-ink-950 ring-2 ring-white/10">PR</div>
      </div>
    </header>
  );
}
