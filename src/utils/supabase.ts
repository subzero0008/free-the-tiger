import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dulwvzixseaudmovgtpw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5anRloKgAyDOcQDd6v_XwQ_0HaUbNEL';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);