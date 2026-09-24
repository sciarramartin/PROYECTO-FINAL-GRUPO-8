// servicios/reputacion.servicio.js
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { MaterialDeEstudioCalificaciones } = require('../modelos/MaterialDeEstudioCalificaciones');
const { Op } = require('sequelize');

const determinarRango = (puntos) => {
    if (puntos >= 301) return { nivel: 4, titulo: 'Referente UTN', insignia: '🏆' };
    if (puntos >= 130) return { nivel: 3, titulo: 'Mentor Comunitario', insignia: '🥇' };
    if (puntos >= 40)  return { nivel: 2, titulo: 'Estudiante Activo', insignia: '🥈' };
    return { nivel: 1, titulo: 'Ingresante Colaborador', insignia: '🥉' };
};

const calcularReputacionEstudiante = async (idUsuario) => {
    try {
        const anoActual = new Date().getFullYear();
        const inicioAno = `${anoActual}-01-01 00:00:00`;
        // 1. Obtener materiales del usuario publicados este año
        const materiales = await MaterialDeEstudio.findAll({
            attributes: ['id', 'descargas', 'fecha_de_publicacion'],
            where: {
                id_usuario: idUsuario,
                fecha_de_publicacion: {
                    [Op.gte]: inicioAno
                }
            },
            raw: true
        });

        const totalApuntes = materiales.length;
        const totalDescargas = materiales.reduce((acc, item) => acc + Number(item.descargas || 0), 0);
        const idsMateriales = materiales.map(m => m.id);

        let promedioEstrellas = 0;
        let totalVotos = 0;

        // 2. Consultar calificaciones si el usuario subió materiales
        if (idsMateriales.length > 0) {
            const puntuaciones = await MaterialDeEstudioCalificaciones.findAll({
                attributes: ['puntuacion'],
                where: {
                    id_material: { [Op.in]: idsMateriales }
                },
                raw: true
            });

            totalVotos = puntuaciones.length;

            if (totalVotos > 0) {
                const sumaPuntuaciones = puntuaciones.reduce((acc, c) => acc + Number(c.puntuacion || 0), 0);
                promedioEstrellas = parseFloat((sumaPuntuaciones / totalVotos).toFixed(1));
            }
        }
        // const totalApuntes = 2;
        // const promedioEstrellas = 3.9;
        // const totalVotos = 5;
        // const totalDescargas = 61;

        // 3. Cálculo de puntos acumulados
        // Podés otorgar el bono del promedio solo si el usuario supera un umbral mínimo de valoraciones
        //const bonoPromedio = totalVotos >= 3 ? Math.round(promedioEstrellas * 15) : 0;
        const puntosAnuales = Math.round(
            (totalApuntes * 10) +
            (promedioEstrellas * 15) +
            (totalVotos * 3) +
            (totalDescargas * 1)
        );

        const rango = determinarRango(puntosAnuales);

        return {
            puntosAnuales,
            anoLectivo: anoActual,
            rango,
            metricasAnuales: {
                totalApuntes,
                promedioEstrellas,
                totalVotos,
                totalDescargas
            }
        };

    } catch (error) {
        console.error("❌ ERROR EN CALCULAR REPUTACION:", error);
        
        // Retorno fallback de seguridad para evitar que rompa el Dashboard con error 500
        const anoActual = new Date().getFullYear();
        return {
            puntosAnuales: 0,
            anoLectivo: anoActual,
            rango: determinarRango(0),
            metricasAnuales: {
                totalApuntes: 0,
                promedioEstrellas: 0,
                totalVotos: 0,
                totalDescargas: 0 
            }
        };
    }
};

module.exports = { 
    calcularReputacionEstudiante, 
    determinarRango 
};