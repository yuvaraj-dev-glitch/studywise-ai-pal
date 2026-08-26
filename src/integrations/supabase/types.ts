export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          confidence: number | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          mode: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string | null
          embedding: string | null
          id: string
          page_number: number | null
          paper_id: string | null
          source_kind: string
          source_label: string
          subject_id: string | null
          token_estimate: number
          topic_id: string | null
          unit_id: string | null
          user_id: string
        }
        Insert: {
          chunk_index?: number
          content: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          page_number?: number | null
          paper_id?: string | null
          source_kind?: string
          source_label?: string
          subject_id?: string | null
          token_estimate?: number
          topic_id?: string | null
          unit_id?: string | null
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string | null
          embedding?: string | null
          id?: string
          page_number?: number | null
          paper_id?: string | null
          source_kind?: string
          source_label?: string
          subject_id?: string | null
          token_estimate?: number
          topic_id?: string | null
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "question_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          chunk_count: number
          created_at: string
          doc_type: string
          error_message: string | null
          extracted_text: string | null
          filename: string
          id: string
          mime_type: string | null
          page_count: number | null
          processed_at: string | null
          size_bytes: number | null
          status: string
          storage_path: string | null
          subject_id: string | null
          topic_id: string | null
          unit_id: string | null
          user_id: string
        }
        Insert: {
          chunk_count?: number
          created_at?: string
          doc_type?: string
          error_message?: string | null
          extracted_text?: string | null
          filename: string
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processed_at?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          subject_id?: string | null
          topic_id?: string | null
          unit_id?: string | null
          user_id: string
        }
        Update: {
          chunk_count?: number
          created_at?: string
          doc_type?: string
          error_message?: string | null
          extracted_text?: string | null
          filename?: string
          id?: string
          mime_type?: string | null
          page_count?: number | null
          processed_at?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          subject_id?: string | null
          topic_id?: string | null
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          college: string | null
          course: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferred_study_duration: number
          semester: number | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          college?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_study_duration?: number
          semester?: number | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          college?: string | null
          course?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_study_duration?: number
          semester?: number | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      progress_records: {
        Row: {
          created_at: string
          id: string
          questions_attempted: number
          questions_correct: number
          record_date: string
          score: number | null
          study_minutes: number
          subject_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions_attempted?: number
          questions_correct?: number
          record_date?: string
          score?: number | null
          study_minutes?: number
          subject_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questions_attempted?: number
          questions_correct?: number
          record_date?: string
          score?: number | null
          study_minutes?: number
          subject_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_records_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      question_papers: {
        Row: {
          academic_year: string | null
          chunk_count: number
          created_at: string
          error_message: string | null
          exam_name: string | null
          extracted_text: string | null
          filename: string | null
          id: string
          mime_type: string | null
          page_count: number
          paper_type: string
          semester: string | null
          size_bytes: number | null
          status: string
          storage_path: string | null
          subject_id: string | null
          university: string | null
          user_id: string
        }
        Insert: {
          academic_year?: string | null
          chunk_count?: number
          created_at?: string
          error_message?: string | null
          exam_name?: string | null
          extracted_text?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          page_count?: number
          paper_type?: string
          semester?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          subject_id?: string | null
          university?: string | null
          user_id: string
        }
        Update: {
          academic_year?: string | null
          chunk_count?: number
          created_at?: string
          error_message?: string | null
          exam_name?: string | null
          extracted_text?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          page_count?: number
          paper_type?: string
          semester?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          subject_id?: string | null
          university?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          difficulty: string
          explanation: string | null
          id: string
          options: Json | null
          question_text: string
          question_type: string
          subject_id: string | null
          topic_id: string | null
          user_id: string
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          question_text: string
          question_type?: string
          subject_id?: string | null
          topic_id?: string | null
          user_id: string
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          subject_id?: string | null
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_tasks: {
        Row: {
          created_at: string
          description: string | null
          estimated_minutes: number
          id: string
          source: string
          status: string
          subject_id: string | null
          task_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          source?: string
          status?: string
          subject_id?: string | null
          task_date?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_minutes?: number
          id?: string
          source?: string
          status?: string
          subject_id?: string | null
          task_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          description: string | null
          exam_date: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          exam_date?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          exam_date?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          completed_at: string
          correct_count: number
          id: string
          incorrect_count: number
          percentage: number
          score: number
          test_id: string
          topic_performance: Json | null
          total: number
          unanswered_count: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          correct_count?: number
          id?: string
          incorrect_count?: number
          percentage?: number
          score?: number
          test_id: string
          topic_performance?: Json | null
          total?: number
          unanswered_count?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct_count?: number
          id?: string
          incorrect_count?: number
          percentage?: number
          score?: number
          test_id?: string
          topic_performance?: Json | null
          total?: number
          unanswered_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          config: Json | null
          created_at: string
          duration_minutes: number
          id: string
          status: string
          subject_id: string | null
          title: string
          total_questions: number
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          status?: string
          subject_id?: string | null
          title: string
          total_questions?: number
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          duration_minutes?: number
          id?: string
          status?: string
          subject_id?: string | null
          title?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          id: string
          last_studied_at: string | null
          mastery: number
          order_index: number
          priority: string
          status: string
          subject_id: string
          title: string
          unit_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_studied_at?: string | null
          mastery?: number
          order_index?: number
          priority?: string
          status?: string
          subject_id: string
          title: string
          unit_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_studied_at?: string | null
          mastery?: number
          order_index?: number
          priority?: string
          status?: string
          subject_id?: string
          title?: string
          unit_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          order_index: number
          subject_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          subject_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          subject_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      weak_topics: {
        Row: {
          id: string
          mastery: number
          previous_score: number | null
          priority: string
          recommended_minutes: number
          subject_id: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          mastery?: number
          previous_score?: number | null
          priority?: string
          recommended_minutes?: number
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          mastery?: number
          previous_score?: number | null
          priority?: string
          recommended_minutes?: number
          subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weak_topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weak_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_document_chunks: {
        Args: {
          match_count?: number
          p_subject_id?: string
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          page_number: number
          paper_id: string
          similarity: number
          source_kind: string
          source_label: string
          subject_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
