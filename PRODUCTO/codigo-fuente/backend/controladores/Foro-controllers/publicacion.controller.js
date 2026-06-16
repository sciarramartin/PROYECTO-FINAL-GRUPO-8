const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware'); 
const { ForoPublicacion, ForoComentario, ForoReaccion, Usuario, Materia } = require('../../modelos/asociaciones');

// @route   POST /api/publicaciones
// @desc    Crear una nueva publicación en el foro de una materia
// @access  Privado
router.post('/', verificarToken, async (req, res) => {
    try {
        const { id_materia, titulo, contenido, categoria } = req.body;
        if (!titulo || titulo.trim() === "") {
            return res.status(400).json({ 
                error: 'El sistema requiere un título obligatorio para continuar.' 
            });
        }
        if (!contenido || contenido.trim() === "") {
            return res.status(400).json({ 
                error: 'El cuerpo del contenido no puede estar vacío.' 
            });
        }
        if (!id_materia) {
            return res.status(400).json({ 
                error: 'Error: La materia debe asociarse automáticamente.' 
            });
        }
        const nuevaPublicacion = await ForoPublicacion.create({
            id_materia: Number(id_materia),
            id_usuario: req.usuario.id, // 🔒 Extraído del JWT por el middleware de seguridad
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            categoria: categoria || 'General',
            votos: 0
        });

        return res.status(201).json({
            mensaje: '¡Publicación creada con éxito!',
            publicacion: nuevaPublicacion
        });

    } catch (error) {
        console.error("Error en el controlador de publicaciones:", error);
        return res.status(500).json({ 
            error: 'Error interno del servidor al procesar la publicación académica.' 
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
        
        const publicacion = await ForoPublicacion.findByPk(id);
        
        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }
        
        if (publicacion.id_usuario !== req.usuario.id) {
            return res.status(403).json({ error: 'No tienes permiso para editar esta publicación.' });
        }

        // Validación de tiempo: máximo 10 minutos
        const fechaCreacion = new Date(publicacion.createdAt);
        const ahora = new Date();
        const diferenciaMinutos = (ahora - fechaCreacion) / (1000 * 60);

        if (diferenciaMinutos > 10) {
            return res.status(403).json({ error: 'El tiempo límite de 10 minutos para editar esta publicación ha expirado.' });
        }

        if (!titulo || titulo.trim() === "") {
            return res.status(400).json({ error: 'El título es obligatorio.' });
        }
        if (!contenido || contenido.trim() === "") {
            return res.status(400).json({ error: 'El contenido es obligatorio.' });
        }

        publicacion.titulo = titulo.trim();
        publicacion.contenido = contenido.trim();
        await publicacion.save();

        return res.json({
            mensaje: 'Publicación editada correctamente.',
            publicacion
        });

    } catch (error) {
        console.error("Error al editar publicación:", error);
        return res.status(500).json({ error: 'Error interno del servidor al editar la publicación.' });
    }
});

// @route   DELETE /api/publicaciones/:id
// @desc    Eliminar una publicación propia
// @access  Privado
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const publicacion = await ForoPublicacion.findByPk(id);
        
        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }
        
        if (publicacion.id_usuario !== req.usuario.id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta publicación.' });
        }

        await publicacion.destroy(); // Baja lógica: paranoid: true en el modelo setea deletedAt

        return res.json({ mensaje: 'Publicación eliminada correctamente.' });

    } catch (error) {
        console.error("Error al eliminar publicación:", error);
        return res.status(500).json({ error: 'Error interno del servidor al eliminar la publicación.' });
    }
});

