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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          is_removed: boolean
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_removed?: boolean
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_removed?: boolean
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          last_message_at: string | null
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          last_message_at?: string | null
          subscriber_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          last_message_at?: string | null
          subscriber_id?: string
        }
        Relationships: []
      }
      creator_balances: {
        Row: {
          available_cents: number
          creator_id: string
          currency: string
          lifetime_gross_cents: number
          pending_cents: number
          updated_at: string
        }
        Insert: {
          available_cents?: number
          creator_id: string
          currency?: string
          lifetime_gross_cents?: number
          pending_cents?: number
          updated_at?: string
        }
        Update: {
          available_cents?: number
          creator_id?: string
          currency?: string
          lifetime_gross_cents?: number
          pending_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          about: string | null
          category: string | null
          commission_rate: number
          created_at: string
          headline: string | null
          id: string
          is_published: boolean
          is_verified: boolean
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          category?: string | null
          commission_rate?: number
          created_at?: string
          headline?: string | null
          id?: string
          is_published?: boolean
          is_verified?: boolean
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          category?: string | null
          commission_rate?: number
          created_at?: string
          headline?: string | null
          id?: string
          is_published?: boolean
          is_verified?: boolean
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      dev_role_grants: {
        Row: {
          created_at: string
          email: string
          note: string | null
          roles: Database["public"]["Enums"]["app_role"][]
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
          roles: Database["public"]["Enums"]["app_role"][]
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
          roles?: Database["public"]["Enums"]["app_role"][]
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payout_requests: {
        Row: {
          amount_cents: number
          created_at: string
          creator_id: string
          currency: string
          destination: string | null
          id: string
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          creator_id: string
          currency?: string
          destination?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          creator_id?: string
          currency?: string
          destination?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      post_media: {
        Row: {
          bucket: string
          created_at: string
          creator_id: string
          height: number | null
          id: string
          is_private: boolean
          media_type: string
          position: number
          post_id: string
          storage_path: string
          width: number | null
        }
        Insert: {
          bucket: string
          created_at?: string
          creator_id: string
          height?: number | null
          id?: string
          is_private?: boolean
          media_type?: string
          position?: number
          post_id: string
          storage_path: string
          width?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string
          creator_id?: string
          height?: number | null
          id?: string
          is_private?: boolean
          media_type?: string
          position?: number
          post_id?: string
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          comment_count: number
          created_at: string
          creator_id: string
          id: string
          is_published: boolean
          is_removed: boolean
          like_count: number
          title: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          body?: string | null
          comment_count?: number
          created_at?: string
          creator_id: string
          id?: string
          is_published?: boolean
          is_removed?: boolean
          like_count?: number
          title?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          body?: string | null
          comment_count?: number
          created_at?: string
          creator_id?: string
          id?: string
          is_published?: boolean
          is_removed?: boolean
          like_count?: number
          title?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_suspended: boolean
          onboarding_completed: boolean
          phone_number: string | null
          phone_verified: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_suspended?: boolean
          onboarding_completed?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_suspended?: boolean
          onboarding_completed?: boolean
          phone_number?: string | null
          phone_verified?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          resolution_notes: string | null
          status: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          creator_id: string
          currency: string
          description: string | null
          id: string
          interval_months: number
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          currency?: string
          description?: string | null
          id?: string
          interval_months?: number
          is_active?: boolean
          name: string
          price_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          currency?: string
          description?: string | null
          id?: string
          interval_months?: number
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          canceled_at: string | null
          created_at: string
          creator_amount_cents: number
          creator_id: string
          currency: string
          current_period_end: string | null
          current_period_start: string | null
          gateway: string | null
          gateway_subscription_id: string | null
          id: string
          paid_at: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          canceled_at?: string | null
          created_at?: string
          creator_amount_cents?: number
          creator_id: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          paid_at?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          canceled_at?: string | null
          created_at?: string
          creator_amount_cents?: number
          creator_id?: string
          currency?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gateway?: string | null
          gateway_subscription_id?: string | null
          id?: string
          paid_at?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          creator_id: string
          currency: string
          fee_cents: number
          gateway: string | null
          gateway_reference: string | null
          gross_cents: number
          id: string
          net_cents: number
          status: Database["public"]["Enums"]["transaction_status"]
          subscriber_id: string | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          currency?: string
          fee_cents?: number
          gateway?: string | null
          gateway_reference?: string | null
          gross_cents: number
          id?: string
          net_cents: number
          status?: Database["public"]["Enums"]["transaction_status"]
          subscriber_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          currency?: string
          fee_cents?: number
          gateway?: string | null
          gateway_reference?: string | null
          gross_cents?: number
          id?: string
          net_cents?: number
          status?: Database["public"]["Enums"]["transaction_status"]
          subscriber_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          created_at: string
          creator_id: string
          ended_at: string | null
          id: string
          initiated_by: string | null
          room_name: string
          started_at: string | null
          status: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          ended_at?: string | null
          id?: string
          initiated_by?: string | null
          room_name: string
          started_at?: string | null
          status?: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          ended_at?: string | null
          id?: string
          initiated_by?: string | null
          room_name?: string
          started_at?: string | null
          status?: string
          subscriber_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      become_creator: { Args: never; Returns: undefined }
      has_active_subscription: {
        Args: { _creator: string; _subscriber: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_member: {
        Args: { _conversation: string; _user: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      request_creator_payout: {
        Args: { _amount_cents: number; _currency: string; _destination: string }
        Returns: string
      }
      review_creator_payout: {
        Args: { _decision: string; _payout_id: string; _reason?: string }
        Returns: undefined
      }
      update_platform_setting: {
        Args: { _key: string; _value: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "subscriber" | "creator" | "admin" | "super_admin"
      payout_status: "requested" | "processing" | "paid" | "rejected"
      post_visibility: "public" | "subscribers"
      report_status: "open" | "reviewing" | "resolved" | "dismissed"
      subscription_status: "pending" | "active" | "canceled" | "expired"
      transaction_status: "pending" | "succeeded" | "failed" | "refunded"
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
      app_role: ["subscriber", "creator", "admin", "super_admin"],
      payout_status: ["requested", "processing", "paid", "rejected"],
      post_visibility: ["public", "subscribers"],
      report_status: ["open", "reviewing", "resolved", "dismissed"],
      subscription_status: ["pending", "active", "canceled", "expired"],
      transaction_status: ["pending", "succeeded", "failed", "refunded"],
    },
  },
} as const
