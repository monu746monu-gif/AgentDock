"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
  AGENT_PROVIDERS,
  AGENT_STATUSES,
  AGENT_TYPES,
  Agent,
  AgentInput,
  AgentProvider,
  AgentStatus,
  AgentType,
  MEMORY_ACCESS_OPTIONS,
  MemoryAccess,
  SECRETS_ACCESS_OPTIONS,
  SKILLS_ACCESS_OPTIONS,
  SecretsAccess,
  SkillsAccess
} from "@/lib/agents";
import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectableList } from "@/components/selectable-list";

type AgentFormDialogProps = {
  agent?: Agent;
  memories: Memory[];
  onSave: (agent: AgentInput) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  projects: Project[];
  secrets: Secret[];
  skills: Skill[];
  trigger?: ReactNode;
};

function createInitialAgent(projectId: string, agent?: Agent): AgentInput {
  return agent
    ? {
        name: agent.name,
        type: agent.type,
        provider: agent.provider,
        description: agent.description,
        projectId: agent.projectId,
        memoryAccess: agent.memoryAccess,
        selectedMemoryIds: agent.selectedMemoryIds,
        skillsAccess: agent.skillsAccess,
        selectedSkillIds: agent.selectedSkillIds,
        secretsAccess: agent.secretsAccess,
        selectedSecretIds: agent.selectedSecretIds,
        status: agent.status,
        notes: agent.notes
      }
    : {
        name: "",
        type: "Codex",
        provider: "OpenAI",
        description: "",
        projectId,
        memoryAccess: "All project memories",
        selectedMemoryIds: [],
        skillsAccess: "All skills",
        selectedSkillIds: [],
        secretsAccess: "No secrets access",
        selectedSecretIds: [],
        status: "Active",
        notes: ""
      };
}

export function AgentFormDialog({
  agent,
  memories,
  onOpenChange,
  onSave,
  open: controlledOpen,
  projects,
  secrets,
  skills,
  trigger
}: AgentFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [form, setForm] = useState<AgentInput>(
    createInitialAgent(projects[0]?.id ?? "", agent)
  );

  const projectMemories = memories.filter((memory) => memory.projectId === form.projectId);
  const availableSecrets = secrets.filter(
    (secret) => secret.projectId === "global" || secret.projectId === form.projectId
  );

  const updateField = <Field extends keyof AgentInput>(
    field: Field,
    value: AgentInput[Field]
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const toggleSelected = (
    id: string,
    selectedIds: string[],
    field: "selectedMemoryIds" | "selectedSkillIds" | "selectedSecretIds"
  ) => {
    updateField(
      field,
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.projectId) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      notes: form.notes.trim()
    });
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !agent) {
      setForm(createInitialAgent(projects[0]?.id ?? "", agent));
    }

    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? "Edit agent" : "Register agent"}</DialogTitle>
          <DialogDescription>
            Configure what project context this coding agent can use.
          </DialogDescription>
        </DialogHeader>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
            Create a project before registering agents.
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="agent-name">Agent name</Label>
              <Input
                id="agent-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Codex Assistant"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                id="agent-type"
                label="Agent type"
                value={form.type}
                values={AGENT_TYPES}
                onChange={(value) => updateField("type", value as AgentType)}
              />
              <SelectField
                id="agent-provider"
                label="Provider"
                value={form.provider}
                values={AGENT_PROVIDERS}
                onChange={(value) => updateField("provider", value as AgentProvider)}
              />
              <SelectField
                id="agent-status"
                label="Status"
                value={form.status}
                values={AGENT_STATUSES}
                onChange={(value) => updateField("status", value as AgentStatus)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agent-project">Connected project</Label>
              <Select
                id="agent-project"
                value={form.projectId}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    projectId: event.target.value,
                    selectedMemoryIds: [],
                    selectedSecretIds: []
                  }))
                }
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agent-description">Description</Label>
              <Textarea
                id="agent-description"
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="How this agent should be used."
              />
            </div>

            <SelectField
              id="agent-memory-access"
              label="Selected memories access"
              value={form.memoryAccess}
              values={MEMORY_ACCESS_OPTIONS}
              onChange={(value) => updateField("memoryAccess", value as MemoryAccess)}
            />
            {form.memoryAccess === "Selected memories" ? (
              <SelectableList
                emptyText="No memories for this project yet."
                items={projectMemories.map((memory) => ({
                  id: memory.id,
                  meta: memory.importance,
                  title: memory.content
                }))}
                label="Allowed memories"
                selectedIds={form.selectedMemoryIds}
                onToggle={(id) =>
                  toggleSelected(id, form.selectedMemoryIds, "selectedMemoryIds")
                }
              />
            ) : null}

            <SelectField
              id="agent-skills-access"
              label="Selected skills access"
              value={form.skillsAccess}
              values={SKILLS_ACCESS_OPTIONS}
              onChange={(value) => updateField("skillsAccess", value as SkillsAccess)}
            />
            {form.skillsAccess === "Selected skills" ? (
              <SelectableList
                emptyText="No skills saved yet."
                items={skills.map((skill) => ({
                  id: skill.id,
                  meta: `${skill.targetAgent} · ${skill.category}`,
                  title: skill.name
                }))}
                label="Allowed skills"
                selectedIds={form.selectedSkillIds}
                onToggle={(id) =>
                  toggleSelected(id, form.selectedSkillIds, "selectedSkillIds")
                }
              />
            ) : null}

            <SelectField
              id="agent-secrets-access"
              label="Selected secrets access"
              value={form.secretsAccess}
              values={SECRETS_ACCESS_OPTIONS}
              onChange={(value) => updateField("secretsAccess", value as SecretsAccess)}
            />
            {form.secretsAccess === "Selected secret references only" ? (
              <SelectableList
                emptyText="No secret references available for this project."
                items={availableSecrets.map((secret) => ({
                  id: secret.id,
                  meta: `${secret.provider} · ${secret.projectId === "global" ? "Global" : "Project"}`,
                  title: `${secret.name} · ${secret.reference}`
                }))}
                label="Allowed secret references"
                selectedIds={form.selectedSecretIds}
                onToggle={(id) =>
                  toggleSelected(id, form.selectedSecretIds, "selectedSecretIds")
                }
              />
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="agent-notes">Notes</Label>
              <Textarea
                id="agent-notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Environment notes, preferred usage, or setup reminders."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{agent ? "Save changes" : "Register agent"}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  id,
  label,
  onChange,
  value,
  values
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
    </div>
  );
}
