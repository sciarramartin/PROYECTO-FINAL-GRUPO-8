# Régimen de Correlativas - Ingeniería en Sistemas

## Tabla Completa Extraída

| Nivel | Nº | Asignatura | Modalidad | Req. Regular | Req. Aprobada | Carga (hs) |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| **1°** | 1 | Análisis Matemático I | A | - | - | 5 |
| | 2 | Álgebra y Geometría Analítica | A | - | - | 5 |
| | 3 | Física I | A | - | - | 5 |
| | 4 | Inglés I | A | - | - | 2 |
| | 5 | Lógica y Estructuras Discretas | 1C-2C | - | - | 3 |
| | 6 | Algoritmo y Estructura de Datos | A | - | - | 5 |
| | 7 | Arquitectura de Computadoras | 2C-1C | - | - | 4 |
| | 8 | Sistemas y Proceso de Negocios | 1C-2C | - | - | 3 |
| **2°** | 11 | Ingeniería y Sociedad | 2C-1C | - | - | 2 |
| | 9 | Análisis Matemático II | A | 1-2 | - | 5 |
| | 10 | Física II | A | 1-3 | - | 5 |
| | 12 | Inglés II | A | 4 | - | 2 |
| | 13 | Sintaxis y Semántica de los Lenguajes | 1C-2C | 5-6 | - | 4 |
| | 14 | Paradigmas de Programación | 1C-2C | 5-6 | - | 4 |
| | 15 | Sistemas Operativos | A | 7 | - | 4 |
| | 16 | Análisis de Sistemas de Información (Int) | A | 6-8 | - | 6 |
| | 17 | Probabilidad y Estadística | 1C-2C | 1-2 | - | 3 |
| **3°** | 18 | Economía | 2C-1C | - | 1-2 | 3 |
| | 19 | Base de Datos | 1C-2C | 13-16 | 5-6 | 4 |
| | 20 | Desarrollo de Software | 1C-2C | 14-16 | 5-6 | 4 |
| | 21 | Comunicación de Datos | A | - | 3-7 | 4 |
| | 22 | Análisis Numérico | 2C-1C | 9 | 1-2 | 3 |
| | 23 | Diseño de Sistemas de Información (Int) | A | 14-16 | 4-6-8* | 6 |
| | 99 | Seminario Integrados (Analista)*** | 2C | 16 | 6-8-13-14 | 4 |
| **4°** | 24 | Legislación | 2C-1C | 11 | - | 2 |
| | 25 | Ingeniería y Calidad de Software | 2C-1C | 19-20-23 | 13-14 | 3 |
| | 26 | Redes de Datos | A | 15-21 | - | 4 |
| | 27 | Investigación Operativa | A | 17-22 | - | 4 |
| | 28 | Simulación | 1C-2C | 17 | 9 | 3 |
| | 29 | Tecnologías Para la Automatización | 2C-1C | 10-22 | 9 | 3 |
| | 30 | Administración de Sistemas de Información (Int)| A | 18-23 | 16 | 6 |
| **5°** | 31 | Inteligencia Artificial | 2C-1C | 28 | 17-22 | 3 |
| | 32 | Ciencia de Datos | 2C-1C | 28 | 17-19 | 3 |
| | 33 | Sistemas de Gestión | 1C-2C | 18-27 | 23 | 4 |
| | 34 | Gestión Gerencial | 1C-2C | 24-30 | 18 | 3 |
| | 35 | Seguridad en los Sistemas de Información | 1C-2C | 26-30 | 20-21 | 3 |
| | 36 | Proyecto Final (Int)** | A | 25-26-30 | 12-20-23* | 6 |

*(Nota: En el archivo original, las correlativas de Diseño de Sistemas y Proyecto Final estaban autoformateadas por un bug de Excel como fechas `2008-04-06` y `2023-12-20`. Fueron reconstruidas lógicamente a sus identificadores correspondientes 4-6-8 y 12-20-23).*

---

## Análisis y Funcionamiento del Régimen

Al analizar las columnas, este sistema refleja el clásico plan de correlatividades de las facultades de ingeniería en Argentina (muy similar al de la **UTN**).

La información se divide en **dos niveles estrictos de requisitos** para poder cursar una materia nueva:

### 1. Columna "Regular" (Correlatividades Débiles)
Esta columna lista los números (Nº) de las asignaturas que el estudiante **solo necesita tener en estado "Regular"** (es decir, cursó la materia, aprobó los parciales o trabajos prácticos, pero aún no dio el examen final). 
- *Ejemplo:* Para cursar **(9) Análisis Matemático II**, el alumno debe tener regulares la **(1) Análisis Matemático I** y la **(2) Álgebra**. Si las tiene regulares, puede sentarse en el aula de Análisis II.

### 2. Columna "Aprobada" (Correlatividades Fuertes)
Esta columna lista los números de las asignaturas que el estudiante **debe tener aprobadas de forma definitiva** (examen final aprobado y asentado en acta) para poder cursar la nueva.
- *Ejemplo:* Para cursar **(19) Base de Datos**, no basta con tener "Regular" a Lógica (5) y Algoritmos (6). La facultad exige que **(5) y (6)** estén totalmente **Aprobadas** con final. Al mismo tiempo, exige tener "Regulares" a (13) Sintaxis y (16) Análisis de Sistemas.

### ¿Cómo impacta esto en el Grafo (Tu User Story)?
En tu actual código del `MapaCorrelatividades.jsx`, el grafo visual calcula el estado `Habilitada` o `Bloqueada` fijándose simplemente si las correlativas están en "Aprobada" o "Regular", sin hacer distinción. 

Sin embargo, **el Excel demuestra que el sistema real es más complejo**. Un alumno podría tener "Regular" una materia y el grafo actual le diría que está "Habilitada" para cursar la siguiente, **pero si el plan de estudios exige que esa materia previa esté "Aprobada"**, el grafo estaría dándole información falsa.

**Para que tu aplicación sea 100% fiel a la realidad**, la base de datos de materias no debería tener un simple arreglo de `correlativas`. Debería tener dos arreglos separados:
1. `correlativas_para_cursar` (Las que pide tener Regular)
2. `correlativas_para_aprobar` (Las que pide tener Aprobada con final)

De esta forma, al alumno se le habilitaría el nodo correcto según si rindió los finales o solo regularizó.
