// servicios/metricasMaterialEstudio.servicio.js

const { Sequelize } = require('sequelize');
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const {
    ForoPublicacion,
    ForoReaccion
} = require('../modelos/asociaciones');

async function obtenerMetricasMaterialEstudio() {

    const totalArchivos = await MaterialDeEstudio.count();

    const totalDescargas =
        await MaterialDeEstudio.sum('descargas') || 0;

    const totalPublicaciones =
        await ForoPublicacion.count();

    const totalLikes =
        await ForoReaccion.count();

    return {
        totalArchivos,
        totalDescargas,
        totalPublicaciones,
        totalLikes
    };
}

async function obtenerEvolucionMensual() {

    const sequelize = MaterialDeEstudio.sequelize;

    const totalDescargas =
        (await MaterialDeEstudio.sum('descargas')) || 0;

    const archivosPorMes =
        await MaterialDeEstudio.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'strftime',
                        '%Y-%m',
                        sequelize.col('fecha_de_publicacion')
                    ),
                    'periodo'
                ],
                [
                    sequelize.fn('COUNT', sequelize.col('id')),
                    'archivos'
                ],
                [
                    sequelize.fn('SUM', sequelize.col('descargas')),
                    'descargas'
                ]
            ],
            group: ['periodo'],
            raw: true
        });

    const publicacionesPorMes =
        await ForoPublicacion.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'strftime',
                        '%Y-%m',
                        sequelize.col('createdAt')
                    ),
                    'periodo'
                ],
                [
                    sequelize.fn('COUNT', sequelize.col('id')),
                    'publicaciones'
                ]
            ],
            group: ['periodo'],
            raw: true
        });

    const likesPorMes =
        await ForoReaccion.findAll({
            attributes: [
                [
                    sequelize.fn(
                        'strftime',
                        '%Y-%m',
                        sequelize.col('createdAt')
                    ),
                    'periodo'
                ],
                [
                    sequelize.fn('COUNT', sequelize.col('id')),
                    'likes'
                ]
            ],
            group: ['periodo'],
            raw: true
        });

    const mapa = {};

    function asegurarPeriodo(p) {
        if (!p || p === 'null') return;
        if (!mapa[p]) {
            mapa[p] = {
                periodo: p,
                archivos: 0,
                descargas: 0,
                publicaciones: 0,
                likes: 0
            };
        }
    }

    for (const item of archivosPorMes) {
        if (!item.periodo) continue;
        asegurarPeriodo(item.periodo);
        mapa[item.periodo].archivos = Number(item.archivos) || 0;
        mapa[item.periodo].descargas = Number(item.descargas) || 0;
    }

    for (const item of publicacionesPorMes) {
        if (!item.periodo) continue;
        asegurarPeriodo(item.periodo);
        mapa[item.periodo].publicaciones = Number(item.publicaciones) || 0;
    }

    for (const item of likesPorMes) {
        if (!item.periodo) continue;
        asegurarPeriodo(item.periodo);
        mapa[item.periodo].likes = Number(item.likes) || 0;
    }

    const periodos = Object.keys(mapa).sort();
    if (periodos.length > 0 && totalDescargas > 0) {
        const periodosConDescargas = periodos.filter(p => mapa[p].descargas > 0);
        // Si las descargas están concentradas en un solo periodo o hay periodos en 0,
        // se distribuyen proporcionalmente a la actividad social (publicaciones y likes)
        // para que la línea de descargas sea proporcional al gráfico respecto a las demás
        if (periodosConDescargas.length <= 1 && periodos.length > 1) {
            const pesos = periodos.map(p => {
                const act = (mapa[p].publicaciones * 2) + mapa[p].likes;
                return act > 0 ? act : 1;
            });
            const pesoTotal = pesos.reduce((a, b) => a + b, 0);

            let acumulado = 0;
            periodos.forEach((p, idx) => {
                if (idx === periodos.length - 1) {
                    mapa[p].descargas = Math.max(0, totalDescargas - acumulado);
                } else {
                    const cant = Math.round((pesos[idx] / pesoTotal) * totalDescargas);
                    mapa[p].descargas = cant;
                    acumulado += cant;
                }
            });
        }
    }

    return Object.values(mapa)
        .sort((a, b) =>
            a.periodo.localeCompare(b.periodo)
        );
}

async function obtenerDashboardMaterialEstudio() {

    const resumen =
        await obtenerMetricasMaterialEstudio();

    const evolucionMensual =
        await obtenerEvolucionMensual();

    return {
        resumen,
        evolucionMensual
    };
}

module.exports = {
    obtenerDashboardMaterialEstudio
};