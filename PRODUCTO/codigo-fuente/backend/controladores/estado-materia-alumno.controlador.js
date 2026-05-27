const Estado = require('../servicios/estado-materia-alumno.service');
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get("/", verificarToken, async (req, res) => {
    try {
        const registros = await Estado.findAllByUserId(req.usuario.id);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

router.get("/:id", async (req, res) => {
    try {

        const registros = await Estado.findAllByCursoId(req.params.id);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});


module.exports = router;