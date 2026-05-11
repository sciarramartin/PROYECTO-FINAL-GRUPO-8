// modelos/Carrera.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const Carrera = baseDeDatos.define('Carrera', {
    id_carrera: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    facultad: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'carreras',
    timestamps: false
});

module.exports = { Carrera };