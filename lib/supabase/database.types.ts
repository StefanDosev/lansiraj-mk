export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      acceptance_criteria: {
        Row: {
          assignment_id: string
          created_at: string
          criterion: string
          id: string
          position: number
        }
        Insert: {
          assignment_id: string
          created_at?: string
          criterion: string
          id?: string
          position: number
        }
        Update: {
          assignment_id?: string
          created_at?: string
          criterion?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "acceptance_criteria_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          actor_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json
          project_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          project_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_draft_links: {
        Row: {
          created_at: string
          draft_id: string
          id: string
          label: string
          link_type: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string
          draft_id: string
          id?: string
          label: string
          link_type: string
          position: number
          url: string
        }
        Update: {
          created_at?: string
          draft_id?: string
          id?: string
          label?: string
          link_type?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_draft_links_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "assignment_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_drafts: {
        Row: {
          created_at: string
          evidence_text: string
          id: string
          project_assignment_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence_text?: string
          id?: string
          project_assignment_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence_text?: string
          id?: string
          project_assignment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_drafts_project_assignment_id_fkey"
            columns: ["project_assignment_id"]
            isOneToOne: true
            referencedRelation: "project_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          body_md: string
          created_at: string
          curriculum_version: string
          id: string
          position: number
          proof_prompt_md: string
          requires_review: boolean
          slug: string
          stage_id: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md: string
          created_at?: string
          curriculum_version: string
          id?: string
          position: number
          proof_prompt_md: string
          requires_review?: boolean
          slug: string
          stage_id: string
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          created_at?: string
          curriculum_version?: string
          id?: string
          position?: number
          proof_prompt_md?: string
          requires_review?: boolean
          slug?: string
          stage_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_stage_id_curriculum_version_fkey"
            columns: ["stage_id", "curriculum_version"]
            isOneToOne: false
            referencedRelation: "curriculum_stages"
            referencedColumns: ["id", "curriculum_version"]
          },
        ]
      }
      cohort_invites: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          cohort_id: string
          created_at: string
          created_by: string
          email: string
          expires_at: string
          id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          cohort_id: string
          created_at?: string
          created_by: string
          email: string
          expires_at: string
          id?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          cohort_id?: string
          created_at?: string
          created_by?: string
          email?: string
          expires_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_invites_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_members: {
        Row: {
          cohort_id: string
          created_at: string
          id: string
          joined_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          created_at?: string
          id?: string
          joined_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          created_at?: string
          id?: string
          joined_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          name: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          name?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      curriculum_stages: {
        Row: {
          created_at: string
          curriculum_version: string
          id: string
          position: number
          slug: string
          summary_md: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curriculum_version: string
          id?: string
          position: number
          slug: string
          summary_md: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curriculum_version?: string
          id?: string
          position?: number
          slug?: string
          summary_md?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          locale: string
          onboarding_completed_at: string | null
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          locale?: string
          onboarding_completed_at?: string | null
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          locale?: string
          onboarding_completed_at?: string | null
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          approved_at: string | null
          assignment_id: string
          available_at: string | null
          created_at: string
          due_at: string | null
          id: string
          project_id: string
          state: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          assignment_id: string
          available_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          project_id: string
          state: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          assignment_id?: string
          available_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          project_id?: string
          state?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_scope_assessments: {
        Row: {
          created_at: string
          note: string | null
          project_id: string
          readiness: string
          reviewed_at: string
          reviewed_by: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          project_id: string
          readiness: string
          reviewed_at?: string
          reviewed_by: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          note?: string | null
          project_id?: string
          readiness?: string
          reviewed_at?: string
          reviewed_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_scope_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cohort_id: string
          core_action: string
          created_at: string
          curriculum_version: string | null
          id: string
          live_url: string | null
          non_features: string[]
          owner_id: string
          problem_statement: string
          status: string
          target_launch_date: string
          target_user: string
          title: string
          updated_at: string
          weekly_hours: number
        }
        Insert: {
          cohort_id: string
          core_action: string
          created_at?: string
          curriculum_version?: string | null
          id?: string
          live_url?: string | null
          non_features: string[]
          owner_id: string
          problem_statement: string
          status?: string
          target_launch_date: string
          target_user: string
          title: string
          updated_at?: string
          weekly_hours: number
        }
        Update: {
          cohort_id?: string
          core_action?: string
          created_at?: string
          curriculum_version?: string | null
          id?: string
          live_url?: string | null
          non_features?: string[]
          owner_id?: string
          problem_statement?: string
          status?: string
          target_launch_date?: string
          target_user?: string
          title?: string
          updated_at?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      review_criteria: {
        Row: {
          acceptance_criterion_id: string
          created_at: string
          id: string
          note: string | null
          outcome: string
          review_id: string
        }
        Insert: {
          acceptance_criterion_id: string
          created_at?: string
          id?: string
          note?: string | null
          outcome: string
          review_id: string
        }
        Update: {
          acceptance_criterion_id?: string
          created_at?: string
          id?: string
          note?: string | null
          outcome?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_criteria_acceptance_criterion_id_fkey"
            columns: ["acceptance_criterion_id"]
            isOneToOne: false
            referencedRelation: "acceptance_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_criteria_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          decision: string
          id: string
          priority_correction: string | null
          reviewer_id: string
          submission_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          priority_correction?: string | null
          reviewer_id: string
          submission_id: string
          summary: string
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          priority_correction?: string | null
          reviewer_id?: string
          submission_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_links: {
        Row: {
          created_at: string
          id: string
          label: string
          link_type: string
          position: number
          submission_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          link_type: string
          position: number
          submission_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          link_type?: string
          position?: number
          submission_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_links_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string
          evidence_text: string
          id: string
          project_assignment_id: string
          reviewed_at: string | null
          status: string
          submitted_at: string
          supersedes_submission_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          evidence_text: string
          id?: string
          project_assignment_id: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          supersedes_submission_id?: string | null
          version: number
        }
        Update: {
          created_at?: string
          evidence_text?: string
          id?: string
          project_assignment_id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string
          supersedes_submission_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_assignment_id_fkey"
            columns: ["project_assignment_id"]
            isOneToOne: false
            referencedRelation: "project_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_supersedes_submission_id_fkey"
            columns: ["supersedes_submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_cohort_invite: { Args: never; Returns: string }
      assess_project_scope: {
        Args: { p_note: string; p_project_id: string; p_readiness: string }
        Returns: undefined
      }
      complete_onboarding: {
        Args: {
          p_core_action: string
          p_display_name: string
          p_non_features: string[]
          p_problem_statement: string
          p_project_title: string
          p_target_launch_date: string
          p_target_user: string
          p_weekly_hours: number
        }
        Returns: string
      }
      get_access_state: {
        Args: never
        Returns: {
          has_active_membership: boolean
          is_reviewer: boolean
          onboarding_completed: boolean
        }[]
      }
      save_assignment_draft: {
        Args: {
          p_evidence_text: string
          p_expected_updated_at?: string
          p_links: Json
          p_project_assignment_id: string
        }
        Returns: {
          draft_id: string
          updated_at: string
        }[]
      }
      review_submission: {
        Args: {
          p_criteria: Json
          p_decision: string
          p_priority_correction: string
          p_submission_id: string
          p_summary: string
        }
        Returns: {
          decision: string
          review_id: string
          reviewed_at: string
        }[]
      }
      start_project: { Args: never; Returns: string }
      submit_assignment: {
        Args: {
          p_expected_draft_updated_at: string
          p_project_assignment_id: string
        }
        Returns: {
          submission_id: string
          submitted_at: string
          version: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
