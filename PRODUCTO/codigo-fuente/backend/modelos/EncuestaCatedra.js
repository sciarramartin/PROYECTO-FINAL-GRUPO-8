const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const EncuestaCatedra = baseDeDatos.define('EncuestaCatedra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_materia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'materias',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    id_curso: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'cursos',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    dificultad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    claridad_docente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    disponibilidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    es_anonima: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'encuestas_catedra',
    timestamps: true,
    indexes: [
        {
            fields: ['id_materia']
        },
        {
            fields: ['id_usuario', 'id_materia']
        }
    ]
});

module.exports = { EncuestaCatedra };
