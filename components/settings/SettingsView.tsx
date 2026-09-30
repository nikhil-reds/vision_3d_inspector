"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { captureAngles, type InspectionMode } from "@/lib/data";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { Toast } from "@/components/ui/Toast";
import { Icon, type IconName } from "@/components/ui/Icon";

type Section = "general" | "display" | "inspection" | "appearance";

function Row({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        {description && <p className="mt-0.5 text-xs text-mist-400">{description}</p>}
      </div>
      <div className="shrink-0 sm:w-64 sm:[&>*]:ml-auto">{children}</div>
    </div>
  );
}

function Card({ title, description, icon, children }: { title: string; description: string; icon: IconName; children: ReactNode }) {
  return (
    <section className="panel p-5 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-400/10 text-accent-300 ring-1 ring-inset ring-accent-400/20">
          <Icon name={icon} size={18} />
        </span>
        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-sm text-mist-400">{description}</p>
        </div>
      </div>
      <div className="mt-4 divide-y divide-white/[0.06]">{children}</div>
    </section>
  );
}

const themes = [
  { id: "obsidian", label: "Obsidian", colors: ["#04060a", "#0d121c", "#4fdcf4"] },
  { id: "graphite", label: "Graphite", colors: ["#0b0b0d", "#18181b", "#a1a1aa"] },
  { id: "midnight", label: "Midnight", colors: ["#050816", "#0f1633", "#818cf8"] },
];
const accents = ["#4fdcf4", "#34d399", "#a78bfa", "#fbbf24", "#fb7185", "#60a5fa"];

