const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const EstadoMateria = baseDeDatos.define('estado_materia_alumno', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_materia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'No Cursada' // 'Aprobada', 'Regular', 'No Cursada'
    }
}, {
    tableName: 'estado_materia_alumno',
    timestamps: false
});

module.exports = { EstadoMateria };
