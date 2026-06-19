const express = require('express');
const router = express.Router();
const ProgresoService = require('../servicios/progreso.servicio');
const { verificarToken } = require('../middleware/authMiddleware');

// Obtener todas las materias y el estado específico del alumno logueado
router.get('/', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const estados = await ProgresoService.obtenerProgreso(id_usuario);
        return res.json(estados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el progreso del estudiante.' });
    }
});

// Actualizar el estado de una materia para el alumno logueado
router.put('/:id_materia', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_materia } = req.params;
        const { estado } = req.body;

        const registro = await ProgresoService.actualizarEstadoMateria(id_usuario, id_materia, estado);
        return res.json(registro);
    } catch (error) {
        console.error(error);
        if (error.message === 'Estado inválido.') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error al actualizar el estado de la materia.' });
    }
});


router.get('/materias-habilitadas', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const estados = await ProgresoService.obtenerMateriasHabilitadas(id_usuario);
        return res.json(estados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el progreso del estudiante.' });
    }
});
module.exports = router;
