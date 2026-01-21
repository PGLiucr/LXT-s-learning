import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { Plus } from 'lucide-react'
import Modal from '@/components/Modal'
import { useNavigate } from 'react-router-dom'

const HomePage = () => {
  const { user, isMock } = useAuthStore()
  const [wordCount, setWordCount] = useState<number>(0)
  const [readingsCount, setReadingsCount] = useState<number>(0)
  const [streakDays, setStreakDays] = useState<number>(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const navigate = useNavigate()
  // Use a reliable placeholder service that is globally accessible
  // Using a solid color placeholder logic instead of an image tag for default to ensure reliability
  const [homeImage, setHomeImage] = useState<string | null>(null)

  const PRESET_AVATARS: { id: number; url: string; prompt: string }[] = [
    { id: 1, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", prompt: "Man 1" },
    { id: 2, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", prompt: "Woman 1" },
    { id: 3, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob", prompt: "Man 2" },
    { id: 4, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow", prompt: "Woman 2" },
    { id: 5, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jack", prompt: "Man 3" },
    { id: 6, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo", prompt: "Man 4" },
    { id: 7, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bella", prompt: "Woman 3" },
    { id: 8, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo", prompt: "Man 5" },
    { id: 9, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly", prompt: "Woman 4" },
    { id: 10, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe", prompt: "Woman 5" },
    { id: 11, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam", prompt: "Man 6" },
    { id: 12, url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna", prompt: "Woman 6" },
  ]

  useEffect(() => {
    fetchStats()
    // Load saved image from local storage if exists
    try {
      const savedImage = localStorage.getItem('home_image')
      if (savedImage) {
        setHomeImage(savedImage)
      }
    } catch (e) {
      console.error("Failed to load image from storage", e)
    }
  }, [user, isMock])

  const fetchStats = async () => {
    if (isMock) {
      // Mock Data Sync
      const storedWords = localStorage.getItem('mock_words')
      const storedReadings = localStorage.getItem('mock_readings')
      
      const words = storedWords ? JSON.parse(storedWords) : []
      setWordCount(words.length)
      setReadingsCount(storedReadings ? JSON.parse(storedReadings).length : 0)
      
      // Calculate streak from words dates
      if (words.length > 0) {
        const dates = [...new Set(words.map((w: any) => new Date(w.created_at).toDateString()))]
          .map(d => new Date(d as string).getTime())
          .sort((a, b) => b - a)
        
        let streak = 0
        let currentDate = new Date().setHours(0,0,0,0)
        
        // Check if there's activity today or yesterday to start the streak
        if (dates.includes(currentDate) || dates.includes(currentDate - 86400000)) {
             streak = 1
             let checkDate = dates.includes(currentDate) ? currentDate : currentDate - 86400000
             
             // Count backwards
             while (dates.includes(checkDate - 86400000)) {
               streak++
               checkDate -= 86400000
             }
        }
        setStreakDays(streak)
      } else {
        setStreakDays(0)
      }

    } else if (user) {
      // Real Data Sync
      const { count: wCount } = await supabase.from('words').select('*', { count: 'exact', head: true })
      const { count: rCount } = await supabase.from('reading_records').select('*', { count: 'exact', head: true })
      
      setWordCount(wCount || 0)
      setReadingsCount(rCount || 0)
      
      // Calculate streak (simplified version: fetching recent words to calculate)
      const { data: wordsData } = await supabase
        .from('words')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(100)
        
      if (wordsData && wordsData.length > 0) {
         const dates = [...new Set(wordsData.map(w => new Date(w.created_at).toDateString()))]
          .map(d => new Date(d).getTime())
          .sort((a, b) => b - a)
          
         let streak = 0
         let currentDate = new Date().setHours(0,0,0,0)
         
         if (dates.includes(currentDate) || dates.includes(currentDate - 86400000)) {
             streak = 1
             let checkDate = dates.includes(currentDate) ? currentDate : currentDate - 86400000
             while (dates.includes(checkDate - 86400000)) {
               streak++
               checkDate -= 86400000
             }
         }
         setStreakDays(streak)
      } else {
        setStreakDays(0)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setHomeImage(base64String)
        localStorage.setItem('home_image', base64String)
        setIsImageModalOpen(false)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-8">
        <div className="flex flex-col md:flex-row-reverse gap-8 items-center md:items-start justify-between">
          {/* Image Section - Top Right, Portrait, Moderate Size */}
          <div 
            className="w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden relative group cursor-pointer shadow-md bg-muted flex items-center justify-center"
            onClick={() => setIsImageModalOpen(true)}
          >
            {homeImage ? (
              <img 
                src={homeImage}
                alt="Personal" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground w-full h-full bg-slate-100">
                <Plus className="h-8 w-8 opacity-50" />
                <span className="font-serif italic text-sm">Add Photo</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Change Photo</span>
            </div>
          </div>

          <div className="flex-1 pt-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
              Welcome Back
            </h1>
            <p className="text-xl text-muted-foreground font-serif italic mb-6">
              "The limits of my language mean the limits of my world."
            </p>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/reading')}
          className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary group"
        >
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">Daily Readings</h2>
          <div className="text-4xl font-serif font-bold mb-2">{readingsCount}</div>
          <p className="text-muted-foreground text-sm">Articles read total</p>
        </div>
        
        <div 
          onClick={() => navigate('/words')}
          className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary group"
        >
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">Word Streak</h2>
          <div className="text-4xl font-serif font-bold mb-2">{streakDays} <span className="text-lg font-normal text-muted-foreground">days</span></div>
          <p className="text-muted-foreground text-sm">Consecutive learning days</p>
        </div>

        <div 
          onClick={() => navigate('/words')}
          className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary group"
        >
          <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">Words Learned</h2>
          <div className="text-4xl font-serif font-bold mb-2">{wordCount}</div>
          <p className="text-muted-foreground text-sm">Total vocabulary size</p>
        </div>
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Update Profile Photo"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto p-1">
          <div className="space-y-6">
            <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-muted border border-border relative flex items-center justify-center">
              {homeImage ? (
                <img src={homeImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Plus className="h-12 w-12 opacity-50" />
                  <span className="font-serif italic">No image selected</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Choose a Preset Avatar</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((avatar) => (
                    <div 
                      key={avatar.id}
                      onClick={() => {
                        setHomeImage(avatar.url)
                        localStorage.setItem('home_image', avatar.url)
                        setIsImageModalOpen(false)
                        // Trigger avatar update event
                        window.dispatchEvent(new Event('avatar-updated'))
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group bg-muted"
                    >
                      <img 
                        src={avatar.url} 
                        alt={avatar.prompt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or upload your own</span>
                </div>
              </div>

              <div className="flex justify-center">
                <label className="btn-primary cursor-pointer flex items-center gap-2 px-6 py-2 w-full justify-center">
                  <Plus className="h-4 w-4" />
                  <span>Select from Device</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Supports JPG, PNG, GIF (Max 5MB recommended)
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <button 
            onClick={() => setIsImageModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default HomePage
