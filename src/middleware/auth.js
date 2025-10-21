import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export function gerarToken(payload) {
    return jwt.sign({ id: payload.id, email: payload.email }, SECRET, { expiresIn: EXPIRES_IN });
}

export function verificarToken(req, res, next) {
    const header = req.headers["authorization"];
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Token ausente" });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido ou expirado" });
        req.user = user;
        next();
    });
}
