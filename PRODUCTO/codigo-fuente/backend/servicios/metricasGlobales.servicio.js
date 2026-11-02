// servicios/metricasGlobales.servicio.js
const fs = require('fs');
const path = require('path');
const { Sequelize, Op } = require('sequelize');
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { ForoPublicacion } = require('../modelos/ForoPublicacion');
const { ForoComentario } = require('../modelos/ForoComentario');
const { ConsultaIA } = require('../modelos/ConsultaIA');
const { Materia } = require('../modelos/materia.modelo');
const { obtenerRutaAbsoluta } = require('../repositorio/archivoRepositorio');

const MESES_NOMBRES = {
    '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
};

/**
 * Obtiene el tamaño en bytes de un archivo de material de estudio.
 * Si el archivo físico existe en disco se usa su tamaño exacto,
 * de lo contrario se calcula un tamaño estimado promedio de 3.2 MB.
 */
function obtenerTamanoArchivoBytes(ubicacion) {
    try {
        if (!ubicacion) return 3355443; // 3.2 MB
        const rutaFisica = obtenerRutaAbsoluta(ubicacion);
        if (fs.existsSync(rutaFisica)) {
            const stat = fs.statSync(rutaFisica);
            return stat.size;
        }
    } catch (e) {
        // Fallback silencioso
    }
    return 3355443;
}

/**
 * Obtiene el resumen de métricas globales y la evolución mensual
 * para el panel de auditoría de administradores.
 */
