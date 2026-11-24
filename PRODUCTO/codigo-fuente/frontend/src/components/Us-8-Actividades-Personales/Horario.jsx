import React, { useState, useEffect, useMemo } from 'react';
import ActividadEditor from './ActividadEditor';
import { getActividades, PostActividad, PutActividad, DeleteActividad } from './services';
import {
    DAYS,
    PIXELS_POR_HORA,
    calcularHoraFin,
    calcularPosicionY,
    calcularAltura,
    buildDiasActividades,
    buildColumns,
    buildActiveColumns,
    calcularRangoHorario,
    buildHoras,
} from './horarioUtils';

/**
 * Procesa los eventos de un día para detectar solapamientos y calcular
 * columnas paralelas (ancho y posición horizontal) automáticamente.
 */
const procesarEventosConColisiones = (actividadesDelDia) => {
    if (!actividadesDelDia || actividadesDelDia.length === 0) return [];

    const parseMinutos = (horaStr) => {
        if (!horaStr) return 0;
        const [h, m] = horaStr.split(':').map(Number);
        return h * 60 + m;
    };

    const acts = actividadesDelDia.map(act => ({
        ...act,
        inicioMin: parseMinutos(act.horaInicio),
        finMin: parseMinutos(act.horaInicio) + (act.duracion || 60)
    })).sort((a, b) => a.inicioMin - b.inicioMin || (b.finMin - b.inicioMin) - (a.finMin - a.inicioMin));

    const clusters = [];
    let currentCluster = [];

    acts.forEach(act => {
        if (currentCluster.length === 0) {
            currentCluster.push(act);
        } else {
            const seSolapaConCluster = currentCluster.some(item => 
                Math.max(act.inicioMin, item.inicioMin) < Math.min(act.finMin, item.finMin)
            );
            if (seSolapaConCluster) {
                currentCluster.push(act);
            } else {
                clusters.push(currentCluster);
                currentCluster = [act];
            }
        }
    });
    if (currentCluster.length > 0) {
        clusters.push(currentCluster);
    }

    const resultadoFinal = [];

    clusters.forEach(cluster => {
        const columns = [];
        const assigned = [];

        cluster.forEach(act => {
            let placedCol = -1;
            for (let c = 0; c < columns.length; c++) {
                if (columns[c] <= act.inicioMin) {
                    placedCol = c;
                    columns[c] = act.finMin;
                    break;
                }
            }
            if (placedCol === -1) {
                placedCol = columns.length;
                columns.push(act.finMin);
            }
            assigned.push({ ...act, colIndex: placedCol });
        });

        const totalCols = columns.length;

        assigned.forEach(act => {
            resultadoFinal.push({
                ...act,
                totalCols,
                hasConflict: totalCols > 1
            });
        });
    });

    return resultadoFinal;
};

