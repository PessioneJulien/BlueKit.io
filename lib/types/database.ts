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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          bio: string | null
          website: string | null
          github: string | null
          twitter: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          bio?: string | null
          website?: string | null
          github?: string | null
          twitter?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      technologies: {
        Row: {
          id: string
          name: string
          category: string
          description: string | null
          logo_url: string | null
          documentation_url: string | null
          setup_time_hours: number | null
          difficulty_level: string | null
          pricing: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description?: string | null
          logo_url?: string | null
          documentation_url?: string | null
          setup_time_hours?: number | null
          difficulty_level?: string | null
          pricing?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string | null
          logo_url?: string | null
          documentation_url?: string | null
          setup_time_hours?: number | null
          difficulty_level?: string | null
          pricing?: string | null
          created_at?: string
        }
      }
      stacks: {
        Row: {
          id: string
          name: string
          description: string | null
          use_cases: string[] | null
          author_id: string
          is_official: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          use_cases?: string[] | null
          author_id: string
          is_official?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          use_cases?: string[] | null
          author_id?: string
          is_official?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stack_technologies: {
        Row: {
          stack_id: string
          technology_id: string
          role: string
          order_index: number | null
        }
        Insert: {
          stack_id: string
          technology_id: string
          role: string
          order_index?: number | null
        }
        Update: {
          stack_id?: string
          technology_id?: string
          role?: string
          order_index?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          stack_id: string
          user_id: string
          rating: number
          comment: string | null
          criteria: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          stack_id: string
          user_id: string
          rating: number
          comment?: string | null
          criteria?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          stack_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          criteria?: Json | null
          created_at?: string
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