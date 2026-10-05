"use client";

import { Button } from "@/components/ui/Button";

/** Opens the browser print dialog; "Save as PDF" there produces the file (styled by the print CSS). */
export function ExportPdfButton() {
  return (
    <Button icon="download" onClick={() => window.print()}>
      Export PDF
    </Button>
  );
}
