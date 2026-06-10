"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Workflow } from "lucide-react";
import { AgentCard } from "@/components/agent-card";
import { AgentDetailDialog } from "@/components/agent-detail-dialog";
import { AgentFormDialog } from "@/components/agent-form-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  AGENT_PROVIDERS,
  AGENT_STATUSES,
  AGENT_TYPES,
  Agent,
  AgentProvider,
  AgentStatus,
  AgentType
} from "@/lib/agents";
import { useAgents } from "@/hooks/use-agents";
import { useMemories } from "@/hooks/use-memories";
import { useProjects } from "@/hooks/use-projects";
import { useSecrets } from "@/hooks/use-secrets";
import { useSessions } from "@/hooks/use-sessions";
import { useSkills } from "@/hooks/use-skills";

type TypeFilter = "All" | AgentType;
type ProviderFilter = "All" | AgentProvider;
type StatusFilter = "All" | AgentStatus;

export default function AgentsPage() {
  const {
    addAgent,
    addStarterAgents,
    agents,
    deleteAgent,
    isLoaded,
    updateAgent
  } = useAgents();
  const { memories } = useMemories();
  const { projects } = useProjects();
  const { secrets } = useSecrets();
  const { sessions } = useSessions();
  const { skills } = useSkills();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  const filteredAgents = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        !normalizedSearch ||
        agent.name.toLowerCase().includes(normalizedSearch) ||
        agent.type.toLowerCase().includes(normalizedSearch) ||
        agent.provider.toLowerCase().includes(normalizedSearch) ||
        agent.notes.toLowerCase().includes(normalizedSearch);
      const matchesType = typeFilter === "All" || agent.type === typeFilter;
      const matchesProvider =
        providerFilter === "All" || agent.provider === providerFilter;
      const matchesStatus =
        statusFilter === "All" || agent.status === statusFilter;
      const matchesProject =
        projectFilter === "All" || agent.projectId === projectFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesProvider &&
        matchesStatus &&
        matchesProject
      );
    });
  }, [agents, projectFilter, providerFilter, searchQuery, statusFilter, typeFilter]);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleAddStarterAgents = () => {
    const projectId = projects[0]?.id;

    if (projectId) {
      addStarterAgents(projectId);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Agent Registry</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Agents</h1>
          <p className="mt-2 text-muted-foreground">
            Register AI coding agents and control their project context access.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddStarterAgents}
            disabled={projects.length === 0}
          >
            <Workflow className="h-4 w-4" />
            Add Starter Agents
          </Button>
          <AgentFormDialog
            memories={memories}
            onSave={addAgent}
            projects={projects}
            secrets={secrets}
            skills={skills}
            trigger={
              <Button disabled={projects.length === 0}>
                <Plus className="h-4 w-4" />
                Register Agent
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border bg-card p-4 xl:grid-cols-[1fr_160px_180px_160px_200px]">
        <div className="grid gap-2">
          <Label htmlFor="agent-search">Search agents</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="agent-search"
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, type, provider, notes"
            />
          </div>
        </div>
        <FilterSelect label="Type" value={typeFilter} values={AGENT_TYPES} onChange={(value) => setTypeFilter(value as TypeFilter)} />
        <FilterSelect label="Provider" value={providerFilter} values={AGENT_PROVIDERS} onChange={(value) => setProviderFilter(value as ProviderFilter)} />
        <FilterSelect label="Status" value={statusFilter} values={AGENT_STATUSES} onChange={(value) => setStatusFilter(value as StatusFilter)} />
        <div className="grid gap-2">
          <Label htmlFor="agent-project-filter">Project</Label>
          <Select
            id="agent-project-filter"
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
      </div>

      {!isLoaded ? null : agents.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <Workflow className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            No agents yet. Register your first AI agent.
          </p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No agents match those filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={deleteAgent}
              onEdit={setEditingAgent}
              onOpen={(item) => setSelectedAgentId(item.id)}
              project={projectsById.get(agent.projectId)}
            />
          ))}
        </div>
      )}

      {editingAgent ? (
        <AgentFormDialog
          agent={editingAgent}
          memories={memories}
          open={Boolean(editingAgent)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingAgent(null);
            }
          }}
          onSave={(input) => {
            updateAgent(editingAgent.id, input);
            setEditingAgent(null);
          }}
          projects={projects}
          secrets={secrets}
          skills={skills}
        />
      ) : null}

      <AgentDetailDialog
        agent={selectedAgent}
        memories={memories}
        onCopy={handleCopy}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAgentId(null);
          }
        }}
        open={Boolean(selectedAgent)}
        project={selectedAgent ? projectsById.get(selectedAgent.projectId) : undefined}
        secrets={secrets}
        sessions={sessions}
        skills={skills}
      />
    </DashboardLayout>
  );
}

function FilterSelect({
  label,
  onChange,
  value,
  values
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  values: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="All">All</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
    </div>
  );
}
