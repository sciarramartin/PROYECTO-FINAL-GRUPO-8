// servicios/UsuarioService.js
const { Usuario } = require('../modelos/Usuario');
const bcrypt = require('bcrypt');
//const { Carrera } = require('../modelos/Carrera');
//const { TipoUsuario } = require('../modelos/TipoUsuario')
// const jwt = require('jsonwebtoken');
// const SECRET = process.env.JWT_SECRET || 'clave_secreta';

// valida y guarda un nuevo usuario
const crearUsuario = async (datosRegistro) => {
    const {
        nombre,
        apellido,
        nombre_usuario,
        mail,
        contraseña,
        confirmarContraseña,
        id_carrera,
        anio_ingreso
    } = datosRegistro || {};

    // Validar campos obligatorios
    if (!nombre || !apellido || !nombre_usuario || !mail || !contraseña || !confirmarContraseña || !id_carrera || !anio_ingreso) {
        throw { status: 400, message: 'Completá todos los campos obligatorios' };
    }

    // Validar requisitos mínimos de contraseña
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!regex.test(contraseña)) {
        throw { status: 400, message: 'La contraseña no cumple requisitos mínimos' };
    }

    // Confirmar contraseña
    if (contraseña !== confirmarContraseña) {
        throw { status: 400, message: 'Las contraseñas no coinciden' };
    }

    // Verificar duplicados
    const usuario_Mail = await Usuario.findOne({ where: { mail } });
    if (usuario_Mail) {
        throw { status: 409, message: 'El correo ya se encuentra registrado' };
    }

    const usuario_Nombre = await Usuario.findOne({ where: { nombre_usuario } });
    if (usuario_Nombre) {
        throw { status: 409, message: 'El nombre de usuario ya existe' };
    }

    // Cifrar contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    // Crear el registro con Sequelize
    const nuevo_Usuario = await Usuario.create({
        nombre,
        apellido,
        nombre_usuario,
        mail,
        contraseña: hash,
        id_carrera,
        anio_ingreso,
        id_tipo_usuario: 1 // Rol estándar
    });

    return {
        id: nuevo_Usuario.id,
        nombre: nuevo_Usuario.nombre,
        apellido: nuevo_Usuario.apellido,
        nombre_usuario: nuevo_Usuario.nombre_usuario,
        mail: nuevo_Usuario.mail,
        id_carrera: nuevo_Usuario.id_carrera,
        anio_ingreso: nuevo_Usuario.anio_ingreso
    };
};

const obtenerUsuarioPorId = async (id) => {
    // Buscamos por Clave Primaria (Pk)
    const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['contraseña'] } // Por seguridad, nunca enviamos la contraseña
    });
    
    if (!usuario) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }
    
    return usuario;
};


const actualizarPerfilAlumno = async (id, datosPermitidos) => {
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }

    await usuario.update({
        nombre_usuario: datosPermitidos.nombre_usuario || usuario.nombre_usuario
        // Si a futuro agregan campo 'foto_perfil' en el modelo, se sumaría acá igual
    });

    return {
        id: usuario.id,
        nombre_usuario: usuario.nombre_usuario,
        mail: usuario.mail
    };
};

const eliminarUsuario = async (id) => {
    const usuario = await Usuario.findByPk(id);
    
    if (!usuario) {
        throw { status: 404, message: 'El usuario que intentás eliminar no existe.' };
    }

    // Elimina la fila de la base de datos
    await usuario.destroy();
    return true;
};

const buscarUsuarios = async (terminoBusqueda, idUsuarioActual) => {
    if (!terminoBusqueda) {
        return [];
    }

    const { Op } = require('sequelize');

    // 1. Normalizar el término de búsqueda: quitar comas, minúsculas, remover acentos
    const terminoNormalizado = terminoBusqueda
        .toLowerCase()
        .replace(/,/g, '')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();

    if (!terminoNormalizado) {
        return [];
    }

    // 2. Traer todos los usuarios (excluyendo al usuario actual si se pasa)
    const whereClause = idUsuarioActual ? { id: { [Op.ne]: Number(idUsuarioActual) } } : {};
    
    const todosLosUsuarios = await Usuario.findAll({
        where: whereClause,
        attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'mail', 'id_carrera', 'anio_ingreso']
    });

    // Helper para normalizar strings para la comparación
    const normalizarString = (str) => {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    };

    // 3. Filtrar en memoria para asegurar concordancia perfecta ignorando acentos y comas
    const resultados = todosLosUsuarios.filter(usuario => {
        const nombreNorm = normalizarString(usuario.nombre);
        const apellidoNorm = normalizarString(usuario.apellido);
        const nombreUsuarioNorm = normalizarString(usuario.nombre_usuario);
        const nombreCompletoNorm = `${nombreNorm} ${apellidoNorm}`;
        const nombreCompletoInversoNorm = `${apellidoNorm} ${nombreNorm}`;

        return nombreNorm.includes(terminoNormalizado) ||
               apellidoNorm.includes(terminoNormalizado) ||
               nombreUsuarioNorm.includes(terminoNormalizado) ||
               nombreCompletoNorm.includes(terminoNormalizado) ||
               nombreCompletoInversoNorm.includes(terminoNormalizado);
    });

    // Devolver los primeros 15 resultados
    return resultados.slice(0, 15);
};

module.exports = { 
    crearUsuario, 
    obtenerUsuarioPorId, 
    actualizarPerfilAlumno, 
    eliminarUsuario,
    buscarUsuarios
};