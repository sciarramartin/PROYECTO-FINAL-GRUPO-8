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

class RagService {
  constructor() {
    this.docsDir = path.join(__dirname, '..', 'documentos_academicos');
    this.chunks = [];
    this.chunkHashes = new Set(); // Deduplicación de contenido por hash MD5
    this.duplicatesRemoved = 0;
    this.idfMap = new Map(); // Mapa de IDF para vectorización TF-IDF
    this.cache = new Map(); // Caché en memoria para respuestas frecuentes (LRU con TTL)
    this.CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos de vigencia
    this.estaInicializado = false;
    this.rejectionMessage = 'Esta consulta no se encuentra contemplada dentro de los reglamentos, normativas y planificaciones académicas oficiales de la carrera. Por favor, realizá una consulta sobre condiciones de cursado, regularidad, aprobación directa, correlatividades, fechas de examen o trámites de Ingeniería en Sistemas de Información.';
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

    // 1. Vectorizar la consulta
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

    // 2. Calcular similitud coseno entre vector de consulta y cada chunk
    const scoredChunks = this.chunks.map(chunk => {
      let chunkVector = chunk.vector;
      let chunkNorm = chunk.norm;

      if (!chunkVector) {
        // Fallback dinámico si se agregó un chunk individualmente sin reconstruir índice
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

      // Similitud Coseno: cos(q, d) = (q · d) / (|q| * |d|)
      let similitudCoseno = productoPunto / (queryNorm * chunkNorm);

      // Metadata boosting: coincidencia con el nombre del documento oficial
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

      return {
        ...chunk,
        score: similitudCoseno
      };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK).filter(c => c.score > 0.03);
  }

  /**
   * Consulta al LLM enriquecida con RAG, lenguaje natural y Grounding inteligente.
   * Incluye query expansion para preguntas de seguimiento.
   */
  async consultarChatbot({ prompt, historial = [] }) {
    const cacheKey = prompt.toLowerCase().trim();
    if ((!historial || historial.length === 0) && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
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

    const esSaludo = this.esSaludoOCharlaInicial(prompt);
    const esMeta = this.esMetaConsultaCorpus(prompt);

    // Query expansion: enriquecer la búsqueda con contexto del historial
    // para preguntas de seguimiento como "¿Y la regularidad?" o "¿Y cómo es?"
    let queryParaBusqueda = prompt;
    if (!esSaludo && !esMeta && Array.isArray(historial) && historial.length > 0) {
      const tokensPrompt = this.extraerTokens(prompt);
      // Si la pregunta actual es corta (< 6 tokens), es probablemente un follow-up
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

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 6);

    // Si no es saludo, ni meta-consulta, y no hay fragmentos relevantes en el corpus: fuera de ámbito
    if (!esSaludo && !esMeta && fragmentosRelevantes.length === 0) {
      return {
        respuesta: this.rejectionMessage,
        fuentes: []
      };
    }

    const contextoStr = fragmentosRelevantes
      .map((f) => `[DOCUMENTO OFICIAL: ${f.documento} (Pág. ~${f.pagina})]\n${f.texto}`)
      .join('\n\n---\n\n');

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (usá títulos limpios, negritas en nombres y notas clave, viñetas y tablas Markdown estándar bien estructuradas).

DIRECTIVAS Y REGLAS DE RESPUESTA:
1. SALUDOS Y CHARLA INICIAL:
   - Si el estudiante saluda o pregunta cómo estás, respondé con calidez y naturalidad presentándote y contándole amablemente en qué podés orientarlo.
2. CONSULTAS POR AÑO O CATÁLOGO DE MATERIAS (DISTRIBUCIÓN EXACTA PLAN 2023):
   - Si el estudiante pregunta cuántas o cuáles materias/modalidades tenés de un año determinado, respondé con el número exacto y listá de forma clara y ordenada las materias oficiales:
     * 1° Año (8 materias oficiales Plan 2023): Algoritmos y Estructuras de Datos, Arquitectura de Computadoras, Lógica y Estructuras Discretas, Sistemas y Procesos de Negocios, Análisis Matemático I, Álgebra y Geometría Analítica, Física I, Inglés I. (Nota: En Plan 2008 histórico se incluían además Química General e Ingeniería y Sociedad).
     * 2° Año (8 materias oficiales Plan 2023): Análisis de Sistemas de Información, Paradigmas de Programación, Probabilidades y Estadísticas, Sintaxis y Semántica de los Lenguajes, Sistemas Operativos, Análisis Matemático II, Física II, Ingeniería y Sociedad.
     * 3° Año (8 materias oficiales Plan 2023): Análisis Numérico, Backend de Aplicaciones, Bases de Datos, Comunicación de Datos, Desarrollo de Software, Diseño de Sistemas de Información, Seminario Integrador (Analista Desarrollador), Inglés II.
     * 4° Año (14 materias oficiales Plan 2023): Administración de SI, Comunicación Multimedial, Desarrollo con Objetos, DevOps, Experiencia e Interfaces UX/UI, Gestión de Procesos de Negocio, Gestión Industrial, Green Software, Ingeniería y Calidad de Software, Investigación Operativa, Redes de Datos, Seguridad en el Desarrollo de Software, Tecnologías para la Automatización, Legislación.
     * 5° Año (13 materias oficiales Plan 2023): Ciencia de Datos, Consultoría en Negocios Digitales, Entornos Virtuales y Videojuegos, Blockchain, Emprendimientos Tecnológicos, Gerenciamiento Estratégico, Gestión Gerencial, Habilidades Blandas, Inteligencia Artificial, Proyecto Final, Seguridad en los Sistemas de Información, Testing de Software, Economía.
   - NUNCA mezcles materias de distintos años (por ejemplo, Administración de SI pertenece estrictamente a 4° año).
3. CONSULTAS ACADÉMICAS ESPECÍFICAS (GROUNDING RAG):
   - Respondé basándote fielmente en los fragmentos del CONTEXTO RECUPERADO y citá siempre la fuente oficial consultada (ejemplo: *Fuente: Modalidad Académica - Paradigmas de Programación (Plan 2023)* o *Norma ALU02-02*).
4. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

===================================================================
${CATALOGO_CORPUS}
===================================================================

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${contextoStr || 'No se requirió fragmento específico (saludo o consulta general de catálogo).'}
===================================================================`;

    const mensajes = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(historial)) {
      historial.slice(-4).forEach(h => {
        if (h.rol === 'usuario' || h.role === 'user') {
          mensajes.push({ role: 'user', content: h.contenido || h.content || '' });
        } else if (h.rol === 'asistente' || h.role === 'assistant') {
          mensajes.push({ role: 'assistant', content: h.contenido || h.content || '' });
        }
      });
    }

    mensajes.push({ role: 'user', content: prompt });

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        respuesta: fragmentosRelevantes.length > 0 
          ? `**Respuesta Asistida (Modo Local):**\n\n${fragmentosRelevantes[0].texto}\n\n*Fuente: ${fragmentosRelevantes[0].documento}*`
          : '¡Hola! Soy tu asistente de Campus UTN. Podés consultarme sobre modalidades de materias y reglamentos de la carrera.',
        fuentes: fragmentosRelevantes.map(f => ({ documento: f.documento, pagina: f.pagina, fragmento: f.texto }))
      };
    }

    // Lista de modelos con fallback automático ante picos de uso o rate limits
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
            temperature: 0.2,
            max_tokens: 1024
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
        } else {
          console.warn(`⚠️ [Groq Fallback] Modelo ${modelName} devolvió estado ${response.status}. Intentando siguiente modelo...`);
        }
      } catch (err) {
        console.warn(`⚠️ [Groq Fallback] Error con modelo ${modelName}:`, err.message);
      }
    }

    // Fallback final estructurado si todos los modelos fallaran
    return {
      respuesta: fragmentosRelevantes.length > 0 
        ? `**Respuesta Asistida:**\n\n${fragmentosRelevantes.map(f => `* ${f.texto}`).join('\n\n')}\n\n*Fuente: ${fragmentosRelevantes[0]?.documento || 'Documentación oficial'}*`
        : this.rejectionMessage,
      fuentes: fragmentosRelevantes.map(f => ({ documento: f.documento, pagina: f.pagina, fragmento: f.texto }))
    };
  }

  /**
   * Consulta al LLM con streaming en tiempo real (SSE) y RAG integrado
   */
  async consultarChatbotStream({ prompt, historial = [], onChunk, onContext }) {
    if (!this.estaInicializado || this.chunks.length === 0) {
      await this.inicializar();
    }

    const cacheKey = prompt.toLowerCase().trim();
    if ((!historial || historial.length === 0) && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
        if (onContext) onContext({ fuentes: cached.fuentes });
        if (onChunk) onChunk(cached.respuesta);
        return { respuesta: cached.respuesta, fuentes: cached.fuentes, desdeCache: true };
      }
    }

    const esSaludo = this.esSaludoOCharlaInicial(prompt);
    const esMeta = this.esMetaConsultaCorpus(prompt);

    let queryParaBusqueda = prompt;
    if (!esSaludo && !esMeta && Array.isArray(historial) && historial.length > 0) {
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

    const fragmentosRelevantes = this.recuperarContexto(queryParaBusqueda, 6);

    if (!esSaludo && !esMeta && fragmentosRelevantes.length === 0) {
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

    const systemPrompt = `Sos el Asistente Virtual Oficial de Modalidad Académica y Normativas de Campus UTN (Facultad Regional Córdoba - Ingeniería en Sistemas de Información).

TONO Y PERSONALIDAD:
- Hablá en español con tono universitario argentino, natural, cordial, empático y profesional (usá "vos", "podés", "fijate", "te cuento").
- Formateá tus respuestas con Markdown limpio (usá títulos limpios, negritas en nombres y notas clave, viñetas y tablas Markdown estándar bien estructuradas).

DIRECTIVAS Y REGLAS DE RESPUESTA:
1. SALUDOS Y CHARLA INICIAL:
   - Si el estudiante saluda o pregunta cómo estás, respondé con calidez y naturalidad presentándote y contándole amablemente en qué podés orientarlo.
2. CONSULTAS POR AÑO O CATÁLOGO DE MATERIAS (DISTRIBUCIÓN EXACTA PLAN 2023):
   - Si el estudiante pregunta cuántas o cuáles materias/modalidades tenés de un año determinado, respondé con el número exacto y listá de forma clara y ordenada las materias oficiales:
     * 1° Año (8 materias oficiales Plan 2023): Algoritmos y Estructuras de Datos, Arquitectura de Computadoras, Lógica y Estructuras Discretas, Sistemas y Procesos de Negocios, Análisis Matemático I, Álgebra y Geometría Analítica, Física I, Inglés I. (Nota: En Plan 2008 histórico se incluían además Química General e Ingeniería y Sociedad).
     * 2° Año (8 materias oficiales Plan 2023): Análisis de Sistemas de Información, Paradigmas de Programación, Probabilidades y Estadísticas, Sintaxis y Semántica de los Lenguajes, Sistemas Operativos, Análisis Matemático II, Física II, Ingeniería y Sociedad.
     * 3° Año (8 materias oficiales Plan 2023): Análisis Numérico, Backend de Aplicaciones, Bases de Datos, Comunicación de Datos, Desarrollo de Software, Diseño de Sistemas de Información, Seminario Integrador (Analista Desarrollador), Inglés II.
     * 4° Año (14 materias oficiales Plan 2023): Administración de SI, Comunicación Multimedial, Desarrollo con Objetos, DevOps, Experiencia e Interfaces UX/UI, Gestión de Procesos de Negocio, Gestión Industrial, Green Software, Ingeniería y Calidad de Software, Investigación Operativa, Redes de Datos, Seguridad en el Desarrollo de Software, Tecnologías para la Automatización, Legislación.
     * 5° Año (13 materias oficiales Plan 2023): Ciencia de Datos, Consultoría en Negocios Digitales, Entornos Virtuales y Videojuegos, Blockchain, Emprendimientos Tecnológicos, Gerenciamiento Estratégico, Gestión Gerencial, Habilidades Blandas, Inteligencia Artificial, Proyecto Final, Seguridad en los Sistemas de Información, Testing de Software, Economía.
   - NUNCA mezcles materias de distintos años.
3. CONSULTAS ACADÉMICAS ESPECÍFICAS (GROUNDING RAG):
   - Respondé basándote fielmente en los fragmentos del CONTEXTO RECUPERADO y citá siempre la fuente oficial consultada.
4. PREGUNTAS FUERA DEL ÁMBITO UNIVERSITARIO:
   - Si la consulta es sobre cocina, entretenimiento, deportes, política u ocio, debés responder:
   "${this.rejectionMessage}"

===================================================================
${CATALOGO_CORPUS}
===================================================================

CONTEXTO RECUPERADO ESPECÍFICO (RAG):
===================================================================
${contextoStr || 'No se requirió fragmento específico (saludo o consulta general de catálogo).'}
===================================================================`;

    const mensajes = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(historial)) {
      historial.slice(-4).forEach(h => {
        if (h.rol === 'usuario' || h.role === 'user') {
          mensajes.push({ role: 'user', content: h.contenido || h.content || '' });
        } else if (h.rol === 'asistente' || h.role === 'assistant') {
          mensajes.push({ role: 'assistant', content: h.contenido || h.content || '' });
        }
      });
    }
    mensajes.push({ role: 'user', content: prompt });

    const apiKey = process.env.GROQ_API_KEY;
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
            temperature: 0.2,
            max_tokens: 1024,
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
