"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { Project } from "@/lib/projects";
import { SECRET_PROVIDERS, SecretInput, SecretProvider } from "@/lib/secrets";
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

type SecretForm = {
  name: string;
  provider: SecretProvider;
  projectId: string | "global";
  value: string;
  notes: string;
};

type CreateSecretDialogProps = {
  onCreateSecret: (secret: SecretInput) => void;
  projects: Project[];
};

export function CreateSecretDialog({
  onCreateSecret,
  projects
}: CreateSecretDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SecretForm>({
    name: "",
    provider: "OpenAI",
    projectId: "global",
    value: "",
    notes: ""
  });

  const updateField = <Field extends keyof SecretForm>(
    field: Field,
    value: SecretForm[Field]
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.value.trim()) {
      return;
    }

    onCreateSecret({
      name: form.name.trim(),
      provider: form.provider,
      projectId: form.projectId,
      value: form.value.trim(),
      notes: form.notes.trim()
    });

    setForm({
      name: "",
      provider: "OpenAI",
      projectId: "global",
      value: "",
      notes: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Secret
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add secret reference</DialogTitle>
          <DialogDescription>
            Store an MVP-only local API key reference for prompts and generated files.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="secret-name">Secret name</Label>
            <Input
              id="secret-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="OPENAI_API_KEY"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="secret-provider">Provider</Label>
              <Select
                id="secret-provider"
                value={form.provider}
                onChange={(event) =>
                  updateField("provider", event.target.value as SecretProvider)
                }
              >
                {SECRET_PROVIDERS.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secret-project">Project access</Label>
              <Select
                id="secret-project"
                value={form.projectId}
                onChange={(event) => updateField("projectId", event.target.value)}
              >
                <option value="global">Global</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secret-value">Secret value</Label>
            <Input
              id="secret-value"
              type="password"
              value={form.value}
              onChange={(event) => updateField("value", event.target.value)}
              placeholder="Paste API key"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secret-notes">Notes</Label>
            <Textarea
              id="secret-notes"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Used for local prompt generation demos."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save secret</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
