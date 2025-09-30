// src/db/supabase.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// resolve o caminho da raiz e carrega .env ANTES de ler process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..', '..'); // volta de /db para /src, depois para a raiz
dotenv.config({ path: path.join(rootPath, '.env') });

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('📂 CWD:', process.cwd());
console.log('🔎 SUPABASE_URL:', url || '(vazia)');
console.log('🔎 CHAVE (final):', key ? `***${String(key).slice(-6)}` : '(vazia)');

if (!url || !key) {
    console.error('❌ SUPABASE_URL ou SUPABASE_*_KEY não definidos no .env');
    process.exit(1);
}

export const supabase = createClient(url, key, { auth: { persistSession: false } });
