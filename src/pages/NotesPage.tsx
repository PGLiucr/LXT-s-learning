import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Edit2, Tag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { LearningNote } from '@/types'
import Modal from '@/components/Modal'

const NotesPage = () => {
  const { user, isMock } = useAuthStore()
  const [notes, setNotes] = useState<LearningNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<LearningNote | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  })

  useEffect(() => {
    fetchNotes()
  }, [user, isMock])

  const fetchNotes = async () => {
    setLoading(true)
    if (isMock) {
      // Mock data
      const mockNotes: LearningNote[] = [
        {
          id: '1',
          user_id: 'mock-user',
          title: 'Weekly Reflection - Week 1',
          content: 'I realized that listening practice is my weak point. I need to spend more time on podcasts. Specifically, I struggle with linking sounds in rapid speech.',
          tags: 'reflection, listening, goals',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'mock-user',
          title: 'Grammar Note: Past Perfect',
          content: 'Use past perfect to talk about an action that happened before another action in the past. "I had already eaten when she arrived."',
          tags: 'grammar, tenses',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]
      setNotes(mockNotes)
      setLoading(false)
    } else if (user) {
      const { data, error } = await supabase
        .from('learning_notes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setNotes(data)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isMock) {
      if (editingNote) {
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...formData, updated_at: new Date().toISOString() } : n))
      } else {
        const newNote: LearningNote = {
          id: Math.random().toString(),
          user_id: 'mock-user',
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setNotes([newNote, ...notes])
      }
      closeModal()
    } else if (user) {
      try {
        if (editingNote) {
          const { error } = await supabase
            .from('learning_notes')
            .update({ ...formData, updated_at: new Date().toISOString() })
            .eq('id', editingNote.id)
          if (error) throw error
          fetchNotes()
        } else {
          const { error } = await supabase
            .from('learning_notes')
            .insert([{ user_id: user.id, ...formData }])
          if (error) throw error
          fetchNotes()
        }
        closeModal()
      } catch (err: any) {
        console.error('Error saving note:', err)
        alert(`Failed to save note: ${err.message}`)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    if (isMock) {
      setNotes(notes.filter(n => n.id !== id))
    } else {
      try {
        const { error } = await supabase.from('learning_notes').delete().eq('id', id)
        if (error) throw error
        fetchNotes()
      } catch (err: any) {
        console.error('Error deleting note:', err)
        alert(`Failed to delete note: ${err.message}`)
      }
    }
  }

  const openAddModal = () => {
    setEditingNote(null)
    setFormData({
      title: '',
      content: '',
      tags: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (note: LearningNote) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
  }

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Learning Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts, ideas, and reflections.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input 
          type="text"
          placeholder="Search notes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border bg-muted/30">
          <p className="text-muted-foreground">No notes found. Write something down!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {filteredNotes.map((note) => (
            <div key={note.id} className="group break-inside-avoid bg-card border border-border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-serif font-bold leading-tight">{note.title}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(note)} className="p-1 hover:text-primary text-muted-foreground transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1 hover:text-red-600 text-muted-foreground transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="prose prose-sm prose-neutral max-w-none mb-4 text-foreground/80 whitespace-pre-wrap">
                {note.content}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-2">
                  {note.tags?.split(',').map((tag, i) => (
                    <span key={i} className="inline-flex items-center text-xs text-muted-foreground bg-secondary/50 px-2 py-1">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-serif italic">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingNote ? "Edit Note" : "Create New Note"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="input-base font-serif"
              placeholder="e.g. My Weekly Review"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              required
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="input-base min-h-[200px]"
              placeholder="Write your note here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
              className="input-base"
              placeholder="e.g. grammar, vocabulary, ideas (comma separated)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NotesPage
