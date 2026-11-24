# Reporte de pruebas unitarias de servicios

Suite analizada: [services.unit.test.js](./services.unit.test.js)

## Resultado de ejecuciÃ³n

- **Primera iteraciÃ³n:** 36 tests exitosos, 0 fallidos antes del pull de la nueva versiÃ³n.
- **Segunda iteraciÃ³n:** se revisÃ³ la nueva carpeta `servicios/` y se identificaron 5 archivos nuevos con 32 funciones/mÃ©todos exportados que no estÃ¡n cubiertos por la suite enlazada. No se ejecutÃ³ la suite despuÃ©s del pull porque esta iteraciÃ³n actualiza el inventario del reporte y todavÃ­a no agrega pruebas para esos exports.
- Los modelos, bcrypt, JWT, Sequelize, utilidades de correo y repositorio de archivos se simulan con Jest.
- En RAG se simulan `fs`, `dotenv` y `pdf-parse`; la suite no abre ni procesa documentos reales.
- Una misma prueba puede ejercitar mÃ¡s de una funciÃ³n y varios escenarios. La descripciÃ³n siguiente indica quÃ© se hizo por funciÃ³n, no un conteo individual de casos Jest.

## Segunda iteraciÃ³n: servicios nuevos detectados

Al comparar la versiÃ³n actual con la suite de la primera iteraciÃ³n, aparecieron los siguientes archivos. Ninguno estÃ¡ importado en `services.unit.test.js`, por lo que todas las funciones enumeradas aquÃ­ necesitan pruebas unitarias.

### `captacion.cohortes.js` â€” 3 funciones

- `normalizarAnio`
- `ordenarCohortes`
- `resumirConteos`

Son transformaciones de datos puras. Conviene cubrir aÃ±os vÃ¡lidos e invÃ¡lidos, orden de aÃ±os nulos/no nulos, agregaciÃ³n por carrera y aÃ±o, porcentajes y conteos inconsistentes.

### `captacion.util.js` â€” 2 funciones exportadas

- `porcentaje`
- `validarReferencia`

Conviene cubrir denominadores nulos/no vÃ¡lidos, entradas correctas y validaciones de aÃ±o, semestre, matrÃ­cula, fuente, carreras duplicadas y sumas que superen el total. La funciÃ³n interna `entero` no se exporta; sus reglas pueden cubrirse a travÃ©s de `validarReferencia`.

### `captacion.servicio.js` â€” 3 mÃ©todos exportados en la instancia

- `verificarAdminEnBase`
- `obtenerResumen`
- `registrarReferencia`

Conviene simular Sequelize y cubrir autorizaciÃ³n, resumen sin historial/con historial, registro transaccional, validaciÃ³n de carreras inexistentes y conflicto por perÃ­odo duplicado. Las funciones internas `obtenerConteos`, `calcularDepartamentos` y `errorHttp` no se exportan directamente.

### `foro.servicio.js` â€” 22 mÃ©todos estÃ¡ticos

- `obtenerForosMaterias`
- `obtenerPublicacionesMateria`
- `obtenerEtiquetasMateria`
- `obtenerMisAportes`
- `obtenerFeed`
- `obtenerDetallePublicacion`
- `crearPublicacion`
- `editarPublicacion`
- `eliminarPublicacion`
- `reaccionarPublicacion`
- `toggleGuardarPublicacion`
- `obtenerPublicacionesGuardadas`
- `obtenerEtiquetasPopulares`
- `crearComentario`
- `editarComentario`
- `eliminarComentario`
- `reaccionarComentario`
- `reportarPublicacion`
- `reportarComentario`
- `obtenerReportes`
- `resolverReporte`
- `eliminarReporte`

Cada mÃ©todo necesita al menos un test de contrato; varias operaciones requieren ademÃ¡s escenarios de permisos, ausencia de registros, reacciones tipo toggle y resoluciÃ³n de reportes. Los modelos `Foro*`, usuarios, materias y Sequelize deberÃ­an aislarse con mocks.

