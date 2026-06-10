"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { AGENTS_STORAGE_KEY, Agent } from "@/lib/agents";
import { GENERATED_FILES_STORAGE_KEY, GeneratedFile } from "@/lib/generated-files";
import { HANDOFFS_STORAGE_KEY, Handoff } from "@/lib/handoffs";
import { MEMORIES_STORAGE_KEY, Memory } from "@/lib/memories";
import { PROJECTS_STORAGE_KEY, Project } from "@/lib/projects";
import { SECRETS_STORAGE_KEY, Secret } from "@/lib/secrets";
import { SESSIONS_STORAGE_KEY, PromptSession } from "@/lib/sessions";
import { SKILLS_STORAGE_KEY, Skill } from "@/lib/skills";
import { supabase } from "@/lib/supabase/client";
import {
  agentInsert,
  generatedFileInsert,
  handoffInsert,
  memoryInsert,
  projectInsert,
  secretInsert,
  sessionInsert,
  skillInsert
} from "@/lib/supabase/mappers";

function readLocal<T>(key: string): T[] {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T[]) : [];
  } catch {
    return [];
  }
}

export default function MigratePage() {
  const { isConfigured, user } = useAuth();
  const [message, setMessage] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);

  const migrate = async () => {
    if (!supabase || !user) {
      setMessage("Log in with Supabase before migrating local demo data.");
      return;
    }

    setIsMigrating(true);
    setMessage("");

    try {
      const projects = readLocal<Project>(PROJECTS_STORAGE_KEY);
      const memories = readLocal<Memory>(MEMORIES_STORAGE_KEY);
      const skills = readLocal<Skill>(SKILLS_STORAGE_KEY);
      const secrets = readLocal<Secret>(SECRETS_STORAGE_KEY);
      const sessions = readLocal<PromptSession>(SESSIONS_STORAGE_KEY);
      const agents = readLocal<Agent>(AGENTS_STORAGE_KEY);
      const files = readLocal<GeneratedFile>(GENERATED_FILES_STORAGE_KEY);
      const handoffs = readLocal<Handoff>(HANDOFFS_STORAGE_KEY);

      const { data: existingProjects } = await supabase.from("projects").select("name");
      const existingProjectNames = new Set((existingProjects ?? []).map((item) => item.name));
      const projectRows = projects
        .filter((project) => !existingProjectNames.has(project.name))
        .map((project) => ({ id: project.id, ...projectInsert(user.id, project) }));
      if (projectRows.length > 0) await supabase.from("projects").insert(projectRows);

      const { data: existingSkills } = await supabase.from("skills").select("name");
      const existingSkillNames = new Set((existingSkills ?? []).map((item) => item.name));
      const skillRows = skills
        .filter((skill) => !existingSkillNames.has(skill.name))
        .map((skill) => ({ id: skill.id, ...skillInsert(user.id, skill) }));
      if (skillRows.length > 0) await supabase.from("skills").insert(skillRows);

      const { data: existingSecrets } = await supabase.from("secrets").select("name");
      const existingSecretNames = new Set((existingSecrets ?? []).map((item) => item.name));
      const secretRows = secrets
        .filter((secret) => !existingSecretNames.has(secret.name))
        .map((secret) =>
          ({
            id: secret.id,
            ...secretInsert(user.id, {
            name: secret.name,
            provider: secret.provider,
            projectId: secret.projectId,
            value: secret.maskedValue,
            notes: secret.notes
          })
          })
        );
      if (secretRows.length > 0) await supabase.from("secrets").insert(secretRows);

      if (memories.length > 0) {
        await supabase.from("memories").insert(
          memories.map((memory) =>
            ({
              id: memory.id,
              ...memoryInsert(user.id, {
              projectId: memory.projectId,
              content: memory.content,
              tags: memory.tags,
              importance: memory.importance
            })
            })
          )
        );
      }

      if (agents.length > 0) {
        await supabase
          .from("agents")
          .insert(agents.map((agent) => ({ id: agent.id, ...agentInsert(user.id, agent) })));
      }

      if (sessions.length > 0) {
        await supabase.from("sessions").insert(
          sessions.map((session) =>
            ({
              id: session.id,
              ...sessionInsert(user.id, {
              projectId: session.projectId,
              projectName: session.projectName,
              agentId: session.agentId,
              agentName: session.agentName,
              title: session.title,
              task: session.task,
              prompt: session.prompt,
              targetAgent: session.targetAgent,
              type: session.type,
              status: session.status
            })
            })
          )
        );
      }

      if (files.length > 0) {
        await supabase
          .from("generated_files")
          .insert(files.map((file) => ({ id: file.id, ...generatedFileInsert(user.id, file) })));
      }

      if (handoffs.length > 0) {
        await supabase
          .from("handoffs")
          .insert(handoffs.map((handoff) => ({ id: handoff.id, ...handoffInsert(user.id, handoff) })));
      }

      setMessage("Local demo data migration finished. Refresh dashboard to load cloud data.");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <p className="text-sm font-medium text-primary">Data Migration</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Migrate Demo Data</h1>
        <p className="mt-2 text-muted-foreground">
          Move localStorage MVP data into your logged-in Supabase account.
        </p>
      </div>

      <Card className="mt-8 max-w-2xl">
        <CardHeader>
          <CardTitle>Migrate local demo data to account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isConfigured ? (
            <p className="rounded-lg border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              Configure Supabase environment variables first.
            </p>
          ) : (
            <>
              <p className="text-sm leading-6 text-muted-foreground">
                This reads local demo records from your browser and inserts them into
                Supabase for your account. It avoids duplicate projects, skills, and
                secrets by name.
              </p>
              <Button type="button" onClick={migrate} disabled={isMigrating || !user}>
                <UploadCloud className="h-4 w-4" />
                {isMigrating ? "Migrating..." : "Migrate local demo data to account"}
              </Button>
              {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
