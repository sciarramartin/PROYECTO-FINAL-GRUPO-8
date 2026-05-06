const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const Ejemplo = baseDeDatos.define('Ejemplo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'ejemplos',
    timestamps: false
});

module.exports = Ejemplo;
