"use client";

import Link from "next/link";
import {
  BookOpenText,
  FolderKanban,
  ListChecks,
  Plus,
  Sparkles,
  WandSparkles
} from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/memories";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";

export default function DashboardPage() {
  const { addProject, isLoaded, projects, stats } = useProjects();
  const { stats: memoryStats } = useMemories();
  const { stats: skillStats } = useSkills();
  const projectsById = new Map(projects.map((project) => [project.id, project]));

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">AgentDock</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Your shared project brain for AI coding agents.
          </p>
        </div>
        <CreateProjectDialog onCreateProject={addProject} />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={FolderKanban} label="Total projects" value={stats.totalProjects} />
        <StatCard icon={ListChecks} label="Total tasks/bugs" value={stats.totalTasks} />
        <StatCard
          icon={BookOpenText}
          label="Total memories"
          value={memoryStats.totalMemories}
        />
        <StatCard
          icon={WandSparkles}
          label="Total skills"
          value={skillStats.totalSkills}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <CardTitle>Recent project</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {stats.recentProject?.name ?? "None yet"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {stats.recentProject?.description || "Create a project to start building context."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Recent Memories</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/memory">
                <BookOpenText className="h-4 w-4" />
                View memory
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {memoryStats.recentMemories.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No memories yet. Save your first project memory.
            </p>
          ) : (
            <div className="grid gap-3">
              {memoryStats.recentMemories.map((memory) => (
                <div key={memory.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">
                      {projectsById.get(memory.projectId)?.name ?? "Unknown project"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{memory.importance}</span>
                      <span>{formatDate(memory.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {memory.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Recent Skills</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/skills">
                <WandSparkles className="h-4 w-4" />
                View skills
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {skillStats.recentSkills.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No skills yet. Create your first reusable AI skill.
            </p>
          ) : (
            <div className="grid gap-3">
              {skillStats.recentSkills.map((skill) => (
                <div key={skill.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{skill.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{skill.targetAgent}</span>
                      <span>{skill.category}</span>
                      <span>{formatDate(skill.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {skill.instructions}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Project Workspace</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Store the core instructions and state your coding agents need: tech stack, repo,
            commands, and the current tasks or bugs.
          </p>
          <Button asChild variant="secondary">
            <Link href="/projects">
              <Plus className="h-4 w-4" />
              Manage projects
            </Link>
          </Button>
        </CardContent>
      </Card>

      {!isLoaded ? null : stats.totalProjects === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No projects yet. Create your first AI project brain.</p>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <CardTitle>{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
