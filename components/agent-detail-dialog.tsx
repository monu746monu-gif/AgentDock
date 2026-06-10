"use client";

import { Copy, Sparkles } from "lucide-react";
import {
  Agent,
  generateAgentSetupContext,
  getAgentMemories,
  getAgentSecrets,
  getAgentSkills
} from "@/lib/agents";
import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { PromptSession } from "@/lib/sessions";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type AgentDetailDialogProps = {
  agent: Agent | null;
  memories: Memory[];
  onCopy: (content: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  project?: Project;
  secrets: Secret[];
  sessions: PromptSession[];
  skills: Skill[];
};

export function AgentDetailDialog({
  agent,
  memories,
  onCopy,
  onOpenChange,
  open,
  project,
  secrets,
  sessions,
  skills
}: AgentDetailDialogProps) {
  if (!agent) {
    return null;
  }

  const allowedMemories = getAgentMemories(agent, memories);
  const allowedSkills = getAgentSkills(agent, skills);
  const allowedSecrets = getAgentSecrets(agent, secrets);
  const agentSessions = sessions.filter((session) => session.agentId === agent.id);
  const setupContext = generateAgentSetupContext({
    agent,
    memories: allowedMemories,
    project,
    secrets: allowedSecrets,
    sessions: agentSessions,
    skills: allowedSkills
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent.name}</DialogTitle>
          <DialogDescription>
            {agent.type} · {agent.provider} · {agent.status}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <Summary title="Connected project" items={[project?.name ?? "Unknown project"]} />
          <Summary title="Available memories" items={allowedMemories.map((memory) => memory.content)} />
          <Summary title="Available skills" items={allowedSkills.map((skill) => skill.name)} />
          <Summary
            title="Available secret references"
            items={allowedSecrets.map((secret) => secret.reference)}
          />
          <Summary
            title="Recent sessions"
            items={agentSessions.slice(0, 5).map((session) => session.title)}
          />

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Generated setup context</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => onCopy(setupContext)}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border bg-background/60 p-4 text-sm leading-6">
              {setupContext}
            </pre>
          </div>

          <Button type="button" onClick={() => onCopy(setupContext)}>
            <Sparkles className="h-4 w-4" />
            Generate Setup Context
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-4">
      <p className="text-sm font-medium">{title}</p>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">None configured.</p>
      ) : (
        <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="line-clamp-2">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
