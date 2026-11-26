# Resultados del catálogo mediante Playwright MCP

Fecha: 26 de noviembre de 2026 (Europe/Madrid).

## Resultado y alcance

Se contabilizan los 120 casos del [catálogo original](plan-pruebas-playwright.docx). El resultado distingue las comprobaciones ejecutadas, observaciones, bloqueos y funcionalidades futuras. No equivale a declarar los 120 casos superados ni a una auditoría completa de accesibilidad o seguridad.

| Estado | Casos |
| --- | ---: |
| SUPERADA | 106 |
| OBSERVADA | 9 |
| BLOQUEADA | 3 |
| NO_APLICA | 2 |

**SUPERADA:** las aserciones ejecutadas del escenario terminaron correctamente. **FALLIDA:** una comprobación no se cumplió y se aporta el error; requiere analizar si procede de la aplicación o del guion. **OBSERVADA:** ejecución con datos o resultados de exploración, sin aprobar un requisito nuevo o la parte manual pendiente. **BLOQUEADA:** faltan condiciones para completar el caso. **NO_APLICA:** funcionalidad de API/interfaz fuera del alcance implementado.

## Método y entorno

- Se utilizó realmente el protocolo MCP: negociación `initialize`, descubrimiento `tools/list` y llamadas `tools/call`, principalmente a `browser_run_code_unsafe`. Los escenarios se ejecutaron en el proceso del servidor MCP sobre páginas y contextos de su navegador; el cliente de ejecución no importó `@playwright/test`. También se invocaron `browser_navigate` y las herramientas de captura/inspección indicadas en las evidencias.
- El chat no exponía herramientas nativas Playwright. Se conectó un cliente local JSON-RPC/stdio al paquete configurado `@playwright/mcp@latest`. Es una conexión MCP funcional, sin afirmar que se haya reparado la carga nativa del conector en el chat.
- Servidor MCP identificado: Playwright `1.66.0-alpha-2026-11-18`; navegador Chrome `158.0.8127.38`, headless y con perfil aislado. Esa versión es independiente de `@playwright/test` 1.65.1 del proyecto.
- La caché personal npx falló inicialmente por ausencia de `playwright-core/lib/coreBundle.js`. Se conservó y se utilizó una caché temporal en `.runtime/pruebas-mcp/npm-cache`; no se actualizaron dependencias de la aplicación ni configuración personal.
- Frontend de pruebas: `http://127.0.0.1:4201`; backend: `http://127.0.0.1:8001`, `APP_ENV=test`, `APP_DEBUG=0`, base `backend/var/tasks_e2e.db`. Se aplicó a esa base su migración pendiente. Se comprobó que los puertos estaban libres y se conservaron los procesos de desarrollo.
- Cada caso comenzó con sus datos propios y un contexto nuevo de navegador. La limpieza de tareas se limitó al endpoint de pruebas del puerto 4201. Los casos de errores y carga utilizaron interceptación de respuestas; esos resultados no prueban por sí solos persistencia de un backend simulado.
- Se tomaron hashes de las bases protegidas y archivos antes de ejecutar. Resultado: {'tasks.db': True, 'tasks_test.db': True}. Cambios inesperados de fuentes: [].
- No se modificó código de la aplicación para hacer pasar comprobaciones, no se ejecutó la suite PHPUnit/Vitest y no se crearon commits o publicaciones. Los guiones de ejecución y sus correcciones están únicamente en `.runtime/pruebas-mcp`.

## Incidencias del guion y repetición

La primera pasada detectó errores de preparación en PW-019/PW-020 (faltaba cargar la página) y una espera insuficiente al cambiar el detalle en PW-034. Se corrigieron en el guion temporal y se repitieron los casos afectados. También se reforzaron las comprobaciones de peticiones duplicadas y de teclado/detalle. El resultado final de cada repetición figura en la tabla; las respuestas MCP originales se conservan en los archivos `batch-*.json` y el registro JSON-RPC. No se atribuyen estos errores de guion a la aplicación.

