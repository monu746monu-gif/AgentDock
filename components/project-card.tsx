import {
  BookOpenText,
  Bug,
  Code2,
  ExternalLink,
  ListChecks,
  Plus,
  TerminalSquare
} from "lucide-react";
import { CreateMemoryDialog } from "@/components/create-memory-dialog";
import { Button } from "@/components/ui/button";
import { Project, parseTaskCount } from "@/lib/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemoryInput } from "@/lib/memories";

export function ProjectCard({
  memoryCount = 0,
  onCreateMemory,
  project,
  projects = [project]
}: {
  memoryCount?: number;
  onCreateMemory?: (memory: MemoryInput) => void;
  project: Project;
  projects?: Project[];
}) {
  const taskCount = parseTaskCount(project.tasks);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{project.name}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {project.description || "No description added yet."}
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bug className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="flex flex-col gap-3 rounded-lg border bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpenText className="h-4 w-4 text-primary" />
            <span>{memoryCount} memories linked</span>
          </div>
          {onCreateMemory ? (
            <CreateMemoryDialog
              defaultProjectId={project.id}
              onCreateMemory={onCreateMemory}
              projects={projects}
              trigger={
                <Button type="button" variant="secondary" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Memory
                </Button>
              }
            />
          ) : null}
        </div>

        <ProjectDetail icon={Code2} label="Tech stack" value={project.techStack} />
        <ProjectDetail icon={TerminalSquare} label="Run commands" value={project.runCommands} pre />
        <ProjectDetail icon={ListChecks} label={`${taskCount} tasks or bugs`} value={project.tasks} pre />

        {project.repoUrl ? (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            Open repository
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ProjectDetail({
  icon: Icon,
  label,
  pre,
  value
}: {
  icon: typeof Code2;
  label: string;
  pre?: boolean;
  value: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className={pre ? "whitespace-pre-wrap text-sm leading-6" : "text-sm leading-6"}>
        {value}
      </p>
    </div>
  );
}
