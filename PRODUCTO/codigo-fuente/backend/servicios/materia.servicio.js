// servicios/MateriaService.js
const { Materia } = require('../modelos/materia.modelo');

// Algoritmo recursivo DFS para buscar ciclos.
// Verifica si 'materiaRequisitoId' requiere en algún punto a 'materiaDestinoId'
const tieneCiclo = async (materiaDestinoId, materiaRequisitoId, visitados = new Set()) => {
    // Si la materia destino y el requisito son la misma, es un ciclo directo.
    if (materiaDestinoId === materiaRequisitoId) return true;
    
    // Si ya visitamos este nodo en este camino, cortamos para no entrar en bucle infinito.
    if (visitados.has(materiaRequisitoId)) return false;
    visitados.add(materiaRequisitoId);

    const requisito = await Materia.findByPk(materiaRequisitoId, { include: 'correlativas' });
    if (!requisito || !requisito.correlativas) return false;

    // Buscar recursivamente en las dependencias del requisito
    for (const corr of requisito.correlativas) {
        if (corr.id === materiaDestinoId) return true;
        const hayCicloProfundo = await tieneCiclo(materiaDestinoId, corr.id, visitados);
        if (hayCicloProfundo) return true;
    }
    return false;
};

const crearMateria = async (datos) => {
    const { codigo, nombre, nivel_anio, cuatrimestre, correlativas, id_carrera, visible_en_grafo } = datos;

    // 1. Crear la materia principal
    const nuevaMateria = await Materia.create({
        codigo,
        nombre,
        nivel_anio,
        cuatrimestre,
        id_carrera,
        visible_en_grafo: visible_en_grafo ?? false
    });

    // 2. Si vienen correlativas, asignarlas con su tipo de requisito
    if (correlativas && correlativas.length > 0) {
        for (const req of correlativas) {
            if (await tieneCiclo(nuevaMateria.id, req.id)) {
                // Hacemos rollback manual eliminando la materia recién creada
                await nuevaMateria.destroy();
                throw new Error(`Dependencia circular detectada con la materia ID: ${req.id}`);
            }
        }
        // Construimos el array de relaciones para la tabla intermedia
        for (const req of correlativas) {
            await nuevaMateria.addCorrelativa(req.id, { through: { tipo_requisito: req.tipo_requisito || 'regular' }});
        }
    }

    return await Materia.findByPk(nuevaMateria.id, { 
        include: { model: Materia, as: 'correlativas', through: { attributes: ['tipo_requisito'] } } 
    });
};

const obtenerTodas = async (id_carrera) => {
    const where = {};
    if (id_carrera) {
        where.id_carrera = id_carrera;
    }
    return await Materia.findAll({
        where,
        include: { model: Materia, as: 'correlativas', through: { attributes: ['tipo_requisito'] } },
        order: [
            ['nivel_anio', 'ASC'],
            ['cuatrimestre', 'ASC']
        ]
    });
};

const obtenerPorId = async (id) => {
    const materia = await Materia.findByPk(id, { 
        include: { model: Materia, as: 'correlativas', through: { attributes: ['tipo_requisito'] } } 
    });
    if (!materia) throw new Error('Materia no encontrada');
    return materia;
};

const actualizarMateria = async (id, datos) => {
    const { codigo, nombre, nivel_anio, cuatrimestre, correlativas, id_carrera, visible_en_grafo } = datos;
    const materia = await Materia.findByPk(id);

    if (!materia) throw new Error('Materia no encontrada');

    // Actualizar campos básicos
    await materia.update({
        codigo: codigo || materia.codigo,
        nombre: nombre || materia.nombre,
        nivel_anio: nivel_anio || materia.nivel_anio,
        cuatrimestre: cuatrimestre || materia.cuatrimestre,
        id_carrera: id_carrera !== undefined ? id_carrera : materia.id_carrera,
        visible_en_grafo: visible_en_grafo !== undefined ? visible_en_grafo : materia.visible_en_grafo
    });

    // Actualizar correlativas si se envían
    if (correlativas) {
        // Validar ciclos para cada nueva correlativa
        for (const req of correlativas) {
            if (await tieneCiclo(materia.id, req.id)) {
                throw new Error(`No se puede guardar: Genera una dependencia circular con la materia ID: ${req.id}`);
            }
        }
        // Limpiamos las viejas y agregamos las nuevas con su tipo
        await materia.setCorrelativas([]);
        for (const req of correlativas) {
            await materia.addCorrelativa(req.id, { through: { tipo_requisito: req.tipo_requisito || 'regular' }});
        }
    }

    return await Materia.findByPk(id, { 
        include: { model: Materia, as: 'correlativas', through: { attributes: ['tipo_requisito'] } } 
    });
};

const eliminarMateria = async (id) => {
    const materia = await Materia.findByPk(id);
    if (!materia) throw new Error('Materia no encontrada');

    // Al eliminar, Sequelize debería limpiar automáticamente las relaciones en la tabla intermedia
    await materia.destroy();
    return true;
};

module.exports = {
    crearMateria,
    obtenerTodas,
    obtenerPorId,
    actualizarMateria,
    eliminarMateria
};
