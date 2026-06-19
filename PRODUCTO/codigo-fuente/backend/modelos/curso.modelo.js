const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const Curso = baseDeDatos.define('curso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    hora_inicio: {
        type: DataTypes.TIME, 
        allowNull: false,
        validate: {
            is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/ 
        }
    },
    duracion: {
        type: DataTypes.INTEGER, // Duración en minutos
        allowNull: false,
        validate: {
            min: 1,
            max: 1440 // Máximo 24 horas en minutos
        }
    },
    dias: {
        type: DataTypes.INTEGER, // TINYINT.UNSIGNED para para bd no sqlite
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 127 // 2^7 - 1 (todos los 7 días)
        }
    },
    id_materia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'materias', // Nombre de la tabla de usuarios
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'cursos',
    timestamps: false,

    indexes: [
            {
                fields: ['id_materia'] // Índice para búsquedas por usuario
            }
    ]
});


module.exports = Curso;
