const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de la base de datos SQLite
const baseDeDatos = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../base-de-datos.sqlite'),
    logging: false // Cambiar a true si deseas ver las consultas SQL en la consola
});

module.exports = { baseDeDatos };
