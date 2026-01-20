export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      words: {
        Row: {
          id: string
          user_id: string
          english_word: string
          chinese_meaning: string
          example_sentence: string | null
          phonetic_symbol: string | null
          mastery_level: number
          created_at: string
          review_date: string
        }
        Insert: {
          id?: string
          user_id: string
          english_word: string
          chinese_meaning: string
          example_sentence?: string | null
          phonetic_symbol?: string | null
          mastery_level?: number
          created_at?: string
          review_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          english_word?: string
          chinese_meaning?: string
          example_sentence?: string | null
          phonetic_symbol?: string | null
          mastery_level?: number
          created_at?: string
          review_date?: string
        }
      }
      reading_records: {
        Row: {
          id: string
          user_id: string
          article_title: string
          article_content: string
          reading_notes: string | null
          reading_time: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          article_title: string
          article_content: string
          reading_notes?: string | null
          reading_time?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_title?: string
          article_content?: string
          reading_notes?: string | null
          reading_time?: number
          created_at?: string
        }
      }
      quiz_scores: {
        Row: {
          id: string
          user_id: string
          question_type: string
          score: number
          total_questions: number
          correct_answers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_type: string
          score: number
          total_questions: number
          correct_answers: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_type?: string
          score?: number
          total_questions?: number
          correct_answers?: number
          created_at?: string
        }
      }
      learning_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
