const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../configuracion/base-de-datos');

const TipoUsuario = baseDeDatos.define('TipoUsuario', {
    id_tipo_usuario: {
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
    tableName: 'tipo_usuarios',
    timestamps: false
});

module.exports = { TipoUsuario };