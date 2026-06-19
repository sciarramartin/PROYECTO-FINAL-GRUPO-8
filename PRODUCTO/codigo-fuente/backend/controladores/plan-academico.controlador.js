const { PlanAcademico } = require('../modelos/PlanAcademico');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { id_carrera } = req.query;
        const whereClause = id_carrera ? { id_carrera } : {};
        const planes = await PlanAcademico.findAll({ where: whereClause });
        res.json(planes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener los planes académicos.' });
    }
});

router.post('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const { nombre, id_carrera } = req.body;
        if (!nombre || !id_carrera) {
            return res.status(400).json({ error: 'El nombre y la carrera son obligatorios.' });
        }
        const nuevoPlan = await PlanAcademico.create({ nombre, id_carrera });
        res.status(201).json(nuevoPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al crear el plan académico.' });
    }
});

module.exports = router;
