import { spawn } from "node:child_process";
import { generatePrompt } from "../lib/generators.js";
import { getLinkedContext } from "../lib/project.js";
import { ask, confirm, select } from "../lib/prompts.js";

export async function promptCommand(options: { copy?: boolean }) {
  const { agents, config, memories, project, secrets, skills, supabase } = await getLinkedContext();
  const agent = await select("Select agent", agents, (item) => `${item.name} (${item.type ?? "Custom"})`);
  const task = await ask("Task");
  const prompt = generatePrompt({ agent, memories, project, secrets, skills, task });

  console.log(prompt);

  if (options.copy) {
    await copyToClipboard(prompt);
  }

  if (await confirm("Save this prompt as a session?")) {
    const { error } = await supabase.from("sessions").insert({
      user_id: config.userId,
      project_id: project.id,
      agent_id: agent.id,
      title: `CLI Prompt - ${task.slice(0, 64)}`,
      task,
      prompt,
      target_agent: agent.type ?? "General",
      type: "Prompt",
      status: "Draft"
    });

    if (error) throw new Error(error.message);
    console.log("Saved session.");
  }
}

async function copyToClipboard(text: string) {
  const command =
    process.platform === "darwin" ? "pbcopy" : process.platform === "win32" ? "clip" : "xclip";

  await new Promise<void>((resolve) => {
    const child = spawn(command, process.platform === "linux" ? ["-selection", "clipboard"] : []);
    child.stdin.write(text);
    child.stdin.end();
    child.on("close", (code) => {
      console.log(code === 0 ? "Copied to clipboard." : "Clipboard command was not available.");
      resolve();
    });
    child.on("error", () => {
      console.log("Clipboard command was not available.");
      resolve();
    });
  });
}
