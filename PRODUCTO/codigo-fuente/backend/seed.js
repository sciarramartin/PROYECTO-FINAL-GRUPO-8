// seed.js  (en la raíz del backend, lo borrás después)
require('dotenv').config();
const { baseDeDatos } = require('./configuracion/base-de-datos');
const { Usuario } = require('./modelos/Usuario');
const bcrypt = require('bcrypt');

const crearUsuario = async () => {
    await baseDeDatos.sync();
    const hash = await bcrypt.hash('123456', 10);
    await Usuario.create({
        mail: 'sosa44192872@gmail.com',
        contraseña: hash,
        nombre: 'Franco Sosa'
    });
    console.log('Usuario creado correctamente');
    process.exit();
};

crearUsuario();