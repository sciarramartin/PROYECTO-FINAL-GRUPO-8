
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

    //if (fs.existsSync(DB_PATH)) {
            //fs.unlinkSync(DB_PATH);
            //console.log("Base eliminada");
    //};

    if (!fs.existsSync(DB_PATH)) {
        console.log("Base de datos no encontrada. Creando e inicializando con estructura y semillas...");
        
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
        console.log("Base de datos existente encontrada. Manteniendo los datos...");
    }

    // Sequelize se conecta directamente al archivo físico que ya existe o se acaba de crear
    await baseDeDatos.authenticate();

    console.log('Base de datos inicializada y conectada');

    // await new Promise((resolve, reject) => {
    //     const db = new sqlite3.Database(DB_PATH);

    //     db.exec(schema, (err) => {
    //         if (err) return reject(err);

    //         db.exec(seed, (err) => {
    //             if (err) return reject(err);

    //             db.close();
    //             resolve();
    //         });
    //     });
    // });

    // await baseDeDatos.authenticate();

    // console.log('Base de datos inicializada y conectada');
};

module.exports = {
    baseDeDatos,
    inicializarDB
};