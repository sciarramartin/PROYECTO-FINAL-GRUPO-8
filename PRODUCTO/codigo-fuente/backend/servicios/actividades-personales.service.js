const Actividad = require('../modelos/actividad-personal.modelo');

const findAllByUserId = async (idUsuario) => {
    try {
        console.log("Buscando actividades para el usuario con ID:", idUsuario);
        const registros = await Actividad.findAll({
            where: {
                id_usuario: idUsuario
            }
        });
        return registros;
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
        const { nombre, horaInicio, duracion, dias, color } = actividadData;

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
            id_usuario: req.id || 1 // O como manejes la autenticación
        });
        return nuevoRegistro;
    } catch (error) {
        throw error;
    }
};

module.exports = { findAllByUserId, create };