"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PromptSession,
  PromptSessionInput,
  SESSIONS_STORAGE_KEY,
  SessionStatus,
  outputStyleToSessionType
} from "@/lib/sessions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { sessionInsert, toSession } from "@/lib/supabase/mappers";

type StoredSession = Partial<PromptSession> & {
  outputStyle?: string;
};

function normalizeSession(session: StoredSession): PromptSession {
  const createdAt = session.createdAt ?? new Date().toISOString();

  return {
    id: session.id ?? crypto.randomUUID(),
    projectId: session.projectId ?? "",
    projectName: session.projectName ?? "Unknown project",
    agentId: session.agentId,
    agentName: session.agentName,
    targetAgent: session.targetAgent ?? "General",
    title: session.title ?? session.task ?? "Untitled session",
    task: session.task ?? "",
    prompt: session.prompt ?? "",
    status: session.status ?? "Draft",
    type: session.type ?? outputStyleToSessionType(session.outputStyle ?? "Prompt"),
    createdAt,
    updatedAt: session.updatedAt ?? createdAt
  };
}

function readSessions() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Prompt sessions are stored under their own key to avoid touching project, memory, or skill data.
    const storedSessions = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    const parsedSessions = storedSessions
      ? (JSON.parse(storedSessions) as StoredSession[])
      : [];
    return parsedSessions.map(normalizeSession);
  } catch {
    return [];
  }
}

function writeSessions(sessions: PromptSession[]) {
  // localStorage keeps generated prompts available after refresh for this MVP.
  window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export function useSessions() {
  const { isConfigured, user } = useAuth();
  const [sessions, setSessions] = useState<PromptSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadSessions() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("sessions")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setSessions((data ?? []).map(toSession));
        } else {
          setSessions(readSessions());
        }
        setIsLoaded(true);
      }
      loadSessions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addSession = async (input: PromptSessionInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("sessions")
        .insert(sessionInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const session = toSession(data);
      session.projectName = input.projectName;
      session.agentName = input.agentName;
      setSessions((currentSessions) => [session, ...currentSessions]);
      return session;
    }

    const session: PromptSession = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSessions((currentSessions) => {
      const nextSessions = [session, ...currentSessions];
      writeSessions(nextSessions);
      return nextSessions;
    });

    return session;
  };

  const deleteSession = async (sessionId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase.from("sessions").delete().eq("id", sessionId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setSessions((currentSessions) => {
      const nextSessions = currentSessions.filter(
        (session) => session.id !== sessionId
      );
      writeSessions(nextSessions);
      return nextSessions;
    });
  };

  const updateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase
        .from("sessions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setSessions((currentSessions) => {
      const nextSessions = currentSessions.map((session) =>
        session.id === sessionId
          ? { ...session, status, updatedAt: new Date().toISOString() }
          : session
      );
      writeSessions(nextSessions);
      return nextSessions;
    });
  };

  const stats = useMemo(
    () => ({
      activeSessions: sessions.filter((session) => session.status === "In Progress")
        .length,
      completedSessions: sessions.filter((session) => session.status === "Completed")
        .length,
      totalSessions: sessions.length,
      recentSessions: sessions.slice(0, 3)
    }),
    [sessions]
  );

  return {
    addSession,
    deleteSession,
    error,
    isLoaded,
    sessions,
    stats,
    updateSessionStatus
  };
}
