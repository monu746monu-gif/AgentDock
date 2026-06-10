"use client";

import { useMemo, useState } from "react";
import { Clipboard, Copy, Download, Save, Shuffle, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { HandoffCard } from "@/components/handoff-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAgents } from "@/hooks/use-agents";
import { useGeneratedFiles } from "@/hooks/use-generated-files";
import { useHandoffs } from "@/hooks/use-handoffs";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";
import {
  DEFAULT_INCLUDED_SECTIONS,
  HANDOFF_TARGETS,
  HandoffTarget,
  IncludedSections,
  generateHandoffPackage
} from "@/lib/handoffs";

export default function HandoffPage() {
  const { agents } = useAgents();
  const { files } = useGeneratedFiles();
  const { addHandoff, deleteHandoff, handoffs, isLoaded } = useHandoffs();
  const { memories } = useMemories();
  const { projects } = useProjects();
  const { secrets } = useSecrets();
  const { addSession, sessions } = useSessions();
  const { skills } = useSkills();
  const [agentId, setAgentId] = useState("");
  const [exportTarget, setExportTarget] = useState<HandoffTarget>("General");
  const [includedSections, setIncludedSections] = useState<IncludedSections>(
    DEFAULT_INCLUDED_SECTIONS
  );
  const [content, setContent] = useState("");

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === agentId) ?? agents[0],
    [agentId, agents]
  );
  const connectedProject = useMemo(
    () => projects.find((project) => project.id === selectedAgent?.projectId),
    [projects, selectedAgent]
  );
  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const handleToggle = (key: keyof IncludedSections) => {
    setIncludedSections((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleGenerate = () => {
    if (!selectedAgent) {
      return;
    }

    setContent(
      generateHandoffPackage({
        agent: selectedAgent,
        exportTarget,
        generatedFiles: files,
        includedSections,
        memories,
        project: connectedProject,
        secrets,
        sessions,
        skills
      })
    );
  };

  const handleCopy = async (value = content) => {
    if (value) {
      await navigator.clipboard.writeText(value);
    }
  };

  const handleDownload = (fileName = "agentdock-handoff.md", value = content) => {
    if (!value) {
      return;
    }

    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!selectedAgent || !content) {
      return;
    }

    addHandoff({
      agentId: selectedAgent.id,
      sourceAgentName: selectedAgent.name,
      exportTarget,
      projectId: selectedAgent.projectId,
      content,
      includedSections
    });

    addSession({
      projectId: selectedAgent.projectId,
      projectName: connectedProject?.name ?? "Unknown project",
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      targetAgent: exportTarget,
      title: `Handoff from ${selectedAgent.name} to ${exportTarget}`,
      task: "Continue from this exported AgentDock handoff package.",
      prompt: content,
      status: "Draft",
      type: "Agent Handoff"
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Agent Setup Export</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Handoff</h1>
          <p className="mt-2 text-muted-foreground">
            Export portable setup context from one registered agent to another tool.
          </p>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <Shuffle className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            Register an agent first before creating a handoff.
          </p>
        </div>
      ) : selectedAgent && !connectedProject ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">Connect this agent to a project first.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Handoff Inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="handoff-agent">Registered agent</Label>
                <Select
                  id="handoff-agent"
                  value={selectedAgent?.id ?? ""}
                  onChange={(event) => setAgentId(event.target.value)}
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="handoff-target">Export target</Label>
                <Select
                  id="handoff-target"
                  value={exportTarget}
                  onChange={(event) => setExportTarget(event.target.value as HandoffTarget)}
                >
                  {HANDOFF_TARGETS.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-3 rounded-lg border bg-background/50 p-4">
                {Object.entries(includedSections).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between gap-3 text-sm">
                    <span>{sectionLabel(key as keyof IncludedSections)}</span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleToggle(key as keyof IncludedSections)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="button" onClick={handleGenerate}>
                  <Sparkles className="h-4 w-4" />
                  Generate Handoff Package
                </Button>
                <Button type="button" variant="secondary" disabled={!content} onClick={() => handleCopy()}>
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button type="button" variant="secondary" disabled={!content} onClick={() => handleDownload()}>
                  <Download className="h-4 w-4" />
                  Download .md
                </Button>
                <Button type="button" variant="outline" disabled={!content} onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  Save Handoff
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Handoff Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {content ? (
                <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap rounded-lg border bg-background p-4 text-sm leading-6 text-foreground">
                  {content}
                </pre>
              ) : (
                <div className="rounded-lg border border-dashed bg-background/60 p-8 text-center">
                  <Clipboard className="mx-auto mb-4 h-8 w-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Generate a handoff package to preview it here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Handoff History</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoaded ? null : handoffs.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-5 text-sm text-muted-foreground">
              No handoffs saved yet.
            </p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {handoffs.map((handoff) => (
                <HandoffCard
                  key={handoff.id}
                  handoff={handoff}
                  onCopy={handleCopy}
                  onDelete={deleteHandoff}
                  onDownload={handleDownload}
                  project={projectsById.get(handoff.projectId)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function sectionLabel(key: keyof IncludedSections) {
  const labels: Record<keyof IncludedSections, string> = {
    projectContext: "Include project context",
    memories: "Include memories",
    skills: "Include skills",
    secrets: "Include secret references",
    sessions: "Include recent sessions",
    generatedFiles: "Include generated files"
  };

  return labels[key];
}
