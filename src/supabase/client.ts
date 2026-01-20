import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Fallback for development if env vars are missing
// This prevents the app from crashing with a white screen
// Instead, authStore will detect connection failure and switch to Mock Mode
const isConfigMissing = !supabaseUrl || !supabaseAnonKey

export const supabase = isConfigMissing 
  ? createClient('https://placeholder.supabase.co', 'placeholder-key') // Dummy client to prevent crash
  : createClient(supabaseUrl, supabaseAnonKey)

if (isConfigMissing) {
  console.warn('⚠️ Supabase credentials missing. App will likely run in Mock Mode.')
}

// Add a simple check to ensure we are connected
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Ensure user profile exists or is handled
    console.log('User signed in:', session?.user?.email)
  }
})
