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

    test('3. obtenerMetricasGraduados debe devolver métricas con total y tasa general', async () => {
        const metricas = await ProgresoService.obtenerMetricasGraduados();
        expect(metricas).toHaveProperty('totalEstudiantes');
        expect(metricas).toHaveProperty('totalGraduados');
        expect(metricas).toHaveProperty('tasaGeneral');
        expect(metricas).toHaveProperty('graduadosPorCarrera');
        expect(typeof metricas.totalEstudiantes).toBe('number');
        expect(typeof metricas.tasaGeneral).toBe('number');
    });
});
