export type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string;
  repoUrl: string;
  runCommands: string;
  tasks: string;
  createdAt: string;
};

export type ProjectInput = Omit<Project, "id" | "createdAt">;

export const PROJECTS_STORAGE_KEY = "agentdock-projects";

export function parseTaskCount(tasks: string) {
  return tasks
    .split(/\r?\n|,/)
    .map((task) => task.trim())
    .filter(Boolean).length;
}
