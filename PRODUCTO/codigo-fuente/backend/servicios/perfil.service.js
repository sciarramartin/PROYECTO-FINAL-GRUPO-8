// servicios/perfil.service.js
const { Perfil } = require('../modelos/Perfil');
const { Usuario } = require('../modelos/Usuario');
const { Carrera } = require('../modelos/Carrera');

// Helper para verificar usuario
const verificarUsuarioExiste = async (id) => {
    const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'nombre', 'apellido', 'nombre_usuario', 'mail', 'id_carrera', 'anio_ingreso'],
        include: [{ model: Carrera, attributes: ['id', 'nombre', 'facultad'] }]
    });
    if (!usuario) {
        throw { status: 404, message: 'Usuario no encontrado' };
    }
    return usuario;
};

// 1. Obtener o Crear Perfil de usuario (para la sesión actual)
const obtenerOcrearPerfil = async (idUsuario) => {
    const userId = Number(idUsuario);
    const usuario = await verificarUsuarioExiste(userId);

    // Buscar perfil o crearlo si no existe
    const [perfil, creado] = await Perfil.findOrCreate({
        where: { id_usuario: userId },
        defaults: {
            apodo: '',
            anio_cursado: null,
            biografia: '',
            foto_perfil: '',
            link_discord: '',
            link_telegram: '',
            link_whatsapp: '',
            link_github: '',
            link_linkedin: '',
            intereses: '[]', // JSON stringified de arreglo vacío
            rol_equipo: '',
            mostrar_anio_cursado: true,
            mostrar_contacto: true
        }
    });

    return {
        usuario,
        perfil
    };
};

// 2. Actualizar Perfil de usuario
const actualizarPerfil = async (idUsuario, datos) => {
    const userId = Number(idUsuario);
    
    // 1. Verificar usuario y obtener o crear su perfil
    const { perfil } = await obtenerOcrearPerfil(userId);

    // 2. Si se pasa id_carrera, actualizar la carrera en el modelo Usuario
    if (datos.id_carrera) {
        const usuario = await Usuario.findByPk(userId);
        if (usuario) {
            await usuario.update({ id_carrera: Number(datos.id_carrera) });
        }
    }

    // 3. Normalizar intereses (si viene como array, convertir a string JSON)
    let interesesString = perfil.intereses;
    if (datos.intereses !== undefined) {
        if (Array.isArray(datos.intereses)) {
            interesesString = JSON.stringify(datos.intereses);
        } else if (typeof datos.intereses === 'string') {
            interesesString = datos.intereses;
        }
    }

    // 4. Validar longitud biografía de forma estricta (máximo 250 caracteres)
    if (datos.biografia && datos.biografia.length > 250) {
        throw { status: 400, message: 'La biografía no puede superar los 250 caracteres.' };
    }

    // 5. Actualizar el perfil
    await perfil.update({
        apodo: datos.apodo !== undefined ? datos.apodo : perfil.apodo,
        anio_cursado: datos.anio_cursado !== undefined ? datos.anio_cursado : perfil.anio_cursado,
        biografia: datos.biografia !== undefined ? datos.biografia : perfil.biografia,
        foto_perfil: datos.foto_perfil !== undefined ? datos.foto_perfil : perfil.foto_perfil,
        link_discord: datos.link_discord !== undefined ? datos.link_discord : perfil.link_discord,
        link_telegram: datos.link_telegram !== undefined ? datos.link_telegram : perfil.link_telegram,
        link_whatsapp: datos.link_whatsapp !== undefined ? datos.link_whatsapp : perfil.link_whatsapp,
        link_github: datos.link_github !== undefined ? datos.link_github : perfil.link_github,
        link_linkedin: datos.link_linkedin !== undefined ? datos.link_linkedin : perfil.link_linkedin,
        intereses: interesesString,
        rol_equipo: datos.rol_equipo !== undefined ? datos.rol_equipo : perfil.rol_equipo,
        mostrar_anio_cursado: datos.mostrar_anio_cursado !== undefined ? datos.mostrar_anio_cursado : perfil.mostrar_anio_cursado,
        mostrar_contacto: datos.mostrar_contacto !== undefined ? datos.mostrar_contacto : perfil.mostrar_contacto
    });

    // Retornar datos frescos y actualizados
    return obtenerOcrearPerfil(userId);
};

// 3. Obtener Perfil Público (respetando opciones de privacidad)
const obtenerPerfilPublico = async (idUsuarioDestino, idUsuarioActual) => {
    const destId = Number(idUsuarioDestino);
    const actId = Number(idUsuarioActual);

    // Obtener perfil y datos del usuario destino
    const { usuario, perfil } = await obtenerOcrearPerfil(destId);

    // Copias para no mutar el modelo directamente en memoria de Sequelize
    const perfilPublico = perfil.toJSON();
    const usuarioPublico = usuario.toJSON();

    // Aplicar lógica de privacidad si NO es su propio perfil
    if (destId !== actId) {
        // A. Ocultar año cursado y de ingreso
        if (!perfilPublico.mostrar_anio_cursado) {
            perfilPublico.anio_cursado = null;
            usuarioPublico.anio_ingreso = null; // Ocultamos también año de ingreso por privacidad
        }

        // B. Ocultar redes de mensajería y contacto
        if (!perfilPublico.mostrar_contacto) {
            perfilPublico.link_discord = '';
            perfilPublico.link_telegram = '';
            perfilPublico.link_whatsapp = '';
            // Nota: Mantenemos GitHub y LinkedIn ya que son redes profesionales, 
            // pero si se deseara ocultar todo, se pueden agregar aquí
        }
    }

    return {
        usuario: usuarioPublico,
        perfil: perfilPublico
    };
};

module.exports = {
    obtenerOcrearPerfil,
    actualizarPerfil,
    obtenerPerfilPublico
};
