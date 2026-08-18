// backend/tests/servicios/rag.servicio.test.js
// Tests unitarios para el servicio RAG del Asistente Académico IA (US-29)

jest.mock('pdf-parse', () => jest.fn());

let ragService;

beforeEach(() => {
  jest.resetModules();
  jest.mock('pdf-parse', () => jest.fn());
  ragService = require('../../servicios/rag.servicio');
  ragService.chunks = [];
  ragService.chunkHashes = new Set();
  ragService.duplicatesRemoved = 0;
  ragService.estaInicializado = false;
});

describe('extraerTokens()', () => {
  test('normaliza acentos y minúsculas', () => {
    const tokens = ragService.extraerTokens('Álgebra ANÁLISIS Geometría');
    expect(tokens).toContain('algebra');
    expect(tokens).toContain('analisis');
    expect(tokens).toContain('geometria');
  });

  test('filtra tokens cortos (≤ 2 caracteres)', () => {
    const tokens = ragService.extraerTokens('El de la os una ingeniería');
    expect(tokens).not.toContain('el');
    expect(tokens).not.toContain('de');
    expect(tokens).not.toContain('la');
    expect(tokens).not.toContain('os');
    expect(tokens).toContain('una');
    expect(tokens).toContain('ingenieria');
  });

  test('maneja texto vacío', () => {
    const tokens = ragService.extraerTokens('');
    expect(tokens).toEqual([]);
  });
});

describe('esSaludoOCharlaInicial()', () => {
  test('detecta saludos comunes en español argentino', () => {
    expect(ragService.esSaludoOCharlaInicial('Hola')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('buenas tardes')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('que tal')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('como andas')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('gracias')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('chau')).toBe(true);
  });

  test('detecta textos muy cortos como saludo', () => {
    expect(ragService.esSaludoOCharlaInicial('holi')).toBe(true);
    expect(ragService.esSaludoOCharlaInicial('hey')).toBe(true);
  });

  test('NO clasifica consultas académicas como saludos', () => {
    expect(ragService.esSaludoOCharlaInicial('¿Cuáles son las condiciones de regularidad de Paradigmas?')).toBe(false);
    expect(ragService.esSaludoOCharlaInicial('Modalidad de Algoritmos y Estructuras de Datos')).toBe(false);
  });
});

describe('esMetaConsultaCorpus()', () => {
  test('detecta consultas sobre cantidad de materias por año', () => {
    expect(ragService.esMetaConsultaCorpus('cuantas materias tiene primer año')).toBe(true);
    expect(ragService.esMetaConsultaCorpus('que modalidades tenes de segundo año')).toBe(true);
    expect(ragService.esMetaConsultaCorpus('cuantas modalidades hay en tercer ano')).toBe(true);
  });

  test('detecta consultas sobre el inventario del corpus', () => {
    expect(ragService.esMetaConsultaCorpus('que documentos tenes')).toBe(true);
    expect(ragService.esMetaConsultaCorpus('que temas conoces')).toBe(true);
  });

  test('NO clasifica consultas específicas como meta-consultas', () => {
    expect(ragService.esMetaConsultaCorpus('condiciones de regularidad paradigmas')).toBe(false);
    expect(ragService.esMetaConsultaCorpus('requisitos para aprobar algoritmos')).toBe(false);
  });
});

describe('Deduplicación de chunks (agregarChunk)', () => {
  test('acepta chunks con contenido único', () => {
    ragService.agregarChunk('doc1.pdf', 'Contenido único de prueba número uno', 0, 1, 1);
    ragService.agregarChunk('doc2.pdf', 'Contenido completamente diferente al anterior', 0, 1, 1);
    expect(ragService.chunks.length).toBe(2);
    expect(ragService.duplicatesRemoved).toBe(0);
  });

  test('elimina chunks duplicados de documentos distintos', () => {
    const textoRepetido = 'CONDICIONES DE REGULARIDAD: Aprobar ambos parciales con nota mínima de 4.';
    ragService.agregarChunk('Modalidad_Paradigmas.pdf', textoRepetido, 0, 1, 1);
    ragService.agregarChunk('Programa_Paradigmas.pdf', textoRepetido, 0, 1, 1);
    expect(ragService.chunks.length).toBe(1);
    expect(ragService.duplicatesRemoved).toBe(1);
    expect(ragService.chunks[0].documento).toBe('Modalidad_Paradigmas.pdf');
  });

  test('la deduplicación es insensible a diferencias de espacios y mayúsculas', () => {
    ragService.agregarChunk('doc1.pdf', 'CONDICIONES   de  Regularidad de Cátedra Oficial', 0, 1, 1);
    ragService.agregarChunk('doc2.pdf', 'condiciones de regularidad de cátedra oficial', 0, 1, 1);
    expect(ragService.chunks.length).toBe(1);
    expect(ragService.duplicatesRemoved).toBe(1);
  });
});

