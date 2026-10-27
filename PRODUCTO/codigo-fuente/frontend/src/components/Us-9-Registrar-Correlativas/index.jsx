import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GrafoCorrelativas from './GrafoCorrelativas';
import useFocusTrap from '../../hooks/useFocusTrap';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function ModuloCorrelativas() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [selectedCarreraId, setSelectedCarreraId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [creandoPlan, setCreandoPlan] = useState(false);
  const [nuevoPlanNombre, setNuevoPlanNombre] = useState('');

  const focusTrapPlanRef = useFocusTrap(creandoPlan, () => {
    setCreandoPlan(false);
    setNuevoPlanNombre('');
  });

  const [formData, setFormData] = useState({
    codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: '', id_plan_academico: '', visible_en_grafo: false, es_electiva: false, puntos: 0
  });

  const cargarCarreras = async () => {
    try {
      setCargando(true);
      const res = await api.get('/carreras');
      setCarreras(res.data);
      if (res.data.length > 0) {
        setSelectedCarreraId(res.data[0].id.toString());
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las carreras.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCarreras();
  }, []);

  useEffect(() => {
    if (!selectedCarreraId) return;
    const fetchPlanes = async () => {
      try {
        const res = await api.get(`/planes-academicos?id_carrera=${selectedCarreraId}`);
        setPlanes(res.data);
        if (res.data.length > 0) {
          setSelectedPlanId(res.data[0].id.toString());
        } else {
          setSelectedPlanId('');
          setMaterias([]);
        }
      } catch (err) {
        console.error("Error al cargar planes:", err);
        setError('Error al cargar los planes académicos.');
      }
    };
    fetchPlanes();
    setFormData(prev => ({ ...prev, id_carrera: selectedCarreraId }));
  }, [selectedCarreraId]);

  useEffect(() => {
    if (!selectedPlanId) {
      setMaterias([]);
      return;
    }
    const fetchMaterias = async () => {
      try {
        setCargando(true);
        const res = await api.get(`/materias?id_plan_academico=${selectedPlanId}`);
        setMaterias(res.data);
      } catch (err) {
        console.error("Error al cargar materias:", err);
        setError('Error al cargar las materias.');
      } finally {
        setCargando(false);
      }
    };
    fetchMaterias();
    setFormData(prev => ({ ...prev, id_plan_academico: selectedPlanId }));
  }, [selectedPlanId]);

  const handleCarreraChange = (e) => {
    const newId = e.target.value;
    setSelectedCarreraId(newId);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : (name === 'puntos' ? Number(value) : value) });
  };

  const handleCheckboxChange = (id) => {
    setFormData(prev => {
      const existe = prev.correlativas.find(c => c.id === id);
      if (existe) {
        return { ...prev, correlativas: prev.correlativas.filter(c => c.id !== id) };
      } else {
        return { ...prev, correlativas: [...prev.correlativas, { id, tipo_requisito: 'regular' }] };
      }
    });
  };

  const handleTipoRequisitoChange = (id, tipo) => {
    setFormData(prev => ({
      ...prev,
      correlativas: prev.correlativas.map(c => 
        c.id === id ? { ...c, tipo_requisito: tipo } : c
      )
    }));
  };

  const handleCrearPlan = async (e) => {
    e.preventDefault();
    if (!nuevoPlanNombre.trim()) return;
    try {
      const res = await api.post('/planes-academicos', {
        nombre: nuevoPlanNombre,
        id_carrera: Number(selectedCarreraId)
      });
      setPlanes(prev => [...prev, res.data]);
      setSelectedPlanId(res.data.id.toString());
      setNuevoPlanNombre('');
      setCreandoPlan(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear el plan académico');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) {
      alert('Debes seleccionar o crear un Plan Académico antes de agregar materias.');
      return;
    }
    try {
      if (editandoId) {
        await api.put(`/materias/${editandoId}`, formData);
      } else {
        await api.post('/materias', formData);
      }
      setEditandoId(null);
      setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: selectedCarreraId, id_plan_academico: selectedPlanId, visible_en_grafo: false, es_electiva: false, puntos: 0 });
      
      const res = await api.get(`/materias?id_plan_academico=${selectedPlanId}`);
      setMaterias(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la materia');
    }
  };

  const handleEdit = (materia) => {
    setEditandoId(materia.id);
    setFormData({
      codigo: materia.codigo,
      nombre: materia.nombre,
      nivel_anio: materia.nivel_anio,
      cuatrimestre: materia.cuatrimestre,
      id_carrera: materia.id_carrera || selectedCarreraId,
      id_plan_academico: materia.id_plan_academico || selectedPlanId,
      visible_en_grafo: !!materia.visible_en_grafo,
      es_electiva: !!materia.es_electiva,
      puntos: materia.puntos || 0,
      correlativas: materia.correlativas ? materia.correlativas.map(c => ({
        id: c.id,
        tipo_requisito: c.correlativas_x_materia?.tipo_requisito || 'regular'
      })) : []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia?')) return;
    try {
      await api.delete(`/materias/${id}`);
      const res = await api.get(`/materias?id_plan_academico=${selectedPlanId}`);
      setMaterias(res.data);
    } catch (err) {
      alert('Error al eliminar la materia');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: selectedCarreraId, id_plan_academico: selectedPlanId, visible_en_grafo: false, es_electiva: false, puntos: 0 });
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Registrar correlativas</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">Agregá materias y definí sus correlatividades para estructurar las reglas de cursada.</p>
          </div>
          <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filtrar por Carrera</label>
              <select value={selectedCarreraId} onChange={handleCarreraChange} className="w-full sm:w-auto rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                 {carreras.map(c => (
                   <option key={c.id} value={c.id}>{c.nombre}</option>
                 ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Académico</label>
              <div className="flex items-center gap-2">
                <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full sm:w-auto rounded-md border-slate-300 dark:border-slate-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 min-w-[150px]">
                   {planes.length === 0 && <option value="">Sin planes</option>}
                   {planes.map(p => (
                     <option key={p.id} value={p.id}>{p.nombre}</option>
                   ))}
                </select>
                <button type="button" onClick={() => setCreandoPlan(true)} className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-bold shadow-sm transition">
                  +
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-900/40">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Columna Izquierda (Tabla de Materias Registradas) */}
          <div className="lg:col-span-7 flex flex-col h-[500px]">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Materias Registradas</h3>
              </div>
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Código</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                    {materias.map((materia) => (
                      <tr key={materia.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900 dark:text-slate-100 font-medium">
                          {materia.codigo}
                          {!materia.visible_en_grafo && (
                            <span className="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-950/60 uppercase last:mr-0 mr-1">Oculta</span>
                          )}
                          {materia.es_electiva && (
                            <span className="ml-1 text-[10px] font-bold inline-block py-0.5 px-1.5 rounded text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60">
                              Electiva ({materia.puntos || 3} pts)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={materia.nombre}>{materia.nombre}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(materia)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4 font-semibold">Editar</button>
                          <button onClick={() => handleDelete(materia.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {materias.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No hay materias registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Columna Derecha (Formulario) */}
          <div className="lg:col-span-5 flex flex-col">            
            {/* Formulario */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
                {editandoId ? 'Editar materia' : 'Nueva materia'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código *</label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleInputChange} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ej: MAT101" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nivel / Año *</label>
                    <select name="nivel_anio" value={formData.nivel_anio} onChange={handleInputChange} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}° Año</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ej: Álgebra y Geometría" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="visible_en_grafo"
                        checked={!!formData.visible_en_grafo}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-semibold">Visible en Grafo</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-6 mt-1">Si está desmarcado, no se ve en el mapa de correlatividades.</p>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="es_electiva"
                        checked={!!formData.es_electiva}
                        onChange={handleInputChange}
                        className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold text-purple-900 dark:text-purple-300">Materia Electiva</span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-6 mt-1">Suma puntos para la métrica de electivas (US-MET-02).</p>
                  </div>
                </div>

                {formData.es_electiva && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-900/40">
                    <label className="block text-sm font-medium text-purple-900 dark:text-purple-300 mb-1">Puntos Académicos que Otorga *</label>
                    <input 
                      type="number" 
                      name="puntos" 
                      min="1" 
                      max="10" 
                      value={formData.puntos || 3} 
                      onChange={handleInputChange} 
                      className="w-full rounded-md border-purple-300 dark:border-purple-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100" 
                      placeholder="Ej: 3 (o 2 o 4)" 
                    />
                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">Valores estándar: 3 pts (la mayoría), 4 pts (ej. Cloud) o 2 pts (ej. Green Software).</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cuatrimestre *</label>
                  <select name="cuatrimestre" value={formData.cuatrimestre} onChange={handleInputChange} className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                    <option value={3}>Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correlativas Requeridas</label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md p-2 space-y-2 bg-slate-50 dark:bg-slate-950">
                    {materias.filter(m => m.id !== editandoId).map(materia => {
                      const seleccionada = formData.correlativas.find(c => c.id === materia.id);
                      return (
                        <div key={materia.id} className={`flex items-center justify-between p-2 rounded border ${seleccionada ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                          <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!seleccionada}
                              onChange={() => handleCheckboxChange(materia.id)}
                              className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={seleccionada ? 'font-semibold text-indigo-900 dark:text-indigo-300' : ''}>{materia.codigo} - {materia.nombre}</span>
                          </label>
                          {seleccionada && (
                            <select 
                              value={seleccionada.tipo_requisito} 
                              onChange={(e) => handleTipoRequisitoChange(materia.id, e.target.value)}
                              className="text-xs rounded border-slate-300 dark:border-slate-700 py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100"
                            >
                              <option value="regular">Para Cursar (Regular)</option>
                              <option value="aprobada">Para Rendir (Aprobada)</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                    {materias.length === 0 && <span className="text-xs text-slate-500 dark:text-slate-400 italic">No hay materias disponibles</span>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={cancelarEdicion} className="px-4 py-2 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
                  <button type="submit" className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {editandoId ? 'Guardar Cambios' : 'Crear Materia'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Fila Inferior: Vista Previa del Grafo */}
        <div className="w-full">
             {cargando ? (
               <div className="h-[600px] flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               </div>
             ) : (
               <GrafoCorrelativas materias={materias} />
             )}
        </div>
      </div>

      {creandoPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            ref={focusTrapPlanRef}
            role="dialog"
            aria-modal="true"
            aria-label="Crear Nuevo Plan Académico"
            tabIndex={-1}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full transition-colors duration-200 outline-none"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Crear Nuevo Plan Académico</h3>
            <form onSubmit={handleCrearPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Nombre del Plan</label>
                <input
                  type="text"
                  required
                  value={nuevoPlanNombre}
                  onChange={(e) => setNuevoPlanNombre(e.target.value)}
                  placeholder="Ej: Plan 2023"
                  className="w-full rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setCreandoPlan(false); setNuevoPlanNombre(''); }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-sm font-bold rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer border-none shadow-sm"
                >
                  Crear Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
