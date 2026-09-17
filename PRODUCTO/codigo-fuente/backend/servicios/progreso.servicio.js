const { EstadoMateria } = require('../modelos/EstadoMateria');
const { Materia, CorrelativaXMateria } = require('../modelos/materia.modelo');
const { Usuario } = require('../modelos/Usuario');
const { Carrera } = require('../modelos/Carrera');
const { PlanAcademico } = require('../modelos/PlanAcademico');

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

    async obtenerProgresoCurricular(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario, {
            include: [{ model: PlanAcademico }, { model: Carrera }]
        });
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        let whereCondition = {};
        if (usuario.id_plan_academico) {
            whereCondition.id_plan_academico = usuario.id_plan_academico;
        } else if (usuario.id_carrera) {
            whereCondition.id_carrera = usuario.id_carrera;
        }

        const materiasPlan = await Materia.findAll({
            where: whereCondition,
            order: [['nivel_anio', 'ASC'], ['cuatrimestre', 'ASC'], ['id', 'ASC']]
        });

        const estados = await EstadoMateria.findAll({
            where: { id_usuario: idUsuario }
        });

        const estadosMap = new Map();
        estados.forEach(e => {
            estadosMap.set(e.id_materia, e.estado);
        });

        let materiasAprobadas = 0;
        let materiasRegulares = 0;
        let materiasCursando = 0;
        let electivasAprobadas = 0;
        const electivasRequeridas = 4; // Requisito estándar de Ordenanza Plan ISI UTN FRC (2 en 4° y 2 en 5°)

        // Agrupación por nivel de año (1° a 5°)
        const desglosePorNivel = {
            1: { nivel: 1, nombre: '1° Año', total: 0, aprobadas: 0, regulares: 0, cursando: 0, pendientes: 0 },
            2: { nivel: 2, nombre: '2° Año', total: 0, aprobadas: 0, regulares: 0, cursando: 0, pendientes: 0 },
            3: { nivel: 3, nombre: '3° Año', total: 0, aprobadas: 0, regulares: 0, cursando: 0, pendientes: 0 },
            4: { nivel: 4, nombre: '4° Año', total: 0, aprobadas: 0, regulares: 0, cursando: 0, pendientes: 0 },
            5: { nivel: 5, nombre: '5° Año', total: 0, aprobadas: 0, regulares: 0, cursando: 0, pendientes: 0 }
        };

        materiasPlan.forEach(m => {
            const nivel = m.nivel_anio || 1;
            if (desglosePorNivel[nivel]) {
                desglosePorNivel[nivel].total += 1;
            }

            const estado = estadosMap.get(m.id) || 'No Cursada';
            const esElectiva = (m.nombre && m.nombre.toLowerCase().includes('electiv')) || 
                               (m.codigo && m.codigo.toLowerCase().includes('elec'));

            if (estado === 'Aprobada') {
                materiasAprobadas += 1;
                if (desglosePorNivel[nivel]) desglosePorNivel[nivel].aprobadas += 1;
                if (esElectiva) electivasAprobadas += 1;
            } else if (estado === 'Regular') {
                materiasRegulares += 1;
                if (desglosePorNivel[nivel]) desglosePorNivel[nivel].regulares += 1;
            } else if (estado === 'Cursando') {
                materiasCursando += 1;
                if (desglosePorNivel[nivel]) desglosePorNivel[nivel].cursando += 1;
            }
        });

        // Completar pendientes y porcentajes por nivel
        Object.keys(desglosePorNivel).forEach(k => {
            const n = desglosePorNivel[k];
            n.pendientes = Math.max(0, n.total - n.aprobadas);
            n.porcentaje = n.total > 0 ? Number(((n.aprobadas / n.total) * 100).toFixed(1)) : 0;
        });

        const totalMaterias = materiasPlan.length;
        const materiasPendientes = Math.max(0, totalMaterias - materiasAprobadas);
        const porcentajeAvance = totalMaterias > 0 
            ? Number(((materiasAprobadas / totalMaterias) * 100).toFixed(1)) 
            : 0;

        const cumplimientoElectivas = Math.min(100, Math.round((electivasAprobadas / electivasRequeridas) * 100));

        return {
            totalMaterias,
            materiasAprobadas,
            materiasRegulares,
            materiasCursando,
            materiasPendientes,
            porcentajeAvance,
            electivas: {
                aprobadas: electivasAprobadas,
                requeridas: electivasRequeridas,
                porcentaje: cumplimientoElectivas,
                texto: `${electivasAprobadas} de ${electivasRequeridas} materias electivas obligatorias`
            },
            desglosePorNivel: Object.values(desglosePorNivel),
            carreraNombre: usuario.Carrera ? usuario.Carrera.nombre : 'Ingeniería en Sistemas',
            planNombre: usuario.PlanAcademico ? usuario.PlanAcademico.nombre : 'Plan 2023'
        };
    }

    async obtenerProyeccionGraduacion(idUsuario) {
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        if (!usuario.anio_ingreso || usuario.anio_ingreso < 1990) {
            return {
                tieneAnioIngreso: false,
                mensaje: 'Para visualizar tu proyección de graduación necesitas registrar tu Año de Ingreso en Mi Perfil.'
            };
        }

        const progreso = await this.obtenerProgresoCurricular(idUsuario);
        const anioActual = new Date().getFullYear();
        const mesActual = new Date().getMonth() + 1;
        const cuatrimestreActual = mesActual <= 6 ? 1 : 2;

        // Años transcurridos desde el ingreso (mínimo 0.5 para estudiantes que ingresaron el año corriente)
        const aniosTranscurridos = Math.max(0.5, (anioActual - usuario.anio_ingreso) + (cuatrimestreActual === 2 ? 0.5 : 0));
        
        // Ritmo histórico (materias aprobadas por año)
        const velocidadHistorica = Number((progreso.materiasAprobadas / aniosTranscurridos).toFixed(1));
        const materiasPendientes = progreso.materiasPendientes;

        if (materiasPendientes === 0) {
            return {
                tieneAnioIngreso: true,
                esGraduado: true,
                anioIngreso: usuario.anio_ingreso,
                aniosTranscurridos,
                velocidadHistorica,
                materiasAprobadas: progreso.materiasAprobadas,
                totalMaterias: progreso.totalMaterias,
                mensaje: '¡Felicitaciones! Has completado el 100% de las asignaturas del plan de estudio.'
            };
        }

        // Si el estudiante no tiene materias aprobadas aún o velocidad muy baja, usamos velocidad promedio estándar (5 anuales)
        const velocidadEfectiva = velocidadHistorica > 0.5 ? velocidadHistorica : 5;
        const aniosRestantes = Number((materiasPendientes / velocidadEfectiva).toFixed(1));
        const cuatrimestresRestantes = Math.max(1, Math.ceil(aniosRestantes * 2));

        // Calcular fecha estimada proyectada
        const aniosAdicionales = Math.floor((cuatrimestreActual + cuatrimestresRestantes - 1) / 2);
        const cuatrimestreFinal = ((cuatrimestreActual + cuatrimestresRestantes - 1) % 2) + 1;
        const anioEstimado = anioActual + aniosAdicionales;
        const periodoEstimado = cuatrimestreFinal === 1 ? `Julio ${anioEstimado}` : `Diciembre ${anioEstimado}`;

        // Generar matriz de simulación interactiva para diferentes ritmos (1 a 5 materias por cuatrimestre)
        const ritmosSimulados = [1, 2, 3, 4, 5];
        const simulacion = ritmosSimulados.map(ritmoCuatrimestral => {
            const cuatrimestresSim = Math.max(1, Math.ceil(materiasPendientes / ritmoCuatrimestral));
            const aniosSim = Number((cuatrimestresSim / 2).toFixed(1));
            const addAnios = Math.floor((cuatrimestreActual + cuatrimestresSim - 1) / 2);
            const finCuat = ((cuatrimestreActual + cuatrimestresSim - 1) % 2) + 1;
            const targetAnio = anioActual + addAnios;
            const targetPeriodo = finCuat === 1 ? `Julio ${targetAnio}` : `Diciembre ${targetAnio}`;
            return {
                materiasPorCuatrimestre: ritmoCuatrimestral,
                materiasPorAnio: ritmoCuatrimestral * 2,
                cuatrimestresRestantes: cuatrimestresSim,
                aniosRestantes: aniosSim,
                fechaEstimada: targetPeriodo,
                esRitmoActual: Math.round(velocidadHistorica / 2) === ritmoCuatrimestral
            };
        });

        return {
            tieneAnioIngreso: true,
            esGraduado: false,
            anioIngreso: usuario.anio_ingreso,
            aniosTranscurridos,
            materiasAprobadas: progreso.materiasAprobadas,
            materiasPendientes,
            totalMaterias: progreso.totalMaterias,
            porcentajeAvance: progreso.porcentajeAvance,
            velocidadHistorica,
            velocidadPorCuatrimestre: Number((velocidadHistorica / 2).toFixed(1)),
            aniosRestantes,
            cuatrimestresRestantes,
            fechaEstimadaEgreso: periodoEstimado,
            simulacion
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
        const aniosDuracion = [];
        const graduadosPorCicloLectivo = {};
        const anioActual = new Date().getFullYear();

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

                if (u.anio_ingreso && u.anio_ingreso <= anioActual) {
                    const duracion = Math.max(3, anioActual - u.anio_ingreso);
                    aniosDuracion.push(duracion);
                }

                // Agrupación por ciclo lectivo
                const ciclo = anioActual.toString();
                graduadosPorCicloLectivo[ciclo] = (graduadosPorCicloLectivo[ciclo] || 0) + 1;
            }
        }

        Object.keys(graduadosPorCarrera).forEach(k => {
            const c = graduadosPorCarrera[k];
            c.tasa = c.total > 0 ? Number(((c.graduados / c.total) * 100).toFixed(1)) : 0;
        });

        const tasaGeneral = totalEstudiantes > 0 ? Number(((totalGraduados / totalEstudiantes) * 100).toFixed(1)) : 0;
        const duracionMediaCarrera = aniosDuracion.length > 0
            ? Number((aniosDuracion.reduce((acc, curr) => acc + curr, 0) / aniosDuracion.length).toFixed(1))
            : 5.4; // Promedio histórico de referencia UTN FRC para carreras de ingeniería (5.4 años)

        return {
            totalEstudiantes,
            totalGraduados,
            tasaGeneral,
            duracionMediaCarrera,
            graduadosPorCarrera,
            graduadosPorCicloLectivo
        };
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
