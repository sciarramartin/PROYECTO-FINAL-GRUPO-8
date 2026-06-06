// modelos/Perfil.js
const { DataTypes } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');

const Perfil = baseDeDatos.define('Perfil', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    apodo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    anio_cursado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },
    biografia: {
        type: DataTypes.STRING(250),
        allowNull: true,
        validate: {
            len: [0, 250]
        }
    },
    foto_perfil: {
        type: DataTypes.TEXT, // Para almacenar Base64 o URL de avatar
        allowNull: true
    },
    link_discord: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link_telegram: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link_whatsapp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link_github: {
        type: DataTypes.STRING,
        allowNull: true
    },
    link_linkedin: {
        type: DataTypes.STRING,
        allowNull: true
    },
    intereses: {
        type: DataTypes.TEXT, // Almacenará un JSON stringified de las áreas de interés
        allowNull: true
    },
    rol_equipo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mostrar_anio_cursado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    mostrar_contacto: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'perfiles',
    timestamps: true
});

module.exports = { Perfil };
