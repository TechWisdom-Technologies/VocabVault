import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
  supabaseAdmin: SupabaseClient | undefined;
};

// Public client (for file uploads with anon key)
export const supabase: SupabaseClient =
  globalForSupabase.supabase ??
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Admin client (for server-side operations with service role key)
export const supabaseAdmin: SupabaseClient | null =
  typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? (globalForSupabase.supabaseAdmin ??
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      ))
    : null;

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
  if (supabaseAdmin) globalForSupabase.supabaseAdmin = supabaseAdmin;
}
