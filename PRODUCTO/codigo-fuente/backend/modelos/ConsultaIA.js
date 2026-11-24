// modelos/ConsultaIA.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ConsultaIA = baseDeDatos.define('ConsultaIA', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    total_fuentes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    satisfactoria: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'consultas_ia',
    timestamps: true
});

module.exports = { ConsultaIA };
