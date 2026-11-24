// backend/scripts/poblar_evolucion_historica.js
const { baseDeDatos } = require('../database/base-de-datos');
const { MaterialDeEstudio } = require('../modelos/MaterialDeEstudio');
const { ForoPublicacion } = require('../modelos/ForoPublicacion');
const { ForoComentario } = require('../modelos/ForoComentario');
const { ConsultaIA } = require('../modelos/ConsultaIA');

const PROMPTS_IA_REALES = [
    { prompt: '¿Cuáles son las materias correlativas para cursar Sistemas Operativos?', respuesta: 'Para cursar Sistemas Operativos en el Plan 2023 necesitás tener regularizadas Arquitectura de Computadoras y Algoritmos y Estructuras de Datos.', fuentes: 2 },
    { prompt: '¿Cómo es el procedimiento para solicitar cambio de comisión por motivos laborales?', respuesta: 'Debes presentar el formulario oficial F0035-P ante la Secretaría de Asuntos Universitarios con certificado laboral oficial y recibo de sueldo antes del inicio del cuatrimestre.', fuentes: 1 },
    { prompt: '¿Cuántos turnos y llamados a examen final hay en el turno de Julio/Agosto?', respuesta: 'El turno general de invierno consta de 2 llamados oficiales según el calendario académico de la UTN FRC.', fuentes: 2 },
    { prompt: '¿Qué condiciones se requieren para la aprobación directa de Análisis Matemático II?', respuesta: 'Se requiere promedio mínimo de 8 (ocho) en ambos parciales prácticos y teóricos, sin aplazos en ninguna instancia de evaluación.', fuentes: 3 },
    { prompt: '¿Cómo tramitar la Práctica Profesional Supervisada (PPS)?', respuesta: 'La PPS se rige bajo la ordenanza ALU01-02. Requiere al menos el 70% de la carrera aprobada y 200 horas reloj acreditadas en empresa o proyecto avalado.', fuentes: 2 },
    { prompt: '¿Cuáles son las materias de 1er año en el Plan 2023 de Ingeniería en Sistemas?', respuesta: 'Las 8 materias son: Análisis Matemático I, Álgebra y Geometría Analítica, Física I, Inglés I, Lógica y Estructuras Discretas, Algoritmos y Estructuras de Datos, Arquitectura de Computadoras, y Sistemas y Procesos de Negocios.', fuentes: 3 },
    { prompt: '¿Con cuánto tiempo de anticipación debo inscribirme a una mesa de examen final?', respuesta: 'La inscripción en Autogestión debe realizarse con un mínimo de 48 horas hábiles de anticipación a la fecha fijada para la mesa.', fuentes: 1 },
    { prompt: '¿Qué materias me habilitan el título intermedio de Analista Desarrollador Universitario?', respuesta: 'Requiere tener aprobadas todas las materias de 1° a 3° año de la carrera y el Seminario Integrador según la ordenanza N° 1910.', fuentes: 4 },
    { prompt: '¿Se puede rendir libre un examen final en la UTN?', respuesta: 'Sí, la normativa de alumnos permite examen en condición libre para alumnos que hayan perdido la regularidad o deseen rendir directamente según programa vigente.', fuentes: 2 },
    { prompt: '¿Dónde descargo el formulario de solicitud de equivalencias inter-facultades?', respuesta: 'El formulario está disponible en la sección de Reglamentos y Procedimientos del Asistente IA y en la oficina de Alumnos.', fuentes: 1 }
];

