import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  FiUsers, FiTrendingUp, FiEdit3, FiAlertTriangle,
  FiInfo, FiSave, FiX, FiRefreshCcw
} from 'react-icons/fi';
import {
  Chart as ChartJS, ArcElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const formatoNumero = new Intl.NumberFormat('es-AR');
const formatoPorcentaje = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});
const anioActual = new Date().getFullYear();
const semestreActual = new Date().getMonth() < 6 ? 1 : 2;
const estilosCampo = 'w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-300 dark:border-zinc-700 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500';

function numeroEntero(valor, aceptaCero = false) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && (aceptaCero ? numero >= 0 : numero > 0) ? numero : null;
}

function TooltipInfo({ texto }) {
  return (
    <span className="relative inline-flex items-center group ml-1.5 align-middle select-none">
      <span tabIndex={0} role="note" aria-label={`Información: ${texto}`}
        className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[9px] font-black transition-all group-hover:scale-110 group-focus-within:scale-110 opacity-75 group-hover:opacity-100 group-focus-within:opacity-100 cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500">
        !
      </span>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[calc(100vw-2rem)] p-3 bg-zinc-900 dark:bg-zinc-800 text-white text-[11px] normal-case font-normal tracking-normal leading-relaxed rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50 border border-zinc-700">
        {texto}
      </span>
    </span>
  );
}

