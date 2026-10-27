import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FiFolder,
  FiDownload,
  FiTrendingUp,
  FiMessageSquare,
  FiCpu,
  FiRefreshCw,
  FiDownloadCloud,
  FiHardDrive,
  FiActivity,
  FiShield,
  FiCalendar,
  FiInfo,
  FiSearch,
  FiArrowUpRight,
  FiPieChart,
  FiCheckCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { BsChatRightDots } from 'react-icons/bs';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TooltipBadge = ({ texto }) => (
  <span className="relative inline-flex items-center group cursor-pointer ml-1.5 align-middle select-none">
    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-400 transition-all">
      ?
    </span>
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 dark:bg-slate-800 text-slate-100 text-[11px] leading-relaxed rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 border border-slate-700">
      {texto}
    </span>
  </span>
);

const MetricasGlobalesPlataforma = () => {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [esAdmin, setEsAdmin] = useState(true);
  const [rangoMeses, setRangoMeses] = useState('12');
  const [vistaActiva, setVistaActiva] = useState('almacenamiento'); // 'almacenamiento' | 'social_ia' | 'distribucion'
  const [filtroTabla, setFiltroTabla] = useState('');
  const [actualizando, setActualizando] = useState(false);

  const navigate = useNavigate();

  // Detectar tema oscuro
  const [esOscuro, setEsOscuro] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setEsOscuro(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Verificar rol de usuario
  useEffect(() => {
    try {
      const usuarioStr = localStorage.getItem('usuario') || sessionStorage.getItem('usuario');
      if (usuarioStr && usuarioStr !== 'undefined') {
        const u = JSON.parse(usuarioStr);
        if (u.id_tipo_usuario !== 3) {
          setEsAdmin(false);
        }
      }
    } catch (e) {
      console.warn('Error leyendo rol de usuario:', e);
    }
  }, []);

  const cargarDatos = async (mostrarSpinner = true) => {
    if (mostrarSpinner) setCargando(true);
    setActualizando(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      const res = await axios.get(`${apiUrl}/metricas-globales?meses=${rangoMeses}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setMetricas(res.data);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      console.error('Error al cargar métricas globales:', err);
      if (err.response?.status === 403) {
        setEsAdmin(false);
      } else {
        setError(err.response?.data?.detalle || err.response?.data?.error || err.message || 'Error al conectar con el servidor.');
      }
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos(true);
  }, [rangoMeses]);

  // Exportar auditoría a CSV
  const exportarAuditoriaCSV = () => {
    if (!metricas || !metricas.evolucionMensual) return;

    const encabezados = [
      'Periodo',
      'Mes',
      'Archivos Nuevos',
      'Almacenamiento Mes (MB)',
      'Almacenamiento Acumulado (MB)',
      'Almacenamiento Acumulado (GB)',
      'Descargas Mes',
      'Descargas Acumuladas',
      'Publicaciones Foros',
      'Comentarios Foros',
      'Total Actividad Social',
      'Consultas Asistente IA',
      '% Crecimiento Almacenamiento'
    ];

    const filas = metricas.evolucionMensual.map(m => [
      m.periodo,
      `"${m.mesLabel}"`,
      m.archivosNuevos,
      m.almacenamientoMesMB,
      m.almacenamientoAcumuladoMB,
      m.almacenamientoAcumuladoGB,
      m.descargasMes,
      m.descargasAcumuladas,
      m.publicaciones,
      m.comentarios,
      m.actividadSocial,
      m.consultasIA,
      `${m.crecimientoAlmacenamientoPct}%`
    ]);

    const contenidoCSV = [
      encabezados.join(';'),
      ...filas.map(f => f.join(';'))
    ].join('\r\n');

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `auditoria_metricas_globales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado de tabla mensual
  const listaMensualFiltrada = useMemo(() => {
    if (!metricas?.evolucionMensual) return [];
    if (!filtroTabla.trim()) return metricas.evolucionMensual;
    const q = filtroTabla.toLowerCase().trim();
    return metricas.evolucionMensual.filter(m =>
      m.periodo.toLowerCase().includes(q) ||
      m.mesLabel.toLowerCase().includes(q)
    );
  }, [metricas, filtroTabla]);

  // Estilos y paletas para ChartJS adaptados a Light y Dark mode
  const gridColor = esOscuro ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';
  const textColor = esOscuro ? '#94a3b8' : '#64748b';

  // Gráfico 1: Evolución del Almacenamiento (MB y GB)
  const chartDataAlmacenamiento = useMemo(() => {
    if (!metricas?.evolucionMensual) return null;
    const labels = metricas.evolucionMensual.map(m => m.mesLabel);

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Almacenamiento Acumulado (MB)',
          data: metricas.evolucionMensual.map(m => m.almacenamientoAcumuladoMB),
          borderColor: '#6366f1', // Indigo
          backgroundColor: esOscuro ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: esOscuro ? '#0f172a' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Almacenamiento Nuevo del Mes (MB)',
          data: metricas.evolucionMensual.map(m => m.almacenamientoMesMB),
          backgroundColor: esOscuro ? 'rgba(56, 189, 248, 0.65)' : 'rgba(14, 165, 233, 0.75)',
          borderRadius: 6,
          barThickness: 22,
          yAxisID: 'y'
        }
      ]
    };
  }, [metricas, esOscuro]);

  // Gráfico 2: Actividad Social y Consultas IA
  const chartDataSocialIA = useMemo(() => {
    if (!metricas?.evolucionMensual) return null;
    const labels = metricas.evolucionMensual.map(m => m.mesLabel);

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Consultas Asistente IA',
          data: metricas.evolucionMensual.map(m => m.consultasIA),
          borderColor: '#a855f7', // Purple
          backgroundColor: '#a855f7',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 5,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Actividad Social (Posts + Comentarios)',
          data: metricas.evolucionMensual.map(m => m.actividadSocial),
          borderColor: '#f59e0b', // Amber
          backgroundColor: '#f59e0b',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 5,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Descargas de la Comunidad',
          data: metricas.evolucionMensual.map(m => m.descargasMes),
          backgroundColor: esOscuro ? 'rgba(16, 185, 129, 0.6)' : 'rgba(16, 185, 129, 0.75)',
          borderRadius: 6,
          barThickness: 18,
          yAxisID: 'y1'
        }
      ]
    };
  }, [metricas, esOscuro]);

  // Gráfico 3: Distribución Proporcional de Recursos
  const chartDataDoughnut = useMemo(() => {
    if (!metricas?.resumen) return null;
    return {
      labels: ['Archivos Repositorio', 'Descargas', 'Publicaciones', 'Comentarios', 'Consultas IA'],
      datasets: [
        {
          data: [
            metricas.resumen.totalArchivos,
            metricas.resumen.totalDescargas,
            metricas.resumen.totalPublicaciones,
            metricas.resumen.totalComentarios,
            metricas.resumen.totalConsultasIA
          ],
          backgroundColor: [
            '#6366f1', // Indigo
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#f97316', // Orange
            '#a855f7'  // Purple
          ],
          borderWidth: 2,
          borderColor: esOscuro ? '#0f172a' : '#ffffff'
        }
      ]
    };
  }, [metricas, esOscuro]);

  const chartOptionsCommon = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
          font: { weight: 'bold', size: 12 },
          boxWidth: 14,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: esOscuro ? '#0f172a' : '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        borderRadius: 10,
        borderColor: esOscuro ? '#334155' : '#475569',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { weight: '600' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor },
        title: {
          display: true,
          text: 'Volumen',
          color: textColor,
          font: { size: 11, weight: 'bold' }
        }
      }
    }
  };

  const chartOptionsDualAxis = {
    ...chartOptionsCommon,
    scales: {
      ...chartOptionsCommon.scales,
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#10b981' },
        title: {
          display: true,
          text: 'Descargas',
          color: '#10b981',
          font: { size: 11, weight: 'bold' }
        }
      }
    }
  };

  // Manejo de Acceso Restringido para no-administradores
  if (!esAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl">
            <FiShield />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Acceso Restringido a Administradores
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            El panel de <strong>Métricas Globales de Plataforma</strong> y auditoría de volumen de tráfico e infraestructura está reservado exclusivamente para administradores del campus virtual.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Regresar al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* ========================================================================= */}
      {/* 1. ENCABEZADO INSTITUCIONAL & CONTROLES DE AUDITORÍA                     */}
      {/* ========================================================================= */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1.5">
              <FiShield className="w-3.5 h-3.5" />
              Panel de Administración
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
              <FiActivity className="w-3.5 h-3.5" />
              Auditoría en Tiempo Real
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Volumen Global de Tráfico y Documentos
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Auditoría de demanda de infraestructura, volumen de almacenamiento documental, descargas acumuladas de la comunidad y consultas académicas resueltas por el Asistente IA.
          </p>
        </div>

        {/* Acciones del Administrador */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de periodo */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <label htmlFor="select-rango" className="sr-only">Rango temporal de auditoría</label>
            <select
              id="select-rango"
              value={rangoMeses}
              onChange={(e) => setRangoMeses(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
            >
              <option value="6" className="dark:bg-slate-900">Últimos 6 Meses</option>
              <option value="12" className="dark:bg-slate-900">Año 2026 (12 Meses)</option>
              <option value="24" className="dark:bg-slate-900">Histórico Completo</option>
            </select>
          </div>

          {/* Botón Refrescar */}
          <button
            onClick={() => cargarDatos(false)}
            disabled={actualizando}
            aria-label="Actualizar métricas"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{actualizando ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          {/* Botón Exportar Auditoría */}
          <button
            onClick={exportarAuditoriaCSV}
            aria-label="Exportar reporte CSV"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <FiDownloadCloud className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </header>

      {/* Mensaje de Error si ocurre */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-sm">
          <FiAlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="flex-1 font-medium">{error}</p>
          <button
            onClick={() => cargarDatos(true)}
            className="underline font-bold hover:text-amber-950 dark:hover:text-amber-100"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LAS 4 TARJETAS PRINCIPALES (CRITERIOS DE ACEPTACIÓN)                     */}
      {/* ========================================================================= */}
      <section aria-labelledby="kpis-title">
        <h2 id="kpis-title" className="sr-only">Indicadores Clave de la Plataforma</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* TARJETA 1: TOTAL DE ARCHIVOS EN REPOSITORIO */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center">
                Archivos en Repositorio
                <TooltipBadge texto="Total consolidado de documentos académicos (apuntes, resúmenes, guías) subidos al repositorio del campus." />
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                <FiFolder />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {cargando ? (
                  <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ) : (
                  metricas?.resumen?.totalArchivos ?? 0
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <FiHardDrive className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {metricas?.resumen?.almacenamientoTotalMB ?? '0'} MB en disco
                  ({metricas?.resumen?.almacenamientoTotalGB ?? '0'} GB)
                </span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Promedio: <strong>{metricas?.resumen?.promedioTamanoArchivoMB ?? '0'} MB</strong>/doc</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Infraestructura</span>
            </div>
          </div>

          {/* TARJETA 2: TOTAL DE DESCARGAS DE LA COMUNIDAD */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center">
                Descargas Comunidad
                <TooltipBadge texto="Cantidad acumulada de descargas de material académico efectuadas por estudiantes de todas las carreras." />
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
                <FiDownload />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {cargando ? (
                  <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ) : (
                  (metricas?.resumen?.totalDescargas ?? 0).toLocaleString()
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <FiTrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {metricas?.resumen?.promedioDescargasPorArchivo ?? '0'} descargas / archivo
                </span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Demanda de contenido</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tráfico Global</span>
            </div>
          </div>

          {/* TARJETA 3: TOTAL DE PUBLICACIONES/COMENTARIOS EN FOROS */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center">
                Publicaciones & Comentarios
                <TooltipBadge texto="Actividad total en foros de discusión académica, sumando tanto publicaciones iniciales como respuestas y comentarios de debate." />
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                <BsChatRightDots />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {cargando ? (
                  <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ) : (
                  metricas?.resumen?.totalInteraccionesForo ?? 0
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {metricas?.resumen?.totalPublicaciones ?? 0} publicaciones • {metricas?.resumen?.totalComentarios ?? 0} comentarios
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Interacción comunitaria</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">Actividad Social</span>
            </div>
          </div>

          {/* TARJETA 4: TOTAL DE CONSULTAS ACADÉMICAS RESUELTAS POR IA */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center">
                Consultas Resueltas IA
                <TooltipBadge texto="Volumen global de consultas académicas y normativas respondidas con éxito por el Asistente IA fundamentado en el corpus RAG." />
              </span>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
                <RiRobot2Line />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {cargando ? (
                  <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg"></div>
                ) : (
                  (metricas?.resumen?.totalConsultasIA ?? 0).toLocaleString()
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-purple-500" />
                <span>100% asistidas con corpus oficial</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>Ahorro en soporte docente</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">Valor Generado</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. GRÁFICOS INTERACTIVOS DE CRECIMIENTO MENSUAL                            */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FiActivity className="text-indigo-600 dark:text-indigo-400" />
              Auditoría del Crecimiento Mensual
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolución temporal del almacenamiento en repositorio, descargas de la comunidad, publicaciones y consultas de IA.
            </p>
          </div>

          {/* Selector de Pestañas de Gráficos */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setVistaActiva('almacenamiento')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                vistaActiva === 'almacenamiento'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Almacenamiento (MB)
            </button>
            <button
              onClick={() => setVistaActiva('social_ia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                vistaActiva === 'social_ia'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Actividad Social & IA
            </button>
            <button
              onClick={() => setVistaActiva('distribucion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                vistaActiva === 'distribucion'
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Distribución Global
            </button>
          </div>
        </div>

        {/* Contenido del Gráfico según la vista seleccionada */}
        <div className="min-h-[380px]">
          {cargando ? (
            <div className="h-[380px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
          ) : (
            <>
              {vistaActiva === 'almacenamiento' && chartDataAlmacenamiento && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <span>
                      Curva acumulada de espacio en disco (MB) sumado mes a mes por nuevos apuntes y documentos.
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Capacidad actual: <strong>{metricas?.resumen?.almacenamientoTotalMB} MB</strong> (~{metricas?.resumen?.almacenamientoTotalGB} GB)
                    </span>
                  </div>
                  <div className="h-[360px]">
                    <Line data={chartDataAlmacenamiento} options={chartOptionsCommon} />
                  </div>
                </div>
              )}

              {vistaActiva === 'social_ia' && chartDataSocialIA && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                    <span>
                      Correlación de actividad en foros, descargas de estudiantes y consultas al Asistente IA.
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Picos sincronizados con periodos de parciales y exámenes finales.
                    </span>
                  </div>
                  <div className="h-[360px]">
                    <Line data={chartDataSocialIA} options={chartOptionsDualAxis} />
                  </div>
                </div>
              )}

              {vistaActiva === 'distribucion' && chartDataDoughnut && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
                  <div className="h-[320px] flex items-center justify-center">
                    <Doughnut
                      data={chartDataDoughnut}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { weight: 'bold', size: 11 } }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Materias con Mayor Demanda de Material
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cátedras que concentran la mayor cantidad de apuntes compartidos y descargas realizadas por la comunidad estudiantil:
                    </p>
                    <div className="space-y-2.5">
                      {metricas?.topMaterias?.map((mat, idx) => (
                        <div
                          key={mat.id_materia || idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {mat.nombre}
                              </p>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                {mat.codigo}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                              {mat.archivos} docs
                            </span>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              {mat.descargas} descargas
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TABLA DETALLADA DE AUDITORÍA MENSUAL                                    */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <FiCalendar className="text-emerald-600 dark:text-emerald-400" />
              Auditoría Mensual Detallada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desglose mes a mes del crecimiento de almacenamiento, demanda de red y participación en el campus.
            </p>
          </div>

          {/* Filtro de búsqueda en la tabla */}
          <div className="relative min-w-[220px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={filtroTabla}
              onChange={(e) => setFiltroTabla(e.target.value)}
              placeholder="Buscar mes o año..."
              aria-label="Buscar mes o año en tabla"
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Tabla Responsive con Contraste WCAG AA */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 uppercase font-black tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3.5">Periodo</th>
                <th scope="col" className="px-4 py-3.5 text-right">Nuevos Docs</th>
                <th scope="col" className="px-4 py-3.5 text-right">Almacenamiento Mes</th>
                <th scope="col" className="px-4 py-3.5 text-right">Acumulado</th>
                <th scope="col" className="px-4 py-3.5 text-right">Descargas</th>
                <th scope="col" className="px-4 py-3.5 text-right">Posts</th>
                <th scope="col" className="px-4 py-3.5 text-right">Comentarios</th>
                <th scope="col" className="px-4 py-3.5 text-right font-black text-amber-700 dark:text-amber-400">Total Social</th>
                <th scope="col" className="px-4 py-3.5 text-right font-black text-purple-700 dark:text-purple-400">Consultas IA</th>
                <th scope="col" className="px-4 py-3.5 text-right">% Crecimiento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {cargando ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-400">
                    Cargando auditoría mensual...
                  </td>
                </tr>
              ) : listaMensualFiltrada.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-400">
                    No se encontraron registros para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                listaMensualFiltrada.map((item, idx) => (
                  <tr
                    key={item.periodo}
                    className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {item.mesLabel}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                      +{item.archivosNuevos}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-700 dark:text-slate-300">
                      {item.almacenamientoMesMB} MB
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-slate-900 dark:text-slate-100">
                      {item.almacenamientoAcumuladoMB} MB
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {item.descargasMes}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.publicaciones}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {item.comentarios}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/10">
                      {item.actividadSocial}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10">
                      {item.consultasIA}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.crecimientoAlmacenamientoPct > 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        +{item.crecimientoAlmacenamientoPct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MetricasGlobalesPlataforma;
