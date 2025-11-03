export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          created_at: string
          data: Json
          decision_date: string | null
          feedback: Json | null
          id: string
          previous_version_id: string | null
          reviewer_id: string | null
          status: string
          submission_date: string | null
          submitter_id: string | null
          type: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          data?: Json
          decision_date?: string | null
          feedback?: Json | null
          id?: string
          previous_version_id?: string | null
          reviewer_id?: string | null
          status?: string
          submission_date?: string | null
          submitter_id?: string | null
          type: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          data?: Json
          decision_date?: string | null
          feedback?: Json | null
          id?: string
          previous_version_id?: string | null
          reviewer_id?: string | null
          status?: string
          submission_date?: string | null
          submitter_id?: string | null
          type?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "applications_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          mime_type: string | null
          name: string
          size_bytes: number | null
          status: string | null
          storage_path: string
          type: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          status?: string | null
          storage_path: string
          type: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          status?: string | null
          storage_path?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring: {
        Row: {
          completion_date: string | null
          concerns: boolean | null
          conducted_by: string | null
          created_at: string
          details: Json | null
          follow_up_date: string | null
          follow_up_needed: boolean | null
          follow_up_notes: string | null
          id: string
          location: string | null
          method: string | null
          placement_id: string
          rating: number | null
          scheduled_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          completion_date?: string | null
          concerns?: boolean | null
          conducted_by?: string | null
          created_at?: string
          details?: Json | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          follow_up_notes?: string | null
          id?: string
          location?: string | null
          method?: string | null
          placement_id: string
          rating?: number | null
          scheduled_date?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          completion_date?: string | null
          concerns?: boolean | null
          conducted_by?: string | null
          created_at?: string
          details?: Json | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          follow_up_notes?: string | null
          id?: string
          location?: string | null
          method?: string | null
          placement_id?: string
          rating?: number | null
          scheduled_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_placement_id_fkey"
            columns: ["placement_id"]
            isOneToOne: false
            referencedRelation: "placements"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          is_private: boolean | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          is_private?: boolean | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          is_private?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      placements: {
        Row: {
          application_id: string | null
          coordinator_profile_id: string | null
          created_at: string
          custom_duration_weeks: number | null
          details: Json | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          end_date: string | null
          grade: string | null
          host_family_profile_id: string | null
          id: string
          notes: string | null
          program_duration: string | null
          school: string | null
          start_date: string | null
          status: string
          student_profile_id: string | null
          transportation_details: Json | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          coordinator_profile_id?: string | null
          created_at?: string
          custom_duration_weeks?: number | null
          details?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          end_date?: string | null
          grade?: string | null
          host_family_profile_id?: string | null
          id?: string
          notes?: string | null
          program_duration?: string | null
          school?: string | null
          start_date?: string | null
          status?: string
          student_profile_id?: string | null
          transportation_details?: Json | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          coordinator_profile_id?: string | null
          created_at?: string
          custom_duration_weeks?: number | null
          details?: Json | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          end_date?: string | null
          grade?: string | null
          host_family_profile_id?: string | null
          id?: string
          notes?: string | null
          program_duration?: string | null
          school?: string | null
          start_date?: string | null
          status?: string
          student_profile_id?: string | null
          transportation_details?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_coordinator_profile_id_fkey"
            columns: ["coordinator_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_host_family_profile_id_fkey"
            columns: ["host_family_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          data: Json
          id: string
          status: string
          type: string
          updated_at: string
          user_id: string
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_data: {
        Row: {
          active: boolean
          category: string
          code: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          code: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      relationships: {
        Row: {
          created_at: string
          data: Json | null
          end_date: string | null
          id: string
          primary_id: string
          secondary_id: string
          start_date: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          end_date?: string | null
          id?: string
          primary_id: string
          secondary_id: string
          start_date?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          end_date?: string | null
          id?: string
          primary_id?: string
          secondary_id?: string
          start_date?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_primary_id_fkey"
            columns: ["primary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_secondary_id_fkey"
            columns: ["secondary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          last_sign_in: string | null
          metadata: Json | null
          phone: string | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_sign_in?: string | null
          metadata?: Json | null
          phone?: string | null
          role: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_sign_in?: string | null
          metadata?: Json | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
