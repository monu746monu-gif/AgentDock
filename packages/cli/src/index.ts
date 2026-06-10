#!/usr/bin/env node
import { Command } from "commander";
import { loginCommand, logoutCommand, whoamiCommand } from "./commands/auth.js";
import { doctorCommand } from "./commands/doctor.js";
import { generateFileCommand } from "./commands/generate.js";
import { handoffCommand } from "./commands/handoff.js";
import { listAgentsCommand, listSecretsCommand, listSkillsCommand } from "./commands/lists.js";
import { addMemoryCommand, listMemoriesCommand, searchMemoriesCommand } from "./commands/memory.js";
import { initCommand, createProjectCommand, listProjectsCommand } from "./commands/projects.js";
import { promptCommand } from "./commands/prompt.js";
import { statusCommand } from "./commands/status.js";
import { syncCommand } from "./commands/sync.js";

const program = new Command();

program
  .name("agentdock")
  .description("Portable project context and agent control layer for AI coding tools.")
  .version("0.1.0");

program.command("login").description("Log in with Supabase Auth.").action(run(loginCommand));
program.command("logout").description("Remove local CLI config.").action(run(logoutCommand));
program.command("whoami").description("Show the logged-in user.").action(run(whoamiCommand));
program.command("init").description("Link this folder to an AgentDock project.").action(run(initCommand));
program.command("status").description("Show login, linked project, and context counts.").action(run(statusCommand));
program.command("sync").description("Write .agentdock context files for this project.").action(run(syncCommand));
program.command("doctor").description("Check local CLI setup.").action(run(doctorCommand));

const projects = program.command("projects").description("Manage AgentDock projects.");
projects.command("list").description("List projects.").action(run(listProjectsCommand));
projects.command("create").description("Create a project.").action(run(createProjectCommand));

const memory = program.command("memory").description("Manage project memories.");
memory
  .command("add")
  .arguments("<text>")
  .option("--tags <tags>", "Comma-separated tags")
  .option("--importance <importance>", "Low, Medium, or High", "Medium")
  .description("Add memory to the linked project.")
  .action((text: string, options: { tags?: string; importance?: string }) =>
    run(() => addMemoryCommand(text, options))()
  );
memory.command("list").description("List linked project memories.").action(run(listMemoriesCommand));
memory
  .command("search")
  .arguments("<query>")
  .description("Search linked project memories.")
  .action((query: string) => run(() => searchMemoriesCommand(query))());

program.command("skills list").description("List saved skills.").action(run(listSkillsCommand));
program.command("agents list").description("List registered agents.").action(run(listAgentsCommand));
program.command("secrets list").description("List secret references only.").action(run(listSecretsCommand));

const generate = program.command("generate").description("Generate local agent context files.");
generate.command("agents").description("Generate AGENTS.md.").action(run(() => generateFileCommand("agents")));
generate.command("claude").description("Generate CLAUDE.md.").action(run(() => generateFileCommand("claude")));
generate.command("cursor").description("Generate .cursor/rules/project.md.").action(run(() => generateFileCommand("cursor")));
generate.command("openclaw").description("Generate OPENCLAW.md.").action(run(() => generateFileCommand("openclaw")));

program
  .command("prompt")
  .description("Generate a structured coding prompt.")
  .option("--copy", "Copy prompt to clipboard if possible")
  .action((options: { copy?: boolean }) => run(() => promptCommand(options))());

program
  .command("handoff")
  .description("Generate an agent handoff package.")
  .option("--save", "Save handoff to Supabase")
  .option("--file", "Save handoff as AGENTDOCK_HANDOFF.md")
  .action((options: { save?: boolean; file?: boolean }) => run(() => handoffCommand(options))());

program.parseAsync(process.argv);

function run(fn: () => Promise<unknown>) {
  return async () => {
    try {
      await fn();
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  };
}
