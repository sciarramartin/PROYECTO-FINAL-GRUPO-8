// models/AuthService.js
const { UsuarioDAO } = require('./UsuarioDAO');
const { BcryptHelper } = require('../utils/bcryptHelper');

class AuthService {

    constructor() {
        this.usuarioDAO = new UsuarioDAO();
        this.bcryptHelper = new BcryptHelper();
    }

    async login(mail, contraseña) {
        // 1. Buscar el usuario por mail
        const usuario = await this.usuarioDAO.findByEmail(mail);

        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        // 2. Comparar la contraseña
        const contraseñaValida = await this.bcryptHelper.comparar(contraseña, usuario.contraseña);

        if (!contraseñaValida) {
            throw new Error('Credenciales inválidas');
        }

        // 3. Retornar el usuario si todo está bien
        return usuario;
    }

}

module.exports = { AuthService };