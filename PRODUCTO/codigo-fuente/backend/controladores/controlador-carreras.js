// controladores/controlador-carreras.js
const express = require('express');
const router = express.Router();
const { Carrera } = require('../modelos/Carrera');

// Definimos la ruta POST directamente sobre el router
router.get('/', async (req, res) => {
    try {
        const carreras = await Carrera.findAll();
        res.json(carreras);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener carreras.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nombre, facultad } = req.body;

        if (!nombre || !facultad) {
            return res.status(400).json({ 
                mensaje: 'El nombre y la facultad son obligatorios.' 
            });
        }

        const nuevaCarrera = await Carrera.create({ nombre, facultad });
        
        return res.status(201).json({
            mensaje: 'Carrera creada con éxito.',
            carrera: nuevaCarrera
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ mensaje: 'Esa carrera ya está registrada.' });
        }
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// GET /api/carreras
router.get('/', async (req, res) => {
    try {
        const carreras = await Carrera.findAll();
        return res.status(200).json(carreras);
    } catch (error) {
        console.error("Error al obtener carreras:", error);
        return res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// CRUCIAL: Exportamos el router completo, que es lo que espera tu servidor.js
module.exports = router;