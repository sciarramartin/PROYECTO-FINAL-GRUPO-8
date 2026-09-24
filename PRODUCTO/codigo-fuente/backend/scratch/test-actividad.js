const { baseDeDatos } = require('../database/base-de-datos');
const { ForoPublicacion, Materia } = require('../modelos/asociaciones');

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
            console.log("=== PUBLICACION KEYS ===");
            console.log(Object.keys(pub.toJSON()));
            console.log("=== MATERIA OBJECT ===");
            console.log(pub.toJSON().materia || pub.toJSON().Materia);
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
