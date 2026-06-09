"use client";

import { useEffect, useMemo, useState } from "react";
import { MEMORIES_STORAGE_KEY, Memory, MemoryInput } from "@/lib/memories";

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
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMemories(readMemories());
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const addMemory = (input: MemoryInput) => {
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

  const deleteMemory = (memoryId: string) => {
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
    isLoaded,
    memories,
    stats
  };
}
