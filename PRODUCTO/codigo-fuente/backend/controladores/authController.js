// controladores/auth.controlador.js
const AuthService = require('../servicios/AuthService'); 
const RecuperarContrasenaService = require('../servicios/RecuperarContrasenaService'); 
const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const resultado = await AuthService.procesarLogin(req.body);
        return res.status(200).json(resultado);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

// RECUPERACIÓN 
router.post('/recuperar-contrasena', async (req, res) => {
    try {
        await RecuperarContrasenaService.solicitarRecuperacion(req.body);
        return res.status(200).json({ mensaje: 'Mail de recuperación enviado.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/resetear-contrasena', async (req, res) => {
    try {
        await RecuperarContrasenaService.resetearContrasena(req.body);
        return res.status(200).json({ mensaje: 'Contraseña cambiada con éxito.' });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = router;