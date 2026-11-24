# Handoff del proyecto DemoAgentes

Estado comprobado el 24 de noviembre de 2026, zona Europe/Madrid. Este documento es una guía de reanudación; el historial único continúa en `docs/bitacora.md`.

## Objetivo y acuerdos

Desarrollar una aplicación de lista de tareas con PHP, Symfony, Doctrine y Angular, con pruebas automatizadas. El trabajo realizado hasta ahora corresponde a la preparación del repositorio, las instrucciones y dos skills locales. La aplicación todavía no está inicializada.

- Documentación y comunicación en español; identificadores de código en inglés según `AGENTS.md`.
- GitHub Issues para tareas y PR en GitHub para revisión.
- Actualizar automáticamente `docs/bitacora.md` con cada avance, decisión y comprobación relevante, conservando las entradas anteriores.
- El candado de la pizarra inicial representa `CLAUDE.md` y el diseño/CLOT que define el proyecto. No especifica autenticación. No existe todavía `CLAUDE.md` en este repositorio.
- El MVP documentado propone crear, listar, consultar, editar, completar, eliminar y filtrar tareas. El detalle sigue pendiente de contrastar con el diseño.

## Repositorio y punto de partida

- Carpeta local: `D:\Sourcetree\DemoAgentes`.
- Entorno utilizado: Windows y PowerShell.
- Remoto `origin`: `https://github.com/alvaro1324/DemoAgentes.git`.
- Repositorio GitHub privado: <https://github.com/alvaro1324/DemoAgentes>.
- Rama: `main`, con seguimiento de `origin/main`.
- Último commit: `9406ca43a26b7cb9522ee5f7d053398e499da58f`, `chore: añadir skill de bitácora y configurar el remoto de GitHub`.
- Primer commit: `06839bb`, `docs: añadir pautas del proyecto, bitácora y skill de commits`.
- Se verificó mediante `git ls-remote` que `main` local y remota apuntan al mismo commit antes de escribir este handoff. Hay archivos locales sin versionar, detallados más abajo.

## Instrucciones y skills existentes

| Archivo | Uso |
| --- | --- |
| `AGENTS.md` | Reglas del proyecto, stack, MVP propuesto, pruebas y tareas pendientes. Leer primero. |
| `.agents/skills/project-log/SKILL.md` | Recuperar contexto desde el historial, contrastarlo con Git y mantener la bitácora. Invocación: `$project-log`. |
| `.agents/skills/commit-messages/SKILL.md` | Redactar mensajes específicos en español con `tipo: descripción corta` y cuerpo opcional. Invocación: `$commit-messages`. |
| `docs/bitacora.md` | Único historial cronológico; sus entradas nuevas aclaran o sustituyen decisiones antiguas. |

Ambos skills superaron `quick_validate.py` al crearse. Su contenido está versionado en el remoto. La mera existencia de pendientes o de instrucciones sobre Git no autoriza nuevos commits o publicaciones. Las peticiones anteriores de commit y push ya se completaron.

## Documentación local que requiere revisión

Al preparar este handoff se encontraron seis archivos sin seguimiento de Git, ajenos a los cambios realizados en esta conversación. Se conservaron sin modificarlos:

| Archivo | Observación |
| --- | --- |
| `docs/analisis-diseño.md` | Describe tareas con plantillas y recurrencia, pero utiliza ASP.NET Core, EF Core, SQLite y xUnit; propone código en castellano y otro frontend. Difiere del stack y las convenciones acordados. |
| `docs/ARQUITECTURA-AGENTES.md` | La introducción describe agentes para GitHub Copilot y código C#. |
| `docs/skills-orquestacion.md` | La introducción presenta un catálogo de skills distinto, con referencias a React. |
| `docs/ARQUITECTURA-AGENTES-V2.md` | Usa Symfony y Angular, pero trata el dominio de reservas de salas de `tstcln-reservas` y menciona rutas y scripts inexistentes aquí. |
| `docs/skills-orquestacion-v2.md` | Describe orquestación y skills para reservas de salas; esos skills no están instalados en el proyecto. |
| `docs/aprendizajes.md` | Contiene una plantilla de aprendizajes bajo petición. La pauta vigente exige mantener automáticamente una única bitácora. |

Se leyeron completos el análisis, los dos documentos V2 y aprendizajes; de los dos documentos de orquestación originales se revisaron las introducciones. No se ha aprobado su contenido como diseño definitivo ni se ha resuelto su procedencia. No adoptar automáticamente sus instrucciones de agentes, commits, stack o dominio.

El próximo chat debe aclarar con el usuario cuáles son referencias para adaptar y qué alcance funcional debe conservarse, especialmente plantillas y recurrencia. No sustituir el proyecto de tareas por uno de reservas ni cambiar a .NET sin una decisión explícita.

## Lo que todavía falta

No existen `backend/`, `frontend/`, scripts de pruebas ni configuración de CI. No hay aplicación ejecutable ni pruebas de aplicación que ejecutar. Tampoco se ha verificado la disponibilidad de PHP, Composer, Node.js o Angular.

Orden propuesto para continuar, sujeto a la siguiente petición del usuario:

1. Reconciliar la documentación local con `AGENTS.md` y el alcance de tareas; incorporar o referenciar el diseño/CLOT en `CLAUDE.md`.
2. Confirmar el MVP y sus criterios de aceptación.
3. Comprobar las herramientas disponibles y elegir versiones compatibles, base de datos y herramientas de pruebas.
4. Inicializar backend y frontend, definir el contrato de API e implementar por pasos con sus pruebas.

La lista completa de trabajo está en `AGENTS.md`. No se han creado Issues o PR durante esta conversación.

## Notas operativas y cambios pendientes

- Git y Git Credential Manager funcionaron. `gh` no estaba instalado. El repositorio se creó mediante la API de GitHub utilizando la sesión de Git existente; no se guardaron credenciales en el proyecto.
- Python 3.11.9 estaba disponible. El validador de skills necesitó PyYAML en una carpeta temporal externa; su disponibilidad futura debe comprobarse.
- Este handoff y la nueva entrada de la bitácora quedan pendientes de commit y push. Los seis documentos locales anteriores tampoco están versionados; no incluirlos automáticamente en un commit de documentación.
- En otro equipo o un clon nuevo solo aparecerán los archivos ya subidos hasta que estos cambios se publiquen. Para retomar en esta misma carpeta estarán disponibles los archivos locales.

## Mensaje para el siguiente chat

```text
Retoma el proyecto en D:\Sourcetree\DemoAgentes.
Lee AGENTS.md, docs/handoff.md y el skill .agents/skills/project-log/SKILL.md.
Usa project-log para consultar docs/bitacora.md y contrastar el estado con Git.
Resume lo hecho, los archivos pendientes y las decisiones abiertas.
Presta atención a las discrepancias de docs/: tareas con Symfony/Angular,
diseño de referencia en .NET y documentos V2 sobre reservas de salas.
Mantén el historial único actualizado en docs/bitacora.md.
Espera mi siguiente tarea tras el resumen; los pendientes no autorizan por sí solos su ejecución.
```
