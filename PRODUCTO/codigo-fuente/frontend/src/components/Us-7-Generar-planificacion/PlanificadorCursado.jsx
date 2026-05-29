import React, { useState, useEffect } from 'react';
import Horario from '../Us-8-Actividades-Personales/Horario';
import { 
    getActividades as getActividadesFijas, 
    DeleteActividad as deleteActividadFija 
} from '../Us-8-Actividades-Personales/services';
import { 
    getCursos, // La función que hace el mapeo de estado-materias y cursos
    getActividadesFlexibles, 
    PostActividad as postActividadFlexible, 
    DeleteActividad as deleteActividadFlexible 
} from './services'; 

const Planificador = () => {
    const [refresh, setRefresh] = useState(0);
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [actividadesFijas, setActividadesFijas] = useState([]);
    const [actividadesFlexibles, setActividadesFlexibles] = useState([]);
    
    // Formulario para tus actividades flexibles (Sector Derecho)
    const [nuevaFlexible, setNuevaFlexible] = useState({
        nombre: '',
        horas_semanales: '',
        duracion: '',
        prioridad: 2,
        dias_preferidos: 0 
    });

    // Carga inicial y sincronización de datos
    useEffect(() => {
         const cargarTodoElPanel = async () => {
             try {
                 // Trae las materias recomendadas para el sector superior
                 const datosMaterias = await getCursos();
                 setMaterias(datosMaterias || []);

                 // REUTILIZADO: Trae las actividades fijas reales del usuario logueado
                 const fijas = await getActividadesFijas();
                 setActividadesFijas(fijas || []);

                 // Trae tus actividades flexibles de la base de datos
                 const flexibles = await getActividadesFlexibles();
                 setActividadesFlexibles(flexibles || []);
             } catch (error) {
                 console.error("Error al cargar los datos del planificador:", error);
             }
         };
        
         cargarTodoElPanel();
    }, [refresh]);

    // Checkboxes del panel superior
    const handleMateriaCheck = (idMateria) => {
        setMateriasSeleccionadas(prev => 
            prev.includes(idMateria) 
                ? prev.filter(id => id !== idMateria) 
                : [...prev, idMateria]
        );
    };

    // Agregar actividad flexible
    const handleAgregarFlexible = async (e) => {
        e.preventDefault();
        try {
            if (!nuevaFlexible.nombre || !nuevaFlexible.horas_semanales || !nuevaFlexible.duracion) {
                alert("Por favor, completa los campos obligatorios.");
                return;
            }
            await postActividadFlexible(nuevaFlexible);
            setRefresh(r => r + 1); // Incrementa el refresh para recargar las listas y el calendario
            setNuevaFlexible({ nombre: '', horas_semanales: '', duracion: '', prioridad: 2, dias_preferidos: 0 });
        } catch (error) {
            alert("Error al guardar: " + error.message);
        }
    };

    // REUTILIZADO: Eliminar actividades fijas desde tu barra lateral
    const handleEliminarFija = async (id) => {
        try {
            // Llama directo al servicio de ellos pasándole el id
            await deleteActividadFija(id);
            setRefresh(r => r + 1); // Esto hace que Horario.jsx también ejecute su useEffect y se limpie
        } catch (error) {
            console.error("Error al eliminar actividad fija", error);
        }
    };

    // Eliminar actividades flexibles
    const handleEliminarFlexible = async (id) => {
        try {
            await deleteActividadFlexible(id);
            setRefresh(r => r + 1);
        } catch (error) {
            console.error("Error al eliminar actividad flexible", error);
        }
    };

    const handleGenerarPlanificacion = () => {
        if (materiasSeleccionadas.length === 0) {
            alert("Debes seleccionar al menos una materia para planificar.");
            return;
        }
        console.log("Datos listos para enviar al algoritmo de asignación:", {
            materias: materiasSeleccionadas,
            fijas: actividadesFijas,
            flexibles: actividadesFlexibles
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6 font-sans">
            
            {/* ================= RECTÁNGULO ROJO SUPERIOR: SELECCIÓN DE MATERIAS ================= */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 mb-1">1. Seleccioná las materias que querés cursar (mínimo una)</h2>
                <p className="text-xs text-gray-400 mb-4">Módulos disponibles para tu carrera</p>
                
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
                                id={`materia-${materia.id}`}
                                checked={materiasSeleccionadas.includes(materia.id)}
                                onChange={() => handleMateriaCheck(materia.id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor={`materia-${materia.id}`} className="flex-1 cursor-pointer">
                                <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                    Code: {materia.id}
                                </span>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{materia.nombre}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Recomendada
                                    </span>
                                </div>
                            </label>
                        </div>
                    ))}
                    {materias.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No hay materias disponibles para mostrar.</p>
                    )}
                </div>
            </div>

            {/* SECTOR INFERIOR: CALENDARIO + TU INTERFAZ LATERAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* CALENDARIO DE COMPAÑERO (Ocupa 2 de las 3 columnas) */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">2. Vista previa de tu planificación semanal</h2>
                    <Horario refresh={refresh} />
                </div>

                {/* ================= RECTÁNGULO ROJO LATERAL DERECHO ================= */}
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

                    {/* Lista Unificada con opción de eliminación */}
                    <div className="border-t pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actividades cargadas</h3>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                            
                            {/* Render de Actividades Fijas (Las de Martín) */}
                            {actividadesFijas.map(act => (
                                <div key={act.id} className="flex justify-between items-center bg-blue-50/70 p-3 rounded-xl text-xs border border-blue-100">
                                    <div>
                                        <p className="font-semibold text-blue-900">{act.nombre}</p>
                                        <p className="text-blue-600 text-[11px]">Fija • {act.horaInicio} ({act.duracion} min)</p>
                                    </div>
                                    <button 
                                        onClick={() => handleEliminarFija(act.id)}
                                        className="text-gray-400 hover:text-red-500 transition text-sm p-1 cursor-pointer"
                                        title="Eliminar actividad fija"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}

                            {/* Render de tus Actividades Flexibles */}
                            {actividadesFlexibles.map(act => (
                                <div key={act.id} className="flex justify-between items-center bg-purple-50/70 p-3 rounded-xl text-xs border border-purple-100">
                                    <div>
                                        <p className="font-semibold text-purple-900">{act.nombre}</p>
                                        <p className="text-purple-600 text-[11px]">Flexible • Prioridad {act.prioridad} ({act.horasSemanales} min/sem)</p>
                                    </div>
                                    <button 
                                        onClick={() => handleEliminarFlexible(act.id)}
                                        className="text-gray-400 hover:text-red-500 transition text-sm p-1 cursor-pointer"
                                        title="Eliminar actividad flexible"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}

                            {actividadesFijas.length === 0 && actividadesFlexibles.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2">No hay actividades registradas.</p>
                            )}
                        </div>
                    </div>

                    {/* Formulario de actividades flexibles */}
                    <form onSubmit={handleAgregarFlexible} className="border-t pt-4 flex flex-col gap-2.5">
                        <h4 className="text-xs font-bold text-gray-700">＋ Agregar actividad flexible</h4>
                        
                        <input 
                            type="text" 
                            placeholder="Nombre (Ej: Gimnasio, Cursillo)" 
                            value={nuevaFlexible.nombre}
                            onChange={e => setNuevaFlexible({...nuevaFlexible, nombre: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                            required
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="number" 
                                placeholder="Minutos totales" 
                                value={nuevaFlexible.horas_semanales}
                                onChange={e => setNuevaFlexible({...nuevaFlexible, horas_semanales: Number(e.target.value)})}
                                className="p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                required
                            />
                            <input 
                                type="number" 
                                placeholder="Bloques de (min)" 
                                value={nuevaFlexible.duracion}
                                onChange={e => setNuevaFlexible({...nuevaFlexible, duracion: Number(e.target.value)})}
                                className="p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                required
                            />
                        </div>

                        <select 
                            value={nuevaFlexible.prioridad}
                            onChange={e => setNuevaFlexible({...nuevaFlexible, prioridad: Number(e.target.value)})}
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-indigo-500"
                        >
                            <option value={1}>Prioridad Alta (1)</option>
                            <option value={2}>Prioridad Media (2)</option>
                            <option value={3}>Prioridad Baja (3)</option>
                        </select>

                        <button 
                            type="submit" 
                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-2 rounded-lg text-xs transition cursor-pointer"
                        >
                            Añadir a la lista
                        </button>
                    </form>

                    {/* Botón de acción */}
                    <button 
                        onClick={handleGenerarPlanificacion}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer mt-2 flex items-center justify-center gap-1"
                    >
                        ✨ Generar planificación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Planificador;
