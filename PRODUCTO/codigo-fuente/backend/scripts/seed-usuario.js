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

        // 3. Crear Carrera de Sistemas (id: 1) si no existe
        await Carrera.findOrCreate({
            where: { id: 1 },
            defaults: { nombre: 'Ingeniería en Sistemas de Información', facultad: 'FRSN' }
        });
        console.log('✅ Carreras verificadas.');

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