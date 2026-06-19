const { baseDeDatos } = require('../database/base-de-datos');
const { ForoPublicacion } = require('../modelos/ForoPublicacion');
const { Materia } = require('../modelos/materia.modelo');
require('../modelos/asociaciones'); // load associations

async function test() {
    try {
        const pub = await ForoPublicacion.findOne({
            include: [
                {
                    model: Materia,
                    attributes: ['id', 'nombre', 'codigo']
                }
            ]
        });
        if (pub) {
            console.log("=== PUBLICACION KEYS (DIRECT IMPORT) ===");
            console.log(Object.keys(pub.toJSON()));
            console.log("=== MATERIA KEY IN JSON ===");
            console.log(pub.toJSON());
        } else {
            console.log("No publications found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
