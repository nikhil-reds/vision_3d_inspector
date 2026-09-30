"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { Icon } from "@/components/ui/Icon";

const formats = [
  { id: "pdf", label: "PDF report", hint: "Formatted, audit-ready document" },
  { id: "csv", label: "CSV findings", hint: "Issue table for spreadsheets" },
  { id: "json", label: "JSON data", hint: "Machine-readable results" },
];

export function ReportActions() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("pdf");
  const [toast, setToast] = useState<string | null>(null);

  return (
    <>
      <Button variant="secondary" icon="share" onClick={() => setToast("Share link copied (demo)")}>Share</Button>
      <Button icon="download" onClick={() => setOpen(true)}>Download report</Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Download inspection report"
        description="Choose an export format. This is a demo — no file will be generated."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              icon="download"
              onClick={() => {
                setOpen(false);
                setToast(`${formats.find((f) => f.id === format)?.label} prepared (demo only)`);
              }}
            >
              Download
            </Button>
          </>
        }
      >
        <div role="radiogroup" className="space-y-2">
          {formats.map((f) => (
            <button
              key={f.id}
              role="radio"
              aria-checked={format === f.id}
              onClick={() => setFormat(f.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition", format === f.id ? "bg-accent-400/[0.07] ring-accent-400/40" : "ring-white/10 hover:ring-white/20")}
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-white/5 font-mono text-[10px] uppercase text-mist-200">{f.id}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-white">{f.label}</span>
                <span className="block text-xs text-mist-400">{f.hint}</span>
              </span>
              {format === f.id && <Icon name="checkCircle" size={18} className="text-accent-300" />}
            </button>
          ))}
        </div>
      </Modal>
      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
