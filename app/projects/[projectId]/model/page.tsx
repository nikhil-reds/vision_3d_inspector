import type { Metadata } from "next";
import { ModelWorkspace } from "@/components/model/ModelWorkspace";

export const metadata: Metadata = { title: "Reference model" };

export default async function ModelPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ModelWorkspace projectId={projectId} />;
}
