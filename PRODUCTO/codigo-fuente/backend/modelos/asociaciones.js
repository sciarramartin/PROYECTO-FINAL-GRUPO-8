//relaciones entre tablas
const { Usuario } = require('./Usuario');
const { TipoUsuario } = require('./TipoUsuario');
const { Carrera } = require('./Carrera');
const { Amistad } = require('./Amistad');

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