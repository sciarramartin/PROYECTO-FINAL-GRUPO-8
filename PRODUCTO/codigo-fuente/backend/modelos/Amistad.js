// modelos/Amistad.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const Amistad = baseDeDatos.define('Amistad', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario_origen: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario_destino: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: [['pendiente', 'aceptado', 'rechazado']]
        }
    }
}, {
    tableName: 'amistades',
    timestamps: true // Habilitamos timestamps para saber cuándo se envió/actualizó la solicitud
});

module.exports = { Amistad };
