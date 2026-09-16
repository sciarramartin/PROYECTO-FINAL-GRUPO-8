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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
      </div>
    );
  }

  if (!metricas) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            🎓
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Métricas de Graduación y Tasa de Egreso
            </h3>
            <p className="text-[11px] text-slate-400">
              Rendimiento institucional y finalización de carrera
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/70 space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Graduados Totales
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900">{metricas.totalGraduados}</span>
            <span className="text-xs text-amber-600 font-medium">alumnos</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/70 space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Tasa de Egreso Global
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900">{metricas.tasaGeneral}%</span>
            <span className="text-xs text-emerald-600 font-medium">del alumnado</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 space-y-1">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
            Estudiantes Activos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900">{metricas.totalEstudiantes}</span>
            <span className="text-xs text-indigo-600 font-medium">totales</span>
          </div>
        </div>

      </div>

      {/* Desglose por carrera */}
      {metricas.graduadosPorCarrera && Object.keys(metricas.graduadosPorCarrera).length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Desglose por Especialidad
          </h4>
          <div className="space-y-1.5">
            {Object.entries(metricas.graduadosPorCarrera).map(([carrera, data]) => (
              <div
                key={carrera}
                className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{carrera}</p>
                  <p className="text-[10px] text-slate-400">
                    {data.graduados} graduados de {data.total} estudiantes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${data.tasa}%` }}
                    ></div>
                  </div>
                  <span className="font-extrabold text-slate-700 min-w-[36px] text-right">
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
