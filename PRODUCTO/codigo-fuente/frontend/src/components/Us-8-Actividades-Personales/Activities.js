export const DAYS = [
    ['Lunes',     1],
    ['Martes',    2],
    ['Miércoles', 4],
    ['Jueves',    8],
    ['Viernes',  16],
    ['Sábado',   32],
    ['Domingo',  64],
];
 
export const PIXELS_POR_HORA   = 32;
export const PIXELS_POR_MINUTO = PIXELS_POR_HORA / 60;

export const getDayNamesFromBitmask = (bitmask) =>
    DAYS.filter(([, value]) => (bitmask & value) !== 0);

export const calcularColumnas = (actividades, getDaysFn, endTimeFn) => {
    const columnas = [];

    actividades.forEach((actividad) => {
        getDaysFn(actividad.dias).forEach(([name, value]) => {
            let col = columnas.find((c) => c.id === value);
            if (!col) {
                col = { id: value, title: name, data: [] };
                columnas.push(col);
            }
            col.data.push({ ...actividad, horaFin: endTimeFn(actividad.horaInicio, actividad.duracion) });
        });
    });

    columnas.forEach((col) => col.data.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
    columnas.sort((a, b) => a.id - b.id);
    return columnas;
};

export const calcularRangoHoras = (columns) => {
    if (columns.length === 0) return { minHora: 6, maxHora: 17 };

    let min = 24, max = 0;
    columns.forEach(({ data }) =>
        data.forEach(({ horaInicio, horaFin }) => {
            min = Math.min(min, parseInt(horaInicio));
            max = Math.max(max, parseInt(horaFin));
        })
    );

    return {
        minHora: Math.max(0,  min - 1),
        maxHora: Math.min(24, max + 1),
    };
};
