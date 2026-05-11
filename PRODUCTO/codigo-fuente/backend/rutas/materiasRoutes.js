// rutas/materiasRoutes.js
const express = require('express');
const {
    obtenerMaterias,
    obtenerMateriaPorId,
    crearMateria,
    actualizarMateria,
    eliminarMateria
} = require('../controladores/controlador-materias');

const router = express.Router();

// Middleware de autenticación (comentado para desarrollo inicial, pero se debe usar en el futuro si el equipo ya tiene middlewares)
// const { verificarAdmin } = require('../middleware/authMiddleware');
// router.use(verificarAdmin);

router.get('/', obtenerMaterias);
router.get('/:id', obtenerMateriaPorId);
router.post('/', crearMateria);
router.put('/:id', actualizarMateria);
router.delete('/:id', eliminarMateria);

module.exports = { router };
