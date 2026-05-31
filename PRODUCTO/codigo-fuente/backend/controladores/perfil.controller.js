// controladores/perfil.controller.js
const express = require('express');
const router = express.Router();
const perfilService = require('../servicios/perfil.service');
const { verificarToken } = require('../middleware/authMiddleware');

// 1. GET /api/perfiles/mi-perfil
// Obtener el perfil propio del usuario autenticado
router.get('/mi-perfil', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const perfilCompleto = await perfilService.obtenerOcrearPerfil(idUsuario);
        return res.status(200).json(perfilCompleto);
    } catch (error) {
        console.error('Error al obtener perfil propio:', error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al obtener el perfil.' });
    }
});

// 2. PUT /api/perfiles/mi-perfil
// Actualizar el perfil propio del usuario autenticado
router.put('/mi-perfil', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const datosActualizados = await perfilService.actualizarPerfil(idUsuario, req.body);
        return res.status(200).json({
            mensaje: 'Perfil académico actualizado correctamente.',
            datos: datosActualizados
        });
    } catch (error) {
        console.error('Error al actualizar perfil propio:', error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al actualizar el perfil.' });
    }
});

// 3. GET /api/perfiles/:id
// Obtener el perfil público de otro estudiante (respetando sus filtros de privacidad)
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const idUsuarioDestino = req.params.id;
        const idUsuarioActual = req.usuario.id;
        
        const perfilPublico = await perfilService.obtenerPerfilPublico(idUsuarioDestino, idUsuarioActual);
        return res.status(200).json(perfilPublico);
    } catch (error) {
        console.error('Error al obtener perfil público:', error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al obtener el perfil de este estudiante.' });
    }
});

module.exports = router;
