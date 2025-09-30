// api/index.js (ESM)
import app from '../src/app.js';

export default function handler(req, res) {
    // Repassa a request/response para o Express
    return app(req, res);
}
