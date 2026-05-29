import React, { useState, useEffect } from 'react';
// El componente del calendario de tus compañeros
import Horario from '../Us-8-Actividades-Personales/Horario';

const Planificador = () => {
    // Estados principales de control
    const [refresh, setRefresh] = useState(0);
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [actividades, setActividades] = useState([]);
    
    // Estado para el formulario de la barra derecha
    const [nuevaActividad, setNuevaActividad] = useState({
        nombre: '',
        horaInicio: '08:00',
        duracion: 60,
        dias: 31, 
        color: '#E0BBE4'
    });

    // =================================================================
    // MODO SIMULADO: Carga de datos visuales sin depender de la API
    // =================================================================
    useEffect(() => {
        console.log("🛠️ Planificador ejecutándose en modo SIMULACIÓN");

        // 1. Inyección de las materias tal cual tu mockup
        setMaterias([
            { id: 'MAT101', nombre: 'Álgebra y Geometría Analítica', duracion: 5, tipo: 'Obligatoria' },
            { id: 'MAT102', nombre: 'Análisis Matemático I', duracion: 6, tipo: 'Obligatoria' },
            { id: 'FIS101', nombre: 'Física I', duracion: 6, tipo: 'Obligatoria' },
            { id: 'QUI101', nombre: 'Química General', duracion: 4, tipo: 'Obligatoria' },
            { id: 'PROG101', nombre: 'Introducción a la Programación', duracion: 4, tipo: 'Obligatoria' },
            { id: 'FIL101', nombre: 'Filosofía', duracion: 3, tipo: 'Optativa' }
        ]);

        // 2. Inyección de tus actividades recurrentes de la derecha
        setActividades([
            { id: 1, nombre: 'Trabajo', horaInicio: '15:00', duracion: 240 },
            { id: 2, nombre: 'Gimnasio', horaInicio: '19:00', duracion: 120 }
        ]);

    }, [refresh]);

    // Manejo de Checkboxes (Sector Superior)
    const handleMateriaCheck = (idMateria) => {
        setMateriasSeleccionadas(prev => 
            prev.includes(idMateria) ? prev.filter(id => id !== idMateria) : [...prev, idMateria]
        );
    };

    // Agregar actividad simulada (Solo impacta en el estado local)
    const handleAgregarActividad = (e) => {
        e.preventDefault();
        if (!nuevaActividad.nombre.trim()) return;

        const nueva = {
            id: Date.now(), // ID temporal único
            nombre: nuevaActividad.nombre,
            horaInicio: nuevaActividad.horaInicio,
            duracion: nuevaActividad.duracion
        };

        setActividades([...actividades, nueva]);
        setNuevaActividad({ ...nuevaActividad, nombre: '' });
    };

    // Eliminar actividad simulada
    const handleEliminarActividad = (id) => {
        setActividades(actividades.filter(act => act.id !== id));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6 font-sans">
            
            {/* ================= SECTOR SUPERIOR: SELECCIÓN DE MATERIAS ================= */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-gray-800">1. Seleccioná las materias que querés cursar (mínimo una)</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Cuatrimestre: 1° Cuatrimestre</p>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar materia..." 
                        className="p-2 border border-gray-200 rounded-lg text-xs outline-none w-48 focus:border-indigo-400"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materias.map((materia) => (
                        <div 
                            key={materia.id} 
                            className={`p-4 border rounded-xl flex items-start gap-3 transition hover:shadow-sm bg-white ${
                                materiasSeleccionadas.includes(materia.id) ? 'border-indigo-500 bg-indigo-50/10' : 'border-gray-200'
                            }`}
                        >
                            <input 
                                type="checkbox" 
                                id={`mats-${materia.id}`}
                                checked={materiasSeleccionadas.includes(materia.id)}
                                onChange={() => handleMateriaCheck(materia.id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor={`mats-${materia.id}`} className="flex-1 cursor-pointer">
                                <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                    {materia.id}
                                </span>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{materia.nombre}</p>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    {materia.duracion} hs semanales • <span className="text-green-600 font-medium">{materia.tipo}</span>
                                </p>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTOR INFERIOR DIVIDIDO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* CALENDARIO DE TUS COMPAÑEROS (Blindado con datos seguros) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">2. Vista previa de tu planificación semanal</h2>
                    {/*<Horario actividades={actividades} refresh={refresh} />*/}
                </div>

                {/* ================= SECTOR LATERAL DERECHO: FORMULARIO Y FILTROS ================= */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-5">
                    
                    {/* Filtros Básicos */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Filtros y preferencias</h3>
                        <label className="text-xs font-semibold text-gray-600 block mb-2">Disponibilidad horaria</label>
                        <div className="flex flex-col gap-2 text-xs text-gray-700">
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Mañana (08:00 - 12:00)</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Tarde (13:00 - 18:00)</label>
                            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded text-indigo-600" /> Noche (18:00 - 22:00)</label>
                        </div>
                    </div>

                    {/* Lista Dinámica Simulada */}
                    <div className="border-t pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actividades personales recurrentes</h3>
                        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                            {actividades.map(act => (
                                <div key={act.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl text-xs border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-800">{act.nombre}</p>
                                        <p className="text-gray-400 text-[11px] mt-0.5">{act.horaInicio} ({act.duracion} min)</p>
                                    </div>
                                    <button 
                                        onClick={() => handleEliminarActividad(act.id)}
                                        className="text-gray-400 hover:text-red-500 transition text-sm p-1 cursor-pointer"
                                        title="Eliminar actividad"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                            {actividades.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2">No hay actividades cargadas.</p>
                            )}
                        </div>
                    </div>

                    {/* Formulario Rápido Simulado */}
                    <form onSubmit={handleAgregarActividad} className="border-t pt-4 flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nueva act. rápida... (Ej: Gimnasio)" 
                            value={nuevaActividad.nombre}
                            onChange={e => setNuevaActividad({...nuevaActividad, nombre: e.target.value})}
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            required
                        />
                        <button type="submit" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 rounded-lg text-xs font-semibold transition cursor-pointer">
                            ＋ Agregar
                        </button>
                    </form>

                    {/* Botón de Generación Final */}
                    <button 
                        type="button"
                        onClick={() => alert("✨ ¡Simulación! El algoritmo está analizando tu disponibilidad óptima...")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer mt-2"
                    >
                        ✨ Generar planificación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Planificador;