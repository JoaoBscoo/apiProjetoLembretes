// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import usersRouter from './routes/users.routes.js';
import remindersRouter from './routes/reminders.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';


// (opcional) se você tiver esses middlewares no projeto
// import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Segurança e ergonomia
app.disable('x-powered-by');

// Middlewares básicos
app.use(cors());                            // libere todos os origins ou configure uma whitelist se quiser
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Healthcheck
app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Node REST Supabase API' });
});

// Evitar 404 de favicon nos logs da Vercel (opcional)
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// ---------- Swagger ----------
// 1) expõe o JSON do OpenAPI (útil para debug e para o UI carregar via fetch)
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// ---------- Swagger ----------


// 1) expõe o JSON do OpenAPI (já vimos que está OK)
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// 2) monta o UI apontando para a URL do JSON (evita problemas de serialização)
app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        explorer: true,
        swaggerOptions: {
            url: '/docs.json',           // carrega o spec via fetch
            docExpansion: 'none',
            persistAuthorization: true,
            displayRequestDuration: true,
        },
        customSiteTitle: 'Node REST Supabase API',
    })
);

app.get('/docs', (_req, res) => {
    const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Node REST Supabase API</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style> body { margin:0; } </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.ui = SwaggerUIBundle({
          url: '/docs.json',
          dom_id: '#swagger-ui',
          docExpansion: 'none',
          persistAuthorization: true,
          displayRequestDuration: true
        });
      </script>
    </body>
  </html>`;
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.send(html);
});


// ---------- Rotas da API ----------
app.use('/api/users', usersRouter);
app.use('/api/reminders', remindersRouter);

// ---------- Tratadores de erro (opcional, se tiver implementado) ----------
// app.use(notFound);
// app.use(errorHandler);

export default app;
