const ProgresoService = require('../../servicios/progreso.servicio');
const MateriaService = require('../../servicios/materia.servicio');
const ActividadesService = require('../../servicios/actividades-personales.service');
const { EstadoMateria, Materia, Curso, inscripcionesCursos, Usuario, Carrera } = require('../../modelos/asociaciones');

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

    test('3. obtenerMetricasGraduados debe devolver métricas con total y tasa general', async () => {
        const metricas = await ProgresoService.obtenerMetricasGraduados();
        expect(metricas).toHaveProperty('totalEstudiantes');
        expect(metricas).toHaveProperty('totalGraduados');
        expect(metricas).toHaveProperty('tasaGeneral');
        expect(metricas).toHaveProperty('graduadosPorCarrera');
        expect(typeof metricas.totalEstudiantes).toBe('number');
        expect(typeof metricas.tasaGeneral).toBe('number');
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

    test('6. findAllByUserId del horario solo incluye comisiones de materias en estado Cursando', async () => {
        // Ponemos materia 1 en Regular
        await ProgresoService.actualizarEstadoMateria(1, 1, 'Regular');
        let actividades = await ActividadesService.findAllByUserId(1);
        const cursosEnHorario = actividades.filter(a => a.esCurso && a.idMateria === 1);
        expect(cursosEnHorario.length).toBe(0);

        // Pasamos materia 1 a Cursando con curso 1
        await ProgresoService.actualizarEstadoMateria(1, 1, 'Cursando', 1);
        actividades = await ActividadesService.findAllByUserId(1);
        const cursosCursando = actividades.filter(a => a.esCurso && a.idMateria === 1);
        expect(cursosCursando.length).toBe(1);
    });
});

