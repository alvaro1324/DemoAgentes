# Agente orquestador de DemoAgentes

Visor HTML con Mermaid, hooks de ciclo de vida y estados explícitos:
[instalación, uso y límites](orquestador-monitor.md). Iniciar con
`npm --prefix tools/orchestrator-monitor start` y abrir <http://127.0.0.1:8790>.

Definición: [orquestador.toml](../.codex/agents/orquestador.toml).
Coordina al [planificador](planificador.md) y a los
[desarrolladores](agentes-desarrollo.md) según el encargo. Coordina la revisión
independiente de [verificador](verificador.md) y las correcciones necesarias.

## Alcance y criterios de esta incorporación

Se añade el rol siguiendo el formato de los agentes existentes, sin cambiar el
comportamiento de la aplicación. Debe distinguir planificación de ejecución,
repartir trabajo por archivos y contrato, evitar escritores simultáneos del
registro y contrastar las entregas antes del cierre. Las publicaciones necesitan
estar incluidas en el encargo del usuario.

El archivo contiene `name`, `description` y `developer_instructions`; no fija
modelo, MCP ni permisos y no modifica la configuración personal. Sus límites son
instrucciones de comportamiento, no aislamiento técnico del sistema de archivos.

## Uso

En una sesión de Codex abierta en el repositorio que exponga el rol:

```text
Usa el agente orquestador para implementar: <necesidad y criterios>.
Coordina únicamente las capas afectadas, integra la documentación y ejecuta
las comprobaciones pertinentes con datos aislados. Entrega cambios y evidencias.
```

Un encargo de «solo planificar» termina con el plan. Si ya hay un plan suficiente,
puede referenciarse por su ruta; no obliga a repetir la planificación. El
orquestador no necesita activar ambos desarrolladores para todos los cambios.

Si el cliente no expone el tipo, abrir una nueva sesión permite volver a comprobar
su disponibilidad; no garantiza que vaya a descubrirlo. Debe informarse de la
limitación sin presentar un agente genérico como selección nativa del orquestador.

## Comando de acceso

El fichero de instrucciones del comando es
[`.codex/prompts/orquestador.md`](../.codex/prompts/orquestador.md). Para instalarlo
o actualizarlo en el usuario actual:

```powershell
./scripts/install-codex-prompts.ps1
```

El instalador copia el fichero a `~/.codex/prompts/orquestador.md`, o a
`$CODEX_HOME/prompts/orquestador.md` si esa variable está definida. Conserva una
copia de cualquier contenido anterior diferente. La copia del repositorio por
sí sola no registra un comando: Codex descubre estos prompts en su carpeta de
usuario.

Tras abrir una nueva sesión de CLI o recargar la extensión de Codex, ejecutar:

```text
/prompts:orquestador Implementa el plan docs/plan-prueba-filtros-estado.md
```

La ruta anterior es un ejemplo de sintaxis, no una orden de ejecutar ese plan
ni una afirmación de que queden cambios por implementar. También se admite
`/prompts:orquestador` sin argumentos: usa un encargo pendiente inequívoco o
pregunta cuál es. El comando comprueba el proyecto y solicita el agente
personalizado si está disponible; no garantiza su descubrimiento ni crea los
roles que falten.

