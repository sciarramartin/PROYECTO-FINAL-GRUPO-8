// servicios/material.servicio.js
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { Materia } = require('../modelos/materia.modelo');
const { Usuario } = require('../modelos/Usuario');
// agregado para calificaciones
const { MaterialDeEstudioCalificaciones } = require('../modelos/MaterialDeEstudioCalificaciones');


const {
    obtenerRutaRelativa,
    obtenerRutaAbsoluta,
    eliminarArchivo,
} = require('../repositorio/archivoRepositorio');

// ─── Mapper: convierte un registro interno (snake_case) a camelCase ──────────
/**
 * Transforma una instancia de MaterialDeEstudio (o su plain object) al formato
 * camelCase que se expone fuera de la API.
 *
 * Campos mapeados:
 *   id_materia          → idMateria
 *   id_usuario          → idUsuario
 *   fecha_de_publicacion→ fechaPublicacion
 *   Autor               → autor  (nombre completo como string)
 *   materia             → materia (nombre de la materia)
 *   etiquetas           → etiquetas (array parseado)
 *
 * @param {object} raw  Instancia Sequelize o plain object del modelo.
 * @returns {object}    Objeto en camelCase listo para serializar.
 */
function mapearMaterial(raw) {
    // Soporta instancias Sequelize y plain objects
    const item = typeof raw.toJSON === 'function' ? raw.toJSON() : raw;

    const etiquetas = parsearEtiquetas(item.etiquetas);

    let materia = null;
    // El modelo está definido como baseDeDatos.define('materia', ...) → la clave en toJSON() es 'materia' (minúscula)
    const materiaRaw = item.materia ?? item.Materia; // fallback por si algún día cambia el nombre del modelo
    if (materiaRaw && typeof materiaRaw === 'object') {
        materia = {
            id: materiaRaw.id,
            nombre: materiaRaw.nombre,
            codigo: materiaRaw.codigo ?? null,
        };
    } else if (typeof materiaRaw === 'string') {
        materia = { nombre: materiaRaw };
    }

    let autor = null;
    if (item.Autor) {
        autor = {
            id: item.Autor.id,
            nombre: item.Autor.nombre,
            apellido: item.Autor.apellido,
            nombreUsuario: item.Autor.nombre_usuario,
            nombreCompleto: `${item.Autor.nombre} ${item.Autor.apellido}`.trim(),
        };
    }

    return {
        id: item.id,
        titulo: item.titulo,
        ubicacion: item.ubicacion,
        etiquetas,
        likes: item.likes ?? 0,
        descargas: item.descargas ?? 0,

        // propiedades agregadas y calculadas de calificación 
        promedioCalificacion: parseFloat(item.promedioCalificacion || item.promedio || 0),
        totalVotos: parseInt(item.totalVotos || 0, 10),

        // snake_case de la BD → camelCase público
        idMateria: item.id_materia,
        idUsuario: item.id_usuario,
        fechaPublicacion: item.fecha_de_publicacion,

        // Relaciones enriquecidas (pueden ser null si no se hizo include)
        materia,
        autor,
    };
}

// ─── Helper: parsea el campo etiquetas (string JSON o CSV) → array ───────────
function parsearEtiquetas(etiquetas) {
    if (!etiquetas) return [];
    if (Array.isArray(etiquetas)) return etiquetas;
    try {
        const parsed = JSON.parse(etiquetas);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return etiquetas.split(/[,,; ]+/).filter(Boolean);
    }
}

// ─── Servicios ────────────────────────────────────────────────────────────────

/**
 * Lista todos los materiales incluyendo Materia y Autor.
 * Devuelve los datos en formato camelCase.
 */
async function listarMateriales({ idMateria, idUsuario } = {}) {
    const where = {};
    if (idMateria) where.id_materia = idMateria;
    if (idUsuario) where.id_usuario = idUsuario;

    const rows = await MaterialDeEstudio.findAll({
        where,
        order: [['fecha_de_publicacion', 'DESC']],
        include: [
            {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'codigo'],
            },
            {
                model: Usuario,
                as: 'Autor',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
            },
        ],
    });

    // Cargar todas las calificaciones para calcular métricas 
    const calificaciones = await MaterialDeEstudioCalificaciones.findAll({ raw: true });
    // Agrupar calificaciones por id_material
    const statsPorMaterial = {};
    for (const cal of calificaciones) {
        const idMat = cal.id_material;
        if (!statsPorMaterial[idMat]) {
            statsPorMaterial[idMat] = { suma: 0, totalVotos: 0 };
        }
        statsPorMaterial[idMat].suma += Number(cal.puntuacion || 0);
        statsPorMaterial[idMat].totalVotos += 1;
    }

    return rows.map((row) => {
        const item = row.toJSON();
        const stats = statsPorMaterial[item.id];
        if (stats && stats.totalVotos > 0) {
            item.promedioCalificacion = (stats.suma / stats.totalVotos).toFixed(1);
            item.totalVotos = stats.totalVotos;
        } else {
            item.promedioCalificacion = 0;
            item.totalVotos = 0;
        }
        return mapearMaterial(item);
    });
}

/**
 * Crea el registro en BD apuntando al archivo ya guardado por Multer.
 * Acepta camelCase (idMateria, idUsuario) o snake_case (id_materia, id_usuario).
 * Devuelve el material creado en formato camelCase.
 */
