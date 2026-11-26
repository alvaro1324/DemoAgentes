# Handoff de DemoAgentes 0.1

Visor rediseñado por agentes y grabaciones (26 de noviembre de 2026): cinco cajas
Mermaid, log de acciones/decisiones, reproducción con pausa/pasos/velocidad y
grabaciones JSON completas automáticas en `.runtime/orchestrator-monitor/events/recordings`.
Guía vigente en `docs/orquestador-monitor.md`; el Word existente es histórico de
la primera versión. Los eventos anteriores sin actividad conservan sus etapas,
sin inventar agentes en ejecución. No cambia la aplicación ni sus dependencias.

Buscador local por título (26 de noviembre de 2026): plan en
`docs/plan-buscador-titulo.md`, criterios C1–C8 en diseño sección12. Cambios
acotados a `frontend/src/app/app.{ts,html,css,spec.ts}`; control reactivo separado
del editor, vista derivada, contadores globales y búsqueda conservada al actualizar.
Plan y parche de roles nativos con acceso a archivos/comandos asistido por el
padre debido a la falta de herramientas de las instancias. Resultados de pruebas
y revisión independiente: consultar las entradas recientes de la bitácora.

Actualización del 26 de noviembre de 2026: visor local del orquestador en
`tools/orchestrator-monitor`, hooks en `.codex/hooks.json`, guía en
`docs/orquestador-monitor.md` y proceso en `docs/proceso-orquestador-monitor.docx`.
Pruebas propias: 13 casos Node y 9 comprobaciones Chromium superadas; Word de
7 páginas abierto y renderizado con Microsoft Word. La carga/confianza de hooks
y un encargo delegado nativo completo siguen pendientes en nueva sesión.
No confundir la demostración con ejecución real ni con revisión independiente.

Estado local comprobado el 24 de noviembre de 2026 (Europe/Madrid). Esta es una guía de reanudación; el historial único continúa en `docs/bitacora.md`.

## Objetivo y estado actual

El usuario aprobó el análisis adaptado a PHP, Symfony, Doctrine y Angular y solicitó crear la versión 0.1. El MVP ya está implementado: crear, listar, consultar, editar, completar, reabrir, eliminar y filtrar tareas, con persistencia SQLite e interfaz en español adaptable a móvil.

Versiones comprobadas: PHP 8.4.28, Symfony FrameworkBundle 7.4.23 LTS, Doctrine ORM 3.8.0, Node 20.19.0 y Angular 21.2.26. Archivos de bloqueo presentes. Los detalles del contrato y las decisiones están en `docs/version-0.1.md`.

## Repositorio y cambios locales

- Carpeta: `D:\Sourcetree\DemoAgentes`; Windows y PowerShell.
- GitHub privado: <https://github.com/alvaro1324/DemoAgentes>, remoto `origin`.
- Rama: `main`, con seguimiento de `origin/main`.
- Último commit local y remoto comprobado: `5bf0b27`, `docs: registrar la subida de la versión 0.1 y el skill modelo`. La subida anterior terminó correctamente; no se ha creado etiqueta ni release.
- Cambios locales posteriores: `Task` protege los límites del título y la descripción y evita modificaciones parciales cuando fallan esas validaciones. Se añadieron pruebas unitarias, pero el usuario pidió expresamente no ejecutarlas en este paso. Sintaxis PHP, PHPStan y mapeo/esquema Doctrine comprobados correctamente; no se necesita una migración nueva.
- El commit solicitado incluye también los cuatro skills locales adicionales (`docx`, `pdf`, `pptx`, `xlsx`) y los documentos antiguos que estaban sin versionar. Se conservan como aportaciones existentes; versionarlos no convierte sus referencias a otros stacks o dominios en requisitos de esta aplicación.

Contrastar siempre estas referencias con Git al retomar. Las peticiones anteriores de commit y push ya finalizaron; no autorizan publicaciones nuevas.

## Archivos para retomar

El trabajo se realiza exclusivamente con Codex, guiado por `AGENTS.md`, el análisis y los skills locales.

| Archivo o carpeta | Función |
| --- | --- |
| `AGENTS.md` | Reglas comunes, alcance y lista de tareas actualizada |
| `docs/analisis-diseño.md` | Diseño aprobado por el usuario el 24 de noviembre de 2026 |
| `docs/version-0.1.md` | Versiones, límites, contrato API y exclusiones concretas |
| `README.md` | Instalación, arranque, datos y verificaciones |
| `backend/` | API Symfony, entidad Task, repositorio, migración y pruebas |
| `frontend/` | Aplicación Angular, pruebas Vitest y Playwright |
| `scripts/` | Instalación, arranque/parada y comprobaciones en PowerShell |
| `.github/workflows/ci.yml` | Comprobaciones de GitHub Actions; ejecución remota pendiente |

Usar `bitacora` desde `.agents/skills/bitacora/SKILL.md` para recuperar contexto y mantener la bitácora. Usar `commit-messages` desde `.agents/skills/commit-messages/SKILL.md` al preparar mensajes de commit.

Para definir, actualizar o revisar el diseño funcional y técnico, usar `$analisis-diseno`, definido en `.agents/skills/analisis-diseno/SKILL.md`. Trabaja sobre `docs/analisis-diseño.md`, con criterios de aceptación y evaluación del impacto; distingue propuestas, aprobaciones e implementación antes de pasar al skill `modelo`.

Para crear o actualizar entidades, campos, relaciones e invariantes, usar `$modelo`, definido en `.agents/skills/modelo/SKILL.md`. Se creó a partir del README, análisis, decisiones de la 0.1, código actual y documentos de orquestación. Su integración específica de DemoAgentes está documentada al principio de `docs/skills-orquestacion-v2.md`; el resto de ese documento conserva ejemplos de otro proyecto.

## Arranque y verificación

Agente de proyecto añadido: `planificador`, definido en
`.codex/agents/planificador.toml`. Solo genera `docs/plan-*.md` y registra su trabajo
en la bitácora; no implementa, ejecuta pruebas ni activa otros agentes. Consultar
`docs/planificador.md` para uso y ensayo con el filtrado por estado ya desarrollado.
También se añaden `desarrollador_backend` y `desarrollador_frontend` en
`.codex/agents/`, con ámbitos backend/frontend y coordinación mediante contrato
resuelto, archivos disjuntos y escritor único del registro compartido. Consultar
`docs/agentes-desarrollo.md`. Se añade `orquestador` en `.codex/agents/orquestador.toml`
para coordinar encargos, dependencias, documentación y comprobaciones; consultar
`docs/orquestador.md`. Se define `verificador` en `.codex/agents/verificador.toml`,
con dictámenes APROBADO/REVISAR y sin corregir código. El orquestador coordina una
revisión inicial y hasta tres ciclos de corrección y nueva revisión; termina
APROBADO o entrega BLOQUEADO. Contrato en `docs/verificador.md`. Solicitar solo un plan no
activa implementación. La selección nativa del flujo sigue sin ensayar;
los resultados de comprobaciones se registran en
`docs/bitacora.md`.

Desde la raíz, `./scripts/install.ps1` instala las dependencias y aplica la migración. `./scripts/start.ps1` sirve la interfaz en http://127.0.0.1:4200 y la API en http://127.0.0.1:8000/api/tasks. `./scripts/stop.ps1` detiene los procesos propios. Las herramientas locales están en `.tools/`, los logs en `.runtime/`; ambas carpetas están ignoradas por Git.

El PHP de XAMPP es 8.0.30 y no sirve para este proyecto; no se modificó. Se preparó una copia aislada de PHP 8.4 y Composer. Docker no estaba operativo y no es necesario. `gh` no estaba instalado; el remoto se creó anteriormente mediante la API utilizando Git Credential Manager.

