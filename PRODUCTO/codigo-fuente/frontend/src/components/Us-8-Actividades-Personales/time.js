export const calcularMinutosDesdeMedianoche = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
};

export const calculateEndTime = (horaInicio, duracionMinutos) => {
    const totalMinutos = calcularMinutosDesdeMedianoche(horaInicio) + duracionMinutos;
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const calculateDuration = (horaInicio, horaFin) => {
    return calcularMinutosDesdeMedianoche(horaFin) - calcularMinutosDesdeMedianoche(horaInicio);
};