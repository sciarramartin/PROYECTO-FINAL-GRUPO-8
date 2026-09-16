import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAward, FiUsers, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const MetricaGraduados = () => {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${apiUrl}/progreso/metricas-graduados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetricas(response.data);
      } catch (err) {
        console.error('Error al cargar métricas de graduados:', err);
      } finally {
        setCargando(false);
      }
    };

    fetchMetricas();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-zinc-100 dark:bg-zinc-800/50 rounded"></div>
      </div>
    );
  }

  if (!metricas) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
            🎓
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
              Métricas de Graduación y Tasa de Egreso
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Rendimiento institucional y finalización de carrera
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100/70 dark:border-amber-900/40 space-y-1">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            Graduados Totales
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-300">{metricas.totalGraduados}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">alumnos</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Tasa de Egreso Global
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{metricas.tasaGeneral}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">del alumnado</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/40 space-y-1">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
            Estudiantes Activos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900 dark:text-indigo-300">{metricas.totalEstudiantes}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">totales</span>
          </div>
        </div>

      </div>

      {/* Desglose por carrera */}
      {metricas.graduadosPorCarrera && Object.keys(metricas.graduadosPorCarrera).length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Desglose por Especialidad
          </h4>
          <div className="space-y-1.5">
            {Object.entries(metricas.graduadosPorCarrera).map(([carrera, data]) => (
              <div
                key={carrera}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between gap-4 text-xs border border-zinc-100 dark:border-zinc-800"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{carrera}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {data.graduados} graduados de {data.total} estudiantes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${data.tasa}%` }}
                    ></div>
                  </div>
                  <span className="font-extrabold text-zinc-700 dark:text-zinc-300 min-w-[36px] text-right">
                    {data.tasa}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricaGraduados;
