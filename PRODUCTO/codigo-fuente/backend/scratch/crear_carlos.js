const { Usuario } = require('../modelos/Usuario');
const bcrypt = require('bcrypt');

async function seed() {
    console.log("🚀 Starting generation of 5 Carlos users...");
    const passwordHash = await bcrypt.hash('A123456!', 10);
    const nombres = ["Uno", "Dos", "Tres", "Cuatro", "Cinco"];

    for (let i = 1; i <= 5; i++) {
        const mail = `carlos${i}@gmail.com`;
        const nombre_usuario = `carlos${i}`;
        const nombre = "Carlos";
        const apellido = nombres[i - 1];

        try {
            // Check if user already exists
            const existing = await Usuario.findOne({ where: { mail } });
            if (existing) {
                console.log(`⚠️ User ${mail} already exists, skipping.`);
                continue;
            }

            const nuevo = await Usuario.create({
                nombre,
                apellido,
                nombre_usuario,
                mail,
                contraseña: passwordHash,
                id_carrera: 1,
                anio_ingreso: 2024,
                id_tipo_usuario: 1
            });

            console.log(`✅ Created user: ${nuevo.nombre} ${nuevo.apellido} (@${nuevo.nombre_usuario}) - ID: ${nuevo.id}`);
        } catch (error) {
            console.error(`❌ Error creating user ${mail}:`, error);
        }
    }
    console.log("🎉 Seeding completed!");
    process.exit(0);
}

seed();
