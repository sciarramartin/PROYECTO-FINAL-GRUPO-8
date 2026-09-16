# 📋 Registro de Daily Scrum Asincrónico • Sprint 5

**Universidad Tecnológica Nacional — Facultad Regional Córdoba**  
**Carrera:** Ingeniería en Sistemas de Información  
**Cátedra:** Proyecto Final (2026)  
**Proyecto:** *Campus UTN — Plataforma Académica y de Colaboración Universitaria*  
**Período del Sprint 5:** 18 de Agosto de 2026 al 01 de Septiembre de 2026  

---

## 👥 Equipo de Desarrollo y Roles

* **Martín Sciarra:** Desarrollador Fullstack / Responsable de Módulo de Inteligencia Artificial (RAG).
* **Tito Montivero:** Desarrollador Fullstack / Administrador de Base de Datos y Coordinación.
* **Franco Sosa:** Desarrollador Frontend / Módulo de Foros e Interacciones.
* **Luciana Zahr:** Desarrolladora Frontend / Módulo de Perfiles, Reseñas y Testing de Usabilidad.
* **Francisco Funes:** Desarrollador / Responsable de Calidad (QA), Métricas e Informes de Sprint.

---

## 🎯 Metodología del Daily Asincrónico

El equipo implementó un esquema de **Daily Scrum Asincrónico** mediante canales de comunicación directa (WhatsApp / Discord), complementado con reuniones sincrónicas de planificación y revisión. Cada miembro reportó de manera continua:
1. **¿Qué tareas se completaron?**
2. **¿Qué tareas están en curso o se realizarán a continuación?**
3. **¿Qué bloqueos, impedimentos técnicos o decisiones de diseño surgieron?**

A continuación se detalla la bitácora consolidada y depurada de las sesiones diarias del **Sprint 5**:

---

## 🗓️ Bitácora Diaria del Sprint 5 (18 de Agosto al 01 de Septiembre)

### 📅 18 de Agosto de 2026 — *Inicio de Sprint 5, Minuta y Producción de Video Pitch*
* **Martín Sciarra:**
  * Elaboración y publicación del documento de **Sprint Planning 5** y la **Minuta de Inicio de Sprint** en el Google Drive del equipo.
  * Producción, montaje y edición de audio/video del **Video Pitch Institucional** del proyecto (ajuste de pistas de fondo, subtítulos, voz en off y marca de agua *Versión Beta*).
* **Francisco Funes:**
  * Revisión de la planificación del Sprint 5 en Google Drive. Ajuste en las observaciones de historias de usuario previas para mantener la trazabilidad.
* **Luciana Zahr & Franco Sosa:**
  * Revisión del borrador audiovisual del video pitch y validación de la claridad del mensaje y estructura narrativa.
* **Tito Montivero:**
  * Búsqueda y centralización de los lineamientos formales de la cátedra para la entrega del Paper, Póster Científico y Video Institucional.
* **Acuerdos del Equipo:**
  * Registro mandatorio de horas dedicadas a tareas de difusión académica (póster, paper y video) en la plataforma de gestión de horas.

---

### 📅 19 de Agosto de 2026 — *Alineación Metodológica y Gestión de Riesgos*
* **Luciana Zahr:**
  * Relevamiento de buenas prácticas metodológicas en gestión de riesgos (mitigación, aceptación, transferencia y evasión) y diferencias entre enfoques predictivos y ágiles para documentar formalmente en los informes de sprint.
* **Acuerdos del Equipo:**
  * Fortalecer la documentación de riesgos técnicos asociados a la integración de servicios externos de IA y persistencia en base de datos.

---

### 📅 22 de Agosto de 2026 — *Testing de Usabilidad y Compatibilidad Mobile*
* **Luciana Zahr:**
  * Ejecución de pruebas de usabilidad y renderizado *responsive* en dispositivos móviles sobre las vistas principales de la aplicación.