## Hallazgos, observaciones y bloqueos

### PW-028 · Diagnóstico del límite con emoji

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Matriz Unicode/UTF-16; pendiente decidir coherencia UX", "matrix": [{"emojis": 100, "uiCodePoints": 100, "uiUtf16": 200, "api": 201}, {"emojis": 101, "uiCodePoints": 100, "uiUtf16": 200, "api": 201}, {"emojis": 200, "uiCodePoints": 100, "uiUtf16": 200, "api": 201}]}`.

### PW-075 · Reintentar tras fallo de mutación: alcance real

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Reintentar recarga la lista; no repite PATCH", "methods": ["GET"]}`.

### PW-076 · Respuesta perdida después de persistir

Estado: **OBSERVADA**.

Datos observados: `{"observation": "POST persistido pese al error de red en UI; idempotencia no contratada", "persistedId": 99}`.

### PW-077 · Completar recorrido solo con teclado

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Recorrido funcional completo por teclado ejecutado; revisión visual de foco pendiente."}`.

### PW-079 · Anuncios de éxito y error

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Roles status/alert comprobados; anuncio con lector de pantalla pendiente"}`.

### PW-081 · Anchura estrecha de 320 píxeles

Estado: **OBSERVADA**.

Datos observados: `{"observation": "A 320 px no desborda la página, pero el extremo derecho del filtro Completadas queda recortado unos 4 px por el panel con overflow hidden. El botón sigue siendo accionable; objetivo de calidad exploratorio, sin modificar el diseño aprobado.", "checks": [{"state": "lista", "scroll": 320, "viewport": 320}, {"state": "detalle", "scroll": 320, "viewport": 320}, {"state": "editor", "scroll": 320, "viewport": 320}, {"state": "confirmación", "scroll": 320, "viewport": 320}], "evidence": "mobile-check.json y evidencias/PW-081-mobile-check.png; tabs scrollWidth 287/clientWidth 282, botón right 305.92 y panel right 302."}`.

### PW-082 · Escritorio y texto largo

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Geometría escritorio y textos límite comprobados; revisión visual propuesta", "checks": [{"state": "lista", "scroll": 1440, "viewport": 1440}, {"state": "detalle", "scroll": 1440, "viewport": 1440}, {"state": "editor", "scroll": 1440, "viewport": 1440}, {"state": "confirmación", "scroll": 1440, "viewport": 1440}]}`.

### PW-083 · Zoom del navegador y foco

Estado: **BLOQUEADA**.

Requiere zoom real de navegador y revisión de foco; reducir viewport no acredita zoom al 200%.

### PW-084 · Comparación visual controlada

Estado: **BLOQUEADA**.

No existe referencia visual aprobada; no se genera una para aprobarse contra sí misma.

### PW-086 · Compatibilidad entre motores

Estado: **BLOQUEADA**.

Firefox/WebKit no configurados en el proyecto; conexión MCP actual con Chrome.

### PW-115 · Conflicto de edición entre pestañas

Estado: **OBSERVADA**.

Datos observados: `{"observation": "Última escritura prevalece; no hay detección de conflictos contratada"}`.

### PW-116 · Listado de volumen moderado

Estado: **OBSERVADA**.

Datos observados: `{"observation": "100 tareas y edición de extremos comprobadas; sin umbral de rendimiento acordado", "durationMs": 68178}`.

### PW-119 · Categorías: comprobación futura de interfaz

Estado: **NO_APLICA**.

API e interfaz de categorías todavía sin implementar ni contrato acordado.

### PW-120 · Categorías: borrado en uso futuro

Estado: **NO_APLICA**.

Borrado de categorías desde API/UI pendiente de diseño; no inventar código HTTP.

## Resultado individual de los 120 casos

Las precondiciones, pasos y expectativas completos están en el Word original. La columna de resultado describe la evidencia automatizada disponible; las partes manuales o no aplicables se señalan por separado.

