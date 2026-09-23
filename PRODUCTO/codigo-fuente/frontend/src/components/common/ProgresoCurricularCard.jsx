import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiCheckCircle, FiBookOpen, FiClock, FiLayers, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip, Legend);

const TooltipInfo = ({ texto }) => {
  return (
    <span className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle select-none">
      <span
        aria-label="Información sobre cálculo de métrica"
        className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black transition-all group-hover:scale-110 opacity-75 group-hover:opacity-100"
      >
        !
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 text-[11px] leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700 font-normal normal-case text-left">
        <span className="font-bold text-amber-300 dark:text-amber-400 block mb-1">📐 ¿Cómo se calcula?</span>
        {texto}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></span>
      </span>
    </span>
  );
};

const ProgresoCurricularCard = () => {
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarDetalleElectivas, setMostrarDetalleElectivas] = useState(false);

  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await axios.get(`${apiUrl}/progreso/progreso-curricular`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgreso(res.data);
      } catch (err) {
        console.error('Error al cargar progreso curricular:', err);
        setError('No se pudo cargar el progreso curricular.');
      } finally {
        setCargando(false);
      }
    };

    fetchProgreso();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
        <div className="h-44 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !progreso) {
    return null;
  }

  // Datos para gráfico Doughnut de Chart.js
  const chartData = {
    labels: ['Aprobadas', 'Regulares', 'Cursando', 'Pendientes'],
    datasets: [
      {
        data: [
          progreso.materiasAprobadas,
          progreso.materiasRegulares,
          progreso.materiasCursando,
          progreso.materiasPendientes
        ],
        backgroundColor: [
          '#10b981', // emerald-500
          '#6366f1', // indigo-500
          '#f59e0b', // amber-500
          '#e4e4e7'  // zinc-200
        ],
        borderColor: [
          '#059669',
          '#4f46e5',
          '#d97706',
          '#d4d4d8'
        ],
        borderWidth: 1.5,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw} materias`
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-6">
      {/* Encabezado del Widget */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
            📊
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Progreso Curricular y Avance de Carrera
              </h3>
              <TooltipInfo texto="Calculado como (Materias Aprobadas ÷ Total de Materias del Plan Activo) × 100 según el id_plan_academico asignado a tu cuenta." />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {progreso.carreraNombre} • {progreso.planNombre}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/50">
          Plan Activo
        </span>
      </div>

      {/* Cuerpo Principal: Gráfico Circular + Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Gráfico Doughnut con % central */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-44 h-44">
            <Doughnut data={chartData} options={chartOptions} />
            {/* Texto en el centro de la dona */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">
                {progreso.porcentajeAvance}%
              </span>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                Avance Total
              </span>
            </div>
          </div>

          {/* Leyenda resumida debajo del gráfico */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-3 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Aprobadas ({progreso.materiasAprobadas})
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Regulares ({progreso.materiasRegulares})
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Cursando ({progreso.materiasCursando})
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span> Pendientes ({progreso.materiasPendientes})
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas de Resumen */}
        <div className="md:col-span-7 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Materias del Plan
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
                  {progreso.totalMaterias}
                </span>
                <span className="text-xs text-zinc-500 font-medium">asignaturas</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Aprobadas
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
                  {progreso.materiasAprobadas}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">completadas</span>
              </div>
            </div>
          </div>

          {/* Sub-métrica Específica: Cumplimiento de Electivas por Sistema de Puntos (US-MET-02) */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FiAward className="text-amber-600 dark:text-amber-400 text-sm" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Materias Electivas y Créditos Académicos
                </span>
                <TooltipInfo texto="Las electivas otorgan puntos académicos al aprobarse (en su mayoría 3 pts, con una de 4 pts y otra de 2 pts). Para el Título Intermedio se requieren 4 puntos y para el Título de Grado (Ingeniería) se requieren 20 puntos." />
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold border border-amber-200 dark:border-amber-800">
                {progreso.electivas?.puntosObtenidos || 0} pts obtenidos
              </span>
            </div>

            {/* Doble barra de progreso: Intermedio (4 pts) y Grado (20 pts) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Título Intermedio */}
              <div className="bg-white/70 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    🎓 Título Intermedio
                  </span>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400">
                    {progreso.electivas?.puntosObtenidos || 0} / 4 pts
                  </span>
                </div>
                <div className="w-full bg-amber-100 dark:bg-amber-950/50 rounded-full h-2 overflow-hidden mb-1">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progreso.electivas?.porcentajeIntermedio || 0}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {progreso.electivas?.cumpleIntermedio
                    ? '✅ Requisito de 4 pts completado'
                    : `Faltan ${progreso.electivas?.puntosFaltantesIntermedio} pts para el título intermedio`}
                </span>
              </div>

              {/* Título de Grado */}
              <div className="bg-white/70 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    🏛️ Título de Grado
                  </span>
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-400">
                    {progreso.electivas?.puntosObtenidos || 0} / 20 pts
                  </span>
                </div>
                <div className="w-full bg-indigo-100 dark:bg-indigo-950/50 rounded-full h-2 overflow-hidden mb-1">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progreso.electivas?.porcentajeGrado || 0}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {progreso.electivas?.cumpleGrado
                    ? '🎓 Requisito de 20 pts completado'
                    : `Faltan ${progreso.electivas?.puntosFaltantesGrado} pts para graduarte de Ingeniero`}
                </span>
              </div>
            </div>

            {/* Desplegable o Detalle de Electivas Aprobadas */}
            {progreso.electivas?.materiasAprobadas && progreso.electivas.materiasAprobadas.length > 0 ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarDetalleElectivas(!mostrarDetalleElectivas)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>
                    {mostrarDetalleElectivas ? 'Ocultar electivas aprobadas' : `Ver ${progreso.electivas.materiasAprobadas.length} electiva(s) aprobada(s)`}
                  </span>
                  {mostrarDetalleElectivas ? <FiChevronUp className="text-xs" /> : <FiChevronDown className="text-xs" />}
                </button>

                {mostrarDetalleElectivas && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {progreso.electivas.materiasAprobadas.map((e) => (
                      <span
                        key={e.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[10px] font-medium"
                      >
                        <FiCheckCircle className="text-emerald-500 text-[10px]" />
                        {e.nombre} <strong className="text-amber-700 dark:text-amber-400">({e.puntos} pts)</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80">
                ℹ️ Las materias electivas aprobadas sumarán puntos automáticamente al registrar su estado en el sistema.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desglose por Nivel de Año (1° a 5°) */}
      {progreso.desglosePorNivel && progreso.desglosePorNivel.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiLayers className="text-indigo-500" />
              Avance por Nivel Académico
            </h4>
            <span className="text-[11px] text-zinc-400">1° a 5° Año</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {progreso.desglosePorNivel.map((item) => (
              <div
                key={item.nivel}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200">
                      {item.nombre}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      {item.porcentaje}%
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-2">
                    {item.aprobadas} de {item.total} aprobadas
                  </p>
                </div>

                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgresoCurricularCard;
