// controladores/metricasMaterialEstudio.controlador.js

const express = require('express');
const router = express.Router();

const {
    obtenerDashboardMaterialEstudio
} = require('../servicios/metricasMaterialEstudio.servicio.js');

router.get('/', async (req, res) => {
    try {

        const datos =
            await obtenerDashboardMaterialEstudio();

        return res.json(datos);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: 'Error al obtener métricas'
        });
    }
});

module.exports = router;