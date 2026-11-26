---
name: analisis-diseno
description: >-
  Crea, actualiza o revisa el análisis y diseño de DemoAgentes: alcance, reglas
  de negocio, modelo conceptual, contrato HTTP, interfaz y criterios de aceptación
  en docs/analisis-diseño.md. Úsalo para analizar una funcionalidad o cambiar su
  diseño antes de implementarla. La implementación del modelo corresponde a modelo.
---

# Análisis y diseño de DemoAgentes

Convierte la necesidad del usuario en un cambio documental concreto, trazable y
verificable para la lista de tareas PHP/Symfony/Doctrine y Angular. Este skill
trabaja sobre el diseño; no implementa código ni aplica migraciones.

## Fuentes y alcance

- Lee `AGENTS.md` y recupera el contexto con `bitacora`. Contrasta la bitácora
  con Git antes de interpretar los pendientes como estado actual.
- Usa `docs/analisis-diseño.md` como análisis vigente y
  `docs/version-0.1.md` para las decisiones y el contrato implementados del MVP.
  Consulta `README.md` para estructura, herramientas y comandos reales.
- Inspecciona el código relacionado cuando ayude a comprobar el comportamiento
  existente. Una diferencia entre código y diseño es un hallazgo, no una
  autorización para cambiar automáticamente uno de ellos.
- Los documentos de arquitectura y orquestación de otros dominios son referencias.
  No incorpores de ellos reservas, otros stacks, reglas RN, ADR, rutas ni requisitos
  que no pertenezcan al alcance solicitado. No crees `docs/analisis.md` como copia.

## Modos

- `revisar` o sin argumento: compara la documentación vigente con la petición y
  los archivos relevantes. Informa de incoherencias, huecos y decisiones abiertas;
  no cambia el diseño. El registro requerido en la bitácora se mantiene.
- `crear <necesidad>`: redacta las secciones que falten en el análisis existente.
  Si falta el documento, créalo con el alcance conocido, separando propuestas y
  decisiones confirmadas. No reemplaces el análisis existente por una plantilla.
- `actualizar <cambio>`: modifica las secciones afectadas, conserva las decisiones
  anteriores que siguen vigentes y explica la consecuencia del cambio.

Si el usuario solicita analizar una funcionalidad sin nombrar un modo, infiere si
quiere una revisión o una actualización a partir de su petición. Pregunta solo
por decisiones que alteren materialmente el resultado y no puedan deducirse;
continúa con el análisis independiente mientras tanto.

## Contenido del cambio

Adapta el detalle al alcance; conserva la estructura y numeración del documento.
Para cada funcionalidad afectada, concreta lo que corresponda:

- Necesidad, comportamiento esperado, alcance y exclusiones.
- Reglas de negocio: entradas válidas e inválidas, límites, normalización,
  transiciones, errores y conservación del estado ante fallos.
- Modelo conceptual en la sección 4: entidades, campos, tipos, nulabilidad,
  relaciones, cardinalidad, borrado y efecto sobre datos existentes.
- Contrato HTTP: rutas, métodos, campos editables, opcionalidad frente a null,
  formato JSON, códigos de respuesta y errores. Evalúa compatibilidad con clientes.
- Interfaz Angular: recorrido, validación, filtros y estados de carga, vacío o error.
- Capas y archivos afectados, migraciones y riesgos para datos, si los hay.
- Criterios de aceptación observables y verificaciones pertinentes de dominio,
  persistencia, API, frontend o recorrido completo. Evita criterios vagos como
  «funciona correctamente».

Separa hechos comprobados, decisiones solicitadas, supuestos y preguntas abiertas.
No conviertas una propuesta en requisito aprobado ni una prueba prevista en resultado.
Plantillas y recurrencia siguen fuera del MVP salvo petición que amplíe ese alcance.

## Aprobación, trazabilidad y entrega

Conserva el registro de aprobación original del MVP. Si cambia su diseño, identifica
el cambio y su estado documental por separado; no atribuyas una firma anterior a
la ampliación. Solo registra una aprobación nueva cuando el usuario la exprese.
No introduzcas una aprobación obligatoria adicional para trabajo ya autorizado.

Mantén `docs/version-0.1.md` coherente cuando el cambio afecte decisiones allí
descritas; distingue el diseño nuevo de lo efectivamente implementado. Actualiza
el handoff cuando cambie el estado útil para retomar, sin duplicar el historial.
Si hay un Issue conocido, conserva su referencia; no inventes números ni exijas
crear uno para completar el análisis local. No crees Issues, commits, PR ni push
por el mero uso de este skill.

Revisa el diff, las referencias y la coherencia de criterios con reglas y contrato.
Respeta las restricciones vigentes sobre ejecución de pruebas. Una edición de
diseño no necesita ejecutar la batería de aplicación ni modificar datos.
Registra los cambios y comprobaciones con `bitacora` en `docs/bitacora.md`.

Entrega un resumen de lo definido o revisado, decisiones pendientes y siguiente
paso aplicable. Si procede implementar entidades, relaciones o invariantes,
remite a `modelo` con las secciones y criterios concretos; no ejecutes esa fase
salvo que la petición también la autorice. El skill no requiere delegar en agentes.
