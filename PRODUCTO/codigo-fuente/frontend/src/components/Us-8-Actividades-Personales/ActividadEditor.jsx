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



        if (formData.horaInicio !== formData.horaFin) {
            let minInicio = formData.horaInicio.split(':').map(Number);
            let minFin = formData.horaFin.split(':').map(Number);
            const nuevaDuracion =
                (minFin[0] - minInicio[0]) * 60 +
                (minFin[1] - minInicio[1]);
            if (nuevaDuracion <= 0) {
                alert('La duración debe ser mayor a 0 minutos');
                return;
            }
            const actividadFinal = {
                ...formData,
                duracion: nuevaDuracion
            };
            onSave(actividadFinal);
        }
        setEditor(false);
        if (setActividadActual) {
            setActividadActual(null);
        }
    };



    if (!editor) return null;

    return (
        <div className="fixed bottom-0 right-0 w-[calc(100vw-14rem)] bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
                {/* Nombre */}
                <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => {
                            setFormData(prev => ({ ...prev, nombre: e.target.value }));

                        }}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300"
                    placeholder="Nombre"
                    style={{ width: '120px' }}
                />

                {/* Separador */}
                <span className="text-gray-300">|</span>

                {/* Hora inicio con selector numérico */}
                <div className="flex items-center gap-1">
                    <select
                        name="horaInicio"
                        value={formData.horaInicio.split(':')[0]}
                        onChange={(e) => {
                            const nuevaHora = `${e.target.value.padStart(2, '0')}:${formData.horaInicio.split(':')[1]}`;
                            setFormData(prev => ({ ...prev, horaInicio: nuevaHora }));

                        }}
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300 bg-white w-16"
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
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300 bg-white w-16"
                    >
                        <option value="00">00</option>
                        <option value="30">30</option>
                    </select>
                </div>

                {/* Separador */}
                <span className="text-gray-300">|</span>

                {/* Duración */}
                {/* Hora fin con selector numérico */}
                <div className="flex items-center gap-1">
                    <select
                        name="hora_fin"
                        value={formData.horaFin.split(':')[0]}
                        onChange={(e) => {
                            const nuevaHora = `${e.target.value.padStart(2, '0')}:${formData.horaFin.split(':')[1]}`;
                            setFormData(prev => ({ ...prev, horaFin: nuevaHora }));

                        }}
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300 bg-white w-16"
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
                        className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300 bg-white w-16"
                    >
                        <option value="00">00</option>
                        <option value="30">30</option>
                    </select>
                </div>

                {/* Separador */}
                <span className="text-gray-300">|</span>

                {/* Días */}
                <div className="flex gap-1">
                    {days.map(([dayName, dayValue]) => (
                        <button
                            key={dayName}
                            type="button"
                            onClick={() => toggleDay(dayValue)}
                            className={`w-7 h-7 rounded text-xs font-medium transition
                                ${(formData.dias & dayValue) !== 0
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title={dayName}
                        >
                            {dayName.charAt(0)}
                        </button>
                    ))}
                </div>

                {/* Separador */}
                <span className="text-gray-300">|</span>

                {/* Colores */}
                <div className="flex gap-1">
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
                    className={`w-4 h-4 rounded-xs border-2 transition ${
                        formData.color === color.value
                        ? 'border-gray-800 scale-110 shadow-sm'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    />
                ))}
                </div>

                {/* Botones */}
                <div className="flex gap-1 ml-2">
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition"
                    >
                        ✓
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200 transition"
                    >
                        ✗
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ActividadEditor;