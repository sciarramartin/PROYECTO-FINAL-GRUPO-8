// scripts/reconstruir_seed_limpio.js
const fs = require('fs');
const path = require('path');
const { baseDeDatos } = require('../database/base-de-datos');

async function main() {
    await baseDeDatos.authenticate();
    console.log('Base de datos conectada.');

    const franId = 5, titoId = 6, francoId = 7, tinchoId = 8, luId = 9;
    const teamIds = [franId, titoId, francoId, tinchoId, luId];

    // 1. Definición de los 24 materiales de estudio reales (IDs 1..24)
    const materialesDef = [
        {
            id: 1,
            file: 'Resumen COM.pdf',
            id_materia: 21, // Comunicación de Datos
            titulo: 'Resumen Completo - Comunicación de Datos (Medios, Modulación y Protocolos)',
            etiquetas: '["comunicacion de datos","cda","resumen","parcial"]',
            id_usuario: franId,
            likes: 18,
            descargas: 42
        },
        {
            id: 2,
            file: 'RESUMEN FINAL -ISW- ALEX.pdf',
            id_materia: 25, // Ingeniería y Calidad de Software
            titulo: 'Resumen Final Completo - Ingeniería y Calidad de Software (ISW)',
            etiquetas: '["isw","calidad de software","final","resumen","testing"]',
            id_usuario: luId,
            likes: 27,
            descargas: 64
        },
        {
            id: 3,
            file: 'Resumen 1 Parcial Analisis Matematico Teorico.pdf',
            id_materia: 1, // Análisis Matemático I
            titulo: 'Resumen Teórico 1er Parcial - Análisis Matemático I (Límites, Continuidad y Derivadas)',
            etiquetas: '["analisis 1","matematica","primer parcial","teorico"]',
            id_usuario: francoId,
            likes: 22,
            descargas: 58
        },
        {
            id: 4,
            file: 'Resumen analisis matematico 1.pdf',
            id_materia: 1, // Análisis Matemático I
            titulo: 'Apunte Integral Análisis Matemático I - Práctico con Ejercicios Tipo Parcial',
            etiquetas: '["analisis 1","integrales","derivadas","ejercicios"]',
            id_usuario: tinchoId,
            likes: 31,
            descargas: 79
        },
        {
            id: 5,
            file: 'ACO_-_Resumen-1-1.pdf',
            id_materia: 7, // Arquitectura de Computadoras
            titulo: 'Resumen Arquitectura de Computadoras - Módulo 1 (Microarquitectura y Registros)',
            etiquetas: '["arquitectura","aco","cpu","registros"]',
            id_usuario: titoId,
            likes: 16,
            descargas: 41
        },
        {
            id: 6,
            file: 'resumen aco.pdf',
            id_materia: 7, // Arquitectura de Computadoras
            titulo: 'Guía Rápida de Arquitectura de Computadoras (Assembler Intel 8086)',
            etiquetas: '["arquitectura","aco","assembler","resumen"]',
            id_usuario: franId,
            likes: 14,
            descargas: 35
        },
        {
            id: 7,
            file: 'Apunte teo-pract ALUMNO IA.pdf',
            id_materia: 31, // Inteligencia Artificial
            titulo: 'Apunte Teórico-Práctico Completo - Inteligencia Artificial (Búsquedas, Heurísticas y Redes)',
            etiquetas: '["inteligencia artificial","ia","machine learning","heuristica"]',
            id_usuario: francoId,
            likes: 34,
            descargas: 85
        },
        {
            id: 8,
            file: 'ASI_resumen_completo.pdf',
            id_materia: 16, // Análisis de Sistemas de Información
            titulo: 'Resumen Integral ASI - Análisis de Sistemas (Diagramas UML y Casos de Uso)',
            etiquetas: '["asi","analisis","casos de uso","uml","diagramas"]',
            id_usuario: luId,
            likes: 25,
            descargas: 59
        },
        {
            id: 9,
            file: 'RESUMEN ASI TEORICO 1.pdf',
            id_materia: 16, // Análisis de Sistemas de Información
            titulo: 'Teórico ASI Parte 1 - Metodologías de Desarrollo y Ciclos de Vida',
            etiquetas: '["asi","teorico","parcial 1","metodologias"]',
            id_usuario: tinchoId,
            likes: 19,
            descargas: 47
        },
        {
            id: 10,
            file: 'RESUMEN ASI TEORICO 2.pdf',
            id_materia: 16, // Análisis de Sistemas de Información
            titulo: 'Teórico ASI Parte 2 - Requerimientos Funcionales y No Funcionales',
            etiquetas: '["asi","teorico","parcial 2","requerimientos"]',
            id_usuario: titoId,
            likes: 18,
            descargas: 43
        },
        {
            id: 11,
            file: 'Economia.pdf',
            id_materia: 18, // Economía
            titulo: 'Resumen General de Economía - Microeconomía y Macroeconomía',
            etiquetas: '["economia","microeconomia","macroeconomia","resumen"]',
            id_usuario: franId,
            likes: 20,
            descargas: 49
        },
        {
            id: 12,
            file: 'Fisica II Teorico.pdf',
            id_materia: 10, // Física II
            titulo: 'Compendio Teórico Física II (Electromagnetismo, Óptica y Ondas)',
            etiquetas: '["fisica 2","electromagnetismo","optica","formulas"]',
            id_usuario: francoId,
            likes: 24,
            descargas: 62
        },
        {
            id: 13,
            file: 'Resumen - SIM.pdf',
            id_materia: 28, // Simulación
            titulo: 'Resumen Clave Simulación - Modelos Matemáticos y Variables Aleatorias',
            etiquetas: '["simulacion","montecarlo","variables aleatorias","modelos"]',
            id_usuario: tinchoId,
            likes: 15,
            descargas: 38
        },
        {
            id: 14,
            file: 'Resumen - SSL.pdf',
            id_materia: 13, // Sintaxis y Semántica de los Lenguajes
            titulo: 'Resumen Sintaxis y Semántica (Gramáticas, Autómatas Finitos y Parsing LR/LL)',
            etiquetas: '["ssl","gramaticas","automatas","compiladores"]',
            id_usuario: luId,
            likes: 29,
            descargas: 72
        },
        {
            id: 15,
            file: 'Resumen 1 KND Redes.pdf',
            id_materia: 26, // Redes de Datos
            titulo: 'Redes de Datos - Resumen KND Parte 1 (Modelo OSI y Arquitectura TCP/IP)',
            etiquetas: '["redes","knd","modelo osi","tcp ip"]',
            id_usuario: titoId,
            likes: 23,
            descargas: 54
        },
        {
            id: 16,
            file: 'Resumen 2 KND Redes.pdf',
            id_materia: 26, // Redes de Datos
            titulo: 'Redes de Datos - Resumen KND Parte 2 (Subnetting IPv4/IPv6 y Enrutamiento RIP/OSPF)',
            etiquetas: '["redes","knd","subnetting","enrutamiento"]',
            id_usuario: franId,
            likes: 28,
            descargas: 68
        },
        {
            id: 17,
            file: 'Resumen 3 KND Redes.pdf',
            id_materia: 26, // Redes de Datos
            titulo: 'Redes de Datos - Resumen KND Parte 3 (Capas de Transporte y Aplicación: TCP, UDP, DNS, HTTP)',
            etiquetas: '["redes","knd","transporte","dns","http"]',
            id_usuario: francoId,
            likes: 21,
            descargas: 46
        },
        {
            id: 18,
            file: 'RESUMEN BASE DE DATOS1.pdf',
            id_materia: 19, // Base de Datos
            titulo: 'Resumen SQL, Álgebra Relacional y Normalización 1FN a BCNF',
            etiquetas: '["base de datos","sql","algebra relacional","normalizacion"]',
            id_usuario: tinchoId,
            likes: 35,
            descargas: 88
        },
        {
            id: 19,
            file: 'RESUMEN DISEÑO DE SISTEMAS.pdf',
            id_materia: 23, // Diseño de Sistemas de Información
            titulo: 'Diseño de Sistemas - Patrones de Diseño GoF y Arquitecturas Limpias',
            etiquetas: '["diseno de sistemas","patrones gof","arquitectura","solid"]',
            id_usuario: luId,
            likes: 38,
            descargas: 95
        },
        {
            id: 20,
            file: 'Resumen PyE final.pdf',
            id_materia: 17, // Probabilidad y Estadística
            titulo: 'Resumen Final Completo - Probabilidad y Estadística (Variables Discretas, Continuas e Inferencia)',
            etiquetas: '["probabilidad","estadistica","distribuciones","inferencia"]',
            id_usuario: titoId,
            likes: 26,
            descargas: 60
        },
        {
            id: 21,
            file: 'Resumen-Final-Inv.-Op-V3.pdf',
            id_materia: 27, // Investigación Operativa
            titulo: 'Investigación Operativa - Resumen Final V3 (Método Simplex, Transporte y PERT/CPM)',
            etiquetas: '["investigacion operativa","simplex","transporte","pert cpm"]',
            id_usuario: francoId,
            likes: 23,
            descargas: 51
        },
        {
            id: 22,
            file: 'SOP - Resumen 1er parcial.pdf',
            id_materia: 15, // Sistemas Operativos
            titulo: 'Sistemas Operativos - Resumen 1er Parcial (Procesos, Hilos y Concurrencia)',
            etiquetas: '["sistemas operativos","sop","procesos","concurrencia"]',
            id_usuario: franId,
            likes: 32,
            descargas: 76
        },
        {
            id: 23,
            file: 'SOP - Resumen 2do parcial.pdf',
            id_materia: 15, // Sistemas Operativos
            titulo: 'Sistemas Operativos - Resumen 2do Parcial (Memoria Virtual, Paginación y Segmentación)',
            etiquetas: '["sistemas operativos","sop","memoria virtual","paginacion"]',
            id_usuario: tinchoId,
            likes: 29,
            descargas: 70
        },
        {
            id: 24,
            file: 'SOP - Resúmen 3er Parcial.pdf',
            id_materia: 15, // Sistemas Operativos
            titulo: 'Sistemas Operativos - Resumen 3er Parcial (Sistemas de Archivos y Planificación de Disco)',
            etiquetas: '["sistemas operativos","sop","file systems","i/o"]',
            id_usuario: luId,
            likes: 30,
            descargas: 74
        }
    ];

    // Calificaciones para los 24 materiales (por los demás miembros del equipo)
    const calificacionesSQL = [];
    let califId = 1;
    for (const m of materialesDef) {
        // Los otros 4 miembros califican el material con 4 o 5 estrellas
        const votantes = teamIds.filter(id => id !== m.id_usuario);
        for (const vId of votantes) {
            calificacionesSQL.push({
                id: califId++,
                id_material: m.id,
                id_usuario: vId,
                puntuacion: (m.id + vId) % 2 === 0 ? 5 : 4
            });
        }
    }

    // 2. Definición de las 29 publicaciones con contenido 100% de opinión y debate (sin mención de archivos ni apuntes)
    const publicacionesForo = [
        {
            id_materia: 1, // Análisis Matemático I
            id_usuario: francoId,
            titulo: 'Opinión sincera: ¿Conviene cursar Análisis I anual o cuatrimestral?',
            categoria: 'Opinión',
            contenido: 'En mi experiencia, si vienen de un secundario flojo en matemática conviene hacerla anual para asentar bien los conceptos de límites y derivadas. En el cuatrimestral van a las chapas y si te atrasás dos clases con integrales estás al horno. Los parciales prácticos son largos pero justos.',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Totalmente de acuerdo Franco. Yo la hice anual con Roberto y fue lo mejor que pude hacer. En el práctico te toman mucho teoremas aplicados (Rolle y Valor Medio entran seguro).',
                    respuestas: [
                        {
                            id_usuario: luId,
                            contenido: 'Tal cual, no se confíen con el primer parcial que parece fácil. El segundo parcial con integrales impropias y series te liquida si no practicaste de la guía oficial.'
                        }
                    ]
                },
                {
                    id_usuario: titoId,
                    contenido: 'Sumo un tip: para el segundo parcial practiquen mucho sustitución trigonométrica y fracciones simples, entran dos ejercicios seguro en el práctico.'
                }
            ]
        },
        {
            id_materia: 2, // Álgebra y Geometría Analítica
            id_usuario: tinchoId,
            titulo: 'El segundo parcial de Álgebra define todo: Espacios Vectoriales y Cónicas',
            categoria: 'Opinión',
            contenido: 'Álgebra arranca tranqui con matrices, determinantes y sistemas de ecuaciones (esa parte es mecánica). Pero cuando entrás a transformaciones lineales, autovalores/autovectores y rototraslación de cónicas se pone muy abstracto. Recomiendo graficar todo en GeoGebra para visualizar los planos.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'GeoGebra es clave para entender rectas y planos en R3. Si no te hacés la imagen mental de la intersección es imposible plantear las ecuaciones.',
                    respuestas: [
                        {
                            id_usuario: tinchoId,
                            contenido: 'Exacto, y no memoricen fórmulas de memoria; entiendan de dónde sale la matriz de pasaje.'
                        }
                    ]
                },
                {
                    id_usuario: luId,
                    contenido: '¿Los profes siguen tomando demostraciones teóricas en los parciales prácticos?'
                },
                {
                    id_usuario: franId,
                    contenido: 'Sí Lu, al menos una preguntita teórica de propiedades del producto mixto o condiciones de diagonalización te meten seguro.'
                }
            ]
        },
        {
            id_materia: 3, // Física I
            id_usuario: titoId,
            titulo: 'No cuelguen los laboratorios de Física I ni los informes de incertezas',
            categoria: 'Opinión',
            contenido: 'Muchos se confían porque aprueban los dos parciales prácticos de cinemática y dinámica, pero si debés un solo informe de laboratorio o te bochan en la propagación de incertezas te mandan a recuperar a fin de año. Hagan los TPs con tiempo.',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Confirmo rotundamente. El cálculo del error relativo y porcentual en el lab de péndulo simple te quita el sueño si lo dejás para la noche anterior a la entrega.',
                    respuestas: []
                },
                {
                    id_usuario: francoId,
                    contenido: 'Aparte los profes del laboratorio son re minuciosos con las cifras significativas. Si la balanza medía con un decimal, no pongan cuatro decimales en el informe jaja.',
                    respuestas: [
                        {
                            id_usuario: titoId,
                            contenido: 'Jajaja tal cual Franco, te tachan el informe entero por ese detalle.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 5, // Lógica y Estructuras Discretas
            id_usuario: luId,
            titulo: 'Lógica y Estructuras Discretas: De las más entretenidas de primer año',
            categoria: 'Opinión',
            contenido: 'Para mí fue de las materias más lindas de primero. Tablas de verdad, inducción matemática, teoría de grafos y árboles. Es la base matemática directa de todo lo que después ves en Algoritmos y Bases de Datos. Vale la pena no estudiarla solo para zafar sino para razonar.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'Inducción matemática al principio marea con el paso inductivo, pero una vez que le agarrás la mano sale como chorizo. Muy linda materia.',
                    respuestas: []
                },
                {
                    id_usuario: francoId,
                    contenido: 'Y grafos es fundamental para cuando llegás a Inteligencia Artificial e Investigación Operativa.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 6, // Algoritmo y Estructura de Datos
            id_usuario: franId,
            titulo: 'La transición de pseudocódigo a lenguaje posta y punteros en AED',
            categoria: 'Opinión',
            contenido: 'AED es la materia filtro de primer año junto con Análisis. Cuando pasás de diagramas de flujo a listas enlazadas, colas, pilas y árboles con memoria dinámica es donde realmente te das cuenta si te gusta programar. Practiquen en la compu todos los días, no se queden solo con el papel.',
            comentarios: [
                {
                    id_usuario: titoId,
                    contenido: '¡Los famosos segmentation fault con punteros en C! Cuántas horas perdidas por no inicializar en NULL.',
                    respuestas: [
                        {
                            id_usuario: franId,
                            contenido: 'Olvidate Tito, Valgrind y GDB son tus mejores amigos a partir de esta materia.'
                        }
                    ]
                },
                {
                    id_usuario: luId,
                    contenido: 'Un consejo para los ingresantes: hagan los ejercicios del práctico por su cuenta antes de ver la solución del profe.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 7, // Arquitectura de Computadoras
            id_usuario: tinchoId,
            titulo: 'Cómo encarar Arquitectura de Computadoras sin frustrarse con Assembler',
            categoria: 'Opinión',
            contenido: 'Arquitectura tiene fama de áspera por el lenguaje ensamblador del 8086 y la memoria segmentada. Mi consejo: entiendan qué hace la CPU ciclo a ciclo (Fetch, Decode, Execute). Una vez que visualizás los registros AX, BX, CX, DX y el stack pointer, el código ensamblador deja de parecer jeroglíficos.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'Para el parcial de ACO concéntrense en el pasaje de parámetros por pila (stack frame) con BP y SP, es donde más puntos restan.',
                    respuestas: [
                        {
                            id_usuario: franId,
                            contenido: 'Exacto Franco, entender cómo se preservan los registros antes de llamar a una subrutina es fundamental.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 8, // Sistemas y Proceso de Negocios
            id_usuario: luId,
            titulo: 'Sistemas y Organizaciones / Procesos: Clave para entender cómo funciona una empresa real',
            categoria: 'Opinión',
            contenido: 'Muchos entran a Sistemas pensando que solo van a picar código, y en esta materia te encontrás con organigramas, cursogramas, BPMN y compras/ventas. Al principio parece densa, pero si entendés la cadena de valor de una empresa, después en ASI y DSI diseñás software que soluciona problemas reales.',
            comentarios: [
                {
                    id_usuario: titoId,
                    contenido: 'Totalmente. El cursograma es super útil para detectar cuellos de botella en los circuitos administrativos.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 9, // Análisis Matemático II
            id_usuario: francoId,
            titulo: 'Análisis Matemático II: El salto a varias variables',
            categoria: 'Opinión',
            contenido: 'Derivadas parciales, plano tangente, multiplicadores de Lagrange y después integrales dobles/triples. Es una materia hermosa pero requiere mucha constancia. No dejen teoremas como Green, Stokes y Gauss para las últimas 48 horas porque el bochazo es inminente.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'Lagrange para optimización con restricciones es pregunta fija de parcial.',
                    respuestas: []
                },
                {
                    id_usuario: luId,
                    contenido: '¿Recomiendan algún libro en particular? Yo usé el Stewart y los gráficos en 3D explican 10 veces mejor que las filminas.',
                    respuestas: [
                        {
                            id_usuario: francoId,
                            contenido: 'El Stewart es la biblia de AM2 Lu, 100% recomendado.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 10, // Física II
            id_usuario: franId,
            titulo: 'Física II: Electromagnetismo es mucho más abstracto que mecánica',
            categoria: 'Opinión',
            contenido: 'En Física 1 ves un bloque cayendo por un plano inclinado y lo imaginás. En Física 2 tenés campos eléctricos, ley de Gauss con superficies gaussianas cerradas, circuitos RLC y ley de Faraday-Lenz. Hay que practicar muchísimo planteo de integrales de línea y superficie.',
            comentarios: [
                {
                    id_usuario: titoId,
                    contenido: 'Los circuitos de corriente alterna con fasores e impedancias al principio te queman la cabeza, pero después se vuelve muy mecánico.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 11, // Ingeniería y Sociedad
            id_usuario: luId,
            titulo: 'Materia reflexiva y necesaria para el rol profesional del ingeniero',
            categoria: 'Opinión',
            contenido: 'No todo es matemática y computación; el impacto social, ético y ambiental de la tecnología que construimos es gigante. Los debates en clase sobre desarrollo sostenible, soberanía tecnológica y patentes me parecieron de lo más enriquecedor de segundo año.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'Coincido Lu, además es una materia accesible para promocionar si participás en clase y hacés un buen ensayo final.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 13, // Sintaxis y Semántica de los Lenguajes
            id_usuario: tinchoId,
            titulo: 'SSL: La materia que te explica qué pasa por dentro cuando le das a "Compilar"',
            categoria: 'Opinión',
            contenido: 'Jerarquía de Chomsky, autómatas con pila, gramáticas libres de contexto y análisis léxico/sintáctico (Flex y Bison / Lex y Yacc). Es demandante pero te da un nivel técnico que te diferencia como profesional. Entender ASTs (Abstract Syntax Trees) te hace mejor programador en cualquier lenguaje.',
            comentarios: [
                {
                    id_usuario: luId,
                    contenido: 'Para armar las tablas LL(1) y LR(1), asegúrense de calcular bien los conjuntos Primeros y Siguientes; si le erran en un Primero se arrastra el error a toda la tabla.',
                    respuestas: [
                        {
                            id_usuario: tinchoId,
                            contenido: '¡Tal cual Lu! Esas tablas son las que más tiempo llevan construir en los parciales.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 14, // Paradigmas de Programación
            id_usuario: titoId,
            titulo: 'Paradigmas: El click mental de salir de la programación estructurada',
            categoria: 'Opinión',
            contenido: 'Aprender Programación Funcional (Haskell), Programación Lógica (Prolog) y Objetos puro (Wollok/Smalltalk). Pasar de pensar en bucles for y variables mutables a funciones puras de orden superior y pattern matching te hace replantearte todo lo que aprendiste.',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Totalmente. Después de ver orden superior en Haskell, cuando volvés a JavaScript o Python y usás map/filter/reduce entendés todo mucho mejor.',
                    respuestas: []
                },
                {
                    id_usuario: francoId,
                    contenido: 'Prolog es el que más cuesta al principio con el backtracking y la unificación, pero para resolver problemas de lógica es magia pura.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 15, // Sistemas Operativos
            id_usuario: franId,
            titulo: 'SOP: El TP anual en C sobre Linux es el mejor entrenamiento para la vida real',
            categoria: 'Opinión',
            contenido: 'El famoso trabajo práctico de Sistemas Operativos. Programar en C con sockets, hilos (pthreads), semáforos, memoria compartida y serialización de mensajes en una arquitectura distribuida te hace madurar como desarrollador 3 años de golpe. Se sufre pero se aprende una barbaridad.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'El consejo de oro: NUNCA dejen el TP para el último mes. Empiecen el protocolo de comunicación la primera semana porque coordinar con el grupo es el 50% de la nota.',
                    respuestas: [
                        {
                            id_usuario: franId,
                            contenido: 'Exacto Tincho. Y hagan tests unitarios de cada módulo (Kernel, Memoria, CPU) por separado antes de integrarlos.'
                        }
                    ]
                },
                {
                    id_usuario: luId,
                    contenido: 'Para la parte teórica de SOP no dejen de repasar algoritmos de reemplazo de páginas (LRU, FIFO, Segunda Oportunidad) y anomalía de Belady.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 16, // Análisis de Sistemas de Información
            id_usuario: luId,
            titulo: 'El TP integrador de ASI: Elige con mucho cuidado a tu grupo',
            categoria: 'Opinión',
            contenido: 'ASI es una materia troncal y anual donde se hace el relevamiento completo de una empresa real, modelando requerimientos con casos de uso, diagramas de actividad y especificaciones detalladas. Si el equipo no está comprometido o la empresa elegida no colabora, la cursada se vuelve una pesadilla.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'Recomiendo buscar una PYME de un familiar o conocido cercano que les dé acceso real a los empleados para hacer entrevistas. Empresas multinacionales casi nunca responden a tiempo.',
                    respuestas: []
                },
                {
                    id_usuario: titoId,
                    contenido: 'Y definan el alcance del sistema de entrada con los profes, no intenten modelar todo el negocio de la empresa porque no terminan más.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 17, // Probabilidad y Estadística
            id_usuario: titoId,
            titulo: 'Probabilidad y Estadística: La clave está en no perderse en las tablas',
            categoria: 'Opinión',
            contenido: 'Binomial, Poisson, Normal, t-Student, Chi-cuadrado. La materia es super aplicable (en analítica, data science, testing y control de calidad), pero en el examen te comen los nervios si no practicaste rápido la tipificación de variables normales y pruebas de hipótesis.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'Hagan una hoja de fórmulas prolija desde el primer día con las condiciones de cada distribución. Saber cuándo aproximar Binomial por Poisson salva notas.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 18, // Economía
            id_usuario: franId,
            titulo: 'Economía en Sistemas: Mucho más útil de lo que parece a primera vista',
            categoria: 'Opinión',
            contenido: 'Aprender punto de equilibrio, costos fijos vs variables, inflación, elasticidad precio de la demanda y estructura de mercados. Cuando después tenés que presupuestar un proyecto de software o evaluar si conviene contratar servidores on-premise vs nube, usás todos estos conceptos.',
            comentarios: [
                {
                    id_usuario: luId,
                    contenido: 'Es de las materias más accesibles del año para promocionar si le dedicás 2 horitas semanales a entender los gráficos de oferta y demanda.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 19, // Base de Datos
            id_usuario: tinchoId,
            titulo: 'Base de Datos: Normalización y optimización de queries SQL',
            categoria: 'Opinión',
            contenido: 'No se queden solo con hacer SELECT * FROM tabla. Lo importante acá es diseñar esquemas limpios hasta Tercera Forma Normal (o Boyce-Codd), entender planes de ejecución con índices (B-Tree), transacciones ACID y niveles de aislamiento para evitar lecturas sucias y bloqueos.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'En las entrevistas técnicas te preguntan siempre la diferencia entre WHERE y HAVING, y cómo funcionan los JOINs internos. Esta materia te da las bases firmes.',
                    respuestas: [
                        {
                            id_usuario: tinchoId,
                            contenido: 'Totalmente Franco, y entender por qué no hay que desnormalizar prematuramente.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 20, // Desarrollo de Software
            id_usuario: francoId,
            titulo: 'DSO: Práctica real de metodologías ágiles en equipo',
            categoria: 'Opinión',
            contenido: 'La cursada te pone a trabajar en sprints de Scrum simulando un equipo de desarrollo con Product Owner y Scrum Master. Se aprende mucho sobre gestión de Git en equipo (ramas, PRs, code reviews) y cómo estimar user stories con Planning Poker.',
            comentarios: [
                {
                    id_usuario: luId,
                    contenido: 'El mayor aprendizaje es que el código que no tiene tests y no pasa por revisión de pares termina rompiendo el build en integración continua jaja.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 21, // Comunicación de Datos
            id_usuario: franId,
            titulo: 'Comunicación de Datos: La física y matemática detrás de las telecomunicaciones',
            categoria: 'Opinión',
            contenido: 'Teorema de Nyquist, capacidad de canal de Shannon, atenuación, ruido térmico, modulación ASK/FSK/PSK y medios de transmisión (fibra óptica monomodo/multimodo, par trenzado). Es bastante técnica pero te permite entender el sustrato físico sobre el que viajan los paquetes de red.',
            comentarios: [
                {
                    id_usuario: titoId,
                    contenido: 'Los cálculos de decibeles y relaciones señal a ruido al principio desconciertan, pero con la guía de ejercicios se saca adelante.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 23, // Diseño de Sistemas de Información
            id_usuario: luId,
            titulo: 'Diseño de Sistemas (DSI): La cúspide de la ingeniería de software en la carrera',
            categoria: 'Opinión',
            contenido: 'La materia donde aplicás todo: Patrones de diseño de arquitectura (MVC, Hexagonal, Clean Architecture), patrones GoF (Factory, Strategy, Observer, Decorator), principios SOLID y diseño orientado al dominio (DDD). El TP de desarrollo es exigente pero es el que más orgullo te da al terminar.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'Si entendés bien SOLID y cómo desacoplar componentes con interfaces, el coloquio final se aprueba con creces. Preguntan mucho la diferencia entre Strategy y State.',
                    respuestas: [
                        {
                            id_usuario: luId,
                            contenido: 'Totalmente Tincho, y presten atención al diagrama de secuencia en el coloquio, les gusta pedir cambios en vivo para ver cómo adaptás el diseño.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 24, // Legislación
            id_usuario: francoId,
            titulo: 'Legislación: Contratos informáticos, propiedad intelectual y responsabilidad civil',
            categoria: 'Opinión',
            contenido: 'Materia fundamental para cuando tenés que firmar un contrato de confidencialidad (NDA), saber quién es dueño del software que programás en tu horario laboral, cómo registrar propiedad intelectual en Argentina y la ley de protección de datos personales (LPDP).',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Muy interesante los fallos judiciales sobre delitos informáticos y ciberestafas que analizamos en las clases prácticas.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 25, // Ingeniería y Calidad de Software
            id_usuario: luId,
            titulo: 'ISW / Calidad: Métricas de software, deuda técnica y testing automatizado',
            categoria: 'Opinión',
            contenido: 'Muchas veces se programa rápido para entregar y no se piensa en la mantenibilidad. En Calidad aprendés a medir complejidad ciclomática de McCabe, cobertura de tests, pruebas de carga con JMeter y frameworks de aseguramiento como ISO 25010 y CMMI.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'En Calidad de Software tienen que saber de memoria los atributos de calidad de la norma ISO 25010 y cómo redactar escenarios de calidad.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 26, // Redes de Datos
            id_usuario: titoId,
            titulo: 'Redes de Datos: Laboratorios con Cisco Packet Tracer y Wireshark',
            categoria: 'Opinión',
            contenido: 'Una de las materias más entretenidas de 4to año. Configurar routers, switches, VLANs, protocolos de enrutamiento dinámico (OSPF) y capturar paquetes reales con Wireshark para ver el handshake de 3 vías de TCP. Te da un panorama completísimo de networking.',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Para el parcial de Redes hagan ejercicios de subnetting contrarreloj con lápiz y papel, porque en el examen no hay tiempo de dudar con las potencias de dos.',
                    respuestas: [
                        {
                            id_usuario: titoId,
                            contenido: 'Subnetting VLSM sale con fritas practicando mucho los cálculos de bits de host y bits de red.'
                        }
                    ]
                }
            ]
        },
        {
            id_materia: 27, // Investigación Operativa
            id_usuario: francoId,
            titulo: 'Investigación Operativa: Optimización matemática para toma de decisiones',
            categoria: 'Opinión',
            contenido: 'Método Simplex tabular, análisis de dualidad y sensibilidad, modelos de transporte y asignación, y gestión de proyectos con camino crítico (PERT/CPM). La parte teórica de sensibilidad es la más tramposa en los parciales; practiquen mucho interpretar los precios sombra.',
            comentarios: [
                {
                    id_usuario: tinchoId,
                    contenido: 'En la práctica usen LINGO o solvers de Python para chequear los resultados de los ejercicios que hagan a mano.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 28, // Simulación
            id_usuario: tinchoId,
            titulo: 'Simulación: Modelado de sistemas complejos de colas y eventos discretos',
            categoria: 'Opinión',
            contenido: 'Cuando los sistemas no se pueden resolver analíticamente por fórmulas matemáticas cerradas, recurrís a la simulación estocástica. Generación de números pseudoaleatorios, pruebas de bondad de ajuste (Chi-cuadrado, Kolmogorov-Smirnov) y simulación de colas múltiples.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'Espectacular materia, y muy conectada con la toma de decisiones en industrias de logística y servicios.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 30, // Administración de Sistemas de Información
            id_usuario: franId,
            titulo: 'Administración de Sistemas (ADM): Gobierno de TI, COBIT e ITIL',
            categoria: 'Opinión',
            contenido: 'Para quienes aspiran a roles de gestión, IT Management, CIO o consultoría estratégica. La materia enseña a alinear la tecnología con los objetivos estratégicos del negocio, gestión de riesgos tecnológicos y auditoría de sistemas.',
            comentarios: [
                {
                    id_usuario: luId,
                    contenido: 'Los casos de estudio de empresas que fracasaron por mala gobernanza de TI te abren los ojos sobre la importancia de los procesos.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 31, // Inteligencia Artificial
            id_usuario: francoId,
            titulo: 'Inteligencia Artificial: Búsquedas heurísticas (A*), Minimax y Machine Learning',
            categoria: 'Opinión',
            contenido: 'De las materias más vanguardistas de la carrera. Ver los algoritmos clásicos de búsqueda en espacios de estados, poda Alfa-Beta para juegos, y luego saltar a redes neuronales artificiales, árboles de decisión y clustering con scikit-learn. La clave para los parciales es entender la justificación teórica de por qué una heurística es admisible y cómo poda el árbol de búsqueda.',
            comentarios: [
                {
                    id_usuario: titoId,
                    contenido: 'La implementación del algoritmo A* con heurística admisible es de los ejercicios prácticos más lindos para programar.',
                    respuestas: []
                },
                {
                    id_usuario: luId,
                    contenido: '¡Sí! Y los profes evalúan muy bien el criterio para justificar la elección de una heurística sobre otra.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 32, // Ciencia de Datos
            id_usuario: tinchoId,
            titulo: 'Ciencia de Datos: El ciclo completo de EDA, pipelines y feature engineering',
            categoria: 'Opinión',
            contenido: 'Análisis exploratorio de datos (EDA), limpieza de datasets con Pandas, imputación de valores faltantes, detección de outliers y modelado predictivo. Muy práctica, se trabaja con Jupyter Notebooks y datasets reales de Kaggle y organismos públicos.',
            comentarios: [
                {
                    id_usuario: francoId,
                    contenido: 'Fundamental dominar visualización con Seaborn y Matplotlib para saber comunicar los insights a los stakeholders.',
                    respuestas: []
                }
            ]
        },
        {
            id_materia: 35, // Seguridad en los Sistemas de Información
            id_usuario: tinchoId,
            titulo: 'Seguridad en Sistemas: Criptografía, OWASP Top 10 y hardening',
            categoria: 'Opinión',
            contenido: 'Criptografía simétrica (AES) y asimétrica (RSA, Curvas Elípticas), firmas digitales, certificados SSL/TLS y vulnerabilidades web típicas (SQL Injection, XSS, CSRF, IDOR). Toda persona que desarrolle software debería cursar esta materia para dejar de escribir código vulnerable.',
            comentarios: [
                {
                    id_usuario: franId,
                    contenido: 'Los laboratorios de pentesting en entornos controlados te demuestran lo fácil que se puede vulnerar una aplicación si no sanitizás inputs.',
                    respuestas: []
                },
                {
                    id_usuario: titoId,
                    contenido: '¡Totalmente! Principio de menor privilegio y autenticación segura siempre.',
                    respuestas: []
                }
            ]
        }
    ];

    let pubId = 1;
    let comId = 1;
    let reaccId = 1;

    const publicacionesSQL = [];
    const comentariosSQL = [];
    const reaccionesSQL = [];

    for (const pub of publicacionesForo) {
        const thisPubId = pubId++;
        const createdAt = '2026-09-26 10:00:00';
        
        const reaccsPub = [];
        for (const uid of teamIds) {
            if (uid !== pub.id_usuario) {
                reaccsPub.push({
                    id: reaccId++,
                    id_publicacion: thisPubId,
                    id_comentario: null,
                    id_usuario: uid,
                    tipo: 'positivo',
                    createdAt,
                    updatedAt: createdAt
                });
            }
        }
        reaccionesSQL.push(...reaccsPub);

        publicacionesSQL.push({
            id: thisPubId,
            id_materia: pub.id_materia,
            id_usuario: pub.id_usuario,
            titulo: pub.titulo,
            contenido: pub.contenido,
            categoria: pub.categoria,
            votos: reaccsPub.length,
            createdAt,
            updatedAt: createdAt
        });

        // Comentarios
        for (const com of pub.comentarios) {
            const thisComId = comId++;
            const comCreatedAt = '2026-09-26 11:00:00';

            const reaccsCom = [];
            for (const uid of teamIds.slice(0, 3)) {
                if (uid !== com.id_usuario) {
                    reaccsCom.push({
                        id: reaccId++,
                        id_publicacion: null,
                        id_comentario: thisComId,
                        id_usuario: uid,
                        tipo: 'positivo',
                        createdAt: comCreatedAt,
                        updatedAt: comCreatedAt
                    });
                }
            }
            reaccionesSQL.push(...reaccsCom);

            comentariosSQL.push({
                id: thisComId,
                id_publicacion: thisPubId,
                id_usuario: com.id_usuario,
                contenido: com.contenido,
                votos: reaccsCom.length,
                id_comentario_padre: null,
                createdAt: comCreatedAt,
                updatedAt: comCreatedAt
            });

            // Respuestas
            if (com.respuestas && com.respuestas.length > 0) {
                for (const resp of com.respuestas) {
                    const thisRespId = comId++;
                    const respCreatedAt = '2026-09-26 12:00:00';

                    const reaccsResp = [];
                    for (const uid of teamIds.slice(1, 4)) {
                        if (uid !== resp.id_usuario) {
                            reaccsResp.push({
                                id: reaccId++,
                                id_publicacion: null,
                                id_comentario: thisRespId,
                                id_usuario: uid,
                                tipo: 'positivo',
                                createdAt: respCreatedAt,
                                updatedAt: respCreatedAt
                            });
                        }
                    }
                    reaccionesSQL.push(...reaccsResp);

                    comentariosSQL.push({
                        id: thisRespId,
                        id_publicacion: thisPubId,
                        id_usuario: resp.id_usuario,
                        contenido: resp.contenido,
                        votos: reaccsResp.length,
                        id_comentario_padre: thisComId,
                        createdAt: respCreatedAt,
                        updatedAt: respCreatedAt
                    });
                }
            }
        }
    }

    // Lectura de seed.sql base
    const seedPath = path.join(__dirname, '../database/seed.sql');
    let seedContent = fs.readFileSync(seedPath, 'utf8');

    // Cortar cualquier sección de simulación previa
    const simMarker = '-- ===============================================================\n-- DATOS DE SIMULACIÓN';
    if (seedContent.includes(simMarker)) {
        seedContent = seedContent.split(simMarker)[0];
    }

    // Eliminar completamente la sección vieja de FORO PUBLICACIONES Y COMENTARIOS
    const regexForoViejo = /-- FORO PUBLICACIONES Y COMENTARIOS SEED[\s\S]*?UPDATE materias SET id_plan_academico = 2;/;
    seedContent = seedContent.replace(regexForoViejo, `UPDATE materias SET id_plan_academico = 2;`);

    // Eliminar completamente la sección vieja de MATERIALES DE ESTUDIO y CALIFICACIONES
    const regexMaterialesViejos = /-- ===============================================================\s*-- MATERIALES DE ESTUDIO SEED[\s\S]*?INSERT INTO material_calificaciones[\s\S]*?\);/;
    seedContent = seedContent.replace(regexMaterialesViejos, '');

    // Construir la nueva sección de datos de simulación
    const [usuarios] = await baseDeDatos.query('SELECT * FROM usuarios WHERE id >= 5 ORDER BY id');
    const [perfiles] = await baseDeDatos.query('SELECT * FROM perfiles WHERE id_usuario >= 3 ORDER BY id_usuario');

    let appendSQL = '\n\n-- ===============================================================\n';
    appendSQL += '-- DATOS DE SIMULACIÓN (EQUIPO, VISITANTES, MATERIALES Y FORO)\n';
    appendSQL += '-- ===============================================================\n\n';

    // 1. USUARIOS
    appendSQL += '-- 1. USUARIOS DEL EQUIPO (5) Y VISITANTES EVALUADORES (10)\n';
    appendSQL += 'INSERT INTO usuarios (id, mail, contraseña, nombre, apellido, nombre_usuario, anio_ingreso, id_carrera, id_tipo_usuario, id_plan_academico)\nVALUES\n';
    appendSQL += usuarios.map(u => 
        `(${u.id}, '${u.mail}', '${u.contraseña}', '${u.nombre}', '${u.apellido}', '${u.nombre_usuario}', ${u.anio_ingreso}, ${u.id_carrera}, ${u.id_tipo_usuario}, ${u.id_plan_academico})`
    ).join(',\n') + ';\n\n';

    // 2. PERFILES
    appendSQL += '-- 2. PERFILES DE USUARIOS\n';
    appendSQL += 'INSERT INTO perfiles (id_usuario, apodo, anio_cursado, biografia, foto_perfil, rol_equipo, mostrar_anio_cursado, mostrar_contacto)\nVALUES\n';
    appendSQL += perfiles.map(p => 
        `(${p.id_usuario}, '${p.apodo || ''}', ${p.anio_cursado || 1}, '${(p.biografia || '').replace(/'/g, "''")}', '${p.foto_perfil || '🎓'}', '${p.rol_equipo || 'Alumno'}', 1, 1)`
    ).join(',\n') + ';\n\n';

    // 3. MATERIALES DE ESTUDIO (24 REALES)
    appendSQL += '-- 3. MATERIALES DE ESTUDIO REALES (24 ARCHIVOS ASIGNADOS AL EQUIPO)\n';
    appendSQL += 'INSERT INTO materiales_estudio (id, ubicacion, id_materia, id_usuario, titulo, etiquetas, fecha_de_publicacion, likes, descargas)\nVALUES\n';
    appendSQL += materialesDef.map(m => 
        `(${m.id}, 'materiales/2026/10/${m.file.replace(/'/g, "''")}', ${m.id_materia}, ${m.id_usuario}, '${m.titulo.replace(/'/g, "''")}', '${m.etiquetas.replace(/'/g, "''")}', '2026-09-25 14:30:00', ${m.likes}, ${m.descargas})`
    ).join(',\n') + ';\n\n';

    // 4. CALIFICACIONES DE MATERIALES
    appendSQL += '-- 4. CALIFICACIONES DE MATERIALES (ESTRELLAS DE EVALUACIÓN)\n';
    appendSQL += 'INSERT INTO material_calificaciones (id, id_material, id_usuario, puntuacion)\nVALUES\n';
    appendSQL += calificacionesSQL.map(cal => 
        `(${cal.id}, ${cal.id_material}, ${cal.id_usuario}, ${cal.puntuacion})`
    ).join(',\n') + ';\n\n';

    // 5. FORO PUBLICACIONES
    appendSQL += '-- 5. PUBLICACIONES DEL FORO (EXCLUSIVAS DE LOS 5 INTEGRANTES DEL EQUIPO)\n';
    appendSQL += 'INSERT INTO foro_publicaciones (id, id_materia, id_usuario, titulo, contenido, categoria, votos, createdAt, updatedAt)\nVALUES\n';
    appendSQL += publicacionesSQL.map(pub => 
        `(${pub.id}, ${pub.id_materia}, ${pub.id_usuario}, '${pub.titulo.replace(/'/g, "''")}', '${pub.contenido.replace(/'/g, "''")}', '${pub.categoria}', ${pub.votos}, '${pub.createdAt}', '${pub.updatedAt}')`
    ).join(',\n') + ';\n\n';

    // 6. FORO COMENTARIOS
    appendSQL += '-- 6. COMENTARIOS Y DEBATES ANIDADOS (EXCLUSIVOS DEL EQUIPO)\n';
    appendSQL += 'INSERT INTO foro_comentarios (id, id_publicacion, id_usuario, contenido, votos, id_comentario_padre, createdAt, updatedAt)\nVALUES\n';
    appendSQL += comentariosSQL.map(c => 
        `(${c.id}, ${c.id_publicacion}, ${c.id_usuario}, '${c.contenido.replace(/'/g, "''")}', ${c.votos}, ${c.id_comentario_padre !== null ? c.id_comentario_padre : 'NULL'}, '${c.createdAt}', '${c.updatedAt}')`
    ).join(',\n') + ';\n\n';

    // 7. FORO REACCIONES
    appendSQL += '-- 7. REACCIONES (LIKES) REGISTRADAS (EXCLUSIVAS DEL EQUIPO)\n';
    appendSQL += 'INSERT INTO foro_reacciones (id, id_publicacion, id_comentario, id_usuario, tipo, createdAt, updatedAt)\nVALUES\n';
    appendSQL += reaccionesSQL.map(r => 
        `(${r.id}, ${r.id_publicacion !== null ? r.id_publicacion : 'NULL'}, ${r.id_comentario !== null ? r.id_comentario : 'NULL'}, ${r.id_usuario}, '${r.tipo}', '${r.createdAt}', '${r.updatedAt}')`
    ).join(',\n') + ';\n\n';

    fs.writeFileSync(seedPath, seedContent.trimEnd() + appendSQL);
    console.log('seed.sql actualizado limpiamente sin materiales antiguos.');

    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
