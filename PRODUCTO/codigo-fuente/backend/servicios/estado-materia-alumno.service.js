const Estado = require('../modelos/estado-materia-alumno.modelo');

const mapToCamelCase = (estado) => {
    return {
        id: estado.id,
        fechaInscripcion: estado.fecha_inscripcion,
        idUsuario: estado.id_usuario,
        idCurso: estado.id_curso,
        estado: estado.estado,
        notaFinal: estado.nota_final
    };
};

const findAllByCursoId = async (idCurso) => {
    try {

        const registros = await Estado.findAll({
            where: {
                id_curso: idCurso
            }
        });
        return registros.map((estado) => {
            return mapToCamelCase(estado);
        });
    } catch (error) {
        throw error;
    }
};

const findAllByUserId = async (idUser) => {
    try {
        const registros = await Estado.findAll({
            where: {
                id_usuario: idUser
            }
        });
        return registros.map((estado) => {
            return mapToCamelCase(estado);
        });
    } catch (error) {
        throw error;
    }
};



// Exportar todos los métodos
module.exports = { findAllByCursoId, findAllByUserId};