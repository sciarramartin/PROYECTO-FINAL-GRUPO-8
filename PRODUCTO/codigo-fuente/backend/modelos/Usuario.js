// modelos/Usuario.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const Usuario = baseDeDatos.define('usuario', {
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
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    anio_ingreso: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_carrera: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_tipo_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_plan_academico: {
        type: DataTypes.INTEGER,
        allowNull: true
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