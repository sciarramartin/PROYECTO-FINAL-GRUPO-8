// modelos/Materia.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const Materia = baseDeDatos.define('Materia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nivel_anio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cuatrimestre: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'materias',
    timestamps: false
});

// Asociación M:N (Self-referencing) para Correlativas
Materia.belongsToMany(Materia, {
    as: 'correlativas',
    through: 'correlativas_x_materia',
    foreignKey: 'materia_base_id',
    otherKey: 'materia_correlativa_id',
    timestamps: false
});

Materia.belongsToMany(Materia, {
    as: 'es_correlativa_de',
    through: 'correlativas_x_materia',
    foreignKey: 'materia_correlativa_id',
    otherKey: 'materia_base_id',
    timestamps: false
});

module.exports = { Materia };
