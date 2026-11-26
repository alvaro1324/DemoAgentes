# Plan de contraste de los filtros de estado

- **Petición:** planificar la incorporación de Todas, Pendientes y Completadas a la lista de tareas, contrastando el repositorio actual.
- **Fecha local:** 26 de noviembre de 2026, Europe/Madrid.
- **Estado:** sin desarrollo necesario para el comportamiento solicitado; verificación en ejecución pendiente.
- **Alcance de este ensayo:** planificación por el agente registrado `planificador`, sin implementación ni ejecución de pruebas.

## Fuentes y referencia local

- [AGENTS.md](../AGENTS.md), skills [bitacora](../.agents/skills/bitacora/SKILL.md) y [analisis-diseno](../.agents/skills/analisis-diseno/SKILL.md), este último en modo revisión.
- [Análisis y diseño](analisis-diseño.md), secciones 1, 5, 6 y 8; [decisiones de la versión 0.1](version-0.1.md); [README](../README.md); [bitácora](bitacora.md), especialmente entradas 16–18, 24, 26, 28 y 40.
- API y consulta: [TaskController.php](../backend/src/Controller/TaskController.php), [TaskRepository.php](../backend/src/Repository/TaskRepository.php) y [TaskApiTest.php](../backend/tests/Functional/TaskApiTest.php).
- Angular: [app.ts](../frontend/src/app/app.ts), [app.html](../frontend/src/app/app.html), [app.css](../frontend/src/app/app.css), [task.ts](../frontend/src/app/models/task.ts), [task.service.ts](../frontend/src/app/services/task.service.ts), [app.spec.ts](../frontend/src/app/app.spec.ts) y [task.service.spec.ts](../frontend/src/app/services/task.service.spec.ts).
- Recorrido y aislamiento: [tasks.spec.ts](../frontend/e2e/tasks.spec.ts), [playwright.config.ts](../frontend/playwright.config.ts), [e2e-backend.mjs](../frontend/scripts/e2e-backend.mjs), [phpunit.xml.dist](../backend/phpunit.xml.dist) y `backend/.env.test`.
- Comandos contrastados mediante lectura: [test-backend.ps1](../scripts/test-backend.ps1), [test-frontend.ps1](../scripts/test-frontend.ps1), [test-e2e.ps1](../scripts/test-e2e.ps1), [common.ps1](../scripts/common.ps1) y [package.json](../frontend/package.json).

`git status --short --branch` y `git log -5 --oneline` sitúan el trabajo en `main`, con HEAD `5bf0b27` y referencia local `origin/main` coincidente. Existen modificaciones y archivos sin seguimiento anteriores al ensayo, incluidos cambios de categorías, pruebas y documentación. Se analiza el árbol de trabajo actual y se conservan esos cambios. No se consulta el remoto ni se reconstruye un estado pasado.

## Estado observado y diferencia real

Los tres filtros forman parte del MVP documentado y ya están implementados:

1. `App.filters` contiene Todas (`all`), Pendientes (`pending`) y Completadas (`completed`); `filter` comienza en `all`. `visibleTasks` selecciona tareas por `isCompleted`. `pendingCount` y `completedCount` se calculan sobre todas las tareas cargadas.
2. `app.html` presenta los botones, cambia `filter`, indica la selección mediante clase `active` y `aria-pressed`, y recorre `visibleTasks`. Distingue «Todo empieza con una tarea» de «No hay tareas en este estado». `app.css` define la apariencia del filtro activo.
3. `TaskService.list()` admite los tres valores: sin parámetro para Todas, `completed=false` para Pendientes y `completed=true` para Completadas. `App.load()` solicita el listado completo; cambiar de filtro en la interfaz opera localmente sobre ese conjunto, conservando los contadores globales. Esto coincide con las decisiones de la 0.1.
4. `TaskController::list()` valida el parámetro y llama a `TaskRepository::matchingStatus(?bool)`. El repositorio aplica el estado cuando corresponde y ordena por id descendente. El contrato vigente prevé HTTP 400 para filtros inválidos.
5. `App.toggle()` actualiza las tareas tras una respuesta correcta del backend; los valores calculados vuelven a determinar pertenencia al filtro y contadores. Ante error conserva el estado previo y muestra un mensaje.

