const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './base-de-datos.sqlite',
    logging: false
});

const Usuario = sequelize.define('usuarios', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    nombre: { type: DataTypes.STRING },
    apellido: { type: DataTypes.STRING },
    nombre_usuario: { type: DataTypes.STRING },
    mail: { type: DataTypes.STRING }
}, {
    tableName: 'usuarios',
    timestamps: false
});

async function run() {
    try {
        const users = await Usuario.findAll();
        console.log("=== USERS IN DATABASE ===");
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
