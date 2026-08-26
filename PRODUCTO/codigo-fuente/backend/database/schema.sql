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
-- PLANES ACADEMICOS
-- =========================

CREATE TABLE planes_academicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    id_carrera INTEGER NOT NULL,
    FOREIGN KEY (id_carrera)
        REFERENCES carreras(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
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
    id_plan_academico INTEGER,

    reset_token TEXT,
    reset_token_expira DATETIME,

    FOREIGN KEY (id_carrera)
        REFERENCES carreras(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (id_tipo_usuario)
        REFERENCES tipos_usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (id_plan_academico)
        REFERENCES planes_academicos(id)
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
    id_plan_academico INTEGER,

    FOREIGN KEY (id_carrera)
        REFERENCES carreras(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    FOREIGN KEY (id_plan_academico)
        REFERENCES planes_academicos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
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
-- AMISTADES
-- =========================
CREATE TABLE amistades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario_origen INTEGER NOT NULL,
    id_usuario_destino INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_origen) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- PERFILES
-- =========================
CREATE TABLE perfiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL UNIQUE,
    apodo TEXT,
    anio_cursado INTEGER,
    biografia TEXT,
    foto_perfil TEXT,
    link_discord TEXT,
    link_telegram TEXT,
    link_whatsapp TEXT,
    link_github TEXT,
    link_linkedin TEXT,
    intereses TEXT,
    rol_equipo TEXT,
    mostrar_anio_cursado INTEGER DEFAULT 1,
    mostrar_contacto INTEGER DEFAULT 1,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- GRUPOS
-- =========================
CREATE TABLE grupos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    id_creador INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'publico',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_creador) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- GRUPO MIEMBROS
-- =========================
CREATE TABLE grupo_miembros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_grupo INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    rol TEXT NOT NULL DEFAULT 'miembro',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_grupo) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- GRUPO MENSAJES
-- =========================
CREATE TABLE grupo_mensajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_grupo INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_grupo) REFERENCES grupos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- MENSAJES PRIVADOS
-- =========================
CREATE TABLE mensaje_privados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_remitente INTEGER NOT NULL,
    id_destinatario INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    leido INTEGER DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_remitente) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- PUBLICACIONES DE FORO
-- =========================
CREATE TABLE foro_publicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_materia INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    --id_autor INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    categoria TEXT DEFAULT 'General', -- 'Duda', 'Opinión', 'Recurso', etc.
    votos INTEGER DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedAt DATETIME,
    FOREIGN KEY (id_materia) REFERENCES materias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- COMENTARIOS DE FORO
-- =========================
CREATE TABLE foro_comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_publicacion INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    contenido TEXT NOT NULL,
    votos INTEGER DEFAULT 0,
    id_comentario_padre INTEGER DEFAULT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES foro_publicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_comentario_padre) REFERENCES foro_comentarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- REACCIONES DE FORO (Para compatibilidad con otras US)
-- =========================
CREATE TABLE foro_reacciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_publicacion INTEGER,
    id_comentario INTEGER,
    id_usuario INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'positivo' o 'negativo'
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES foro_publicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_comentario) REFERENCES foro_comentarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(id_publicacion, id_usuario),
    UNIQUE(id_comentario, id_usuario)
);


-- =========================
-- MATERIALES DE ESTUDIO
-- =========================
CREATE TABLE materiales_estudio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ubicacion TEXT NOT NULL,
    id_materia INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    etiquetas TEXT,
    id_usuario INTEGER NOT NULL,
    fecha_de_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    descargas INTEGER DEFAULT 0,
    FOREIGN KEY (id_materia) REFERENCES materias(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
);
