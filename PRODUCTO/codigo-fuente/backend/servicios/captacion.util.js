// Funciones puras para validar entradas y calcular porcentajes.
const MAX_MATRICULA = 100_000_000;

function entero(value, nombre, minimo, maximo) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimo || value > maximo) {
    const err = new Error(`${nombre} debe ser un número entero entre ${minimo} y ${maximo}.`);
    err.status = 400;
    throw err;
  }
  return value;
}

function porcentaje(numerador, denominador) {
  if (!Number.isFinite(denominador) || denominador <= 0) return null;
  return Number(((numerador / denominador) * 100).toFixed(2));
}

function validarReferencia(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const err = new Error('Debe enviar un objeto JSON válido.');
    err.status = 400;
    throw err;
  }
  const anio = entero(body.anio, 'El año', 2000, 2100);
  const semestre = entero(body.semestre, 'El semestre', 1, 2);
  const matriculaTotal = entero(body.matriculaTotal, 'La matrícula total', 1, MAX_MATRICULA);
  const fuente = body.fuente == null ? null : String(body.fuente).trim();
  if (fuente && fuente.length > 300) {
    const err = new Error('La fuente no puede superar los 300 caracteres.');
    err.status = 400;
    throw err;
  }
  if (body.porCarrera != null && !Array.isArray(body.porCarrera)) {
    const err = new Error('porCarrera debe ser una lista.');
    err.status = 400;
    throw err;
  }
  const porCarrera = (body.porCarrera || []).map((item) => ({
    idCarrera: entero(item?.idCarrera, 'El ID de carrera', 1, MAX_MATRICULA),
    matriculaEstimada: entero(item?.matriculaEstimada, 'La matrícula por carrera', 1, MAX_MATRICULA)
  }));
  if (new Set(porCarrera.map((c) => c.idCarrera)).size !== porCarrera.length) {
    const err = new Error('No puede repetirse una carrera en el mismo período.');
    err.status = 400;
    throw err;
  }
  const suma = porCarrera.reduce((acc, c) => acc + c.matriculaEstimada, 0);
  if (suma > matriculaTotal) {
    const err = new Error('La suma de las matrículas por carrera supera la matrícula total institucional.');
    err.status = 400;
    throw err;
  }
  return { anio, semestre, matriculaTotal, fuente: fuente || null, porCarrera };
}

module.exports = { porcentaje, validarReferencia };
