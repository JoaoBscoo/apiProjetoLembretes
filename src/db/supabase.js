// src/db/supabase.js
import { createClient } from '@supabase/supabase-js';

// NUNCA importe dotenv aqui.
// Em dev, quem carrega .env é o src/server.js com `import 'dotenv/config'`

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY,
} = process.env;

// Prefira a service role (apenas no backend). Cai para ANON se não houver.
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !supabaseKey) {
    throw new Error('SUPABASE_URL e SUPABASE_*_KEY não configurados nas variáveis de ambiente.');
}

export const supabase = createClient(SUPABASE_URL, supabaseKey, {
    auth: { persistSession: false },
});
