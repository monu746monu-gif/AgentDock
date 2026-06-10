export type AgentDockConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
};

export type ProjectLink = {
  projectId: string;
  projectName: string;
  linkedAt: string;
};

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tech_stack: string | null;
  repo_url: string | null;
  run_commands: string | null;
  deployment_notes: string | null;
  current_tasks: string | null;
  created_at: string;
};

export type Memory = {
  id: string;
  project_id: string | null;
  content: string;
  tags: string[] | null;
  importance: string | null;
  created_at: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  target_agent: string | null;
  category: string | null;
};

export type Secret = {
  id: string;
  project_id: string | null;
  name: string;
  provider: string | null;
  masked_value: string;
  reference: string;
  notes: string | null;
};

export type Agent = {
  id: string;
  name: string;
  type: string | null;
  provider: string | null;
  description: string | null;
  project_id: string | null;
  memory_access: string | null;
  selected_memory_ids: string[] | null;
  skills_access: string | null;
  selected_skill_ids: string[] | null;
  secrets_access: string | null;
  selected_secret_ids: string[] | null;
  status: string | null;
  notes: string | null;
};

export type PromptSession = {
  id: string;
  project_id: string | null;
  agent_id: string | null;
  title: string;
  task: string | null;
  prompt: string | null;
  target_agent: string | null;
  type: string | null;
  status: string | null;
  created_at: string;
};

export type HandoffTarget =
  | "Codex"
  | "Claude"
  | "Cursor"
  | "OpenClaw"
  | "Hermes"
  | "ChatGPT"
  | "Cline"
  | "Custom";

export type AgentFileKind = "agents" | "claude" | "cursor" | "openclaw";
