import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { config } from "@/lib/config"

export function createClient() {
  const cookieStore = cookies()

  return createSupabaseClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
