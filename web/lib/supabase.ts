import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

let clientPromise: Promise<SupabaseClient> | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  if (!clientPromise) {
    const url = supabaseUrl;
    const anonKey = supabaseAnonKey;
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    );
  }

  return clientPromise;
}
