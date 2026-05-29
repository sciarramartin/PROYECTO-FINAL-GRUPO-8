require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Ir agregando los modelos
require('./modelos/Usuario');
require('./modelos/Carrera');
require('./modelos/TipoUsuario');
require('./modelos/Carrera.js')
require('./modelos/EstadoMateria');

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


const app = express();
const PUERTO = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

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

// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: 'Bienvenido a la API del Sistema Académico' });
});

// Iniciar servidor y conectar a la base de datos
const iniciarServidor = async () => {
    try {

        await inicializarDB();
        console.log('Base de datos conectada correctamente.');
        
        const servidor = app.listen(PUERTO, () => {
            console.log(`Servidor corriendo en el puerto ${PUERTO}`);
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