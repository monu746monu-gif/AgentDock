import { readConfig, readProjectLink } from "../lib/config.js";
import { getLinkedContext } from "../lib/project.js";

export async function statusCommand() {
  const config = await readConfig();
  const link = await readProjectLink();

  console.log(`User: ${config?.email ?? "Not logged in"}`);
  console.log(`Linked project: ${link?.projectName ?? "Not linked"}`);

  if (!config || !link) return;

  const { agents, memories, project, sessions, skills } = await getLinkedContext();
  console.log(`Project name: ${project.name}`);
  console.log(`Memories: ${memories.length}`);
  console.log(`Skills: ${skills.length}`);
  console.log(`Agents: ${agents.length}`);
  console.log(`Sessions: ${sessions.length}`);
}
