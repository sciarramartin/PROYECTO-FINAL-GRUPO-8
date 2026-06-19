require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Ir agregando los modelos
require('./modelos/Usuario');
require('./modelos/Carrera');
require('./modelos/TipoUsuario');
require('./modelos/Carrera.js');
require('./modelos/EstadoMateria');
require('./modelos/Amistad');
require('./modelos/Grupo');
require('./modelos/GrupoMiembro');
require('./modelos/GrupoMensaje');
require('./modelos/MensajePrivado');
require('./modelos/Perfil');
require('./modelos/ForoPublicacion');
require('./modelos/ForoComentario');
require('./modelos/ForoReaccion');
require('./modelos/ForoPublicacionGuardada');
require('./modelos/ForoReporte');

require('./modelos/asociaciones');

const { inicializarDB } = require('./database/base-de-datos');

const rutasActividad = require('./controladores/actividades-personales.controlador.js');
const rutasActividadesFlexibles = require('./controladores/actividades-flexibles.controlador.js');
const rutasCursos = require('./controladores/curso.controlador.js');
const rutasInscripciones = require('./controladores/inscripciones-cursos.controlador.js');
const rutasUsuarios = require('./controladores/controlador-usuarios.js');
const rutasAuth = require('./controladores/auth.controller.js');       
const rutasMateria = require('./controladores/materia.controlador');
const rutasCarreras = require('./controladores/controlador-carreras.js'); // para probar resgitro
const rutasProgreso = require('./controladores/progreso.controlador.js');
const rutasPlanesAcademicos = require('./controladores/plan-academico.controlador.js');
const rutasAmistades = require('./controladores/amistad.controller.js');
const rutasGrupos = require('./controladores/grupo.controller.js');
const rutasChatPrivado = require('./controladores/chat-privado.controller.js');
const rutasPerfil = require('./controladores/perfil.controller.js');
const rutasForo = require('./controladores/Foro-controllers/foro.controller.js');
const rutasPublicacion = require('./controladores/Foro-controllers/publicacion.controller.js');
const rutasComentario = require('./controladores/Foro-controllers/comentario.controller.js');


const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PUERTO = process.env.PORT || 3000;

// Configurar servidor HTTP y Socket.io
const servidorHttp = http.createServer(app);
const io = new Server(servidorHttp, {
    cors: {
        origin: '*', // En producción limitar al dominio frontend
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Mapa de usuarios conectados a sockets (id_usuario => socketId)
const usuariosConectados = new Map();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        usuariosConectados.set(parseInt(userId, 10), socket.id);
        console.log(`[Socket.io] Usuario ${userId} conectado en socket: ${socket.id}`);
    }

    // El cliente se une a la sala de chat de grupo
    socket.on('unirse_grupo', (idGrupo) => {
        socket.join(`grupo_${idGrupo}`);
        console.log(`[Socket.io] Socket ${socket.id} se unió a la sala grupo_${idGrupo}`);
    });

    // El cliente abandona la sala de chat de grupo
    socket.on('salir_grupo', (idGrupo) => {
        socket.leave(`grupo_${idGrupo}`);
        console.log(`[Socket.io] Socket ${socket.id} abandonó la sala grupo_${idGrupo}`);
    });

    socket.on('disconnect', () => {
        if (userId) {
            usuariosConectados.delete(parseInt(userId, 10));
            console.log(`[Socket.io] Usuario ${userId} desconectado`);
        }
    });
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Inyectar io y usuariosConectados en req para los controladores
app.use((req, res, next) => {
    req.io = io;
    req.usuariosConectados = usuariosConectados;
    next();
});

// Rutas
app.use('/api/auth', rutasAuth);                                  
app.use('/api/materias', rutasMateria);
app.use('/api/actividad-personal', rutasActividad);
app.use('/api/planificador/actividades-flexibles', rutasActividadesFlexibles);
app.use('/api/cursos', rutasCursos);
app.use('/api/inscripcion', rutasInscripciones);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/carreras', rutasCarreras); // para probar registro
app.use('/api/progreso', rutasProgreso);
app.use('/api/planes-academicos', rutasPlanesAcademicos);
app.use('/api/amistades', rutasAmistades);
app.use('/api/grupos', rutasGrupos);
app.use('/api/chat-privado', rutasChatPrivado);
app.use('/api/perfiles', rutasPerfil);
app.use('/api/foro', rutasForo);
app.use('/api/publicaciones', rutasPublicacion);
app.use('/api/foro/comentarios', rutasComentario);

// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: 'Bienvenido a la API del Sistema Académico' });
});

// Iniciar servidor y conectar a la base de datos
const iniciarServidor = async () => {
    try {

        await inicializarDB();
        console.log('Base de datos conectada correctamente.');
        
        const servidor = servidorHttp.listen(PUERTO, () => {
            console.log(`Servidor corriendo en el puerto ${PUERTO} con soporte de WebSockets`);
        });

        servidor.on('error', (error) => {
            console.error('Error en el servidor:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

iniciarServidor();