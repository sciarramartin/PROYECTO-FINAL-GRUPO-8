const express = require('express');
const enrutador = express.Router();
const { obtenerEjemplos, crearEjemplo } = require('../controladores/controlador-ejemplo');

// Definir las rutas y conectarlas con el controlador genérico
enrutador.get('/', obtenerEjemplos);
enrutador.post('/', crearEjemplo);

module.exports = enrutador;
