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
  }

  return totalGap; // Menor es mejor
};

// ─── Inserción de flexibles ───────────────────────────────────────────────────

const insertarFlexibles = (combinacion, fijas, flexibles) => {
  // Snapshot de todo lo ya ocupado
  const ocupado = [...combinacion, ...fijas];
  const resultado = [];

  // Ordenar por prioridad descendente (prioridad 1 = más importante)
  const flexiblesOrdenados = [...flexibles].sort((a, b) => a.prioridad - b.prioridad);

  for (const flex of flexiblesOrdenados) {
    const durMin     = parseInt(flex.duracion, 10);
    const horasTotal = parseFloat(flex.horasSemanales);
    const sesiones   = Math.ceil((horasTotal * 60) / durMin);

    let sesionesInsertadas = 0;
    const diasOrden = [...(flex.diasPreferidos ?? []), ...DIA_BITS.filter((b) => !flex.diasPreferidos?.includes(b))];

    for (const bit of diasOrden) {
      if (sesionesInsertadas >= sesiones) break;

      // Buscar hueco libre en este día (en bloques de 30 min desde 06:00 a 22:00)
      for (let startMin = 360; startMin + durMin <= 1320; startMin += 30) {
        const candidato = {
          nombre:     flex.nombre.trim(),
          horaInicio: `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}`,
          duracion:   durMin,
          dias:       bit,
          esFlexible: true,
        };

        const sinConflicto = [...ocupado, ...resultado].every((a) => !hayConflicto(candidato, a));

        if (sinConflicto) {
          resultado.push(candidato);
          sesionesInsertadas++;
          break;
        }
      }
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