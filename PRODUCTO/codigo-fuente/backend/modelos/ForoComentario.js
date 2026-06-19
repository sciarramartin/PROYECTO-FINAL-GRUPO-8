// modelos/ForoComentario.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoComentario = baseDeDatos.define('ForoComentario', {
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
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    votos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    id_comentario_padre: {
        type: DataTypes.INTEGER,
        allowNull: true, // 🎯 CRÍTICO: Tiene que ser true para que acepte comentarios principales
        defaultValue: null
    }
}, {
    tableName: 'foro_comentarios',
    timestamps: true
});

module.exports = { ForoComentario };
