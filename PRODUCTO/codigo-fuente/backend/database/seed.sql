-- =========================
-- TIPOS DE USUARIO
-- =========================

INSERT INTO tipos_usuarios (nombre)
VALUES
('Alumno'),
('Profesor'),
('Administrador');

-- =========================
-- CARRERAS
-- =========================

INSERT INTO carreras (
    nombre,
    facultad
)
VALUES
(
    'Ingeniería en Sistemas',
    'FCEFyN'
),
(
    'Ingeniería Electrónica',
    'FCEFyN'
),
(
    'Ingeniería Industrial',
    'FCEFyN'
),
(
    'Ingeniería Mecánica',
    'FCEFyN'
),
(
    'Ingeniería Civil',
    'FCEFyN'
),
(
    'Ingeniería Química',
    'FCEFyN'
),
(
    'Ingeniería Eléctrica',
    'FCEFyN'
),
(
    'Ingeniería Metalúrgica',
    'FCEFyN'
);

-- =========================
-- PLANES ACADEMICOS
-- =========================

INSERT INTO planes_academicos (id, nombre, id_carrera)
VALUES
(1, 'Plan 2008', 1),
(2, 'Plan 2023', 1);

-- =========================
-- USUARIOS
-- =========================

INSERT INTO usuarios (
    mail,
    contraseña,
    nombre,
    apellido,
    nombre_usuario,
    anio_ingreso,
    id_carrera,
    id_tipo_usuario,
    id_plan_academico
)
VALUES
(
    'admin@test.com',
    '$2b$10$x9AoHfbl4GuyGPZT8PJ7MeL1DvG/vFN1QFB9a7zfkD59bs61/T4f6',
    'Administrador',
    'Sistema',
    'admin',
    2024,
    1,
    3,
    2
),
(
    'alumno@test.com',
    '$2b$10$x9AoHfbl4GuyGPZT8PJ7MeL1DvG/vFN1QFB9a7zfkD59bs61/T4f6',
    'Juan',
    'Perez',
    'jperez',
    2024,
    1,
    1,
    2
),
(
    'alumno2@test.com',
    '$2b$10$x9AoHfbl4GuyGPZT8PJ7MeL1DvG/vFN1QFB9a7zfkD59bs61/T4f6',
    'Diego',
    'Perez',
    'diego',
    2024,
    1,
    1,
    2
),
(
    'alumno3@test.com',
    '$2b$10$x9AoHfbl4GuyGPZT8PJ7MeL1DvG/vFN1QFB9a7zfkD59bs61/T4f6',
    'Tito',
    'Alegre',
    'tito',
    2024,
    1,
    1,
    2
);

-- ===============================================================
-- MATERIAS (SEED DE INGENIERÍA EN SISTEMAS CON CORRELATIVAS AVANZADAS)
-- ===============================================================

