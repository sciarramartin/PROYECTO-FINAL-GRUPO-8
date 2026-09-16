// modelos/ForoEtiqueta.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const ForoEtiqueta = baseDeDatos.define('ForoEtiqueta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_publicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'foro_etiquetas',
    timestamps: true
});

module.exports = { ForoEtiqueta };
