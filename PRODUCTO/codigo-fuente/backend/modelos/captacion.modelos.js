// modelos/captacion.modelos.js
// Modelos para tablas nuevas. NO modifican el modelo Usuario existente.
// Las tablas se crean ejecutando 001 y 002 en SQLite (no usar sync({force:true})).
const { DataTypes, literal } = require('sequelize');
const { baseDeDatos } = require('../database/base-de-datos');
const sequelize = baseDeDatos;

const MatriculaReferencia = sequelize.models.MatriculaReferencia || sequelize.define('MatriculaReferencia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  anio: { type: DataTypes.INTEGER, allowNull: false },
  semestre: { type: DataTypes.INTEGER, allowNull: false },
  matricula_total: { type: DataTypes.INTEGER, allowNull: false },
  fuente: { type: DataTypes.STRING(300), allowNull: true },
  registrado_por: { type: DataTypes.INTEGER, allowNull: false },
  registrados_snapshot: { type: DataTypes.INTEGER, allowNull: false },
  criterio_conteo: { type: DataTypes.STRING(20), allowNull: false },
  creado_en: { type: DataTypes.DATE, allowNull: false, defaultValue: literal('CURRENT_TIMESTAMP') }
}, { tableName: 'matriculas_referencia', freezeTableName: true, timestamps: false });

const MatriculaReferenciaCarrera = sequelize.models.MatriculaReferenciaCarrera || sequelize.define('MatriculaReferenciaCarrera', {
  id_matricula_referencia: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  id_carrera: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
  matricula_estimada: { type: DataTypes.INTEGER, allowNull: false },
  registrados_snapshot: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'matriculas_referencia_carrera', freezeTableName: true, timestamps: false });

const CaptacionCohorteSnapshot = sequelize.models.CaptacionCohorteSnapshot || sequelize.define('CaptacionCohorteSnapshot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_matricula_referencia: { type: DataTypes.INTEGER, allowNull: false },
  anio_ingreso: { type: DataTypes.INTEGER, allowNull: true },
  usuarios_snapshot: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'captacion_cohortes_snapshot', freezeTableName: true, timestamps: false });

module.exports = {
  sequelize,
  MatriculaReferencia,
  MatriculaReferenciaCarrera,
  CaptacionCohorteSnapshot
};
