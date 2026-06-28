const { Sequelize } = require('sequelize');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'base-de-datos.sqlite');

const baseDeDatos = new Sequelize({
    dialect: 'sqlite',
    storage: DB_PATH,
    logging: false
});

const inicializarDB = async () => {
    const schema = fs.readFileSync(
        path.join(__dirname, 'schema.sql'),
        'utf8'
    );

    const seed = fs.readFileSync(
        path.join(__dirname, 'seed.sql'),
        'utf8'
    );

    // 🎯 LEER VARIABLE DE ENTORNO: Si no está definida en el .env, por defecto es false
    const FORCE_RESET = process.env.DB_FORCE_RESET === 'true';

    // Si la configuración pide resetear, borramos el archivo físico
    if (FORCE_RESET && fs.existsSync(DB_PATH)) {
        try {
            fs.unlinkSync(DB_PATH);
            console.log(" [DB] Base de datos eliminada automáticamente (DB_FORCE_RESET=true)");
        } catch (error) {
            console.error("Error al eliminar la base de datos:", error);
        }
    }

    // Si no existe (porque se borró recién o porque es la primera vez), se crea de cero
    if (!fs.existsSync(DB_PATH)) {
        console.log(" [DB] Base de datos no encontrada. Creando e inicializando con estructura y semillas...");
        
        await new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH);

            db.exec(schema, (err) => {
                if (err) return reject(err);

                db.exec(seed, (err) => {
                    if (err) return reject(err);

                    db.close();
                    resolve();
                });
            });
        });
    } else {
        console.log(" [DB] Base de datos existente encontrada. Manteniendo los datos locales...");
    }

    // Sequelize se conecta directamente al archivo físico que ya existe o se acaba de crear
    await baseDeDatos.authenticate();
    console.log('Base de datos inicializada y conectada con Sequelize');
};

module.exports = {
    baseDeDatos,
    inicializarDB
};
