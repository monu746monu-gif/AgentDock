import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { generateAgentFile, getAgentFileName, getAgentFileType } from "../lib/generators.js";
import { getLinkedContext } from "../lib/project.js";
import type { AgentFileKind } from "../lib/types.js";

export async function generateFileCommand(kind: AgentFileKind) {
  const { agents, config, memories, project, secrets, skills, supabase } = await getLinkedContext();
  const content = generateAgentFile({ agents, kind, memories, project, secrets, skills });
  const relativeFileName = getAgentFileName(kind);
  const fileName = join(process.cwd(), relativeFileName);

  await mkdir(dirname(fileName), { recursive: true });
  await writeFile(fileName, content, "utf8");

  const { error } = await supabase.from("generated_files").insert({
    user_id: config.userId,
    project_id: project.id,
    file_type: getAgentFileType(kind),
    file_name: relativeFileName,
    content
  });

  if (error) throw new Error(error.message);
  console.log(`Generated ${relativeFileName}.`);
}
