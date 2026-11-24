// controladores/metricasGlobales.controlador.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const {
    obtenerDashboardMetricasGlobales
} = require('../servicios/metricasGlobales.servicio');

/**
 * GET /api/metricas-globales
 * Devuelve el resumen global de tráfico, almacenamiento en repositorio,
 * descargas acumuladas, actividad en foros y consultas resueltas por IA.
 * Restringido exclusivamente a Administradores (rol 3).
 */
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const mesesAtras = req.query.meses ? parseInt(req.query.meses, 10) : 12;
        const datos = await obtenerDashboardMetricasGlobales({ mesesAtras });
        return res.status(200).json(datos);
    } catch (error) {
        console.error('❌ Error en GET /api/metricas-globales:', error);
        return res.status(500).json({
            success: false,
            error: 'Ocurrió un error al calcular las métricas globales de la plataforma.',
            detalle: error.message
        });
    }
});

/**
 * GET /api/metricas-globales/resumen-rapido
 * Endpoint ligero para tarjetas de resumen
 */
router.get('/resumen-rapido', verificarToken, verificarAdmin, async (req, res) => {
    try {
        const datos = await obtenerDashboardMetricasGlobales({ mesesAtras: 1 });
        return res.status(200).json({
            success: true,
            resumen: datos.resumen
        });
    } catch (error) {
        console.error('❌ Error en GET /api/metricas-globales/resumen-rapido:', error);
        return res.status(500).json({
            success: false,
            error: 'Error al obtener resumen de métricas.'
        });
    }
});

module.exports = router;
