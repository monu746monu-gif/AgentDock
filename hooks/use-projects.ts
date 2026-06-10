"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PROJECTS_STORAGE_KEY,
  Project,
  ProjectInput,
  parseTaskCount
} from "@/lib/projects";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { projectInsert, toProject } from "@/lib/supabase/mappers";

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
  const { isConfigured, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadProjects() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

          if (requestError) {
            setError(requestError.message);
          } else {
            setProjects((data ?? []).map(toProject));
          }
        } else {
          setProjects(readProjects());
        }

        setIsLoaded(true);
      }

      loadProjects();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addProject = async (input: ProjectInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("projects")
        .insert(projectInsert(user.id, input))
        .select("*")
        .single();

      if (requestError) {
        setError(requestError.message);
        return null;
      }

      const project = toProject(data);
      setProjects((currentProjects) => [project, ...currentProjects]);
      return project;
    }

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
    error,
    isLoaded,
    projects,
    stats
  };
}
