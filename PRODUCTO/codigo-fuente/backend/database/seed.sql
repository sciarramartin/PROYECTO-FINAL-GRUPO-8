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
    '$2b$10$hash_falso',
    'Administrador',
    'Sistema',
    'admin',
    2024,
    1,
    3
),
(
    'alumno@test.com',
    '$2b$10$hash_falso',
    'Juan',
    'Perez',
    'jperez',
    2024,
    1,
    1
);

-- =========================
-- MATERIAS
-- =========================

INSERT INTO materias (
    codigo,
    nombre,
    nivel_anio,
    cuatrimestre
)
VALUES
(
    'MAT101',
    'Matemática I',
    1,
    1
),
(
    'PROG101',
    'Programación I',
    1,
    1
);

-- =========================
-- CORRELATIVAS
-- =========================

INSERT INTO correlativas_x_materia (
    materia_base_id,
    materia_correlativa_id
)
VALUES
(
    2,
    1
);


