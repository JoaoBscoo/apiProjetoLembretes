import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import usersRouter from './routes/users.routes.js';
import remindersRouter from './routes/reminders.routes.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// debug: ver o JSON do spec no ar
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/', (_req, res) => res.json({ ok: true, message: 'Node REST Supabase API' }));

app.get('/docs.json', (_req, res) => res.json(swaggerSpec)); // debug/uso pelo UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/api/users', usersRouter);
app.use('/api/reminders', remindersRouter);

export default app;