async function main() {
    console.log('🔄 Sincronizando y poblando evolución histórica para métricas globales...');
    await ConsultaIA.sync();

    // 1. Distribuir materiales a lo largo de los meses (Abril a Octubre 2026)
    const materiales = await MaterialDeEstudio.findAll({ order: [['id', 'ASC']] });
    const fechasMateriales = [
        '2026-04-12T10:00:00Z', '2026-04-28T15:30:00Z',
        '2026-05-08T09:15:00Z', '2026-05-19T14:20:00Z', '2026-05-27T18:00:00Z',
        '2026-06-03T11:45:00Z', '2026-06-15T16:10:00Z', '2026-06-22T13:20:00Z', '2026-06-29T17:50:00Z',
        '2026-07-07T12:00:00Z', '2026-07-21T10:30:00Z', '2026-07-30T16:40:00Z',
        '2026-08-05T08:30:00Z', '2026-08-14T15:00:00Z', '2026-08-23T11:15:00Z', '2026-08-29T19:20:00Z',
        '2026-09-02T10:00:00Z', '2026-09-10T14:40:00Z', '2026-09-18T16:15:00Z', '2026-09-24T18:30:00Z', '2026-09-29T12:10:00Z',
        '2026-10-06T09:40:00Z', '2026-10-15T14:20:00Z', '2026-10-22T17:15:00Z'
    ];

    for (let i = 0; i < materiales.length; i++) {
        const mat = materiales[i];
        const fecha = fechasMateriales[i % fechasMateriales.length];
        await mat.update({ fecha_de_publicacion: new Date(fecha) });
    }
    console.log(`✅ ${materiales.length} materiales distribuidos entre Abr 2026 y Oct 2026.`);

    // 2. Distribuir publicaciones de foro
    const publicaciones = await ForoPublicacion.findAll({ order: [['id', 'ASC']] });
    const mesesPublicaciones = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    for (let i = 0; i < publicaciones.length; i++) {
        const pub = publicaciones[i];
        const mesTarget = mesesPublicaciones[i % mesesPublicaciones.length];
        const dia = String((i % 25) + 1).padStart(2, '0');
        const fechaStr = `${mesTarget}-${dia} 14:00:00`;
        await baseDeDatos.query(`UPDATE foro_publicaciones SET createdAt = '${fechaStr}' WHERE id = ${pub.id}`);
    }
    console.log(`✅ ${publicaciones.length} publicaciones de foro distribuidas temporalmente.`);

    // 3. Distribuir comentarios de foro
    const comentarios = await ForoComentario.findAll({ order: [['id', 'ASC']] });
    for (let i = 0; i < comentarios.length; i++) {
        const com = comentarios[i];
        const mesTarget = mesesPublicaciones[i % mesesPublicaciones.length];
        const dia = String((i % 27) + 1).padStart(2, '0');
        const fechaStr = `${mesTarget}-${dia} 16:30:00`;
        await baseDeDatos.query(`UPDATE foro_comentarios SET createdAt = '${fechaStr}' WHERE id = ${com.id}`);
    }
    console.log(`✅ ${comentarios.length} comentarios de foro distribuidos temporalmente.`);

    // 4. Poblar consultas de Asistente IA si hay menos de 50
    const countIA = await ConsultaIA.count();
    if (countIA < 50) {
        console.log('🤖 Generando historial de consultas resueltas por Asistente IA...');
        const mesesConsultas = [
            { mes: '2026-04', cant: 28 },
            { mes: '2026-05', cant: 44 },
            { mes: '2026-06', cant: 62 },
            { mes: '2026-07', cant: 35 },
            { mes: '2026-08', cant: 58 },
            { mes: '2026-09', cant: 76 },
            { mes: '2026-10', cant: 45 }
        ];

        let totalCreadas = 0;
        for (const plan of mesesConsultas) {
            for (let j = 0; j < plan.cant; j++) {
                const promptData = PROMPTS_IA_REALES[j % PROMPTS_IA_REALES.length];
                const dia = String((j % 28) + 1).padStart(2, '0');
                const hora = String(8 + (j % 14)).padStart(2, '0');
                const fecha = new Date(`${plan.mes}-${dia}T${hora}:15:00Z`);

                await ConsultaIA.create({
                    id_usuario: (j % 5) + 1,
                    prompt: promptData.prompt,
                    respuesta: promptData.respuesta,
                    total_fuentes: promptData.fuentes,
                    satisfactoria: true,
                    createdAt: fecha,
                    updatedAt: fecha
                });
                totalCreadas++;
            }
        }
        console.log(`✅ ${totalCreadas} consultas resueltas por Asistente IA registradas en el histórico.`);
    }

    console.log('🎉 Evolución histórica sincronizada con éxito.');
    process.exit(0);
}

main().catch(err => {
    console.error('Error al poblar evolución histórica:', err);
    process.exit(1);
});
