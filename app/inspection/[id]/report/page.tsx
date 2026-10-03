/* eslint-disable @next/next/no-img-element -- pipeline images are created at runtime under public/ */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { isInspectionId, readReport, readStatus } from "@/lib/inspection/server";
import type { Verdict } from "@/lib/inspection/types";

export const metadata: Metadata = { title: "Inspection report" };

const verdictStyle: Record<Verdict, { tone: string; icon: IconName; text: string }> = {
  PASS: { tone: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30", icon: "checkCircle", text: "Within tolerance" },
  REVIEW: { tone: "bg-amber-400/10 text-amber-300 ring-amber-400/30", icon: "alert", text: "Needs engineering review" },
  FAIL: { tone: "bg-rose-500/10 text-rose-300 ring-rose-400/30", icon: "x", text: "Out of tolerance" },
};

const mm = (v: number) => `${v.toFixed(2)} mm`;

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm text-mist-300">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-accent-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function InspectionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isInspectionId(id)) notFound();
  const report = await readReport(id);
  if (!report) {
    if (await readStatus(id)) redirect(`/inspection/${id}/processing`);
    notFound();
  }
  const { meta, result, gemini } = report;
  const m = result.metrics;
  const v = verdictStyle[result.status];

  const measurements: { label: string; value: string; hint?: string }[] = [
    { label: "Mean deviation", value: mm(m.meanDeviationMm), hint: result.verdictMetric === "meanDeviationMm" ? "Verdict metric" : undefined },
    { label: "Maximum deviation", value: mm(m.maxDeviationMm) },
    { label: "RMSE", value: mm(m.rmseMm) },
    { label: "Chamfer distance", value: mm(m.chamferDistanceMm) },
    { label: "Hausdorff distance", value: mm(m.hausdorffDistanceMm) },
    { label: "Outside tolerance", value: `${m.outsideTolerancePercentage.toFixed(1)} %`, hint: `> ±${result.thresholds.toleranceMm} mm` },
  ];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      {/* Inspection information */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-400">Inspection report</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">{meta?.projectName ?? result.projectName ?? "Inspection"}</h1>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-mist-400">
            <div>
              <dt className="inline">ID </dt>
              <dd className="inline font-mono text-xs text-mist-300">{id}</dd>
            </div>
            <div>
              <dt className="inline">Date </dt>
              <dd className="inline text-mist-300">{new Date(result.completedAt).toLocaleString()}</dd>
            </div>
            {meta && (
              <div>
                <dt className="inline">Model </dt>
                <dd className="inline text-mist-300">
                  {meta.modelFileName}
                  {meta.modelFormat === "obj" && ` (${meta.modelUnit})`}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <Button href="/" icon="plus" variant="secondary">
          New inspection
        </Button>
      </div>

      {/* Overall result */}
      <section className={cn("flex flex-col gap-4 rounded-2xl p-6 ring-1 ring-inset sm:flex-row sm:items-center", v.tone)}>
        <Icon name={v.icon} size={40} />
        <div className="flex-1">
          <p className="text-3xl font-semibold tracking-tight">{result.status}</p>
          <p className="text-sm opacity-90">{v.text}</p>
        </div>
        <p className="max-w-sm text-xs text-mist-300">
          {result.status} because mean deviation is {mm(m.meanDeviationMm)}. Testing thresholds: PASS &lt; {result.thresholds.passMm} mm, FAIL &gt;{" "}
          {result.thresholds.failMm} mm. Alignment fitness {result.alignment.fitness.toFixed(2)}.
        </p>
      </section>

      {/* Measurements */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {measurements.map((x) => (
          <div key={x.label} className="panel p-4">
            <p className="font-mono text-xl font-semibold text-white">{x.value}</p>
            <p className="mt-1 text-xs text-mist-300">{x.label}</p>
            {x.hint && <p className="mt-0.5 text-[11px] text-mist-400">{x.hint}</p>}
          </div>
        ))}
      </section>

      {/* Visual comparison */}
      <section className="panel space-y-4 p-6">
        <h2 className="font-semibold text-white">Visual comparison</h2>
        <img src={result.files.heatmap} alt="Deviation heatmap across all four views" className="w-full rounded-xl" />
        <div className="space-y-4">
          {result.files.views.map((view, i) => (
            <div key={view} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { src: view, label: `Photo ${i + 1}` },
                { src: result.files.renders[i], label: "Rendered model" },
                { src: result.files.heatmaps[i], label: "Deviation" },
              ].map((img) => (
                <figure key={img.label} className="overflow-hidden rounded-xl bg-ink-800 ring-1 ring-inset ring-white/10">
                  <img src={img.src} alt={`${img.label}, view ${i + 1}`} className="aspect-[4/3] w-full object-contain" />
                  <figcaption className="px-3 py-2 text-xs text-mist-400">{img.label}</figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Deviation regions */}
      {result.deviationRegions.length > 0 && (
        <section className="panel p-6">
          <h2 className="font-semibold text-white">Deviation regions</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-mist-400">
                <tr>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Mean</th>
                  <th className="py-2 pr-4 font-medium">Max</th>
                  <th className="py-2 font-medium">Share of points</th>
                </tr>
              </thead>
              <tbody className="text-mist-200">
                {result.deviationRegions.map((r, i) => (
                  <tr key={i} className="border-t border-white/[0.06]">
                    <td className="py-2 pr-4 capitalize">{r.location}</td>
                    <td className="py-2 pr-4 font-mono">{mm(r.meanDeviationMm)}</td>
                    <td className="py-2 pr-4 font-mono">{mm(r.maxDeviationMm)}</td>
                    <td className="py-2 font-mono">{r.pointShare.toFixed(1)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Gemini report */}
      <section className="panel space-y-5 p-6">
        <div className="flex items-center gap-2">
          <Icon name="sparkle" size={18} className="text-accent-300" />
          <h2 className="font-semibold text-white">Analysis</h2>
          {gemini?.available && <span className="font-mono text-[11px] text-mist-400">{gemini.model}</span>}
        </div>
        {gemini?.available ? (
          <>
            <p className="text-sm leading-relaxed text-mist-200">{gemini.summary}</p>
            <div className="grid gap-6 md:grid-cols-2">
              <ListSection title="Key findings" items={gemini.keyFindings} />
              <ListSection title="Affected areas" items={gemini.affectedAreas} />
              <ListSection title="Possible causes" items={gemini.possibleCauses} />
              <ListSection title="Recommendations" items={gemini.recommendations} />
              <ListSection title="Limitations" items={gemini.limitations} />
            </div>
          </>
        ) : (
          <div className="text-sm text-mist-300">
            <p>Geometric analysis completed.</p>
            <p>Gemini explanation unavailable.</p>
            {gemini && !gemini.available && <p className="mt-2 text-xs text-mist-400">{gemini.error}</p>}
          </div>
        )}
      </section>

      <p className="text-xs text-mist-400">
        Measurements come from the geometric pipeline. The reconstruction scale is estimated by aligning to the reference model, so millimetre values are
        relative to the design size. The PASS/REVIEW/FAIL thresholds are for testing only.
      </p>
    </main>
  );
}
