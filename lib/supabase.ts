import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      reports: {
        Row: {
          id: string;
          client_name: string;
          html_content: string;
          share_token: string;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          client_name: string;
          html_content: string;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          client_name?: string;
          html_content?: string;
          share_token?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
  };
};