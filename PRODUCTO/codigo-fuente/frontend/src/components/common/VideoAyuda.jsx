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
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700">

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

            {/* Contenido: video o placeholder */}
            <div className="p-5">
              {tienVideo ? (
                /* ── VIDEO DE YOUTUBE ── */
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
                /* ── PLACEHOLDER (mientras no hay video cargado) ── */
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 py-14 px-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-3xl">
                    🎬
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      Video tutorial próximamente
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                      El video explicativo de esta sección aún no fue cargado.
                      Podés cerrar esta ventana y continuar navegando.
                    </p>
                  </div>
                </div>
              )}
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