describe('recuperarContexto() — Búsqueda por similitud', () => {
  beforeEach(() => {
    ragService.chunks = [
      {
        id: 'modalidad_paradigmas_chunk_0',
        documento: 'Modalidad_Paradigmas_de_Programacion.pdf',
        pagina: 1,
        texto: 'CONDICIONES DE REGULARIDAD: Aprobar ambos parciales con nota mínima de 4. Se puede recuperar un parcial.',
        tokens: ragService.extraerTokens('CONDICIONES DE REGULARIDAD: Aprobar ambos parciales con nota mínima de 4. Se puede recuperar un parcial.')
      },
      {
        id: 'modalidad_algoritmos_chunk_0',
        documento: 'Modalidad_Algoritmos_y_Estructuras_de_Datos.pdf',
        pagina: 1,
        texto: 'APROBACIÓN DIRECTA: Se requiere promedio de 7 o más en ambos parciales sin instancia de recuperación.',
        tokens: ragService.extraerTokens('APROBACIÓN DIRECTA: Se requiere promedio de 7 o más en ambos parciales sin instancia de recuperación.')
      },
      {
        id: 'calendario_chunk_0',
        documento: 'Calendario_Examenes_2026.pdf',
        pagina: 1,
        texto: 'Turno Febrero/Marzo: Primer llamado 10/02, Segundo llamado 24/02. Inscripción 48 hs hábiles antes.',
        tokens: ragService.extraerTokens('Turno Febrero/Marzo: Primer llamado 10/02, Segundo llamado 24/02. Inscripción 48 hs hábiles antes.')
      }
    ];
    ragService.estaInicializado = true;
  });

  test('recupera chunks relevantes para consultas sobre regularidad', () => {
    const resultados = ragService.recuperarContexto('condiciones de regularidad');
    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados[0].documento).toContain('Paradigmas');
  });

  test('recupera chunks relevantes para consultas sobre aprobación directa', () => {
    const resultados = ragService.recuperarContexto('aprobación directa algoritmos');
    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados[0].documento).toContain('Algoritmos');
  });

  test('devuelve array vacío para consultas totalmente fuera de ámbito', () => {
    const resultados = ragService.recuperarContexto('receta de pizza napolitana');
    expect(resultados.length).toBe(0);
  });

  test('respeta el parámetro topK', () => {
    const resultados = ragService.recuperarContexto('parciales', 1);
    expect(resultados.length).toBeLessThanOrEqual(1);
  });
});

describe('Query Expansion en consultarChatbot()', () => {
  beforeEach(() => {
    ragService.chunks = [
      {
        id: 'test_chunk',
        documento: 'Modalidad_Paradigmas_de_Programacion.pdf',
        pagina: 1,
        texto: 'CONDICIONES DE REGULARIDAD de Paradigmas: Aprobar ambos parciales con nota mínima de 4.',
        tokens: ragService.extraerTokens('CONDICIONES DE REGULARIDAD de Paradigmas: Aprobar ambos parciales con nota mínima de 4.')
      }
    ];
    ragService.estaInicializado = true;
  });

  test('enriquece queries cortas con historial previo', async () => {
    const spy = jest.spyOn(ragService, 'recuperarContexto');
    const originalEnv = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    await ragService.consultarChatbot({
      prompt: '¿y la regularidad?',
      historial: [
        { rol: 'usuario', contenido: 'Contame sobre Paradigmas de Programación' },
        { rol: 'asistente', contenido: 'Paradigmas es una materia de 2° año...' }
      ]
    });

    const queryUsada = spy.mock.calls[0][0];
    expect(queryUsada).toContain('Paradigmas');
    expect(queryUsada).toContain('regularidad');

    process.env.GROQ_API_KEY = originalEnv;
    spy.mockRestore();
  });
});

