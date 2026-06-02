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
 * Horario
 *
 * Props:
 *  - refresh           {any}       – cambiar su valor recarga las actividades desde la API
 *  - actividades       {Array}     – (opcional) lista controlada externamente; si se pasa,
 *                                    el componente la usa en lugar de su estado interno
 *  - onActividadesChange {Function} – (opcional) callback (actividades) => void; se llama
 *                                    cada vez que la lista interna cambia, permitiendo al
 *                                    padre leerla o sincronizarla
 */
const Horario = ({ refresh, actividades: actividadesProp, onActividadesChange }) => {

    // ─── Estado ──────────────────────────────────────────────────────────────
    const [showEditor,         setShowEditor]         = useState(false);
    const [actividadEditando,  setActividadEditando]  = useState(null);
    const [actividadesInternas, setActividadesInternas] = useState([]);
    const [selectedDayTab,     setSelectedDayTab]     = useState(1);

    // Si el padre pasa actividades, usamos las suyas; si no, las propias.
    const actividades = actividadesProp ?? actividadesInternas;

    /** Actualiza el estado interno Y notifica al padre (si escucha). */
    const setActividades = (updater) => {
        setActividadesInternas((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            onActividadesChange?.(next);
            return next;
        });
    };

    // ─── Carga inicial ────────────────────────────────────────────────────────
    const cargarActividades = async () => {
        try {
            const data = await getActividades();
            setActividades(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        // Solo cargamos desde la API cuando el componente gestiona su propio estado
        if (!actividadesProp) cargarActividades();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);

    // ─── Derivados (memoizados) ───────────────────────────────────────────────
    const diasActividades = useMemo(() => buildDiasActividades(actividades), [actividades]);
    const columns         = useMemo(() => buildColumns(diasActividades),      [diasActividades]);
    const activeColumns   = useMemo(() => buildActiveColumns(columns, selectedDayTab), [columns, selectedDayTab]);

    const { minHora, maxHora } = useMemo(
        () => calcularRangoHorario(columns, actividades),
        [columns, actividades]
    );

    const horas = useMemo(() => buildHoras(minHora, maxHora), [minHora, maxHora]);

    // ─── Handlers del editor ──────────────────────────────────────────────────
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

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {/*
             * Contenedor principal:
             *   - w-full + min-w-0 → se adapta al contenedor padre sin desbordarse
             *   - overflow-hidden en móvil; en escritorio el scroll interno queda
             *     dentro del componente, no en el layout externo
             */}
            <div className="w-full min-w-0 bg-white rounded-xl shadow-lg overflow-hidden">

                {/* Selector de día – solo móvil */}
                <div className="flex md:hidden justify-between gap-1 p-2.5 bg-gray-50 border-b border-gray-200">
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
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {name.slice(0, 3)}
                            </button>
                        );
                    })}
                </div>

                {/*
                 * Grilla:
                 *  - En móvil: una sola columna de día visible → no hay scroll horizontal
                 *  - En escritorio: overflow-x-auto acotado a este div, no al layout padre.
                 *    Las columnas usan flex-1 con min-w-0 para repartir el ancho disponible;
                 *    si el espacio es muy reducido se activa el scroll interno.
                 */}
                <div className="overflow-x-auto">
                    <div className="flex w-full" style={{ minWidth: 'min(600px, 100%)' }}>

                        {/* Columna de horas */}
                        <div className="flex-shrink-0 w-14 md:w-20 bg-gray-50 border-r-2 border-gray-200">
                            <div className="h-16 flex items-center justify-center font-bold bg-gray-100 border-b-2 border-gray-200 text-gray-700 text-sm">
                                Hora
                            </div>
                            {horas.map((hora) => (
                                <div
                                    key={hora}
                                    className="h-8 flex items-start justify-center text-xs text-gray-500 border-b border-gray-100 pt-1"
                                >
                                    {hora}
                                </div>
                            ))}
                        </div>

                        {/* Columnas de días */}
                        {activeColumns.map((column) => {
                            const isVisible = column.id === selectedDayTab;
                            return (
                                <div
                                    key={column.id}
                                    className={`flex-1 min-w-0 relative border-r border-gray-100 ${
                                        isVisible ? 'flex' : 'hidden md:flex'
                                    } flex-col`}
                                >
                                    {/* Encabezado del día */}
                                    <div className="h-16 flex items-center justify-center font-semibold text-sm border-b-2 border-gray-200 px-1 text-center">
                                        {column.title}
                                    </div>

                                    {/* Cuerpo de la columna */}
                                    <div
                                        className="relative"
                                        style={{
                                            minHeight: `${(maxHora - minHora + 1) * PIXELS_POR_HORA}px`,
                                        }}
                                    >
                                        {/* Franjas de fondo (clickeables para nueva actividad) */}
                                        {horas.map((hora) => (
                                            <div
                                                key={hora}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) =>
                                                    e.key === 'Enter' && handleNewActividad(hora, column.id)
                                                }
                                                className="h-8 border-b border-gray-100 w-full text-left transition-all cursor-pointer hover:bg-gray-50/70"
                                                onClick={() => handleNewActividad(hora, column.id)}
                                            />
                                        ))}

                                        {/* Actividades */}
                                        {column.data.map((act, idx) => (
                                            <div
                                                key={`${act.horaInicio}-${idx}`}
                                                className="absolute left-0.5 right-0.5 p-1.5 overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] flex flex-col justify-between rounded-sm"
                                                onClick={(e) => { e.stopPropagation(); handleEditActividad(act); }}
                                                style={{
                                                    backgroundColor: act.color,
                                                    top:    `${calcularPosicionY(act.horaInicio, minHora)}px`,
                                                    height: `${calcularAltura(act.duracion)}px`,
                                                }}
                                                title={`${act.nombre}\n${act.horaInicio} - ${act.horaFin}`}
                                            >
                                                <div className="font-bold text-xs text-gray-600 capitalize leading-tight truncate">
                                                    {act.nombre}
                                                </div>
                                                <div className="text-[10px] text-gray-700 mt-0.5">
                                                    {act.horaInicio} – {act.horaFin}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Editor lateral / modal */}
            <ActividadEditor
                editor={showEditor}
                setEditor={setShowEditor}
                actividadActual={actividadEditando}
                setActividadActual={setActividadEditando}
                preview={handlePreviewActividad}
                onSave={handleSaveActividad}
                onCancel={handleCancel}
                DeleteActividad={handleDelete}
            />
        </>
    );
};

export default Horario;