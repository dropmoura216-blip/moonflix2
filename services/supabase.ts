import { createClient } from '@supabase/supabase-js';

// Configurações fornecidas
const SUPABASE_URL = 'https://olcwjkfoxdamriwwzrmh.supabase.co';
// NOTA: Normalmente a chave 'anon' começa com 'eyJ...'. Se a chave abaixo falhar,
// por favor verifique em Project Settings > API > Project API keys > anon public no seu painel Supabase.
const SUPABASE_ANON_KEY = 'sb_publishable_JkJurTnT2wotHSP6DBgueQ_e01129FB'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
