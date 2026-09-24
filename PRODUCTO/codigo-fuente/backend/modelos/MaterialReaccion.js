// modelos/ForoReaccion.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const MaterialReaccion = baseDeDatos.define('MaterialReaccion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_material: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tipo: {
        type: DataTypes.STRING, // 'positivo' o 'negativo'
        allowNull: false
    }
}, {
    tableName: 'material_reacciones',
    timestamps: true
});

module.exports = { MaterialReaccion };
