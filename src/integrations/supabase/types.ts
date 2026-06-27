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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          module: string
          read_by_admin: boolean
          record_id: string | null
          record_label: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          module: string
          read_by_admin?: boolean
          record_id?: string | null
          record_label?: string | null
          user_id: string
          user_name: string
          user_role: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          module?: string
          read_by_admin?: boolean
          record_id?: string | null
          record_label?: string | null
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company_name: string
          contact_name: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          satisfaction: number | null
          status: string
          total_projects: number | null
          total_value: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          satisfaction?: number | null
          status?: string
          total_projects?: number | null
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          satisfaction?: number | null
          status?: string
          total_projects?: number | null
          total_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          base_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          file_size: number | null
          file_url: string | null
          id: string
          name: string
          project_id: string | null
          status: string
          type: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          card_expiry: string | null
          card_number: string | null
          card_type: string | null
          contract_type: string | null
          contract_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          emirates_id: string | null
          full_name: string
          id: string
          job_title: string | null
          join_date: string | null
          nationality: string | null
          notes: string | null
          passport_number: string | null
          phone: string | null
          salary: number | null
          status: string
          updated_at: string
        }
        Insert: {
          card_expiry?: string | null
          card_number?: string | null
          card_type?: string | null
          contract_type?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          emirates_id?: string | null
          full_name: string
          id?: string
          job_title?: string | null
          join_date?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          card_expiry?: string | null
          card_number?: string | null
          card_type?: string | null
          contract_type?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          emirates_id?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          join_date?: string | null
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          condition: string | null
          created_at: string
          daily_rate: number | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          last_maintenance: string | null
          name: string
          next_maintenance: string | null
          notes: string | null
          project_id: string | null
          quantity: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          condition?: string | null
          created_at?: string
          daily_rate?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_maintenance?: string | null
          name: string
          next_maintenance?: string | null
          notes?: string | null
          project_id?: string | null
          quantity?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          condition?: string | null
          created_at?: string
          daily_rate?: number | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          last_maintenance?: string | null
          name?: string
          next_maintenance?: string | null
          notes?: string | null
          project_id?: string | null
          quantity?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          expense_date: string | null
          id: string
          notes: string | null
          payment_method: string | null
          project_id: string | null
          receipt_url: string | null
          reference_no: string | null
          status: string
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          project_id?: string | null
          receipt_url?: string | null
          reference_no?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          project_id?: string | null
          receipt_url?: string | null
          reference_no?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      export_requests: {
        Row: {
          approved_until: string | null
          created_at: string
          export_type: string
          id: string
          module: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_note: string | null
          status: string
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          approved_until?: string | null
          created_at?: string
          export_type?: string
          id?: string
          module: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: string
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          approved_until?: string | null
          created_at?: string
          export_type?: string
          id?: string
          module?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          project_id: string | null
          status: string
          updated_at: string
          vat_percent: number | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
          vat_percent?: number | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          project_id?: string | null
          status?: string
          updated_at?: string
          vat_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      labor: {
        Row: {
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          hourly_rate: number | null
          hours_logged: number | null
          id: string
          notes: string | null
          phone: string | null
          project_id: string | null
          role: string
          status: string
          updated_at: string
          worker_name: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          hourly_rate?: number | null
          hours_logged?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          role: string
          status?: string
          updated_at?: string
          worker_name: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          hourly_rate?: number | null
          hours_logged?: number | null
          id?: string
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          role?: string
          status?: string
          updated_at?: string
          worker_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "labor_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_name: string
          contact_name: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          progress: number | null
          spent: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          progress?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          progress?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          id: string
          module: string
          role_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module: string
          role_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          module?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_deals: {
        Row: {
          assigned_to: string | null
          client_name: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          expected_close: string | null
          id: string
          notes: string | null
          probability: number | null
          stage: string
          title: string
          updated_at: string
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          client_name: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expected_close?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          title: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          expected_close?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          title?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          custom_role_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          custom_role_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          custom_role_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_export_approval: { Args: { _module: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      purge_record: {
        Args: { _id: string; _table: string }
        Returns: undefined
      }
      restore_record: {
        Args: { _id: string; _table: string }
        Returns: undefined
      }
      user_can: { Args: { _action: string; _module: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "hr"
        | "project_manager"
        | "sales"
        | "finance"
        | "operations"
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
    Enums: {
      app_role: [
        "admin",
        "hr",
        "project_manager",
        "sales",
        "finance",
        "operations",
      ],
    },
  },
} as const
