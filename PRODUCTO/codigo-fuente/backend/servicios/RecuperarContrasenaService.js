// servicios/RecuperarContrasenaService.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { Usuario } = require('../modelos/Usuario');
const { MailHelper } = require('../utils/mailHelper');

const mailHelper = new MailHelper();

const solicitarRecuperacion = async (req, res) => {
    const { mail } = req.body;

    if (!mail) {
        return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
    }

    try {
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

        // Siempre respondemos lo mismo por seguridad
        return res.status(200).json({
            mensaje: 'Si el correo está registrado, vas a recibir un mail con las instrucciones.'
        });

    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
    }
};

const resetearContrasena = async (req, res) => {
    const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
    }

    if (nuevaContraseña.length < 6) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        // 1. Buscar usuario por token
        const usuario = await Usuario.findOne({ where: { reset_token: token } });

        if (!usuario) {
            return res.status(400).json({ mensaje: 'Token inválido.' });
        }

        // 2. Verificar que el token no expiró
        if (new Date() > new Date(usuario.reset_token_expira)) {
            return res.status(400).json({ mensaje: 'El token expiró.' });
        }

        // 3. Hashear la nueva contraseña
        const hash = await bcrypt.hash(nuevaContraseña, 10);

        // 4. Actualizar contraseña y limpiar token
        await Usuario.update(
            { contraseña: hash, reset_token: null, reset_token_expira: null },
            { where: { id: usuario.id } }
        );

        return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });

    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
    }
};

module.exports = { solicitarRecuperacion, resetearContrasena };