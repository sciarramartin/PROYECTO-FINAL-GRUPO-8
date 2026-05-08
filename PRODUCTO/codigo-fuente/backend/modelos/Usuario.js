// modelos/Usuario.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const Usuario = baseDeDatos.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    contraseña: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reset_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_token_expira: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});

module.exports = { Usuario };