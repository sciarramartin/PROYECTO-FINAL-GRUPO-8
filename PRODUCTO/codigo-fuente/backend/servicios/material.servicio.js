// servicios/material.servicio.js
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { Materia } = require('../modelos/materia.modelo');
const { Usuario } = require('../modelos/Usuario');

const {
    obtenerRutaRelativa,
    obtenerRutaAbsoluta,
    eliminarArchivo,
    archivoExiste
} = require('../repositorio/archivoRepositorio');

const path = require('path');
/**
 * Obtiene todos los materiales de estudio del repositorio,
 * incluyendo los detalles de su materia y autor correspondientes.
 */
const obtenerTodos = async () => {
    return await MaterialDeEstudio.findAll({
        include: [
            {
                model: Materia,
                attributes: ['id', 'nombre', 'codigo']
            },
            {
                model: Usuario,
                as: 'Autor',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
            }
        ]
    });
};
// Crea el registro en BD apuntando al archivo ya guardado por Multer
async function crearMaterial({ archivo, titulo, id_materia, id_usuario, etiquetas }) {
    if (!archivo) {
        throw new Error('Se requiere un archivo');
    }

    // Multer ya guardó el archivo; calculamos la ruta relativa para la BD
    const ubicacion = obtenerRutaRelativa(archivo.path);

    const material = await MaterialDeEstudio.create({
        ubicacion,
        titulo,
        id_materia,
        id_usuario,
        etiquetas: etiquetas || null,
    });

    return material;
}

// Busca un material por ID y verifica que el archivo físico exista
async function obtenerMaterialPorId(id) {
    const material = await MaterialDeEstudio.findByPk(id);
    if (!material) {
        throw new Error('Material no encontrado');
    }
    return material;
}

// Lista materiales con filtros opcionales
async function listarMateriales({ id_materia, id_usuario } = {}) {
    const where = {};
    if (id_materia) where.id_materia = id_materia;
    if (id_usuario) where.id_usuario = id_usuario;

    return MaterialDeEstudio.findAll({ where, order: [['fecha_de_publicacion', 'DESC']] });
}

// Elimina el registro en BD y el archivo físico
async function eliminarMaterial(id) {
    const material = await obtenerMaterialPorId(id);

    eliminarArchivo(material.ubicacion);   // borra el binario del disco
    await material.destroy();              // borra el registro de la BD

    return { eliminado: true, id };
}

// Devuelve la ruta absoluta para servir/descargar el archivo
function obtenerRutaParaDescarga(material) {
    return obtenerRutaAbsoluta(material.ubicacion);
}

module.exports = {
    crearMaterial,
    obtenerMaterialPorId,
    listarMateriales,
    eliminarMaterial,
    obtenerRutaParaDescarga,
    obtenerTodos
};

