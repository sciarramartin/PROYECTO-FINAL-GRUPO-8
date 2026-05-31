const UsuarioService = require('../servicios/UsuarioService');
const AuthService = require('../servicios/AuthService');
const { verificarToken } = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();

// POST /api/usuarios/registro
router.post('/registro', async (req, res) => {
    try {
        const usuarioCreado = await UsuarioService.crearUsuario(req.body);
        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: usuarioCreado
        });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || 'Error interno del servidor' });
    }
});

// GET /api/usuarios/buscar
// Búsqueda de personas ignorando comas, acentos y mayúsculas
router.get('/buscar', verificarToken, async (req, res) => {
    try {
        const { q } = req.query;
        const excluirId = req.usuario.id; // Excluir automáticamente al usuario logueado
        const usuarios = await UsuarioService.buscarUsuarios(q, excluirId);
        return res.status(200).json(usuarios);
    } catch (error) {
        console.error("Error al buscar usuarios:", error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al realizar la búsqueda' });
    }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await UsuarioService.obtenerUsuarioPorId(id);
        return res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || 'Usuario no encontrado' });
    }
});

// 3. PUT /api/usuarios/perfil-alumno
// Solo Alumno: El estudiante actualiza SU PROPIO perfil (Nombre de usuario / Foto).
// No lleva /:id porque el sistema sabrá quién es mediante su sesión (req.usuario.id).
router.put('/perfil-alumno', async (req, res) => {
    try {
        // En el futuro, req.usuario.id vendrá del middleware de autenticación (JWT)
        // Por ahora, para probar en Postman, puedes simular un ID fijo (ej: 1)
        const idUsuarioLogueado = req.usuario?.id || 1;

        // Solo le pasamos al servicio los campos que el alumno TIENE PERMITIDO cambiar
        const { nombre_usuario /**, foto_perfil */ } = req.body;

        const usuarioActualizado = await UsuarioService.actualizarPerfilAlumno(idUsuarioLogueado, {
            nombre_usuario,
            /**foto_perfil */
        });

        return res.status(200).json({
            mensaje: 'Perfil actualizado correctamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error(error);
        return res.status(error.status || 500).json({ error: error.message || 'Error al actualizar perfil' });
    }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await UsuarioService.eliminarUsuario(id);

        return res.status(200).json({
            mensaje: `Usuario con ID ${id} eliminado correctamente.`
        });
    } catch (error) {
        console.error("Error al eliminar usuario manualmente:", error);
        return res.status(error.status || 500).json({ error: error.message || 'Hubo un error al procesar la baja.' });
    }
});


module.exports = router;