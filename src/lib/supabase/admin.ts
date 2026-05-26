import { createClient } from "@supabase/supabase-js"

/**
 * Supabase client with service_role key. Bypasses RLS.
 * Use only in server-side code (server actions, API routes, scripts).
 * Never expose this client or its key to the browser.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
