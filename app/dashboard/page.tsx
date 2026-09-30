import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { activity, dashboardStats, projects, severityMeta, type Severity } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentProjectsTable } from "@/components/dashboard/RecentProjectsTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ThroughputChart } from "@/components/dashboard/ThroughputChart";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Dashboard" };

const accents = ["cyan", "emerald", "violet", "amber"] as const;

const severityCounts: { severity: Severity; count: number }[] = [
  { severity: "critical", count: 9 },
  { severity: "high", count: 24 },
  { severity: "medium", count: 41 },
  { severity: "low", count: 55 },
];

export default function DashboardPage() {
  const processing = projects.find((p) => p.status === "processing")!;
  const totalSev = severityCounts.reduce((s, c) => s + c.count, 0);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Inspection control center"
        description="Monitor every reference model, capture session and deviation analysis across your fabrication floor."
        actions={
          <>
            <Button variant="secondary" icon="download">Export</Button>
            <Button href="/projects/new" icon="plus">New inspection</Button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((s, i) => (
          <StatCard key={s.id} label={s.label} value={s.value} delta={s.delta} trend={s.trend} invert={s.id === "issues"} hint={s.hint} icon={s.icon} spark={s.spark} accent={accents[i]} />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ThroughputChart />
        </div>

        {/* Live analysis */}
        <div className="panel relative overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Running now</h2>
            <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[11px] font-medium text-violet-300 ring-1 ring-inset ring-violet-400/25">Step 4 of 6</span>
          </div>
          <Link href={`/projects/${processing.id}/analysis`} className="group mt-4 block">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl ring-1 ring-white/10">
              <Image src={processing.thumbnail} alt={processing.name} fill sizes="(min-width:1280px) 30vw, 90vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
              <div className="absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent-300 to-transparent shadow-[0_0_18px_rgba(79,220,244,0.9)]" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-medium text-white">{processing.name}</p>
                <p className="text-xs text-mist-300">Comparing design · aligning reconstruction</p>
              </div>
            </div>
          </Link>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-mist-400">Overall progress</span>
            <span className="font-mono text-white">{processing.progress}%</span>
          </div>
          <ProgressBar value={processing.progress} tone="violet" className="mt-2" />
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <p className="mb-3 text-xs font-medium text-mist-300">Issue severity · last 30 days</p>
            <div className="flex h-2 overflow-hidden rounded-full">
              {severityCounts.map((s) => (
                <div key={s.severity} style={{ width: `${(s.count / totalSev) * 100}%`, background: severityMeta[s.severity].color }} className="opacity-80" />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {severityCounts.map((s) => (
                <div key={s.severity}>
                  <p className="font-mono text-sm text-white">{s.count}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-mist-400">
                    <span className="size-1.5 rounded-full" style={{ background: severityMeta[s.severity].color }} />
                    {severityMeta[s.severity].label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentProjectsTable projects={projects.slice(0, 6)} />
        </div>
        <ActivityFeed items={activity} />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: "cube" as const, title: "Upload a reference model", text: "GLB, GLTF, OBJ, FBX or STL up to 250 MB.", href: `/projects/${projects[0].id}/model` },
          { icon: "camera" as const, title: "Start guided capture", text: "Five-angle capture with on-screen framing guides.", href: `/projects/${projects[0].id}/capture` },
          { icon: "file" as const, title: "Review latest report", text: "HB-220 · 5 issues including 1 critical.", href: `/projects/${projects[0].id}/report` },
        ].map((q) => (
          <Link key={q.title} href={q.href} className="panel group flex items-center gap-4 p-4 transition-colors hover:border-accent-400/25">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-accent-300 ring-1 ring-inset ring-white/10 group-hover:bg-accent-400/10">
              <Icon name={q.icon} size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">{q.title}</span>
              <span className="block truncate text-xs text-mist-400">{q.text}</span>
            </span>
            <Icon name="arrowRight" size={16} className="text-mist-400 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-300" />
          </Link>
        ))}
      </section>
    </>
  );
}
