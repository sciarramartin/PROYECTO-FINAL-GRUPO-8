const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const EstadoMateriaAlumno = baseDeDatos.define('estado_materia_alumno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_inscripcion: {
        type: DataTypes.DATEONLY, 
        allowNull: true,
        validate: {
            is: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)[0-9]{2}$/
        }
    },
    nota_final: {
        type: DataTypes.FLOAT, 
        allowNull: true,
        validate: {
            min: 1,
            max: 10
        }
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
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'estado_materia_alumno',
    timestamps: false,

    indexes: [
            {
                fields: ['id_usuario', 'id_curso'] // Índice para búsquedas por usuario
            }
    ]
});


module.exports = EstadoMateriaAlumno;