// @route   POST /api/publicaciones/:id/reaccionar
// @desc    Votar positivo o negativo en una publicación
// @access  Privado
router.post('/:id/reaccionar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body; // 'positivo' o 'negativo'
        const id_usuario = req.usuario.id;

        if (tipo !== 'positivo' && tipo !== 'negativo') {
            return res.status(400).json({ error: 'Tipo de reacción inválido.' });
        }

        const publicacion = await ForoPublicacion.findByPk(id);
        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada.' });
        }

        const reaccionExistente = await ForoReaccion.findOne({
            where: { id_publicacion: id, id_usuario }
        });

        if (reaccionExistente) {
            if (reaccionExistente.tipo === tipo) {
                // Si hace click en el mismo voto, lo deshace (toggle)
                await reaccionExistente.destroy();
                publicacion.votos = tipo === 'positivo' ? publicacion.votos - 1 : publicacion.votos + 1;
                await publicacion.save();
                return res.json({ mensaje: 'Reacción removida', votos: publicacion.votos, reaccion: null });
            } else {
                // Cambia de positivo a negativo o viceversa (cambia el voto de 1 a -1 o viceversa, total dif es 2)
                const ajuste = tipo === 'positivo' ? 2 : -2;
                reaccionExistente.tipo = tipo;
                await reaccionExistente.save();
                
                publicacion.votos = publicacion.votos + ajuste;
                await publicacion.save();
                return res.json({ mensaje: 'Reacción actualizada', votos: publicacion.votos, reaccion: reaccionExistente });
            }
        } else {
            // Nueva reacción
            const nuevaReaccion = await ForoReaccion.create({
                id_publicacion: id,
                id_usuario,
                tipo
            });
            
            const ajuste = tipo === 'positivo' ? 1 : -1;
            publicacion.votos = publicacion.votos + ajuste;
            await publicacion.save();
            return res.json({ mensaje: 'Reacción agregada', votos: publicacion.votos, reaccion: nuevaReaccion });
        }

    } catch (error) {
        console.error("Error al reaccionar a publicación:", error);
        return res.status(500).json({ error: 'Error interno del servidor al reaccionar a la publicación.' });
    }
});

// @route   POST /api/publicaciones/comentarios/:id/reaccionar
// @desc    Votar positivo o negativo en un comentario
// @access  Privado
router.post('/comentarios/:id/reaccionar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body; // 'positivo' o 'negativo'
        const id_usuario = req.usuario.id;

        if (tipo !== 'positivo' && tipo !== 'negativo') {
            return res.status(400).json({ error: 'Tipo de reacción inválido.' });
        }

        const comentario = await ForoComentario.findByPk(id);
        if (!comentario) {
            return res.status(404).json({ error: 'Comentario no encontrado.' });
        }

        const reaccionExistente = await ForoReaccion.findOne({
            where: { id_comentario: id, id_usuario }
        });

        if (reaccionExistente) {
            if (reaccionExistente.tipo === tipo) {
                // Si hace click en el mismo voto, lo deshace (toggle)
                await reaccionExistente.destroy();
                comentario.votos = tipo === 'positivo' ? comentario.votos - 1 : comentario.votos + 1;
                await comentario.save();
                return res.json({ mensaje: 'Reacción removida', votos: comentario.votos, reaccion: null });
            } else {
                // Cambia de positivo a negativo o viceversa (cambia el voto de 1 a -1 o viceversa, total dif es 2)
                const ajuste = tipo === 'positivo' ? 2 : -2;
                reaccionExistente.tipo = tipo;
                await reaccionExistente.save();
                
                comentario.votos = comentario.votos + ajuste;
                await comentario.save();
                return res.json({ mensaje: 'Reacción actualizada', votos: comentario.votos, reaccion: reaccionExistente });
            }
        } else {
            // Nueva reacción
            const nuevaReaccion = await ForoReaccion.create({
                id_comentario: id,
                id_usuario,
                tipo
            });
            
            const ajuste = tipo === 'positivo' ? 1 : -1;
            comentario.votos = comentario.votos + ajuste;
            await comentario.save();
            return res.json({ mensaje: 'Reacción agregada', votos: comentario.votos, reaccion: nuevaReaccion });
        }

    } catch (error) {
        console.error("Error al reaccionar a comentario:", error);
        return res.status(500).json({ error: 'Error interno del servidor al reaccionar al comentario.' });
    }
});

router.get('/:postId', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;
        
        // Buscamos solo el registro plano sin ninguna clase de includes o mapeos externos
        const publicacion = await ForoPublicacion.findByPk(postId);
        
        if (!publicacion) {
            return res.status(404).json({ error: 'No encontrado' });
        }

        const comentariosGuardados = await ForoComentario.findAll({
            where: { id_publicacion: postId }
        });
        
        return res.json({
            publicacion,
            comentarios: comentariosGuardados
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;