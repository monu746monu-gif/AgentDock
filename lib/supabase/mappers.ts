import { Agent, AgentInput } from "@/lib/agents";
import { GeneratedFile, GeneratedFileInput } from "@/lib/generated-files";
import { Handoff, HandoffInput } from "@/lib/handoffs";
import { Memory, MemoryInput } from "@/lib/memories";
import { Project, ProjectInput } from "@/lib/projects";
import { PromptSession, PromptSessionInput } from "@/lib/sessions";
import { Secret, SecretInput, createSecretReference, maskSecret, normalizeSecretName } from "@/lib/secrets";
import { Skill, SkillInput } from "@/lib/skills";

type Row = Record<string, unknown>;

const text = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);

export const toProject = (row: Row): Project => ({
  id: text(row.id),
  name: text(row.name),
  description: text(row.description),
  techStack: text(row.tech_stack),
  repoUrl: text(row.repo_url),
  runCommands: text(row.run_commands),
  tasks: text(row.current_tasks),
  createdAt: text(row.created_at)
});

export const projectInsert = (userId: string, input: ProjectInput) => ({
  user_id: userId,
  name: input.name,
  description: input.description,
  tech_stack: input.techStack,
  repo_url: input.repoUrl,
  run_commands: input.runCommands,
  current_tasks: input.tasks
});

export const toMemory = (row: Row): Memory => ({
  id: text(row.id),
  projectId: text(row.project_id),
  content: text(row.content),
  tags: strings(row.tags),
  importance: text(row.importance, "Medium") as Memory["importance"],
  createdAt: text(row.created_at)
});

export const memoryInsert = (userId: string, input: MemoryInput) => ({
  user_id: userId,
  project_id: input.projectId,
  content: input.content,
  tags: input.tags,
  importance: input.importance
});

export const toSkill = (row: Row): Skill => ({
  id: text(row.id),
  name: text(row.name),
  description: text(row.description),
  instructions: text(row.instructions),
  targetAgent: text(row.target_agent, "General") as Skill["targetAgent"],
  category: text(row.category, "General") as Skill["category"],
  createdAt: text(row.created_at)
});

export const skillInsert = (userId: string, input: SkillInput) => ({
  user_id: userId,
  name: input.name,
  description: input.description,
  instructions: input.instructions,
  target_agent: input.targetAgent,
  category: input.category
});

export const toSecret = (row: Row): Secret => ({
  id: text(row.id),
  name: text(row.name),
  provider: text(row.provider, "Other") as Secret["provider"],
  projectId: text(row.project_id, "global"),
  value: "",
  maskedValue: text(row.masked_value),
  reference: text(row.reference),
  notes: text(row.notes),
  createdAt: text(row.created_at)
});

export const secretInsert = (userId: string, input: SecretInput) => {
  const name = normalizeSecretName(input.name);

  return {
    user_id: userId,
    project_id: input.projectId === "global" ? null : input.projectId,
    name,
    provider: input.provider,
    masked_value: maskSecret(input.value),
    reference: createSecretReference(name),
    notes: input.notes
  };
};

export const toSession = (row: Row): PromptSession => ({
  id: text(row.id),
  projectId: text(row.project_id),
  projectName: "",
  agentId: text(row.agent_id) || undefined,
  agentName: undefined,
  targetAgent: text(row.target_agent, "General"),
  title: text(row.title),
  task: text(row.task),
  prompt: text(row.prompt),
  status: text(row.status, "Draft") as PromptSession["status"],
  type: text(row.type, "Prompt") as PromptSession["type"],
  createdAt: text(row.created_at),
  updatedAt: text(row.updated_at)
});

export const sessionInsert = (userId: string, input: PromptSessionInput) => ({
  user_id: userId,
  project_id: input.projectId || null,
  agent_id: input.agentId ?? null,
  title: input.title,
  task: input.task,
  prompt: input.prompt,
  target_agent: input.targetAgent,
  type: input.type,
  status: input.status
});

export const toAgent = (row: Row): Agent => ({
  id: text(row.id),
  name: text(row.name),
  type: text(row.type, "Custom") as Agent["type"],
  provider: text(row.provider, "Other") as Agent["provider"],
  description: text(row.description),
  projectId: text(row.project_id),
  memoryAccess: text(row.memory_access, "No memory access") as Agent["memoryAccess"],
  selectedMemoryIds: strings(row.selected_memory_ids),
  skillsAccess: text(row.skills_access, "No skills access") as Agent["skillsAccess"],
  selectedSkillIds: strings(row.selected_skill_ids),
  secretsAccess: text(row.secrets_access, "No secrets access") as Agent["secretsAccess"],
  selectedSecretIds: strings(row.selected_secret_ids),
  status: text(row.status, "Active") as Agent["status"],
  notes: text(row.notes),
  createdAt: text(row.created_at),
  updatedAt: text(row.updated_at)
});

export const agentInsert = (userId: string, input: AgentInput) => ({
  user_id: userId,
  name: input.name,
  type: input.type,
  provider: input.provider,
  description: input.description,
  project_id: input.projectId || null,
  memory_access: input.memoryAccess,
  selected_memory_ids: input.selectedMemoryIds,
  skills_access: input.skillsAccess,
  selected_skill_ids: input.selectedSkillIds,
  secrets_access: input.secretsAccess,
  selected_secret_ids: input.selectedSecretIds,
  status: input.status,
  notes: input.notes
});

export const toGeneratedFile = (row: Row): GeneratedFile => ({
  id: text(row.id),
  projectId: text(row.project_id),
  fileType: text(row.file_type),
  fileName: text(row.file_name),
  content: text(row.content),
  createdAt: text(row.created_at)
});

export const generatedFileInsert = (userId: string, input: GeneratedFileInput) => ({
  user_id: userId,
  project_id: input.projectId || null,
  file_type: input.fileType,
  file_name: input.fileName,
  content: input.content
});

export const toHandoff = (row: Row): Handoff => ({
  id: text(row.id),
  agentId: text(row.agent_id),
  sourceAgentName: text(row.source_agent_name),
  exportTarget: text(row.export_target),
  projectId: text(row.project_id),
  content: text(row.content),
  includedSections: row.included_sections as Handoff["includedSections"],
  createdAt: text(row.created_at)
});

export const handoffInsert = (userId: string, input: HandoffInput) => ({
  user_id: userId,
  agent_id: input.agentId || null,
  source_agent_name: input.sourceAgentName,
  export_target: input.exportTarget,
  project_id: input.projectId || null,
  content: input.content,
  included_sections: input.includedSections
});
