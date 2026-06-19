# Guía de Integración - Módulo Foro Académico

Este documento detalla el funcionamiento, la estructura de la base de datos y los servicios (endpoints) del módulo de **Foro Académico** (US: Visualizar Foro de una Materia), permitiendo que otros miembros del equipo integren fácilmente sus respectivas historias de usuario.

---

## 🗄️ 1. Modelo de Datos y Estructura (Base de Datos SQLite)

El foro académico está compuesto por tres tablas principales en SQLite. Las asociaciones Sequelize ya se encuentran registradas en `backend/modelos/asociaciones.js`.

### Tabla: `foro_publicaciones` (Publicaciones principales)
Representa los hilos de discusión creados por los usuarios en el foro de cada materia.
*   **Campos**:
    *   `id` (INTEGER): Clave primaria, autoincremental.
    *   `id_materia` (INTEGER): FK referenciando a `materias(id)`.
    *   `id_usuario` (INTEGER): FK referenciando a `usuarios(id)`.
    *   `titulo` (TEXT): Título del hilo de discusión.
    *   `contenido` (TEXT): Cuerpo detallado del mensaje.
    *   `categoria` (TEXT): Categoría temática (`'General'`, `'Duda'`, `'Opinión'`, `'Recurso'`).
    *   `votos` (INTEGER): Contador acumulado de votos del post (por defecto `0`).
    *   `createdAt` / `updatedAt` (DATETIME): Marcas de tiempo de creación y modificación.

### Tabla: `foro_comentarios` (Respuestas)
Representa las respuestas o comentarios agregados por estudiantes o docentes a una publicación.
*   **Campos**:
    *   `id` (INTEGER): Clave primaria, autoincremental.
    *   `id_publicacion` (INTEGER): FK referenciando a `foro_publicaciones(id)`.
    *   `id_usuario` (INTEGER): FK referenciando a `usuarios(id)`.
    *   `contenido` (TEXT): Cuerpo del comentario.
    *   `createdAt` / `updatedAt` (DATETIME): Marcas de tiempo.

### Tabla: `foro_reacciones` (Votos individuales de usuarios)
Registra qué usuarios votaron positivo o negativo en cada publicación para evitar votos duplicados.
*   **Campos**:
    *   `id` (INTEGER): Clave primaria, autoincremental.
    *   `id_publicacion` (INTEGER): FK referenciando a `foro_publicaciones(id)`.
    *   `id_usuario` (INTEGER): FK referenciando a `usuarios(id)`.
    *   `tipo` (TEXT): Valor `'positivo'` o `'negativo'`.

---

## 🚀 2. Servicios Expuestos en el Backend (API)

Todos los servicios se encuentran en `backend/controladores/foro.controller.js`, bajo el prefijo `/api/foro`. Todos requieren autenticación mediante un token JWT enviado en la cabecera `Authorization: Bearer <token>`.

### Endpoint A: Obtener lista de materias con foros
*   **Método**: `GET`
*   **Ruta**: `/api/foro/materias`
*   **Descripción**: Devuelve todas las materias activas del sistema y cuenta cuántas publicaciones tiene cada una de forma dinámica.
*   **Formato de respuesta (JSON)**:
    ```json
    [
      {
        "id": 8,
        "codigo": "SYS1",
        "nombre": "Sistemas y Proceso de Negocios",
        "nivel_anio": 1,
        "cuatrimestre": 1,
        "cantPublicaciones": 4
      }
    ]
    ```

### Endpoint B: Obtener muro de publicaciones de un foro
*   **Método**: `GET`
*   **Ruta**: `/api/foro/materias/:materiaId/publicaciones`
*   **Descripción**: Devuelve los datos básicos de la materia consultada y un array de publicaciones ordenadas por fecha descendente (las más recientes primero). Incluye la información del autor (con su foto de perfil) y la cantidad de respuestas de cada publicación.
*   **Formato de respuesta (JSON)**:
    ```json
    {
      "materia": {
        "id": 8,
        "nombre": "Sistemas y Proceso de Negocios",
        "codigo": "SYS1"
      },
      "publicaciones": [
        {
          "id": 1,
          "titulo": "Duda sobre Teorema...",
          "contenido": "...",
          "categoria": "Duda",
          "votos": 18,
          "createdAt": "2026-06-03T17:00:00.000Z",
          "id_materia": 8,
          "cantComentarios": 2,
          "Autor": {
            "id": 2,
            "nombre": "Roberto",
            "apellido": "Cáceres",
            "nombre_usuario": "roberto_c",
            "id_tipo_usuario": 2,
            "Perfil": {
              "foto_perfil": null
            }
          }
        }
      ]
    }
    ```

