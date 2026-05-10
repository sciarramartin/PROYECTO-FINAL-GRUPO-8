import React, { useState, useEffect, useMemo } from 'react';
import ActividadEditor from './ActividadEditor';

const Horario = () => {
    const days = [
        ['Lunes', 1],
        ['Martes', 2],
        ['Miércoles', 4],
        ['Jueves', 8],
        ['Viernes', 16],
        ['Sábado', 32],
        ['Domingo', 64]
    ];

    const actividadesIniciales = [
        {
            id: 1,
            nombre: 'box',
            hora_inicio: '08:00',
            duracion: 260,
            dias: 31,
            color: '#FFB3BA',
            id_usuario: 1
        },
        {
            id: 2,
            nombre: 'natación',
            hora_inicio: '14:30',
            duracion: 90,
            dias: 15, // Miércoles + Jueves + Viernes
            color: '#BAFFC3',
            id_usuario: 1
        },
        {
            id: 3,
            nombre: 'yoga',
            hora_inicio: '07:00',
            duracion: 60,
            dias: 5, // Lunes + Martes
            color: '#FFE5B3',
            id_usuario: 1
        }
    ];
     
    const [showEditor, setShowEditor] = useState(false);
    const [actividadEditando, setActividadEditando] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [columns, setColumns] = useState([]);

    const PIXELS_POR_HORA = 36;
    const PIXELS_POR_MINUTO = PIXELS_POR_HORA / 60;

    const getDayNamesFromBitmask = (bitmask) => {
        return days.filter(([_, value]) => (bitmask & value) !== 0);
    };

    const calcularHoraFin = (horaInicio, duracionMinutos) => {
        const [horas, minutos] = horaInicio.split(':').map(Number);

        const totalMinutos =
            horas * 60 + minutos + duracionMinutos;

        const horaFin = Math.floor(totalMinutos / 60);
        const minFin = totalMinutos % 60;

        return `${horaFin
            .toString()
            .padStart(2, '0')}:${minFin
            .toString()
            .padStart(2, '0')}`;
    };

    const calcularMinutosDesdeMedianoche = (hora) => {
        const [horas, minutos] = hora.split(':').map(Number);
        return horas * 60 + minutos;
    };

    useEffect(() => {
        const nuevasColumnas = [];

        actividadesIniciales.forEach((actividad) => {
            const activeDays =
                getDayNamesFromBitmask(actividad.dias);

            activeDays.forEach(([name, value]) => {
                let columna = nuevasColumnas.find(
                    (c) => c.id === value
                );

                if (!columna) {
                    columna = {
                        id: value,
                        title: name,
                        data: []
                    };

                    nuevasColumnas.push(columna);
                }

                const horaFin = calcularHoraFin(
                    actividad.hora_inicio,
                    actividad.duracion
                );

                columna.data.push({
                    ...actividad,
                    hora_fin: horaFin
                });
            });
        });

        nuevasColumnas.forEach((col) => {
            col.data.sort((a, b) =>
                a.hora_inicio.localeCompare(
                    b.hora_inicio
                )
            );
        });

        nuevasColumnas.sort((a, b) => a.id - b.id);

        setColumns(nuevasColumnas);
    }, []);

    const { minHora, maxHora } = useMemo(() => {
        if (columns.length === 0) {
            return {
                minHora: 6,
                maxHora: 22
            };
        }

        let minHoraTemp = 24;
        let maxHoraTemp = 0;

        columns.forEach((column) => {
            column.data.forEach((actividad) => {
                const horaInicioNum = parseInt(
                    actividad.hora_inicio.split(':')[0]
                );

                const [horaFinNum] =
                    actividad.hora_fin
                        .split(':')
                        .map(Number);

                minHoraTemp = Math.min(
                    minHoraTemp,
                    horaInicioNum
                );

                maxHoraTemp = Math.max(
                    maxHoraTemp,
                    horaFinNum
                );
            });
        });


        if (--minHoraTemp < 0) minHoraTemp = 0;


        if (++maxHoraTemp > 24) maxHoraTemp = 24;

        return {
            minHora: minHoraTemp,
            maxHora: maxHoraTemp
        };
    }, [columns]);

    const horas = useMemo(() => {
        const horasTemp = [];

        for (
            let i = minHora;
            i <= maxHora;
            i++
        ) {
            horasTemp.push(
                `${i
                    .toString()
                    .padStart(2, '0')}:00`
            );
        }

        return horasTemp;
    }, [minHora, maxHora]);

    const calcularPosicionY = (horaInicio) => {
        const minutosTotal =
            calcularMinutosDesdeMedianoche(
                horaInicio
            );

        const minutosBase =
            calcularMinutosDesdeMedianoche(
                `${minHora
                    .toString()
                    .padStart(2, '0')}:00`
            );

        return (
            (minutosTotal - minutosBase) *
            PIXELS_POR_MINUTO
        );
    };

    const calcularAltura = (
        duracionMinutos
    ) => {
        return (
            duracionMinutos *
            PIXELS_POR_MINUTO
        );
    };

    // seccion editor
    const handleSaveActividad = (nuevaActividad) => {
        if (nuevaActividad.id) {
            // Actualizar actividad existente
            setActividades(prev => 
                prev.map(act => act.id === nuevaActividad.id ? nuevaActividad : act)
            );
        } else {
            // Crear nueva actividad (el id lo asignará la base de datos)
            // Por ahora asignamos un temporal
            const tempId = Date.now();
            setActividades(prev => [...prev, { ...nuevaActividad, id: tempId }]);
        }
        
        // Aquí también podrías hacer una llamada a la API para guardar en la BD
    };

    const handleEditActividad = (actividad) => {
        setActividadEditando(actividad);
        setShowEditor(true);
    };

    const handleNewActividad = () => {
        setActividadEditando(null);
        setShowEditor(true);
    };


    return (
        <>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <div className="flex min-w-[800px]">
                    {/* Columna horas */}
                    <div className="flex-shrink-0 w-15 md:w-24 bg-gray-50 border-r-2 border-gray-200">
                        <div className="h-16 flex items-center justify-center font-bold bg-gray-100 border-b-2 border-gray-200 text-gray-700">
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

                    {/* Columnas días */}
                    {columns.map((column) => (
                        <div
                            key={column.id}
                            className="flex-1 min-w-[100px] relative border-r border-gray-100"
                        >
                            <div
                                className="h-16 flex items-center justify-center font-semibold text-sm border-b-2 border-gray-200"
                            >
                                {column.title}
                            </div>

                            <div
                                className="relative"
                                style={{
                                    minHeight: `${
                                        (maxHora -
                                            minHora +
                                            1) *
                                        PIXELS_POR_HORA
                                    }px`
                                }}
                            >
                                {/* Líneas fondo */}
                                {horas.map((hora) => (
                                    <div
                                        key={hora}
                                        className="h-8 border-b border-gray-100"
                                    />
                                ))}

                                {/* Actividades */}
                                {column.data.map(
                                    (act, idx) => (
                                        <div
                                            key={`${act.id}-${idx}`}
                                            className="absolute left-1 right-1 p-2 overflow-hidden shadow-md hover:scale-[1.02] transition-all duration-200"
                                            onClick={() => handleEditActividad(act)}
                                            style={{
                                                backgroundColor:
                                                    act.color,

                                                top: `${calcularPosicionY(
                                                    act.hora_inicio
                                                )}px`,

                                                height: `${calcularAltura(
                                                    act.duracion
                                                )}px`
                                            }}
                                            title={`${act.nombre}\n${act.hora_inicio} - ${act.hora_fin}`}
                                        >
                                            <div className="font-bold text-xs capitalize truncate">
                                                {
                                                    act.nombre
                                                }
                                            </div>

                                            <div className="text-[10px] text-gray-700 mt-1">
                                                {
                                                    act.hora_inicio
                                                }{' '}
                                                -{' '}
                                                {
                                                    act.hora_fin
                                                }
                                            </div>

                                            <div className="text-[9px] text-gray-600 mt-1">
                                                {
                                                    act.duracion
                                                }
                                                min
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leyenda */}
            {columns.length > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Leyenda
                    </h3>

                    <div className="flex flex-wrap gap-3">
                        {[
                            ...new Map(
                                columns
                                    .flatMap(
                                        (col) =>
                                            col.data
                                    )
                                    .map((act) => [
                                        act.nombre,
                                        act
                                    ])
                            ).values()
                        ].map((act) => (
                            <div
                                key={act.nombre}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{
                                        backgroundColor:
                                            act.color
                                    }}
                                />

                                <span className="text-xs text-gray-700 capitalize">
                                    {act.nombre}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* Editor */}
            <ActividadEditor
                editor={showEditor}
                setEditor={setShowEditor}
                actividadActual={actividadEditando}
                setActividadActual={setActividadEditando}
                onSave={handleSaveActividad}
            />
        </>
    );
};

export default Horario;