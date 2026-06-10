import { createClient } from "@supabase/supabase-js";
import { requireConfig, writeConfig } from "./config.js";

export async function getSupabase() {
  const config = await requireConfig();
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
  const { data, error } = await supabase.auth.setSession({
    access_token: config.accessToken,
    refresh_token: config.refreshToken
  });

  if (error) {
    throw new Error(`Supabase session failed: ${error.message}`);
  }

  if (data.session) {
    await writeConfig({
      ...config,
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      userId: data.session.user.id,
      email: data.session.user.email ?? config.email
    });
  }

  return { config, supabase };
}
