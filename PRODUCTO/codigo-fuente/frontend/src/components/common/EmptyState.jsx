import React from 'react';
import { FiPlus, FiMessageSquare, FiUsers, FiSearch, FiEdit3 } from 'react-icons/fi';

/**
 * Componente EmptyState reutilizable con ilustraciones SVG monocromáticas acordes,
 * mensajes amigables y botones de acción principal (Criterio de Aceptación US-V05).
 */
export const EmptyStateIllustration = ({ variant = 'debate', className = 'w-40 h-40 text-indigo-500/80 dark:text-indigo-400/70' }) => {
  switch (variant) {
    case 'debate':
    case 'foro':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="80" r="68" className="fill-indigo-50 dark:fill-indigo-950/30" />
          {/* Burbuja principal de debate */}
          <rect x="42" y="38" width="88" height="60" rx="14" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" />
          <path d="M58 98L48 112L68 98H58Z" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Líneas de conversación */}
          <line x1="58" y1="56" x2="108" y2="56" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="58" y1="68" x2="98" y2="68" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="80" x2="84" y2="80" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />
          
          {/* Burbuja secundaria respondiendo */}
          <rect x="96" y="68" width="62" height="46" rx="12" className="fill-indigo-600 dark:fill-indigo-500 shadow-lg" />
          <path d="M142 114L150 124L136 114H142Z" className="fill-indigo-600 dark:fill-indigo-500" />
          <circle cx="114" cy="91" r="2.5" fill="white" />
          <circle cx="127" cy="91" r="2.5" fill="white" />
          <circle cx="140" cy="91" r="2.5" fill="white" />

          {/* Destellos decorativos monocromáticos */}
          <path d="M148 42L150 48L156 50L150 52L148 58L146 52L140 50L146 48L148 42Z" className="fill-indigo-400 dark:fill-indigo-300" />
          <circle cx="38" cy="62" r="3" className="fill-indigo-300 dark:fill-indigo-600" />
          <circle cx="168" cy="100" r="2.5" className="fill-indigo-200 dark:fill-indigo-700" />
        </svg>
      );

    case 'groups':
    case 'grupos':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="80" r="68" className="fill-indigo-50 dark:fill-indigo-950/30" />
          {/* Avatares conectados formando equipo */}
          <circle cx="70" cy="60" r="18" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" />
          <path d="M50 96C50 84 59 78 70 78C81 78 90 84 90 96" className="stroke-indigo-600 dark:stroke-indigo-400 fill-white dark:fill-zinc-800" strokeWidth="2.5" strokeLinecap="round" />
          
          <circle cx="130" cy="60" r="18" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" />
          <path d="M110 96C110 84 119 78 130 78C141 78 150 84 150 96" className="stroke-indigo-600 dark:stroke-indigo-400 fill-white dark:fill-zinc-800" strokeWidth="2.5" strokeLinecap="round" />

          {/* Avatar central prominente */}
          <circle cx="100" cy="52" r="20" className="fill-indigo-600 dark:fill-indigo-500" />
          <path d="M78 98C78 86 88 80 100 80C112 80 122 86 122 98" className="fill-indigo-600 dark:fill-indigo-500" />

          {/* Línea de conexión / red */}
          <path d="M70 110L100 124L130 110" className="stroke-indigo-400 dark:stroke-indigo-500" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="100" cy="124" r="4" className="fill-indigo-600 dark:fill-indigo-400" />

          {/* Símbolo colaborativo */}
          <path d="M154 38L156 44L162 46L156 48L154 54L152 48L146 46L152 44L154 38Z" className="fill-indigo-400 dark:fill-indigo-300" />
        </svg>
      );

    case 'comments':
    case 'comentarios':
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="80" r="64" className="fill-indigo-50 dark:fill-indigo-950/30" />
          {/* Bocadillo de diálogo con corazón o cursor */}
          <rect x="52" y="44" width="96" height="66" rx="16" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" />
          <path d="M72 110L62 126L86 110H72Z" className="fill-white dark:fill-zinc-800 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Líneas de texto */}
          <line x1="70" y1="64" x2="114" y2="64" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="78" x2="130" y2="78" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="92" x2="102" y2="92" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />

          {/* Botón flotante para sumar el primer comentario */}
          <circle cx="146" cy="106" r="16" className="fill-indigo-600 dark:fill-indigo-500 shadow-md" />
          <path d="M146 98V114M138 106H154" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'search':
    case 'filtros':
    default:
      return (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="100" cy="80" r="64" className="fill-indigo-50 dark:fill-indigo-950/30" />
          {/* Hoja de documento de fondo */}
          <rect x="64" y="36" width="60" height="78" rx="8" className="fill-white dark:fill-zinc-800 stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" />
          <line x1="76" y1="52" x2="104" y2="52" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />
          <line x1="76" y1="64" x2="112" y2="64" className="stroke-indigo-300 dark:stroke-indigo-600" strokeWidth="2" strokeLinecap="round" />
          {/* Lupa grande monocromática */}
          <circle cx="112" cy="88" r="26" className="fill-white dark:fill-zinc-900 stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="3" />
          <line x1="131" y1="107" x2="152" y2="128" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="3.5" strokeLinecap="round" />
          {/* Destello dentro de la lupa */}
          <path d="M102 78C106 74 114 74 118 78" className="stroke-indigo-400 dark:stroke-indigo-300" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

const EmptyState = ({
  variant = 'debate',
  titulo = 'No hay contenido disponible',
  mensaje = 'Aún no se han registrado elementos en esta sección.',
  accionTexto,
  alHacerClic,
  iconoAccion = null,
  botonSecundarioTexto,
  alHacerClicSecundario,
  className = '',
  children
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-10 px-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm transition-all duration-300 max-w-xl mx-auto ${className}`}
    >
      <div className="mb-2 transform transition-transform hover:scale-105 duration-300 select-none">
        <EmptyStateIllustration variant={variant} />
      </div>

      <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-1.5">
        {titulo}
      </h3>

      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed mb-6">
        {mensaje}
      </p>

      {(accionTexto || children) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {accionTexto && alHacerClic && (
            <button
              type="button"
              onClick={alHacerClic}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-150 cursor-pointer border-none"
            >
              {iconoAccion || (variant === 'groups' ? <FiUsers /> : variant === 'debate' || variant === 'comentarios' ? <FiMessageSquare /> : <FiPlus />)}
              <span>{accionTexto}</span>
            </button>
          )}

          {botonSecundarioTexto && alHacerClicSecundario && (
            <button
              type="button"
              onClick={alHacerClicSecundario}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 active:scale-95 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer border-none"
            >
              <span>{botonSecundarioTexto}</span>
            </button>
          )}

          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
