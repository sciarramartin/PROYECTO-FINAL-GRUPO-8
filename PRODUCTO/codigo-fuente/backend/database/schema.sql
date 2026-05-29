PRAGMA foreign_keys = ON;

-- =========================
-- TIPOS DE USUARIO
-- =========================

CREATE TABLE tipos_usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

-- =========================
-- CARRERAS
-- =========================

CREATE TABLE carreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    facultad TEXT NOT NULL
);

-- =========================
-- USUARIOS
-- =========================

CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    mail TEXT NOT NULL UNIQUE,
    contraseña TEXT NOT NULL,

    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,

    nombre_usuario TEXT NOT NULL UNIQUE,

    anio_ingreso INTEGER,

    id_carrera INTEGER NOT NULL,
    id_tipo_usuario INTEGER NOT NULL,

    reset_token TEXT,
    reset_token_expira DATETIME,

    FOREIGN KEY (id_carrera)
        REFERENCES carreras(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (id_tipo_usuario)
        REFERENCES tipos_usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================
-- MATERIAS
-- =========================

CREATE TABLE materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    codigo TEXT NOT NULL UNIQUE,

    nombre TEXT NOT NULL,

    nivel_anio INTEGER NOT NULL,

    cuatrimestre INTEGER NOT NULL,
    
    visible_en_grafo BOOLEAN NOT NULL DEFAULT 1,

    id_carrera INTEGER,

    FOREIGN KEY (id_carrera)
        REFERENCES carreras(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- =========================
-- CORRELATIVAS
-- =========================

CREATE TABLE correlativas_x_materia (

    materia_base_id INTEGER NOT NULL,

    materia_correlativa_id INTEGER NOT NULL,
    
    tipo_requisito TEXT NOT NULL DEFAULT 'regular', -- Puede ser 'regular' o 'aprobada'

    PRIMARY KEY (
        materia_base_id,
        materia_correlativa_id
    ),

    FOREIGN KEY (materia_base_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (materia_correlativa_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    duracion INTEGER NOT NULL,
    dias INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT '#C5E99B',
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- CURSOS
-- =========================

CREATE TABLE cursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hora_inicio TEXT NOT NULL,
    duracion INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    dias INTEGER NOT NULL DEFAULT 0,
    id_materia INTEGER NOT NULL,
    FOREIGN KEY (id_materia)
        REFERENCES materias(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =========================
-- ESTADO MATERIA ALUMNO
-- =========================

CREATE TABLE estado_materia_alumno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_materia INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'No Cursada',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_materia) REFERENCES materias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(id_usuario, id_materia)
);

-- =========================
-- tabla alumno x curso
-- =========================

CREATE TABLE inscripciones_cursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    fecha_inscripcion TEXT NOT NULL DEFAULT 'No Cursada',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES cursos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(id_usuario, id_curso)
);
