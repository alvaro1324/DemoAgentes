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

Ampliación solicitada: categorías mediante la entidad `Category` y una relación opcional muchos a uno desde `Task`, con mapeo por atributos Doctrine. El detalle está en la sección 4 de `docs/analisis-diseño.md` y en `docs/version-0.1.md`; la gestión de categorías en API y Angular queda pendiente.

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

El trabajo de agentes se realiza exclusivamente con Codex, guiado por `AGENTS.md` y los skills locales de `.agents/skills/`. Consultar directamente el diseño/CLOT en `docs/analisis-diseño.md` y las decisiones en `docs/version-0.1.md`, respetando su alcance y criterios. El candado de la pizarra representa esa referencia documental y no implica autenticación o autorización.

1. Leer `AGENTS.md`, `docs/analisis-diseño.md` y `docs/version-0.1.md`, además de la documentación y el código relacionados con el cambio.
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
- Definir el mapeo del modelo mediante atributos PHP de Doctrine ORM en las entidades de `backend/src/Entity/`, usando `Doctrine\ORM\Mapping as ORM` y atributos como `#[ORM\Entity]`, `#[ORM\Column]` y los de relaciones. Mantener esta convención al crear o modificar el modelo.
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

- [x] Referenciar directamente el diseño/CLOT desde `AGENTS.md` y alinear las instrucciones de Codex con su contenido.
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

## Agente planificador

El agente del proyecto `planificador` se define en `.codex/agents/planificador.toml`.
Usarlo cuando se solicite explícitamente ese agente o la planificación de un cambio
como paso independiente. Entrega `docs/plan-*.md` y registra el resultado en la
bitácora; su trabajo termina con el plan y las dudas. No implementa, ejecuta
pruebas ni delega en otros agentes. Instrucciones y pruebas de uso en
[`docs/planificador.md`](docs/planificador.md). Solicitar un plan no activa
automáticamente otros agentes.

## Agentes de desarrollo

`desarrollador_backend` y `desarrollador_frontend` se definen respectivamente en
`.codex/agents/desarrollador_backend.toml` y
`.codex/agents/desarrollador_frontend.toml`. Implementan solo el tramo asignado de
un plan o encargo con criterios definidos, dentro de `backend/` o `frontend/`.
Las decisiones de contrato pendientes se resuelven antes de la parte dependiente.

Pueden trabajar en paralelo con contrato acordado y archivos disjuntos. Designar
un único escritor de documentación compartida y bitácora; si el padre asume el
registro, cada desarrollador le devuelve su resumen y el padre lo incorpora.
En ejecución autónoma se mantiene el registro directo conforme a `bitacora`.
Sus comprobaciones propias no constituyen una revisión independiente. No crean
otros agentes ni realizan commits o publicaciones. Uso y ensayos en
[`docs/agentes-desarrollo.md`](docs/agentes-desarrollo.md). El verificador sigue
pendiente.

## Agente orquestador

`orquestador` se define en `.codex/agents/orquestador.toml`. Coordina el encargo
autorizado con los roles disponibles, delimita archivos y contrato, controla
dependencias e integra documentación y resultados. Solo planificación termina
con el plan; la implementación requiere estar incluida en el encargo.

Centraliza la bitácora de los desarrolladores y espera el registro propio del
planificador antes de escribir en ella. El paralelismo exige contrato resuelto,
archivos disjuntos y recursos de pruebas compatibles. No sustituye al verificador
pendiente ni publica sin encargo. Uso, límites y ensayos en
[`docs/orquestador.md`](docs/orquestador.md). Definir el rol no acredita que una
sesión existente lo exponga; comprobar disponibilidad antes de invocarlo.

## Skills del proyecto

Al definir o revisar funcionalidades, alcance, reglas de negocio, contratos o criterios de aceptación, utilizar el skill local `analisis-diseno`, definido en `.agents/skills/analisis-diseno/SKILL.md`. Mantiene `docs/analisis-diseño.md` y distingue el diseño aprobado, los cambios propuestos y lo implementado antes de pasar al código.

Al iniciar o retomar un chat en este repositorio y al registrar avances relevantes, utilizar el skill local `bitacora`, definido en `.agents/skills/bitacora/SKILL.md`. Leer la bitácora y contrastar su estado con los archivos y Git antes de continuar.

Al preparar o revisar mensajes de commit, utilizar el skill local `commit-messages`, definido en `.agents/skills/commit-messages/SKILL.md`.

Al crear o actualizar entidades, campos, tipos, relaciones o invariantes del modelo de tareas, utilizar el skill local `modelo`, definido en `.agents/skills/modelo/SKILL.md`. Se apoya en el análisis aprobado y en las decisiones implementadas, y comprueba el impacto en Doctrine y los contratos consumidos por Angular.
