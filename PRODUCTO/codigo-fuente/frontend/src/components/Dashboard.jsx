import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './Layout';
import MetricaGraduados from './common/MetricaGraduados';
import InsigniaGraduado from './common/InsigniaGraduado';
import { 
  FiGrid, 
  FiBookOpen, 
  FiBarChart2, 
  FiCalendar, 
  FiMessageSquare, 
  FiGitMerge, 
  FiAward, 
  FiArrowRight, 
  FiClock, 
  FiCpu 
} from 'react-icons/fi';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const [usuario, setUsuario] = useState(null);
  const [estadoGraduacion, setEstadoGraduacion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const usuarioStr = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
        if (usuarioStr) {
          setUsuario(JSON.parse(usuarioStr));
        }

        if (token) {
          const gradRes = await axios.get(`${apiUrl}/progreso/estado-graduacion`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEstadoGraduacion(gradRes.data);
        }
      } catch (err) {
        console.error('Error al cargar datos del dashboard:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, [token]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 font-sans">
        
        {/* Banner de Bienvenida y Estado Académico */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">👋</span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Panel de Control Universitario • UTN FRC
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                ¡Hola, {usuario?.nombre || 'Estudiante'}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                Visualizá el rendimiento institucional, consultá métricas de cursado, planificá tus horarios y accedé a la comunidad académica.
              </p>

              {/* Insignia de Graduado o Progreso de Carrera */}
              {estadoGraduacion?.esGraduado ? (
                <div className="pt-2">
                  <InsigniaGraduado className="bg-white/10 text-amber-300 border-amber-400/40 backdrop-blur-xs" />
                </div>
              ) : estadoGraduacion?.porcentaje > 0 ? (
                <div className="pt-2 flex items-center gap-3">
                  <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden backdrop-blur-xs">
                    <div
                      className="bg-emerald-400 h-2 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${estadoGraduacion.porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">
                    {estadoGraduacion.porcentaje}% completado ({estadoGraduacion.materiasAprobadas}/{estadoGraduacion.totalMaterias} materias)
                  </span>
                </div>
              ) : null}
            </div>

            {/* Accesos rápidos en botones */}
            <div className="flex flex-wrap md:flex-col gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/materias')}
                className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-900 font-extrabold rounded-2xl text-xs transition shadow-sm flex items-center gap-2 border-none cursor-pointer"
              >
                <FiBarChart2 className="w-4 h-4 text-indigo-600" />
                <span>Métricas de Materias</span>
              </button>
              <button
                onClick={() => navigate('/foros')}
                className="px-4 py-2.5 bg-indigo-800/60 hover:bg-indigo-700/80 text-white font-bold rounded-2xl text-xs transition border border-indigo-400/30 flex items-center gap-2 cursor-pointer"
              >
                <FiMessageSquare className="w-4 h-4 text-indigo-300" />
                <span>Comunidad & Foros</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sección de Métricas Institucionales (SCRUM-90) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Métricas Institucionales y Tasa de Egreso
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Indicadores generales de retención, egresados y avance en el plan de estudios.
              </p>
            </div>
          </div>

          <MetricaGraduados />
        </section>

        {/* Accesos Modulares y Herramientas Académicas */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Módulos Académicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div
              onClick={() => navigate('/materias')}
              className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  <FiBarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  Métricas por Materia
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tasas de éxito, cursado y recursado histórico por cátedra.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 mt-auto">
                <span>Ver estadísticas</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            <div
              onClick={() => navigate('/mapa-correlatividades')}
              className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  <FiGitMerge className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                  Grafo de Correlativas
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Plan de correlatividades interactivo con inscripción directa a comisiones.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1 mt-auto">
                <span>Explorar grafo</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            <div
              onClick={() => navigate('/Horario')}
              className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  <FiClock className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  Horario Semanal
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Grilla sincronizada con tus comisiones y actividades personales.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1 mt-auto">
                <span>Ver cronograma</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

            <div
              onClick={() => navigate('/foros')}
              className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
                  <FiMessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  Foros de Cátedra
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Feed de consultas, material de estudio y debate estudiantil.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1 mt-auto">
                <span>Ir al feed</span>
                <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
};

export default Dashboard;