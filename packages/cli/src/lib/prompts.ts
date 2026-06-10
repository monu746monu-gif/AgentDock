import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function ask(question: string, fallback = "") {
  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question(`${question}${fallback ? ` (${fallback})` : ""}: `);
    return answer.trim() || fallback;
  } finally {
    rl.close();
  }
}

export async function askMultiline(question: string, fallback = "") {
  console.log(`${question}${fallback ? ` (${fallback})` : ""}:`);
  console.log("Finish with an empty line.");
  const rl = createInterface({ input, output });
  const lines: string[] = [];

  try {
    while (true) {
      const line = await rl.question("> ");
      if (!line.trim()) break;
      lines.push(line);
    }
  } finally {
    rl.close();
  }

  return lines.length > 0 ? lines.join("\n") : fallback;
}

export async function confirm(question: string, fallback = false) {
  const answer = (await ask(`${question} ${fallback ? "[Y/n]" : "[y/N]"}`)).toLowerCase();
  if (!answer) return fallback;
  return answer === "y" || answer === "yes";
}

export async function select<T>(question: string, items: T[], label: (item: T) => string) {
  if (items.length === 0) {
    throw new Error("No options available.");
  }

  console.log(question);
  items.forEach((item, index) => {
    console.log(`  ${index + 1}. ${label(item)}`);
  });

  const rawAnswer = await ask("Select number", "1");
  const index = Number.parseInt(rawAnswer, 10) - 1;

  if (Number.isNaN(index) || index < 0 || index >= items.length) {
    throw new Error("Invalid selection.");
  }

  return items[index];
}
