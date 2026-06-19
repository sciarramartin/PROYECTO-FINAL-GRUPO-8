const Curso = require('../servicios/cursos.service');
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const registro = await Curso.findById(id);
        console.log("Registros encontrados:", registro);
        res.json(registro);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

router.get("/materia/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const registros = await Curso.findAllByMateriaId(id);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});



module.exports = router;