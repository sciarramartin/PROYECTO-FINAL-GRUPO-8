const express = require('express');
const enrutador = express.Router();
const { obtenerActividades, crearActividad} = require('../controladores/actividades-personales.controlador.js');

// Definir las rutas y conectarlas con el controlador genérico
enrutador.get('/', obtenerActividades);
enrutador.post('/', crearActividad);

module.exports = enrutador;
