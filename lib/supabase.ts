import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Lazy client-side Supabase client - only created when actually needed
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = (): ReturnType<typeof createBrowserClient> => {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured')
    }
    _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// Legacy export for backward compatibility (but now lazy)
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createBrowserClient>]
  }
})

// Server-side Supabase client (for API routes)
export const createServerClient = (): ReturnType<typeof createClient> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Admin client for server-side operations (use with caution)
export const createAdminClient = (): ReturnType<typeof createClient> => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin environment variables are not configured')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
