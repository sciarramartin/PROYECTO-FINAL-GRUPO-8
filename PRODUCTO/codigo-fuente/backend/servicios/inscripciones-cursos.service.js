const { promises } = require('nodemailer/lib/xoauth2');
const Inscripcion = require('../modelos/inscripciones-cursos.modelo');
const {findAllByMateriaId} = require('./cursos.service');

const mapToCamelCase = (Inscripcion) => {
    return {
        id: Inscripcion.id,
        fechaInscripcion: Inscripcion.fecha_inscripcion,
        idUsuario: Inscripcion.id_usuario,
        idCurso: Inscripcion.id_curso,
        Inscripcion: Inscripcion.Inscripcion,
        notaFinal: Inscripcion.nota_final
    };
};

const findAllByCursoId = async (idCurso) => {
    try {

        const registros = await Inscripcion.findAll({
            where: {
                id_curso: idCurso
            }
        });
        return registros.map((Inscripcion) => {
            return mapToCamelCase(Inscripcion);
        });
    } catch (error) {
        throw error;
    }
};

const findAllByUserId = async (idUser) => {
    try {
        const registros = await Inscripcion.findAll({
            where: {
                id_usuario: idUser
            }
        });
        return registros.map((Inscripcion) => {
            return mapToCamelCase(Inscripcion);
        });
    } catch (error) {
        throw error;
    }
};

// ─── Utilidades ──────────────────────────────────────────────────────────────

/** Convierte "09:30" → minutos desde medianoche */
const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** ¿Dos actividades se solapan en al menos un día de la semana? */
const hayConflicto = (a, b) => {
  const diasCompartidos = a.dias & b.dias;
  if (!diasCompartidos) return false;

  const aStart = toMin(a.horaInicio);
  const aEnd   = aStart + a.duracion;
  const bStart = toMin(b.horaInicio);
  const bEnd   = bStart + b.duracion;

  return aStart < bEnd && bStart < aEnd;
};

/** Genera todas las combinaciones eligiendo 1 elemento de cada subarray */
const cartesiano = (arrays) =>
  arrays.reduce(
    (combis, cursos) => combis.flatMap((c) => cursos.map((x) => [...c, x])),
    [[]]
  );

// ─── Filtrado por disponibilidad ──────────────────────────────────────────────

const TURNO = { manana: [0, 720], tarde: [720, 1020], noche: [1020, 1440] };

const filtrarPorDisponibilidad = (cursosPosibles, disponibilidad) =>
  cursosPosibles.map((cursosDeMateria) =>
    cursosDeMateria.filter((curso) => {
      const inicio = toMin(curso.horaInicio);
      if (!disponibilidad.manana && inicio >= TURNO.manana[0] && inicio < TURNO.manana[1]) return false;
      if (!disponibilidad.tarde  && inicio >= TURNO.tarde[0]  && inicio < TURNO.tarde[1])  return false;
      if (!disponibilidad.noche  && inicio >= TURNO.noche[0]  && inicio < TURNO.noche[1])  return false;
      return true;
    })
  );

// ─── Validación de conflictos ─────────────────────────────────────────────────

const esValida = (combinacion, fijas) => {
  // Conflicto entre cursos elegidos
  for (let i = 0; i < combinacion.length; i++)
    for (let j = i + 1; j < combinacion.length; j++)
      if (hayConflicto(combinacion[i], combinacion[j])) return false;

  // Conflicto con actividades fijas
  for (const curso of combinacion)
    for (const fija of fijas)
      if (hayConflicto(curso, fija)) return false;

  return true;
};

// ─── Puntuación: minimizar gaps por día ──────────────────────────────────────

const DIA_BITS = [1, 2, 4, 8, 16, 32, 64]; // Lun→Dom

const calcularScore = (combinacion, fijas) => {
  let totalGap = 0;

  for (const bit of DIA_BITS) {
    // Todas las actividades que ocurren este día
    const actividadesDelDia = [...combinacion, ...fijas]
      .filter((a) => a.dias & bit)
      .map((a) => ({
        inicio: toMin(a.horaInicio),
        fin:    toMin(a.horaInicio) + a.duracion,
      }))
      .sort((a, b) => a.inicio - b.inicio);

    for (let i = 1; i < actividadesDelDia.length; i++) {
      const gap = actividadesDelDia[i].inicio - actividadesDelDia[i - 1].fin;
      if (gap > 0) totalGap += gap;
    }
    if(actividadesDelDia.length > 0) totalGap += 100;
  }

  return totalGap; // Menor es mejor
};

// ─── Inserción de flexibles (reescrita) ──────────────────────────────────────

/**
 * Parsea "08:00-12:00" → { inicio: 480, fin: 720 }
 * Si no hay preferencia, devuelve el rango completo del día (06:00–22:00)
 */
const parsearPreferenciaHoraria = (pref) => {
  if (!pref) return { inicio: 360, fin: 1320 };
  const [desde, hasta] = pref.split('-').map(toMin);
  return { inicio: desde, fin: hasta };
};

/**
 * Descompone un bitmask en un array de bits individuales.
 * diasBitmask = 21 (Lun+Mié+Vie = 1+4+16) → [1, 4, 16]
 */
const bitmaskADias = (bitmask) =>
  DIA_BITS.filter((bit) => bitmask & bit);

