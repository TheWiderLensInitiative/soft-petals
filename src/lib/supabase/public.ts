import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Anonymous client for public pages: no cookies, so pages show exactly what visitors see. */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
