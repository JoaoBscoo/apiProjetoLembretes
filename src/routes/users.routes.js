import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { supabase } from '../db/supabase.js';

const router = Router();
const isPositiveInt = (n) => Number.isInteger(n) && n >= 0;

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: CRUD de Usuários
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:         { type: string, format: uuid }
 *         name:       { type: string }
 *         age:        { type: integer, minimum: 0 }
 *         profession: { type: string }
 *         created_at: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Usuario' }
 */
router.get('/', asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
        .from('users')
        .select('id,name,age,profession,created_at')
        .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obter usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       404: { description: Usuário não encontrado }
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('users')
        .select('id,name,age,profession,created_at')
        .eq('id', id)
        .single();
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Usuário não encontrado' });
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Criar usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:       { type: string }
 *               age:        { type: integer, minimum: 0 }
 *               profession: { type: string }
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       400: { description: Requisição inválida }
 */
router.post('/', asyncHandler(async (req, res) => {
    const { name, age, profession } = req.body || {};
    if (!name) return res.status(400).json({ error: 'nome é obrigatório' });
    if (age !== undefined && !isPositiveInt(Number(age))) {
        return res.status(400).json({ error: 'a idade deve ser inteiro maior que 0' });
    }
    const { data, error } = await supabase
        .from('users')
        .insert([{ name, age: age ?? null, profession: profession ?? null }])
        .select('id,name,age,profession,created_at')
        .single();
    if (error) throw error;
    res.status(201).json(data);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Atualizar usuário (parcial)
 *     tags: [Usuários]
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
 *               name:       { type: string }
 *               age:        { type: integer, minimum: 0 }
 *               profession: { type: string }
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Usuario' }
 *       400: { description: Requisição inválida }
 *       404: { description: Usuário não encontrado }
 */
router.patch('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, age, profession } = req.body || {};
    if (age !== undefined && !isPositiveInt(Number(age))) {
        return res.status(400).json({ error: 'a idade deve ser inteiro maior que 0' });
    }
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (age !== undefined) payload.age = age;
    if (profession !== undefined) payload.profession = profession;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'Sem campos para atualizar' });

    const { data, error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', id)
        .select('id,name,age,profession,created_at')
        .single();
    if (error?.code === 'PGRST116') return res.status(404).json({ error: 'Usuário não encontrado' });
    if (error) throw error;
    res.json(data);
}));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Excluir usuário (cascade nos lembretes, se FK tiver ON DELETE CASCADE)
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Excluído }
 *       404: { description: Usuário não encontrado }
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error, count } = await supabase
        .from('users')
        .delete({ count: 'exact' })
        .eq('id', id);
    if (error) throw error;
    if (!count) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.status(204).send();
}));

export default router;
