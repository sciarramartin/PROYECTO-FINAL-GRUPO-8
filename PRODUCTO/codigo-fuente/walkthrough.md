# Resumen de Implementación: Correlativas Avanzadas

¡La refactorización arquitectónica para soportar el régimen de correlatividades complejas de la facultad ha sido completada con éxito!

## 1. Migración de Base de Datos y Seed
- Se agregó el campo vital `tipo_requisito` a la tabla intermedia `correlativas_x_materia`.
- **Datos Reales:** Se reescribió por completo el script `seed-materias.js` para inyectar a la base de datos las **36 materias de Ingeniería en Sistemas** sacadas de tu Excel.
- Ahora, materias avanzadas como *Diseño de Sistemas* tienen registrados los requisitos mixtos exactos (Ej. Para cursar necesita Sintaxis Regular, pero para rendir necesita Algoritmos Aprobada).
- *Al reiniciar tu servidor backend local, la base de datos se reconstruirá automáticamente consumiendo esta nueva semilla.*

## 2. Refactorización del Backend
- Se ajustó el modelo Sequelize para mapear la tabla intermedia.
- Los endpoints de creación y edición de materias ahora leen y guardan un arreglo de objetos complejos (ej. `[{id: 1, tipo_requisito: 'regular'}]`).

## 3. Experiencia de Administrador (US-9)
- En la pantalla de **Registrar Correlativas**, la lista para seleccionar requisitos ahora es mucho más inteligente. Al tildar una materia, inmediatamente aparece un desplegable a su lado que permite definir si ese requisito es **Para Cursar (Regular)** o **Para Rendir (Aprobada)**.
- **Grafo Visual del Admin:** Ahora diferencia visualmente los requisitos:
  - Flechas **Sólidas gruesas y azules:** Exigen Aprobación final.
  - Flechas **Punteadas (dashed):** Solo exigen Regularidad.

## 4. Experiencia del Alumno (US-10)
- **Motor Matemático Realista:** La función `getEstadoCalculado()` en el Mapa de Correlatividades ahora distingue estrictamente entre los dos tipos de exigencias. El mapa ya no habilitará engañosamente un nodo si el estudiante debe un examen final que es un requisito fuerte.
- **Panel de Progreso Claro:** Al hacer clic en una materia, el panel de la derecha ahora divide las correlativas en dos bloques perfectamente señalizados:
  - *"Para cursar (Regular)"*
  - *"Para rendir final (Aprobada)"*
- El estudiante verá inmediatamente un `✅` o un `❌` al lado de cada materia dependiendo de si cumple ese requerimiento específico.
