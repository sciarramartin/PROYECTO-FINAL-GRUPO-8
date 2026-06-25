// modelos/MaterialDeEstudio.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const MaterialDeEstudio = baseDeDatos.define('MaterialDeEstudio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ubicacion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    id_materia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    etiquetas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha_de_publicacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'materiales_estudio',
    timestamps: false
});

module.exports = { MaterialDeEstudio };
