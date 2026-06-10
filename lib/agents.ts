import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { PromptSession } from "@/lib/sessions";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";

export type AgentType =
  | "Codex"
  | "Claude"
  | "Cursor"
  | "OpenClaw"
  | "Hermes"
  | "ChatGPT"
  | "Cline"
  | "Custom";

export type AgentProvider =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "OpenRouter"
  | "Local"
  | "Other";

export type AgentStatus = "Active" | "Paused" | "Testing";

export type MemoryAccess =
  | "All project memories"
  | "Selected memories"
  | "No memory access";

export type SkillsAccess = "All skills" | "Selected skills" | "No skills access";

export type SecretsAccess =
  | "Selected secret references only"
  | "No secrets access";

export type Agent = {
  id: string;
  name: string;
  type: AgentType;
  provider: AgentProvider;
  description: string;
  projectId: string;
  memoryAccess: MemoryAccess;
  selectedMemoryIds: string[];
  skillsAccess: SkillsAccess;
  selectedSkillIds: string[];
  secretsAccess: SecretsAccess;
  selectedSecretIds: string[];
  status: AgentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type AgentInput = Omit<Agent, "id" | "createdAt" | "updatedAt">;

export const AGENTS_STORAGE_KEY = "agentdock-agents";

export const AGENT_TYPES: AgentType[] = [
  "Codex",
  "Claude",
  "Cursor",
  "OpenClaw",
  "Hermes",
  "ChatGPT",
  "Cline",
  "Custom"
];

export const AGENT_PROVIDERS: AgentProvider[] = [
  "OpenAI",
  "Anthropic",
  "Google",
  "OpenRouter",
  "Local",
  "Other"
];

export const AGENT_STATUSES: AgentStatus[] = ["Active", "Paused", "Testing"];

export const MEMORY_ACCESS_OPTIONS: MemoryAccess[] = [
  "All project memories",
  "Selected memories",
  "No memory access"
];

export const SKILLS_ACCESS_OPTIONS: SkillsAccess[] = [
  "All skills",
  "Selected skills",
  "No skills access"
];

export const SECRETS_ACCESS_OPTIONS: SecretsAccess[] = [
  "Selected secret references only",
  "No secrets access"
];

export function createStarterAgents(projectId: string): AgentInput[] {
  return [
    {
      name: "Codex Assistant",
      type: "Codex",
      provider: "OpenAI",
      description: "General coding assistant for implementation and review work.",
      projectId,
      memoryAccess: "All project memories",
      selectedMemoryIds: [],
      skillsAccess: "All skills",
      selectedSkillIds: [],
      secretsAccess: "No secrets access",
      selectedSecretIds: [],
      status: "Active",
      notes: "Starter demo agent."
    },
    {
      name: "Claude Code Assistant",
      type: "Claude",
      provider: "Anthropic",
      description: "Reasoning-focused project assistant for larger changes.",
      projectId,
      memoryAccess: "All project memories",
      selectedMemoryIds: [],
      skillsAccess: "All skills",
      selectedSkillIds: [],
      secretsAccess: "No secrets access",
      selectedSecretIds: [],
      status: "Active",
      notes: "Starter demo agent."
    },
    {
      name: "Cursor Assistant",
      type: "Cursor",
      provider: "Other",
      description: "Editor-native assistant for focused code edits.",
      projectId,
      memoryAccess: "Selected memories",
      selectedMemoryIds: [],
      skillsAccess: "Selected skills",
      selectedSkillIds: [],
      secretsAccess: "No secrets access",
      selectedSecretIds: [],
      status: "Testing",
      notes: "Starter demo agent."
    },
    {
      name: "OpenClaw Agent",
      type: "OpenClaw",
      provider: "Local",
      description: "Local agent profile for portable project context.",
      projectId,
      memoryAccess: "All project memories",
      selectedMemoryIds: [],
      skillsAccess: "Selected skills",
      selectedSkillIds: [],
      secretsAccess: "No secrets access",
      selectedSecretIds: [],
      status: "Testing",
      notes: "Starter demo agent."
    }
  ];
}

export function getAgentMemories(agent: Agent, memories: Memory[]) {
  if (agent.memoryAccess === "No memory access") {
    return [];
  }

  if (agent.memoryAccess === "All project memories") {
    return memories.filter((memory) => memory.projectId === agent.projectId);
  }

  return memories.filter((memory) => agent.selectedMemoryIds.includes(memory.id));
}

export function getAgentSkills(agent: Agent, skills: Skill[]) {
  if (agent.skillsAccess === "No skills access") {
    return [];
  }

  if (agent.skillsAccess === "All skills") {
    return skills;
  }

  return skills.filter((skill) => agent.selectedSkillIds.includes(skill.id));
}

export function getAgentSecrets(agent: Agent, secrets: Secret[]) {
  if (agent.secretsAccess === "No secrets access") {
    return [];
  }

  return secrets.filter((secret) => agent.selectedSecretIds.includes(secret.id));
}

export function generateAgentSetupContext({
  agent,
  memories,
  project,
  secrets,
  sessions,
  skills
}: {
  agent: Agent;
  memories: Memory[];
  project?: Project;
  secrets: Secret[];
  sessions: PromptSession[];
  skills: Skill[];
}) {
  const memoryLines =
    memories.length > 0
      ? memories.map((memory) => `- ${memory.content}`).join("\n")
      : "- No memory access configured.";
  const skillLines =
    skills.length > 0
      ? skills.map((skill) => `- ${skill.name}: ${skill.instructions}`).join("\n")
      : "- No skills access configured.";
  const secretLines =
    secrets.length > 0
      ? secrets.map((secret) => `- ${secret.reference}`).join("\n")
      : "- No secret references configured.";
  const sessionLines =
    sessions.length > 0
      ? sessions
          .slice(0, 5)
          .map((session) => `- ${session.title} (${session.status})`)
          .join("\n")
      : "- No recent sessions linked to this agent.";

  return `# Agent Setup Context

## Agent
Name: ${agent.name}
Type: ${agent.type}
Provider: ${agent.provider}
Status: ${agent.status}

## Connected Project
Project: ${project?.name ?? "Unknown project"}
Description: ${project?.description || "No description provided."}
Tech stack: ${project?.techStack || "No tech stack provided."}
Repo URL: ${project?.repoUrl || "No repo URL provided."}
Run commands:
${project?.runCommands || "No run commands provided."}

## Memory Access
${memoryLines}

## Skills Access
${skillLines}

## Secret References
${secretLines}

## Recent Sessions
${sessionLines}

## Rules
- Use project context before responding.
- Do not change unrelated files.
- Ask before making large architecture changes.
- Explain what files were changed.
- Provide commands to test.
`;
}
