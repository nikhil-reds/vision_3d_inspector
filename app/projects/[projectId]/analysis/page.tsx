import type { Metadata } from "next";
import { AnalysisWorkspace } from "@/components/analysis/AnalysisWorkspace";

export const metadata: Metadata = { title: "Analysis" };

export default async function AnalysisPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <AnalysisWorkspace projectId={projectId} />;
}
