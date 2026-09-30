import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { captureAngles, getProject, issues, modelInfo, reportSummary } from "@/lib/data";
import { ReportSummary } from "@/components/report/ReportSummary";
import { ComparisonCard } from "@/components/report/ComparisonCard";
import { IssueList } from "@/components/report/IssueList";
import { ReportActions } from "@/components/report/ReportActions";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Inspection report" };

export default async function ReportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = getProject(projectId);
  if (!project) notFound();
  const s = reportSummary;

  const cards: { label: string; value: string; sub: string; icon: IconName; tone: string }[] = [
    { label: "Overall match", value: `${s.overallScore}%`, sub: "Target ≥ 95%", icon: "target", tone: "text-accent-300" },
    { label: "Issues found", value: String(issues.length), sub: "1 critical · 1 high", icon: "alert", tone: "text-amber-300" },
    { label: "Mean deviation", value: s.meanDeviation, sub: `Tolerance ${s.tolerance}`, icon: "ruler", tone: "text-violet-300" },
    { label: "Photos analyzed", value: String(s.photos), sub: `${s.coverage} coverage`, icon: "camera", tone: "text-sky-300" },
    { label: "Confidence", value: s.confidence, sub: "Model-weighted", icon: "shield", tone: "text-emerald-300" },
    { label: "Processing time", value: s.duration, sub: "Precision mode", icon: "clock", tone: "text-mist-200" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-400">Report · RPT-{project.code}-0930</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Final inspection report</h2>
          <p className="mt-1 text-sm text-mist-400">
            Inspected by {s.inspector} · {s.inspectedAt} · Reference {modelInfo.fileName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReportActions />
        </div>
      </div>

      <ReportSummary />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="panel p-4">
            <Icon name={c.icon} size={17} className={c.tone} />
            <p className="mt-3 font-mono text-xl font-semibold text-white">{c.value}</p>
            <p className="text-xs text-mist-300">{c.label}</p>
            <p className="mt-1 text-[11px] text-mist-400">{c.sub}</p>
          </div>
        ))}
      </section>

      <ComparisonCard />

      <IssueList />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2">
          <h2 className="font-semibold text-white">Capture evidence</h2>
          <p className="mt-0.5 text-xs text-mist-400">Photos used for reconstruction and comparison.</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {captureAngles.map((c) => (
              <figure key={c.id} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10">
                <Image src={c.image} alt={c.label} fill sizes="(min-width:640px) 14vw, 30vw" className="object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent px-2 pb-1.5 pt-4 text-[10px] text-mist-200">{c.short}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="font-semibold text-white">Recommended actions</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {[
              "Weld missing right gusset plate per drawing HB-220-04.",
              "Re-position top shelf to nominal; verify with fixture.",
              "Rework centre boss or scrap — check machining offset.",
              "Accept hole shift with slotted washer (MRB note).",
            ].map((a, i) => (
              <li key={a} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-[11px] text-accent-300">{i + 1}</span>
                <span className="text-mist-300">{a}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/80 to-rose-400/70 text-xs font-semibold text-ink-950">PR</div>
            <div className="text-xs">
              <p className="text-white">Pending sign-off</p>
              <p className="text-mist-400">{s.inspector} · QA Lead</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
