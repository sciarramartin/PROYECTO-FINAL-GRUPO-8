// utils/tokenManager.js
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'clave_secreta';

class TokenManager {

    firmar(payload) {
        return jwt.sign(payload, SECRET, { expiresIn: '8h' });
    }

    verificar(token) {
        return jwt.verify(token, SECRET);
    }

}

module.exports = { TokenManager };