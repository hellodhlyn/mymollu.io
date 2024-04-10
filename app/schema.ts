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
      dev_followerships: {
        Row: {
          createdAt: string
          followeeId: number
          followerId: number
          id: number
        }
        Insert: {
          createdAt?: string
          followeeId: number
          followerId: number
          id?: number
        }
        Update: {
          createdAt?: string
          followeeId?: number
          followerId?: number
          id?: number
        }
        Relationships: []
      }
      dev_user_activities: {
        Row: {
          activityType: string | null
          createdAt: string
          id: number
          payload: Json | null
          uid: string
          userId: number
        }
        Insert: {
          activityType?: string | null
          createdAt?: string
          id?: number
          payload?: Json | null
          uid: string
          userId: number
        }
        Update: {
          activityType?: string | null
          createdAt?: string
          id?: number
          payload?: Json | null
          uid?: string
          userId?: number
        }
        Relationships: []
      }
      dev_users: {
        Row: {
          active: boolean
          created_at: string
          googleId: string | null
          id: number
          profileStudentId: string | null
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          googleId?: string | null
          id?: number
          profileStudentId?: string | null
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          googleId?: string | null
          id?: number
          profileStudentId?: string | null
          username?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          createdAt: string
          eventId: string
          id: number
          image: string | null
          name: string
          pickups: Json | null
          rerun: boolean
          since: string
          tips: Json | null
          type: string
          until: string
          videos: Json | null
          visible: boolean | null
        }
        Insert: {
          createdAt?: string
          eventId: string
          id?: number
          image?: string | null
          name: string
          pickups?: Json | null
          rerun: boolean
          since: string
          tips?: Json | null
          type: string
          until: string
          videos?: Json | null
          visible?: boolean | null
        }
        Update: {
          createdAt?: string
          eventId?: string
          id?: number
          image?: string | null
          name?: string
          pickups?: Json | null
          rerun?: boolean
          since?: string
          tips?: Json | null
          type?: string
          until?: string
          videos?: Json | null
          visible?: boolean | null
        }
        Relationships: []
      }
      prod_followerships: {
        Row: {
          createdAt: string
          followeeId: number
          followerId: number
          id: number
        }
        Insert: {
          createdAt?: string
          followeeId: number
          followerId: number
          id?: number
        }
        Update: {
          createdAt?: string
          followeeId?: number
          followerId?: number
          id?: number
        }
        Relationships: []
      }
      prod_user_activities: {
        Row: {
          activityType: string | null
          createdAt: string
          id: number
          payload: Json | null
          uid: string
          userId: number
        }
        Insert: {
          activityType?: string | null
          createdAt?: string
          id?: number
          payload?: Json | null
          uid: string
          userId: number
        }
        Update: {
          activityType?: string | null
          createdAt?: string
          id?: number
          payload?: Json | null
          uid?: string
          userId?: number
        }
        Relationships: []
      }
      prod_users: {
        Row: {
          active: boolean
          created_at: string
          googleId: string | null
          id: number
          profileStudentId: string | null
          username: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          googleId?: string | null
          id?: number
          profileStudentId?: string | null
          username: string
        }
        Update: {
          active?: boolean
          created_at?: string
          googleId?: string | null
          id?: number
          profileStudentId?: string | null
          username?: string
        }
        Relationships: []
      }
      raids: {
        Row: {
          attackType: string | null
          boss: string
          createdAt: string
          defenseType: string | null
          id: number
          name: string
          raidId: string
          since: string
          terrain: string | null
          type: string
          until: string
          visible: boolean
        }
        Insert: {
          attackType?: string | null
          boss: string
          createdAt?: string
          defenseType?: string | null
          id?: number
          name: string
          raidId: string
          since: string
          terrain?: string | null
          type: string
          until: string
          visible?: boolean
        }
        Update: {
          attackType?: string | null
          boss?: string
          createdAt?: string
          defenseType?: string | null
          id?: number
          name?: string
          raidId?: string
          since?: string
          terrain?: string | null
          type?: string
          until?: string
          visible?: boolean
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
