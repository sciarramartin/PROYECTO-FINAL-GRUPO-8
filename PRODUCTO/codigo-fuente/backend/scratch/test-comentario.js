const { baseDeDatos } = require('../database/base-de-datos');
const { ForoComentario, ForoPublicacion, Materia } = require('../modelos/asociaciones');

async function test() {
    try {
        const com = await ForoComentario.findOne({
            include: [
                {
                    model: ForoPublicacion,
                    attributes: ['id', 'titulo', 'id_materia'],
                    include: [
                        {
                            model: Materia,
                            attributes: ['id', 'nombre', 'codigo']
                        }
                    ]
                }
            ]
        });
        if (com) {
            console.log("=== COMENTARIO KEYS ===");
            console.log(Object.keys(com.toJSON()));
            console.log("=== FOROPUBLICACION OBJECT IN COMENTARIO ===");
            console.log(com.toJSON().ForoPublicacion);
        } else {
            console.log("No comments found.");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

test();
