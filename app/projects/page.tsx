import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectsBrowser } from "@/components/projects/ProjectsBrowser";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Projects"
        description="Every fabricated part you inspect lives in a project — its reference model, capture sessions, analyses and reports."
        breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Projects" }]}
        actions={
          <>
            <Button variant="secondary" icon="upload">Import</Button>
            <Button href="/projects/new" icon="plus">New project</Button>
          </>
        }
      />
      <ProjectsBrowser />
    </>
  );
}
