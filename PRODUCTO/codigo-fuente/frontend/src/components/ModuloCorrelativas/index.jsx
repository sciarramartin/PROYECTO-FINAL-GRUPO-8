import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GrafoCorrelativas from './GrafoCorrelativas';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export default function ModuloCorrelativas() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const [formData, setFormData] = useState({
    codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: []
  });

  const cargarMaterias = async () => {
    try {
      setCargando(true);
      const res = await api.get('/materias');
      setMaterias(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las materias desde el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (id) => {
    setFormData(prev => ({
      ...prev,
      correlativas: prev.correlativas.includes(id) 
        ? prev.correlativas.filter(cid => cid !== id)
        : [...prev.correlativas, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/materias/${editandoId}`, formData);
      } else {
        await api.post('/materias', formData);
      }
      setEditandoId(null);
      setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [] });
      cargarMaterias();
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
      correlativas: materia.correlativas ? materia.correlativas.map(c => c.id) : []
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia?')) return;
    try {
      await api.delete(`/materias/${id}`);
      cargarMaterias();
    } catch (err) {
      alert('Error al eliminar la materia');
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({ codigo: '', nombre: '', nivel_anio: 1, cuatrimestre: 1, correlativas: [] });
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registrar correlativas</h1>
          <p className="text-slate-500 mt-2">Agregá materias y definí sus correlatividades para estructurar las reglas de cursada.</p>
        </header>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Columna Izquierda (Tabla de Materias Registradas) */}
          <div className="lg:col-span-7 flex flex-col h-[500px]">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-700">Materias Registradas</h3>
              </div>
              <div className="overflow-y-auto flex-1">
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
                        <td className="px-4 py-3 whitespace-nowrap text-slate-900 font-medium">{materia.codigo}</td>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuatrimestre *</label>
                  <select name="cuatrimestre" value={formData.cuatrimestre} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                    <option value={3}>Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativas Requeridas</label>
                  <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1 bg-slate-50">
                    {materias.filter(m => m.id !== editandoId).map(materia => (
                      <label key={materia.id} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                        <input 
                          type="checkbox" 
                          checked={formData.correlativas.includes(materia.id)}
                          onChange={() => handleCheckboxChange(materia.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{materia.codigo} - {materia.nombre}</span>
                      </label>
                    ))}
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
    </div>
  );
}
