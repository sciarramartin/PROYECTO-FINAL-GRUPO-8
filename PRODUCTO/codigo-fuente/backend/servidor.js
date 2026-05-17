require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Ir agregando los modelos
require('./modelos/Usuario');
require('./modelos/Carrera');
require('./modelos/TipoUsuario');

require('./modelos/asociaciones');

const { baseDeDatos } = require('./configuracion/base-de-datos');
const { router: authRoutes } = require('./rutas/authRoutes');
const rutasMateria = require('./controladores/materia.controlador');

const app = express();
const PUERTO = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/materias', rutasMateria);

// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: 'Bienvenido a la API del Sistema Académico' });
});

// Iniciar servidor y conectar a la base de datos
const iniciarServidor = async () => {
    try {
        // Quitamos { alter: true } para que SQLite no borre las relaciones M:N al reiniciar
        await baseDeDatos.sync();
        console.log('Base de datos conectada correctamente.');
        
        const servidor = app.listen(PUERTO, () => {
            console.log(`Servidor corriendo en el puerto ${PUERTO}`);
        });

        // Manejar errores del servidor
        servidor.on('error', (error) => {
            console.error('Error en el servidor:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

iniciarServidor();