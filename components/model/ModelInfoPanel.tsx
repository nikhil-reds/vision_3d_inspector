import { cn } from "@/lib/cn";
import { modelInfo } from "@/lib/data";
import { Icon } from "@/components/ui/Icon";

export function ModelInfoPanel({ fileName, fileSize, empty }: { fileName?: string; fileSize?: string; empty?: boolean }) {
  const m = modelInfo;
  const dash = <span className="text-mist-400">—</span>;
  const dims = [
    { k: "Width", v: m.width, axis: "X", c: "text-rose-300" },
    { k: "Height", v: m.height, axis: "Y", c: "text-emerald-300" },
    { k: "Depth", v: m.depth, axis: "Z", c: "text-sky-300" },
  ];

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Model information</h2>
          <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-mist-300">{empty ? "—" : m.format}</span>
        </div>
        <p className="mt-1 truncate font-mono text-xs text-mist-400">{empty ? "No file" : fileName ?? m.fileName}</p>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {dims.map((d) => (
            <div key={d.k} className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-inset ring-white/[0.06]">
              <p className="flex items-center gap-1.5 text-[11px] text-mist-400">
                <span className={cn("font-mono font-semibold", d.c)}>{d.axis}</span> {d.k}
              </p>
              <p className="mt-1 font-mono text-sm text-white">{empty ? dash : d.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-inset ring-white/[0.06]">
            <p className="flex items-center gap-1.5 text-[11px] text-mist-400"><Icon name="layers" size={13} /> Mesh count</p>
            <p className="mt-1 font-mono text-xl text-white">{empty ? dash : m.meshCount}</p>
          </div>
          <div className="rounded-xl bg-ink-950/50 p-3 ring-1 ring-inset ring-white/[0.06]">
            <p className="flex items-center gap-1.5 text-[11px] text-mist-400"><Icon name="palette" size={13} /> Material count</p>
            <p className="mt-1 font-mono text-xl text-white">{empty ? dash : m.materialCount}</p>
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-4 text-sm">
          {[
            ["Vertices", m.vertices],
            ["Triangles", m.triangles],
            ["File size", fileSize ?? m.fileSize],
            ["Units", m.units],
            ["Uploaded", m.uploadedAt],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-mist-400">{k}</dt>
              <dd className="text-right font-mono text-xs leading-5 text-mist-200">{empty ? "—" : v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-white">Materials</h2>
        <ul className="mt-4 space-y-2.5">
          {m.materials.map((mat) => (
            <li key={mat.name} className={cn("flex items-center gap-3 text-sm", empty && "opacity-40")}>
              <span className="size-5 rounded-md ring-1 ring-inset ring-white/20" style={{ background: mat.color }} />
              <span className="text-mist-200">{mat.name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-white">Geometry validation</h2>
        <ul className="mt-4 space-y-3">
          {m.checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3 text-sm">
              <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", empty ? "bg-white/5 text-mist-400" : c.ok ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300")}>
                <Icon name={empty ? "clock" : c.ok ? "check" : "alert"} size={11} strokeWidth={2.5} />
              </span>
              <span>
                <span className="text-mist-200">{c.label}</span>
                {c.note && !empty && <span className="block text-xs text-mist-400">{c.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
