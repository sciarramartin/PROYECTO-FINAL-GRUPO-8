// modelos/GrupoMensaje.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const GrupoMensaje = baseDeDatos.define('GrupoMensaje', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_grupo: {
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
    }
}, {
    tableName: 'grupo_mensajes',
    timestamps: true // Habilitamos timestamps para saber cuándo se publicó el mensaje
});

module.exports = { GrupoMensaje };
