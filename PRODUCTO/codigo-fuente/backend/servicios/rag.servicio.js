// backend/servicios/rag.servicio.js
require('dotenv').config({ override: true });
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const crypto = require('crypto');

const CATALOGO_CORPUS = `
CATÁLOGO OFICIAL DE DOCUMENTOS INDEXADOS EN EL RAG (UTN FRC - SISTEMAS):
--------------------------------------------------------------------------------
1. MODALIDADES DE CÁTEDRA Y PLANIFICACIONES (PLAN 2023 / ORDENANZA 1877):
   - 1° Año (8 materias oficiales Plan 2023):
     * Troncales de Sistemas: Algoritmos y Estructuras de Datos, Arquitectura de Computadoras, Lógica y Estructuras Discretas (o Matemática Discreta), Sistemas y Procesos de Negocios.
     * Ciencias Básicas e Idiomas: Análisis Matemático I, Álgebra y Geometría Analítica, Física I, Inglés I.
     *(En Plan 2008 histórico se incluían además Química General e Ingeniería y Sociedad en 1° año).*
   - 2° Año (8 materias oficiales Plan 2023):
     * Troncales de Sistemas: Análisis de Sistemas de Información, Paradigmas de Programación, Probabilidades y Estadísticas, Sintaxis y Semántica de los Lenguajes, Sistemas Operativos.
     * Ciencias Básicas y Complementarias: Análisis Matemático II, Física II, Ingeniería y Sociedad.
   - 3° Año (8 materias oficiales Plan 2023):
     * Troncales y Electivas: Análisis Numérico, Backend de Aplicaciones, Bases de Datos, Comunicación de Datos, Desarrollo de Software, Diseño de Sistemas de Información, Seminario Integrador (para título intermedio de Analista Desarrollador Universitario).
     * Idiomas: Inglés II.
   - 4° Año (14 materias oficiales Plan 2023):
     * Troncales y Electivas: Administración de SI, Comunicación Multimedial, Desarrollo con Objetos, DevOps, Experiencia e Interfaces UX/UI, Gestión de Procesos de Negocio, Gestión Industrial, Green Software, Ingeniería y Calidad de Software, Investigación Operativa, Redes de Datos, Seguridad en el Desarrollo de Software, Tecnologías para la Automatización.
     * Complementarias: Legislación.
   - 5° Año (13 materias oficiales Plan 2023):
     * Troncales y Electivas: Ciencia de Datos, Consultoría en Negocios Digitales, Entornos Virtuales y Videojuegos, Blockchain, Emprendimientos Tecnológicos, Gerenciamiento Estratégico, Gestión Gerencial, Habilidades Blandas, Inteligencia Artificial, Proyecto Final, Seguridad en los Sistemas de Información, Testing de Software.
     * Complementarias: Economía.

2. PLANES DE ESTUDIO Y DISEÑOS CURRICULARES:
   - Plan 2023 ISI (Ordenanza N° 1877) y Régimen de Correlatividades Plan 2023 (Ordenanza N° 1878).
   - Título Intermedio de Analista Desarrollador Universitario (Ordenanzas N° 1910 y 1911).
   - Plan 2008 ISI (Ordenanza N° 1150 y Resolución 397/08), Plan 95 y Plan 85.

3. PROGRAMAS INSTITUCIONALES DE TUTORÍAS:
   - Programa de Tutorías de Inicio de Carrera (Acompañamiento a 1° y 2° año).
   - Programa de Tutoría de Finalización de Carrera (Apoyo en Proyecto Final y egreso).

4. REGLAMENTOS Y PROCEDIMIENTOS DE ALUMNOS (NORMA ISO / UTN):
   - ALU01-02: Reglamento de Práctica Profesional Supervisada (PPS).
   - ALU02-02: Procedimiento y formulario F0035-P para Solicitud de Cambio de Curso/Comisión por trabajo.
   - ALU04-01: Análisis y valoración de encuestas de cátedra.
   - Estatuto Universitario de la Universidad Tecnológica Nacional.

5. CALENDARIO ACADÉMICO, TURNOS Y FAQS:
   - Calendario de Exámenes: Turnos de Febrero/Marzo (2 llamados), Mayo (especial), Julio/Agosto (2 llamados), Septiembre (especial) y Diciembre (2 llamados).
   - Plazo de Inscripción a Exámenes Finales: 48 horas hábiles antes de la mesa en Autogestión.
   - Horarios de Cursado: Turno Mañana (08:00 a 13:15), Turno Tarde (13:30 a 18:45), Turno Noche (18:15 a 23:00).
   - Base oficial de Preguntas Frecuentes del Departamento de Sistemas.
--------------------------------------------------------------------------------
`;

