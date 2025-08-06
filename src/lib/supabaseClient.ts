import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    throw new Error("Supabase URL not found. Please add NEXT_PUBLIC_SUPABASE_URL to your .env file.");
}
if (!supabaseAnonKey) {
    throw new Error("Supabase Anon Key not found. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
