// servicios/captacion.servicio.js
const { fn, col, Op } = require('sequelize');
const { Usuario } = require('../modelos/Usuario');
const { Carrera } = require('../modelos/Carrera');
const {
  sequelize, MatriculaReferencia, MatriculaReferenciaCarrera, CaptacionCohorteSnapshot
} = require('../modelos/captacion.modelos');
const { porcentaje, validarReferencia } = require('./captacion.util');
const { resumirConteos, ordenarCohortes } = require('./captacion.cohortes');

function errorHttp(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Definición de usuario 'activo' para esta US: cuenta de ESTUDIANTE que existe en la BD.
// id_tipo_usuario = 1 se confirma en UsuarioService.crearUsuario.
// NO usamos año de ingreso para inferir registro, conexión o actividad reciente.
async function obtenerConteos(transaction) {
  const filas = await Usuario.findAll({
    attributes: [
      'id_carrera',
      'anio_ingreso',
      [fn('COUNT', col('id')), 'cantidad']
    ],
    where: { id_tipo_usuario: 1 },
    group: ['id_carrera', 'anio_ingreso'],
    raw: true,
    ...(transaction ? { transaction } : {})
  });
  return resumirConteos(filas);
}

function calcularDepartamentos(carreras, conteos, referencias) {
  // 'facultad' en Carrera.js NO es sinónimo de departamento.
  // Solo se calcula si en el futuro se agrega un campo departamental real.
  const atributos = typeof Carrera.getAttributes === 'function'
    ? Carrera.getAttributes()
    : Carrera.rawAttributes || {};
  const campo = ['departamento', 'nombre_departamento', 'id_departamento']
    .find((c) => Object.prototype.hasOwnProperty.call(atributos, c));
  if (!campo) return [];

  const agrupados = new Map();
  for (const carrera of carreras) {
    const valor = carrera[campo];
    if (valor === null || valor === undefined || valor === '') continue;
    const key = String(valor);
    const item = agrupados.get(key) || {
      departamento: campo === 'id_departamento' ? `Departamento ${key}` : key,
      usuariosRegistrados: 0, matriculaReferencia: 0,
      carrerasTotal: 0, carrerasConReferencia: 0
    };
    item.carrerasTotal += 1;
    item.usuariosRegistrados += conteos.porCarrera.get(Number(carrera.id)) || 0;
    if (referencias.has(Number(carrera.id))) {
      item.carrerasConReferencia += 1;
      item.matriculaReferencia += referencias.get(Number(carrera.id));
    }
    agrupados.set(key, item);
  }
  return [...agrupados.values()].map((d) => {
    const completo = d.carrerasTotal === d.carrerasConReferencia;
    return {
      ...d,
      matriculaReferencia: completo ? d.matriculaReferencia : null,
      tasaCaptacion: completo ? porcentaje(d.usuariosRegistrados, d.matriculaReferencia) : null
    };
  });
}

class CaptacionService {
  async verificarAdminEnBase(idUsuario, transaction) {
    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ['id', 'id_tipo_usuario'], ...(transaction ? { transaction } : {})
    });
    if (!usuario || Number(usuario.id_tipo_usuario) !== 3) {
      throw errorHttp('Solo un administrador puede registrar matrículas de referencia.', 403);
    }
  }

  async obtenerResumen(idUsuario) {
    const atributos = typeof Carrera.getAttributes === 'function'
      ? Carrera.getAttributes() : Carrera.rawAttributes || {};
    const campoDepartamento = ['departamento', 'nombre_departamento', 'id_departamento']
      .find((campo) => Object.prototype.hasOwnProperty.call(atributos, campo));

    const [conteos, ultimas, carreras, usuarioSolicitante] = await Promise.all([
      obtenerConteos(),
      MatriculaReferencia.findAll({ order: [['anio', 'DESC'], ['semestre', 'DESC']], limit: 12, raw: true }),
      Carrera.findAll({
        attributes: ['id', 'nombre', ...(campoDepartamento ? [campoDepartamento] : [])],
        order: [['nombre', 'ASC']], raw: true
      }),
      Usuario.findByPk(idUsuario, { attributes: ['id_tipo_usuario'], raw: true })
    ]);
    const ultima = ultimas[0] || null;
    const ids = ultimas.map((r) => Number(r.id));
    const [detalles, cohortesHistoricas] = await Promise.all([
      ultima ? MatriculaReferenciaCarrera.findAll({
        where: { id_matricula_referencia: ultima.id }, raw: true
      }) : [],
      ids.length ? CaptacionCohorteSnapshot.findAll({
        where: { id_matricula_referencia: { [Op.in]: ids } }, raw: true
      }) : []
    ]);
    const matriculasCarrera = new Map(detalles.map((d) => [Number(d.id_carrera), Number(d.matricula_estimada)]));
    const porCarrera = carreras.map((c) => {
      const idCarrera = Number(c.id);
      const usuariosRegistrados = conteos.porCarrera.get(idCarrera) || 0;
      const matriculaReferencia = matriculasCarrera.get(idCarrera) ?? null;
      return {
        idCarrera, nombre: c.nombre, usuariosRegistrados, matriculaReferencia,
        tasaCaptacion: porcentaje(usuariosRegistrados, matriculaReferencia),
        porAnioIngreso: conteos.porCarreraAnio.get(idCarrera) || []
      };
    });
    const cohortesPorReferencia = new Map();
    for (const fila of cohortesHistoricas) {
      const refId = Number(fila.id_matricula_referencia);
      const lista = cohortesPorReferencia.get(refId) || [];
      lista.push({
        anioIngreso: fila.anio_ingreso == null ? null : Number(fila.anio_ingreso),
        usuariosSnapshot: Number(fila.usuarios_snapshot)
      });
      cohortesPorReferencia.set(refId, lista);
    }

    return {
      usuariosRegistrados: conteos.total,
      definicionUsuarios: 'Cuentas de estudiantes existentes en la plataforma, sin medir inicios de sesión.',
      criterioConteo: 'registrados', // compatibilidad con la versión previa de la API
      sinAnioIngreso: conteos.sinAnioIngreso,
      porAnioIngreso: conteos.porAnioIngreso,
      referencia: ultima ? {
        id: ultima.id, anio: ultima.anio, semestre: ultima.semestre,
        matriculaTotal: Number(ultima.matricula_total), fuente: ultima.fuente,
        registradoEn: ultima.creado_en,
        criterioConteoSnapshot: ultima.criterio_conteo
      } : null,
      tasaCaptacion: ultima ? porcentaje(conteos.total, Number(ultima.matricula_total)) : null,
      porCarrera,
      porDepartamento: calcularDepartamentos(carreras, conteos, matriculasCarrera),
      historial: [...ultimas].reverse().map((r) => ({
        id: Number(r.id), anio: Number(r.anio), semestre: Number(r.semestre),
        matriculaTotal: Number(r.matricula_total),
        usuariosSnapshot: Number(r.registrados_snapshot),
        tasaSnapshot: porcentaje(Number(r.registrados_snapshot), Number(r.matricula_total)),
        criterioConteo: r.criterio_conteo,
        registradoEn: r.creado_en,
        // NULL significa que el snapshot de cohortes no existe, no que es cero.
        cohortesSnapshot: cohortesPorReferencia.has(Number(r.id))
          ? cohortesPorReferencia.get(Number(r.id)).sort(ordenarCohortes)
          : null
      })),
      puedeEditar: Number(usuarioSolicitante?.id_tipo_usuario) === 3
    };
  }

  async registrarReferencia(body, idAdmin) {
    const entrada = validarReferencia(body);
    // También se verifica contra la BD para que un JWT viejo de admin no habilite POST.
    await this.verificarAdminEnBase(idAdmin);
    if (entrada.porCarrera.length) {
      const ids = entrada.porCarrera.map((c) => c.idCarrera);
      const carreras = await Carrera.findAll({
        attributes: ['id'], where: { id: { [Op.in]: ids } }, raw: true
      });
      if (carreras.length !== ids.length) throw errorHttp('Una o más carreras no existen.', 400);
    }
    try {
      return await sequelize.transaction(async (transaction) => {
        // Revalidación del rol dentro de la misma transacción.
        await this.verificarAdminEnBase(idAdmin, transaction);
        const conteos = await obtenerConteos(transaction);
        const creada = await MatriculaReferencia.create({
          anio: entrada.anio, semestre: entrada.semestre,
          matricula_total: entrada.matriculaTotal,
          fuente: entrada.fuente, registrado_por: idAdmin,
          registrados_snapshot: conteos.total,
          criterio_conteo: 'registrados'
        }, { transaction });

        if (entrada.porCarrera.length) {
          await MatriculaReferenciaCarrera.bulkCreate(entrada.porCarrera.map((c) => ({
            id_matricula_referencia: creada.id,
            id_carrera: c.idCarrera,
            matricula_estimada: c.matriculaEstimada,
            registrados_snapshot: conteos.porCarrera.get(c.idCarrera) || 0
          })), { transaction });
        }
        if (conteos.porAnioIngreso.length) {
          await CaptacionCohorteSnapshot.bulkCreate(conteos.porAnioIngreso.map((c) => ({
            id_matricula_referencia: creada.id,
            anio_ingreso: c.anioIngreso,
            usuarios_snapshot: c.usuariosRegistrados
          })), { transaction });
        }
        return {
          id: creada.id, anio: creada.anio, semestre: creada.semestre,
          matriculaTotal: creada.matricula_total,
          usuariosSnapshot: conteos.total,
          sinAnioIngresoSnapshot: conteos.sinAnioIngreso,
          cohortesSnapshot: conteos.porAnioIngreso.map(({ anioIngreso, usuariosRegistrados }) => ({
            anioIngreso, usuariosSnapshot: usuariosRegistrados
          })),
          criterioConteo: 'registrados',
          tasaSnapshot: porcentaje(conteos.total, creada.matricula_total)
        };
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError' || /UNIQUE constraint failed/i.test(err.message)) {
        throw errorHttp('Ya existe una matrícula para ese año y semestre. No se sobrescribe.', 409);
      }
      throw err;
    }
  }
}

module.exports = new CaptacionService();