const MATERIAS_DISAMBIGUATION = [
  // 1° Año
  { nombre: 'Algoritmos y Estructuras de Datos', patterns: [/algoritmos?\s+y\s+estructuras?/i, /\baed\b/i], targetDocs: ['algoritmos_y_estructura_de_datos', 'aed'] },
  { nombre: 'Arquitectura de Computadoras', patterns: [/arquitectura\s+de\s+computadoras?/i, /\baco\b/i], targetDocs: ['arquitectura_de_computadoras', 'aco'] },
  { nombre: 'Lógica y Estructuras Discretas', patterns: [/l[oó]gica\s+y\s+estructuras?/i, /matem[aá]tica\s+discreta/i, /\bled\b/i], targetDocs: ['logica', 'discreta', 'led'] },
  { nombre: 'Sistemas y Procesos de Negocios', patterns: [/sistemas?\s+y\s+procesos/i, /\bspn\b/i], targetDocs: ['sistemas_y_procesos', 'spn'] },
  { nombre: 'Análisis Matemático I', patterns: [/an[aá]lisis\s+matem[aá]tico\s+1/i, /an[aá]lisis\s+matem[aá]tico\s+i\b/i, /\bam1\b/i, /\bami\b/i, /an[aá]lisis\s+1\b/i, /an[aá]lisis\s+i\b/i], targetDocs: ['analisis_matematico_i', 'analisis_matematico_1'] },
  { nombre: 'Álgebra y Geometría Analítica', patterns: [/([aá]lgebra\s+y\s+geometr[ií]a|[aá]lgebra)/i, /\baga\b/i, /\balg\b/i], targetDocs: ['algebra', 'aga'] },
  { nombre: 'Física I', patterns: [/f[ií]sica\s+1/i, /f[ií]sica\s+i\b/i, /\bf1\b/i, /\bfi\b/i], targetDocs: ['fisica_i', 'fisica_1'] },
  { nombre: 'Inglés I', patterns: [/ingl[eé]s\s+1/i, /ingl[eé]s\s+i\b/i], targetDocs: ['ingles_i', 'ingles_1'] },
  { nombre: 'Ingeniería y Sociedad', patterns: [/ingenier[ií]a\s+y\s+sociedad/i, /\biys\b/i], targetDocs: ['ingenieria_y_sociedad', 'iys'] },
  { nombre: 'Química General', patterns: [/qu[ií]mica/i, /\bqg\b/i], targetDocs: ['quimica'] },

  // 2° Año
  { nombre: 'Análisis de Sistemas de Información', patterns: [/an[aá]lisis\s+de\s+sistemas/i, /\basi\b/i], targetDocs: ['analisis_de_sistemas', 'asi'] },
  { nombre: 'Paradigmas de Programación', patterns: [/paradigmas?/i, /\bppr\b/i, /\bpdp\b/i], targetDocs: ['paradigmas_de_programacion', 'paradigmas', 'ppr'] },
  { nombre: 'Probabilidad y Estadística', patterns: [/probabilidad(es)?\s+y\s+estad[ií]stica/i, /estad[ií]stica/i, /\bpye\b/i], targetDocs: ['probabilidades', 'estadistica', 'pye'] },
  { nombre: 'Sintaxis y Semántica de los Lenguajes', patterns: [/sintaxis/i, /\bssl\b/i], targetDocs: ['sintaxis', 'ssl'] },
  { nombre: 'Sistemas Operativos', patterns: [/sistemas?\s+operativos?/i, /\bsop?\b/i], targetDocs: ['sistemas_operativos', 'sop'] },
  { nombre: 'Análisis Matemático II', patterns: [/an[aá]lisis\s+matem[aá]tico\s+2/i, /an[aá]lisis\s+matem[aá]tico\s+ii\b/i, /\bam2\b/i, /\bamii\b/i, /an[aá]lisis\s+2\b/i, /an[aá]lisis\s+ii\b/i], targetDocs: ['analisis_matematico_ii', 'analisis_matematico_2'] },
  { nombre: 'Física II', patterns: [/f[ií]sica\s+2/i, /f[ií]sica\s+ii\b/i, /\bf2\b/i, /\bfii\b/i], targetDocs: ['fisica_ii', 'fisica_2'] },

  // 3° Año
  { nombre: 'Bases de Datos', patterns: [/bases?\s+de\s+datos/i, /\bbda?\b/i], targetDocs: ['base_de_datos', 'bases_de_datos', 'bd-'] },
  { nombre: 'Redes de Datos', patterns: [/redes?\s+de\s+datos/i, /\bredes?\b/i], targetDocs: ['redes_de_datos', 'red-'] },
  { nombre: 'Comunicación de Datos', patterns: [/comunicaci[oó]n\s+de\s+datos/i, /comunicaci[oó]n\s+datos/i], targetDocs: ['comunicacion_de_datos', 'com-'] },
  { nombre: 'Diseño de Sistemas de Información', patterns: [/dise[nñ]o\s+de\s+sistemas/i, /\bdsi\b/i], targetDocs: ['diseno_de_sistemas', 'dsi'] },
  { nombre: 'Desarrollo de Software', patterns: [/desarrollo\s+de\s+software/i, /\bdds\b/i], targetDocs: ['desarrollo_de_software', 'ds-'] },
  { nombre: 'Backend de Aplicaciones', patterns: [/backend/i], targetDocs: ['backend'] },
  { nombre: 'Análisis Numérico', patterns: [/an[aá]lisis\s+num[eé]rico/i, /\bnum[eé]rico\b/i], targetDocs: ['analisis_numerico'] },
  { nombre: 'Seminario Integrador', patterns: [/seminario(\s+integrador)?/i, /\bsem\b/i], targetDocs: ['seminario'] },
  { nombre: 'Inglés II', patterns: [/ingl[eé]s\s+2/i, /ingl[eé]s\s+ii\b/i], targetDocs: ['ingles_ii', 'ingles_2'] },

  // 4° Año
  { nombre: 'Investigación Operativa', patterns: [/investigaci[oó]n\s+operativa/i, /\biop?\b/i], targetDocs: ['investigacion_operativa', 'iop'] },
  { nombre: 'Administración de Sistemas de Información', patterns: [/administraci[oó]n\s+de\s+(si|sistemas)/i, /\badr\b/i], targetDocs: ['administracion_de_si', 'administracion_de_sistemas'] },
  { nombre: 'Ingeniería y Calidad de Software', patterns: [/calidad\s+de\s+software/i, /\bics\b/i], targetDocs: ['calidad_de_software', 'ics'] },
  { nombre: 'Gestión de Procesos de Negocio', patterns: [/gesti[oó]n\s+de\s+procesos/i, /\bgpn\b/i], targetDocs: ['gestion_de_procesos', 'gpn'] },
  { nombre: 'Seguridad en el Desarrollo de Software', patterns: [/seguridad\s+en\s+el\s+desarrollo/i, /\bsds\b/i], targetDocs: ['seguridad_en_el_desarrollo', 'sds'] },
  { nombre: 'Green Software', patterns: [/green\s+software/i, /\bgrs\b/i], targetDocs: ['green_software', 'grs'] },
  { nombre: 'DevOps', patterns: [/devops/i], targetDocs: ['devops'] },
  { nombre: 'Legislación', patterns: [/legislaci[oó]n/i, /\bleg\b/i], targetDocs: ['legislacion'] },
  { nombre: 'Gestión Industrial', patterns: [/gesti[oó]n\s+industrial/i, /\bgi\b/i], targetDocs: ['gestion_industrial'] },
  { nombre: 'Experiencia e Interfaces UX/UI', patterns: [/experiencia\s+e\s+interfaces/i, /\bux\b/i, /\bui\b/i], targetDocs: ['experiencia_e_interfaces', 'ux'] },

  // 5° Año
  { nombre: 'Inteligencia Artificial', patterns: [/inteligencia\s+artificial/i, /\bia\b/i], targetDocs: ['inteligencia_artificial', 'ia-'] },
  { nombre: 'Ciencia de Datos', patterns: [/ciencia\s+de\s+datos/i, /\bcd\b/i], targetDocs: ['ciencia_de_datos', 'cd-'] },
  { nombre: 'Proyecto Final', patterns: [/proyecto\s+final/i, /\bpf\b/i], targetDocs: ['proyecto_final', 'pf-'] },
  { nombre: 'Seguridad en los Sistemas de Información', patterns: [/seguridad\s+en\s+los\s+sistemas/i, /\bssi\b/i], targetDocs: ['seguridad_en_los_sistemas', 'ssi'] },
  { nombre: 'Testing de Software', patterns: [/testing/i, /\btst\b/i], targetDocs: ['testing'] },
  { nombre: 'Blockchain', patterns: [/blockchain/i, /\bdtb\b/i], targetDocs: ['blockchain', 'dtb'] },
  { nombre: 'Economía', patterns: [/econom[ií]a/i, /\beco\b/i], targetDocs: ['economia'] },
  { nombre: 'Habilidades Blandas', patterns: [/habilidades\s+blandas/i, /\bhb\b/i], targetDocs: ['habilidades_blandas', 'hb'] },
  { nombre: 'Emprendimientos Tecnológicos', patterns: [/emprendimientos?\s+tecnol[oó]gicos?/i, /\bet\b/i], targetDocs: ['emprendimientos', 'et'] }
];

