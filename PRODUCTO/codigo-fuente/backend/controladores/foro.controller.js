const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { Materia } = require('../modelos/materia.modelo');
const { ForoPublicacion } = require('../modelos/ForoPublicacion');
const { ForoComentario } = require('../modelos/ForoComentario');
const { Usuario } = require('../modelos/Usuario');
const { Perfil } = require('../modelos/Perfil');

// GET /api/foro/materias - Obtener todas las materias y estadísticas de sus foros
router.get('/materias', verificarToken, async (req, res) => {
    try {
        const materias = await Materia.findAll();
        
        // Formatear estadísticas para cada materia
        const materiasConForos = await Promise.all(materias.map(async (materia) => {
            const cantPublicaciones = await ForoPublicacion.count({
                where: { id_materia: materia.id }
            });

            return {
                id: materia.id,
                codigo: materia.codigo,
                nombre: materia.nombre,
                nivel_anio: materia.nivel_anio,
                cuatrimestre: materia.cuatrimestre,
                cantPublicaciones
            };
        }));

        res.json(materiasConForos);
    } catch (error) {
        console.error('Error al obtener foros de materias:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/foro/materias/:materiaId/publicaciones - Obtener publicaciones de un foro específico
router.get('/materias/:materiaId/publicaciones', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const { orden } = req.query;

        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        // Configurar orden principal y secundario
        let orderCondition;
        switch (orden) {
            case 'votos':
                // Si hay empate en votos, mostrar las más recientes primero
                orderCondition = [['votos', 'DESC'], ['createdAt', 'DESC']];
                break;
            case 'reciente':
                orderCondition = [['createdAt', 'DESC']];
                break;
            default:
                orderCondition = [['createdAt', 'DESC']];
                break;
        }

        const publicaciones = await ForoPublicacion.findAll({
            where: { id_materia: materiaId },
            include: [
                {
                    model: Usuario,
                    as: 'Autor',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'id_tipo_usuario'],
                    include: [
                        {
                            model: Perfil,
                            attributes: ['foto_perfil']
                        }
                    ]
                }
            ],
            order: orderCondition
        });
        // Formatear con la cantidad de comentarios para cada publicación
        const publicacionesConComentarios = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });

            return {
                id: pub.id,
                titulo: pub.titulo,
                contenido: pub.contenido,
                categoria: pub.categoria,
                votos: pub.votos,
                createdAt: pub.createdAt,
                updatedAt: pub.updatedAt,
                id_materia: pub.id_materia,
                Autor: pub.Autor,
                cantComentarios
            };
        }));

        res.json({
            materia: {
                id: materia.id,
                nombre: materia.nombre,
                codigo: materia.codigo
            },
            publicaciones: publicacionesConComentarios
        });
    } catch (error) {
        console.error('Error al obtener publicaciones del foro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/foro/publicaciones/:postId - Obtener detalle completo de una publicación y sus comentarios
router.get('/publicaciones/:postId', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;

        const publicacion = await ForoPublicacion.findByPk(postId, {
            include: [
                {
                    model: Usuario,
                    as: 'Autor',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'id_tipo_usuario'],
                    include: [
                        {
                            model: Perfil,
                            attributes: ['foto_perfil']
                        }
                    ]
                },
                {
                    model: Materia,
                    attributes: ['id', 'nombre', 'codigo']
                }
            ]
        });

        if (!publicacion) {
            return res.status(404).json({ error: 'Publicación no encontrada' });
        }

        const comentarios = await ForoComentario.findAll({
            where: { id_publicacion: postId },
            include: [
                {
                    model: Usuario,
                    as: 'Autor',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'id_tipo_usuario'],
                    include: [
                        {
                            model: Perfil,
                            attributes: ['foto_perfil']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json({
            publicacion,
            comentarios
        });
    } catch (error) {
        console.error('Error al obtener detalle de la publicación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
