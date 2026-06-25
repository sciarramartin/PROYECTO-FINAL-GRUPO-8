// controladores/material.controlador.js
const express = require('express');
const router = express.Router();
const path = require('path');
const mime = require('mime-types');
const { subirArchivo } = require('../repositorio/archivoRepositorio');
const {
    crearMaterial,
    obtenerMaterialPorId,
    listarMateriales,
    eliminarMaterial,
    obtenerRutaParaDescarga
} = require('../servicios/material.servicio');
const { verificarToken } = require('../middleware/authMiddleware');

// ─── Helper compartido para parsear etiquetas ─────────────────────────────────
function parsearEtiquetas(etiquetas) {
    if (!etiquetas) return [];
    try {
        const parsed = JSON.parse(etiquetas);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return etiquetas.split(/[,,; ]+/).filter(Boolean);
    }
}

// ─── Helper para normalizar etiquetas a lowercase ────────────────────────────
function parsearEtiquetasNormalizadas(etiquetas) {
    return parsearEtiquetas(etiquetas).map(t => t.toLowerCase().trim());
}

/**
 * GET /api/repositorio
 * Lista todos los materiales con estructura enriquecida (materia, autor, etiquetas).
 */
router.get('/', verificarToken, async (req, res) => {
    try {
        const materiales = await listarMateriales(); // <-- usa el servicio unificado

        const mapped = materiales.map((item) => ({
            id: item.id,
            materia: item.materia ? item.materia.nombre : "",
            titulo: item.titulo,
            etiquetas: parsearEtiquetas(item.etiquetas),
            autor: item.Autor
                ? `${item.Autor.nombre} ${item.Autor.apellido}`.trim()
                : "Anónimo",
            "id usuario": item.id_usuario,
            "fecha de publicación": item.fecha_de_publicacion,
            likes: item.likes
        }));

        res.json(mapped);
    } catch (error) {
        console.error("Error al obtener materiales de estudio:", error);
        res.status(500).json({ error: 'Hubo un error al obtener los materiales de estudio.' });
    }
});

/**
 * GET /api/repositorio/tags/relacion
 * Con tag1 y tag2: devuelve cuántos materiales comparten ambas etiquetas.
 * Con solo tag1: devuelve un ranking de etiquetas co-ocurrentes.
 */
router.get('/tags/relacion', verificarToken, async (req, res) => {
    try {
        const { tag1, tag2 } = req.query;
        if (!tag1) {
            return res.status(400).json({ error: "El parámetro tag1 es obligatorio" });
        }

        const materiales = await listarMateriales();
        const t1 = tag1.toLowerCase().trim();

        if (tag2) {
            const t2 = tag2.toLowerCase().trim();
            const cantidad = materiales.reduce((acc, item) => {
                const tags = parsearEtiquetasNormalizadas(item.etiquetas);
                return tags.includes(t1) && tags.includes(t2) ? acc + 1 : acc;
            }, 0);

            return res.json({ tag1, tag2, cantidad });
        }

        // Solo tag1 → ranking de etiquetas relacionadas
        const freqMap = {};
        materiales.forEach(item => {
            const tags = parsearEtiquetasNormalizadas(item.etiquetas);
            if (tags.includes(t1)) {
                tags.forEach(tag => {
                    if (tag !== t1) freqMap[tag] = (freqMap[tag] || 0) + 1;
                });
            }
        });

        const ranking = Object.entries(freqMap)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        return res.json({ tag1, ranking });

    } catch (error) {
        console.error("Error al obtener relación de etiquetas:", error);
        res.status(500).json({ error: 'Hubo un error al procesar las relaciones de etiquetas.' });
    }
});

/**
 * GET /api/repositorio/:id
 * Devuelve la metadata de un material específico.
 */
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const material = await obtenerMaterialPorId(req.params.id);
        res.json(material);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * GET /api/repositorio/:id/descargar
 * Sirve el archivo binario para descarga directa.
 */
router.get('/:id/descargar', verificarToken, async (req, res) => {
    try {
        const material = await obtenerMaterialPorId(req.params.id);
        const rutaAbsoluta = obtenerRutaParaDescarga(material);
        const tipoMime = mime.lookup(rutaAbsoluta) || 'application/octet-stream';

        res.setHeader('Content-Type', tipoMime);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${material.titulo}${path.extname(rutaAbsoluta)}"`
        );
        res.sendFile(rutaAbsoluta);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/repositorio
 * Sube el archivo al repositorio y crea el registro en la BD.
 */
router.post('/', verificarToken, subirArchivo.single('archivo'), async (req, res) => {
    try {
        const { titulo, id_materia, id_usuario, etiquetas } = req.body;

        if (!titulo || !id_materia || !id_usuario) {
            return res.status(400).json({ error: 'titulo, id_materia e id_usuario son requeridos' });
        }

        const material = await crearMaterial({
            archivo: req.file,
            titulo,
            id_materia: parseInt(id_materia),
            id_usuario: parseInt(id_usuario),
            etiquetas
        });

        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/repositorio/:id
 * Elimina el registro en BD y el archivo físico del repositorio.
 */
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const resultado = await eliminarMaterial(req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;