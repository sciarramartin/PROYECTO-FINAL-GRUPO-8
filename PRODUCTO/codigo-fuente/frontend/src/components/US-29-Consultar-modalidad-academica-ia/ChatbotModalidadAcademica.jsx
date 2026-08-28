import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  FiSend,
  FiCpu,
  FiBookOpen,
  FiCheckCircle,
  FiHelpCircle,
  FiTrash2,
  FiFileText,
  FiCopy,
  FiCheck,
  FiCalendar,
  FiLayers,
  FiAward,
  FiCornerDownLeft,
  FiMessageSquare,
  FiChevronRight,
  FiSearch,
  FiUsers,
  FiHardDrive,
  FiDownload,
  FiX
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CATEGORIAS_GUIA = [
  {
    id: 'aprobacion',
    titulo: 'Aprobación Directa y Notas',
    icono: <FiAward className="text-amber-500" />,
    badge: '45 Cátedras',
    preguntas: [
      '¿Cuáles son las condiciones de aprobación directa en Paradigmas de Programación?',
      '¿Cómo es la promoción directa en Diseño de Sistemas de Información?',
      '¿Qué nota mínima en parciales y TPI pide Bases de Datos?',
      '¿Cómo se aprueba de forma directa en Sistemas Operativos?',
      '¿Cuáles son los requisitos de promoción en Redes de Datos?',
      '¿Cómo funciona la aprobación directa en Backend de Aplicaciones?',
      '¿Cuáles son las pautas de evaluación y aprobación en Proyecto Final?'
    ]
  },
  {
    id: 'correlatividades',
    titulo: 'Planes y Correlatividades',
    icono: <FiLayers className="text-indigo-500" />,
    badge: 'Ord. 1877/1878',
    preguntas: [
      '¿Cuáles son las 4 materias de 1° año del Plan 2023 (Ord. 1877)?',
      '¿Cuáles son las 5 materias de 2° año del Plan 2023?',
      '¿Qué materias componen el 3° año de Ingeniería en Sistemas?',
      '¿Qué materias electivas oficiales están disponibles en 4° y 5° año?',
      '¿Qué correlativas necesito tener aprobadas para cursar Inteligencia Artificial?',
      '¿Qué correlativas necesito para rendir el examen final de Redes de Datos?',
      '¿Qué materias y requisitos debo cumplir para el título de Analista Desarrollador (Ord. 1910)?'
    ]
  },
  {
    id: 'calendario',
    titulo: 'Calendario y Exámenes 2026',
    icono: <FiCalendar className="text-blue-500" />,
    badge: 'Res. 2126/25',
    preguntas: [
      '¿Cuáles son los 5 turnos oficiales de exámenes finales en 2026?',
      '¿Hasta cuándo puedo inscribirme para rendir un examen final en Autogestión?',
      '¿Quiénes pueden rendir en los turnos especiales de Mayo y Septiembre?',
      '¿Cuándo inician las clases del segundo cuatrimestre y el receso invernal 2026?',
      '¿Qué días son asuetos institucionales o feriados en 2026 (Circular 04/25)?'
    ]
  },
  {
    id: 'becas',
    titulo: 'Becas y Boleto (BEG)',
    icono: <FiBookOpen className="text-emerald-500" />,
    badge: 'SAE',
    preguntas: [
      '¿Cómo solicito el Boleto Educativo Gratuito (BEG) con Ciudadano Digital (CiDi)?',
      '¿Quiénes se pueden postular a las Becas Estratégicas Manuel Belgrano en Sistemas?',
      '¿Cuáles son las Becas Universitarias de Grado de la UTN (Rendimiento y Ayuda)?',
      '¿Cómo postularse a las Becas de Investigación BINID y EVC-CIN de la SECyT?',
      '¿Cuáles son los requisitos socioeconómicos y límites de ingresos para las becas?'
    ]
  },
  {
    id: 'pasantias',
    titulo: 'Pasantías y Empleo',
    icono: <FiFileText className="text-purple-500" />,
    badge: 'SEU',
    preguntas: [
      '¿Qué requisitos académicos exige la facultad para acceder a pasantías laborales (Ley 26.427)?',
      '¿Cuántas horas semanales como máximo puede durar una pasantía universitaria?',
      '¿Cuánto dura el contrato de pasantía y cómo se renueva?',
      '¿Cómo autorizo a un tercero a retirar mi título universitario en colación (modelo de poder)?'
    ]
  },
  {
    id: 'tramites',
    titulo: 'Trámites, Bedelía y PPS',
    icono: <FiCheckCircle className="text-cyan-500" />,
    badge: 'Alumnos',
    preguntas: [
      '¿Cómo tramito el cambio de comisión por motivos laborales (Formulario F0035-P)?',
      '¿Cuáles son los requisitos para iniciar la Práctica Profesional Supervisada (PPS - ALU01-02)?',
      '¿Cómo funciona el trámite de Pase entre Facultades Regionales de la UTN?',
      '¿Cómo descargo mi Certificado de Alumno Regular con código QR en Autogestión 4?',
      '¿Qué ocurre si pierdo la regularidad y cómo se pide la readmisión curricular?'
    ]
  },
  {
    id: 'campus',
    titulo: 'Comedor y Campus',
    icono: <FiHardDrive className="text-rose-500" />,
    badge: 'Servicios',
    preguntas: [
      '¿En qué horario funciona el Comedor Universitario y cómo se accede al menú subsidiado?',
      '¿Qué disciplinas deportivas gratuitas ofrece la Secretaría de Asuntos Estudiantiles (SAE)?',
      '¿Cuáles son las normas de seguridad y conducta en los laboratorios de informática (LabSis)?'
    ]
  }
];

