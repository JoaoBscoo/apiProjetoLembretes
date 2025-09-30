// src/server.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve a raiz do projeto e aponta para .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '..'); // -> pasta /src/.. = raiz
dotenv.config({ path: path.join(rootPath, '.env') });

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ API rodando em http://localhost:${PORT}`);
    console.log(`📘 Swagger UI em http://localhost:${PORT}/docs`);
});
