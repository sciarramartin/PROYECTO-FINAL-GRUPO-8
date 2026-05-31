//relaciones entre tablas
const { Usuario } = require('./Usuario');
const { TipoUsuario } = require('./TipoUsuario');
const { Carrera } = require('./Carrera');
const { Materia } = require('./materia.modelo');
const { EstadoMateria } = require('./EstadoMateria');
const { Amistad } = require('./Amistad');
const { Grupo } = require('./Grupo');
const { GrupoMiembro } = require('./GrupoMiembro');
const { GrupoMensaje } = require('./GrupoMensaje');
const { MensajePrivado } = require('./MensajePrivado');
const { Perfil } = require('./Perfil');

Usuario.belongsTo(TipoUsuario, {
    foreignKey: 'id_tipo_usuario'
});

Usuario.belongsTo(Carrera, {
    foreignKey: 'id_carrera'
});

// Relación de EstadoMateria y Materia
Usuario.hasMany(EstadoMateria, { foreignKey: 'id_usuario' });
EstadoMateria.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Materia.hasMany(EstadoMateria, { foreignKey: 'id_materia' });
EstadoMateria.belongsTo(Materia, { foreignKey: 'id_materia' });

Materia.belongsTo(Carrera, { foreignKey: 'id_carrera' });
Carrera.hasMany(Materia, { foreignKey: 'id_carrera' });

// Relación de muchos a muchos auto-referencial (Reflexiva) a través de la tabla intermedia Amistad
Usuario.belongsToMany(Usuario, {
    as: 'AmigosEnviados',
    through: Amistad,
    foreignKey: 'id_usuario_origen',
    otherKey: 'id_usuario_destino'
});

Usuario.belongsToMany(Usuario, {
    as: 'AmigosRecibidos',
    through: Amistad,
    foreignKey: 'id_usuario_destino',
    otherKey: 'id_usuario_origen'
});

// Relaciones para búsquedas directas desde la tabla intermedia
Amistad.belongsTo(Usuario, { as: 'UsuarioOrigen', foreignKey: 'id_usuario_origen' });
Amistad.belongsTo(Usuario, { as: 'UsuarioDestino', foreignKey: 'id_usuario_destino' });

// Relaciones de Grupos
// Relación Muchos a Muchos entre Usuario y Grupo para Miembros
Usuario.belongsToMany(Grupo, {
    through: GrupoMiembro,
    foreignKey: 'id_usuario',
    otherKey: 'id_grupo'
});

Grupo.belongsToMany(Usuario, {
    as: 'Miembros',
    through: GrupoMiembro,
    foreignKey: 'id_grupo',
    otherKey: 'id_usuario'
});

// Relación de creador del Grupo
Grupo.belongsTo(Usuario, {
    as: 'Creador',
    foreignKey: 'id_creador'
});

// Relación de Mensajes del Grupo
GrupoMensaje.belongsTo(Grupo, {
    foreignKey: 'id_grupo'
});

GrupoMensaje.belongsTo(Usuario, {
    as: 'Autor',
    foreignKey: 'id_usuario'
});

Grupo.hasMany(GrupoMensaje, {
    foreignKey: 'id_grupo',
    onDelete: 'CASCADE'
});

// Relaciones directas con la tabla intermedia GrupoMiembro para búsquedas y consultas
GrupoMiembro.belongsTo(Grupo, { foreignKey: 'id_grupo' });
GrupoMiembro.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Grupo.hasMany(GrupoMiembro, { foreignKey: 'id_grupo', onDelete: 'CASCADE' });
Usuario.hasMany(GrupoMiembro, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });

// Relaciones de Mensajería Privada
MensajePrivado.belongsTo(Usuario, { as: 'Remitente', foreignKey: 'id_remitente' });
MensajePrivado.belongsTo(Usuario, { as: 'Destinatario', foreignKey: 'id_destinatario' });
Usuario.hasMany(MensajePrivado, { foreignKey: 'id_remitente', as: 'MensajesEnviados' });
Usuario.hasMany(MensajePrivado, { foreignKey: 'id_destinatario', as: 'MensajesRecibidos' });

// Relación de Perfil Académico (1 a 1 con Usuario)
Usuario.hasOne(Perfil, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Perfil.belongsTo(Usuario, { foreignKey: 'id_usuario' });
