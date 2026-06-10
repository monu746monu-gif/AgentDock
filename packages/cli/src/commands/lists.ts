import { getSupabase } from "../lib/supabase.js";
import { fetchAgents, fetchSecrets, fetchSkills } from "../lib/project.js";

export async function listSkillsCommand() {
  const { supabase } = await getSupabase();
  const skills = await fetchSkills(supabase);
  if (skills.length === 0) return console.log("No skills saved.");
  skills.forEach((skill) => console.log(`${skill.name}  ${skill.target_agent ?? "General"}  ${skill.category ?? "General"}`));
}

export async function listAgentsCommand() {
  const { supabase } = await getSupabase();
  const agents = await fetchAgents(supabase);
  if (agents.length === 0) return console.log("No agents registered.");
  agents.forEach((agent) => console.log(`${agent.name}  ${agent.type ?? "Custom"}  ${agent.provider ?? "Other"}  ${agent.status ?? "Active"}`));
}

export async function listSecretsCommand() {
  const { supabase } = await getSupabase();
  const secrets = await fetchSecrets(supabase);
  if (secrets.length === 0) return console.log("No secret references saved.");
  secrets.forEach((secret) => console.log(`${secret.name}  ${secret.provider ?? "Other"}  ${secret.reference}`));
}
