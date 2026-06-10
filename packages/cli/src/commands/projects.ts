import { basename } from "node:path";
import { ask, askMultiline, select } from "../lib/prompts.js";
import { writeProjectLink } from "../lib/config.js";
import { getSupabase } from "../lib/supabase.js";
import { fetchProjects } from "../lib/project.js";
import type { Project } from "../lib/types.js";

export async function listProjectsCommand() {
  const { supabase } = await getSupabase();
  const projects = await fetchProjects(supabase);

  if (projects.length === 0) {
    console.log("No projects yet.");
    return;
  }

  projects.forEach((project) => {
    console.log(`${project.id}  ${project.name}`);
  });
}

export async function createProjectCommand() {
  const { config, supabase } = await getSupabase();
  const input = await askProjectInput();
  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: config.userId, ...input })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  const project = data as Project;
  console.log(`Created project ${project.name}.`);
  return project;
}

export async function initCommand() {
  const { config, supabase } = await getSupabase();
  const projects = await fetchProjects(supabase);
  const mode = await select(
    "Link this folder to an AgentDock project:",
    ["Select existing project", "Create new project from this folder"],
    (item) => item
  );

  let project: Project;

  if (mode === "Select existing project") {
    project = await select("Select project", projects, (item) => item.name);
  } else {
    const folderName = basename(process.cwd());
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: config.userId,
        name: await ask("Project name", folderName),
        description: await ask("Description", `Local project ${folderName}`),
        tech_stack: await ask("Tech stack"),
        repo_url: await ask("Repo URL"),
        run_commands: await askMultiline("Run commands"),
        deployment_notes: await askMultiline("Deployment notes"),
        current_tasks: await askMultiline("Current tasks")
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    project = data as Project;
  }

  await writeProjectLink({
    projectId: project.id,
    projectName: project.name,
    linkedAt: new Date().toISOString()
  });

  console.log(`Linked this folder to ${project.name}.`);
}

async function askProjectInput() {
  return {
    name: await ask("Name"),
    description: await ask("Description"),
    tech_stack: await ask("Tech stack"),
    repo_url: await ask("Repo URL"),
    run_commands: await askMultiline("Run commands"),
    deployment_notes: await askMultiline("Deployment notes"),
    current_tasks: await askMultiline("Current tasks")
  };
}
