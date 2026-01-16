import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, BookOpen, Book, PenTool, User, GraduationCap } from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/words', label: 'Words', icon: BookOpen },
  { path: '/reading', label: 'Reading', icon: Book },
  { path: '/quiz', label: 'Quiz', icon: GraduationCap },
  { path: '/notes', label: 'Notes', icon: PenTool },
  { path: '/profile', label: 'Profile', icon: User },
]

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-1">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-primary">XinTong's Learning Plan</span>
        </div>
        
        <nav className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/20"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="pt-24 pb-12 container mx-auto max-w-5xl px-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