La forma documentada es `/prompts:orquestador`; `/orquestador` no se registra
como alias por crear este archivo. Esta instalación usa el mecanismo de
[custom prompts de OpenAI](https://learn.chatgpt.com/docs/custom-prompts),
marcado como obsoleto en favor de skills y documentado para CLI y extensión IDE.
No se garantiza su disponibilidad en otras superficies de chat. Se mantiene
para proporcionar el acceso con `/` solicitado sin convertir el agente en un
skill. Editar la copia versionada y repetir el instalador actualiza el comando.

## Coordinación

1. Contrasta petición, Git, diseño, contrato y código; identifica lo ya existente.
2. Resuelve decisiones que condicionen el trabajo y prepara encargos con criterios,
   responsables, archivos, contrato, dependencias y comprobaciones permitidas.
3. Delega solo en roles disponibles. Backend y frontend pueden avanzar en paralelo
   con contrato acordado, archivos disjuntos y recursos de prueba compatibles.
4. Centraliza documentación común y bitácora de los desarrolladores. El planificador
   conserva su propio registro: se espera su entrega antes de escribir en bitácora.
5. Contrasta el diff y encarga la revisión inicial al verificador, con criterios,
   referencia de versión, pruebas autorizadas y recursos reservados.
6. Si devuelve `REVISAR`, asigna los hallazgos al responsable y vuelve a verificar
   la corrección. Hay hasta tres ciclos globales de corrección y nueva revisión,
   además de la revisión inicial; no se reinicia el contador por capa o agente.
7. Entrega `APROBADO` solo con el dictamen independiente vigente y los criterios
   cubiertos. Si se agotan los ciclos, faltan recursos o roles necesarios o una
   decisión material, entrega `BLOQUEADO` con evidencia y pendientes. No publica
   por el mero hecho de completar el trabajo.

El contrato completo, estados, contador, invalidación de aprobaciones y límites
de escritura están en [verificador.md](verificador.md). El verificador no corrige
su propia revisión; los desarrolladores no se autoaprueban. Las comprobaciones
de integración propias del orquestador se distinguen del dictamen independiente.

La falta de un rol deja su tramo pendiente y explicado; no obliga a crear otro
agente ni permite inventar una ejecución. Las partes independientes pueden seguir.

## Comprobación y ensayos

La validación de formato y coherencia documental no prueba la ejecución del rol.
La selección nativa y los siguientes escenarios de comportamiento quedan como
ensayos pendientes hasta contar con eventos y resultados de una sesión que lo
exponga. Preferir una copia desechable para los ensayos que permitan escritura.

| Escenario | Resultado observable esperado |
| --- | --- |
| «Solo planifica incorporar filtros Todas/Pendientes/Completadas; sin tests ni implementación» | Delega únicamente en planificador, detecta lo existente, devuelve plan y dudas, y termina |
| Encargo backend con criterios y contrato suficientes | Asigna solo backend; conserva cambios ajenos y centraliza su registro |
| Cambio de ambas capas con contrato resuelto | Asigna archivos disjuntos y dependencias explícitas; revisa entregas y comprueba integración |
| Cambio que depende de un contrato sin definir | Pregunta por la decisión material y continúa únicamente las partes independientes |
| Rol requerido no disponible | Informa de la limitación y entrega el encargo preparado sin fingir invocación |
| Verificador devuelve REVISAR por un defecto corregible | Encarga la corrección al responsable y vuelve a verificar conservando hallazgo y contador |
| Tercera corrección todavía con REVISAR | Entrega BLOQUEADO sin cuarta corrección automática ni publicación |
| Prueba necesaria inaccesible o verificador no disponible | Explica la causa y entrega BLOQUEADO sin fingir dictamen ni consumir ciclos vacíos |
| Cambio relevante tras APROBADO | Invalida el dictamen, consume otro ciclo si queda margen y revisa la nueva versión; sin margen entrega BLOQUEADO |
| Planificador y desarrolladores escribiendo resultados | Evita concurrencia en bitácora y conserva el historial previo |

Al evaluar cada ensayo, comparar archivos antes/después, llamadas reales a roles,
criterios y comandos ejecutados. No confundir tests leídos, un código de salida
correcto o la carga manual de instrucciones con una ejecución nativa acreditada.
Los resultados efectivamente comprobados se registran en la
[bitácora única](bitacora.md).

El 26 de noviembre de 2026 se ensayaron seis decisiones conceptuales del bucle
con las instrucciones del orquestador y dos revisiones estáticas de una regresión
sintética con las del verificador. Resultados y límites en
[verificador.md](verificador.md#validación-de-esta-incorporación). La selección
nativa y el ciclo delegado completo siguen pendientes de ese ensayo específico.
