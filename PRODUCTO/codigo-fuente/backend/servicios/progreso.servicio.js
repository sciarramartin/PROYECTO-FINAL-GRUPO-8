const { EstadoMateria } = require('../modelos/EstadoMateria');
const { Materia } = require('../modelos/materia.modelo');

class ProgresoService {
    async obtenerProgreso(id_usuario) {
        // Obtener todos los estados guardados para este usuario
        const estados = await EstadoMateria.findAll({
            where: { id_usuario }
        });
        return estados;
    }

    async actualizarEstadoMateria(id_usuario, id_materia, estado) {
        if (!['Aprobada', 'Regular', 'No Cursada'].includes(estado)) {
            throw new Error('Estado inválido.');
        }

        // Buscar si ya existe el registro de progreso para esa materia y usuario
        let registro = await EstadoMateria.findOne({
            where: { id_usuario, id_materia }
        });

        if (registro) {
            // Actualizar si existe
            registro.estado = estado;
            await registro.save();
        } else {
            // Crear si no existe
            registro = await EstadoMateria.create({
                id_usuario,
                id_materia,
                estado
            });
        }

        return registro;
    }
}

module.exports = new ProgresoService();
