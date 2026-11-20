import { useState, useEffect, useCallback } from "react";
import { FiHelpCircle, FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";

// ──────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE VIDEOS POR SECCIÓN
// Para agregar el video de cada sección:
//   1. Subí el video a YouTube (puede ser "No listado" para privacidad)
//   2. Copiá el ID del video (lo que va después de "v=" en la URL)
//   3. Pegalo en el campo "youtubeId" de la sección correspondiente
//   4. Podés personalizar el "titulo" y "descripcion" de cada sección
// ──────────────────────────────────────────────────────────────
const VIDEOS_POR_RUTA = {
  "/dashboard": {
    titulo: "¿Cómo usar el Dashboard?",
    descripcion: "Conocé tu panel de control: progreso académico, métricas y accesos rápidos.",
    youtubeId: "nW_GIVOGV9Q",
    // youtubeId: "seL3KDHMr6Y",
  },
  "/asistente-ia": {
    titulo: "¿Cómo usar el Asistente de IA?",
    descripcion: "Hacé preguntas académicas y obtené respuestas inteligentes al instante.",
    youtubeId: "Wcekcp8bhyo",
  },
  "/planificador": {
    titulo: "¿Cómo usar el Planificador?",
    descripcion: "Organizá tus tareas, parciales y actividades académicas en un calendario.",
    youtubeId: "_lu7AzJKXvg",
  },
  "/materias": {
    titulo: "¿Cómo usar Materias?",
    descripcion: "Consultá el plan de estudios y el estado de tus materias.",
    youtubeId: "SUDTXjYSGo8",
  },
  "/Horario": {
    titulo: "¿Cómo usar el Horario?",
    descripcion: "Visualizá tu horario semanal de clases y actividades.",
    youtubeId: "LLsATh1DEvc",
  },
  "/conexiones": {
    titulo: "¿Cómo usar Conexiones?",
    descripcion: "Encontrá y conectate con otros estudiantes de tu carrera.",
    youtubeId: "WBcSfLLzH8U",
  },
  "/grupos": {
    titulo: "¿Cómo usar Grupos?",
    descripcion: "Creá o únete a grupos de estudio y coordiná por chat grupal.",
    youtubeId: "HB5D-EvX-wE",
  },
  "/foros": {
    titulo: "¿Cómo usar los Foros?",
    descripcion: "Participá en discusiones académicas, hacé preguntas y compartí conocimiento.",
    youtubeId: "KkfiYSN1j74",
  },
  "/repositorio": {
    titulo: "¿Cómo usar el Repositorio?",
    descripcion: "Accedé y subí materiales de estudio: apuntes, guías y más.",
    youtubeId: "N21V371ACJo",
  },
  "/mapa-correlatividades": {
    titulo: "¿Cómo usar el Mapa de Correlativas?",
    descripcion: "Visualizá el árbol de correlatividades y gestioná el estado de tus materias.",
    youtubeId: "OBsQT48Tq4Y",
  },
  "/resenas": {
    titulo: "¿Cómo usar Reseñas?",
    descripcion: "Consultá las opiniones sobre cátedras, docentes y exigencia académica.",
    youtubeId: "7QmIIpCIfKU",
  },
};

// ──────────────────────────────────────────────────────────────
// MANUAL ESCRITO POR SECCIÓN (versión resumida del video)
// Mantenelo breve: 3 a 4 pasos cortos por sección.
// ──────────────────────────────────────────────────────────────
const MANUAL_POR_RUTA = {
  "/dashboard": [
    "Revisá tu progreso curricular y la proyección de graduación.",
    "Ajustá el simulador para estimar cuándo te recibís.",
    "Usá los accesos directos para ir a cada sección.",
  ],
  "/asistente-ia": [
    "Escribí tu consulta académica y presioná Enter.",
    "Usá las preguntas sugeridas de la guía lateral para empezar.",
    "Descargá los documentos oficiales citados en cada respuesta.",
  ],
  "/planificador": [
    "Elegí las materias que querés cursar.",
    "Indicá tu disponibilidad horaria y tus actividades.",
    "Generá la planificación, revisá la vista previa y guardala.",
  ],
  "/materias": [
    "Buscá la materia en tu plan de estudios.",
    "Cambiá su estado (Cursando, Regular, Aprobada).",
    "Consultá el historial de cursadas desde cada materia.",
  ],
  "/Horario": [
    "Consultá tus clases y actividades de la semana.",
    "Agregá actividades personales con el botón correspondiente.",
    "Hacé clic en una actividad para editarla o eliminarla.",
  ],
  "/conexiones": [
    "Buscá estudiantes y enviales una solicitud.",
    "Aceptá o rechazá solicitudes recibidas.",
    "Entrá al perfil o al chat de tus conexiones.",
  ],
  "/grupos": [
    "Creá un grupo o unite a uno existente.",
    "Entrá al muro del grupo para ver sus miembros.",
    "Coordiná con tu equipo desde el chat grupal.",
  ],
  "/foros": [
    "Elegí una materia o explorá el feed general.",
    "Creá una publicación con tu duda o aporte.",
    "Comentá, votá y guardá las publicaciones que te sirvan.",
  ],
  "/repositorio": [
    "Buscá apuntes por materia o etiqueta.",
    "Descargá, calificá y dale like al material.",
    "Compartí el tuyo con el botón de agregar.",
  ],
  "/mapa-correlatividades": [
    "Explorá el mapa de materias y sus correlatividades.",
    "Hacé clic en una materia para ver sus requisitos.",
    "Actualizá su estado para desbloquear las siguientes.",
  ],
  "/resenas": [
    "Buscá la materia o cátedra que te interesa.",
    "Leé las valoraciones y comentarios de otros alumnos.",
    "Dejá tu propia reseña al terminar de cursar.",
  ],
};

const VideoAyuda = () => {
  const location = useLocation();
  const [abierto, setAbierto] = useState(false);

  const videoConfig = VIDEOS_POR_RUTA[location.pathname];

  // Cerrar el modal con Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && abierto) setAbierto(false);
    },
    [abierto]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Cerrar el modal al cambiar de sección
  useEffect(() => {
    setAbierto(false);
  }, [location.pathname]);

  // Si no hay configuración de video para esta ruta, no renderizar nada
  if (!videoConfig) return null;

  const tienVideo = !!videoConfig.youtubeId;
  const pasos = MANUAL_POR_RUTA[location.pathname] || [];

  return (
    <>
      {/* ── BOTÓN FLOTANTE "?" ───────────────────────── */}
      <button
        onClick={() => setAbierto(true)}
        title={`Ayuda: ${videoConfig.titulo}`}
        aria-label="Ver video de ayuda"
        className="
          fixed bottom-6 right-6 z-40
          w-11 h-11 rounded-full
          bg-indigo-600 hover:bg-indigo-700 active:scale-95
          text-white shadow-lg shadow-indigo-500/30
          flex items-center justify-center
          transition-all duration-200
          border-2 border-white dark:border-slate-800
        "
      >
        <FiHelpCircle className="w-5 h-5" />
      </button>

      {/* ── MODAL / OVERLAY ──────────────────────────── */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setAbierto(false); }}
        >
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-700">

            {/* Cabecera */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FiHelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {videoConfig.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {videoConfig.descripcion}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAbierto(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-3 shrink-0"
                aria-label="Cerrar"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido: video (izquierda) + manual escrito (derecha) */}
            <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                {tienVideo ? (
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      className="absolute inset-0 w-full h-full rounded-xl"
                      src={`https://www.youtube.com/embed/${videoConfig.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={videoConfig.titulo}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-3xl">🎬</div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Video tutorial próximamente</p>
                  </div>
                )}
              </div>

              <aside
                aria-label="Manual de usuario escrito"
                className="lg:col-span-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4"
              >
                <ol className="space-y-2.5">
                  {pasos.map((paso, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-snug">
                      <span className="w-5 h-5 mt-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{paso}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>

            {/* Pie */}
            <div className="px-5 pb-4 flex items-center justify-between">
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Presioná <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono">Esc</kbd> o hacé clic fuera para cerrar
              </p>
              <button
                onClick={() => setAbierto(false)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoAyuda;
