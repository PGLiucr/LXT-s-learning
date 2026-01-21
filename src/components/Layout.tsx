import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Menu, GraduationCap, Home, Share2, Bell, MoreHorizontal, Search, Plus, User, ChevronRight, Settings, HelpCircle, LogOut, Moon, Users } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const { signOut, user } = useAuthStore()
  const profileRef = useRef<HTMLDivElement>(null)
  
  // Load avatar from localStorage to sync with HomePage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const updateAvatar = () => {
      const saved = localStorage.getItem('home_image')
      if (saved) setAvatarUrl(saved)
    }
    
    updateAvatar()
    // Listen for storage events (in case updated in another tab)
    window.addEventListener('storage', updateAvatar)
    // Custom event for same-tab updates
    window.addEventListener('avatar-updated', updateAvatar)
    
    return () => {
      window.removeEventListener('storage', updateAvatar)
      window.removeEventListener('avatar-updated', updateAvatar)
    }
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-primary" />
          </button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="bg-primary text-primary-foreground p-1">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-primary hidden md:inline">XinTong's Learning Plan</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <NavLink to="/words" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Dictionary</NavLink>
            <NavLink to="/reading" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Reading</NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Grammar</NavLink>
            <NavLink to="/notes" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>Notes</NavLink>
          </nav>
        </div>
        
        {/* Right Side Icons */}
        <div className="flex items-center gap-3 md:gap-5">
          <button className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium">
            <Users className="h-4 w-4" />
            <span>分享</span>
          </button>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-slate-600">
            <Bell className="h-5 w-5" />
          </button>
          
          <button className="hidden md:block p-2 hover:bg-muted rounded-full transition-colors text-slate-600">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          <div className="h-6 w-px bg-border hidden md:block"></div>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-slate-600">
            <Search className="h-5 w-5" />
          </button>
          
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-slate-600">
            <Plus className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-border hidden md:block"></div>

          {/* Avatar Dropdown */}
          <div className="relative" ref={profileRef}>
            <div 
              className="w-9 h-9 rounded-full overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">{user?.email?.split('@')[0] || '刘超然'}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>ByteDance</span>
                      <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                        已认证
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">外观</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">浅色</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">语言</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">切换账号</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  
                  <div className="my-1 border-t border-border/50"></div>
                  
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">设置</span>
                  </div>
                  
                  <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">帮助中心</span>
                  </div>
                  
                  <div className="my-1 border-t border-border/50"></div>
                  
                  <div 
                    onClick={handleLogout}
                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">退出登录</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-24 pb-12 container mx-auto max-w-5xl px-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
