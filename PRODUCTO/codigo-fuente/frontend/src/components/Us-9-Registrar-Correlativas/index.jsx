import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GrafoCorrelativas from './GrafoCorrelativas';

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

  const [formData, setFormData] = useState({
    codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: '', id_plan_academico: '', visible_en_grafo: false
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
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
      setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: selectedCarreraId, id_plan_academico: selectedPlanId, visible_en_grafo: false });
      
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
    setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [], id_carrera: selectedCarreraId, id_plan_academico: selectedPlanId, visible_en_grafo: false });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Registrar correlativas</h1>
            <p className="text-sm sm:text-base text-slate-500 mt-2">Agregá materias y definí sus correlatividades para estructurar las reglas de cursada.</p>
          </div>
          <div className="flex flex-wrap items-end gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Carrera</label>
              <select value={selectedCarreraId} onChange={handleCarreraChange} className="w-full sm:w-auto rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                 {carreras.map(c => (
                   <option key={c.id} value={c.id}>{c.nombre}</option>
                 ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plan Académico</label>
              <div className="flex items-center gap-2">
                <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full sm:w-auto rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white min-w-[150px]">
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

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Columna Izquierda (Tabla de Materias Registradas) */}
          <div className="lg:col-span-7 flex flex-col h-[500px]">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700">Materias Registradas</h3>
              </div>
              <div className="overflow-x-auto overflow-y-auto flex-1">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Código</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-4 py-3 text-right font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {materias.map((materia) => (
                      <tr key={materia.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900 font-medium">
                          {materia.codigo}
                          {!materia.visible_en_grafo && (
                            <span className="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded text-amber-600 bg-amber-200 uppercase last:mr-0 mr-1">Oculta</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]" title={materia.nombre}>{materia.nombre}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEdit(materia)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Editar</button>
                          <button onClick={() => handleDelete(materia.id)} className="text-red-500 hover:text-red-700 font-semibold">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {materias.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No hay materias registradas.</td>
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-indigo-600 mb-6">
                {editandoId ? 'Editar materia' : 'Nueva materia'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                    <input type="text" name="codigo" required value={formData.codigo} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ej: MAT101" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nivel / Año *</label>
                    <select name="nivel_anio" value={formData.nivel_anio} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}° Año</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" placeholder="Ej: Álgebra y Geometría" />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="visible_en_grafo"
                      checked={!!formData.visible_en_grafo}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold">Visible en Grafo para Alumnos</span>
                  </label>
                  <p className="text-xs text-slate-500 ml-6 mt-1">Si está desmarcado, los alumnos no verán esta materia en su mapa de correlatividades.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuatrimestre *</label>
                  <select name="cuatrimestre" value={formData.cuatrimestre} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                    <option value={3}>Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativas Requeridas</label>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-2 bg-slate-50">
                    {materias.filter(m => m.id !== editandoId).map(materia => {
                      const seleccionada = formData.correlativas.find(c => c.id === materia.id);
                      return (
                        <div key={materia.id} className={`flex items-center justify-between p-2 rounded border ${seleccionada ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-100'}`}>
                          <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={!!seleccionada}
                              onChange={() => handleCheckboxChange(materia.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className={seleccionada ? 'font-semibold text-indigo-900' : ''}>{materia.codigo} - {materia.nombre}</span>
                          </label>
                          {seleccionada && (
                            <select 
                              value={seleccionada.tipo_requisito} 
                              onChange={(e) => handleTipoRequisitoChange(materia.id, e.target.value)}
                              className="text-xs rounded border-slate-300 py-1 pl-2 pr-6 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            >
                              <option value="regular">Para Cursar (Regular)</option>
                              <option value="aprobada">Para Rendir (Aprobada)</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                    {materias.length === 0 && <span className="text-xs text-slate-500 italic">No hay materias disponibles</span>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={cancelarEdicion} className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">Cancelar</button>
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
               <div className="h-[600px] flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               </div>
             ) : (
               <GrafoCorrelativas materias={materias} />
             )}
        </div>
      </div>

      {creandoPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Crear Nuevo Plan Académico</h3>
            <form onSubmit={handleCrearPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Plan</label>
                <input type="text" required value={nuevoPlanNombre} onChange={(e) => setNuevoPlanNombre(e.target.value)} placeholder="Ej: Plan 2023" className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setCreandoPlan(false); setNuevoPlanNombre(''); }} className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
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
