import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Клієнт для серверних операцій (Next.js Server Actions), який оминає RLS
// НІКОЛИ не використовуйте цей клієнт на фронтенді (в components з 'use client')!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
