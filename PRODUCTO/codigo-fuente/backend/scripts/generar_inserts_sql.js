// PRODUCTO/codigo-fuente/backend/scripts/generar_inserts_sql.js
const { baseDeDatos } = require('../database/base-de-datos');
const fs = require('fs');
const path = require('path');

async function main() {
    await baseDeDatos.authenticate();
    
    // Obtener usuarios nuevos (id >= 5)
    const [usuarios] = await baseDeDatos.query('SELECT * FROM usuarios WHERE id >= 5 ORDER BY id');
    
    // Obtener perfiles nuevos (id_usuario >= 3)
    const [perfiles] = await baseDeDatos.query('SELECT * FROM perfiles WHERE id_usuario >= 3 ORDER BY id_usuario');
    
    // Obtener materiales nuevos (id >= 4)
    const [materiales] = await baseDeDatos.query('SELECT * FROM materiales_estudio WHERE id >= 4 ORDER BY id');
    
    // Obtener publicaciones nuevas (id >= 5)
    const [publicaciones] = await baseDeDatos.query('SELECT * FROM foro_publicaciones WHERE id >= 5 ORDER BY id');
    
    // Obtener comentarios nuevos (id >= 5)
    const [comentarios] = await baseDeDatos.query('SELECT * FROM foro_comentarios WHERE id >= 5 ORDER BY id');
    
    // Obtener reacciones nuevas
    const [reacciones] = await baseDeDatos.query('SELECT * FROM foro_reacciones ORDER BY id');

    let sql = '\n\n-- ===============================================================\n';
    sql += '-- DATOS DE SIMULACIÓN (EQUIPO, VISITANTES, MATERIALES Y FORO)\n';
    sql += '-- ===============================================================\n\n';

    // 1. USUARIOS NUEVOS
    sql += '-- 1. USUARIOS DEL EQUIPO (5) Y VISITANTES EVALUADORES (10)\n';
    sql += 'INSERT INTO usuarios (id, mail, contraseña, nombre, apellido, nombre_usuario, anio_ingreso, id_carrera, id_tipo_usuario, id_plan_academico)\nVALUES\n';
    sql += usuarios.map(u => 
        `(${u.id}, '${u.mail}', '${u.contraseña}', '${u.nombre}', '${u.apellido}', '${u.nombre_usuario}', ${u.anio_ingreso}, ${u.id_carrera}, ${u.id_tipo_usuario}, ${u.id_plan_academico})`
    ).join(',\n') + ';\n\n';

    // 2. PERFILES NUEVOS
    sql += '-- 2. PERFILES DE USUARIOS\n';
    sql += 'INSERT INTO perfiles (id_usuario, apodo, anio_cursado, biografia, foto_perfil, rol_equipo, mostrar_anio_cursado, mostrar_contacto)\nVALUES\n';
    sql += perfiles.map(p => 
        `(${p.id_usuario}, '${p.apodo || ''}', ${p.anio_cursado || 1}, '${(p.biografia || '').replace(/'/g, "''")}', '${p.foto_perfil || '🎓'}', '${p.rol_equipo || 'Alumno'}', 1, 1)`
    ).join(',\n') + ';\n\n';

    // 3. MATERIALES DE ESTUDIO
    sql += '-- 3. MATERIALES DE ESTUDIO REALES (24 ARCHIVOS)\n';
    sql += 'INSERT INTO materiales_estudio (id, ubicacion, id_materia, id_usuario, titulo, etiquetas, fecha_de_publicacion, likes, descargas)\nVALUES\n';
    sql += materiales.map(m => 
        `(${m.id}, '${m.ubicacion.replace(/'/g, "''")}', ${m.id_materia}, ${m.id_usuario}, '${m.titulo.replace(/'/g, "''")}', '${m.etiquetas.replace(/'/g, "''")}', '${m.fecha_de_publicacion || '2026-09-25 14:30:00'}', ${m.likes}, ${m.descargas})`
    ).join(',\n') + ';\n\n';

    // 4. FORO PUBLICACIONES
    sql += '-- 4. PUBLICACIONES DEL FORO (OPINIONES EN >70% DE MATERIAS)\n';
    sql += 'INSERT INTO foro_publicaciones (id, id_materia, id_usuario, titulo, contenido, categoria, votos, createdAt, updatedAt)\nVALUES\n';
    sql += publicaciones.map(pub => 
        `(${pub.id}, ${pub.id_materia}, ${pub.id_usuario}, '${pub.titulo.replace(/'/g, "''")}', '${pub.contenido.replace(/'/g, "''")}', '${pub.categoria}', ${pub.votos}, '${pub.createdAt}', '${pub.updatedAt}')`
    ).join(',\n') + ';\n\n';

    // 5. FORO COMENTARIOS
    sql += '-- 5. COMENTARIOS Y DEBATES ANIDADOS\n';
    sql += 'INSERT INTO foro_comentarios (id, id_publicacion, id_usuario, contenido, votos, id_comentario_padre, createdAt, updatedAt)\nVALUES\n';
    sql += comentarios.map(c => 
        `(${c.id}, ${c.id_publicacion}, ${c.id_usuario}, '${c.contenido.replace(/'/g, "''")}', ${c.votos}, ${c.id_comentario_padre !== null ? c.id_comentario_padre : 'NULL'}, '${c.createdAt}', '${c.updatedAt}')`
    ).join(',\n') + ';\n\n';

    // 6. FORO REACCIONES
    sql += '-- 6. REACCIONES REGISTRADAS (LIKES)\n';
    sql += 'INSERT INTO foro_reacciones (id, id_publicacion, id_comentario, id_usuario, tipo, createdAt, updatedAt)\nVALUES\n';
    sql += reacciones.map(r => 
        `(${r.id}, ${r.id_publicacion !== null ? r.id_publicacion : 'NULL'}, ${r.id_comentario !== null ? r.id_comentario : 'NULL'}, ${r.id_usuario}, '${r.tipo}', '${r.createdAt}', '${r.updatedAt}')`
    ).join(',\n') + ';\n\n';

    const seedPath = path.join(__dirname, '../database/seed.sql');
    fs.appendFileSync(seedPath, sql);
    console.log('SQL generado y anexado a seed.sql exitosamente!');
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
