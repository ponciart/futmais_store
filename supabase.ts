import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Check .env.local');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
