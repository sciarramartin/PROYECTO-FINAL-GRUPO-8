// controladores/RecuperarContrasenaController.js
const { RecuperarContrasenaService } = require('./RecuperarContrasenaService');

class RecuperarContrasenaController {

    constructor() {
        this.recuperarContrasenaService = new RecuperarContrasenaService();
        this.solicitarRecuperacion = this.solicitarRecuperacion.bind(this);
        this.resetearContrasena = this.resetearContrasena.bind(this);
    }

    async solicitarRecuperacion(req, res) {
        const { mail } = req.body;

        if (!mail) {
            return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
        }

        try {
            await this.recuperarContrasenaService.solicitarRecuperacion(mail);
            // Siempre respondemos lo mismo por seguridad
            return res.status(200).json({
                mensaje: 'Si el correo está registrado, vas a recibir un mail con las instrucciones.'
            });
        } catch (error) {
            return res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
        }
    }

    async resetearContrasena(req, res) {
        const { token, nuevaContraseña } = req.body;

        if (!token || !nuevaContraseña) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
        }

        if (nuevaContraseña.length < 6) {
            return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
        }

        try {
            await this.recuperarContrasenaService.resetearContrasena(token, nuevaContraseña);
            return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
        } catch (error) {
            return res.status(400).json({ mensaje: error.message });
        }
    }

}

module.exports = { RecuperarContrasenaController };