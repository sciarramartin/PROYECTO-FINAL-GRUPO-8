const Curso = require('../modelos/curso.modelo');

const mapToCamelCase = (curso) => {
    return {
        id: curso.id,
        nombre: curso.nombre,
        horaInicio: curso.hora_inicio,
        duracion: curso.duracion,
        dias: curso.dias,
        idMateria: curso.id_materia
    };
};

const findAllByMateriaId = async (idMateria) => {
    try {

        const registros = await Curso.findAll({
            where: {
                id_materia: idMateria
            }
        });
        return registros.map((curso) => {
            return mapToCamelCase(curso);
        });
    } catch (error) {
        throw error;
    }
};

const create = async (cursoData, idMateria) => {
    try {
        let { nombre, horaInicio, duracion, dias } = cursoData;

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
        
        const nuevoRegistro = await Curso.create({ 
            nombre, 
            hora_inicio: horaInicio, 
            duracion, 
            dias,
            id_materia: idMateria 
        });
        return mapToCamelCase(nuevoRegistro);
    } catch (error) {
        throw error;
    }
};
// PUT - Actualizar una actividad por ID
const update = async (idMateria, id, cursoData) => {
    try {
        // Primero verificamos si la actividad existe
        const cursoExistente = await Curso.findOne({
            where: {
                id_materia: idMateria,
                id: id
            }
        });
        
        if (!cursoExistente) {
            throw new Error('no encontrado');
        }
        
        let { nombre, horaInicio, duracion, dias } = cursoData;
        
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
        
        
        // Preparar datos para actualizar
        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre;
        if (horaInicio !== undefined) datosActualizar.hora_inicio = horaInicio;
        if (duracion !== undefined) datosActualizar.duracion = duracion;
        if (dias !== undefined) datosActualizar.dias = dias;
        
        // Realizar actualización
        await Curso.update(datosActualizar, {
            where: {
                id_materia: idMateria,
                id: id
            }
        });
        
        // Obtener actividad actualizada
        const cursoActualizado = await Curso.findOne({
            where: {
                id_materia: idMateria,
                id: id
            }
        });
        return mapToCamelCase(cursoActualizado);
        
    } catch (error) {
        throw error;
    }
};


// Exportar todos los métodos
module.exports = { findAllByMateriaId, create, update };