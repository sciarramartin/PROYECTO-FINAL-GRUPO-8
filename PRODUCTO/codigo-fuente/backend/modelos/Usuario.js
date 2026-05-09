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
    apellido: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    id_carrera: {
        type: DataTypes.STRING,
        allowNull: true
    },
    anio_ingreso: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tipo_usuario: {
        type: DataTypes.ENUM(
            'estudiante',
            'administrador'
        ),
        defaultValue: 'estudiante'
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