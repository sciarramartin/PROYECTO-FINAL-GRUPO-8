const Actividad = require('../modelos/actividad-personal.modelo');

const mapToCamelCase = (actividad) => {
    return {
        id: actividad.id,
        nombre: actividad.nombre,
        horaInicio: actividad.hora_inicio,
        duracion: actividad.duracion,
        dias: actividad.dias,
        color: actividad.color,
        idUsuario: actividad.id_usuario
    };
};

const findAllByUserId = async (idUsuario) => {
    try {
        console.log("Buscando actividades para el usuario con ID:", idUsuario);
        const registros = await Actividad.findAll({
            where: {
                id_usuario: idUsuario
            }
        });
        return registros.map((act) => {
            return mapToCamelCase(act);
        });
    } catch (error) {
        throw error;
    }
};

function generarColorRandom() {
    const colores = [
        '#FFB3BA', // Rosa pastel
        '#C5E99B', // Verde menta pastel
        '#B5E3FF', // Azul cielo pastel
        '#FFD1B3', // Durazno pastel
        '#E0BBE4', // Lila pastel
        '#FFF5BA', // Amarillo pastel
        '#B5F5E3', // Verde agua pastel
        '#FFCCD9'  // Rosado pastel
    ];
    
    return colores[Math.floor(Math.random() * colores.length)];
}

const create = async (actividadData) => {
    try {
        let { nombre, horaInicio, duracion, dias, color } = actividadData;

        // Validación simple
        if (!nombre || !horaInicio || !duracion || !dias ) {
            throw new Error('El nombre es obligatorio.');
        }
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!horaRegex.test(horaInicio)) {
            throw new Error('Formato de hora inválido. Use HH:MM');
        }

        // Validar duración
        if (duracion < 1 || duracion > 1440) {
            throw new Error('La duración debe ser entre 1 y 1440 minutos');
        }

        if (!color){
            color = generarColorRandom();
        }

        
        const nuevoRegistro = await Actividad.create({ 
            nombre, 
            hora_inicio: horaInicio, 
            duracion, 
            dias, 
            color,
            id_usuario: actividadData.idUsuario || 1 // O como manejes la autenticación
        });
        return mapToCamelCase(nuevoRegistro);
    } catch (error) {
        throw error;
    }
};
// PUT - Actualizar una actividad por ID
const update = async (idUsuario, id, actividadData) => {
    try {
        // Primero verificamos si la actividad existe
        const actividadExistente = await Actividad.findOne({
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        
        if (!actividadExistente) {
            throw new Error('Actividad no encontrada');
        }
        
        let { nombre, horaInicio, duracion, dias, color } = actividadData;
        
        // Validaciones
        if (nombre !== undefined && !nombre) {
            throw new Error('El nombre es obligatorio.');
        }
        
        if (horaInicio !== undefined) {
            const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!horaRegex.test(horaInicio)) {
                throw new Error('Formato de hora inválido. Use HH:MM');
            }
        }
        
        if (duracion !== undefined && (duracion < 1 || duracion > 1440)) {
            throw new Error('La duración debe ser entre 1 y 1440 minutos');
        }
        
        // Si no se envía color, mantener el existente o generar uno nuevo
        if (color === undefined) {
            color = actividadExistente.color || generarColorRandom();
        }
        
        // Preparar datos para actualizar
        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre;
        if (horaInicio !== undefined) datosActualizar.hora_inicio = horaInicio;
        if (duracion !== undefined) datosActualizar.duracion = duracion;
        if (dias !== undefined) datosActualizar.dias = dias;
        if (color !== undefined) datosActualizar.color = color;
        
        // Realizar actualización
        await Actividad.update(datosActualizar, {
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        
        // Obtener actividad actualizada
        const actividadActualizada = await Actividad.findByPk(id);
        return mapToCamelCase(actividadActualizada);
        
    } catch (error) {
        throw error;
    }
};

// DELETE - Eliminar una actividad por ID
const deleteById = async (id) => {
    try {
        // Verificar si la actividad existe
        const actividadExistente = await Actividad.findByPk(id);
        
        if (!actividadExistente) {
            throw new Error('Actividad no encontrada');
        }
        
        // Eliminar la actividad
        await Actividad.destroy({
            where: { id: id }
        });
        
        return { 
            id: id, 
            eliminado: true,
            mensaje: 'Actividad eliminada correctamente'
        };
        
    } catch (error) {
        throw error;
    }
};

// Exportar todos los métodos
module.exports = { findAllByUserId, create, update, deleteById };