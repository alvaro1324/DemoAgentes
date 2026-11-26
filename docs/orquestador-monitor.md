# Visor en directo del orquestador

Herramienta local solicitada el 26 de noviembre de 2026 y rediseñada posteriormente
ese día para seguir agentes y reproducir procesos. Muestra cinco cajas Mermaid:
Orquestador (coordina y decide), Planificador (define el plan), Backend (API/datos),
Frontend (interfaz/pruebas) y Verificador (revisa y dictamina). No ejecuta el flujo
ni concede aprobaciones por sí misma.

## Seguir un proceso y reproducirlo

1. En **Procesos**, elegir un proceso real o una demostración. Cada tarjeta muestra
   su nombre, estado, fecha y número de pasos. Se guardan automáticamente.
2. La franja superior explica **qué está pasando**. Las cajas verdes indican
   actividad registrada; varias pueden estar verdes si trabajan en paralelo.
   Las cajas discontinuas representan una etapa sin actividad confirmada.
3. El log muestra cronológicamente agente, acción y resumen. Las decisiones se
   muestran expresamente; **Ver detalle** abre contexto, evidencia y versión.
   Se puede filtrar el log por agente. En escritorio se ve junto al diagrama.
4. **Reproducir** comienza desde el inicio si estás al final. **Pausar** conserva
   la posición; **Anterior/Siguiente** avanzan por eventos y la barra permite
   situarse en cualquier paso. El log y las cajas reconstruyen solo ese instante.
5. Elegir **1x, 2x, 5x, 10x, 25x o 100x** acelera los intervalos originales. Una
   espera larga sigue siendo larga a 1x: se puede acelerar o saltar al siguiente paso.
6. **Volver al directo** recupera los eventos actuales. Mientras reproduces se
   congela tu captura, aunque los pasos nuevos continúen guardándose.
7. **Descargar grabación** exporta el proceso completo en JSON, no solo el paso
   visible. Su estado actual se conserva aunque cierres el navegador o reinicies
   el servidor. El archivo descargado no vuelve a ejecutar agentes.

Las grabaciones antiguas solo contienen la información que se registró. Si no
hubo eventos de actividad, se indican las etapas y se muestra esa limitación.
No se reconstruyen retrospectivamente acciones o decisiones inexistentes.

## Instalación y arranque

Requiere Node.js 20.19 o compatible y npm. Desde la raíz del repositorio:

```powershell
npm --prefix tools/orchestrator-monitor ci
npm --prefix tools/orchestrator-monitor start
```

Abrir <http://127.0.0.1:8790>. Mantener la terminal abierta; Ctrl+C detiene el visor.
`ORCHESTRATOR_PORT` cambia el puerto. El servidor escucha exclusivamente en loopback.
Mermaid 11.12.2 está instalado localmente; no requiere CDN al visualizar.

En otra terminal, para ver una animación completa y claramente identificada:

```powershell
npm --prefix tools/orchestrator-monitor run demo
```

Seleccionar «Demostraciones». Recorre los cinco agentes, desarrollo paralelo,
decisiones, verificación, corrección y cierre con evidencia ficticia.
No inicia agentes ni pruebas de la aplicación.
También se puede abrir <http://127.0.0.1:8790/?mode=demo> para seleccionar ese origen.

## Hooks reales y confianza del cliente

`.codex/hooks.json` registra SessionStart, SessionEnd, SubagentStart, SubagentStop,
Stop e Interrupt. El comando resuelve la raíz Git aunque se inicie en una subcarpeta.
`hook.mjs` recibe JSON por stdin, filtra campos, verifica el proyecto y escribe un
evento atómico. Siempre devuelve `{}` con salida 0 para no alterar al agente.
No lee transcripts ni guarda prompts, resultados o entradas de herramientas.

