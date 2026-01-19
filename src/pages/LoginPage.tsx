import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/supabase/client'
import { User, Lock, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('saved_password') || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    // Save password for future visits
    localStorage.setItem('saved_password', password)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // If login fails, try to register automatically
        if (error.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: email.split('@')[0],
              },
            },
          })
          
          if (signUpError) throw signUpError
          
          // After auto-register, try login again immediately
          const { error: retryLoginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (retryLoginError) {
             // If immediate login fails (likely due to email confirmation), inform user
             if (retryLoginError.message.includes('Email not confirmed')) {
               throw new Error('Account created! Please check your email to confirm.')
             }
             throw retryLoginError
          }
          navigate('/')
          return
        }
        throw error
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome Back 老铁</h1>
          <p className="text-muted-foreground">Continue your English learning journey</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 text-sm border border-red-100 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 group"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline underline-offset-4">Create account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
