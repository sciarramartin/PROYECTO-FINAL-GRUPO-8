const express = require('express');
const router = express.Router();
//const { ForoComentario, Usuario } = require('../../modelos/asociaciones');
const { Usuario } = require('../../modelos/Usuario');
const { ForoComentario } = require('../../modelos/ForoComentario');

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

module.exports = router;