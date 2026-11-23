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
  { nombre: 'Algoritmos y Estructuras de Datos', targetDocs: ['algoritmos_y_estructura_de_datos', 'aed'] },
  { nombre: 'Arquitectura de Computadoras', targetDocs: ['arquitectura_de_computadoras', 'aco'] },
  { nombre: 'Lógica y Estructuras Discretas', targetDocs: ['logica', 'discreta', 'led'] },
  { nombre: 'Sistemas y Procesos de Negocios', targetDocs: ['sistemas_y_procesos', 'spn'] },
  { nombre: 'Análisis Matemático I', targetDocs: [], sinDocumento: true },
  { nombre: 'Álgebra y Geometría Analítica', targetDocs: [], sinDocumento: true },
  { nombre: 'Física I', targetDocs: [], sinDocumento: true },
  { nombre: 'Inglés I', targetDocs: [], sinDocumento: true },
  { nombre: 'Ingeniería y Sociedad', targetDocs: [], sinDocumento: true },
  { nombre: 'Química General', targetDocs: [], sinDocumento: true },

  // 2° Año
  { nombre: 'Análisis de Sistemas de Información', targetDocs: ['analisis_de_sistemas', 'asi'] },
  { nombre: 'Paradigmas de Programación', targetDocs: ['paradigmas_de_programacion', 'paradigmas', 'ppr'] },
  { nombre: 'Probabilidad y Estadística', targetDocs: ['probabilidades', 'estadistica', 'pye'] },
  { nombre: 'Sintaxis y Semántica de los Lenguajes', targetDocs: ['sintaxis', 'ssl'] },
  { nombre: 'Sistemas Operativos', targetDocs: ['sistemas_operativos', 'sop'] },
  { nombre: 'Análisis Matemático II', targetDocs: [], sinDocumento: true },
  { nombre: 'Física II', targetDocs: [], sinDocumento: true },

  // 3° Año
  { nombre: 'Bases de Datos', targetDocs: ['base_de_datos', 'bases_de_datos', 'bd-'] },
  { nombre: 'Redes de Datos', targetDocs: ['redes_de_datos', 'red-'] },
  { nombre: 'Comunicación de Datos', targetDocs: ['comunicacion_de_datos', 'comunicaci', 'com_'] },
  { nombre: 'Diseño de Sistemas de Información', targetDocs: ['diseno_de_sistemas', 'dise', 'dsi'] },
  { nombre: 'Desarrollo de Software', targetDocs: ['desarrollo_de_software', 'ds_'] },
  { nombre: 'Backend de Aplicaciones', targetDocs: ['backend', 'bda'] },
  { nombre: 'Análisis Numérico', targetDocs: ['analisis_numerico', 'an_'] },
  { nombre: 'Seminario Integrador', targetDocs: ['seminario', 'sem_'] },
  { nombre: 'Inglés II', targetDocs: [], sinDocumento: true },

  // 4° Año
  { nombre: 'Investigación Operativa', targetDocs: ['investigacion_operativa', 'iop'] },
  { nombre: 'Administración de Sistemas de Información', targetDocs: ['administracion_de_si', 'adsi'] },
  { nombre: 'Comunicación Multimedial', targetDocs: ['comunicacion_multimedial', 'consultoria_comunicacion'] },
  { nombre: 'Desarrollo de Aplicaciones con Objetos', targetDocs: ['aplicaciones_con_objetos', 'dao'] },
  { nombre: 'Ingeniería y Calidad de Software', targetDocs: ['calidad_de_software', 'ics'] },
  { nombre: 'Gestión de la Mejora de los Procesos', targetDocs: ['mejora_de_procesos', 'mejora_de_los_procesos', 'gmp'] },
  { nombre: 'Seguridad en el Desarrollo de Software', targetDocs: ['seguridad_en_el_desarrollo', 'sds'] },
  { nombre: 'Green Software', targetDocs: ['green_software', 'grs'] },
  { nombre: 'DevOps', targetDocs: ['devops'] },
  { nombre: 'Legislación', targetDocs: [], sinDocumento: true },
  { nombre: 'Gestión Industrial de la Producción', targetDocs: ['gestion_industrial', 'gip'] },
  { nombre: 'Experiencia e Interfaces UX/UI', targetDocs: ['experiencia_e_interfaces', 'ux'] },
  { nombre: 'Simulación', targetDocs: ['simulacion', 'automatizacion', 'tpa'] },

  // 5° Año
  { nombre: 'Inteligencia Artificial', targetDocs: ['inteligencia_artificial', 'iar'] },
  { nombre: 'Ciencia de Datos', targetDocs: ['ciencia_de_datos', 'cd_'] },
  { nombre: 'Proyecto Final', targetDocs: ['proyecto_final', 'proy'] },
  { nombre: 'Seguridad en los Sistemas de Información', targetDocs: ['seguridad_en_los_sistemas', 'ssi'] },
  { nombre: 'Testing de Software', targetDocs: ['testing', 'tso'] },
  { nombre: 'Blockchain', targetDocs: ['blockchain', 'dtb'] },
  { nombre: 'Economía', targetDocs: [], sinDocumento: true },
  { nombre: 'Habilidades Blandas', targetDocs: ['habilidades_blandas', 'hb_'] },
  { nombre: 'Emprendimientos Tecnológicos', targetDocs: ['emprendimientos', 'et_'] },
  { nombre: 'Consultoría en Negocios Digitales', targetDocs: ['consultoria_en_negocios', 'cnd'] },
  { nombre: 'Creatividad y Desarrollos en Entornos Virtuales', targetDocs: ['entornos_virtuales', 'cdev'] },
  { nombre: 'Decisiones en Escenarios Complejos', targetDocs: ['escenarios_complejos', 'dec'] },
  { nombre: 'Gerenciamiento Estratégico', targetDocs: ['gerenciamiento_estrategico', 'ge_'] },
  { nombre: 'Gestión Gerencial', targetDocs: ['gestion_gerencial', 'gestion_de_gestion_gerencial', 'gg_'] },
  { nombre: 'Ingeniería de Software de Fuentes Abiertas/Libres', targetDocs: ['fuentes_abiertas', 'isfa'] },
  { nombre: 'Integración de Aplicaciones en Entorno Web', targetDocs: ['entorno_web', 'iaew'] },
  { nombre: 'Sistemas de Gestión', targetDocs: ['sistema_de_gestion', 'sistemas_de_gestion', 'sg_'] }
];

