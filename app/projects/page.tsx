"use client";

import { CreateProjectDialog } from "@/components/create-project-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ProjectCard } from "@/components/project-card";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { addProject, isLoaded, projects } = useProjects();
  const { addMemory, memories } = useMemories();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Project Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Create local project brains for AI coding agents.
          </p>
        </div>
        <CreateProjectDialog onCreateProject={addProject} />
      </div>

      {!isLoaded ? null : projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No projects yet. Create your first AI project brain.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              memoryCount={
                memories.filter((memory) => memory.projectId === project.id).length
              }
              onCreateMemory={addMemory}
              project={project}
              projects={projects}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
