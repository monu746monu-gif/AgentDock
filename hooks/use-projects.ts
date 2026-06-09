"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROJECTS_STORAGE_KEY,
  Project,
  ProjectInput,
  parseTaskCount
} from "@/lib/projects";

function readProjects() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedProjects = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    return storedProjects ? (JSON.parse(storedProjects) as Project[]) : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: Project[]) {
  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProjects(readProjects());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const addProject = (input: ProjectInput) => {
    const project: Project = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setProjects((currentProjects) => {
      const nextProjects = [project, ...currentProjects];
      writeProjects(nextProjects);
      return nextProjects;
    });

    return project;
  };

  const stats = useMemo(() => {
    const totalTasks = projects.reduce(
      (count, project) => count + parseTaskCount(project.tasks),
      0
    );

    return {
      totalProjects: projects.length,
      totalTasks,
      recentProject: projects[0] ?? null
    };
  }, [projects]);

  return {
    addProject,
    isLoaded,
    projects,
    stats
  };
}
