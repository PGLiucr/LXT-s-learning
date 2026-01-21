import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Menu, GraduationCap, Home, Share2, Bell, MoreHorizontal, Search, Plus, User, ChevronRight, Settings, HelpCircle, LogOut, Moon, Users } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const { signOut, user } = useAuthStore()
  const { language, setLanguage, t } = useLanguageStore()
  const profileRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Load avatar from localStorage to sync with HomePage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    // Check system preference or saved preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true)
    }
    
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
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login')
    }
  }

  const handleSwitchAccount = async () => {
    // In a real app, this would show a list of saved accounts or a modal
    // For now, we'll sign out and redirect to login with a query param
    try {
      await signOut()
      navigate('/login?action=switch', { replace: true })
    } catch (error) {
      console.error('Switch account failed:', error)
      navigate('/login')
    }
  }

  const handleAvatarClick = () => {
    // Trigger file input click
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setAvatarUrl(base64String)
        localStorage.setItem('home_image', base64String)
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('avatar-updated'))
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className={`min-h-screen bg-background`}>
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
            <span className="text-xl font-serif font-bold tracking-tight text-primary hidden md:inline">{t('header.title')}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <NavLink to="/words" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>{t('header.dictionary')}</NavLink>
            <NavLink to="/reading" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>{t('header.reading')}</NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>{t('header.grammar')}</NavLink>
            <NavLink to="/notes" className={({ isActive }) => `text-sm font-bold hover:text-primary transition-colors ${isActive ? 'text-primary' : 'text-slate-600'}`}>{t('header.notes')}</NavLink>
          </nav>
        </div>
        
        {/* Right Side Icons */}
        <div className="flex items-center gap-3 md:gap-5">
          <button className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors text-sm font-medium">
            <Users className="h-4 w-4" />
            <span>{t('menu.share')}</span>
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
              <div className="absolute right-0 top-12 w-72 bg-card rounded-xl shadow-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                   <div 
                     className="w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity relative group"
                     onClick={handleAvatarClick}
                   >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{user?.email?.split('@')[0] || 'User'}</h3>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <div 
                    className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between group"
                    onClick={toggleTheme}
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">{t('menu.appearance')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{isDarkMode ? t('menu.dark') : t('menu.light')}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div 
                    className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between group"
                    onClick={toggleLanguage}
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">{t('menu.language')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{language === 'zh' ? t('menu.chinese') : t('menu.english')}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div 
                    className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between group"
                    onClick={handleSwitchAccount}
                  >
                    <span className="text-sm font-medium text-foreground group-hover:text-primary">{t('menu.switchAccount')}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="my-1 border-t border-border/50"></div>
                  
                  <div 
                    onClick={handleLogout}
                    className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center justify-between group text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <span className="text-sm font-medium">{t('menu.logout')}</span>
                    <LogOut className="h-4 w-4" />
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
