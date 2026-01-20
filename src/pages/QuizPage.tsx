import React, { useState, useEffect } from 'react'
import { Plus, Trophy, Target, BarChart2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/supabase/client'
import { QuizScore } from '@/types'
import Modal from '@/components/Modal'

const QuizPage = () => {
  const { user, isMock } = useAuthStore()
  const [scores, setScores] = useState<QuizScore[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    question_type: '',
    score: 0,
    total_questions: 0,
    correct_answers: 0,
  })

  useEffect(() => {
    fetchScores()
  }, [user, isMock])

  const fetchScores = async () => {
    setLoading(true)
    if (isMock) {
      // Mock data
      const mockScores: QuizScore[] = [
        {
          id: '1',
          user_id: 'mock-user',
          question_type: 'Vocabulary',
          score: 85,
          total_questions: 20,
          correct_answers: 17,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'mock-user',
          question_type: 'Reading Comprehension',
          score: 90,
          total_questions: 10,
          correct_answers: 9,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setScores(mockScores)
      setLoading(false)
    } else if (user) {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setScores(data)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate score percentage
    const calculatedScore = Math.round((formData.correct_answers / formData.total_questions) * 100)
    const dataToSave = { ...formData, score: calculatedScore }

    if (isMock) {
      const newScore: QuizScore = {
        id: Math.random().toString(),
        user_id: 'mock-user',
        ...dataToSave,
        created_at: new Date().toISOString()
      }
      setScores([newScore, ...scores])
      closeModal()
    } else if (user) {
      try {
        const { error } = await supabase
          .from('quiz_scores')
          .insert([{ user_id: user.id, ...dataToSave }])
        if (error) throw error
        fetchScores()
        closeModal()
      } catch (err: any) {
        console.error('Error saving quiz score:', err)
        alert(`Failed to save quiz score: ${err.message}`)
      }
    }
  }

  const openAddModal = () => {
    setFormData({
      question_type: 'Vocabulary',
      score: 0,
      total_questions: 10,
      correct_answers: 0,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Quiz Records</h1>
          <p className="text-muted-foreground">Track your performance and improvements.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Record Score
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted rounded-none">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="font-bold">Average Score</h3>
          </div>
          <div className="text-3xl font-serif font-bold">
            {scores.length > 0 
              ? Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length) 
              : 0}%
          </div>
        </div>
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted rounded-none">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-bold">Total Quizzes</h3>
          </div>
          <div className="text-3xl font-serif font-bold">{scores.length}</div>
        </div>
        <div className="bg-card border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-muted rounded-none">
              <BarChart2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold">Questions Answered</h3>
          </div>
          <div className="text-3xl font-serif font-bold">
            {scores.reduce((acc, curr) => acc + curr.total_questions, 0)}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading scores...</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border bg-muted/30">
          <p className="text-muted-foreground">No quiz records found. Take a quiz!</p>
        </div>
      ) : (
        <div className="bg-card border border-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Questions</th>
                <th className="px-6 py-4">Correct</th>
                <th className="px-6 py-4">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scores.map((score) => (
                <tr key={score.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-serif italic">
                    {new Date(score.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium">{score.question_type}</td>
                  <td className="px-6 py-4">{score.total_questions}</td>
                  <td className="px-6 py-4">{score.correct_answers}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs font-bold ${
                      score.score >= 80 ? 'bg-black text-white' : 
                      score.score >= 60 ? 'bg-gray-200 text-black' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {score.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Record Quiz Result"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quiz Type</label>
            <select
              value={formData.question_type}
              onChange={e => setFormData({...formData, question_type: e.target.value})}
              className="input-base"
            >
              <option value="Vocabulary">Vocabulary</option>
              <option value="Reading Comprehension">Reading Comprehension</option>
              <option value="Grammar">Grammar</option>
              <option value="Listening">Listening</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Questions</label>
            <input
              type="number"
              required
              min="1"
              value={formData.total_questions}
              onChange={e => setFormData({...formData, total_questions: parseInt(e.target.value)})}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correct Answers</label>
            <input
              type="number"
              required
              min="0"
              max={formData.total_questions}
              value={formData.correct_answers}
              onChange={e => setFormData({...formData, correct_answers: parseInt(e.target.value)})}
              className="input-base"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default QuizPage
