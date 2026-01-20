import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/supabase/client'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isMock: boolean
  initialize: () => Promise<void>
  signOut: () => Promise<void>
  loginWithMock: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isMock: false,
  initialize: async () => {
    // Prevent multiple initializations or re-initialization if already loaded
    if (get().isMock || (get().session && !get().loading)) return

    try {
      // Set a timeout to prevent infinite loading if Supabase is unreachable
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )

      const sessionPromise = supabase.auth.getSession()
      
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any
      const session = result.data?.session
      
      set({ session, user: session?.user ?? null, loading: false })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, loading: false })
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      // On error (e.g., timeout or config missing), stop loading so user isn't stuck
      set({ loading: false })
    }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, isMock: false })
  },
  loginWithMock: () => {
    const mockUser: User = {
      id: 'mock-user-id',
      app_metadata: {},
      user_metadata: { name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'demo@example.com',
      role: 'authenticated'
    }
    
    // Create a mock session object that satisfies the Session interface
    const mockSession: Session = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser
    }
    
    set({ user: mockUser, session: mockSession, isMock: true, loading: false })
  }
}))
