import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProcessingView } from "@/components/inspection/ProcessingView";
import { isInspectionId, readMeta } from "@/lib/inspection/server";

export const metadata: Metadata = { title: "Inspection processing" };

export default async function ProcessingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isInspectionId(id)) notFound();
  const meta = await readMeta(id);
  if (!meta) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <ProcessingView id={id} projectName={meta.projectName} />
    </main>
  );
}
