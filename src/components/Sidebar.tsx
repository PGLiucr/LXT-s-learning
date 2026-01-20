import React from 'react'
import { X, Plus, User, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-out Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-2 font-serif font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded">C</div>
            <span>Cambridge</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="h-5 w-5 text-slate-900" />
          </button>
        </div>
        
        <div className="py-2">
          <div onClick={() => handleNavigation('/words')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-slate-900">Dictionary (Words)</span>
            <Plus className="h-4 w-4 text-slate-900" />
          </div>
          <div onClick={() => handleNavigation('/reading')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-slate-900">Reading</span>
          </div>
          <div onClick={() => handleNavigation('/quiz')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-slate-900">Grammar (Quiz)</span>
          </div>
          <div onClick={() => handleNavigation('/notes')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-slate-900">Notes</span>
          </div>
          <div className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-blue-800">Cambridge Dictionary +Plus</span>
          </div>
        </div>

        <div className="mt-auto border-t border-border p-4 space-y-4 bg-slate-50 absolute bottom-0 w-full">
          <div onClick={() => handleNavigation('/profile')} className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded cursor-pointer font-bold text-slate-900">
            <User className="h-5 w-5 fill-slate-900" />
            <span>Log in / Sign up</span>
          </div>
          <div className="flex items-center justify-between px-2 py-2 hover:bg-muted rounded cursor-pointer font-bold text-slate-900">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5" />
              <span>English (US)</span>
            </div>
            <span className="text-sm text-blue-600 font-normal hover:underline">Change</span>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-slate-900">Follow us</span>
              <div className="flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full hover:bg-slate-300 cursor-pointer">
                  <span className="font-bold text-slate-900">f</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full hover:bg-slate-300 cursor-pointer">
                  <div className="w-4 h-4 border-2 border-slate-900 rounded-sm"></div>
                </div>
                <div className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded-full hover:bg-slate-300 cursor-pointer">
                  <span className="font-bold text-slate-900">X</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar