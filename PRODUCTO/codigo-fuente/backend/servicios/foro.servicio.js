// servicios/foro.servicio.js
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { 
    ForoPublicacion, 
    ForoComentario, 
    ForoReaccion, 
    Usuario, 
    Materia, 
    ForoPublicacionGuardada, 
    Perfil, 
    ForoReporte, 
    ForoEtiqueta 
} = require('../modelos/asociaciones');

class ForoService {

    /**
     * Obtener todas las materias y estadísticas de publicaciones
     */
    static async obtenerForosMaterias() {
        const materias = await Materia.findAll();

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

        return materiasConForos;
    }

    /**
     * Obtener publicaciones de un foro de materia específico
     */
    static async obtenerPublicacionesMateria(materiaId, { orden, usuarioId }) {
        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            const error = new Error('Materia no encontrada');
            error.status = 404;
            throw error;
        }

        let orderCondition;
        switch (orden) {
            case 'votos':
                orderCondition = [['votos', 'DESC'], ['createdAt', 'DESC']];
                break;
            case 'reciente':
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

        const publicacionesConComentarios = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });

            const guardada = usuarioId ? await ForoPublicacionGuardada.findOne({
                where: { id_usuario: usuarioId, id_publicacion: pub.id }
            }) : null;

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

        return {
            materia: {
                id: materia.id,
                nombre: materia.nombre,
                codigo: materia.codigo
            },
            publicaciones: publicacionesConComentarios
        };
    }

    /**
     * Obtener etiquetas únicas de una materia
     */
    static async obtenerEtiquetasMateria(materiaId) {
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

        return etiquetas.map(e => e.nombre).filter(Boolean);
    }

    /**
     * Obtener aportes (publicaciones y comentarios) de un usuario en una materia
     */
    static async obtenerMisAportes(materiaId, usuarioId) {
        const materia = await Materia.findByPk(materiaId);
        if (!materia) {
            const error = new Error('Materia no encontrada');
            error.status = 404;
            throw error;
        }

        const publicaciones = await ForoPublicacion.findAll({
            where: { id_materia: materiaId, id_usuario: usuarioId },
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
                where: { id_usuario: usuarioId, id_publicacion: pub.id }
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

        const comentarios = await ForoComentario.findAll({
            where: { id_usuario: usuarioId },
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

        return {
            publicaciones: publicacionesConDetalle,
            comentarios
        };
    }

    /**
     * Obtener feed paginado de publicaciones con filtros
     */
    static async obtenerFeed({ categoria, orden, busqueda, id_materia, limit = 10, offset = 0, usuarioId }) {
        const whereClause = {};
        if (categoria && categoria !== 'Todas' && categoria !== '') {
            whereClause.categoria = categoria;
        }
        if (id_materia) {
            whereClause.id_materia = id_materia;
        }
        if (busqueda && busqueda.trim()) {
            const termino = `%${busqueda.trim()}%`;
            whereClause[Op.or] = [
                { titulo: { [Op.like]: termino } },
                { contenido: { [Op.like]: termino } }
            ];
        }

        let orderCondition = [['votos', 'DESC'], ['createdAt', 'DESC']];
        if (orden === 'reciente') {
            orderCondition = [['createdAt', 'DESC']];
        } else if (orden === 'votos') {
            orderCondition = [['votos', 'DESC'], ['createdAt', 'DESC']];
        }

        const { count, rows: publicaciones } = await ForoPublicacion.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
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
                    attributes: ['id', 'nombre', 'codigo', 'nivel_anio', 'cuatrimestre']
                },
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ],
            order: orderCondition
        });

        const publicacionesConStats = await Promise.all(publicaciones.map(async (pub) => {
            const cantComentarios = await ForoComentario.count({
                where: { id_publicacion: pub.id }
            });

            const guardada = usuarioId ? await ForoPublicacionGuardada.findOne({
                where: { id_usuario: usuarioId, id_publicacion: pub.id }
            }) : null;

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
                Materia: pub.Materia || pub.materium || null,
                Etiquetas: pub.Etiquetas || [],
                cantComentarios,
                esGuardada: !!guardada
            };
        }));

        return {
            total: count,
            publicaciones: publicacionesConStats,
            hasMore: Number(offset) + Number(limit) < count
        };
    }

    /**
     * Obtener detalle completo de una publicación y sus comentarios
     */
    static async obtenerDetallePublicacion(postId, usuarioId) {
        const publicacionObj = await ForoPublicacion.findByPk(postId, {
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
                },
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        if (!publicacionObj) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
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

        const guardada = usuarioId ? await ForoPublicacionGuardada.findOne({
            where: { id_usuario: usuarioId, id_publicacion: postId }
        }) : null;

        const publicacion = publicacionObj.toJSON();
        publicacion.esGuardada = !!guardada;

        return {
            publicacion,
            comentarios
        };
    }

    /**
     * Crear nueva publicación en foro
     */
    static async crearPublicacion({ id_materia, titulo, contenido, categoria, etiquetas, id_usuario }) {
        if (!titulo || titulo.trim() === '') {
            const error = new Error('El sistema requiere un título obligatorio para continuar.');
            error.status = 400;
            throw error;
        }
        if (!contenido || contenido.trim() === '') {
            const error = new Error('El cuerpo del contenido no puede estar vacío.');
            error.status = 400;
            throw error;
        }
        if (!id_materia) {
            const error = new Error('Error: La materia debe asociarse automáticamente.');
            error.status = 400;
            throw error;
        }

        const nuevaPublicacion = await ForoPublicacion.create({
            id_materia: Number(id_materia),
            id_usuario,
            titulo: titulo.trim(),
            contenido: contenido.trim(),
            categoria: categoria || 'General',
            votos: 0
        });

        if (Array.isArray(etiquetas) && etiquetas.length > 0) {
            const tagsToInsert = etiquetas
                .map(t => t.trim())
                .filter(t => t.length > 0)
                .map(t => t.startsWith('#') ? t : `#${t}`);

            const uniqueTags = [...new Set(tagsToInsert)];

            for (const tag of uniqueTags) {
                await ForoEtiqueta.create({
                    id_publicacion: nuevaPublicacion.id,
                    nombre: tag
                });
            }
        }

        const publicacionCreada = await ForoPublicacion.findByPk(nuevaPublicacion.id, {
            include: [
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        return publicacionCreada;
    }

    /**
     * Editar publicación (con restricción de 10 minutos y propiedad)
     */
    static async editarPublicacion(id, { titulo, contenido, id_usuario }) {
        const publicacion = await ForoPublicacion.findByPk(id);

        if (!publicacion) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
        }

        if (publicacion.id_usuario !== id_usuario) {
            const error = new Error('No tienes permiso para editar esta publicación.');
            error.status = 403;
            throw error;
        }

        const fechaCreacion = new Date(publicacion.createdAt);
        const ahora = new Date();
        const diferenciaMinutos = (ahora - fechaCreacion) / (1000 * 60);

        if (diferenciaMinutos > 10) {
            const error = new Error('El tiempo límite de 10 minutos para editar esta publicación ha expirado.');
            error.status = 403;
            throw error;
        }

        if (!titulo || titulo.trim() === '') {
            const error = new Error('El título es obligatorio.');
            error.status = 400;
            throw error;
        }
        if (!contenido || contenido.trim() === '') {
            const error = new Error('El contenido es obligatorio.');
            error.status = 400;
            throw error;
        }

        publicacion.titulo = titulo.trim();
        publicacion.contenido = contenido.trim();
        await publicacion.save();

        const publicacionActualizada = await ForoPublicacion.findByPk(id, {
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
                },
                {
                    model: ForoEtiqueta,
                    as: 'Etiquetas',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        return publicacionActualizada;
    }

    /**
     * Eliminar publicación (autor o administrador)
     */
    static async eliminarPublicacion(id, id_usuario, rol) {
        const publicacion = await ForoPublicacion.findByPk(id);

        if (!publicacion) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
        }

        const esAutor = publicacion.id_usuario === id_usuario;
        const esAdmin = rol === 3;

        if (!esAutor && !esAdmin) {
            const error = new Error('No tienes permiso para eliminar esta publicación.');
            error.status = 403;
            throw error;
        }

        await publicacion.destroy();
        return { mensaje: 'Publicación eliminada correctamente.' };
    }

    /**
     * Votar en publicación (positivo/negativo/toggle)
     */
    static async reaccionarPublicacion(id, id_usuario, tipo) {
        if (tipo !== 'positivo' && tipo !== 'negativo') {
            const error = new Error('Tipo de reacción inválido.');
            error.status = 400;
            throw error;
        }

        const publicacion = await ForoPublicacion.findByPk(id);
        if (!publicacion) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
        }

        const reaccionExistente = await ForoReaccion.findOne({
            where: { id_publicacion: id, id_usuario }
        });

        if (reaccionExistente) {
            if (reaccionExistente.tipo === tipo) {
                await reaccionExistente.destroy();
                publicacion.votos = tipo === 'positivo' ? publicacion.votos - 1 : publicacion.votos + 1;
                await publicacion.save();
                return { mensaje: 'Reacción removida', votos: publicacion.votos, reaccion: null };
            } else {
                const ajuste = tipo === 'positivo' ? 2 : -2;
                reaccionExistente.tipo = tipo;
                await reaccionExistente.save();

                publicacion.votos = publicacion.votos + ajuste;
                await publicacion.save();
                return { mensaje: 'Reacción actualizada', votos: publicacion.votos, reaccion: reaccionExistente };
            }
        } else {
            const nuevaReaccion = await ForoReaccion.create({
                id_publicacion: id,
                id_usuario,
                tipo
            });

            const ajuste = tipo === 'positivo' ? 1 : -1;
            publicacion.votos = publicacion.votos + ajuste;
            await publicacion.save();
            return { mensaje: 'Reacción agregada', votos: publicacion.votos, reaccion: nuevaReaccion };
        }
    }

    /**
     * Guardar o desguardar publicación
     */
    static async toggleGuardarPublicacion(id, id_usuario) {
        const publicacion = await ForoPublicacion.findByPk(id);
        if (!publicacion) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
        }

        const guardada = await ForoPublicacionGuardada.findOne({
            where: { id_usuario, id_publicacion: id }
        });

        if (guardada) {
            await guardada.destroy();
            return { guardada: false, mensaje: 'Publicación eliminada de tus guardados.' };
        } else {
            await ForoPublicacionGuardada.create({
                id_usuario,
                id_publicacion: id
            });
            return { guardada: true, mensaje: 'Publicación guardada con éxito.' };
        }
    }

    /**
     * Obtener publicaciones guardadas por el usuario
     */
    static async obtenerPublicacionesGuardadas(id_usuario) {
        const guardadas = await ForoPublicacionGuardada.findAll({
            where: { id_usuario },
            include: [
                {
                    model: ForoPublicacion,
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
                            model: Materia,
                            attributes: ['id', 'nombre', 'codigo']
                        },
                        {
                            model: ForoEtiqueta,
                            as: 'Etiquetas',
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return guardadas.map(g => {
            if (!g.ForoPublicacion) return null;
            const pub = g.ForoPublicacion.toJSON();
            pub.esGuardada = true;
            return pub;
        }).filter(Boolean);
    }

    /**
     * Obtener etiquetas populares
     */
    static async obtenerEtiquetasPopulares(limit = 5) {
        const popularTags = await ForoEtiqueta.findAll({
            attributes: [
                'nombre',
                [Sequelize.fn('COUNT', Sequelize.col('nombre')), 'cantidad']
            ],
            group: ['nombre'],
            order: [[Sequelize.literal('cantidad'), 'DESC']],
            limit: 15
        });

        if (popularTags.length === 0) {
            return [];
        }

        const tagNames = popularTags.map(t => t.nombre);
        const shuffled = tagNames.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }

    /**
     * Crear comentario o respuesta en publicación
     */
    static async crearComentario({ contenido, id_publicacion, id_comentario_padre, id_usuario, usuarioInfo }) {
        if (!contenido || contenido.trim() === '') {
            const error = new Error('El comentario no puede estar vacío');
            error.status = 400;
            throw error;
        }

        const nuevoComentario = await ForoComentario.create({
            id_publicacion: Number(id_publicacion),
            contenido: contenido.trim(),
            id_usuario: id_usuario || 1,
            id_comentario_padre: id_comentario_padre ? Number(id_comentario_padre) : null
        });

        const comentarioJson = nuevoComentario.toJSON();
        comentarioJson.Autor = {
            id: usuarioInfo?.id || id_usuario || 1,
            nombre: usuarioInfo?.nombre || 'Usuario',
            apellido: usuarioInfo?.apellido || 'Estudiante',
            nombre_usuario: usuarioInfo?.nombre_usuario || 'usuario',
            id_tipo_usuario: usuarioInfo?.id_tipo_usuario || 1,
            Perfil: { foto_perfil: null }
        };

        return comentarioJson;
    }

    /**
     * Editar comentario (máximo 10 minutos)
     */
    static async editarComentario(id, { contenido, id_usuario }) {
        if (!contenido || contenido.trim() === '') {
            const error = new Error('El comentario no puede estar vacío');
            error.status = 400;
            throw error;
        }

        const comentario = await ForoComentario.findByPk(id);
        if (!comentario) {
            const error = new Error('Comentario no encontrado');
            error.status = 404;
            throw error;
        }

        if (id_usuario && comentario.id_usuario !== id_usuario) {
            const error = new Error('No tienes permiso para editar este comentario');
            error.status = 403;
            throw error;
        }

        const ahora = new Date();
        const fechaCreacion = new Date(comentario.createdAt);
        const diferenciaMinutos = (ahora - fechaCreacion) / 1000 / 60;

        if (diferenciaMinutos > 10) {
            const error = new Error('Ya pasaron los 10 minutos permitidos para editar este comentario');
            error.status = 403;
            throw error;
        }

        comentario.contenido = contenido.trim();
        await comentario.save();

        return comentario;
    }

    /**
     * Eliminar comentario (autor del comentario, autor del post, o admin)
     */
    static async eliminarComentario(id, id_usuario, rol) {
        const comentario = await ForoComentario.findByPk(id, {
            include: [{ model: ForoPublicacion }]
        });

        if (!comentario) {
            const error = new Error('Comentario no encontrado');
            error.status = 404;
            throw error;
        }

        const esAutorComentario = comentario.id_usuario === id_usuario;
        const esAutorPublicacion = comentario.ForoPublicacion && comentario.ForoPublicacion.id_usuario === id_usuario;
        const esAdmin = rol === 3;

        if (!esAutorComentario && !esAutorPublicacion && !esAdmin) {
            const error = new Error('No tienes permisos para eliminar este comentario');
            error.status = 403;
            throw error;
        }

        await comentario.destroy();
        return { mensaje: 'Comentario eliminado con éxito' };
    }

    /**
     * Votar en comentario (positivo/negativo/toggle)
     */
    static async reaccionarComentario(id, id_usuario, tipo) {
        if (tipo !== 'positivo' && tipo !== 'negativo') {
            const error = new Error('Tipo de reacción inválido.');
            error.status = 400;
            throw error;
        }

        const comentario = await ForoComentario.findByPk(id);
        if (!comentario) {
            const error = new Error('Comentario no encontrado.');
            error.status = 404;
            throw error;
        }

        const reaccionExistente = await ForoReaccion.findOne({
            where: { id_comentario: id, id_usuario }
        });

        if (reaccionExistente) {
            if (reaccionExistente.tipo === tipo) {
                await reaccionExistente.destroy();
                comentario.votos = tipo === 'positivo' ? comentario.votos - 1 : comentario.votos + 1;
                await comentario.save();
                return { mensaje: 'Reacción removida', votos: comentario.votos, reaccion: null };
            } else {
                const ajuste = tipo === 'positivo' ? 2 : -2;
                reaccionExistente.tipo = tipo;
                await reaccionExistente.save();

                comentario.votos = comentario.votos + ajuste;
                await comentario.save();
                return { mensaje: 'Reacción actualizada', votos: comentario.votos, reaccion: reaccionExistente };
            }
        } else {
            const nuevaReaccion = await ForoReaccion.create({
                id_comentario: id,
                id_usuario,
                tipo
            });

            const ajuste = tipo === 'positivo' ? 1 : -1;
            comentario.votos = comentario.votos + ajuste;
            await comentario.save();
            return { mensaje: 'Reacción agregada', votos: comentario.votos, reaccion: nuevaReaccion };
        }
    }

    /**
     * Reportar una publicación
     */
    static async reportarPublicacion(id, { descripcion, id_usuario }) {
        if (!descripcion || !descripcion.trim()) {
            const error = new Error('La descripción del reporte es obligatoria.');
            error.status = 400;
            throw error;
        }

        const publicacion = await ForoPublicacion.findByPk(id);
        if (!publicacion) {
            const error = new Error('Publicación no encontrada.');
            error.status = 404;
            throw error;
        }

        const reporte = await ForoReporte.create({
            id_usuario_reportador: id_usuario,
            id_publicacion: id,
            descripcion: descripcion.trim()
        });

        return reporte;
    }

    /**
     * Reportar un comentario
     */
    static async reportarComentario(id, { descripcion, id_usuario }) {
        if (!descripcion || !descripcion.trim()) {
            const error = new Error('La descripción del reporte es obligatoria.');
            error.status = 400;
            throw error;
        }

        if (descripcion.trim().length < 5) {
            const error = new Error('El motivo del reporte debe tener al menos 5 caracteres.');
            error.status = 400;
            throw error;
        }

        const comentario = await ForoComentario.findByPk(id);
        if (!comentario) {
            const error = new Error('Comentario no encontrado.');
            error.status = 404;
            throw error;
        }

        const reporte = await ForoReporte.create({
            id_usuario_reportador: id_usuario,
            id_publicacion: comentario.id_publicacion,
            id_comentario: id,
            descripcion: descripcion.trim()
        });

        return reporte;
    }

    /**
     * Obtener todos los reportes (administradores)
     */
    static async obtenerReportes() {
        const reportes = await ForoReporte.findAll({
            include: [
                {
                    model: Usuario,
                    as: 'Reportador',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                },
                {
                    model: ForoPublicacion,
                    include: [
                        {
                            model: Usuario,
                            as: 'Autor',
                            attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                        },
                        {
                            model: Materia,
                            attributes: ['id', 'nombre', 'codigo']
                        }
                    ]
                },
                {
                    model: ForoComentario,
                    as: 'Comentario',
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

        return reportes;
    }

    /**
     * Resolver reporte con soporte para moderación (SCRUM-126)
     * Acciones:
     * - 'eliminar_contenido': da de baja la publicación o comentario reportado y marca el reporte resuelto
     * - 'desestimar': marca el reporte como resuelto manteniendo el contenido intacto
     * - 'reabrir': marca el reporte como pendiente
     * - sin accion / toggle: invierte el valor booleano actual (retrocompatibilidad)
     */
    static async resolverReporte(id, { accion, usuario }) {
        const reporte = await ForoReporte.findByPk(id);
        if (!reporte) {
            const error = new Error('Reporte no encontrado.');
            error.status = 404;
            throw error;
        }

        if (accion === 'eliminar_contenido') {
            // Dar de baja el contenido reportado
            if (reporte.id_comentario) {
                const comentario = await ForoComentario.findByPk(reporte.id_comentario);
                if (comentario) {
                    await comentario.destroy();
                }
            } else if (reporte.id_publicacion) {
                const publicacion = await ForoPublicacion.findByPk(reporte.id_publicacion);
                if (publicacion) {
                    await publicacion.destroy(); // Soft delete por paranoid: true
                }
            }
            reporte.resuelto = true;
            await reporte.save();

            return {
                mensaje: 'Contenido reportado eliminado exitosamente y reporte resuelto.',
                reporte
            };
        }

        if (accion === 'desestimar') {
            reporte.resuelto = true;
            await reporte.save();
            return {
                mensaje: 'Reporte desestimado (marcado como resuelto sin modificar contenido).',
                reporte
            };
        }

        if (accion === 'reabrir') {
            reporte.resuelto = false;
            await reporte.save();
            return {
                mensaje: 'Reporte reabierto (marcado como pendiente).',
                reporte
            };
        }

        // Toggle por defecto (retrocompatibilidad)
        reporte.resuelto = !reporte.resuelto;
        await reporte.save();

        return {
            mensaje: reporte.resuelto ? 'Reporte marcado como resuelto.' : 'Reporte marcado como pendiente.',
            reporte
        };
    }

    /**
     * Eliminar reporte de auditoría (administradores)
     */
    static async eliminarReporte(id) {
        const reporte = await ForoReporte.findByPk(id);
        if (!reporte) {
            const error = new Error('Reporte no encontrado.');
            error.status = 404;
            throw error;
        }

        await reporte.destroy();
        return { mensaje: 'Reporte eliminado con éxito de la auditoría.' };
    }
}

module.exports = ForoService;
