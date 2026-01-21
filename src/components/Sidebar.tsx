import React from 'react'
import { X, Plus, User, Globe } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '@/store/languageStore'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { t } = useLanguageStore()

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
          <div className="flex items-center gap-2 font-serif font-bold text-xl text-foreground">
            {/* Logo removed */}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="h-5 w-5 text-foreground" />
          </button>
        </div>
        
        <div className="py-2">
          <div onClick={() => handleNavigation('/')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-foreground">{t('sidebar.home')}</span>
          </div>
          <div onClick={() => handleNavigation('/words')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-foreground">{t('sidebar.dictionary')}</span>
            <Plus className="h-4 w-4 text-foreground" />
          </div>
          <div onClick={() => handleNavigation('/reading')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-foreground">{t('sidebar.reading')}</span>
          </div>
          <div onClick={() => handleNavigation('/quiz')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-foreground">{t('sidebar.grammar')}</span>
          </div>
          <div onClick={() => handleNavigation('/notes')} className="px-6 py-4 hover:bg-muted cursor-pointer flex justify-between items-center border-b border-border/50">
            <span className="font-bold text-foreground">{t('sidebar.notes')}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-border p-4 space-y-4 bg-muted/30 absolute bottom-0 w-full">
          <div onClick={() => handleNavigation('/profile')} className="flex items-center gap-3 px-2 py-2 hover:bg-muted rounded cursor-pointer font-bold text-foreground">
            <User className="h-5 w-5 text-foreground" />
            <span>{t('sidebar.login')}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar