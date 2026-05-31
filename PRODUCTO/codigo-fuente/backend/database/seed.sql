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
    id_tipo_usuario
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
    3
),
(
    'alumno@test.com',
    '$2b$10$x9AoHfbl4GuyGPZT8PJ7MeL1DvG/vFN1QFB9a7zfkD59bs61/T4f6',
    'Juan',
    'Perez',
    'jperez',
    2024,
    1,
    1
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

-- ===============================================================
-- PERFILES DE USUARIOS SEED
-- ===============================================================
INSERT INTO perfiles (id_usuario, apodo, anio_cursado, biografia, foto_perfil, rol_equipo, mostrar_anio_cursado, mostrar_contacto)
VALUES 
(1, 'Admin', 5, 'Administrador del sistema.', '💻', 'Admin', 1, 1),
(2, 'Juancho', 2, 'Estudiante de Ingeniería en Sistemas.', '🎓', 'Miembro', 1, 1);

