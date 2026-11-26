# Análisis y diseño de la lista de tareas

## Aprobación documental

Estado de la ampliación de categorías del 24 de noviembre de 2026: pendiente de nueva firma documental. El usuario solicitó su implementación mediante `/modelo agrega categorias de tareas`; la aprobación original que sigue corresponde al MVP anterior a esta ampliación.

Aprobado por el usuario del proyecto el 24 de noviembre de 2026 (Europe/Madrid), mediante la declaración en el chat: «apruebo la documentacion, la firmo».

Esta aprobación establece el análisis adaptado a PHP, Symfony, Doctrine y Angular como base documental para el desarrollo, con el MVP y los criterios de aceptación descritos. Las decisiones expresamente pendientes conservan ese estado; plantillas y recurrencia siguen como ampliaciones por confirmar. El registro recoge la conformidad expresada en el chat.

## 1. Objetivo y alcance

Desarrollar una aplicación web de gestión de tareas con backend PHP/Symfony, persistencia Doctrine y frontend Angular. Priorizar claridad, cambios pequeños y pruebas automatizadas.

Este documento conserva la base de diseño aprobada. La versión 0.1 implementa el MVP; las versiones, el motor de base de datos, los límites de campos y el contrato concretados se recogen en [version-0.1.md](version-0.1.md). Las secciones que se presentan como propuestas describen el diseño previo y deben leerse junto a esas decisiones de implementación.

### MVP

- Crear tareas con título obligatorio y descripción opcional.
- Consultar listado y detalle; editar título y descripción.
- Marcar como completada o pendiente y eliminar una tarea.
- Filtrar por estado: todas, pendientes y completadas.
- Mostrar carga, lista vacía, errores de validación y errores de comunicación.

### Funcionalidades del análisis original pendientes de confirmar

Conservar como ampliaciones propuestas las plantillas reutilizables y las tareas repetitivas. No incluirlas automáticamente en el MVP. Si se aprueban, completar una tarea repetitiva generaría su siguiente ocurrencia. Su diseño preliminar figura en la sección 7.

## 2. Stack tecnológico

| Tecnología | Responsabilidad | Estado |
| --- | --- | --- |
| PHP y Symfony | API HTTP JSON, servicios de aplicación y validación | Stack acordado; versiones pendientes |
| Doctrine ORM y Doctrine Migrations | Entidades, repositorios y migraciones versionadas | Stack acordado; versiones compatibles pendientes |
| Angular y TypeScript | Interfaz, formularios reactivos y servicios HTTP tipados | Stack acordado; versiones pendientes |
| Base de datos relacional | Persistencia de tareas | Motor pendiente; SQLite es una opción para evaluar |
| PHPUnit y herramientas de pruebas de Symfony | Pruebas unitarias, de integración y funcionales de API | Configuración pendiente |
| Herramientas de pruebas compatibles con Angular | Pruebas de componentes, formularios y servicios HTTP | Selección pendiente según versión |
| Herramienta de extremo a extremo | Recorridos de usuario a través de frontend y backend | Pendiente de selección |

Antes de instalar dependencias, comprobar PHP, Composer, Node.js y el gestor de paquetes disponible; elegir versiones compatibles y documentarlas. El frontend ya está decidido: Angular.

## 3. Arquitectura y estructura propuestas

Separar la interfaz Angular de la API Symfony. Mantener los controladores pequeños y extraer la lógica de negocio a servicios cuando lo justifique su complejidad. Acceder a los datos mediante repositorios Doctrine y gestionar el esquema con migraciones.

```text
backend/
  src/
    Controller/      Endpoints HTTP y respuestas JSON
    Entity/          Task y, si se aprueban, TaskTemplate
    Repository/      Consultas y filtros de Doctrine
    Service/         Reglas y operaciones de negocio que lo requieran
    Dto/             Contratos de entrada y salida cuando sean necesarios
  config/            Configuración Symfony y persistencia
  migrations/        Evolución versionada del esquema
  tests/             Pruebas unitarias, de integración y funcionales
frontend/
  src/app/
    tasks/           Listado, detalle y formularios de tareas
    services/        Acceso HTTP tipado a la API
    models/          Tipos TypeScript del contrato JSON
  ...                Configuración y pruebas según la versión elegida
docs/                Documentación y bitácora única
```

Usar inyección de dependencias de Symfony. Los componentes Angular gestionan la presentación; los servicios HTTP concentran las peticiones. La validación del servidor es obligatoria aunque el formulario tenga validaciones equivalentes. Evitar interfaces, capas o bibliotecas que no aporten valor al alcance real.

Convenciones: identificadores en inglés, documentación y mensajes de usuario en español; JSON en camelCase. La estructura definitiva se ajustará al inicializar el proyecto.

