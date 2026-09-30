"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { seg: string; label: string; icon: IconName }[] = [
  { seg: "", label: "Overview", icon: "dashboard" },
  { seg: "model", label: "Reference model", icon: "cube" },
  { seg: "capture", label: "Photo capture", icon: "camera" },
  { seg: "analysis", label: "Analysis", icon: "activity" },
  { seg: "report", label: "Report", icon: "file" },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/projects/${projectId}`;
  return (
    <nav className="-mx-4 mb-8 overflow-x-auto border-b border-white/[0.07] px-4 sm:mx-0 sm:px-0" aria-label="Project sections">
      <ol className="flex min-w-max gap-1">
        {items.map((it, i) => {
          const href = it.seg ? `${base}/${it.seg}` : base;
          const active = pathname === href;
          return (
            <li key={it.seg}>
              <Link
                href={href}
                className={cn(
                  "relative flex items-center gap-2 px-3 pb-3.5 pt-1 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-mist-400 hover:text-mist-200"
                )}
              >
                <span className={cn("flex size-6 items-center justify-center rounded-md font-mono text-[10px]", active ? "bg-accent-400/15 text-accent-300" : "bg-white/[0.04] text-mist-400")}>
                  {i === 0 ? <Icon name={it.icon} size={13} /> : `0${i}`}
                </span>
                {it.label}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-400 shadow-[0_0_12px_rgba(79,220,244,0.8)]" />}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
