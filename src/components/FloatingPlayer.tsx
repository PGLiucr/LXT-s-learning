import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, X, GripVertical } from 'lucide-react'
import { useAudioStore } from '@/store/audioStore'

const FloatingPlayer = () => {
  const { currentArticle, isPlaying, togglePlay, playNext, playPrev, closePlayer } = useAudioStore()
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 100 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number, startY: number, initialLeft: number, initialTop: number } | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial position bottom right
    setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 120 })

    const handleResize = () => {
      // Keep in bounds on resize
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 340),
        y: Math.min(prev.y, window.innerHeight - 120)
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: position.x,
      initialTop: position.y
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return

      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      const newX = dragRef.current.initialLeft + dx
      const newY = dragRef.current.initialTop + dy

      // Boundary check
      const boundedX = Math.max(0, Math.min(window.innerWidth - 320, newX))
      const boundedY = Math.max(0, Math.min(window.innerHeight - 80, newY))

      setPosition({ x: boundedX, y: boundedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragRef.current = null
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!currentArticle) return null

  return (
    <div 
      ref={playerRef}
      className={`fixed z-[100] flex items-center gap-3 bg-background/95 backdrop-blur-md border border-border p-3 rounded-full shadow-2xl transition-shadow ${isDragging ? 'cursor-grabbing shadow-3xl scale-105' : 'shadow-2xl'}`}
      style={{ 
        left: position.x, 
        top: position.y,
        width: 'max-content'
      }}
    >
      {/* Drag Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="cursor-grab p-1 hover:bg-muted rounded-full text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-3 pr-4 border-r border-border select-none pointer-events-none">
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