export default function ChatbotModalidadAcademica() {
  const [mensajes, setMensajes] = useState([
    {
      id: 'bienvenida',
      rol: 'asistente',
      contenido: `### ¡Hola! Te doy la bienvenida al Asistente Académico Inteligente 🎓

Estoy alimentado exclusivamente con la **documentación oficial de la UTN FRC (Ciclo 2026)**. Toda respuesta incluye la cita y enlace al documento institucional.

#### 💡 ¿En qué puedo ayudarte?
* **Aprobación directa y regularidad** de las 45 materias del Plan 2023.
* **Correlatividades y planes** (Ordenanzas 1877, 1878 y Título de Analista 1910).
* **Calendario Académico 2026** (Mesas de examen, inscripciones y feriados).
* **Boleto Educativo (BEG), Becas y Pasantías** (Ley 26.427, Manuel Belgrano, SAE y SEU).
* **Trámites de Bedelía** (Formulario F0035-P de cambio de turno, PPS, pases y certificados con QR).

*Podés elegir cualquier pregunta sugerida de la **Guía Lateral** o escribir tu consulta abajo.*`,
      fuentes: [],
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [cargando, setCargando] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('aprobacion');
  const [busquedaGuia, setBusquedaGuia] = useState('');
  const [copiadoId, setCopiadoId] = useState(null);

  const mensajesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando]);

  const enviarMensaje = async (textoAEnviar) => {
    const promptFinal = (textoAEnviar || inputPrompt).trim();
    if (!promptFinal || cargando) return;

    const nuevoMensajeUsuario = {
      id: Date.now().toString(),
      rol: 'usuario',
      contenido: promptFinal,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setInputPrompt('');
    setCargando(true);

    const tempAssistantId = (Date.now() + 1).toString();
    const horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const historial = mensajes.slice(-6).map((m) => ({
        rol: m.rol,
        contenido: m.contenido
      }));

      // Intentar streaming en tiempo real vía Server-Sent Events (SSE)
      const response = await fetch(`${API_BASE}/ia/consulta-modalidad-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptFinal, historial })
      });

      if (response.ok && response.body) {
        // Inicializar burbuja de respuesta del asistente
        setMensajes((prev) => [
          ...prev,
          {
            id: tempAssistantId,
            rol: 'asistente',
            contenido: '',
            fuentes: [],
            fecha: horaActual
          }
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let contenidoAcumulado = '';
        let fuentesAcumuladas = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let currentEvent = '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.substring(7);
            } else if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.substring(6);
              try {
                const data = JSON.parse(dataStr);
                if (currentEvent === 'context' && data.fuentes) {
                  fuentesAcumuladas = data.fuentes;
                  setMensajes((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAssistantId
                        ? { ...msg, fuentes: fuentesAcumuladas }
                        : msg
                    )
                  );
                } else if (currentEvent === 'chunk' && data.content) {
                  contenidoAcumulado += data.content;
                  setMensajes((prev) =>
                    prev.map((msg) =>
                      msg.id === tempAssistantId
                        ? { ...msg, contenido: contenidoAcumulado }
                        : msg
                    )
                  );
                }
              } catch (parseErr) {
                // Buffer chunk incompleto
              }
            }
          }
        }

        // Si por alguna razón el stream no generó contenido, fallback
        if (!contenidoAcumulado) {
          throw new Error('Respuesta de stream vacía');
        }
      } else {
        // Fallback REST tradicional
        const res = await axios.post(`${API_BASE}/ia/consulta-modalidad`, {
          prompt: promptFinal,
          historial
        });

        if (res.data && res.data.success) {
          setMensajes((prev) => [
            ...prev,
            {
              id: tempAssistantId,
              rol: 'asistente',
              contenido: res.data.respuesta,
              fuentes: res.data.fuentes || [],
              fecha: horaActual
            }
          ]);
        } else {
          throw new Error(res.data?.error || 'Respuesta inválida del servidor');
        }
      }
    } catch (error) {
      console.error('Error en consulta RAG:', error);
      const detalleError = error.response?.data?.error || error.message || 'Error de conexión';
      const mensajeError = {
        id: tempAssistantId,
        rol: 'asistente',
        contenido: `⚠️ **No se pudo procesar la consulta:** ${detalleError}.\n\nPor favor, verificá que el servidor backend esté activo y reintentá.`,
        fuentes: [],
        fecha: horaActual
      };
      setMensajes((prev) => {
        // Si ya existía el mensaje temporal, reemplazarlo, sino agregarlo
        const existe = prev.some((m) => m.id === tempAssistantId);
        if (existe) {
          return prev.map((m) => (m.id === tempAssistantId ? mensajeError : m));
        }
        return [...prev, mensajeError];
      });
    } finally {
      setCargando(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const handleCopiarTexto = (id, texto) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const handleDescargarDocumento = (nombreDoc) => {
    if (!nombreDoc) return;
    const downloadUrl = `${API_BASE}/ia/documentos/descargar/${encodeURIComponent(nombreDoc)}`;
    window.open(downloadUrl, '_blank');
  };

  const limpiarChat = () => {
    if (window.confirm('¿Querés reiniciar la conversación con el asistente?')) {
      setMensajes([
        {
          id: 'bienvenida',
          rol: 'asistente',
          contenido: `### Conversación reiniciada 🔄\n\n¿Qué consulta académica o normativa tenés sobre la carrera?`,
          fuentes: [],
          fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const renderizarMarkdown = (texto, esUsuario = false) => {
    if (!texto) return '';

    // Si es mensaje del usuario: renderizado directo en texto blanco puro de alta legibilidad
    if (esUsuario) {
      return (
        <div className="text-white font-medium text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-800 selection:text-white">
          {texto}
        </div>
      );
    }

    const lineas = texto.split('\n');
    const elementos = [];
    let i = 0;

    while (i < lineas.length) {
      const linea = lineas[i];
      const trimmed = linea.trim();

      // Detección de Bloque de Tabla Markdown
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < lineas.length && lineas[i + 1].trim().startsWith('|') && lineas[i + 1].includes('---')) {
        const tableLines = [];
        while (i < lineas.length && lineas[i].trim().startsWith('|') && lineas[i].trim().endsWith('|')) {
          tableLines.push(lineas[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr) => {
            return rowStr
              .slice(1, -1)
              .split('|')
              .map((cell) => cell.trim());
          };

          const headers = parseRow(tableLines[0]);
          const dataRows = tableLines.slice(2).map(parseRow);

          elementos.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-gray-700 shadow-xs">
              <table className="min-w-full text-xs divide-y divide-slate-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                <thead className="bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-bold uppercase tracking-wider">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 text-left font-bold">
                        <span dangerouslySetInnerHTML={{ __html: parsearFormatoInline(h) }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60 text-slate-700 dark:text-gray-200">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/70 dark:bg-gray-750/30'}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 align-top leading-relaxed">
                          <span dangerouslySetInnerHTML={{ __html: parsearFormatoInline(cell) }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Viñetas / Listas
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const contenido = trimmed.replace(/^[\*\-]\s+/, '');
        elementos.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-slate-700 dark:text-gray-200 my-1 text-sm">
            <span dangerouslySetInnerHTML={{ __html: parsearFormatoInline(contenido) }} />
          </li>
        );
        i++;
        continue;
      }

      // Títulos
      if (linea.startsWith('#### ')) {
        elementos.push(
          <h4 key={`h4-${i}`} className="text-sm font-bold text-slate-800 dark:text-gray-200 mt-3 mb-1">
            {linea.replace('#### ', '')}
          </h4>
        );
        i++;
        continue;
      }
      if (linea.startsWith('### ')) {
        elementos.push(
          <h3 key={`h3-${i}`} className="text-base font-bold text-blue-700 dark:text-blue-400 mt-3 mb-1.5 flex items-center gap-1.5">
            {linea.replace('### ', '')}
          </h3>
        );
        i++;
        continue;
      }
      if (linea.startsWith('## ')) {
        elementos.push(
          <h2 key={`h2-${i}`} className="text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
            {linea.replace('## ', '')}
          </h2>
        );
        i++;
        continue;
      }

      // Citas / Blockquotes
      if (linea.startsWith('> ')) {
        elementos.push(
          <blockquote key={`quote-${i}`} className="border-l-4 border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 pl-3.5 py-2 my-2.5 rounded-r-xl text-xs text-blue-950 dark:text-blue-200 italic shadow-xs">
            <span dangerouslySetInnerHTML={{ __html: parsearFormatoInline(linea.replace('> ', '')) }} />
          </blockquote>
        );
        i++;
        continue;
      }

      // Separador horizontal
      if (trimmed === '---') {
        elementos.push(<hr key={`hr-${i}`} className="my-3.5 border-slate-200 dark:border-gray-700" />);
        i++;
        continue;
      }

      // Espaciado
      if (trimmed === '') {
        elementos.push(<div key={`space-${i}`} className="h-2" />);
        i++;
        continue;
      }

      elementos.push(
        <p key={`p-${i}`} className="text-slate-800 dark:text-gray-200 my-1 leading-relaxed text-sm">
          <span dangerouslySetInnerHTML={{ __html: parsearFormatoInline(linea) }} />
        </p>
      );
      i++;
    }

    return elementos;
  };

  const parsearFormatoInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-950 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600 dark:text-gray-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-gray-700/80 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700 dark:text-blue-300">$1</code>');
  };

  // Preguntas filtradas por búsqueda en vivo
  const todasLasPreguntas = CATEGORIAS_GUIA.flatMap((cat) =>
    cat.preguntas.map((p) => ({ pregunta: p, categoria: cat.titulo, icono: cat.icono }))
  );

  const preguntasFiltradas = busquedaGuia.trim()
    ? todasLasPreguntas.filter(
        (item) =>
          item.pregunta.toLowerCase().includes(busquedaGuia.toLowerCase()) ||
          item.categoria.toLowerCase().includes(busquedaGuia.toLowerCase())
      )
    : CATEGORIAS_GUIA.find((c) => c.id === categoriaActiva)?.preguntas.map((p) => ({
        pregunta: p,
        categoria: CATEGORIAS_GUIA.find((c) => c.id === categoriaActiva)?.titulo,
        icono: CATEGORIAS_GUIA.find((c) => c.id === categoriaActiva)?.icono
      })) || [];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] p-2 sm:p-4 font-sans flex flex-col gap-3">
      {/* Encabezado Superior Compacto e Integrado */}
      <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <FiCpu className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Asistente Académico IA
              </h1>

              {/* Badge Beta con Globito Informativo al pasar el mouse */}
              <div className="relative inline-flex items-center group">
                <span className="cursor-help inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-600/70 shadow-xs transition-all hover:scale-105 hover:border-amber-400 hover:shadow-amber-500/10 active:scale-95 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Beta
                </span>

                {/* Globito / Popover Flotante */}
                <div className="absolute left-0 top-full mt-2.5 w-80 sm:w-[410px] p-4 rounded-2xl bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 border border-amber-200/80 dark:border-amber-900/60 shadow-2xl shadow-slate-900/15 dark:shadow-black/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out transform group-hover:translate-y-0 translate-y-1 z-50 pointer-events-none">
                  <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100 dark:border-gray-800">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Estado del Asistente • Versión Beta
                    </h4>
                  </div>

                  <div className="space-y-2.5 text-xs leading-relaxed text-slate-600 dark:text-gray-300">
                    {/* Bloque 1: Fuente y Alcance */}
                    <div className="bg-slate-50 dark:bg-gray-800/60 border border-slate-200/70 dark:border-gray-700/60 rounded-xl p-2.5">
                      <p className="font-semibold text-slate-900 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                        <span>🏛️</span> Fuente de Datos y Alcance Actual:
                      </p>
                      <p className="text-[11px] text-slate-700 dark:text-gray-300 leading-normal">
                        Los documentos y normativas oficiales que alimentan este chatbot fueron extraídos directamente de{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">https://www.frc.utn.edu.ar/</span>.
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 leading-normal">
                        ⚠️ <em>Nota:</em> La información está sujeta a cambios continuos y actualmente comprende una muestra representativa (no la totalidad absoluta de modalidades y trámites de todas las carreras).
                      </p>
                    </div>

                    {/* Bloque 2: Métricas Actuales */}
                    <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-2.5">
                      <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
                        <span>⚡</span> Rendimiento y Capacidad Actual (Free Tier):
                      </p>
                      <ul className="space-y-0.5 list-disc list-inside text-[11px] text-amber-800/90 dark:text-amber-300/90">
                        <li><strong>~1.600 tokens</strong> promedio por consulta RAG optimizada.</li>
                        <li>Soporta de <strong>100 a 130 alumnos diarios</strong> (~400 consultas/día).</li>
                        <li>Concurrencia de hasta <strong>30 consultas simultáneas por minuto</strong>.</li>
                      </ul>
                    </div>

                    {/* Bloque 3: Escalabilidad y Ampliación Futura */}
                    <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 rounded-xl p-2.5">
                      <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                        <span>🚀</span> Escalabilidad y Ampliación Futura:
                      </p>
                      <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90 leading-normal">
                        En caso de que la aplicación escale y se implemente en toda la facultad, la base de datos documental se ampliará de forma continua para incorporar la totalidad de carreras y trámites, sustentada sobre una <strong>infraestructura de IA con capacidad de escalabilidad institucional</strong> para soportar la demanda masiva de toda la comunidad universitaria.
                      </p>
                    </div>
                  </div>

                  {/* Flechita / Triángulo decorativo superior */}
                  <div className="absolute -top-2 left-6 w-3.5 h-3.5 bg-white dark:bg-gray-900 border-t border-l border-amber-200/80 dark:border-amber-900/60 transform rotate-45" />
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                UTN FRC • Sistemas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Consultá sobre aprobación directa, regularidad, correlatividades, exámenes y trámites oficiales.
            </p>
          </div>
        </div>

        <button
          onClick={limpiarChat}
          title="Reiniciar chat"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl border border-slate-200 dark:border-gray-700 transition-all active:scale-95 shadow-xs cursor-pointer"
        >
          <FiTrash2 className="text-sm text-slate-500 hover:text-rose-600" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Grid Principal de 12 Columnas: Chat (8 cols) + Guía de Preguntas (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        {/* Columna Izquierda (8 Columnas): Feed Conversacional + Dock de Entrada */}
        <div className="lg:col-span-8 flex flex-col h-full gap-3 min-h-0">
          
          {/* Canvas de Conversación con Fondo Diferenciado y Borde Marcado */}
          <div className="flex-1 bg-slate-100/75 dark:bg-gray-950/70 border border-slate-300/80 dark:border-gray-800 rounded-2xl p-3 sm:p-4 overflow-y-auto flex flex-col gap-3.5 shadow-inner min-h-0">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.rol === 'usuario' ? 'items-end' : 'items-start'} max-w-full`}
              >
                <div
                  className={`flex gap-3 max-w-[95%] sm:max-w-[88%] rounded-2xl p-4 transition-all shadow-sm ${
                    m.rol === 'usuario'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-gray-850 text-slate-900 dark:text-gray-100 border border-slate-200 dark:border-gray-700 rounded-bl-xs'
                  }`}
                >
                  {m.rol === 'asistente' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-blue-200/60 dark:border-blue-800">
                      <FiCpu className="text-base" />
                    </div>
                  )}

                  <div className="flex-1 overflow-hidden">
                    <div className={`flex items-center justify-between gap-4 mb-1.5 pb-1 ${m.rol === 'usuario' ? 'border-b border-blue-500/50 text-white' : 'border-b border-slate-100 dark:border-gray-700/60'}`}>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${m.rol === 'usuario' ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                        {m.rol === 'usuario' ? 'Vos' : 'Asistente Académico UTN'}
                      </span>
                      <div className={`flex items-center gap-2 text-[10px] ${m.rol === 'usuario' ? 'text-blue-100' : 'text-slate-400'}`}>
                        <span>{m.fecha}</span>
                        {m.rol === 'asistente' && (
                          <button
                            onClick={() => handleCopiarTexto(m.id, m.contenido)}
                            title="Copiar texto"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
                          >
                            {copiadoId === m.id ? <FiCheck className="text-emerald-500 text-xs" /> : <FiCopy className="text-xs" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={m.rol === 'usuario' ? 'text-white' : 'prose dark:prose-invert max-w-none text-sm'}>
                      {renderizarMarkdown(m.contenido, m.rol === 'usuario')}
                    </div>

                    {/* Acordeón de Fuentes Oficiales Citadas con Descarga y Hover Dinámico */}
                    {m.fuentes && m.fuentes.length > 0 && (
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-gray-700/80">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-gray-400 mb-1.5">
                          <FiFileText className="text-blue-500 text-xs" />
                          <span>Documentos Oficiales Citados (hacé clic para descargar):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.fuentes.map((f, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleDescargarDocumento(f.documento)}
                              title={`Hacé clic para descargar "${f.documento}" en tu computadora`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100/90 dark:bg-gray-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-gray-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white hover:border-blue-600 dark:hover:border-blue-600 hover:shadow-md shadow-2xs transition-all group active:scale-95 cursor-pointer"
                            >
                              <FiFileText className="text-blue-500 group-hover:text-white text-xs transition-colors" />
                              <span>{f.documento}</span>
                              <span className="opacity-75 text-[10px]">(Pág. {f.pagina || 1})</span>
                              <FiDownload className="text-slate-400 group-hover:text-white text-xs ml-0.5 transition-colors" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Estado de Carga / Inferencia */}
            {cargando && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300 text-xs py-2 animate-pulse bg-white dark:bg-gray-850 p-3 rounded-2xl border border-slate-200 dark:border-gray-700 max-w-md shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 border border-blue-200 dark:border-blue-800 shadow-xs">
                  <FiCpu className="animate-spin text-base" />
                </div>
                <span>Consultando corpus académico oficial y redactando respuesta...</span>
              </div>
            )}

            <div ref={mensajesEndRef} />
          </div>

          {/* Dock de Entrada con Alto Contraste y Borde Resaltado */}
          <div className="bg-white dark:bg-gray-900 border-2 border-slate-300 dark:border-gray-700 rounded-2xl p-2.5 sm:p-3 shadow-md shadow-slate-200/50 dark:shadow-none focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all shrink-0">
            <div className="flex items-end gap-2">
              <div className="p-2 text-blue-600 dark:text-blue-400 hidden sm:block">
                <FiMessageSquare className="text-lg" />
              </div>
              <textarea
                ref={inputRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta académica acá (ej. '¿Cómo promocionar Paradigmas?' o '¿Cuáles son las correlativas de IA?')..."
                rows={2}
                disabled={cargando}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 resize-none py-1.5 px-2 outline-none font-medium leading-relaxed"
              />
              <button
                onClick={() => enviarMensaje()}
                disabled={!inputPrompt.trim() || cargando}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shrink-0 ${
                  inputPrompt.trim() && !cargando
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 active:scale-95 cursor-pointer'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-400 dark:text-gray-600 cursor-not-allowed border border-slate-200 dark:border-gray-700'
                }`}
              >
                <span>Enviar</span>
                <FiSend className="text-xs" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-gray-500 px-2 pt-1 border-t border-slate-100 dark:border-gray-800 mt-1">
              <span>💡 Presioná <strong>Enter</strong> para enviar • <strong>Shift + Enter</strong> para salto de línea</span>
              <span className="hidden sm:inline">RAG 300+ PDFs UTN FRC</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha (4 Columnas): Guía de Preguntas Sugeridas con Buscador */}
        <div className="lg:col-span-4 flex flex-col h-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-3.5 sm:p-4 shadow-sm min-h-0 overflow-hidden">
          
          {/* Encabezado del Panel Lateral */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60 shadow-xs">
                <FiHelpCircle className="text-base" />
              </div>
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Guía de Preguntas Sugeridas
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-gray-400">
                  {todasLasPreguntas.length} consultas frecuentes oficiales
                </p>
              </div>
            </div>
          </div>

          {/* Buscador Rápido de Preguntas */}
          <div className="my-2.5 shrink-0 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={busquedaGuia}
              onChange={(e) => setBusquedaGuia(e.target.value)}
              placeholder="Buscar pregunta (ej. 'IA', 'PPS', 'Promoción')..."
              className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-xs pl-8 pr-8 py-2 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            {busquedaGuia && (
              <button
                onClick={() => setBusquedaGuia('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>

          {/* Selector de Categorías (Visible solo si no hay búsqueda activa) */}
          {!busquedaGuia && (
            <div className="flex flex-wrap gap-1.5 mb-2.5 shrink-0 max-h-28 overflow-y-auto pr-1">
              {CATEGORIAS_GUIA.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    categoriaActiva === cat.id
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/20'
                      : 'bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-750 border border-slate-200 dark:border-gray-700'
                  }`}
                >
                  {cat.icono}
                  <span>{cat.titulo}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded-full ${categoriaActiva === cat.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/80 dark:bg-gray-700 text-slate-600 dark:text-gray-300'}`}>
                    {cat.preguntas.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Indicador de Búsqueda Activa */}
          {busquedaGuia && (
            <div className="mb-2 text-[11px] font-bold text-slate-500 dark:text-gray-400 flex items-center justify-between px-1">
              <span>Resultados encontrados:</span>
              <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px]">
                {preguntasFiltradas.length} preguntas
              </span>
            </div>
          )}

          {/* Lista de Preguntas con Scroll Vertical */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {preguntasFiltradas.length > 0 ? (
              preguntasFiltradas.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => enviarMensaje(item.pregunta)}
                  className="w-full text-left text-xs bg-slate-50/90 dark:bg-gray-850 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-gray-700/80 hover:border-blue-400 dark:hover:border-blue-500 p-2.5 rounded-xl text-slate-800 dark:text-gray-200 transition-all hover:shadow-xs group flex items-start justify-between gap-2 active:scale-98 cursor-pointer"
                >
                  <div className="flex-1">
                    {busquedaGuia && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-0.5 uppercase tracking-wider">
                        {item.categoria}
                      </span>
                    )}
                    <p className="group-hover:text-blue-700 dark:group-hover:text-blue-300 font-medium leading-relaxed">
                      {item.pregunta}
                    </p>
                  </div>
                  <FiChevronRight className="text-slate-400 group-hover:text-blue-600 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-gray-500 text-xs">
                No se encontraron preguntas que coincidan con "<strong>{busquedaGuia}</strong>".
              </div>
            )}
          </div>

          {/* Pie Informativo */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-gray-800 text-[11px] text-slate-500 dark:text-gray-400 text-center shrink-0">
            📚 Hacé clic en cualquier tarjeta para consultar automáticamente.
          </div>
        </div>

      </div>
    </div>
  );
}
