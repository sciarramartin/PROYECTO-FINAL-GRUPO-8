const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware');
const ForoService = require('../../servicios/foro.servicio');

// 1. CREAR UN COMENTARIO O RESPUESTA
router.post('/', verificarToken, async (req, res) => {
    try {
        const { contenido, id_publicacion, id_comentario_padre } = req.body;
        const comentarioJson = await ForoService.crearComentario({
            contenido,
            id_publicacion,
            id_comentario_padre,
            id_usuario: req.usuario?.id || req.user?.id || 1,
            usuarioInfo: req.usuario || req.user
        });

        return res.status(201).json({
            mensaje: '¡Comentario publicado con éxito!',
            comentario: comentarioJson
        });
    } catch (error) {
        console.error("Error al crear comentario:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno del servidor al procesar el comentario.' 
        });
    }
});

// 2. EDITAR UN COMENTARIO (Máximo 10 minutos)
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;

        const comentario = await ForoService.editarComentario(id, {
            contenido,
            id_usuario: req.usuario?.id || req.user?.id
        });

        res.json({ mensaje: "Comentario modificado con éxito", comentario });
    } catch (error) {
        console.error("Error al editar comentario:", error);
        res.status(error.status || 500).json({ error: error.message || "Error interno del servidor" });
    }
});

// 3. REPORTAR UN COMENTARIO
// @route   POST /api/foro/comentarios/:id/reportar
// @desc    Reportar un comentario
// @access  Privado
router.post('/:id/reportar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;
        const id_usuario_reportador = req.usuario.id;

        const reporte = await ForoService.reportarComentario(id, {
            descripcion,
            id_usuario: id_usuario_reportador
        });

        return res.status(201).json({ mensaje: 'Comentario reportado con éxito.', reporte });
    } catch (error) {
        console.error("Error al reportar comentario:", error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al procesar el reporte del comentario.' });
    }
});

// 4. ELIMINAR UN COMENTARIO
// @route   DELETE /api/foro/comentarios/:id
// @desc    Eliminar un comentario (permitido al autor del comentario, autor de publicación o admin)
// @access  Privado
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario_actual = req.usuario?.id || req.user?.id;
        const rol = req.usuario?.id_tipo_usuario;

        const resultado = await ForoService.eliminarComentario(id, id_usuario_actual, rol);
        return res.json(resultado);
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        return res.status(error.status || 500).json({ error: error.message || "Error interno del servidor al eliminar el comentario" });
    }
});

module.exports = router;
