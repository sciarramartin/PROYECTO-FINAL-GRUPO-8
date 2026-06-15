const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware'); 
//const { ForoPublicacion } = require('../../modelos/ForoPublicacion'); 

const { ForoPublicacion, ForoComentario, Usuario, Materia } = require('../../modelos/asociaciones'); 

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
// aca tiene que ir el delete y put

module.exports = router;