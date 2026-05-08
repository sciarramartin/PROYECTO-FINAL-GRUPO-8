// modelos/RecuperarContrasenaService.js
const crypto = require('crypto');
const { UsuarioDAO } = require('./UsuarioDAO');
const { BcryptHelper } = require('../utils/bcryptHelper');
const { MailHelper } = require('../utils/mailHelper');

class RecuperarContrasenaService {

    constructor() {
        this.usuarioDAO = new UsuarioDAO();
        this.bcryptHelper = new BcryptHelper();
        this.mailHelper = new MailHelper();
    }

    async solicitarRecuperacion(mail) {
        // 1. Verificar que el mail existe
        const usuario = await this.usuarioDAO.findByEmail(mail);

        if (!usuario) {
            // No revelamos si el mail existe o no por seguridad
            return;
        }

        // 2. Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // 3. Calcular expiración (1 hora)
        const expiracion = new Date(Date.now() + 60 * 60 * 1000);

        // 4. Guardar token en la BD
        await this.usuarioDAO.guardarResetToken(mail, token, expiracion);

        // 5. Mandar el mail
        await this.mailHelper.enviarRecuperacion(mail, token);
    }

    async resetearContrasena(token, nuevaContraseña) {
        // 1. Buscar usuario por token
        const usuario = await this.usuarioDAO.findByResetToken(token);

        if (!usuario) {
            throw new Error('Token inválido');
        }

        // 2. Verificar que el token no expiró
        if (new Date() > new Date(usuario.reset_token_expira)) {
            throw new Error('El token expiró');
        }

        // 3. Hashear la nueva contraseña
        const hash = await this.bcryptHelper.hashear(nuevaContraseña);

        // 4. Actualizar contraseña y limpiar token
        await this.usuarioDAO.actualizarContrasena(usuario.id, hash);
    }

}

module.exports = { RecuperarContrasenaService };