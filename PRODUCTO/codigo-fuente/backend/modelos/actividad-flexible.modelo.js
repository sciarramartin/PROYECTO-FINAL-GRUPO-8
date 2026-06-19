const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos'); 

const ActividadFlexible = baseDeDatos.define('ActividadFlexible', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    horas_semanales: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'horas_semanales'
    },
    duracion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    preferencia_horaria: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'preferencia_horaria'
    },
    prioridad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { isIn: [[1, 2, 3]] }
    },
    dias_preferidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'dias_preferidos'
    }
}, {
    tableName: 'actividades_flexibles',
    timestamps: false
});

module.exports = ActividadFlexible;