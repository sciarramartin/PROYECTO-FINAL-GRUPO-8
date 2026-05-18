// servicios/AuthService.js
const { Usuario } = require('../modelos/Usuario');
// const { Carrera } = require('../modelos/Carrera');
// const { TipoUsuario } = require('../modelos/TipoUsuario')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'clave_secreta';

const login = async (req, res) => {
    const { mail, contraseña } = req.body;

    if (!mail || !contraseña) {
        return res.status(400).json({ mensaje: 'Completá todos los campos' });
    }

    try {
        // 1. Buscar el usuario por mail
        const usuario = await Usuario.findOne({ where: { mail } });

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // 2. Comparar la contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!contraseñaValida) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // 3. Firmar el token
        const token = jwt.sign(
            { id: usuario.id, mail: usuario.mail, nombre: usuario.nombre, id_tipo_usuario: usuario.id_tipo_usuario },
            SECRET,
            { expiresIn: '8h' }
        );

        // 4. Responder con el token y datos del usuario
        return res.status(200).json({
            token,
            usuario: {
                id: usuario.id,
                mail: usuario.mail,
                nombre: usuario.nombre,
                id_tipo_usuario: usuario.id_tipo_usuario
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            mensaje:
                'Error interno del servidor',
            error: error.message
        });
        //return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = { login };