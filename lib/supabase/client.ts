import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Make sure these environment variables are properly exposed to the client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
export { createSupabaseClient as createClient }
