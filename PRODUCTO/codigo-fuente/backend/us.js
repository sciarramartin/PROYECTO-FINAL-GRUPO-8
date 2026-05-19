// seed.js (en la raíz del backend, borralo después de usarlo)
require('dotenv').config();
const { baseDeDatos } = require('./configuracion/base-de-datos');
const { Usuario } = require('./modelos/Usuario');
const bcrypt = require('bcrypt');

const crearUsuario = async () => {
    await baseDeDatos.sync();
    const hash = await bcrypt.hash('123456', 10);
    await Usuario.create({
        mail: 'pruueba@mail.com',
        contraseña: hash,
        nombre: 'Usuario Prueba'
    });
    console.log('Usuario creado correctamente');
    process.exit();
};

crearUsuario();