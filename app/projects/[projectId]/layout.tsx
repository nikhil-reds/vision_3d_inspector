import { notFound } from "next/navigation";
import { getProject, modeMeta, projects } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProjectNav } from "@/components/projects/ProjectNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export function generateStaticParams() {
  return projects.map((p) => ({ projectId: p.id }));
}

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = getProject(projectId);
  if (!project) notFound();

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.code }]}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {project.name}
            <StatusBadge status={project.status} />
          </span>
        }
        meta={
          <>
            <span className="flex items-center gap-1.5"><Icon name="users" size={14} /> {project.client}</span>
            <span className="flex items-center gap-1.5"><Icon name="box" size={14} /> {project.type}</span>
            <span className="flex items-center gap-1.5"><Icon name={project.mode === "quick" ? "zap" : "target"} size={14} /> {modeMeta[project.mode].label}</span>
            <span className="flex items-center gap-1.5"><Icon name="clock" size={14} /> Updated {project.updatedAt}</span>
          </>
        }
        actions={
          <>
            <Button variant="secondary" icon="share">Share</Button>
            <Button href={`/projects/${project.id}/report`} icon="file">View report</Button>
          </>
        }
        className="mb-6"
      />
      <ProjectNav projectId={project.id} />
      {children}
    </>
  );
}
