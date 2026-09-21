import React, { useState, useEffect } from 'react';
import { FiAward, FiStar, FiDownload, FiFileText, FiCheckCircle, FiInfo } from 'react-icons/fi';

const TooltipInfo = ({ texto }) => (
  <span className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle select-none">
    <span aria-label="Información sobre cálculo de reputación" className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black transition-all group-hover:scale-110 opacity-75 group-hover:opacity-100">
      !
    </span>
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 text-[11px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700 font-normal normal-case text-left">
      <span className="font-bold text-amber-300 dark:text-amber-400 block mb-1">📐 ¿Cómo se calcula?</span>
      {texto}
      <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></span>
    </span>
  </span>
);

const MetricaReputacion = ({ datosReputacion, className = '' }) => {
  // Desestructuramos directamente los datos calculados
  const {
    puntosAnuales = '154,5',
    anoLectivo = '2026',
    rango = { nivel: 3, titulo: 'Mentor Comunitario', insignia: '🥇' },
    metricasAnuales = { totalApuntes: 2, promedioEstrellas: '3.9', totalVotos: 5, totalDescargas: 61 }
  } = datosReputacion || {};

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-5 ${className}`}>
      {/* Cabecera con Rango y Puntos */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-200/50 dark:border-amber-800/40 shadow-xs">
            {rango.insignia}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-extrabold uppercase tracking-wider border border-indigo-200/60 dark:border-indigo-800/50">
                Nivel {rango.nivel}
              </span>
              <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                {rango.titulo}
              </h3>
              <TooltipInfo texto="Puntaje obtenido en el ciclo lectivo actual según aportes: (Apuntes × 10) + (Promedio Calificaciones × 15) + (Votos Recibidos × 3) + (Descargas × 1)." />
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Reputación de Comunidad y Aportes Académicos • {anoLectivo}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-right">
          <span className="block text-2xl font-black text-amber-900 dark:text-amber-300 leading-none">
            {puntosAnuales}
          </span>
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            puntos anuales
          </span>
        </div>
      </div>

      {/* Grid de Métricas Secundarias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Apuntes</span>
            <FiFileText className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
              {metricasAnuales.totalApuntes}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">subidos</span>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Promedio</span>
            <FiStar className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
              {metricasAnuales.promedioEstrellas}
            </span>
            <span className="text-[10px] text-amber-500">★</span>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Votos</span>
            <FiCheckCircle className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
              {metricasAnuales.totalVotos}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">recibidos</span>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Descargas</span>
            <FiDownload className="text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
              {metricasAnuales.totalDescargas}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">totales</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MetricaReputacion;