// modelos/ForoReporte.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoReporte = baseDeDatos.define('ForoReporte', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario_reportador: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    resuelto: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'foro_reportes',
    timestamps: true
});

module.exports = { ForoReporte };
