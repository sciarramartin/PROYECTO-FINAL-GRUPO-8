const ActividadFlexibleService = require('../servicios/actividades-flexibles.service');
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');

// 1. GET: Obtener todas las actividades flexibles del alumno logueado
router.get("/", verificarToken, async (req, res) => {
    try {
        // req.usuario.id lo inyecta automáticamente el middleware verificarToken
        const registros = await ActividadFlexibleService.findAllByUserId(req.usuario.id);
        console.log("Actividades flexibles encontradas:", registros);
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener las actividades flexibles.' });
    }
});

// 2. POST: Registrar una nueva actividad flexible (Botón del sector derecho)
router.post("/", verificarToken, async (req, res) => {
    try {
        // Tu servicio espera actividadData (req.body) e idUsuario por separado
        const nuevoRegistro = await ActividadFlexibleService.registrarActividadFlexible(req.body, req.usuario.id);
        
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        console.error("Error al crear actividad flexible:", error);
        // Si el servicio tira un throw Error por validaciones, devolvemos un 400 (Bad Request)
        res.status(400).json({ error: error.message });
    }
});

// 3. PUT: Actualizar una actividad flexible por su ID
router.put("/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Pasamos idUsuario, id de la actividad y el body con las modificaciones
        const actividadActualizada = await ActividadFlexibleService.update(req.usuario.id, id, req.body);
        
        res.json(actividadActualizada);
    } catch (error) {
        console.error("Error al actualizar actividad flexible:", error);
        // Si no se encuentra la actividad o no pertenece al usuario, capturamos el mensaje del throw
        if (error.message === 'Actividad flexible no encontrada') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar una actividad flexible (Tachito de basura)
router.delete("/:id", verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await ActividadFlexibleService.deleteById(id, req.usuario.id);
        
        res.json(resultado);
    } catch (error) {
        console.error("Error al eliminar actividad flexible:", error);
        if (error.message === 'Actividad flexible no encontrada') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'no permitido') {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta actividad.' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;