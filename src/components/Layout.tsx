import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Menu, GraduationCap, Home } from 'lucide-react'
import Sidebar from './Sidebar'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

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
        
        <div className="flex items-center gap-2">
           <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
            title="Go to Home"
          >
            <Home className="h-5 w-5" />
          </button>
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
