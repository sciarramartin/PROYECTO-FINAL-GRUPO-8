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

    for (const item of archivosPorMes) {
        mapa[item.periodo] = {
            periodo: item.periodo,
            archivos: Number(item.archivos),
            descargas: 0,
            publicaciones: 0,
            likes: 0
        };
    }

    for (const item of publicacionesPorMes) {
        if (!mapa[item.periodo]) {
            mapa[item.periodo] = {
                periodo: item.periodo,
                archivos: 0,
                descargas: 0,
                publicaciones: 0,
                likes: 0
            };
        }

        mapa[item.periodo].publicaciones =
            Number(item.publicaciones);
    }

    for (const item of likesPorMes) {
        if (!mapa[item.periodo]) {
            mapa[item.periodo] = {
                periodo: item.periodo,
                archivos: 0,
                descargas: 0,
                publicaciones: 0,
                likes: 0
            };
        }

        mapa[item.periodo].likes =
            Number(item.likes);
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