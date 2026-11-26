# Agente orquestador de DemoAgentes

Definición: [orquestador.toml](../.codex/agents/orquestador.toml).
Coordina al [planificador](planificador.md) y a los
[desarrolladores](agentes-desarrollo.md) según el encargo. El verificador sigue
pendiente; las comprobaciones de integración se identifican como propias.

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

## Coordinación

1. Contrasta petición, Git, diseño, contrato y código; identifica lo ya existente.
2. Resuelve decisiones que condicionen el trabajo y prepara encargos con criterios,
   responsables, archivos, contrato, dependencias y comprobaciones permitidas.
3. Delega solo en roles disponibles. Backend y frontend pueden avanzar en paralelo
   con contrato acordado, archivos disjuntos y recursos de prueba compatibles.
4. Centraliza documentación común y bitácora de los desarrolladores. El planificador
   conserva su propio registro: se espera su entrega antes de escribir en bitácora.
5. Contrasta el diff y las evidencias, devuelve correcciones al responsable e integra
   la documentación. Evita suites simultáneas en la misma base o puertos.
6. Entrega lo implementado, criterios cubiertos, pruebas y límites. No declara una
   revisión independiente ni publica por el mero hecho de completar el trabajo.

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
| Prueba fallida o verificador ausente | Registra el fallo o el límite; no presenta revisión independiente ni todo verificado |
| Planificador y desarrolladores escribiendo resultados | Evita concurrencia en bitácora y conserva el historial previo |

Al evaluar cada ensayo, comparar archivos antes/después, llamadas reales a roles,
criterios y comandos ejecutados. No confundir tests leídos, un código de salida
correcto o la carga manual de instrucciones con una ejecución nativa acreditada.
Los resultados efectivamente comprobados se registran en la
[bitácora única](bitacora.md).
