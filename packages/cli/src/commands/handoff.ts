import { writeFile } from "node:fs/promises";
import { generateHandoff } from "../lib/generators.js";
import { getLinkedContext } from "../lib/project.js";
import { select } from "../lib/prompts.js";
import type { HandoffTarget } from "../lib/types.js";

const TARGETS: HandoffTarget[] = [
  "Codex",
  "Claude",
  "Cursor",
  "OpenClaw",
  "Hermes",
  "ChatGPT",
  "Cline",
  "Custom"
];

export async function handoffCommand(options: { save?: boolean; file?: boolean }) {
  const { agents, config, memories, project, secrets, sessions, skills, supabase } = await getLinkedContext();
  const agent = await select("Select source agent", agents, (item) => `${item.name} (${item.type ?? "Custom"})`);
  const target = await select("Select export target", TARGETS, (item) => item);
  const content = generateHandoff({ agent, memories, project, secrets, sessions, skills, target });

  console.log(content);

  if (options.file) {
    await writeFile("AGENTDOCK_HANDOFF.md", content, "utf8");
    console.log("Saved AGENTDOCK_HANDOFF.md.");
  }

  if (options.save) {
    const { error } = await supabase.from("handoffs").insert({
      user_id: config.userId,
      agent_id: agent.id,
      source_agent_name: agent.name,
      export_target: target,
      project_id: project.id,
      content,
      included_sections: {
        projectContext: true,
        memories: true,
        skills: true,
        secrets: true,
        sessions: true,
        generatedFiles: false
      }
    });

    if (error) throw new Error(error.message);
    console.log("Saved handoff in AgentDock.");
  }
}
