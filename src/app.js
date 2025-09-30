import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { notFound, errorHandler } from './middlewares/errorHandler.js';
import usersRouter from './routes/users.routes.js';
import remindersRouter from './routes/reminders.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck
app.get('/', (_req, res) => res.json({ ok: true, message: 'Node REST Supabase API' }));

// Rotas
app.use('/api/users', usersRouter);
app.use('/api/reminders', remindersRouter);

// 404 + Tratador de erros
app.use(notFound);
app.use(errorHandler);

export default app;
