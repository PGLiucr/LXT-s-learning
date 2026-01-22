import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, Edit2, BookOpen, ExternalLink, Clock, Heart, Volume2, X, Play } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { ReadingRecord } from '@/types'
import Modal from '@/components/Modal'
import { useLanguageStore } from '@/store/languageStore'
import { CET6_READING_SAMPLE, CET6Article } from '@/data/cet6_reading'
import { generateLargeLibrary } from '@/data/articleGenerator'
import { useAudioStore } from '@/store/audioStore'

const ReadingPage = () => {
  const { user, isMock } = useAuthStore()
  const { t } = useLanguageStore()
  const { playArticle } = useAudioStore()
  const [readings, setReadings] = useState<ReadingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<ReadingRecord | null>(null)
  
  // New States for Tab and Article View
  const [activeTab, setActiveTab] = useState<'my-readings' | 'cet6-library'>('my-readings')
  const [selectedArticle, setSelectedArticle] = useState<CET6Article | null>(null)
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Generate large library once
  const largeLibrary = useMemo(() => {
    return [...CET6_READING_SAMPLE, ...generateLargeLibrary(1000)]
  }, [])
  
  // Form state
  const [formData, setFormData] = useState({
    article_title: '',
    article_content: '',
    reading_notes: '',
    reading_time: 0,
  })

  useEffect(() => {
    fetchReadings()
    // Load favorites from local storage
    const storedFavs = localStorage.getItem('favorites')
    if (storedFavs) {
      setFavorites(new Set(JSON.parse(storedFavs)))
    }
  }, [user, isMock])

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const newFavs = new Set(favorites)
    if (newFavs.has(id)) {
      newFavs.delete(id)
    } else {
      newFavs.add(id)
    }
    setFavorites(newFavs)
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavs)))
  }

  const handlePlay = (article: CET6Article, e?: React.MouseEvent) => {
    e?.stopPropagation()
    playArticle(article, filteredCET6)
  }

  const fetchReadings = async () => {
    setLoading(true)
    if (isMock) {
      // Mock data
      const storedReadings = localStorage.getItem('mock_readings')
      if (storedReadings) {
        setReadings(JSON.parse(storedReadings))
      } else {
        const mockReadings: ReadingRecord[] = [
          {
            id: '1',
            user_id: 'mock-user',
            article_title: 'The Benefits of Bilingualism',
            article_content: 'Speaking two languages rather than just one has obvious practical benefits in an increasingly globalized world. But in recent years, scientists have begun to show that the advantages of bilingualism are even more fundamental than being able to converse with a wider range of people. Being bilingual, it turns out, makes you smarter. It can have a profound effect on your brain, improving cognitive skills not related to language and even shielding against dementia in old age.',
            reading_notes: 'Interesting point about dementia protection. Need to look up more studies on this.',
            reading_time: 300,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: 'mock-user',
            article_title: 'Minimalism in Design',
            article_content: 'Minimalism is a design trend that started in the 20th century and continues today. It emphasizes simplicity and the removal of superfluous elements in a design. The mantra "less is more" is often associated with this movement.',
            reading_notes: 'Good vocabulary: superfluous, mantra.',
            reading_time: 180,
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]
        setReadings(mockReadings)
        localStorage.setItem('mock_readings', JSON.stringify(mockReadings))
      }
      setLoading(false)
    } else if (user) {
      const { data, error } = await supabase
        .from('reading_records')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setReadings(data)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMock) {
      let updatedReadings: ReadingRecord[]
      if (editingReading) {
        updatedReadings = readings.map(r => r.id === editingReading.id ? { ...r, ...formData } : r)
      } else {
        const newReading: ReadingRecord = {
          id: Math.random().toString(),
          user_id: 'mock-user',
          ...formData,
          created_at: new Date().toISOString()
        }
        updatedReadings = [newReading, ...readings]
      }
      setReadings(updatedReadings)
      localStorage.setItem('mock_readings', JSON.stringify(updatedReadings))
      closeModal()
    } else if (user) {
      try {
        if (editingReading) {
          const { error } = await supabase
            .from('reading_records')
            .update(formData)
            .eq('id', editingReading.id)
          if (error) throw error
          fetchReadings()
        } else {
          const { error } = await supabase
            .from('reading_records')
            .insert([{ user_id: user.id, ...formData }])
          if (error) throw error
          fetchReadings()
        }
        closeModal()
      } catch (err: any) {
        console.error('Error saving reading record:', err)
        alert(`Failed to save reading record: ${err.message}`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reading record?')) return

    if (isMock) {
      const updatedReadings = readings.filter(r => r.id !== id)
      setReadings(updatedReadings)
      localStorage.setItem('mock_readings', JSON.stringify(updatedReadings))
    } else {
      try {
        const { error } = await supabase.from('reading_records').delete().eq('id', id)
        if (error) throw error
        fetchReadings()
      } catch (err: any) {
        console.error('Error deleting reading record:', err)
        alert(`Failed to delete reading record: ${err.message}`)
      }
    }
  }

  const fetchDailyArticle = async () => {
    // Simulate fetching from an external API
    const mockArticles = [
      {
        title: "The Power of Habit",
        content: "Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous."
      },
      {
        title: "Why We Sleep",
        content: "Sleep is the single most effective thing we can do to reset our brain and body health each day — Mother Nature's best effort yet at contra-death."
      }
    ]
    const randomArticle = mockArticles[Math.floor(Math.random() * mockArticles.length)]
    
    setFormData({
      ...formData,
      article_title: randomArticle.title,
      article_content: randomArticle.content
    })
  }

  const openAddModal = () => {
    setEditingReading(null)
    setFormData({
      article_title: '',
      article_content: '',
      reading_notes: '',
      reading_time: 0,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (reading: ReadingRecord) => {
    setEditingReading(reading)
    setFormData({
      article_title: reading.article_title,
      article_content: reading.article_content,
      reading_notes: reading.reading_notes || '',
      reading_time: reading.reading_time,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReading(null)
  }

  const openArticle = (article: CET6Article) => {
    setSelectedArticle(article)
    setIsArticleModalOpen(true)
  }

  const filteredReadings = readings.filter(reading => 
    reading.article_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reading.article_content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [visibleCount, setVisibleCount] = useState(20)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Infinite Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !isLoadingMore &&
        visibleCount < largeLibrary.length
      ) {
        setIsLoadingMore(true)
        setTimeout(() => {
          setVisibleCount(prev => prev + 20)
          setIsLoadingMore(false)
        }, 500)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isLoadingMore, visibleCount, largeLibrary.length])

  const filteredCET6 = largeLibrary.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, visibleCount)

  // Combined readings for "My Readings" tab
  const myReadingsCombined = useMemo(() => {
    const favoritedArticles = largeLibrary.filter(article => favorites.has(article.id)).map(article => ({
      id: article.id,
      user_id: user?.id || 'mock-user',
      article_title: article.title,
      article_content: article.content, // Or summary if preferred
      reading_notes: '', // CET-6 articles don't have user notes initially
      reading_time: article.duration * 60, // Convert mins to seconds
      created_at: new Date().toISOString(), // Use current time or store favorite time
      is_cet6_favorite: true,
      cet6_data: article // Store original data for display
    })) as any[] // Type casting for mixed array

    // Filter user readings by search
    const userReadingsFiltered = readings.filter(reading => 
      reading.article_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.article_content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    // Filter favorite articles by search
    const favArticlesFiltered = favoritedArticles.filter(reading => 
        reading.article_title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return [...userReadingsFiltered, ...favArticlesFiltered].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [readings, favorites, largeLibrary, searchQuery, user])

  return (
    <div className="space-y-8 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">{t('reading.title')}</h1>
          <p className="text-muted-foreground">{t('reading.subtitle')}</p>
        </div>
        {activeTab === 'my-readings' && (
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('reading.addArticle')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('my-readings')}
          className={`pb-3 text-base font-bold transition-colors relative px-2 ${
            activeTab === 'my-readings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('reading.tabs.myReadings')}
          {activeTab === 'my-readings' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cet6-library')}
          className={`pb-3 text-base font-bold transition-colors relative px-2 ${
            activeTab === 'cet6-library' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('reading.tabs.cet6Library')}
          {activeTab === 'cet6-library' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder={t('reading.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {activeTab === 'my-readings' ? (
        loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading readings...</div>
        ) : myReadingsCombined.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border bg-muted/30">
            <p className="text-muted-foreground">{t('reading.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myReadingsCombined.map((reading) => (
              <div 
                key={reading.id} 
                className="group bg-card border border-border p-6 hover:shadow-lg transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                style={{ animationDelay: `${Math.random() * 0.2}s` }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Show image if it's a CET-6 favorite */}
                   {reading.cet6_data && (
                     <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg relative cursor-pointer" onClick={() => openArticle(reading.cet6_data)}>
                        <img 
                          src={reading.cet6_data.imageUrl} 
                          alt={reading.article_title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-2 right-2">
                           <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                        </div>
                     </div>
                   )}
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          className="text-2xl font-serif font-bold group-hover:text-primary/80 transition-colors cursor-pointer"
                          onClick={() => reading.cet6_data ? openArticle(reading.cet6_data) : openEditModal(reading)}
                        >
                          {reading.article_title}
                        </h3>
                        {!reading.cet6_data && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(reading)} className="p-1 hover:text-primary text-muted-foreground transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(reading.id)} className="p-1 hover:text-red-600 text-muted-foreground transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {reading.cet6_data && (
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={(e) => toggleFavorite(reading.id, e)} className="p-1 text-pink-500 hover:text-pink-600 transition-colors" title="Remove from favorites">
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                        )}
                      </div>
                      
                      <div className="prose prose-neutral max-w-none mb-4 text-foreground/80 line-clamp-2">
                        {reading.article_content}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4 items-center">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.round(reading.reading_time / 60)} {t('reading.minutes')} read
                        </div>
                        {reading.reading_notes && (
                          <div className="flex items-center gap-1 text-primary">
                            <BookOpen className="h-4 w-4" />
                            Has notes
                          </div>
                        )}
                        <div className="ml-auto font-serif italic text-xs flex items-center gap-2">
                          <span>Added: {new Date(reading.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* CET-6 Library View */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCET6.map((article) => (
              <div 
                key={article.id} 
                onClick={() => openArticle(article)}
                className="group bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'; // Fallback image
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded bg-black/50 text-white backdrop-blur-sm`}>
                      {article.category}
                    </span>
                  </div>
                  {/* Overlay Play Button on Hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 text-white">
                        <BookOpen className="h-6 w-6" />
                     </div>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded border ${
                        article.difficulty === 'Easy' ? 'border-green-200 text-green-700 bg-green-50' :
                        article.difficulty === 'Medium' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                        'border-red-200 text-red-700 bg-red-50'
                      }`}>
                        {article.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {article.duration} {t('reading.minutes')}
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => toggleFavorite(article.id, e)}
                      className="p-2 rounded-full hover:bg-pink-50 transition-colors"
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(article.id) ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground hover:text-pink-500'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {isLoadingMore && (
             <div className="flex justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
          )}
        </>
      )}

      {/* Article Reading Modal */}
      {selectedArticle && (
        <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto transition-opacity duration-300 ${isArticleModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <div className="bg-card w-full max-w-4xl shadow-2xl border border-border rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="relative h-64 md:h-80 w-full">
                <img 
                  src={selectedArticle.imageUrl} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded uppercase tracking-wider">
                      {selectedArticle.category}
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded backdrop-blur-md">
                      {selectedArticle.difficulty}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 leading-tight">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {selectedArticle.duration} {t('reading.minutes')} read
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsArticleModalOpen(false)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-border">
                  <div className="flex gap-4">
                    <button 
                      onClick={(e) => handlePlay(selectedArticle, e)}
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold shadow-lg active:scale-95"
                    >
                      <Play className="h-5 w-5 fill-current" /> Listen
                    </button>
                    <button 
                      onClick={(e) => toggleFavorite(selectedArticle.id, e)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full border border-border hover:bg-pink-50 transition-colors font-medium group ${favorites.has(selectedArticle.id) ? 'text-pink-500 border-pink-200 bg-pink-50' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(selectedArticle.id) ? 'fill-current' : 'group-hover:text-pink-500'}`} /> 
                      {favorites.has(selectedArticle.id) ? 'Favorited' : 'Favorite'}
                    </button>
                  </div>
                </div>

                <div className="prose prose-lg prose-neutral max-w-none font-serif leading-relaxed">
                  {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-6 text-foreground/90">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingReading ? "Edit Reading Record" : t('reading.addArticle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={fetchDailyArticle}
              className="text-xs flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Get Daily Article
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Article Title</label>
            <input
              type="text"
              required
              value={formData.article_title}
              onChange={e => setFormData({...formData, article_title: e.target.value})}
              className="input-base"
              placeholder="e.g. The Old Man and the Sea"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              required
              value={formData.article_content}
              onChange={e => setFormData({...formData, article_content: e.target.value})}
              className="input-base min-h-[200px]"
              placeholder="Paste article content here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reading Notes</label>
            <textarea
              value={formData.reading_notes}
              onChange={e => setFormData({...formData, reading_notes: e.target.value})}
              className="input-base min-h-[100px]"
              placeholder="Write your reflections, new vocabulary, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reading Time (seconds)</label>
            <input
              type="number"
              value={formData.reading_time}
              onChange={e => setFormData({...formData, reading_time: parseInt(e.target.value)})}
              className="input-base"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">
              {t('home.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {editingReading ? 'Save Changes' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ReadingPage