/**
 * Intenta colocar UNA sesión de `flex` en el horario que genera el menor gap
 * respecto al plan ya armado (combinacion + fijas + flexiblesYaInsertados).
 *
 * Estrategia:
 *  1. Construir la lista de días candidatos (preferidos primero, resto después).
 *  2. Por cada día, barrer slots dentro del rango horario preferido (o todo el día).
 *  3. Descartar slots con conflicto.
 *  4. Para los restantes, simular la inserción y calcular el score con calcularScore.
 *  5. Guardar el candidato con menor score.
 *  6. Si no hubo candidatos en horario preferido, repetir sin restricción horaria.
 *
 * Devuelve el objeto sesión a insertar, o null si no hay hueco posible.
 */
const buscarMejorSlot = (flex, ocupado, durMin, rangoHorario) => {
  const { inicio: rangoInicio, fin: rangoFin } = rangoHorario;

  // Días preferidos primero, luego el resto
  const diasPreferidos = flex.diasPreferidos ? bitmaskADias(flex.diasPreferidos) : [];
  const diasRestantes  = DIA_BITS.filter((b) => !diasPreferidos.includes(b));
  const diasOrden      = [...diasPreferidos, ...diasRestantes];

  let mejor      = null;
  let mejorScore = Infinity;

  // Primera pasada: solo días y horario preferidos
  // Si no encuentra nada, segunda pasada sin restricciones
  for (const soloPreferidos of [true, false]) {
    const diasAProbar = soloPreferidos ? diasPreferidos : diasRestantes;

    // Si no hay días preferidos, la primera pasada ya prueba todos
    const diasEfectivos = (soloPreferidos && diasPreferidos.length === 0)
      ? diasOrden
      : diasAProbar;

    for (const bit of diasEfectivos) {
      for (let startMin = rangoInicio; startMin + durMin <= rangoFin; startMin += 15) {
        const candidato = {
          nombre:     flex.nombre.trim(),
          horaInicio: `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}`,
          duracion:   durMin,
          dias:       bit,
          esFlexible: true,
        };

        // Descartar si hay conflicto con todo lo ocupado
        if (ocupado.some((a) => hayConflicto(candidato, a))) continue;

        // Simular inserción y medir gap total
        const score = calcularScore([...ocupado, candidato], []);
        if (score < mejorScore) {
          mejorScore = score;
          mejor = candidato;
        }
      }
    }

    // Si encontramos algo en la primera pasada (preferidos), no hace falta la segunda
    if (mejor) break;
  }

  return mejor;
};

const insertarFlexibles = (combinacion, fijas, flexibles) => {
  // Todo lo fijo ya establecido
  let ocupado = [...combinacion, ...fijas];
  const resultado = [];

  // Prioridad 1 = más urgente → ordenar ascendente
  const flexiblesOrdenados = [...flexibles].sort((a, b) => a.prioridad - b.prioridad);

  for (const flex of flexiblesOrdenados) {
    const durMin   = flex.duracion;                           // ya está en minutos
    const sesiones = Math.ceil(flex.horasSemanales / durMin); // minutos / minutos = sesiones
    const rango    = parsearPreferenciaHoraria(flex.preferenciaHoraria);

    for (let i = 0; i < sesiones; i++) {
      // Intentar primero en rango preferido; si falla, rango completo
      let slot = buscarMejorSlot(flex, ocupado, durMin, rango);

      if (!slot && flex.preferenciaHoraria) {
        // Fallback: rango completo del día
        slot = buscarMejorSlot(flex, ocupado, durMin, { inicio: 360, fin: 1320 });
      }

      if (slot) {
        resultado.push(slot);
        ocupado = [...ocupado, slot]; // la sesión recién insertada ya ocupa espacio
      }
      // Si no hay slot posible para esta sesión, se omite sin romper el plan
    }
  }

  return resultado;
};
// ─── Orquestador principal ────────────────────────────────────────────────────

const calcularPlan = async (data) => {
  try {
    // 1. Traer cursos de la DB
    const cursosPosibles = await Promise.all(
      data.materias.map((m) => findAllByMateriaId(m))
    );

    // 2. Descartar turnos no disponibles
    const cursosDisponibles = filtrarPorDisponibilidad(cursosPosibles, data.disponibilidad);

    // 3. Todas las combinaciones (1 curso × materia)
    const combinaciones = cartesiano(cursosDisponibles);

    // 4. Filtrar las que no tienen conflictos
    const validas = combinaciones.filter((c) => esValida(c, data.fijas));

    if (validas.length === 0) {
      return { ...data, cursosPosibles, plan: null, mensaje: 'Sin combinaciones válidas' };
    }

    // 5. Ordenar por menor gap total
    validas.sort((a, b) => calcularScore(a, data.fijas) - calcularScore(b, data.fijas));

    const mejorCombinacion = validas[0];

    // 6. Insertar flexibles en el mejor plan
    const flexiblesInsertados = insertarFlexibles(mejorCombinacion, data.fijas, data.flexibles);
    
    return {
        cursos:    mejorCombinacion,
        fijas:     data.fijas,
        flexibles: flexiblesInsertados,
        score:     calcularScore(mejorCombinacion, data.fijas),
    };
  } catch (error) {
    console.error('ERROR DETALLADO:', error);
    throw error;
  }
};


// Exportar todos los métodos
module.exports = { findAllByCursoId, findAllByUserId, calcularPlan};