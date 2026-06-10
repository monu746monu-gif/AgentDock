import {
  Agent,
  getAgentMemories,
  getAgentSecrets,
  getAgentSkills
} from "@/lib/agents";
import { GeneratedFile } from "@/lib/generated-files";
import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { PromptSession } from "@/lib/sessions";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";

export type HandoffTarget =
  | "General"
  | "Codex"
  | "Claude"
  | "Cursor"
  | "OpenClaw"
  | "Hermes"
  | "ChatGPT"
  | "Cline"
  | "Custom";

export type IncludedSections = {
  projectContext: boolean;
  memories: boolean;
  skills: boolean;
  secrets: boolean;
  sessions: boolean;
  generatedFiles: boolean;
};

export type Handoff = {
  id: string;
  agentId: string;
  sourceAgentName: string;
  exportTarget: string;
  projectId: string;
  content: string;
  includedSections: IncludedSections;
  createdAt: string;
};

export type HandoffInput = Omit<Handoff, "id" | "createdAt">;

export const HANDOFFS_STORAGE_KEY = "agentdock-handoffs";

export const HANDOFF_TARGETS: HandoffTarget[] = [
  "General",
  "Codex",
  "Claude",
  "Cursor",
  "OpenClaw",
  "Hermes",
  "ChatGPT",
  "Cline",
  "Custom"
];

export const DEFAULT_INCLUDED_SECTIONS: IncludedSections = {
  projectContext: true,
  memories: true,
  skills: true,
  secrets: true,
  sessions: true,
  generatedFiles: true
};

export function generateHandoffPackage({
  agent,
  exportTarget,
  generatedFiles,
  includedSections,
  memories,
  project,
  secrets,
  sessions,
  skills
}: {
  agent: Agent;
  exportTarget: HandoffTarget;
  generatedFiles: GeneratedFile[];
  includedSections: IncludedSections;
  memories: Memory[];
  project?: Project;
  secrets: Secret[];
  sessions: PromptSession[];
  skills: Skill[];
}) {
  const allowedMemories = includedSections.memories
    ? getAgentMemories(agent, memories)
    : [];
  const allowedSkills = includedSections.skills ? getAgentSkills(agent, skills) : [];
  const allowedSecrets = includedSections.secrets ? getAgentSecrets(agent, secrets) : [];
  const projectSessions = includedSections.sessions
    ? sessions.filter(
        (session) => session.agentId === agent.id || session.projectId === agent.projectId
      )
    : [];
  const projectFiles = includedSections.generatedFiles
    ? generatedFiles.filter((file) => file.projectId === agent.projectId)
    : [];

  return `# AgentDock Handoff Package

## Source Agent
Name: ${agent.name}
Type: ${agent.type}
Provider: ${agent.provider}
Status: ${agent.status}

## Export Target
Target: ${exportTarget}

## Connected Project
Project: ${includedSections.projectContext ? project?.name ?? "Unknown project" : "Not included"}
Description: ${includedSections.projectContext ? project?.description || "No description provided." : "Not included"}
Tech Stack: ${includedSections.projectContext ? project?.techStack || "No tech stack provided." : "Not included"}
Repo URL: ${includedSections.projectContext ? project?.repoUrl || "No repo URL provided." : "Not included"}
Run Commands:
${includedSections.projectContext ? project?.runCommands || "No run commands provided." : "Not included"}
Deployment Notes:
${includedSections.projectContext ? "Not added yet." : "Not included"}
Current Tasks / Bugs:
${includedSections.projectContext ? project?.tasks || "No current tasks or bugs provided." : "Not included"}

## Portable Memory
${allowedMemories.length > 0 ? allowedMemories.map((memory) => `- ${memory.content}`).join("\n") : "- No memories included."}

## Portable Skills
${allowedSkills.length > 0 ? allowedSkills.map((skill) => `### ${skill.name}\nInstructions:\n${skill.instructions}`).join("\n\n") : "No skills included."}

## Secret References
${allowedSecrets.length > 0 ? allowedSecrets.map((secret) => `- ${secret.reference}`).join("\n") : "- No secret references included."}

## Recent Sessions
${projectSessions.length > 0 ? projectSessions.slice(0, 5).map((session) => `### ${session.title}\nStatus: ${session.status}\nTask:\n${session.task}\nPrompt summary:\n${session.prompt.slice(0, 500)}`).join("\n\n") : "No sessions included."}

## Generated Files History
${projectFiles.length > 0 ? projectFiles.slice(0, 5).map((file) => `- ${file.fileName} (${file.fileType})`).join("\n") : "- No generated files included."}

## Agent Rules
- Use the provided project context before answering.
- Do not change unrelated files.
- Make minimal necessary changes.
- Explain what changed.
- Provide test commands.
- Ask before large architecture changes.

## Next Task
Continue from this context and ask the user what they want to work on next.
`;
}
