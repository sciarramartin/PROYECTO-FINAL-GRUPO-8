const MateriaService = require('../servicios/materia.servicio');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const { id_carrera, id_plan_academico } = req.query;
        const materias = await MateriaService.obtenerTodas(id_carrera, id_plan_academico);
        res.json(materias);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener las materias.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const materia = await MateriaService.obtenerPorId(id);
        res.json(materia);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: error.message });
    }
});

router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    console.log("POST /materias -> req.body =", req.body);
    try {
        const { codigo, nombre, nivel_anio, cuatrimestre, correlativas, id_carrera, id_plan_academico, visible_en_grafo } = req.body;

        if (!codigo || !nombre || !nivel_anio || !cuatrimestre || !id_carrera) {
            return res.status(400).json({ error: 'El código, nombre, nivel/año, cuatrimestre y carrera son obligatorios.' });
        }

        const nuevaMateria = await MateriaService.crearMateria({
            codigo, nombre, nivel_anio, cuatrimestre, correlativas, id_carrera, id_plan_academico, visible_en_grafo
        });

        res.status(201).json(nuevaMateria);
    } catch (error) {
        console.error(error);
        // Si el error es de dependencia circular, mandar un 400 Bad Request
        if (error.message.includes('Dependencia circular')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Hubo un error al crear la materia.' });
    }
});

router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const materiaActualizada = await MateriaService.actualizarMateria(id, datos);
        res.json(materiaActualizada);
    } catch (error) {
        console.error(error);
        if (error.message.includes('Dependencia circular')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Hubo un error al actualizar la materia.' });
    }
});

router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await MateriaService.eliminarMateria(id);
        res.json({ mensaje: 'Materia eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al eliminar la materia.' });
    }
});

module.exports = router;