## 4. Modelo de datos del MVP

### Task

| Campo | Tipo conceptual | Regla propuesta |
| --- | --- | --- |
| id | Identificador | Generado en el backend; tipo definitivo pendiente |
| title | string | Obligatorio; rechazar vacío o solo espacios; longitud máxima pendiente |
| description | string o null | Opcional; límite pendiente |
| isCompleted | boolean | false al crear, salvo cambio del contrato acordado |
| createdAt | Fecha y hora inmutable | Asignada por el backend al crear |
| updatedAt | Fecha y hora inmutable | Asignada al crear y actualizada al modificar |
| category | Category o null | Relación opcional muchos a uno; las tareas existentes conservan null |

En PHP, representar las fechas con DateTimeImmutable. Propuesta de intercambio: fechas ISO 8601 con zona explícita y almacenamiento normalizado a UTC; presentación en la zona del usuario. Concretar precisión y formato antes de implementar.

No permitir que el cliente modifique identificadores o fechas de auditoría. La versión 0.1 materializa este modelo en `backend/src/Entity/Task.php` y su migración inicial.

### Ampliación: categorías de tareas

Solicitada el 24 de noviembre de 2026. En este paso se implementan el modelo y la persistencia, con atributos PHP de Doctrine. La gestión HTTP y Angular queda pendiente; el contrato de tareas de la versión 0.1 se conserva.

| Campo de Category | Tipo | Regla |
| --- | --- | --- |
| id | int | Generado por la base de datos |
| name | string | Obligatorio, sin espacios en los extremos, entre 1 y 100 caracteres Unicode |

- Cada tarea tiene cero o una categoría; una categoría puede utilizarse en varias tareas. La relación es unidireccional desde `Task`.
- Se puede asignar, cambiar o quitar la categoría de una tarea; la operación actualiza `updatedAt` y conserva el resto del contenido y el estado.
- Renombrar una categoría conserva su identidad y las asociaciones. Un nombre inválido se rechaza antes de mutar el objeto. No se exige unicidad de nombres en este alcance.
- La clave foránea `task.category_id` es nullable y utiliza `ON DELETE RESTRICT`. No hay borrado en cascada de tareas ni persistencia en cascada de categorías; la categoría se persiste explícitamente antes de guardar una tarea que la referencia. Un servicio futuro debe comprobar el uso antes del borrado y presentar el error al usuario. SQLite requiere activar sus claves foráneas en cada conexión para aplicar la restricción.
- La migración es aditiva y conserva las tareas existentes. No se crean categorías predefinidas ni se asignan automáticamente.
- Criterios de aceptación del modelo: rechazar nombres vacíos o de más de 100 caracteres; aceptar el límite Unicode; asignar, sustituir y quitar categorías sin alterar los demás campos; conservar el nombre tras un renombrado inválido; mapeo y esquema sincronizados tras migrar. Los tests se añaden sin ejecutarlos por la indicación vigente del usuario.

## 5. Contrato preliminar de API

Se proponen rutas en inglés coherentes con los identificadores. El contrato debe confirmarse antes de implementar y mantenerse alineado entre Symfony y Angular.

| Método | Ruta | Comportamiento | Respuesta correcta |
| --- | --- | --- | --- |
| GET | /api/tasks | Listar tareas; filtro opcional completed=true o completed=false | 200, array de tareas |
| GET | /api/tasks/{id} | Consultar detalle | 200, tarea |
| POST | /api/tasks | Crear con title y description opcional | 201, tarea y cabecera Location |
| PATCH | /api/tasks/{id} | Editar los campos enviados: title, description o isCompleted | 200, tarea actualizada |
| DELETE | /api/tasks/{id} | Eliminar físicamente | 204, sin cuerpo |

Sin filtro se devuelven todas. El filtro admite únicamente los valores documentados; cualquier otro se rechaza. La propuesta permite cambiar el estado con PATCH para el MVP; si se aprueba recurrencia, revisar la operación de completar antes de añadir efectos secundarios.

Errores propuestos: 400 para JSON mal formado, tipos o campos inválidos, filtro inválido y validaciones; 404 para identificador inexistente. Definir el formato estable, por ejemplo:

```json
{
  "code": "validation_error",
  "message": "Revisa los datos de la tarea.",
  "errors": [
    { "field": "title", "message": "El título es obligatorio." }
  ]
}
```

Serializar únicamente los campos del contrato. No exponer sin control el grafo de entidades Doctrine, mensajes internos ni trazas. Los fallos inesperados devuelven un error genérico y quedan registrados en el servidor.

## 6. Interfaz Angular

