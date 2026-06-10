"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Project } from "@/lib/projects";
import {
  PromptSessionInput,
  SESSION_STATUSES,
  SESSION_TYPES,
  SessionStatus,
  SessionType
} from "@/lib/sessions";
import { TARGET_AGENTS, TargetAgent } from "@/lib/skills";
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

type SessionForm = {
  projectId: string;
  title: string;
  targetAgent: TargetAgent;
  type: SessionType;
  task: string;
  prompt: string;
  status: SessionStatus;
};

type CreateSessionDialogProps = {
  onCreateSession: (session: PromptSessionInput) => void;
  projects: Project[];
};

export function CreateSessionDialog({
  onCreateSession,
  projects
}: CreateSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SessionForm>({
    projectId: "",
    title: "",
    targetAgent: "General",
    type: "Prompt",
    task: "",
    prompt: "",
    status: "Draft"
  });

  const updateField = <Field extends keyof SessionForm>(
    field: Field,
    value: SessionForm[Field]
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm((currentForm) => ({
        ...currentForm,
        projectId: currentForm.projectId || projects[0]?.id || ""
      }));
    }

    setOpen(nextOpen);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const project = projects.find((item) => item.id === form.projectId);

    if (!project || !form.title.trim() || !form.task.trim()) {
      return;
    }

    onCreateSession({
      projectId: project.id,
      projectName: project.name,
      targetAgent: form.targetAgent,
      title: form.title.trim(),
      task: form.task.trim(),
      prompt: form.prompt.trim(),
      status: form.status,
      type: form.type
    });

    setForm({
      projectId: project.id,
      title: "",
      targetAgent: "General",
      type: "Prompt",
      task: "",
      prompt: "",
      status: "Draft"
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={projects.length === 0}>
          <Plus className="h-4 w-4" />
          Create Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create agent session</DialogTitle>
          <DialogDescription>
            Save a prompt, task, handoff, or work note to continue later.
          </DialogDescription>
        </DialogHeader>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
            Create a project before creating sessions.
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="session-project">Project</Label>
              <Select
                id="session-project"
                value={form.projectId}
                onChange={(event) => updateField("projectId", event.target.value)}
                required
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-title">Session title</Label>
              <Input
                id="session-title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Fix dashboard memory stats"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="session-agent">Target agent</Label>
                <Select
                  id="session-agent"
                  value={form.targetAgent}
                  onChange={(event) =>
                    updateField("targetAgent", event.target.value as TargetAgent)
                  }
                >
                  {TARGET_AGENTS.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session-type">Type</Label>
                <Select
                  id="session-type"
                  value={form.type}
                  onChange={(event) =>
                    updateField("type", event.target.value as SessionType)
                  }
                >
                  {SESSION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session-status">Status</Label>
                <Select
                  id="session-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as SessionStatus)
                  }
                >
                  {SESSION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-task">Task</Label>
              <Textarea
                id="session-task"
                value={form.task}
                onChange={(event) => updateField("task", event.target.value)}
                placeholder="What should the agent work on?"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="session-prompt">Prompt / notes</Label>
              <Textarea
                id="session-prompt"
                value={form.prompt}
                onChange={(event) => updateField("prompt", event.target.value)}
                placeholder="Paste the prompt, agent notes, or handoff context."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save session</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
