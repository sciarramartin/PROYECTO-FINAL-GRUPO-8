// controladores/grupo.controller.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middleware/authMiddleware');
const { Grupo } = require('../modelos/Grupo');
const { GrupoMiembro } = require('../modelos/GrupoMiembro');
const { GrupoMensaje } = require('../modelos/GrupoMensaje');
const { Usuario } = require('../modelos/Usuario');
const { Perfil } = require('../modelos/Perfil');
const { Op } = require('sequelize');

// 1. POST /api/grupos
// Crear un grupo nuevo e ingresar al creador como administrador
router.post('/', verificarToken, async (req, res) => {
    try {
        const { nombre, descripcion, estado } = req.body;
        const id_creador = req.usuario.id;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre del grupo es obligatorio.' });
        }

        if (estado && estado !== 'publico' && estado !== 'privado') {
            return res.status(400).json({ error: "El estado de visibilidad debe ser 'publico' o 'privado'." });
        }

        // Crear el grupo
        const nuevoGrupo = await Grupo.create({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : '',
            estado: estado || 'publico',
            id_creador
        });

        // Añadir al creador como miembro administrador
        await GrupoMiembro.create({
            id_grupo: nuevoGrupo.id,
            id_usuario: id_creador,
            rol: 'administrador',
            estado: 'aceptado'
        });

        // Obtener el grupo completo con información del creador
        const grupoCompleto = await Grupo.findByPk(nuevoGrupo.id, {
            include: [
                { model: Usuario, as: 'Creador', attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'] }
            ]
        });

        // Notificar por WebSocket que se ha creado un nuevo grupo
        if (req.io) {
            req.io.emit('grupo_creado', grupoCompleto);
        }

        return res.status(201).json(grupoCompleto);
    } catch (error) {
        console.error("Error al crear grupo:", error);
        return res.status(500).json({ error: 'Error interno del servidor al crear el grupo.' });
    }
});

// 2. GET /api/grupos/explorar
// Obtener todos los grupos públicos a los que el usuario logueado NO pertenece
router.get('/explorar', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        // Buscar las membresías del usuario
        const membresias = await GrupoMiembro.findAll({
            where: { id_usuario }
        });

        const miGrupoIds = membresias.map(m => m.id_grupo);

        const whereClause = { estado: 'publico' };
        if (miGrupoIds.length > 0) {
            whereClause.id = { [Op.notIn]: miGrupoIds };
        }

        // Obtener los grupos correspondientes
        const gruposPublicos = await Grupo.findAll({
            where: whereClause,
            include: [
                { model: Usuario, as: 'Creador', attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'] }
            ]
        });

        return res.status(200).json(gruposPublicos);
    } catch (error) {
        console.error("Error al explorar grupos:", error);
        return res.status(500).json({ error: 'Error interno al explorar los grupos.' });
    }
});

// 3. GET /api/grupos
// Obtener todos los grupos a los que pertenece el usuario logueado
router.get('/', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;

        // Buscar las membresías del usuario
        const membresias = await GrupoMiembro.findAll({
            where: { id_usuario, estado: 'aceptado' }
        });

        const grupoIds = membresias.map(m => m.id_grupo);

        if (grupoIds.length === 0) {
            return res.status(200).json([]);
        }

        // Obtener los grupos correspondientes
        const grupos = await Grupo.findAll({
            where: { id: grupoIds },
            include: [
                { model: Usuario, as: 'Creador', attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'] }
            ]
        });

        return res.status(200).json(grupos);
    } catch (error) {
        console.error("Error al obtener grupos:", error);
        return res.status(500).json({ error: 'Error interno al obtener los grupos.' });
    }
});

// 4. GET /api/grupos/:id
// Obtener detalles de un grupo específico (debe ser miembro para ver completo, pero no miembro si es público)
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);

        const grupo = await Grupo.findByPk(id_grupo, {
            include: [
                { 
                    model: Usuario, 
                    as: 'Creador', 
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    include: [{ model: Perfil, attributes: ['foto_perfil'] }]
                },
                {
                    model: Usuario,
                    as: 'Miembros',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    through: { 
                        attributes: ['rol', 'estado']
                    },
                    include: [{ model: Perfil, attributes: ['foto_perfil'] }]
                }
            ]
        });

        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado.' });
        }

        // Validar si el usuario es miembro
        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, estado: 'aceptado' }
        });

        const grupoJson = grupo.toJSON();
        const esPublico = grupo.estado === 'publico' || grupo.privacidad === 'publico';

        // Dividir los miembros en activos (aceptado) y pendientes (pendiente)
        const todosLosMiembros = grupoJson.Miembros || [];
        grupoJson.Miembros = todosLosMiembros.filter(m => m.GrupoMiembro?.estado === 'aceptado');
        grupoJson.MiembrosPendientes = todosLosMiembros.filter(m => m.GrupoMiembro?.estado === 'pendiente');

        if (!membresia) {
            // Si el grupo es público, permitir ver detalles de presentación pero con esMiembro: false
            if (esPublico) {
                grupoJson.esMiembro = false;
                delete grupoJson.MiembrosPendientes;
                return res.status(200).json(grupoJson);
            }
            return res.status(403).json({ error: 'No tienes permisos para ver este grupo privado.' });
        }

        grupoJson.esMiembro = true;
        return res.status(200).json(grupoJson);
    } catch (error) {
        console.error("Error al obtener detalles del grupo:", error);
        return res.status(500).json({ error: 'Error interno al obtener detalles del grupo.' });
    }
});

// 5. PUT /api/grupos/:id
// Actualizar información del grupo (nombre, descripción, visibilidad). Solo administradores.
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);
        const { nombre, descripcion, estado } = req.body;

        // 1. Validar que el grupo exista
        const grupo = await Grupo.findByPk(id_grupo);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado.' });
        }

        // 2. Verificar que el usuario sea administrador del grupo
        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, rol: 'administrador', estado: 'aceptado' }
        });
        if (!membresia) {
            return res.status(403).json({ error: 'No tienes permisos para configurar este grupo.' });
        }

        // 3. Validaciones de datos
        if (nombre !== undefined && !nombre.trim()) {
            return res.status(400).json({ error: 'El nombre del grupo no puede estar vacío.' });
        }
        if (estado !== undefined && estado !== 'publico' && estado !== 'privado') {
            return res.status(400).json({ error: "El estado de visibilidad debe ser 'publico' o 'privado'." });
        }

        // 4. Actualizar campos
        if (nombre !== undefined) grupo.nombre = nombre.trim();
        if (descripcion !== undefined) grupo.descripcion = descripcion.trim();
        if (estado !== undefined) grupo.estado = estado;

        await grupo.save();

        // 5. Obtener el grupo completo actualizado con información del creador
        const grupoActualizado = await Grupo.findByPk(id_grupo, {
            include: [
                { model: Usuario, as: 'Creador', attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'] }
            ]
        });

        return res.status(200).json(grupoActualizado);
    } catch (error) {
        console.error("Error al actualizar grupo:", error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el grupo.' });
    }
});

// 6. POST /api/grupos/:id/unirse
// Unirse de forma directa a un grupo público
router.post('/:id/unirse', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);

        const grupo = await Grupo.findByPk(id_grupo);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado.' });
        }

        const esPublico = grupo.estado === 'publico' || grupo.privacidad === 'publico';
        if (!esPublico) {
            return res.status(403).json({ error: 'Este grupo es privado. Solo puedes unirte con una invitación.' });
        }

        // Validar si ya es miembro
        const membresiaExistente = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario }
        });

        if (membresiaExistente) {
            return res.status(400).json({ error: 'Ya eres miembro de este grupo.' });
        }

        // Unirse al grupo
        await GrupoMiembro.create({
            id_grupo,
            id_usuario,
            rol: 'miembro',
            estado: 'aceptado'
        });

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(200).json({ mensaje: '¡Te has unido al grupo con éxito!' });
    } catch (error) {
        console.error("Error al unirse al grupo:", error);
        return res.status(500).json({ error: 'Error interno al procesar el ingreso al grupo.' });
    }
});

