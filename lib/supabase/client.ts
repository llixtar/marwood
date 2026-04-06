import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Клієнт для безпечного використання на фронтенді (Next.js Client Components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
