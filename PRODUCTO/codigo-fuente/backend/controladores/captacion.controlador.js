const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');
const CaptacionService = require('../servicios/captacion.servicio');

// GET /api/captacion - Estadísticas agregadas; sin información personal.
router.get('/', verificarToken, async (req, res) => {
  try {
    return res.json(await CaptacionService.obtenerResumen(req.usuario.id));
  } catch (error) {
    console.error('Error al consultar captación institucional:', error);
    return res.status(500).json({ error: 'No se pudo consultar la captación institucional.' });
  }
});

// POST /api/captacion/referencias - Solo administradores.
// Se verifica rol de JWT (middleware) y además el rol vigente en la base (servicio).
router.post('/referencias', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const referencia = await CaptacionService.registrarReferencia(req.body, req.usuario.id);
    return res.status(201).json(referencia);
  } catch (error) {
    if (error.status && error.status < 500) return res.status(error.status).json({ error: error.message });
    console.error('Error al guardar matrícula de referencia:', error);
    return res.status(500).json({ error: 'No se pudo registrar la matrícula de referencia.' });
  }
});

module.exports = router;
