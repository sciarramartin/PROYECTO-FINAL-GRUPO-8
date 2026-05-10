// rutas/authRoutes.js
const express = require('express');
const { login } = require('../servicios/AuthService');
const { solicitarRecuperacion, resetearContrasena } = require('../servicios/RecuperarContrasenaService');

const router = express.Router();

router.post('/login', login);
router.post('/recuperar-contrasena', solicitarRecuperacion);
router.post('/resetear-contrasena', resetearContrasena);

module.exports = { router };