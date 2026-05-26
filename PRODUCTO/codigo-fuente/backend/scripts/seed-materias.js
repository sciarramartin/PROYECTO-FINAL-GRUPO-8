const { baseDeDatos, conectarDB } = require('../database/base-de-datos');
const { Materia } = require('../modelos/materia.modelo');
require('../modelos/materia.modelo');

const materiasSistemas = [
    // Primer Año
    { codigo: '1', nombre: 'Análisis Matemático I', nivel_anio: 1, cuatrimestre: 3 },
    { codigo: '2', nombre: 'Álgebra y Geometría Analítica', nivel_anio: 1, cuatrimestre: 3 },
    { codigo: '3', nombre: 'Física I', nivel_anio: 1, cuatrimestre: 3 },
    { codigo: '4', nombre: 'Inglés I', nivel_anio: 1, cuatrimestre: 3 },
    { codigo: '5', nombre: 'Lógica y Estructuras Discretas', nivel_anio: 1, cuatrimestre: 1 },
    { codigo: '6', nombre: 'Algoritmo y Estructura de Datos', nivel_anio: 1, cuatrimestre: 3 },
    { codigo: '7', nombre: 'Arquitectura de Computadoras', nivel_anio: 1, cuatrimestre: 2 },
    { codigo: '8', nombre: 'Sistemas y Proceso de Negocios', nivel_anio: 1, cuatrimestre: 1 },
    
    // Segundo Año
    { codigo: '11', nombre: 'Ingeniería y Sociedad', nivel_anio: 2, cuatrimestre: 2 },
    { codigo: '9', nombre: 'Análisis Matemático II', nivel_anio: 2, cuatrimestre: 3 },
    { codigo: '10', nombre: 'Física II', nivel_anio: 2, cuatrimestre: 3 },
    { codigo: '12', nombre: 'Inglés II', nivel_anio: 2, cuatrimestre: 3 },
    { codigo: '13', nombre: 'Sintaxis y Semántica de los Lenguajes', nivel_anio: 2, cuatrimestre: 1 },
    { codigo: '14', nombre: 'Paradigmas de Programación', nivel_anio: 2, cuatrimestre: 1 },
    { codigo: '15', nombre: 'Sistemas Operativos', nivel_anio: 2, cuatrimestre: 3 },
    { codigo: '16', nombre: 'Análisis de Sistemas de Información (Int)', nivel_anio: 2, cuatrimestre: 3 },
    { codigo: '17', nombre: 'Probabilidad y Estadística', nivel_anio: 2, cuatrimestre: 1 },

    // Tercer Año
    { codigo: '18', nombre: 'Economía', nivel_anio: 3, cuatrimestre: 2 },
    { codigo: '19', nombre: 'Base de Datos', nivel_anio: 3, cuatrimestre: 1 },
    { codigo: '20', nombre: 'Desarrollo de Software', nivel_anio: 3, cuatrimestre: 1 },
    { codigo: '21', nombre: 'Comunicación de Datos', nivel_anio: 3, cuatrimestre: 3 },
    { codigo: '22', nombre: 'Análisis Numérico', nivel_anio: 3, cuatrimestre: 2 },
    { codigo: '23', nombre: 'Diseño de Sistemas de Información (Int)', nivel_anio: 3, cuatrimestre: 3 },
    { codigo: '99', nombre: 'Seminario Integrados (Analista)', nivel_anio: 3, cuatrimestre: 2 },

    // Cuarto Año
    { codigo: '24', nombre: 'Legislación', nivel_anio: 4, cuatrimestre: 2 },
    { codigo: '25', nombre: 'Ingeniería y Calidad de Software', nivel_anio: 4, cuatrimestre: 2 },
    { codigo: '26', nombre: 'Redes de Datos', nivel_anio: 4, cuatrimestre: 3 },
    { codigo: '27', nombre: 'Investigación Operativa', nivel_anio: 4, cuatrimestre: 3 },
    { codigo: '28', nombre: 'Simulación', nivel_anio: 4, cuatrimestre: 1 },
    { codigo: '29', nombre: 'Tecnologías Para la Automatización', nivel_anio: 4, cuatrimestre: 2 },
    { codigo: '30', nombre: 'Administración de Sistemas de Información(Int)', nivel_anio: 4, cuatrimestre: 3 },

    // Quinto Año
    { codigo: '31', nombre: 'Inteligencia Artificial', nivel_anio: 5, cuatrimestre: 2 },
    { codigo: '32', nombre: 'Ciencia de Datos', nivel_anio: 5, cuatrimestre: 2 },
    { codigo: '33', nombre: 'Sistemas de Gestión', nivel_anio: 5, cuatrimestre: 1 },
    { codigo: '34', nombre: 'Gestión Gerencial', nivel_anio: 5, cuatrimestre: 1 },
    { codigo: '35', nombre: 'Seguridad en los Sistemas de Información', nivel_anio: 5, cuatrimestre: 1 },
    { codigo: '36', nombre: 'Proyecto Final (Int)', nivel_anio: 5, cuatrimestre: 3 }
];