// 5b. POST /api/grupos/:id/salir
// Salir de un grupo de estudio
router.post('/:id/salir', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);

        const grupo = await Grupo.findByPk(id_grupo);
        if (!grupo) {
            return res.status(404).json({ error: 'Grupo no encontrado.' });
        }

        // Validar si es miembro
        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario }
        });

        if (!membresia) {
            return res.status(400).json({ error: 'No eres miembro de este grupo.' });
        }

        // Salir del grupo eliminando la membresía
        await membresia.destroy();

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(200).json({ mensaje: 'Has salido del grupo con éxito.' });
    } catch (error) {
        console.error("Error al salir del grupo:", error);
        return res.status(500).json({ error: 'Error interno al intentar salir del grupo.' });
    }
});

// 6. POST /api/grupos/:id/mensajes
// Crear un nuevo mensaje en el muro del grupo (solo miembros)
router.post('/:id/mensajes', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);
        const { contenido } = req.body;

        if (!contenido || !contenido.trim()) {
            return res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío.' });
        }

        // Validar que el usuario sea miembro
        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, estado: 'aceptado' }
        });

        if (!membresia) {
            return res.status(403).json({ error: 'No eres miembro de este grupo para publicar mensajes.' });
        }

        // Crear el mensaje
        const nuevoMensaje = await GrupoMensaje.create({
            id_grupo,
            id_usuario,
            contenido: contenido.trim()
        });

        // Obtener mensaje completo con datos del autor
        const mensajeCompleto = await GrupoMensaje.findByPk(nuevoMensaje.id, {
            include: [
                { 
                    model: Usuario, 
                    as: 'Autor', 
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    include: [{ model: Perfil, attributes: ['foto_perfil'] }]
                }
            ]
        });

        // Emitir mensaje por socket en tiempo real a la sala del grupo
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('nuevo_mensaje_grupo', mensajeCompleto);
            console.log(`[Socket.io] Nuevo mensaje emitido en tiempo real a sala: grupo_${id_grupo}`);
        }

        return res.status(201).json(mensajeCompleto);
    } catch (error) {
        console.error("Error al publicar mensaje en grupo:", error);
        return res.status(500).json({ error: 'Error al publicar el mensaje en el muro.' });
    }
});

