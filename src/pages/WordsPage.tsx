import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, Volume2, Filter, Calendar, Book, CheckSquare, GraduationCap, X, Check, Heart, Menu, Globe, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { Word } from '@/types'
import Modal from '@/components/Modal'
import { CET6_SAMPLE } from '@/data/cet6_sample'
import { fetchCET6Vocabulary } from '@/services/dictionaryService'

const WordsPage = () => {
  const { user, isMock } = useAuthStore()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | string[]>('all')
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  
  // Library & Dictation States
   const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const [libraryWords, setLibraryWords] = useState<any[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
   
   const [selectedLibraryWords, setSelectedLibraryWords] = useState<string[]>([])
  const [selectedDictationWords, setSelectedDictationWords] = useState<string[]>([])
  const [isDictationMode, setIsDictationMode] = useState(false)
  
  // Dictation Game State
  const [dictationQueue, setDictationQueue] = useState<Word[]>([])
  const [currentDictationIndex, setCurrentDictationIndex] = useState(0)
  const [userSpelling, setUserSpelling] = useState('')
  const [dictationFeedback, setDictationFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')

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

  const openLibrary = async () => {
    setIsLibraryOpen(true)
    if (libraryWords.length === 0) {
      setLibraryLoading(true)
      try {
        const data = await fetchCET6Vocabulary()
        setLibraryWords(data)
      } catch (error) {
        console.error("Failed to load library", error)
        alert("Failed to load CET-6 vocabulary library")
      } finally {
        setLibraryLoading(false)
      }
    }
  }

  const handleImportCET6 = async () => {
    if (selectedLibraryWords.length === 0) return

    const wordsToImport = libraryWords.filter(w => selectedLibraryWords.includes(w.english_word))
    
    if (isMock) {
      const newWords = wordsToImport.map(w => ({
        id: Math.random().toString(),
        user_id: 'mock-user',
        ...w,
        mastery_level: 0,
        created_at: new Date().toISOString(),
        review_date: new Date().toISOString()
      }))
      const updatedWords = [...newWords, ...words]
      setWords(updatedWords)
      localStorage.setItem('mock_words', JSON.stringify(updatedWords))
      setIsLibraryOpen(false)
      setSelectedLibraryWords([])
      alert(`Imported ${newWords.length} words!`)
    } else if (user) {
      try {
        const { error } = await supabase
          .from('words')
          .insert(wordsToImport.map(w => ({
            user_id: user.id,
            ...w,
            mastery_level: 0,
            review_date: new Date().toISOString()
          })))
        
        if (error) throw error
        
        fetchWords()
        setIsLibraryOpen(false)
        setSelectedLibraryWords([])
        alert(`Successfully imported ${wordsToImport.length} words!`)
      } catch (err: any) {
        console.error('Error importing words:', err)
        alert(`Failed to import words: ${err.message}`)
      }
    }
  }

  const startDictation = () => {
    if (selectedDictationWords.length === 0) return
    
    const queue = words.filter(w => selectedDictationWords.includes(w.id))
    // Shuffle queue
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }
    
    setDictationQueue(queue)
    setCurrentDictationIndex(0)
    setUserSpelling('')
    setDictationFeedback('idle')
    setIsDictationMode(true)
  }

  const checkSpelling = (e: React.FormEvent) => {
    e.preventDefault()
    const currentWord = dictationQueue[currentDictationIndex]
    if (userSpelling.trim().toLowerCase() === currentWord.english_word.toLowerCase()) {
      setDictationFeedback('correct')
    } else {
      setDictationFeedback('wrong')
    }
  }

  const nextDictationWord = () => {
    if (currentDictationIndex < dictationQueue.length - 1) {
      setCurrentDictationIndex(prev => prev + 1)
      setUserSpelling('')
      setDictationFeedback('idle')
    } else {
      alert("Dictation Session Completed!")
      setIsDictationMode(false)
      setSelectedDictationWords([])
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

  // Toggle selection for dictation
  const toggleDictationSelect = (id: string) => {
    if (selectedDictationWords.includes(id)) {
      setSelectedDictationWords(prev => prev.filter(wId => wId !== id))
    } else {
      setSelectedDictationWords(prev => [...prev, id])
    }
  }

  const toggleAllDictation = () => {
    if (selectedDictationWords.length === filteredWords.length) {
      setSelectedDictationWords([])
    } else {
      setSelectedDictationWords(filteredWords.map(w => w.id))
    }
  }

  const speakWord = (text: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering row click or other events
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US' // Set language to English US
    utterance.rate = 0.9 // Slightly slower for clarity
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Vocabulary</h1>
          <p className="text-muted-foreground">Build your personal dictionary, one word at a time.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openLibrary} className="btn-outline flex items-center gap-2">
            <Book className="h-4 w-4" /> CET-6 Library
          </button>
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Word
          </button>
        </div>
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

      {/* Dictation Toolbar */}
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleAllDictation}
            className="text-sm font-medium flex items-center gap-2 hover:text-primary"
          >
            <CheckSquare className={`h-4 w-4 ${selectedDictationWords.length === filteredWords.length && filteredWords.length > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
            {selectedDictationWords.length === filteredWords.length && filteredWords.length > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-muted-foreground">
            {selectedDictationWords.length} selected
          </span>
        </div>
        <button 
          onClick={startDictation}
          disabled={selectedDictationWords.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GraduationCap className="h-4 w-4" />
          Start Dictation
        </button>
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
            <div key={word.id} className={`group bg-card border transition-all duration-300 ${selectedDictationWords.includes(word.id) ? 'border-primary shadow-md' : 'border-border hover:shadow-lg'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => speakWord(word.english_word, e)}
                        className="text-pink-400 hover:text-pink-600 hover:scale-110 transition-all"
                        title="Listen to pronunciation"
                      >
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    <input 
                      type="checkbox"
                      checked={selectedDictationWords.includes(word.id)}
                      onChange={() => toggleDictationSelect(word.id)}
                      className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                    />
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-2xl font-serif font-bold">{word.english_word}</h3>
                      {word.phonetic_symbol && (
                        <span className="text-sm text-muted-foreground font-serif italic">
                          {word.phonetic_symbol}
                        </span>
                      )}
                    </div>
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
                
                <div className="pl-9">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        title="Import from CET-6 Library"
      >
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {CET6_SAMPLE.map((word, idx) => {
              // Check if word is already in user's list
              const isAlreadyAdded = words.some(w => w.english_word.toLowerCase() === word.english_word.toLowerCase())
              const isSelected = selectedLibraryWords.includes(word.english_word)

              return (
                <div key={idx} className={`p-4 flex items-center justify-between hover:bg-muted/50 transition-colors ${isAlreadyAdded ? 'bg-muted/30 opacity-60' : ''}`}>
                  <div>
                    <div className="font-bold">{word.english_word} <span className="text-sm font-normal text-muted-foreground ml-2">{word.phonetic_symbol}</span></div>
                    <div className="text-sm text-muted-foreground">{word.chinese_meaning}</div>
                  </div>
                  {isAlreadyAdded ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Added</span>
                  ) : (
                    <button 
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLibraryWords(prev => prev.filter(w => w !== word.english_word))
                        } else {
                          setSelectedLibraryWords(prev => [...prev, word.english_word])
                        }
                      }}
                      className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input hover:border-primary'}`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {selectedLibraryWords.length} words selected
            </span>
            <div className="flex gap-3">
              <button onClick={() => setIsLibraryOpen(false)} className="btn-outline">
                Cancel
              </button>
              <button 
                onClick={handleImportCET6} 
                disabled={selectedLibraryWords.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                Import Selected
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Dictation Mode Overlay */}
      {isDictationMode && dictationQueue.length > 0 && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-serif font-bold">Dictation Mode</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">
                  {currentDictationIndex + 1} / {dictationQueue.length}
                </span>
                <button onClick={() => setIsDictationMode(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-12 flex flex-col items-center gap-8">
              <div className="text-center space-y-4">
                <h3 className="text-4xl font-bold text-foreground">
                  {dictationQueue[currentDictationIndex].chinese_meaning}
                </h3>
                {dictationQueue[currentDictationIndex].phonetic_symbol && (
                  <p className="text-xl text-muted-foreground font-serif italic">
                    {dictationQueue[currentDictationIndex].phonetic_symbol}
                  </p>
                )}
              </div>

              {/* Input Area */}
              <div className="w-full max-w-md space-y-4">
                <form onSubmit={checkSpelling}>
                  <input
                    type="text"
                    autoFocus
                    value={userSpelling}
                    onChange={(e) => setUserSpelling(e.target.value)}
                    disabled={dictationFeedback !== 'idle'}
                    placeholder="Type the English word..."
                    className={`w-full text-center text-3xl font-bold p-4 border-b-2 bg-transparent focus:outline-none transition-colors ${
                      dictationFeedback === 'idle' ? 'border-primary/50 focus:border-primary' :
                      dictationFeedback === 'correct' ? 'border-green-500 text-green-600' :
                      'border-red-500 text-red-600'
                    }`}
                  />
                </form>

                {dictationFeedback !== 'idle' && (
                  <div className={`text-center animate-in slide-in-from-top-2 fade-in duration-300 ${
                    dictationFeedback === 'correct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dictationFeedback === 'correct' ? (
                      <div className="flex items-center justify-center gap-2 font-bold text-xl">
                        <Check className="h-6 w-6" /> Correct!
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2 font-bold text-xl">
                          <X className="h-6 w-6" /> Incorrect
                        </div>
                        <p className="text-muted-foreground">
                          Answer: <span className="font-bold text-foreground">{dictationQueue[currentDictationIndex].english_word}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Example Sentence (Masked until answered) */}
              <div className="w-full bg-muted/50 p-6 rounded-lg text-center">
                <p className="text-muted-foreground italic font-serif text-lg">
                  {dictationFeedback === 'idle' 
                    ? dictationQueue[currentDictationIndex].example_sentence?.replace(
                        new RegExp(dictationQueue[currentDictationIndex].english_word, 'gi'), 
                        '_____'
                      )
                    : dictationQueue[currentDictationIndex].example_sentence
                  }
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex justify-end">
              {dictationFeedback === 'idle' ? (
                <button onClick={checkSpelling} className="btn-primary px-8 py-3 text-lg w-full md:w-auto">
                  Check Answer
                </button>
              ) : (
                <button onClick={nextDictationWord} className="btn-primary px-8 py-3 text-lg w-full md:w-auto flex items-center justify-center gap-2">
                  Next Word <Volume2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standard Edit Modal */}
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
