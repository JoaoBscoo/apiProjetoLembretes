// src/docs/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const routesGlob = path.join(process.cwd(), 'src', 'routes', '*.js');

const baseDef = {
    openapi: '3.0.3',
    info: { title: 'Api - Lembretes', version: '1.0.6' },
    servers: [{ url: process.env.SWAGGER_SERVER_URL || 'http://localhost:3000' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        // ✅ ADICIONADO: schemas globais usados pelo /api/login
        schemas: {
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', example: 'joao@teste.com' },
                    password: { type: 'string', example: '12345' },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'Login bem-sucedido' },
                    token: { type: 'string', example: 'eyJhbGciOi...' },
                    expiresIn: { type: 'string', example: '2h' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer', example: 10 },
                            name: { type: 'string', example: 'João Bosco' },
                            email: { type: 'string', example: 'joao@teste.com' },
                        },
                    },
                },
            },
        },
    },
    // aplica Bearer globalmente; /api/login sobrescreve com security: []
    security: [{ bearerAuth: [] }],
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
