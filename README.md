# DemoAgentes 0.1

Aplicación de lista de tareas con API Symfony, Doctrine y Angular. Permite crear, consultar, editar, completar, reabrir, eliminar y filtrar tareas. La interfaz está en español y se adapta a móvil y escritorio.

El campo **Buscar por título** busca fragmentos sin distinguir mayúsculas ni
espacios exteriores y se combina con el estado seleccionado. **Limpiar búsqueda**
restaura las tareas de ese estado. Los contadores siguen siendo globales; la
búsqueda se conserva al actualizar el listado y se vacía al recargar la página.


La lista permite combinar búsqueda, filtro por estado y orden por más recientes, más antiguas o título A–Z. El orden se aplica en el navegador; más recientes es la opción inicial.

El editor muestra los contadores de título y descripción y pide confirmación antes de descartar cambios. Al abrirlo enfoca el título y, al cerrarlo, devuelve el foco al botón de origen cuando está disponible. Si una actualización falla, conserva las tareas cargadas y muestra el error; un fallo inicial no se presenta como una lista vacía.
## Entorno

La versión se ha comprobado en Windows con PHP 8.4.28, Symfony 7.4.23 LTS, Doctrine ORM 3.8.0, SQLite, Node 20.19.0 y Angular 21.2. Los detalles resueltos están en `backend/composer.lock` y `frontend/package-lock.json`.

Se necesita PHP 8.4 con `pdo_sqlite`, `mbstring`, `openssl`, `curl` y `zip`, Composer 2, y Node compatible con Angular 21 (20.19+, 22.12+ o 24). Para un entorno nuevo se recomienda Node 22 LTS compatible. [Compatibilidad oficial de Angular](https://angular.dev/reference/versions), [Symfony 7.4 LTS](https://symfony.com/releases/7.4).

## Instalación en Windows

Desde la raíz, en PowerShell:

```powershell
./scripts/install.ps1
./scripts/start.ps1
```

El instalador prepara una copia de PHP 8.4 y Composer en `.tools/`, verifica sus checksums, instala las dependencias con los archivos de bloqueo y aplica la migración. No modifica XAMPP ni el PATH del sistema. Requiere acceso a Internet y el runtime de Visual C++ compatible con PHP para Windows.

Abrir **http://127.0.0.1:4200** después de la compilación inicial. API: **http://127.0.0.1:8000/api/tasks**.

Los procesos se abren en segundo plano sin ventanas. Logs en `.runtime/`. Para detenerlos:

```powershell
./scripts/stop.ps1
```

El script comprueba los puertos antes de arrancar y solo detiene los procesos registrados por este proyecto.

## Instalación manual con PHP y Composer disponibles

```sh
cd backend
composer install
php bin/console doctrine:migrations:migrate --no-interaction
php -S 127.0.0.1:8000 -t public public/index.php
```

En otra terminal:

```sh
cd frontend
npm ci
npm start
```

El proxy de Angular dirige `/api` al backend. El token Angular `API_BASE_URL` permite cambiar la base de la API; al desplegar, configurar el proxy inverso del mismo origen o la política de orígenes necesaria.

## Datos y configuración

- `backend/.env` contiene valores de desarrollo sin credenciales. Copiar los valores necesarios a `.env.local` para personalizarlos; no versionar secretos.
- Base local: `backend/var/tasks.db`. Se crea con la migración y conserva las tareas entre arranques.
- PHPUnit usa exclusivamente `backend/var/tasks_test.db` y limpia las tareas de esa base antes de cada prueba.
- Playwright usa exclusivamente `backend/var/tasks_e2e.db`; limpia sus tareas antes de cada caso. No modificar su URL para apuntar a datos reales.
- Las bases, dependencias, herramientas y logs están ignorados por Git.

La 0.1 está preparada para desarrollo local sin autenticación y con servidores ligados a loopback. El servidor integrado de PHP y `ng serve` son servidores de desarrollo. Para producción será necesario configurar el servidor web, HTTPS, secretos y el acceso a los datos.

## Verificación

En PowerShell desde la raíz:

```powershell
./scripts/test.ps1
```

La primera vez que se ejecuten pruebas de navegador en un equipo, usar `./scripts/test.ps1 -InstallBrowser` para descargar Chromium. Para comprobar solo backend y frontend: `./scripts/test.ps1 -SkipE2E`.

También se pueden ejecutar por separado:

```powershell
./scripts/test-backend.ps1
./scripts/test-frontend.ps1
./scripts/test-e2e.ps1
```

El backend comprueba YAML, contenedor, PHPStan y PHPUnit. El frontend comprueba formato, tests de componentes/servicios y compilación de producción. Playwright inicia y detiene servidores propios en los puertos 8001 y 4201; esos puertos deben estar libres. Si PHP no está en PATH ni en `.tools/php/php.exe`, configurar `PHP_BINARY` con su ruta absoluta para Playwright.

Con herramientas globales pueden ejecutarse `composer test`, `composer analyse` y `php bin/console doctrine:schema:validate` desde `backend/`; `npm test`, `npm run format:check` y `npm run build` desde `frontend/`.

Se incluye `.github/workflows/ci.yml` para ejecutar las comprobaciones en GitHub Actions. Su ejecución remota requiere publicar estos archivos; no se presenta como una ejecución ya realizada.

La auditoría npm de esta instalación no detecta vulnerabilidades en dependencias de producción (`npm audit --omit=dev`). Sí informa de 16 avisos moderados en la cadena de dependencias de desarrollo de Angular CLI, asociados a glob/minimatch. Quedan pendientes de un parche compatible; no ejecutar `npm audit fix --force`, cuya sugerencia actual cambia a una CLI incompatible con Angular 21.

## Alcance y documentación

No incluye cuentas de usuario, plantillas, recurrencia ni paginación.

- [Análisis aprobado](docs/analisis-diseño.md).
- [Decisiones y contrato de la versión 0.1](docs/version-0.1.md).
- [Bitácora única](docs/bitacora.md).
- [Handoff para otro chat](docs/handoff.md).

Los documentos antiguos de orquestación y reservas permanecen como referencias pendientes de adaptación; no describen la implementación 0.1.
## Visor del orquestador

El [visor local con Mermaid y hooks](docs/orquestador-monitor.md) permite seguir
estados, ciclos y agentes. Desde la raíz: `npm --prefix tools/orchestrator-monitor ci`
y `npm --prefix tools/orchestrator-monitor start`. Abrir <http://127.0.0.1:8790>.
El modo demostración se inicia con `npm --prefix tools/orchestrator-monitor run demo`.
El documento Word del proceso está en `docs/proceso-orquestador-monitor.docx`.
El visor actual identifica los cinco agentes, muestra acciones y decisiones y
guarda los procesos como grabaciones completas. Permite reproducir, pausar,
avanzar por pasos, acelerar hasta 100x y descargar cada grabación. El Word
corresponde a la primera versión; la guía enlazada describe el rediseño vigente.