### `metricasGlobales.servicio.js` â€” 2 funciones

- `obtenerTamanoArchivoBytes`
- `obtenerDashboardMetricasGlobales`

Conviene cubrir el tamaÃ±o de archivo con ruta ausente, archivo existente y error de filesystem; para el dashboard, los totales, agrupaciones mensuales, almacenamiento, acumulados y materias top con dependencias simuladas.

**Total de la segunda iteraciÃ³n: 32 funciones/mÃ©todos exportados pendientes de tests** (3 + 2 + 3 + 22 + 2). La enumeraciÃ³n se obtuvo de los exports y mÃ©todos pÃºblicos de los cinco archivos nuevos.

## CÃ³mo ejecutar los tests

Desde la carpeta `backend/`:

1. Abre una terminal en la raÃ­z del backend.
2. Ejecuta solo la suite unitaria de servicios:

   ```powershell
   npm.cmd test -- --runInBand tests/unit/services/services.unit.test.js
   ```

3. Para ejecutar todas las suites Jest del backend:

   ```powershell
   npm.cmd test -- --runInBand
   ```

En PowerShell se usa `npm.cmd` para invocar npm sin depender de la polÃ­tica de ejecuciÃ³n de scripts de `npm.ps1`. El script `test` definido en `package.json` ejecuta Jest.

## Funciones probadas

### `AuthService.js`

- `login`: simula consulta de usuario, comparaciÃ³n de contraseÃ±a y firma JWT; comprueba el resultado pÃºblico y credenciales invÃ¡lidas/usuario ausente.

### `RecuperarContrasenaService.js`

- `solicitarRecuperacion`: comprueba que un correo inexistente no revela informaciÃ³n y que para uno existente se persiste un token y expiraciÃ³n.
- `resetearContrasena`: verifica rechazo de token inexistente o vencido y actualizaciÃ³n con hash y limpieza del token para un token vigente.

### `UsuarioService.js`

- `crearUsuario`: cubre campos obligatorios, creaciÃ³n con hash sin exponer contraseÃ±a y rechazo de correo duplicado.
- `obtenerUsuarioPorId`: comprueba devoluciÃ³n del usuario y error 404 si no existe.
- `actualizarPerfilAlumno`: usa un usuario simulado y comprueba la forma de la respuesta; el mock de `update` no modifica el objeto.
- `eliminarUsuario`: comprueba eliminaciÃ³n y resultado `true`.
- `buscarUsuarios`: comprueba coincidencia sin acentos y retorno vacÃ­o para una bÃºsqueda sin contenido Ãºtil.

### `cursos.service.js`

- `findById`: verifica mapeo de columnas a camelCase.
- `findAllByMateriaId`: verifica la conversiÃ³n de una lista de registros.
- `create`: cubre hora invÃ¡lida y creaciÃ³n con duraciÃ³n mÃ¡xima aceptada.
- `update`: cubre registro inexistente y actualizaciÃ³n parcial exitosa.

### `actividades-flexibles.service.js`

- `findAllByUserId`: comprueba el mapeo de la lista.
- `registrarActividadFlexible`: cubre campos faltantes, prioridad invÃ¡lida y creaciÃ³n vÃ¡lida.
- `update`: comprueba una actualizaciÃ³n parcial exitosa.
- `deleteById`: comprueba recurso inexistente y eliminaciÃ³n permitida.

### `actividades-personales.service.js`

- `findAllByUserId`: comprueba devoluciÃ³n de una actividad mapeada.
- `findEstadistics`: verifica horas semanales y promedio con actividades simuladas.
- `create`: cubre hora invÃ¡lida y creaciÃ³n con datos vÃ¡lidos.
- `update`: comprueba el rechazo cuando la actividad no existe.
- `deleteById`: cubre usuario no propietario y eliminaciÃ³n permitida.

### `amistad.service.js`