const Horario = ({ refresh, actividades: actividadesProp, onActividadesChange }) => {

    const [showEditor,         setShowEditor]         = useState(false);
    const [actividadEditando,  setActividadEditando]  = useState(null);
    const [actividadesInternas, setActividadesInternas] = useState([]);
    const [selectedDayTab,     setSelectedDayTab]     = useState(1);

    const actividades = actividadesProp ?? actividadesInternas;
 
    const setActividades = (updater) => {
        setActividadesInternas((prev) =>
            typeof updater === 'function' ? updater(prev) : updater
        );
    };

    useEffect(() => {
        if (!actividadesProp) {
            onActividadesChange?.(actividadesInternas);
        }
    }, [actividadesInternas]);

    const cargarActividades = async () => {
        try {
            const data = await getActividades();
            setActividades(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!actividadesProp) cargarActividades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);

    const diasActividades = useMemo(() => buildDiasActividades(actividades), [actividades]);
    const columns         = useMemo(() => buildColumns(diasActividades),      [diasActividades]);
    const activeColumns   = useMemo(() => buildActiveColumns(columns, selectedDayTab), [columns, selectedDayTab]);

    const { minHora, maxHora } = useMemo(
        () => calcularRangoHorario(columns, actividades),
        [columns, actividades]
    );

    const horas = useMemo(() => buildHoras(minHora, maxHora), [minHora, maxHora]);

    const handleSaveActividad = async (actividadActualizada) => {
        try {
            if (actividadActualizada.id !== 'preview') {
                const actResp = await PutActividad(actividadActualizada);
                setActividades((prev) =>
                    prev.map((act) => (act.id === actResp.id ? actResp : act))
                );
            } else {
                const nuevaActividad = {
                    nombre:     actividadActualizada.nombre,
                    horaInicio: actividadActualizada.horaInicio,
                    duracion:   actividadActualizada.duracion,
                    dias:       actividadActualizada.dias,
                    color:      actividadActualizada.color,
                    idUsuario:  actividadActualizada.idUsuario,
                };
                const actResp = await PostActividad(nuevaActividad);
                setActividades((prev) =>
                    prev.filter((act) => act.id !== 'preview').concat(actResp)
                );
            }
            setShowEditor(false);
            setActividadEditando(null);
        } catch (error) {
            console.error('Error al guardar la actividad:', error);
            alert('No se pudo guardar la actividad. Por favor, verifique los datos e intente nuevamente.');
        }
    };

    const handlePreviewActividad = (nuevaActividad) => {
        if (nuevaActividad.id !== 'preview') {
            setActividades((prev) =>
                prev.map((act) => (act.id === nuevaActividad.id ? nuevaActividad : act))
            );
        } else {
            setActividades((prev) => [
                ...prev.filter((act) => act.id !== 'preview'),
                { ...nuevaActividad, id: 'preview' },
            ]);
        }
    };

    const handleEditActividad   = (actividad) => { setActividadEditando(actividad); setShowEditor(true); };

    const handleNewActividad    = (horaInicio, dayId) => {
        const nuevaActividad = {
            id:         'preview',
            nombre:     '',
            horaInicio,
            duracion:   60,
            horaFin:    calcularHoraFin(horaInicio, 60),
            color:      '#FFCCD9',
            dias:       dayId,
            idUsuario:  1,
        };
        setActividadEditando(nuevaActividad);
        setShowEditor(true);
    };

    const handleCancel = () => {
        setActividades((prev) => prev.filter((act) => act.id !== 'preview'));
        setActividadEditando(null);
        setShowEditor(false);
    };

    const handleDelete = () => {
        setActividades((prev) => prev.filter((act) => act.id !== actividadEditando.id));
        DeleteActividad(actividadEditando.id);
        setActividadEditando(null);
        setShowEditor(false);
    };

    return (
        <>
            <div className="w-full min-w-0 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-lg overflow-hidden transition-colors duration-200">
                <div className="flex md:hidden justify-between gap-1 p-2.5 bg-gray-50 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800 transition-colors duration-200">
                    {DAYS.map(([name, value]) => {
                        const isActive = selectedDayTab === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setSelectedDayTab(value)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer text-center ${
                                    isActive
                                        ? 'bg-indigo-500 text-white shadow-sm scale-105'
                                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-150 dark:hover:bg-slate-700'
                                }`}
                            >
                                {name.slice(0, 3)}
                            </button>
                        );
                    })}
                </div>

                <div className="overflow-x-auto">
                    <div className="flex w-full" style={{ minWidth: 'min(600px, 100%)' }}>
                        <div className="flex-shrink-0 w-14 md:w-20 bg-gray-50 dark:bg-slate-900 border-r-2 border-gray-200 dark:border-slate-800 transition-colors duration-200">
                            <div className="h-16 flex items-center justify-center font-bold bg-gray-100 dark:bg-slate-800/80 border-b-2 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-200 text-sm transition-colors duration-200">
                                Hora
                            </div>
                            {horas.map((hora) => (
                                <div
                                    key={hora}
                                    className="h-8 flex items-start justify-center text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-800/60 pt-1 transition-colors duration-200"
                                >
                                    {hora}
                                </div>
                            ))}
                        </div>

                        {activeColumns.map((column) => {
                            const isVisible = column.id === selectedDayTab;
                            const eventosProcesados = procesarEventosConColisiones(column.data);

                            return (
                                <div
                                    key={column.id}
                                    className={`flex-1 min-w-0 relative border-r border-gray-100 dark:border-slate-800 ${
                                        isVisible ? 'flex' : 'hidden md:flex'
                                    } flex-col transition-colors duration-200`}
                                >
                                    <div className="h-16 flex items-center justify-center font-semibold text-sm border-b-2 border-gray-200 dark:border-slate-800 px-1 text-center text-gray-800 dark:text-slate-100 bg-gray-50/50 dark:bg-slate-800/40 transition-colors duration-200">
                                        {column.title}
                                    </div>

                                    <div
                                        className="relative"
                                        style={{
                                            minHeight: `${(maxHora - minHora + 1) * PIXELS_POR_HORA}px`,
                                        }}
                                    >
                                        {horas.map((hora) => (
                                            <div
                                                key={hora}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' && handleNewActividad(hora, column.id)
                                                }
                                                className="h-8 border-b border-gray-100 dark:border-slate-800/60 w-full text-left transition-colors duration-200 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-slate-800/50"
                                                onClick={() => handleNewActividad(hora, column.id)}
                                            />
                                        ))}

                                        {/* Actividades con resolución de colisiones y colores personalizados */}
                                        {eventosProcesados.map((act, idx) => {
                                        // Si hay conflicto, usamos el color de la actividad con opacidad o un tono claro, manteniendo el borde punteado
                                            const colorBase = act.color ?? "#B5E3FF";
    
                                            return (
                                                <div
                                                    key={`${act.horaInicio}-${idx}-${act.id || idx}`}
                                                    className={`absolute p-1.5 overflow-hidden shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between rounded-sm ${
                                                        act.hasConflict 
                                                            ? 'border-2 border-dashed border-amber-500 z-10 hover:z-30 hover:shadow-xl' 
                                                            : 'hover:z-20 hover:shadow-lg hover:scale-[1.02]'
                                                    }`}
                                                    onClick={(e) => { e.stopPropagation(); handleEditActividad(act); }}
                                                    style={{
                                                        // Si hay conflicto, bajamos la intensidad del fondo manteniendo el color elegido por el usuario
                                                        backgroundColor: act.hasConflict ? `${colorBase}33` : colorBase, // 33 añade transparencia en HEX (~20%)
                                                        top:    `${calcularPosicionY(act.horaInicio, minHora)}px`,
                                                        height: `${calcularAltura(act.duracion)}px`,
                                                        width:  `calc(${100 / act.totalCols}% - 4px)`,
                                                        left:   `calc(${(act.colIndex * 100) / act.totalCols}% + 2px)`,
                                                    }}
                                                    title={`${act.nombre}\n${act.horaInicio} - ${act.horaFin}${act.hasConflict ? '\n⚠️ Conflicto de horario detectado con otra actividad.' : ''}`}
                                                >
                                                    <div className="flex items-start justify-between gap-1">
                                                        <div className="font-bold text-xs text-gray-800 capitalize leading-tight truncate">
                                                            {act.nombre}
                                                        </div>
                                                        {act.hasConflict && (
                                                            <span className="flex-shrink-0 text-amber-600 bg-amber-100/80 rounded-full p-0.5 shadow-xs" title="Horario superpuesto">
                                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-gray-700 mt-0.5 font-medium">
                                                        {act.horaInicio} – {act.horaFin}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {(!actividadesProp) && (
                <ActividadEditor
                    editor={showEditor}
                    setEditor={setShowEditor}
                    actividadActual={actividadEditando}
                    setActividadActual={setActividadEditando}
                    preview={handlePreviewActividad}
                    onSave={handleSaveActividad}
                    onCancel={handleCancel}
                    DeleteActividad={handleDelete}
            />)}
        </>
    );
};

export default Horario;