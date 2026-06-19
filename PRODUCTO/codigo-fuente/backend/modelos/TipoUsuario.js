const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const TipoUsuario = baseDeDatos.define('tipo_usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'tipos_usuarios',
    timestamps: false
});

module.exports = { TipoUsuario };