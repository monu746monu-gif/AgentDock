"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { ProjectInput } from "@/lib/projects";
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
import { Textarea } from "@/components/ui/textarea";

const emptyForm: ProjectInput = {
  name: "",
  description: "",
  techStack: "",
  repoUrl: "",
  runCommands: "",
  tasks: ""
};

type CreateProjectDialogProps = {
  onCreateProject: (project: ProjectInput) => void;
};

export function CreateProjectDialog({
  onCreateProject
}: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProjectInput>(emptyForm);

  const updateField = (field: keyof ProjectInput, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onCreateProject({
      name: form.name.trim(),
      description: form.description.trim(),
      techStack: form.techStack.trim(),
      repoUrl: form.repoUrl.trim(),
      runCommands: form.runCommands.trim(),
      tasks: form.tasks.trim()
    });

    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project brain</DialogTitle>
          <DialogDescription>
            Capture the working context an AI coding agent needs to understand this project.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="AgentDock"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Shared project brain for AI coding agents."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="tech-stack">Tech stack</Label>
              <Input
                id="tech-stack"
                value={form.techStack}
                onChange={(event) => updateField("techStack", event.target.value)}
                placeholder="Next.js, TypeScript, Tailwind"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="repo-url">Repo URL</Label>
              <Input
                id="repo-url"
                type="url"
                value={form.repoUrl}
                onChange={(event) => updateField("repoUrl", event.target.value)}
                placeholder="https://github.com/acme/project"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="run-commands">Run commands</Label>
            <Textarea
              id="run-commands"
              value={form.runCommands}
              onChange={(event) => updateField("runCommands", event.target.value)}
              placeholder={"npm install\nnpm run dev"}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tasks">Current tasks or bugs</Label>
            <Textarea
              id="tasks"
              value={form.tasks}
              onChange={(event) => updateField("tasks", event.target.value)}
              placeholder={"Fix project cards on mobile\nAdd dashboard stats"}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
