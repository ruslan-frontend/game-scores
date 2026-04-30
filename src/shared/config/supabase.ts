import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string | null;
          telegram_id: number;
          username: string | null;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          telegram_id: number;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          telegram_id?: number;
          username?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          user_id: string;
          context_id: string | null;
          name: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context_id?: string | null;
          name: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context_id?: string | null;
          name?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          user_id: string;
          context_id: string | null;
          name: string;
          winner_id: string;
          winner_ids: string[];
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context_id?: string | null;
          name: string;
          winner_id: string;
          winner_ids?: string[];
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context_id?: string | null;
          name?: string;
          winner_id?: string;
          winner_ids?: string[];
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_participants: {
        Row: {
          id: string;
          game_id: string;
          participant_id: string;
          context_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          participant_id: string;
          context_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          participant_id?: string;
          context_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}