function Barra({ tasa, advertencia = false }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700" role="progressbar"
      aria-valuenow={Math.min(Math.max(tasa ?? 0, 0), 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all ${advertencia ? 'bg-amber-500' : 'bg-indigo-500'}`}
        style={{ width: `${Math.min(Math.max(tasa ?? 0, 0), 100)}%` }} />
    </div>
  );
}

// Cada referencia es el TOTAL de estudiantes académicamente activos de ESE semestre.
// No se suma con referencias previas. Si se actualiza un semestre, prevalece la revisión más nueva.
function ordenarReferencias(historial = [], referenciaActual = null) {
  const porPeriodo = new Map();
  const registros = [
    ...(Array.isArray(historial) ? historial : []),
    ...(referenciaActual ? [referenciaActual] : [])
  ];

  registros.forEach((registro, indice) => {
    const anio = numeroEntero(registro.anio);
    const semestre = Number(registro.semestre);
    if (anio === null || ![1, 2].includes(semestre)) return;
    if (anio > anioActual || (anio === anioActual && semestre > semestreActual)) return;

    const fecha = Date.parse(registro.updatedAt || registro.createdAt || registro.fechaRegistro || '') || 0;
    const id = Number(registro.id);
    const candidato = {
      ...registro,
      anio,
      semestre,
      matriculaActiva: numeroEntero(registro.matriculaTotal ?? registro.matriculaActivaEstimada),
      _fecha: fecha,
      _id: Number.isFinite(id) ? id : 0,
      _indice: indice
    };
    const clave = `${anio}-${semestre}`;
    const anterior = porPeriodo.get(clave);
    if (!anterior || candidato._fecha > anterior._fecha ||
      (candidato._fecha === anterior._fecha && candidato._id > anterior._id) ||
      (candidato._fecha === anterior._fecha && candidato._id === anterior._id && indice > anterior._indice)) {
      porPeriodo.set(clave, candidato);
    }
  });

  return [...porPeriodo.values()].sort((a, b) => a.anio - b.anio || a.semestre - b.semestre);
}

function PanelEdicion({ carreras, referencias, onGuardar, onCancelar, guardando, error }) {
  const [anio, setAnio] = useState(String(anioActual));
  const [semestre, setSemestre] = useState(String(semestreActual));
  const [total, setTotal] = useState('');
  const [fuente, setFuente] = useState('');
  const [desglose, setDesglose] = useState(false);
  const [valoresCarrera, setValoresCarrera] = useState({});

  const detalle = carreras.flatMap((c) => {
    const valor = valoresCarrera[c.idCarrera];
    return valor === undefined || valor === '' ? [] : [
      { idCarrera: c.idCarrera, matriculaEstimada: Number(valor) }
    ];
  });
  const suma = detalle.reduce((acc, c) => acc + c.matriculaEstimada, 0);
  const anioNumero = Number(anio);
  const semestreNumero = Number(semestre);
  const valorAnterior = referencias.find((r) => r.anio === anioNumero && r.semestre === semestreNumero)?.matriculaActiva;
  const datosIncorrectos = numeroEntero(total) === null || Number(total) > 100_000_000 ||
    !/^[0-9]{4}$/.test(anio) || anioNumero < 2000 || anioNumero > anioActual ||
    (anioNumero === anioActual && semestreNumero > semestreActual) ||
    (desglose && detalle.some((c) => numeroEntero(c.matriculaEstimada) === null)) ||
    (desglose && suma > Number(total));

  const submit = (event) => {
    event.preventDefault();
    if (datosIncorrectos || guardando) return;
    // Conservamos el contrato del backend: matriculaTotal = alumnos ACTIVOS del período.
    onGuardar({
      anio: anioNumero,
      semestre: semestreNumero,
      matriculaTotal: Number(total),
      fuente: fuente.trim() || null,
      porCarrera: desglose ? detalle : []
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100">Nueva estimación de alumnos activos</h4>
        <button type="button" onClick={onCancelar} aria-label="Cerrar formulario"
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"><FiX /></button>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Ingresá la cantidad total estimada de estudiantes que están cursando en el semestre seleccionado,
        incluidos los que ingresaron en años anteriores.
        <TooltipInfo texto="La matrícula activa es una fotografía del semestre: si estimás 12.000 alumnos en S1 y 12.500 en S2, la referencia de S2 será 12.500, no 24.500. Una nueva estimación no se suma a las anteriores." />
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Año académico
          <input type="number" min="2000" max={anioActual} step="1" required value={anio}
            onChange={(e) => setAnio(e.target.value)} className={estilosCampo} />
        </label>
        <label className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Semestre
          <select value={semestre} onChange={(e) => setSemestre(e.target.value)} className={estilosCampo}>
            <option value="1">1.er semestre</option><option value="2">2.º semestre</option>
          </select>
        </label>
        <label className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Alumnos activos estimados
          <TooltipInfo texto="Indicá el total de estudiantes académicamente activos durante ese semestre, no solo los nuevos ingresantes. Incluí las cohortes anteriores que siguen cursando y excluí egresados, bajas y abandonos estimados." />
          <input type="number" min="1" max="100000000" step="1" required value={total}
            onChange={(e) => setTotal(e.target.value)} placeholder="Ej.: 12000" className={estilosCampo} />
        </label>
      </div>
      {valorAnterior != null && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Ya existe una referencia para {anio} S{semestre}: {formatoNumero.format(valorAnterior)} alumnos activos.
          La nueva carga de ese mismo período debe reemplazar el dato anterior, no duplicarlo.
        </p>
      )}
      <label className="block space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
        Fuente de estimación (opcional)
        <input type="text" maxLength="300" value={fuente} onChange={(e) => setFuente(e.target.value)}
          placeholder="Ej.: Matrícula activa UTN FRC 2026" className={estilosCampo} />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        <input type="checkbox" checked={desglose} onChange={(e) => setDesglose(e.target.checked)}
          className="h-4 w-4 accent-indigo-600" />
        Desglosar alumnos activos por carrera (opcional)
        <TooltipInfo texto="Cada valor corresponde al total de estudiantes activos de esa carrera en el semestre, no a los nuevos ingresantes. La suma de los valores ingresados no puede exceder el total institucional." />
      </label>
      {desglose && (
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-zinc-200 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Podés completar solo las carreras para las que exista una estimación confiable.</p>
          {carreras.map((c) => (
            <label key={c.idCarrera} className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span className="min-w-0 flex-1">{c.nombre}</span>
              <input type="number" min="1" max="100000000" step="1" placeholder="Sin referencia"
                value={valoresCarrera[c.idCarrera] ?? ''}
                onChange={(e) => setValoresCarrera((prev) => ({ ...prev, [c.idCarrera]: e.target.value }))}
                className={`${estilosCampo} w-40`} />
            </label>
          ))}
          <p className={`text-xs font-semibold ${suma > Number(total) ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
            Suma por carrera: {formatoNumero.format(suma)} / {formatoNumero.format(Number(total) || 0)} alumnos activos
          </p>
        </div>
      )}
      {error && <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancelar} className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancelar</button>
        <button type="submit" disabled={datosIncorrectos || guardando}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
          <FiSave /> {guardando ? 'Guardando...' : 'Guardar estimación'}
        </button>
      </div>
    </form>
  );
}