- `enviarSolicitud`: comprueba creaciÃ³n para dos usuarios, auto solicitud invÃ¡lida y usuario inexistente.
- `aceptarSolicitud`: verifica cambio a aceptado y error cuando no existe solicitud pendiente.
- `eliminarORechazarAmistad`: verifica eliminaciÃ³n de una relaciÃ³n existente.
- `listarAmigos`: comprueba una lista vacÃ­a tras validar usuario.
- `listarSolicitudesPendientes`: comprueba una lista vacÃ­a tras validar usuario.
- `obtenerEstadoRelacion`: cubre mismo usuario, ausencia de relaciÃ³n y solicitud pendiente enviada.

### `materia.servicio.js`

- `obtenerTodas`: comprueba que se prioriza el filtro por plan acadÃ©mico.
- `obtenerPorId`: cubre registro encontrado y error por materia inexistente.
- `crearMateria`: comprueba valores por defecto y detecciÃ³n de ciclo con eliminaciÃ³n de la materia reciÃ©n creada.
- `actualizarMateria`: comprueba actualizaciÃ³n de campos bÃ¡sicos.
- `eliminarMateria`: comprueba eliminaciÃ³n exitosa.
- `obtenerEstadisticasInscripciones`: comprueba el retorno vacÃ­o cuando la materia no tiene cursos.

### `inscripciones-cursos.service.js`

- `findAllByCursoId`: verifica el mapeo de fecha e identificador de curso.
- `findAllByUserId`: comprueba devoluciÃ³n de una lista.
- `crearInscripcion`: verifica creaciÃ³n y mapeo de datos.
- `calcularPlan`: cubre una combinaciÃ³n posible y el retorno sin plan cuando no hay cursos.

### `material.servicio.js`

- `mapearMaterial`: comprueba etiquetas CSV y transformaciÃ³n a lista.
- `crearMaterial`: cubre archivo requerido y creaciÃ³n con identificadores camelCase.
- `obtenerMaterialPorId`: cubre material ausente y promedio/cantidad de calificaciones.
- `listarMateriales`: comprueba mapeo de resultados con calificaciones vacÃ­as.
- `eliminarMaterial`: cubre material ausente y eliminaciÃ³n del archivo y registro.
- `obtenerRutaParaDescarga`: verifica delegaciÃ³n a la ruta absoluta simulada.
- `registrarCalificacion`: cubre la creaciÃ³n de una calificaciÃ³n y el resultado agregado.
- `listarMaterialesPorRanking`: comprueba mapeo de la lista devuelta.
- `registrarDescarga`: cubre incremento desde cero.

### `metricasMaterialEstudio.servicio.js`

- `obtenerDashboardMaterialEstudio`: verifica resumen de totales, descarga nula como cero y combinaciÃ³n/orden de periodos provenientes de modelos simulados. Sus funciones internas de agregaciÃ³n se ejercitan a travÃ©s del dashboard.

### `reputacion.service.js`

- `determinarRango`: verifica los cuatro umbrales de nivel.
- `calcularReputacionEstudiante`: comprueba cÃ¡lculo con materiales y votos, ademÃ¡s del retorno alternativo ante error de dependencia.

### `perfil.service.js`

- `obtenerOcrearPerfil`: cubre creaciÃ³n/obtenciÃ³n y usuario inexistente.
- `actualizarPerfil`: verifica actualizaciÃ³n del apodo e intereses array serializados como JSON.
- `obtenerPerfilPublico`: comprueba ocultamiento de aÃ±o y contacto conservando GitHub cuando la privacidad estÃ¡ activada.

### `progreso.servicio.js`

