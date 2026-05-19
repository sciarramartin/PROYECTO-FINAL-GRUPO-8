// middleware/authMiddleware.js
const { TokenManager } = require('../utils/tokenManager');

const tokenManager = new TokenManager();

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });
    }

    // El header viene como "Bearer <token>"
    const token = authHeader.split(' ')[1];

    try {
        const payload = tokenManager.verificar(token);
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};

module.exports = { verificarToken };