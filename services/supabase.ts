import { createClient } from '@supabase/supabase-js';

// Configurações fornecidas
const SUPABASE_URL = 'https://olcwjkfoxdamriwwzrmh.supabase.co';

// Nova chave fornecida pelo usuário
const SUPABASE_ANON_KEY = 'sb_publishable_JkJurTnT2wotHSP6DBgueQ_e01129FB';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});