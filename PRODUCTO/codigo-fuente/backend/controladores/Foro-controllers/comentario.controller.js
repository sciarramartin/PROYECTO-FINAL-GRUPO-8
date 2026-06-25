const express = require('express');
const router = express.Router();
const { ForoComentario, Usuario, ForoReporte, ForoPublicacion } = require('../../modelos/asociaciones');

// Middleware para verificar autenticación (asumo que usan uno similar en el grupo)
// Si su middleware se llama distinto, adaptalo (ej. verificarToken)
const { verificarToken } = require('../../middleware/authMiddleware'); 

// 1. CREAR UN COMENTARIO O RESPUESTA
router.post('/', verificarToken, async (req, res) => {
    try {
        const { contenido, id_publicacion, id_comentario_padre} = req.body;

        if (!contenido || contenido.trim() === "") {
            return res.status(400).json({ error: "El comentario no puede estar vacío" });
        }

        console.log(`[Backend] Intentando guardar comentario para publicación ID: ${id_publicacion}`);
        const nuevoComentario = await ForoComentario.create({
            id_publicacion: Number(id_publicacion),
            contenido: contenido.trim(),
            id_usuario: req.usuario?.id || req.user?.id || 1,
            // 🎯 Guardamos de verdad el id del padre en la base de datos
            id_comentario_padre: id_comentario_padre ? Number(id_comentario_padre) : null 
        });

        const comentarioJson = nuevoComentario.toJSON();

        // Estructura para el frontend
        comentarioJson.Autor = {
            id: req.usuario?.id || req.user?.id || 1,
            nombre: req.usuario?.nombre || "Usuario",
            apellido: req.usuario?.apellido || "Estudiante",
            Perfil: { foto_perfil: null }
        };

        return res.status(201).json({
            mensaje: '¡Comentario publicado con éxito!',
            comentario: comentarioJson
        });
    } catch (error) {
        console.error("Error al crear comentario:", error);
        return res.status(500).json({ 
            error: 'Error interno del servidor al procesar el comentario.',
            detalle: error.message 
        });
    }
});

// 2. EDITAR UN COMENTARIO (Máximo 10 minutos)
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;
        //const id_usuario_actual = req.usuario?.id || 1;

        if (!contenido || contenido.trim() === "") {
            return res.status(400).json({ error: "El comentario no puede estar vacío" });
        }

        const comentario = await ForoComentario.findByPk(id);

        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        // Regla de negocio: Tiempo límite de 10 minutos
        const ahora = new Date();
        const fechaCreacion = new Date(comentario.createdAt);
        const diferenciaMinutos = (ahora - fechaCreacion) / 1000 / 60;

        if (diferenciaMinutos > 10) {
            return res.status(403).json({ error: "Ya pasaron los 10 minutos permitidos para editar este comentario" });
        }

        comentario.contenido = contenido;
        await comentario.save();

        res.json({ mensaje: "Comentario modificado con éxito", comentario });
    } catch (error) {
        console.error("Error al editar comentario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// @route   POST /api/foro/comentarios/:id/reportar
// @desc    Reportar un comentario
// @access  Privado
router.post('/:id/reportar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion } = req.body;
        const id_usuario_reportador = req.usuario.id;

        if (!descripcion || !descripcion.trim()) {
            return res.status(400).json({ error: 'La descripción del reporte es obligatoria.' });
        }

        if (descripcion.trim().length < 5) {
            return res.status(400).json({ error: 'El motivo del reporte debe tener al menos 5 caracteres.' });
        }

        const comentario = await ForoComentario.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentario no encontrado.' });
        }

        const reporte = await ForoReporte.create({
            id_usuario_reportador,
            id_publicacion: comentario.id_publicacion,
            id_comentario: id,
            descripcion: descripcion.trim()
        });

        return res.status(201).json({ mensaje: 'Comentario reportado con éxito.', reporte });
    } catch (error) {
        console.error("Error al reportar comentario:", error);
        return res.status(500).json({ error: 'Error al procesar el reporte del comentario.' });
    }
});

// 4. ELIMINAR UN COMENTARIO
// @route   DELETE /api/foro/comentarios/:id
// @desc    Eliminar un comentario (permitido al autor del comentario o al autor de la publicación)
// @access  Privado
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const id_usuario_actual = req.usuario?.id || req.user?.id;

        const comentario = await ForoComentario.findByPk(id, {
            include: [{ model: ForoPublicacion }]
        });

        if (!comentario) {
            return res.status(404).json({ error: "Comentario no encontrado" });
        }

        // Regla de permisos:
        // - El usuario es el creador del comentario.
        // - O el usuario es el creador de la publicación donde está el comentario.
        const esAutorComentario = comentario.id_usuario === id_usuario_actual;
        const esAutorPublicacion = comentario.ForoPublicacion && comentario.ForoPublicacion.id_usuario === id_usuario_actual;

        if (!esAutorComentario && !esAutorPublicacion) {
            return res.status(403).json({ error: "No tienes permisos para eliminar este comentario" });
        }

        // Eliminar físicamente el comentario de la base de datos
        await comentario.destroy();

        return res.json({ mensaje: "Comentario eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        return res.status(500).json({ error: "Error interno del servidor al eliminar el comentario" });
    }
});

module.exports = router;