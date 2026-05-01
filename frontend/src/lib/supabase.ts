import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== 'TU_URL_DE_SUPABASE' &&
  Boolean(supabaseServiceKey) &&
  supabaseServiceKey !== 'TU_SERVICE_ROLE_KEY' &&
  supabaseServiceKey !== 'TU_ANON_KEY'

// Solo creamos el cliente si hay configuración válida; si no, el API upload usa fallback local
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null
