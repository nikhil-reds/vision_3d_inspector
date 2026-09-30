"use client";

import { useState } from "react";
import { modelInfo, supportedFormats } from "@/lib/data";
import { UploadZone, type UploadedFile } from "./UploadZone";
import { ModelPreview } from "./ModelPreview";
import { ModelInfoPanel } from "./ModelInfoPanel";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function ModelWorkspace({ projectId }: { projectId: string }) {
  const [file, setFile] = useState<UploadedFile | null>({ name: modelInfo.fileName, size: modelInfo.fileSize });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const empty = !file;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <UploadZone
          formats={supportedFormats}
          title={empty ? "Drag & drop your reference 3D model" : "Drop a new revision to replace the current model"}
          icon="cube"
          onComplete={(f) => setFile(f)}
        />
        <ModelPreview empty={empty} fileName={file?.name} />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="danger" icon="trash" disabled={empty} onClick={() => setConfirmRemove(true)}>
            Remove model
          </Button>
          <Button href={`/projects/${projectId}/capture`} iconRight="arrowRight" size="lg" className={empty ? "pointer-events-none opacity-40" : ""}>
            Continue to photo capture
          </Button>
        </div>
      </div>
      <ModelInfoPanel empty={empty} fileName={file?.name} fileSize={file?.size} />

      <Modal
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        title="Remove reference model?"
        description="The viewport and model information will be cleared. This demo does not delete anything."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRemove(false)}>Cancel</Button>
            <Button variant="danger" icon="trash" onClick={() => { setFile(null); setConfirmRemove(false); }}>Remove</Button>
          </>
        }
      />
    </div>
  );
}