Según la [documentación oficial de hooks](https://learn.chatgpt.com/docs/hooks),
los hooks del proyecto requieren que el cliente cargue la configuración y confíe
en la definición revisada. En una nueva sesión, utilizar `/hooks` en CLI, o la
interfaz de revisión de hooks del cliente que la exponga. Este repositorio no
modifica la confianza personal ni la elude. La carga no se aplica retroactivamente
a esta conversación. Que el adaptador funcione por stdin no prueba su despacho nativo.

## Contrato de eventos y correlación

Los hooks nativos identifican sesión y agentes activos/finalizados, pero no pueden
inferir el dictamen ni el contador. El orquestador tiene instrucciones para emitir
estados y actividad explícitos mediante `emit.mjs`. Cada evento identifica `sessionId`, `runId`,
`kind`, `source`, fecha UTC e id UUID. El servidor envía instantáneas con SSE y
reconstruye el estado desde disco al reiniciar; no depende de mantener el navegador abierto.

Antes de iniciar un cliente Codex desde una terminal, se puede fijar
`$env:ORCHESTRATOR_RUN_ID = 'encargo-001'`. Los subprocesos heredan el valor.
Usar el mismo `--run` en las comunicaciones explícitas y el `--session` real que
aportan los hooks. Sin esta variable, los hooks usan el id de sesión como runId:
usar ese mismo valor en `--run` para agruparlos. Un nuevo encargo usa un nuevo runId.
Una sesión ya abierta no hereda variables añadidas después en otra terminal.

Ejemplo manual reproducible del contrato, sustituyendo SESSION por la sesión real:

```powershell
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --state CONTEXTO --cycle 0
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --state DESARROLLO --cycle 0
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --state VERIFICACION --cycle 0 --revision diff-sha256
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --state APROBADO --cycle 0 --verdict APROBADO --revision diff-sha256 --evidence docs/informe-del-verificador.md
```

El ejemplo no constituye evidencia de una ejecución real. `revision` debe
identificar la versión revisada, incluyendo los cambios sin commit: por ejemplo,
hash del diff y hashes de archivos nuevos. El adaptador no calcula ni comprueba
el contenido de ese informe. La responsabilidad del dictamen sigue en el verificador.
Nunca usar el ejemplo para aparentar una aprobación inexistente.

Para actividad detallada, usar los mismos identificadores y un nombre legible del
proceso con `--title` al emitir CONTEXTO. Ejemplos de comunicación operativa:

```powershell
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --kind activity --role desarrollador_frontend --action start --message "Empiezo la interfaz y sus pruebas"
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --kind activity --role orquestador --action decision --message "El contrato ya está acordado" --decision "Asignar archivos disjuntos a las dos capas" --detail "Cada desarrollador devuelve sus evidencias al coordinador"
node tools/orchestrator-monitor/emit.mjs --session SESSION --run encargo-001 --kind activity --role desarrollador_frontend --action finish --message "Interfaz entregada con sus pruebas"
```

Acciones: `start`, `progress`, `decision`, `finish`, `error`, `handoff`. Rol obligatorio
de los cinco definidos; resumen obligatorio hasta 500 caracteres; `detail` hasta
4.000, `decision` hasta 2.000, `title` hasta 160. `--agent` permite correlacionar una
instancia real con sus hooks. Registrar inicio, avances relevantes, decisiones,
impedimentos y entrega; si hay intermediación del padre, explicarla. Son resúmenes
públicos de trabajo, no conversaciones o razonamiento privado. No incluir secretos.
Una decisión o cierre de actividad no equivale a aprobar el estado del proceso.

`emit.mjs` valida el formato antes de persistir. El reductor valida la secuencia;
una transición incoherente aparece en «Eventos rechazados» y no cambia el estado.
Campos adicionales del hook se descartan. Los campos libres explícitos deben
contener solo referencias breves sin secretos; no existe un detector de secretos.

## Estados y reglas

| Estado | Significado |
| --- | --- |
| CONTEXTO | Encargo observado; contador 0 |
| PLANIFICACION | Preparación del plan, si se necesita |
| DESARROLLO | Implementación por contrato acordado |
| VERIFICACION | Revisión independiente de una versión identificada |
| CORRECCION | Incrementa el ciclo global: 1, 2 o 3 |
| APROBADO | Dictamen comunicado con evidencia y versión coincidente |
| BLOQUEADO | Condición necesaria ausente o ciclos agotados |
| PLAN_ENTREGADO | Fin de un encargo de solo planificación |

El Mermaid descargable está en `tools/orchestrator-monitor/public/flow.mmd`.
El contador no se reinicia por capa, agente o sesión del mismo encargo: mantener
su identidad y sesión padre al continuar. Los cierres bloqueado/plan entregado
son terminales; otro encargo requiere nueva identidad. Cambios tras APROBADO
consumen otro ciclo con CORRECCION o terminan BLOQUEADO si se agotó el margen.
Stop, Interrupt y SubagentStop nunca aprueban ni bloquean el estado de negocio.

## Arquitectura y operación

```text
Codex hooks.json -> hook.mjs ---------+
Orquestador -----> emit.mjs ---------+-> archivos JSON atómicos -> server.mjs
Demo -----------> demo.mjs ----------+                         -> SSE -> HTML/Mermaid
```

Escrituras por archivo y renombrado atómico evitan compartir un JSON mutable
entre agentes. El servidor relee cada 400 ms; SSE mantiene un canal al navegador
con heartbeat cada diez segundos y reconexión automática. Cada conexión recibe
una instantánea completa: recupera los eventos ocurridos durante una desconexión.
Se conservan **todos** los eventos y rechazos, sin el antiguo límite de 100/20.
El log tiene desplazamiento, no recorte. La carpeta `.runtime` está ignorada por Git.

Por cada sesión/encargo se materializa automáticamente un archivo
`.runtime/orchestrator-monitor/events/recordings/<hash>.recording.json` mediante
renombrado atómico. Incluye `format: demoagentes.recording`, `version: 1`, identidad,
fechas y todos los eventos originales válidos, incluso transiciones rechazadas.
Los archivos de eventos siguen siendo la fuente para reconstruir y actualizar la
grabación. Un error de lectura o guardado se muestra en el visor; no se afirma un
guardado correcto si falla el disco. `GET /api/recording?key=<identidad>` descarga
la versión completa actual. API, directo y reproducción comparten el mismo reductor
para conservar las mismas reglas. La reproducción no modifica archivos.
Adecuado para sesiones locales pequeñas; no hay rotación automática ni servicio
multiusuario. No exponer el puerto mediante túneles o publicar datos de sesiones.
El servidor solo acepta GET, valida Host y sirve una lista fija de activos más
los módulos Mermaid; carece de endpoints de ejecución o escritura.

## Comprobaciones y documento Word

```powershell
npm --prefix tools/orchestrator-monitor test
npm --prefix tools/orchestrator-monitor run test:browser
npm --prefix tools/orchestrator-monitor run word
```

La prueba de navegador usa Playwright ya instalado en `frontend/node_modules`,
Chromium del equipo y un servidor/almacén temporal propios. No inicia Symfony ni
Angular. Si faltan esas herramientas, informa del requisito sin instalarlas por rutina.
Los tests Node cubren el contrato, ciclos, versiones, aislamiento y adaptador stdin.
El documento Word se genera con docx 9.5.1 y utiliza la captura del test de navegador
si existe. Los resultados ejecutados se registran en la bitácora y se incorporan
al Word; la generación del documento no equivale a haber ejecutado los tests.

Resultado inicial del 26 de noviembre de 2026: 13 pruebas Node y 9 comprobaciones Chromium
superadas, sin errores JavaScript. Word histórico de esa primera versión: 7 páginas abierto y exportado con
Microsoft Word para inspección visual; ZIP/XML comprobados y entradas de directorio
eliminadas para facilitar interoperabilidad. Evidencias en
`.runtime/orchestrator-monitor/`. La guía de Word y el documento distinguen estos
resultados de la integración nativa pendiente.

El rediseño posterior añade cobertura de actividad por agente y paralelismo,
decisiones, reconstrucción sin eventos futuros, grabaciones largas, pausa,
velocidad, descarga y persistencia tras reiniciar. Chromium se ejecuta **visible**
y usa exclusivamente almacén/servidor temporales propios. Los resultados nuevos
se registran en `.runtime/orchestrator-monitor-redesign/browser-report.json`
y en la bitácora. El Word anterior documenta la versión inicial; no se ha
regenerado como parte de este rediseño de interfaz.

Resultado del rediseño: **19 tests Node y 11 comprobaciones Chromium visible
superados**, sin errores JavaScript. Comprobados reproducción a100x, pausa,
detalle abierto conservado, captura sin saltos al recibir datos nuevos y grabación
de148 eventos íntegra en disco después de reiniciar servidor y navegador.

Límite de aceptación nativa: queda comprobar en una nueva sesión con hooks
cargados/confiados el lanzamiento de un orquestador real y sus agentes. Los
ensayos del visor y el adaptador no acreditan esa integración ni una revisión
independiente de este cambio.
