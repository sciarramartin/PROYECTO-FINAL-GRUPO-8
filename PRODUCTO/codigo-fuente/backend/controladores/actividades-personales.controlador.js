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
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al crear el registro.' });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const datosActualizados = req.body;
        
        const actividadActualizada = await Actividad.updateById(id, datosActualizados);
        
        if (!actividadActualizada) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }
        
        res.json(actividadActualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al actualizar el registro.' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const actividadEliminada = await Actividad.deleteById(id);
        
        if (!actividadEliminada) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }
        
        res.json({ message: 'Registro eliminado correctamente.', actividad: actividadEliminada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al eliminar el registro.' });
    }
});


module.exports = router;