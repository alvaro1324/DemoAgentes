import { emit } from "./events.mjs";
import { setTimeout } from "node:timers/promises";
const runId = `demo-agentes-${Date.now()}`;
const base = { source: "demo", sessionId: "demo", runId };
const steps = [
  {
    kind: "workflow",
    state: "CONTEXTO",
    cycle: 0,
    title: "Ejemplo · Mejorar una funcionalidad",
    message: "Se recibe el encargo y se revisan sus criterios.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "start",
    message: "Reviso alcance y archivos afectados.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "decision",
    message: "El cambio necesita plan y desarrollo de ambas capas.",
    decision: "Trabajar por contrato con backend y frontend en paralelo.",
    detail: "Ejemplo ficticio: ningún agente real está siendo invocado.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "handoff",
    message: "Encargo la preparación del plan.",
  },
  {
    kind: "workflow",
    state: "PLANIFICACION",
    cycle: 0,
    message: "Se definen pasos y criterios verificables.",
  },
  {
    kind: "activity",
    role: "planificador",
    action: "start",
    message: "Concreto las responsabilidades de cada capa.",
  },
  {
    kind: "activity",
    role: "planificador",
    action: "finish",
    message: "Plan de ejemplo entregado; contrato acordado.",
  },
  {
    kind: "workflow",
    state: "DESARROLLO",
    cycle: 0,
    message: "Se implementan las dos capas con archivos disjuntos.",
  },
  {
    kind: "activity",
    role: "desarrollador_backend",
    action: "start",
    message: "Implemento el comportamiento de la API del ejemplo.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "start",
    message: "Preparo los controles y la vista.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "decision",
    message: "La interfaz mantiene los contadores globales.",
    decision: "Derivar la vista, conservando el conjunto completo de datos.",
  },
  {
    kind: "activity",
    role: "desarrollador_backend",
    action: "finish",
    message: "Backend de ejemplo entregado.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "finish",
    message: "Frontend de ejemplo entregado con pruebas.",
  },
  {
    kind: "workflow",
    state: "VERIFICACION",
    cycle: 0,
    revision: "demo-v1",
    message: "Revisión independiente del ejemplo.",
  },
  {
    kind: "activity",
    role: "verificador",
    action: "start",
    message: "Contrasto los cambios y los criterios.",
  },
  {
    kind: "activity",
    role: "verificador",
    action: "finish",
    message: "REVISAR: falta cubrir el estado vacío.",
    decision: "Devolver el hallazgo ficticio V-001 al frontend.",
  },
  {
    kind: "workflow",
    state: "CORRECCION",
    cycle: 1,
    message: "Primera corrección del ejemplo.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "start",
    message: "Corrijo el mensaje de lista vacía del ejemplo.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "finish",
    message: "V-001 corregido en el ejemplo.",
  },
  {
    kind: "workflow",
    state: "VERIFICACION",
    cycle: 1,
    revision: "demo-v2",
    message: "Nueva revisión del ejemplo corregido.",
  },
  {
    kind: "activity",
    role: "verificador",
    action: "start",
    message: "Compruebo el hallazgo y las regresiones.",
  },
  {
    kind: "activity",
    role: "verificador",
    action: "finish",
    message: "APROBADO: criterios del ejemplo cubiertos.",
    decision: "Aceptar la versión ficticia demo-v2.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "start",
    message: "Integro las evidencias y preparo la entrega.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "finish",
    message: "Proceso de ejemplo completado.",
  },
  {
    kind: "workflow",
    state: "APROBADO",
    cycle: 1,
    revision: "demo-v2",
    verdict: "APROBADO",
    evidence: "Evidencia ficticia de demostración",
    message:
      "Demostración completada. No se han ejecutado agentes ni pruebas de aplicación.",
  },
];
for (const step of steps) {
  emit({ ...base, ...step });
  console.log(`${runId}: ${step.role || step.state} · ${step.message}`);
  await setTimeout(Number(process.env.DEMO_INTERVAL_MS || 1200));
}
