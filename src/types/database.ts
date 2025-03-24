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
      notes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          content: string
          question_id: string
          test_id: string
          topic: string
          sub_topic: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          content: string
          question_id: string
          test_id: string
          topic: string
          sub_topic: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          content?: string
          question_id?: string
          test_id?: string
          topic?: string
          sub_topic?: string
        }
      }
      question_feedback: {
        Row: {
          id: string
          created_at: string
          user_id: string
          question_id: string
          test_id: string
          message: string
          rating: number
          difficulty: string
          status: string
          admin_response?: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          question_id: string
          test_id: string
          message: string
          rating: number
          difficulty: string
          status?: string
          admin_response?: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          question_id?: string
          test_id?: string
          message?: string
          rating?: number
          difficulty?: string
          status?: string
          admin_response?: string
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link?: string
          read?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}