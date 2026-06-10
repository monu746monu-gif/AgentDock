import { getSupabase } from "../lib/supabase.js";
import { requireProjectLink } from "../lib/config.js";
import { fetchMemories } from "../lib/project.js";

export async function addMemoryCommand(text: string, options: { tags?: string; importance?: string }) {
  const { config, supabase } = await getSupabase();
  const link = await requireProjectLink();
  const tags = (options.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const { error } = await supabase.from("memories").insert({
    user_id: config.userId,
    project_id: link.projectId,
    content: text,
    tags,
    importance: options.importance ?? "Medium"
  });

  if (error) throw new Error(error.message);
  console.log("Memory added.");
}

export async function listMemoriesCommand() {
  const { supabase } = await getSupabase();
  const link = await requireProjectLink();
  const memories = await fetchMemories(supabase, link.projectId);

  if (memories.length === 0) {
    console.log("No memories for this project.");
    return;
  }

  memories.forEach((memory) => {
    console.log(`- [${memory.importance ?? "Medium"}] ${memory.content}`);
  });
}

export async function searchMemoriesCommand(query: string) {
  const { supabase } = await getSupabase();
  const link = await requireProjectLink();
  const normalized = query.toLowerCase();
  const memories = (await fetchMemories(supabase, link.projectId)).filter(
    (memory) =>
      memory.content.toLowerCase().includes(normalized) ||
      (memory.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
  );

  if (memories.length === 0) {
    console.log("No matching memories.");
    return;
  }

  memories.forEach((memory) => {
    console.log(`- [${memory.importance ?? "Medium"}] ${memory.content}`);
  });
}