const TOPICOS_INSTITUCIONALES_DISAMBIGUATION = [
  { tema: 'Boleto Educativo Gratuito (BEG)', targetDocs: ['boleto_educativo', 'beg'] },
  { tema: 'Becas Universitarias y Estratégicas', targetDocs: ['becas_universitarias', 'manuel_belgrano'] },
  { tema: 'Pasantías Laborales Educativas', targetDocs: ['pasantias_laborales', 'pasantias', 'ley_26427'] },
  { tema: 'Comedor, Deportes y Salud SAE', targetDocs: ['comedor_universitario', 'deportes_y_salud'] },
  { tema: 'Trámites de Bedelía, Certificados y Readmisión', targetDocs: ['tramites_autogestion_pases', 'bedelia'] },
  { tema: 'Cambio de Comisión y Horario por Trabajo', targetDocs: ['cambio_de_curso', 'f0035'] },
  { tema: 'Práctica Profesional Supervisada (PPS)', targetDocs: ['alu01-02', 'practica_profesional_supervisada', 'pps'] },
  { tema: 'Calendario Académico, Turnos de Exámenes y Recesos', targetDocs: ['calendario_academico', 'calendario-2026', 'feriados', 'circular-04'] },
  { tema: 'Diseño Curricular y Materias por Año (Plan 2023)', targetDocs: ['ordenanza_1877', 'diseno_curricular_plan_2023'] },
  { tema: 'Régimen de Correlatividades Plan 2023', targetDocs: ['ordenanza_1878', 'regimen_de_correlatividades'] },
  { tema: 'Analista Desarrollador Universitario (Título Intermedio)', targetDocs: ['ordenanza_1910', 'ordenanza_1911', 'analista_desarrollador'] },
  { tema: 'Laboratorios Labsis y Normas de Seguridad', targetDocs: ['labsis', 'manual_de_seguridad'] },
  { tema: 'Modelo de Poder para Retiro de Títulos', targetDocs: ['poder_para_retirar_titulos', 'modelo_de_poder'] }
];


class RagService {
  constructor() {
    this.docsDir = this.obtenerDirectorioDocumentos();
    this.chunks = [];
    this.chunkHashes = new Set(); // Deduplicación de contenido por hash MD5
    this.duplicatesRemoved = 0;
    this.idfMap = new Map(); // Mapa de IDF para vectorización TF-IDF
    this.cache = new Map(); // Caché en memoria normalizado con TTL
    this.CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas de vigencia para ahorro de tokens
    this.estaInicializado = false;
    this.extractorDenso = null;
    this.denseDims = 384;
    this.denseModelName = 'Xenova/all-MiniLM-L6-v2';
    this.denseCacheBinPath = path.join(this.docsDir, '.embeddings_cache.bin');
    this.denseCacheMetaPath = path.join(this.docsDir, '.embeddings_cache_meta.json');
    this.rejectionMessage = 'Esta consulta no se encuentra contemplada dentro de los reglamentos, normativas y planificaciones académicas oficiales de la carrera. Por favor, realizá una consulta sobre condiciones de cursado, regularidad, aprobación directa, correlatividades, fechas de examen o trámites de Ingeniería en Sistemas de Información.';
  }

  /**
   * Resuelve dinámicamente la ruta física a documentos_academicos buscando en múltiples ubicaciones candidatas.
   */
  obtenerDirectorioDocumentos() {
    const candidatos = [
      process.env.DOCS_DIR,
      path.resolve(__dirname, '..', 'documentos_academicos'),
      path.resolve(process.cwd(), 'PRODUCTO', 'codigo-fuente', 'backend', 'documentos_academicos'),
      path.resolve(process.cwd(), 'codigo-fuente', 'backend', 'documentos_academicos'),
      path.resolve(process.cwd(), 'backend', 'documentos_academicos'),
      path.resolve(process.cwd(), 'documentos_academicos'),
      path.resolve(__dirname, '..', '..', 'documentos_academicos'),
      path.resolve(process.cwd(), 'PROYECTO-FINAL-GRUPO-8', 'PRODUCTO', 'codigo-fuente', 'backend', 'documentos_academicos')
    ].filter(Boolean);

    for (const ruta of candidatos) {
      if (fs.existsSync(ruta)) {
        try {
          const archivos = fs.readdirSync(ruta);
          if (archivos.some(a => a.toLowerCase().endsWith('.pdf') || a.toLowerCase().endsWith('.md'))) {
            return ruta;
          }
        } catch (_) {}
      }
    }

    return path.resolve(__dirname, '..', 'documentos_academicos');
  }

