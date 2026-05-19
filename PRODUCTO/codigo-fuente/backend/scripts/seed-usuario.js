// scripts/seed-usuario.js
// Desestructuramos el modelo desde el archivo, tal como lo hace tu app
const { TipoUsuario } = require('../modelos/TipoUsuario');
const { Carrera } = require('../modelos/Carrera');

const cargarDatosSemilla = async () => {
    try {
        console.log('--- Verificando datos iniciales del sistema ---');

        // 1. Crear TipoUsuario Estudiante (id: 1) si no existe
        await TipoUsuario.findOrCreate({
            where: { id: 1 },
            defaults: { nombre: 'Estudiante' }
        });

        // 2. Crear TipoUsuario Administrador (id: 2) si no existe
        await TipoUsuario.findOrCreate({
            where: { id: 2 },
            defaults: { nombre: 'Administrador' }
        });
        console.log('✅ Tipos de Usuario verificados.');

        // 3. Crear todas las carreras disponibles si no existen
        const carreras = [
            { id: 1, nombre: 'Ingeniería en Sistemas', facultad: 'FRSN' },
            { id: 2, nombre: 'Ingeniería Electrónica', facultad: 'FRSN' },
            { id: 3, nombre: 'Ingeniería Industrial', facultad: 'FRSN' },
            { id: 4, nombre: 'Ingeniería Mecánica', facultad: 'FRSN' },
            { id: 5, nombre: 'Ingeniería Civil', facultad: 'FRSN' },
            { id: 6, nombre: 'Ingeniería Química', facultad: 'FRSN' },
            { id: 7, nombre: 'Ingeniería Eléctrica', facultad: 'FRSN' },
            { id: 8, nombre: 'Ingeniería Metalúrgica', facultad: 'FRSN' }
        ];

        for (const carrera of carreras) {
            await Carrera.findOrCreate({
                where: { id: carrera.id },
                defaults: { nombre: carrera.nombre, facultad: carrera.facultad }
            });
        }
        console.log('✅ Carreras verificadas e insertadas.');

        console.log('--- Proceso de datos semilla finalizado ---');
    } catch (error) {
        console.error('❌ Error al cargar los datos semilla:', error);
    }
};

module.exports = { cargarDatosSemilla };

// Si el script se ejecuta directamente desde la terminal (ej: node scripts/seed-usuario.js)
if (require.main === module) {
    cargarDatosSemilla();
}