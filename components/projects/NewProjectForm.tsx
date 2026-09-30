"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { projectTypes, projects, type InspectionMode } from "@/lib/data";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { InspectionModeSelector } from "./InspectionModeSelector";
import { modeDetails } from "@/lib/modes";

const steps = ["Project details", "Reference model", "Photo capture", "Analysis"];

export function NewProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [client, setClient] = useState("");
  const [type, setType] = useState(projectTypes[0]);
  const [mode, setMode] = useState<InspectionMode>("precision");
  const [touched, setTouched] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const nameError = touched && !name.trim() ? "Project name is required" : undefined;
  const clientError = touched && !client.trim() ? "Client name is required" : undefined;
  const complete = [name, client].filter((v) => v.trim()).length + 2;

  const onContinue = () => {
    setTouched(true);
    if (!name.trim() || !client.trim()) return;
    setConfirm(true);
  };

  // Demo: route into the sample project's model step.
  const demoTarget = `/projects/${projects[0].id}/model`;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        {/* Stepper */}
        <ol className="panel flex items-center gap-2 overflow-x-auto p-3">
          {steps.map((s, i) => (
            <li key={s} className="flex shrink-0 items-center gap-2">
              <span className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm", i === 0 ? "bg-accent-400/10 text-white ring-1 ring-inset ring-accent-400/25" : "text-mist-400")}>
                <span className={cn("flex size-6 items-center justify-center rounded-lg font-mono text-[11px]", i === 0 ? "bg-accent-400 text-ink-950" : "bg-white/5 text-mist-400")}>{i + 1}</span>
                {s}
              </span>
              {i < steps.length - 1 && <Icon name="chevronRight" size={14} className="text-mist-400/40" />}
            </li>
          ))}
        </ol>

        <section className="panel p-5 sm:p-7">
          <h2 className="text-base font-semibold text-white">Project details</h2>
          <p className="mt-1 text-sm text-mist-400">Describe the physical part you want to inspect.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Project name" htmlFor="name" error={nameError} hint="Use the part number so reports are easy to trace.">
                <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. HB-220 Hydraulic Mounting Bracket" invalid={!!nameError} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Description" htmlFor="description" optional>
                <TextArea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is being inspected and why — first article, batch release, supplier audit…" />
              </Field>
            </div>
            <Field label="Client name" htmlFor="client" error={clientError}>
              <TextInput id="client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Northwind Fluid Systems" invalid={!!clientError} />
            </Field>
            <Field label="Project type" htmlFor="type">
              <Select id="type" value={type} onChange={setType} icon="box" options={projectTypes.map((t) => ({ value: t, label: t }))} />
            </Field>
          </div>
        </section>

        <section className="panel p-5 sm:p-7">
          <h2 className="text-base font-semibold text-white">Inspection mode</h2>
          <p className="mt-1 mb-6 text-sm text-mist-400">You can change the mode later, before the analysis starts.</p>
          <InspectionModeSelector value={mode} onChange={setMode} />
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" href="/projects" icon="chevronLeft">Cancel</Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary">Save as draft</Button>
            <Button iconRight="arrowRight" onClick={onContinue} size="lg">Continue</Button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="panel overflow-hidden">
          <div className="relative h-32 overflow-hidden border-b border-white/[0.06] bg-ink-900">
            <div className="bg-grid absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-ink-800 ring-1 ring-accent-400/30 animate-float">
                <div className="absolute inset-0 rounded-2xl bg-accent-400/20 blur-xl" />
                <Icon name="cube" size={28} className="relative text-accent-300" />
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-400">Summary</p>
            <p className="mt-2 truncate text-lg font-semibold text-white">{name || "Untitled project"}</p>
            <p className="truncate text-sm text-mist-400">{client || "No client yet"}</p>
            <dl className="mt-5 space-y-3 text-sm">
              {[
                ["Type", type],
                ["Mode", modeDetails[mode].title],
                ["Tolerance", modeDetails[mode].specs[1].value],
                ["Photos needed", modeDetails[mode].specs[0].value],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-mist-400">{k}</dt>
                  <dd className="text-right text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-mist-400">Setup completeness</span>
                <span className="font-mono text-white">{complete}/4</span>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={cn("h-1 rounded-full", i < complete ? "bg-accent-400" : "bg-white/10")} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-mist-400">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-accent-300" />
          Next you&apos;ll upload the reference 3D model. Supported formats: GLB, GLTF, OBJ, FBX and STL.
        </div>
      </aside>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Project ready"
        description="This is a frontend demo — nothing was saved. Continue to explore the sample project's model upload step."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Keep editing</Button>
            <Button iconRight="arrowRight" onClick={() => router.push(demoTarget)}>Upload reference model</Button>
          </>
        }
      >
        <div className="rounded-2xl bg-ink-900/70 p-4 ring-1 ring-inset ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
              <Icon name="checkCircle" size={20} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{name}</p>
              <p className="truncate text-xs text-mist-400">
                {client} · {type} · {modeDetails[mode].title}
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
