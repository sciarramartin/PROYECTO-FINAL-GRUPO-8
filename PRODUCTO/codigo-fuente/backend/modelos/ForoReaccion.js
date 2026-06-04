// modelos/ForoReaccion.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoReaccion = baseDeDatos.define('ForoReaccion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING, // 'positivo' o 'negativo'
        allowNull: false
    }
}, {
    tableName: 'foro_reacciones',
    timestamps: true
});

module.exports = { ForoReaccion };
