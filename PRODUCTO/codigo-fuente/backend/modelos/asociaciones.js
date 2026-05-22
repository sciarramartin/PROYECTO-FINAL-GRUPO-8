//relaciones entre tablas
const { Usuario } = require('./Usuario');
const { TipoUsuario } = require('./TipoUsuario');
const { Carrera } = require('./Carrera');
const { Amistad } = require('./Amistad');
const { Grupo } = require('./Grupo');
const { GrupoMiembro } = require('./GrupoMiembro');
const { GrupoMensaje } = require('./GrupoMensaje');

Usuario.belongsTo(TipoUsuario, {
    foreignKey: 'id_tipo_usuario'
});

Usuario.belongsTo(Carrera, {
    foreignKey: 'id_carrera'
});

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