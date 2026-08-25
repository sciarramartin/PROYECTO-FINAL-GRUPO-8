// controladores/material-calificacion.controlador.js
const express = require('express');
const router = express.Router();
const { MaterialDeEstudioCalificaciones } = require('../modelos/MaterialDeEstudioCalificaciones');
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { obtenerMaterialPorId } = require('../servicios/material.servicio');
const { verificarToken } = require('../middleware/authMiddleware');

/**
 * POST /api/repositorio/:id/calificar
 * Emisión y actualización de calificación (Escenarios 1 y 2).
 */
router.post('/:id/calificar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { puntuacion } = req.body;
        const id_usuario = req.usuario.id;

        const puntuacionNum = parseInt(puntuacion, 10);
        if (isNaN(puntuacionNum) || puntuacionNum < 1 || puntuacionNum > 5) {
            return res.status(400).json({ error: 'La puntuación debe ser un número entero entre 1 y 5.' });
        }

        const material = await obtenerMaterialPorId(id);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado.' });
        }

        // prevención de duplicados (Upsert / Actualización del voto previo)
        let calificacionExistente = await MaterialDeEstudioCalificaciones.findOne({
            where: { id_material: id, id_usuario }
        });

        if (calificacionExistente) {
            calificacionExistente.puntuacion = puntuacionNum;
            await calificacionExistente.save();
        } else {
            await MaterialDeEstudioCalificaciones.create({
                id_material: id,
                id_usuario,
                puntuacion: puntuacionNum
            });
        }

        // recálculo en tiempo real del promedio y total de votos
        const stats = await MaterialDeEstudioCalificaciones.findAll({
            where: { id_material: id },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('puntuacion')), 'promedio'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalVotos']
            ],
            raw: true
        });

        const promedio = parseFloat(stats[0].promedio || 0).toFixed(1);
        const totalVotos = parseInt(stats[0].totalVotos || 0, 10);

        return res.json({
            mensaje: 'Calificación registrada con éxito.',
            id_material: Number(id),
            miCalificacion: puntuacionNum,
            promedio: Number(promedio),
            totalVotos
        });

    } catch (error) {
        console.error("Error al calificar material:", error);
        return res.status(500).json({ error: 'Hubo un error al procesar la calificación del material.' });
    }
});

/**
 * GET /api/repositorio/materia/:idMateria
 * Devuelve los materiales de una materia priorizados por su calificación promedio (Escenario 3).
 */
router.get('/materia/:idMateria', verificarToken, async (req, res) => {
    try {
        const { idMateria } = req.params;

        const materiales = await MaterialDeEstudio.findAll({
            where: { id_materia: idMateria },
            attributes: {
                include: [
                    [
                        Sequelize.fn('COALESCE', Sequelize.fn('AVG', Sequelize.col('calificaciones.puntuacion')), 0),
                        'promedioCalificacion'
                    ],
                    [
                        Sequelize.fn('COUNT', Sequelize.col('calificaciones.id')),
                        'totalVotos'
                    ]
                ]
            },
            include: [
                {
                    model: MaterialDeEstudioCalificaciones,
                    as: 'calificaciones',
                    attributes: []
                }
            ],
            group: ['MaterialDeEstudio.id'],
            order: [[Sequelize.literal('promedioCalificacion'), 'DESC']]
        });

        return res.json(materiales);
    } catch (error) {
        console.error("Error al obtener materiales ordenados por ranking:", error);
        return res.status(500).json({ error: 'Hubo un error al obtener el ranking de materiales.' });
    }
});

module.exports = router;