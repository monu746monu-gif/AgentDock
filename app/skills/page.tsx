"use client";

import { useMemo, useState } from "react";
import { Search, WandSparkles } from "lucide-react";
import { CreateSkillDialog } from "@/components/create-skill-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SkillCard } from "@/components/skill-card";
import {
  SKILL_CATEGORIES,
  SkillCategory,
  TARGET_AGENTS,
  TargetAgent
} from "@/lib/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useSkills } from "@/hooks/use-skills";

type AgentFilter = "All" | TargetAgent;
type CategoryFilter = "All" | SkillCategory;

export default function SkillsPage() {
  const {
    addSkill,
    addStarterSkills,
    deleteSkill,
    isLoaded,
    skills
  } = useSkills();
  const [searchQuery, setSearchQuery] = useState("");
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");

  const filteredSkills = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesText =
        !normalizedSearch ||
        skill.name.toLowerCase().includes(normalizedSearch) ||
        skill.instructions.toLowerCase().includes(normalizedSearch);
      const matchesAgent =
        agentFilter === "All" || skill.targetAgent === agentFilter;
      const matchesCategory =
        categoryFilter === "All" || skill.category === categoryFilter;

      return matchesText && matchesAgent && matchesCategory;
    });
  }, [agentFilter, categoryFilter, searchQuery, skills]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Skills / Prompt Library</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Skills</h1>
          <p className="mt-2 text-muted-foreground">
            Save reusable instructions for AI coding agents.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={addStarterSkills}>
            <WandSparkles className="h-4 w-4" />
            Add Starter Skills
          </Button>
          <CreateSkillDialog onCreateSkill={addSkill} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_220px_220px]">
        <div className="grid gap-2">
          <Label htmlFor="skill-search">Search skills</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="skill-search"
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name or instructions"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="agent-filter">Target agent</Label>
          <Select
            id="agent-filter"
            value={agentFilter}
            onChange={(event) => setAgentFilter(event.target.value as AgentFilter)}
          >
            <option value="All">All agents</option>
            {TARGET_AGENTS.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category-filter">Category</Label>
          <Select
            id="category-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
          >
            <option value="All">All categories</option>
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!isLoaded ? null : skills.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <WandSparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            No skills yet. Create your first reusable AI skill.
          </p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No skills match those filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onDelete={deleteSkill} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
