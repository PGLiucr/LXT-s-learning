import { create } from 'zustand'
import { CET6Article } from '@/data/cet6_reading'

interface AudioState {
  currentArticle: CET6Article | null
  isPlaying: boolean
  playlist: CET6Article[]
  speechSynthesisUtterance: SpeechSynthesisUtterance | null
  
  playArticle: (article: CET6Article, playlist: CET6Article[]) => void
  togglePlay: () => void
  playNext: () => void
  playPrev: () => void
  closePlayer: () => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentArticle: null,
  isPlaying: false,
  playlist: [],
  speechSynthesisUtterance: null,

  playArticle: (article, playlist) => {
    const { speechSynthesisUtterance } = get()
    
    // Stop previous
    if (speechSynthesisUtterance) {
      window.speechSynthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(article.content)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    
    utterance.onend = () => {
      set({ isPlaying: false })
      get().playNext() // Auto play next
    }

    window.speechSynthesis.speak(utterance)

    set({ 
      currentArticle: article, 
      playlist, 
      isPlaying: true,
      speechSynthesisUtterance: utterance
    })
  },

  togglePlay: () => {
    const { isPlaying, currentArticle, speechSynthesisUtterance } = get()
    if (!currentArticle) return

    if (isPlaying) {
      window.speechSynthesis.pause()
      set({ isPlaying: false })
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else if (!window.speechSynthesis.speaking && currentArticle) {
        // Restart if nothing is speaking but we have an article
        get().playArticle(currentArticle, get().playlist)
        return
      }
      set({ isPlaying: true })
    }
  },

  playNext: () => {
    const { currentArticle, playlist } = get()
    if (!currentArticle || playlist.length === 0) return

    const currentIndex = playlist.findIndex(a => a.id === currentArticle.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    const nextArticle = playlist[nextIndex]
    
    get().playArticle(nextArticle, playlist)
  },

  playPrev: () => {
    const { currentArticle, playlist } = get()
    if (!currentArticle || playlist.length === 0) return

    const currentIndex = playlist.findIndex(a => a.id === currentArticle.id)
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length
    const prevArticle = playlist[prevIndex]
    
    get().playArticle(prevArticle, playlist)
  },

  closePlayer: () => {
    window.speechSynthesis.cancel()
    set({ currentArticle: null, isPlaying: false, speechSynthesisUtterance: null })
  }
}))
