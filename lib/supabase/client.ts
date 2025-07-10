/**
 * To update the Gemini API key:
 * 1. Set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables
 * 2. Or set GOOGLE_GENERATIVE_AI_API_KEY as an alternative
 * 3. Restart your development server after updating
 */
import { createBrowserClient } from "@supabase/ssr"

/**
 * Returns a singleton Supabase browser client.
 * In preview/dev we fall back to demo credentials so the
 * code doesn’t crash if env vars are missing.
 * Remember to set NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY in production!
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://demo.supabase.co"
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key"

    client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}
