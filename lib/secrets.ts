export type SecretProvider =
  | "OpenAI"
  | "Anthropic"
  | "Gemini"
  | "OpenRouter"
  | "GitHub"
  | "Supabase"
  | "Vercel"
  | "Other";

export type Secret = {
  id: string;
  name: string;
  provider: SecretProvider;
  projectId: string | "global";
  value: string;
  maskedValue: string;
  reference: string;
  notes: string;
  createdAt: string;
};

export type SecretInput = Omit<Secret, "id" | "maskedValue" | "reference" | "createdAt">;

export const SECRETS_STORAGE_KEY = "agentdock-secrets";

export const SECRET_PROVIDERS: SecretProvider[] = [
  "OpenAI",
  "Anthropic",
  "Gemini",
  "OpenRouter",
  "GitHub",
  "Supabase",
  "Vercel",
  "Other"
];

export function normalizeSecretName(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function createSecretReference(name: string) {
  return `agentdock://secrets/${normalizeSecretName(name)}`;
}

export function maskSecret(value: string) {
  if (value.length > 8) {
    return `${value.slice(0, 3)}••••••••••••${value.slice(-4)}`;
  }

  return "••••••••";
}

export const EXAMPLE_SECRETS: SecretInput[] = [
  {
    name: "OPENAI_API_KEY",
    provider: "OpenAI",
    projectId: "global",
    value: "sk-demo-openai-1234",
    notes: "Demo-only OpenAI key reference."
  },
  {
    name: "ANTHROPIC_API_KEY",
    provider: "Anthropic",
    projectId: "global",
    value: "sk-ant-demo-5678",
    notes: "Demo-only Anthropic key reference."
  },
  {
    name: "GEMINI_API_KEY",
    provider: "Gemini",
    projectId: "global",
    value: "gemini-demo-9012",
    notes: "Demo-only Gemini key reference."
  },
  {
    name: "OPENROUTER_API_KEY",
    provider: "OpenRouter",
    projectId: "global",
    value: "or-demo-openrouter-3456",
    notes: "Demo-only OpenRouter key reference."
  }
];