async function obtenerDashboardMetricasGlobales({ mesesAtras = 12 } = {}) {
    // 1. Métricas Totales
    const totalArchivos = await MaterialDeEstudio.count();
    const totalDescargasRaw = await MaterialDeEstudio.sum('descargas');
    const totalDescargas = Number(totalDescargasRaw) || 0;
    const totalPublicaciones = await ForoPublicacion.count();
    const totalComentarios = await ForoComentario.count();
    const totalInteraccionesForo = totalPublicaciones + totalComentarios;
    const totalConsultasIA = await ConsultaIA.count();

    // 2. Almacenamiento total calculado desde los materiales
    const materialesTodos = await MaterialDeEstudio.findAll({
        attributes: ['id', 'ubicacion', 'fecha_de_publicacion', 'descargas', 'id_materia'],
        raw: true
    });

    let almacenamientoTotalBytes = 0;
    const tamanoPorMaterialId = {};

    for (const mat of materialesTodos) {
        const bytes = obtenerTamanoArchivoBytes(mat.ubicacion);
        tamanoPorMaterialId[mat.id] = bytes;
        almacenamientoTotalBytes += bytes;
    }

    const almacenamientoTotalMB = Number((almacenamientoTotalBytes / (1024 * 1024)).toFixed(2));
    const almacenamientoTotalGB = Number((almacenamientoTotalBytes / (1024 * 1024 * 1024)).toFixed(3));
    const promedioTamanoArchivoMB = totalArchivos > 0 
        ? Number((almacenamientoTotalMB / totalArchivos).toFixed(2)) 
        : 0;
    const promedioDescargasPorArchivo = totalArchivos > 0 
        ? Number((totalDescargas / totalArchivos).toFixed(1)) 
        : 0;

    // 3. Agrupaciones mensuales desde SQLite
    const sequelize = MaterialDeEstudio.sequelize;

    // Archivos por mes
    const archivosPorMes = await MaterialDeEstudio.findAll({
        attributes: [
            [sequelize.fn('strftime', '%Y-%m', sequelize.col('fecha_de_publicacion')), 'periodo'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'archivos'],
            [sequelize.fn('SUM', sequelize.col('descargas')), 'descargas']
        ],
        group: ['periodo'],
        raw: true
    });

    // Publicaciones por mes
    const publicacionesPorMes = await ForoPublicacion.findAll({
        attributes: [
            [sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt')), 'periodo'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'publicaciones']
        ],
        group: ['periodo'],
        raw: true
    });

    // Comentarios por mes
    const comentariosPorMes = await ForoComentario.findAll({
        attributes: [
            [sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt')), 'periodo'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'comentarios']
        ],
        group: ['periodo'],
        raw: true
    });

    // Consultas IA por mes
    const consultasIAPorMes = await ConsultaIA.findAll({
        attributes: [
            [sequelize.fn('strftime', '%Y-%m', sequelize.col('createdAt')), 'periodo'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'consultas']
        ],
        group: ['periodo'],
        raw: true
    });

    // 4. Calcular bytes agregados por mes desde los materiales
    const bytesAgregadosPorMes = {};
    for (const mat of materialesTodos) {
        const fecha = mat.fecha_de_publicacion ? new Date(mat.fecha_de_publicacion) : new Date();
        const periodo = fecha.toISOString().substring(0, 7); // YYYY-MM
        const bytes = tamanoPorMaterialId[mat.id] || 0;
        bytesAgregadosPorMes[periodo] = (bytesAgregadosPorMes[periodo] || 0) + bytes;
    }

    // 5. Unificar todos los periodos detectados
    const mapaPeriodos = {};

    function asegurarPeriodo(p) {
        if (!p || p === 'null') return;
        if (!mapaPeriodos[p]) {
            const [anio, mesNum] = p.split('-');
            const mesAbrev = MESES_NOMBRES[mesNum] || mesNum;
            mapaPeriodos[p] = {
                periodo: p,
                mesLabel: `${mesAbrev} ${anio}`,
                anio: Number(anio),
                mes: Number(mesNum),
                archivosNuevos: 0,
                almacenamientoMesBytes: 0,
                almacenamientoMesMB: 0,
                almacenamientoAcumuladoMB: 0,
                almacenamientoAcumuladoGB: 0,
                descargasMes: 0,
                descargasAcumuladas: 0,
                publicaciones: 0,
                comentarios: 0,
                actividadSocial: 0,
                consultasIA: 0,
                crecimientoAlmacenamientoPct: 0
            };
        }
    }

    archivosPorMes.forEach(item => {
        if (item.periodo) {
            asegurarPeriodo(item.periodo);
            mapaPeriodos[item.periodo].archivosNuevos = Number(item.archivos) || 0;
            mapaPeriodos[item.periodo].descargasMes = Number(item.descargas) || 0;
        }
    });

    publicacionesPorMes.forEach(item => {
        if (item.periodo) {
            asegurarPeriodo(item.periodo);
            mapaPeriodos[item.periodo].publicaciones = Number(item.publicaciones) || 0;
        }
    });

    comentariosPorMes.forEach(item => {
        if (item.periodo) {
            asegurarPeriodo(item.periodo);
            mapaPeriodos[item.periodo].comentarios = Number(item.comentarios) || 0;
        }
    });

    consultasIAPorMes.forEach(item => {
        if (item.periodo) {
            asegurarPeriodo(item.periodo);
            mapaPeriodos[item.periodo].consultasIA = Number(item.consultas) || 0;
        }
    });

    // Asignar bytes por periodo
    Object.keys(bytesAgregadosPorMes).forEach(p => {
        asegurarPeriodo(p);
        const bytes = bytesAgregadosPorMes[p];
        mapaPeriodos[p].almacenamientoMesBytes = bytes;
        mapaPeriodos[p].almacenamientoMesMB = Number((bytes / (1024 * 1024)).toFixed(2));
    });

    // Ordenar cronológicamente
    const listaOrdenada = Object.values(mapaPeriodos).sort((a, b) => a.periodo.localeCompare(b.periodo));

    // 6. Calcular acumulados y porcentaje de crecimiento mes a mes
    let acumuladorBytes = 0;
    let acumuladorDescargas = 0;
    let prevAcumuladoMB = 0;

    for (const item of listaOrdenada) {
        item.actividadSocial = item.publicaciones + item.comentarios;
        acumuladorBytes += item.almacenamientoMesBytes;
        acumuladorDescargas += item.descargasMes;

        item.almacenamientoAcumuladoMB = Number((acumuladorBytes / (1024 * 1024)).toFixed(2));
        item.almacenamientoAcumuladoGB = Number((acumuladorBytes / (1024 * 1024 * 1024)).toFixed(3));
        item.descargasAcumuladas = acumuladorDescargas;

        if (prevAcumuladoMB > 0) {
            const crecimiento = ((item.almacenamientoAcumuladoMB - prevAcumuladoMB) / prevAcumuladoMB) * 100;
            item.crecimientoAlmacenamientoPct = Number(crecimiento.toFixed(1));
        } else {
            item.crecimientoAlmacenamientoPct = 100;
        }
        prevAcumuladoMB = item.almacenamientoAcumuladoMB;
    }

    // 7. Distribución por materias principales (Top 5 materias más activas)
    let topMaterias = [];
    try {
        const materiasConteo = await MaterialDeEstudio.findAll({
            attributes: [
                'id_materia',
                [sequelize.fn('COUNT', sequelize.col('MaterialDeEstudio.id')), 'archivos'],
                [sequelize.fn('SUM', sequelize.col('descargas')), 'descargas']
            ],
            group: ['id_materia'],
            order: [[sequelize.literal('archivos'), 'DESC']],
            limit: 5,
            raw: true
        });

        for (const item of materiasConteo) {
            const mat = await Materia.findByPk(item.id_materia, { attributes: ['nombre', 'codigo'], raw: true });
            topMaterias.push({
                id_materia: item.id_materia,
                nombre: mat ? mat.nombre : `Materia #${item.id_materia}`,
                codigo: mat ? mat.codigo : '',
                archivos: Number(item.archivos) || 0,
                descargas: Number(item.descargas) || 0
            });
        }
    } catch (e) {
        console.warn('⚠️ Error al calcular top materias:', e.message);
    }

    return {
        success: true,
        fechaAuditoria: new Date().toISOString(),
        resumen: {
            // Las 4 tarjetas de los Criterios de Aceptación:
            totalArchivos,
            totalDescargas,
            totalPublicaciones,
            totalComentarios,
            totalInteraccionesForo, // publicaciones + comentarios
            totalConsultasIA,

            // Métricas complementarias de infraestructura y demanda:
            almacenamientoTotalBytes,
            almacenamientoTotalMB,
            almacenamientoTotalGB,
            promedioTamanoArchivoMB,
            promedioDescargasPorArchivo
        },
        evolucionMensual: listaOrdenada,
        topMaterias
    };
}

module.exports = {
    obtenerDashboardMetricasGlobales,
    obtenerTamanoArchivoBytes
};
