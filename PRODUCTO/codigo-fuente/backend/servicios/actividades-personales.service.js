const Actividad = require('../modelos/actividad-personal.modelo');
const { inscripcionesCursos, Curso, Materia } = require('../modelos/asociaciones');

const mapToCamelCase = (actividad) => {
    return {
        id: actividad.id,
        nombre: actividad.nombre,
        horaInicio: actividad.hora_inicio,
        duracion: actividad.duracion,
        dias: actividad.dias,
        color: actividad.color,
        idUsuario: actividad.id_usuario,
        esCurso: false
    };
};

const findAllByUserId = async (idUsuario) => {
    try {
        console.log("Buscando actividades y cursos para el usuario con ID:", idUsuario);
        const registros = await Actividad.findAll({
            where: {
                id_usuario: idUsuario
            }
        });
        const actividadesPersonales = registros.map((act) => mapToCamelCase(act));

        // Obtener cursos inscriptos del estudiante para sincronizar con el horario (SCRUM-100)
        let cursosInscriptos = [];
        try {
            const inscripciones = await inscripcionesCursos.findAll({
                where: { id_usuario: idUsuario },
                include: [
                    {
                        model: Curso,
                        include: [
                            {
                                model: Materia,
                                attributes: ['id', 'nombre', 'codigo']
                            }
                        ]
                    }
                ]
            });

            cursosInscriptos = inscripciones.filter(i => i.curso).map(i => {
                const c = i.curso;
                const matNombre = c.Materia ? c.Materia.nombre : 'Materia';
                return {
                    id: `curso-${c.id}`,
                    idCurso: c.id,
                    idMateria: c.id_materia,
                    nombre: `📚 ${matNombre} (${c.nombre})`,
                    horaInicio: c.hora_inicio ? c.hora_inicio.slice(0, 5) : '08:00',
                    duracion: c.duracion || 180,
                    dias: c.dias || 0,
                    color: '#818cf8', // Color azul/índigo distinguido para clases académicas
                    esCurso: true,
                    idUsuario
                };
            });
        } catch (errInsc) {
            console.error("Error al cargar cursos inscriptos para el horario:", errInsc);
        }

        return [...actividadesPersonales, ...cursosInscriptos];
    } catch (error) {
        throw error;
    }
};

function generarColorRandom() {
    const colores = [
        '#D08B9B', // Rosa pastel
        '#C5E99B', // Verde menta pastel
        '#B5E3FF', // Azul cielo pastel
        '#E9C772', // Durazno pastel
        '#E0BBE4', // Lila pastel
        '#FFF5BA', // Amarillo pastel
        '#B5F5E3', // Verde agua pastel
        '#FFCCD9'  // Rosado pastel
    ];

    return colores[Math.floor(Math.random() * colores.length)];
}

const create = async (actividadData, idUsuario) => {
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
            id_usuario: idUsuario
        });
        return mapToCamelCase(nuevoRegistro);
    } catch (error) {
        throw error;
    }
};

// PUT - Actualizar una actividad por ID
const update = async (idUsuario, id, actividadData) => {
    try {
        if (typeof id === 'string' && id.startsWith('curso-')) {
            throw new Error('Los cursos académicos se gestionan desde el Grafo de Correlatividades.');
        }

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
        
        if (color === undefined) {
            color = actividadExistente.color || generarColorRandom();
        }
        
        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre;
        if (horaInicio !== undefined) datosActualizar.hora_inicio = horaInicio;
        if (duracion !== undefined) datosActualizar.duracion = duracion;
        if (dias !== undefined) datosActualizar.dias = dias;
        if (color !== undefined) datosActualizar.color = color;
        
        await Actividad.update(datosActualizar, {
            where: {
                id_usuario: idUsuario,
                id: id
            }
        });
        
        const actividadActualizada = await Actividad.findOne({
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

// DELETE - Eliminar una actividad por ID
const deleteById = async (id, idUsuario) => {
    try {
        if (typeof id === 'string' && id.startsWith('curso-')) {
            const idCurso = parseInt(id.replace('curso-', ''), 10);
            await inscripcionesCursos.destroy({
                where: { id_usuario: idUsuario, id_curso: idCurso }
            });
            return { 
                id: id, 
                eliminado: true, 
                mensaje: 'Inscripción a curso removida del horario' 
            };
        }

        const actividadExistente = await Actividad.findByPk(id);
        
        if (!actividadExistente) {
            throw new Error('Actividad no encontrada');
        }

        if (actividadExistente.id_usuario != idUsuario) {
            throw new Error('no permitido');
        }
        
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

module.exports = { findAllByUserId, create, update, deleteById };