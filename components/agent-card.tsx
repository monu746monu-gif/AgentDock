"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Agent } from "@/lib/agents";
import { formatDate } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AgentCardProps = {
  agent: Agent;
  onDelete: (agentId: string) => void;
  onEdit: (agent: Agent) => void;
  onOpen: (agent: Agent) => void;
  project?: Project;
};

export function AgentCard({ agent, onDelete, onEdit, onOpen, project }: AgentCardProps) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {project?.name ?? "Unknown project"}
            </p>
          </div>
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {agent.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border bg-secondary px-2 py-1">{agent.type}</span>
          <span className="rounded-md border bg-secondary px-2 py-1">{agent.provider}</span>
          <span className="rounded-md border bg-secondary px-2 py-1">
            Created {formatDate(agent.createdAt)}
          </span>
        </div>
        <div className="grid gap-1 text-sm text-muted-foreground">
          <p>Memory: {agent.memoryAccess}</p>
          <p>Skills: {agent.skillsAccess}</p>
          <p>Secrets: {agent.secretsAccess}</p>
        </div>
        {agent.notes ? (
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {agent.notes}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(agent)}>
            Open
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(agent)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onDelete(agent.id)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
