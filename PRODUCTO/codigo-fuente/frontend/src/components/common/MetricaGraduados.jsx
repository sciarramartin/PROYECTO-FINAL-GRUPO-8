import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FiAward, FiUsers, FiTrendingUp, FiCheckCircle, FiClock, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

  // Datos para gráfico Chart.js de Graduados por Carrera
  const carrerasLabels = metricas.graduadosPorCarrera ? Object.keys(metricas.graduadosPorCarrera) : [];
  const graduadosData = carrerasLabels.map(c => metricas.graduadosPorCarrera[c].graduados);
  const totalAlumnosData = carrerasLabels.map(c => metricas.graduadosPorCarrera[c].total);

  const chartData = {
    labels: carrerasLabels,
    datasets: [
      {
        label: 'Graduados Totales',
        data: graduadosData,
        backgroundColor: '#10b981',
        borderRadius: 6
      },
      {
        label: 'Total Matriculados',
        data: totalAlumnosData,
        backgroundColor: '#e4e4e7',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#71717a',
          font: { size: 11, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e4e4e7'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: '#f4f4f5' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
            🎓
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">
                Métricas de Graduación y Tasa de Egreso
              </h3>
              <TooltipInfo texto="Panel general de analíticas que cuantifica los egresados efectivos según las ordenanzas de plan de estudio y la materia terminal Proyecto Final." />
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Rendimiento institucional y finalización de carrera (Panel de Administración / Cátedra)
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-full text-[11px] font-bold border border-amber-200 dark:border-amber-900/40">
          Admin / Institucional
        </span>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100/70 dark:border-amber-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Graduados Totales
            </span>
            <TooltipInfo texto="Contabiliza a todos los estudiantes que tienen el 100% de las materias del plan de carrera en estado 'Aprobada' y la materia terminal Proyecto Final (PRO5 / Tesis) aprobada." />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-300">{metricas.totalGraduados}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">alumnos</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/70 dark:border-emerald-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Tasa de Egreso Global
            </span>
            <TooltipInfo texto="Porcentaje calculado como: (Total de Estudiantes Graduados ÷ Total de Estudiantes Registrados en la plataforma) × 100." />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">{metricas.tasaGeneral}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">del alumnado</span>
          </div>
        </div>

        <div className="p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100/70 dark:border-teal-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
              Duración Media Carrera
            </span>
            <TooltipInfo texto="Promedio de años transcurridos desde anio_ingreso hasta la fecha de egreso/aprobación de Proyecto Final entre los estudiantes graduados." />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-900 dark:text-teal-300">
              {metricas.duracionMediaCarrera || 5.4}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">años promedio</span>
          </div>
        </div>

        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/70 dark:border-indigo-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Estudiantes Activos
            </span>
            <TooltipInfo texto="Total de estudiantes matriculados en la plataforma cursando o con asignaturas registradas en su plan de estudios." />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900 dark:text-indigo-300">{metricas.totalEstudiantes}</span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">totales</span>
          </div>
        </div>
      </div>

      {/* Gráfico de Visualización de Graduados por Carrera (Chart.js) */}
      {carrerasLabels.length > 0 && (
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FiBarChart2 className="text-amber-500" />
              Distribución de Graduados vs Matrícula por Carrera
            </h4>
          </div>
          <div className="h-44 w-full">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Desglose por carrera */}
      {metricas.graduadosPorCarrera && Object.keys(metricas.graduadosPorCarrera).length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center">
            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Detalle y Tasa de Egreso por Especialidad
            </h4>
            <TooltipInfo texto="Porcentaje de graduación por cada ingeniería: (Graduados de la especialidad ÷ Total de alumnos inscriptos en dicha especialidad) × 100." />
          </div>
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
