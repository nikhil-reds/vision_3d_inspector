import type { Metadata } from "next";
import { CaptureWorkspace } from "@/components/capture/CaptureWorkspace";

export const metadata: Metadata = { title: "Photo capture" };

export default async function CapturePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <CaptureWorkspace projectId={projectId} />;
}
