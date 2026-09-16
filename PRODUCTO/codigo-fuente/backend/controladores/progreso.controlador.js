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

// Obtener estado de graduación del alumno logueado (SCRUM-90)
router.get('/estado-graduacion', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const graduacion = await ProgresoService.verificarGraduacion(id_usuario);
        return res.json(graduacion);
    } catch (error) {
        console.error('Error al verificar graduación:', error);
        res.status(500).json({ error: 'Error al consultar estado de graduación.' });
    }
});

// Obtener métricas agregadas de graduados y tasa de egreso (SCRUM-90)
router.get('/metricas-graduados', verificarToken, async (req, res) => {
    try {
        const metricas = await ProgresoService.obtenerMetricasGraduados();
        return res.json(metricas);
    } catch (error) {
        console.error('Error al obtener métricas de graduados:', error);
        res.status(500).json({ error: 'Error al consultar métricas de graduación.' });
    }
});

// Actualizar el estado de una materia para el alumno logueado (incluye sincronización de comisión SCRUM-100)
router.put('/:id_materia', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const { id_materia } = req.params;
        const { estado, id_curso } = req.body;

        const registro = await ProgresoService.actualizarEstadoMateria(id_usuario, id_materia, estado, id_curso);
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
        res.status(500).json({ error: 'Error al obtener materias habilitadas.' });
    }
});

module.exports = router;
