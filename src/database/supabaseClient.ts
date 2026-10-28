import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.type';
import { getAppConfig } from '../shared/services/configService';

const config = getAppConfig();

// Inizializzazione tollerante: usa URL/Key fallback se mancanti per prevenire schermate bianche in runtime
export const isSupabaseConfigured = config.isConfigured;

export const supabase = createClient<Database>(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);