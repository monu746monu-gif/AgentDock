export type ImportanceLevel = "Low" | "Medium" | "High";

export type Memory = {
  id: string;
  projectId: string;
  content: string;
  tags: string[];
  importance: ImportanceLevel;
  createdAt: string;
};

export type MemoryInput = Omit<Memory, "id" | "createdAt">;

export const MEMORIES_STORAGE_KEY = "agentdock-memories";

export const IMPORTANCE_LEVELS: ImportanceLevel[] = ["Low", "Medium", "High"];

export function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}
