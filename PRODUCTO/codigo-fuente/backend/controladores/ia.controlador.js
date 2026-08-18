// backend/controladores/ia.controlador.js
const express = require('express');
const router = express.Router();
const ragService = require('../servicios/rag.servicio');

/**
 * POST /api/ia/consulta-modalidad
 * Consulta al chatbot de modalidad académica y normativas con RAG
 */
router.post('/consulta-modalidad', async (req, res) => {
  try {
    const { prompt, historial } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El campo "prompt" es obligatorio y debe ser un texto válido.'
      });
    }

    const resultado = await ragService.consultarChatbot({
      prompt: prompt.trim(),
      historial: Array.isArray(historial) ? historial : []
    });

    return res.status(200).json({
      success: true,
      respuesta: resultado.respuesta,
      fuentes: resultado.fuentes || []
    });
  } catch (error) {
    console.error('❌ Error en /api/ia/consulta-modalidad:', error);
    return res.status(500).json({
      success: false,
      error: 'Ocurrió un error al procesar la consulta con el asistente de IA.',
      detalle: error.message
    });
  }
});

/**
 * POST /api/ia/consulta-modalidad-stream
 * Streaming en tiempo real vía Server-Sent Events (SSE)
 */
router.post('/consulta-modalidad-stream', async (req, res) => {
  try {
    const { prompt, historial } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El campo "prompt" es obligatorio y debe ser un texto válido.'
      });
    }

    // Configuración de cabeceras SSE para streaming continuo
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    await ragService.consultarChatbotStream({
      prompt: prompt.trim(),
      historial: Array.isArray(historial) ? historial : [],
      onContext: ({ fuentes }) => {
        res.write(`event: context\ndata: ${JSON.stringify({ fuentes })}\n\n`);
      },
      onChunk: (chunk) => {
        res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
      }
    });

    res.write(`event: done\ndata: ${JSON.stringify({ final: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('❌ Error en streaming SSE /api/ia/consulta-modalidad-stream:', error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/ia/documentos
 * Lista todos los documentos y reglamentos disponibles en el corpus RAG
 */
router.get('/documentos', (req, res) => {
  try {
    const documentos = ragService.obtenerDocumentosDisponibles();
    return res.status(200).json({
      success: true,
      total: documentos.length,
      documentos
    });
  } catch (error) {
    console.error('❌ Error en GET /api/ia/documentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al listar los documentos del corpus.'
    });
  }
});

/**
 * GET /api/ia/documentos/descargar/:nombre
 * Descarga el archivo físico del documento oficial del corpus
 */
router.get('/documentos/descargar/:nombre', (req, res) => {
  try {
    const path = require('path');
    const fs = require('fs');
    // Sanitizar nombre de archivo para prevenir path traversal (../../etc/passwd)
    const nombreArchivo = path.basename(req.params.nombre);
    const rutaArchivo = path.join(__dirname, '..', 'documentos_academicos', nombreArchivo);

    if (!fs.existsSync(rutaArchivo)) {
      return res.status(404).json({
        success: false,
        error: 'El documento solicitado no se encuentra en el repositorio.'
      });
    }

    return res.download(rutaArchivo, nombreArchivo);
  } catch (error) {
    console.error('❌ Error al descargar documento:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno al procesar la descarga del archivo.'
    });
  }
});

/**
 * POST /api/ia/recargar-documentos
 * Fuerza la re-indexación del corpus documental
 */
router.post('/recargar-documentos', async (req, res) => {
  try {
    await ragService.inicializar();
    const documentos = ragService.obtenerDocumentosDisponibles();
    return res.status(200).json({
      success: true,
      mensaje: 'Corpus documental re-indexado exitosamente.',
      totalDocumentos: documentos.length
    });
  } catch (error) {
    console.error('❌ Error en /api/ia/recargar-documentos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al re-indexar los documentos.'
    });
  }
});

module.exports = router;
