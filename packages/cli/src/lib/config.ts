import { constants } from "node:fs";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import type { AgentDockConfig, ProjectLink } from "./types.js";

export const CONFIG_DIR = join(homedir(), ".agentdock");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
export const PROJECT_LINK_PATH = ".agentdock.json";

async function exists(path: string) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readConfig(): Promise<AgentDockConfig | null> {
  if (!(await exists(CONFIG_PATH))) return null;
  return JSON.parse(await readFile(CONFIG_PATH, "utf8")) as AgentDockConfig;
}

export async function requireConfig() {
  const config = await readConfig();

  if (!config) {
    throw new Error("Not logged in. Run `agentdock login` first.");
  }

  return config;
}

export async function writeConfig(config: AgentDockConfig) {
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export async function removeConfig() {
  await rm(CONFIG_PATH, { force: true });
}

export async function readProjectLink(cwd = process.cwd()): Promise<ProjectLink | null> {
  const path = join(cwd, PROJECT_LINK_PATH);
  if (!(await exists(path))) return null;
  return JSON.parse(await readFile(path, "utf8")) as ProjectLink;
}

export async function requireProjectLink(cwd = process.cwd()) {
  const link = await readProjectLink(cwd);

  if (!link) {
    throw new Error("This folder is not linked. Run `agentdock init` first.");
  }

  return link;
}

export async function writeProjectLink(link: ProjectLink, cwd = process.cwd()) {
  await writeFile(join(cwd, PROJECT_LINK_PATH), `${JSON.stringify(link, null, 2)}\n`, "utf8");
}
