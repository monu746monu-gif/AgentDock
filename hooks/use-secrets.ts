"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EXAMPLE_SECRETS,
  SECRETS_STORAGE_KEY,
  Secret,
  SecretInput,
  createSecretReference,
  maskSecret,
  normalizeSecretName
} from "@/lib/secrets";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { secretInsert, toSecret } from "@/lib/supabase/mappers";

function readSecrets() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // MVP only: secrets are local browser data. UI never reveals raw values after save.
    const storedSecrets = window.localStorage.getItem(SECRETS_STORAGE_KEY);
    return storedSecrets ? (JSON.parse(storedSecrets) as Secret[]) : [];
  } catch {
    return [];
  }
}

function writeSecrets(secrets: Secret[]) {
  // Keep this isolated from projects, memories, skills, sessions, and generated files.
  window.localStorage.setItem(SECRETS_STORAGE_KEY, JSON.stringify(secrets));
}

function createSecret(input: SecretInput): Secret {
  const normalizedName = normalizeSecretName(input.name);

  return {
    ...input,
    id: crypto.randomUUID(),
    name: normalizedName,
    maskedValue: maskSecret(input.value),
    reference: createSecretReference(normalizedName),
    createdAt: new Date().toISOString()
  };
}

export function useSecrets() {
  const { isConfigured, user } = useAuth();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      async function loadSecrets() {
        if (isConfigured && user && supabase) {
          const { data, error: requestError } = await supabase
            .from("secrets")
            .select("*")
            .order("created_at", { ascending: false });
          if (requestError) setError(requestError.message);
          else setSecrets((data ?? []).map(toSecret));
        } else {
          setSecrets(readSecrets());
        }
        setIsLoaded(true);
      }
      loadSecrets();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isConfigured, user]);

  const addSecret = async (input: SecretInput) => {
    if (isConfigured && user && supabase) {
      const { data, error: requestError } = await supabase
        .from("secrets")
        .insert(secretInsert(user.id, input))
        .select("*")
        .single();
      if (requestError) {
        setError(requestError.message);
        return null;
      }
      const secret = toSecret(data);
      setSecrets((currentSecrets) => [secret, ...currentSecrets]);
      return secret;
    }

    const secret = createSecret(input);

    setSecrets((currentSecrets) => {
      const nextSecrets = [secret, ...currentSecrets];
      writeSecrets(nextSecrets);
      return nextSecrets;
    });

    return secret;
  };

  const addExampleSecrets = async () => {
    if (isConfigured && user && supabase) {
      const existingNames = new Set(secrets.map((secret) => secret.name));
      const rows = EXAMPLE_SECRETS.filter(
        (secret) => !existingNames.has(normalizeSecretName(secret.name))
      ).map((secret) => secretInsert(user.id, secret));
      if (rows.length === 0) return;
      const { data, error: requestError } = await supabase.from("secrets").insert(rows).select("*");
      if (requestError) {
        setError(requestError.message);
        return;
      }
      setSecrets((currentSecrets) => [...(data ?? []).map(toSecret), ...currentSecrets]);
      return;
    }

    setSecrets((currentSecrets) => {
      const existingNames = new Set(currentSecrets.map((secret) => secret.name));
      const examplesToAdd = EXAMPLE_SECRETS.filter(
        (secret) => !existingNames.has(normalizeSecretName(secret.name))
      ).map(createSecret);
      const nextSecrets = [...examplesToAdd, ...currentSecrets];

      writeSecrets(nextSecrets);
      return nextSecrets;
    });
  };

  const deleteSecret = async (secretId: string) => {
    if (isConfigured && user && supabase) {
      const { error: requestError } = await supabase.from("secrets").delete().eq("id", secretId);
      if (requestError) {
        setError(requestError.message);
        return;
      }
    }

    setSecrets((currentSecrets) => {
      const nextSecrets = currentSecrets.filter((secret) => secret.id !== secretId);
      writeSecrets(nextSecrets);
      return nextSecrets;
    });
  };

  const stats = useMemo(
    () => ({
      totalSecrets: secrets.length,
      recentSecrets: secrets.slice(0, 3)
    }),
    [secrets]
  );

  return {
    addExampleSecrets,
    addSecret,
    deleteSecret,
    error,
    isLoaded,
    secrets,
    stats
  };
}
