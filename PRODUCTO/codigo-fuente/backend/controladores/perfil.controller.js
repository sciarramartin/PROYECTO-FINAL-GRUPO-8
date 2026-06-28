// controladores/perfil.controller.js
const express = require('express');
const router = express.Router();
const perfilService = require('../servicios/perfil.service');
const { verificarToken } = require('../middleware/authMiddleware');
const { Usuario, ForoPublicacion, ForoComentario, Materia } = require('../modelos/asociaciones');


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

// 4. GET /api/perfiles/:id/foro-actividad
// Obtener las publicaciones y comentarios en foros hechos por el usuario
router.get('/:id/foro-actividad', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuario = id === 'mi-perfil' ? req.usuario.id : Number(id);

        // Validar que el usuario exista
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Obtener publicaciones del usuario
        const publicaciones = await ForoPublicacion.findAll({
            where: { id_usuario: idUsuario },
            include: [
                {
                    model: Materia,
                    attributes: ['id', 'nombre', 'codigo']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Obtener comentarios del usuario
        const comentarios = await ForoComentario.findAll({
            where: { id_usuario: idUsuario },
            include: [
                {
                    model: ForoPublicacion,
                    required: true, // Excluye comentarios de publicaciones que fueron eliminadas
                    attributes: ['id', 'titulo', 'id_materia'],
                    include: [
                        {
                            model: Materia,
                            attributes: ['id', 'nombre', 'codigo']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            publicaciones,
            comentarios
        });
    } catch (error) {
        console.error('Error al obtener la actividad de foro del usuario:', error);
        return res.status(500).json({ error: 'Error al obtener la actividad del foro.' });
    }
});

module.exports = router;
