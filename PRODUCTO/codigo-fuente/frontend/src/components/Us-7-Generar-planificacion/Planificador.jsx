import React, { useState, useEffect, useRef  } from 'react';
import Horario from '../Us-8-Actividades-Personales/Horario';
import { 
    getActividades as getActividadesFijas, 
    PostActividad,
    DeleteActividad as deleteActividadFija 
} from '../Us-8-Actividades-Personales/services';
import { 
    getMateriasHabilitadas,
    calcularPlan
} from './services'; 

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const Planificador = () => {
    const [refresh, setRefresh] = useState(0);
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [actividadesFijas, setActividadesFijas] = useState([]);
    const [actividadesPreview, setActividadesPreview] = useState([]);
    const [actividadesFlexibles, setActividadesFlexibles] = useState([]);
    const [mostrarHorario, setMostrarHorario] = useState(false);
    
    const mananaRef = useRef(null);
    const tardeRef = useRef(null);
    const nocheRef = useRef(null);

    // Formulario para tus actividades flexibles (Sector Derecho)
    const [nuevaFlexible, setNuevaFlexible] = useState({
        nombre: '',
        horasSemanales: '',
        duracion: '',
        prioridad: 2,
        diasPreferidos: []
    });

    // Carga inicial y sincronización de datos
    useEffect(() => {
        const cargarTodoElPanel = async () => {
            try {
                // Trae las materias recomendadas para el sector superior
                const datosMaterias = await getMateriasHabilitadas();
                setMaterias(datosMaterias || []);

                const fijas = await getActividadesFijas();
                setActividadesFijas(fijas);
                setActividadesFlexibles([]);
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

    // Manejar la selección de días preferidos
    const handleDiaCheck = (dia) => {
        setNuevaFlexible(prev => {
            const yaSeleccionado = prev.diasPreferidos.includes(dia);
            return {
                ...prev,
                diasPreferidos: yaSeleccionado 
                    ? prev.diasPreferidos.filter(d => d !== dia)
                    : [...prev.diasPreferidos, dia]
            };
        });
    };

    // Agregar actividad flexible
    const handleAgregarFlexible = async (e) => {
        e.preventDefault();
        try {
            // 1.Validaciones obligatorias solicitadas
            if (!nuevaFlexible.nombre || !nuevaFlexible.horasSemanales || !nuevaFlexible.duracion) {
                alert("Por favor, completa los campos obligatorios: Nombre, Horas y Duración.");
                return;
            }
            // 2.Control estricto de números negativos o cero
            if (Number(nuevaFlexible.horasSemanales) <= 0 || Number(nuevaFlexible.duracion) <= 0) {
                alert("Los valores numéricos deben ser mayores a cero.");
                return;
            }

            setActividadesFlexibles(prev => [...prev, nuevaFlexible] );

            setNuevaFlexible({ nombre: '', horasSemanales: '', duracion: '', prioridad: 2, diasPreferidos: [] });
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
    // const handleEliminarFlexible = async (id) => {
    //     try {
    //         await deleteActividadFlexible(id);
    //         setRefresh(r => r + 1);
    //     } catch (error) {
    //         console.error("Error al eliminar actividad flexible", error);
    //     }
    // };

    const handleEliminarFlexible = (indexAEliminar) => {
        setActividadesFlexibles(prev => 
            prev.filter((_, index) => index !== indexAEliminar)
        );
    };

    const handleGenerarPlanificacion = async () => {
        if (materiasSeleccionadas.length === 0) {
            alert("Debes seleccionar al menos una materia para planificar.");
            return;
        }
        console.log({
            manana: mananaRef.current.checked,
            tarde: tardeRef.current.checked,
            noche: nocheRef.current.checked
        });
        console.log("Datos listos para enviar al algoritmo de asignación:", {
            materias: materiasSeleccionadas,
            fijas: actividadesFijas,
            flexibles: actividadesFlexibles,
            disponibilidad: {
                manana: mananaRef.current.checked,
                tarde: tardeRef.current.checked,
                noche: nocheRef.current.checked
            }
        });

        const actividadesResultantes = await calcularPlan({
            materias: materiasSeleccionadas,
            fijas: actividadesFijas,
            flexibles: actividadesFlexibles,
            disponibilidad: {
                manana: mananaRef.current.checked,
                tarde: tardeRef.current.checked,
                noche: nocheRef.current.checked
            }
        })

        setActividadesPreview([...actividadesResultantes.cursos, ...actividadesResultantes.flexibles]);
        setMostrarHorario(true);
        /*await Promise.all(
            actividadesResultantes.cursos.map(async (curso) => {
                const response = await PostActividad({
                nombre: curso.nombre,
                horaInicio: curso.horaInicio,
                duracion: curso.duracion,
                dias: curso.dias,
                })
            }));
        setRefresh(r => r + 1);*/
    };

    const guardarPlanificacion = async () => {

        console.log(actividadesPreview);
        setMostrarHorario(false);
        await Promise.all(
            actividadesPreview.map(async (curso) => {
                const response = await PostActividad({
                nombre: curso.nombre,
                horaInicio: curso.horaInicio,
                duracion: curso.duracion,
                dias: curso.dias,
                })
            }));
        setRefresh(r => r + 1);
    };

    const cancelarPlanificacion = async () => {

        console.log(actividadesPreview);
        setMostrarHorario(false);
        setactividadesPreview([]);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6 font-sans">
            
            {/* ===== PASO 1: SELECCIÓN DE MATERIAS ===== */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 mb-1">1. Seleccioná las materias que querés cursar (mínimo una)</h2>
                <p className="text-xs text-gray-400 mb-4">Módulos disponibles para tu carrera</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materias.map((materia) => (
                        <label 
                            key={materia.id} 
                            htmlFor={`materia-${materia.id}`}
                            className={`p-4 border rounded-xl flex items-start gap-3 transition hover:shadow-sm bg-white cursor-pointer select-none ${
                                materiasSeleccionadas.includes(materia.id) ? 'border-indigo-500 bg-indigo-50/10' : 'border-gray-200'
                            }`}
                        >
                            <input 
                                type="checkbox" 
                                id={`materia-${materia.id}`}
                                checked={materiasSeleccionadas.includes(materia.id)}
                                onChange={() => handleMateriaCheck(materia.id)}
                                className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 shrink-0 mt-0.5"
                            />
                            <div className="flex-1">
                                <span className="text-[10px] font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                    Code: {materia.id}
                                </span>
                                <p className="text-sm font-semibold text-gray-800 mt-1">{materia.nombre}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Recomendada
                                    </span>
                                </div>
                            </div>
                        </label>
                    ))}
                    {materias.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No hay materias disponibles para mostrar.</p>
                    )}
                </div>
            </div>

            {/* ===== PASO 2: FILTROS + ACTIVIDADES (ancho completo, layout horizontal interno) ===== */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-sm font-bold text-gray-800 mb-4">2. Configurá tus preferencias y actividades</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* COLUMNA A: Filtros de disponibilidad */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Disponibilidad horaria</h3>
                            <div className="flex flex-col gap-2 text-xs text-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={mananaRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Mañana (08:00 - 12:00)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={tardeRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Tarde (13:00 - 18:00)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={nocheRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Noche (18:00 - 22:00)
                                </label>
                            </div>
                        </div>

                        {/* Actividades cargadas */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Actividades cargadas</h3>
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
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
                                        >🗑️</button>
                                    </div>
                                ))}
                                {actividadesFlexibles.map((act, index) => (
                                    <div key={index} className="flex justify-between items-center bg-purple-50/70 p-3 rounded-xl text-xs border border-purple-100">
                                        <div>
                                            <p className="font-semibold text-purple-900">{act.nombre}</p>
                                            <p className="text-purple-600 text-[11px]">
                                                Flexible • Prioridad {act.prioridad} • {act.horasSemanales}hs totales ({act.duracion} veces/sem)
                                            </p>
                                            {act.diasPreferidos && act.diasPreferidos.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {act.diasPreferidos.map(dia => (
                                                        <span key={dia} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                                                            {dia.substring(0, 3)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleEliminarFlexible(index)}
                                            className="text-gray-400 hover:text-red-500 transition text-sm p-1 cursor-pointer"
                                            title="Eliminar actividad flexible"
                                        >🗑️</button>
                                    </div>
                                ))}
                                {actividadesFijas.length === 0 && actividadesFlexibles.length === 0 && (
                                    <p className="text-xs text-gray-400 italic text-center py-2">No hay actividades registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA B: Formulario de actividades flexibles */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Agregar actividades de mis tiempos libres</h3>
                        <form onSubmit={handleAgregarFlexible} className="flex flex-col gap-2.5">
                            <input 
                                type="text" 
                                placeholder="Nombre (Ej: Gimnasio, Cursillo)" 
                                value={nuevaFlexible.nombre}
                                onChange={e => setNuevaFlexible({...nuevaFlexible, nombre: e.target.value})}
                                className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-medium block mb-1">Horas semanales</label>
                                    <input 
                                        type="number" min="1" placeholder="Ej: 3" 
                                        value={nuevaFlexible.horasSemanales}
                                        onChange={e => setNuevaFlexible({...nuevaFlexible, horasSemanales: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-medium block mb-1">Veces a la semana</label>
                                    <input 
                                        type="number" min="1" placeholder="Ej: 3" 
                                        value={nuevaFlexible.duracion}
                                        onChange={e => setNuevaFlexible({...nuevaFlexible, duracion: e.target.value})}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                                    Días de preferencia (Opcional)
                                </label>
                                <div className="grid grid-cols-4 gap-1.5 text-[11px] text-gray-600">
                                    {diasSemana.map(dia => (
                                        <label key={dia} className="flex items-center gap-1 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={nuevaFlexible.diasPreferidos.includes(dia)}
                                                onChange={() => handleDiaCheck(dia)}
                                                className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                                            />
                                            {dia.substring(0, 3)}
                                        </label>
                                    ))}
                                </div>
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

                        {/* Botón generar — alineado al final del formulario */}
                        <button 
                            onClick={handleGenerarPlanificacion}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer mt-4 flex items-center justify-center gap-1"
                        >
                            ✨ Generar planificación
                        </button>
                    </div>

                </div>
            </div>

            {/* ===== PASO 3: CALENDARIO — ancho completo, debajo ===== */}
            {mostrarHorario && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-4">3. Vista previa de tu planificación semanal</h2>
                    <Horario
                        actividades={[...actividadesPreview, ...actividadesFijas]}
                        onActividadesChange={(lista) => setActividadesPreview(lista)}
                        refresh={refresh}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button 
                            onClick={guardarPlanificacion}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                        >
                            Guardar
                        </button>
                        <button 
                            onClick={cancelarPlanificacion}
                            className="bg-white hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer border border-gray-200 flex items-center justify-center gap-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Planificador;
