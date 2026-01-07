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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          engagement_id: string
          goal_id: string | null
          id: string
          session_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          engagement_id: string
          goal_id?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          engagement_id?: string
          goal_id?: string | null
          id?: string
          session_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number | null
          cost_usd: number | null
          created_at: string | null
          engagement_id: string | null
          id: string
          operation: string
          prompt_tokens: number | null
          total_tokens: number | null
        }
        Insert: {
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          engagement_id?: string | null
          id?: string
          operation: string
          prompt_tokens?: number | null
          total_tokens?: number | null
        }
        Update: {
          completion_tokens?: number | null
          cost_usd?: number | null
          created_at?: string | null
          engagement_id?: string | null
          id?: string
          operation?: string
          prompt_tokens?: number | null
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_name: string | null
          consultant_id: string
          created_at: string | null
          id: string
          industry: string | null
          onboarded_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          consultant_id: string
          created_at?: string | null
          id?: string
          industry?: string | null
          onboarded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          consultant_id?: string
          created_at?: string | null
          id?: string
          industry?: string | null
          onboarded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      engagements: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          description: string | null
          engagement_id: string
          id: string
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          description?: string | null
          engagement_id: string
          id?: string
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          description?: string | null
          engagement_id?: string
          id?: string
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_forms: {
        Row: {
          created_at: string | null
          engagement_id: string
          id: string
          questions: Json
          responses: Json
          submitted_at: string | null
        }
        Insert: {
          created_at?: string | null
          engagement_id: string
          id?: string
          questions?: Json
          responses?: Json
          submitted_at?: string | null
        }
        Update: {
          created_at?: string | null
          engagement_id?: string
          id?: string
          questions?: Json
          responses?: Json
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_forms_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          engagement_id: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          engagement_id: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          engagement_id?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          ai_generated_at: string | null
          approved_at: string | null
          approved_by: string | null
          client_responded_at: string | null
          client_response: string | null
          content: string
          created_at: string | null
          engagement_id: string
          id: string
          intake_form_id: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_responded_at?: string | null
          client_response?: string | null
          content: string
          created_at?: string | null
          engagement_id: string
          id?: string
          intake_form_id?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_responded_at?: string | null
          client_response?: string | null
          content?: string
          created_at?: string | null
          engagement_id?: string
          id?: string
          intake_form_id?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "intake_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections: {
        Row: {
          client_id: string
          content: string
          created_at: string | null
          engagement_id: string
          id: string
          prompt: string | null
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string | null
          engagement_id: string
          id?: string
          prompt?: string | null
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string | null
          engagement_id?: string
          id?: string
          prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflections_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      session_summaries: {
        Row: {
          ai_generated_at: string | null
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          id: string
          key_insights: Json | null
          published_at: string | null
          session_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          id?: string
          key_insights?: Json | null
          published_at?: string | null
          session_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          id?: string
          key_insights?: Json | null
          published_at?: string | null
          session_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_summaries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_summaries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          consultant_notes: string | null
          created_at: string | null
          duration_minutes: number | null
          engagement_id: string
          id: string
          scheduled_at: string | null
          session_number: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          consultant_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          engagement_id: string
          id?: string
          scheduled_at?: string | null
          session_number: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          consultant_notes?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          engagement_id?: string
          id?: string
          scheduled_at?: string | null
          session_number?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "engagements"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_client: { Args: never; Returns: boolean }
      is_consultant: { Args: never; Returns: boolean }
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
