const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware');
const ForoService = require('../../servicios/foro.servicio');

// @route   POST /api/publicaciones
// @desc    Crear una nueva publicación en el foro de una materia
// @access  Privado
router.post('/', verificarToken, async (req, res) => {
    try {
        const { id_materia, titulo, contenido, categoria, etiquetas } = req.body;
        const publicacionCreada = await ForoService.crearPublicacion({
            id_materia,
            titulo,
            contenido,
            categoria,
            etiquetas,
            id_usuario: req.usuario.id
        });

        return res.status(201).json({
            mensaje: '¡Publicación creada con éxito!',
            publicacion: publicacionCreada
        });
    } catch (error) {
        console.error("Error en el controlador de publicaciones:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al procesar la publicación académica.' 
        });
    }
});

// @route   PUT /api/publicaciones/:id
// @desc    Editar una publicación propia (límite 10 minutos)
// @access  Privado
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, contenido } = req.body;

        const publicacionActualizada = await ForoService.editarPublicacion(id, {
            titulo,
            contenido,
            id_usuario: req.usuario.id
        });

        return res.json({
            mensaje: 'Publicación editada correctamente.',
            publicacion: publicacionActualizada
        });
    } catch (error) {
        console.error("Error al editar publicación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al editar la publicación.' 
        });
    }
});

// @route   DELETE /api/publicaciones/:id
// @desc    Eliminar una publicación propia o por administrador
// @access  Privado
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ForoService.eliminarPublicacion(id, req.usuario.id, req.usuario.id_tipo_usuario);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al eliminar publicación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al eliminar la publicación.' 
        });
    }
});

// @route   POST /api/publicaciones/:id/reaccionar
// @desc    Votar positivo o negativo en una publicación
// @access  Privado
router.post('/:id/reaccionar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body;
        const resultado = await ForoService.reaccionarPublicacion(id, req.usuario.id, tipo);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al reaccionar a publicación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al reaccionar a la publicación.' 
        });
    }
});

// @route   POST /api/publicaciones/comentarios/:id/reaccionar
// @desc    Votar positivo o negativo en un comentario
// @access  Privado
router.post('/comentarios/:id/reaccionar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body;
        const resultado = await ForoService.reaccionarComentario(id, req.usuario.id, tipo);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al reaccionar a comentario:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al reaccionar al comentario.' 
        });
    }
});

// @route   GET /api/publicaciones/guardadas
// @desc    Obtener todas las publicaciones guardadas por el usuario autenticado
// @access  Privado
router.get('/guardadas', verificarToken, async (req, res) => {
    try {
        const publicaciones = await ForoService.obtenerPublicacionesGuardadas(req.usuario.id);
        return res.json(publicaciones);
    } catch (error) {
        console.error("Error al obtener publicaciones guardadas:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al obtener publicaciones guardadas.' 
        });
    }
});

// @route   GET /api/publicaciones/reportes
// @desc    Obtener todos los reportes de publicaciones (solo administradores)
// @access  Privado
router.get('/reportes', verificarToken, async (req, res) => {
    try {
        if (req.usuario.id_tipo_usuario !== 3) {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }

        const reportes = await ForoService.obtenerReportes();
        return res.json(reportes);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error al obtener los reportes de publicaciones.' 
        });
    }
});

// @route   POST /api/publicaciones/:id/reportar
// @desc    Reportar una publicación (guardando el reporte en foro_reportes)
// @access  Privado
router.post('/:id/reportar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;
        const reporte = await ForoService.reportarPublicacion(id, {
            descripcion,
            id_usuario: req.usuario.id
        });
        return res.status(201).json({ mensaje: 'Publicación reportada con éxito.', reporte });
    } catch (error) {
        console.error("Error al reportar publicación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error al procesar el reporte de la publicación.' 
        });
    }
});

// @route   POST /api/publicaciones/reportes/:id/resolver
// @desc    Marcar un reporte como resuelto o pendiente, con soporte para moderación (SCRUM-126)
// @access  Privado (Solo admin)
router.post('/reportes/:id/resolver', verificarToken, async (req, res) => {
    try {
        if (req.usuario.id_tipo_usuario !== 3) {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }

        const { id } = req.params;
        const { accion } = req.body || {};
        const resultado = await ForoService.resolverReporte(id, {
            accion,
            usuario: req.usuario
        });

        return res.json(resultado);
    } catch (error) {
        console.error("Error al resolver/pendiente del reporte:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error al actualizar el estado del reporte.' 
        });
    }
});

// @route   DELETE /api/publicaciones/reportes/:id
// @desc    Eliminar un reporte de la base de datos (Solo admin)
// @access  Privado (Solo admin)
router.delete('/reportes/:id', verificarToken, async (req, res) => {
    try {
        if (req.usuario.id_tipo_usuario !== 3) {
            return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
        }

        const { id } = req.params;
        const resultado = await ForoService.eliminarReporte(id);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al eliminar reporte:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error al eliminar el reporte de auditoría.' 
        });
    }
});

// @route   POST /api/publicaciones/:id/guardar
// @desc    Guardar o desguardar una publicación (toggle)
// @access  Privado
router.post('/:id/guardar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await ForoService.toggleGuardarPublicacion(id, req.usuario.id);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al guardar/desguardar publicación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al guardar/desguardar la publicación.' 
        });
    }
});

// @route   GET /api/publicaciones/etiquetas/populares
// @desc    Obtener 5 etiquetas aleatorias de las 15 más usadas
// @access  Privado
router.get('/etiquetas/populares', verificarToken, async (req, res) => {
    try {
        const selectedTags = await ForoService.obtenerEtiquetasPopulares(5);
        return res.json(selectedTags);
    } catch (error) {
        console.error("Error al obtener etiquetas populares:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error al obtener etiquetas populares.' 
        });
    }
});

// @route   GET /api/publicaciones/:postId
// @desc    Obtener detalle de una publicación con sus comentarios y si está guardada
// @access  Privado
router.get('/:postId', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const resultado = await ForoService.obtenerDetallePublicacion(postId, req.usuario?.id);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al obtener detalle de publicación:", error);
        return res.status(error.status || 500).json({ error: error.message });
    }
});

module.exports = router;
