const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const inscripcionesCursos = baseDeDatos.define('inscripciones_cursos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_inscripcion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios', // Nombre de la tabla de usuarios
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_curso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cursos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'inscripciones_cursos',
    timestamps: false,

    indexes: [
        {
            fields: ['id_usuario', 'id_curso'] // Índice para búsquedas por usuario
        }
    ]
});


module.exports = inscripcionesCursos;
