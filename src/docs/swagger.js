// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '../../package.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve os arquivos de rotas de forma absoluta (funciona na Vercel)
const routesGlob = path.join(process.cwd(), 'src', 'routes', '*.js');

const servers = [
    { url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }
];

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node REST Supabase API',
            version: pkg.version,
            description: 'API REST simples e bem documentada para Usuários e Lembretes (Supabase)'
        },
        servers
    },
    apis: [routesGlob], // <— importante
});
