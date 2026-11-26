# Plan: búsqueda local de tareas por título

- Petición: implementar el buscador por título solicitado por el usuario y conservar los filtros de estado.
- Fecha local: 26 de noviembre de 2026, Europe/Madrid.
- Estado: listo para revisión.
- Referencia Git observada por el padre: `6adfd52`.
- Modalidad: planificación asistida. El padre ha suministrado las lecturas y evidencias del repositorio; el planificador no ha leído ni escrito archivos directamente ni ejecutado comandos o pruebas.
- Fuentes: instrucciones `AGENTS.md` heredadas; extractos facilitados de `docs/analisis-diseño.md`, `docs/version-0.1.md`, `README.md`, bitácora reciente, código y pruebas Angular, scripts y configuración Playwright. Las referencias a los skills `bitacora` y `analisis-diseno` se han facilitado por el padre; no consta una lectura directa de sus archivos por este agente.

## Objetivo y alcance

Encontrar tareas escribiendo parte del título, ignorando mayúsculas, minúsculas y espacios exteriores. La búsqueda se combina con el estado seleccionado y conserva los contadores globales.

El cambio afecta únicamente a la interfaz Angular, sus pruebas y documentación. No requiere cambios en API, tipos HTTP, servicios, entidades, persistencia ni dependencias. No se guarda la búsqueda entre recargas de página.

Este plan no modifica el diseño aprobado. El encargo autoriza incorporar la búsqueda local al alcance; el responsable de documentación debe registrar esa ampliación antes de implementar.

## Estado observado

Según las lecturas y comprobaciones suministradas por el padre:

- `frontend/` y `backend/` no presentan cambios locales iniciales.
- Existen cambios previos en agentes, instrucciones, documentación y monitor. Deben conservarse y distinguirse del encargo actual.
- `docs/plan-buscador-titulo.md` no existe; es un archivo nuevo.
- `frontend/src/app/app.ts` contiene un componente standalone `App`. `visibleTasks` filtra `tasks` mediante el signal `filter`.
- `pendingCount` y `completedCount` se calculan directamente sobre `tasks`; ya cumplen la independencia necesaria.
- `load()` reemplaza el contenido de `tasks` y no reinicia el filtro de estado.
- `app.html` presenta el encabezado, el botón Actualizar, las pestañas de estado y después los estados de carga, vacío o listado.
- El mensaje vacío actual distingue entre Todas y un estado concreto. Debe conservarse cuando no haya una búsqueda activa.
- `app.spec.ts` usa inicialmente una tarea pendiente y otra completada. La igualdad de cantidades limita su capacidad para detectar errores en contadores.
- No hay implementación ni pruebas del buscador en las fuentes suministradas.
- La entrada reciente 58 registra un intento de orquestación sin ejecución ni dictamen. No acredita verificaciones superadas.

## Pasos y dependencias

1. Registrar el alcance funcional, antes del código.
   - Archivos existentes: `docs/analisis-diseño.md` y, si describe el alcance vigente, `docs/version-0.1.md`.
   - Responsable: padre/orquestador como único escritor de documentación compartida.
   - Cambio: documentar los ocho criterios del encargo y acotar la ampliación a filtrado local.
   - Terminación: el diseño deja de excluir esta búsqueda concreta y conserva fuera de alcance la búsqueda en API y su persistencia.

2. Implementar el estado y la derivación del listado.
   - Depende del paso 1.
   - Archivo existente: `frontend/src/app/app.ts`.
   - Responsable necesario: `desarrollador_frontend`.
   - Cambio: incorporar estado independiente para el texto buscado y derivar una consulta normalizada con recorte de espacios exteriores y comparación sin distinguir mayúsculas.
   - Combinar las condiciones de título y estado dentro de `visibleTasks`.
   - Mantener los contadores existentes calculados sobre todas las tareas cargadas.
   - Mantener el texto al actualizar, crear, editar, completar o eliminar tareas; las mutaciones existentes deben recalcular la vista mediante sus signals.
   - Terminación: escribir modifica inmediatamente las filas visibles, y `load()` no restablece el texto.
   - No hace falta debounce, servicio nuevo ni cambio del formulario de edición. Elegir el mecanismo de entrada conforme a las convenciones del componente.

3. Incorporar el campo y los estados visibles.
   - Depende del paso 2.
   - Archivos existentes: `frontend/src/app/app.html` y `frontend/src/app/app.css`.
   - Cambio: colocar sobre el listado un campo con etiqueta visible «Buscar por título», asociado mediante `for` e `id`.
   - Añadir botón de tipo `button`, con nombre accesible que indique limpiar la búsqueda; al activarlo, vaciar el texto y conservar el estado seleccionado.
   - Mantener el diseño adaptable y los estilos existentes.
   - Cuando la consulta normalizada no esté vacía, existan tareas cargadas y no haya coincidencias combinadas, mostrar exactamente «No hay tareas que coincidan con la búsqueda».
   - Si el conjunto cargado está vacío, conservar el mensaje vacío inicial aplicable. Si la consulta normalizada está vacía, conservar los mensajes actuales por estado.
   - Mantener la prioridad del estado de carga sobre los estados vacíos.
   - Terminación: etiqueta, botón, mensajes y filas reflejan los criterios del encargo sin alterar el editor o el detalle.

