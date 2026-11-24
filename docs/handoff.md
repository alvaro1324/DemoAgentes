# Handoff de DemoAgentes 0.1

Estado local comprobado el 24 de noviembre de 2026 (Europe/Madrid). Esta es una guía de reanudación; el historial único continúa en `docs/bitacora.md`.

## Objetivo y estado actual

El usuario aprobó el análisis adaptado a PHP, Symfony, Doctrine y Angular y solicitó crear la versión 0.1. El MVP ya está implementado: crear, listar, consultar, editar, completar, reabrir, eliminar y filtrar tareas, con persistencia SQLite e interfaz en español adaptable a móvil.

Versiones comprobadas: PHP 8.4.28, Symfony FrameworkBundle 7.4.23 LTS, Doctrine ORM 3.8.0, Node 20.19.0 y Angular 21.2.26. Archivos de bloqueo presentes. Los detalles del contrato y las decisiones están en `docs/version-0.1.md`.

## Repositorio y cambios locales

- Carpeta: `D:\Sourcetree\DemoAgentes`; Windows y PowerShell.
- GitHub privado: <https://github.com/alvaro1324/DemoAgentes>, remoto `origin`.
- Rama: `main`, con seguimiento de `origin/main`.
- Último commit funcional/documental comprobado antes de esta subida: `2cc761f`, `chore: añadir skill de modelo y documentar su revisión`, precedido por la versión 0.1 (`229eb8c`) y el handoff inicial (`a3baa52`).
- Último commit remoto comprobado: `9406ca4`, skill de bitácora y configuración de GitHub.
- El skill `modelo` y su revisión ya están incluidos en `2cc761f`. El usuario ha solicitado subir los commits pendientes a GitHub; esta actualización documental acompaña la operación. Consultar Git para comprobar el resultado y el último hash; no se ha creado etiqueta ni release.
- El commit solicitado incluye también los cuatro skills locales adicionales (`docx`, `pdf`, `pptx`, `xlsx`) y los documentos antiguos que estaban sin versionar. Se conservan como aportaciones existentes; versionarlos no convierte sus referencias a otros stacks o dominios en requisitos de esta aplicación.

Contrastar siempre estas referencias con Git al retomar. Las peticiones anteriores de commit y push ya finalizaron; no autorizan publicaciones nuevas.

## Archivos para retomar

| Archivo o carpeta | Función |
| --- | --- |
| `AGENTS.md` | Reglas comunes, alcance y lista de tareas actualizada |
| `CLAUDE.md` | Referencia al análisis/CLOT aprobado |
| `docs/analisis-diseño.md` | Diseño aprobado por el usuario el 24 de noviembre de 2026 |
| `docs/version-0.1.md` | Versiones, límites, contrato API y exclusiones concretas |
| `README.md` | Instalación, arranque, datos y verificaciones |
| `backend/` | API Symfony, entidad Task, repositorio, migración y pruebas |
| `frontend/` | Aplicación Angular, pruebas Vitest y Playwright |
| `scripts/` | Instalación, arranque/parada y comprobaciones en PowerShell |
| `.github/workflows/ci.yml` | Comprobaciones de GitHub Actions; ejecución remota pendiente |

Usar `project-log` desde `.agents/skills/project-log/SKILL.md` para recuperar contexto y mantener la bitácora. Usar `commit-messages` desde `.agents/skills/commit-messages/SKILL.md` al preparar mensajes de commit.

Para crear o actualizar entidades, campos, relaciones e invariantes, usar `$modelo`, definido en `.agents/skills/modelo/SKILL.md`. Se creó a partir del README, análisis, decisiones de la 0.1, código actual y documentos de orquestación. Su integración específica de DemoAgentes está documentada al principio de `docs/skills-orquestacion-v2.md`; el resto de ese documento conserva ejemplos de otro proyecto.

## Arranque y verificación

Desde la raíz, `./scripts/install.ps1` instala las dependencias y aplica la migración. `./scripts/start.ps1` sirve la interfaz en http://127.0.0.1:4200 y la API en http://127.0.0.1:8000/api/tasks. `./scripts/stop.ps1` detiene los procesos propios. Las herramientas locales están en `.tools/`, los logs en `.runtime/`; ambas carpetas están ignoradas por Git.

El PHP de XAMPP es 8.0.30 y no sirve para este proyecto; no se modificó. Se preparó una copia aislada de PHP 8.4 y Composer. Docker no estaba operativo y no es necesario. `gh` no estaba instalado; el remoto se creó anteriormente mediante la API utilizando Git Credential Manager.

Comprobaciones completas desde la raíz: `./scripts/test.ps1` (añadir `-InstallBrowser` para instalar Chromium la primera vez, o `-SkipE2E` para omitir navegador). También existen `test-backend.ps1`, `test-frontend.ps1` y `test-e2e.ps1` dentro de `scripts/`. Playwright inicia servidores en 8001/4201 y usa otra base. Los resultados finales de las comprobaciones ejecutadas están en la bitácora.

Bases separadas: `backend/var/tasks.db` para uso local, `tasks_test.db` para PHPUnit y `tasks_e2e.db` para Playwright. Las pruebas limpian sus bases; no deben apuntarse a datos reales.

## Pendientes y límites

- Confirmar con el usuario cualquier ampliación: plantillas y recurrencia no forman parte de la 0.1. Tampoco cuentas, paginación ni dominio de reservas.
- Revisar el diff del MVP y publicarlo solo cuando se solicite. Ejecutar CI remota tras publicarlo.
- Adaptar los documentos antiguos: `ARQUITECTURA-AGENTES.md`, `skills-orquestacion.md` y sus variantes V2 todavía describen C#, React o reservas de salas y rutas que no corresponden a esta aplicación.
- `docs/aprendizajes.md` conserva una plantilla antigua bajo petición; la pauta vigente exige actualizar automáticamente una única bitácora.
- La auditoría npm detectó 16 avisos moderados en dependencias de desarrollo transitivas de Angular CLI (glob/minimatch). No se aplicó la sugerencia de cambiar a Angular CLI 16, incompatible con el proyecto. Revisar parches compatibles; la auditoría de dependencias de producción se comprueba por separado.
- Los servidores incluidos son de desarrollo local; el despliegue de producción sigue fuera de este paso.

## Mensaje para el siguiente chat

```text
Retoma DemoAgentes en D:\Sourcetree\DemoAgentes.
Lee AGENTS.md, docs/handoff.md, docs/version-0.1.md y el skill project-log.
Consulta docs/bitacora.md y contrasta el estado con Git.
La versión 0.1 del MVP ya está implementada y sigue pendiente de commit/push.
Resume el estado y los siguientes pasos; mantén actualizada la bitácora.
No adoptes los documentos antiguos de .NET o reservas como requisitos nuevos.
Espera mi siguiente tarea tras el resumen.
```
