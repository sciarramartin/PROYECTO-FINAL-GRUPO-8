const express = require('express');
const router = express.Router();
const { verificarToken } = require('../../middleware/authMiddleware');
const ForoService = require('../../servicios/foro.servicio');

// GET /api/foro/materias - Obtener todas las materias y estadísticas de sus foros
router.get('/materias', verificarToken, async (req, res) => {
    try {
        const materiasConForos = await ForoService.obtenerForosMaterias();
        res.json(materiasConForos);
    } catch (error) {
        console.error('Error al obtener foros de materias:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

// GET /api/foro/materias/:materiaId/publicaciones - Obtener publicaciones de un foro específico
router.get('/materias/:materiaId/publicaciones', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const { orden } = req.query;

        const resultado = await ForoService.obtenerPublicacionesMateria(materiaId, {
            orden,
            usuarioId: req.usuario?.id
        });

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener publicaciones del foro:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

// GET /api/foro/materias/:materiaId/etiquetas - Obtener todas las etiquetas únicas de las publicaciones de una materia
router.get('/materias/:materiaId/etiquetas', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const listaNombres = await ForoService.obtenerEtiquetasMateria(materiaId);
        res.json(listaNombres);
    } catch (error) {
        console.error('Error al obtener etiquetas de la materia:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor al obtener etiquetas' });
    }
});

// GET /api/foro/materias/:materiaId/mis-aportes - Obtener aportes (publicaciones y comentarios) del usuario actual
router.get('/materias/:materiaId/mis-aportes', verificarToken, async (req, res) => {
    try {
        const { materiaId } = req.params;
        const id_usuario = req.usuario.id;

        const resultado = await ForoService.obtenerMisAportes(materiaId, id_usuario);
        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener mis aportes del foro:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

// GET /api/foro/feed - Obtener un feed paginado de todas las materias con filtros
router.get('/feed', verificarToken, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const { categoria, orden, busqueda, id_materia } = req.query;

        const resultado = await ForoService.obtenerFeed({
            categoria,
            orden,
            busqueda,
            id_materia,
            limit,
            offset,
            usuarioId: req.usuario?.id
        });

        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener feed del foro:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno al obtener el feed del foro.' });
    }
});

// GET /api/foro/publicaciones/:postId - Obtener detalle completo de una publicación y sus comentarios
router.get('/publicaciones/:postId', verificarToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const resultado = await ForoService.obtenerDetallePublicacion(postId, req.usuario?.id);
        res.json(resultado);
    } catch (error) {
        console.error('Error al obtener detalle de la publicación:', error);
        res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

module.exports = router;
