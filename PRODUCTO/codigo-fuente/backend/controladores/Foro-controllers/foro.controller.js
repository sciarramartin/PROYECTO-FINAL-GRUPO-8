const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware');
const { Materia } = require('../../modelos/materia.modelo');
const { ForoPublicacion } = require('../../modelos/ForoPublicacion');
const { ForoComentario } = require('../../modelos/ForoComentario');
const { Usuario } = require('../../modelos/Usuario');
const { Perfil } = require('../../modelos/Perfil');
const { ForoPublicacionGuardada } = require('../../modelos/ForoPublicacionGuardada');
const { ForoEtiqueta } = require('../../modelos/ForoEtiqueta');

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
                },
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ],
            order: orderCondition
        });
        // Formatear con la cantidad de comentarios para cada publicación y si está guardada
        const publicacionesConComentarios = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });

            const guardada = await ForoPublicacionGuardada.findOne({
                where: { id_usuario: req.usuario.id, id_publicacion: pub.id }
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
                cantComentarios,
                esGuardada: !!guardada,
                Etiquetas: pub.Etiquetas || []
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

// GET /api/foro/materias/:materiaId/etiquetas - Obtener todas las etiquetas únicas de las publicaciones de una materia
router.get('/materias/:materiaId/etiquetas', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const Sequelize = require('sequelize');
        
        const etiquetas = await ForoEtiqueta.findAll({
            include: [
                {
                    model: ForoPublicacion,
                    where: { id_materia: materiaId },
                    attributes: []
                }
            ],
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('ForoEtiqueta.nombre')), 'nombre']
            ],
            raw: true
        });

        const listaNombres = etiquetas.map(e => e.nombre).filter(Boolean);
        res.json(listaNombres);
    } catch (error) {
        console.error('Error al obtener etiquetas de la materia:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener etiquetas' });
    }
});

// GET /api/foro/materias/:materiaId/mis-aportes - Obtener aportes (publicaciones y comentarios) del usuario actual
router.get('/materias/:materiaId/mis-aportes', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const id_usuario = req.usuario.id;

        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        // 1. Obtener publicaciones creadas por el usuario en esta materia
        const publicaciones = await ForoPublicacion.findAll({
            where: { id_materia: materiaId, id_usuario: id_usuario },
            include: [
                {
                    model: Usuario,
                    as: 'Autor',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    include: [
                        {
                            model: Perfil,
                            attributes: ['foto_perfil']
                        }
                    ]
                },
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const publicacionesConDetalle = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });
            const guardada = await ForoPublicacionGuardada.findOne({
                where: { id_usuario, id_publicacion: pub.id }
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
                cantComentarios,
                esGuardada: !!guardada,
                Etiquetas: pub.Etiquetas || []
            };
        }));

        // 2. Obtener comentarios creados por el usuario en publicaciones de esta materia
        const comentarios = await ForoComentario.findAll({
            where: { id_usuario: id_usuario },
            include: [
                {
                    model: ForoPublicacion,
                    where: { id_materia: materiaId },
                    attributes: ['id', 'titulo', 'id_materia'],
                    include: [
                        {
                            model: Usuario,
                            as: 'Autor',
                            attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            publicaciones: publicacionesConDetalle,
            comentarios
        });
    } catch (error) {
        console.error('Error al obtener mis aportes del foro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/foro/feed - Obtener un feed paginado de todas las materias ordenado por relevancia (votos, luego fecha)
router.get('/feed', verificarToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const { count, rows: publicaciones } = await ForoPublicacion.findAndCountAll({
            limit,
            offset,
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
            ],
            order: [['votos', 'DESC'], ['createdAt', 'DESC']]
        });

        // Formatear con la cantidad de comentarios y si está guardada para el usuario actual
        const publicacionesConStats = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });

            const guardada = await ForoPublicacionGuardada.findOne({
                where: { id_usuario: req.usuario.id, id_publicacion: pub.id }
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
                Materia: pub.Materia,
                cantComentarios,
                esGuardada: !!guardada
            };
        }));

        res.json({
            total: count,
            publicaciones: publicacionesConStats,
            hasMore: offset + limit < count
        });
    } catch (error) {
        console.error('Error al obtener feed del foro:', error);
        res.status(500).json({ error: 'Error interno al obtener el feed del foro.' });
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

        const guardada = await ForoPublicacionGuardada.findOne({
            where: { id_usuario: req.usuario.id, id_publicacion: postId }
        });

        const pubJson = publicacion.toJSON();
        pubJson.esGuardada = !!guardada;

        res.json({
            publicacion: pubJson,
            comentarios
        });
    } catch (error) {
        console.error('Error al obtener detalle de la publicación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
