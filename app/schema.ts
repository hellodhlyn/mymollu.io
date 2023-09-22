export interface SupabaseSchema {
  public: {
    Tables: {
      dev_users: {
        Row: {
          id: number;
          username: string;
          active: boolean;
          googleId: string | null;
          profileStudentId: string | null;
        };
        Insert: {};
        Update: {};
      };
      dev_followerships: {
        Row: {
          id: number;
          followerId: number;
          followeeId: number;
        };
        Insert: {};
        Update: {};
      };
      dev_user_activities: {
        Row: {
          id: number;
          uuid: string;
          userId: number;
          activityType: string;
          payload: string | null;
        };
        Insert: {};
        Update: {};
      };
      prod_users: SupabaseSchema["public"]["Tables"]["dev_users"];
      prod_followerships: SupabaseSchema["public"]["Tables"]["dev_followerships"];
      prod_user_activities: SupabaseSchema["public"]["Tables"]["dev_user_activities"];
    };
    Views: {};
    Functions: {};
  };
};
