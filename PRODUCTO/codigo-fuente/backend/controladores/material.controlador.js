// controladores/material.controlador.js
const express = require('express');
const router = express.Router();
const MaterialService = require('../servicios/material.servicio');
const { verificarToken } = require('../middleware/authMiddleware');

/**
 * GET /api/repositorio
 * Obtiene la lista de materiales de estudio con la estructura JSON requerida.
 */
router.get('/', verificarToken, async (req, res) => {
    try {
        const materiales = await MaterialService.obtenerTodos();

        const mapped = materiales.map((item) => {
            let tags = [];
            if (item.etiquetas) {
                try {
                    const parsed = JSON.parse(item.etiquetas);
                    tags = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    tags = item.etiquetas.split(/[,,; ]+/).filter(Boolean);
                }
            }

            return {
                id: item.id,
                materia: item.materia ? item.materia.nombre : "",
                titulo: item.titulo,
                etiquetas: tags,
                autor: item.Autor ? `${item.Autor.nombre} ${item.Autor.apellido}`.trim() : "Anónimo",
                "id usuario": item.id_usuario,
                "fecha de publicación": item.fecha_de_publicacion,
                likes: item.likes
            };
        });

        res.json(mapped);
    } catch (error) {
        console.error("Error al obtener materiales de estudio:", error);
        res.status(500).json({ error: 'Hubo un error al obtener los materiales de estudio.' });
    }
});

/**
 * GET /api/repositorio/tags/relacion
 * Permite consultar la cantidad de materiales con dos etiquetas en relación,
 * o con una sola etiqueta (retorna un ranking de las etiquetas asociadas en común, ordenadas de mayor a menor).
 */
router.get('/tags/relacion', verificarToken, async (req, res) => {
    try {
        const { tag1, tag2 } = req.query;
        if (!tag1) {
            return res.status(400).json({ error: "El parámetro tag1 es obligatorio" });
        }

        const materiales = await MaterialService.obtenerTodos();

        const getTagsArray = (item) => {
            if (!item.etiquetas) return [];
            try {
                const parsed = JSON.parse(item.etiquetas);
                return Array.isArray(parsed)
                    ? parsed.map(t => t.toLowerCase().trim())
                    : [parsed.toLowerCase().trim()];
            } catch (e) {
                return item.etiquetas.split(/[,,; ]+/).filter(Boolean).map(t => t.toLowerCase().trim());
            }
        };

        const t1Normalized = tag1.toLowerCase().trim();

        if (tag2) {
            const t2Normalized = tag2.toLowerCase().trim();
            const count = materiales.reduce((acc, item) => {
                const tags = getTagsArray(item);
                if (tags.includes(t1Normalized) && tags.includes(t2Normalized)) {
                    return acc + 1;
                }
                return acc;
            }, 0);

            return res.json({ tag1, tag2, cantidad: count });
        } else {
            const freqMap = {};
            materiales.forEach(item => {
                const tags = getTagsArray(item);
                if (tags.includes(t1Normalized)) {
                    tags.forEach(tag => {
                        if (tag !== t1Normalized) {
                            freqMap[tag] = (freqMap[tag] || 0) + 1;
                        }
                    });
                }
            });

            const ranking = Object.entries(freqMap)
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count);

            return res.json({ tag1, ranking });
        }
    } catch (error) {
        console.error("Error al obtener relación de etiquetas:", error);
        res.status(500).json({ error: 'Hubo un error al procesar las relaciones de etiquetas.' });
    }
});

module.exports = router;
