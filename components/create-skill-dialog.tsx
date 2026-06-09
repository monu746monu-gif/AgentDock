"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import {
  SKILL_CATEGORIES,
  SkillCategory,
  SkillInput,
  TARGET_AGENTS,
  TargetAgent
} from "@/lib/skills";
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

const emptyForm: SkillInput = {
  name: "",
  description: "",
  instructions: "",
  targetAgent: "General",
  category: "General"
};

type CreateSkillDialogProps = {
  onCreateSkill: (skill: SkillInput) => void;
};

export function CreateSkillDialog({ onCreateSkill }: CreateSkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SkillInput>(emptyForm);

  const updateField = <Field extends keyof SkillInput>(
    field: Field,
    value: SkillInput[Field]
  ) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.instructions.trim()) {
      return;
    }

    onCreateSkill({
      name: form.name.trim(),
      description: form.description.trim(),
      instructions: form.instructions.trim(),
      targetAgent: form.targetAgent,
      category: form.category
    });

    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create reusable AI skill</DialogTitle>
          <DialogDescription>
            Save prompt instructions you can reuse across coding agents.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="skill-name">Skill name</Label>
            <Input
              id="skill-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="React UI Expert"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skill-description">Description</Label>
            <Textarea
              id="skill-description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Reusable guidance for building polished React interfaces."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skill-instructions">Instructions</Label>
            <Textarea
              id="skill-instructions"
              value={form.instructions}
              onChange={(event) => updateField("instructions", event.target.value)}
              placeholder="Act as a senior React UI engineer. Preserve existing patterns, verify responsive states, and keep components accessible."
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="target-agent">Target agent</Label>
              <Select
                id="target-agent"
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
              <Label htmlFor="skill-category">Category</Label>
              <Select
                id="skill-category"
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value as SkillCategory)
                }
              >
                {SKILL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save skill</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
