import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'

const HomePage = () => {
  const { user, isMock } = useAuthStore()
  const [wordCount, setWordCount] = useState<number>(0)

  useEffect(() => {
    fetchStats()
  }, [user, isMock])

  const fetchStats = async () => {
    if (isMock) {
      // Try to read from localStorage first for more accurate mock stats
      const storedWords = localStorage.getItem('mock_words')
      if (storedWords) {
        const words = JSON.parse(storedWords)
        setWordCount(words.length)
      } else {
        // Fallback to initial mock data count if nothing in storage
        setWordCount(2)
      }
    } else if (user) {
      const { count, error } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
      
      if (!error && count !== null) {
        setWordCount(count)
      }
    }
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-8">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
          Welcome Back
        </h1>
        <p className="text-xl text-muted-foreground font-serif italic">
          "The limits of my language mean the limits of my world."
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Daily Progress</h2>
          <div className="text-4xl font-serif font-bold mb-2">85%</div>
          <p className="text-muted-foreground text-sm">Target completed today</p>
        </div>
        
        <div className="bg-card border border-border p-8 hover:shadow-lg transition-all duration-300">
          <h2 className="text-2xl font-bold mb-2">Word Streak</h2>
          <div className="text-4xl font-serif font-bold mb-2">12 <span className="text-lg font-normal text-muted-foreground">days</span></div>
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
