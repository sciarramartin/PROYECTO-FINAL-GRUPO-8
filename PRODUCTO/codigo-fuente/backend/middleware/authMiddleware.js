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

const verificarAdmin = (req, res, next) => {
    // Se asume que este middleware se ejecuta DESPUÉS de verificarToken
    if (req.usuario && req.usuario.id_tipo_usuario === 3) {
        next();
    } else {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de Administrador.' });
    }
};

module.exports = { verificarToken, verificarAdmin };