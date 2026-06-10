"use client";

import { useEffect, useMemo, useState } from "react";
import { HANDOFFS_STORAGE_KEY, Handoff, HandoffInput } from "@/lib/handoffs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { handoffInsert, toHandoff } from "@/lib/supabase/mappers";

function readHandoffs() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Handoffs use their own localStorage key so existing MVP data stays untouched.
    const storedHandoffs = window.localStorage.getItem(HANDOFFS_STORAGE_KEY);
    return storedHandoffs ? (JSON.parse(storedHandoffs) as Handoff[]) : [];
  } catch {
    return [];
  }
}

function writeHandoffs(handoffs: Handoff[]) {
  window.localStorage.setItem(HANDOFFS_STORAGE_KEY, JSON.stringify(handoffs));
}

export function useHandoffs() {
  const { isConfigured, user } = useAuth();
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadHandoffs() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("handoffs")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setHandoffs((data ?? []).map(toHandoff));
        } else {
          setHandoffs(readHandoffs());
        }
        setIsLoaded(true);
      }
      loadHandoffs();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addHandoff = async (input: HandoffInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("handoffs")
        .insert(handoffInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const handoff = toHandoff(data);
      setHandoffs((currentHandoffs) => [handoff, ...currentHandoffs]);
      return handoff;
    }

    const handoff: Handoff = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setHandoffs((currentHandoffs) => {
      const nextHandoffs = [handoff, ...currentHandoffs];
      writeHandoffs(nextHandoffs);
      return nextHandoffs;
    });

    return handoff;
  };

  const deleteHandoff = async (handoffId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase.from("handoffs").delete().eq("id", handoffId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setHandoffs((currentHandoffs) => {
      const nextHandoffs = currentHandoffs.filter(
        (handoff) => handoff.id !== handoffId
      );
      writeHandoffs(nextHandoffs);
      return nextHandoffs;
    });
  };

  const stats = useMemo(
    () => ({
      totalHandoffs: handoffs.length,
      recentHandoffs: handoffs.slice(0, 3)
    }),
    [handoffs]
  );

  return {
    addHandoff,
    deleteHandoff,
    error,
    handoffs,
    isLoaded,
    stats
  };
}
