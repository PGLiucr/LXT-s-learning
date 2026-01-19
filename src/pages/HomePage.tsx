import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'

const HomePage = () => {
  const { user, isMock } = useAuthStore()
  const [wordCount, setWordCount] = useState<number>(0)
  const [readingsCount, setReadingsCount] = useState<number>(0)
  const [streakDays, setStreakDays] = useState<number>(0)

  useEffect(() => {
    fetchStats()
  }, [user, isMock])

  const fetchStats = async () => {
    if (isMock) {
      // Mock Data Sync (Reading from localStorage)
      const storedWords = localStorage.getItem('mock_words')
      const storedReadings = localStorage.getItem('mock_readings') // Assuming you will add this later or now
      
      setWordCount(storedWords ? JSON.parse(storedWords).length : 2)
      setReadingsCount(storedReadings ? JSON.parse(storedReadings).length : 0)
      setStreakDays(12) // Mock streak for now
    } else if (user) {
      // Real Data Sync from Supabase
      const { count: wCount } = await supabase.from('words').select('*', { count: 'exact', head: true })
      const { count: rCount } = await supabase.from('reading_records').select('*', { count: 'exact', head: true })
      
      setWordCount(wCount || 0)
      setReadingsCount(rCount || 0)
      
      // Simple streak logic: check consecutive days of activity (simplified for now)
      // For now we'll keep streak static or calculate from logs if we had a logs table
      setStreakDays(12) 
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
          Welcome Back
        </h1>
        <p className="text-xl text-muted-foreground font-serif italic mb-6">
          "The limits of my language mean the limits of my world."
        </p>
        <div className="w-full h-[400px] rounded-lg overflow-hidden relative group">
          <img 
            src="https://lf-trae-resources.trae.ai/obj/trae-ai-public/9906d573673f32488880a1c6e1197825.jpg" 
            alt="Study Environment" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
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
          <p className="text-muted-foreground text-sm">Keep up the momentum</p>
        </div>

        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Words Learned</h2>
          <div className="text-4xl font-serif font-bold mb-2">{wordCount}</div>
          <p className="text-muted-foreground text-sm">Total vocabulary size</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
