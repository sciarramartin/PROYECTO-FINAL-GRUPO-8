import React, { useState, useEffect } from 'react';

const ActividadEditor = ({ editor, setEditor, actividadActual, setActividadActual, onSave }) => {
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
        hora_inicio: '08:00',
        duracion: 60,
        dias: 0,
        id_usuario: 1 // Esto debería venir del contexto/usuario actual
    });

    // Cargar datos de la actividad si estamos editando
    useEffect(() => {
        if (actividadActual && actividadActual.id) {
            setFormData({
                nombre: actividadActual.nombre || '',
                hora_inicio: actividadActual.hora_inicio || '08:00',
                duracion: actividadActual.duracion || 60,
                dias: actividadActual.dias || 0,
                id_usuario: actividadActual.id_usuario || 1
            });
        } else {
            // Resetear para nueva actividad
            setFormData({
                nombre: '',
                hora_inicio: '08:00',
                duracion: 60,
                dias: 0,
                id_usuario: 1
            });
        }
    }, [actividadActual, editor]);

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'duracion' ? parseInt(value) || 0 : value
        }));
    };

    // Manejar selección de días
    const toggleDay = (dayValue) => {
        setFormData(prev => ({
            ...prev,
            dias: (prev.dias & dayValue) !== 0 
                ? prev.dias & ~dayValue  // Remover día
                : prev.dias | dayValue   // Agregar día
        }));
    };

    // Guardar actividad
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

        if (formData.duracion <= 0) {
            alert('La duración debe ser mayor a 0 minutos');
            return;
        }

        // Construir objeto actividad
        const nuevaActividad = {
            ...(actividadActual?.id && { id: actividadActual.id }), // Solo incluir id si existe
            nombre: formData.nombre,
            hora_inicio: formData.hora_inicio,
            duracion: formData.duracion,
            dias: formData.dias,
            color: actividadActual?.color || '#FFB3BA', // Mantener color existente o usar default
            id_usuario: formData.id_usuario
        };

        // Notificar al padre
        if (onSave) {
            onSave(nuevaActividad);
        }
        
        // Cerrar el editor
        setEditor(false);
        
        // Opcional: resetear el estado de actividadActual en el padre
        if (setActividadActual) {
            setActividadActual(null);
        }
    };

    // Cancelar edición
    const handleCancel = () => {
        setEditor(false);
        if (setActividadActual) {
            setActividadActual(null);
        }
    };

    // Obtener nombres de días seleccionados para mostrar
    const getSelectedDaysNames = () => {
        return days
            .filter(([_, value]) => (formData.dias & value) !== 0)
            .map(([name]) => name)
            .join(', ');
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
                    onChange={handleChange}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300"
                    placeholder="Nombre"
                    style={{ width: '120px' }}
                />

                {/* Separador */}
                <span className="text-gray-300">|</span>

                {/* Hora inicio con selector numérico */}
                <div className="flex items-center gap-1">
                    <select
                        name="hora_inicio"
                        value={formData.hora_inicio.split(':')[0]}
                        onChange={(e) => {
                            const nuevaHora = `${e.target.value.padStart(2, '0')}:${formData.hora_inicio.split(':')[1]}`;
                            setFormData(prev => ({ ...prev, hora_inicio: nuevaHora }));
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
                        value={formData.hora_inicio.split(':')[1]}
                        onChange={(e) => {
                            const nuevaHora = `${formData.hora_inicio.split(':')[0]}:${e.target.value}`;
                            setFormData(prev => ({ ...prev, hora_inicio: nuevaHora }));
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
                <select
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleChange}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-indigo-300 bg-white"
                >
                    <option value="30">30m</option>
                    <option value="60">1h</option>
                    <option value="90">1.5h</option>
                    <option value="120">2h</option>
                    <option value="180">3h</option>
                    <option value="240">4h</option>
                </select>

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