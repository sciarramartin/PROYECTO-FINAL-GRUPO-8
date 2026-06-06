// modelos/Grupo.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const Grupo = baseDeDatos.define('Grupo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_creador: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'publico',
        validate: {
            isIn: [['publico', 'privado']]
        }
    }
}, {
    tableName: 'grupos',
    timestamps: true
});

module.exports = { Grupo };
