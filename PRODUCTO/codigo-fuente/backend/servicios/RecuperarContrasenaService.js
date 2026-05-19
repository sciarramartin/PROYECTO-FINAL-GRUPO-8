// servicios/recuperar-contrasena.service.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Usuario } = require('../modelos/Usuario');
const { MailHelper } = require('../utils/mailHelper');

const mailHelper = new MailHelper();

const solicitarRecuperacion = async (mail) => {
    const usuario = await Usuario.findOne({ where: { mail } });

    if (usuario) {
        // 1. Generar token único
        const token = crypto.randomBytes(32).toString('hex');

        // 2. Calcular expiración (1 hora)
        const expiracion = new Date(Date.now() + 60 * 60 * 1000);

        // 3. Guardar token en la BD
        await Usuario.update(
            { reset_token: token, reset_token_expira: expiracion },
            { where: { mail } }
        );

        // 4. Mandar el mail
        await mailHelper.enviarRecuperacion(mail, token);
    }

    // No lanzamos error si el mail no existe, por seguridad
};

const resetearContrasena = async (token, nuevaContraseña) => {
    // 1. Buscar usuario por token
    const usuario = await Usuario.findOne({ where: { reset_token: token } });

    if (!usuario) {
        throw new Error('Token inválido.');
    }

    // 2. Verificar que el token no expiró
    if (new Date() > new Date(usuario.reset_token_expira)) {
        throw new Error('El token expiró.');
    }

    // 3. Hashear la nueva contraseña
    const hash = await bcrypt.hash(nuevaContraseña, 10);

    // 4. Actualizar contraseña y limpiar token
    await Usuario.update(
        { contraseña: hash, reset_token: null, reset_token_expira: null },
        { where: { id: usuario.id } }
    );
};

module.exports = { solicitarRecuperacion, resetearContrasena };