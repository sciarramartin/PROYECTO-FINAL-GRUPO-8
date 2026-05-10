const Actividad = require('../modelos/actividad-personal.modelo');

// Obtener todos los registros de ejemplo
const obtenerActividades = async (req, res) => {
    try {
        const registros = await Actividad.findAll();
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
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

// Crear un nuevo registro de ejemplo
const crearActividad = async (req, res) => {
    try {
        const { nombre, horaInicio, duracion, dias, color } = req.body;
        
        // Validación simple
        if (!nombre || !horaInicio || !duracion || !dias ) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }
        const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!horaRegex.test(horaInicio)) {
            return res.status(400).json({ error: 'Formato de hora inválido. Use HH:MM' });
        }

        // Validar duración
        if (duracion < 1 || duracion > 1440) {
            return res.status(400).json({ error: 'La duración debe ser entre 1 y 1440 minutos' });
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
        
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al crear el registro.' });
    }
};

module.exports = {
    obtenerActividades,
    crearActividad
};
