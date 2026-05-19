// controladores/auth.controller.js
const express = require('express');
const router = express.Router();
const { login } = require('../servicios/AuthService');
const { solicitarRecuperacion, resetearContrasena } = require('../servicios/RecuperarContrasenaService');

router.post('/login', async (req, res) => {
    const { mail, contraseña } = req.body;

    if (!mail || !contraseña) {
        return res.status(400).json({ mensaje: 'Completá todos los campos' });
    }

    try {
        const resultado = await login(mail, contraseña);
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
});

router.post('/recuperar-contrasena', async (req, res) => {
    const { mail } = req.body;

    if (!mail) {
        return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
    }

    try {
        await solicitarRecuperacion(mail);
        return res.status(200).json({
            mensaje: 'Si el correo está registrado, vas a recibir un mail con las instrucciones.'
        });
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error al procesar la solicitud.' });
    }
});

router.post('/resetear-contrasena', async (req, res) => {
    const { token, nuevaContraseña } = req.body;

    if (!token || !nuevaContraseña) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' });
    }

    if (nuevaContraseña.length < 6) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        await resetearContrasena(token, nuevaContraseña);
        return res.status(200).json({ mensaje: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        return res.status(400).json({ mensaje: error.message });
    }
});

module.exports = router;