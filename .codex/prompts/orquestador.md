---
description: Lanza el orquestador de DemoAgentes para el encargo indicado.
argument-hint: [necesidad o ruta del plan]
---

Activa el agente de proyecto `orquestador` para este encargo:

<encargo>
$ARGUMENTS
</encargo>

1. Comprueba que el directorio actual pertenece a DemoAgentes y contiene
   `AGENTS.md` y `.codex/agents/orquestador.toml`. Si no están, pide abrir el
   repositorio correcto; no crees agentes ni cambies de proyecto por suposición.
2. Lee `AGENTS.md`, `.codex/agents/orquestador.toml` y `docs/orquestador.md`.
   El TOML es la fuente de instrucciones del rol; este comando solo lo inicia.
3. Si el encargo está vacío, usa la última petición concreta pendiente del usuario
   en esta conversación, siempre que sea inequívoca. Si no existe, pregunta qué
   necesidad o plan quiere coordinar. Los pendientes de la bitácora no son un
   encargo. La petición de crear este comando tampoco autoriza ejecutar un plan.
4. Comprueba si las herramientas de esta sesión permiten seleccionar el agente
   personalizado `orquestador`. Si está disponible, invócalo con el encargo,
   restricciones vigentes y referencias necesarias. Espera su entrega y comunica
   el resultado real. No cambies su modelo ni sus permisos para lanzarlo.
5. Si el agente no está disponible, explica esa limitación y entrega el encargo
   preparado para una sesión que lo exponga. No presentes un agente genérico
   ni la lectura del TOML como una invocación nativa del orquestador.
6. Conserva la distinción entre planificar, implementar y comprobar. Respeta
   todas las restricciones del encargo y las instrucciones del orquestador sobre
   delegación, documentación y pruebas aisladas. Para implementación coordina
   verificador y el bucle del TOML: revisión inicial y hasta tres ciclos de
   corrección/nueva revisión, con APROBADO o entrega BLOQUEADO. Comprueba que
   los roles estén disponibles; no presentes una revisión propia como independiente.
7. No hagas commits, push, PR ni cambios remotos salvo que el encargo del usuario
   los incluya expresamente. No amplíes el trabajo a otras funcionalidades.
