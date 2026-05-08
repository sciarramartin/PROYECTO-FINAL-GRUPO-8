// controllers/AuthController.js
const { AuthService } = require('../servicios/AuthService');
const { TokenManager } = require('../utils/tokenManager');

class AuthController {

    constructor() {
        this.authService = new AuthService();
        this.tokenManager = new TokenManager();
        this.login = this.login.bind(this);
    }

    async login(req, res) {
        const { mail, contraseña } = req.body;

        // Validar que los campos no estén vacíos
        if (!mail || !contraseña) {
            return res.status(400).json({ mensaje: 'Completá todos los campos' });
        }

        try {
            // 1. Validar credenciales via AuthService
            const usuario = await this.authService.login(mail, contraseña);

            // 2. Firmar el token
            const token = this.tokenManager.firmar({
                id: usuario.id,
                mail: usuario.mail,
                nombre: usuario.nombre
            });

            // 3. Responder con el token y datos del usuario
            return res.status(200).json({
                token,
                usuario: {
                    id: usuario.id,
                    mail: usuario.mail,
                    nombre: usuario.nombre
                }
            });

        } catch (error) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }
    }

}

module.exports = { AuthController };