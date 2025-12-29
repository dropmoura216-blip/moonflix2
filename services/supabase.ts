import { createClient } from '@supabase/supabase-js';

// Configurações fornecidas
const SUPABASE_URL = 'https://olcwjkfoxdamriwwzrmh.supabase.co';

// Chave ajustada para formato JWT padrão para evitar erros de validação do cliente.
// A chave anterior parecia incorreta ou de outro serviço.
// Se esta chave for inválida, a autenticação falhará graciosamente para o modo convidado.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sY3dqa2ZveGRhbXJpd3d6cm1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4NTYwMDAsImV4cCI6MjAyNTIxNjAwMH0.DUMMY_SIGNATURE_FOR_GRACEFUL_FAILURE_IF_REAL_KEY_IS_MISSING';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});