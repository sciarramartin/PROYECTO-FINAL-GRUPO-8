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
    const { codigo, nombre, nivel_anio, cuatrimestre, correlativas } = datos;

    // 1. Crear la materia principal
    const nuevaMateria = await Materia.create({
        codigo,
        nombre,
        nivel_anio,
        cuatrimestre
    });

    // 2. Si vienen correlativas, asignarlas (validando ciclos por si acaso, aunque siendo nueva no debería tener)
    if (correlativas && correlativas.length > 0) {
        for (const reqId of correlativas) {
            if (await tieneCiclo(nuevaMateria.id, reqId)) {
                // Hacemos rollback manual eliminando la materia recién creada
                await nuevaMateria.destroy();
                throw new Error(`Dependencia circular detectada con la materia ID: ${reqId}`);
            }
        }
        await nuevaMateria.setCorrelativas(correlativas);
    }

    return await Materia.findByPk(nuevaMateria.id, { include: 'correlativas' });
};

const obtenerTodas = async () => {
    return await Materia.findAll({
        include: 'correlativas',
        order: [
            ['nivel_anio', 'ASC'],
            ['cuatrimestre', 'ASC']
        ]
    });
};

const obtenerPorId = async (id) => {
    const materia = await Materia.findByPk(id, { include: 'correlativas' });
    if (!materia) throw new Error('Materia no encontrada');
    return materia;
};

const actualizarMateria = async (id, datos) => {
    const { codigo, nombre, nivel_anio, cuatrimestre, correlativas } = datos;
    const materia = await Materia.findByPk(id);

    if (!materia) throw new Error('Materia no encontrada');

    // Actualizar campos básicos
    await materia.update({
        codigo: codigo || materia.codigo,
        nombre: nombre || materia.nombre,
        nivel_anio: nivel_anio || materia.nivel_anio,
        cuatrimestre: cuatrimestre || materia.cuatrimestre
    });

    // Actualizar correlativas si se envían
    if (correlativas) {
        // Validar ciclos para cada nueva correlativa
        for (const reqId of correlativas) {
            if (await tieneCiclo(materia.id, reqId)) {
                throw new Error(`No se puede guardar: Genera una dependencia circular con la materia ID: ${reqId}`);
            }
        }
        await materia.setCorrelativas(correlativas);
    }

    return await Materia.findByPk(id, { include: 'correlativas' });
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
