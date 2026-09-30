import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 4"
        title="Create inspection project"
        description="Set up the project, then upload a reference model and capture photos of the fabricated part."
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: "New project" }]}
      />
      <NewProjectForm />
    </>
  );
}
