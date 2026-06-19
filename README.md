# Proyecto Final - ISI
Plataforma centralizada y académica para la organización horaria, gestión de progreso académico e intercambio colaborativo entre estudiantes.

---

## 📋 Listado de Historias de Usuario (User Stories) Completadas

### 🎓 Módulo de Gestión de Cursada y Avance Académico
* **US-09: Registrar Correlativas**
  * Definición y asociación de materias correlativas desde el backend y base de datos.
* **US-10: Consultar Correlativas**
  * Grafo interactivo en el frontend para visualizar las correlativas de cada materia de forma intuitiva.
  * Distinción visual y lógica entre correlativas fuertes (para cursar) y débiles (para rendir).
  * Renderizado optimizado con Lazy Loading y diseño responsive para dispositivos móviles.
* **SCRUM-53: Layout y Cierre de Sesión**
  * Ajustes de desbordamientos en la barra de navegación responsive en dispositivos móviles.
  * Cierre seguro de sesión forzando limpieza de sockets e invalidación de credenciales del navegador.
* **SCRUM-54: Múltiples Planes por Carrera**
  * Aislamiento del progreso académico y correlativas de cada alumno según su plan de estudios específico (ej. Plan 2008 vs. Plan 2023).
  * Selector dinámico de plan académico en la vista de "Mi Progreso".
* **SCRUM-55: Carga de Progreso por Plan**
  * Carga dinámica del mapa de correlativas y progreso según plan de estudios.

### 📅 Módulo de Planificación Horaria
* **US-07: Generar Planificación Horaria Inteligente**
  * Algoritmo inteligente que sugiere combinaciones de horarios sin solapamientos.
  * Carga automática de materias disponibles para el estudiante basada en su historial.
  * Configuración y filtros de comisiones y turnos.
* **US-08: Registrar Actividades Personales**
  * Agenda interactiva para registrar actividades extracurriculares con validación de superposición horaria con las asignaturas cursadas.

### 🔐 Módulo de Sesión y Perfil de Usuario
* **US-01: Registrar Usuario**
  * Registro de nuevos alumnos asignando carrera, plan académico inicial y año de ingreso.
* **US-02: Iniciar Sesión**
  * Autenticación segura mediante JSON Web Tokens (JWT).
* **US-03: Editar Perfil Académico**
  * Carga y edición de avatar de perfil (formato Base64) y datos de contacto del estudiante.
* **Recuperación de Contraseña**
  * Sistema de envío de tokens de validación a través de correo electrónico.
* **Diseño y Accesibilidad**
  * Soporte de temas Claro/Oscuro (dark mode toggle) y diseño adaptativo general.

### 💬 Módulo de Colaboración y Red Social
* **US-11: Conectar con Estudiantes**
  * Envío, aceptación o rechazo de solicitudes de amistad con notificaciones visuales en tiempo real.
* **US-12: Crear Grupo y Chat**
  * Mensajería privada y grupal en tiempo real a través de WebSockets (Socket.io).
  * Notificaciones de nuevos mensajes.
  * Gestión de grupos (agregar/eliminar amigos del grupo, y configuración de miembros).

### 📣 Módulo de Foro de Consultas de Cátedras
* **US-46: Visualizar Foro / Crear Publicaciones**
  * Creación y visualización del muro de foros específico para cada asignatura.
* **US-47: Comentarios de Publicación**
  * Soporte de hilos de comentarios y respuestas anidadas en árbol (Reddit-style) para discusiones estructuradas.
* **US-48: Reaccionar a Publicaciones y Comentarios**
  * Sistema de votación positivo/negativo con control de voto único por usuario en la base de datos.
* **US-49: Editar Publicación Propia**
  * Edición inline disponible únicamente durante los primeros 10 minutos desde la creación de la publicación.
* **US-50: Eliminar Publicación Propia**
  * Sistema de eliminación con confirmación gráfica y baja lógica (soft delete) en la base de datos mediante Sequelize `paranoid`.
* **Filtros de Ordenamiento**
  * Filtros dinámicos en el muro de la materia para ordenar publicaciones por "Más recientes" o "Más votadas/Relevancia".
