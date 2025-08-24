import { createClient } from '@supabase/supabase-js';

// Read environment variables from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a single supabase client for the whole app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