4. Añadir pruebas de comportamiento.
   - Depende de los pasos 2 y 3.
   - Archivo existente: `frontend/src/app/app.spec.ts`.
   - Usar una colección específica con cantidades desiguales, por ejemplo tres pendientes y una completada. Debe incluir títulos coincidentes en ambos estados y tareas que no coincidan.
   - Probar las entradas mediante eventos del campo y los controles visibles, verificando filas o títulos renderizados.
   - Conservar las pruebas previas; adaptar expectativas solo cuando el cambio funcional lo requiera.
   - Terminación: cada criterio de la tabla siguiente queda cubierto y las pruebas distinguen los totales globales del subconjunto mostrado.

5. Ejecutar comprobaciones y revisión independiente.
   - Depende del paso 4.
   - Ejecutar desde la raíz `.\scripts\test-frontend.ps1`; el script existente encadena `format:check`, `test` y `build` del frontend.
   - Revisar el diff respecto al estado inicial y separar expresamente los cambios previos.
   - Encargar al `verificador` la revisión de alcance, criterios, accesibilidad, pruebas y evidencias reales.
   - El orquestador puede coordinar hasta tres ciclos de corrección y nueva revisión. El dictamen debe corresponder a la última versión del cambio.
   - Terminación: dictamen independiente vigente y resultados de las comprobaciones, o bloqueo explícito con causas.
   - Si un agente requerido no está disponible, declarar la limitación; no atribuirle trabajo ni sustituir su dictamen por una comprobación del desarrollador.

6. Actualizar documentación y preparar entrega.
   - Depende de los resultados anteriores.
   - Archivos existentes: `docs/bitacora.md` y documentación funcional afectada.
   - El padre centraliza el registro de implementación, comprobaciones, hallazgos y correcciones, conservando el historial.
   - Entregar cambios, dictamen, pruebas ejecutadas y pendientes. No realizar commit, push ni PR.

## Criterios y comprobaciones previstas

| Criterio | Comprobación observable | Capa |
| --- | --- | --- |
| C1. Etiqueta visible | Existe «Buscar por título» y está asociada al campo. | Componente Angular |
| C2. Coincidencia parcial sin distinguir mayúsculas | Introducir un fragmento con capitalización distinta actualiza las filas mediante el evento de entrada, sin envío ni actualización manual. | Componente Angular |
| C3. Espacios exteriores y búsqueda vacía | Un fragmento rodeado de espacios da el mismo resultado; texto vacío o solo espacios muestra todas las tareas del estado seleccionado. | Componente Angular |
| C4. Combinación con estado | Un título compartido por pendientes y completadas devuelve solo el estado elegido; cambiar el estado conserva el texto. | Componente Angular |
| C5. Contadores globales | Con tres pendientes y una completada, buscar y cambiar de estado mantiene total cuatro, pendientes tres y completadas una. | Componente Angular |
| C6. Mensajes vacíos | Consulta sin coincidencias muestra el mensaje exacto; lista inicialmente vacía conserva su mensaje; sin consulta se conserva el vacío por estado. | Componente Angular |
| C7. Limpieza accesible | Activar el botón por su nombre accesible vacía el campo y restaura las filas del estado seleccionado, sin cambiar contadores. | Componente Angular |
| C8. Conservación al actualizar | Introducir búsqueda, actualizar y suministrar una nueva respuesta del servicio conserva el campo y aplica la consulta a la nueva colección. | Componente Angular |

En C8 conviene que la respuesta actualizada incluya una tarea nueva coincidente y otra no coincidente: así se comprueba que se filtran los datos nuevos y no se conserva accidentalmente una vista obsoleta.

## Pruebas existentes y pendientes

Las pruebas existentes suministradas cubren carga, filtros, vacío, validación, creación, errores de guardado y cambio de estado, detalle/edición, eliminación y reintento. Leer su contenido no acredita su ejecución.

Este plan no ha ejecutado ninguna prueba. Quedan por ejecutar las comprobaciones del script de frontend después de implementar.

No es necesario añadir Playwright para cubrir este cambio local si las pruebas de componente verifican los criterios. Si se decide ejecutar o ampliar el recorrido existente, utilizar el entorno aislado configurado: backend en 8001, frontend en 4201, servidores sin reutilización y limpieza de tareas de esa API de pruebas. Ejecutarlo con navegador visible, como exige el usuario; por ejemplo, desde `frontend`, `npm run e2e -- --headed`. No dirigir la limpieza hacia la API de desarrollo.

## Riesgos y decisiones

- Un filtro aplicado a `tasks` en lugar de a su vista derivada alteraría contadores y datos disponibles: conservar la colección completa.
- El control de búsqueda no debe quedar ligado al formulario de edición ni provocar su envío.
- Las cantidades iguales de los fixtures actuales pueden ocultar errores: usar cantidades distintas y coincidencias repartidas entre estados.
- El mensaje de búsqueda debe distinguirse del vacío inicial y del vacío por estado.
- No se solicita ignorar tildes, normalizar espacios interiores ni buscar en la descripción; no ampliar esas reglas.
- Los cambios previos del monitor y de los agentes quedan fuera de este encargo.

No hay dudas materiales de comportamiento pendientes con los criterios recibidos. La disponibilidad y ejecución efectiva de desarrollador y verificador deben comprobarse en la fase de implementación.

## Siguiente paso

El padre debe materializar este plan y su entrada de bitácora, registrar el alcance funcional y asignar exclusivamente el tramo Angular al desarrollador frontend. El trabajo del planificador termina con esta entrega; no hay implementación ni dictamen de verificación emitidos por este agente.