- Listado con filtros de estado y acciones de edición, cambio de estado y eliminación.
- Vista de detalle y formulario de creación/edición con formularios reactivos.
- Servicio de tareas con HttpClient y tipos de entrada, salida y error explícitos.
- Indicadores de carga y errores visibles. Evitar envíos duplicados mientras una operación está en curso.
- Reflejar una mutación confirmada por el backend; si falla, mantener una interfaz coherente e informar al usuario.
- Etiquetas accesibles, navegación por teclado y mensajes de validación asociados a los campos.

Configurar la URL de API por entorno y concretar proxy de desarrollo o CORS según el despliegue elegido. No incluir secretos en la configuración pública de Angular.

## 7. Diseño preliminar de plantillas y recurrencia

Esta sección conserva el alcance adicional del análisis original para decidirlo con el usuario. No es un requisito aprobado del MVP.

- TaskTemplate sería una entidad independiente con título, descripción y configuración de recurrencia opcional.
- Task podría referenciar opcionalmente su plantilla. Las tareas manuales no necesitarían plantilla.
- RecurrenceType representaría daily, weekly y monthly. Una tarea no repetitiva no tendría recurrencia ni próxima fecha.
- Al instanciar una plantilla se copiarían sus valores a una nueva tarea; la propagación posterior de cambios queda pendiente.
- Si se aprueba la generación al completar, la operación y la creación de la siguiente ocurrencia deben persistirse atómicamente. Los reintentos no deben crear duplicados; la estrategia de concurrencia e idempotencia se definirá antes de implementar.
- Propuestas de rutas adicionales: /api/task-templates para CRUD, POST /api/task-templates/{id}/instantiate y POST /api/tasks/{id}/complete. Confirmar payloads y respuestas; evitar respuestas ambiguas entre la tarea completada y la nueva ocurrencia.

Decisiones abiertas: fecha base de la siguiente ocurrencia, fin de mes, zona horaria, cambio de horario, tareas vencidas, reapertura de tareas completadas, eliminación de plantillas y tratamiento de concurrencia. No habrá generación programada sin completar una tarea salvo que se solicite ese comportamiento.

## 8. Pruebas y criterios de aceptación

| Área | Comportamiento que se debe verificar |
| --- | --- |
| Reglas de negocio | Validación del título y cambios de estado; recurrencia solo si se aprueba |
| Persistencia | Guardado, lectura, actualización, eliminación y filtrado con una base de datos de pruebas aislada |
| API Symfony | Respuestas correctas de CRUD y filtros; errores 400 y 404; contrato JSON y fechas |
| Angular | Validación de formularios, filtros, servicio HTTP y estados de carga, vacío y error |
| Extremo a extremo | Crear una tarea, consultarla, editarla, completarla, reabrirla y eliminarla |

Criterios del MVP:

1. Una tarea creada con datos válidos persiste y aparece tras volver a consultar.
2. Un título vacío o con espacios se rechaza en el servidor y se señala en el formulario.
3. La edición conserva los campos no enviados y actualiza la fecha de modificación.
4. El cambio de estado se refleja en el listado y en los filtros.
5. Una tarea eliminada deja de aparecer y su consulta devuelve 404.
6. Los errores de API y de red se muestran sin presentar la operación como completada.
7. Las pruebas automatizadas pertinentes pasan sin modificar datos de desarrollo o producción.

Los comandos reales de instalación, arranque y pruebas de la versión 0.1 están documentados en [el README](../README.md).

## 9. Decisiones pendientes y siguiente paso

- Confirmar límites, formato exacto de fechas, identificadores, orden del listado y contrato de actualización.
- Elegir versiones, motor de base de datos y uso de contenedores.
- Confirmar si plantillas y recurrencia forman parte de una siguiente fase.
- Elegir herramientas de pruebas Angular, extremo a extremo y CI.
- Autenticación, paginación, prioridades, búsqueda y fechas límite quedan fuera del MVP actual, salvo acuerdo posterior.
- Mantener el diseño/CLOT referenciado directamente desde `AGENTS.md`, que guía el trabajo con Codex.

Las decisiones necesarias para el MVP se concretaron al implementar la versión 0.1 en [version-0.1.md](version-0.1.md). Las ampliaciones funcionales siguen pendientes de acuerdo posterior.

## 10. Referencias técnicas

- [Pruebas de Symfony y PHPUnit](https://symfony.com/doc/current/testing.html).
- [Validación de Symfony](https://symfony.com/doc/current/validation.html).
- [Pruebas de repositorios Doctrine](https://symfony.com/doc/current/testing/database.html).
- [Formularios reactivos de Angular](https://angular.dev/guide/forms/reactive-forms).