* **Conclusiones:**
  * Verificación de la correcta adaptación de la barra de navegación y layout general en pantallas reducidas.

---

### 📅 24 de Agosto de 2026 — *Desarrollo de IA (RAG) y Validación del Video Pitch*
* **Martín Sciarra:**
  * Avance en el desarrollo de la **User Story US-29 (Consultar con IA modalidad académica)** en rama aislada (`US-29-consultar-con-ia-modalidad-academica`), implementando el motor de indexación RAG vectorial.
  * Puesta a consideración del equipo de la versión final del video pitch institucional.
* **Luciana Zahr & Francisco Funes:**
  * Aprobación del video pitch para envío a revisión con el docente guía.
  * Planificación de historias de usuario pendientes de interacción en el foro.

---

### 📅 25 de Agosto de 2026 — *Integración en Develop, Compartir en Foros y Detección de Bugs*
* **Luciana Zahr:**
  * Finalización e integración a la rama `develop` de componentes de interacción social.
  * Inicio del análisis de diseño para la historia *Calificar Docente*.
* **Franco Sosa:**
  * Implementación y merge de la funcionalidad de **Compartir Publicación** (generación de enlace directo y distribución a grupos de estudio o contactos directos).
* **Tito Montivero:**
  * Sesión de pruebas exploratorias en backend y frontend; identificación y registro de inconsistencias menores en base de datos SQLite para su documentación en el informe técnico.
* **Martín Sciarra:**
  * Análisis de requerimientos para adaptar el asistente y catálogos hacia el resto de las especialidades de ingeniería de la facultad.

---

### 📅 26 de Agosto de 2026 — *Depuración de Esquemas y Sincronización de Base de Datos*
* **Tito Montivero & Luciana Zahr:**
  * Depuración de esquemas de datos en Sequelize ORM y sincronización de modelos relacionales de usuarios y perfiles.
* **Conclusiones:**
  * Estabilización del entorno de base de datos local para evitar colisiones en migraciones.

---

### 📅 27 de Agosto de 2026 — *Definición de Arquitectura: Calificación por Comisiones*
* **Luciana Zahr:**
  * Propuesta técnica y de experiencia de usuario (UX) para el módulo de reseñas: enfocar la calificación por **Cátedras y Comisiones** (evaluando disponibilidad, claridad pedagógica y material didáctico) en lugar de una evaluación personal directa al docente.
* **Tito Montivero & Francisco Funes:**
  * Validación de la propuesta, sugiriendo métricas de accesibilidad y claridad en las consultas.
  * Convocatoria a sesión de trabajo grupal sincrónica para el fin de semana.

---

### 📅 28 de Agosto de 2026 — *Coordinación de Historias de Usuario y Plan de Redacción*
* **Francisco Funes:**
  * Solicitud a los integrantes de las descripciones técnicas y criterios de aceptación de las User Stories desarrolladas para avanzar en la redacción del **Informe de Cierre del Sprint 5**.
* **Luciana Zahr & Franco Sosa:**
  * Consolidación de especificaciones de las tareas de foros e interacciones.
* **Tito Montivero:**
  * Actualización del calendario de entregas de la cátedra e hitos evaluativos.

---

### 📅 29 de Agosto de 2026 — *Alineación de Cierre de Sprint*
* **Equipo Completo:**
  * Coordinación de la agenda para la reunión sincrónica del domingo 30/08 con el fin de unificar ramas, validar métricas y revisar el estado de las tareas de Jira.

---

### 📅 30 de Agosto de 2026 — *Sesión de Integración, Métricas de Dashboard y Seguridad de Credenciales*
* **Martín Sciarra:**
  * Propuesta y especificación de **20 Métricas Estudiantiles para el Dashboard** (% de avance curricular, correlativas habilitadas, reputación por apuntes, alertas de regularidad).
  * **Refactorización Crítica de Seguridad (Módulo IA):** Eliminación de claves API en código fuente y estricta adopción del principio **12-Factor App** mediante variables de entorno (`process.env.GROQ_API_KEY`), revocación y rotación de tokens en Groq Console.