| Caso | Prueba | Modalidad | Estado final | Resultado o limitación |
| --- | --- | --- | --- | --- |
| PW-001 | Primera carga sin tareas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-002 | Carga de un conjunto mixto | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-003 | Orden de creación descendente | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-004 | Actualizar recupera cambios externos | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-005 | Indicador de carga controlado | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-006 | Bloqueo de actualizaciones duplicadas | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-007 | Contador singular y plural | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-008 | Recarga conserva datos persistidos | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-009 | Crear solo con título | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-010 | Crear con título y descripción | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-011 | Crear desde la lista vacía | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-012 | Normalizar espacios del título | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-013 | Permitir títulos repetidos | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-014 | Cancelar la creación | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-015 | Cerrar y reabrir limpia un borrador | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-016 | Crear manteniendo filtro Completadas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-017 | Un doble clic no duplica la creación | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-018 | Guardar por teclado | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-019 | Título vacío | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-020 | Título compuesto de espacios ASCII | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-021 | Título formado por espacios Unicode | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-022 | Título de un carácter | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-023 | Título de 200 caracteres | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-024 | Impedir 201 caracteres desde la UI | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-025 | Descripción en el límite de 5.000 | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-026 | Impedir 5.001 caracteres desde la UI | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-027 | Acentos, eñes y caracteres no latinos | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-028 | Diagnóstico del límite con emoji | Exploratoria | OBSERVADA | Matriz Unicode/UTF-16; pendiente decidir coherencia UX |
| PW-029 | Corregir un título inválido | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-030 | Descripción multilínea | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-031 | Abrir detalle desde la fila | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-032 | Detalle sin descripción | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-033 | Cerrar detalle | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-034 | Cambiar de detalle entre tareas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-035 | Editar título desde la fila | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-036 | Editar desde el detalle | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-037 | Vaciar la descripción | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-038 | Cancelar edición conserva datos | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-039 | Rechazar edición inválida | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-040 | Editar una tarea completada | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-041 | Conservar fecha de creación al editar | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-042 | Texto plano sin ejecución de HTML | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-043 | Completar una tarea pendiente | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-044 | Reabrir una tarea completada | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-045 | Mostrar solo pendientes | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-046 | Mostrar solo completadas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-047 | Volver a Todas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-048 | Vacío por filtro con datos globales | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-049 | Completar dentro de Pendientes | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-050 | Reabrir dentro de Completadas | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-051 | Estado seleccionado accesible | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-052 | Cambios de filtro sin peticiones innecesarias | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-053 | Actualizar conserva filtro actual | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-054 | Un cambio de estado por interacción | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-055 | Abrir confirmación no elimina | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-056 | Cancelar la eliminación | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-057 | Eliminar una tarea existente | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-058 | Eliminar la última tarea | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-059 | Eliminar con detalle abierto | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-060 | Eliminar dentro de un filtro | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-061 | Confirmación ligada al id correcto | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-062 | Evitar DELETE duplicado | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-063 | Fallo de conexión al cargar | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-064 | Error HTTP 500 al cargar | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-065 | Reintentar carga tras un fallo | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-066 | Crear falla sin perder el borrador | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-067 | Recuperar una creación fallida | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-068 | Editar falla y mantiene el estado confirmado | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-069 | Completar falla sin cambiar el estado | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-070 | Eliminar falla sin quitar la tarea | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-071 | Detalle devuelve 404 | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-072 | Detalle lento y acciones duplicadas | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-073 | Error HTTP sin cuerpo esperado | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-074 | Validación del servidor al guardar | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-075 | Reintentar tras fallo de mutación: alcance real | UI simulada | OBSERVADA | Reintentar recarga la lista; no repite PATCH |
| PW-076 | Respuesta perdida después de persistir | Exploratoria | OBSERVADA | POST persistido pese al error de red en UI; idempotencia no contratada |
| PW-077 | Completar recorrido solo con teclado | Exploratoria | OBSERVADA | Recorrido funcional completo por teclado ejecutado; revisión visual de foco pendiente. |
| PW-078 | Etiquetas y mensajes del título | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-079 | Anuncios de éxito y error | E2E | OBSERVADA | Roles status/alert comprobados; anuncio con lector de pantalla pendiente |
| PW-080 | Ventana móvil de referencia | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-081 | Anchura estrecha de 320 píxeles | Exploratoria | OBSERVADA | A 320 px no desborda la página, pero el extremo derecho del filtro Completadas queda recortado unos 4 px por el panel con overflow hidden. El botón sigue siendo accionable; objetivo de calidad exploratorio, sin modificar el diseño aprobado. |
| PW-082 | Escritorio y texto largo | Exploratoria | OBSERVADA | Geometría escritorio y textos límite comprobados; revisión visual propuesta |
| PW-083 | Zoom del navegador y foco | Exploratoria | BLOQUEADA | Requiere zoom real de navegador y revisión de foco; reducir viewport no acredita zoom al 200%. |
| PW-084 | Comparación visual controlada | UI simulada | BLOQUEADA | No existe referencia visual aprobada; no se genera una para aprobarse contra sí misma. |
| PW-085 | Fechas en zona del navegador | UI simulada | SUPERADA | Aserciones del escenario completadas. |
| PW-086 | Compatibilidad entre motores | Exploratoria | BLOQUEADA | Firefox/WebKit no configurados en el proyecto; conexión MCP actual con Chrome. |
| PW-087 | POST válido y cabecera Location | API | SUPERADA | Aserciones del escenario completadas. |
| PW-088 | GET lista vacía | API | SUPERADA | Aserciones del escenario completadas. |
| PW-089 | GET detalle existente | API | SUPERADA | Aserciones del escenario completadas. |
| PW-090 | PATCH parcial conserva lo omitido | API | SUPERADA | Aserciones del escenario completadas. |
| PW-091 | PATCH description=null | API | SUPERADA | Aserciones del escenario completadas. |
| PW-092 | PATCH de estado booleano | API | SUPERADA | Aserciones del escenario completadas. |
| PW-093 | DELETE y ausencia posterior | API | SUPERADA | Aserciones del escenario completadas. |
| PW-094 | Filtros completed válidos | API | SUPERADA | Aserciones del escenario completadas. |
| PW-095 | Rechazar filtros no documentados | API | SUPERADA | Aserciones del escenario completadas. |
| PW-096 | Rechazar títulos ausentes o inválidos | API | SUPERADA | Aserciones del escenario completadas. |
| PW-097 | Límite real del título en API | API | SUPERADA | Aserciones del escenario completadas. |
| PW-098 | Límite real de descripción en API | API | SUPERADA | Aserciones del escenario completadas. |
| PW-099 | Rechazar tipo incorrecto de descripción | API | SUPERADA | Aserciones del escenario completadas. |
| PW-100 | Rechazar booleanos entre comillas | API | SUPERADA | Aserciones del escenario completadas. |
| PW-101 | Proteger identificador y fechas | API | SUPERADA | Aserciones del escenario completadas. |
| PW-102 | Rechazar propiedades desconocidas | API | SUPERADA | Aserciones del escenario completadas. |
| PW-103 | No permitir estado al crear | API | SUPERADA | Aserciones del escenario completadas. |
| PW-104 | PATCH vacío | API | SUPERADA | Aserciones del escenario completadas. |
| PW-105 | Actualización atómica ante error | API | SUPERADA | Aserciones del escenario completadas. |
| PW-106 | Cuerpo JSON mal formado | API | SUPERADA | Aserciones del escenario completadas. |
| PW-107 | JSON válido que no es objeto | API | SUPERADA | Aserciones del escenario completadas. |
| PW-108 | Content-Type incorrecto | API | SUPERADA | Aserciones del escenario completadas. |
| PW-109 | Recurso inexistente | API | SUPERADA | Aserciones del escenario completadas. |
| PW-110 | Métodos no admitidos | API | SUPERADA | Aserciones del escenario completadas. |
| PW-111 | Fechas y serialización del contrato | API | SUPERADA | Aserciones del escenario completadas. |
| PW-112 | Espacios Unicode y normalización en backend | API | SUPERADA | Aserciones del escenario completadas. |
| PW-113 | Recorrido completo de regresión | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-114 | Dos pestañas y reconciliación explícita | E2E | SUPERADA | Aserciones del escenario completadas. |
| PW-115 | Conflicto de edición entre pestañas | Exploratoria | OBSERVADA | Última escritura prevalece; no hay detección de conflictos contratada |
| PW-116 | Listado de volumen moderado | Exploratoria | OBSERVADA | 100 tareas y edición de extremos comprobadas; sin umbral de rendimiento acordado |
| PW-117 | Aislamiento de la base E2E | Infraestructura | SUPERADA | Destino tasks_e2e.db; bases protegidas y fuentes contrastadas por hash. |
| PW-118 | Independencia entre casos | Infraestructura | SUPERADA | Aserciones del escenario completadas. |
| PW-119 | Categorías: comprobación futura de interfaz | Futura | NO_APLICA | API e interfaz de categorías todavía sin implementar ni contrato acordado. |
| PW-120 | Categorías: borrado en uso futuro | Futura | NO_APLICA | Borrado de categorías desde API/UI pendiente de diseño; no inventar código HTTP. |

