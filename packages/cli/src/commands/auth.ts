import { createClient } from "@supabase/supabase-js";
import { ask } from "../lib/prompts.js";
import { readConfig, removeConfig, writeConfig } from "../lib/config.js";

export async function loginCommand() {
  const supabaseUrl = await ask("Supabase URL");
  const supabaseAnonKey = await ask("Supabase anon key");
  const email = await ask("Email");
  const password = await ask("Password");
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Login failed.");
  }

  await writeConfig({
    supabaseUrl,
    supabaseAnonKey,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    userId: data.user.id,
    email: data.user.email ?? email
  });

  console.log(`Logged in as ${data.user.email ?? email}.`);
}

export async function logoutCommand() {
  await removeConfig();
  console.log("Logged out. Removed ~/.agentdock/config.json.");
}

export async function whoamiCommand() {
  const config = await readConfig();
  console.log(config ? config.email : "Not logged in. Run `agentdock login`.");
}
