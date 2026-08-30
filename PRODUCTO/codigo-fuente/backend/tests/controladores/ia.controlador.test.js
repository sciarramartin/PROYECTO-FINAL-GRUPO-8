// backend/tests/controladores/ia.controlador.test.js
const request = require('supertest');
const express = require('express');

// Mock del servicio RAG
jest.mock('../../servicios/rag.servicio', () => ({
  consultarChatbot: jest.fn().mockResolvedValue({
    respuesta: 'Respuesta de prueba RAG',
    fuentes: [{ documento: 'doc_test.pdf', pagina: 1, fragmento: 'fragmento test' }]
  }),
  consultarChatbotStream: jest.fn().mockImplementation(async ({ onContext, onChunk }) => {
    if (onContext) onContext({ fuentes: [{ documento: 'doc_stream.pdf', pagina: 1, fragmento: 'stream test' }] });
    if (onChunk) onChunk('Token 1 ');
    if (onChunk) onChunk('Token 2');
    return { respuesta: 'Token 1 Token 2', fuentes: [] };
  }),
  obtenerDocumentosDisponibles: jest.fn().mockReturnValue([
    { nombre: 'doc1.pdf', tipo: 'PDF', tamanoBytes: 1024, fechaModificacion: new Date() }
  ]),
  inicializar: jest.fn().mockResolvedValue(true)
}));

const rutasIA = require('../../controladores/ia.controlador');

const app = express();
app.use(express.json());
app.use('/api/ia', rutasIA);

describe('Controlador IA - Endpoints (US-29)', () => {
  describe('POST /api/ia/consulta-modalidad', () => {
    test('retorna 200 con respuesta y fuentes válidas', async () => {
      const res = await request(app)
        .post('/api/ia/consulta-modalidad')
        .send({ prompt: '¿Cómo apruebo Algoritmos?' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.respuesta).toBe('Respuesta de prueba RAG');
      expect(res.body.fuentes).toHaveLength(1);
    });

    test('retorna 400 si el prompt está vacío', async () => {
      const res = await request(app)
        .post('/api/ia/consulta-modalidad')
        .send({ prompt: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('prompt');
    });

    test('retorna 400 si el prompt no es string', async () => {
      const res = await request(app)
        .post('/api/ia/consulta-modalidad')
        .send({ prompt: 12345 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/ia/consulta-modalidad-stream (SSE)', () => {
    test('retorna 200 con eventos SSE (context, chunk, done)', async () => {
      const res = await request(app)
        .post('/api/ia/consulta-modalidad-stream')
        .send({ prompt: '¿Cómo apruebo Algoritmos?' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('event: context');
      expect(res.text).toContain('event: chunk');
      expect(res.text).toContain('event: done');
    });

    test('retorna 400 si el prompt está vacío', async () => {
      const res = await request(app)
        .post('/api/ia/consulta-modalidad-stream')
        .send({ prompt: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/ia/documentos', () => {
    test('retorna 200 con lista de documentos disponibles', async () => {
      const res = await request(app).get('/api/ia/documentos');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.total).toBe(1);
      expect(res.body.documentos).toHaveLength(1);
    });
  });

  describe('GET /api/ia/documentos/descargar/:nombre', () => {
    test('retorna 404 si el archivo no existe o ante intento de path traversal', async () => {
      const res = await request(app).get('/api/ia/documentos/descargar/archivo_inexistente.pdf');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/ia/recargar-documentos', () => {
    test('retorna 200 y re-indexa el corpus', async () => {
      const res = await request(app).post('/api/ia/recargar-documentos');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mensaje).toContain('re-indexado');
    });
  });
});
