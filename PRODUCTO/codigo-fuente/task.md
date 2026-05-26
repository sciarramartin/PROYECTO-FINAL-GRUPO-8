# Tareas de Implementación (Correlativas Complejas)

- `[x]` Modificaciones de Base de Datos
  - `[x]` Actualizar `backend/database/schema.sql` agregando `tipo_requisito` a `correlativas_x_materia`.
  - `[x]` Reescribir `backend/database/seed.sql` con las 36 materias del Excel y sus relaciones clasificadas.
  - `[x]` Ejecutar el comando para reconstruir la base de datos a partir del nuevo schema y seed.
- `[x]` Modificaciones en Modelos y API
  - `[x]` Actualizar `backend/modelos/materia.modelo.js` para usar la tabla intermedia adecuadamente con el campo extra.
  - `[x]` Modificar `backend/servicios/materia.servicio.js` para soportar la inserción y lectura de `tipo_requisito`.
- `[x]` Modificaciones Frontend (Admin: Registrar Correlativas)
  - `[x]` Actualizar `ABMMateria.jsx` (formulario) para permitir elegir entre "Cursar (Regular)" y "Aprobar (Final)".
  - `[x]` Actualizar `GrafoCorrelativas.jsx` para pintar flechas distintas según el tipo de requisito.
- `[x]` Modificaciones Frontend (Alumno: Consultar Correlativas)
  - `[x]` Modificar `MapaCorrelatividades.jsx` para evaluar la condición `tipo_requisito` en el cálculo de `Habilitada`.
  - `[x]` Modificar el panel flotante lateral para dividir los requisitos en dos listas visuales (Cursar vs Aprobar).
- `[x]` Testeo final y artefacto Walkthrough.
