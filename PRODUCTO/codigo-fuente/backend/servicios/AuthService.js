// servicios/AuthService.js
const { Usuario } = require('../modelos/Usuario');
const { Carrera } = require('../modelos/Carrera');
const { TipoUsuario } = require('../modelos/TipoUsuario')
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
            { id: usuario.id, mail: usuario.mail, nombre: usuario.nombre },
            SECRET,
            { expiresIn: '8h' }
        );

        // 4. Responder con el token y datos del usuario
        return res.status(200).json({
            token,
            usuario: {
                id: usuario.id,
                mail: usuario.mail,
                nombre: usuario.nombre
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

const registro = async (req, res) => {
    const {

        nombre,
        apellido,
        nombre_usuario,
        mail,
        contraseña,
        confirmarContraseña,

        id_carrera,
        anio_ingreso,
        //id_tipo_usuario

    } = req.body || {};

    // Validar obligatorios
    if (
        !nombre ||
        !apellido ||
        !nombre_usuario ||
        !mail ||
        !contraseña ||
        !confirmarContraseña ||

        !id_carrera ||
        !anio_ingreso 
        //!id_tipo_usuario

    ) {
        return res.status(400).json({ mensaje:'Completá todos los campos obligatorios'});
    }

    // Validar contraseña
    const regex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (!regex.test(contraseña)) {return res.status(400).json({ mensaje:
            'La contraseña no cumple requisitos mínimos'
        });
    }

    // Confirmar contraseña
    if (
        contraseña !== confirmarContraseña
    ) {
        return res.status(400).json({ mensaje:'Las contraseñas no coinciden'});
    }

    try {
        // Mail repetido
        const usuarioMail = await Usuario.findOne({ where: { mail }});

        if (usuarioMail) { return res.status(409).json({ mensaje:
                'El correo ya se encuentra registrado'
            });
        }

        // Nombre de usuario repetido
        const usuarioUsername = await Usuario.findOne({where: { nombre_usuario }});

        if (usuarioUsername) {
            return res.status(409).json({ mensaje:
                'El nombre de usuario ya existe'
            });
        }

        // Hash
        const hash =
            await bcrypt.hash(contraseña, 10);

        // Crear usuario
        const nuevoUsuario =
            await Usuario.create({
                nombre,
                apellido,
                nombre_usuario,
                mail,
                contraseña: hash,

                id_carrera,
                anio_ingreso,
                id_tipo_usuario: 1
            });

        return res.status(201).json({
            mensaje:
                'Usuario registrado correctamente',

            usuario: {

                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                nombre_usuario: nuevoUsuario.nombre_usuario,
                mail: nuevoUsuario.mail,
                id_carrera: nuevoUsuario.id_carrera,
                anio_ingreso: nuevoUsuario.anio_ingreso
            }
        });

    } catch (error) {
        return res.status(500).json({

            mensaje:
                'Error interno del servidor'
        });
    }
};

module.exports = { login, registro };