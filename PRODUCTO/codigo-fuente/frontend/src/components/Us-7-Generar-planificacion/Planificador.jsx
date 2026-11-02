import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// 🔢 Diccionario de Bitmask para el algoritmo de tu compañero
const VALORES_DIAS = {
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 4,
    'Jueves': 8,
    'Viernes': 16,
    'Sábado': 32,
    'Domingo': 64
};

// ⏱️ Horas cátedra semanales estimadas por materia o por régimen/código
export const estimarHorasSemanales = (materia) => {
    if (!materia) return 0;
    if (materia.horas_semanales && Number(materia.horas_semanales) > 0) {
        return Number(materia.horas_semanales);
    }
    if (materia.carga_horaria && Number(materia.carga_horaria) > 0) {
        return Number(materia.carga_horaria);
    }

    const horasPorCodigo = {
        'MAT1': 5,
        'ALG1': 5,
        'FIS1': 5,
        'ING1': 3,
        'LOG1': 4,
        'AED1': 5,
        'ARQ1': 4,
        'SYS1': 4,
        'MAT2': 5,
        'FIS2': 5,
        'ISO2': 3,
        'ING2': 3,
        'SSL2': 4,
        'PPR2': 4,
        'SOP2': 4,
        'ASI2': 6,
        'PRO2': 4,
        'ECO3': 3,
        'BDA3': 4,
        'DSO3': 4,
        'CDA3': 4,
        'ANU3': 4,
        'DSI3': 6,
        'SEM3': 4,
        'LEG4': 3,
        'ICS4': 4,
        'RDA4': 4,
        'IOP4': 4,
        'SIM4': 4,
        'AUT4': 4,
        'ADM4': 4,
        'INT5': 4,
        'CDA5': 4,
        'SGE5': 4,
        'GGE5': 4,
        'SSI5': 4,
        'PFI5': 6,
    };

    const codigo = (materia.codigo || '').toUpperCase();
    if (codigo && horasPorCodigo[codigo]) {
        return horasPorCodigo[codigo];
    }

    if (materia.puntos && Number(materia.puntos) > 0) {
        return Math.max(3, Number(materia.puntos));
    }

    const cuat = Number(materia.cuatrimestre);
    return cuat === 3 || cuat === 0 ? 5 : 4;
};

// 📅 Helper para etiqueta y estilos según cuatrimestre
const getEtiquetaCuatrimestre = (cuatrimestre) => {
    const cuat = Number(cuatrimestre);
    if (cuat === 1) {
        return {
            texto: '1° Cuatrimestre',
            corto: '1C',
            bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800/40'
        };
    }
    if (cuat === 2) {
        return {
            texto: '2° Cuatrimestre',
            corto: '2C',
            bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
        };
    }
    return {
        texto: 'Anual',
        corto: 'Anual',
        bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
    };
};

