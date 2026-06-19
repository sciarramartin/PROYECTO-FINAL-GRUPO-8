// tests/controladores/controlador-usuarios.test.js

// se testea solo el comportamiento del controlador
// PERO sin probar lógica compleja de validación. Eso es en test-e2e

const request = require('supertest');
const express = require('express');

// Mock del servicio
jest.mock('../../servicios/UsuarioService', () => ({
    crearUsuario: jest.fn(),
    obtenerUsuarioPorId: jest.fn(),
    actualizarPerfilAlumno: jest.fn(),
    eliminarUsuario: jest.fn()
}));

const UsuarioService = require('../../servicios/UsuarioService');
const usuarioRouter = require('../../controladores/controlador-usuarios');

const app = express();
app.use(express.json());

// Montamos las rutas
app.use('/api/usuarios', usuarioRouter);

describe('Controlador Usuario', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =========================================
    // POST /registro
    // =========================================
    describe('POST /api/usuarios/registro', () => {

        it('debería registrar un usuario correctamente', async () => {

            const usuarioMock = {
                id: 1,
                nombre: 'Luciana',
                apellido: 'Zahr',
                mail: 'luciana@test.com'
            };

            UsuarioService.crearUsuario.mockResolvedValue(usuarioMock);

            const response = await request(app)
                .post('/api/usuarios/registro')
                .send({
                    nombre: 'Luciana',
                    apellido: 'Zahr',
                    mail: 'luciana@test.com',
                    contraseña: 'Test123!',
                    nombre_usuario: 'luchi'
                });

            expect(response.status).toBe(201);

            expect(response.body).toEqual({
                mensaje: 'Usuario registrado correctamente',
                usuario: usuarioMock
            });

            expect(UsuarioService.crearUsuario).toHaveBeenCalledTimes(1);
        });

        it('debería devolver error si el servicio falla', async () => {

            UsuarioService.crearUsuario.mockRejectedValue({
                status: 400,
                message: 'El mail ya está registrado'
            });

            const response = await request(app)
                .post('/api/usuarios/registro')
                .send({
                    mail: 'repetido@test.com'
                });

            expect(response.status).toBe(400);

            expect(response.body).toEqual({
                error: 'El mail ya está registrado'
            });
        });

    });

    // =========================================
    // GET /:id
    // =========================================
    describe('GET /api/usuarios/:id', () => {

        it('debería obtener un usuario por ID', async () => {

            const usuarioMock = {
                id: 1,
                nombre: 'Luciana'
            };

            UsuarioService.obtenerUsuarioPorId.mockResolvedValue(usuarioMock);

            const response = await request(app)
                .get('/api/usuarios/1');

            expect(response.status).toBe(200);

            expect(response.body).toEqual(usuarioMock);

            expect(UsuarioService.obtenerUsuarioPorId)
                .toHaveBeenCalledWith('1');
        });

    });

    // =========================================
    // PUT /perfil-alumno
    // =========================================
    describe('PUT /api/usuarios/perfil-alumno', () => {

        it('debería actualizar el perfil correctamente', async () => {

            const usuarioActualizado = {
                id: 1,
                nombre_usuario: 'nuevoUsuario'
            };

            UsuarioService.actualizarPerfilAlumno
                .mockResolvedValue(usuarioActualizado);

            const response = await request(app)
                .put('/api/usuarios/perfil-alumno')
                .send({
                    nombre_usuario: 'nuevoUsuario'
                });

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                mensaje: 'Perfil actualizado correctamente',
                usuario: usuarioActualizado
            });
        });

    });

    // =========================================
    // DELETE /:id
    // =========================================
    describe('DELETE /api/usuarios/:id', () => {

        it('debería eliminar un usuario correctamente', async () => {

            UsuarioService.eliminarUsuario.mockResolvedValue();

            const response = await request(app)
                .delete('/api/usuarios/1');

            expect(response.status).toBe(200);

            expect(response.body).toEqual({
                mensaje: 'Usuario con ID 1 eliminado correctamente.'
            });

            expect(UsuarioService.eliminarUsuario)
                .toHaveBeenCalledWith('1');
        });

    });

});