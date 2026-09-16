const { EstadoMateria, Materia, CorrelativaXMateria, Curso, inscripcionesCursos, Usuario, Carrera, PlanAcademico } = require('../modelos/asociaciones');
const { Op } = require('sequelize');

class ProgresoService {
    async obtenerProgreso(id_usuario) {
        // Obtener todos los estados guardados para este usuario
        const estados = await EstadoMateria.findAll({
            where: { id_usuario }
        });
        return estados;
    }

    async actualizarEstadoMateria(id_usuario, id_materia, estado, id_curso = null) {
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

        // Sincronización automática de inscripciones_cursos (SCRUM-100)
        try {
            const cursosDeMateria = await Curso.findAll({
                where: { id_materia: Number(id_materia) },
                attributes: ['id']
            });
            const idsCursos = cursosDeMateria.map(c => c.id);

            if (estado === 'Cursando') {
                if (id_curso) {
                    // Remover inscripciones previas de esta materia para evitar duplicidad de comisiones
                    if (idsCursos.length > 0) {
                        await inscripcionesCursos.destroy({
                            where: {
                                id_usuario,
                                id_curso: { [Op.in]: idsCursos }
                            }
                        });
                    }

                    // Inscribir a la comisión seleccionada
                    await inscripcionesCursos.create({
                        id_usuario,
                        id_curso: Number(id_curso),
                        fecha_inscripcion: new Date().toISOString().split('T')[0]
                    });
                } else if (idsCursos.length === 1) {
                    // Si hay un único curso disponible y no se especificó, inscribir por defecto
                    const existeInscripcion = await inscripcionesCursos.findOne({
                        where: { id_usuario, id_curso: idsCursos[0] }
                    });
                    if (!existeInscripcion) {
                        await inscripcionesCursos.create({
                            id_usuario,
                            id_curso: idsCursos[0],
                            fecha_inscripcion: new Date().toISOString().split('T')[0]
                        });
                    }
                }
            } else if (['Regular', 'Aprobada', 'No Cursada'].includes(estado)) {
                // Al finalizar o cancelar cursada, remover automáticamente de comisiones y horario
                if (idsCursos.length > 0) {
                    await inscripcionesCursos.destroy({
                        where: {
                            id_usuario,
                            id_curso: { [Op.in]: idsCursos }
                        }
                    });
                }
            }
        } catch (syncError) {
            console.error('Error al sincronizar inscripciones_cursos desde el grafo:', syncError);
        }

        return registro;
    }

    async verificarGraduacion(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return { esGraduado: false, totalMaterias: 0, materiasAprobadas: 0, porcentaje: 0, materiaTerminalAprobada: false };
        }

        let whereCondition = {};
        if (usuario.id_plan_academico) {
            whereCondition.id_plan_academico = usuario.id_plan_academico;
        } else if (usuario.id_carrera) {
            whereCondition.id_carrera = usuario.id_carrera;
        }

        const materiasPlan = await Materia.findAll({ where: whereCondition });
        if (materiasPlan.length === 0) {
            return { esGraduado: false, totalMaterias: 0, materiasAprobadas: 0, porcentaje: 0, materiaTerminalAprobada: false };
        }

        const progresos = await EstadoMateria.findAll({
            where: { id_usuario: idUsuario, estado: 'Aprobada' }
        });

        const aprobadasIds = new Set(progresos.map(p => p.id_materia));
        const totalMaterias = materiasPlan.length;
        const materiasAprobadas = materiasPlan.filter(m => aprobadasIds.has(m.id)).length;

        // Detectar materia terminal (Proyecto Final / Tesis / PRO5)
        const materiaTerminal = materiasPlan.find(m => 
            (m.codigo && m.codigo.toUpperCase() === 'PRO5') || 
            (m.nombre && m.nombre.toLowerCase().includes('proyecto final')) || 
            (m.nombre && m.nombre.toLowerCase().includes('práctica')) ||
            (m.nombre && m.nombre.toLowerCase().includes('tesis'))
        );

        const materiaTerminalAprobada = materiaTerminal ? aprobadasIds.has(materiaTerminal.id) : (materiasAprobadas === totalMaterias);
        const esGraduado = (materiasAprobadas >= totalMaterias) && materiaTerminalAprobada;
        const porcentaje = Math.min(100, Math.round((materiasAprobadas / totalMaterias) * 100));

        return {
            esGraduado,
            porcentaje,
            materiasAprobadas,
            totalMaterias,
            materiaTerminalAprobada,
            materiaTerminalNombre: materiaTerminal ? materiaTerminal.nombre : 'Proyecto Final',
            carreraId: usuario.id_carrera
        };
    }

    async obtenerMetricasGraduados() {
        const usuarios = await Usuario.findAll({
            where: { id_tipo_usuario: 1 }, // Alumnos
            include: [{ model: Carrera }]
        });

        const totalEstudiantes = usuarios.length;
        let totalGraduados = 0;
        const graduadosPorCarrera = {};

        for (const u of usuarios) {
            const grad = await this.verificarGraduacion(u.id);
            const nomCarrera = u.Carrera ? u.Carrera.nombre : 'Otras Carreras';
            if (!graduadosPorCarrera[nomCarrera]) {
                graduadosPorCarrera[nomCarrera] = { total: 0, graduados: 0, tasa: 0 };
            }
            graduadosPorCarrera[nomCarrera].total += 1;
            if (grad.esGraduado) {
                totalGraduados += 1;
                graduadosPorCarrera[nomCarrera].graduados += 1;
            }
        }

        Object.keys(graduadosPorCarrera).forEach(k => {
            const c = graduadosPorCarrera[k];
            c.tasa = c.total > 0 ? Number(((c.graduados / c.total) * 100).toFixed(1)) : 0;
        });

        const tasaGeneral = totalEstudiantes > 0 ? Number(((totalGraduados / totalEstudiantes) * 100).toFixed(1)) : 0;

        return {
            totalEstudiantes,
            totalGraduados,
            tasaGeneral,
            graduadosPorCarrera
        };
    }

    async obtenerMateriasHabilitadas(idUsuario) {
        try {
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
                    
                    const idsHabilitadas = correlativas.map(c => c.materia_base_id);
                    return materias.filter(m => idsHabilitadas.includes(m.id));
                })
            );     

            const materiasUnicas = Array.from(
                new Map(
                    correlativas
                        .flat()
                        .map(materia => [materia.id, materia])
                ).values()
            );

            const materiasActualesMap = new Map(
                materiasActuales.map(m => [m.id_materia, m.estado])
            );

            const materiasAceptadas = materiasUnicas.filter(materia => {
                if (!materia.correlativas?.length) return true;
                
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

            const materiasSinCorrelativas = materias.filter(materia => 
                !materia.correlativas?.length && 
                !materiasActualesMap.has(materia.id)
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
