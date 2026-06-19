const { Usuario } = require('../modelos/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'clave_secreta';

const login = async (mail, contraseña) => {
    // 1. Buscar el usuario por mail
    const usuario = await Usuario.findOne({ where: { mail } });

    if (!usuario) {
        throw new Error('Credenciales inválidas');
    }

    // 2. Comparar la contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
        throw new Error('Credenciales inválidas');
    }

    // 3. Firmar el token
    const token = jwt.sign(
        { id: usuario.id, mail: usuario.mail, nombre: usuario.nombre, id_tipo_usuario: usuario.id_tipo_usuario, id_carrera: usuario.id_carrera, id_plan_academico: usuario.id_plan_academico },
        SECRET,
        { expiresIn: '8h' }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            mail: usuario.mail,
            nombre: usuario.nombre,
            id_tipo_usuario: usuario.id_tipo_usuario,
            id_carrera: usuario.id_carrera,
            id_plan_academico: usuario.id_plan_academico
        }
    };
};

module.exports = { login };