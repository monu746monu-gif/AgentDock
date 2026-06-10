import { getLinkedContext, writeSyncFiles } from "../lib/project.js";

export async function syncCommand() {
  const { agents, memories, project, secrets, skills } = await getLinkedContext();
  await writeSyncFiles({ agents, memories, project, secrets, skills });
  console.log("Synced .agentdock context files.");
}
