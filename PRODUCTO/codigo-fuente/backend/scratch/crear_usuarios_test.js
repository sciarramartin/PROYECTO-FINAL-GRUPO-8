const { baseDeDatos } = require('../database/base-de-datos');
const { Usuario } = require('../modelos/Usuario');
const { Perfil } = require('../modelos/Perfil');
const bcrypt = require('bcrypt');

async function main() {
    try {
        await baseDeDatos.sync();
        const hash = await bcrypt.hash('123456', 10);
        
        // Crear Mateo
        const [mateo, createdMateo] = await Usuario.findOrCreate({
            where: { mail: 'mateo@gmail.com' },
            defaults: {
                id: 9,
                contraseña: hash,
                nombre: 'Mateo',
                apellido: 'Gomez',
                nombre_usuario: 'mateog',
                anio_ingreso: 2024,
                id_carrera: 1,
                id_tipo_usuario: 1
            }
        });
        
        // Crear perfil Mateo
        await Perfil.findOrCreate({
            where: { id_usuario: 9 },
            defaults: {
                apodo: 'Mate',
                anio_cursado: 2,
                biografia: 'Estudiante de sistemas.',
                foto_perfil: '',
                rol_equipo: 'Lider',
                mostrar_anio_cursado: true,
                mostrar_contacto: true
            }
        });

        // Crear Maria
        const [maria, createdMaria] = await Usuario.findOrCreate({
            where: { mail: 'maria.gomez@mail.com' },
            defaults: {
                id: 7,
                contraseña: hash,
                nombre: 'Maria',
                apellido: 'Gomez',
                nombre_usuario: 'mariag',
                anio_ingreso: 2024,
                id_carrera: 1,
                id_tipo_usuario: 1
            }
        });

        // Crear perfil Maria
        await Perfil.findOrCreate({
            where: { id_usuario: 7 },
            defaults: {
                apodo: 'Mari',
                anio_cursado: 2,
                biografia: 'Estudiante de sistemas.',
                foto_perfil: '',
                rol_equipo: 'Desarrollador',
                mostrar_anio_cursado: true,
                mostrar_contacto: true
            }
        });

        console.log("Mateo (9) y Maria (7) creados correctamente.");
    } catch (e) {
        console.error(e);
    } finally {
        await baseDeDatos.close();
    }
}

main();
