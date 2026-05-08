// modelos/UsuarioDAO.js
const { Usuario } = require('./Usuario');

class UsuarioDAO {

    async findByEmail(mail) {
        const usuario = await Usuario.findOne({ where: { mail } });
        return usuario;
    }

    async findByResetToken(token) {
        const usuario = await Usuario.findOne({ where: { reset_token: token } });
        return usuario;
    }

    async guardarResetToken(mail, token, expiracion) {
        await Usuario.update(
            {
                reset_token: token,
                reset_token_expira: expiracion
            },
            { where: { mail } }
        );
    }

    async actualizarContrasena(id, nuevaContraseña) {
        await Usuario.update(
            {
                contraseña: nuevaContraseña,
                reset_token: null,
                reset_token_expira: null
            },
            { where: { id } }
        );
    }

    // async findById(id) { }       → US: ver perfil / dashboard
    // async create(data) { }       → US: registro de usuario

}

module.exports = { UsuarioDAO };