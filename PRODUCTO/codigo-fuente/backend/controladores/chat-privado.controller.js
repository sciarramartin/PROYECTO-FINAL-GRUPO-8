// controladores/chat-privado.controller.js
const { MensajePrivado } = require('../modelos/MensajePrivado');
const { Usuario } = require('../modelos/Usuario');
const { verificarToken } = require('../middleware/authMiddleware');
const AmistadService = require('../servicios/amistad.service');
const { Op } = require('sequelize');
const express = require('express');
const router = express.Router();

// 1. GET /api/chat-privado/notificaciones/pendientes
// Obtiene los mensajes privados no leídos dirigidos al usuario logueado
router.get('/notificaciones/pendientes', verificarToken, async (req, res) => {
    try {
        const miUsuarioId = req.usuario.id;

        const mensajesPendientes = await MensajePrivado.findAll({
            where: {
                id_destinatario: miUsuarioId,
                leido: false
            },
            include: [
                {
                    model: Usuario,
                    as: 'Remitente',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(mensajesPendientes);
    } catch (error) {
        console.error("Error al obtener notificaciones de mensajes pendientes:", error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 2. GET /api/chat-privado/:amigoId
// Obtiene el historial de mensajes de chat privado entre el usuario logueado y el amigo
router.get('/:amigoId', verificarToken, async (req, res) => {
    try {
        const miUsuarioId = req.usuario.id;
        const amigoId = parseInt(req.params.amigoId, 10);

        if (isNaN(amigoId)) {
            return res.status(400).json({ error: 'El ID del amigo debe ser un número válido.' });
        }

        // Validar que sean amigos aceptados
        const relacion = await AmistadService.obtenerEstadoRelacion(miUsuarioId, amigoId);
        if (relacion.estado !== 'aceptado') {
            return res.status(403).json({ error: 'No tienes permisos para ver este chat. Deben ser amigos conectados.' });
        }

        // Obtener el historial completo
        const mensajes = await MensajePrivado.findAll({
            where: {
                [Op.or]: [
                    { id_remitente: miUsuarioId, id_destinatario: amigoId },
                    { id_remitente: amigoId, id_destinatario: miUsuarioId }
                ]
            },
            order: [['createdAt', 'ASC']],
            include: [
                {
                    model: Usuario,
                    as: 'Remitente',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                },
                {
                    model: Usuario,
                    as: 'Destinatario',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                }
            ]
        });

        // Opcional: marcar como leídos los mensajes que me envió mi amigo
        await MensajePrivado.update(
            { leido: true },
            {
                where: {
                    id_remitente: amigoId,
                    id_destinatario: miUsuarioId,
                    leido: false
                }
            }
        );

        return res.status(200).json(mensajes);
    } catch (error) {
        console.error("Error al obtener historial de chat privado:", error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// 2. POST /api/chat-privado/:amigoId
// Envía un mensaje privado a un amigo
router.post('/:amigoId', verificarToken, async (req, res) => {
    try {
        const miUsuarioId = req.usuario.id;
        const amigoId = parseInt(req.params.amigoId, 10);
        const { contenido } = req.body;

        if (isNaN(amigoId)) {
            return res.status(400).json({ error: 'El ID del amigo debe ser un número válido.' });
        }

        if (!contenido || !contenido.trim()) {
            return res.status(400).json({ error: 'El contenido del mensaje no puede estar vacío.' });
        }

        // Validar que sean amigos aceptados
        const relacion = await AmistadService.obtenerEstadoRelacion(miUsuarioId, amigoId);
        if (relacion.estado !== 'aceptado') {
            return res.status(403).json({ error: 'No tienes permisos para enviar mensajes a este usuario. Deben ser amigos conectados.' });
        }

        // Crear el mensaje
        const nuevoMensaje = await MensajePrivado.create({
            id_remitente: miUsuarioId,
            id_destinatario: amigoId,
            contenido: contenido.trim(),
            leido: false
        });

        // Obtener el mensaje completo con asociaciones
        const mensajeCompleto = await MensajePrivado.findByPk(nuevoMensaje.id, {
            include: [
                {
                    model: Usuario,
                    as: 'Remitente',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                },
                {
                    model: Usuario,
                    as: 'Destinatario',
                    attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
                }
            ]
        });

        // Enviar a través de Socket.io en tiempo real si el destinatario está online
        const socketDestino = req.usuariosConectados?.get(amigoId);
        if (socketDestino) {
            req.io.to(socketDestino).emit('mensaje_privado', mensajeCompleto);
            console.log(`[Socket.io] Mensaje privado enviado al socket del usuario ${amigoId}`);
        }

        return res.status(201).json(mensajeCompleto);
    } catch (error) {
        console.error("Error al enviar mensaje privado:", error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

const ChatPrivadoController = router;
module.exports = ChatPrivadoController;
