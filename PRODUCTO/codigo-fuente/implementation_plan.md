# Plan de Implementación: Sistema Avanzado de Correlatividades

Este plan detalla los pasos para migrar el sistema actual de correlativas simples a un sistema complejo basado en el Excel de la carrera (distinguiendo entre requisitos de regularidad y requisitos de aprobación final).

## Cambios en la Base de Datos y Modelos

### `backend/database/schema.sql`
- **[MODIFY]**: Actualizar la tabla `correlativas_x_materia` para agregar la columna `tipo_requisito TEXT NOT NULL DEFAULT 'regular'`. (Valores posibles: `'regular'`, `'aprobada'`).

### `backend/database/seed.sql`
- **[MODIFY]**: Eliminar los datos de prueba actuales.
- Insertar las **36 materias** exactas extraídas del Excel (Análisis Matemático I, Álgebra, etc.) con sus códigos, niveles y modalidades.
- Insertar todas las relaciones en `correlativas_x_materia` especificando si son `regular` o `aprobada`.

### `backend/modelos/materia.modelo.js`
- **[MODIFY]**: Crear el modelo intermedio explícito `CorrelativaXMateria` para mapear la columna `tipo_requisito` en Sequelize, y usarlo en las asociaciones `belongsToMany`.

## Cambios en el Backend (API)

### `backend/servicios/materia.servicio.js`
- **[MODIFY]**: Refactorizar `crearMateria` y `actualizarMateria` para que reciban un arreglo de objetos complejos `[{ id: 1, tipo_requisito: 'regular' }]` en lugar del arreglo simple actual `[1, 2]`. 
- Asegurarnos de que el método `obtenerTodas` incluya la tabla intermedia (`through`) al devolver las correlativas para que el frontend pueda leer el `tipo_requisito`.

## Cambios en el Frontend

### `frontend/src/components/Us-9-Registrar-Correlativas/index.jsx` (Admin)
- **[MODIFY]**: Actualizar el formulario (ABM). La lista de checkboxes para elegir correlativas pasará a tener un pequeño selector (Dropdown o Radio) al lado de cada materia seleccionada para elegir si el requisito es "Para Cursar (Regular)" o "Para Rendir (Aprobada)".
- Modificar el estado `formData.correlativas` para guardar objetos `{id, tipo_requisito}`.

### `frontend/src/components/Us-9-Registrar-Correlativas/GrafoCorrelativas.jsx`
- **[MODIFY]**: Diferenciar visualmente las flechas. Por ejemplo, flechas continuas y fuertes para correlativas "Aprobadas", y flechas punteadas (dashed) para correlativas "Regulares".

### `frontend/src/components/US-10-Consultar-correlativas/MapaCorrelatividades.jsx` (Alumno)
- **[MODIFY]**: Actualizar la función `getEstadoCalculado()`. 
  - Iterar sobre las correlativas evaluando `req.correlativas_x_materia.tipo_requisito`.
  - Si pide `'aprobada'`, verificar que el alumno tenga estado `Aprobada`.
  - Si pide `'regular'`, verificar que el alumno tenga estado `Aprobada` o `Regular`.
- **[MODIFY]**: En el panel lateral de detalles, separar las correlativas en dos listas claras: "Requisitos para Cursar" y "Requisitos para Aprobar".

## User Review Required

> [!IMPORTANT]
> Este cambio es profundo ya que altera la base de datos (Schema y Seeds), la API y las dos pantallas principales.
> ¿Estás de acuerdo con este plan arquitectónico? Si lo apruebas, procederé a reescribir la Seed con las materias de Sistemas y ejecutaré todas estas modificaciones paso a paso.
