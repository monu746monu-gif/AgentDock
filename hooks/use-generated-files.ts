"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GENERATED_FILES_STORAGE_KEY,
  GeneratedFile,
  GeneratedFileInput
} from "@/lib/generated-files";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { generatedFileInsert, toGeneratedFile } from "@/lib/supabase/mappers";

function readGeneratedFiles() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Generated files use their own localStorage key so older app data is preserved.
    const storedFiles = window.localStorage.getItem(GENERATED_FILES_STORAGE_KEY);
    return storedFiles ? (JSON.parse(storedFiles) as GeneratedFile[]) : [];
  } catch {
    return [];
  }
}

function writeGeneratedFiles(files: GeneratedFile[]) {
  // localStorage keeps the generated-file history available after refresh.
  window.localStorage.setItem(GENERATED_FILES_STORAGE_KEY, JSON.stringify(files));
}

export function useGeneratedFiles() {
  const { isConfigured, user } = useAuth();
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadGeneratedFiles() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("generated_files")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setFiles((data ?? []).map(toGeneratedFile));
        } else {
          setFiles(readGeneratedFiles());
        }
        setIsLoaded(true);
      }
      loadGeneratedFiles();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addGeneratedFile = async (input: GeneratedFileInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("generated_files")
        .insert(generatedFileInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const file = toGeneratedFile(data);
      setFiles((currentFiles) => [file, ...currentFiles]);
      return file;
    }

    const file: GeneratedFile = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    setFiles((currentFiles) => {
      const nextFiles = [file, ...currentFiles];
      writeGeneratedFiles(nextFiles);
      return nextFiles;
    });

    return file;
  };

  const deleteGeneratedFile = async (fileId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase
        .from("generated_files")
        .delete()
        .eq("id", fileId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setFiles((currentFiles) => {
      const nextFiles = currentFiles.filter((file) => file.id !== fileId);
      writeGeneratedFiles(nextFiles);
      return nextFiles;
    });
  };

  const stats = useMemo(
    () => ({
      totalGeneratedFiles: files.length,
      recentGeneratedFiles: files.slice(0, 3)
    }),
    [files]
  );

  return {
    addGeneratedFile,
    deleteGeneratedFile,
    error,
    files,
    isLoaded,
    stats
  };
}
