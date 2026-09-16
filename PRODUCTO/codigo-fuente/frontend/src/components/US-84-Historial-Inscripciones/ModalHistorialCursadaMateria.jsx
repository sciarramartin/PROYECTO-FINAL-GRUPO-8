import { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiUsers, FiClock, FiAlertCircle, FiFilter, FiCalendar, FiRefreshCw } from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ModalHistorialCursadaMateria = ({ materia, onClose }) => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchEstadisticas = async (desde = fechaDesde, hasta = fechaHasta) => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

      const params = new URLSearchParams();
      if (desde) params.append("fechaDesde", desde);
      if (hasta) params.append("fechaHasta", hasta);

      const response = await axios.get(`${apiUrl}/materias/${materia.id}/estadisticas-inscripciones?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstadisticas(response.data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
      setError("No se pudieron cargar las estadísticas de esta materia.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [materia.id]);

  const aplicarFiltro = (e) => {
    if (e) e.preventDefault();
    fetchEstadisticas(fechaDesde, fechaHasta);
  };

  const limpiarFiltro = () => {
    setFechaDesde("");
    setFechaHasta("");
    fetchEstadisticas("", "");
  };

  // Evitar scroll cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Configuración de Chart.js
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#a1a1aa',
          usePointStyle: true,
          font: { size: 11, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717a',
          font: { size: 11 }
        }
      },
      y: {
        border: { display: false },
        grid: {
          color: '#f4f4f5',
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 11 },
          stepSize: 1
        }
      }
    }
  };

  const chartDataComisiones = {
    labels: estadisticas?.porComision.map(c => c.comision) || [],
    datasets: [
      {
        label: 'Inscriptos',
        data: estadisticas?.porComision.map(c => c.cantidad) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo-500
        hoverBackgroundColor: 'rgba(79, 70, 229, 1)', // indigo-600
        borderRadius: 6,
      },
      {
        label: 'Recursados',
        data: estadisticas?.porComision.map(c => c.recursados) || [],
        backgroundColor: 'rgba(244, 63, 94, 0.8)', // rose-500
        hoverBackgroundColor: 'rgba(225, 29, 72, 1)', // rose-600
        borderRadius: 6,
      }
    ],
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">{materia.codigo}</span> - {materia.nombre}
            </h2>
            <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">
              Estadísticas históricas de inscripciones
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900 transition-colors shadow-sm cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="animate-spin text-3xl text-indigo-600">⌛</span>
              <p className="text-sm font-medium text-zinc-500">Recopilando estadísticas históricas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-2xl">
              <FiAlertCircle className="w-10 h-10" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Tarjetas de Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 flex items-center gap-5">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiUsers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-wider mb-1">
                      Inscripciones Totales
                    </p>
                    <p className="text-3xl font-black text-indigo-700 dark:text-indigo-300">
                      {estadisticas.total}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-5 flex items-center gap-5">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiClock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1">
                      Comisiones Activas
                    </p>
                    <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                      {estadisticas.porComision.length}
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-5 flex items-center gap-5">
                  <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                    <FiRefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-wider mb-1">
                      Recursados Totales
                    </p>
                    <p className="text-3xl font-black text-rose-700 dark:text-rose-300">
                      {estadisticas.totalRecursados}
                    </p>
                  </div>
                </div>
              </div>


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Comisiones */}
                {estadisticas.total > 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Distribución por Comisión
                    </h3>
                    <div className="h-64">
                      <Bar data={chartDataComisiones} options={chartOptions} />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">No hay registros de inscripciones para esta materia todavía.</p>
                  </div>
                )}
                {/* Filtro por Fechas */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col">
                  <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
                    <FiFilter className="text-indigo-500" />
                    Filtro por Fechas
                  </h3>

                  <form onSubmit={aplicarFiltro} className="flex-1 flex flex-col justify-center gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Fecha Desde
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <FiCalendar className="w-4 h-4" />
                        </span>
                        <input
                          type="date"
                          value={fechaDesde}
                          onChange={(e) => setFechaDesde(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-indigo-500 outline-none transition text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Fecha Hasta
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <FiCalendar className="w-4 h-4" />
                        </span>
                        <input
                          type="date"
                          value={fechaHasta}
                          onChange={(e) => setFechaHasta(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:border-indigo-500 outline-none transition text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={limpiarFiltro}
                        className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                      >
                        Limpiar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                      >
                        Aplicar Filtro
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialCursadaMateria;