export default function TasaPenetracionInstitucional() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorGuardar, setErrorGuardar] = useState('');
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [carreraCohorte, setCarreraCohorte] = useState('todas');

  const obtenerDatos = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await axios.get(`${API_URL}/captacion`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDatos(response.data);
    setError('');
  }, []);

  useEffect(() => {
    let montado = true;
    async function cargar() {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_URL}/captacion`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (montado) setDatos(response.data);
      } catch (_) {
        if (montado) setError('No se pudieron cargar las métricas institucionales.');
      } finally {
        if (montado) setCargando(false);
      }
    }
    cargar();
    return () => { montado = false; };
  }, []);

  const guardar = async (payload) => {
    setGuardando(true);
    setErrorGuardar('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(`${API_URL}/captacion/referencias`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await obtenerDatos();
      setEditando(false);
    } catch (err) {
      setErrorGuardar(err.response?.data?.error || 'No se pudo guardar la estimación.');
    } finally {
      setGuardando(false);
    }
  };

  const referencias = useMemo(() => ordenarReferencias(datos?.historial, datos?.referencia),
    [datos?.historial, datos?.referencia]);
  // La última referencia de cada año es su matrícula activa estimada (S2 si existe; si no, S1).
  const referenciaPorAnio = useMemo(() => {
    const mapa = new Map();
    referencias.forEach((r) => mapa.set(r.anio, r));
    return mapa;
  }, [referencias]);

  const referenciaActual = referencias[referencias.length - 1] ?? null;
  const matriculaActiva = referenciaActual?.matriculaActiva ?? null;
  const usuariosActuales = numeroEntero(datos?.usuariosRegistrados, true) ?? 0;
  const tasa = matriculaActiva ? (usuariosActuales / matriculaActiva) * 100 : null;
  const superaTotal = tasa !== null && tasa > 100;
  const nombreConteo = 'Estudiantes con cuenta';

  // anio_ingreso es el AÑO ACADÉMICO del estudiante, no el año en que creó su cuenta.
  // Se compara cada cohorte actual con la referencia activa del año correspondiente,
  // NO con el total de usuarios de hoy ni con una suma de matrículas de distintos años.
  const datosPorAnio = useMemo(() => {
    const cuentasPorAnio = new Map();
    (datos?.porAnioIngreso || []).forEach((c) => {
      const anio = numeroEntero(c.anioIngreso);
      const cuentas = numeroEntero(c.usuariosRegistrados, true);
      if (anio !== null && cuentas !== null) {
        cuentasPorAnio.set(anio, (cuentasPorAnio.get(anio) || 0) + cuentas);
      }
    });
    return [...referenciaPorAnio.values()].map((r) => {
      const cuentas = cuentasPorAnio.get(r.anio) || 0;
      return {
        anio: r.anio,
        semestre: r.semestre,
        matriculaActiva: r.matriculaActiva,
        cuentas,
        tasa: r.matriculaActiva ? (cuentas / r.matriculaActiva) * 100 : null
      };
    });
  }, [datos?.porAnioIngreso, referenciaPorAnio]);

  const faltanEstimaciones = useMemo(() => (datos?.porAnioIngreso || [])
    .filter((c) => numeroEntero(c.anioIngreso) !== null && numeroEntero(c.usuariosRegistrados, true) > 0)
    .map((c) => Number(c.anioIngreso))
    .filter((anio) => anio <= anioActual && !referenciaPorAnio.has(anio))
    .sort((a, b) => a - b), [datos?.porAnioIngreso, referenciaPorAnio]);

  const carreraElegida = (datos?.porCarrera || []).find((c) => String(c.idCarrera) === carreraCohorte);
  const cohortesVisibles = carreraElegida ? (carreraElegida.porAnioIngreso || []) : (datos?.porAnioIngreso || []);

  const graficoDona = useMemo(() => {
    if (!matriculaActiva) return null;
    const captados = Math.min(usuariosActuales, matriculaActiva);
    return {
      labels: ['Estudiantes con cuenta', 'Matrícula activa estimada sin cuenta'],
      datasets: [{
        data: [captados, Math.max(0, matriculaActiva - captados)],
        backgroundColor: ['#6366f1', '#e4e4e7'], borderWidth: 0, hoverOffset: 3
      }]
    };
  }, [matriculaActiva, usuariosActuales]);

  const graficoHistorico = useMemo(() => ({
    labels: datosPorAnio.map((r) => String(r.anio)),
    datasets: [{
      label: 'Cuentas por año de ingreso / matrícula estimada de ese año',
      data: datosPorAnio.map((r) => r.tasa),
      borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.10)',
      pointBackgroundColor: '#6366f1', pointRadius: 4,
      tension: 0.28, fill: true, spanGaps: false
    }]
  }), [datosPorAnio]);
  const cantidadPuntosHistoricos = datosPorAnio.filter((r) => r.tasa !== null).length;

  if (cargando) {
    return <div className="animate-pulse space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="h-5 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-44 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50" />
    </div>;
  }

  return (
    <section className="space-y-5 rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800/90 dark:bg-zinc-900"
      aria-labelledby="titulo-captacion">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <FiTrendingUp size={20} />
          </div>
          <div>
            <h3 id="titulo-captacion" className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
              Tasa de Captación Institucional
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cuentas registradas / alumnos activos estimados
              <TooltipInfo texto="Indicador actual: cuentas existentes de estudiantes divididas por la última estimación de matrícula académicamente activa. Las referencias semestrales NO se acumulan." />
            </p>
          </div>
        </div>
        {datos?.puedeEditar && (
          <button type="button" onClick={() => { setEditando((v) => !v); setErrorGuardar(''); }}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
            <FiEdit3 /> {editando ? 'Ocultar formulario' : 'Nueva estimación'}
          </button>
        )}
      </div>

      {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <FiAlertTriangle /> {error}
        <button type="button" className="inline-flex items-center gap-1 font-semibold underline"
          onClick={() => obtenerDatos().catch(() => setError('No se pudieron cargar las métricas institucionales.'))}>
          <FiRefreshCcw /> Reintentar
        </button>
      </div>}

      {editando && datos?.puedeEditar && (
        <PanelEdicion carreras={datos.porCarrera || []} referencias={referencias}
          onGuardar={guardar} onCancelar={() => setEditando(false)}
          guardando={guardando} error={errorGuardar} />
      )}

      {!error && !matriculaActiva && (
        <div className="space-y-2 rounded-2xl border border-dashed border-zinc-300 p-5 text-center dark:border-zinc-700">
          <FiInfo className="mx-auto text-xl text-zinc-400" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Todavía no hay una estimación válida de alumnos activos.</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Un administrador debe registrar el total estimado de estudiantes activos de un semestre.</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{nombreConteo} actuales: {formatoNumero.format(usuariosActuales)}</p>
        </div>
      )}

      {!error && matriculaActiva && (
        <>
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="relative mx-auto h-44 w-44">
                <Doughnut data={graficoDona} options={{ responsive: true, maintainAspectRatio: false,
                  cutout: '77%', plugins: { legend: { display: false }, tooltip: { enabled: true } } }} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${superaTotal ? 'text-amber-600' : 'text-zinc-900 dark:text-white'}`}>
                    {formatoPorcentaje.format(tasa)}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Captación</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 md:col-span-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300"><FiUsers /> {nombreConteo}
                    <TooltipInfo texto="Cuentas existentes con rol estudiante, incluidas las que no iniciaron sesión recientemente." />
                  </span>
                  <strong className="mt-1 block text-2xl font-black text-indigo-900 dark:text-indigo-100">{formatoNumero.format(usuariosActuales)}</strong>
                </div>
                <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Alumnos activos estimados
                    <TooltipInfo texto="Total estimado de estudiantes académicamente activos de la última referencia disponible. Se utiliza solo este valor, no la suma de años o semestres." />
                  </span>
                  <strong className="mt-1 block text-2xl font-black text-zinc-900 dark:text-zinc-100">{formatoNumero.format(matriculaActiva)}</strong>
                </div>
              </div>
              <Barra tasa={tasa} advertencia={superaTotal} />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Fórmula actual: (cuentas de estudiantes / matrícula activa estimada del {referenciaActual.anio} S{referenciaActual.semestre}) × 100.
                Cada referencia semestral representa un total independiente.
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                El numerador incluye cuentas sin actividad reciente y posiblemente de estudiantes que ya no cursan.
              </p>
              {superaTotal && <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                <FiAlertTriangle className="mt-0.5 shrink-0" />
                La tasa supera el 100%. Revisá la estimación activa y si existen cuentas de alumnos que ya egresaron o dejaron de cursar.
              </p>}
              {faltanEstimaciones.length > 0 && <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                <FiAlertTriangle className="mt-0.5 shrink-0" />
                No hay referencia de matrícula para estas cohortes académicas: {faltanEstimaciones.join(', ')}.
                No podrán calcularse sus porcentajes en el gráfico por año.
              </p>}
            </div>
          </div>

          {(datos.porDepartamento || []).length > 0 && (
            <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Cuentas por departamento</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {datos.porDepartamento.map((d) => (
                  <div key={d.departamento} className="space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{d.departamento}</span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {formatoNumero.format(d.usuariosRegistrados || 0)} cuentas registradas.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Captación por año de ingreso académico
                <TooltipInfo texto="Cada año muestra: cuentas existentes de estudiantes cuyo Usuario.anio_ingreso coincide con ese año / matrícula activa estimada de ese año (último semestre disponible). No usa snapshots ni acumula estimaciones semestrales." />
              </h4>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Cuentas actuales de cada cohorte / matrícula activa estimada de ese año</span>
            </div>
            {cantidadPuntosHistoricos >= 2 ? (
              <div className="h-52 w-full">
                <Line data={graficoHistorico} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { callbacks: {
                    label: (context) => ` Captación: ${formatoPorcentaje.format(context.parsed.y)}%`,
                    afterBody: (items) => {
                      const periodo = datosPorAnio[items[0]?.dataIndex];
                      return periodo ? [
                        `Cuentas actuales con ingreso ${periodo.anio}: ${formatoNumero.format(periodo.cuentas)}`,
                        `Matrícula activa de ${periodo.anio} S${periodo.semestre}: ${formatoNumero.format(periodo.matriculaActiva)}`
                      ] : [];
                    }
                  } } },
                  scales: { y: { beginAtZero: true, ticks: { callback: (v) => `${v}%` } } }
                }} />
              </div>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Se necesitan al menos dos años con una estimación de matrícula activa válida para mostrar la evolución.
              </p>
            )}
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
                  <tr>
                    <th className="px-3 py-2">Año</th>
                    <th className="px-3 py-2 text-right">Semestre de referencia
                      <TooltipInfo texto="Para cada año se utiliza la última estimación de matrícula activa disponible, priorizando S2 sobre S1." />
                    </th>
                    <th className="px-3 py-2 text-right">Matrícula activa estimada
                      <TooltipInfo texto="Total de estudiantes activos durante el semestre elegido. Nunca se suma con otras estimaciones." />
                    </th>
                    <th className="px-3 py-2 text-right">Cuentas de esa cohorte
                      <TooltipInfo texto="Cuentas actuales con Usuario.anio_ingreso igual al año de la fila. No son altas realizadas necesariamente en ese año." />
                    </th>
                    <th className="px-3 py-2 text-right">Proporción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {datosPorAnio.map((r) => (
                    <tr key={r.anio} className="text-zinc-700 dark:text-zinc-300">
                      <td className="px-3 py-2">{r.anio}</td>
                      <td className="px-3 py-2 text-right">S{r.semestre}</td>
                      <td className="px-3 py-2 text-right">{r.matriculaActiva == null ? 'Sin referencia válida' : formatoNumero.format(r.matriculaActiva)}</td>
                      <td className="px-3 py-2 text-right">{formatoNumero.format(r.cuentas)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{r.tasa == null ? '—' : `${formatoPorcentaje.format(r.tasa)}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!error && datos && (
        <div className="space-y-4 border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Cuentas por año de ingreso académico
              </h4>
            </div>
            <TooltipInfo texto="Esta distribución muestra el porcentaje de cuentas actuales que corresponde a cada año de ingreso académico; no es la tasa de captación sobre la matrícula." />
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Carrera
              <select className={`${estilosCampo} mt-1 min-w-48`}
                value={carreraCohorte} onChange={(e) => setCarreraCohorte(e.target.value)}>
                <option value="todas">Todas las carreras</option>
                {(datos.porCarrera || []).map((c) => <option key={c.idCarrera} value={String(c.idCarrera)}>{c.nombre}</option>)}
              </select>
            </label>
          </div>
          {cohortesVisibles.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {cohortesVisibles.map((c) => (
                <div key={c.anioIngreso ?? 'sin-anio'} className="space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-xs text-zinc-800 dark:text-zinc-200">{c.anioIngreso ?? 'Año sin informar'}</strong>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      {formatoNumero.format(c.usuariosRegistrados)} · {formatoPorcentaje.format(c.participacionUsuarios ?? 0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                    aria-label={`Distribución de cuentas: ${formatoPorcentaje.format(c.participacionUsuarios ?? 0)}%`}>
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, Math.max(0, c.participacionUsuarios ?? 0))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-500 dark:text-zinc-400">No hay estudiantes con cuenta en el grupo seleccionado.</p>}
        </div>
      )}
    </section>
  );
}
