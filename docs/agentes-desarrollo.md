# Agentes de desarrollo de DemoAgentes

Se añaden dos agentes del proyecto, además del planificador existente:

| Agente | Definición | Ámbito de implementación |
| --- | --- | --- |
| `desarrollador_backend` | [desarrollador_backend.toml](../.codex/agents/desarrollador_backend.toml) | Symfony, reglas, Doctrine, API y pruebas en `backend/` |
| `desarrollador_frontend` | [desarrollador_frontend.toml](../.codex/agents/desarrollador_frontend.toml) | Tipos, servicios HTTP, formularios, interfaz y pruebas en `frontend/` |

El [orquestador](orquestador.md) coordina los encargos cuando se solicita; el
verificador sigue pendiente. Estos desarrolladores no crean ni invocan otros
agentes. El [planificador](planificador.md) sigue terminando al entregar
el plan; no lanza automáticamente a los desarrolladores.

## Encargo y entrega

Cada desarrollador necesita un plan o un encargo con alcance, criterios de
aceptación y archivos asignados. Comprueba primero qué está ya implementado y
cuáles son los cambios locales ajenos. No se exige crear un archivo de plan
adicional cuando el encargo ya contiene la información suficiente.

El resultado de cada rol incluye archivos modificados, criterios cubiertos,
contrato usado, comprobaciones ejecutadas con su resultado y limitaciones. Sus
pruebas son comprobaciones del propio trabajo; no sustituyen una revisión
independiente ni autorizan commits o publicaciones.

Si falta una decisión que afecta comportamiento o contrato, pregunta antes de
implementar esa parte. Puede continuar las partes independientes. No modifica
el plan recibido ni cambia unilateralmente las decisiones de diseño.

## Coordinación y archivos compartidos

Antes de un trabajo simultáneo, fijar:

1. Contrato HTTP/JSON: métodos, rutas, campos, tipos, nulabilidad, estados y
   errores. Usar las decisiones vigentes o resolver las diferencias necesarias.
2. Archivos y criterios asignados a cada rol, sin solapamiento de escritura.
3. Dependencias: por ejemplo, frontend puede avanzar con el contrato acordado y
   respuestas simuladas, pero debe declarar la integración real pendiente.
4. Quién integra documentación común y registra el trabajo en la bitácora.

Backend escribe en `backend/` y frontend en `frontend/`, siempre dentro del
encargo. Los cambios de README, diseño, decisiones, scripts compartidos o
configuración común requieren una asignación explícita a un único escritor.
No se cambia el contrato a través de una modificación incidental en código.

Para ejecuciones coordinadas, indicar expresamente:

```text
Yo asumiré el registro centralizado en docs/bitacora.md. Devuélveme avances,
decisiones y comprobaciones para integrarlos; no escribas simultáneamente en
la bitácora ni en documentación compartida.
```

En uso autónomo cada agente registra su trabajo conforme a `bitacora`. Si dos
encargos autónomos van a ejecutarse simultáneamente, designar primero el escritor
del registro. El resumen devuelto por un agente no acredita por sí solo que el
padre ya lo haya incorporado.

## Invocaciones de ejemplo

```text
Usa desarrollador_backend para implementar únicamente el tramo backend de
docs/plan-<cambio>.md. Archivos asignados: <rutas>. Contrato: <referencia>.
Restricciones y comprobaciones permitidas: <condiciones>.
```

```text
Usa desarrollador_frontend para implementar únicamente el tramo Angular de
docs/plan-<cambio>.md. Archivos asignados: <rutas>. Contrato: <referencia>.
Restricciones y comprobaciones permitidas: <condiciones>.
```

Solo pedir ambos en paralelo cuando las dependencias estén resueltas. Si una
sesión abierta antes de crear las definiciones no los descubre, iniciar otra
sesión en este repositorio. No son skills `$desarrollador_backend` o
`$desarrollador_frontend`.

## Pruebas de los agentes

El ensayo funcional utiliza una copia aislada bajo
`.runtime/agentes-desarrollo/ensayo/`, sin dependencias, herramientas o bases del
entorno original. En ella se introducen dos regresiones sintéticas:

- Backend: el listado pasa a ordenar por id ascendente, contradiciendo el
  contrato de la 0.1. Encargo: restaurar el orden descendente únicamente en
  `backend/src/Repository/TaskRepository.php`.
