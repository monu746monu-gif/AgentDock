"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  Copy,
  Download,
  FileText,
  RotateCcw,
  Save,
  Sparkles
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { GeneratedFileCard } from "@/components/generated-file-card";
import { SelectableList } from "@/components/selectable-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  generateAgentSetupContext,
  getAgentMemories,
  getAgentSecrets,
  getAgentSkills
} from "@/lib/agents";
import { useAgents } from "@/hooks/use-agents";
import { useGeneratedFiles } from "@/hooks/use-generated-files";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";
import {
  AGENT_FILE_TYPES,
  AgentFileType,
  generateAgentFileContent,
  getAgentFileName
} from "@/lib/generated-files";
import { formatDate } from "@/lib/memories";

export default function GeneratePage() {
  const { agents } = useAgents();
  const {
    addGeneratedFile,
    deleteGeneratedFile,
    files,
    isLoaded: filesLoaded
  } = useGeneratedFiles();
  const { memories } = useMemories();
  const { isLoaded: projectsLoaded, projects } = useProjects();
  const { secrets } = useSecrets();
  const { addSession, sessions } = useSessions();
  const { skills } = useSkills();
  const [projectId, setProjectId] = useState("");
  const [agentId, setAgentId] = useState("none");
  const [fileType, setFileType] = useState<AgentFileType>("AGENTS.md for Codex");
  const [selectedMemoryIds, setSelectedMemoryIds] = useState<string[]>([]);
  const [selectedSecretIds, setSelectedSecretIds] = useState<string[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy");

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

  const projectSessions = useMemo(
    () =>
      selectedProject
        ? sessions.filter((session) => session.projectId === selectedProject.id)
        : [],
    [selectedProject, sessions]
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

  const selectedSessions = useMemo(
    () => sessions.filter((session) => selectedSessionIds.includes(session.id)),
    [selectedSessionIds, sessions]
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

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
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
    setSelectedSessionIds([]);
  };

  const handleGenerateFile = () => {
    const project = selectedProject;

    if (!project) {
      return;
    }

    setGeneratedContent(
      generateAgentFileContent({
        agentSetupContext,
        fileType,
        memories: selectedMemories,
        project,
        secrets: selectedSecrets,
        sessions: selectedSessions,
        skills: selectedSkills
      })
    );
  };

  const handleCopy = async (content = generatedContent) => {
    if (!content) {
      return;
    }

    await navigator.clipboard.writeText(content);
    setCopyLabel("Copied");
    window.setTimeout(() => setCopyLabel("Copy"), 1200);
  };

  const handleDownload = (fileName = getAgentFileName(fileType), content = generatedContent) => {
    if (!content) {
      return;
    }

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveGeneratedFile = () => {
    const project = selectedProject;

    if (!project || !generatedContent) {
      return;
    }

    addGeneratedFile({
      projectId: project.id,
      fileType,
      fileName: getAgentFileName(fileType),
      content: generatedContent
    });
  };

  const handleSaveAsSession = () => {
    const project = selectedProject;

    if (!project || !generatedContent) {
      return;
    }

    addSession({
      projectId: project.id,
      projectName: project.name,
      agentId: selectedAgent?.id,
      agentName: selectedAgent?.name,
      targetAgent: "General",
      title: `Generated ${getAgentFileName(fileType)}`,
      task: `Create ${fileType} for ${project.name}.`,
      prompt: generatedContent,
      status: "Draft",
      type: "Agent File"
    });
  };

  const handleClear = () => {
    setSelectedMemoryIds([]);
    setSelectedSecretIds([]);
    setSelectedSkillIds([]);
    setSelectedSessionIds([]);
    setGeneratedContent("");
    setCopyLabel("Copy");
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Agent File Generator</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Generate Files</h1>
          <p className="mt-2 text-muted-foreground">
            Create reusable agent instruction files from saved project context.
          </p>
        </div>
      </div>

      {projectsLoaded && projects.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <FileText className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            Create a project first before generating agent files.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card>
            <CardHeader>
              <CardTitle>File Inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="generate-agent-profile">Registered agent</Label>
                <Select
                  id="generate-agent-profile"
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
                <Label htmlFor="generate-project">Project</Label>
                <Select
                  id="generate-project"
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

              <div className="grid gap-2">
                <Label htmlFor="file-type">File type</Label>
                <Select
                  id="file-type"
                  value={fileType}
                  onChange={(event) => setFileType(event.target.value as AgentFileType)}
                >
                  {AGENT_FILE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <SelectableList
                emptyText="No memories for this project yet. File generation still works with project data only."
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
                emptyText="No skills saved yet. File generation still works with project data only."
                items={skills.map((skill) => ({
                  id: skill.id,
                  meta: `${skill.targetAgent} · ${skill.category}`,
                  title: skill.name
                }))}
                label="Relevant skills"
                selectedIds={selectedSkillIds}
                onToggle={(id) =>
                  toggleSelected(id, selectedSkillIds, setSelectedSkillIds)
                }
              />

              <SelectableList
                emptyText="No sessions saved for this project yet. File generation still works with project data only."
                items={projectSessions.map((session) => ({
                  id: session.id,
                  meta: `${session.targetAgent} · ${session.type} · ${session.status}`,
                  title: session.title
                }))}
                label="Recent sessions"
                selectedIds={selectedSessionIds}
                onToggle={(id) =>
                  toggleSelected(id, selectedSessionIds, setSelectedSessionIds)
                }
              />

              <SelectableList
                emptyText="No secrets available for this project yet. File generation still works without secret references."
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
                <Button type="button" onClick={handleGenerateFile} disabled={!selectedProject}>
                  <Sparkles className="h-4 w-4" />
                  Generate File
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleCopy()}
                  disabled={!generatedContent}
                >
                  <Copy className="h-4 w-4" />
                  {copyLabel}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDownload()}
                  disabled={!generatedContent}
                >
                  <Download className="h-4 w-4" />
                  Download .md
                </Button>
                <Button type="button" variant="outline" onClick={handleClear}>
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveGeneratedFile}
                  disabled={!generatedContent}
                >
                  Save to History
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAsSession}
                  disabled={!generatedContent}
                >
                  <Save className="h-4 w-4" />
                  Save as Session
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Markdown Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-6 text-foreground">
                  {generatedContent}
                </pre>
              ) : (
                <div className="rounded-lg border border-dashed bg-background/60 p-8 text-center">
                  <Clipboard className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Choose a file type and generate markdown to preview it here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Generated Files History</CardTitle>
        </CardHeader>
        <CardContent>
          {!filesLoaded ? null : files.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No generated files saved yet.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {files.map((file) => (
                <GeneratedFileCard
                  key={file.id}
                  file={file}
                  onCopy={handleCopy}
                  onDelete={deleteGeneratedFile}
                  onDownload={handleDownload}
                  project={projectsById.get(file.projectId)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
