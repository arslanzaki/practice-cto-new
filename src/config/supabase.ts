import { createClient } from '@supabase/supabase-js';
import { config } from './env';

// Create Supabase client for authentication
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: false, // We'll handle sessions in the API
      autoRefreshToken: false,
    },
  }
);

// Create admin client for backend operations
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);