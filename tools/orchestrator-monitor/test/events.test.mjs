import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { emit, reduce, root, validate } from "../events.mjs";
import { recording, playbackDelay, phaseRoles } from "../public/model.js";
const e = (state, cycle = 0, extra = {}) => ({
  kind: "workflow",
  source: "explicit",
  sessionId: "s1",
  runId: "r1",
  state,
  cycle,
  ...(state === "VERIFICACION" ? { revision: "v1" } : {}),
  ...extra,
});
const base = () => [e("CONTEXTO"), e("DESARROLLO"), e("VERIFICACION")];
test("flujo inicial con dictamen vinculado a versión", () => {
  const [r] = reduce([
    ...base(),
    e("APROBADO", 0, {
      verdict: "APROBADO",
      revision: "v1",
      evidence: "Informe independiente V-001",
    }),
  ]);
  assert.equal(r.state, "APROBADO");
  assert.equal(r.cycle, 0);
});
test("hasta tres correcciones; la cuarta no se acepta", () => {
  const events = base();
  for (let n = 1; n <= 3; n++)
    events.push(e("CORRECCION", n), e("VERIFICACION", n));
  assert.throws(() => validate(e("CORRECCION", 4)));
  events.push(e("BLOQUEADO", 3));
  assert.equal(reduce(events)[0].state, "BLOQUEADO");
});
test("no salta la revisión ni reinicia contador", () => {
  const [r] = reduce([
    e("CONTEXTO"),
    e("DESARROLLO"),
    e("APROBADO", 0, { verdict: "APROBADO", revision: "v1", evidence: "x" }),
    e("VERIFICACION"),
    e("CORRECCION", 1),
    e("VERIFICACION", 0),
  ]);
  assert.equal(r.state, "CORRECCION");
  assert.equal(r.rejected.length, 2);
});
test("el cierre del turno o verificador no aprueba el trabajo", () => {
  const [r] = reduce([
    ...base(),
    {
      kind: "lifecycle",
      source: "native",
      runId: "r1",
      sessionId: "s1",
      event: "SubagentStop",
      role: "verificador",
      agentId: "a1",
    },
  ]);
  assert.equal(r.state, "VERIFICACION");
  assert.equal(r.agents.a1.status, "finalizado");
});
test("rechaza aprobación sin evidencia o de otra versión", () => {
  assert.throws(() =>
    validate(e("APROBADO", 0, { verdict: "APROBADO", revision: "v1" })),
  );
  assert.equal(
    reduce([
      ...base(),
      e("APROBADO", 0, { verdict: "APROBADO", revision: "v2", evidence: "x" }),
    ])[0].state,
    "VERIFICACION",
  );
});
test("cambio tras aprobación invalida dictamen y consume ciclo", () => {
  const [r] = reduce([
    ...base(),
    e("APROBADO", 0, { verdict: "APROBADO", revision: "v1", evidence: "x" }),
    e("CORRECCION", 1),
  ]);
  assert.equal(r.state, "CORRECCION");
  assert.equal(r.revision, null);
  assert.equal(r.evidence, null);
});
test("planificación termina sin ejecutar desarrollo", () => {
  assert.equal(
    reduce([e("CONTEXTO"), e("PLANIFICACION"), e("PLAN_ENTREGADO")])[0].state,
    "PLAN_ENTREGADO",
  );
});
test("sesiones, encargos y demostraciones están aislados", () => {
  assert.equal(
    reduce([
      e("CONTEXTO"),
      e("CONTEXTO", 0, { sessionId: "s2" }),
      e("CONTEXTO", 0, { source: "demo" }),
    ]).length,
    3,
  );
});
test("escrituras atómicas y orden estable; reproducción desde disco", () => {
  const dir = mkdtempSync(join(tmpdir(), "orchestrator-"));
  try {
    for (const x of base()) emit(x, dir);
    const files = readdirSync(dir).sort();
    assert.equal(files.length, 3);
    assert.ok(files.every((f) => f.endsWith(".json")));
    assert.equal(
      reduce(
        files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8"))),
      )[0].state,
      "VERIFICACION",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("hook usa lista permitida y nunca guarda conversación o herramientas", () => {
  const dir = mkdtempSync(join(tmpdir(), "orchestrator-hook-"));
  try {
    const result = spawnSync(
      process.execPath,
      ["tools/orchestrator-monitor/hook.mjs"],
      {
        cwd: root,
        env: { ...process.env, ORCHESTRATOR_EVENTS_DIR: dir },
        input: JSON.stringify({
          cwd: root,
          session_id: "s1",
          hook_event_name: "SubagentStart",
          agent_type: "verificador",
          agent_id: "a1",
          last_assistant_message: "SECRETO",
          tool_input: { token: "SECRETO" },
        }),
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), "{}");
    const stored = readFileSync(join(dir, readdirSync(dir)[0]), "utf8");
    assert.ok(!stored.includes("SECRETO"));
    assert.equal(JSON.parse(stored).role, "verificador");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("hook malformado no bloquea la ejecución", () => {
  const result = spawnSync(
    process.execPath,
    ["tools/orchestrator-monitor/hook.mjs"],
    { cwd: root, input: "invalid", encoding: "utf8" },
  );
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), "{}");
});
test("validación rechaza ids de rutas y estados nativos", () => {
  assert.throws(() => validate(e("CONTEXTO", 0, { runId: "../x" })));
  assert.throws(() => validate(e("CONTEXTO", 0, { source: "native" })));
});
test("comando configurado encuentra la raíz Git desde una subcarpeta", () => {
  const dir = mkdtempSync(join(tmpdir(), "orchestrator-launcher-"));
  try {
    const config = JSON.parse(
      readFileSync(join(root, ".codex/hooks.json"), "utf8"),
    );
    const command = config.hooks.SessionStart[0].hooks[0].command;
    const result = spawnSync(
      process.platform === "win32" ? "powershell.exe" : "sh",
      process.platform === "win32"
        ? ["-NoProfile", "-Command", command]
        : ["-c", command],
      {
        cwd: join(root, "frontend"),
        env: { ...process.env, ORCHESTRATOR_EVENTS_DIR: dir },
        input: JSON.stringify({
          cwd: join(root, "frontend"),
          session_id: "launcher-test",
          hook_event_name: "SessionStart",
        }),
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), "{}");
    assert.equal(readdirSync(dir).length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

const activity = (role, action = "start", extra = {}) => ({
  kind: "activity",
  source: "explicit",
  runId: "r1",
  sessionId: "s1",
  role,
  action,
  message: "Acción comunicada",
  ...extra,
});
test("actividad por agente, decisiones y paralelismo sin confundir fases", () => {
  const events = [
    ...base(),
    activity("desarrollador_backend"),
    activity("desarrollador_frontend"),
    activity("desarrollador_frontend", "decision", {
      decision: "Conservar contadores globales",
      detail: "Se deriva la vista sin mutar tasks",
    }),
  ];
  let r = reduce(events)[0];
  assert.deepEqual(r.activeRoles, [
    "desarrollador_backend",
    "desarrollador_frontend",
  ]);
  assert.equal(r.timeline.at(-1).decision, "Conservar contadores globales");
  events.push(activity("desarrollador_backend", "finish"));
  r = reduce(events)[0];
  assert.deepEqual(r.activeRoles, ["desarrollador_frontend"]);
});
test("actividad requiere rol, acción y resumen; no acepta decisiones nativas inventadas", () => {
  assert.throws(() => validate(activity("desconocido")));
  assert.throws(() => validate(activity("verificador", "toString")));
  assert.throws(() =>
    validate(activity("verificador", "start", { message: "" })),
  );
  assert.throws(() =>
    validate(activity("verificador", "start", { source: "native" })),
  );
  assert.equal(
    validate(
      activity("verificador", "decision", { private_thought: "no guardar" }),
    ).private_thought,
    undefined,
  );
});
test("la etapa antigua no se convierte en actividad confirmada", () => {
  const r = reduce([e("CONTEXTO"), e("PLANIFICACION")])[0];
  assert.deepEqual(r.activeRoles, []);
  assert.deepEqual(phaseRoles(r), ["planificador"]);
});
test("cerrar un proceso elimina resaltado y un cambio de fase no termina hooks activos", () => {
  const start = {
    kind: "lifecycle",
    source: "native",
    runId: "r1",
    sessionId: "s1",
    role: "verificador",
    agentId: "a1",
    event: "SubagentStart",
  };
  assert.deepEqual(
    reduce([e("CONTEXTO"), e("DESARROLLO"), start, e("VERIFICACION")])[0]
      .activeRoles,
    ["verificador"],
  );
  assert.deepEqual(
    reduce([
      ...base(),
      start,
      e("APROBADO", 0, {
        verdict: "APROBADO",
        revision: "v1",
        evidence: "informe",
      }),
    ])[0].activeRoles,
    [],
  );
  assert.deepEqual(
    reduce([...base(), start, { ...start, event: "Interrupt" }])[0].activeRoles,
    [],
  );
});
test("grabación completa sin recorte y rebobinado sin eventos futuros", () => {
  const events = [
    e("CONTEXTO"),
    e("DESARROLLO"),
    activity("desarrollador_frontend"),
  ];
  for (let i = 0; i < 205; i++)
    events.push(
      activity("desarrollador_frontend", "progress", { message: `Paso ${i}` }),
    );
  events.push(
    e("APROBADO", 0, {
      verdict: "APROBADO",
      revision: "v1",
      evidence: "salto inválido",
    }),
  );
  const r = reduce(events)[0],
    exported = recording(r);
  assert.equal(r.timeline.length, 209);
  assert.equal(r.events.length, 208);
  assert.equal(exported.events.length, 209);
  assert.equal(r.rejected.length, 1);
  assert.equal(exported.format, "demoagentes.recording");
  const replay = reduce(exported.events)[0];
  assert.equal(replay.timeline.length, 209);
  assert.equal(replay.rejected.length, 1);
  const first = reduce(exported.events.slice(0, 2))[0];
  assert.equal(first.state, "DESARROLLO");
  assert.deepEqual(first.activeRoles, []);
  assert.equal(first.events.length, 2);
});
test("velocidad escala tiempos reales de la grabación", () => {
  const events = [
    { at: "2026-11-26T10:00:00Z" },
    { at: "2026-11-26T10:00:10Z" },
  ];
  assert.equal(playbackDelay(events, 0, 1), 10000);
  assert.equal(playbackDelay(events, 0, 10), 1000);
  assert.equal(playbackDelay(events, 0, 100), 100);
});
