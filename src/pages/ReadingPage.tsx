import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, BookOpen, ExternalLink, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { ReadingRecord } from '@/types'
import Modal from '@/components/Modal'
import { useLanguageStore } from '@/store/languageStore'

const ReadingPage = () => {
  const { user, isMock } = useAuthStore()
  const { t } = useLanguageStore()
  const [readings, setReadings] = useState<ReadingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<ReadingRecord | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    article_title: '',
    article_content: '',
    reading_notes: '',
    reading_time: 0,
  })

  useEffect(() => {
    fetchReadings()
  }, [user, isMock])

  const fetchReadings = async () => {
    setLoading(true)
    if (isMock) {
      // Mock data
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
      if (editingReading) {
        setReadings(readings.map(r => r.id === editingReading.id ? { ...r, ...formData } : r))
      } else {
        const newReading: ReadingRecord = {
          id: Math.random().toString(),
          user_id: 'mock-user',
          ...formData,
          created_at: new Date().toISOString()
        }
        setReadings([newReading, ...readings])
      }
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
      setReadings(readings.filter(r => r.id !== id))
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

  const filteredReadings = readings.filter(reading => 
    reading.article_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reading.article_content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">{t('reading.title')}</h1>
          <p className="text-muted-foreground">Read, comprehend, and reflect.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t('reading.addArticle')}
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

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading readings...</div>
      ) : filteredReadings.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border bg-muted/30">
          <p className="text-muted-foreground">{t('reading.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredReadings.map((reading) => (
            <div key={reading.id} className="group bg-card border border-border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-serif font-bold group-hover:text-primary/80 transition-colors">
                  {reading.article_title}
                </h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(reading)} className="p-1 hover:text-primary text-muted-foreground transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(reading.id)} className="p-1 hover:text-red-600 text-muted-foreground transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="prose prose-neutral max-w-none mb-6 text-foreground/80 line-clamp-3">
                {reading.article_content}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round(reading.reading_time / 60)} mins read
                </div>
                {reading.reading_notes && (
                  <div className="flex items-center gap-1 text-primary">
                    <BookOpen className="h-4 w-4" />
                    Has notes
                  </div>
                )}
                <div className="ml-auto font-serif italic">
                  {new Date(reading.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
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
