import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { User, Lock, ArrowRight } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { loginWithMock } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    loginWithMock()
    navigate('/')
  }

  // Pre-fill helper function
  const fillCredentials = (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Welcome Back</h1>
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
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Quick Access</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-transparent text-sm font-medium"
          >
            Guest Mode (No Data Sync)
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials('demo@example.com', 'password123')}
              className="py-2 px-3 text-xs border border-border hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground text-left"
            >
              <div className="font-medium text-foreground">Test User</div>
              demo@example.com
            </button>
            <button
              onClick={() => fillCredentials('admin@example.com', 'admin123')}
              className="py-2 px-3 text-xs border border-border hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground text-left"
            >
              <div className="font-medium text-foreground">Admin User</div>
              admin@example.com
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline underline-offset-4">Create account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
