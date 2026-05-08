const express = require('express');
const cors = require('cors');
const { baseDeDatos } = require('./configuracion/base-de-datos');
const rutasEjemplo = require('./rutas/rutas-ejemplo');
const rutasActividad = require('./rutas/actividades-personales.ruta.js');


const app = express();
const PUERTO = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/ejemplos', rutasEjemplo);
app.use('/api/actividad-personal', rutasActividad);


// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: 'Bienvenido a la API del Sistema Académico' });
});

// Iniciar servidor y conectar a la base de datos
const iniciarServidor = async () => {
    try {
        await baseDeDatos.sync({ force: false });
        console.log('Base de datos conectada correctamente.');
        app.listen(PUERTO, () => {
            console.log(`Servidor corriendo en el puerto ${PUERTO}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
};

iniciarServidor();
