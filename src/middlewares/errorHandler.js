export function notFound(req, res, _next) {
    res.status(404).json({ error: 'Não encontrado' });
}

export function errorHandler(err, _req, res, _next) {
    console.error('💥 Erro:', err);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Erro interno do servidor'
    });
}
