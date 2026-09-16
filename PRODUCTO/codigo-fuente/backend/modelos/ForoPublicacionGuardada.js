// modelos/ForoPublicacionGuardada.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoPublicacionGuardada = baseDeDatos.define('ForoPublicacionGuardada', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'foro_publicaciones_guardadas',
    timestamps: true
});

module.exports = { ForoPublicacionGuardada };
