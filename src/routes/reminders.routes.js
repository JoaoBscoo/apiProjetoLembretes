import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const isPriority = (n) => Number.isInteger(n) && n >= 1 && n <= 5;

/**
 * @swagger
 * tags:
 *   name: Lembretes
 *   description: CRUD de Lembretes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Lembrete:
 *       type: object
 *       properties:
 *         id:          { type: string, format: uuid }
 *         description: { type: string }
 *         priority:    { type: integer, minimum: 1, maximum: 5 }
 *         user_id:     { type: string, format: uuid }
 *         time:        { type: string, example: "12:00", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" }
 */

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Listar lembretes (filtro opcional por user_id)
 *     tags: [Lembretes]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lista de lembretes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Lembrete' }
 */
router.get('/', asyncHandler(async (req, res) => {
    const { user_id } = req.query;
    let q = supabase.from('reminders').select('id,description,priority,user_id,time');
    if (user_id) q = q.eq('user_id', user_id);
    q = q.order('time', { ascending: true });
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Obter lembrete por ID
 *     tags: [Lembretes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Lembrete
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lembrete' }
 *       404: { description: Lembrete não encontrado }
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('reminders')
        .select('id,description,priority,user_id,time')
        .eq('id', id)
        .single();
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Lembrete não encontrado' });
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     summary: Criar lembrete
 *     tags: [Lembretes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [description, priority, user_id, time]
 *             properties:
 *               description: { type: string }
 *               priority:    { type: integer, minimum: 1, maximum: 5 }
 *               user_id:     { type: string, format: uuid }
 *               time:        { type: string, example: "12:00", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" }
 *     responses:
 *       201:
 *         description: Lembrete criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lembrete' }
 *       400: { description: Requisição inválida }
 */
router.post('/', asyncHandler(async (req, res) => {
    const { description, priority, user_id, time } = req.body || {};
    if (!description) return res.status(400).json({ error: 'description é obrigatório' });
    if (!Number.isInteger(priority) || !isPriority(priority)) return res.status(400).json({ error: 'priority deve ser 1..5' });
    if (!user_id) return res.status(400).json({ error: 'user_id é obrigatório' });
    if (!timeRegex.test(time || '')) return res.status(400).json({ error: 'time deve ser HH:MM' });

    // garante usuário existente
    const { data: u, error: ue } = await supabase.from('users').select('id').eq('id', user_id).single();
    if (ue?.code === 'PGRST116' || !u) return res.status(400).json({ error: 'user_id não encontrado' });
    if (ue) throw ue;

    const { data, error } = await supabase
        .from('reminders')
        .insert([{ description, priority, user_id, time }])
        .select('id,description,priority,user_id,time')
        .single();
    if (error) throw error;
    res.status(201).json(data);
}));

/**
 * @swagger
 * /api/reminders/{id}:
 *   patch:
 *     summary: Atualizar lembrete (parcial)
 *     tags: [Lembretes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               priority:    { type: integer, minimum: 1, maximum: 5 }
 *               user_id:     { type: string, format: uuid }
 *               time:        { type: string, example: "08:30", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" }
 *     responses:
 *       200:
 *         description: Lembrete atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Lembrete' }
 *       400: { description: Requisição inválida }
 *       404: { description: Lembrete não encontrado }
 */
router.patch('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description, priority, user_id, time } = req.body || {};

    if (priority !== undefined && (!Number.isInteger(priority) || !isPriority(priority)))
        return res.status(400).json({ error: 'priority deve ser 1..5' });
    if (time !== undefined && !timeRegex.test(time)) return res.status(400).json({ error: 'time deve ser HH:MM' });
    if (user_id !== undefined) {
        const { data: u, error: ue } = await supabase.from('users').select('id').eq('id', user_id).single();
        if (ue?.code === 'PGRST116' || !u) return res.status(400).json({ error: 'user_id não encontrado' });
        if (ue) throw ue;
    }

    const payload = {};
    if (description !== undefined) payload.description = description;
    if (priority !== undefined) payload.priority = priority;
    if (user_id !== undefined) payload.user_id = user_id;
    if (time !== undefined) payload.time = time;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'Sem campos para atualizar' });

    const { data, error } = await supabase
        .from('reminders')
        .update(payload)
        .eq('id', id)
        .select('id,description,priority,user_id,time')
        .single();
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Lembrete não encontrado' });
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Excluir lembrete
 *     tags: [Lembretes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Excluído }
 *       404: { description: Lembrete não encontrado }
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, count } = await supabase
        .from('reminders')
        .delete({ count: 'exact' })
        .eq('id', id);
    if (error) throw error;
    if (!count) return res.status(404).json({ error: 'Lembrete não encontrado' });
    res.status(204).send();
}));

export default router;
