// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const routesGlob = path.join(process.cwd(), 'src', 'routes', '*.js');

const baseDef = {
    openapi: '3.0.0',
    info: { title: 'Api - Lembretes', version: '1.0.6' },
    servers: [{ url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }],
};

let swaggerSpec = { ...baseDef, paths: {} };

try {
    const spec = swaggerJsdoc({ definition: baseDef, apis: [routesGlob] });
    if (spec && typeof spec === 'object' && Object.keys(spec).length) {
        swaggerSpec = spec;
    }
} catch (err) {
    console.error('💥 Falhou ao gerar Swagger spec:', err);
}

export { swaggerSpec };
