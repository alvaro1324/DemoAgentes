# Instrucciones del proyecto

## Objetivo y alcance inicial

Desarrollar una aplicación de lista de tareas con PHP, Symfony, Doctrine y Angular, acompañada de pruebas automatizadas.

Este archivo guía el trabajo de los agentes en todo el repositorio. La versión 0.1 implementa el MVP en `backend/` y `frontend/`; consultar el README para instalación, arranque y comprobaciones, y `docs/version-0.1.md` para las decisiones y el contrato.

## Funcionalidad del MVP

- Crear una tarea con título obligatorio y descripción opcional.
- Consultar el listado y el detalle de las tareas.
- Modificar el título y la descripción.
- Marcar una tarea como completada o pendiente.
- Eliminar una tarea.
- Filtrar el listado por estado: todas, pendientes y completadas.
- Mostrar estados de carga, lista vacía y errores de validación o comunicación.

Modelo inicial propuesto: `Task`, con identificador, título, descripción, estado de finalización y fechas de creación y última modificación. Los límites de los campos y las reglas de validación se definirán antes de implementar el contrato de la API.

## Stack y estructura prevista

- Backend: PHP y Symfony, con una API HTTP JSON.
- Persistencia: Doctrine ORM y migraciones de Doctrine.
- Frontend: Angular con TypeScript y formularios reactivos.
- Pruebas del backend: PHPUnit y las herramientas de pruebas de Symfony.
- Pruebas del frontend: Vitest mediante el builder de pruebas de Angular.
- Pruebas de extremo a extremo: Playwright con Chromium.

Estructura inicial propuesta:

```text
backend/     Aplicación Symfony, entidades, migraciones y pruebas del backend.
frontend/    Aplicación Angular y sus pruebas.
docs/        Requisitos, decisiones técnicas y contrato de la API.
```

Antes de instalar dependencias, comprobar las herramientas disponibles y elegir versiones estables y compatibles entre sí. Documentar las versiones seleccionadas. No asumir que existen scripts, servicios o comandos del proyecto hasta comprobar su configuración.

## Flujo de trabajo

El flujo del proyecto conecta documentación, análisis, tareas en GitHub Issues, desarrollo de la aplicación y una PR en GitHub. Los criterios de aceptación deben acompañar cada paso.

El candado de la pizarra representa `CLAUDE.md`: la referencia al diseño y al CLOT que define en qué consiste el proyecto. El desarrollo debe partir de esa definición y respetar su alcance y criterios. Esta referencia no implica un requisito de autenticación o autorización. `CLAUDE.md` referencia el análisis aprobado y las decisiones concretas de la versión 0.1.

1. Leer el diseño/CLOT y `CLAUDE.md` cuando estén disponibles, además de la documentación y el código relacionados con el cambio.
2. Convertir la necesidad en una tarea concreta con alcance y criterios de aceptación verificables.
3. Registrar el análisis y las decisiones necesarias antes de implementar. Si existe una tarea en GitHub Issues, conservar su referencia.
4. Implementar un cambio acotado, siguiendo las convenciones existentes.
5. Añadir o actualizar las pruebas que verifiquen el comportamiento afectado.
6. Ejecutar las comprobaciones disponibles y revisar el diff.
7. Preparar un resumen del cambio, las pruebas ejecutadas y las limitaciones para su revisión mediante PR.

GitHub es la plataforma del repositorio remoto, la gestión de tareas mediante Issues y la revisión mediante PR. El repositorio privado es `https://github.com/alvaro1324/DemoAgentes`, configurado como remoto `origin`. La conexión mediante MCP es opcional. Utilizar las integraciones únicamente si están configuradas y la tarea autoriza la operación. No inventar incidencias, resultados de herramientas ni referencias de PR.

## Criterios técnicos

- Mantener los controladores Symfony pequeños; separar la lógica de negocio cuando su complejidad lo justifique.
- Gestionar la persistencia mediante Doctrine y registrar los cambios del esquema en migraciones versionadas.
- Validar las entradas en el backend y ofrecer validación equivalente en los formularios para facilitar su uso.
- Definir respuestas JSON y códigos HTTP coherentes, incluidos los errores de validación y los recursos inexistentes.
- Centralizar las llamadas HTTP de Angular en servicios tipados y evitar duplicar el estado sin necesidad.
- Mantener el tipado estricto que permita la configuración del proyecto; evitar `any` sin justificación.
- No introducir bibliotecas ni abstracciones que el alcance de la tarea no necesite.
- No guardar credenciales ni secretos en el repositorio. Documentar la configuración mediante ejemplos sin datos sensibles.
- Mantener fuera del cambio archivos y modificaciones ajenos a la tarea.

