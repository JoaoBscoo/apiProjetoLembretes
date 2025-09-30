import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const routesGlob = path.join(process.cwd(), 'src', 'routes', '*.js');

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: { title: 'Node REST Supabase API', version: '1.0.0' },
        servers: [{ url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }],
    },
    apis: [routesGlob],
});
