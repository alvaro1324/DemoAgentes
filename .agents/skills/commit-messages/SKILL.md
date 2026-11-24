---
name: commit-messages
description: Redactar o revisar mensajes de commit de este proyecto al preparar un commit o cuando el usuario pida un mensaje para cambios concretos.
---

# Mensajes de commit

Redactar los mensajes en español, con un resumen específico y conciso que describa lo que cambió.

## Basarse en los cambios reales

- Revisar `git status --short` y `git diff --cached` para identificar lo que entrará en el commit. Si hay archivos nuevos preparados, leer también su contenido cuando sea necesario.
- Si no hay cambios preparados, revisar el diff y los archivos nuevos relevantes para proponer un mensaje, indicando que corresponde a cambios todavía sin preparar. No añadir archivos al índice por el mero hecho de redactar el mensaje.
- Describir únicamente el alcance que vaya a incluirse en el commit. No atribuirle cambios pendientes, funcionalidades propuestas ni pruebas que no se hayan ejecutado.
- Este skill redacta mensajes; no concede por sí mismo autorización para ejecutar un commit ni hacer push.

## Formato y precisión

La primera línea sigue el formato `tipo: descripción corta`. Elegir un tipo acorde con el cambio, por ejemplo `feat`, `fix`, `docs`, `test`, `refactor`, `build`, `ci` o `chore`.

Nombrar la acción y el comportamiento, regla o contenido concreto afectado. Ser escueto significa eliminar palabras sobrantes conservando la información que permite entender el cambio. Evitar resúmenes como «actualizar fichero», «actualizar instrucciones» o «varios cambios».

El cuerpo es opcional. Para un cambio trivial, una sola línea basta. Cuando aporte valor, separar el cuerpo del resumen con una línea en blanco y explicar el detalle, el motivo o las consecuencias relevantes, sin repetir el resumen ni enumerar archivos sin explicar sus cambios.

## Ejemplos de estilo

Los ejemplos ilustran la redacción; utilizarlos solo si coinciden con el diff real.

- Vago: `docs: actualizar instrucciones`.
- Concreto: `docs: aclarar que el candado representa CLAUDE.md y el diseño del proyecto`.
- Breve y específico: `docs: cambiar el idioma de los comentarios de inglés a castellano`.
- Funcionalidad: `feat: filtrar tareas por estado de finalización`.

Ejemplo con cuerpo, si los cambios lo justifican:

```text
fix: rechazar títulos de tarea compuestos solo por espacios

Normalizar el título antes de validarlo para evitar tareas sin texto visible.
Cubrir el rechazo de títulos vacíos y con espacios en las pruebas de la API.
```

## Entrega

Cuando se solicite un mensaje, devolverlo listo para usar, con el cuerpo únicamente si resulta útil. Antes de entregarlo, comprobar que un lector pueda entender qué cambió sin abrir el diff y que todas sus afirmaciones estén respaldadas por el cambio.
