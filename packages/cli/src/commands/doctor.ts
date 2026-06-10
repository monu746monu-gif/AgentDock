import { readConfig, readProjectLink } from "../lib/config.js";
import { fetchMemories, fetchProjects } from "../lib/project.js";
import { getSupabase } from "../lib/supabase.js";

export async function doctorCommand() {
  await check("Node version >= 18", async () => {
    const major = Number.parseInt(process.versions.node.split(".")[0] ?? "0", 10);
    if (major < 18) throw new Error(`Current: ${process.versions.node}`);
  });

  await check("CLI config exists", async () => {
    if (!(await readConfig())) throw new Error("Run `agentdock login`.");
  });

  await check("Supabase connection works", async () => {
    const { supabase } = await getSupabase();
    const { error } = await supabase.from("projects").select("id").limit(1);
    if (error) throw new Error(error.message);
  });

  await check("Current folder linked", async () => {
    if (!(await readProjectLink())) throw new Error("Run `agentdock init`.");
  });

  await check("Can fetch projects and memories", async () => {
    const { supabase } = await getSupabase();
    const projects = await fetchProjects(supabase);
    const link = await readProjectLink();
    if (link) await fetchMemories(supabase, link.projectId);
    if (projects.length === 0) throw new Error("No projects found.");
  });
}

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`PASS ${label}`);
  } catch (error) {
    console.log(`FAIL ${label}`);
    console.log(`     ${error instanceof Error ? error.message : String(error)}`);
  }
}
