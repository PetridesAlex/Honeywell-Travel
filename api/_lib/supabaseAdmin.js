/**
 * Shared Supabase admin client for Vercel serverless handlers.
 * Prefer SUPABASE_SECRET_KEY (JWT service_role). Never use in browser code.
 */
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
