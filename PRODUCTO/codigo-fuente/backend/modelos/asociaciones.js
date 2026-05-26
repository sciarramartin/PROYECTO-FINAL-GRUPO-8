//relaciones entre tablas
const { Usuario } = require('./Usuario');
const { TipoUsuario } = require('./TipoUsuario');
const { Carrera } = require('./Carrera');
const { Materia } = require('./materia.modelo');
const { EstadoMateria } = require('./EstadoMateria');

Usuario.belongsTo(TipoUsuario, {
    foreignKey: 'id_tipo_usuario'
});

Usuario.belongsTo(Carrera, {
    foreignKey: 'id_carrera'
});

Usuario.hasMany(EstadoMateria, { foreignKey: 'id_usuario' });
EstadoMateria.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Materia.hasMany(EstadoMateria, { foreignKey: 'id_materia' });
EstadoMateria.belongsTo(Materia, { foreignKey: 'id_materia' });