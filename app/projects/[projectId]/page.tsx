import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { analysisSteps, captureAngles, getProject, issues, modelInfo } from "@/lib/data";
import { IssueCard } from "@/components/analysis/IssueCard";
import { ReportSummary } from "@/components/report/ReportSummary";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = getProject(projectId);
  if (!project) notFound();
  const base = `/projects/${project.id}`;
  const captured = captureAngles.filter((c) => c.captured).length;

  const quickActions: { label: string; hint: string; icon: IconName; href: string }[] = [
    { label: "Replace reference model", hint: "Upload a new CAD revision", icon: "cube", href: `${base}/model` },
    { label: "Continue photo capture", hint: `${captureAngles.length - captured} angles remaining`, icon: "camera", href: `${base}/capture` },
    { label: "Re-run analysis", hint: "Uses current model & photos", icon: "refresh", href: `${base}/analysis` },
    { label: "Open inspection report", hint: "Share or export PDF", icon: "file", href: `${base}/report` },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      {/* Left / main column */}
      <div className="space-y-6 xl:col-span-2">
        <p className="panel p-5 text-sm leading-relaxed text-mist-300">{project.description}</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Reference model card */}
          <section className="panel flex flex-col overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.06]">
              <Image src="/images/models/reference-iso.jpg" alt="Reference model render" fill sizes="(min-width:1280px) 30vw, (min-width:768px) 45vw, 90vw" className="object-cover" />
              <div className="hud-corners pointer-events-none absolute inset-4 opacity-50" />
              <span className="absolute left-4 top-4 rounded-md bg-ink-950/70 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-300 backdrop-blur">Reference · Rev C</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-white">Reference model</h2>
                  <p className="mt-0.5 truncate font-mono text-xs text-mist-400">{modelInfo.fileName}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                  <Icon name="check" size={11} /> Validated
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
                {[["W", modelInfo.width], ["H", modelInfo.height], ["D", modelInfo.depth]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-ink-950/40 p-2.5 ring-1 ring-inset ring-white/[0.05]">
                    <dt className="text-mist-400">{k}</dt>
                    <dd className="mt-0.5 font-mono text-white">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-auto pt-4">
                <Button href={`${base}/model`} variant="secondary" size="sm" iconRight="arrowRight" className="w-full">Open model</Button>
              </div>
            </div>
          </section>

          {/* Real photos card */}
          <section className="panel flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-white">Real photos</h2>
                <p className="mt-0.5 text-xs text-mist-400">Guided capture · 5 required angles</p>
              </div>
              <span className="font-mono text-sm text-white">
                {captured}<span className="text-mist-400">/{captureAngles.length}</span>
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {captureAngles.map((c, i) => (
                <Link key={c.id} href={`${base}/capture`} className={cn("group relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10", i === 0 && "col-span-2 row-span-2")}>
                  {c.captured ? (
                    <Image src={c.image} alt={c.label} fill sizes="200px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 border border-dashed border-white/10 bg-ink-900/60 text-mist-400">
                      <Icon name="camera" size={16} />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-ink-950/70 px-1.5 py-0.5 font-mono text-[9px] uppercase text-mist-200 backdrop-blur">{c.short}</span>
                </Link>
              ))}
            </div>
            <ProgressBar value={(captured / captureAngles.length) * 100} className="mt-4" />
            <div className="mt-auto pt-4">
              <Button href={`${base}/capture`} variant="secondary" size="sm" iconRight="arrowRight" className="w-full">Continue capture</Button>
            </div>
          </section>
        </div>

        {/* Analysis status */}
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-white">Analysis status</h2>
              <p className="mt-0.5 text-xs text-mist-400">Last run Sep 30, 2026 · 10:18 · 4m 41s</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
              <Icon name="checkCircle" size={13} /> Completed
            </span>
          </div>
          <ol className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {analysisSteps.map((s, i) => (
              <li key={s.id} className="relative rounded-xl bg-ink-950/40 p-3 ring-1 ring-inset ring-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-mist-400">0{i + 1}</span>
                  <Icon name="check" size={13} className="text-emerald-300" />
                </div>
                <p className="mt-2 text-xs font-medium text-white">{s.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-mist-400">{s.duration}</p>
                <div className="mt-2 h-0.5 rounded-full bg-emerald-400/60" />
              </li>
            ))}
          </ol>
        </section>

        {/* Detected issues */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">
              Detected issues <span className="ml-1 font-mono text-sm text-mist-400">{issues.length}</span>
            </h2>
            <Link href={`${base}/report`} className="flex items-center gap-1 text-xs font-medium text-accent-300 hover:underline">
              Full list <Icon name="arrowRight" size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {issues.slice(0, 3).map((i) => (
              <IssueCard key={i.id} issue={i} />
            ))}
          </div>
        </section>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Inspection summary</h2>
          <ReportSummary compact />
        </div>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-white">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href} className="group flex items-center gap-3 rounded-xl p-2.5 ring-1 ring-inset ring-transparent transition hover:bg-white/[0.03] hover:ring-white/[0.07]">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.04] text-accent-300 ring-1 ring-inset ring-white/10">
                  <Icon name={a.icon} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-white">{a.label}</span>
                  <span className="block truncate text-xs text-mist-400">{a.hint}</span>
                </span>
                <Icon name="chevronRight" size={15} className="text-mist-400 group-hover:text-accent-300" />
              </Link>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-white">Project details</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Project code", project.code],
              ["Owner", project.owner],
              ["Created", project.createdAt],
              ["Client", project.client],
              ["Part type", project.type],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-mist-400">{k}</dt>
                <dd className="truncate text-right text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
