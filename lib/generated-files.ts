import { Memory } from "@/lib/memories";
import { Project } from "@/lib/projects";
import { PromptSession } from "@/lib/sessions";
import { Secret } from "@/lib/secrets";
import { Skill } from "@/lib/skills";

export type AgentFileType =
  | "AGENTS.md for Codex"
  | "CLAUDE.md for Claude Code"
  | ".cursor/rules/project.md for Cursor"
  | "OPENCLAW.md for OpenClaw"
  | "CUSTOM_AGENT.md for custom agents";

export type GeneratedFile = {
  id: string;
  projectId: string;
  fileType: string;
  fileName: string;
  content: string;
  createdAt: string;
};

export type GeneratedFileInput = Omit<GeneratedFile, "id" | "createdAt">;

export const GENERATED_FILES_STORAGE_KEY = "agentdock-generated-files";

export const AGENT_FILE_TYPES: AgentFileType[] = [
  "AGENTS.md for Codex",
  "CLAUDE.md for Claude Code",
  ".cursor/rules/project.md for Cursor",
  "OPENCLAW.md for OpenClaw",
  "CUSTOM_AGENT.md for custom agents"
];

export function getAgentFileName(fileType: AgentFileType) {
  switch (fileType) {
    case "AGENTS.md for Codex":
      return "AGENTS.md";
    case "CLAUDE.md for Claude Code":
      return "CLAUDE.md";
    case ".cursor/rules/project.md for Cursor":
      return "project.md";
    case "OPENCLAW.md for OpenClaw":
      return "OPENCLAW.md";
    case "CUSTOM_AGENT.md for custom agents":
      return "CUSTOM_AGENT.md";
  }
}

function getFileTitle(fileType: AgentFileType) {
  switch (fileType) {
    case "AGENTS.md for Codex":
      return "# AGENTS.md - AI Coding Agent Instructions";
    case "CLAUDE.md for Claude Code":
      return "# CLAUDE.md - Claude Code Project Guide";
    case ".cursor/rules/project.md for Cursor":
      return "# Cursor Rules - Project Instructions";
    case "OPENCLAW.md for OpenClaw":
      return "# OPENCLAW.md - OpenClaw Project Context";
    case "CUSTOM_AGENT.md for custom agents":
      return "# Custom Agent Instructions";
  }
}

function getFileSpecificInstructions(fileType: AgentFileType) {
  switch (fileType) {
    case "AGENTS.md for Codex":
      return [
        "Follow project context before editing.",
        "Make minimal changes.",
        "Explain changed files.",
        "Provide commands used for validation."
      ];
    case "CLAUDE.md for Claude Code":
      return [
        "Think through the project structure before editing.",
        "Ask before large architecture changes.",
        "Keep answers clear and practical."
      ];
    case ".cursor/rules/project.md for Cursor":
      return [
        "Follow existing code style.",
        "Do not rewrite unrelated files.",
        "Prefer small focused edits."
      ];
    case "OPENCLAW.md for OpenClaw":
      return [
        "Use project memories and skills before starting tasks.",
        "Respect saved run commands and environment notes."
      ];
    case "CUSTOM_AGENT.md for custom agents":
      return ["Use the selected project context and instructions."];
  }
}

export function generateAgentFileContent({
  fileType,
  agentSetupContext,
  memories,
  project,
  sessions,
  secrets,
  skills
}: {
  fileType: AgentFileType;
  agentSetupContext?: string;
  memories: Memory[];
  project: Project;
  sessions: PromptSession[];
  secrets?: Secret[];
  skills: Skill[];
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
              `### ${skill.name}\n- Target Agent: ${skill.targetAgent}\n- Category: ${skill.category}\n\n${skill.instructions}`
          )
          .join("\n\n")
      : "No saved skills selected.";

  const selectedSessions =
    sessions.length > 0
      ? sessions
          .map(
            (session) =>
              `### ${session.title}\n- Target Agent: ${session.targetAgent}\n- Type: ${session.type}\n- Status: ${session.status}\n\nTask:\n${session.task}\n\nPrompt excerpt:\n${session.prompt}`
          )
          .join("\n\n")
      : "No saved sessions selected.";

  const selectedSecrets =
    secrets && secrets.length > 0
      ? secrets
          .map(
            (secret) =>
              `- ${secret.name} (${secret.provider}): ${secret.reference}`
          )
          .join("\n")
      : "- No secret references selected.";

  const fileInstructions = getFileSpecificInstructions(fileType)
    .map((instruction) => `- ${instruction}`)
    .join("\n");

  // This returns plain markdown so the user can copy or download it directly into their repo.
  return `${getFileTitle(fileType)}

## Project Overview
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

## Registered Agent Setup Context
${agentSetupContext || "No registered agent selected."}

## Selected Memories
${selectedMemories}

## Selected Skills / Instructions
${selectedSkills}

## Recent Sessions
${selectedSessions}

## Secret References
${selectedSecrets}

## File-Specific Instructions
${fileInstructions}

## Coding Rules
- Understand the existing project context before editing.
- Make minimal necessary changes.
- Do not remove working features.
- Do not rewrite unrelated files.
- Preserve existing project style and architecture.
- Explain what files were changed and why.

## Testing Instructions
- Use the saved run commands when applicable.
- Run focused tests for changed behavior.
- Report any commands that could not be run.
- Include manual verification steps when automated tests are unavailable.

## Agent Behavior Rules
- Read this file before starting a task.
- Use selected memories and skills as project-specific guidance.
- Ask before making major architecture changes.
- Keep responses practical, concrete, and tied to the codebase.
`;
}