Comprobaciones completas desde la raíz: `./scripts/test.ps1` (añadir `-InstallBrowser` para instalar Chromium la primera vez, o `-SkipE2E` para omitir navegador). También existen `test-backend.ps1`, `test-frontend.ps1` y `test-e2e.ps1` dentro de `scripts/`. Playwright inicia servidores en 8001/4201 y usa otra base. Los resultados finales de las comprobaciones ejecutadas están en la bitácora.

Bases separadas: `backend/var/tasks.db` para uso local, `tasks_test.db` para PHPUnit y `tasks_e2e.db` para Playwright. Las pruebas limpian sus bases; no deben apuntarse a datos reales.

## Pendientes y límites

- Categorías añadidas al modelo: `Category` (id/name), repositorio y relación opcional `Task.category`, mapeados con atributos. Migración `Version20261124124702` aplicada localmente; SQLite tiene activadas las claves foráneas con el middleware de DBAL. Hay copia previa de la base en `.runtime/`. No hay gestión de categorías en API ni Angular todavía. Análisis actualizado en su sección 4; la ampliación está pendiente de nueva firma documental, sin atribuirle la aprobación original del MVP.
- Los tests nuevos de categorías y persistencia y la adaptación del esquema de `TaskApiTest` se han escrito sin ejecutar, respetando la indicación del usuario. No interpretar la migración aplicada como una batería de pruebas superada.
- Ejecutar las pruebas del último cambio cuando el usuario lo solicite; por ahora no se ha verificado su comportamiento mediante tests. Los resultados anteriores del MVP no validan estos cambios nuevos.
- El skill `modelo` conserva algunas referencias antiguas a fuentes inexistentes (`docs/analisis.md`, reglas RN y ADR); las fuentes vigentes son `AGENTS.md`, `docs/analisis-diseño.md` y `docs/version-0.1.md`. Pendiente completar la alineación de esas instrucciones. No incorporar plantillas, recurrencia ni reglas RN sin aprobar.
- El tipo Angular `CreateTask` todavía exige `description`, aunque la API permite omitirla. Queda fuera del cambio de entidad actual.
- Confirmar con el usuario cualquier ampliación: plantillas y recurrencia no forman parte de la 0.1. Tampoco cuentas, paginación ni dominio de reservas.
- Revisar el diff del MVP y publicarlo solo cuando se solicite. Ejecutar CI remota tras publicarlo.
- Adaptar los documentos antiguos: `ARQUITECTURA-AGENTES.md`, `skills-orquestacion.md` y sus variantes V2 todavía describen C#, React o reservas de salas y rutas que no corresponden a esta aplicación.
- `docs/aprendizajes.md` conserva una plantilla antigua bajo petición; la pauta vigente exige actualizar automáticamente una única bitácora.
- La auditoría npm detectó 16 avisos moderados en dependencias de desarrollo transitivas de Angular CLI (glob/minimatch). No se aplicó la sugerencia de cambiar a Angular CLI 16, incompatible con el proyecto. Revisar parches compatibles; la auditoría de dependencias de producción se comprueba por separado.
- Los servidores incluidos son de desarrollo local; el despliegue de producción sigue fuera de este paso.

## Mensaje para el siguiente chat

```text
Retoma DemoAgentes en D:\Sourcetree\DemoAgentes.
Lee AGENTS.md, docs/handoff.md, docs/version-0.1.md y el skill bitacora.
Consulta docs/bitacora.md y contrasta el estado con Git.
La versión 0.1 del MVP ya está publicada en GitHub. Hay cambios locales de validación en Task y pruebas añadidas que el usuario pidió no ejecutar. Comprueba Git y la bitácora antes de continuar.
Resume el estado y los siguientes pasos; mantén actualizada la bitácora.
No adoptes los documentos antiguos de .NET o reservas como requisitos nuevos.
Espera mi siguiente tarea tras el resumen.
```
