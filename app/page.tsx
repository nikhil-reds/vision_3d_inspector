import Image from "next/image";
import Link from "next/link";
import { analysisSteps, issues, severityMeta } from "@/lib/data";
import { LandingNav } from "@/components/landing/LandingNav";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { modeDetails } from "@/lib/modes";
import { cn } from "@/lib/cn";

const howItWorks: { icon: IconName; title: string; text: string }[] = [
  { icon: "cube", title: "Upload the design", text: "Drop in the reference 3D model — GLB, GLTF, OBJ, FBX or STL. Scale and units are detected automatically." },
  { icon: "camera", title: "Capture the build", text: "A guided five-angle capture flow tells you exactly where to stand. Any modern phone camera works." },
  { icon: "scan", title: "Run the analysis", text: "Photos are reconstructed, aligned to the design and compared surface-by-surface against tolerance." },
  { icon: "file", title: "Review the report", text: "Get a match score, a deviation heatmap and a ranked list of issues with expected vs actual values." },
];

const features: { icon: IconName; title: string; text: string }[] = [
  { icon: "flame", title: "Deviation heatmaps", text: "See exactly where the build drifts from the design, colour-coded in millimetres." },
  { icon: "alert", title: "Missing feature detection", text: "Gussets, holes, ribs and fasteners that were never fabricated are flagged instantly." },
  { icon: "ruler", title: "Dimensional checks", text: "Heights, offsets and hole positions measured against drawing tolerances." },
  { icon: "camera", title: "Guided capture", text: "On-screen framing guides, level indicator and quality checks for every shot." },
  { icon: "shield", title: "Confidence scoring", text: "Every finding carries a confidence value so reviewers know what to trust." },
  { icon: "share", title: "Shareable reports", text: "Audit-ready reports your supplier, client or MRB can act on immediately." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      <LandingNav />

      {/* ---------------- Hero ---------------- */}
      <section className="relative pt-28 pb-16 sm:pt-36 lg:pb-24">
        <div className="bg-grid-fade pointer-events-none absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent-500/[0.12] blur-[140px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_1.1fr] lg:px-8">
          <div className="animate-fade-up">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-accent-400/25 bg-accent-400/[0.06] py-1 pl-1 pr-3 text-xs text-accent-300 transition hover:border-accent-400/40">
              <span className="rounded-full bg-accent-400 px-2 py-0.5 font-semibold text-ink-950">New</span>
              Precision mode with per-surface heatmaps
              <Icon name="arrowRight" size={12} />
            </Link>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Inspect what you built <span className="text-gradient">against what you designed.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist-400">
              Vision3D Inspector compares your 3D design model with photos of the real, fabricated object — and shows every missing feature, offset and deviation in minutes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/projects/new" size="lg" icon="plus">Start an inspection</Button>
              <Button href="/projects/hb-220-hydraulic-bracket/report" size="lg" variant="secondary" icon="eye">View sample report</Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/[0.07] pt-6">
              {[
                ["±0.5 mm", "Precision tolerance"],
                ["< 5 min", "Photo to report"],
                ["5 photos", "From any phone"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-mono text-xl font-semibold text-white sm:text-2xl">{v}</dt>
                  <dd className="mt-1 text-xs text-mist-400">{k}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero viewport */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-accent-400/20 via-transparent to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-900 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                  <span className="size-2.5 rounded-full bg-white/15" />
                </div>
                <span className="font-mono text-[11px] text-mist-400">hb220_bracket_rev_c.glb</span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                  <span className="size-1.5 animate-pulse-soft rounded-full bg-emerald-400" /> Live
                </span>
              </div>
              <div className="relative aspect-[16/11]">
                <Image src="/images/landing/hero-model.jpg" alt="Reference 3D model of a hydraulic mounting bracket in a CAD viewport" fill priority sizes="(min-width:1024px) 55vw, 95vw" className="object-cover" />
                <div className="absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-accent-300 to-transparent shadow-[0_0_24px_rgba(79,220,244,1)]" />
                <div className="hud-corners pointer-events-none absolute inset-6 opacity-50" />
                <div className="absolute left-5 top-5 font-mono text-[10px] uppercase leading-5 tracking-wider text-mist-300">
                  <p className="text-accent-300">Scan · Precision</p>
                  <p>Pts 1,284,902</p>
                  <p>RMS 0.84 mm</p>
                </div>
                <Image src="/icons/axis-gizmo.svg" alt="" width={56} height={56} className="absolute bottom-4 left-4 opacity-90" />
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -left-3 top-1/3 hidden animate-float rounded-2xl border border-white/10 bg-ink-800/90 p-3 shadow-2xl backdrop-blur-xl sm:block lg:-left-10">
              <p className="text-[10px] uppercase tracking-wider text-mist-400">Overall match</p>
              <p className="mt-0.5 font-mono text-2xl font-semibold text-white">87.6<span className="text-sm text-mist-400">%</span></p>
              <div className="mt-2 h-1 w-28 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[87.6%] rounded-full bg-accent-400" /></div>
            </div>
            <div className="absolute -right-3 bottom-10 hidden animate-float rounded-2xl border border-white/10 bg-ink-800/90 p-3 shadow-2xl backdrop-blur-xl [animation-delay:1.5s] sm:block lg:-right-8">
              <p className="mb-2 text-[10px] uppercase tracking-wider text-mist-400">Detected issues</p>
              <ul className="space-y-1.5">
                {issues.slice(0, 3).map((i) => (
                  <li key={i.id} className="flex items-center gap-2 text-xs text-white">
                    <span className="size-1.5 rounded-full" style={{ background: severityMeta[i.severity].color }} />
                    {i.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-mist-400/70">Built for fabrication, QA and supplier quality teams</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center text-sm font-medium text-mist-400 sm:grid-cols-3 lg:grid-cols-6">
            {["Steel fabrication", "Sheet metal", "Machining", "Welded assemblies", "Castings", "Contract manufacturing"].map((s) => (
              <span key={s} className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-3">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Product explanation ---------------- */}
      <section id="product" className="relative scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <SectionHeading
              align="left"
              eyebrow="The product"
              title={<>From CAD file to <span className="text-gradient">proof of build.</span></>}
              description="Fabricated parts rarely match their drawings exactly. Vision3D Inspector turns a handful of photos into a registered 3D comparison against your design, so you catch missing gussets, misplaced holes and out-of-tolerance features before parts ship."
            />
            <div className="grid grid-cols-3 gap-3">
              {[
                { src: "/images/landing/wireframe.jpg", label: "Design", sub: "Reference model", tone: "text-accent-300" },
                { src: "/images/landing/photo-capture.jpg", label: "Reality", sub: "Captured photos", tone: "text-amber-300" },
                { src: "/images/landing/deviation-map.jpg", label: "Insight", sub: "Deviation map", tone: "text-rose-300" },
              ].map((c, i) => (
                <figure key={c.label} className={cn("panel overflow-hidden", i === 1 && "translate-y-6")}>
                  <div className="relative aspect-[3/4]">
                    <Image src={c.src} alt={c.sub} fill sizes="(min-width:1024px) 20vw, 32vw" className="object-cover" />
                  </div>
                  <figcaption className="p-3">
                    <p className={cn("font-mono text-[10px] uppercase tracking-wider", c.tone)}>0{i + 1} · {c.label}</p>
                    <p className="mt-0.5 text-xs text-mist-300 sm:text-sm">{c.sub}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how-it-works" className="relative scroll-mt-20 border-y border-white/[0.05] bg-ink-900/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How it works" title="Four steps. No scanner required." description="Everything runs from a browser and a phone camera — no turntables, markers or metrology hardware." />
          <ol className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s, i) => (
              <li key={s.title} className="panel group relative overflow-hidden p-6 transition-colors hover:border-accent-400/25">
                <span className="absolute right-5 top-4 font-mono text-5xl font-semibold text-white/[0.04] transition-colors group-hover:text-accent-400/10">0{i + 1}</span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent-400/10 text-accent-300 ring-1 ring-inset ring-accent-400/20">
                  <Icon name={s.icon} size={20} />
                </span>
                <h3 className="mt-6 font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="relative scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Main features" title="Everything a QA engineer needs to sign off a part." />
          <div className="mt-14 grid gap-4 lg:grid-cols-3">
            <div className="panel relative flex flex-col overflow-hidden lg:row-span-3">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1">
                <Image src="/images/comparisons/deviation-heatmap.jpg" alt="Deviation heatmap of the inspected bracket" fill sizes="(min-width:1024px) 33vw, 95vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-850 via-transparent to-transparent" />
                {issues.filter((i) => i.marker).map((i, n) => (
                  <span key={i.id} className="absolute flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[9px] font-bold text-ink-950 ring-2 ring-ink-950" style={{ left: `${i.marker!.x}%`, top: `${i.marker!.y}%`, background: severityMeta[i.severity].color }}>
                    {n + 1}
                  </span>
                ))}
              </div>
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent-300">Surface comparison</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Millimetre-level deviation mapping</h3>
                <p className="mt-2 text-sm text-mist-400">Every visible surface is compared with the reference geometry. Hotspots link directly to the issue they caused.</p>
              </div>
            </div>
            {features.map((f) => (
              <div key={f.title} className="panel p-6 transition-colors hover:border-white/15">
                <Icon name={f.icon} size={20} className="text-accent-300" />
                <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm text-mist-400">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Workflow ---------------- */}
      <section id="workflow" className="relative scroll-mt-20 overflow-hidden border-y border-white/[0.05] bg-ink-900/50 py-20 sm:py-28">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="3D inspection workflow" title="A transparent pipeline, step by step." description="Each stage reports its own status and timing, so you always know what the engine is doing with your data." />
          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent lg:block" />
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
              {analysisSteps.map((s, i) => (
                <li key={s.id} className="relative">
                  <div className="relative mx-auto flex size-12 items-center justify-center rounded-2xl border border-accent-400/30 bg-ink-850 font-mono text-sm text-accent-300 shadow-[0_0_24px_rgba(79,220,244,0.15)] lg:mx-0">
                    0{i + 1}
                  </div>
                  <div className="mt-5 text-center lg:text-left">
                    <h3 className="font-semibold text-white">{s.label}</h3>
                    <p className="mt-1.5 text-sm text-mist-400">{s.detail}</p>
                    <p className="mt-2 font-mono text-[11px] text-mist-400/70">~{s.duration}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------- Modes ---------------- */}
      <section id="modes" className="relative scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Inspection modes" title="Quick inspection vs precision inspection" description="Choose speed for a go / no-go check on the shop floor, or precision for a full dimensional audit." />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {(["quick", "precision"] as const).map((m) => {
              const d = modeDetails[m];
              const featured = m === "precision";
              return (
                <div key={m} className={cn("relative overflow-hidden rounded-3xl border p-7 sm:p-8", featured ? "border-accent-400/30 bg-gradient-to-b from-accent-400/[0.07] to-transparent" : "border-white/10 bg-ink-850/60")}>
                  {featured && <span className="absolute right-6 top-6 rounded-full bg-accent-400 px-2.5 py-1 text-[11px] font-semibold text-ink-950">Recommended for release</span>}
                  <span className={cn("flex size-12 items-center justify-center rounded-2xl ring-1 ring-inset", featured ? "bg-accent-400/15 text-accent-300 ring-accent-400/30" : "bg-white/5 text-mist-200 ring-white/10")}>
                    <Icon name={d.icon} size={22} />
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold text-white">{d.title}</h3>
                  <p className="mt-2 text-mist-400">{d.tagline}</p>
                  <dl className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-ink-950/50 p-4 ring-1 ring-inset ring-white/[0.06]">
                    {d.specs.map((s) => (
                      <div key={s.label}>
                        <dt className="text-[10px] uppercase tracking-wider text-mist-400">{s.label}</dt>
                        <dd className="mt-1 font-mono text-lg text-white">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="mt-6 space-y-3">
                    {d.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-sm text-mist-200">
                        <span className={cn("flex size-5 items-center justify-center rounded-full", featured ? "bg-accent-400/15 text-accent-300" : "bg-white/5 text-mist-300")}>
                          <Icon name="check" size={12} strokeWidth={2.5} />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 border-t border-white/[0.06] pt-5 text-xs text-mist-400">
                    Best for: {m === "quick" ? "in-process checks, incoming goods, daily spot checks." : "first-article inspection, supplier audits, batch release."}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-accent-400/20 bg-ink-850">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-accent-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-10 size-96 rounded-full bg-violet-600/15 blur-[100px]" />
          <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ship parts you can prove are right.</h2>
              <p className="mt-4 max-w-lg text-mist-400">Create your first inspection project in under a minute. Upload a model, take five photos, get a report.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/projects/new" size="lg" icon="plus">Create a project</Button>
                <Button href="/dashboard" size="lg" variant="secondary" iconRight="arrowRight">Explore the dashboard</Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10">
              <Image src="/images/comparisons/actual.jpg" alt="Photo of the fabricated bracket" fill sizes="(min-width:1024px) 35vw, 90vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-ink-950/70 p-3 backdrop-blur">
                <div>
                  <p className="text-xs text-mist-400">HB-220 · Precision</p>
                  <p className="text-sm font-medium text-white">Rework required</p>
                </div>
                <span className="font-mono text-lg font-semibold text-accent-300">87.6%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-400">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/projects" className="hover:text-white">Projects</Link>
            <Link href="/projects/new" className="hover:text-white">New project</Link>
            <Link href="/settings" className="hover:text-white">Settings</Link>
          </nav>
          <p className="text-xs text-mist-400/70">© 2026 Vision3D Inspector · Frontend prototype</p>
        </div>
      </footer>
    </div>
  );
}