- Frontend: `completedCount` cuenta pendientes por una negación incorrecta.
  Encargo: recuperar el contador global de completadas únicamente en
  `frontend/src/app/app.ts`, conservando el de pendientes y los filtros.

Ambos encargos contienen criterios completos y el contrato existente. Se les
pide no ejecutar suites, instalar dependencias, arrancar servidores, generar
migraciones o añadir pruebas nuevas durante este ensayo limitado. El padre
registra los resultados. No se añade ninguna funcionalidad a la aplicación real.

La evaluación distingue selección de los dos tipos nativos, corrección de
los archivos asignados, conservación del resto y honestidad sobre las pruebas
no ejecutadas. El parseo TOML y las comprobaciones sintácticas complementan ese
ensayo, pero no acreditan funcionamiento integral de Symfony y Angular.

### Resultado del ensayo — 26 de noviembre de 2026

- Los tres TOML (planificador y desarrolladores) son válidos y solo contienen
  `name`, `description` y `developer_instructions`.
- La interfaz de las sesiones de ensayo no expuso la selección de tipos
  personalizados. Dos intentos, con y sin plugins habilitados, terminaron sin
  invocar los roles ni editar archivos. No se ha confirmado la llamada nativa
  por nombre en este cliente; queda pendiente en una sesión que exponga esa
  capacidad. No se atribuye la limitación a los plugins: cambiar esa opción no
  la resolvió.
- Para comprobar el comportamiento, se cargó literalmente `developer_instructions`
  de cada TOML mediante la opción temporal de Codex del mismo nombre, en dos
  sesiones independientes sobre la copia. Esto ensaya las instrucciones; no
  acredita el descubrimiento ni la selección nativa del rol.
- El primer ensayo de instrucciones identificó las correcciones, pero sus
  sesiones eran de solo lectura y no pudieron escribir. Se repitió con
  `workspace-write` limitado al espacio de ensayo; ambas sesiones terminaron
  con código 0 y corrigieron únicamente su archivo asignado.
- Una comparación por contenido detectó exactamente los dos archivos esperados
  en la copia, restaurados al código de referencia. Se contrastaron 280 archivos
  del repositorio original sin cambios inesperados. La sesión principal actualizó
  la documentación del planificador durante el ensayo y se identificó esa
  modificación propia al comparar. PHP pasó `-l` y TypeScript no presentó
  diagnósticos de parseo; no se compilaron Angular ni Symfony ni se ejecutaron
  sus suites o pruebas de persistencia.
- Frontend señaló un límite de la cobertura existente: el test de contadores
  usa tantos pendientes como completados, de modo que esa inversión podría
  pasar inadvertida. Se conserva el test en este paso; un caso futuro con
  cantidades distintas comprobaría esa regresión. No se presenta la inspección
  de los contadores como un test ejecutado.

Los resultados, eventos y comparaciones están en `.runtime/agentes-desarrollo/`,
ignorado por Git. La bitácora original recoge el resultado centralizado. No se
modificaron los archivos funcionales de `backend/` o `frontend/` del proyecto real.

La selección de permisos de escritura corresponde a la sesión padre, no a las
definiciones del rol. No basta con que un agente sea «desarrollador» para que una
sesión de solo lectura le permita guardar cambios. Estos ensayos no modifican
la configuración personal para conceder permisos de forma permanente.

Para una prueba futura más amplia, usar una incidencia ya resuelta en una copia
de la revisión anterior a su solución, con su contrato y criterios originales.
Comparar el resultado con la solución real, ejecutar después las suites
autorizadas y revisar el diff. No revertir el árbol actual para simular el pasado.

## Configuración y límites

Las definiciones contienen nombre, descripción e instrucciones; heredan modelo
y permisos de la sesión y no cambian MCP ni configuración del usuario. Los
límites de escritura son instrucciones del rol, no un aislamiento técnico del
sistema de archivos. [Formato y herencia documentados por OpenAI](https://learn.chatgpt.com/docs/agent-configuration/subagents).

Las fuentes funcionales siguen siendo `AGENTS.md`, `docs/analisis-diseño.md`,
`docs/version-0.1.md` y el código. Se utilizan los skills locales cuando aplican,
sin crear otros. Las referencias antiguas a reservas, reglas RN, `docs/analisis.md`
o scripts `probar-*.ps1` no amplían el alcance ni sustituyen las rutas reales.
