import React, { useState, useEffect, useMemo, useRef } from 'react';
import ActividadEditor from './ActividadEditor';
import {getActividades, PostActividad, PutActividad, DeleteActividad} from './services';

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


    const [showEditor, setShowEditor] = useState(false);
    const [actividadEditando, setActividadEditando] = useState(null);
    const [actividades, setActividades] = useState([]);


    const cargarActividades = async () => {
        try {
            const data = await getActividades(1);
            setActividades(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        cargarActividades();
    }, []);


    const PIXELS_POR_HORA = 32;
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

    const diasActividades = useMemo(() => {
        const nuevasColumnas = [];

        actividades.forEach((actividad) => {

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
                    actividad.horaInicio,
                    actividad.duracion
                );

                columna.data.push({
                    ...actividad,
                    horaFin: horaFin
                });
            });
        });

        nuevasColumnas.forEach((col) => {
            col.data.sort((a, b) =>
                a.horaInicio.localeCompare(
                    b.horaInicio
                )
            );
        });

        nuevasColumnas.sort((a, b) => a.id - b.id);

        return nuevasColumnas;

    }, [actividades]);

    const columns = useMemo(() => {
        if (diasActividades.length > 2) {
            return diasActividades;
        }

        const nuevasColumnas = [...diasActividades];

        getDayNamesFromBitmask(31).forEach(([name, value]) => {
            let columna = diasActividades.find(
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

        });
        nuevasColumnas.sort((a, b) => a.id - b.id);
        return nuevasColumnas

    }, [diasActividades]);

    const { minHora, maxHora } = useMemo(() => {
        if (actividades.length === 0 ) {
            return {
                minHora: 6,
                maxHora: 17
            };
        }

        let minHoraTemp = 24;
        let maxHoraTemp = 0;

        columns.forEach((column) => {
            column.data.forEach((actividad) => {
                const horaInicioNum = parseInt(
                    actividad.horaInicio.split(':')[0]
                );

                const [horaFinNum] =
                    actividad.horaFin
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
    const handleSaveActividad = async (actividadActualizada) => {
        try {
            if (actividadActualizada.id !== "preview") {
                const actResp = await PutActividad(actividadActualizada);
                setActividades(prev =>
                    prev.map(act => act.id === actResp.id ? actResp : act)
                );
            } else {
                console.log(actividadActualizada);
                const nuevaActividad = {
                    nombre: actividadActualizada.nombre,
                    horaInicio: actividadActualizada.horaInicio,
                    duracion: actividadActualizada.duracion,
                    dias: actividadActualizada.dias,
                    color: actividadActualizada.color, // Mantener color existente o usar default
                    idUsuario: actividadActualizada.idUsuario
                };
                const actResp = await PostActividad(nuevaActividad);
                setActividades(prev =>
                    prev.filter(act => act.id !== "preview").concat(actResp)
                );
            }
            setShowEditor(false);
            setActividadEditando(null);
        } catch (error) {
            console.error("Error al guardar la actividad:", error);
            alert("No se pudo guardar la actividad. Por favor, verifique los datos e intente nuevamente.");
        }
    };

    const handlePreviewActividad = (nuevaActividad) => {
        if (nuevaActividad.id !== "preview") {
            setActividades(prev => prev.map(act => act.id === nuevaActividad.id ? nuevaActividad : act)
            );
        } else { 
            setActividades(prev =>
                prev.filter(act => act.id !== "preview")
            );
            nuevaActividad.id = "preview";
            setActividades(prev => [...prev, nuevaActividad]);
        }
    };

    const handleEditActividad = (actividad) => {
        setActividadEditando(actividad);
        setShowEditor(true);
    };

    const handleNewActividad = (horaInicio, days) => {

        const nuevaActividad = {
            id: "preview",
            nombre: '',
            horaInicio: horaInicio,
            duracion: 60,
            horaFin: calcularHoraFin(horaInicio, 60),
            color:'#FFB3BA',
            dias: days,
            idUsuario: 1
        };

        setActividadEditando(nuevaActividad);

        setShowEditor(true);
    };

    const handleCancel = () => {
        setActividades(prev =>
            prev.filter(act => act.id !== "preview")
        );
        setActividadEditando(null); // revertir

        setShowEditor(false);
    };


    return (
        <>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <div className="flex min-w-[800px]">
                    {/* Columna horas */}
                    <div className="flex-shrink-0 w-15 md:w-24 bg-gray-50 border-r-2 border-gray-200">
                        <div className="h-[64px] flex items-center justify-center font-bold bg-gray-100 border-b-2 border-gray-200 text-gray-700">
                            Hora
                        </div>

                        {horas.map((hora) => (
                            <div
                                key={hora}
                                className="h-[32px] flex items-start justify-center text-xs text-gray-500 border-b border-gray-100 pt-1"
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
                                className="h-[64px] flex items-center justify-center font-semibold text-sm border-b-2 border-gray-200"
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
                                        role="button"
                                        onKeyDown={(e) => e.key === 'Enter' && handleNewActividad(hora, column.id)}
                                        tabIndex={0}
                                        className="h-[32px] border-b border-gray-100 w-full text-left"
                                        onClick={() => handleNewActividad(hora, column.id)}
                                    />
                                ))}

                                {/* Actividades */}
                                {column.data.map(
                                    (act, idx) => (
                                        <div
                                            key={`${act.horaInicio}-${idx}`}
                                            className="absolute left-1 right-1 p-2 overflow-hidden shadow-md hover:scale-[1.02] transition-all duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditActividad(act);}}
                                            style={{
                                                backgroundColor:
                                                    act.color,

                                                top: `${calcularPosicionY(
                                                    act.horaInicio
                                                )}px`,

                                                height: `${calcularAltura(
                                                    act.duracion
                                                )}px`
                                            }}
                                            title={`${act.nombre}\n${act.horaInicio} - ${act.horaFin}`}
                                        >
                                            <div className="font-bold text-xs capitalize truncate">
                                                {
                                                    act.nombre
                                                }
                                            </div>

                                            <div className="text-[10px] text-gray-700 mt-1">
                                                {
                                                    act.horaInicio
                                                }{' '}
                                                -{' '}
                                                {
                                                    act.horaFin
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
                                    .filter(
                                        (act) =>
                                            act.nombre &&
                                            act.nombre.trim() !== '' &&
                                            act.id !== 'preview'
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
                preview={handlePreviewActividad}
                onSave={handleSaveActividad}
                onCancel={handleCancel}
            />
        </>
    );
};

export default Horario;