## Estrategia de pruebas y finalización

- Pruebas unitarias para reglas de negocio que lo requieran.
- Pruebas de integración para persistencia y consultas relevantes.
- Pruebas funcionales de la API para operaciones de tareas, entradas inválidas y recursos inexistentes.
- Pruebas de componentes y servicios Angular para formularios, filtros y manejo de errores.
- Un recorrido de extremo a extremo que cree, edite, complete y elimine una tarea.
- Usar una base de datos de pruebas aislada; las pruebas no deben modificar datos de desarrollo ni de producción.

Un cambio se considera terminado cuando cumple sus criterios de aceptación, tiene las pruebas pertinentes, supera las comprobaciones configuradas y actualiza la documentación afectada. Si alguna comprobación no puede ejecutarse, indicar el motivo y qué queda sin verificar. No declarar una prueba superada sin haberla ejecutado.

Los comandos exactos de instalación, arranque, migraciones, pruebas y análisis estático se incorporarán al README al configurar cada herramienta. Utilizar los scripts definidos en el repositorio.

## Lista inicial de tareas

- [x] Incorporar o referenciar el diseño/CLOT del proyecto en `CLAUDE.md` y alinear estas instrucciones con su contenido.
- [x] Confirmar el alcance del MVP y redactar sus criterios de aceptación: análisis aprobado por el usuario el 24 de noviembre de 2026 en `docs/analisis-diseño.md`, con las decisiones pendientes allí indicadas.
- [x] Elegir versiones de PHP, Symfony, Doctrine, Node.js y Angular compatibles.
- [x] Elegir el motor de base de datos y documentar el entorno local.
- [x] Inicializar `backend/` y `frontend/`, sus dependencias y archivos de exclusión de Git.
- [x] Configurar variables de entorno de ejemplo y una base de datos de pruebas aislada.
- [x] Definir el contrato de la API, las reglas de validación y el formato de errores.
- [x] Crear la entidad `Task`, su repositorio y la migración inicial.
- [x] Implementar y probar las operaciones de la API y el filtrado por estado.
- [x] Implementar la interfaz Angular y su conexión con la API.
- [x] Añadir pruebas de frontend y el recorrido de extremo a extremo.
- [x] Configurar formato, análisis estático y automatización de comprobaciones en CI (workflow creado; ejecución remota pendiente de publicación).
- [x] Documentar instalación, arranque y ejecución de pruebas en el README.
- [ ] Revisar el conjunto y preparar la primera PR cuando se solicite trabajar con el repositorio remoto.

## Decisiones pendientes

- La versión 0.1 utiliza SQLite sin contenedores, Playwright para extremo a extremo y un workflow de GitHub Actions. Revisar estas decisiones si cambian los requisitos de despliegue.
- Configuración de la integración con GitHub mediante MCP, si procede.
- Requisitos adicionales, como prioridades, fechas límite o paginación; quedan fuera del MVP hasta acordarlos.

## Comunicación

Redactar la documentación y los resúmenes de trabajo en español. Utilizar identificadores de código en inglés y respetar las convenciones que se establezcan en el repositorio. Explicar las suposiciones relevantes y distinguir lo implementado de lo propuesto.

## Documentación del trabajo

Mantener al usuario informado de cada paso y actualizar automáticamente `docs/bitacora.md` con cada avance, decisión, corrección o comprobación relevante, sin esperar una petición adicional. Crear la carpeta y el archivo si no existen. Mantener un único fichero de historial, añadiendo entradas en orden cronológico con fecha, contexto, acciones, resultado, comprobaciones y puntos pendientes cuando correspondan. Conservar el historial anterior; registrar las correcciones en nuevas entradas. Distinguir los hechos confirmados de las suposiciones y no presentar trabajo propuesto como realizado. No guardar secretos ni datos sensibles en la bitácora.

## Skills del proyecto

Al iniciar o retomar un chat en este repositorio y al registrar avances relevantes, utilizar el skill local `project-log`, definido en `.agents/skills/project-log/SKILL.md`. Leer la bitácora y contrastar su estado con los archivos y Git antes de continuar.

Al preparar o revisar mensajes de commit, utilizar el skill local `commit-messages`, definido en `.agents/skills/commit-messages/SKILL.md`.

Al crear o actualizar entidades, campos, tipos, relaciones o invariantes del modelo de tareas, utilizar el skill local `modelo`, definido en `.agents/skills/modelo/SKILL.md`. Se apoya en el análisis aprobado y en las decisiones implementadas, y comprueba el impacto en Doctrine y los contratos consumidos por Angular.
