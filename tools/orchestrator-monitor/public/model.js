// Contrato y reconstrucción compartidos por el servidor y la reproducción.
export const states = [
  "CONTEXTO",
  "PLANIFICACION",
  "DESARROLLO",
  "VERIFICACION",
  "CORRECCION",
  "APROBADO",
  "BLOQUEADO",
  "PLAN_ENTREGADO",
];
export const roles = [
  "orquestador",
  "planificador",
  "desarrollador_backend",
  "desarrollador_frontend",
  "verificador",
];
export const roleNames = {
  orquestador: "Orquestador",
  planificador: "Planificador",
  desarrollador_backend: "Backend",
  desarrollador_frontend: "Frontend",
  verificador: "Verificador",
};
export const responsibilities = {
  orquestador: "Coordina el trabajo y comunica decisiones",
  planificador: "Define el plan y sus criterios",
  desarrollador_backend: "Implementa API, datos y pruebas",
  desarrollador_frontend: "Implementa interfaz y pruebas",
  verificador: "Revisa los cambios y emite dictamen",
};
export const stateNames = {
  CONTEXTO: "Preparando el encargo",
  PLANIFICACION: "Planificación",
  DESARROLLO: "Desarrollo",
  VERIFICACION: "Revisión independiente",
  CORRECCION: "Corrección",
  APROBADO: "Aprobado",
  BLOQUEADO: "Bloqueado",
  PLAN_ENTREGADO: "Plan entregado",
};
export const actionNames = {
  start: "Empieza a trabajar",
  progress: "Avance",
  decision: "Decisión",
  finish: "Entrega completada",
  error: "Impedimento",
  handoff: "Cede el trabajo",
};
const lifecycleNames = {
  SessionStart: "Sesión iniciada",
  SessionEnd: "Sesión finalizada",
  SubagentStart: "Agente iniciado",
  SubagentStop: "Agente finalizado",
  Stop: "Turno terminado",
  Interrupt: "Interrupción",
};
const closedStates = ["APROBADO", "BLOQUEADO", "PLAN_ENTREGADO"];
const transitions = {
  CONTEXTO: ["PLANIFICACION", "DESARROLLO", "BLOQUEADO"],
  PLANIFICACION: ["DESARROLLO", "PLAN_ENTREGADO", "BLOQUEADO"],
  DESARROLLO: ["VERIFICACION", "BLOQUEADO"],
  VERIFICACION: ["APROBADO", "CORRECCION", "BLOQUEADO"],
  CORRECCION: ["VERIFICACION", "BLOQUEADO"],
  APROBADO: ["CORRECCION", "BLOQUEADO"],
  BLOQUEADO: [],
  PLAN_ENTREGADO: [],
};
export function validate(e) {
  if (!e || typeof e !== "object" || Array.isArray(e))
    throw Error("Evento inválido");
  for (const field of ["runId", "sessionId"]) {
    if (typeof e[field] !== "string" || !/^[\w.:-]{1,120}$/.test(e[field]))
      throw Error(`${field} inválido`);
  }
  if (
    !["workflow", "lifecycle", "activity"].includes(e.kind) ||
    !["explicit", "native", "demo"].includes(e.source)
  )
    throw Error("Tipo u origen inválido");
  if (e.role !== undefined && !roles.includes(e.role))
    throw Error("Rol desconocido");
  if (e.kind === "workflow") {
    if (
      !states.includes(e.state) ||
      !Number.isInteger(e.cycle) ||
      e.cycle < 0 ||
      e.cycle > 3
    )
      throw Error("Estado o ciclo inválido");
    if (e.source === "native")
      throw Error("Un hook nativo no acredita estados de negocio");
    if (e.state === "VERIFICACION" && !e.revision)
      throw Error("VERIFICACION requiere versión del diff revisado");
    if (
      e.state === "APROBADO" &&
      (e.verdict !== "APROBADO" || !e.revision || !e.evidence)
    )
      throw Error("APROBADO requiere dictamen, versión y evidencia");
  } else if (e.kind === "activity") {
    if (
      !e.role ||
      !Object.hasOwn(actionNames, e.action) ||
      e.source === "native" ||
      typeof e.message !== "string" ||
      !e.message.trim()
    )
      throw Error("Actividad requiere agente, acción y resumen explícitos");
  } else if (!Object.hasOwn(lifecycleNames, e.event))
    throw Error("Hook desconocido");
  const limits = {
    runId: 120,
    sessionId: 120,
    kind: 20,
    source: 20,
    state: 30,
    verdict: 30,
    revision: 500,
    evidence: 500,
    role: 40,
    agentId: 120,
    event: 40,
    message: 500,
    action: 20,
    detail: 4000,
    decision: 2000,
    title: 160,
  };
  const safe = {};
  for (const [key, max] of Object.entries(limits)) {
    if (e[key] === undefined) continue;
    if (typeof e[key] !== "string" || e[key].length > max)
      throw Error(`Campo ${key} inválido`);
    safe[key] = e[key];
  }
  if (e.cycle !== undefined) {
    if (!Number.isInteger(e.cycle) || e.cycle < 0 || e.cycle > 3)
      throw Error("Ciclo inválido");
    safe.cycle = e.cycle;
  }
  return safe;
}
export function phaseRoles(run) {
  if (!run || run.closed) return [];
  if (run.phaseAgent) return [run.phaseAgent];
  return (
    {
      CONTEXTO: ["orquestador"],
      PLANIFICACION: ["planificador"],
      DESARROLLO: ["desarrollador_backend", "desarrollador_frontend"],
      CORRECCION: ["desarrollador_backend", "desarrollador_frontend"],
      VERIFICACION: ["verificador"],
    }[run.state] || []
  );
}
export function reduce(events) {
  const runs = new Map();
  for (const [index, raw] of events.entries()) {
    let e;
    try {
      e = {
        ...validate(raw),
        id:
          typeof raw.id === "string" ? raw.id.slice(0, 120) : `event-${index}`,
        at: Number.isFinite(Date.parse(raw.at))
          ? raw.at
          : "1970-01-01T00:00:00.000Z",
      };
    } catch {
      continue;
    }
    const key = `${e.source === "demo" ? "demo" : "real"}:${e.sessionId}:${e.runId}`;
    if (!runs.has(key))
      runs.set(key, {
        key,
        runId: e.runId,
        sessionId: e.sessionId,
        title: e.title || e.runId,
        mode: e.source === "demo" ? "demo" : "real",
        state: null,
        cycle: 0,
        agents: Object.create(null),
        events: [],
        rejected: [],
        timeline: [],
        startedAt: e.at,
        closed: false,
      });
    const r = runs.get(key);
    if (e.title) r.title = e.title;
    r.updatedAt = e.at;
    if (e.kind === "workflow") {
      const valid =
        r.state === null
          ? e.state === "CONTEXTO" && e.cycle === 0
          : transitions[r.state].includes(e.state) &&
            (e.state === "CORRECCION"
              ? e.cycle === r.cycle + 1
              : e.cycle === r.cycle);
      if (!valid || (e.state === "APROBADO" && e.revision !== r.revision)) {
        const rejected = {
          ...e,
          accepted: false,
          rejection: "Estado, contador o versión incoherente",
        };
        r.rejected.push(rejected);
        r.timeline.push(rejected);
        continue;
      }
      r.state = e.state;
      r.cycle = e.cycle;
      r.phaseAgent = e.role || null;
      r.revision = e.revision || null;
      r.evidence = e.evidence || null;
      r.closed = closedStates.includes(e.state);
      if (r.closed)
        for (const agent of Object.values(r.agents))
          agent.status = "finalizado";
    } else if (e.kind === "activity") {
      const status = ["finish", "handoff"].includes(e.action)
        ? "finalizado"
        : e.action === "error"
          ? "bloqueado"
          : "activo";
      r.agents[e.agentId || e.role] = {
        role: e.role,
        status,
        at: e.at,
        source: e.source,
        message: e.message,
      };
    } else if (["SessionEnd", "Interrupt"].includes(e.event)) {
      for (const agent of Object.values(r.agents))
        agent.status = e.event === "Interrupt" ? "interrumpido" : "finalizado";
      if (e.event === "SessionEnd") r.closed = true;
    } else if (
      e.role &&
      e.agentId &&
      ["SubagentStart", "SubagentStop"].includes(e.event)
    ) {
      r.agents[e.agentId] = {
        role: e.role,
        status: e.event === "SubagentStart" ? "activo" : "finalizado",
        at: e.at,
        source: e.source,
      };
    }
    const accepted = { ...e, accepted: true };
    r.events.push(accepted);
    r.timeline.push(accepted);
  }
  return [...runs.values()].map((r) => ({
    ...r,
    activeRoles: r.closed
      ? []
      : [
          ...new Set(
            Object.values(r.agents)
              .filter((a) => a.status === "activo")
              .map((a) => a.role),
          ),
        ],
  }));
}
export function describe(e) {
  return e.kind === "workflow"
    ? stateNames[e.state]
    : e.kind === "activity"
      ? actionNames[e.action]
      : lifecycleNames[e.event];
}
export function recording(run) {
  return {
    format: "demoagentes.recording",
    version: 1,
    key: run.key,
    title: run.title,
    sessionId: run.sessionId,
    runId: run.runId,
    mode: run.mode,
    startedAt: run.startedAt,
    updatedAt: run.updatedAt,
    events: run.timeline.map(({ accepted, rejection, ...e }) => e),
  };
}
export function playbackDelay(events, index, speed) {
  const gap = Date.parse(events[index + 1]?.at) - Date.parse(events[index]?.at);
  return Math.min(
    2147483647,
    Math.max(1, Number.isFinite(gap) ? gap / speed : 1),
  );
}