describe('Caché en memoria de consultas', () => {
  beforeEach(() => {
    ragService.cache.clear();
    ragService.estaInicializado = true;
  });

  test('retorna respuesta cacheada si existe y no está expirada', async () => {
    const key = '¿materias de primer año?';
    ragService.cache.set(key.toLowerCase().trim(), {
      respuesta: 'Respuesta cacheada de prueba',
      fuentes: [],
      timestamp: Date.now()
    });

    const res = await ragService.consultarChatbot({ prompt: key, historial: [] });
    expect(res.desdeCache).toBe(true);
    expect(res.respuesta).toBe('Respuesta cacheada de prueba');
  });

  test('ignora caché expirada', async () => {
    const key = '¿materias de primer año?';
    ragService.cache.set(key.toLowerCase().trim(), {
      respuesta: 'Respuesta vieja',
      fuentes: [],
      timestamp: Date.now() - (40 * 60 * 1000) // Expirada (40 min > 30 min TTL)
    });

    const res = await ragService.consultarChatbot({ prompt: key, historial: [] });
    expect(res.desdeCache).toBeUndefined();
  });
});

describe('Espacio Vectorial y Similitud Coseno (construirIndiceVectorial)', () => {
  beforeEach(() => {
    ragService.chunks = [
      {
        id: 'c1',
        documento: 'Modalidad_Paradigmas.pdf',
        pagina: 1,
        texto: 'condiciones de regularidad de paradigmas de programacion parciales aprobados',
        tokens: ['condiciones', 'regularidad', 'paradigmas', 'programacion', 'parciales', 'aprobados']
      },
      {
        id: 'c2',
        documento: 'Modalidad_Algoritmos.pdf',
        pagina: 1,
        texto: 'aprobacion directa de algoritmos y estructuras de datos con promedio siete',
        tokens: ['aprobacion', 'directa', 'algoritmos', 'estructuras', 'datos', 'promedio', 'siete']
      }
    ];
    ragService.construirIndiceVectorial();
  });

  test('calcula mapa IDF correctamente', () => {
    expect(ragService.idfMap.size).toBeGreaterThan(0);
    expect(ragService.idfMap.has('paradigmas')).toBe(true);
    expect(ragService.idfMap.has('algoritmos')).toBe(true);
  });

  test('genera vectores y normas para cada chunk', () => {
    ragService.chunks.forEach(chunk => {
      expect(chunk.vector).toBeDefined();
      expect(chunk.norm).toBeGreaterThan(0);
    });
  });

  test('asigna mayor score de coseno a documentos más relevantes semánticamente', () => {
    const res = ragService.recuperarContexto('regularidad en paradigmas de programacion');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].documento).toBe('Modalidad_Paradigmas.pdf');
    expect(res[0].score).toBeGreaterThan(0);
  });
});

describe('consultarChatbotStream() — Streaming SSE', () => {
  beforeEach(() => {
    ragService.chunks = [
      {
        id: 'c1',
        documento: 'Modalidad_Paradigmas.pdf',
        pagina: 1,
        texto: 'condiciones de regularidad en paradigmas',
        tokens: ['condiciones', 'regularidad', 'paradigmas']
      }
    ];
    ragService.construirIndiceVectorial();
    ragService.estaInicializado = true;
  });

  test('emite fuentes via onContext y respuesta via onChunk en modo fallback/local', async () => {
    const originalEnv = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    let fuentesEmitidas = null;
    let chunkEmitido = null;

    const res = await ragService.consultarChatbotStream({
      prompt: 'condiciones de regularidad en paradigmas',
      historial: [],
      onContext: ({ fuentes }) => { fuentesEmitidas = fuentes; },
      onChunk: (chunk) => { chunkEmitido = chunk; }
    });

    expect(fuentesEmitidas).toBeDefined();
    expect(chunkEmitido).toBeDefined();
    expect(res.respuesta).toBeDefined();

    process.env.GROQ_API_KEY = originalEnv;
  });
});
