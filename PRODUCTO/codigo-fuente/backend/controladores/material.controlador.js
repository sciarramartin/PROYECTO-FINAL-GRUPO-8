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
    obtenerRutaParaDescarga,
    registrarCalificacion
} = require('../servicios/material.servicio');
const { MaterialReaccion } = require('../modelos/materialReaccion');
const { verificarToken } = require('../middleware/authMiddleware');

// ─── Helpers para el endpoint de relación de etiquetas ──────────────────────
// (el servicio ya se encarga del parseo general; estos solo se usan localmente)
function parsearEtiquetasNormalizadas(etiquetasArray) {
    if (!Array.isArray(etiquetasArray)) return [];
    return etiquetasArray.map(t => t.toLowerCase().trim());
}

/**
 * GET /api/repositorio
 * Lista todos los materiales con estructura enriquecida (materia, autor, etiquetas).
 */
router.get('/', verificarToken, async (req, res) => {
    try {
        // El servicio devuelve directamente camelCase con relaciones incluidas
        const materiales = await listarMateriales();
        res.json(materiales);
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

        // El servicio devuelve camelCase: item.etiquetas ya es un array parseado
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

router.get('/tags/todos', verificarToken, async (req, res) => {
    try {
        const materiales = await listarMateriales();

        const freqMap = {};
        materiales.forEach(item => {
            const tags = parsearEtiquetasNormalizadas(item.etiquetas);
            tags.forEach(tag => {
                freqMap[tag] = (freqMap[tag] || 0) + 1;
            });

        });

        const ranking = Object.entries(freqMap)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);

        return res.json({ ranking });

    } catch (error) {
        console.error("Error al obtener todas las etiquetas:", error);
        res.status(500).json({ error: 'Hubo un error al procesar todas las etiquetas.' });
    }
});

/**
 * GET /api/repositorio/:id
 * Devuelve la metadata de un material específico.
 */
router.get('/:id', verificarToken, async (req, res) => {
    try {
        // El servicio devuelve camelCase con relaciones incluidas
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
        // id_usuario se extrae del token (no del body) por seguridad
        const idUsuario = req.usuario.id;
        const { titulo, id_materia, etiquetas } = req.body;

        if (!titulo || !id_materia) {
            return res.status(400).json({ error: 'titulo e id_materia son requeridos' });
        }

        // Llamamos al servicio con camelCase; el servicio acepta ambas convenciones
        const material = await crearMaterial({
            archivo: req.file,
            titulo,
            idMateria: parseInt(id_materia),
            idUsuario: parseInt(idUsuario),
            etiquetas
        });

        // El servicio ya devuelve camelCase
        res.status(201).json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:id/reaccionar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body; // 'positivo' o 'negativo'
        const id_usuario = req.usuario.id;

        if (tipo !== 'positivo' && tipo !== 'negativo') {
            return res.status(400).json({ error: 'Tipo de reacción inválido.' });
        }

        const material = await obtenerMaterialPorId(id);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado.' });
        }

        const reaccionExistente = await MaterialReaccion.findOne({
            where: { id_material: id, id_usuario }
        });

        if (reaccionExistente) {
            if (reaccionExistente.tipo === tipo) {
                // Si hace click en el mismo voto, lo deshace (toggle)
                await reaccionExistente.destroy();
                material.likes = tipo === 'positivo' ? material.likes - 1 : material.likes + 1;
                await material.save();
                return res.json({ mensaje: 'Reacción removida', likes: material.likes, reaccion: null });
            } else {
                // Cambia de positivo a negativo o viceversa (cambia el voto de 1 a -1 o viceversa, total dif es 2)
                const ajuste = tipo === 'positivo' ? 2 : -2;
                reaccionExistente.tipo = tipo;
                await reaccionExistente.save();

                material.likes = material.likes + ajuste;
                await material.save();
                return res.json({ mensaje: 'Reacción actualizada', likes: material.likes, reaccion: reaccionExistente });
            }
        } else {
            // Nueva reacción
            const nuevaReaccion = await MaterialReaccion.create({
                id_material: id,
                id_usuario,
                tipo
            });

            const ajuste = tipo === 'positivo' ? 1 : -1;
            material.likes = material.likes + ajuste;
            await material.save();
            return res.json({ mensaje: 'Reacción agregada', likes: material.likes, reaccion: nuevaReaccion });
        }

    } catch (error) {
        console.error("Error al reaccionar al material:", error);
        return res.status(500).json({ error: 'Error interno del servidor al reaccionar al material.' });
    }
});

// nuevo endpoint para calificar material
router.post('/:id/calificar', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { puntuacion } = req.body;
        const idUsuario = req.usuario.id;

        if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
            return res.status(400).json({ error: 'La puntuación debe ser un número entero entre 1 y 5.' });
        }

        const resultado = await registrarCalificacion({
            idMaterial: id,
            idUsuario,
            puntuacion: parseInt(puntuacion, 10)
        });

        return res.json(resultado);
    } catch (error) {
        console.error("Error al calificar material:", error);
        return res.status(500).json({ error: 'Error al procesar la calificación.' });
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