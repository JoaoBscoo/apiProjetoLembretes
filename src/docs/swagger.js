// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// apanha TODOS os arquivos de rota
const routesGlob = path.join(process.cwd(), 'src', 'routes', '*.js');

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node REST Supabase API',
            version: '1.0.0',
            description: 'API REST com Usuários e Lembretes (Supabase)'
        },
        servers: [
            { url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }
        ]
    },
    apis: [routesGlob],
});