-- MATERIAS (Nivel 1)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (1, 'MAT1', 'Análisis Matemático I', 1, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (2, 'ALG1', 'Álgebra y Geometría Analítica', 1, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (3, 'FIS1', 'Física I', 1, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (4, 'ING1', 'Inglés I', 1, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (5, 'LOG1', 'Lógica y Estructuras Discretas', 1, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (6, 'AED1', 'Algoritmo y Estructura de Datos', 1, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (7, 'ARQ1', 'Arquitectura de Computadoras', 1, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (8, 'SYS1', 'Sistemas y Proceso de Negocios', 1, 1, 1, 1);

-- MATERIAS (Nivel 2)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (9, 'MAT2', 'Análisis Matemático II', 2, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (10, 'FIS2', 'Física II', 2, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (11, 'ISO2', 'Ingeniería y Sociedad', 2, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (12, 'ING2', 'Inglés II', 2, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (13, 'SSL2', 'Sintaxis y Semántica de los Lenguajes', 2, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (14, 'PPR2', 'Paradigmas de Programación', 2, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (15, 'SOP2', 'Sistemas Operativos', 2, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (16, 'ASI2', 'Análisis de Sistemas de Información', 2, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (17, 'PRO2', 'Probabilidad y Estadística', 2, 1, 1, 1);

-- MATERIAS (Nivel 3)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (18, 'ECO3', 'Economía', 3, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (19, 'BDA3', 'Base de Datos', 3, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (20, 'DSO3', 'Desarrollo de Software', 3, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (21, 'CDA3', 'Comunicación de Datos', 3, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (22, 'ANU3', 'Análisis Numérico', 3, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (23, 'DSI3', 'Diseño de Sistemas de Información', 3, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (99, 'SEM3', 'Seminario Integrador (Analista)', 3, 2, 1, 1);

-- MATERIAS (Nivel 4)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (24, 'LEG4', 'Legislación', 4, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (25, 'ICS4', 'Ingeniería y Calidad de Software', 4, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (26, 'RDA4', 'Redes de Datos', 4, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (27, 'IOP4', 'Investigación Operativa', 4, 3, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (28, 'SIM4', 'Simulación', 4, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (29, 'AUT4', 'Tecnologías Para la Automatización', 4, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (30, 'ADM4', 'Administración de Sistemas de Información', 4, 3, 1, 1);

-- MATERIAS (Nivel 5)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (31, 'INT5', 'Inteligencia Artificial', 5, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (32, 'CDA5', 'Ciencia de Datos', 5, 2, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (33, 'SGE5', 'Sistemas de Gestión', 5, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (34, 'GGE5', 'Gestión Gerencial', 5, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (35, 'SSI5', 'Seguridad en los Sistemas de Información', 5, 1, 1, 1);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo) VALUES (36, 'PFI5', 'Proyecto Final', 5, 3, 1, 1);

-- MATERIAS ELECTIVAS (Plan ISI - Sistema de Puntos)
-- La mayoría otorgan 3 puntos, una de 4 puntos (Cloud) y una de 2 puntos (Green Software)
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (101, 'ELEC-OBJ', 'Desarrollo de Software con Objetos', 4, 1, 1, 0, 1, 3);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (102, 'ELEC-UX', 'Experiencia de Usuario (UX/UI)', 4, 2, 1, 0, 1, 3);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (103, 'ELEC-SEC', 'Seguridad en Aplicaciones Web', 4, 2, 1, 0, 1, 3);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (104, 'ELEC-GRN', 'Green Software y Sustentabilidad', 5, 1, 1, 0, 1, 2);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (105, 'ELEC-CLD', 'Arquitectura y Desarrollo Cloud', 5, 1, 1, 0, 1, 4);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (106, 'ELEC-DAT', 'Gobierno de Datos y Big Data', 5, 1, 1, 0, 1, 3);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (107, 'ELEC-PLN', 'Procesamiento de Lenguaje Natural', 5, 2, 1, 0, 1, 3);
INSERT INTO materias (id, codigo, nombre, nivel_anio, cuatrimestre, id_carrera, visible_en_grafo, es_electiva, puntos) VALUES (108, 'ELEC-VJG', 'Desarrollo de Videojuegos', 5, 2, 1, 0, 1, 3);

-- ===============================================================
-- CORRELATIVAS
-- ===============================================================

-- (9) AM2
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (9, 1, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (9, 2, 'regular');

-- (10) FIS2
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (10, 1, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (10, 3, 'regular');

-- (12) ING2
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (12, 4, 'regular');

-- (13) SINTAXIS
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (13, 5, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (13, 6, 'regular');

-- (14) PARADIGMAS
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (14, 5, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (14, 6, 'regular');

-- (15) SSOO
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (15, 7, 'regular');

-- (16) ANALISIS SISTEMAS
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (16, 6, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (16, 8, 'regular');

-- (17) PROBABILIDAD
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (17, 1, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (17, 2, 'regular');

-- (18) ECONOMIA
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (18, 1, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (18, 2, 'aprobada');

-- (19) BD
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (19, 13, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (19, 16, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (19, 5, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (19, 6, 'aprobada');

-- (20) DS
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (20, 14, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (20, 16, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (20, 5, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (20, 6, 'aprobada');

-- (21) COM
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (21, 3, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (21, 7, 'aprobada');

-- (22) ANU
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (22, 9, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (22, 1, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (22, 2, 'aprobada');

-- (23) DISENO
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (23, 14, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (23, 16, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (23, 4, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (23, 6, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (23, 8, 'aprobada');

-- (99) SEMINARIO
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (99, 16, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (99, 6, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (99, 8, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (99, 13, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (99, 14, 'aprobada');

-- (24) LEGISLACION
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (24, 11, 'regular');

-- (25) CALIDAD
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (25, 19, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (25, 20, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (25, 23, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (25, 13, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (25, 14, 'aprobada');

-- (26) REDES
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (26, 15, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (26, 21, 'regular');

-- (27) IO
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (27, 17, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (27, 22, 'regular');

-- (28) SIMULACION
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (28, 17, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (28, 9, 'aprobada');

-- (29) AUTOMATIZACION
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (29, 10, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (29, 22, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (29, 9, 'aprobada');

-- (30) ADM
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (30, 18, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (30, 23, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (30, 16, 'aprobada');

-- (31) IA
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (31, 28, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (31, 17, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (31, 22, 'aprobada');

-- (32) CIENCIA
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (32, 28, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (32, 17, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (32, 19, 'aprobada');

-- (33) SIST GESTION
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (33, 18, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (33, 27, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (33, 23, 'aprobada');

-- (34) GERENCIAL
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (34, 24, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (34, 30, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (34, 18, 'aprobada');

-- (35) SEGURIDAD
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (35, 26, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (35, 30, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (35, 20, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (35, 21, 'aprobada');

-- (36) PFI
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 25, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 26, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 30, 'regular');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 12, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 20, 'aprobada');
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (36, 23, 'aprobada');

-- CORRELATIVAS DE MATERIAS ELECTIVAS
-- (101) Desarrollo de Software con Objetos (3 pts) (requiere Paradigmas de Programación id 14 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (101, 14, 'regular');

-- (102) UX/UI (3 pts) (requiere Desarrollo de Software id 20 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (102, 20, 'regular');

-- (103) Seguridad en Aplicaciones Web (3 pts) (requiere Desarrollo de Software id 20 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (103, 20, 'regular');

-- (104) Green Software y Sustentabilidad (2 pts) (requiere Calidad de Software id 25 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (104, 25, 'regular');

-- (105) Arquitectura y Desarrollo Cloud (4 pts) (requiere Redes de Datos id 26 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (105, 26, 'regular');

-- (106) Big Data (3 pts) (requiere Base de Datos id 19 aprobada)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (106, 19, 'aprobada');

-- (107) Procesamiento de Lenguaje Natural (3 pts) (requiere Inteligencia Artificial id 31 regular)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (107, 31, 'regular');

-- (108) Desarrollo de Videojuegos (3 pts) (requiere Desarrollo de Software id 20 aprobada)
INSERT INTO correlativas_x_materia (materia_base_id, materia_correlativa_id, tipo_requisito) VALUES (108, 20, 'aprobada');


-- ==============================================
-- MATEMÁTICA (id_materia = 1) - 3 turnos
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('MAT1 - Turno Mañana', '08:00', 90, 1, 1),      -- Lunes (bit 1)
('MAT1 - Turno Tarde', '14:00', 90, 1, 1),       -- Lunes (bit 2)
('MAT1 - Turno Noche', '19:30', 90, 4, 1);       -- Miércoles (bit 4)

-- ==============================================
-- ÁLGEBRA (id_materia = 2) - frecuencia 2 días/semana
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('ALG1 - Mañana (Lun-Mie)', '09:00', 90, 5, 2),      -- Lunes(1) + Miércoles(4) = 5
('ALG1 - Tarde (Mar-Jue)', '15:00', 90, 10, 2),      -- Martes(2) + Jueves(8) = 10
('ALG1 - Noche (Lun-Jue)', '20:00', 90, 9, 2);       -- Lunes(1) + Jueves(8) = 9

-- ==============================================
-- PROGRAMACIÓN (id_materia = 3) - frecuencia 3 días/semana
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('FIS1 - Intensivo Mañana', '07:30', 120, 21, 3),   -- Lun(1)+Mie(4)+Vie(16)=21
('FIS1 - Intensivo Tarde', '13:30', 120, 42, 3),    -- Mar(2)+Jue(8)+Sab(32)=42
('FIS1 - Extensivo Noche', '18:00', 90, 21, 3);     -- Lun-Mie-Vie pero 90 min

-- ==============================================
-- BASE DE DATOS (id_materia = 4) - 2 días, distintos patrones
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('ING - Sabatino', '09:00', 240, 32, 4),            -- Solo Sábado (32), 4h
('ING - Dominical', '10:00', 180, 64, 4),           -- Solo Domingo (64), 3h
('ING - Finde Completo', '09:00', 150, 96, 4);      -- Sáb(32)+Dom(64)=96, 2.5h

-- ==============================================
-- FÍSICA (id_materia = 5) - 1 día intensivo
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('LOG1 - Viernes Práctica', '14:00', 180, 16, 5),    -- Solo Viernes (16), 3h lab
('LOG1 - Sábado Teoría', '08:00', 120, 32, 5),      -- Solo Sábado (32), 2h
('LOG1 - Lunes Teórico', '17:00', 90, 1, 5);        -- Solo Lunes (1), 1.5h

-- ==============================================
-- INGLÉS (id_materia = 6) - frecuencia diaria
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('AED1 - Diario Mañana', '07:00', 60, 31, 6),       -- Lun a Vie (1+2+4+8+16)=31
('AED1 - Diario Noche', '20:00', 60, 31, 6),        -- Lun a Vie 20hs
('AED1 - Finde Intensivo', '09:00', 240, 96, 6);    -- Sáb+Dom (32+64)=96, 4h

-- ==============================================
-- QUÍMICA (id_materia = 7) - 2 días separados
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('QUI1 - Mar y Jue', '11:00', 90, 10, 7),           -- Mar(2)+Jue(8)=10
('QUI1 - Lun y Vie', '11:00', 90, 17, 7),           -- Lun(1)+Vie(16)=17
('QUI1 - Mie y Sab', '15:00', 90, 36, 7);           -- Mie(4)+Sab(32)=36

-- ==============================================
-- HISTORIA (id_materia = 8) - noche
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('HIS1 - Noche Lun-Mie', '19:00', 90, 5, 8),        -- Lun(1)+Mie(4)=5
('HIS1 - Noche Mar-Jue', '19:30', 90, 10, 8),       -- Mar(2)+Jue(8)=10
('HIS1 - Noche Vie', '20:00', 120, 16, 8);          -- Solo Vie(16), 2h

-- ==============================================
-- CASOS BORDE para pruebas
-- ==============================================
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
-- Madrugadores vs nocturnos
('ALG2 - Madrugada', '05:30', 60, 1, 2),            -- 5:30 AM
('ALG2 - Trasnoche', '23:00', 60, 1, 2);            -- 11:00 PM


-- ==============================================
-- CURSOS PARA MATERIAS FALTANTES (Nivel 2 al 5 + Electivas)
-- ==============================================

-- Nivel 2
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('MAT2 - Turno Mañana (Lun-Mie)', '08:00', 90, 5, 9),
('FIS2 - Turno Tarde (Mar-Jue)', '14:00', 90, 10, 10),
('ISO2 - Noche (Miércoles)', '19:00', 180, 4, 11),
('ING2 - Sábados', '09:00', 180, 32, 12),
('SSL2 - Mañana (Lunes)', '08:00', 180, 1, 13),
('PPR2 - Tarde (Martes)', '14:00', 180, 2, 14),
('SOP2 - Noche (Lun-Mie)', '19:30', 90, 5, 15),
('ASI2 - Tarde (Jueves)', '15:00', 180, 8, 16),
('PRO2 - Mañana (Viernes)', '09:00', 180, 16, 17);

-- Nivel 3
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('ECO3 - Noche (Martes)', '18:30', 180, 2, 18),
('BDA3 - Mañana (Lun-Jue)', '10:00', 90, 9, 19),
('DSO3 - Tarde (Mie-Vie)', '15:00', 90, 20, 20),
('CDA3 - Noche (Lunes)', '20:00', 180, 1, 21),
('ANU3 - Mañana (Jueves)', '08:30', 180, 8, 22),
('DSI3 - Tarde (Lun-Mie)', '16:00', 90, 5, 23),
('SEM3 - Sábados', '08:00', 240, 32, 99);

-- Nivel 4
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('LEG4 - Noche (Jueves)', '19:00', 180, 8, 24),
('ICS4 - Tarde (Viernes)', '14:00', 180, 16, 25),
('RDA4 - Mañana (Mar-Jue)', '08:00', 90, 10, 26),
('IOP4 - Noche (Mie-Vie)', '19:30', 90, 20, 27),
('SIM4 - Mañana (Lunes)', '09:00', 180, 1, 28),
('AUT4 - Tarde (Martes)', '15:30', 180, 2, 29),
('ADM4 - Noche (Lunes)', '18:30', 180, 1, 30);

-- Nivel 5
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('INT5 - Noche (Martes)', '18:00', 180, 2, 31),
('CDA5 - Noche (Miércoles)', '18:00', 180, 4, 32),
('SGE5 - Mañana (Viernes)', '08:30', 180, 16, 33),
('GGE5 - Tarde (Jueves)', '14:00', 180, 8, 34),
('SSI5 - Noche (Lunes)', '19:00', 180, 1, 35),
('PFI5 - Sábados Taller', '09:00', 240, 32, 36);

-- Materias Electivas
INSERT INTO cursos (nombre, hora_inicio, duracion, dias, id_materia) VALUES 
('ELEC-OBJ - Tarde (Lunes)', '14:00', 180, 1, 101),
('ELEC-UX - Noche (Martes)', '18:30', 180, 2, 102),
('ELEC-SEC - Noche (Miércoles)', '19:00', 180, 4, 103),
('ELEC-GRN - Mañana (Jueves)', '10:00', 120, 8, 104),
('ELEC-CLD - Tarde (Viernes)', '15:00', 240, 16, 105),
('ELEC-DAT - Noche (Lunes)', '18:00', 180, 1, 106),
('ELEC-PLN - Tarde (Martes)', '14:00', 180, 2, 107),
('ELEC-VJG - Sábados', '10:00', 180, 32, 108);




INSERT INTO inscripciones_cursos(id_usuario, id_curso) VALUES (1, 1);
INSERT INTO inscripciones_cursos(id_usuario, id_curso) VALUES (1, 1);
INSERT INTO inscripciones_cursos(id_usuario, id_curso) VALUES (1, 2);
INSERT INTO inscripciones_cursos(id_usuario, id_curso) VALUES (2, 3);
-- ===============================================================
-- PERFILES DE USUARIOS SEED
-- ===============================================================
INSERT INTO perfiles (id_usuario, apodo, anio_cursado, biografia, foto_perfil, rol_equipo, mostrar_anio_cursado, mostrar_contacto)
VALUES 
(1, 'Admin', 5, 'Administrador del sistema.', '💻', 'Admin', 1, 1),
(2, 'Juancho', 2, 'Estudiante de Ingeniería en Sistemas.', '🎓', 'Miembro', 1, 1);

-- ===============================================================
-- ===============================================================
UPDATE materias SET id_plan_academico = 2;

-- ===============================================================
-- DATOS DE SIMULACIÓN (EQUIPO, VISITANTES, MATERIALES Y FORO)
-- ===============================================================

-- 1. USUARIOS DEL EQUIPO (5) Y VISITANTES EVALUADORES (10)
INSERT INTO usuarios (id, mail, contraseña, nombre, apellido, nombre_usuario, anio_ingreso, id_carrera, id_tipo_usuario, id_plan_academico)
VALUES
(5, 'franciscofunes@gmail.com', '$2b$10$tMM163ZUvpKEJZ8wDtJy3OLh438GhqL0tFHH29LyPZlnsf4j9Us0y', 'Francisco', 'Funes', 'franciscofunes', 2021, 1, 1, 2),
(6, 'titomontivero@gmail.com', '$2b$10$tMM163ZUvpKEJZ8wDtJy3OLh438GhqL0tFHH29LyPZlnsf4j9Us0y', 'Tito', 'Montivero', 'titomontivero', 2021, 1, 1, 2),
(7, 'francososa@gmail.com', '$2b$10$tMM163ZUvpKEJZ8wDtJy3OLh438GhqL0tFHH29LyPZlnsf4j9Us0y', 'Franco', 'Sosa', 'francososa', 2021, 1, 1, 2),
(8, 'martinsciarra@gmail.com', '$2b$10$tMM163ZUvpKEJZ8wDtJy3OLh438GhqL0tFHH29LyPZlnsf4j9Us0y', 'Martin', 'Sciarra', 'martinsciarra', 2021, 1, 1, 2),
(9, 'lucianazahr@gmail.com', '$2b$10$tMM163ZUvpKEJZ8wDtJy3OLh438GhqL0tFHH29LyPZlnsf4j9Us0y', 'Luciana', 'Zahr', 'lucianazahr', 2022, 1, 1, 2),
(10, 'usuario1@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '1', 'usuario1', 2024, 1, 1, 2),
(11, 'usuario2@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '2', 'usuario2', 2024, 1, 1, 2),
(12, 'usuario3@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '3', 'usuario3', 2024, 1, 1, 2),
(13, 'usuario4@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '4', 'usuario4', 2024, 1, 1, 2),
(14, 'usuario5@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '5', 'usuario5', 2024, 1, 1, 2),
(15, 'usuario6@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '6', 'usuario6', 2024, 1, 1, 2),
(16, 'usuario7@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '7', 'usuario7', 2024, 1, 1, 2),
(17, 'usuario8@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '8', 'usuario8', 2024, 1, 1, 2),
(18, 'usuario9@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '9', 'usuario9', 2024, 1, 1, 2),
(19, 'usuario10@gmail.com', '$2b$10$ynJBpfXVhSz9lyc./3tqPeMs5lxafAhdN1ulyYqDcL1DUEAfLkaM6', 'Usuario', '10', 'usuario10', 2024, 1, 1, 2);

-- ==============================================
-- INSCRIPCIONES A CURSOS (Usuarios 5 a 19)
-- ==============================================
INSERT INTO inscripciones_cursos (id_usuario, id_curso) VALUES 
-- Usuarios de ingreso 2021 (Avanzados)
(5, 14), (5, 23), (5, 33), -- Francisco Funes (SOP2, DSO3, INT5)
(6, 22), (6, 21), (6, 35), -- Tito Montivero (anu, CDA3, CDA5)
(7, 16), (7, 25), (7, 35), -- Franco Sosa (PRO2, ANU3, SGE5)
(8, 17), (8, 26), (8, 36), -- Martin Sciarra (ECO3, DSI3, GGE5)

-- Usuario ingreso 2022 (Intermedio)
(9, 7),  (9, 11), (9, 18), -- Luciana Zahr (MAT2, ING2, BDA3)

-- Usuarios ingreso 2024 (Iniciales)
(10, 1), (10, 4), (10, 8), -- Usuario 1 (MAT1, ALG1, FIS1)
(11, 1), (11, 4), (11, 9), -- Usuario 2 (MAT1, ALG1, ING1)
(12, 2), (12, 5), (12, 8), -- Usuario 3 (MAT1, ALG1, FIS1)
(13, 2), (13, 5), (13, 10),-- Usuario 4 (MAT1, ALG1, LOG1)
(14, 3), (14, 6), (14, 8), -- Usuario 5 (MAT1, ALG1, FIS1)
(15, 3), (15, 6), (15, 10),-- Usuario 6 (MAT1, ALG1, LOG1)
(16, 1), (16, 4), (16, 11),-- Usuario 7 (MAT1, ALG1, AED1)
(17, 2), (17, 5), (17, 12),-- Usuario 8 (MAT1, ALG1, ARQ1)
(18, 3), (18, 6), (18, 13),-- Usuario 9 (MAT1, ALG1, SYS1)
(19, 1), (19, 5), (19, 8); -- Usuario 10 (MAT1, ALG1, FIS1)


-- ==============================================
-- ESTADOS DE MATERIA (Usuarios 5 a 19)
-- ==============================================
INSERT INTO estado_materia_alumno (id_usuario, id_materia, estado) VALUES 
-- Francisco Funes (id: 5)
(5, 1, 'Aprobada'), (5, 2, 'Aprobada'), (5, 15, 'Cursando'), (5, 20, 'Cursando'), (5, 31, 'Cursando'),

-- Tito Montivero (id: 6)
(6, 1, 'Aprobada'), (6, 6, 'Aprobada'), (6, 22, 'Cursando'), (6, 21, 'Cursando'), (6, 32, 'Cursando'),

-- Franco Sosa (id: 7)
(7, 3, 'Aprobada'), (7, 5, 'Aprobada'), (7, 17, 'Cursando'), (7, 22, 'Cursando'), (7, 33, 'Cursando'),

-- Martin Sciarra (id: 8)
(8, 2, 'Aprobada'), (8, 8, 'Aprobada'), (8, 18, 'Cursando'), (8, 23, 'Cursando'), (8, 34, 'Cursando'),

-- Luciana Zahr (id: 9)
(9, 1, 'Aprobada'), (9, 4, 'Aprobada'), (9, 9, 'Cursando'), (9, 12, 'Cursando'), (9, 19, 'Cursando'),

-- Usuarios Iniciales (2024 - Cursando materias de Nivel 1)
(10, 1, 'Cursando'), (10, 2, 'Cursando'), (10, 3, 'Cursando'),
(11, 1, 'Cursando'), (11, 2, 'Cursando'), (11, 4, 'Cursando'),
(12, 1, 'Cursando'), (12, 2, 'Cursando'), (12, 3, 'Cursando'),
(13, 1, 'Cursando'), (13, 2, 'Cursando'), (13, 5, 'Cursando'),
(14, 1, 'Cursando'), (14, 2, 'Cursando'), (14, 3, 'Cursando'),
(15, 1, 'Cursando'), (15, 2, 'Cursando'), (15, 5, 'Cursando'),
(16, 1, 'Cursando'), (16, 2, 'Cursando'), (16, 6, 'Cursando'),
(17, 1, 'Cursando'), (17, 2, 'Cursando'), (17, 7, 'Cursando'),
(18, 1, 'Cursando'), (18, 2, 'Cursando'), (18, 8, 'Cursando'),
(19, 1, 'Cursando'), (19, 2, 'Cursando'), (19, 3, 'Cursando');


-- 2. PERFILES DE USUARIOS
INSERT INTO perfiles (id_usuario, apodo, anio_cursado, biografia, foto_perfil, rol_equipo, mostrar_anio_cursado, mostrar_contacto)
VALUES
(3, '', 1, '', '🎓', 'Alumno', 1, 1),
(5, 'Fran', 4, 'Estudiante de Ing. en Sistemas de Información. Apasionado por backend, arquitectura de software y bases de datos.', '👨‍💻', 'Backend Developer', 1, 1),
(6, 'Tito', 4, 'Estudiante avanzado de Sistemas. Me gusta el desarrollo fullstack, métricas y dashboards interactivos.', '🚀', 'Fullstack Developer', 1, 1),
(7, 'Franco', 4, 'Estudiante de Ingeniería en Sistemas. Team lead y desarrollador enfocado en metodologías ágiles y experiencia de usuario.', '⚡', 'Team Lead / Fullstack', 1, 1),
(8, 'Tincho', 4, 'Futuro Ingeniero en Sistemas. Interesado en infraestructura, microservicios, seguridad y devops.', '🛡️', 'Software Architect', 1, 1),
(9, 'Lu', 4, 'Estudiante de Ing. en Sistemas. Especializada en diseño UI/UX, frontend moderno y accesibilidad.', '✨', 'Frontend / UI-UX', 1, 1),
(10, 'User 1', 1, 'Cuenta de prueba para evaluador / visitante N° 1.', '🎓', 'Evaluador', 1, 1),
(11, 'User 2', 1, 'Cuenta de prueba para evaluador / visitante N° 2.', '🎓', 'Evaluador', 1, 1),
(12, 'User 3', 1, 'Cuenta de prueba para evaluador / visitante N° 3.', '🎓', 'Evaluador', 1, 1),
(13, 'User 4', 1, 'Cuenta de prueba para evaluador / visitante N° 4.', '🎓', 'Evaluador', 1, 1),
(14, 'User 5', 1, 'Cuenta de prueba para evaluador / visitante N° 5.', '🎓', 'Evaluador', 1, 1),
(15, 'User 6', 1, 'Cuenta de prueba para evaluador / visitante N° 6.', '🎓', 'Evaluador', 1, 1),
(16, 'User 7', 1, 'Cuenta de prueba para evaluador / visitante N° 7.', '🎓', 'Evaluador', 1, 1),
(17, 'User 8', 1, 'Cuenta de prueba para evaluador / visitante N° 8.', '🎓', 'Evaluador', 1, 1),
(18, 'User 9', 1, 'Cuenta de prueba para evaluador / visitante N° 9.', '🎓', 'Evaluador', 1, 1),
(19, 'User 10', 1, 'Cuenta de prueba para evaluador / visitante N° 10.', '🎓', 'Evaluador', 1, 1);

-- 3. MATERIALES DE ESTUDIO REALES (24 ARCHIVOS ASIGNADOS AL EQUIPO)
INSERT INTO materiales_estudio (id, ubicacion, id_materia, id_usuario, titulo, etiquetas, fecha_de_publicacion, likes, descargas)
VALUES
(1, 'materiales/2026/10/Resumen COM.pdf', 21, 5, 'Resumen Completo - Comunicación de Datos (Medios, Modulación y Protocolos)', '["comunicacion de datos","cda","resumen","parcial"]', '2026-09-25 14:30:00', 18, 42),
(2, 'materiales/2026/10/RESUMEN FINAL -ISW- ALEX.pdf', 25, 9, 'Resumen Final Completo - Ingeniería y Calidad de Software (ISW)', '["isw","calidad de software","final","resumen","testing"]', '2026-09-25 14:30:00', 27, 64),
(3, 'materiales/2026/10/Resumen 1 Parcial Analisis Matematico Teorico.pdf', 1, 7, 'Resumen Teórico 1er Parcial - Análisis Matemático I (Límites, Continuidad y Derivadas)', '["analisis 1","matematica","primer parcial","teorico"]', '2026-09-25 14:30:00', 22, 58),
(4, 'materiales/2026/10/Resumen analisis matematico 1.pdf', 1, 8, 'Apunte Integral Análisis Matemático I - Práctico con Ejercicios Tipo Parcial', '["analisis 1","integrales","derivadas","ejercicios"]', '2026-09-25 14:30:00', 31, 79),
(5, 'materiales/2026/10/ACO_-_Resumen-1-1.pdf', 7, 6, 'Resumen Arquitectura de Computadoras - Módulo 1 (Microarquitectura y Registros)', '["arquitectura","aco","cpu","registros"]', '2026-09-25 14:30:00', 16, 41),
(6, 'materiales/2026/10/resumen aco.pdf', 7, 5, 'Guía Rápida de Arquitectura de Computadoras (Assembler Intel 8086)', '["arquitectura","aco","assembler","resumen"]', '2026-09-25 14:30:00', 14, 35),
(7, 'materiales/2026/10/Apunte teo-pract ALUMNO IA.pdf', 31, 7, 'Apunte Teórico-Práctico Completo - Inteligencia Artificial (Búsquedas, Heurísticas y Redes)', '["inteligencia artificial","ia","machine learning","heuristica"]', '2026-09-25 14:30:00', 34, 85),
(8, 'materiales/2026/10/ASI_resumen_completo.pdf', 16, 9, 'Resumen Integral ASI - Análisis de Sistemas (Diagramas UML y Casos de Uso)', '["asi","analisis","casos de uso","uml","diagramas"]', '2026-09-25 14:30:00', 25, 59),
(9, 'materiales/2026/10/RESUMEN ASI TEORICO 1.pdf', 16, 8, 'Teórico ASI Parte 1 - Metodologías de Desarrollo y Ciclos de Vida', '["asi","teorico","parcial 1","metodologias"]', '2026-09-25 14:30:00', 19, 47),
(10, 'materiales/2026/10/RESUMEN ASI TEORICO 2.pdf', 16, 6, 'Teórico ASI Parte 2 - Requerimientos Funcionales y No Funcionales', '["asi","teorico","parcial 2","requerimientos"]', '2026-09-25 14:30:00', 18, 43),
(11, 'materiales/2026/10/Economia.pdf', 18, 5, 'Resumen General de Economía - Microeconomía y Macroeconomía', '["economia","microeconomia","macroeconomia","resumen"]', '2026-09-25 14:30:00', 20, 49),
(12, 'materiales/2026/10/Fisica II Teorico.pdf', 10, 7, 'Compendio Teórico Física II (Electromagnetismo, Óptica y Ondas)', '["fisica 2","electromagnetismo","optica","formulas"]', '2026-09-25 14:30:00', 24, 62),
(13, 'materiales/2026/10/Resumen - SIM.pdf', 28, 8, 'Resumen Clave Simulación - Modelos Matemáticos y Variables Aleatorias', '["simulacion","montecarlo","variables aleatorias","modelos"]', '2026-09-25 14:30:00', 15, 38),
(14, 'materiales/2026/10/Resumen - SSL.pdf', 13, 9, 'Resumen Sintaxis y Semántica (Gramáticas, Autómatas Finitos y Parsing LR/LL)', '["ssl","gramaticas","automatas","compiladores"]', '2026-09-25 14:30:00', 29, 72),
(15, 'materiales/2026/10/Resumen 1 KND Redes.pdf', 26, 6, 'Redes de Datos - Resumen KND Parte 1 (Modelo OSI y Arquitectura TCP/IP)', '["redes","knd","modelo osi","tcp ip"]', '2026-09-25 14:30:00', 23, 54),
(16, 'materiales/2026/10/Resumen 2 KND Redes.pdf', 26, 5, 'Redes de Datos - Resumen KND Parte 2 (Subnetting IPv4/IPv6 y Enrutamiento RIP/OSPF)', '["redes","knd","subnetting","enrutamiento"]', '2026-09-25 14:30:00', 28, 68),
(17, 'materiales/2026/10/Resumen 3 KND Redes.pdf', 26, 7, 'Redes de Datos - Resumen KND Parte 3 (Capas de Transporte y Aplicación: TCP, UDP, DNS, HTTP)', '["redes","knd","transporte","dns","http"]', '2026-09-25 14:30:00', 21, 46),
(18, 'materiales/2026/10/RESUMEN BASE DE DATOS1.pdf', 19, 8, 'Resumen SQL, Álgebra Relacional y Normalización 1FN a BCNF', '["base de datos","sql","algebra relacional","normalizacion"]', '2026-09-25 14:30:00', 35, 88),
(19, 'materiales/2026/10/RESUMEN DISEÑO DE SISTEMAS.pdf', 23, 9, 'Diseño de Sistemas - Patrones de Diseño GoF y Arquitecturas Limpias', '["diseno de sistemas","patrones gof","arquitectura","solid"]', '2026-09-25 14:30:00', 38, 95),
(20, 'materiales/2026/10/Resumen PyE final.pdf', 17, 6, 'Resumen Final Completo - Probabilidad y Estadística (Variables Discretas, Continuas e Inferencia)', '["probabilidad","estadistica","distribuciones","inferencia"]', '2026-09-25 14:30:00', 26, 60),
(21, 'materiales/2026/10/Resumen-Final-Inv.-Op-V3.pdf', 27, 7, 'Investigación Operativa - Resumen Final V3 (Método Simplex, Transporte y PERT/CPM)', '["investigacion operativa","simplex","transporte","pert cpm"]', '2026-09-25 14:30:00', 23, 51),
(22, 'materiales/2026/10/SOP - Resumen 1er parcial.pdf', 15, 5, 'Sistemas Operativos - Resumen 1er Parcial (Procesos, Hilos y Concurrencia)', '["sistemas operativos","sop","procesos","concurrencia"]', '2026-09-25 14:30:00', 32, 76),
(23, 'materiales/2026/10/SOP - Resumen 2do parcial.pdf', 15, 8, 'Sistemas Operativos - Resumen 2do Parcial (Memoria Virtual, Paginación y Segmentación)', '["sistemas operativos","sop","memoria virtual","paginacion"]', '2026-09-25 14:30:00', 29, 70),
(24, 'materiales/2026/10/SOP - Resúmen 3er Parcial.pdf', 15, 9, 'Sistemas Operativos - Resumen 3er Parcial (Sistemas de Archivos y Planificación de Disco)', '["sistemas operativos","sop","file systems","i/o"]', '2026-09-25 14:30:00', 30, 74);

-- 4. CALIFICACIONES DE MATERIALES (ESTRELLAS DE EVALUACIÓN)
INSERT INTO material_calificaciones (id, id_material, id_usuario, puntuacion)
VALUES
(1, 1, 6, 4),
(2, 1, 7, 5),
(3, 1, 8, 4),
(4, 1, 9, 5),
(5, 2, 5, 4),
(6, 2, 6, 5),
(7, 2, 7, 4),
(8, 2, 8, 5),
(9, 3, 5, 5),
(10, 3, 6, 4),
(11, 3, 8, 4),
(12, 3, 9, 5),
(13, 4, 5, 4),
(14, 4, 6, 5),
(15, 4, 7, 4),
(16, 4, 9, 4),
(17, 5, 5, 5),
(18, 5, 7, 5),
(19, 5, 8, 4),
(20, 5, 9, 5),
(21, 6, 6, 5),
(22, 6, 7, 4),
(23, 6, 8, 5),
(24, 6, 9, 4),
(25, 7, 5, 5),
(26, 7, 6, 4),
(27, 7, 8, 4),
(28, 7, 9, 5),
(29, 8, 5, 4),
(30, 8, 6, 5),
(31, 8, 7, 4),
(32, 8, 8, 5),
(33, 9, 5, 5),
(34, 9, 6, 4),
(35, 9, 7, 5),
(36, 9, 9, 5),
(37, 10, 5, 4),
(38, 10, 7, 4),
(39, 10, 8, 5),
(40, 10, 9, 4),
(41, 11, 6, 4),
(42, 11, 7, 5),
(43, 11, 8, 4),
(44, 11, 9, 5),
(45, 12, 5, 4),
(46, 12, 6, 5),
(47, 12, 8, 5),
(48, 12, 9, 4),
(49, 13, 5, 5),
(50, 13, 6, 4),
(51, 13, 7, 5),
(52, 13, 9, 5),
(53, 14, 5, 4),
(54, 14, 6, 5),
(55, 14, 7, 4),
(56, 14, 8, 5),
(57, 15, 5, 5),
(58, 15, 7, 5),
(59, 15, 8, 4),
(60, 15, 9, 5),
(61, 16, 6, 5),
(62, 16, 7, 4),
(63, 16, 8, 5),
(64, 16, 9, 4),
(65, 17, 5, 5),
(66, 17, 6, 4),
(67, 17, 8, 4),
(68, 17, 9, 5),
(69, 18, 5, 4),
(70, 18, 6, 5),
(71, 18, 7, 4),
(72, 18, 9, 4),
(73, 19, 5, 5),
(74, 19, 6, 4),
(75, 19, 7, 5),
(76, 19, 8, 4),
(77, 20, 5, 4),
(78, 20, 7, 4),
(79, 20, 8, 5),
(80, 20, 9, 4),
(81, 21, 5, 5),
(82, 21, 6, 4),
(83, 21, 8, 4),
(84, 21, 9, 5),
(85, 22, 6, 5),
(86, 22, 7, 4),
(87, 22, 8, 5),
(88, 22, 9, 4),
(89, 23, 5, 5),
(90, 23, 6, 4),
(91, 23, 7, 5),
(92, 23, 9, 5),
(93, 24, 5, 4),
(94, 24, 6, 5),
(95, 24, 7, 4),
(96, 24, 8, 5);

-- 5. PUBLICACIONES DEL FORO (EXCLUSIVAS DE LOS 5 INTEGRANTES DEL EQUIPO)
INSERT INTO foro_publicaciones (id, id_materia, id_usuario, titulo, contenido, categoria, votos, createdAt, updatedAt)
VALUES
(1, 1, 7, 'Opinión sincera: ¿Conviene cursar Análisis I anual o cuatrimestral?', 'En mi experiencia, si vienen de un secundario flojo en matemática conviene hacerla anual para asentar bien los conceptos de límites y derivadas. En el cuatrimestral van a las chapas y si te atrasás dos clases con integrales estás al horno. Los parciales prácticos son largos pero justos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(2, 2, 8, 'El segundo parcial de Álgebra define todo: Espacios Vectoriales y Cónicas', 'Álgebra arranca tranqui con matrices, determinantes y sistemas de ecuaciones (esa parte es mecánica). Pero cuando entrás a transformaciones lineales, autovalores/autovectores y rototraslación de cónicas se pone muy abstracto. Recomiendo graficar todo en GeoGebra para visualizar los planos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(3, 3, 6, 'No cuelguen los laboratorios de Física I ni los informes de incertezas', 'Muchos se confían porque aprueban los dos parciales prácticos de cinemática y dinámica, pero si debés un solo informe de laboratorio o te bochan en la propagación de incertezas te mandan a recuperar a fin de año. Hagan los TPs con tiempo.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(4, 5, 9, 'Lógica y Estructuras Discretas: De las más entretenidas de primer año', 'Para mí fue de las materias más lindas de primero. Tablas de verdad, inducción matemática, teoría de grafos y árboles. Es la base matemática directa de todo lo que después ves en Algoritmos y Bases de Datos. Vale la pena no estudiarla solo para zafar sino para razonar.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(5, 6, 5, 'La transición de pseudocódigo a lenguaje posta y punteros en AED', 'AED es la materia filtro de primer año junto con Análisis. Cuando pasás de diagramas de flujo a listas enlazadas, colas, pilas y árboles con memoria dinámica es donde realmente te das cuenta si te gusta programar. Practiquen en la compu todos los días, no se queden solo con el papel.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(6, 7, 8, 'Cómo encarar Arquitectura de Computadoras sin frustrarse con Assembler', 'Arquitectura tiene fama de áspera por el lenguaje ensamblador del 8086 y la memoria segmentada. Mi consejo: entiendan qué hace la CPU ciclo a ciclo (Fetch, Decode, Execute). Una vez que visualizás los registros AX, BX, CX, DX y el stack pointer, el código ensamblador deja de parecer jeroglíficos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(7, 8, 9, 'Sistemas y Organizaciones / Procesos: Clave para entender cómo funciona una empresa real', 'Muchos entran a Sistemas pensando que solo van a picar código, y en esta materia te encontrás con organigramas, cursogramas, BPMN y compras/ventas. Al principio parece densa, pero si entendés la cadena de valor de una empresa, después en ASI y DSI diseñás software que soluciona problemas reales.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(8, 9, 7, 'Análisis Matemático II: El salto a varias variables', 'Derivadas parciales, plano tangente, multiplicadores de Lagrange y después integrales dobles/triples. Es una materia hermosa pero requiere mucha constancia. No dejen teoremas como Green, Stokes y Gauss para las últimas 48 horas porque el bochazo es inminente.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(9, 10, 5, 'Física II: Electromagnetismo es mucho más abstracto que mecánica', 'En Física 1 ves un bloque cayendo por un plano inclinado y lo imaginás. En Física 2 tenés campos eléctricos, ley de Gauss con superficies gaussianas cerradas, circuitos RLC y ley de Faraday-Lenz. Hay que practicar muchísimo planteo de integrales de línea y superficie.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(10, 11, 9, 'Materia reflexiva y necesaria para el rol profesional del ingeniero', 'No todo es matemática y computación; el impacto social, ético y ambiental de la tecnología que construimos es gigante. Los debates en clase sobre desarrollo sostenible, soberanía tecnológica y patentes me parecieron de lo más enriquecedor de segundo año.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(11, 13, 8, 'SSL: La materia que te explica qué pasa por dentro cuando le das a "Compilar"', 'Jerarquía de Chomsky, autómatas con pila, gramáticas libres de contexto y análisis léxico/sintáctico (Flex y Bison / Lex y Yacc). Es demandante pero te da un nivel técnico que te diferencia como profesional. Entender ASTs (Abstract Syntax Trees) te hace mejor programador en cualquier lenguaje.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(12, 14, 6, 'Paradigmas: El click mental de salir de la programación estructurada', 'Aprender Programación Funcional (Haskell), Programación Lógica (Prolog) y Objetos puro (Wollok/Smalltalk). Pasar de pensar en bucles for y variables mutables a funciones puras de orden superior y pattern matching te hace replantearte todo lo que aprendiste.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(13, 15, 5, 'SOP: El TP anual en C sobre Linux es el mejor entrenamiento para la vida real', 'El famoso trabajo práctico de Sistemas Operativos. Programar en C con sockets, hilos (pthreads), semáforos, memoria compartida y serialización de mensajes en una arquitectura distribuida te hace madurar como desarrollador 3 años de golpe. Se sufre pero se aprende una barbaridad.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(14, 16, 9, 'El TP integrador de ASI: Elige con mucho cuidado a tu grupo', 'ASI es una materia troncal y anual donde se hace el relevamiento completo de una empresa real, modelando requerimientos con casos de uso, diagramas de actividad y especificaciones detalladas. Si el equipo no está comprometido o la empresa elegida no colabora, la cursada se vuelve una pesadilla.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(15, 17, 6, 'Probabilidad y Estadística: La clave está en no perderse en las tablas', 'Binomial, Poisson, Normal, t-Student, Chi-cuadrado. La materia es super aplicable (en analítica, data science, testing y control de calidad), pero en el examen te comen los nervios si no practicaste rápido la tipificación de variables normales y pruebas de hipótesis.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(16, 18, 5, 'Economía en Sistemas: Mucho más útil de lo que parece a primera vista', 'Aprender punto de equilibrio, costos fijos vs variables, inflación, elasticidad precio de la demanda y estructura de mercados. Cuando después tenés que presupuestar un proyecto de software o evaluar si conviene contratar servidores on-premise vs nube, usás todos estos conceptos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(17, 19, 8, 'Base de Datos: Normalización y optimización de queries SQL', 'No se queden solo con hacer SELECT * FROM tabla. Lo importante acá es diseñar esquemas limpios hasta Tercera Forma Normal (o Boyce-Codd), entender planes de ejecución con índices (B-Tree), transacciones ACID y niveles de aislamiento para evitar lecturas sucias y bloqueos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(18, 20, 7, 'DSO: Práctica real de metodologías ágiles en equipo', 'La cursada te pone a trabajar en sprints de Scrum simulando un equipo de desarrollo con Product Owner y Scrum Master. Se aprende mucho sobre gestión de Git en equipo (ramas, PRs, code reviews) y cómo estimar user stories con Planning Poker.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(19, 21, 5, 'Comunicación de Datos: La física y matemática detrás de las telecomunicaciones', 'Teorema de Nyquist, capacidad de canal de Shannon, atenuación, ruido térmico, modulación ASK/FSK/PSK y medios de transmisión (fibra óptica monomodo/multimodo, par trenzado). Es bastante técnica pero te permite entender el sustrato físico sobre el que viajan los paquetes de red.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(20, 23, 9, 'Diseño de Sistemas (DSI): La cúspide de la ingeniería de software en la carrera', 'La materia donde aplicás todo: Patrones de diseño de arquitectura (MVC, Hexagonal, Clean Architecture), patrones GoF (Factory, Strategy, Observer, Decorator), principios SOLID y diseño orientado al dominio (DDD). El TP de desarrollo es exigente pero es el que más orgullo te da al terminar.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(21, 24, 7, 'Legislación: Contratos informáticos, propiedad intelectual y responsabilidad civil', 'Materia fundamental para cuando tenés que firmar un contrato de confidencialidad (NDA), saber quién es dueño del software que programás en tu horario laboral, cómo registrar propiedad intelectual en Argentina y la ley de protección de datos personales (LPDP).', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(22, 25, 9, 'ISW / Calidad: Métricas de software, deuda técnica y testing automatizado', 'Muchas veces se programa rápido para entregar y no se piensa en la mantenibilidad. En Calidad aprendés a medir complejidad ciclomática de McCabe, cobertura de tests, pruebas de carga con JMeter y frameworks de aseguramiento como ISO 25010 y CMMI.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(23, 26, 6, 'Redes de Datos: Laboratorios con Cisco Packet Tracer y Wireshark', 'Una de las materias más entretenidas de 4to año. Configurar routers, switches, VLANs, protocolos de enrutamiento dinámico (OSPF) y capturar paquetes reales con Wireshark para ver el handshake de 3 vías de TCP. Te da un panorama completísimo de networking.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(24, 27, 7, 'Investigación Operativa: Optimización matemática para toma de decisiones', 'Método Simplex tabular, análisis de dualidad y sensibilidad, modelos de transporte y asignación, y gestión de proyectos con camino crítico (PERT/CPM). La parte teórica de sensibilidad es la más tramposa en los parciales; practiquen mucho interpretar los precios sombra.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(25, 28, 8, 'Simulación: Modelado de sistemas complejos de colas y eventos discretos', 'Cuando los sistemas no se pueden resolver analíticamente por fórmulas matemáticas cerradas, recurrís a la simulación estocástica. Generación de números pseudoaleatorios, pruebas de bondad de ajuste (Chi-cuadrado, Kolmogorov-Smirnov) y simulación de colas múltiples.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(26, 30, 5, 'Administración de Sistemas (ADM): Gobierno de TI, COBIT e ITIL', 'Para quienes aspiran a roles de gestión, IT Management, CIO o consultoría estratégica. La materia enseña a alinear la tecnología con los objetivos estratégicos del negocio, gestión de riesgos tecnológicos y auditoría de sistemas.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(27, 31, 7, 'Inteligencia Artificial: Búsquedas heurísticas (A*), Minimax y Machine Learning', 'De las materias más vanguardistas de la carrera. Ver los algoritmos clásicos de búsqueda en espacios de estados, poda Alfa-Beta para juegos, y luego saltar a redes neuronales artificiales, árboles de decisión y clustering con scikit-learn. La clave para los parciales es entender la justificación teórica de por qué una heurística es admisible y cómo poda el árbol de búsqueda.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(28, 32, 8, 'Ciencia de Datos: El ciclo completo de EDA, pipelines y feature engineering', 'Análisis exploratorio de datos (EDA), limpieza de datasets con Pandas, imputación de valores faltantes, detección de outliers y modelado predictivo. Muy práctica, se trabaja con Jupyter Notebooks y datasets reales de Kaggle y organismos públicos.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(29, 35, 8, 'Seguridad en Sistemas: Criptografía, OWASP Top 10 y hardening', 'Criptografía simétrica (AES) y asimétrica (RSA, Curvas Elípticas), firmas digitales, certificados SSL/TLS y vulnerabilidades web típicas (SQL Injection, XSS, CSRF, IDOR). Toda persona que desarrolle software debería cursar esta materia para dejar de escribir código vulnerable.', 'Opinión', 4, '2026-09-26 10:00:00', '2026-09-26 10:00:00');

-- 6. COMENTARIOS Y DEBATES ANIDADOS (EXCLUSIVOS DEL EQUIPO)
INSERT INTO foro_comentarios (id, id_publicacion, id_usuario, contenido, votos, id_comentario_padre, createdAt, updatedAt)
VALUES
(1, 1, 5, 'Totalmente de acuerdo Franco. Yo la hice anual con Roberto y fue lo mejor que pude hacer. En el práctico te toman mucho teoremas aplicados (Rolle y Valor Medio entran seguro).', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(2, 1, 9, 'Tal cual, no se confíen con el primer parcial que parece fácil. El segundo parcial con integrales impropias y series te liquida si no practicaste de la guía oficial.', 3, 1, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(3, 1, 6, 'Sumo un tip: para el segundo parcial practiquen mucho sustitución trigonométrica y fracciones simples, entran dos ejercicios seguro en el práctico.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(4, 2, 7, 'GeoGebra es clave para entender rectas y planos en R3. Si no te hacés la imagen mental de la intersección es imposible plantear las ecuaciones.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(5, 2, 8, 'Exacto, y no memoricen fórmulas de memoria; entiendan de dónde sale la matriz de pasaje.', 2, 4, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(6, 2, 9, '¿Los profes siguen tomando demostraciones teóricas en los parciales prácticos?', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(7, 2, 5, 'Sí Lu, al menos una preguntita teórica de propiedades del producto mixto o condiciones de diagonalización te meten seguro.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(8, 3, 5, 'Confirmo rotundamente. El cálculo del error relativo y porcentual en el lab de péndulo simple te quita el sueño si lo dejás para la noche anterior a la entrega.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(9, 3, 7, 'Aparte los profes del laboratorio son re minuciosos con las cifras significativas. Si la balanza medía con un decimal, no pongan cuatro decimales en el informe jaja.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(10, 3, 6, 'Jajaja tal cual Franco, te tachan el informe entero por ese detalle.', 2, 9, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(11, 4, 8, 'Inducción matemática al principio marea con el paso inductivo, pero una vez que le agarrás la mano sale como chorizo. Muy linda materia.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(12, 4, 7, 'Y grafos es fundamental para cuando llegás a Inteligencia Artificial e Investigación Operativa.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(13, 5, 6, '¡Los famosos segmentation fault con punteros en C! Cuántas horas perdidas por no inicializar en NULL.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(14, 5, 5, 'Olvidate Tito, Valgrind y GDB son tus mejores amigos a partir de esta materia.', 3, 13, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(15, 5, 9, 'Un consejo para los ingresantes: hagan los ejercicios del práctico por su cuenta antes de ver la solución del profe.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(16, 6, 7, 'Para el parcial de ACO concéntrense en el pasaje de parámetros por pila (stack frame) con BP y SP, es donde más puntos restan.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(17, 6, 5, 'Exacto Franco, entender cómo se preservan los registros antes de llamar a una subrutina es fundamental.', 3, 16, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(18, 7, 6, 'Totalmente. El cursograma es super útil para detectar cuellos de botella en los circuitos administrativos.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(19, 8, 8, 'Lagrange para optimización con restricciones es pregunta fija de parcial.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(20, 8, 9, '¿Recomiendan algún libro en particular? Yo usé el Stewart y los gráficos en 3D explican 10 veces mejor que las filminas.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(21, 8, 7, 'El Stewart es la biblia de AM2 Lu, 100% recomendado.', 2, 20, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(22, 9, 6, 'Los circuitos de corriente alterna con fasores e impedancias al principio te queman la cabeza, pero después se vuelve muy mecánico.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(23, 10, 7, 'Coincido Lu, además es una materia accesible para promocionar si participás en clase y hacés un buen ensayo final.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(24, 11, 9, 'Para armar las tablas LL(1) y LR(1), asegúrense de calcular bien los conjuntos Primeros y Siguientes; si le erran en un Primero se arrastra el error a toda la tabla.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(25, 11, 8, '¡Tal cual Lu! Esas tablas son las que más tiempo llevan construir en los parciales.', 2, 24, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(26, 12, 5, 'Totalmente. Después de ver orden superior en Haskell, cuando volvés a JavaScript o Python y usás map/filter/reduce entendés todo mucho mejor.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(27, 12, 7, 'Prolog es el que más cuesta al principio con el backtracking y la unificación, pero para resolver problemas de lógica es magia pura.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(28, 13, 8, 'El consejo de oro: NUNCA dejen el TP para el último mes. Empiecen el protocolo de comunicación la primera semana porque coordinar con el grupo es el 50% de la nota.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(29, 13, 5, 'Exacto Tincho. Y hagan tests unitarios de cada módulo (Kernel, Memoria, CPU) por separado antes de integrarlos.', 3, 28, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(30, 13, 9, 'Para la parte teórica de SOP no dejen de repasar algoritmos de reemplazo de páginas (LRU, FIFO, Segunda Oportunidad) y anomalía de Belady.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(31, 14, 7, 'Recomiendo buscar una PYME de un familiar o conocido cercano que les dé acceso real a los empleados para hacer entrevistas. Empresas multinacionales casi nunca responden a tiempo.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(32, 14, 6, 'Y definan el alcance del sistema de entrada con los profes, no intenten modelar todo el negocio de la empresa porque no terminan más.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(33, 15, 8, 'Hagan una hoja de fórmulas prolija desde el primer día con las condiciones de cada distribución. Saber cuándo aproximar Binomial por Poisson salva notas.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(34, 16, 9, 'Es de las materias más accesibles del año para promocionar si le dedicás 2 horitas semanales a entender los gráficos de oferta y demanda.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(35, 17, 7, 'En las entrevistas técnicas te preguntan siempre la diferencia entre WHERE y HAVING, y cómo funcionan los JOINs internos. Esta materia te da las bases firmes.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(36, 17, 8, 'Totalmente Franco, y entender por qué no hay que desnormalizar prematuramente.', 2, 35, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(37, 18, 9, 'El mayor aprendizaje es que el código que no tiene tests y no pasa por revisión de pares termina rompiendo el build en integración continua jaja.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(38, 19, 6, 'Los cálculos de decibeles y relaciones señal a ruido al principio desconciertan, pero con la guía de ejercicios se saca adelante.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(39, 20, 8, 'Si entendés bien SOLID y cómo desacoplar componentes con interfaces, el coloquio final se aprueba con creces. Preguntan mucho la diferencia entre Strategy y State.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(40, 20, 9, 'Totalmente Tincho, y presten atención al diagrama de secuencia en el coloquio, les gusta pedir cambios en vivo para ver cómo adaptás el diseño.', 3, 39, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(41, 21, 5, 'Muy interesante los fallos judiciales sobre delitos informáticos y ciberestafas que analizamos en las clases prácticas.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(42, 22, 7, 'En Calidad de Software tienen que saber de memoria los atributos de calidad de la norma ISO 25010 y cómo redactar escenarios de calidad.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(43, 23, 5, 'Para el parcial de Redes hagan ejercicios de subnetting contrarreloj con lápiz y papel, porque en el examen no hay tiempo de dudar con las potencias de dos.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(44, 23, 6, 'Subnetting VLSM sale con fritas practicando mucho los cálculos de bits de host y bits de red.', 2, 43, '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(45, 24, 8, 'En la práctica usen LINGO o solvers de Python para chequear los resultados de los ejercicios que hagan a mano.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(46, 25, 7, 'Espectacular materia, y muy conectada con la toma de decisiones en industrias de logística y servicios.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(47, 26, 9, 'Los casos de estudio de empresas que fracasaron por mala gobernanza de TI te abren los ojos sobre la importancia de los procesos.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(48, 27, 6, 'La implementación del algoritmo A* con heurística admisible es de los ejercicios prácticos más lindos para programar.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(49, 27, 9, '¡Sí! Y los profes evalúan muy bien el criterio para justificar la elección de una heurística sobre otra.', 3, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(50, 28, 7, 'Fundamental dominar visualización con Seaborn y Matplotlib para saber comunicar los insights a los stakeholders.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(51, 29, 5, 'Los laboratorios de pentesting en entornos controlados te demuestran lo fácil que se puede vulnerar una aplicación si no sanitizás inputs.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(52, 29, 6, '¡Totalmente! Principio de menor privilegio y autenticación segura siempre.', 2, NULL, '2026-09-26 11:00:00', '2026-09-26 11:00:00');

-- 7. REACCIONES (LIKES) REGISTRADAS (EXCLUSIVAS DEL EQUIPO)
INSERT INTO foro_reacciones (id, id_publicacion, id_comentario, id_usuario, tipo, createdAt, updatedAt)
VALUES
(1, 1, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(2, 1, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(3, 1, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(4, 1, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(5, NULL, 1, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(6, NULL, 1, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(7, NULL, 2, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(8, NULL, 2, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(9, NULL, 2, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(10, NULL, 3, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(11, NULL, 3, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(12, 2, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(13, 2, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(14, 2, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(15, 2, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(16, NULL, 4, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(17, NULL, 4, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(18, NULL, 5, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(19, NULL, 5, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(20, NULL, 6, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(21, NULL, 6, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(22, NULL, 6, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(23, NULL, 7, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(24, NULL, 7, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(25, 3, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(26, 3, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(27, 3, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(28, 3, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(29, NULL, 8, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(30, NULL, 8, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(31, NULL, 9, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(32, NULL, 9, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(33, NULL, 10, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(34, NULL, 10, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(35, 4, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(36, 4, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(37, 4, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(38, 4, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(39, NULL, 11, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(40, NULL, 11, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(41, NULL, 11, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(42, NULL, 12, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(43, NULL, 12, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(44, 5, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(45, 5, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(46, 5, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(47, 5, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(48, NULL, 13, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(49, NULL, 13, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(50, NULL, 14, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(51, NULL, 14, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(52, NULL, 14, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(53, NULL, 15, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(54, NULL, 15, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(55, NULL, 15, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(56, 6, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(57, 6, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(58, 6, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(59, 6, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(60, NULL, 16, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(61, NULL, 16, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(62, NULL, 17, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(63, NULL, 17, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(64, NULL, 17, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(65, 7, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(66, 7, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(67, 7, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(68, 7, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(69, NULL, 18, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(70, NULL, 18, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(71, 8, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(72, 8, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(73, 8, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(74, 8, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(75, NULL, 19, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(76, NULL, 19, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(77, NULL, 19, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(78, NULL, 20, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(79, NULL, 20, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(80, NULL, 20, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(81, NULL, 21, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(82, NULL, 21, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(83, 9, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(84, 9, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(85, 9, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(86, 9, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(87, NULL, 22, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(88, NULL, 22, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(89, 10, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(90, 10, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(91, 10, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(92, 10, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(93, NULL, 23, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(94, NULL, 23, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(95, 11, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(96, 11, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(97, 11, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(98, 11, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(99, NULL, 24, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(100, NULL, 24, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(101, NULL, 24, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(102, NULL, 25, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(103, NULL, 25, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(104, 12, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(105, 12, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(106, 12, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(107, 12, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(108, NULL, 26, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(109, NULL, 26, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(110, NULL, 27, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(111, NULL, 27, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(112, 13, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(113, 13, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(114, 13, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(115, 13, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(116, NULL, 28, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(117, NULL, 28, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(118, NULL, 28, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(119, NULL, 29, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(120, NULL, 29, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(121, NULL, 29, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(122, NULL, 30, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(123, NULL, 30, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(124, NULL, 30, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(125, 14, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(126, 14, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(127, 14, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(128, 14, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(129, NULL, 31, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(130, NULL, 31, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(131, NULL, 32, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(132, NULL, 32, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(133, 15, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(134, 15, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(135, 15, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(136, 15, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(137, NULL, 33, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(138, NULL, 33, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(139, NULL, 33, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(140, 16, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(141, 16, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(142, 16, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(143, 16, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(144, NULL, 34, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(145, NULL, 34, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(146, NULL, 34, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(147, 17, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(148, 17, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(149, 17, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(150, 17, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(151, NULL, 35, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(152, NULL, 35, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(153, NULL, 36, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(154, NULL, 36, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(155, 18, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(156, 18, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(157, 18, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(158, 18, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(159, NULL, 37, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(160, NULL, 37, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(161, NULL, 37, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(162, 19, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(163, 19, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(164, 19, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(165, 19, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(166, NULL, 38, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(167, NULL, 38, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(168, 20, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(169, 20, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(170, 20, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(171, 20, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(172, NULL, 39, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(173, NULL, 39, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(174, NULL, 39, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(175, NULL, 40, 6, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(176, NULL, 40, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(177, NULL, 40, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(178, 21, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(179, 21, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(180, 21, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(181, 21, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(182, NULL, 41, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(183, NULL, 41, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(184, 22, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(185, 22, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(186, 22, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(187, 22, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(188, NULL, 42, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(189, NULL, 42, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(190, 23, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(191, 23, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(192, 23, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(193, 23, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(194, NULL, 43, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(195, NULL, 43, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(196, NULL, 44, 7, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(197, NULL, 44, 8, 'positivo', '2026-09-26 12:00:00', '2026-09-26 12:00:00'),
(198, 24, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(199, 24, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(200, 24, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(201, 24, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(202, NULL, 45, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(203, NULL, 45, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(204, NULL, 45, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(205, 25, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(206, 25, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(207, 25, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(208, 25, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(209, NULL, 46, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(210, NULL, 46, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(211, 26, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(212, 26, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(213, 26, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(214, 26, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(215, NULL, 47, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(216, NULL, 47, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(217, NULL, 47, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(218, 27, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(219, 27, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(220, 27, NULL, 8, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(221, 27, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(222, NULL, 48, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(223, NULL, 48, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(224, NULL, 49, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(225, NULL, 49, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(226, NULL, 49, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(227, 28, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(228, 28, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(229, 28, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(230, 28, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(231, NULL, 50, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(232, NULL, 50, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(233, 29, NULL, 5, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(234, 29, NULL, 6, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(235, 29, NULL, 7, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(236, 29, NULL, 9, 'positivo', '2026-09-26 10:00:00', '2026-09-26 10:00:00'),
(237, NULL, 51, 6, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(238, NULL, 51, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(239, NULL, 52, 5, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00'),
(240, NULL, 52, 7, 'positivo', '2026-09-26 11:00:00', '2026-09-26 11:00:00');

-- ==============================================
-- ACTIVIDADES PERSONALES (Usuarios 5 a 19)
-- ==============================================
INSERT INTO actividad (nombre, hora_inicio, duracion, dias, color, id_usuario) VALUES 
-- Usuario 5 (Francisco Funes)
('Gimnasio', '07:00', 90, 42, '#FF5733', 5),        -- Mar-Jue-Sáb
('Trabajo Part-time', '09:00', 240, 31, 'rgb(233, 199, 115)', 5), -- Lun a Vie

-- Usuario 6 (Tito Montivero)
('Entrenamiento de Fútbol', '19:30', 120, 10, '#28A745', 6), -- Mar-Jue
('Inglés Particular', '17:00:00', 60, 5, '#FFC107', 6),        -- Lun-Mié

-- Usuario 7 (Franco Sosa)
('Natación', '08:00', 60, 7, '#17A2B8', 7),           -- Lun-Mié-Vie
('Estudio Autónomo', '15:00', 120, 31, '#6C757D', 7),    -- Lun a Vie

-- Usuario 8 (Martin Sciarra)
('Gimnasio Noche', '21:00', 90, 21, '#E83E8C', 8),     -- Lun-Mié-Vie
('Curso de Backend', '10:00', 180, 32, '#6610F2', 8),   -- Sábados

-- Usuario 9 (Luciana Zahr)
('Taller de Arte', '16:00', 120, 8, '#FD7E14', 9),      -- Jueves
('Yoga', '08:30:00', 60, 10, '#20C997', 9),                -- Mar-Jue

-- Usuarios Iniciales (10 a 19)
('Gimnasio', '07:30', 60, 21, '#FF5733', 10),
('Trabajo Remoto', '13:00', 240, 31, '#007BFF', 11),
('Básquet', '20:00', 90, 10, '#DC3545', 12),
('Clases de Guitarra', '18:00', 60, 4, '#FFC107', 13),
('Gimnasio', '08:00', 90, 21, '#28A745', 14),
('Estudio de Algoritmos', '16:00', 120, 31, '#6F42C1', 15),
('Entrenamiento', '19:00', 90, 42, '#E83E8C', 16),
('Inglés C1', '11:00', 90, 5, '#17A2B8', 17),
('Trabajo', '14:00', 300, 31, '#343A40', 18),
('Gimnasio', '20:00', 60, 21, '#FD7E14', 19);

-- ==============================================
-- ACTIVIDADES DE CURSOS REGISTRADOS (Usuarios 5 a 19)
-- ==============================================
INSERT INTO actividad (nombre, hora_inicio, duracion, dias, color, id_usuario) VALUES 
-- Francisco Funes (id: 5) -> Cursos 14, 23, 33
('PPR2 - Tarde (Martes)', '14:00', 180, 2, '#4A90E2', 5),
('DSI3 - Tarde (Lun-Mie)', '16:00', 90, 5, '#4A90E2', 5),
('INT5 - Noche (Martes)', '18:00', 180, 2, '#4A90E2', 5),

-- Tito Montivero (id: 6) -> Cursos 15, 24, 34
('CDA3 - Noche (Lunes)', '20:00', 180, 1, '#4A90E2', 6),
('ANU3 - Mañana (Jueves)', '08:30', 180, 8, '#4A90E2', 6),
('CDA5 - Noche (Miércoles)', '18:00', 180, 4, '#4A90E2', 6),

-- Franco Sosa (id: 7) -> Cursos 16, 25, 35
('ASI2 - Tarde (Jueves)', '15:00', 180, 8, '#4A90E2', 7),
('ANU3 - Mañana (Jueves)', '08:30', 180, 8, '#4A90E2', 7),
('SGE5 - Mañana (Viernes)', '08:30', 180, 16, '#4A90E2', 7),

-- Martin Sciarra (id: 8) -> Cursos 17, 26, 36
('PRO2 - Mañana (Viernes)', '09:00', 180, 16, '#4A90E2', 8),
('SEM3 - Sábados', '08:00', 240, 32, '#4A90E2', 8),
('PFI5 - Sábados Taller', '09:00', 240, 32, '#4A90E2', 8),

-- Luciana Zahr (id: 9) -> Cursos 7, 11, 18
('MAT2 - Turno Mañana (Lun-Mie)', '08:00', 90, 5, '#4A90E2', 9),
('ISO2 - Noche (Miércoles)', '19:00', 180, 4, '#4A90E2', 9),
('ECO3 - Noche (Martes)', '18:30', 180, 2, '#4A90E2', 9),

-- Usuarios Ingresantes (10 a 19)
-- Usuario 10 (Cursos 1, 4, 8)
('MAT1 - Turno Mañana', '08:00', 90, 1, '#4A90E2', 10),
('ING - Sabatino', '09:00', 240, 32, '#4A90E2', 10),
('HIS1 - Noche Lun-Mie', '19:00', 90, 5, '#4A90E2', 10),

-- Usuario 11 (Cursos 1, 4, 9)
('MAT1 - Turno Mañana', '08:00', 90, 1, '#4A90E2', 11),
('ING - Sabatino', '09:00', 240, 32, '#4A90E2', 11),
('MAT2 - Turno Mañana (Lun-Mie)', '08:00', 90, 5, '#4A90E2', 11),

-- Usuario 12 (Cursos 2, 5, 8)
('MAT1 - Turno Tarde', '14:00', 90, 1, '#4A90E2', 12),
('LOG1 - Viernes Práctica', '14:00', 180, 16, '#4A90E2', 12),
('HIS1 - Noche Lun-Mie', '19:00', 90, 5, '#4A90E2', 12),

-- Usuario 13 (Cursos 2, 5, 10)
('MAT1 - Turno Tarde', '14:00', 90, 1, '#4A90E2', 13),
('LOG1 - Viernes Práctica', '14:00', 180, 16, '#4A90E2', 13),
('FIS2 - Turno Tarde (Mar-Jue)', '14:00', 90, 10, '#4A90E2', 13),

-- Usuario 14 (Cursos 3, 6, 8)
('MAT1 - Turno Noche', '19:30', 90, 4, '#4A90E2', 14),
('AED1 - Diario Mañana', '07:00', 60, 31, '#4A90E2', 14),
('HIS1 - Noche Lun-Mie', '19:00', 90, 5, '#4A90E2', 14),

-- Usuario 15 (Cursos 3, 6, 10)
('MAT1 - Turno Noche', '19:30', 90, 4, '#4A90E2', 15),
('AED1 - Diario Mañana', '07:00', 60, 31, '#4A90E2', 15),
('FIS2 - Turno Tarde (Mar-Jue)', '14:00', 90, 10, '#4A90E2', 15),

-- Usuario 16 (Cursos 1, 4, 11)
('MAT1 - Turno Mañana', '08:00', 90, 1, '#4A90E2', 16),
('ING - Sabatino', '09:00', 240, 32, '#4A90E2', 16),
('ISO2 - Noche (Miércoles)', '19:00', 180, 4, '#4A90E2', 16),

-- Usuario 17 (Cursos 2, 5, 12)
('MAT1 - Turno Tarde', '14:00', 90, 1, '#4A90E2', 17),
('LOG1 - Viernes Práctica', '14:00', 180, 16, '#4A90E2', 17),
('ING2 - Sábados', '09:00', 180, 32, '#4A90E2', 17),

-- Usuario 18 (Cursos 3, 6, 13)
('MAT1 - Turno Noche', '19:30', 90, 4, '#4A90E2', 18),
('AED1 - Diario Mañana', '07:00', 60, 31, '#4A90E2', 18),
('SSL2 - Mañana (Lunes)', '08:00', 180, 1, '#4A90E2', 18),

-- Usuario 19 (Cursos 1, 5, 8)
('MAT1 - Turno Mañana', '08:00', 90, 1, '#4A90E2', 19),
('LOG1 - Viernes Práctica', '14:00', 180, 16, '#4A90E2', 19),
('HIS1 - Noche Lun-Mie', '19:00', 90, 5, '#4A90E2', 19);