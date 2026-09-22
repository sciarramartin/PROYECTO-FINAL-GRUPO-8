const ProgresoService = require('../../servicios/progreso.servicio');
const MateriaService = require('../../servicios/materia.servicio');
const { EstadoMateria, Materia, Curso, inscripcionesCursos, Usuario, Carrera, Actividad } = require('../../modelos/asociaciones');
const { Op } = require('sequelize');

describe('Pruebas Unitarias: Progreso, Sincronización de Comisiones y Graduados (Sprint Activo)', () => {

    test('1. Debe validar correctamente los estados permitidos en actualizarEstadoMateria', async () => {
        await expect(
            ProgresoService.actualizarEstadoMateria(1, 1, 'EstadoInvalido')
        ).rejects.toThrow('Estado inválido.');
    });

    test('2. verificarGraduacion debe calcular correctamente el progreso académico', async () => {
        const resultado = await ProgresoService.verificarGraduacion(1);
        expect(resultado).toHaveProperty('esGraduado');
        expect(resultado).toHaveProperty('porcentaje');
        expect(resultado).toHaveProperty('materiasAprobadas');
        expect(resultado).toHaveProperty('totalMaterias');
        expect(typeof resultado.esGraduado).toBe('boolean');
        expect(typeof resultado.porcentaje).toBe('number');
    });

    test('3. obtenerMetricasGraduados debe devolver métricas con total, tasa general y duracionMediaCarrera (US-MET-11)', async () => {
        const metricas = await ProgresoService.obtenerMetricasGraduados();
        expect(metricas).toHaveProperty('totalEstudiantes');
        expect(metricas).toHaveProperty('totalGraduados');
        expect(metricas).toHaveProperty('tasaGeneral');
        expect(metricas).toHaveProperty('duracionMediaCarrera');
        expect(metricas).toHaveProperty('graduadosPorCarrera');
        expect(typeof metricas.totalEstudiantes).toBe('number');
        expect(typeof metricas.tasaGeneral).toBe('number');
        expect(typeof metricas.duracionMediaCarrera).toBe('number');
    });

    test('4. actualizarEstadoMateria debe ser no destructivo y preservar historial de inscripciones_cursos', async () => {
        // Marcamos como Cursando con curso 1
        await ProgresoService.actualizarEstadoMateria(1, 1, 'Cursando', 1);
        const conteoPrevio = await inscripcionesCursos.count({ where: { id_usuario: 1 } });
        expect(conteoPrevio).toBeGreaterThan(0);

        // Cambiamos de estado a Regular
        await ProgresoService.actualizarEstadoMateria(1, 1, 'Regular');
        const conteoPosterior = await inscripcionesCursos.count({ where: { id_usuario: 1 } });

        // El conteo no debe disminuir (cero borrados físicos)
        expect(conteoPosterior).toBeGreaterThanOrEqual(conteoPrevio);
    });

    test('5. obtenerEstadisticasInscripciones (Tito US-84) calcula totales y recursados correctamente', async () => {
        const stats = await MateriaService.obtenerEstadisticasInscripciones(1);
        expect(stats).toHaveProperty('total');
        expect(stats).toHaveProperty('totalRecursados');
        expect(stats).toHaveProperty('porComision');
        expect(typeof stats.total).toBe('number');
        expect(typeof stats.totalRecursados).toBe('number');
        expect(Array.isArray(stats.porComision)).toBe(true);
    });

    test('6. obtenerProgresoCurricular debe calcular avance general y desglose por nivel y electivas (US-MET-02)', async () => {
        const progreso = await ProgresoService.obtenerProgresoCurricular(1);
        expect(progreso).toHaveProperty('totalMaterias');
        expect(progreso).toHaveProperty('materiasAprobadas');
        expect(progreso).toHaveProperty('porcentajeAvance');
        expect(progreso).toHaveProperty('electivas');
        expect(progreso.electivas).toHaveProperty('texto');
        expect(progreso.electivas).toHaveProperty('requeridas');
        expect(progreso).toHaveProperty('desglosePorNivel');
        expect(Array.isArray(progreso.desglosePorNivel)).toBe(true);
        expect(progreso.desglosePorNivel.length).toBe(5);
    });

    test('7. obtenerProyeccionGraduacion debe proyectar ritmos y escenarios de egreso (US-MET-03)', async () => {
        const proyeccion = await ProgresoService.obtenerProyeccionGraduacion(1);
        expect(proyeccion).toHaveProperty('tieneAnioIngreso');
        if (proyeccion.tieneAnioIngreso) {
            expect(proyeccion).toHaveProperty('velocidadHistorica');
            expect(proyeccion).toHaveProperty('fechaEstimadaEgreso');
            expect(proyeccion).toHaveProperty('simulacion');
            expect(Array.isArray(proyeccion.simulacion)).toBe(true);
            expect(proyeccion.simulacion.length).toBeGreaterThan(0);
        } else {
            expect(proyeccion).toHaveProperty('mensaje');
        }
    });

    test('8. Debe sincronizar automáticamente la tabla actividad al pasar a Cursando, actualizar al cambiar comisión y eliminar al pasar a Aprobada', async () => {
        const idUsuario = 1;
        const idMateria = 1; // Matemática / Análisis Matemático
        const materia = await Materia.findByPk(idMateria);
        expect(materia).not.toBeNull();

        // 8.1. Limpiar cualquier actividad previa de esta materia
        await Actividad.destroy({
            where: {
                id_usuario: idUsuario,
                [Op.or]: [
                    { nombre: `Cursado: ${materia.nombre}` },
                    { nombre: { [Op.like]: `Cursado: ${materia.nombre} (%` } }
                ]
            }
        });

        // 8.2. Pasar a 'Cursando' seleccionando la comisión 1 (Turno Mañana: 08:00, duracion: 90, dias: 1)
        await ProgresoService.actualizarEstadoMateria(idUsuario, idMateria, 'Cursando', 1);

        let actividad = await Actividad.findOne({
            where: {
                id_usuario: idUsuario,
                [Op.or]: [
                    { nombre: `Cursado: ${materia.nombre}` },
                    { nombre: { [Op.like]: `Cursado: ${materia.nombre} (%` } }
                ]
            }
        });
        expect(actividad).not.toBeNull();
        expect(actividad.hora_inicio).toBe('08:00');
        expect(actividad.duracion).toBe(90);
        expect(actividad.dias).toBe(1);
        expect(actividad.color).toBe('#8B5CF6');

        // 8.3. Cambiar de comisión a la comisión 2 (Turno Tarde: 14:00, duracion: 90, dias: 1)
        // Debe actualizar el horario de la actividad existente sin duplicarla
        await ProgresoService.actualizarEstadoMateria(idUsuario, idMateria, 'Cursando', 2);

        const actividadesMateria = await Actividad.findAll({
            where: {
                id_usuario: idUsuario,
                [Op.or]: [
                    { nombre: `Cursado: ${materia.nombre}` },
                    { nombre: { [Op.like]: `Cursado: ${materia.nombre} (%` } }
                ]
            }
        });
        expect(actividadesMateria.length).toBe(1); // Exactamente 1 fila, sin duplicados
        expect(actividadesMateria[0].hora_inicio).toBe('14:00');

        // 8.4. Pasar a 'Aprobada': Debe eliminar la actividad de la agenda/métricas pero preservar inscripciones_cursos
        const inscripcionesAntes = await inscripcionesCursos.count({ where: { id_usuario: idUsuario } });
        await ProgresoService.actualizarEstadoMateria(idUsuario, idMateria, 'Aprobada');

        const actividadEliminada = await Actividad.findOne({
            where: {
                id_usuario: idUsuario,
                [Op.or]: [
                    { nombre: `Cursado: ${materia.nombre}` },
                    { nombre: { [Op.like]: `Cursado: ${materia.nombre} (%` } }
                ]
            }
        });
        expect(actividadEliminada).toBeNull(); // Se liberó el bloque del calendario y métricas

        const inscripcionesDespues = await inscripcionesCursos.count({ where: { id_usuario: idUsuario } });
        expect(inscripcionesDespues).toBeGreaterThanOrEqual(inscripcionesAntes); // Historial académico intacto
    });
});

