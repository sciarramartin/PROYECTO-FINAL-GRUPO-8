const Inscripciones = require('../servicios/inscripciones-cursos.service');
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get("/", verificarToken, async (req, res) => {
    try {
        const registros = await Inscripciones.findAllByUserId(req.usuario.id);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

router.get("/:id", async (req, res) => {
    try {

        const registros = await Inscripciones.findAllByCursoId(req.params.id);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

router.post("/generar-opciones", verificarToken, async (req, res) => {
    try {
        const registros = await Inscripciones.calcularPlan(req.body);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        console.error('ERROR DETALLADO:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

module.exports = router;