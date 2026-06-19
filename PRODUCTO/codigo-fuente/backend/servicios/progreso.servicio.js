const { EstadoMateria } = require('../modelos/EstadoMateria');
const { Materia, CorrelativaXMateria } = require('../modelos/materia.modelo');

class ProgresoService {
    async obtenerProgreso(id_usuario) {
        // Obtener todos los estados guardados para este usuario
        const estados = await EstadoMateria.findAll({
            where: { id_usuario }
        });
        return estados;
    }

    async actualizarEstadoMateria(id_usuario, id_materia, estado) {
        if (!['Aprobada', 'Regular', 'Cursando', 'No Cursada'].includes(estado)) {
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

    async obtenerMateriasHabilitadas(idUsuario) {
        try {
            // 1. Obtener progreso del usuario

            const materiasActuales = await this.obtenerProgreso(idUsuario);
            const materias = await Materia.findAll({
                include: { model: Materia, as: 'correlativas', through: { attributes: ['tipo_requisito'] } },
                order: [
                    ['nivel_anio', 'ASC'],
                    ['cuatrimestre', 'ASC']
                ]
            });
            const correlativas = await Promise.all(
                materiasActuales.map(async (materia) => {
                    const correlativas = await CorrelativaXMateria.findAll({
                        where: { materia_correlativa_id: materia.id_materia },
                        raw: true
                    });
                    
                    // Obtener los IDs de materias base que esta materia habilita
                    const idsHabilitadas = correlativas.map(c => c.materia_base_id);
                    
                    // Retornar las materias completas que son habilitadas
                    return materias.filter(m => idsHabilitadas.includes(m.id));
                })
            );     
            // 1. Aplanar y eliminar duplicados de una vez
            const materiasUnicas = Array.from(
                new Map(
                    correlativas
                        .flat()
                        .map(materia => [materia.id, materia])
                ).values()
            );

            // 2. Map de materias actuales
            const materiasActualesMap = new Map(
                materiasActuales.map(m => [m.id_materia, m.estado])
            );

            // 3. Filtrar materias que cumplen requisitos
            const materiasAceptadas = materiasUnicas.filter(materia => {
                // Si no tiene correlativas, está aceptada
                if (!materia.correlativas?.length) return true;
                
                // Verificar cada correlativa
                return materia.correlativas.every(correlativa => {
                    const estadoAlumno = materiasActualesMap.get(correlativa.id);
                    const tipoRequisito = correlativa.correlativas_x_materia?.tipo_requisito;
                    
                    if (!estadoAlumno) return false;
                    
                    const estadoNorm = estadoAlumno.toLowerCase();
                    const requisitoNorm = tipoRequisito?.toLowerCase();
                    
                    if (requisitoNorm === "regular") {
                        return estadoNorm === "regular" || estadoNorm === "aprobada";
                    }
                    
                    if (requisitoNorm === "aprobada") {
                        return estadoNorm === "aprobada";
                    }
                    
                    return false;
                });
            });

            console.log('Materias aceptadas (únicas):', materiasAceptadas);
            const materiasSinCorrelativas = materias.filter(materia => 
                !materia.correlativas?.length && 
                !materiasActualesMap.has(materia.id) // Excluir las que ya están en progreso
            );
            return [
                ...materiasAceptadas,
                ...materiasSinCorrelativas
            ];
        } catch (error) {
            console.error('Error en obtenerMateriasHabilitadas:', error);
            throw error;
        }
    }
}

module.exports = new ProgresoService();
