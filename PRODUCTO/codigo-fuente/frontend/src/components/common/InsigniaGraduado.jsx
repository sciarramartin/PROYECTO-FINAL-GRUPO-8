import React, { useState } from 'react';
import { FiAward, FiCheckCircle, FiX, FiShare2, FiStar, FiCalendar, FiBookOpen } from 'react-icons/fi';

const InsigniaGraduado = ({ carrera = 'Ingeniería en Sistemas', trayectoria = null, className = '', modalAutoOpen = false }) => {
  const [mostrarModal, setMostrarModal] = useState(modalAutoOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setMostrarModal(true)}
        className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-300 dark:border-amber-500/50 rounded-2xl text-xs font-black text-amber-800 dark:text-amber-300 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer animate-pulse hover:animate-none ${className}`}
        title="¡Haz clic para ver tu Trayectoria Académica y Diploma de Honor!"
      >
        <span className="text-base transform group-hover:scale-125 transition-transform duration-300">
          🎓
        </span>
        <span className="tracking-tight">Ingeniero/a Graduado/a • UTN FRC</span>
        <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-lg font-mono font-extrabold flex items-center gap-1 border border-amber-300/60">
          <FiAward className="text-amber-600 dark:text-amber-300" />
          Título Obtenido
        </span>
      </button>

      {/* Modal / Pantalla de Felicitaciones y Resumen de Trayectoria Académica (US-MET-11) */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-amber-200 dark:border-amber-900/50 overflow-hidden text-center p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fondo decorativo con gradiente */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-100/80 via-amber-50/40 to-transparent dark:from-amber-950/40 dark:via-zinc-900 pointer-events-none"></div>

            {/* Botón Cerrar */}
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <FiX className="text-lg" />
            </button>

            {/* Ícono de Premio Animado */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20 border-4 border-white dark:border-zinc-900 transform rotate-3 hover:rotate-0 transition-transform">
              🎓
            </div>

            <div className="space-y-2 relative">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Universidad Tecnológica Nacional • FRC
              </span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                ¡Felicitaciones, Colega Ingeniero/a!
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Has alcanzado el 100% de las asignaturas aprobadas y la aprobación de tu Proyecto Final de carrera.
              </p>
            </div>

            {/* Tarjeta de Resumen de Trayectoria */}
            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 space-y-3 text-left">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                Trayectoria Académica Verificada
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <FiCalendar className="text-amber-500" />
                    <span className="text-[11px] font-bold">Estado Curricular</span>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    100% Completado
                  </span>
                </div>

                <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700/60">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <FiCheckCircle className="text-indigo-500" />
                    <span className="text-[11px] font-bold">Proyecto Final</span>
                  </div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    Aprobado (PRO5 / PFI5)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold block">Grado Académico</span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300">
                    {carrera || 'Ingeniería en Sistemas de Información'}
                  </span>
                </div>
                <span className="text-2xl">🏛️</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950 font-extrabold text-xs rounded-xl transition shadow-sm border-none cursor-pointer"
              >
                Continuar al Campus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsigniaGraduado;
