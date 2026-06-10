"use client";

import { useMemo, useState } from "react";
import { Clipboard, Copy, RotateCcw, Save, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  generateAgentSetupContext,
  getAgentMemories,
  getAgentSecrets,
  getAgentSkills
} from "@/lib/agents";
import { useAgents } from "@/hooks/use-agents";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";
import { formatDate } from "@/lib/memories";
import {
  generatePrompt,
  OUTPUT_STYLES,
  OutputStyle,
  outputStyleToSessionType
} from "@/lib/sessions";
import { TARGET_AGENTS, TargetAgent } from "@/lib/skills";

export default function CodexPromptPage() {
  const { agents } = useAgents();
  const { memories } = useMemories();
  const { isLoaded: projectsLoaded, projects } = useProjects();
  const { secrets } = useSecrets();
  const { addSession, deleteSession, isLoaded: sessionsLoaded, sessions } =
    useSessions();
  const { skills } = useSkills();
  const [projectId, setProjectId] = useState("");
  const [agentId, setAgentId] = useState("none");
  const [targetAgent, setTargetAgent] = useState<TargetAgent>("Codex");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("Feature Build");
  const [task, setTask] = useState("");
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [selectedSecretIds, setSelectedSecretIds] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Prompt");

  const selectedProject = useMemo(
    () => {
      const selectedAgent = agents.find((agent) => agent.id === agentId);
      return (
        projects.find((project) => project.id === selectedAgent?.projectId) ??
        projects.find((project) => project.id === projectId) ??
        projects[0]
      );
    },
    [agentId, agents, projectId, projects]
  );

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === agentId) ?? null,
    [agentId, agents]
  );

  const projectMemories = useMemo(
    () =>
      selectedProject
        ? memories.filter((memory) => memory.projectId === selectedProject.id)
        : [],
    [memories, selectedProject]
  );

  const selectedMemories = useMemo(
    () =>
      selectedAgent
        ? getAgentMemories(selectedAgent, memories)
        : memories.filter((memory) => selectedMemoryIds.includes(memory.id)),
    [memories, selectedAgent, selectedMemoryIds]
  );

  const selectedSkills = useMemo(
    () =>
      selectedAgent
        ? getAgentSkills(selectedAgent, skills)
        : skills.filter((skill) => selectedSkillIds.includes(skill.id)),
    [selectedAgent, selectedSkillIds, skills]
  );

  const availableSecrets = useMemo(
    () =>
      selectedProject
        ? secrets.filter(
            (secret) =>
              secret.projectId === "global" || secret.projectId === selectedProject.id
          )
        : [],
    [secrets, selectedProject]
  );

  const selectedSecrets = useMemo(
    () =>
      selectedAgent
        ? getAgentSecrets(selectedAgent, secrets)
        : secrets.filter((secret) => selectedSecretIds.includes(secret.id)),
    [secrets, selectedAgent, selectedSecretIds]
  );

  const agentSetupContext = useMemo(
    () =>
      selectedAgent
        ? generateAgentSetupContext({
            agent: selectedAgent,
            memories: selectedMemories,
            project: selectedProject,
            secrets: selectedSecrets,
            sessions: sessions.filter((session) => session.agentId === selectedAgent.id),
            skills: selectedSkills
          })
        : "",
    [selectedAgent, selectedMemories, selectedProject, selectedSecrets, selectedSkills, sessions]
  );

  const toggleSelected = (
    id: string,
    selectedIds: string[],
    setSelectedIds: (ids: string[]) => void
  ) => {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    setSelectedMemoryIds([]);
    setSelectedSecretIds([]);
  };

  const handleGeneratePrompt = () => {
    const project = selectedProject;

    if (!project || !task.trim()) {
      return;
    }

    setGeneratedPrompt(
      generatePrompt({
        agentSetupContext,
        memories: selectedMemories,
        outputStyle,
        project,
        secrets: selectedSecrets,
        skills: selectedSkills,
        targetAgent,
        task: task.trim()
      })
    );
  };

  const handleCopyPrompt = async (prompt = generatedPrompt) => {
    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(prompt);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy Prompt"), 1200);
  };

  const handleClear = () => {
    setTask("");
    setSelectedMemoryIds([]);
    setSelectedSecretIds([]);
    setSelectedSkillIds([]);
    setGeneratedPrompt("");
    setCopyLabel("Copy Prompt");
  };

  const handleSaveSession = () => {
    const project = selectedProject;

    if (!project || !generatedPrompt || !task.trim()) {
      return;
    }

    addSession({
      projectId: project.id,
      projectName: project.name,
      agentId: selectedAgent?.id,
      agentName: selectedAgent?.name,
      targetAgent,
      title: task.trim().slice(0, 80),
      task: task.trim(),
      prompt: generatedPrompt,
      status: "Draft",
      type: outputStyleToSessionType(outputStyle)
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Codex Prompt Generator</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Codex Prompt</h1>
          <p className="mt-2 text-muted-foreground">
            Combine project context, memories, skills, and a task into one structured prompt.
          </p>
        </div>
      </div>

      {projectsLoaded && projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            Create a project first before generating prompts.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="prompt-agent-profile">Registered agent</Label>
                <Select
                  id="prompt-agent-profile"
                  value={agentId}
                  onChange={(event) => setAgentId(event.target.value)}
                >
                  <option value="none">No registered agent</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-project">Project</Label>
                <Select
                  id="prompt-project"
                  value={selectedProject?.id ?? ""}
                  onChange={(event) => handleProjectChange(event.target.value)}
                  disabled={Boolean(selectedAgent)}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="prompt-agent">Target agent</Label>
                  <Select
                    id="prompt-agent"
                    value={targetAgent}
                    onChange={(event) => setTargetAgent(event.target.value as TargetAgent)}
                  >
                    {TARGET_AGENTS.map((agent) => (
                      <option key={agent} value={agent}>
                        {agent}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="prompt-style">Output style</Label>
                  <Select
                    id="prompt-style"
                    value={outputStyle}
                    onChange={(event) => setOutputStyle(event.target.value as OutputStyle)}
                  >
                    {OUTPUT_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="prompt-task">Task, bug, or problem</Label>
                <Textarea
                  id="prompt-task"
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="Describe what the coding agent should fix, build, review, refactor, or document."
                  required
                />
              </div>

              <SelectableList
                emptyText="No memories for this project yet. Prompt generation still works with project data only."
                items={projectMemories.map((memory) => ({
                  id: memory.id,
                  meta: `${memory.importance} · ${formatDate(memory.createdAt)}`,
                  title: memory.content
                }))}
                label="Relevant memories"
                selectedIds={selectedMemoryIds}
                onToggle={(id) =>
                  toggleSelected(id, selectedMemoryIds, setSelectedMemoryIds)
                }
              />

              <SelectableList
                emptyText="No skills saved yet. Prompt generation still works with project data only."
                items={skills.map((skill) => ({
                  id: skill.id,
                  meta: `${skill.targetAgent} · ${skill.category}`,
                  title: skill.name
                }))}
                label="Selected skills"
                selectedIds={selectedSkillIds}
                onToggle={(id) =>
                  toggleSelected(id, selectedSkillIds, setSelectedSkillIds)
                }
              />

              <SelectableList
                emptyText="No secrets available for this project yet. Prompt generation still works without secret references."
                items={availableSecrets.map((secret) => ({
                  id: secret.id,
                  meta: `${secret.provider} · ${secret.projectId === "global" ? "Global" : "Project"}`,
                  title: `${secret.name} · ${secret.reference}`
                }))}
                label="Secret references"
                selectedIds={selectedSecretIds}
                onToggle={(id) =>
                  toggleSelected(id, selectedSecretIds, setSelectedSecretIds)
                }
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={!selectedProject || !task.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Prompt
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleCopyPrompt()}
                  disabled={!generatedPrompt}
                >
                  <Copy className="h-4 w-4" />
                  {copyLabel}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveSession}
                  disabled={!generatedPrompt}
                >
                  <Save className="h-4 w-4" />
                  Save as Session
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Prompt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedPrompt ? (
                <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-6 text-foreground">
                  {generatedPrompt}
                </pre>
              ) : (
                <div className="rounded-lg border border-dashed bg-background/60 p-8 text-center">
                  <Clipboard className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Fill in the task and generate a prompt to preview it here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Saved Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessionsLoaded ? null : sessions.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No saved prompt sessions yet.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  onCopy={handleCopyPrompt}
                  onDelete={deleteSession}
                  session={session}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function SelectableList({
  emptyText,
  items,
  label,
  onToggle,
  selectedIds
}: {
  emptyText: string;
  items: Array<{ id: string; meta: string; title: string }>;
  label: string;
  onToggle: (id: string) => void;
  selectedIds: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="grid max-h-56 gap-2 overflow-auto rounded-lg border bg-background/40 p-2">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm hover:bg-secondary"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggle(item.id)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="line-clamp-2 block text-foreground">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.meta}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
