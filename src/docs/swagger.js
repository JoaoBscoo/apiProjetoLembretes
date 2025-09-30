import swaggerJSDoc from 'swagger-jsdoc';

const serverUrl = process.env.SWAGGER_SERVER_URL || 'http://localhost:3000';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Node REST Supabase API',
            version: '1.0.0',
            description:
                'API REST simples e bem documentada para **Usuários** e **Lembretes** com banco Supabase (PostgreSQL).'
        },
        servers: [{ url: serverUrl }],
        components: {
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        age: { type: 'integer', minimum: 0 },
                        profession: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Lembrete: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        description: { type: 'string' },
                        priority: { type: 'integer', minimum: 1, maximum: 5 },
                        user_id: { type: 'string', format: 'uuid' },
                        time: { type: 'string', example: '12:00', pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$' }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
});
