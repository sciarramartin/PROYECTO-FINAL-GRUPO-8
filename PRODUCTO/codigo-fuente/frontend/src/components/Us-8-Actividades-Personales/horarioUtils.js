// horarioUtils.js
// Funciones utilitarias para el componente Horario

export const PIXELS_POR_HORA = 36;
export const PIXELS_POR_MINUTO = PIXELS_POR_HORA / 60;

export const DAYS = [
    ['Lunes',     1],
    ['Martes',    2],
    ['Miércoles', 4],
    ['Jueves',    8],
    ['Viernes',   16],
    ['Sábado',    32],
    ['Domingo',   64],
];

/**
 * Devuelve los pares [nombre, valor] de los días presentes en el bitmask.
 * @param {number} bitmask
 * @returns {Array<[string, number]>}
 */
export const getDayNamesFromBitmask = (bitmask) =>
    DAYS.filter(([, value]) => (bitmask & value) !== 0);

/**
 * Suma duracionMinutos a horaInicio y devuelve la hora de fin en "HH:MM".
 * @param {string} horaInicio  – "HH:MM"
 * @param {number} duracionMinutos
 * @returns {string}
 */
export const calcularHoraFin = (horaInicio, duracionMinutos) => {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const horaFin = Math.floor(totalMinutos / 60);
    const minFin  = totalMinutos % 60;
    return `${String(horaFin).padStart(2, '0')}:${String(minFin).padStart(2, '0')}`;
};

/**
 * Convierte "HH:MM" a minutos desde medianoche.
 * @param {string} hora
 * @returns {number}
 */
export const calcularMinutosDesdeMedianoche = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
};

/**
 * Calcula la posición Y en píxeles de una actividad dentro de la grilla.
 * @param {string} horaInicio  – "HH:MM"
 * @param {number} minHora     – hora mínima visible (entero)
 * @returns {number}
 */
export const calcularPosicionY = (horaInicio, minHora) => {
    const minutosTotal = calcularMinutosDesdeMedianoche(horaInicio);
    const minutosBase  = calcularMinutosDesdeMedianoche(
        `${String(minHora).padStart(2, '0')}:00`
    );
    return (minutosTotal - minutosBase) * PIXELS_POR_MINUTO;
};

/**
 * Convierte una duración en minutos a píxeles.
 * @param {number} duracionMinutos
 * @returns {number}
 */
export const calcularAltura = (duracionMinutos) =>
    duracionMinutos * PIXELS_POR_MINUTO;

/**
 * A partir de la lista de actividades construye un array de columnas
 * ordenadas por id de día, cada una con su array `data` (actividades
 * enriquecidas con `horaFin`).
 * @param {Array} actividades
 * @returns {Array}
 */
export const buildDiasActividades = (actividades) => {
    const nuevasColumnas = [];

    actividades.forEach((actividad) => {
        getDayNamesFromBitmask(actividad.dias).forEach(([name, value]) => {
            let columna = nuevasColumnas.find((c) => c.id === value);
            if (!columna) {
                columna = { id: value, title: name, data: [] };
                nuevasColumnas.push(columna);
            }
            columna.data.push({
                ...actividad,
                horaFin: calcularHoraFin(actividad.horaInicio, actividad.duracion),
            });
        });
    });

    nuevasColumnas.forEach((col) => {
        col.data.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    });

    return nuevasColumnas.sort((a, b) => a.id - b.id);
};

/**
 * Garantiza que existan al menos las columnas de lunes a viernes (bitmask 31)
 * cuando el total de columnas con actividades es ≤ 5.
 * @param {Array} diasActividades
 * @returns {Array}
 */
export const buildColumns = (diasActividades) => {
    if (diasActividades.length > 5) return diasActividades;

    const nuevasColumnas = [...diasActividades];
    getDayNamesFromBitmask(31).forEach(([name, value]) => {
        if (!nuevasColumnas.find((c) => c.id === value)) {
            nuevasColumnas.push({ id: value, title: name, data: [] });
        }
    });
    return nuevasColumnas.sort((a, b) => a.id - b.id);
};

/**
 * Asegura que la columna del día seleccionado siempre esté presente.
 * @param {Array}  columns
 * @param {number} selectedDayTab
 * @returns {Array}
 */
export const buildActiveColumns = (columns, selectedDayTab) => {
    const nuevasColumnas = [...columns];
    if (!nuevasColumnas.some((c) => c.id === selectedDayTab)) {
        const dayInfo = DAYS.find(([, val]) => val === selectedDayTab);
        if (dayInfo) {
            nuevasColumnas.push({ id: dayInfo[1], title: dayInfo[0], data: [] });
            nuevasColumnas.sort((a, b) => a.id - b.id);
        }
    }
    return nuevasColumnas;
};

/**
 * Calcula el rango horario (minHora / maxHora) que cubre todas las actividades.
 * @param {Array}  columns
 * @param {Array}  actividades
 * @returns {{ minHora: number, maxHora: number }}
 */
export const calcularRangoHorario = (columns, actividades) => {
    if (actividades.length === 0) return { minHora: 6, maxHora: 17 };

    let minHoraTemp = 24;
    let maxHoraTemp = 0;

    columns.forEach((column) => {
        column.data.forEach((actividad) => {
            const horaInicioNum = parseInt(actividad.horaInicio.split(':')[0], 10);
            const [horaFinNum]  = actividad.horaFin.split(':').map(Number);
            minHoraTemp = Math.min(minHoraTemp, horaInicioNum);
            maxHoraTemp = Math.max(maxHoraTemp, horaFinNum);
        });
    });

    if (--minHoraTemp < 0)  minHoraTemp = 0;
    if (++maxHoraTemp > 24) maxHoraTemp = 24;

    return { minHora: minHoraTemp, maxHora: maxHoraTemp };
};

/**
 * Genera el array de strings "HH:00" para el rango dado.
 * @param {number} minHora
 * @param {number} maxHora
 * @returns {string[]}
 */
export const buildHoras = (minHora, maxHora) => {
    const horasTemp = [];
    for (let i = minHora; i <= maxHora; i++) {
        horasTemp.push(`${String(i).padStart(2, '0')}:00`);
    }
    return horasTemp;
};