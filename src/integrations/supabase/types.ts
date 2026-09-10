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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_environments: {
        Row: {
          api_base_url: string
          api_version: string
          application_id: string
          created_at: string
          created_by: string
          environment: Database["public"]["Enums"]["environment_name"]
          health_path: string
          id: string
          last_checked_at: string | null
          last_error: string | null
          last_http_status: number | null
          last_request_id: string | null
          latency_ms: number | null
          organization_id: string
          status: Database["public"]["Enums"]["health_status"]
          updated_at: string
          updated_by: string
          version: number
        }
        Insert: {
          api_base_url: string
          api_version?: string
          application_id: string
          created_at?: string
          created_by: string
          environment: Database["public"]["Enums"]["environment_name"]
          health_path?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          last_http_status?: number | null
          last_request_id?: string | null
          latency_ms?: number | null
          organization_id: string
          status?: Database["public"]["Enums"]["health_status"]
          updated_at?: string
          updated_by: string
          version?: number
        }
        Update: {
          api_base_url?: string
          api_version?: string
          application_id?: string
          created_at?: string
          created_by?: string
          environment?: Database["public"]["Enums"]["environment_name"]
          health_path?: string
          id?: string
          last_checked_at?: string | null
          last_error?: string | null
          last_http_status?: number | null
          last_request_id?: string | null
          latency_ms?: number | null
          organization_id?: string
          status?: Database["public"]["Enums"]["health_status"]
          updated_at?: string
          updated_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "application_environments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_environments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          api_version: string
          application_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          name: string
          organization_id: string
          position_x: number
          position_y: number
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
          updated_by: string
          version: number
          visible_on_map: boolean
          visual_order: number
        }
        Insert: {
          api_version?: string
          application_id: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          name: string
          organization_id: string
          position_x?: number
          position_y?: number
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          updated_by: string
          version?: number
          visible_on_map?: boolean
          visual_order?: number
        }
        Update: {
          api_version?: string
          application_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          name?: string
          organization_id?: string
          position_x?: number
          position_y?: number
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          updated_by?: string
          version?: number
          visible_on_map?: boolean
          visual_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          metadata: Json
          organization_id: string
          request_id: string
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id: string
          request_id: string
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string
          request_id?: string
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          created_by: string
          destination_application_id: string
          environment: Database["public"]["Enums"]["environment_name"]
          id: string
          last_activity_at: string | null
          organization_id: string
          source_application_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          updated_by: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          destination_application_id: string
          environment: Database["public"]["Enums"]["environment_name"]
          id?: string
          last_activity_at?: string | null
          organization_id: string
          source_application_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          updated_by: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          destination_application_id?: string
          environment?: Database["public"]["Enums"]["environment_name"]
          id?: string
          last_activity_at?: string | null
          organization_id?: string
          source_application_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          updated_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "connections_destination_application_id_fkey"
            columns: ["destination_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_source_application_id_fkey"
            columns: ["source_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      credentials: {
        Row: {
          created_at: string
          created_by: string
          credential_type: string
          encrypted_value: string
          id: string
          integration_id: string
          masked_value: string
          organization_id: string
          revoked_at: string | null
          rotated_at: string | null
          status: Database["public"]["Enums"]["credential_status"]
          updated_at: string
          updated_by: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          credential_type: string
          encrypted_value: string
          id?: string
          integration_id: string
          masked_value: string
          organization_id: string
          revoked_at?: string | null
          rotated_at?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          updated_at?: string
          updated_by: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          credential_type?: string
          encrypted_value?: string
          id?: string
          integration_id?: string
          masked_value?: string
          organization_id?: string
          revoked_at?: string | null
          rotated_at?: string | null
          status?: Database["public"]["Enums"]["credential_status"]
          updated_at?: string
          updated_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "credentials_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_permissions: {
        Row: {
          connection_id: string
          created_at: string
          created_by: string
          id: string
          organization_id: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Insert: {
          connection_id: string
          created_at?: string
          created_by: string
          id?: string
          organization_id: string
          scope: Database["public"]["Enums"]["permission_scope"]
        }
        Update: {
          connection_id?: string
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string
          scope?: Database["public"]["Enums"]["permission_scope"]
        }
        Relationships: [
          {
            foreignKeyName: "integration_permissions_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          application_id: string
          central_webhook_url: string | null
          created_at: string
          created_by: string
          environment_id: string
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
          updated_by: string
          version: number
          webhook_status: Database["public"]["Enums"]["health_status"]
        }
        Insert: {
          application_id: string
          central_webhook_url?: string | null
          created_at?: string
          created_by: string
          environment_id: string
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          updated_by: string
          version?: number
          webhook_status?: Database["public"]["Enums"]["health_status"]
        }
        Update: {
          application_id?: string
          central_webhook_url?: string | null
          created_at?: string
          created_by?: string
          environment_id?: string
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          updated_by?: string
          version?: number
          webhook_status?: Database["public"]["Enums"]["health_status"]
        }
        Relationships: [
          {
            foreignKeyName: "integrations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "application_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_owner: { Args: never; Returns: string }
      current_organization_id: { Args: never; Returns: string }
    }
    Enums: {
      app_status: "active" | "disabled" | "pending" | "error" | "archived"
      connection_status: "active" | "disabled" | "pending" | "error" | "revoked"
      credential_status: "active" | "disabled" | "revoked"
      environment_name: "development" | "staging" | "production"
      health_status:
        | "not_tested"
        | "operational"
        | "degraded"
        | "unstable"
        | "offline"
        | "auth_required"
        | "disabled"
        | "revoked"
      permission_scope: "read" | "write" | "events" | "webhooks" | "health"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_status: ["active", "disabled", "pending", "error", "archived"],
      connection_status: ["active", "disabled", "pending", "error", "revoked"],
      credential_status: ["active", "disabled", "revoked"],
      environment_name: ["development", "staging", "production"],
      health_status: [
        "not_tested",
        "operational",
        "degraded",
        "unstable",
        "offline",
        "auth_required",
        "disabled",
        "revoked",
      ],
      permission_scope: ["read", "write", "events", "webhooks", "health"],
    },
  },
} as const
