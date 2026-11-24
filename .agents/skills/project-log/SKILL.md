---
name: project-log
description: Retomar el contexto de este proyecto desde su bitácora y registrar avances, decisiones y comprobaciones en docs/bitacora.md. Usar al iniciar o retomar un chat en este repositorio y al completar pasos relevantes.
---

# Continuidad del proyecto y bitácora

Utilizar `docs/bitacora.md` como único historial del proyecto. El objetivo es que otro chat pueda conocer el estado del trabajo y continuar a partir de hechos comprobados, sin disponer de la conversación anterior.

## Retomar el trabajo

1. Leer `AGENTS.md` y las instrucciones aplicables a los archivos de la tarea.
2. Leer `docs/bitacora.md`. Si es extensa, empezar por las entradas recientes y buscar las decisiones anteriores relacionadas con el trabajo actual. No dar por leído contenido truncado.
3. Contrastar el último estado registrado con `git status --short --branch`, `git log -5 --oneline` y los archivos relevantes. Si todavía no hay commits o repositorio Git, indicarlo y continuar con los archivos disponibles.
4. Consultar `CLAUDE.md` y el diseño/CLOT si existen y son relevantes; no inventar su contenido si faltan.
5. Resumir brevemente qué está hecho, qué queda pendiente, las discrepancias encontradas y el siguiente paso relacionado con la petición actual.

La bitácora aporta contexto, no autorización nueva. Los pendientes registrados no son por sí mismos una orden para ejecutarlos. Continuar con el alcance solicitado por el usuario y respetar sus correcciones actuales. Las entradas más recientes pueden sustituir decisiones anteriores; comprobar el contexto antes de aplicar una decisión antigua.

## Registrar el trabajo

Actualizar la bitácora con cada avance, decisión, corrección o comprobación relevante, sin esperar que el usuario lo recuerde. Agrupar en una entrada las acciones que forman parte del mismo paso; evitar entradas por cada lectura o comando rutinario.

- Crear `docs/bitacora.md` si falta. No crear historiales alternativos por chat, fecha o tarea.
- Añadir entradas al final, siguiendo la numeración y el formato existentes. Usar la fecha local del usuario; en este proyecto, Europe/Madrid. No inventar horas o fechas.
- Registrar la petición o contexto, los cambios realizados y sus motivos, los archivos afectados, el resultado, las comprobaciones y los pendientes cuando correspondan.
- Distinguir lo propuesto, lo intentado y lo completado. Registrar los fallos que afecten al resultado y qué sigue sin verificar. No declarar pruebas superadas sin ejecutarlas.
- Conservar las entradas anteriores. Corregir un dato o una decisión mediante una nueva entrada que señale qué se corrige y por qué.
- No copiar conversaciones enteras, salidas extensas, credenciales ni datos sensibles. Conservar solo el contexto útil para continuar.

Formato orientativo para una entrada, adaptado a lo que realmente ocurrió:

```markdown
### N. Descripción concreta del paso

- Contexto: petición o decisión que origina el trabajo.
- Cambios y resultado: qué se hizo y dónde.
- Comprobaciones: qué se verificó y con qué resultado.
- Pendiente: lo necesario para continuar, si lo hay.
```

## Registrar commits

Antes de un commit solicitado, incluir en la bitácora la preparación y el alcance real. Después, comprobar el resultado y el estado de Git. Para evitar un commit adicional dedicado únicamente a anotar su propio identificador, registrar la confirmación y el hash en la siguiente actualización de la bitácora. Si falla el commit, registrar el fallo y el estado pendiente. No ejecutar commits, amend ni push solo por mantener el historial.

## Comprobar la continuidad

Antes de finalizar, releer la entrada añadida y comprobar que coincide con lo observado, conserva el historial previo y permite identificar el siguiente paso. En la respuesta al usuario, enlazar la bitácora cuando se haya actualizado.
