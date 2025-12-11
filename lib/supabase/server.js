import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

export function createServerSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase server env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
