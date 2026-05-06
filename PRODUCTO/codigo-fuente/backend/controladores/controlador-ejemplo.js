const Ejemplo = require('../modelos/ejemplo');

// Obtener todos los registros de ejemplo
const obtenerEjemplos = async (req, res) => {
    try {
        const registros = await Ejemplo.findAll();
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al obtener los registros.' });
    }
};

// Crear un nuevo registro de ejemplo
const crearEjemplo = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        // Validación simple
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es obligatorio.' });
        }

        const nuevoRegistro = await Ejemplo.create({ nombre, descripcion });
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error al crear el registro.' });
    }
};

module.exports = {
    obtenerEjemplos,
    crearEjemplo
};
