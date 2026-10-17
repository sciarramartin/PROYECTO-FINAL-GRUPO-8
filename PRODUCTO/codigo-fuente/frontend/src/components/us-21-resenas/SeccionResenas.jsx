import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiStar, FiBook, FiUsers, FiClock, FiChevronRight, 
  FiArrowLeft, FiMessageSquare, FiShield, FiUser, FiInfo 
} from 'react-icons/fi';

const SeccionResenas = () => {
  const [cargando, setCargando] = useState(false);
  const [materias, setMaterias] = useState([]);
  const [cursos, setCursos] = useState([]);
  
  // Navegación por niveles
  const [anioSeleccionado, setAnioSeleccionado] = useState(1);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  // Datos de encuestas de la materia/curso seleccionada
  const [datosEncuesta, setDatosEncuesta] = useState({ promedios: null, encuestas: [], total: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  // 1. Cargar todas las materias al montar el componente
  useEffect(() => {
    const cargarMaterias = async () => {
      try {
        setCargando(true);
        const res = await axios.get(`${API_URL}/materias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterias(res.data || []);
      } catch (err) {
        console.error('Error al cargar materias:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarMaterias();
  }, []);

  // 2. Cargar cursos al seleccionar una materia
  const handleSeleccionarMateria = async (materia) => {
    setMateriaSeleccionada(materia);
    setCursoSeleccionado(null);
    try {
      setCargando(true);
      const resCursos = await axios.get(`${API_URL}/cursos/materia/${materia.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCursos(resCursos.data || []);

      // Cargar encuestas generales de la materia
      await cargarEncuestasMateria(materia.id);
    } catch (err) {
      console.error('Error al obtener cursos o encuestas:', err);
    } finally {
      setCargando(false);
    }
  };

  // 3. Cargar encuestas de la materia seleccionada
  const cargarEncuestasMateria = async (materiaId) => {
    try {
      const res = await axios.get(`${API_URL}/encuestas-catedra/materia/${materiaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatosEncuesta(res.data);
    } catch (err) {
      console.error('Error al cargar encuestas:', err);
      setDatosEncuesta({ promedios: null, encuestas: [], total: 0 });
    }
  };

  const materiasDelAnio = materias.filter(m => (parseInt(m.nivel_anio, 10) || 1) === anioSeleccionado);

  // Filtrar encuestas si hay un curso/comisión seleccionado
  const encuestasFiltradas = cursoSeleccionado 
    ? datosEncuesta.encuestas.filter(e => e.curso === cursoSeleccionado.nombre)
    : datosEncuesta.encuestas;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <span>⭐</span> Métricas y Reseñas de Cátedras
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Consultá la opinión de tus compañeros sobre profesores, exigencia y claridad docente.
          </p>
        </div>

        {/* NAVEGACIÓN BREADCRUMB / BOTÓN VOLVER */}
        {materiaSeleccionada && (
          <button
            onClick={() => {
              if (cursoSeleccionado) {
                setCursoSeleccionado(null);
              } else {
                setMateriaSeleccionada(null);
                setCursos([]);
              }
            }}
            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition border-none cursor-pointer self-start sm:self-auto"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Volver {cursoSeleccionado ? 'a comisiones' : 'a materias'}</span>
          </button>
        )}
      </div>

      {/* VISTA 1: NAVEGACIÓN POR AÑO Y MATERIAS */}
      {!materiaSeleccionada && (
        <div className="space-y-6">
          {/* Selector de Años (1° a 5° Año) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            {[1, 2, 3, 4, 5].map((anio) => (
              <button
                key={anio}
                onClick={() => setAnioSeleccionado(anio)}
                className={`flex-1 min-w-[90px] py-2.5 px-4 rounded-xl text-xs font-extrabold transition cursor-pointer border-none ${
                  anioSeleccionado === anio
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-transparent hover:bg-slate-200/60 text-slate-600'
                }`}
              >
                {anio}° Año
              </button>
            ))}
          </div>

          {/* Grid de Materias */}
          {cargando ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-medium">Cargando materias...</p>
            </div>
          ) : materiasDelAnio.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm font-semibold text-slate-600">No hay materias registradas para este año.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materiasDelAnio.map((materia) => (
                <div
                  key={materia.id}
                  onClick={() => handleSeleccionarMateria(materia)}
                  className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl shadow-2xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                      {materia.nombre}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        {materia.promedio_general && Number(materia.promedio_general) > 0 ? (
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                                <FiStar className="fill-amber-400 w-3.5 h-3.5" />
                                {Number(materia.promedio_general).toFixed(1)}
                            </span>
                        ) : (
                            <span className="text-slate-400 font-medium text-[11px] italic">
                                Sin reseñas
                            </span>
                        )}
                        <span>•</span>
                        <span>{materia.codigo || 'MAT'}</span>
                    </div>
                  </div>
                  <FiChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2 Y 3: DETALLE DE MATERIA, COMISIONES Y OPINIONES */}
      {materiaSeleccionada && (
        <div className="space-y-6">
          
          {/* BANNER DE LA MATERIA SELECCIONADA */}
          <div className="p-5 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 text-indigo-100 px-3 py-1 rounded-full inline-block mb-2">
                {materiaSeleccionada.nivel_anio}° Año • {materiaSeleccionada.codigo}
              </span>
              <h2 className="text-xl md:text-2xl font-black">{materiaSeleccionada.nombre}</h2>
            </div>

            {/* Tarjeta de Promedio Principal */}
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
              <div className="text-amber-300 font-black text-3xl leading-none">
                {datosEncuesta.promedios?.general || '0.0'}
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex items-center gap-1 text-amber-300">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FiStar key={s} className="fill-amber-300 w-3 h-3" />
                  ))}
                </div>
                <p className="text-indigo-100 text-[11px] font-medium">
                  {datosEncuesta.total} {datosEncuesta.total === 1 ? 'reseña' : 'reseñas en total'}
                </p>
              </div>
            </div>
          </div>

          {/* LISTA DE COMISIONES / CURSOS */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-indigo-600" /> Comisiones Disponibles
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setCursoSeleccionado(null)}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer font-sans ${
                  cursoSeleccionado === null
                    ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-extrabold text-xs text-slate-800">Todas</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">Ver general</div>
              </button>

              {cursos.map((c) => {
                const activo = cursoSeleccionado?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCursoSeleccionado(c)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer font-sans ${
                      activo
                        ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-slate-800">{c.nombre}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {c.turno || 'Comisión'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* METRICAS DESGLOSADAS Y RESEÑAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* PANEL IZQUIERDO: DESGLOSE DE MÉTRICAS */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FiInfo className="text-indigo-600 w-4 h-4" /> Desglose de Evaluación
                </h4>

                <div className="space-y-3.5 text-xs">
                  {/* Dificultad */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Dificultad y Exigencia</span>
                      <span className="text-indigo-600">{datosEncuesta.promedios?.dificultad || 0}/5</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((datosEncuesta.promedios?.dificultad || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Claridad Docente */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Claridad Pedagógica</span>
                      <span className="text-indigo-600">{datosEncuesta.promedios?.claridad_docente || 0}/5</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((datosEncuesta.promedios?.claridad_docente || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Disponibilidad */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Disponibilidad Consultas</span>
                      <span className="text-indigo-600">{datosEncuesta.promedios?.disponibilidad || 0}/5</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((datosEncuesta.promedios?.disponibilidad || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL DERECHO: TARJETAS DE OPINIONES / RESEÑAS */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FiMessageSquare className="text-indigo-600 w-4 h-4" /> Opiniones de Estudiantes ({encuestasFiltradas.length})
              </h4>

              {encuestasFiltradas.length === 0 ? (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
                  <p className="text-sm font-bold text-slate-700">Aún no hay reseñas registradas para esta selección.</p>
                  <p className="text-xs text-slate-400">Las opiniones se registran al cambiar el estado académico en el Mapa de Correlatividades.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {encuestasFiltradas.map((resena) => (
                    <div 
                      key={resena.id} 
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3"
                    >
                      {/* Cabecera de la opinión */}
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 overflow-hidden">
                            {resena.autor?.foto_perfil ? (
                              <img src={resena.autor.foto_perfil} alt="Perfil" className="w-full h-full object-cover" />
                            ) : resena.es_anonima ? (
                              <FiShield className="w-4 h-4 text-slate-400" />
                            ) : (
                              <FiUser className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 block leading-tight">
                              {resena.autor?.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {resena.curso ? `Comisión ${resena.curso}` : 'General'} • Cursó como{' '}
                              <strong className={resena.estado_academico === 'Aprobada' ? 'text-emerald-600' : 'text-amber-600'}>
                                {resena.estado_academico || 'Alumno'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Puntuación Promedio de la reseña */}
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-bold">
                          <FiStar className="fill-amber-400 w-3 h-3" />
                          <span>{((resena.dificultad + resena.claridad_docente + resena.disponibilidad) / 3).toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Comentario / Consejo */}
                      {resena.comentario ? (
                        <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                          "{resena.comentario}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Sin comentario escrito.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default SeccionResenas;