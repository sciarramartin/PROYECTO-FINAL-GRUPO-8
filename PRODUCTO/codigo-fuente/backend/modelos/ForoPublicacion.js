// modelos/ForoPublicacion.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoPublicacion = baseDeDatos.define('ForoPublicacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_materia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING,
        defaultValue: 'General'
    },
    votos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'foro_publicaciones',
    timestamps: true
});

module.exports = { ForoPublicacion };
