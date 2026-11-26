# Agente planificador de DemoAgentes

Configuración del proyecto: [planificador.toml](../.codex/agents/planificador.toml).
Es el agente que prepara los planes de esta arquitectura. Los dos agentes de
desarrollo se documentan en [agentes-desarrollo.md](agentes-desarrollo.md);
el [orquestador](orquestador.md) coordina encargos y el [verificador](verificador.md)
revisa las entregas de desarrollo.
El planificador no los lanza.

## Uso

En una sesión de Codex abierta en este repositorio:

```text
Usa el agente planificador para planificar: <petición o enlace de incidencia>.
Genera docs/plan-<nombre>.md y termina al entregar el plan.
```

Es un agente propio de Codex, no un skill `$planificador`. Su archivo no fija
modelo: hereda el de la sesión. Tampoco configura MCP ni cambia el perfil
personal del PC. Si una sesión anterior no lo descubre, abrir una nueva sesión
en este repositorio y pedir explícitamente el agente por su nombre.

La documentación oficial describe los agentes del proyecto en `.codex/agents/`,
con `name`, `description` y `developer_instructions`. Heredan permisos del padre:
las instrucciones de este agente limitan su cometido, pero no son un aislamiento
del sistema de archivos. No se añade `sandbox_mode` al archivo porque no sustituye
los permisos del padre. [Referencia oficial de agentes de Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Resultado y límites

Entrega un plan en `docs/plan-*.md`, con petición, estado actual contrastado,
alcance, pasos por capas, criterios verificables, pruebas propuestas, riesgos y
preguntas. Registra el resultado en la bitácora única.

El planificador lee código y pruebas para detectar trabajo ya hecho. No ejecuta
tests ni cambia la aplicación. Tampoco modifica el diseño aprobado, lanza otros
agentes o crea incidencias, commits o PR. Una duda material deja condicionados
los pasos afectados, sin bloquear el análisis independiente.

Los documentos V2 conservan material de reservas de salas. El agente toma el
diseño de tareas y el contrato 0.1 como referencia del proyecto. No crea rutas,
reglas o comandos basándose en aquellos ejemplos.

## Prueba recomendada: trabajo ya desarrollado

Caso local reproducible, sin necesitar una incidencia remota: **filtrado por
estado**, parte del MVP publicado en el commit `229eb8c`. El código actual y las
pruebas escritas permiten revisar si el planificador diferencia lo hecho de lo
pendiente. Ese commit es una referencia Git real, no un número de incidencia.

```text
Usa el agente planificador. Planifica incorporar los filtros Todas, Pendientes
y Completadas a la lista de tareas. Contrasta primero el estado actual y
entrega docs/plan-prueba-filtros-estado.md. Solo planificación; no ejecutes tests
ni implementes cambios.
```

Comprobar después:

1. Detecta que los filtros ya existen en `app.ts` y `app.html`, el servicio HTTP
   y la API, con `TaskRepository.matchingStatus` para la consulta persistida.
2. Explica que Angular filtra localmente el listado completo y mantiene
   contadores globales; distingue ese comportamiento del filtro HTTP.
3. Identifica las pruebas relevantes de `TaskApiTest.php`, `app.spec.ts` y
   `e2e/tasks.spec.ts`. No declara que estén superadas por haberlas leído.
4. No propone rehacer los filtros. Si identifica una carencia real, limita el
   plan a esa diferencia; si no, propone únicamente verificación posterior.
5. Solo aparecen el plan y la entrada de bitácora como modificaciones atribuibles
   a la prueba. Comparar con el estado previo, que ya contiene cambios ajenos.

Para medir la calidad de la planificación de una funcionalidad desde cero,
usar más adelante una copia aislada de una revisión anterior o un caso con
requisitos completos; no ocultar que el agente ve la implementación actual.
No hace falta revertir este repositorio para el primer ensayo.

### Resultado del primer ensayo — 26 de noviembre de 2026

Codex descubrió y lanzó el rol personalizado `planificador` en una sesión nueva.
El agente generó [plan-prueba-filtros-estado.md](plan-prueba-filtros-estado.md),
concluyó «sin desarrollo necesario» y distinguió las pruebas escritas de las
ejecutadas históricamente y de las verificaciones pendientes. La revisión del
plan confirmó los cinco puntos anteriores. Una comparación por contenido de
275 archivos no detectó cambios fuera del plan y su entrada de bitácora.

El ensayo generó los artefactos y un evento final `turn.completed` de Codex.
La envoltura de PowerShell devolvió código 1 y registró el aviso de que no se
soportan snapshots de shell para PowerShell; no se presenta ese código como
una comprobación de proceso superada. Los eventos, resumen y comparación
quedaron en `.runtime/planificador/`. No se ejecutaron tests de la aplicación.
Los otros dos escenarios siguientes están preparados como propuestas, sin ejecutar.

## Otras dos comprobaciones útiles

**Petición ambigua:** «Usa el planificador para mejorar los filtros». Debe
preguntar qué cambio se quiere y no inventar búsqueda, categorías o filtros
adicionales. Puede entregar las observaciones independientes y señalar la duda.

**Incidencia real resuelta:** proporcionar su enlace o texto, requisitos
originales y referencia Git de la solución. Pedir un plan de diferencias o una
revisión retrospectiva, indicando que ya está desarrollada. Comparar el plan con
los archivos modificados, los criterios originales y las pruebas de la solución.
La lectura de la incidencia no autoriza escribir en GitHub/Jira.

En cada ensayo revisar: fidelidad a la petición, evidencias del estado actual,
dependencias correctas, criterios observables, tratamiento de dudas y ausencia
de implementación. Playwright verifica la aplicación; para este agente interesa
la calidad del plan y el respeto del alcance, sin arrancar navegador ni backend.