const seed = async () => {
    try {
        await conectarDB();
        await baseDeDatos.sync({ force: true });
        console.log('Tablas sincronizadas. Limpiando datos...');

        console.log('Insertando materias base...');
        const creadas = {};
        for (const m of materiasSistemas) {
            creadas[m.codigo] = await Materia.create(m);
        }

        console.log('Insertando correlativas con tipos de requisito...');
        
        // Función helper para no repetir el through
        const addCorr = async (codMateria, reg, apr) => {
            if (!creadas[codMateria]) return;
            
            // Regulares
            for (const codReq of reg) {
                if(creadas[codReq]) {
                    await creadas[codMateria].addCorrelativa(creadas[codReq], { through: { tipo_requisito: 'regular' } });
                }
            }
            
            // Aprobadas
            for (const codReq of apr) {
                if(creadas[codReq]) {
                    await creadas[codMateria].addCorrelativa(creadas[codReq], { through: { tipo_requisito: 'aprobada' } });
                }
            }
        };

        // Nivel 2 (Materia, [Regulares], [Aprobadas])
        await addCorr('9', ['1', '2'], []);
        await addCorr('10', ['1', '3'], []);
        await addCorr('12', ['4'], []);
        await addCorr('13', ['5', '6'], []);
        await addCorr('14', ['5', '6'], []);
        await addCorr('15', ['7'], []);
        await addCorr('16', ['6', '8'], []);
        await addCorr('17', ['1', '2'], []);

        // Nivel 3
        await addCorr('18', [], ['1', '2']);
        await addCorr('19', ['13', '16'], ['5', '6']);
        await addCorr('20', ['14', '16'], ['5', '6']);
        await addCorr('21', [], ['3', '7']);
        await addCorr('22', ['9'], ['1', '2']);
        await addCorr('23', ['14', '16'], ['4', '6', '8']);
        await addCorr('99', ['16'], ['6', '8', '13', '14']);

        // Nivel 4
        await addCorr('24', ['11'], []);
        await addCorr('25', ['19', '20', '23'], ['13', '14']);
        await addCorr('26', ['15', '21'], []);
        await addCorr('27', ['17', '22'], []);
        await addCorr('28', ['17'], ['9']);
        await addCorr('29', ['10', '22'], ['9']);
        await addCorr('30', ['18', '23'], ['16']);

        // Nivel 5
        await addCorr('31', ['28'], ['17', '22']);
        await addCorr('32', ['28'], ['17', '19']);
        await addCorr('33', ['18', '27'], ['23']);
        await addCorr('34', ['24', '30'], ['18']);
        await addCorr('35', ['26', '30'], ['20', '21']);
        await addCorr('36', ['25', '26', '30'], ['12', '20', '23']);

        console.log('✅ Base de datos poblada exitosamente con Correlativas Fuertes y Débiles.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al poblar BD:', error);
        process.exit(1);
    }
};

seed();
