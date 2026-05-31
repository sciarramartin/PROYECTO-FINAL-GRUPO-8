// modelos/MensajePrivado.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const MensajePrivado = baseDeDatos.define('MensajePrivado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_remitente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_destinatario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contenido: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    leido: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'mensaje_privados',
    timestamps: true
});

module.exports = { MensajePrivado };
