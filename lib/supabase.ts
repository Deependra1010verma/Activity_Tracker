import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let browserClient: ReturnType<typeof createClient> | null = null;

export function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl as string, supabaseAnonKey as string);
  }

  return browserClient;
}
