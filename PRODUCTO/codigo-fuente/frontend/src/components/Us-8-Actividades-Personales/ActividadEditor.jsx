import React, { useState, useEffect, useMemo } from 'react';
import TimeSelect from './timeSelect';
import useFocusTrap from '../../hooks/useFocusTrap';

const ActividadEditor = ({ editor, setEditor, actividadActual, setActividadActual, preview, onSave, onCancel, DeleteActividad }) => {
    const days = [
        ['Lunes', 1],
        ['Martes', 2],
        ['Miércoles', 4],
        ['Jueves', 8],
        ['Viernes', 16],
        ['Sábado', 32],
        ['Domingo', 64]
    ];

    // Estado local para el formulario
    const [formData, setFormData] = useState({
        nombre: '',
        horaInicio: '08:00',
        horaFin: '09:00',
        duracion: 60,
        color: '#FFB3BA', // Color por defecto
        dias: 0,
        idUsuario: 1
    });

    const duracion = useMemo(() => {
        const [hInicio, mInicio] =
            formData.horaInicio.split(':').map(Number);

        const [hFin, mFin] =
            formData.horaFin.split(':').map(Number);

        return (hFin - hInicio) * 60 + (mFin - mInicio);
    }, [formData.horaInicio, formData.horaFin]);

    // Cargar datos de la actividad si estamos editando
    useEffect(() => {
        if (actividadActual) {
            setFormData({
                id: actividadActual.id || '1000',
                nombre: actividadActual.nombre || '',
                horaInicio: actividadActual.horaInicio || '08:00',
                horaFin: actividadActual.horaFin || '09:00',
                duracion: actividadActual.duracion || 60,
                dias: actividadActual.dias || 0,
                color: actividadActual.color,
                idUsuario: actividadActual.idUsuario || 1
            });
        }
    }, [actividadActual, editor]);

    // Manejar selección de días
    const toggleDay = (dayValue) => {
        setFormData(prev => ({
            ...prev,
            dias: (prev.dias & dayValue) !== 0 
                ? prev.dias & ~dayValue  // Remover día
                : prev.dias | dayValue   // Agregar día
        }));
    };

    // Previsualizar actividad
    useEffect(() => {
        const nuevaActividad = {
            ...(actividadActual?.id && { id: actividadActual.id }),
            nombre: formData.nombre,
            horaInicio: formData.horaInicio,
            duracion: duracion,
            horaFin: formData.horaFin,
            dias: formData.dias,
            color: formData.color,
            idUsuario: formData.idUsuario
        };

        if (preview) {
            preview(nuevaActividad);
        }
    }, [formData, editor]);

    // Cancelar edición
    const handleCancel = () => {
        setEditor(false);
        if (setActividadActual) {
            setActividadActual(null);
        }
        onCancel();
    };

    const handleDelete = () => {
        setEditor(false);
        if (setActividadActual) {
            DeleteActividad();
        }
    };

    // Focus trap hook: Atrapa el foco dentro del editor y cierra con Escape (WCAG AA US-V10)
    const focusTrapRef = useFocusTrap(editor, handleCancel);

    // Guardar edición
    const handleSave = () => {
        if (!formData.nombre.trim()) {
            alert('El nombre de la actividad es requerido');
            return;
        }
        
        if (formData.dias === 0) {
            alert('Debes seleccionar al menos un día');
            return;
        }

        let minInicio = formData.horaInicio.split(':').map(Number);
        let minFin = formData.horaFin.split(':').map(Number);
        const nuevaDuracion =
            (minFin[0] - minInicio[0]) * 60 +
            (minFin[1] - minInicio[1]);

        if (nuevaDuracion <= 0) {
            alert('La hora de fin debe ser posterior a la hora de inicio (duración mayor a 0 minutos)');
            return;
        }

        const actividadFinal = {
            ...formData,
            duracion: nuevaDuracion
        };
        onSave(actividadFinal);
    };

    const horaOpts = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    
    // Minutos del 00 al 59 inclusive en formato desplegable idéntico a las horas
    const minOpts = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    if (!editor) return null;

    return (
        <div 
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Editor de actividad personal"
            className="fixed bottom-0 left-0 md:left-52 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-1px_8px_rgba(0,0,0,0.2)] z-50 transition-colors duration-200"
        >
            <div className="px-4 py-2 flex flex-col gap-2">

                {/* Fila 2: Días + Colores + Horas */}
                <div className="flex items-center gap-x-3 gap-y-2 flex-wrap pb-1">

                    {/* Días */}
                    <div className="flex gap-1 shrink-0" role="group" aria-label="Días de la semana">
                        {days.map(([dayName, dayValue]) => (
                            <button
                                key={dayName}
                                type="button"
                                onClick={() => toggleDay(dayValue)}
                                aria-pressed={(formData.dias & dayValue) !== 0}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer
                                    ${(formData.dias & dayValue) !== 0
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                title={dayName}
                            >
                                {dayName.charAt(0)}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 shrink-0" />

                    {/* Colores */}
                    <div className="flex gap-1.5 items-center shrink-0" role="radiogroup" aria-label="Color de la actividad">
                        {[
                            { name: 'Rosa',        value: '#D08B9B' },
                            { name: 'Verde claro', value: '#C5E99B' },
                            { name: 'Azul claro',  value: '#B5E3FF' },
                            { name: 'Durazno',     value: '#E9C772' },
                            { name: 'Violeta',     value: '#E0BBE4' },
                            { name: 'Menta',       value: '#B5F5E3' },
                            { name: 'Rosa suave',  value: '#FFCCD9' },
                        ].map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                aria-label={`Seleccionar color ${color.name}`}
                                className={`w-5 h-5 rounded-full border-2 transition-transform duration-200 cursor-pointer ${
                                    formData.color === color.value
                                        ? 'border-gray-800 dark:border-white scale-110 shadow-sm'
                                        : 'border-transparent hover:border-gray-400 dark:hover:border-slate-500'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 shrink-0" />

                    {/* Horas y Minutos con desplegables idénticos */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">Inicio</span>
                        <TimeSelect
                            value={formData.horaInicio.split(':')[0]}
                            options={horaOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaInicio: `${v}:${formData.horaInicio.split(':')[1]}` }))}
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">:</span>
                        <TimeSelect
                            value={formData.horaInicio.split(':')[1]}
                            options={minOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaInicio: `${formData.horaInicio.split(':')[0]}:${v}` }))}
                        />

                        <div className="w-px h-5 bg-gray-200 dark:bg-slate-700 shrink-0" />

                        <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">Fin</span>
                        <TimeSelect
                            value={formData.horaFin.split(':')[0]}
                            options={horaOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaFin: `${v}:${formData.horaFin.split(':')[1]}` }))}
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">:</span>
                        <TimeSelect
                            value={formData.horaFin.split(':')[1]}
                            options={minOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaFin: `${formData.horaFin.split(':')[0]}:${v}` }))}
                        />
                    </div>

                </div>

                {/* Fila 1: Nombre + Botones */}
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="px-2.5 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 min-w-0 flex-1 transition-colors duration-200 font-medium"
                        placeholder="Nombre de la actividad"
                        aria-label="Nombre de la actividad"
                    />
                    <div className="flex gap-2 shrink-0">
                        {actividadActual?.id !== 'preview' && (
                            <button
                                type="button"
                                onClick={() => handleDelete()}
                                className="px-3 py-1.5 text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors duration-200 cursor-pointer"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 cursor-pointer shadow-sm"
                        >
                            Guardar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActividadEditor;