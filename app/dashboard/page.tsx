"use client";

import Link from "next/link";
import {
  BookOpenText,
  Bot,
  Command,
  FileText,
  FolderKanban,
  KeyRound,
  ListChecks,
  Plus,
  Shuffle,
  Sparkles,
  Workflow,
  WandSparkles
} from "lucide-react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/memories";
import { useAgents } from "@/hooks/use-agents";
import { useGeneratedFiles } from "@/hooks/use-generated-files";
import { useHandoffs } from "@/hooks/use-handoffs";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";

export default function DashboardPage() {
  const { addProject, isLoaded, projects, stats } = useProjects();
  const { stats: agentStats } = useAgents();
  const { stats: generatedFileStats } = useGeneratedFiles();
  const { stats: handoffStats } = useHandoffs();
  const { stats: memoryStats } = useMemories();
  const { stats: secretStats } = useSecrets();
  const { stats: sessionStats } = useSessions();
  const { stats: skillStats } = useSkills();
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const commandCenterSessions = sessionStats.recentSessions.filter((session) =>
    session.title.startsWith("Command Center -")
  );

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

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <StatCard icon={FolderKanban} label="Total projects" value={stats.totalProjects} />
        <StatCard icon={Workflow} label="Total agents" value={agentStats.totalAgents} />
        <StatCard icon={Workflow} label="Active agents" value={agentStats.activeAgents} />
        <StatCard icon={Shuffle} label="Total handoffs" value={handoffStats.totalHandoffs} />
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
        <StatCard
          icon={Bot}
          label="Total sessions"
          value={sessionStats.totalSessions}
        />
        <StatCard
          icon={Bot}
          label="Active sessions"
          value={sessionStats.activeSessions}
        />
        <StatCard
          icon={Bot}
          label="Completed"
          value={sessionStats.completedSessions}
        />
        <StatCard
          icon={FileText}
          label="Generated files"
          value={generatedFileStats.totalGeneratedFiles}
        />
        <StatCard
          icon={KeyRound}
          label="Total secrets"
          value={secretStats.totalSecrets}
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
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Command className="h-5 w-5" />
              </span>
              <CardTitle>Open Command Center</CardTitle>
            </div>
            <Button asChild>
              <Link href="/command-center">
                <Command className="h-4 w-4" />
                Open
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Run agents from one workspace with project context, memories, skills, secret references,
            sessions, prompts, files, and handoffs in one flow.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Latest Command Center Sessions</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/command-center">
                <Command className="h-4 w-4" />
                Open Command Center
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {commandCenterSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No Command Center sessions saved yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {commandCenterSessions.map((session) => (
                <div key={session.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{session.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.agentName ?? "Agent"}</span>
                      <span>{session.type}</span>
                      <span>{session.status}</span>
                      <span>{formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {projectsById.get(session.projectId)?.name ?? session.projectName}
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
            <CardTitle>Recent Agents</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/agents">
                <Workflow className="h-4 w-4" />
                View agents
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {agentStats.recentAgents.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No agents registered yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {agentStats.recentAgents.map((agent) => (
                <div key={agent.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{agent.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{agent.type}</span>
                      <span>{agent.provider}</span>
                      <span>{agent.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Recent Handoffs</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/handoff">
                <Shuffle className="h-4 w-4" />
                View handoffs
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {handoffStats.recentHandoffs.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No handoffs saved yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {handoffStats.recentHandoffs.map((handoff) => (
                <div key={handoff.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{handoff.sourceAgentName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{handoff.exportTarget}</span>
                      <span>{projectsById.get(handoff.projectId)?.name ?? "Unknown project"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <CardTitle>Recent Secrets</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/secrets">
                <KeyRound className="h-4 w-4" />
                View secrets
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {secretStats.recentSecrets.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No secrets saved yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {secretStats.recentSecrets.map((secret) => (
                <div key={secret.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{secret.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{secret.provider}</span>
                      <span>
                        {secret.projectId === "global"
                          ? "Global"
                          : projectsById.get(secret.projectId)?.name ?? "Unknown project"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Recent Generated Files</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/generate">
                <FileText className="h-4 w-4" />
                Generate files
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {generatedFileStats.recentGeneratedFiles.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No generated files saved yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {generatedFileStats.recentGeneratedFiles.map((file) => (
                <div key={file.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">{file.fileName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{projectsById.get(file.projectId)?.name ?? "Unknown project"}</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {file.fileType}
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
            <CardTitle>Recent Sessions</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/sessions">
                <Bot className="h-4 w-4" />
                View sessions
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessionStats.recentSessions.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No saved prompt sessions yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {sessionStats.recentSessions.map((session) => (
                <div key={session.id} className="rounded-lg border bg-background/60 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium">
                      {projectsById.get(session.projectId)?.name ?? "Unknown project"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{session.targetAgent}</span>
                      <span>{session.type}</span>
                      <span>{session.status}</span>
                      <span>{formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {session.title}
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
