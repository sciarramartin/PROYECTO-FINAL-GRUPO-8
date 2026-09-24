# 🎓 Campus Académico Inteligente - ISI (UTN)

Plataforma académica integral para estudiantes y directivos de **Ingeniería en Sistemas de Información (UTN)**. Centraliza la planificación curricular, la agenda horaria semanal, la asistencia académica mediante IA y la analítica predictiva de retención y graduación.

---

## 🚀 Módulos Principales

| Módulo | Descripción |
| :--- | :--- |
| **🗺️ Grafo de Correlatividades y Progreso** | Visualización interactiva del plan de estudios (2008 / 2023). Sincronización automática de comisiones y cálculo de avance por créditos/puntos en electivas hacia título intermedio y de grado. |
| **📅 Agenda y Planificador Horario** | Generador de cursado sin solapamientos, sincronización en tiempo real entre materias cursadas y calendario semanal, y métrica de balance de carga horaria. |
| **🤖 Asistente Académico IA (RAG)** | Asistente inteligente entrenado sobre ordenanzas curriculares, estatutos universitarios, reglamentos de correlatividades y calendarios oficiales de la facultad. |
| **📊 Dashboard y Analítica Predictiva** | Métricas de avance curricular, proyección de fecha de egreso, retención y recursantes (US-84), encuestas docentes obligatorias (US-85) y estadísticas de material de estudio. |
| **💬 Red Académica y Foros de Cátedra** | Foros de discusión por materia con hilos, sistema de reputación comunitaria, mensajería en tiempo real (WebSockets) y repositorio valorado de apuntes. |

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18, Vite, Tailwind CSS, Vis.js / React Flow, Socket.io-client, Lucide Icons.
- **Backend**: Node.js, Express, Sequelize ORM, SQLite3, Socket.io, JWT, Motor RAG vectorial.
- **Testing**: Jest (suite de pruebas unitarias y de integración).

---

## ⚡ Inicio Rápido

### 1. Backend
```bash
cd PRODUCTO/codigo-fuente/backend
npm install
npm run seed      # Inicializa y puebla la base de datos con planes y comisiones
npm run iniciar   # Servidor corriendo en http://localhost:3000
```

### 2. Frontend
```bash
cd PRODUCTO/codigo-fuente/frontend
npm install
npm run dev       # Interfaz disponible en http://localhost:5173
```

### 3. Pruebas Automatizadas
```bash
cd PRODUCTO/codigo-fuente/backend
npm test          # Ejecución de suites de prueba Jest
```
