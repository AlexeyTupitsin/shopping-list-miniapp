import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      lists: {
        Row: {
          id: string;
          name: string;
          owner_id: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: number;
          created_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          list_id: string;
          name: string;
          quantity: string | null;
          is_completed: boolean;
          added_by: number | null;
          completed_by: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          name: string;
          quantity?: string | null;
          is_completed?: boolean;
          added_by?: number | null;
          completed_by?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          name?: string;
          quantity?: string | null;
          is_completed?: boolean;
          added_by?: number | null;
          completed_by?: number | null;
          created_at?: string;
        };
      };
      list_members: {
        Row: {
          list_id: string;
          user_id: number;
          joined_at: string;
        };
        Insert: {
          list_id: string;
          user_id: number;
          joined_at?: string;
        };
        Update: {
          list_id?: string;
          user_id?: number;
          joined_at?: string;
        };
      };
    };
  };
};
