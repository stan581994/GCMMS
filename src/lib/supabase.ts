import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string

export const supabase = url && key && !url.startsWith('your-') ? createClient(url, key) : null

export const supabaseAdmin = url && serviceKey
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null
