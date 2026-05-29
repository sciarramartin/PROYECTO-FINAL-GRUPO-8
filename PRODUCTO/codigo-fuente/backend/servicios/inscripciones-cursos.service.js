const Inscripcion = require('../modelos/inscripciones-cursos.modelo');

const mapToCamelCase = (Inscripcion) => {
    return {
        id: Inscripcion.id,
        fechaInscripcion: Inscripcion.fecha_inscripcion,
        idUsuario: Inscripcion.id_usuario,
        idCurso: Inscripcion.id_curso,
        Inscripcion: Inscripcion.Inscripcion,
        notaFinal: Inscripcion.nota_final
    };
};

const findAllByCursoId = async (idCurso) => {
    try {

        const registros = await Inscripcion.findAll({
            where: {
                id_curso: idCurso
            }
        });
        return registros.map((Inscripcion) => {
            return mapToCamelCase(Inscripcion);
        });
    } catch (error) {
        throw error;
    }
};

const findAllByUserId = async (idUser) => {
    try {
        const registros = await Inscripcion.findAll({
            where: {
                id_usuario: idUser
            }
        });
        return registros.map((Inscripcion) => {
            return mapToCamelCase(Inscripcion);
        });
    } catch (error) {
        throw error;
    }
};



// Exportar todos los métodos
module.exports = { findAllByCursoId, findAllByUserId};