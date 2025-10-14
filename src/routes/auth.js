// src/routes/auth.js
import express from 'express';
import { supabase } from '../db/supabase.js';
import { gerarToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Fluxos de login e emissão de token
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autenticar e obter Bearer Token (JWT)
 *     description: Envie email e senha para receber o token de acesso.
 *     tags: [Autenticação]
 *     security: []   # esta rota é pública (não exige Bearer)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@teste.com
 *               password:
 *                 type: string
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Token gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login bem-sucedido
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 2h
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:    { type: integer, example: 10 }
 *                     name:  { type: string,  example: João Bosco }
 *                     email: { type: string,  example: joao@teste.com }
 *       400: { description: Campos inválidos }
 *       401: { description: Credenciais inválidas }
 *       500: { description: Falha ao autenticar }
 */
router.post('/login', async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim();
        const password = String(req.body?.password || '').trim();

        if (!email || !password) {
            return res.status(400).json({ error: 'Informe email e password.' });
        }

        // Valida credenciais na tabela public.users
        const { data, error } = await supabase
            .from('users')
            .select('id, email, password, name')
            .eq('email', email)
            .eq('password', password) // TODO: trocar por hash (bcrypt) no futuro
            .single();

        if (error || !data) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Gera JWT
        const token = gerarToken({ id: data.id, email: data.email });

        // Auditoria opcional: último login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.id);

        return res.json({
            message: 'Login bem-sucedido',
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '2h',
            user: { id: data.id, name: data.name, email: data.email },
        });
    } catch (e) {
        return res.status(500).json({ error: 'Falha ao autenticar.' });
    }
});

export default router;
