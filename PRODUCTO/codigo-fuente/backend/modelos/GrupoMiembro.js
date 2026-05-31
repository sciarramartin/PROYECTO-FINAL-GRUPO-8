// modelos/GrupoMiembro.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const GrupoMiembro = baseDeDatos.define('GrupoMiembro', {
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
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'miembro',
        validate: {
            isIn: [['administrador', 'miembro']]
        }
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pendiente',
        validate: {
            isIn: [['pendiente', 'aceptado']]
        }
    }
}, {
    tableName: 'grupo_miembros',
    timestamps: true
});

module.exports = { GrupoMiembro };
