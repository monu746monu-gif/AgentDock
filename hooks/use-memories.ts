"use client";

import { useEffect, useMemo, useState } from "react";
import { MEMORIES_STORAGE_KEY, Memory, MemoryInput } from "@/lib/memories";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { memoryInsert, toMemory } from "@/lib/supabase/mappers";

function readMemories() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Memories stay in localStorage for this MVP, so refreshes keep user context.
    const storedMemories = window.localStorage.getItem(MEMORIES_STORAGE_KEY);
    return storedMemories ? (JSON.parse(storedMemories) as Memory[]) : [];
  } catch {
    return [];
  }
}

function writeMemories(memories: Memory[]) {
  // Keep memory writes isolated from project storage so existing project data is preserved.
  window.localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
}

export function useMemories() {
  const { isConfigured, user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadMemories() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("memories")
            .select("*")
            .order("created_at", { ascending: false });

          if (requestError) {
            setError(requestError.message);
          } else {
            setMemories((data ?? []).map(toMemory));
          }
        } else {
          setMemories(readMemories());
        }
        setIsLoaded(true);
      }
      loadMemories();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addMemory = async (input: MemoryInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("memories")
        .insert(memoryInsert(user.id, input))
        .select("*")
        .single();

      if (requestError) {
        setError(requestError.message);
        return null;
      }

      const memory = toMemory(data);
      setMemories((currentMemories) => [memory, ...currentMemories]);
      return memory;
    }

    const memory: Memory = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setMemories((currentMemories) => {
      const nextMemories = [memory, ...currentMemories];
      writeMemories(nextMemories);
      return nextMemories;
    });

    return memory;
  };

  const deleteMemory = async (memoryId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase
        .from("memories")
        .delete()
        .eq("id", memoryId);

      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setMemories((currentMemories) => {
      const nextMemories = currentMemories.filter((memory) => memory.id !== memoryId);
      writeMemories(nextMemories);
      return nextMemories;
    });
  };

  const stats = useMemo(
    () => ({
      totalMemories: memories.length,
      recentMemories: memories.slice(0, 3)
    }),
    [memories]
  );

  return {
    addMemory,
    deleteMemory,
    error,
    isLoaded,
    memories,
    stats
  };
}
