import React from 'react';
import { FiAward } from 'react-icons/fi';

const InsigniaGraduado = ({ carrera, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-indigo-500/15 border border-amber-300 dark:border-amber-500/40 rounded-xl text-xs font-black text-amber-800 dark:text-amber-300 shadow-2xs ${className}`}
      title="Estudiante con 100% de materias aprobadas y Proyecto Final completado"
    >
      <span className="text-sm">🎓</span>
      <span>Ingeniero/a Graduado/a • UTN FRC</span>
      <span className="text-[10px] bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded-md font-mono font-bold">
        Graduado
      </span>
    </div>
  );
};

export default InsigniaGraduado;
