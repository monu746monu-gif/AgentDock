"use client";

import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { CreateSessionDialog } from "@/components/create-session-dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionCard } from "@/components/session-card";
import { SessionDetailDialog } from "@/components/session-detail-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useProjects } from "@/hooks/use-projects";
import { useSessions } from "@/hooks/use-sessions";
import {
  SESSION_STATUSES,
  SESSION_TYPES,
  SessionStatus,
  SessionType
} from "@/lib/sessions";
import { TARGET_AGENTS, TargetAgent } from "@/lib/skills";

type AgentFilter = "All" | TargetAgent;
type StatusFilter = "All" | SessionStatus;
type TypeFilter = "All" | SessionType;

export default function SessionsPage() {
  const { projects } = useProjects();
  const {
    addSession,
    deleteSession,
    isLoaded,
    sessions,
    updateSessionStatus
  } = useSessions();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects]
  );

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions]
  );

  const filteredSessions = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        !normalizedSearch ||
        session.title.toLowerCase().includes(normalizedSearch) ||
        session.task.toLowerCase().includes(normalizedSearch) ||
        session.prompt.toLowerCase().includes(normalizedSearch);
      const matchesProject =
        projectFilter === "All" || session.projectId === projectFilter;
      const matchesAgent =
        agentFilter === "All" || session.targetAgent === agentFilter;
      const matchesStatus =
        statusFilter === "All" || session.status === statusFilter;
      const matchesType = typeFilter === "All" || session.type === typeFilter;

      return (
        matchesSearch &&
        matchesProject &&
        matchesAgent &&
        matchesStatus &&
        matchesType
      );
    });
  }, [agentFilter, projectFilter, searchQuery, sessions, statusFilter, typeFilter]);

  const handleCopy = async (prompt: string) => {
    if (!prompt) {
      return;
    }

    await navigator.clipboard.writeText(prompt);
  };

  const handleDelete = (sessionId: string) => {
    deleteSession(sessionId);
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Agent History</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Sessions</h1>
          <p className="mt-2 text-muted-foreground">
            View generated prompts, coding tasks, handoffs, and saved agent work.
          </p>
        </div>
        <CreateSessionDialog onCreateSession={addSession} projects={projects} />
      </div>

      <div className="mt-8 grid gap-4 rounded-lg border bg-card p-4 xl:grid-cols-[1fr_180px_180px_180px_180px]">
        <div className="grid gap-2">
          <Label htmlFor="session-search">Search sessions</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="session-search"
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search title, task, or prompt"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="session-project-filter">Project</Label>
          <Select
            id="session-project-filter"
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
          <Label htmlFor="session-agent-filter">Agent</Label>
          <Select
            id="session-agent-filter"
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
          <Label htmlFor="session-status-filter">Status</Label>
          <Select
            id="session-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="All">All statuses</option>
            {SESSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="session-type-filter">Type</Label>
          <Select
            id="session-type-filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
          >
            <option value="All">All types</option>
            {SESSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {!isLoaded ? null : sessions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <History className="mx-auto mb-4 h-8 w-8 text-primary" />
          <p className="text-lg font-medium">
            No sessions yet. Generate a prompt or create your first agent session.
          </p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-card p-8 text-center">
          <p className="text-lg font-medium">No sessions match those filters.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onOpen={() => setSelectedSessionId(session.id)}
              session={session}
            />
          ))}
        </div>
      )}

      <SessionDetailDialog
        onCopy={handleCopy}
        onDelete={handleDelete}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSessionId(null);
          }
        }}
        onStatusChange={updateSessionStatus}
        open={Boolean(selectedSession)}
        project={selectedSession ? projectsById.get(selectedSession.projectId) : undefined}
        session={selectedSession}
      />
    </DashboardLayout>
  );
}
