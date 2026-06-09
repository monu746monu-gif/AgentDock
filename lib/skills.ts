export type TargetAgent = "General" | "Codex" | "Claude" | "Cursor" | "OpenClaw";

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Debugging"
  | "Testing"
  | "UI/UX"
  | "DevOps"
  | "General";

export type Skill = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  targetAgent: TargetAgent;
  category: SkillCategory;
  createdAt: string;
};

export type SkillInput = Omit<Skill, "id" | "createdAt">;

export const SKILLS_STORAGE_KEY = "agentdock-skills";

export const TARGET_AGENTS: TargetAgent[] = [
  "General",
  "Codex",
  "Claude",
  "Cursor",
  "OpenClaw"
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Debugging",
  "Testing",
  "UI/UX",
  "DevOps",
  "General"
];

export const STARTER_SKILLS: SkillInput[] = [
  {
    name: "Full-stack Debugger",
    description: "Trace bugs across frontend, backend, data flow, and runtime behavior.",
    instructions:
      "Act as a full-stack debugger. Reproduce the issue, inspect the request path, identify the smallest failing boundary, and propose a minimal fix with verification steps.",
    targetAgent: "General",
    category: "Debugging"
  },
  {
    name: "React UI Expert",
    description: "Improve React interfaces with clean components and responsive behavior.",
    instructions:
      "Act as a React UI expert. Preserve existing design patterns, simplify state, keep components accessible, and verify responsive layouts before finishing.",
    targetAgent: "Codex",
    category: "Frontend"
  },
  {
    name: "FastAPI Backend Expert",
    description: "Design and debug FastAPI services with clear contracts and tests.",
    instructions:
      "Act as a FastAPI backend expert. Review route contracts, validation models, dependency injection, database boundaries, error handling, and focused API tests.",
    targetAgent: "Claude",
    category: "Backend"
  },
  {
    name: "Codex Prompt Writer",
    description: "Turn project context into precise implementation prompts for Codex.",
    instructions:
      "Write a concise Codex prompt with goal, current context, constraints, files to inspect, expected behavior, verification commands, and explicit non-goals.",
    targetAgent: "Codex",
    category: "General"
  },
  {
    name: "Clean Code Reviewer",
    description: "Review changes for bugs, maintainability, and missing verification.",
    instructions:
      "Review code like a senior engineer. Lead with concrete bugs and regressions, reference exact files or functions, and call out missing tests or risky assumptions.",
    targetAgent: "General",
    category: "Testing"
  }
];
