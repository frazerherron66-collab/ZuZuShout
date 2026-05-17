import { createClient } from '@supabase/supabase-js';

// These pull safely from your environment configuration 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// A safe client-side instance that strictly honors Row Level Security (RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);