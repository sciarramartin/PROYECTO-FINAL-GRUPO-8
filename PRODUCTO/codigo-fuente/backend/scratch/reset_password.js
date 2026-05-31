// scratch/reset_password.js
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './base-de-datos.sqlite',
    logging: false
});

const Usuario = sequelize.define('usuarios', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    contraseña: { type: DataTypes.STRING },
    mail: { type: DataTypes.STRING }
}, {
    tableName: 'usuarios',
    timestamps: false
});

async function run() {
    try {
        const hash = await bcrypt.hash('123456', 10);
        await Usuario.update({ contraseña: hash }, { where: { mail: 'mateo@gmail.com' } });
        await Usuario.update({ contraseña: hash }, { where: { mail: 'maria.gomez@mail.com' } });
        console.log("Passwords updated successfully to '123456'!");
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}

run();
