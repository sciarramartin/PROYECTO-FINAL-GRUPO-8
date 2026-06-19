// modelos/PlanAcademico.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const PlanAcademico = baseDeDatos.define('PlanAcademico', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_carrera: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'planes_academicos',
    timestamps: false
});

module.exports = { PlanAcademico };
