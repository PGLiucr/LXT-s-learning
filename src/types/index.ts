export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Word {
  id: string
  user_id: string
  english_word: string
  chinese_meaning: string
  example_sentence?: string
  phonetic_symbol?: string
  mastery_level: number // 0-5
  created_at: string
  review_date: string
}

export interface ReadingRecord {
  id: string
  user_id: string
  article_title: string
  article_content: string
  reading_notes?: string
  reading_time: number // in seconds
  created_at: string
}

export interface QuizScore {
  id: string
  user_id: string
  question_type: string
  score: number
  total_questions: number
  correct_answers: number
  created_at: string
}

export interface LearningNote {
  id: string
  user_id: string
  title: string
  content: string
  tags?: string
  created_at: string
  updated_at: string
}
