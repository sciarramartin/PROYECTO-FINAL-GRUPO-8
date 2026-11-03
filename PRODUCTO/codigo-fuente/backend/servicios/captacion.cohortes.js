// Transformaciones puras: permiten comprobar integridad sin una BD conectada.
const { porcentaje } = require('./captacion.util');

function normalizarAnio(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const anio = Number(valor);
  return Number.isSafeInteger(anio) ? anio : null;
}

function ordenarCohortes(a, b) {
  if (a.anioIngreso === null) return 1;
  if (b.anioIngreso === null) return -1;
  return b.anioIngreso - a.anioIngreso;
}

function resumirConteos(filas) {
  const porCarrera = new Map();
  const porAnio = new Map();
  const porCarreraAnio = new Map();
  let total = 0;

  for (const fila of filas) {
    const idCarrera = Number(fila.id_carrera);
    const anioIngreso = normalizarAnio(fila.anio_ingreso);
    const cantidad = Number(fila.cantidad);
    if (!Number.isSafeInteger(idCarrera) || !Number.isSafeInteger(cantidad) || cantidad < 0) {
      throw new Error('Conteo de cuentas inconsistente en base de datos.');
    }
    total += cantidad;
    porCarrera.set(idCarrera, (porCarrera.get(idCarrera) || 0) + cantidad);
    porAnio.set(anioIngreso, (porAnio.get(anioIngreso) || 0) + cantidad);

    if (!porCarreraAnio.has(idCarrera)) porCarreraAnio.set(idCarrera, new Map());
    const mapa = porCarreraAnio.get(idCarrera);
    mapa.set(anioIngreso, (mapa.get(anioIngreso) || 0) + cantidad);
  }

  const aDistribucion = (mapa) => {
    const subtotal = [...mapa.values()].reduce((acc, n) => acc + n, 0);
    return [...mapa.entries()].map(([anioIngreso, usuariosRegistrados]) => ({
      anioIngreso,
      usuariosRegistrados,
      participacionUsuarios: porcentaje(usuariosRegistrados, subtotal)
    })).sort(ordenarCohortes);
  };

  return {
    total,
    porCarrera,
    porAnioIngreso: aDistribucion(porAnio),
    porCarreraAnio: new Map([...porCarreraAnio.entries()].map(([id, mapa]) => [id, aDistribucion(mapa)])),
    sinAnioIngreso: porAnio.get(null) || 0
  };
}

module.exports = { normalizarAnio, ordenarCohortes, resumirConteos };
