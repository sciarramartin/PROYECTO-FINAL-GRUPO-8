// servicios/material.servicio.js
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { Materia } = require('../modelos/materia.modelo');
const { Usuario } = require('../modelos/Usuario');

/**
 * Obtiene todos los materiales de estudio del repositorio,
 * incluyendo los detalles de su materia y autor correspondientes.
 */
const obtenerTodos = async () => {
    return await MaterialDeEstudio.findAll({
        include: [
            {
                model: Materia,
                attributes: ['id', 'nombre', 'codigo']
            },
            {
                model: Usuario,
                as: 'Autor',
                attributes: ['id', 'nombre', 'apellido', 'nombre_usuario']
            }
        ]
    });
};

module.exports = {
    obtenerTodos
};
