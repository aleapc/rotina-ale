import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase: SupabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'rotina-ale-auth'
    },
    realtime: {
      params: {
        eventsPerSecond: 5
      }
    }
  }
);

export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          day_id: string;
          exercises: Record<string, { sets: { done: boolean; load?: number }[]; updatedAt: number }>;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      exercise_history: {
        Row: {
          user_id: string;
          exercise_key: string;
          last_load: number;
          updated_at: string;
        };
      };
    };
  };
};