const Planificador = () => {
    const [refresh, setRefresh] = useState(0);
    const [materias, setMaterias] = useState([]);
    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);
    const [actividadesFijas, setActividadesFijas] = useState([]);
    const [actividadesPreview, setActividadesPreview] = useState([]);
    const [actividadesFlexibles, setActividadesFlexibles] = useState([]);
    const [mostrarHorario, setMostrarHorario] = useState(false);
    
    // US-V07: Pestañas de filtrado rápido y búsqueda opcional
    const [filtroCuatrimestre, setFiltroCuatrimestre] = useState('todas'); // 'todas' | '1c' | '2c' | 'anual'
    const [busquedaMateria, setBusquedaMateria] = useState('');

    const mananaRef = useRef(null);
    const tardeRef = useRef(null);
    const nocheRef = useRef(null);

    // Contadores de materias disponibles por cuatrimestre
    const countsCuatrimestre = useMemo(() => {
        return {
            todas: materias.length,
            '1c': materias.filter(m => Number(m.cuatrimestre) === 1).length,
            '2c': materias.filter(m => Number(m.cuatrimestre) === 2).length,
            anual: materias.filter(m => Number(m.cuatrimestre) === 3 || Number(m.cuatrimestre) === 0 || Number(m.cuatrimestre) > 2).length,
        };
    }, [materias]);

    // Materias filtradas según cuatrimestre y búsqueda
    const materiasFiltradas = useMemo(() => {
        return materias.filter(materia => {
            const cuat = Number(materia.cuatrimestre);
            if (filtroCuatrimestre === '1c' && cuat !== 1) return false;
            if (filtroCuatrimestre === '2c' && cuat !== 2) return false;
            if (filtroCuatrimestre === 'anual' && cuat !== 3 && cuat !== 0 && cuat <= 2) return false;

            if (busquedaMateria.trim()) {
                const q = busquedaMateria.toLowerCase().trim();
                const nombre = (materia.nombre || '').toLowerCase();
                const codigo = (materia.codigo || '').toLowerCase();
                if (!nombre.includes(q) && !codigo.includes(q)) {
                    return false;
                }
            }
            return true;
        });
    }, [materias, filtroCuatrimestre, busquedaMateria]);

    // Total de horas semanales estimadas de las materias seleccionadas
    const totalHorasSemanales = useMemo(() => {
        return materias
            .filter(m => materiasSeleccionadas.includes(m.id))
            .reduce((total, m) => total + estimarHorasSemanales(m), 0);
    }, [materias, materiasSeleccionadas]);

    const cantidadSeleccionadas = materiasSeleccionadas.length;

    // Indicador semafórico: verde: < 20h, amarillo: 20-30h, rojo: > 30h (US-V07)
    const semaforo = useMemo(() => {
        if (totalHorasSemanales < 20) {
            return {
                estado: 'verde',
                colorPill: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
                dotColor: 'bg-emerald-500',
                titulo: 'Carga Liviana / Óptima',
                rango: '< 20h',
                badgeText: '< 20h (Equilibrado)',
                icono: '🟢'
            };
        }
        if (totalHorasSemanales <= 30) {
            return {
                estado: 'amarillo',
                colorPill: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
                dotColor: 'bg-amber-500',
                titulo: 'Carga Moderada',
                rango: '20-30h',
                badgeText: '20-30h (Moderado)',
                icono: '🟡'
            };
        }
        return {
            estado: 'rojo',
            colorPill: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
            dotColor: 'bg-rose-500',
            titulo: 'Carga Alta / Sobrecarga',
            rango: '> 30h',
            badgeText: '> 30h (Sobrecarga)',
            icono: '🔴'
        };
    }, [totalHorasSemanales]);

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
        const flexiblesFormateadas = actividadesFlexibles.map(act => {
            const hsSemanalesNum = Number(act.horasSemanales);
            const vecesPorSemana = Number(act.duracion);
            const minutosSemanales = hsSemanalesNum * 60; 
            const duracionSesionMinutos = minutosSemanales / vecesPorSemana;
            
            const bitmaskDias = act.diasPreferidos.reduce((acumulador, dia) => {
                return acumulador + (VALORES_DIAS[dia] || 0);
            }, 0);

            return {
                nombre: act.nombre,
                horasSemanales: minutosSemanales,
                duracion: duracionSesionMinutos,
                prioridad: Number(act.prioridad),
                diasPreferidos: bitmaskDias > 0 ? bitmaskDias : 0
            };
        });
        console.log({
            manana: mananaRef.current.checked,
            tarde: tardeRef.current.checked,
            noche: nocheRef.current.checked
        });
        console.log("Datos listos para enviar al algoritmo de asignación:", {
            materias: materiasSeleccionadas,
            fijas: actividadesFijas,
            flexibles: flexiblesFormateadas,
            disponibilidad: {
                manana: mananaRef.current.checked,
                tarde: tardeRef.current.checked,
                noche: nocheRef.current.checked
            }
        });

        const actividadesResultantes = await calcularPlan({
            materias: materiasSeleccionadas,
            fijas: actividadesFijas,
            flexibles: flexiblesFormateadas,
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
        setActividadesPreview([]);
    };

    return (
        <div className="p-6 pb-28 md:pb-32 bg-gray-50 dark:bg-zinc-950 min-h-screen flex flex-col gap-6 font-sans">
            
            {/* ===== PASO 1: SELECCIÓN DE MATERIAS CON FILTROS Y BADGES (US-V07) ===== */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                        <h2 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                            1. Seleccioná las materias que querés cursar (mínimo una)
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-zinc-400">
                            Módulos habilitados para tu plan académico según correlativas cumplidas
                        </p>
                    </div>

                    {cantidadSeleccionadas > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                                {cantidadSeleccionadas} seleccionada{cantidadSeleccionadas > 1 ? 's' : ''} ({totalHorasSemanales} hs)
                            </span>
                        </div>
                    )}
                </div>

                {/* Criterio de Aceptación US-V07: Pestañas de filtrado rápido [Todas], [1° Cuatrimestre], [2° Cuatrimestre], [Anuales] */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                            { id: 'todas', label: 'Todas', count: countsCuatrimestre.todas },
                            { id: '1c', label: '1° Cuatrimestre', count: countsCuatrimestre['1c'] },
                            { id: '2c', label: '2° Cuatrimestre', count: countsCuatrimestre['2c'] },
                            { id: 'anual', label: 'Anuales', count: countsCuatrimestre.anual },
                        ].map((tab) => {
                            const isActive = filtroCuatrimestre === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    id={`tab-filtro-${tab.id}`}
                                    type="button"
                                    onClick={() => setFiltroCuatrimestre(tab.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                        isActive
                                            ? 'bg-indigo-700/80 text-white'
                                            : 'bg-white/80 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Buscador rápido por nombre o código */}
                    <div className="relative min-w-[200px] md:w-64">
                        <input
                            type="text"
                            id="busqueda-materias-planificador"
                            placeholder="Buscar materia o código..."
                            value={busquedaMateria}
                            onChange={(e) => setBusquedaMateria(e.target.value)}
                            className="w-full pl-8 pr-7 py-1.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs text-gray-800 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                        />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {busquedaMateria && (
                            <button
                                type="button"
                                onClick={() => setBusquedaMateria('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
                                title="Limpiar búsqueda"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Listado de materias con badges de horas y cuatrimestre */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materiasFiltradas.map((materia) => {
                        const isSelected = materiasSeleccionadas.includes(materia.id);
                        const horasEstimadas = estimarHorasSemanales(materia);
                        const cuatInfo = getEtiquetaCuatrimestre(materia.cuatrimestre);

                        return (
                            <label 
                                key={materia.id} 
                                htmlFor={`materia-${materia.id}`}
                                className={`p-4 border rounded-xl flex items-start gap-3 transition-all hover:shadow-sm cursor-pointer select-none relative ${
                                    isSelected 
                                        ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs ring-1 ring-indigo-500/30' 
                                        : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <input 
                                    type="checkbox" 
                                    id={`materia-${materia.id}`}
                                    checked={isSelected}
                                    onChange={() => handleMateriaCheck(materia.id)}
                                    className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45 shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-mono font-bold bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                                            {materia.codigo || `ID: ${materia.id}`}
                                        </span>
                                        <span className={`text-[10px] border px-2 py-0.5 rounded-full font-bold ${cuatInfo.bg}`}>
                                            {cuatInfo.texto}
                                        </span>
                                    </div>

                                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-100 mt-1.5 leading-snug line-clamp-2">
                                        {materia.nombre}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                                        {/* Criterio de Aceptación US-V07: Badge con horas cátedra semanales estimadas (ej. 4 hs/sem) */}
                                        <span 
                                            id={`badge-horas-${materia.id}`}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 px-2 py-0.5 rounded-md shadow-2xs"
                                            title={`Carga horaria semanal estimada: ${horasEstimadas} horas cátedra`}
                                        >
                                            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{horasEstimadas} hs/sem</span>
                                        </span>

                                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50 px-2 py-0.5 rounded-full font-bold">
                                            Habilitada
                                        </span>

                                        {materia.nivel_anio && (
                                            <span className="text-[10px] bg-gray-150 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 px-2 py-0.5 rounded-full font-bold">
                                                Nivel {materia.nivel_anio}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {materiasFiltradas.length === 0 && (
                    <div className="text-center py-10 px-4 bg-gray-50/60 dark:bg-zinc-800/30 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 mt-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                            {materias.length === 0 
                                ? 'No hay materias habilitadas disponibles para mostrar.' 
                                : 'No se encontraron materias con el filtro actual.'}
                        </p>
                        {materias.length > 0 && (
                            <button
                                type="button"
                                onClick={() => { setFiltroCuatrimestre('todas'); setBusquedaMateria(''); }}
                                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                            >
                                Ver todas las materias habilitadas
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ===== PASO 2: FILTROS + ACTIVIDADES (ancho completo, layout horizontal interno) ===== */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-200">
                <h2 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-4">2. Configurá tus preferencias y actividades</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* COLUMNA A: Filtros de disponibilidad */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3">Disponibilidad horaria</h3>
                            <div className="flex flex-col gap-2 text-xs text-gray-700 dark:text-slate-200">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={mananaRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Mañana (08:00 - 12:00)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={tardeRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Tarde (13:00 - 18:00)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input ref={nocheRef} type="checkbox" defaultChecked className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45" />
                                    Noche (18:00 - 22:00)
                                </label>
                            </div>
                        </div>

                        {/* Actividades cargadas */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3">Actividades cargadas</h3>
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                                {actividadesFijas.map(act => (
                                    <div key={act.id} className="flex justify-between items-center bg-blue-50/70 dark:bg-blue-950/30 p-3 rounded-xl text-xs border border-blue-100 dark:border-blue-900/40">
                                        <div>
                                            <p className="font-semibold text-blue-900 dark:text-blue-200">{act.nombre}</p>
                                            <p className="text-blue-600 dark:text-blue-400 text-[11px]">Fija • {act.horaInicio} ({act.duracion} min)</p>
                                        </div>
                                        <button 
                                            onClick={() => handleEliminarFija(act.id)}
                                            className="text-gray-400 hover:text-red-500 transition text-sm p-1 cursor-pointer"
                                            title="Eliminar actividad fija"
                                        >🗑️</button>
                                    </div>
                                ))}
                                {actividadesFlexibles.map((act, index) => (
                                    <div key={index} className="flex justify-between items-center bg-purple-50/70 dark:bg-purple-950/30 p-3 rounded-xl text-xs border border-purple-100 dark:border-purple-900/40">
                                        <div>
                                            <p className="font-semibold text-purple-900 dark:text-purple-200">{act.nombre}</p>
                                            <p className="text-purple-600 dark:text-purple-400 text-[11px]">
                                                Flexible • Prioridad {act.prioridad} • {act.horasSemanales}hs totales ({act.duracion} veces/sem)
                                            </p>
                                            {act.diasPreferidos && act.diasPreferidos.length > 0 && (
                                                <div className="flex gap-1 mt-1 flex-wrap">
                                                    {act.diasPreferidos.map(dia => (
                                                        <span key={dia} className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
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
                                    <p className="text-xs text-gray-400 dark:text-slate-500 italic text-center py-2">No hay actividades registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA B: Formulario de actividades flexibles */}
                    <div className="lg:col-span-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3">Agregar actividades de mis tiempos libres</h3>
                        <form onSubmit={handleAgregarFlexible} className="flex flex-col gap-2.5">
                            <input 
                                type="text" 
                                placeholder="Nombre (Ej: Gimnasio, Cursillo)" 
                                value={nuevaFlexible.nombre}
                                onChange={e => setNuevaFlexible({...nuevaFlexible, nombre: e.target.value})}
                                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors duration-200"
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-400 dark:text-slate-400 font-medium block mb-1">Horas semanales</label>
                                    <input 
                                        type="number" min="1" placeholder="Ej: 3" 
                                        value={nuevaFlexible.horasSemanales}
                                        onChange={e => setNuevaFlexible({...nuevaFlexible, horasSemanales: e.target.value})}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 dark:text-slate-400 font-medium block mb-1">Veces a la semana</label>
                                    <input 
                                        type="number" min="1" placeholder="Ej: 3" 
                                        value={nuevaFlexible.duracion}
                                        onChange={e => setNuevaFlexible({...nuevaFlexible, duracion: e.target.value})}
                                        className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
                                <label className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                                    Días de preferencia (Opcional)
                                </label>
                                <div className="grid grid-cols-4 gap-1.5 text-[11px] text-gray-600 dark:text-slate-300">
                                    {diasSemana.map(dia => (
                                        <label key={dia} className="flex items-center gap-1 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={nuevaFlexible.diasPreferidos.includes(dia)}
                                                onChange={() => handleDiaCheck(dia)}
                                                className="appearance-none w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition-all cursor-pointer relative after:content-[''] after:absolute after:hidden checked:after:block after:left-[6px] after:top-[2px] after:w-[5px] after:h-[10px] after:border-white after:border-r-2 after:border-b-2 after:rotate-45"
                                            />
                                            {dia.substring(0, 3)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <select 
                                value={nuevaFlexible.prioridad}
                                onChange={e => setNuevaFlexible({...nuevaFlexible, prioridad: Number(e.target.value)})}
                                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-gray-800 dark:text-slate-100 outline-none focus:border-indigo-500 transition-colors duration-200"
                            >
                                <option value={1}>Prioridad Alta (1)</option>
                                <option value={2}>Prioridad Media (2)</option>
                                <option value={3}>Prioridad Baja (3)</option>
                            </select>
                            <button 
                                type="submit" 
                                className="w-full bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold py-2 rounded-lg text-xs transition cursor-pointer"
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
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-200">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-slate-100 mb-4">3. Vista previa de tu planificación semanal</h2>
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
                            className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-200 font-bold py-3 rounded-xl text-xs transition shadow-sm cursor-pointer border border-gray-200 dark:border-slate-700 flex items-center justify-center gap-1"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* ===== STICKY SUMMARY: BARRA FLOTANTE INFERIOR (Criterio de Aceptación US-V07) ===== */}
            <div 
                id="sticky-summary-planificador"
                className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl z-40 transition-all duration-300"
            >
                <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/90 dark:border-slate-800 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-200">
                    
                    {/* Resumen: "X materias seleccionadas | Y horas semanales estimadas" */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/40">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wide">
                                Resumen del Plan
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2 flex-wrap">
                                <span>{cantidadSeleccionadas} materias seleccionadas</span>
                                <span className="text-gray-300 dark:text-zinc-600">|</span>
                                <span className="text-indigo-600 dark:text-indigo-400">{totalHorasSemanales} horas semanales estimadas</span>
                            </p>
                        </div>
                    </div>

                    {/* Indicador Semafórico (verde: < 20h, amarillo: 20-30h, rojo: > 30h) */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                        <div 
                            id="indicador-semaforo-carga"
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${semaforo.colorPill}`}
                            title={`Semáforo: ${semaforo.rango} - ${semaforo.titulo}`}
                        >
                            <span className="relative flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${semaforo.dotColor}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${semaforo.dotColor}`}></span>
                            </span>
                            <span>{semaforo.icono} {semaforo.titulo} ({semaforo.badgeText})</span>
                        </div>

                        {cantidadSeleccionadas > 0 && (
                            <button
                                type="button"
                                id="btn-limpiar-seleccion-planificador"
                                onClick={() => setMateriasSeleccionadas([])}
                                className="text-xs text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 font-medium underline px-2 py-1 transition cursor-pointer shrink-0"
                                title="Desmarcar todas las materias seleccionadas"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Planificador;