## Integridad y trabajo concurrente

Durante la ejecución cambiaron estos documentos por el trabajo del orquestador registrado en la entrada 46 de la bitácora: ['docs/agentes-desarrollo.md', 'docs/planificador.md', 'AGENTS.md', 'docs/ARQUITECTURA-AGENTES-V2.md', 'docs/handoff.md']. Se separan de los cambios inesperados y no se atribuyen a las pruebas. Los archivos de backend/frontend se contrastaron por hash.

## Evidencias y reproducción

- [Resultados estructurados](../.runtime/pruebas-mcp/results.json) y [resumen de integridad](../.runtime/pruebas-mcp/summary.json).
- [Identificación del servidor MCP](../.runtime/pruebas-mcp/initialize.json), [catálogo real de herramientas](../.runtime/pruebas-mcp/tools.json) y [registro JSON-RPC de llamadas](../.runtime/pruebas-mcp/rpc-events.jsonl).
- [Guiones de escenarios ejecutados](../.runtime/pruebas-mcp/scenarios.js) y [cliente que los envía mediante MCP](../.runtime/pruebas-mcp/run.py). Los ficheros `batch-*.json` conservan el código y la respuesta de cada llamada; las capturas están en `.runtime/pruebas-mcp/evidencias/`.
- Los artefactos de `.runtime` son locales y están ignorados por Git. Se conservan para revisión, pero su presencia no constituye una suite versionada ni un workflow de CI.
- Una repetición requiere restaurar el entorno aislado, conectar el cliente MCP y conservar la separación de bases. No dirigir el guion a los puertos de desarrollo ni ejecutar simultáneamente otra limpieza sobre `tasks_e2e.db`.

## Límites que permanecen

Los casos de zoom real, referencia visual aprobada y otros motores no se dan por superados. Las categorías no tienen aún API o interfaz para los dos casos futuros. Las observaciones de Unicode, respuesta perdida y conflictos de edición describen lo ejecutado y no incorporan requisitos nuevos. La interacción con un lector de pantalla y la revisión visual de foco siguen pendientes.

## Cierre del entorno

La limpieza final dejó cero tareas en la base E2E. Se cerró el navegador MCP y se detuvieron únicamente los procesos iniciados para esta ejecución; los puertos 4201, 8001 y 8768 quedaron sin escucha. Las bases protegidas conservaron sus hashes. El pequeño recorte del filtro a 320 px se confirmó con geometría y captura adicional, conservadas en `mobile-check.json` y `evidencias/PW-081-mobile-check.png` dentro de los artefactos locales.
