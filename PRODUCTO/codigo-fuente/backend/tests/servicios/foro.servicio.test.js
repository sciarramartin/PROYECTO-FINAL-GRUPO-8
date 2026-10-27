const ForoService = require('../../servicios/foro.servicio');
const { ForoPublicacion, ForoComentario, ForoReporte, Usuario, Materia } = require('../../modelos/asociaciones');

describe('Pruebas Unitarias: ForoService y Moderación de Reportes (SCRUM-126 & SCRUM-127)', () => {

    test('1. Validar campos requeridos al crear una publicación académica', async () => {
        await expect(
            ForoService.crearPublicacion({ id_materia: 1, titulo: '', contenido: 'Texto', id_usuario: 1 })
        ).rejects.toThrow('El sistema requiere un título obligatorio para continuar.');

        await expect(
            ForoService.crearPublicacion({ id_materia: 1, titulo: 'Título', contenido: '', id_usuario: 1 })
        ).rejects.toThrow('El cuerpo del contenido no puede estar vacío.');

        await expect(
            ForoService.crearPublicacion({ id_materia: null, titulo: 'Título', contenido: 'Texto', id_usuario: 1 })
        ).rejects.toThrow('Error: La materia debe asociarse automáticamente.');
    });

    test('2. Validar tipos de reacción en publicaciones y comentarios', async () => {
        await expect(
            ForoService.reaccionarPublicacion(1, 1, 'invalido')
        ).rejects.toThrow('Tipo de reacción inválido.');

        await expect(
            ForoService.reaccionarComentario(1, 1, 'invalido')
        ).rejects.toThrow('Tipo de reacción inválido.');
    });

    test('3. Validar contenido al crear y editar comentarios', async () => {
        await expect(
            ForoService.crearComentario({ contenido: '   ', id_publicacion: 1, id_usuario: 1 })
        ).rejects.toThrow('El comentario no puede estar vacío');

        await expect(
            ForoService.editarComentario(999999, { contenido: '   ', id_usuario: 1 })
        ).rejects.toThrow('El comentario no puede estar vacío');
    });

    test('4. Validar reporte no encontrado', async () => {
        await expect(
            ForoService.resolverReporte(9999999, { accion: 'desestimar' })
        ).rejects.toThrow('Reporte no encontrado.');

        await expect(
            ForoService.eliminarReporte(9999999)
        ).rejects.toThrow('Reporte no encontrado.');
    });

    test('5. Moderación de reportes: desestimar y reabrir reporte', async () => {
        // Mocking / creación segura de un reporte de prueba si existen registros en base
        const materia = await Materia.findOne();
        const usuario = await Usuario.findOne();

        if (materia && usuario) {
            const pub = await ForoPublicacion.create({
                id_materia: materia.id,
                id_usuario: usuario.id,
                titulo: 'Publicación de prueba para reporte',
                contenido: 'Contenido a reportar en test',
                categoria: 'Duda'
            });

            const rep = await ForoReporte.create({
                id_usuario_reportador: usuario.id,
                id_publicacion: pub.id,
                descripcion: 'Spam o contenido inapropiado de prueba',
                resuelto: false
            });

            // Desestimar
            const resDesestimar = await ForoService.resolverReporte(rep.id, { accion: 'desestimar' });
            expect(resDesestimar.reporte.resuelto).toBe(true);

            // Reabrir
            const resReabrir = await ForoService.resolverReporte(rep.id, { accion: 'reabrir' });
            expect(resReabrir.reporte.resuelto).toBe(false);

            // Eliminar contenido reportado
            const resEliminar = await ForoService.resolverReporte(rep.id, { accion: 'eliminar_contenido' });
            expect(resEliminar.reporte.resuelto).toBe(true);

            // Eliminar reporte de auditoría
            const resDel = await ForoService.eliminarReporte(rep.id);
            expect(resDel).toHaveProperty('mensaje');

            // Limpiar la publicación de prueba
            await pub.destroy({ force: true }).catch(() => {});
        }
    });
});