### Endpoint C: Obtener detalle completo de un hilo (Post + Comentarios)
*   **Método**: `GET`
*   **Ruta**: `/api/foro/publicaciones/:postId`
*   **Descripción**: Obtiene los datos detallados de una publicación y todas sus respuestas asociadas ordenadas cronológicamente de forma ascendente (hilo de conversación natural).
*   **Formato de respuesta (JSON)**:
    ```json
    {
      "publicacion": {
        "id": 1,
        "titulo": "Duda sobre Teorema...",
        "contenido": "...",
        "votos": 18,
        "materia": { "id": 8, "nombre": "Sistemas y Proceso de Negocios" },
        "Autor": { "nombre": "Roberto", "apellido": "Cáceres" }
      },
      "comentarios": [
        {
          "id": 1,
          "contenido": "La condición de no negatividad...",
          "createdAt": "2026-06-03T17:15:00.000Z",
          "Autor": {
            "nombre": "Franco",
            "apellido": "Sosa"
          }
        }
      ]
    }
    ```

---

## 💻 3. Vistas y Componentes en el Frontend

La UI del foro está modularizada en tres componentes clave localizados en `frontend/src/components/us-foro/`:

1.  **`ListaForos.jsx` (Acceso principal)**:
    *   Muestra el listado de materias.
    *   Contiene la lógica de **búsqueda insensible a mayúsculas y acentos**. Esto se realiza normalizando el texto de entrada y comparando con `normalizarTexto()`.
2.  **`MuroForo.jsx` (Foro de la materia)**:
    *   Muestra las publicaciones del foro de la materia seleccionada.
    *   Tiene adaptaciones responsivas para el botón `"Ordenar por: Relevancia"` y las pestañas de filtrado (uso de scroll horizontal y propiedad `shrink-0` para prevenir solapamientos).
    *   Implementa un diseño simétrico con Flexbox en su estado vacío (`No existen publicaciones`).
3.  **`DetallePublicacion.jsx` (Vista del hilo)**:
    *   Permite leer la publicación completa, sus estadísticas e información extendida en el sidebar derecho, y la lista completa de comentarios del hilo.

---

## 📝 4. Recetario de Integración para tus Compañeros

A continuación se detalla cómo los desarrolladores de otras US pueden enganchar sus códigos en esta base:

### US: Crear Publicación en el Foro
1.  **Backend**: Deben agregar una ruta `POST /api/foro/publicaciones` en `foro.controller.js`:
    ```javascript
    router.post('/publicaciones', verificarToken, async (req, res) => {
        try {
            const { id_materia, titulo, contenido, categoria } = req.body;
            const nuevoPost = await ForoPublicacion.create({
                id_materia,
                id_usuario: req.usuario.id, // ID del JWT verificado
                titulo,
                contenido,
                categoria
            });
            res.status(201).json(nuevoPost);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear publicación' });
        }
    });
    ```
2.  **Frontend**: En `MuroForo.jsx` (línea 154), deben habilitar el botón `"Crear publicación"` (que actualmente muestra un mensaje de alerta de prueba) para abrir un modal con el formulario de creación, y llamar a este endpoint POST.

### US: Comentar Publicación
1.  **Backend**: Deben agregar la ruta `POST /api/foro/comentarios` en `foro.controller.js`:
    ```javascript
    router.post('/comentarios', verificarToken, async (req, res) => {
        try {
            const { id_publicacion, contenido } = req.body;
            const nuevoComentario = await ForoComentario.create({
                id_publicacion,
                id_usuario: req.usuario.id,
                contenido
            });
            res.status(201).json(nuevoComentario);
        } catch (error) {
            res.status(500).json({ error: 'Error al comentar' });
        }
    });
    ```
2.  **Frontend**: En `DetallePublicacion.jsx`, deben habilitar el `<textarea>` (línea 283) y el botón `"Publicar comentario"` (línea 293) para que capturen el texto e invoquen a esta ruta POST. Luego, deben actualizar el array local de comentarios (`comentarios`) para mostrar la respuesta inmediatamente.

### US: Reaccionar y Votar (Publicaciones o Comentarios)
1.  **Backend**: Crear rutas para registrar las reacciones del usuario en `foro.controller.js` actualizando simultáneamente el acumulador en la base de datos:
    ```javascript
    router.post('/publicaciones/:postId/votar', verificarToken, async (req, res) => {
        const { tipo } = req.body; // 'positivo' o 'negativo'
        const id_usuario = req.usuario.id;
        // Registrar en foro_reacciones y sumar/restar en foro_publicaciones(votos)
    });
    ```
2.  **Frontend**: En las flechas de votos de `MuroForo.jsx` y `DetallePublicacion.jsx`, vincular los clicks de las flechas arriba/abajo a este endpoint y actualizar el contador numérico visualmente.

### US: Ordenar Publicaciones
1.  **Frontend**: En `MuroForo.jsx` (línea 171 en adelante), vincular las pestañas ("Más recientes", "Más votadas", "Relevancia") para cambiar un estado local `ordenFiltro`.
2.  **Backend**: Soportar un parámetro en la URL en el Endpoint B para ordenar según la selección:
    *   Si es `?orden=recientes`, usar `order: [['createdAt', 'DESC']]`.
    *   Si es `?orden=votos`, usar `order: [['votos', 'DESC']]`.
