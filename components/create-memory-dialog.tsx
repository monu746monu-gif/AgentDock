"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Plus } from "lucide-react";
import {
  IMPORTANCE_LEVELS,
  ImportanceLevel,
  MemoryInput,
  parseTags
} from "@/lib/memories";
import { Project } from "@/lib/projects";
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

type MemoryForm = {
  projectId: string;
  content: string;
  tags: string;
  importance: ImportanceLevel;
};

type CreateMemoryDialogProps = {
  defaultProjectId?: string;
  onCreateMemory: (memory: MemoryInput) => void;
  projects: Project[];
  trigger?: ReactNode;
};

export function CreateMemoryDialog({
  defaultProjectId,
  onCreateMemory,
  projects,
  trigger
}: CreateMemoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MemoryForm>({
    projectId: defaultProjectId ?? "",
    content: "",
    tags: "",
    importance: "Medium"
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm((currentForm) => ({
        ...currentForm,
        projectId: defaultProjectId ?? currentForm.projectId ?? projects[0]?.id ?? ""
      }));
    }

    setOpen(nextOpen);
  };

  const updateField = <Field extends keyof MemoryForm>(
    field: Field,
    value: MemoryForm[Field]
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.projectId || !form.content.trim()) {
      return;
    }

    onCreateMemory({
      projectId: form.projectId,
      content: form.content.trim(),
      tags: parseTags(form.tags),
      importance: form.importance
    });

    setForm({
      projectId: defaultProjectId ?? projects[0]?.id ?? "",
      content: "",
      tags: "",
      importance: "Medium"
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={projects.length === 0}>
            <Plus className="h-4 w-4" />
            Add Memory
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project memory</DialogTitle>
          <DialogDescription>
            Save important context your future coding agents should know.
          </DialogDescription>
        </DialogHeader>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card p-5 text-sm text-muted-foreground">
            Create a project before saving memories.
          </div>
        ) : (
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="memory-project">Project</Label>
              <Select
                id="memory-project"
                value={form.projectId}
                onChange={(event) => updateField("projectId", event.target.value)}
                disabled={Boolean(defaultProjectId)}
                required
              >
                <option value="" disabled>
                  Select project
                </option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="memory-content">Memory content</Label>
              <Textarea
                id="memory-content"
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                placeholder="Important architecture decision, project convention, bug context, or agent instruction."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="memory-tags">Tags</Label>
                <Input
                  id="memory-tags"
                  value={form.tags}
                  onChange={(event) => updateField("tags", event.target.value)}
                  placeholder="frontend, build, api"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="memory-importance">Importance</Label>
                <Select
                  id="memory-importance"
                  value={form.importance}
                  onChange={(event) =>
                    updateField("importance", event.target.value as ImportanceLevel)
                  }
                >
                  {IMPORTANCE_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save memory</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