// 7. GET /api/grupos/:id/mensajes
// Obtener los mensajes del muro del grupo (solo miembros)
router.get('/:id/mensajes', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = parseInt(req.usuario.id, 10);

        // Validar que el usuario sea miembro
        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, estado: 'aceptado' }
        });

        if (!membresia) {
            return res.status(403).json({ error: 'No eres miembro de este grupo para ver el muro.' });
        }

        const mensajes = await GrupoMensaje.findAll({
            where: { id_grupo },
            include: [
                { 
                    model: Usuario, 
                    as: 'Autor', 
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
                    include: [{ model: Perfil, attributes: ['foto_perfil'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(mensajes);
    } catch (error) {
        console.error("Error al obtener mensajes del grupo:", error);
        return res.status(500).json({ error: 'Error al cargar los mensajes del muro.' });
    }
});

// 8. POST /api/grupos/:id/miembros
// Añadir un miembro nuevo a un grupo (solo miembros actuales pueden invitar)
router.post('/:id/miembros', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario_logueado = parseInt(req.usuario.id, 10);
        const id_usuario_nuevo = parseInt(req.body.id_usuario_nuevo, 10);

        if (!id_usuario_nuevo) {
            return res.status(400).json({ error: 'El ID del nuevo miembro es obligatorio.' });
        }

        // Validar que el usuario logueado sea miembro del grupo
        const membresiaLogueado = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_logueado }
        });

        if (!membresiaLogueado) {
            return res.status(403).json({ error: 'No tienes permisos para añadir miembros a este grupo.' });
        }

        // Validar si el usuario nuevo ya es miembro
        const membresiaExistente = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_nuevo }
        });

        if (membresiaExistente) {
            return res.status(400).json({ error: 'El usuario ya es miembro de este grupo.' });
        }

        // Añadir al nuevo miembro como pendiente (invitación)
        await GrupoMiembro.create({
            id_grupo,
            id_usuario: id_usuario_nuevo,
            rol: 'miembro',
            estado: 'pendiente'
        });

        // Emitir notificación por socket en tiempo real si el usuario está conectado
        if (req.io && req.usuariosConectados) {
            const conectadosList = Array.from(req.usuariosConectados.keys());
            console.log(`[Socket.io] Usuarios conectados al enviar invitación:`, conectadosList);
            
            const socketId = req.usuariosConectados.get(id_usuario_nuevo);
            if (socketId) {
                req.io.to(socketId).emit('nueva_invitacion_grupo');
                console.log(`[Socket.io] ÉXITO: Notificación de nueva invitación de grupo emitida a usuario ${id_usuario_nuevo} en socket ${socketId}`);
            } else {
                console.log(`[Socket.io] ADVERTENCIA: El usuario invitado (ID: ${id_usuario_nuevo}) no está en la lista de conectados. Conectados actuales:`, conectadosList);
            }
        }

        // Obtener los datos del nuevo miembro
        const usuarioNuevo = await Usuario.findByPk(id_usuario_nuevo, {
            attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
        });

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(201).json({
            mensaje: 'Miembro añadido correctamente.',
            miembro: {
                id: usuarioNuevo.id,
                nombre: usuarioNuevo.nombre,
                apellido: usuarioNuevo.apellido,
                nombre_usuario: usuarioNuevo.nombre_usuario,
                GrupoMiembro: { rol: 'miembro' }
            }
        });
    } catch (error) {
        console.error("Error al añadir miembro:", error);
        return res.status(501).json({ error: 'Error interno al añadir el miembro.' });
    }
});

// 9. DELETE /api/grupos/:id/miembros/:id_usuario
// Eliminar a un miembro del grupo (solo administradores)
router.delete('/:id/miembros/:id_usuario', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario_eliminar = parseInt(req.params.id_usuario, 10);
        const id_usuario_logueado = parseInt(req.usuario.id, 10);

        if (id_usuario_eliminar === id_usuario_logueado) {
            return res.status(400).json({ error: 'No puedes eliminarte a ti mismo del grupo. Si lo deseas, puedes salir del grupo.' });
        }

        // Validar que el usuario logueado sea miembro del grupo
        const membresiaLogueado = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_logueado }
        });

        if (!membresiaLogueado || membresiaLogueado.rol !== 'administrador') {
            return res.status(403).json({ error: 'No tienes permisos de administrador para eliminar miembros.' });
        }

        // Buscar la membresía a eliminar
        const membresiaEliminar = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_eliminar }
        });

        if (!membresiaEliminar) {
            return res.status(404).json({ error: 'El estudiante no es miembro de este grupo.' });
        }

        // Eliminar
        await membresiaEliminar.destroy();

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(200).json({ mensaje: 'Miembro eliminado del grupo correctamente.' });
    } catch (error) {
        console.error("Error al eliminar miembro del grupo:", error);
        return res.status(500).json({ error: 'Error interno al intentar eliminar al miembro.' });
    }
});