class RagService {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'documentos_academicos');
    this.chunks = [];
    this.chunkHashes = new Set(); // Deduplicación de contenido por hash MD5
    this.duplicatesRemoved = 0;
    this.idfMap = new Map(); // Mapa de IDF para vectorización TF-IDF
    this.cache = new Map(); // Caché en memoria normalizado con TTL
    this.CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas de vigencia para ahorro de tokens
    this.estaInicializado = false;
    this.rejectionMessage = 'Esta consulta no se encuentra contemplada dentro de los reglamentos, normativas y planificaciones académicas oficiales de la carrera. Por favor, realizá una consulta sobre condiciones de cursado, regularidad, aprobación directa, correlatividades, fechas de examen o trámites de Ingeniería en Sistemas de Información.';
  }

  _normalizeCacheKey(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Inicializa e indexa todos los documentos académicos (PDFs, TXT, MD)
   */
  async inicializar() {
    try {
      if (!fs.existsSync(this.docsDir)) {
        fs.mkdirSync(this.docsDir, { recursive: true });
      }

      console.log('📚 [RAG Service] Indexando documentos académicos en:', this.docsDir);
      const archivos = fs.readdirSync(this.docsDir);
      this.chunks = [];
      this.chunkHashes.clear();
      this.duplicatesRemoved = 0;
      this.cache.clear();

      for (const archivo of archivos) {
        const rutaCompleta = path.join(this.docsDir, archivo);
        const ext = path.extname(archivo).toLowerCase();
        
        try {
          if (ext === '.pdf') {
            const buffer = fs.readFileSync(rutaCompleta);
            const pdfData = await pdfParse(buffer);
            this.procesarTextoEnChunks(archivo, pdfData.text, pdfData.numpages || 1);
          } else if (ext === '.txt' || ext === '.md') {
            const texto = fs.readFileSync(rutaCompleta, 'utf8');
            this.procesarTextoEnChunks(archivo, texto, 1);
          }
        } catch (fileErr) {
          console.warn(`⚠️ [RAG Service] No se pudo procesar ${archivo}:`, fileErr.message);
        }
      }

      // Precalcular espacio vectorial TF-IDF y normas de similitud coseno
      this.construirIndiceVectorial();

      this.estaInicializado = true;
      console.log(`✅ [RAG Service] Indexación completada: ${this.chunks.length} bloques semánticos vectorizados con similitud coseno (${this.duplicatesRemoved} duplicados eliminados).`);
    } catch (error) {
      console.error('❌ [RAG Service] Error al inicializar corpus:', error.message);
    }
  }

  /**
   * Divide un texto en bloques semánticos inteligentes.
   * Prioriza secciones lógicas (CONDICIONES, REGULARIDAD, etc.) como delimitadores primarios.
   */
  procesarTextoEnChunks(nombreDoc, textoCompleto, numPaginas) {
    if (!textoCompleto) return;

    const textoNormalizado = textoCompleto.replace(/\r\n/g, '\n');

    // Chunking semántico: priorizar secciones lógicas del documento
    const seccionesRegex = /\n(?=(?:CONDICIONES DE|REGULARIDAD|APROBACIÓN DIRECTA|APROBACION DIRECTA|RÉGIMEN DE|REGIMEN DE|MODALIDAD DE|CORRELATIVIDADES|CONTENIDOS MÍNIMOS|OBJETIVOS|PROGRAMA ANALÍTICO|BIBLIOGRAFÍA|EVALUACIÓN|METODOLOGÍA|CARGA HORARIA|REQUISITOS)[^\n]*)/gi;
    
    let bloquesCrudos;
    const seccionesSplit = textoNormalizado.split(seccionesRegex);
    
    if (seccionesSplit.length > 1) {
      // El documento tiene secciones lógicas detectables
      bloquesCrudos = seccionesSplit
        .map(p => p.trim())
        .filter(p => p.length > 20);
    } else {
      // Fallback: separar por párrafos como antes
      bloquesCrudos = textoNormalizado
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(p => p.length > 20);
    }

    bloquesCrudos.forEach((bloque, idx) => {
      if (bloque.length > 1100) {
        const subFrases = bloque.split(/(?<=[.?!])\s+/);
        let subChunk = '';
        subFrases.forEach((frase, sIdx) => {
          if ((subChunk + ' ' + frase).length > 650) {
            this.agregarChunk(nombreDoc, subChunk.trim(), `${idx}_${sIdx}`, numPaginas, bloquesCrudos.length);
            subChunk = frase;
          } else {
            subChunk += ' ' + frase;
          }
        });
        if (subChunk.trim().length > 20) {
          this.agregarChunk(nombreDoc, subChunk.trim(), `${idx}_end`, numPaginas, bloquesCrudos.length);
        }
      } else {
        this.agregarChunk(nombreDoc, bloque, idx, numPaginas, bloquesCrudos.length);
      }
    });
  }

  /**
   * Agrega un chunk al índice con deduplicación por hash MD5.
   * Si el contenido textual ya fue indexado desde otro documento, se descarta.
   */
  agregarChunk(nombreDoc, texto, idSub, numPaginas, totalBloques) {
    const palabras = this.extraerTokens(texto);
    if (palabras.length >= 3) {
      // Deduplicación: calcular hash MD5 del texto normalizado
      const textoNorm = texto.toLowerCase().replace(/\s+/g, ' ').trim();
      const hash = crypto.createHash('md5').update(textoNorm).digest('hex');
      
      if (this.chunkHashes.has(hash)) {
        this.duplicatesRemoved++;
        return; // Chunk duplicado, saltar
      }
      this.chunkHashes.add(hash);

      this.chunks.push({
        id: `${nombreDoc}_chunk_${idSub}`,
        documento: nombreDoc,
        pagina: Math.min(numPaginas, Math.floor(parseInt(idSub, 10) / Math.max(1, Math.floor(totalBloques / numPaginas))) + 1) || 1,
        texto: texto,
        tokens: palabras
      });
    }
  }

  /**
   * Tokenización y normalización de texto
   */
  extraerTokens(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }

  /**
   * Detecta si una consulta es un saludo o introducción conversacional
   */
  esSaludoOCharlaInicial(texto) {
    const t = texto.toLowerCase().trim();
    const patronesSaludo = [
      /^hola\b/i, /^buenas\b/i, /^buen dia\b/i, /^buenos dias\b/i, /^buenas tardes\b/i, /^buenas noches\b/i,
      /^como andas\b/i, /^como estas\b/i, /^que tal\b/i, /^quien sos\b/i, /^que podes hacer\b/i,
      /^gracias\b/i, /^muchas gracias\b/i, /^chau\b/i, /^adios\b/i, /^hasta luego\b/i
    ];
    return patronesSaludo.some(p => p.test(t)) || t.length < 5;
  }

  /**
   * Detecta si la consulta pregunta sobre el inventario/catálogo del corpus
   */
  esMetaConsultaCorpus(texto) {
    const t = texto.toLowerCase();
    return (
      t.includes('cuantas modalidades') ||
      t.includes('cuantas materias') ||
      t.includes('que materias tenes') ||
      t.includes('que modalidades tenes') ||
      t.includes('primer ano') ||
      t.includes('primer año') ||
      t.includes('segundo ano') ||
      t.includes('segundo año') ||
      t.includes('tercer ano') ||
      t.includes('tercer año') ||
      t.includes('cuarto ano') ||
      t.includes('cuarto año') ||
      t.includes('quinto ano') ||
      t.includes('quinto año') ||
      t.includes('que documentos tenes') ||
      t.includes('que temas conoces')
    );
  }

  /**
   * Construye el índice vectorial TF-IDF y precalcula los embeddings y normas de cada chunk
   */
  construirIndiceVectorial() {
    this.idfMap = new Map();
    const totalDocs = this.chunks.length;
    if (totalDocs === 0) return;

    // 1. Contar frecuencia de documentos (DF) para cada término único en el vocabulario
    const dfMap = new Map();
    this.chunks.forEach(chunk => {
      const terminosUnicos = new Set(chunk.tokens);
      terminosUnicos.forEach(term => {
        dfMap.set(term, (dfMap.get(term) || 0) + 1);
      });
    });

    // 2. Calcular IDF suavizado (BM25/TF-IDF)
    dfMap.forEach((df, term) => {
      const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5)) + 1.0;
      this.idfMap.set(term, idf);
    });

    // 3. Generar vector de pesos TF-IDF y calcular norma Euclidiana de cada chunk
    this.chunks.forEach(chunk => {
      const tfMap = new Map();
      chunk.tokens.forEach(term => {
        tfMap.set(term, (tfMap.get(term) || 0) + 1);
      });

      const vector = new Map();
      let sumaCuadrados = 0;
      const totalTokens = chunk.tokens.length;

      tfMap.forEach((count, term) => {
        const tf = count / totalTokens;
        const idf = this.idfMap.get(term) || 1.0;
        const peso = tf * idf;
        vector.set(term, peso);
        sumaCuadrados += peso * peso;
      });

      chunk.vector = vector;
      chunk.norm = Math.sqrt(sumaCuadrados) || 1.0;
    });
  }

  /**
   * Búsqueda semántica vectorial basada en Similitud Coseno con boosting de metadatos
   */
  recuperarContexto(query, topK = 6) {
    if (this.chunks.length === 0) return [];

    const queryTokens = this.extraerTokens(query);
    if (queryTokens.length === 0) return [];

    // Si el índice no fue vectorizado aún, inicializarlo
    if (!this.idfMap || this.idfMap.size === 0) {
      this.construirIndiceVectorial();
    }

    // 1. Detectar si la consulta apunta a una materia específica
    const materiaDetectada = MATERIAS_DISAMBIGUATION.find(m => m.patterns.some(p => p.test(query)));

    // 2. Vectorizar la consulta
    const queryTf = new Map();
    queryTokens.forEach(term => {
      queryTf.set(term, (queryTf.get(term) || 0) + 1);
    });

    const queryVector = new Map();
    let querySumaCuadrados = 0;
    const totalQueryTokens = queryTokens.length;

    queryTf.forEach((count, term) => {
      const tf = count / totalQueryTokens;
      const idf = this.idfMap?.get(term) || 1.0;
      const peso = tf * idf;
      queryVector.set(term, peso);
      querySumaCuadrados += peso * peso;
    });

    const queryNorm = Math.sqrt(querySumaCuadrados) || 1.0;
    const querySet = new Set(queryTokens);
    // 3. Extraer tokens de intención pura (excluyendo el nombre de la materia para no diluir el ranking)
    let intentTokens = queryTokens;
    if (materiaDetectada) {
      const subjectTokens = new Set(this.extraerTokens(materiaDetectada.nombre));
      intentTokens = queryTokens.filter(t => !subjectTokens.has(t));
    }

    const esConsultaEvaluacion = /aprob|promoc|regular|nota|parcial|recuperator|evalua|calificac|tpi|libre|condici/i.test(query);
    const esConsultaCorrelativas = /correlat|cursar|rendir|requisito|plan/i.test(query);
    const esConsultaDocentes = /docente|profesor|c[aá]tedra|jtp|titular|adjunto/i.test(query);

    // 4. Calcular similitud coseno entre vector de consulta y cada chunk con boosting de intención
    const scoredChunks = this.chunks.map(chunk => {
      let chunkVector = chunk.vector;
      let chunkNorm = chunk.norm;

      if (!chunkVector) {
        chunkVector = new Map();
        let sumSq = 0;
        const tTokens = chunk.tokens.length || 1;
        chunk.tokens.forEach(t => {
          const w = (1 / tTokens) * (this.idfMap?.get(t) || 1.0);
          chunkVector.set(t, (chunkVector.get(t) || 0) + w);
          sumSq += w * w;
        });
        chunkNorm = Math.sqrt(sumSq) || 1.0;
      }

      let productoPunto = 0;
      queryVector.forEach((qPeso, term) => {
        if (chunkVector.has(term)) {
          productoPunto += qPeso * chunkVector.get(term);
        }
      });

      let similitudCoseno = productoPunto / (queryNorm * chunkNorm);
      const chunkTextLower = (chunk.texto || '').toLowerCase();
      const docLower = (chunk.documento || '').toLowerCase();

      // Boosting por palabras clave de intención del alumno
      let intentBoost = 0;
      if (intentTokens.length > 0) {
        let intentMatches = 0;
        intentTokens.forEach(it => {
          if (chunkTextLower.includes(it)) intentMatches++;
        });
        intentBoost = intentMatches * 0.45;
      }

      // Boosting por cabeceras y secciones canónicas del documento
      let headerBoost = 0;
      if (esConsultaEvaluacion) {
        if (/condiciones?\s+de\s+aprobaci|r[eé]gimen\s+de\s+aprobaci/i.test(chunkTextLower)) headerBoost += 3.5;
        if (/aprobaci[oó]n\s+directa|promoci[oó]n\s+directa/i.test(chunkTextLower)) headerBoost += 3.0;
        if (/regularidad|regular:|condici[oó]n\s+regular/i.test(chunkTextLower)) headerBoost += 2.5;
        if (/nota\s+[0-9]|aprobados?\s+con\s+nota|calificaci[oó]n\s+de\s+[0-9]/i.test(chunkTextLower)) headerBoost += 2.5;
        if (/escala\s+para\s+la\s+regularidad|escala\s+de\s+notas/i.test(chunkTextLower)) headerBoost += 2.0;
        if (/recuperatori|evaluaciones\s+parciales/i.test(chunkTextLower)) headerBoost += 1.5;
      }

      if (esConsultaCorrelativas) {
        if (/correlativida|para\s+cursar|para\s+rendir|ordenanza\s+1878/i.test(chunkTextLower)) headerBoost += 3.0;
      }

      if (esConsultaDocentes) {
        if (/cuerpo\s+docente|n[oó]mina\s+de\s+docentes|profesor\s+titular/i.test(chunkTextLower)) headerBoost += 3.0;
      }

      similitudCoseno += intentBoost + headerBoost;

      // Subject-Specific Disambiguation Boosting
      if (materiaDetectada) {
        const esDelDocObjetivo = materiaDetectada.targetDocs.some(td => docLower.includes(td));
        if (esDelDocObjetivo) {
          // Boost masivo al documento exacto de la materia consultada
          similitudCoseno = (similitudCoseno * 5.0) + 1.5;
        } else {
          // Verificar si pertenece a OTRA materia para penalizarlo y evitar citas cruzadas
          const otraMateria = MATERIAS_DISAMBIGUATION.find(om => 
            om.nombre !== materiaDetectada.nombre && om.targetDocs.some(td => docLower.includes(td))
          );
          if (otraMateria) {
            similitudCoseno = similitudCoseno * 0.02; // Fuerte penalización a materias ajenas
          }
        }
      } else {
        // Metadata boosting estándar por coincidencia de tokens en el nombre del archivo
        const docTokens = this.extraerTokens(chunk.documento);
        let docMatches = 0;
        docTokens.forEach(dt => {
          if (querySet.has(dt)) docMatches++;
        });

        if (docMatches >= 2) {
          similitudCoseno = (similitudCoseno * 2.5) + (docMatches * 0.15);
        } else if (docMatches === 1) {
          similitudCoseno = (similitudCoseno * 1.5) + 0.05;
        }
      }

      return {
        ...chunk,
        score: similitudCoseno
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    // Si se detectó una materia específica, filtrar exclusivamente los fragmentos de esa materia
    if (materiaDetectada) {
      const deLaMateria = scoredChunks.filter(c => 
        materiaDetectada.targetDocs.some(td => (c.documento || '').toLowerCase().includes(td))
      );
      if (deLaMateria.length > 0) {
        return deLaMateria.slice(0, Math.min(topK, 3));
      }
    }

    // Filtro dinámico de calidad general: si el primer resultado tiene alta confianza, limitamos a los 3 mejores
    const filtrados = scoredChunks.filter(c => c.score > 0.05);
    if (filtrados.length > 0 && filtrados[0].score >= 0.22) {
      return filtrados.slice(0, Math.min(topK, 3));
    }
    return filtrados.slice(0, Math.min(topK, 4));
  }

  _getApiKey() {
    return process.env.GROQ_API_KEY || null;
  }

  /**
   * Consulta al LLM enriquecida con RAG, lenguaje natural y Grounding inteligente.
   * Incluye query expansion para preguntas de seguimiento y caché normalizado.
   */
  async consultarChatbot({ prompt, historial = [] }) {
    const cacheKey = this._normalizeCacheKey(prompt);
    const rawKey = (prompt || '').toLowerCase().trim();
    if ((!historial || historial.length === 0) && (this.cache.has(cacheKey) || this.cache.has(rawKey))) {
      const cached = this.cache.get(cacheKey) || this.cache.get(rawKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        return {
          respuesta: cached.respuesta,
          fuentes: cached.fuentes,
          desdeCache: true
        };
      }
    }

    if (!this.estaInicializado || this.chunks.length === 0) {
      await this.inicializar();
    }

    // Fast-path: respuestas locales directas para saludos/agradecimientos (0 tokens de API)
    if (this.esSaludoOCharlaInicial(prompt)) {
      let respSaludo = '¡Hola! 👋 Soy tu Asistente Académico oficial de Campus UTN. Podés consultarme sobre condiciones de aprobación directa, regularidad, fechas de exámenes finales, correlatividades, docentes y reglamentos de Ingeniería en Sistemas. ¿En qué materia o trámite te puedo ayudar hoy?';
      if (cacheKey.includes('gracias') || cacheKey.includes('joya') || cacheKey.includes('genial')) {
        respSaludo = '¡De nada! Si te surge cualquier otra duda sobre las materias o el cursado, acá estoy para ayudarte. ¡Muchos éxitos en la carrera! 🚀';
      } else if (cacheKey.includes('chau') || cacheKey.includes('adios') || cacheKey.includes('hasta luego')) {
        respSaludo = '¡Hasta luego! Que tengas un excelente día de cursado. 👋';
      }
      return { respuesta: respSaludo, fuentes: [] };
    }

    const esMeta = this.esMetaConsultaCorpus(prompt);

    // Query expansion para preguntas de seguimiento
    let queryParaBusqueda = prompt;
    if (!esMeta && Array.isArray(historial) && historial.length > 0) {
      const tokensPrompt = this.extraerTokens(prompt);
      if (tokensPrompt.length < 6) {
        const ultimoMensajeUsuario = [...historial]
          .reverse()
          .find(h => h.rol === 'usuario' || h.role === 'user');
        if (ultimoMensajeUsuario) {
          const contenidoPrevio = ultimoMensajeUsuario.contenido || ultimoMensajeUsuario.content || '';
          queryParaBusqueda = `${contenidoPrevio} ${prompt}`;
        }
      }
    }

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 4);

    if (!esMeta && fragmentosRelevantes.length === 0) {
      return {
        respuesta: this.rejectionMessage,
        fuentes: []
      };
    }

    const contextoStr = fragmentosRelevantes
      .map((f) => `[DOCUMENTO OFICIAL: ${f.documento} (Pág. ~${f.pagina})]\n${f.texto}`)
      .join('\n\n---\n\n');

    // Catálogo dinámico: solo inyecta el catálogo completo de 5 años si es una meta-consulta
    const seccionCatalogo = esMeta
      ? `===================================================================\n${CATALOGO_CORPUS}\n===================================================================`
      : `DIRECTIVA: Respondé en base estricta a los fragmentos del CONTEXTO RECUPERADO. El campus cuenta con todas las modalidades académicas de ISI UTN FRC (Plan 2023 y Plan 2008).`;

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (títulos claros, negritas en notas y requisitos clave, viñetas y tablas Markdown estándar).

DIRECTIVAS Y REGLAS DE RESPUESTA:
1. CONSULTAS ACADÉMICAS ESPECÍFICAS (GROUNDING RAG):
   - Respondé basándote fielmente en los fragmentos del CONTEXTO RECUPERADO y citá siempre la fuente oficial consultada (ejemplo: *Fuente: Modalidad Académica - Paradigmas de Programación (Plan 2023)*).
2. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

${seccionCatalogo}

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${contextoStr || 'No se requirió fragmento específico.'}
===================================================================`;

    // History pruning: mandar últimos 3 mensajes y truncar respuestas anteriores largas para ahorrar tokens
    const mensajes = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(historial)) {
      historial.slice(-3).forEach(h => {
        const rawContent = h.contenido || h.content || '';
        const content = (h.rol === 'asistente' || h.role === 'assistant')
          ? (rawContent.length > 250 ? rawContent.substring(0, 250) + '...' : rawContent)
          : rawContent;
        if (h.rol === 'usuario' || h.role === 'user') {
          mensajes.push({ role: 'user', content });
        } else if (h.rol === 'asistente' || h.role === 'assistant') {
          mensajes.push({ role: 'assistant', content });
        }
      });
    }

    mensajes.push({ role: 'user', content: prompt });

    const apiKey = this._getApiKey();
    if (!apiKey) {
      return {
        respuesta: fragmentosRelevantes.length > 0 
          ? `**Respuesta Asistida (Modo Local):**\n\n${fragmentosRelevantes[0].texto}\n\n*Fuente: ${fragmentosRelevantes[0].documento}*`
          : '¡Hola! Soy tu asistente de Campus UTN. Podés consultarme sobre modalidades de materias y reglamentos de la carrera.',
        fuentes: fragmentosRelevantes.map(f => ({ documento: f.documento, pagina: f.pagina, fragmento: f.texto }))
      };
    }

    const modelosDisponibles = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

    for (const modelName of modelosDisponibles) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: mensajes,
            temperature: 0.15,
            max_tokens: 850
          })
        });

        if (response.ok) {
          const data = await response.json();
          const respuestaLLM = data.choices?.[0]?.message?.content || this.rejectionMessage;

          const resultado = {
            respuesta: respuestaLLM,
            fuentes: fragmentosRelevantes.map(f => ({
              documento: f.documento,
              pagina: f.pagina,
              fragmento: f.texto.substring(0, 180) + '...'
            }))
          };

          if (!historial || historial.length === 0) {
            this.cache.set(cacheKey, { ...resultado, timestamp: Date.now() });
          }

          return resultado;
        }
      } catch (err) {
        console.warn(`⚠️ [Groq Fallback] Error con modelo ${modelName}:`, err.message);
      }
    }

    return {
      respuesta: fragmentosRelevantes.length > 0 
        ? `**Respuesta Asistida:**\n\n${fragmentosRelevantes.map(f => `* ${f.texto}`).join('\n\n')}\n\n*Fuente: ${fragmentosRelevantes[0]?.documento || 'Documentación oficial'}*`
        : this.rejectionMessage,
      fuentes: fragmentosRelevantes.map(f => ({ documento: f.documento, pagina: f.pagina, fragmento: f.texto }))
    };
  }

  /**
   * Consulta al LLM con streaming en tiempo real (SSE), RAG y optimización de tokens
   */
  async consultarChatbotStream({ prompt, historial = [], onChunk, onContext }) {
    if (!this.estaInicializado || this.chunks.length === 0) {
      await this.inicializar();
    }

    const cacheKey = this._normalizeCacheKey(prompt);
    if ((!historial || historial.length === 0) && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        if (onContext) onContext({ fuentes: cached.fuentes });
        if (onChunk) onChunk(cached.respuesta);
        return { respuesta: cached.respuesta, fuentes: cached.fuentes, desdeCache: true };
      }
    }

    // Fast-path: respuestas locales directas para saludos y agradecimientos
    if (this.esSaludoOCharlaInicial(prompt)) {
      let respSaludo = '¡Hola! 👋 Soy tu Asistente Académico oficial de Campus UTN. Podés consultarme sobre condiciones de aprobación directa, regularidad, fechas de exámenes finales, correlatividades, docentes y reglamentos de Ingeniería en Sistemas. ¿En qué materia o trámite te puedo ayudar hoy?';
      if (cacheKey.includes('gracias') || cacheKey.includes('joya') || cacheKey.includes('genial')) {
        respSaludo = '¡De nada! Si te surge cualquier otra duda sobre las materias o el cursado, acá estoy para ayudarte. ¡Muchos éxitos en la carrera! 🚀';
      } else if (cacheKey.includes('chau') || cacheKey.includes('adios') || cacheKey.includes('hasta luego')) {
        respSaludo = '¡Hasta luego! Que tengas un excelente día de cursado. 👋';
      }
      if (onContext) onContext({ fuentes: [] });
      if (onChunk) onChunk(respSaludo);
      return { respuesta: respSaludo, fuentes: [] };
    }

    const esMeta = this.esMetaConsultaCorpus(prompt);

    let queryParaBusqueda = prompt;
    if (!esMeta && Array.isArray(historial) && historial.length > 0) {
      const tokensPrompt = this.extraerTokens(prompt);
      if (tokensPrompt.length < 6) {
        const ultimoMensajeUsuario = [...historial]
          .reverse()
          .find(h => h.rol === 'usuario' || h.role === 'user');
        if (ultimoMensajeUsuario) {
          const contenidoPrevio = ultimoMensajeUsuario.contenido || ultimoMensajeUsuario.content || '';
          queryParaBusqueda = `${contenidoPrevio} ${prompt}`;
        }
      }
    }

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 4);

    if (!esMeta && fragmentosRelevantes.length === 0) {
      if (onContext) onContext({ fuentes: [] });
      if (onChunk) onChunk(this.rejectionMessage);
      return { respuesta: this.rejectionMessage, fuentes: [] };
    }

    const fuentesFormateadas = fragmentosRelevantes.map(f => ({
      documento: f.documento,
      pagina: f.pagina,
      fragmento: f.texto.substring(0, 180) + '...'
    }));

    if (onContext) {
      onContext({ fuentes: fuentesFormateadas });
    }

    const contextoStr = fragmentosRelevantes
      .map((f) => `[DOCUMENTO OFICIAL: ${f.documento} (Pág. ~${f.pagina})]\n${f.texto}`)
      .join('\n\n---\n\n');

    const seccionCatalogo = esMeta
      ? `===================================================================\n${CATALOGO_CORPUS}\n===================================================================`
      : `DIRECTIVA: Respondé en base estricta a los fragmentos del CONTEXTO RECUPERADO. El campus cuenta con todas las modalidades académicas de ISI UTN FRC (Plan 2023 y Plan 2008).`;

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (títulos claros, negritas en notas y requisitos clave, viñetas y tablas Markdown estándar).

DIRECTIVAS Y REGLAS DE RESPUESTA:
1. CONSULTAS ACADÉMICAS ESPECÍFICAS (GROUNDING RAG):
   - Respondé basándote fielmente en los fragmentos del CONTEXTO RECUPERADO y citá siempre la fuente oficial consultada (ejemplo: *Fuente: Modalidad Académica - Paradigmas de Programación (Plan 2023)*).
2. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

${seccionCatalogo}

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${contextoStr || 'No se requirió fragmento específico.'}
===================================================================`;

    const mensajes = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(historial)) {
      historial.slice(-3).forEach(h => {
        const rawContent = h.contenido || h.content || '';
        const content = (h.rol === 'asistente' || h.role === 'assistant')
          ? (rawContent.length > 250 ? rawContent.substring(0, 250) + '...' : rawContent)
          : rawContent;
        if (h.rol === 'usuario' || h.role === 'user') {
          mensajes.push({ role: 'user', content });
        } else if (h.rol === 'asistente' || h.role === 'assistant') {
          mensajes.push({ role: 'assistant', content });
        }
      });
    }

    mensajes.push({ role: 'user', content: prompt });

    const apiKey = this._getApiKey();
    if (!apiKey) {
      const fallbackResp = fragmentosRelevantes.length > 0 
        ? `**Respuesta Asistida (Modo Local):**\n\n${fragmentosRelevantes[0].texto}\n\n*Fuente: ${fragmentosRelevantes[0].documento}*`
        : '¡Hola! Soy tu asistente de Campus UTN. Podés consultarme sobre modalidades de materias y reglamentos de la carrera.';
      if (onChunk) onChunk(fallbackResp);
      return { respuesta: fallbackResp, fuentes: fuentesFormateadas };
    }

    const modelosDisponibles = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

    for (const modelName of modelosDisponibles) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: mensajes,
            temperature: 0.15,
            max_tokens: 850,
            stream: true
          })
        });

        if (response.ok && response.body) {
          let respuestaCompleta = '';
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                try {
                  const parsed = JSON.parse(trimmed.substring(6));
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    respuestaCompleta += delta;
                    if (onChunk) onChunk(delta);
                  }
                } catch (e) {
                  // Buffer chunk incompleto
                }
              }
            }
          }

          if (respuestaCompleta.trim().length > 0) {
            const resultadoFinal = {
              respuesta: respuestaCompleta,
              fuentes: fuentesFormateadas
            };
            if (!historial || historial.length === 0) {
              this.cache.set(cacheKey, { ...resultadoFinal, timestamp: Date.now() });
            }
            return resultadoFinal;
          }
        }
      } catch (err) {
        console.warn(`⚠️ [Groq Stream Fallback] Error con modelo ${modelName}:`, err.message);
      }
    }

    const fallbackFinal = fragmentosRelevantes.length > 0 
      ? `**Respuesta Asistida:**\n\n${fragmentosRelevantes.map(f => `* ${f.texto}`).join('\n\n')}\n\n*Fuente: ${fragmentosRelevantes[0]?.documento || 'Documentación oficial'}*`
      : this.rejectionMessage;
    if (onChunk) onChunk(fallbackFinal);
    return { respuesta: fallbackFinal, fuentes: fuentesFormateadas };
  }

  /**
   * Obtiene la lista de documentos disponibles en el corpus
   */
  obtenerDocumentosDisponibles() {
    if (!fs.existsSync(this.docsDir)) return [];
    return fs.readdirSync(this.docsDir).map(archivo => {
      const stat = fs.statSync(path.join(this.docsDir, archivo));
      return {
        nombre: archivo,
        tipo: path.extname(archivo).replace('.', '').toUpperCase(),
        tamanoBytes: stat.size,
        fechaModificacion: stat.mtime
      };
    });
  }
}

const ragServiceInstance = new RagService();
module.exports = ragServiceInstance;
