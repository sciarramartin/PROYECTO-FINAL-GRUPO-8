// rutas/authRoutes.js
const express = require('express');
const { AuthController } = require('../controladores/AuthController');
const { RecuperarContrasenaController } = require('../controladores/RecuperarContrasenaController');

const router = express.Router();
const authController = new AuthController();
const recuperarContrasenaController = new RecuperarContrasenaController();

router.post('/login', authController.login);
router.post('/recuperar-contrasena', recuperarContrasenaController.solicitarRecuperacion);
router.post('/resetear-contrasena', recuperarContrasenaController.resetearContrasena);

module.exports = { router };