* **Luciana Zahr & Francisco Funes:**
  * Especificación funcional de la User Story *Planificador de Exámenes y Cursado*.
* **Tito Montivero:**
  * Validación y pruebas del refactor de seguridad en la rama `develop`.

---

### 📅 31 de Agosto de 2026 — *Redacción de Documentación de QA y Articulación Institucional*
* **Francisco Funes:**
  * Redacción formal de casos de uso y avance en el desarrollo del informe de QA del Sprint 5.
* **Luciana Zahr:**
  * Gestiones de vinculación con el Centro de Estudiantes (CET) para relevar necesidades de los alumnos y planificar pruebas piloto de la plataforma.

---

### 📅 01 de Septiembre de 2026 — *Cierre del Sprint 5 y Planificación del Sprint 6*
* **Francisco Funes:**
  * Finalización del borrador del **Informe del Sprint 5**, consolidación de métricas de velocidad de Jira y reporte de horas.
* **Luciana Zahr:**
  * Cierre de tareas de interacción y postergación planificada de la User Story *Calificar Docente* hacia el **Sprint 6** para consolidar el modelo de encuestas.
* **Martín Sciarra:**
  * Verificación final de la entrega del video institucional y planteo de objetivos técnicos para el Sprint 6.
* **Tito Montivero:**
  * Seguimiento de articulación con el centro de cómputos de la facultad y convocatoria a la reunión de **Sprint Planning 6 & Retrospectiva**.

---

## 📊 Matriz de Resumen de Contribuciones por Integrante

| Integrante | Historias de Usuario & Tareas Principales | Estado al Cierre |
| :--- | :--- | :---: |
| **Martín Sciarra** | • US-29: Asistente IA de Modalidad Académica (RAG, Vectorización, Streaming SSE).<br>• Refactor de seguridad 12-Factor App (`GROQ_API_KEY`).<br>• Edición y entrega del Video Pitch Institucional.<br>• Propuesta de 20 métricas para Dashboard Estudiantil. | **Completado** ✅ |
| **Franco Sosa** | • Funcionalidad de Compartir Publicación en grupos y amigos.<br>• Ajustes de interfaz en el feed de foros. | **Completado** ✅ |
| **Luciana Zahr** | • Componentes de interacción y reacciones en foros.<br>• Testing de usabilidad responsive en mobile.<br>• Diseño conceptual de reseñas por comisiones (traspaso a Sprint 6).<br>• Articulación institucional con CET. | **Completado / Traspaso** 🔄 |
| **Tito Montivero** | • Depuración y estabilización de base de datos SQLite.<br>• Coordinación y seguimiento de entregas académicas.<br>• Gestión de infraestructura y vinculación con centro de cómputos. | **Completado** ✅ |
| **Francisco Funes** | • Redacción y consolidación del Informe del Sprint 5.<br>• Registro y seguimiento de métricas en Jira.<br>• Elaboración de especificaciones de Historias de Usuario. | **Completado** ✅ |

---

## 🎯 Conclusiones del Sprint 5
1. **Cumplimiento de Objetivos:** Se alcanzó una alta tasa de completitud en las historias comprometidas, destacando la integración funcional del Asistente Virtual Inteligente con 89 documentos oficiales y la entrega del Video Pitch institucional.
2. **Buenas Prácticas de Seguridad:** Se regularizó la gestión de secretos según estándares de la industria (12-Factor App), garantizando repositorios limpios y seguros.
3. **Planificación hacia Sprint 6:** Las historias complejas con requerimientos de diseño en evolución (ej. *Calificar Docente*) fueron correctamente dimensionadas y traspasadas al Sprint 6 para asegurar una implementación rigurosa.
