## ⛔ 2. Reglas Estrictas de Código (Prohibiciones)
- **NO reescribir funciones troncales en su totalidad** si solo se pide arreglar un bug visual o añadir un feature pequeño.

- No alterar las promesas ni las funciones asíncronas de la comunicación principal sin agregar bloques lógicos `try/catch` que prevengan crashes en la interfaz.

## 🛡️ 4. Heurísticas Generales de Seguridad y Arquitectura
- **Protección de Credenciales**: Ninguna API KEY, Token o Credencial Sensible debe figurar "hardcodeada" en el código fuente. Se debe leer desde un `.env` a través de utilidades como `dotenv` o `fs`.
- **Content Security Policy (CSP)**: Prohibido relajar indiscriminadamente las CSP. Limitar estrictamente `connect-src` a las APIs necesarias (`api.groq.com`, `googleapis.com`, etc.) mitigando ataques de XSS trans-sitio.
- **Micro-Optimizaciones / Patrón de Eventos**: Siempre declarar listeners en ámbitos seguros, o verificar su asignación única (`addEventListener` vs `removeEventListener`) para evitar Memory Leaks o comportamientos fantasma en botones re-utilizados.

## 🧪 5. Principios de QA y Prevención de Crash (Graceful Degradation)
- **Bloqueos Try/Catch Estrictos**: Toda comunicación iterativa con módulos externos (`youtube-transcript`, fetch de LLM o fs) DEBE ir en `try/catch`. 
- **Gestión de Cargas**: Proveer siempre un feedback visual al usuario en cada latencia o espera de API con "loaders" preventivos. Evitar botones que "no hacen nada" si están en procesamiento backend.
- **Datos Inciertos y Fallbacks**: Nunca asumir que la data de API regresará viva. Implementar condicionales if-else para prever Nulos u Objetos vacíos. Si falla el Feature Primario (como los Subtítulos), el sistema debe degradarse silenciosamente a una Solución Secundaria (leer la descripción) sin alterar negativamente la moral de la IA.

---

## 🎨 6. Heurísticas Visuales de Nielsen (UI/UX)
- **Visibilidad del estado del sistema**: El usuario siempre debe saber qué está pasando (Ej: Spinners, dehabilitar botones en cargas repetitivas).
- **Relación con el mundo real**: Usar lenguaje claro ("Mis Clases", "Chat", en lugar de términos excesivamente técnicos).
- **Control y libertad**: Botones claros de "Volver" (X, Atrás) sin forzar un flujo trampa.
- **Consistencia y estándares**: Mismos estilos de botones y cards a través del proyecto.
- **Prevención de errores**: Evitar acciones inválidas apagando botones o sanear inputs vacíos antes de enviarlos.
- **Reconocimiento antes que recuerdo**: Mantener visible el historial del chat para que el usuario no necesite recordar la respuesta anterior.
- **Flexibilidad y eficiencia**: Atajos de teclado (Ej: presionar `Enter` para enviar mensajes de chat sin usar siempre el ratón).
- **Estética minimalista**: Prohibido recargar de información inútil, diseño oscuro y limpio estilo Netflix.

---

## 📚 7. Compendio de Testing, Arquitectura Avanzada y Buenas Prácticas

### Heurísticas generales de calidad
* **KISS (Keep It Simple, Stupid)**: Minimizar complejidad innecesaria.
* **DRY (Don't Repeat Yourself)**: Evitar duplicación de lógica.
* **YAGNI (You Aren’t Gonna Need It)**: No implementar funcionalidades especulativas.
* **Principio de menor sorpresa**: El sistema debe comportarse como el usuario espera.
* **Fail Fast**: Detectar errores lo antes posible.
* **Alta cohesión, bajo acoplamiento**: Componentes bien definidos y poco dependientes.
* **Separación de responsabilidades (SoC)**: Cada módulo con una única responsabilidad clara.

### Principios de diseño (orientados a QA)
* **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.
* **Defensive Programming**: Validar entradas, asumir errores externos.
* **Idempotencia**: Repetir una operación no cambia el resultado.
* **Inmutabilidad cuando sea posible**: Reduce efectos colaterales.

### Heurísticas de testing y Diseño de Casos
* **Pirámide de testing**: Unit tests (muchos), Integration (algunos), E2E (pocos).
* **AAA Pattern (Arrange, Act, Assert)**: Estructura estándar de test.
* **Partición de equivalencia & Boundary Testing**: Agrupar inputs similares y focalizarse en extremos.
* **Error Guessing**: Basado en experiencia.

### Patrones de automatización y Buenas prácticas QA
* **Shift Left Testing**: Testear desde etapas tempranas.
* **Automatizar lo repetitivo**: Priorizar regresión.
* **Layered architecture en tests**: Separar lógica, UI y datos.
* **Cobertura ≠ calidad**: No sobreoptimizar métricas.

### Anti-patrones comunes y Exploratory Testing
* **CRUD + L & RCRCRC**: Listar, repetir y validar estado.
* **Heurística de entradas inválidas**: Null, Vacío, Largo extremo, Formato incorrecto.
* Prohibidos los tests frágiles, acoplados, over-mocking, ignorar casos negativos.

### Heurísticas de revisión de código
* ¿Se puede romper fácilmente? ¿Qué pasa con inputs inesperados? ¿Hay duplicación? ¿Es testeable? ¿Se entiende sin contexto externo?

### Enfoques modernos (Breeze)
* TDD, ATDD, Chaos Engineering, Observabilidad como QA (logs, metrics, tracing).
