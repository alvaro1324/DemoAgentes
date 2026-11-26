# Primeras 15 comprobaciones con Playwright MCP visible

Fecha: 26 de noviembre de 2026.

Se repitieron exclusivamente PW-001–PW-015 del catálogo original, secuencialmente mediante llamadas `tools/call` al servidor Playwright MCP. El usuario confirmó que veía la ventana de Chrome en su escritorio. Navegador con `headless=false`, `slowMo=650 ms` y pausas adicionales, con señal del ratón y banda de progreso añadidas solo al DOM del navegador.

Resultado: 15 SUPERADA.

| Caso | Comprobación | Resultado |
| --- | --- | --- |
| PW-001 | Primera carga sin tareas | SUPERADA |
| PW-002 | Carga de un conjunto mixto | SUPERADA |
| PW-003 | Orden de creación descendente | SUPERADA |
| PW-004 | Actualizar recupera cambios externos | SUPERADA |
| PW-005 | Indicador de carga controlado | SUPERADA |
| PW-006 | Bloqueo de actualizaciones duplicadas | SUPERADA |
| PW-007 | Contador singular y plural | SUPERADA |
| PW-008 | Recarga conserva datos persistidos | SUPERADA |
| PW-009 | Crear solo con título | SUPERADA |
| PW-010 | Crear con título y descripción | SUPERADA |
| PW-011 | Crear desde la lista vacía | SUPERADA |
| PW-012 | Normalizar espacios del título | SUPERADA |
| PW-013 | Permitir títulos repetidos | SUPERADA |
| PW-014 | Cancelar la creación | SUPERADA |
| PW-015 | Cerrar y reabrir limpia un borrador | SUPERADA |

La preparación de datos y las verificaciones HTTP se hicieron en segundo plano; las navegaciones, clics y formularios se ejecutaron en la ventana visible. Los casos de carga retuvieron temporalmente la respuesta HTTP para observar el estado intermedio. Las pausas son para la demostración y no miden rendimiento.

Entorno aislado: frontend `127.0.0.1:4201`, backend `127.0.0.1:8001`, `APP_ENV=test`, `backend/var/tasks_e2e.db`. Conservación de hashes de las bases protegidas: `{"tasks.db": true, "tasks_test.db": true}`. Archivos previos con cambios inesperados, excluyendo la bitácora: `[]`.

No se modificó código de la aplicación ni se repitieron los casos 16–120. Este informe complementa la ejecución anterior y no la sustituye.

Evidencias locales (ignoradas por Git): [resultados JSON](../.runtime/pruebas-mcp-visible/results.json), [resumen e integridad](../.runtime/pruebas-mcp-visible/summary.json), [cliente MCP](../.runtime/pruebas-mcp-visible/run-visible.py) y [configuración visible](../.runtime/pruebas-mcp-visible/config.json). Las capturas `PW-NNN.png`, trazas `PW-NNN-trace.zip` y respuestas MCP se conservan en `.runtime/pruebas-mcp-visible/`.

Cada traza se puede inspeccionar con el visor de trazas de Playwright del proyecto. Incluye acciones, capturas y red; no se ha publicado en servicios externos.

Cierre confirmado: cero tareas E2E restantes, navegador y procesos propios detenidos, puertos de pruebas liberados. Se conservaron 15 capturas y 15 trazas. Registro en la [bitácora](bitacora.md), entradas 48 y 50.
