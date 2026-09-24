import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FiTrendingUp, FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiUserCheck, FiSliders } from 'react-icons/fi';

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

const ProyeccionGraduacion = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado del simulador interactivo (ritmo simulado: materias por cuatrimestre)
  const [ritmoSimulado, setRitmoSimulado] = useState(2);

  useEffect(() => {
    const fetchProyeccion = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const res = await axios.get(`${apiUrl}/progreso/proyeccion-graduacion`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
        if (res.data.velocidadPorCuatrimestre) {
          const inicial = Math.max(1, Math.min(5, Math.round(res.data.velocidadPorCuatrimestre || 2)));
          setRitmoSimulado(inicial);
        }
      } catch (err) {
        console.error('Error al cargar proyección de graduación:', err);
        setError('No se pudo cargar la proyección de graduación.');
      } finally {
        setCargando(false);
      }
    };

    fetchProyeccion();
  }, []);

  if (cargando) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
        <div className="h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  // Estado Vacío: Cuando el usuario NO tiene registrado anio_ingreso en la BD
  if (!data.tieneAnioIngreso) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 p-7 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-2xl font-bold">
          <FiCalendar />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
            Proyección de Graduación Pendiente
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {data.mensaje || 'Para calcular tu velocidad histórica de aprobación y proyectar tu fecha estimada de egreso, necesitamos tu año de ingreso a la facultad.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/mi-perfil')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border-none"
        >
          <FiUserCheck className="text-sm" />
          Completar año de ingreso en Mi Perfil
        </button>
      </div>
    );
  }

  // Estado: Ya graduado (100% materias aprobadas)
  if (data.esGraduado) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 rounded-3xl border border-emerald-200/90 dark:border-emerald-800/60 p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl font-bold">
            🎓
          </div>
          <div>
            <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-200">
              ¡Plan de Estudios 100% Completado!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Ingresaste en el año {data.anioIngreso} • Carrera finalizada en {data.duracionRealAnios} años
            </p>
          </div>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Has aprobado la totalidad de las {data.totalMaterias} materias correspondientes a tu plan académico. Consulta tu perfil para visualizar tu insignia de Ingeniero/a Graduado/a.
        </p>
      </div>
    );
  }

  // Cálculo en tiempo real para el ritmo simulado por el estudiante
  const materiasPendientes = data.materiasPendientes;
  const cuatrimestresSimulados = Math.max(1, Math.ceil(materiasPendientes / ritmoSimulado));
  const aniosSimulados = Number((cuatrimestresSimulados / 2).toFixed(1));

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;
  const cuatrimestreActual = mesActual <= 7 ? 1 : 2;

  const addAnios = Math.floor((cuatrimestreActual + cuatrimestresSimulados - 1) / 2);
  const finCuat = ((cuatrimestreActual + cuatrimestresSimulados - 1) % 2) + 1;
  const targetAnio = anioActual + addAnios;
  const targetPeriodo = finCuat === 1 ? `Julio ${targetAnio}` : `Diciembre ${targetAnio}`;

  // Datos para gráfico Chart.js de comparación de escenarios
  const simulacionData = data.simulacion || [];
  const chartLabels = simulacionData.map(s => `${s.materiasPorCuatrimestre} mat/cuat`);
  const chartValues = simulacionData.map(s => s.aniosRestantes);

  const barChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Años restantes para recibirse',
        data: chartValues,
        backgroundColor: simulacionData.map(s =>
          s.materiasPorCuatrimestre === ritmoSimulado ? '#4f46e5' : '#e4e4e7'
        ),
        borderColor: simulacionData.map(s =>
          s.materiasPorCuatrimestre === ritmoSimulado ? '#4338ca' : '#d4d4d8'
        ),
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e4e4e7',
        callbacks: {
          label: (ctx) => {
            const index = ctx.dataIndex;
            const item = simulacionData[index];
            return ` ${item.aniosRestantes} años (~${item.cuatrimestresRestantes} cuatrimestres) • Egreso: ${item.fechaEstimada}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Años restantes',
          color: '#71717a',
          font: { size: 10, weight: 'bold' }
        },
        grid: { color: '#f4f4f5' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
            ⏱️
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                Proyección de Tiempo Estimado de Graduación
              </h3>
              <TooltipInfo texto="Calcula tu velocidad histórica = (Materias Aprobadas ÷ Años desde anio_ingreso). Proyecta tu egreso dividiendo las materias restantes por tu ritmo de aprobación." />
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Ingreso: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{data.anioIngreso}</span> ({data.aniosTranscurridos} {data.aniosTranscurridos === 1 ? 'año cursado' : 'años cursados'})
            </p>
          </div>
        </div>

        <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold border border-teal-100 dark:border-teal-900/50">
          Simulador Dinámico
        </span>
      </div>

      {/* Tarjetas KPI de Estado Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Velocidad Histórica
            </span>
            <TooltipInfo texto="Promedio de materias que has aprobado por cada año transcurrido desde tu año de ingreso." />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
              {data.velocidadHistorica}
            </span>
            <span className="text-xs text-zinc-500 font-medium">mat / año</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            ~{data.velocidadPorCuatrimestre} materias por cuatrimestre
          </p>
        </div>

        <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Materias Pendientes
            </span>
            <TooltipInfo texto="Cantidad de materias requeridas por tu plan de estudios que aún no se encuentran en estado 'Aprobada'." />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-900 dark:text-indigo-300">
              {data.materiasPendientes}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">asignaturas</span>
          </div>
          <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80">
            de {data.totalMaterias} materias totales del plan
          </p>
        </div>

        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Egreso Proyectado (Ritmo Actual)
            </span>
            <TooltipInfo texto="Fecha estimada manteniendo tu velocidad histórica actual de aprobación." />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-900 dark:text-emerald-300">
              {data.fechaEstimadaEgreso}
            </span>
          </div>
          <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
            ~{data.aniosRestantes} años restantes ({data.cuatrimestresRestantes} cuatrimestres)
          </p>
        </div>
      </div>

      {/* Simulador Interactivo de Ritmo (US-MET-03) */}
      <div className="p-5 bg-gradient-to-r from-indigo-50/50 via-teal-50/30 to-zinc-50 dark:from-indigo-950/20 dark:via-zinc-800/40 dark:to-zinc-800/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiSliders className="text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Simulador Interactivo de Ritmo Académico
            </h4>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Ajusta el slider para simular cuántas materias planeas aprobar por período
          </span>
        </div>

        {/* Control del Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Ritmo de aprobación propuesto:
            </span>
            <span className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-2xs">
              {ritmoSimulado} {ritmoSimulado === 1 ? 'materia' : 'materias'} por cuatrimestre ({ritmoSimulado * 2} anuales)
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={ritmoSimulado}
            onChange={(e) => setRitmoSimulado(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          <div className="flex justify-between text-[10px] text-zinc-400 font-bold px-1">
            <span>1 mat/cuat (Tranquilo)</span>
            <span>2 mat/cuat (Medio)</span>
            <span>3 mat/cuat (Estándar)</span>
            <span>4 mat/cuat (Intensivo)</span>
            <span>5 mat/cuat (Acelerado)</span>
          </div>
        </div>

        {/* Resultado en tiempo real del escenario simulado */}
        <div className="p-4 bg-white dark:bg-zinc-900/90 rounded-2xl border border-indigo-100/80 dark:border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              Resultado de la simulación
            </span>
            <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
              Si apruebas {ritmoSimulado} {ritmoSimulado === 1 ? 'materia' : 'materias'} por cuatrimestre, te recibirías en:
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {targetPeriodo}
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              ({aniosSimulados} años • {cuatrimestresSimulados} cuatrimestres)
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras Chart.js con Comparativa de Ritmos */}
      {simulacionData.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiTrendingUp className="text-indigo-500" />
              Comparativa de Escenarios de Egreso
            </h4>
            <span className="text-[11px] text-zinc-400">
              Tiempo restante según ritmo de cursado
            </span>
          </div>

          <div className="h-44 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProyeccionGraduacion;