**Decisión del plan:** basta una verificación posterior de lo existente. No hay una diferencia funcional identificada que justifique rehacer los filtros ni cambiar diseño, modelo, persistencia, contrato HTTP, servicio o interfaz. Este plan no modifica ni aprueba un contrato nuevo.

Quedan fuera categorías en API/Angular, filtros adicionales, paginación, persistencia de la selección, prioridades, cuentas, plantillas y recurrencia. El único archivo nuevo previsto en este ensayo es este plan; la bitácora existente recibe una entrada.

## Evidencia de pruebas disponible

| Pruebas existentes, leídas | Cobertura observada | Límite de la evidencia |
| --- | --- | --- |
| `TaskApiTest::testFiltersAndOrdering()` y `testCompleteLifecycleAndPersistence()` | Listado sin filtro, pendientes, completadas, orden y rechazo de `completed=yes` y `completed[]=true`. | Completadas se comprueba en el ciclo con una única tarea; no es un caso de ambos estados mezclados para ese filtro. |
| `task.service.spec.ts`, «consulta los filtros con los valores del contrato» | Correspondencia entre los tres valores del servicio y las URLs esperadas. | No demuestra el filtrado real de la base. |
| `app.spec.ts`, «muestra tareas y filtra por estado con contadores coherentes» | Listado mixto inicial, filtro pendiente y contadores globales; otros casos cubren carga, vacío, error y actualización fallida. | Cambia la señal directamente; ese caso no pulsa los tres botones ni comprueba `aria-pressed`. |
| `frontend/e2e/tasks.spec.ts`, recorrido de creación, edición, finalización, filtrado, reapertura y eliminación | Pulsa Pendientes, Completadas y Todas; comprueba vacíos al completar y reabrir. | El recorrido usa una tarea; no cubre todas las combinaciones de un listado mixto. |

La entrada 18 de la bitácora registra una ejecución histórica correcta de `scripts/test.ps1`: 19 pruebas PHPUnit, 14 Vitest y 2 Playwright. Las entradas 24 y 26 registran cambios posteriores de entidad y categorías, incluida la preparación de `TaskApiTest`, con pruebas sin ejecutar. Aquellos resultados no acreditan el árbol actual. En este ensayo solo se han leído las pruebas.

**Pruebas por añadir:** ninguna imprescindible para incorporar una funcionalidad ya existente. Si una verificación posterior encuentra una regresión, concretar primero el fallo y añadir su caso en el archivo de pruebas de la capa afectada. La cobertura adicional de listado mixto en Completadas y de interacción/selección de los tres botones es una mejora opcional, no desarrollo requerido por este encargo.

## Criterios para una verificación posterior

Estos criterios expresan el comportamiento existente y cómo contrastarlo; no son resultados de ejecución.

| Criterio observable | Comprobación prevista y capa adecuada |
| --- | --- |
| Todas es la selección inicial y reúne tareas pendientes y completadas. | Cargar una tarea de cada estado y contrastar el listado inicial; componente Angular. El caso mixto inicial ya está escrito. |
| Pendientes muestra solo `isCompleted=false`; Completadas muestra solo `isCompleted=true`; volver a Todas recupera el conjunto. | Alternar los botones con datos de ambos estados; componente/recorrido de navegador. La evidencia automatizada existente se limita a los casos descritos arriba. |
| El botón seleccionado tiene `aria-pressed=true` y los otros `false`. | Inspeccionar los tres botones tras cada cambio; comprobación de interfaz en navegador. No hay una aserción dedicada en las pruebas leídas. |
| Los contadores de cada estado mantienen sus totales al cambiar de filtro. | Comparar los contadores antes y después de alternar filtros; componente Angular. El caso escrito comprueba un pendiente y una completada. |
| Completar o reabrir recoloca la tarea en el conjunto visible del filtro activo tras confirmar la API. Un fallo conserva el estado previo. | Recorrido E2E existente para las transiciones y prueba de componente existente para el fallo de actualización. |
| Un filtro sin coincidencias muestra «No hay tareas en este estado»; Todas vacía muestra «Todo empieza con una tarea». | Recorrido E2E y prueba de componente ya escritos para los vacíos. |
| La API devuelve todos los estados sin parámetro, filtra con `true/false`, conserva el orden descendente y rechaza valores inválidos con 400. | Pruebas funcionales de API existentes, que ejercitan la consulta Doctrine con persistencia de prueba. El servicio Angular comprueba las URLs. |

