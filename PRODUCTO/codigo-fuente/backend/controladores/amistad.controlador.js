// controladores/amistad.controlador.js
const AmistadService = require('../servicios/AmistadService');
const { verificarToken } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// 1. POST /api/amistades/solicitar
// Enviar solicitud de amistad (Origen se saca del token)
router.post('/solicitar', verificarToken, async (req, res) => {
    try {
        const id_usuario_origen = req.usuario.id;
        const { id_usuario_destino } = req.body;
        
        if (!id_usuario_destino) {
            return res.status(400).json({ 
                error: 'Completá el campo obligatorio: id_usuario_destino' 
            });
        }

        const nuevaSolicitud = await AmistadService.enviarSolicitud(id_usuario_origen, id_usuario_destino);
        
        return res.status(201).json({
            mensaje: 'Solicitud de amistad enviada correctamente',
            solicitud: nuevaSolicitud
        });
    } catch (error) {
        console.error("Error al enviar solicitud:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al enviar la solicitud' 
        });
    }
});

// 2. PUT /api/amistades/aceptar
// Aceptar solicitud de amistad (Quien acepta es el destino y se saca del token)
router.put('/aceptar', verificarToken, async (req, res) => {
    try {
        const id_usuario_destino = req.usuario.id; // Quien acepta es el usuario logueado
        const { id_usuario_origen } = req.body; // Quien mandó originalmente la solicitud

        if (!id_usuario_origen) {
            return res.status(400).json({ 
                error: 'Completá el campo obligatorio: id_usuario_origen (ID de quien envió la solicitud)' 
            });
        }

        const solicitudAceptada = await AmistadService.aceptarSolicitud(id_usuario_destino, id_usuario_origen);

        return res.status(200).json({
            mensaje: 'Solicitud de amistad aceptada correctamente',
            solicitud: solicitudAceptada
        });
    } catch (error) {
        console.error("Error al aceptar solicitud:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al aceptar la solicitud' 
        });
    }
});

// 3. DELETE /api/amistades/eliminar
// Rechazar solicitud o eliminar amistad existente (El usuario A es el logueado)
router.delete('/eliminar', verificarToken, async (req, res) => {
    try {
        const idUsuarioA = req.usuario.id;
        const idUsuarioB = req.body.id_usuario_b || req.query.id_usuario_b;

        if (!idUsuarioB) {
            return res.status(400).json({ 
                error: 'Debes proporcionar id_usuario_b (ID del otro usuario)' 
            });
        }

        await AmistadService.eliminarORechazarAmistad(idUsuarioA, idUsuarioB);

        return res.status(200).json({
            mensaje: 'Relación de amistad o solicitud eliminada correctamente'
        });
    } catch (error) {
        console.error("Error al eliminar amistad:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al procesar la baja de la relación' 
        });
    }
});

// 4. GET /api/amistades/pendientes
// Obtener solicitudes pendientes recibidas por el usuario logueado
router.get('/pendientes', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const pendientes = await AmistadService.listarSolicitudesPendientes(idUsuario);
        return res.status(200).json(pendientes);
    } catch (error) {
        console.error("Error al obtener pendientes:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al listar pendientes' 
        });
    }
});

// 5. GET /api/amistades/lista
// Obtener lista de amigos del usuario logueado
router.get('/lista', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const amigos = await AmistadService.listarAmigos(idUsuario);
        return res.status(200).json(amigos);
    } catch (error) {
        console.error("Error al listar amigos:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al obtener lista de amigos' 
        });
    }
});

// 6. GET /api/amistades/estado/:idOtroUsuario
// Obtener el estado específico de la relación actual con otro usuario
router.get('/estado/:idOtroUsuario', verificarToken, async (req, res) => {
    try {
        const idUsuario = req.usuario.id;
        const { idOtroUsuario } = req.params;
        const estadoRelacion = await AmistadService.obtenerEstadoRelacion(idUsuario, idOtroUsuario);
        return res.status(200).json(estadoRelacion);
    } catch (error) {
        console.error("Error al obtener estado relación:", error);
        return res.status(error.status || 500).json({ 
            error: error.message || 'Error interno al obtener estado de relación' 
        });
    }
});

module.exports = router;