export function SettingsView() {
  const [section, setSection] = useState<Section>("general");
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  // General
  const [workspace, setWorkspace] = useState("Northwind QA Lab");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc+5.5");
  const [units, setUnits] = useState("mm");
  const [notify, setNotify] = useState(true);
  // Display
  const [density, setDensity] = useState("comfortable");
  const [showGrid, setShowGrid] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [hud, setHud] = useState(true);
  const [defaultView, setDefaultView] = useState("iso");
  // Inspection
  const [mode, setMode] = useState<InspectionMode>("precision");
  const [tolerance, setTolerance] = useState(0.5);
  const [confidence, setConfidence] = useState(80);
  const [angles, setAngles] = useState<Record<string, boolean>>(() => Object.fromEntries(captureAngles.map((a) => [a.id, true])));
  const [autoStart, setAutoStart] = useState(false);
  // Appearance
  const [theme, setTheme] = useState("obsidian");
  const [accent, setAccent] = useState(accents[0]);
  const [radius, setRadius] = useState("rounded");

  const touch = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setDirty(true);
  };

  const nav: { id: Section; label: string; icon: IconName }[] = [
    { id: "general", label: "General", icon: "settings" },
    { id: "display", label: "Display", icon: "monitor" },
    { id: "inspection", label: "Inspection defaults", icon: "target" },
    { id: "appearance", label: "Appearance", icon: "palette" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Mobile tabs */}
      <div className="lg:hidden">
        <Tabs value={section} onChange={setSection} items={nav} size="sm" className="w-full" />
      </div>
      {/* Desktop side nav */}
      <nav className="hidden lg:block">
        <ul className="sticky top-24 space-y-1">
          {nav.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => setSection(n.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  section === n.id ? "bg-white/[0.06] text-white ring-1 ring-inset ring-white/10" : "text-mist-400 hover:bg-white/[0.03] hover:text-mist-200"
                )}
              >
                <Icon name={n.icon} size={17} className={section === n.id ? "text-accent-300" : ""} />
                {n.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-6">
        {section === "general" && (
          <Card title="General settings" description="Workspace identity, locale and notifications." icon="settings">
            <div className="py-5">
              <Field label="Workspace name" htmlFor="ws">
                <TextInput id="ws" value={workspace} onChange={(e) => touch(setWorkspace)(e.target.value)} />
              </Field>
            </div>
            <Row title="Language" description="Interface language for all members.">
              <Select value={language} onChange={touch(setLanguage)} align="right" options={[{ value: "en", label: "English (US)" }, { value: "de", label: "Deutsch" }, { value: "ja", label: "日本語" }, { value: "hi", label: "हिन्दी" }]} />
            </Row>
            <Row title="Time zone" description="Used for report timestamps.">
              <Select value={timezone} onChange={touch(setTimezone)} align="right" options={[{ value: "utc", label: "UTC" }, { value: "utc+1", label: "Central European (UTC+1)" }, { value: "utc+5.5", label: "India Standard (UTC+5:30)" }, { value: "utc-5", label: "Eastern (UTC−5)" }]} />
            </Row>
            <Row title="Measurement units" description="Displayed dimensions and deviations.">
              <Tabs size="sm" value={units} onChange={touch(setUnits)} items={[{ id: "mm", label: "Millimetres" }, { id: "in", label: "Inches" }]} />
            </Row>
            <Row title="Email notifications" description="Receive an email when an analysis completes.">
              <Toggle checked={notify} onChange={touch(setNotify)} label="Email notifications" />
            </Row>
          </Card>
        )}

        {section === "display" && (
          <Card title="Display preferences" description="How viewports, tables and overlays are presented." icon="monitor">
            <Row title="Interface density" description="Spacing in tables and lists.">
              <Tabs size="sm" value={density} onChange={touch(setDensity)} items={[{ id: "compact", label: "Compact" }, { id: "comfortable", label: "Comfortable" }]} />
            </Row>
            <Row title="Default model view" description="Camera used when opening a reference model.">
              <Select value={defaultView} onChange={touch(setDefaultView)} align="right" options={[{ value: "iso", label: "Isometric" }, { value: "front", label: "Front" }, { value: "side", label: "Side" }, { value: "top", label: "Top" }]} />
            </Row>
            <Row title="Viewport grid" description="Show the CAD grid in 3D previews.">
              <Toggle checked={showGrid} onChange={touch(setShowGrid)} label="Viewport grid" />
            </Row>
            <Row title="HUD overlays" description="Axis gizmo, dimensions and camera readouts.">
              <Toggle checked={hud} onChange={touch(setHud)} label="HUD overlays" />
            </Row>
            <Row title="Interface animations" description="Scan lines, transitions and progress motion.">
              <Toggle checked={animations} onChange={touch(setAnimations)} label="Interface animations" />
            </Row>
          </Card>
        )}

        {section === "inspection" && (
          <Card title="Inspection defaults" description="Applied to every new project. Can be overridden per project." icon="target">
            <Row title="Default inspection mode">
              <Tabs size="sm" value={mode} onChange={touch(setMode)} items={[{ id: "quick", label: "Quick", icon: "zap" }, { id: "precision", label: "Precision", icon: "target" }]} />
            </Row>
            <Row title="Dimensional tolerance" description="Deviation beyond this value is flagged.">
              <div className="flex items-center gap-3">
                <input type="range" min={0.1} max={3} step={0.1} value={tolerance} onChange={(e) => touch(setTolerance)(Number(e.target.value))} className="w-full accent-[#4fdcf4]" aria-label="Tolerance" />
                <span className="w-16 shrink-0 text-right font-mono text-sm text-white">±{tolerance.toFixed(1)} mm</span>
              </div>
            </Row>
            <Row title="Minimum confidence" description="Hide findings below this confidence.">
              <div className="flex items-center gap-3">
                <input type="range" min={50} max={99} value={confidence} onChange={(e) => touch(setConfidence)(Number(e.target.value))} className="w-full accent-[#4fdcf4]" aria-label="Minimum confidence" />
                <span className="w-16 shrink-0 text-right font-mono text-sm text-white">{confidence}%</span>
              </div>
            </Row>
            <div className="py-5">
              <p className="text-sm font-medium text-white">Required capture angles</p>
              <p className="mt-0.5 text-xs text-mist-400">Angles the guided capture flow will request.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {captureAngles.map((a) => (
                  <label key={a.id} className={cn("flex cursor-pointer items-center gap-3 rounded-xl p-3 ring-1 ring-inset transition", angles[a.id] ? "bg-accent-400/[0.06] ring-accent-400/30" : "ring-white/10 hover:ring-white/20")}>
                    <input type="checkbox" checked={angles[a.id]} onChange={(e) => touch(setAngles)({ ...angles, [a.id]: e.target.checked })} className="size-4 accent-[#4fdcf4]" />
                    <span className="text-sm text-white">{a.label}</span>
                    <span className="ml-auto font-mono text-[11px] text-mist-400">{a.angle}</span>
                  </label>
                ))}
              </div>
            </div>
            <Row title="Auto-start analysis" description="Begin as soon as all required angles are captured.">
              <Toggle checked={autoStart} onChange={touch(setAutoStart)} label="Auto-start analysis" />
            </Row>
          </Card>
        )}

        {section === "appearance" && (
          <Card title="Appearance" description="Personalize the look of Vision3D Inspector." icon="palette">
            <div className="py-5">
              <p className="text-sm font-medium text-white">Theme</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {themes.map((t) => (
                  <button key={t.id} onClick={() => touch(setTheme)(t.id)} className={cn("overflow-hidden rounded-2xl text-left ring-1 transition", theme === t.id ? "ring-2 ring-accent-400" : "ring-white/10 hover:ring-white/25")}>
                    <div className="relative h-24 p-3" style={{ background: t.colors[0] }}>
                      <div className="h-full rounded-lg p-2" style={{ background: t.colors[1] }}>
                        <div className="h-1.5 w-10 rounded-full" style={{ background: t.colors[2] }} />
                        <div className="mt-2 h-1.5 w-16 rounded-full bg-white/15" />
                        <div className="mt-1.5 h-1.5 w-12 rounded-full bg-white/10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-ink-850 px-3 py-2.5">
                      <span className="text-sm text-white">{t.label}</span>
                      {theme === t.id && <Icon name="checkCircle" size={16} className="text-accent-300" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <Row title="Accent color" description="Used for highlights, focus rings and charts.">
              <div className="flex gap-2 sm:justify-end">
                {accents.map((c) => (
                  <button key={c} onClick={() => touch(setAccent)(c)} aria-label={`Accent ${c}`} className={cn("size-8 rounded-full ring-2 ring-offset-2 ring-offset-ink-850 transition", accent === c ? "ring-white" : "ring-transparent hover:ring-white/30")} style={{ background: c }} />
                ))}
              </div>
            </Row>
            <Row title="Corner style">
              <Tabs size="sm" value={radius} onChange={touch(setRadius)} items={[{ id: "sharp", label: "Sharp" }, { id: "rounded", label: "Rounded" }, { id: "soft", label: "Soft" }]} />
            </Row>
            <Row title="Color mode" description="Vision3D is optimized for dark environments.">
              <Tabs size="sm" value="dark" onChange={() => setToast("Light mode is not available in this demo")} items={[{ id: "dark", label: "Dark", icon: "moon" }, { id: "light", label: "Light", icon: "sun" }]} />
            </Row>
          </Card>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mist-400">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <div className="flex gap-2">
            <Button variant="ghost" disabled={!dirty} onClick={() => setDirty(false)}>Discard</Button>
            <Button icon="check" disabled={!dirty} onClick={() => { setDirty(false); setToast("Settings saved (stored locally for this session only)"); }}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
