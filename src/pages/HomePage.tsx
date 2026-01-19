import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { Plus } from 'lucide-react'
import Modal from '@/components/Modal'

const HomePage = () => {
  const { user, isMock } = useAuthStore()
  const [wordCount, setWordCount] = useState<number>(0)
  const [readingsCount, setReadingsCount] = useState<number>(0)
  const [streakDays, setStreakDays] = useState<number>(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [homeImage, setHomeImage] = useState("https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80") // Default cute dog/pet image

  useEffect(() => {
    fetchStats()
    // Load saved image from local storage if exists
    const savedImage = localStorage.getItem('home_image')
    if (savedImage) setHomeImage(savedImage)
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
          .map(d => new Date(d).getTime())
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

  const handleImageUpload = () => {
    const url = prompt("Please enter the URL of the image you want to use:")
    if (url) {
      setHomeImage(url)
      localStorage.setItem('home_image', url)
      setIsImageModalOpen(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Image Section - Top Left, Portrait, Moderate Size */}
          <div 
            className="w-48 h-64 flex-shrink-0 rounded-lg overflow-hidden relative group cursor-pointer shadow-md"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img 
              src={homeImage}
              alt="Personal" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
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
        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Daily Readings</h2>
          <div className="text-4xl font-serif font-bold mb-2">{readingsCount}</div>
          <p className="text-muted-foreground text-sm">Articles read total</p>
        </div>
        
        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Word Streak</h2>
          <div className="text-4xl font-serif font-bold mb-2">{streakDays} <span className="text-lg font-normal text-muted-foreground">days</span></div>
          <p className="text-muted-foreground text-sm">Consecutive learning days</p>
        </div>

        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Words Learned</h2>
          <div className="text-4xl font-serif font-bold mb-2">{wordCount}</div>
          <p className="text-muted-foreground text-sm">Total vocabulary size</p>
        </div>
      </div>

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="My Photo"
      >
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-muted">
            <img src={homeImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleImageUpload} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Replace Image
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HomePage
