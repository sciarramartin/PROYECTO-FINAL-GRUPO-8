import React, { useState, useEffect, useMemo } from 'react';
import TimeSelect from './timeSelect';


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
        color: '#FFB3BA', // Color por defecto (azul)
        dias: 0,
        idUsuario: 1 // Esto debería venir del contexto/usuario actual
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

    // previsualizar actividad
    useEffect(() => {

        // Construir objeto actividad
        const nuevaActividad = {
            ...(actividadActual?.id && { id: actividadActual.id }), // Solo incluir id si existe
            nombre: formData.nombre,
            horaInicio: formData.horaInicio,
            duracion: duracion,
            horaFin: formData.horaFin,
            dias: formData.dias,
            color: formData.color, // Mantener color existente o usar default
            idUsuario: formData.idUsuario
        };

        // Notificar al padre
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


    // guardar edición
    const handleSave = () => {
        // Validaciones
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
    // Minutos
    const minOpts = ['00', '30'];

    if (!editor) return null;

    return (
        <div className="fixed bottom-0 left-0 md:left-52 right-0 bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)] z-50">
            <div className="px-4 py-2 flex flex-col gap-2">

                {/* Fila 2: Días + Colores + Horas */}
                <div className="flex items-center gap-x-3 gap-y-2 flex-wrap pb-1">

                    {/* Días */}
                    <div className="flex gap-1 shrink-0">
                        {days.map(([dayName, dayValue]) => (
                            <button
                                key={dayName}
                                type="button"
                                onClick={() => toggleDay(dayValue)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer
                                    ${(formData.dias & dayValue) !== 0
                                        ? 'bg-indigo-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                title={dayName}
                            >
                                {dayName.charAt(0)}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200 shrink-0" />

                    {/* Colores */}
                    <div className="flex gap-1.5 items-center shrink-0">
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
                                className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                                    formData.color === color.value
                                        ? 'border-gray-700 scale-110 shadow-sm'
                                        : 'border-transparent hover:border-gray-300'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200 shrink-0" />

                    {/* Horas */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        <span className="text-xs text-gray-400">Inicio</span>
                        <TimeSelect
                            value={formData.horaInicio.split(':')[0]}
                            options={horaOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaInicio: `${v}:${formData.horaInicio.split(':')[1]}` }))}
                        />
                        <span className="text-gray-300 text-sm">:</span>
                        <TimeSelect
                            value={formData.horaInicio.split(':')[1]}
                            options={minOpts}
                            freeInput={true}
                            min={0}
                            max={59}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaInicio: `${formData.horaInicio.split(':')[0]}:${v}` }))}
                        />

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        <span className="text-xs text-gray-400">Fin</span>
                        <TimeSelect
                            value={formData.horaFin.split(':')[0]}
                            options={horaOpts}
                            onChange={(v) => setFormData(prev => ({ ...prev, horaFin: `${v}:${formData.horaFin.split(':')[1]}` }))}
                        />
                        <span className="text-gray-300 text-sm">:</span>
                        <TimeSelect
                            value={formData.horaFin.split(':')[1]}
                            options={minOpts}
                            freeInput={true}
                            min={0}
                            max={59}
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
                        className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 text-gray-700 placeholder:text-gray-300 min-w-0 flex-1"
                        placeholder="Nombre de la actividad"
                    />
                    <div className="flex gap-2 shrink-0">
                        {/* Eliminar — solo si no es una actividad nueva */}
                        {actividadActual?.id !== 'preview' && (
                            <button
                                type="button"
                                onClick={() => handleDelete()}
                                className="px-3 py-1.5 text-sm font-medium text-red-400 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-600 transition cursor-pointer"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition cursor-pointer shadow-sm"
                        >
                            Guardar
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ActividadEditor;