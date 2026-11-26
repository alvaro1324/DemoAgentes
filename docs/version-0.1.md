# Decisiones y contrato de la versión 0.1

Implementación del MVP aprobado, iniciada a petición del usuario el 24 de noviembre de 2026. Este documento concreta las decisiones que el análisis dejaba abiertas; el historial está en `bitacora.md`.

## Plataforma seleccionada

| Componente | Versión instalada |
| --- | --- |
| PHP | 8.4.28, copia local aislada de XAMPP |
| Composer | 2.11.3 |
| Symfony FrameworkBundle | 7.4.23 LTS |
| Doctrine ORM / DBAL | 3.8.0 / 4.6.0 |
| DoctrineBundle / MigrationsBundle | 3.4.2 / 3.7.1 |
| Persistencia | SQLite mediante PDO |
| Node.js / npm | 20.19.0 / 10.8.2 disponibles en el equipo |
| Angular Core / CLI | 21.2.26 / 21.2.31 |
| PHPUnit / PHPStan | 12.5.45 / 2.3.7 |
| Vitest / Playwright | 4.1.12 / 1.65.1 |

Symfony 7.4 se elige por su soporte LTS. Angular 21 es compatible con el Node disponible. SQLite permite ejecutar y probar el MVP sin un servicio de base de datos ni Docker. Docker está instalado pero su daemon no estaba disponible; no es necesario para esta versión.

Las versiones transitivas exactas están fijadas en los archivos de bloqueo. Algunos componentes Symfony transitivos pueden pertenecer a una rama compatible distinta; el FrameworkBundle y las dependencias Symfony directas permanecen en 7.4.

## Modelo y reglas

- `Task`: id entero generado por SQLite, title, description, isCompleted, createdAt y updatedAt.
- Título: texto obligatorio, normalizado quitando espacios de los extremos, de 1 a 200 caracteres. Rechazar vacío o solo espacios, incluidos espacios Unicode.
- Descripción: texto de hasta 5.000 caracteres o null; opcional al crear.
- Una tarea se crea pendiente. El cliente no puede escribir id ni fechas.
- Fechas generadas por el servidor en UTC y devueltas en ISO 8601 con offset; precisión de segundos en la API. Angular las presenta en la zona del navegador. Dos cambios en un mismo segundo pueden compartir timestamp.
- El listado se ordena por id descendente (creación más reciente primero). Filtrado en backend y en la interfaz; los contadores de la interfaz se calculan sobre el listado completo.
- El borrado es físico. La edición parcial conserva los campos no enviados; description=null elimina la descripción.
- Se valida el cuerpo completo antes de mutar la entidad, de modo que un campo inválido no produce cambios parciales.
- La entidad `Task` también normaliza y valida el título y limita la descripción al crear o actualizar, aunque se utilice fuera de la API. Lanza `InvalidArgumentException` si incumplen esas reglas; una actualización rechazada conserva el estado y las fechas anteriores. La validación HTTP mantiene su formato de errores por campo.

## Ampliación del modelo: categorías

Solicitada el 24 de noviembre de 2026 y descrita en la sección 4 de `analisis-diseño.md`. La aprobación original del MVP no se presenta como firma de esta ampliación.

- Entidad `Category` con id entero generado y name obligatorio de 1 a 100 caracteres Unicode, normalizado sin espacios en los extremos. No se exige nombre único.
- `Task.category`: relación opcional ManyToOne con atributos PHP; `getCategory()` y `assignCategory(?Category)` permiten consultar, asignar, sustituir o quitar la categoría. Asignarla actualiza updatedAt sin modificar el resto de la tarea.
- `CategoryRepository` ofrece las operaciones estándar de Doctrine. `Category.rename()` valida antes de cambiar el nombre.
- Migración `Version20261124124702`: crea category, añade task.category_id nullable, índice y clave foránea ON DELETE RESTRICT. Conserva las tareas anteriores sin categoría. La reversión elimina categorías y asociaciones, conservando los campos originales de las tareas.
- El middleware de DBAL `EnableForeignKeys` activa las claves foráneas en las conexiones SQLite. No hay persistencia ni borrado en cascada; un servicio futuro debe validar el uso de una categoría antes de borrarla y ofrecer un error comprensible.
- Alcance de este paso: modelo, persistencia y pruebas añadidas sin ejecutar. La API y Angular todavía no gestionan categorías; `Task.toArray()` mantiene el contrato existente y no expone la relación.

## API implementada

| Método | Ruta | Entrada | Éxito |
| --- | --- | --- | --- |
| GET | `/api/tasks` | `completed=true` o `completed=false` opcional | 200, array de Task |
| GET | `/api/tasks/{id}` | id entero positivo | 200, Task |
| POST | `/api/tasks` | title y description opcional | 201, Task y Location |
| PATCH | `/api/tasks/{id}` | Al menos uno de title, description, isCompleted | 200, Task |
| DELETE | `/api/tasks/{id}` | id | 204 sin cuerpo |

POST y PATCH exigen `Content-Type: application/json` y un objeto JSON. Se rechazan campos desconocidos, tipos incorrectos y campos no editables. `isCompleted` solo admite booleanos JSON al actualizar.

Errores JSON con `code`, `message` y `errors` (array de field/message). Códigos HTTP: 400 para JSON, tipos, validaciones o filtros inválidos; 404 si el recurso no existe; 405 para métodos no admitidos; 415 para tipo de contenido incorrecto; 500 con mensaje genérico y detalle en el log del servidor.

## Pruebas y límites

Pruebas de entidad, persistencia y API con PHPUnit; formularios, filtros, fallos y servicio HTTP con Vitest; recorrido completo y validación móvil con Playwright/Chromium. Bases de pruebas separadas de la base de uso local y servidores E2E separados del entorno de desarrollo.

Los comandos y los requisitos se mantienen en el README. El resumen de resultados efectivamente ejecutados se añade a la bitácora al finalizar la verificación. El workflow de GitHub Actions no implica que ya se haya ejecutado CI en remoto.

No se incluyen autenticación, plantillas, recurrencia, paginación, prioridades ni fechas límite. Los documentos previos sobre reservas o tecnologías distintas no amplían el alcance de esta versión.

Auditoría de dependencias realizada: Composer no notificó avisos; `npm audit --omit=dev` devolvió cero vulnerabilidades. La auditoría completa npm encontró 16 avisos moderados transitivos en las herramientas de Angular CLI (glob/minimatch), pendientes de un parche compatible. No se aplicó la sugerencia incompatible de cambiar de versión mayor de CLI.

Referencias: [Symfony LTS](https://symfony.com/releases/7.4), [Doctrine en Symfony](https://symfony.com/doc/7.4/doctrine.html), [compatibilidad de Angular](https://angular.dev/reference/versions).
