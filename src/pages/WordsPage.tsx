import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, Volume2, Filter, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { Word } from '@/types'
import Modal from '@/components/Modal'

const WordsPage = () => {
  const { user, isMock } = useAuthStore()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | string[]>('all')
  
  // Form state
  const [formData, setFormData] = useState({
    english_word: '',
    chinese_meaning: '',
    phonetic_symbol: '',
    example_sentence: '',
  })

  useEffect(() => {
    fetchWords()
  }, [user, isMock])

  const fetchWords = async () => {
    setLoading(true)
    if (isMock) {
      // Mock data logic with localStorage persistence
      const storedWords = localStorage.getItem('mock_words')
      if (storedWords) {
        setWords(JSON.parse(storedWords))
      } else {
        const mockWords: Word[] = [
          {
            id: '1',
            user_id: 'mock-user',
            english_word: 'Serendipity',
            chinese_meaning: '机缘巧合',
            phonetic_symbol: '/ˌser.ənˈdɪp.ə.t̬i/',
            example_sentence: 'It was only through pure serendipity that we met.',
            mastery_level: 1,
            created_at: new Date().toISOString(),
            review_date: new Date().toISOString()
          },
          {
            id: '2',
            user_id: 'mock-user',
            english_word: 'Ephemeral',
            chinese_meaning: '转瞬即逝的',
            phonetic_symbol: '/ɪˈfem.ər.əl/',
            example_sentence: 'Fashion is ephemeral, changing every season.',
            mastery_level: 2,
            created_at: new Date().toISOString(),
            review_date: new Date().toISOString()
          }
        ]
        setWords(mockWords)
        localStorage.setItem('mock_words', JSON.stringify(mockWords))
      }
      setLoading(false)
    } else if (user) {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setWords(data)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMock) {
      let updatedWords: Word[]
      if (editingWord) {
        updatedWords = words.map(w => w.id === editingWord.id ? { ...w, ...formData } : w)
      } else {
        const newWord: Word = {
          id: Math.random().toString(),
          user_id: 'mock-user',
          ...formData,
          mastery_level: 0,
          created_at: new Date().toISOString(),
          review_date: new Date().toISOString()
        }
        updatedWords = [newWord, ...words]
      }
      setWords(updatedWords)
      localStorage.setItem('mock_words', JSON.stringify(updatedWords))
      closeModal()
    } else if (user) {
      try {
        if (editingWord) {
          const { error } = await supabase
            .from('words')
            .update(formData)
            .eq('id', editingWord.id)
          if (error) throw error
          fetchWords()
        } else {
          const { error } = await supabase
            .from('words')
            .insert([{ 
              user_id: user.id, 
              ...formData,
              mastery_level: 0,
              review_date: new Date().toISOString()
            }])
          if (error) throw error
          fetchWords()
        }
        closeModal()
      } catch (err: any) {
        console.error('Error saving word:', err)
        alert(`Failed to save word: ${err.message}. Please check your connection or permissions.`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this word?')) return

    if (isMock) {
      const updatedWords = words.filter(w => w.id !== id)
      setWords(updatedWords)
      localStorage.setItem('mock_words', JSON.stringify(updatedWords))
    } else {
      try {
        const { error } = await supabase.from('words').delete().eq('id', id)
        if (error) throw error
        fetchWords()
      } catch (err: any) {
        console.error('Error deleting word:', err)
        alert(`Failed to delete word: ${err.message}`)
      }
    }
  }

  const openAddModal = () => {
    setEditingWord(null)
    setFormData({
      english_word: '',
      chinese_meaning: '',
      phonetic_symbol: '',
      example_sentence: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (word: Word) => {
    setEditingWord(word)
    setFormData({
      english_word: word.english_word,
      chinese_meaning: word.chinese_meaning,
      phonetic_symbol: word.phonetic_symbol || '',
      example_sentence: word.example_sentence || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingWord(null)
  }

  // Get unique dates for filter
  const availableDates = React.useMemo(() => {
    const dates = new Set(words.map(word => new Date(word.created_at).toLocaleDateString()))
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [words])

  const filteredWords = words.filter(word => {
    const matchesSearch = word.english_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.chinese_meaning.includes(searchQuery)
    
    // selectedDate can now be an array of strings
    const dateStr = new Date(word.created_at).toLocaleDateString()
    const matchesDate = Array.isArray(selectedDate) 
      ? selectedDate.length === 0 || selectedDate.includes(dateStr)
      : selectedDate === 'all' || dateStr === selectedDate

    return matchesSearch && matchesDate
  })

  // Multi-select handler
  const toggleDate = (date: string) => {
    if (selectedDate === 'all') {
      setSelectedDate([date])
    } else if (Array.isArray(selectedDate)) {
      if (selectedDate.includes(date)) {
        const newDates = selectedDate.filter(d => d !== date)
        setSelectedDate(newDates.length === 0 ? 'all' : newDates)
      } else {
        setSelectedDate([...selectedDate, date])
      }
    } else {
      // If it was a single string (from old state), now become array
      if (selectedDate === date) {
        setSelectedDate('all')
      } else {
        setSelectedDate([selectedDate, date])
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Vocabulary</h1>
          <p className="text-muted-foreground">Build your personal dictionary, one word at a time.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Word
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search words..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10"
          />
        </div>
        
        <div className="w-full md:w-auto flex flex-col gap-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Filter by Date:
            {Array.isArray(selectedDate) && selectedDate.length > 0 && (
              <button 
                onClick={() => setSelectedDate('all')}
                className="text-xs text-primary hover:underline ml-auto"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-w-md">
            {availableDates.map(date => {
              const isSelected = Array.isArray(selectedDate) 
                ? selectedDate.includes(date)
                : selectedDate === date
              
              return (
                <button
                  key={date}
                  onClick={() => toggleDate(date)}
                  className={`px-3 py-1 text-sm border transition-colors ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-transparent text-foreground border-input hover:bg-secondary'
                  }`}
                >
                  {date}
                </button>
              )
            })}
            {availableDates.length === 0 && (
              <span className="text-sm text-muted-foreground italic">No dates available</span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading vocabulary...</div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border bg-muted/30">
          <p className="text-muted-foreground">No words found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWords.map((word) => (
            <div key={word.id} className="group bg-card border border-border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl font-serif font-bold">{word.english_word}</h3>
                  {word.phonetic_symbol && (
                    <span className="text-sm text-muted-foreground font-serif italic">
                      {word.phonetic_symbol}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(word)} className="p-1 hover:text-primary text-muted-foreground transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(word.id)} className="p-1 hover:text-red-600 text-muted-foreground transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-lg mb-4 text-foreground/80">{word.chinese_meaning}</p>
              
              {word.example_sentence && (
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground italic font-serif leading-relaxed">
                    "{word.example_sentence}"
                  </p>
                </div>
              )}
              
              <div className="mt-4 pt-2 border-t border-border/30 text-xs text-muted-foreground text-right font-mono">
                {new Date(word.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWord ? "Edit Word" : "Add New Word"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">English Word</label>
            <input
              type="text"
              required
              value={formData.english_word}
              onChange={e => setFormData({...formData, english_word: e.target.value})}
              className="input-base"
              placeholder="e.g. Serendipity"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phonetic Symbol</label>
            <input
              type="text"
              value={formData.phonetic_symbol}
              onChange={e => setFormData({...formData, phonetic_symbol: e.target.value})}
              className="input-base"
              placeholder="e.g. /ˌser.ənˈdɪp.ə.t̬i/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chinese Meaning</label>
            <input
              type="text"
              required
              value={formData.chinese_meaning}
              onChange={e => setFormData({...formData, chinese_meaning: e.target.value})}
              className="input-base"
              placeholder="e.g. 机缘巧合"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Example Sentence</label>
            <textarea
              value={formData.example_sentence}
              onChange={e => setFormData({...formData, example_sentence: e.target.value})}
              className="input-base min-h-[100px]"
              placeholder="Write a sentence using this word..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingWord ? 'Save Changes' : 'Add Word'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default WordsPage
