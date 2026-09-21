// controladores/reputacion.controller.js
const express = require('express');
const router = express.Router();
//const MaterialDeEstudio = require('../modelos/MaterialDeEstudio'); 
//const MaterialDeEstudioCalificaciones = require('../modelos/MaterialDeEstudioCalificaciones');
const reputacionService = require('../servicios/reputacion.service');
const { verificarToken } = require('../middleware/authMiddleware'); 

// router.get('/mi-reputacion', verificarToken, async (req, res) => {
//     try {
//         const id_usuario = req.usuario.id; // Extraído del token JWT

//         // 1. Apuntes/Materiales subidos por el usuario
//         const apuntes = await MaterialDeEstudio.findAll({
//             where: { id_usuario },
//             attributes: ['id', 'promedio_calificacion', 'total_votos', 'total_descargas']
//         });

//         const totalApuntes = apuntes.length;
        
//         let sumaEstrellas = 0;
//         let totalVotos = 0;
//         let totalDescargas = 0;

//         apuntes.forEach(apunte => {
//             sumaEstrellas += parseFloat(apunte.promedio_calificacion || 0);
//             totalVotos += parseInt(apunte.total_votos || 0, 10);
//             totalDescargas += parseInt(apunte.total_descargas || 0, 10);
//         });

//         const promedioEstrellas = totalApuntes > 0 ? (sumaEstrellas / totalApuntes).toFixed(1) : '0.0';

//         // 2. Cálculo de Puntos Anuales de Reputación
//         const puntosAnuales = Math.round(
//             (totalApuntes * 10) +
//             (parseFloat(promedioEstrellas) * 15) +
//             (totalVotos * 3) +
//             (totalDescargas * 1)
//         );

//         // 3. Determinar Rango e Insignia según puntos
//         let rango = { nivel: 1, titulo: 'Colaborador Inicial', insignia: '🥉' };
//         if (puntosAnuales >= 100) {
//             rango = { nivel: 3, titulo: 'Colaborador Destacado', insignia: '🥇' };
//         } else if (puntosAnuales >= 50) {
//             rango = { nivel: 2, titulo: 'Colaborador Activo', insignia: '🥈' };
//         }

//         return res.json({
//             puntosAnuales,
//             anoLectivo: '2026',
//             rango,
//             metricasAnuales: {
//                 totalApuntes,
//                 promedioEstrellas,
//                 totalVotos,
//                 totalDescargas
//             }
//         });

//     } catch (error) {
//         console.error('Error al consultar reputación:', error);
//         return res.status(500).json({ mensaje: 'Error al obtener datos de reputación.' });
//     }
// });

router.get('/mi-reputacion', verificarToken, async (req, res) => {
    try {
        const id_usuario = req.usuario.id; // Extraído del middleware de autenticación (JWT)

        // Delegamos el cálculo completo de reputación y métricas al servicio
        const reputacion = await reputacionService.calcularReputacionEstudiante(id_usuario);

        return res.status(200).json(reputacion);

    } catch (error) {
        console.error('Error en controlador de reputación:', error);
        return res.status(500).json({ 
            mensaje: 'Error al obtener datos de reputación del usuario.' 
        });
    }
});

module.exports = router;