// filepath: /workspaces/vidyalankarbankofcredits/types/supabase.ts
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
      program_structure: {
        Row: {
          id: string
          vertical: string
          basket: string
          semester: number
          recommended_credits: number
          created_at: string
        }
        Insert: {
          id?: string
          vertical: string
          basket: string
          semester: number
          recommended_credits: number
          created_at?: string
        }
        Update: {
          id?: string
          vertical?: string
          basket?: string
          semester?: number
          recommended_credits?: number
          created_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          roll_number: string
          password_hash: string
          first_name: string
          last_name: string
          full_name: string
          legal_name: string
          degree: string
          branch: string
          division: string
          semester: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roll_number: string
          password_hash: string
          first_name: string
          last_name: string
          full_name: string
          legal_name: string
          degree?: string
          branch?: string
          division: string
          semester?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roll_number?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          full_name?: string
          legal_name?: string
          degree?: string
          branch?: string
          division?: string
          semester?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          course_code: string
          title: string
          type: 'Theory' | 'Practical'
          credits: number
          semester: number
          degree: string
          branch: string
          vertical: string
          basket: string
          structure_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_code: string
          title: string
          type: 'Theory' | 'Practical'
          credits: number
          semester: number
          degree?: string // Default value in Supabase: 'B.Tech'
          branch?: string // Default value in Supabase: 'INFT'
          vertical: string
          basket: string
          structure_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_code?: string
          title?: string
          type?: 'Theory' | 'Practical'
          credits?: number
          semester?: number
          degree?: string
          branch?: string
          vertical?: string
          basket?: string
          structure_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_structure_id_fkey"
            columns: ["structure_id"]
            referencedRelation: "program_structure"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      course_type: 'Theory' | 'Practical'
    }
  }
}