const Actividad = require('../servicios/actividades-personales.service');
const express = require('express');
const router = express.Router();


router.get("/:idUsuario", async (req, res) => {
    try {
        const registros = await Actividad.findAllByUserId(req.params.idUsuario);
        console.log("Registros encontrados:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
});

router.post("/", async (req, res) => {
    try {
        const nuevoRegistro = await Actividad.create(req.body);
        
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al crear el registro.' });
    }
});


module.exports = router;