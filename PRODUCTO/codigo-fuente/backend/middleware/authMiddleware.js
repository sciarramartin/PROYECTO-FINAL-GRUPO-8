// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'clave_secreta';

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ mensaje: 'Acceso denegado, token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, SECRET);
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};

module.exports = { verificarToken };