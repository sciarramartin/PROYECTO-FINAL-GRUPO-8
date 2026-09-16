import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FiClock, FiCalendar, FiCheckCircle, FiBookOpen, FiAlertCircle, FiSearch, FiFilter } from 'react-icons/fi';

const diasTexto = {
  1: 'Lunes',
  2: 'Martes',
  4: 'Miércoles',
  8: 'Jueves',
  16: 'Viernes',
  32: 'Sábado',
  64: 'Domingo'
};

const interpretarDias = (bitmask) => {
  if (!bitmask) return 'A definir';
  const dias = [];
  Object.keys(diasTexto).forEach((bit) => {
    if ((bitmask & Number(bit)) !== 0) {
      dias.push(diasTexto[bit]);
    }
  });
  return dias.join(', ') || 'A definir';
};

const ModalSeleccionarComision = ({ materia, onConfirmar, onCancelar }) => {
  const [cursos, setCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState('Todos');

  useEffect(() => {
    const fetchCursos = async () => {
      setCargando(true);
      setError('');
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const response = await axios.get(`${apiUrl}/cursos/materia/${materia.id}`);
        const listaCursos = response.data || [];
        setCursos(listaCursos);
        if (listaCursos.length > 0) {
          setCursoSeleccionado(listaCursos[0].id);
        }
      } catch (err) {
        console.error('Error al cargar comisiones:', err);
        setError('No se pudieron obtener las comisiones para esta materia.');
      } finally {
        setCargando(false);
      }
    };

    if (materia?.id) {
      fetchCursos();
    }
  }, [materia]);

  const normalizar = (texto) =>
    texto ? texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((c) => {
      const dias = interpretarDias(c.dias);
      const q = normalizar(busqueda);
      const matchBusqueda =
        !q ||
        normalizar(c.nombre).includes(q) ||
        normalizar(dias).includes(q) ||
        (c.horaInicio && c.horaInicio.includes(q));

      if (!matchBusqueda) return false;

      if (turnoSeleccionado === 'Todos') return true;
      const horaStr = c.horaInicio || '08:00';
      const horaNum = parseInt(horaStr.split(':')[0], 10) || 8;

      if (turnoSeleccionado === 'Mañana') return horaNum < 13;
      if (turnoSeleccionado === 'Tarde') return horaNum >= 13 && horaNum < 18;
      if (turnoSeleccionado === 'Noche') return horaNum >= 18;

      return true;
    });
  }, [cursos, busqueda, turnoSeleccionado]);

  const handleAceptar = () => {
    onConfirmar(cursoSeleccionado);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        {/* Cabecera */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg">
              📚
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Seleccionar Comisión de Cursado
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {materia?.nombre} {materia?.codigo ? `(${materia?.codigo})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelar}
            className="text-slate-400 hover:text-slate-700 text-lg p-1 bg-transparent border-none cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mensaje informativo */}
        <div className="p-3 bg-purple-50/60 border border-purple-100/80 rounded-2xl text-xs text-purple-900 leading-relaxed flex items-start gap-2.5">
          <FiAlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            Al elegir una comisión, la materia se registrará como <strong>Cursando</strong> y sus franjas horarias se sincronizarán automáticamente en tu <strong>Horario Semanal</strong>.
          </span>
        </div>

        {/* Barra de Búsqueda y Filtro de Turno */}
        {cursos.length > 0 && (
          <div className="space-y-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="relative flex items-center">
              <FiSearch className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar por comisión (ej: 4K1), día u hora..."
                className="w-full pl-8.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:border-purple-500 outline-none transition text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="flex items-center justify-between gap-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turno:</span>
              <div className="flex items-center gap-1">
                {['Todos', 'Mañana', 'Tarde', 'Noche'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTurnoSeleccionado(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
                      turnoSeleccionado === t
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lista de comisiones */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {cargando ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Buscando comisiones disponibles...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs text-center">
              {error}
            </div>
          ) : cursos.length === 0 ? (
            <div className="p-5 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-slate-700">No hay comisiones cargadas en el sistema para esta materia.</p>
              <p className="text-[11px] text-slate-400">Podés marcarla como Cursando de forma general.</p>
            </div>
          ) : cursosFiltrados.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-500">No hay comisiones que coincidan con el filtro actual.</p>
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setTurnoSeleccionado('Todos');
                }}
                className="mt-1 text-xs text-purple-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            cursosFiltrados.map((c) => {
              const seleccionado = cursoSeleccionado === c.id;
              const dias = interpretarDias(c.dias);
              const hora = c.horaInicio ? c.horaInicio.slice(0, 5) : '08:00';
              const duracionHs = Math.round((c.duracion || 180) / 60);

              return (
                <div
                  key={c.id}
                  onClick={() => setCursoSeleccionado(c.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    seleccionado
                      ? 'bg-purple-50/80 border-purple-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-800">
                        Comisión {c.nombre}
                      </span>
                      {seleccionado && (
                        <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.2 rounded-full">
                          Seleccionada
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-purple-600" />
                        {dias}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-purple-600" />
                        {hora} hs ({duracionHs} hs)
                      </span>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    seleccionado ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {seleccionado && <span className="text-xs font-bold">✓</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition border-none cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAceptar}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition border-none cursor-pointer flex items-center gap-1.5"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span>Confirmar Cursada</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalSeleccionarComision;
