// modelos/Materia.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const Materia = baseDeDatos.define('materia', {
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
    visible_en_grafo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    id_carrera: {
        type: DataTypes.INTEGER,
        allowNull: true // True temporalmente para compatibilidad hacia atrás
    }
}, {
    tableName: 'materias',
    timestamps: false
});

const CorrelativaXMateria = baseDeDatos.define('correlativas_x_materia', {
    materia_base_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    materia_correlativa_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    tipo_requisito: {
        type: DataTypes.STRING,
        defaultValue: 'regular', // 'regular' o 'aprobada'
        allowNull: false
    }
}, {
    tableName: 'correlativas_x_materia',
    timestamps: false
});

// Asociación M:N (Self-referencing) para Correlativas
Materia.belongsToMany(Materia, {
    as: 'correlativas',
    through: CorrelativaXMateria,
    foreignKey: 'materia_base_id',
    otherKey: 'materia_correlativa_id',
    timestamps: false
});

Materia.belongsToMany(Materia, {
    as: 'es_correlativa_de',
    through: CorrelativaXMateria,
    foreignKey: 'materia_correlativa_id',
    otherKey: 'materia_base_id',
    timestamps: false
});

module.exports = { Materia, CorrelativaXMateria };
