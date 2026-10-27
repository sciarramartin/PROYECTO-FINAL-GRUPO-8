// tests/controladores/metricasGlobales.controlador.test.js
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'clave_secreta';

// Mock del servicio de métricas globales
jest.mock('../../servicios/metricasGlobales.servicio', () => ({
    obtenerDashboardMetricasGlobales: jest.fn().mockResolvedValue({
        success: true,
        fechaAuditoria: '2026-10-27T20:00:00Z',
        resumen: {
            totalArchivos: 24,
            totalDescargas: 1456,
            totalPublicaciones: 29,
            totalComentarios: 52,
            totalInteraccionesForo: 81,
            totalConsultasIA: 350,
            almacenamientoTotalBytes: 137448021,
            almacenamientoTotalMB: 131.08,
            almacenamientoTotalGB: 0.128,
            promedioTamanoArchivoMB: 5.46,
            promedioDescargasPorArchivo: 60.7
        },
        evolucionMensual: [
            {
                periodo: '2026-09',
                mesLabel: 'Sep 2026',
                archivosNuevos: 5,
                almacenamientoMesMB: 20.74,
                almacenamientoAcumuladoMB: 126.25,
                descargasMes: 340,
                descargasAcumuladas: 1236,
                publicaciones: 4,
                comentarios: 7,
                actividadSocial: 11,
                consultasIA: 76,
                crecimientoAlmacenamientoPct: 19.7
            }
        ],
        topMaterias: []
    })
}));

const rutasMetricasGlobales = require('../../controladores/metricasGlobales.controlador');

const app = express();
app.use(express.json());
app.use('/api/metricas-globales', rutasMetricasGlobales);

describe('Controlador Métricas Globales de Plataforma', () => {
    const tokenAdmin = jwt.sign({ id: 1, id_tipo_usuario: 3, nombre_usuario: 'admin' }, SECRET);
    const tokenAlumno = jwt.sign({ id: 2, id_tipo_usuario: 1, nombre_usuario: 'alumno' }, SECRET);

    describe('GET /api/metricas-globales', () => {
        it('debe rechazar con 401 si no se envía token de autenticación', async () => {
            const res = await request(app).get('/api/metricas-globales');
            expect(res.status).toBe(401);
            expect(res.body.mensaje).toContain('token no proporcionado');
        });

        it('debe rechazar con 403 si el usuario autenticado no tiene rol de administrador', async () => {
            const res = await request(app)
                .get('/api/metricas-globales')
                .set('Authorization', `Bearer ${tokenAlumno}`);
            expect(res.status).toBe(403);
            expect(res.body.mensaje).toContain('rol de Administrador');
        });

        it('debe responder 200 y devolver las 4 métricas principales cuando el usuario es administrador', async () => {
            const res = await request(app)
                .get('/api/metricas-globales')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Criterios de Aceptación:
            // 1. Total de archivos en repositorio
            expect(res.body.resumen).toHaveProperty('totalArchivos', 24);
            // 2. Total de descargas de la comunidad
            expect(res.body.resumen).toHaveProperty('totalDescargas', 1456);
            // 3. Total de publicaciones/comentarios en foros
            expect(res.body.resumen).toHaveProperty('totalInteraccionesForo', 81);
            expect(res.body.resumen).toHaveProperty('totalPublicaciones', 29);
            expect(res.body.resumen).toHaveProperty('totalComentarios', 52);
            // 4. Total de consultas resueltas por IA
            expect(res.body.resumen).toHaveProperty('totalConsultasIA', 350);

            // Crecimiento mensual de almacenamiento y actividad social
            expect(Array.isArray(res.body.evolucionMensual)).toBe(true);
            expect(res.body.evolucionMensual[0]).toHaveProperty('almacenamientoAcumuladoMB');
            expect(res.body.evolucionMensual[0]).toHaveProperty('actividadSocial');
            expect(res.body.evolucionMensual[0]).toHaveProperty('consultasIA');
        });
    });

    describe('GET /api/metricas-globales/resumen-rapido', () => {
        it('debe retornar 200 con el resumen de métricas para admin', async () => {
            const res = await request(app)
                .get('/api/metricas-globales/resumen-rapido')
                .set('Authorization', `Bearer ${tokenAdmin}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.resumen.totalArchivos).toBe(24);
        });
    });
});
