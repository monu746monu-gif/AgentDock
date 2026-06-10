import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "./supabase.js";
import { requireProjectLink } from "./config.js";
import type { Agent, Memory, Project, PromptSession, Secret, Skill } from "./types.js";

export async function getLinkedContext() {
  const { config, supabase } = await getSupabase();
  const link = await requireProjectLink();
  const project = await fetchProject(supabase, link.projectId);
  const [memories, skills, secrets, agents, sessions] = await Promise.all([
    fetchMemories(supabase, link.projectId),
    fetchSkills(supabase),
    fetchSecrets(supabase, link.projectId),
    fetchAgents(supabase, link.projectId),
    fetchSessions(supabase, link.projectId)
  ]);

  return { agents, config, link, memories, project, secrets, sessions, skills, supabase };
}

export async function fetchProjects(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function fetchProject(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function fetchMemories(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Memory[];
}

export async function fetchSkills(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Skill[];
}

export async function fetchSecrets(supabase: SupabaseClient, projectId?: string) {
  const { data, error } = await supabase
    .from("secrets")
    .select("id,project_id,name,provider,masked_value,reference,notes")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const secrets = (data ?? []) as Secret[];
  return projectId
    ? secrets.filter((secret) => !secret.project_id || secret.project_id === projectId)
    : secrets;
}

export async function fetchAgents(supabase: SupabaseClient, projectId?: string) {
  let query = supabase.from("agents").select("*").order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Agent[];
}

export async function fetchSessions(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as PromptSession[];
}

export async function writeSyncFiles({
  agents,
  memories,
  project,
  secrets,
  skills
}: {
  agents: Agent[];
  memories: Memory[];
  project: Project;
  secrets: Secret[];
  skills: Skill[];
}) {
  const dir = join(process.cwd(), ".agentdock");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "context.md"), projectContext(project), "utf8");
  await writeFile(join(dir, "memories.md"), memoriesMarkdown(memories), "utf8");
  await writeFile(join(dir, "skills.md"), skillsMarkdown(skills), "utf8");
  await writeFile(join(dir, "secrets.md"), secretsMarkdown(secrets), "utf8");
  await writeFile(join(dir, "agents.md"), agentsMarkdown(agents), "utf8");
}

export function projectContext(project: Project) {
  return `# AgentDock Project Context

Project: ${project.name}

Description:
${project.description || "No description provided."}

Tech Stack:
${project.tech_stack || "No tech stack provided."}

Repo URL:
${project.repo_url || "No repo URL provided."}

Run Commands:
${project.run_commands || "No run commands provided."}

Deployment Notes:
${project.deployment_notes || "No deployment notes provided."}

Current Tasks:
${project.current_tasks || "No current tasks provided."}
`;
}

export function memoriesMarkdown(memories: Memory[]) {
  return `# AgentDock Memories

${memories.length > 0 ? memories.map((memory) => `- [${memory.importance ?? "Medium"}] ${memory.content}${memory.tags?.length ? ` (${memory.tags.join(", ")})` : ""}`).join("\n") : "No memories saved."}
`;
}

export function skillsMarkdown(skills: Skill[]) {
  return `# AgentDock Skills

${skills.length > 0 ? skills.map((skill) => `## ${skill.name}\nTarget: ${skill.target_agent ?? "General"}\nCategory: ${skill.category ?? "General"}\n\n${skill.instructions ?? ""}`).join("\n\n") : "No skills saved."}
`;
}

export function secretsMarkdown(secrets: Secret[]) {
  return `# AgentDock Secret References

${secrets.length > 0 ? secrets.map((secret) => `- ${secret.name} (${secret.provider ?? "Other"}): ${secret.reference}`).join("\n") : "No secret references saved."}
`;
}

export function agentsMarkdown(agents: Agent[]) {
  return `# AgentDock Agents

${agents.length > 0 ? agents.map((agent) => `## ${agent.name}\nType: ${agent.type ?? "Custom"}\nProvider: ${agent.provider ?? "Other"}\nStatus: ${agent.status ?? "Active"}\n\n${agent.description ?? ""}`).join("\n\n") : "No agents registered."}
`;
}
