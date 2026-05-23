import React, { useState, useEffect, useMemo } from 'react';

const ActividadEditor = ({ editor, setEditor, actividadActual, setActividadActual, preview, onSave, onCancel }) => {
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



    if (!editor) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-150 overflow-hidden transform scale-100 transition-all duration-200">
                <div className="p-5">
                    {/* Encabezado */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                        <h3 className="text-base font-bold text-gray-800">
                            {actividadActual?.id === 'preview' ? 'Nueva Actividad' : 'Editar Actividad'}
                        </h3>
                        <button 
                            type="button"
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-gray-650 transition cursor-pointer text-lg font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Contenido del Formulario */}
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Nombre de la actividad
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, nombre: e.target.value }));
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
                                placeholder="Ej. Estudiar, Entrenar..."
                            />
                        </div>

                        {/* Horas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Hora Inicio
                                </label>
                                <div className="flex items-center gap-1">
                                    <select
                                        name="horaInicio"
                                        value={formData.horaInicio.split(':')[0]}
                                        onChange={(e) => {
                                            const nuevaHora = `${e.target.value.padStart(2, '0')}:${formData.horaInicio.split(':')[1]}`;
                                            setFormData(prev => ({ ...prev, horaInicio: nuevaHora }));
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-gray-400">:</span>
                                    <select
                                        value={formData.horaInicio.split(':')[1]}
                                        onChange={(e) => {
                                            const nuevaHora = `${formData.horaInicio.split(':')[0]}:${e.target.value}`;
                                            setFormData(prev => ({ ...prev, horaInicio: nuevaHora }));
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white"
                                    >
                                        <option value="00">00</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Hora Fin
                                </label>
                                <div className="flex items-center gap-1">
                                    <select
                                        name="hora_fin"
                                        value={formData.horaFin.split(':')[0]}
                                        onChange={(e) => {
                                            const nuevaHora = `${e.target.value.padStart(2, '0')}:${formData.horaFin.split(':')[1]}`;
                                            setFormData(prev => ({ ...prev, horaFin: nuevaHora }));
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i.toString().padStart(2, '0')}>
                                                {i.toString().padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-gray-400">:</span>
                                    <select
                                        value={formData.horaFin.split(':')[1]}
                                        onChange={(e) => {
                                            const nuevaHora = `${formData.horaFin.split(':')[0]}:${e.target.value}`;
                                            setFormData(prev => ({ ...prev, horaFin: nuevaHora }));
                                        }}
                                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300 bg-white"
                                    >
                                        <option value="00">00</option>
                                        <option value="30">30</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Días */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Días
                            </label>
                            <div className="flex justify-between gap-1">
                                {days.map(([dayName, dayValue]) => (
                                    <button
                                        key={dayName}
                                        type="button"
                                        onClick={() => toggleDay(dayValue)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center
                                            ${(formData.dias & dayValue) !== 0
                                                ? 'bg-indigo-500 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        title={dayName}
                                    >
                                        {dayName.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Colores */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Color de Actividad
                            </label>
                            <div className="flex justify-between gap-1">
                                {[
                                    { name: 'Rojo', value: '#FFB3BA' },
                                    { name: 'Azul', value: '#C5E99B' },
                                    { name: 'Verde', value: '#B5E3FF' },
                                    { name: 'Amarillo', value: '#FFD1B3' },
                                    { name: 'Violeta', value: '#E0BBE4' },
                                    { name: 'Rosa', value: '#B5F5E3' },
                                    { name: 'Rosa', value: '#FFCCD9' }
                                ].map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                        className={`w-6 h-6 rounded-full border-2 transition cursor-pointer ${
                                            formData.color === color.value
                                            ? 'border-gray-800 scale-110 shadow-md'
                                            : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-100 text-gray-600 hover:text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-200 transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition cursor-pointer shadow-sm"
                        >
                            Guardar Actividad
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActividadEditor;