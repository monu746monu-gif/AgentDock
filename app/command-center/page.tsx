"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpenText,
  Bot,
  Clipboard,
  Download,
  FileText,
  FolderKanban,
  KeyRound,
  Save,
  Send,
  Shuffle,
  WandSparkles,
  Workflow
} from "lucide-react";
import {
  Agent,
  getAgentMemories,
  getAgentSecrets,
  getAgentSkills
} from "@/lib/agents";
import {
  AgentFileType,
  generateAgentFileContent,
  getAgentFileName
} from "@/lib/generated-files";
import { HandoffTarget, HANDOFF_TARGETS } from "@/lib/handoffs";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { PromptSession, SessionType } from "@/lib/sessions";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAgents } from "@/hooks/use-agents";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";

type OutputStyle =
  | "Debugging"
  | "Feature Build"
  | "Code Review"
  | "Refactor"
  | "Documentation"
  | "Handoff";

type SharedTab = "Memories" | "Skills" | "Secrets" | "Recent Sessions";

const OUTPUT_STYLES: OutputStyle[] = [
  "Debugging",
  "Feature Build",
  "Code Review",
  "Refactor",
  "Documentation",
  "Handoff"
];

const FILE_TYPE_OPTIONS: { label: string; value: AgentFileType }[] = [
  { label: "AGENTS.md", value: "AGENTS.md for Codex" },
  { label: "CLAUDE.md", value: "CLAUDE.md for Claude Code" },
  { label: "Cursor Rules", value: ".cursor/rules/project.md for Cursor" },
  { label: "OPENCLAW.md", value: "OPENCLAW.md for OpenClaw" },
  { label: "CUSTOM_AGENT.md", value: "CUSTOM_AGENT.md for custom agents" }
];

const SHARED_TABS: SharedTab[] = [
  "Memories",
  "Skills",
  "Secrets",
  "Recent Sessions"
];

export default function CommandCenterPage() {
  const { agents, isLoaded: agentsLoaded } = useAgents();
  const { memories } = useMemories();
  const { projects, isLoaded: projectsLoaded } = useProjects();
  const { secrets } = useSecrets();
  const { addSession, sessions } = useSessions();
  const { skills } = useSkills();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [task, setTask] = useState("");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("Feature Build");
  const [targetAgent, setTargetAgent] = useState<HandoffTarget>("Codex");
  const [fileType, setFileType] = useState<AgentFileType>("AGENTS.md for Codex");
  const [activeTab, setActiveTab] = useState<SharedTab>("Memories");
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [generatedType, setGeneratedType] = useState<SessionType>("Prompt");
  const [saveMessage, setSaveMessage] = useState("");

  const effectiveProjectId =
    projects.some((project) => project.id === selectedProjectId)
      ? selectedProjectId
      : projects[0]?.id ?? "";

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === effectiveProjectId) ?? null,
    [projects, effectiveProjectId]
  );

  const projectAgents = useMemo(
    () =>
      selectedProject
        ? agents.filter((agent) => agent.projectId === selectedProject.id)
        : [],
    [agents, selectedProject]
  );

  const effectiveAgentId =
    projectAgents.some((agent) => agent.id === selectedAgentId)
      ? selectedAgentId
      : projectAgents[0]?.id ?? "";

  const selectedAgent = useMemo(
    () => projectAgents.find((agent) => agent.id === effectiveAgentId) ?? null,
    [projectAgents, effectiveAgentId]
  );

  const accessibleMemories = useMemo(
    () =>
      selectedAgent
        ? getAgentMemories(selectedAgent, memories)
        : selectedProject
          ? memories.filter((memory) => memory.projectId === selectedProject.id)
          : [],
    [memories, selectedAgent, selectedProject]
  );

  const accessibleSkills = useMemo(
    () => (selectedAgent ? getAgentSkills(selectedAgent, skills) : skills),
    [selectedAgent, skills]
  );

  const accessibleSecrets = useMemo(
    () =>
      selectedAgent
        ? getAgentSecrets(selectedAgent, secrets)
        : selectedProject
          ? secrets.filter(
              (secret) =>
                secret.projectId === selectedProject.id || secret.projectId === "global"
            )
          : [],
    [secrets, selectedAgent, selectedProject]
  );

  const recentSessions = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            session.projectId === selectedProject?.id ||
            session.agentId === selectedAgent?.id
        )
        .slice(0, 5),
    [selectedAgent, selectedProject, sessions]
  );

  const canGenerate = Boolean(selectedProject && selectedAgent && task.trim());

  const generatePromptOutput = () => {
    if (!selectedProject || !selectedAgent) return;

    setGeneratedOutput(
      buildPrompt({
        agent: selectedAgent,
        memories: accessibleMemories,
        outputStyle,
        project: selectedProject,
        secrets: accessibleSecrets,
        skills: accessibleSkills,
        task
      })
    );
    setGeneratedType(outputStyle === "Handoff" ? "Agent Handoff" : outputStyle);
    setSaveMessage("");
  };

  const generateHandoffOutput = () => {
    if (!selectedProject || !selectedAgent) return;

    setGeneratedOutput(
      buildHandoff({
        agent: selectedAgent,
        memories: accessibleMemories,
        project: selectedProject,
        secrets: accessibleSecrets,
        sessions: recentSessions,
        skills: accessibleSkills,
        targetAgent,
        task
      })
    );
    setGeneratedType("Agent Handoff");
    setSaveMessage("");
  };

  const generateAgentFileOutput = () => {
    if (!selectedProject || !selectedAgent) return;

    setGeneratedOutput(
      generateAgentFileContent({
        agentSetupContext: buildAgentSummary(selectedAgent),
        fileType,
        memories: accessibleMemories,
        project: selectedProject,
        secrets: accessibleSecrets,
        sessions: recentSessions,
        skills: accessibleSkills
      })
    );
    setGeneratedType("Agent File");
    setSaveMessage("");
  };

  const saveCurrentSession = async () => {
    if (!selectedProject || !selectedAgent || !generatedOutput) return;

    const session = await addSession({
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      prompt: generatedOutput,
      status: "Draft",
      targetAgent,
      task: task.trim() || "Generated from Command Center",
      title: `Command Center - ${task.trim().slice(0, 64) || generatedType}`,
      type: generatedType
    });

    if (session) {
      setSaveMessage("Saved as a session.");
    }
  };

  const copyOutput = async () => {
    if (!generatedOutput) return;
    await navigator.clipboard.writeText(generatedOutput);
    setSaveMessage("Copied output.");
  };

  const downloadOutput = () => {
    if (!generatedOutput) return;

    const fileName =
      generatedType === "Agent File"
        ? getAgentFileName(fileType)
        : `agentdock-${generatedType.toLowerCase().replace(/\s+/g, "-")}.md`;
    const blob = new Blob([generatedOutput], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">AgentDock Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Command Center</h1>
          <p className="mt-2 text-muted-foreground">
            One place to run your AI agents with shared project context.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:w-[520px]">
          <Field label="Selected project" htmlFor="command-project">
            <Select
              id="command-project"
              value={effectiveProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {projects.length === 0 ? (
                <option value="">Create a project first</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </Select>
          </Field>
          <Field label="Selected agent" htmlFor="command-agent">
            <Select
              id="command-agent"
              value={effectiveAgentId}
              onChange={(event) => setSelectedAgentId(event.target.value)}
              disabled={!selectedProject}
            >
              {!selectedProject ? (
                <option value="">Select a project first</option>
              ) : projectAgents.length === 0 ? (
                <option value="">Register an agent first</option>
              ) : (
                projectAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))
              )}
            </Select>
          </Field>
        </div>
      </div>

      {!projectsLoaded || !agentsLoaded ? null : projects.length === 0 ? (
        <EmptyState
          href="/projects"
          icon={FolderKanban}
          label="Create a project first."
          action="Create Project"
        />
      ) : selectedProject && projectAgents.length === 0 ? (
        <EmptyState
          href="/agents"
          icon={Workflow}
          label="Register an agent first."
          action="Register Agent"
        />
      ) : null}

      <div className="mt-8 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
        <ProjectContextPanel project={selectedProject} />

        <Card>
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Agent Workspace</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedAgent
                    ? `${selectedAgent.name} is ready with shared context.`
                    : "Select a project and registered agent to begin."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <QuickAction href="/memory" icon={BookOpenText} label="Add Memory" />
                <QuickAction href="/skills" icon={WandSparkles} label="Add Skill" />
                <QuickAction href="/secrets" icon={KeyRound} label="Add Secret Reference" />
                <QuickAction href="/agents" icon={Workflow} label="Register Agent" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 pt-5">
            {selectedAgent ? (
              <div className="grid gap-3 md:grid-cols-3">
                <Meta label="Agent type" value={selectedAgent.type} />
                <Meta label="Provider" value={selectedAgent.provider} />
                <Meta label="Status" value={selectedAgent.status} />
                <Meta label="Memory access" value={selectedAgent.memoryAccess} />
                <Meta label="Skills access" value={selectedAgent.skillsAccess} />
                <Meta label="Secrets access" value={selectedAgent.secretsAccess} />
              </div>
            ) : null}

            <Field label="Task" htmlFor="command-task">
              <Textarea
                id="command-task"
                className="min-h-36"
                placeholder="What do you want this agent to do?"
                value={task}
                onChange={(event) => setTask(event.target.value)}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Output style" htmlFor="command-output-style">
                <Select
                  id="command-output-style"
                  value={outputStyle}
                  onChange={(event) => setOutputStyle(event.target.value as OutputStyle)}
                >
                  {OUTPUT_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Handoff target" htmlFor="command-target">
                <Select
                  id="command-target"
                  value={targetAgent}
                  onChange={(event) => setTargetAgent(event.target.value as HandoffTarget)}
                >
                  {HANDOFF_TARGETS.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Agent file type" htmlFor="command-file-type">
                <Select
                  id="command-file-type"
                  value={fileType}
                  onChange={(event) => setFileType(event.target.value as AgentFileType)}
                >
                  {FILE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={generatePromptOutput} disabled={!canGenerate}>
                <Bot className="h-4 w-4" />
                Generate Prompt
              </Button>
              <Button type="button" variant="secondary" onClick={generateHandoffOutput} disabled={!canGenerate}>
                <Shuffle className="h-4 w-4" />
                Generate Handoff
              </Button>
              <Button type="button" variant="secondary" onClick={generateAgentFileOutput} disabled={!canGenerate}>
                <FileText className="h-4 w-4" />
                Generate Agent File
              </Button>
              <Button type="button" variant="outline" onClick={saveCurrentSession} disabled={!generatedOutput}>
                <Save className="h-4 w-4" />
                Save Session
              </Button>
            </div>
          </CardContent>
        </Card>

        <SharedContextPanel
          activeTab={activeTab}
          memories={accessibleMemories}
          onTabChange={setActiveTab}
          secrets={accessibleSecrets}
          sessions={recentSessions}
          skills={accessibleSkills}
        />
      </div>

      <Card className="mt-4">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Generated Output Preview</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={copyOutput} disabled={!generatedOutput}>
                <Clipboard className="h-4 w-4" />
                Copy
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={downloadOutput} disabled={!generatedOutput}>
                <Download className="h-4 w-4" />
                Download .md
              </Button>
              <Button type="button" size="sm" onClick={saveCurrentSession} disabled={!generatedOutput}>
                <Save className="h-4 w-4" />
                Save as Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          {generatedOutput ? (
            <pre className="max-h-[520px] overflow-auto rounded-lg border bg-background p-4 text-sm leading-6 text-muted-foreground">
              {generatedOutput}
            </pre>
          ) : (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              Generated prompts, handoffs, and agent files will appear here.
            </p>
          )}
          {saveMessage ? <p className="mt-3 text-sm text-primary">{saveMessage}</p> : null}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function ProjectContextPanel({ project }: { project: Project | null }) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Project Context</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/projects">Edit Project</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        {project ? (
          <>
            <Meta label="Project name" value={project.name} />
            <Meta label="Tech stack" value={project.techStack || "Not set"} />
            <Meta label="Repo URL" value={project.repoUrl || "Not set"} />
            <Meta label="Run commands" value={project.runCommands || "Not set"} multiline />
            <Meta label="Current tasks/bugs" value={project.tasks || "No active tasks"} multiline />
          </>
        ) : (
          <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
            Create a project first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function SharedContextPanel({
  activeTab,
  memories,
  onTabChange,
  secrets,
  sessions,
  skills
}: {
  activeTab: SharedTab;
  memories: ReturnType<typeof useMemories>["memories"];
  onTabChange: (tab: SharedTab) => void;
  secrets: Secret[];
  sessions: PromptSession[];
  skills: Skill[];
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <CardTitle>Shared Context</CardTitle>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {SHARED_TABS.map((tab) => (
            <Button
              key={tab}
              type="button"
              variant={activeTab === tab ? "secondary" : "outline"}
              size="sm"
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="max-h-[680px] overflow-auto pt-5">
        {activeTab === "Memories" ? <MemoryList memories={memories} /> : null}
        {activeTab === "Skills" ? <SkillList skills={skills} /> : null}
        {activeTab === "Secrets" ? <SecretList secrets={secrets} /> : null}
        {activeTab === "Recent Sessions" ? <SessionList sessions={sessions} /> : null}
      </CardContent>
    </Card>
  );
}

function MemoryList({ memories }: { memories: ReturnType<typeof useMemories>["memories"] }) {
  if (memories.length === 0) return <EmptyInline label="No memories available." />;

  return (
    <div className="grid gap-3">
      {memories.map((memory) => (
        <div key={memory.id} className="rounded-lg border bg-background/60 p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{memory.importance}</span>
            <span>{formatDate(memory.createdAt)}</span>
          </div>
          <p className="mt-3 text-sm leading-6">{memory.content}</p>
        </div>
      ))}
    </div>
  );
}

function SkillList({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return <EmptyInline label="No skills available." />;

  return (
    <div className="grid gap-3">
      {skills.map((skill) => (
        <div key={skill.id} className="rounded-lg border bg-background/60 p-4">
          <p className="text-sm font-medium">{skill.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {skill.targetAgent} / {skill.category}
          </p>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {skill.instructions}
          </p>
        </div>
      ))}
    </div>
  );
}

function SecretList({ secrets }: { secrets: Secret[] }) {
  if (secrets.length === 0) return <EmptyInline label="No secret references available." />;

  return (
    <div className="grid gap-3">
      {secrets.map((secret) => (
        <div key={secret.id} className="rounded-lg border bg-background/60 p-4">
          <p className="text-sm font-medium">{secret.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{secret.provider}</p>
          <p className="mt-3 break-all rounded-md border bg-secondary px-2 py-1 text-xs text-muted-foreground">
            {secret.reference}
          </p>
        </div>
      ))}
    </div>
  );
}

function SessionList({ sessions }: { sessions: PromptSession[] }) {
  if (sessions.length === 0) return <EmptyInline label="No recent sessions available." />;

  return (
    <div className="grid gap-3">
      {sessions.map((session) => (
        <div key={session.id} className="rounded-lg border bg-background/60 p-4">
          <p className="text-sm font-medium">{session.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {session.type} / {session.status} / {formatDate(session.createdAt)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {session.task}
          </p>
        </div>
      ))}
    </div>
  );
}

function Field({
  children,
  htmlFor,
  label
}: {
  children: React.ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Meta({
  label,
  multiline,
  value
}: {
  label: string;
  multiline?: boolean;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={multiline ? "mt-2 whitespace-pre-wrap text-sm leading-6" : "mt-2 text-sm font-medium"}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: typeof Send;
  label: string;
}) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}

function EmptyState({
  action,
  href,
  icon: Icon,
  label
}: {
  action: string;
  href: string;
  icon: typeof FolderKanban;
  label: string;
}) {
  return (
    <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
      <Icon className="mx-auto mb-4 h-8 w-8 text-primary" />
      <p className="text-lg font-medium">{label}</p>
      <Button asChild className="mt-4">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}

function EmptyInline({ label }: { label: string }) {
  return (
    <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
      {label}
    </p>
  );
}

function buildAgentSummary(agent: Agent) {
  return `Name: ${agent.name}
Type: ${agent.type}
Provider: ${agent.provider}
Status: ${agent.status}
Memory access: ${agent.memoryAccess}
Skills access: ${agent.skillsAccess}
Secrets access: ${agent.secretsAccess}
Notes: ${agent.notes || "No notes provided."}`;
}

function buildPrompt({
  agent,
  memories,
  outputStyle,
  project,
  secrets,
  skills,
  task
}: {
  agent: Agent;
  memories: ReturnType<typeof useMemories>["memories"];
  outputStyle: OutputStyle;
  project: Project;
  secrets: Secret[];
  skills: Skill[];
  task: string;
}) {
  return `# AgentDock Command Center Prompt

## Selected Agent
${buildAgentSummary(agent)}

## Output Style
${outputStyle}

## Project Context
Project: ${project.name}
Description: ${project.description || "No description provided."}
Tech stack: ${project.techStack || "No tech stack provided."}
Repo URL: ${project.repoUrl || "No repo URL provided."}

Run commands:
${project.runCommands || "No run commands provided."}

Current tasks/bugs:
${project.tasks || "No current tasks or bugs provided."}

## Available Memories
${formatMemories(memories)}

## Available Skills
${formatSkills(skills)}

## Secret References
${formatSecretReferences(secrets)}

## Task
${task.trim()}

## Working Rules
- Use the selected project context before making recommendations or edits.
- Use memory and skill instructions when they apply.
- Treat secret entries as references only; never ask for or expose raw values.
- Keep changes focused and explain the verification path.
`;
}

function buildHandoff({
  agent,
  memories,
  project,
  secrets,
  sessions,
  skills,
  targetAgent,
  task
}: {
  agent: Agent;
  memories: ReturnType<typeof useMemories>["memories"];
  project: Project;
  secrets: Secret[];
  sessions: PromptSession[];
  skills: Skill[];
  targetAgent: HandoffTarget;
  task: string;
}) {
  return `# AgentDock Handoff

## Source Agent
${buildAgentSummary(agent)}

## Target Agent
${targetAgent}

## Project
Project: ${project.name}
Tech stack: ${project.techStack || "No tech stack provided."}
Repo URL: ${project.repoUrl || "No repo URL provided."}

Run commands:
${project.runCommands || "No run commands provided."}

Open tasks/bugs:
${project.tasks || "No current tasks or bugs provided."}

## Task To Continue
${task.trim()}

## Portable Memories
${formatMemories(memories)}

## Portable Skills
${formatSkills(skills)}

## Secret References
${formatSecretReferences(secrets)}

## Recent Session Context
${formatSessions(sessions)}

## Transfer Instructions
- Continue from this shared AgentDock context.
- Preserve existing functionality.
- Do not expose raw secret values.
- Report changed files and verification commands.
`;
}

function formatMemories(memories: ReturnType<typeof useMemories>["memories"]) {
  return memories.length > 0
    ? memories
        .map((memory) => `- [${memory.importance}] ${memory.content}`)
        .join("\n")
    : "- No memories available.";
}

function formatSkills(skills: Skill[]) {
  return skills.length > 0
    ? skills
        .map((skill) => `### ${skill.name}\nTarget: ${skill.targetAgent}\nCategory: ${skill.category}\n${skill.instructions}`)
        .join("\n\n")
    : "No skills available.";
}

function formatSecretReferences(secrets: Secret[]) {
  return secrets.length > 0
    ? secrets
        .map((secret) => `- ${secret.name} (${secret.provider}): ${secret.reference}`)
        .join("\n")
    : "- No secret references available.";
}

function formatSessions(sessions: PromptSession[]) {
  return sessions.length > 0
    ? sessions
        .map((session) => `### ${session.title}\nType: ${session.type}\nStatus: ${session.status}\nTask: ${session.task}`)
        .join("\n\n")
    : "No recent sessions available.";
}
