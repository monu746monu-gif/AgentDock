"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Search } from "lucide-react";
import { CreateMemoryDialog } from "@/components/create-memory-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MemoryCard } from "@/components/memory-card";
import { IMPORTANCE_LEVELS, ImportanceLevel } from "@/lib/memories";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";

type ImportanceFilter = "All" | ImportanceLevel;

export default function MemoryPage() {
  const { addMemory, deleteMemory, isLoaded, memories } = useMemories();
  const { projects } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [importanceFilter, setImportanceFilter] = useState<ImportanceFilter>("All");

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const filteredMemories = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return memories.filter((memory) => {
      const matchesText =
        !normalizedSearch ||
        memory.content.toLowerCase().includes(normalizedSearch) ||
        memory.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
      const matchesProject =
        projectFilter === "All" || memory.projectId === projectFilter;
      const matchesImportance =
        importanceFilter === "All" || memory.importance === importanceFilter;

      return matchesText && matchesProject && matchesImportance;
    });
  }, [importanceFilter, memories, projectFilter, searchQuery]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Project Memory</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Memory</h1>
          <p className="mt-2 text-muted-foreground">
            Save reusable context for future prompts and agent instructions.
          </p>
        </div>
        <CreateMemoryDialog onCreateMemory={addMemory} projects={projects} />
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-[1fr_220px_180px]">
        <div className="grid gap-2">
          <Label htmlFor="memory-search">Search memory text</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="memory-search"
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search content or tags"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="project-filter">Project</Label>
          <Select
            id="project-filter"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="All">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="importance-filter">Importance</Label>
          <Select
            id="importance-filter"
            value={importanceFilter}
            onChange={(event) =>
              setImportanceFilter(event.target.value as ImportanceFilter)
            }
          >
            <option value="All">All levels</option>
            {IMPORTANCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!isLoaded ? null : memories.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <BookOpenText className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">No memories yet. Save your first project memory.</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No memories match those filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onDelete={deleteMemory}
              project={projectsById.get(memory.projectId)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
