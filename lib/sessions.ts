import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { Secret } from "@/lib/secrets";
import { Skill, TargetAgent } from "@/lib/skills";

export type OutputStyle =
  | "Debugging"
  | "Feature Build"
  | "Code Review"
  | "Refactor"
  | "Documentation";

export type PromptSession = {
  id: string;
  projectId: string;
  projectName: string;
  agentId?: string;
  agentName?: string;
  targetAgent: string;
  title: string;
  task: string;
  prompt: string;
  status: SessionStatus;
  type: SessionType;
  createdAt: string;
  updatedAt: string;
};

export type PromptSessionInput = Omit<PromptSession, "id" | "createdAt" | "updatedAt">;

export const SESSIONS_STORAGE_KEY = "agentdock-prompt-sessions";

export type SessionStatus = "Draft" | "In Progress" | "Completed";

export type SessionType =
  | "Prompt"
  | "Debugging"
  | "Feature Build"
  | "Code Review"
  | "Refactor"
  | "Documentation"
  | "Agent File"
  | "Agent Handoff";

export const OUTPUT_STYLES: OutputStyle[] = [
  "Debugging",
  "Feature Build",
  "Code Review",
  "Refactor",
  "Documentation"
];

export const SESSION_STATUSES: SessionStatus[] = [
  "Draft",
  "In Progress",
  "Completed"
];

export const SESSION_TYPES: SessionType[] = [
  "Prompt",
  "Debugging",
  "Feature Build",
  "Code Review",
  "Refactor",
  "Documentation",
  "Agent File",
  "Agent Handoff"
];

export function outputStyleToSessionType(outputStyle: string): SessionType {
  if (
    outputStyle === "Debugging" ||
    outputStyle === "Feature Build" ||
    outputStyle === "Code Review" ||
    outputStyle === "Refactor" ||
    outputStyle === "Documentation"
  ) {
    return outputStyle;
  }

  return "Prompt";
}

export function generatePrompt({
  memories,
  agentSetupContext,
  outputStyle,
  project,
  secrets,
  skills,
  targetAgent,
  task
}: {
  memories: Memory[];
  agentSetupContext?: string;
  outputStyle: OutputStyle;
  project: Project;
  skills: Skill[];
  secrets?: Secret[];
  targetAgent: TargetAgent;
  task: string;
}) {
  const selectedMemories =
    memories.length > 0
      ? memories
          .map(
            (memory) =>
              `- [${memory.importance}] ${memory.content}${
                memory.tags.length > 0 ? `\n  Tags: ${memory.tags.join(", ")}` : ""
              }`
          )
          .join("\n")
      : "- No saved memories selected.";

  const selectedSkills =
    skills.length > 0
      ? skills
          .map(
            (skill) =>
              `### ${skill.name}\nTarget Agent: ${skill.targetAgent}\nCategory: ${skill.category}\n\n${skill.instructions}`
          )
          .join("\n\n")
      : "No saved skills selected.";

  const selectedSecrets =
    secrets && secrets.length > 0
      ? secrets
          .map(
            (secret) =>
              `- ${secret.name} (${secret.provider}): ${secret.reference}`
          )
          .join("\n")
      : "- No secret references selected.";

  // This generator deliberately creates plain markdown so users can copy it into Codex or any agent.
  return `# AI Coding Task

## Target Agent
You are acting as a ${targetAgent} coding assistant.

Output Style:
${outputStyle}

## Registered Agent Setup Context
${agentSetupContext || "No registered agent selected."}

## Project Context
Project Name:
${project.name}

Description:
${project.description || "No description provided."}

Tech Stack:
${project.techStack || "No tech stack provided."}

Repo URL:
${project.repoUrl || "No repo URL provided."}

Run Commands:
${project.runCommands || "No run commands provided."}

Deployment Notes:
Not added yet.

Current Tasks / Bugs:
${project.tasks || "No current tasks or bugs provided."}

## Relevant Memories
${selectedMemories}

## Selected Skills / Instructions
${selectedSkills}

## Secret References
${selectedSecrets}

## Task
${task}

## Rules
- Understand the existing project context before editing.
- Make minimal necessary changes.
- Do not remove working features.
- Explain what files were changed and why.
- Provide test commands.
- Ask before making major architecture changes.

## Expected Output
- Summary of the issue
- Files to inspect
- Code changes
- Explanation
- Test commands
`;
}