## Pasos posteriores y comandos previstos

Los siguientes pasos quedan fuera de la ejecución de este ensayo. Solo se realizarían en un encargo posterior que autorice las comprobaciones correspondientes.

1. **API y persistencia existente.** Sin cambios previstos en `backend/src/Controller/TaskController.php`, `backend/src/Repository/TaskRepository.php` ni `backend/tests/Functional/TaskApiTest.php`. Comando desde la raíz: `./scripts/test-backend.ps1`. No depende de otros pasos de ejecución. Termina cuando se dispone del resultado actual de las pruebas de filtros/orden/ciclo y se identifican expresamente posibles fallos de otras pruebas. PHPUnit fuerza `APP_ENV=test`; `.env.test` apunta a `backend/var/tasks_test.db` y `TaskApiTest::setUp()` comprueba ese destino antes de reconstruir el esquema.
2. **Servicio e interfaz Angular existente.** Independiente del paso 1. Sin cambios previstos en `frontend/src/app/`. Comando desde la raíz: `./scripts/test-frontend.ps1`; incluye formato, Vitest y compilación. Termina con resultados actuales de servicio, filtros, contadores, carga, vacío y errores, distinguiendo los criterios aún sin aserción directa.
3. **Recorrido integrado y criterios de interfaz.** Depende de resolver cualquier fallo relevante de los pasos 1 y 2. Ejecutar en un encargo autorizado `./scripts/test-e2e.ps1` desde la raíz. El script usa Playwright y sus servidores propios en 8001/4201; el lanzador migra exclusivamente `backend/var/tasks_e2e.db` y cada caso elimina tareas de su entorno E2E. Requiere dependencias y Chromium previamente disponibles, y puertos libres. Termina con evidencia del recorrido existente y, si se solicita completar la comprobación de la tabla, revisión en ese entorno aislado del listado mixto y de `aria-pressed`.
4. **Registrar la conclusión de la verificación.** Depende de las comprobaciones que se autoricen y realicen. Anotar resultados reales y limitaciones en `docs/bitacora.md`; actualizar este plan solo si se solicita. Si todo coincide, cerrar sin desarrollo. Si aparece un fallo, describir reproducción, capa y prueba de regresión necesaria antes de planificar su corrección.

No se han ejecutado estos comandos. No se propone instalar herramientas ni usar `-InstallBrowser` como parte del ensayo. La base local `backend/var/tasks.db` debe conservarse; nunca dirigir las comprobaciones a ella.

## Riesgos, dudas y siguiente paso

- Los cambios locales de categorías y de preparación de pruebas pueden afectar futuras ejecuciones; no deben revertirse ni confundirse con cambios de filtros.
- Las pruebas existentes tienen los límites de cobertura descritos. La lectura estática no confirma el comportamiento del navegador ni que la batería actual pase.
- El filtrado local supone disponer del conjunto completo, como sucede en el MVP sin paginación. Cambiar esa premisa exigiría otro análisis y no forma parte de este plan.

No hay dudas funcionales materiales para la petición recibida. No se ha proporcionado una incidencia que vincular. El siguiente paso es revisar este resultado; cualquier ejecución o corrección pertenece a un encargo posterior. La entrega del plan no implica pruebas superadas ni verificación funcional terminada.
