export interface SupabaseSchema {
  public: {
    Tables: {
      users: {
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
    };
    Views: {};
    Functions: {};
  };
};
