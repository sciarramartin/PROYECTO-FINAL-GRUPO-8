// servicios/amistad.service.js
const { Amistad } = require('../modelos/Amistad');
const { Usuario } = require('../modelos/Usuario');
const { Op } = require('sequelize');

// Helper para validar si un usuario existe
const verificarUsuarioExiste = async (id) => {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
        throw { status: 404, message: `El usuario con ID ${id} no existe.` };
    }
    return usuario;
};

// 1. Enviar una solicitud de amistad
const enviarSolicitud = async (id_usuario_origen, id_usuario_destino) => {
    const origenId = Number(id_usuario_origen);
    const destinoId = Number(id_usuario_destino);

    if (origenId === destinoId) {
        throw { status: 400, message: 'No podés enviarte una solicitud de amistad a vos mismo.' };
    }

    // Verificar que ambos usuarios existan en el sistema
    await verificarUsuarioExiste(origenId);
    await verificarUsuarioExiste(destinoId);

    // Verificar si ya existe alguna relación entre ellos
    const relacionExistente = await Amistad.findOne({
        where: {
            [Op.or]: [
                { id_usuario_origen: origenId, id_usuario_destino: destinoId },
                { id_usuario_origen: destinoId, id_usuario_destino: origenId }
            ]
        }
    });

    if (relacionExistente) {
        if (relacionExistente.estado === 'aceptado') {
            throw { status: 400, message: 'Ya son amigos en el sistema.' };
        }
        if (relacionExistente.estado === 'pendiente') {
            if (relacionExistente.id_usuario_origen === origenId) {
                throw { status: 400, message: 'Ya enviaste una solicitud de amistad a este usuario. Está pendiente.' };
            } else {
                throw { status: 400, message: 'Este usuario ya te envió una solicitud de amistad. Revisá tus solicitudes pendientes.' };
            }
        }
    }

    // Crear la solicitud en estado 'pendiente'
    const nuevaSolicitud = await Amistad.create({
        id_usuario_origen: origenId,
        id_usuario_destino: destinoId,
        estado: 'pendiente'
    });

    return nuevaSolicitud;
};

// 2. Aceptar una solicitud de amistad
const aceptarSolicitud = async (id_usuario_destino, id_usuario_origen) => {
    const destinoId = Number(id_usuario_destino);
    const origenId = Number(id_usuario_origen);

    // Buscar la solicitud pendiente
    const solicitud = await Amistad.findOne({
        where: {
            id_usuario_origen: origenId,
            id_usuario_destino: destinoId,
            estado: 'pendiente'
        }
    });

    if (!solicitud) {
        throw { status: 404, message: 'No se encontró ninguna solicitud de amistad pendiente de este usuario.' };
    }

    // Cambiar el estado a aceptado
    solicitud.estado = 'aceptado';
    await solicitud.save();

    return solicitud;
};

// 3. Eliminar o Rechazar amistad
const eliminarORechazarAmistad = async (idUsuarioA, idUsuarioB) => {
    const idA = Number(idUsuarioA);
    const idB = Number(idUsuarioB);

    // Buscar cualquier relación de amistad o solicitud existente
    const relacion = await Amistad.findOne({
        where: {
            [Op.or]: [
                { id_usuario_origen: idA, id_usuario_destino: idB },
                { id_usuario_origen: idB, id_usuario_destino: idA }
            ]
        }
    });

    if (!relacion) {
        throw { status: 404, message: 'No existe ninguna relación de amistad o solicitud entre estos usuarios.' };
    }

    // Eliminar la relación de la base de datos
    await relacion.destroy();
    return true;
};

// 4. Listar amigos aceptados de un usuario
const listarAmigos = async (idUsuario) => {
    const userId = Number(idUsuario);
    await verificarUsuarioExiste(userId);

    // Buscar todas las amistades aceptadas del usuario
    const relaciones = await Amistad.findAll({
        where: {
            estado: 'aceptado',
            [Op.or]: [
                { id_usuario_origen: userId },
                { id_usuario_destino: userId }
            ]
        },
        include: [
            {
                model: Usuario,
                as: 'UsuarioOrigen',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'mail', 'id_carrera', 'anio_ingreso']
            },
            {
                model: Usuario,
                as: 'UsuarioDestino',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'mail', 'id_carrera', 'anio_ingreso']
            }
        ]
    });

    // Mapear el resultado para retornar los datos del *otro* usuario (el amigo)
    const amigos = relaciones.map(relacion => {
        if (relacion.id_usuario_origen === userId) {
            return relacion.UsuarioDestino;
        } else {
            return relacion.UsuarioOrigen;
        }
    });

    return amigos;
};

// 5. Listar solicitudes pendientes recibidas por el usuario
const listarSolicitudesPendientes = async (idUsuario) => {
    const userId = Number(idUsuario);
    await verificarUsuarioExiste(userId);

    const solicitudes = await Amistad.findAll({
        where: {
            id_usuario_destino: userId,
            estado: 'pendiente'
        },
        include: [
            {
                model: Usuario,
                as: 'UsuarioOrigen',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'mail', 'id_carrera', 'anio_ingreso']
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Retorna el perfil del usuario que envió la solicitud junto con la fecha de envío
    return solicitudes.map(solicitud => ({
        id_solicitud: solicitud.id,
        fecha_solicitud: solicitud.createdAt,
        usuario: solicitud.UsuarioOrigen
    }));
};

// 6. Obtener estado de la relación específica entre dos usuarios
const obtenerEstadoRelacion = async (idUsuarioA, idUsuarioB) => {
    const idA = Number(idUsuarioA);
    const idB = Number(idUsuarioB);

    if (idA === idB) {
        return { estado: 'mismo_usuario' };
    }

    // Verificar que el otro usuario exista
    await verificarUsuarioExiste(idB);

    const relacion = await Amistad.findOne({
        where: {
            [Op.or]: [
                { id_usuario_origen: idA, id_usuario_destino: idB },
                { id_usuario_origen: idB, id_usuario_destino: idA }
            ]
        }
    });

    if (!relacion) {
        return { estado: 'ninguno' };
    }

    if (relacion.estado === 'aceptado') {
        return { estado: 'aceptado' };
    }

    if (relacion.estado === 'pendiente') {
        if (relacion.id_usuario_origen === idA) {
            return { estado: 'pendiente_enviada' };
        } else {
            return { estado: 'pendiente_recibida' };
        }
    }
};

module.exports = {
    enviarSolicitud,
    aceptarSolicitud,
    eliminarORechazarAmistad,
    listarAmigos,
    listarSolicitudesPendientes,
    obtenerEstadoRelacion
};