// 10. PUT /api/grupos/:id/miembros/:id_usuario/rol
// Cambiar rol de un miembro del grupo (solo administradores)
router.put('/:id/miembros/:id_usuario/rol', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario_cambiar = parseInt(req.params.id_usuario, 10);
        const id_usuario_logueado = parseInt(req.usuario.id, 10);
        const { rol } = req.body;

        if (!rol || (rol !== 'admin' && rol !== 'miembro')) {
            return res.status(400).json({ error: 'El rol proporcionado no es válido.' });
        }

        if (id_usuario_cambiar === id_usuario_logueado) {
            return res.status(400).json({ error: 'No puedes cambiar tu propio rol.' });
        }

        // Validar que el usuario logueado sea miembro del grupo
        const membresiaLogueado = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_logueado }
        });

        if (!membresiaLogueado || (membresiaLogueado.rol !== 'admin' && membresiaLogueado.rol !== 'administrador')) {
            return res.status(403).json({ error: 'No tienes permisos de administrador para cambiar roles.' });
        }

        // Buscar la membresía a actualizar
        const membresiaActualizar = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario: id_usuario_cambiar }
        });

        if (!membresiaActualizar) {
            return res.status(404).json({ error: 'El estudiante no es miembro de este grupo.' });
        }

        // Actualizar rol
        membresiaActualizar.rol = rol;
        await membresiaActualizar.save();

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(200).json({
            mensaje: `Rol actualizado correctamente a ${rol}.`,
            membresia: {
                id_grupo: membresiaActualizar.id_grupo,
                id_usuario: membresiaActualizar.id_usuario,
                rol: membresiaActualizar.rol
            }
        });
    } catch (error) {
        console.error("Error al cambiar rol del miembro:", error);
        return res.status(500).json({ error: 'Error interno al intentar cambiar el rol.' });
    }
});

// 11. GET /api/grupos/invitaciones/pendientes
// Obtener todas las invitaciones a grupos pendientes para el usuario logueado
router.get('/invitaciones/pendientes', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id;
        const invitaciones = await GrupoMiembro.findAll({
            where: { id_usuario, estado: 'pendiente' },
            include: [
                {
                    model: Grupo,
                    include: [
                        { model: Usuario, as: 'Creador', attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'] }
                    ]
                }
            ]
        });

        return res.status(200).json(invitaciones);
    } catch (error) {
        console.error("Error al obtener invitaciones de grupos pendientes:", error);
        return res.status(500).json({ error: 'Error interno al obtener invitaciones pendientes.' });
    }
});

// 12. POST /api/grupos/invitaciones/:id/aceptar
// Aceptar una invitación a un grupo de estudio
router.post('/invitaciones/:id/aceptar', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;

        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, estado: 'pendiente' }
        });

        if (!membresia) {
            return res.status(404).json({ error: 'No tienes ninguna invitación pendiente para este grupo.' });
        }

        membresia.estado = 'aceptado';
        await membresia.save();

        // Notificar en tiempo real a los miembros de la sala
        if (req.io) {
            req.io.to(`grupo_${id_grupo}`).emit('miembros_actualizados');
        }

        return res.status(200).json({ mensaje: 'Invitación aceptada con éxito.', membresia });
    } catch (error) {
        console.error("Error al aceptar invitación:", error);
        return res.status(500).json({ error: 'Error interno al intentar aceptar la invitación.' });
    }
});

// 13. POST /api/grupos/invitaciones/:id/rechazar
// Rechazar o cancelar una invitación a un grupo de estudio
router.post('/invitaciones/:id/rechazar', verificarToken, async (req, res) => {
    try {
        const id_grupo = parseInt(req.params.id, 10);
        const id_usuario = req.usuario.id;

        const membresia = await GrupoMiembro.findOne({
            where: { id_grupo, id_usuario, estado: 'pendiente' }
        });

        if (!membresia) {
            return res.status(404).json({ error: 'No tienes ninguna invitación pendiente para este grupo.' });
        }

        await membresia.destroy();

        return res.status(200).json({ mensaje: 'Invitación rechazada correctamente.' });
    } catch (error) {
        console.error("Error al rechazar invitación:", error);
        return res.status(500).json({ error: 'Error interno al intentar rechazar la invitación.' });
    }
});

const GrupoController = router;
module.exports = GrupoController;
