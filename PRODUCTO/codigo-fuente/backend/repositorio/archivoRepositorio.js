// repositorio/archivoRepositorio.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

// Tipos de archivo permitidos
const TIPOS_PERMITIDOS = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Carpeta raíz donde se guardan los archivos
const CARPETA_BASE = path.join(__dirname, '..', 'repositorio', 'materiales');

// Asegura que la carpeta de destino exista
function asegurarCarpeta(rutaCarpeta) {
    if (!fs.existsSync(rutaCarpeta)) {
        fs.mkdirSync(rutaCarpeta, { recursive: true });
    }
}

// Genera subcarpeta por año/mes para no saturar un solo directorio
function obtenerSubcarpetaPorFecha() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    return path.join(CARPETA_BASE, String(anio), mes);
}

// Genera un nombre de archivo único preservando la extensión original
function generarNombreUnico(nombreOriginal) {
    const extension = path.extname(nombreOriginal).toLowerCase();
    return `${uuidv4()}${extension}`;
}

// Configuración de almacenamiento de Multer
const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        const carpetaDestino = obtenerSubcarpetaPorFecha();
        asegurarCarpeta(carpetaDestino);
        cb(null, carpetaDestino);
    },
    filename: (req, file, cb) => {
        const nombreUnico = generarNombreUnico(file.originalname);
        cb(null, nombreUnico);
    }
});

// Filtro de tipos de archivo
function filtroDeArchivos(req, file, cb) {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }
}

// Instancia de Multer lista para usar como middleware
const subirArchivo = multer({
    storage: almacenamiento,
    fileFilter: filtroDeArchivos,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB máximo
    }
});

// Devuelve la ruta relativa que se guarda en la BD
// Ej: "materiales/2024/06/abc123.pdf"
function obtenerRutaRelativa(rutaAbsoluta) {
    return path.relative(path.join(__dirname, '..', 'repositorio'), rutaAbsoluta);
}

// Devuelve la ruta absoluta a partir de la relativa guardada en la BD
function obtenerRutaAbsoluta(ubicacion) {
    return path.join(__dirname, '..', 'repositorio', ubicacion);
}

// Elimina un archivo del repositorio dado su ubicacion relativa
function eliminarArchivo(ubicacion) {
    const rutaAbsoluta = obtenerRutaAbsoluta(ubicacion);
    if (fs.existsSync(rutaAbsoluta)) {
        fs.unlinkSync(rutaAbsoluta);
        return true;
    }
    return false;
}

// Verifica si un archivo existe en el repositorio
function archivoExiste(ubicacion) {
    return fs.existsSync(obtenerRutaAbsoluta(ubicacion));
}

module.exports = {
    subirArchivo,
    obtenerRutaRelativa,
    obtenerRutaAbsoluta,
    eliminarArchivo,
    archivoExiste,
    CARPETA_BASE
};