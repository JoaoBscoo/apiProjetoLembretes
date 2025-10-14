// src/routes/auth.js
import express from "express";
import { supabase } from "../db/supabase.js"; // ajuste o caminho se seu supabase.js estiver em ./db/supabase.js
import { gerarToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Informe email e password." });
        }

        const { data, error } = await supabase
            .from("users")
            .select("id, email, password, name")
            .eq("email", email)
            .eq("password", password) // depois trocamos por bcrypt
            .single();

        if (error || !data) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        const token = gerarToken({ id: data.id, email: data.email });

        // opcional: auditar login
        await supabase
            .from("users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", data.id);

        return res.json({
            message: "Login bem-sucedido",
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || "2h",
            user: { id: data.id, name: data.name, email: data.email },
        });
    } catch (e) {
        return res.status(500).json({ error: "Falha ao autenticar." });
    }
});

export default router;
