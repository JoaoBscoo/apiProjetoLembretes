// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import usersRouter from './routes/users.routes.js';
import remindersRouter from './routes/reminders.routes.js';

// 🔐 NOVO: rotas de autenticação (login)
import authRouter from './routes/auth.js';
// 🔐 NOVO: middleware de verificação do Bearer Token
import { verificarToken } from './middleware/auth.js';

import { swaggerSpec } from './docs/swagger.js';

const app = express();
app.disable('x-powered-by');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Healthcheck
app.get('/', (_req, res) => res.json({ ok: true, message: 'Api de Lembretes - João' }));
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// ---------- Swagger ----------
// JSON do OpenAPI
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// UI pelo CDN (não depende de swagger-ui-express)
app.get('/docs', (_req, res) => {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>API - Lembretes</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style> html,body,#swagger-ui{height:100%} body{margin:0} </style>
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

// ---------- Rotas ----------
// 🔐 Login público (gera o token)
app.use('/api', authRouter);              // /api/login

// 🔐 Protege as rotas abaixo com Bearer Token
app.use('/api/usuarios', verificarToken, usersRouter);
app.use('/api/lembretes', verificarToken, remindersRouter);

// Endpoint raiz da API
app.get('/api', (req, res) => {
  res.json({
    name: 'API de Lembretes',
    version: '1.0.0',
    description: 'API RESTful desenvolvida com Node.js, Express e Supabase para gerenciamento de lembretes.',
    author: 'João Bosco',
    documentation: '/docs'
  });
});

export default app;
