import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Check your environment variables.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// it creates client using those credentials
// gets cred from env file
// check if they exist if not then throw error
// exports it for use everywhere