  /**
   * Obtiene la ruta física absoluta de un archivo del corpus, insensible a normalización Unicode (NFC/NFD) y URL encoding.
   */
  obtenerRutaDocumento(nombre) {
    if (!nombre) return null;
    const dir = this.obtenerDirectorioDocumentos();
    const nombreLimpio = path.basename(nombre);
    const rutaDirecta = path.join(dir, nombreLimpio);
    if (fs.existsSync(rutaDirecta)) {
      return rutaDirecta;
    }

    // Búsqueda flexible insensible a diferencias de encoding UTF-8 (NFC vs NFD)
    try {
      const archivos = fs.readdirSync(dir);
      const normalizar = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const buscadoNorm = normalizar(decodeURIComponent(nombreLimpio));

      const encontrado = archivos.find(archivo => {
        const archNorm = normalizar(archivo);
        return archNorm === buscadoNorm || archNorm.includes(buscadoNorm) || buscadoNorm.includes(archNorm);
      });

      if (encontrado) {
        return path.join(dir, encontrado);
      }
    } catch (_) {}

    return null;
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
      this.docsDir = this.obtenerDirectorioDocumentos();

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
            // Suprimir advertencias internas de fuentes TrueType en pdf.js para mantener la consola limpia
            const originalLog = console.log;
            const originalWarn = console.warn;
            const filterWarning = (...args) => {
              if (args[0] && typeof args[0] === 'string' && (args[0].startsWith('Warning:') || args[0].startsWith('Warning: TT:'))) return true;
              return false;
            };
            console.log = (...args) => {
              if (filterWarning(...args)) return;
              originalLog.apply(console, args);
            };
            console.warn = (...args) => {
              if (filterWarning(...args)) return;
              originalWarn.apply(console, args);
            };
            try {
              const pdfData = (await pdfParse(buffer)) || {};
              if (pdfData.text && pdfData.text.trim().length > 0) {
                this.procesarTextoEnChunks(archivo, pdfData.text, pdfData.numpages || 1);
              } else {
                // PDF escaneado o sin texto directo: agregar bloque semántico descriptivo con el nombre del documento
                const nombreLimpio = archivo.replace(/_/g, ' ').replace(/\.pdf$/i, '');
                const metaTexto = `DOCUMENTO OFICIAL: ${nombreLimpio}\nEste documento institucional oficial está disponible en el campus para consulta y descarga.`;
                this.procesarTextoEnChunks(archivo, metaTexto, pdfData.numpages || 1);
              }
            } finally {
              console.log = originalLog;
              console.warn = originalWarn;
            }
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

      // Cargar o construir índice denso de embeddings neuronales
      await this.inicializarIndiceDenso();

      this.estaInicializado = true;
      console.log(`✅ [RAG Service] Indexación completada: ${this.chunks.length} bloques semánticos vectorizados (${this.duplicatesRemoved} duplicados eliminados).`);
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
    const t = (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return (
      t.includes('cuantas modalidades') ||
      t.includes('cuantas materias') ||
      t.includes('que materias tenes') ||
      t.includes('que modalidades tenes') ||
      t.includes('modalidades tenes') ||
      t.includes('modalidades hay') ||
      t.includes('modalidades tiene') ||
      t.includes('todas las modalidades') ||
      t.includes('lista de modalidades') ||
      t.includes('cuantas planificaciones') ||
      t.includes('que planificaciones') ||
      t.includes('que documentos tenes') ||
      t.includes('cuantos documentos') ||
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
   * Obtiene o carga de forma perezosa el extractor de embeddings densos (ONNX Transformers)
   */
  async obtenerExtractorDenso() {
    if (this.extractorDenso) return this.extractorDenso;
    try {
      const { pipeline } = await import('@xenova/transformers');
      this.extractorDenso = await pipeline('feature-extraction', this.denseModelName);
      return this.extractorDenso;
    } catch (_) {
      return null;
    }
  }

  /**
   * Genera el embedding denso (Float32Array de 384 dimensiones) para un texto
   */
  async obtenerEmbeddingConsulta(texto) {
    if (!texto) return null;
    try {
      const extractor = await this.obtenerExtractorDenso();
      if (!extractor) return null;
      const res = await extractor(texto, { pooling: 'mean', normalize: true });
      return res.data;
    } catch (_) {
      return null;
    }
  }

  /**
   * Carga desde caché persistida o genera en lote los embeddings neuronales densos de todos los chunks
   */
  async inicializarIndiceDenso() {
    if (this.chunks.length === 0) return;
    try {
      const extractor = await this.obtenerExtractorDenso();
      if (!extractor) return;

      // 1. Intentar cargar desde caché binaria local
      if (fs.existsSync(this.denseCacheBinPath) && fs.existsSync(this.denseCacheMetaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(this.denseCacheMetaPath, 'utf8'));
          if (meta.model === this.denseModelName && meta.chunks && meta.chunks.length === this.chunks.length) {
            if (meta.chunks[0]?.id === this.chunks[0]?.id && meta.chunks[meta.chunks.length - 1]?.id === this.chunks[this.chunks.length - 1]?.id) {
              const buffer = fs.readFileSync(this.denseCacheBinPath);
              const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
              if (floatArray.length === this.chunks.length * this.denseDims) {
                for (let i = 0; i < this.chunks.length; i++) {
                  this.chunks[i].denseVector = floatArray.subarray(i * this.denseDims, (i + 1) * this.denseDims);
                }
                console.log(`⚡ [RAG Service] ${this.chunks.length} embeddings neuronales densos cargados desde caché binaria.`);
                return;
              }
            }
          }
        } catch (readErr) {
          console.warn('⚠️ [RAG Service] Error al leer caché binaria de embeddings:', readErr.message);
        }
      }

      // 2. Si no hay caché o los chunks cambiaron, calcular embeddings en lotes
      console.log(`🧠 [RAG Service] Generando embeddings neuronales densos (384-d) para ${this.chunks.length} fragmentos...`);
      const totalFloats = this.chunks.length * this.denseDims;
      const masterBuffer = new Float32Array(totalFloats);
      const BATCH_SIZE = 64;

      for (let i = 0; i < this.chunks.length; i += BATCH_SIZE) {
        const batch = this.chunks.slice(i, Math.min(i + BATCH_SIZE, this.chunks.length));
        const texts = batch.map(c => (c.texto || '').substring(0, 350));
        const output = await extractor(texts, { pooling: 'mean', normalize: true });

        for (let b = 0; b < batch.length; b++) {
          const chunkIdx = i + b;
          const slice = output.data.subarray(b * this.denseDims, (b + 1) * this.denseDims);
          masterBuffer.set(slice, chunkIdx * this.denseDims);
          this.chunks[chunkIdx].denseVector = masterBuffer.subarray(chunkIdx * this.denseDims, (chunkIdx + 1) * this.denseDims);
        }
      }

      // 3. Persistir en caché binaria en disco para inicios instantáneos
      try {
        fs.writeFileSync(this.denseCacheBinPath, Buffer.from(masterBuffer.buffer));
        const meta = {
          version: 1,
          model: this.denseModelName,
          dims: this.denseDims,
          chunks: this.chunks.map(c => ({ id: c.id }))
        };
        fs.writeFileSync(this.denseCacheMetaPath, JSON.stringify(meta), 'utf8');
        console.log(`💾 [RAG Service] Embeddings neuronales densos persistidos exitosamente.`);
      } catch (saveErr) {
        console.warn('⚠️ [RAG Service] No se pudo guardar caché binaria de embeddings:', saveErr.message);
      }
    } catch (err) {
      console.warn('⚠️ [RAG Service] No se pudieron inicializar embeddings densos (usando TF-IDF):', err.message);
    }
  }

  /**
   * Enrutador inteligente con IA (Agentic Semantic Router):
   * Analiza la pregunta del estudiante y extrae la materia oficial, el tema académico y la categoría
   * sin depender de coincidencia exacta por expresiones regulares.
   */
  async enrutarConsultaConIA(prompt) {
    const apiKey = this._getApiKey();
    if (!apiKey) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Sos el clasificador semántico para el campus de Ingeniería en Sistemas de Información (UTN FRC). Analizá la consulta del estudiante y respondé ÚNICAMENTE un JSON con formato: {"materia": string|null, "tema": string, "categoria": "catedra"|"tramite"|"calendario"|"general"|"fuera_de_ambito"}. Normalizá cualquier apodo, sigla o variación (ej: "f1", "ami", "zafo en fisica 1", "ppr", "aga") a su nombre oficial exacto ("Física I", "Análisis Matemático I", "Paradigmas de Programación"). Si no se refiere a una materia, materia es null.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        return parsed;
      }
    } catch (_) {
      // Si falla o excede el timeout, continúa fluidamente con el fallback local
    }
    return null;
  }

  /**
   * Búsqueda semántica vectorial híbrida (Embeddings neuronales densos + TF-IDF y boosting)
   */
  recuperarContexto(query, topK = 6, enrutamiento = null, queryEmbedding = null) {
    if (this.chunks.length === 0) return [];

    const queryTokens = this.extraerTokens(query);
    if (queryTokens.length === 0) return [];

    // Si el índice no fue vectorizado aún, inicializarlo
    if (!this.idfMap || this.idfMap.size === 0) {
      this.construirIndiceVectorial();
    }

    // 1. Detectar si la consulta apunta a un tema institucional o a una materia
    let temaInstitucional = null;
    if (enrutamiento?.categoria === 'tramite' || enrutamiento?.categoria === 'calendario') {
      const temaNorm = this.extraerTokens(enrutamiento.tema || '').join(' ');
      temaInstitucional = TOPICOS_INSTITUCIONALES_DISAMBIGUATION.find(t => {
        const tTokens = this.extraerTokens(t.tema).join(' ');
        return tTokens.includes(temaNorm) || temaNorm.includes(tTokens);
      });
    }

    // Priorizar materia clasificada semánticamente por la IA
    let materiaDetectada = null;
    if (enrutamiento?.materia) {
      const nombreNorm = this.extraerTokens(enrutamiento.materia).join(' ');
      materiaDetectada = MATERIAS_DISAMBIGUATION.find(m => {
        const mTokens = this.extraerTokens(m.nombre).join(' ');
        return mTokens.includes(nombreNorm) || nombreNorm.includes(mTokens);
      });
      if (!materiaDetectada) {
        materiaDetectada = {
          nombre: enrutamiento.materia,
          targetDocs: [],
          sinDocumento: true
        };
      }
    }

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

    // 3. Extraer tokens de intención pura
    let intentTokens = queryTokens;
    if (materiaDetectada) {
      const subjectTokens = new Set(this.extraerTokens(materiaDetectada.nombre));
      intentTokens = queryTokens.filter(t => !subjectTokens.has(t));
    }

    const esConsultaEvaluacion = !temaInstitucional && /aprob|promoc|regular|nota|parcial|recuperator|evalua|calificac|tpi|libre|condici/i.test(query);
    const esConsultaCorrelativas = /correlat|cursar|rendir|requisito|plan/i.test(query);
    const esConsultaDocentes = /docente|profesor|c[aá]tedra|jtp|titular|adjunto/i.test(query);

    // 4. Calcular similitud coseno entre vector de consulta y cada chunk
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

      // Integración Vectorial Densa: Similitud Coseno por Embeddings Neuronales (MiniLM 384-d)
      if (queryEmbedding && chunk.denseVector) {
        let dotDense = 0;
        const dVec = chunk.denseVector;
        for (let d = 0; d < 384; d++) {
          dotDense += queryEmbedding[d] * dVec[d];
        }
        const similitudDensa = Math.max(0, dotDense);
        // Fusión semántica híbrida: 70% significado profundo denso + 30% coincidencia léxica
        similitudCoseno = (0.70 * similitudDensa) + (0.30 * Math.max(0, similitudCoseno));
      }

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

      // Boosting por cabeceras solo si es consulta sobre evaluación de materia
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

      // A. Disambiguación Institucional (Becas, BEG, Pasantías, Calendario, Bedelía, Plan 1877, etc.)
      if (temaInstitucional) {
        const esDelDocObjetivo = temaInstitucional.targetDocs.some(td => docLower.includes(td.toLowerCase()));
        if (esDelDocObjetivo) {
          similitudCoseno = (similitudCoseno * 5.0) + 3.5;

          // Si pregunta por un año específico del Plan 2023 en Ordenanza 1877:
          if (temaInstitucional.tema.includes('Diseño Curricular') || docLower.includes('1877')) {
            if (/1[oº°]|primer/i.test(query) && /primer\s+nivel/i.test(chunkTextLower)) similitudCoseno += 35.0;
            if (/2[oº°]|segundo/i.test(query) && /segundo\s+nivel/i.test(chunkTextLower)) similitudCoseno += 35.0;
            if (/3[oº°]|tercer/i.test(query) && /tercer\s+nivel/i.test(chunkTextLower)) similitudCoseno += 35.0;
            if (/4[oº°]|cuarto/i.test(query) && /cuarto\s+nivel/i.test(chunkTextLower)) similitudCoseno += 35.0;
            if (/5[oº°]|quinto/i.test(query) && /quinto\s+nivel/i.test(chunkTextLower)) similitudCoseno += 35.0;
            if (/electiv/i.test(query) && /electiv/i.test(chunkTextLower)) similitudCoseno += 25.0;
          }
        } else {
          // Penalizar fuertemente las 45 planificaciones de materias para que no contaminen la consulta institucional
          const esPlanificacionMateria = docLower.startsWith('[1') || docLower.startsWith('[2') || docLower.startsWith('[3') || docLower.startsWith('[4') || docLower.startsWith('[5');
          if (esPlanificacionMateria) {
            similitudCoseno = similitudCoseno * 0.01;
          }
        }
      }
      // B. Disambiguación por Cátedra / Materia Específica
      else if (materiaDetectada) {
        const esDelDocObjetivo = materiaDetectada.targetDocs && materiaDetectada.targetDocs.length > 0 &&
          materiaDetectada.targetDocs.some(td => docLower.includes(td.toLowerCase()));
        if (esDelDocObjetivo) {
          similitudCoseno = (similitudCoseno * 5.0) + 2.5;
        } else {
          const esOrdenanza = docLower.includes('1878') || docLower.includes('1877');
          // Solo vincular con Ordenanzas institucionales si la consulta trata sobre correlatividades, diseño curricular, carga horaria o año de cursado
          const esConsultaPertinenteAOrdenanza = esConsultaCorrelativas || /a[nñ]o|nivel|dise[nñ]o|plan|carga\s*horaria|horas/i.test(query) || (enrutamiento?.categoria === 'correlatividades');
          if (esOrdenanza && esConsultaPertinenteAOrdenanza) {
            const mencionaMateria = chunkTextLower.includes(materiaDetectada.nombre.toLowerCase());
            if (mencionaMateria) {
              similitudCoseno = (similitudCoseno * 2.5) + 1.5;
            } else {
              similitudCoseno = 0;
            }
          } else {
            // Cero absoluto: NUNCA permitir que planificaciones de otras materias contaminen los resultados
            similitudCoseno = 0;
          }
        }
      }
      // C. Búsqueda libre estándar con matching de metadata en el nombre de archivo
      else {
        const docTokens = this.extraerTokens(chunk.documento);
        let docMatches = 0;
        docTokens.forEach(dt => {
          if (querySet.has(dt)) docMatches++;
        });

        if (docMatches >= 2) {
          similitudCoseno = (similitudCoseno * 2.5) + (docMatches * 0.2);
        } else if (docMatches === 1) {
          similitudCoseno = (similitudCoseno * 1.5) + 0.1;
        }
      }

      return {
        ...chunk,
        score: similitudCoseno
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    // Si se detectó tema institucional, devolver los mejores del tema objetivo
    if (temaInstitucional) {
      const delTema = scoredChunks.filter(c => 
        temaInstitucional.targetDocs.some(td => (c.documento || '').toLowerCase().includes(td.toLowerCase()))
      );
      if (delTema.length > 0) {
        return delTema.slice(0, Math.min(topK, 5));
      }
    }

    // Si se detectó materia específica, filtrar exclusivamente fragmentos de la materia o de ordenanzas que la mencionen
    if (materiaDetectada) {
      const deLaMateria = scoredChunks.filter(c => c.score > 0.1 && (
        (materiaDetectada.targetDocs && materiaDetectada.targetDocs.length > 0 &&
          materiaDetectada.targetDocs.some(td => (c.documento || '').toLowerCase().includes(td.toLowerCase()))) ||
        (((c.documento || '').toLowerCase().includes('1878') || (c.documento || '').toLowerCase().includes('1877')) &&
          (c.texto || '').toLowerCase().includes(materiaDetectada.nombre.toLowerCase()))
      ));
      if (deLaMateria.length > 0) {
        return deLaMateria.slice(0, Math.min(topK, 4));
      }
      // Si la materia no tiene documento en el corpus (por ejemplo Física 1 o materias sin PDF cargado),
      // NO devolver jamás materias de otros temas. Devolver array vacío.
      return [];
    }

    // Filtro dinámico de calidad general
    const filtrados = scoredChunks.filter(c => c.score > 0.05);
    if (filtrados.length > 0 && filtrados[0].score >= 0.35) {
      return filtrados.slice(0, Math.min(topK, 5));
    }
    return filtrados.slice(0, Math.min(topK, 5));
  }

  _getApiKey() {
    return process.env.GROQ_API_KEY || null;
  }

  /**
   * Normalización inteligente de siglas y jerga estudiantil (sin inyecciones ruidosas que desvíen el RAG)
   */
  normalizarConsultaParaBusqueda(prompt) {
    if (!prompt || prompt.trim().length < 3) return prompt || '';

    const normalizacionesLocales = [
      { pattern: /\b(zafo|zafar|zafe|promociono|promocionar)\b/gi, terms: 'aprobación directa promoción' },
      { pattern: /\b(recu|recus)\b/gi, terms: 'evaluaciones recuperatorias recuperatorio' },
      { pattern: /\b(profe|profes|profesor|profesora)\b/gi, terms: 'cuerpo docente profesor titular adjunto' },
      { pattern: /\b(cambio\s+de\s+(curso|turno|comision))\b/gi, terms: 'formulario F0035-P cambio de curso comision motivos laborales' },
      { pattern: /\b(pps)\b/gi, terms: 'practica profesional supervisada ALU01-02' },
      { pattern: /\b(beg)\b/gi, terms: 'boleto educativo gratuito cidi transporte' },
      { pattern: /\b(am1|ami)\b/gi, terms: 'Análisis Matemático I' },
      { pattern: /\b(am2|amii)\b/gi, terms: 'Análisis Matemático II' },
      { pattern: /\b(f1|fi)\b/gi, terms: 'Física I' },
      { pattern: /\b(f2|fii)\b/gi, terms: 'Física II' },
      { pattern: /\b(aga|algebra)\b/gi, terms: 'Álgebra y Geometría Analítica' },
      { pattern: /\b(sop)\b/gi, terms: 'Sistemas Operativos' },
      { pattern: /\b(ssl)\b/gi, terms: 'Sintaxis y Semántica de los Lenguajes' },
      { pattern: /\b(asi)\b/gi, terms: 'Análisis de Sistemas de Información' },
      { pattern: /\b(ppr|pdp)\b/gi, terms: 'Paradigmas de Programación' },
      { pattern: /\b(pye)\b/gi, terms: 'Probabilidad y Estadística' },
      { pattern: /\b(bda)\b/gi, terms: 'Bases de Datos' },
      { pattern: /\b(sds)\b/gi, terms: 'Seguridad en el Desarrollo de Software' },
      { pattern: /\b(dsi)\b/gi, terms: 'Diseño de Sistemas de Información' },
      { pattern: /\b(dds)\b/gi, terms: 'Desarrollo de Software' }
    ];

    let queryNormalizada = prompt;
    normalizacionesLocales.forEach(({ pattern, terms }) => {
      if (pattern.test(queryNormalizada)) {
        queryNormalizada += ` ${terms}`;
      }
    });

    return queryNormalizada;
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
    const apiKey = this._getApiKey();

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

    // Normalización inteligente de la consulta para el motor RAG
    if (!esMeta) {
      queryParaBusqueda = this.normalizarConsultaParaBusqueda(queryParaBusqueda);
    }

    // 1. Enrutamiento semántico inteligente con IA (extrae materia, tema y categoría sin depender de regex)
    const enrutamiento = await this.enrutarConsultaConIA(prompt);

    let materiaDetectada = null;
    if (enrutamiento?.materia) {
      const nombreNorm = this.extraerTokens(enrutamiento.materia).join(' ');
      materiaDetectada = MATERIAS_DISAMBIGUATION.find(m => {
        const mTokens = this.extraerTokens(m.nombre).join(' ');
        return mTokens.includes(nombreNorm) || nombreNorm.includes(mTokens);
      }) || { nombre: enrutamiento.materia, targetDocs: [], sinDocumento: true };
    }

    // 2. Extraer embedding denso neuronal de la consulta
    const queryEmbedding = await this.obtenerEmbeddingConsulta(queryParaBusqueda);

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 6, enrutamiento, queryEmbedding);

    // Si no hay API key o la IA no pudo enrutar la consulta, retornar mensaje de error explícito (sin intentar adivinar por regex ni respuestas locales)
    if (!apiKey || (!enrutamiento && !esMeta)) {
      const errorMsg = 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.';
      if (typeof onContext === 'function') onContext({ fuentes: [] });
      if (typeof onChunk === 'function') onChunk(errorMsg);
      return { respuesta: errorMsg, fuentes: [], error: true };
    }

    if (!esMeta && fragmentosRelevantes.length === 0) {
      if (materiaDetectada) {
        return {
          respuesta: `Actualmente no se encuentra disponible el documento oficial de planificación de cátedra para **${materiaDetectada.nombre}** en el repositorio del campus.\n\nPara consultar las condiciones específicas de cursado, regularidad, fechas de parciales y criterios de evaluación de esta materia, por favor consultá directamente al equipo docente de la cátedra o a través de Autogestión 4 de la facultad.`,
          fuentes: []
        };
      }
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

    const directivaPrincipal = esMeta
      ? `1. CONSULTA DE CATÁLOGO / MODALIDADES GLOBALES DEL CAMPUS:
   - El usuario está preguntando por la cantidad total de modalidades, materias o documentos disponibles en el campus.
   - INFORMACIÓN OFICIAL OBLIGATORIA: El campus cuenta con 45 modalidades académicas y planificaciones oficiales de cátedra (las 45 asignaturas de 1° a 5° año de Ingeniería en Sistemas de Información Plan 2023) más ordenanzas curriculares (1877, 1878, 1910), reglamentos de alumnos (PPS ALU01-02, cambio de turno F0035-P) y calendarios académicos, totalizando más de 80 documentos oficiales indexados.
   - Respondé detallando con claridad:
     a) Que tenés cargadas las 45 modalidades académicas oficiales del Plan 2023.
     b) Un resumen claro por año académico:
        * 1° Año: 8 materias (Algoritmos, Arquitectura, Lógica/Discreta, Sistemas y Procesos, Análisis I, Álgebra, Física I, Inglés I).
        * 2° Año: 8 materias (Análisis de Sistemas, Paradigmas, Probabilidad y Estadística, Sintaxis, Sistemas Operativos, Análisis II, Física II, Ing. y Sociedad).
        * 3° Año: 8 materias (Bases de Datos, Redes de Datos, Comunicación de Datos, Diseño de Sistemas, Desarrollo de Software, Análisis Numérico, Seminario Integrador, Inglés II).
        * 4° Año: 13 materias (Administración de SI, Calidad de Software, Green Software, UX/UI, DevOps, etc.).
        * 5° Año: 16 materias y electivas (Inteligencia Artificial, Ciencia de Datos, Proyecto Final, Blockchain, etc.).
     c) Que además contás con las normativas oficiales completas (Ordenanzas 1877, 1878, 1910) y reglamentos de bedelía.
   - NUNCA digas que solo tenés 3 modalidades o 3 materias.`
      : `1. CONSULTAS ACADÉMICAS Y NORMATIVAS (GROUNDING RAG ESTRICTO):
   - Respondé basándote fielmente y con total detalle en los fragmentos del CONTEXTO RECUPERADO.
   - Brindá información concreta y estructurada (fechas exactas, notas mínimas, requisitos específicos, plazos de horas hábiles, porcentajes de asistencia, asignaturas correlativas o normativas aplicables).
   - Citá siempre la fuente oficial consultada (ejemplo: *Fuente: [Guia_Oficial_Calendario]_Calendario_Academico_2026_Turnos_Examenes_y_Recesos.md* o *Fuente: Modalidad Académica - Paradigmas de Programación*).
   - NUNCA respondas que la consulta no se encuentra contemplada si el contexto recuperado contiene información relevante sobre el tema consultado.`;

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (títulos claros, negritas en notas y requisitos clave, viñetas y tablas Markdown estándar).

DIRECTIVAS Y REGLAS DE RESPUESTA:
${directivaPrincipal}
2. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

${seccionCatalogo}

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${esMeta ? 'Consulta global de catálogo: responder obligatoriamente según el CATÁLOGO OFICIAL de 45 modalidades académicas de 1° a 5° año.' : (contextoStr || 'No se requirió fragmento específico.')}
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

    const fuentesMeta = [
      { documento: '[Ordenanza_1877]_Diseno_Curricular_Plan_2023_ISI.pdf', pagina: 1, fragmento: 'Plan 2023 ISI: 45 asignaturas y modalidades académicas oficiales (1° a 5° año).' },
      { documento: '[Ordenanza_1878]_Regimen_de_Correlatividades_y_Equivalencias_Plan_2023.pdf', pagina: 1, fragmento: 'Régimen oficial de correlatividades y equivalencias para las 45 asignaturas.' },
      { documento: '[Ordenanza_1910]_Diseno_Curricular_Analista_Desarrollador_Universitario.pdf', pagina: 1, fragmento: 'Diseño curricular del título intermedio de Analista Desarrollador Universitario.' },
      { documento: '[Guia_Oficial_Calendario]_Calendario_Academico_2026_Turnos_Examenes_y_Recesos.md', pagina: 1, fragmento: 'Resolución N° 2126/25: Turnos de examen 2026, receso de invierno y fechas de cursado.' },
      { documento: 'Modalidades de Cátedra de 1° a 5° Año (45 materias)', pagina: 1, fragmento: 'Planificaciones oficiales de cátedra de todas las materias de 1°, 2°, 3°, 4° y 5° año.' },
      { documento: '[Guia_Oficial_Bedelia]_Tramites_Autogestion_Pases_Equivalencias_Certificados.md', pagina: 1, fragmento: 'Procedimientos de alumnos, cambios de curso y reglamentaciones institucionales.' }
    ];

    const fuentesFinales = esMeta
      ? fuentesMeta
      : fragmentosRelevantes.map(f => ({
          documento: f.documento,
          pagina: f.pagina,
          fragmento: f.texto.substring(0, 180) + '...'
        }));

    if (!apiKey) {
      return {
        respuesta: 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.',
        fuentes: [],
        error: true
      };
    }

    const modelosDisponibles = [
      process.env.GROQ_MODEL,
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b'
    ].filter(Boolean);

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
            fuentes: fuentesFinales
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
      respuesta: 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.',
      fuentes: [],
      error: true
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
    const apiKey = this._getApiKey();

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

    // Normalización inteligente de la consulta para el motor RAG
    if (!esMeta) {
      queryParaBusqueda = this.normalizarConsultaParaBusqueda(queryParaBusqueda);
    }

    // 1. Enrutamiento semántico inteligente con IA (extrae materia, tema y categoría sin depender de regex)
    const enrutamiento = await this.enrutarConsultaConIA(prompt);

    let materiaDetectada = null;
    if (enrutamiento?.materia) {
      const nombreNorm = this.extraerTokens(enrutamiento.materia).join(' ');
      materiaDetectada = MATERIAS_DISAMBIGUATION.find(m => {
        const mTokens = this.extraerTokens(m.nombre).join(' ');
        return mTokens.includes(nombreNorm) || nombreNorm.includes(mTokens);
      }) || { nombre: enrutamiento.materia, targetDocs: [], sinDocumento: true };
    }

    // 2. Extraer embedding denso neuronal de la consulta
    const queryEmbedding = await this.obtenerEmbeddingConsulta(queryParaBusqueda);

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 6, enrutamiento, queryEmbedding);

    // Si no hay API key o la IA no pudo enrutar la consulta, retornar mensaje de error explícito (sin intentar adivinar por regex ni respuestas locales)
    if (!apiKey || (!enrutamiento && !esMeta)) {
      const errorMsg = 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.';
      if (typeof onContext === 'function') onContext({ fuentes: [] });
      if (typeof onChunk === 'function') onChunk(errorMsg);
      return { respuesta: errorMsg, fuentes: [], error: true };
    }

    if (!esMeta && fragmentosRelevantes.length === 0) {
      let respRechazo = this.rejectionMessage;
      if (materiaDetectada) {
        respRechazo = `Actualmente no se encuentra disponible el documento oficial de planificación de cátedra para **${materiaDetectada.nombre}** en el repositorio del campus.\n\nPara consultar las condiciones específicas de cursado, regularidad, fechas de parciales y criterios de evaluación de esta materia, por favor consultá directamente al equipo docente de la cátedra o a través de Autogestión 4 de la facultad.`;
      }
      if (onContext) onContext({ fuentes: [] });
      if (onChunk) onChunk(respRechazo);
      return { respuesta: respRechazo, fuentes: [] };
    }

    const fuentesMeta = [
      { documento: '[Ordenanza_1877]_Diseno_Curricular_Plan_2023_ISI.pdf', pagina: 1, fragmento: 'Plan 2023 ISI: 45 asignaturas y modalidades académicas oficiales (1° a 5° año).' },
      { documento: '[Ordenanza_1878]_Regimen_de_Correlatividades_y_Equivalencias_Plan_2023.pdf', pagina: 1, fragmento: 'Régimen oficial de correlatividades y equivalencias para las 45 asignaturas.' },
      { documento: '[Ordenanza_1910]_Diseno_Curricular_Analista_Desarrollador_Universitario.pdf', pagina: 1, fragmento: 'Diseño curricular del título intermedio de Analista Desarrollador Universitario.' },
      { documento: '[Guia_Oficial_Calendario]_Calendario_Academico_2026_Turnos_Examenes_y_Recesos.md', pagina: 1, fragmento: 'Resolución N° 2126/25: Turnos de examen 2026, receso de invierno y fechas de cursado.' },
      { documento: 'Modalidades de Cátedra de 1° a 5° Año (45 materias)', pagina: 1, fragmento: 'Planificaciones oficiales de cátedra de todas las materias de 1°, 2°, 3°, 4° y 5° año.' },
      { documento: '[Guia_Oficial_Bedelia]_Tramites_Autogestion_Pases_Equivalencias_Certificados.md', pagina: 1, fragmento: 'Procedimientos de alumnos, cambios de curso y reglamentaciones institucionales.' }
    ];

    const fuentesFormateadas = esMeta
      ? fuentesMeta
      : fragmentosRelevantes.map(f => ({
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

    const directivaPrincipal = esMeta
      ? `1. CONSULTA DE CATÁLOGO / MODALIDADES GLOBALES DEL CAMPUS:
   - El usuario está preguntando por la cantidad total de modalidades, materias o documentos disponibles en el campus.
   - INFORMACIÓN OFICIAL OBLIGATORIA: El campus cuenta con 45 modalidades académicas y planificaciones oficiales de cátedra (las 45 asignaturas de 1° a 5° año de Ingeniería en Sistemas de Información Plan 2023) más ordenanzas curriculares (1877, 1878, 1910), reglamentos de alumnos (PPS ALU01-02, cambio de turno F0035-P) y calendarios académicos, totalizando más de 80 documentos oficiales indexados.
   - Respondé detallando con claridad:
     a) Que tenés cargadas las 45 modalidades académicas oficiales del Plan 2023.
     b) Un resumen claro por año académico:
        * 1° Año: 8 materias (Algoritmos, Arquitectura, Lógica/Discreta, Sistemas y Procesos, Análisis I, Álgebra, Física I, Inglés I).
        * 2° Año: 8 materias (Análisis de Sistemas, Paradigmas, Probabilidad y Estadística, Sintaxis, Sistemas Operativos, Análisis II, Física II, Ing. y Sociedad).
        * 3° Año: 8 materias (Bases de Datos, Redes de Datos, Comunicación de Datos, Diseño de Sistemas, Desarrollo de Software, Análisis Numérico, Seminario Integrador, Inglés II).
        * 4° Año: 13 materias (Administración de SI, Calidad de Software, Green Software, UX/UI, DevOps, etc.).
        * 5° Año: 16 materias y electivas (Inteligencia Artificial, Ciencia de Datos, Proyecto Final, Blockchain, etc.).
     c) Que además contás con las normativas oficiales completas (Ordenanzas 1877, 1878, 1910) y reglamentos de bedelía.
   - NUNCA digas que solo tenés 3 modalidades o 3 materias.`
      : `1. CONSULTAS ACADÉMICAS Y NORMATIVAS (GROUNDING RAG ESTRICTO):
   - Respondé basándote fielmente y con total detalle en los fragmentos del CONTEXTO RECUPERADO.
   - Brindá información concreta y estructurada (fechas exactas, notas mínimas, requisitos específicos, plazos de horas hábiles, porcentajes de asistencia, asignaturas correlativas o normativas aplicables).
   - Citá siempre la fuente oficial consultada (ejemplo: *Fuente: [Guia_Oficial_Calendario]_Calendario_Academico_2026_Turnos_Examenes_y_Recesos.md* o *Fuente: Modalidad Académica - Paradigmas de Programación*).
   - NUNCA respondas que la consulta no se encuentra contemplada si el contexto recuperado contiene información relevante sobre el tema consultado.`;

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (títulos claros, negritas en notas y requisitos clave, viñetas y tablas Markdown estándar).

DIRECTIVAS Y REGLAS DE RESPUESTA:
${directivaPrincipal}
2. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

${seccionCatalogo}

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${esMeta ? 'Consulta global de catálogo: responder obligatoriamente según el CATÁLOGO OFICIAL de 45 modalidades académicas de 1° a 5° año.' : (contextoStr || 'No se requirió fragmento específico.')}
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

    if (!apiKey) {
      const errorMsg = 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.';
      if (onContext) onContext({ fuentes: [] });
      if (onChunk) onChunk(errorMsg);
      return { respuesta: errorMsg, fuentes: [], error: true };
    }

    const modelosDisponibles = [
      process.env.GROQ_MODEL,
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b'
    ].filter(Boolean);

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

    const errorFallback = 'El servicio de asistencia académica con IA no se encuentra disponible momentáneamente. Por favor, intentá nuevamente en unos instantes.';
    if (onChunk) onChunk(errorFallback);
    return { respuesta: errorFallback, fuentes: [], error: true };
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