async function crearMaterial({ archivo, titulo, idMateria, idUsuario, etiquetas,
    id_materia, id_usuario }) {
    if (!archivo) {
        throw new Error('Se requiere un archivo');
    }

    // Soporte de ambas convenciones en la entrada
    const materiaId = idMateria ?? id_materia;
    const usuarioId = idUsuario ?? id_usuario;

    const ubicacion = obtenerRutaRelativa(archivo.path);

    const material = await MaterialDeEstudio.create({
        ubicacion,
        titulo,
        id_materia: materiaId,
        id_usuario: usuarioId,
        etiquetas: etiquetas || null,
    });

    return mapearMaterial(material);
}

/**
 * Busca un material por ID y verifica que el archivo físico exista.
 * Devuelve el material en formato camelCase.
 */
async function obtenerMaterialPorId(id) {
    const material = await MaterialDeEstudio.findByPk(id, {
        include: [
            {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'codigo'],
            },
            {
                model: Usuario,
                as: 'Autor',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
            },
        ],
    });
    if (!material) {
        throw new Error('Material no encontrado');
    }
    const item = material.toJSON();

    // Obtener calificaciones asociadas a este material
    const calificaciones = await MaterialDeEstudioCalificaciones.findAll({
        where: { id_material: id },
        raw: true
    });

    if (calificaciones.length > 0) {
        const suma = calificaciones.reduce((acc, c) => acc + Number(c.puntuacion || 0), 0);
        item.promedioCalificacion = (suma / calificaciones.length).toFixed(1);
        item.totalVotos = calificaciones.length;
    } else {
        item.promedioCalificacion = 0;
        item.totalVotos = 0;
    }

    return mapearMaterial(item);
}

/**
 * Elimina el registro en BD y el archivo físico.
 */
async function eliminarMaterial(id) {
    // Buscamos directamente en el modelo para acceder a ubicacion raw
    const material = await MaterialDeEstudio.findByPk(id);
    if (!material) {
        throw new Error('Material no encontrado');
    }

    eliminarArchivo(material.ubicacion);
    await material.destroy();

    return { eliminado: true, id };
}

/**
 * Devuelve la ruta absoluta para servir/descargar el archivo.
 * Acepta tanto el objeto camelCase como la instancia raw.
 */
function obtenerRutaParaDescarga(material) {
    return obtenerRutaAbsoluta(material.ubicacion);
}

/**
 * Nuevo para calificar material:
 * Emite o actualiza una calificación de un usuario para un material (Escenarios 1 y 2).
 */
async function registrarCalificacion({ idMaterial, idUsuario, puntuacion }) {
    // Escenario 2: Upsert / Prevención de duplicados
    let calificacion = await MaterialDeEstudioCalificaciones.findOne({
        where: { id_material: idMaterial, id_usuario: idUsuario }
    });

    if (calificacion) {
        calificacion.puntuacion = puntuacion;
        await calificacion.save();
    } else {
        await MaterialDeEstudioCalificaciones.create({
            id_material: idMaterial,
            id_usuario: idUsuario,
            puntuacion
        });
    }

    // Recálculo de promedio y total de votos
    const sequelize = MaterialDeEstudioCalificaciones.sequelize;

    const stats = await MaterialDeEstudioCalificaciones.findAll({
        where: { id_material: idMaterial },
        attributes: [
            [sequelize.fn('AVG', sequelize.col('puntuacion')), 'promedio'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalVotos']
        ],
        raw: true
    });

    const promedio = parseFloat(stats[0]?.promedio || 0).toFixed(1);
    const totalVotos = parseInt(stats[0]?.totalVotos || 0, 10);

    return {
        idMaterial: Number(idMaterial),
        miCalificacion: puntuacion,
        promedio: Number(promedio),
        totalVotos
    };
}

/**
 * Obtiene los materiales de una materia ordenados por calificación promedio (Escenario 3 - Ranking).
 */
async function listarMaterialesPorRanking(idMateria) {
    const sequelize = MaterialDeEstudio.sequelize;

    const rows = await MaterialDeEstudio.findAll({
        where: { id_materia: idMateria },
        attributes: {
            include: [
                [
                    sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('calificaciones.puntuacion')), 0),
                    'promedioCalificacion'
                ],
                [
                    sequelize.fn('COUNT', sequelize.col('calificaciones.id')),
                    'totalVotos'
                ]
            ]
        },
        include: [
            {
                model: Materia,
                as: 'materia',
                attributes: ['id', 'nombre', 'codigo'],
            },
            {
                model: Usuario,
                as: 'Autor',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario'],
            },
            {
                model: MaterialDeEstudioCalificaciones,
                as: 'calificaciones',
                attributes: []
            }
        ],
        group: ['MaterialDeEstudio.id'],
        order: [[sequelize.literal('promedioCalificacion'), 'DESC']]
    });

    return rows.map(mapearMaterial);
}
/**
 * Incrementa en 1 el contador de descargas de un material.
 * Emite o actualiza una calificación de un usuario para un material (Escenarios 1 y 2).
 */
async function registrarDescarga(id) {
    const material = await MaterialDeEstudio.findByPk(id);
    if (!material) {
        throw new Error('Material no encontrado');
    }
    material.descargas = (material.descargas ?? 0) + 1;
    await material.save();
    return mapearMaterial(material);
}

// ─── Alias mantenido por compatibilidad con código anterior ──────────────────
const obtenerTodos = listarMateriales;

module.exports = {
    mapearMaterial,
    crearMaterial,
    obtenerMaterialPorId,
    listarMateriales,
    eliminarMaterial,
    obtenerRutaParaDescarga,
    obtenerTodos,
    registrarCalificacion,
    listarMaterialesPorRanking,
    registrarDescarga,
};
