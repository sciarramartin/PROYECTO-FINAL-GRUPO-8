// rutas/authRoutes.js
const express = require('express');
const { login } = require('../servicios/AuthService');
const { solicitarRecuperacion, resetearContrasena } = require('../servicios/RecuperarContrasenaService');
const { crearCarrera } = require('../controladores/controlador-carreras'); // para probar registro

const router = express.Router();

router.post('/login', login);
router.post('/recuperar-contrasena', solicitarRecuperacion);
router.post('/resetear-contrasena', resetearContrasena);
router.post('/', crearCarrera); // para probar registro


module.exports = { router };