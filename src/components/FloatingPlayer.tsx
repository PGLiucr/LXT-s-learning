import React from 'react'
import { Play, Pause, SkipBack, SkipForward, X } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'

const FloatingPlayer = () => {
  const { currentArticle, isPlaying, togglePlay, playNext, playPrev, closePlayer } = useAudioStore()

  if (!currentArticle) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4 bg-background/95 backdrop-blur-md border border-border p-4 rounded-full shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-3 pr-4 border-r border-border">
        <img 
          src={currentArticle.imageUrl} 
          alt={currentArticle.title} 
          className="w-10 h-10 rounded-full object-cover animate-[spin_10s_linear_infinite]"
          style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
        />
        <div className="max-w-[120px]">
          <h4 className="text-xs font-bold truncate">{currentArticle.title}</h4>
          <p className="text-[10px] text-muted-foreground truncate">{currentArticle.category}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={playPrev} className="p-2 hover:bg-muted rounded-full transition-colors">
          <SkipBack className="h-4 w-4 fill-current" />
        </button>
        <button 
          onClick={togglePlay} 
          className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-transform active:scale-95 shadow-lg"
        >
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        <button onClick={playNext} className="p-2 hover:bg-muted rounded-full transition-colors">
          <SkipForward className="h-4 w-4 fill-current" />
        </button>
      </div>

      <button onClick={closePlayer} className="absolute -top-2 -right-2 p-1 bg-muted text-muted-foreground rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export default FloatingPlayer