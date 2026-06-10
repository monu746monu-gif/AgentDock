"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AGENTS_STORAGE_KEY,
  Agent,
  AgentInput,
  createStarterAgents
} from "@/lib/agents";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { agentInsert, toAgent } from "@/lib/supabase/mappers";

function readAgents() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Agents are local MVP records that reference other AgentDock localStorage data.
    const storedAgents = window.localStorage.getItem(AGENTS_STORAGE_KEY);
    return storedAgents ? (JSON.parse(storedAgents) as Agent[]) : [];
  } catch {
    return [];
  }
}

function writeAgents(agents: Agent[]) {
  window.localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

function createAgent(input: AgentInput): Agent {
  const now = new Date().toISOString();

  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now
  };
}

export function useAgents() {
  const { isConfigured, user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadAgents() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("agents")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setAgents((data ?? []).map(toAgent));
        } else {
          setAgents(readAgents());
        }
        setIsLoaded(true);
      }
      loadAgents();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addAgent = async (input: AgentInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("agents")
        .insert(agentInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const agent = toAgent(data);
      setAgents((currentAgents) => [agent, ...currentAgents]);
      return agent;
    }

    const agent = createAgent(input);

    setAgents((currentAgents) => {
      const nextAgents = [agent, ...currentAgents];
      writeAgents(nextAgents);
      return nextAgents;
    });

    return agent;
  };

  const addStarterAgents = async (projectId: string) => {
    if (isConfigured && user && supabase) {
      const existingNames = new Set(agents.map((agent) => agent.name));
      const rows = createStarterAgents(projectId)
        .filter((agent) => !existingNames.has(agent.name))
        .map((agent) => agentInsert(user.id, agent));
      if (rows.length === 0) return;
      const { data, error: requestError } = await supabase.from("agents").insert(rows).select("*");
      if (requestError) {
        setError(requestError.message);
        return;
      }
      setAgents((currentAgents) => [...(data ?? []).map(toAgent), ...currentAgents]);
      return;
    }

    setAgents((currentAgents) => {
      const existingNames = new Set(currentAgents.map((agent) => agent.name));
      const nextStarterAgents = createStarterAgents(projectId)
        .filter((agent) => !existingNames.has(agent.name))
        .map(createAgent);
      const nextAgents = [...nextStarterAgents, ...currentAgents];

      writeAgents(nextAgents);
      return nextAgents;
    });
  };

  const updateAgent = async (agentId: string, input: AgentInput) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase
        .from("agents")
        .update({ ...agentInsert(user.id, input), updated_at: new Date().toISOString() })
        .eq("id", agentId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setAgents((currentAgents) => {
      const nextAgents = currentAgents.map((agent) =>
        agent.id === agentId
          ? { ...agent, ...input, updatedAt: new Date().toISOString() }
          : agent
      );
      writeAgents(nextAgents);
      return nextAgents;
    });
  };

  const deleteAgent = async (agentId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase.from("agents").delete().eq("id", agentId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setAgents((currentAgents) => {
      const nextAgents = currentAgents.filter((agent) => agent.id !== agentId);
      writeAgents(nextAgents);
      return nextAgents;
    });
  };

  const stats = useMemo(
    () => ({
      activeAgents: agents.filter((agent) => agent.status === "Active").length,
      totalAgents: agents.length,
      recentAgents: agents.slice(0, 3)
    }),
    [agents]
  );

  return {
    addAgent,
    addStarterAgents,
    agents,
    deleteAgent,
    error,
    isLoaded,
    stats,
    updateAgent
  };
}