- `obtenerProgreso`: comprueba devoluciÃ³n de estados simulados.
- `actualizarEstadoMateria`: cubre estado invÃ¡lido, actualizaciÃ³n de registro existente y creaciÃ³n de uno nuevo. Las dependencias auxiliares de sincronizaciÃ³n se simulan.
- `verificarGraduacion`: cubre usuario inexistente y plan sin materias; no se prueba el caso de graduaciÃ³n positiva.
- `obtenerProgresoCurricular`: cubre usuario inexistente y cÃ¡lculo de avance con una materia aprobada y una electiva.
- `obtenerProyeccionGraduacion`: cubre falta de aÃ±o de ingreso y caso ya graduado; el progreso curricular se simula.
- `obtenerMetricasGraduados`: verifica totales y tasa por carrera con `verificarGraduacion` simulado.
- `obtenerMateriasHabilitadas`: comprueba exclusiÃ³n de materia ya aprobada y disponibilidad de materias sin requisitos o con correlativa aprobada.

### `rag.servicio.js`

- `obtenerDirectorioDocumentos`: se invoca durante la construcciÃ³n de la instancia con el sistema de archivos simulado; no hay una aserciÃ³n independiente de la ruta elegida.
- `obtenerRutaDocumento`: cubre nombre inexistente con directorio vacÃ­o.
- `_normalizeCacheKey`: se ejecuta indirectamente al invocar `consultarChatbot`; no tiene aserciÃ³n directa de normalizaciÃ³n/cachÃ©.
- `procesarTextoEnChunks`: comprueba divisiÃ³n de texto en bloques.
- `agregarChunk`: verifica alta y deduplicaciÃ³n por contenido.
- `extraerTokens`: comprueba normalizaciÃ³n de acentos y filtrado de tokens cortos.
- `esSaludoOCharlaInicial`: comprueba detecciÃ³n de saludo y consulta no conversacional.
- `esMetaConsultaCorpus`: cubre una pregunta sobre documentos y una consulta ajena al catÃ¡logo.
- `construirIndiceVectorial`: se invoca antes de recuperar contexto.
- `recuperarContexto`: comprueba que recupera fragmentos relacionados y que ignora consultas sin tokens.
- `normalizarConsultaParaBusqueda`: comprueba expansiÃ³n de la sigla BEG y entrada vacÃ­a.
- `consultarChatbot`: cubre Ãºnicamente la respuesta local a un saludo. Se sustituye `inicializar` por un mock.
- `obtenerDocumentosDisponibles`: comprueba lista vacÃ­a con el sistema de archivos simulado.

## Funciones no probadas o con cobertura parcial

- `material.servicio.js`: el alias exportado `obtenerTodos` no se invoca directamente (apunta a `listarMateriales`). En `registrarCalificacion` no se prueba actualizaciÃ³n de una calificaciÃ³n existente. `listarMaterialesPorRanking` solo se prueba con un resultado simple.
- `rag.servicio.js`: `_getApiKey` no se prueba. `inicializar` estÃ¡ reemplazada por un mock al probar `consultarChatbot`, por lo que su indexaciÃ³n real no se valida. `consultarChatbot` no cubre consultas al proveedor, fallback de respuesta, cachÃ© ni errores de red. Tampoco se prueba el cÃ¡lculo/orden de documentos reales en `obtenerDocumentosDisponibles`.
- `progreso.servicio.js`: no se prueba graduaciÃ³n positiva, ramas de sincronizaciÃ³n de inscripciones/actividades, proyecciÃ³n estimada para estudiante aÃºn no graduado ni reglas de correlativas pendientes/regularidad en `obtenerMateriasHabilitadas`.
- En los demÃ¡s servicios, los escenarios descritos son los incluidos en esta suite; no representa cobertura exhaustiva de todas las combinaciones de entradas ni de fallos de cada dependencia.

## Limitaciones

Las pruebas aÃ­slan la lÃ³gica de servicio mediante mocks; no verifican integraciÃ³n real con Sequelize, base de datos, correo, JWT, bcrypt, filesystem, PDFs ni servicios externos. En consecuencia, el reporte describe cobertura unitaria, no integraciÃ³n ni validaciÃ³n de comportamiento de esas dependencias.

