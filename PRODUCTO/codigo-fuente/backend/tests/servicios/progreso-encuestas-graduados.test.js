const ProgresoService = require('../../servicios/progreso.servicio');
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

    test('4. obtenerProgresoCurricular debe calcular avance general y desglose por nivel y electivas (US-MET-02)', async () => {
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

    test('5. obtenerProyeccionGraduacion debe proyectar ritmos y escenarios de egreso (US-MET-03)', async () => {
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
});

