import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key')
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey)

// Add a simple check to ensure we are connected
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Ensure user profile exists or is handled
    console.log('User signed in:', session?.user?.email)
  }
})
