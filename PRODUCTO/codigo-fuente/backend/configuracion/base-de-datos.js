// config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');

const baseDeDatos = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../base-de-datos.sqlite'),
    logging: false
});

const conectarDB = async () => {
    try {
        await baseDeDatos.authenticate();
        console.log('Conexión exitosa con SQLite.');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    }
};

module.exports = { baseDeDatos, conectarDB };