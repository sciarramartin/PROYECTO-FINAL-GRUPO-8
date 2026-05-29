const ActividadFlexible = require('../modelos/actividad-flexible.modelo');

// Función de mapeo para respetar la convención camelCase en el Frontend
const mapToCamelCase = (actividad) => {
    return {
        id: actividad.id,
        nombre: actividad.nombre,
        horasSemanales: actividad.horas_semanales,
        duracion: actividad.duracion,
        preferenciaHoraria: actividad.preferencia_horaria,
        prioridad: actividad.prioridad,
        diasPreferidos: actividad.dias_preferidos,
        idUsuario: actividad.id_usuario
    };
};

// Obtener todas las actividades flexibles del usuario logueado
const findAllByUserId = async (idUsuario) => {
    try {
        console.log("Buscando actividades flexibles para el usuario con ID:", idUsuario);
        const registros = await ActividadFlexible.findAll({
            where: {
                id_usuario: idUsuario
            },
            order: [['prioridad', 'ASC']] // Las ordena por prioridad (1 es la más alta)
        });
        return registros.map((act) => {
            return mapToCamelCase(act);
        });
    } catch (error) {
        throw error;
    }
};

// Registrar actividad flexible
const registrarActividadFlexible = async (actividadData, idUsuario) => {
    try {
        let { nombre, horasSemanales, duracion, preferenciaHoraria, prioridad, diasPreferidos } = actividadData;

        // Validaciones estrictas según criterios de aceptación
        if (!nombre || !horasSemanales || !duracion || !prioridad || diasPreferidos === undefined) {
            throw new Error('Faltan campos obligatorios para registrar la actividad flexible.');
        }

        // Validar formato de preferencia horaria si se envía (ej: "15:00-19:00")
        if (preferenciaHoraria) {
            const rangoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!rangoRegex.test(preferenciaHoraria)) {
                throw new Error('Formato de preferencia horaria inválido. Use HH:MM-HH:MM');
            }
        }

        // Validar rango de prioridad (1, 2 o 3)
        if (![1, 2, 3].includes(Number(prioridad))) {
            throw new Error('La prioridad debe ser 1 (Alta), 2 (Media) o 3 (Baja).');
        }

        const nuevoRegistro = await ActividadFlexible.create({
            nombre,
            horas_semanales: horasSemanales,
            duracion,
            preferencia_horaria: preferenciaHoraria,
            prioridad,
            dias_preferidos: diasPreferidos,
            id_usuario: idUsuario
        });

        return mapToCamelCase(nuevoRegistro);
    } catch (error) {
        throw error;
    }
};

// Actualizar una actividad flexible por ID
const update = async (idUsuario, id, actividadData) => {
    try {
        // Verificamos si la actividad existe y le pertenece al usuario
        const actividadExistente = await ActividadFlexible.findOne({
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        
        if (!actividadExistente) {
            throw new Error('Actividad flexible no encontrada');
        }
        
        let { nombre, horasSemanales, duracion, preferenciaHoraria, prioridad, diasPreferidos } = actividadData;
        
        // Validaciones en caso de que se envíen los campos para actualizar
        if (nombre !== undefined && !nombre) {
            throw new Error('El nombre es obligatorio.');
        }
        
        if (preferenciaHoraria !== undefined && preferenciaHoraria !== null) {
            const rangoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!rangoRegex.test(preferenciaHoraria)) {
                throw new Error('Formato de preferencia horaria inválido. Use HH:MM-HH:MM');
            }
        }

        if (prioridad !== undefined && ![1, 2, 3].includes(Number(prioridad))) {
            throw new Error('La prioridad debe ser 1, 2 o 3.');
        }
        
        // Preparar datos para actualizar en formato snake_case para la Base de Datos
        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre;
        if (horasSemanales !== undefined) datosActualizar.horas_semanales = horasSemanales;
        if (duracion !== undefined) datosActualizar.duracion = duracion;
        if (preferenciaHoraria !== undefined) datosActualizar.preferencia_horaria = preferenciaHoraria;
        if (prioridad !== undefined) datosActualizar.prioridad = prioridad;
        if (diasPreferidos !== undefined) datosActualizar.dias_preferidos = diasPreferidos;
        
        // Realizar la actualización en la DB
        await ActividadFlexible.update(datosActualizar, {
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        
        // Obtener y retornar la actividad ya actualizada y mapeada
        const actividadActualizada = await ActividadFlexible.findOne({
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        return mapToCamelCase(actividadActualizada);
        
    } catch (error) {
        throw error;
    }
};

// Eliminar una actividad flexible por ID
const deleteById = async (id, idUsuario) => {
    try {
        const actividadExistente = await ActividadFlexible.findByPk(id);
        
        if (!actividadExistente) {
            throw new Error('Actividad flexible no encontrada');
        }

        if (actividadExistente.id_usuario != idUsuario) {
            throw new Error('no permitido');
        }
        
        await ActividadFlexible.destroy({
            where: { id: id }
        });
        
        return { 
            id: id, 
            eliminado: true,
            mensaje: 'Actividad flexible eliminada correctamente'
        };
        
    } catch (error) {
        throw error;
    }
};

// Exportar todos los métodos estructurados
module.exports = { findAllByUserId, registrarActividadFlexible, update, deleteById };