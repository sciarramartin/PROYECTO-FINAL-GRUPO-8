// modelos/MaterialDeEstudioCalificaciones.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const MaterialDeEstudioCalificaciones = baseDeDatos.define('MaterialDeEstudioCalificaciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_material: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
    }
}, {
    tableName: 'material_calificaciones',
    timestamps: true
});

module.exports = { MaterialDeEstudioCalificaciones };