import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";
import assert from "node:assert/strict";
import { emit, root, validate } from "../events.mjs";
const require = createRequire(resolve(root, "frontend/package.json"));
const { chromium } = require("@playwright/test");
const dir = mkdtempSync(join(tmpdir(), "orchestrator-browser-"));
const out = resolve(root, ".runtime/orchestrator-monitor-redesign");
mkdirSync(out, { recursive: true });
const probe = createServer();
await new Promise((r) => probe.listen(0, "127.0.0.1", r));
const port = probe.address().port;
await new Promise((r) => probe.close(r));
let server,
  browser,
  sequence = 0;
const checks = [],
  errors = [];
const base = {
  source: "explicit",
  sessionId: "qa-recording",
  runId: "qa-recording",
};
const steps = [
  {
    kind: "workflow",
    state: "CONTEXTO",
    cycle: 0,
    title: "QA · Mejorar una funcionalidad",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "start",
    message: "Reviso el alcance.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "decision",
    message: "El contrato está preparado.",
    decision: "Implementar ambas capas en paralelo.",
    detail: "Archivos disjuntos y pruebas aisladas.",
  },
  {
    kind: "activity",
    role: "orquestador",
    action: "finish",
    message: "Encargo la planificación.",
  },
  { kind: "workflow", state: "PLANIFICACION", cycle: 0 },
  {
    kind: "activity",
    role: "planificador",
    action: "start",
    message: "Defino pasos y criterios.",
  },
  {
    kind: "activity",
    role: "planificador",
    action: "finish",
    message: "Plan entregado.",
  },
  { kind: "workflow", state: "DESARROLLO", cycle: 0 },
  {
    kind: "activity",
    role: "desarrollador_backend",
    action: "start",
    message: "Implemento la API.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "start",
    message: "Implemento la interfaz.",
  },
  {
    kind: "activity",
    role: "desarrollador_backend",
    action: "finish",
    message: "API entregada.",
  },
  {
    kind: "activity",
    role: "desarrollador_frontend",
    action: "finish",
    message: "Interfaz entregada.",
  },
  { kind: "workflow", state: "VERIFICACION", cycle: 0, revision: "qa-v1" },
  {
    kind: "activity",
    role: "verificador",
    action: "start",
    message: "Contrasto el diff.",
  },
  {
    kind: "activity",
    role: "verificador",
    action: "finish",
    message: "Criterios cubiertos.",
  },
  {
    kind: "workflow",
    state: "APROBADO",
    cycle: 0,
    verdict: "APROBADO",
    revision: "qa-v1",
    evidence: "Informe ficticio del test",
  },
];
for (const [i, event] of steps.entries()) {
  const e = {
    ...validate({ ...base, ...event }),
    id: `qa-${sequence}`,
    at: new Date(Date.parse("2026-11-26T10:00:00Z") + i * 2000).toISOString(),
  };
  writeFileSync(
    resolve(dir, `${String(sequence++).padStart(8, "0")}.json`),
    JSON.stringify(e),
  );
}
const longBase = { ...base, runId: "long-recording" };
const longSteps = [
  {
    kind: "workflow",
    state: "CONTEXTO",
    cycle: 0,
    title: "QA · Registro largo",
  },
  { kind: "workflow", state: "DESARROLLO", cycle: 0 },
];
for (let n = 0; n < 145; n++)
  longSteps.push({
    kind: "activity",
    role: "desarrollador_frontend",
    action: "progress",
    message: `Avance largo ${n}`,
  });
longSteps.push({ kind: "workflow", state: "BLOQUEADO", cycle: 0 });
for (const [i, event] of longSteps.entries()) {
  const e = {
    ...validate({ ...longBase, ...event }),
    id: `qa-${sequence}`,
    at: new Date(Date.parse("2026-11-26T09:00:00Z") + i * 1000).toISOString(),
  };
  writeFileSync(
    resolve(dir, `${String(sequence++).padStart(8, "0")}.json`),
    JSON.stringify(e),
  );
}
async function startServer() {
  server = spawn(process.execPath, ["server.mjs"], {
    cwd: resolve(root, "tools/orchestrator-monitor"),
    env: {
      ...process.env,
      ORCHESTRATOR_PORT: String(port),
      ORCHESTRATOR_EVENTS_DIR: dir,
    },
    stdio: "pipe",
  });
  for (let n = 0; n < 100; n++) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/api/state`)).ok) return;
    } catch {}
    await setTimeout(100);
  }
  throw Error("Servidor de QA no disponible");
}
async function stopServer() {
  if (server && server.exitCode === null) {
    const exited = once(server, "exit");
    server.kill();
    await exited;
  }
}
const url = `http://127.0.0.1:${port}`;
try {
  await startServer();
  const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  browser = await chromium.launch({
    headless: false,
    slowMo: 65,
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForSelector("#diagram svg");
  await page.waitForFunction(() =>
    document.getElementById("connection").textContent.includes("Conectado"),
  );
  assert.equal(await page.locator("#diagram .node").count(), 5);
  assert.ok(
    (await page.locator("#diagram").textContent()).includes(
      "Coordina y decide",
    ),
  );
  assert.equal(await page.locator(".recording").count(), 2);
  checks.push(
    "Cinco agentes, responsabilidades y biblioteca con procesos persistidos",
  );
  await page
    .locator(".recording")
    .filter({ hasText: "Mejorar una funcionalidad" })
    .click();
  assert.equal(await page.locator("#diagram .active").count(), 0);
  const seek = async (n) => {
    await page.locator("#position").fill(String(n));
  };
  await seek(9);
  assert.equal(await page.locator("#diagram .node.active").count(), 2);
  assert.ok(
    (await page.locator("#now-role").textContent()).includes(
      "Backend y Frontend",
    ),
  );
  assert.ok(
    !(await page.locator("#history").textContent()).includes(
      "Criterios cubiertos.",
    ),
  );
  checks.push(
    "Reconstrucción temporal, paralelismo y ausencia de eventos futuros",
  );
  await page.selectOption("#log-role", "desarrollador_frontend");
  assert.equal(await page.locator("#history li").count(), 1);
  await page.selectOption("#log-role", "all");
  await seek(2);
  assert.ok(
    (await page.locator("#now-decision").textContent()).includes(
      "Implementar ambas capas en paralelo",
    ),
  );
  await page.locator("#history details summary").click();
  await page.selectOption("#log-role", "orquestador");
  assert.equal(await page.locator("#history details[open]").count(), 1);
  await page.selectOption("#log-role", "all");
  assert.ok(
    (await page.locator("#history").textContent()).includes(
      "Archivos disjuntos y pruebas aisladas",
    ),
  );
  checks.push("Log por agente, decisiones y detalle operativo");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#download").click();
  const downloaded = await downloadPromise;
  const data = JSON.parse(readFileSync(await downloaded.path(), "utf8"));
  assert.equal(data.format, "demoagentes.recording");
  assert.equal(data.events.length, 16);
  checks.push(
    "Descarga de la grabación completa aunque se esté viendo un paso anterior",
  );
  await seek(0);
  await page.selectOption("#speed", "1");
  await page.locator("#play").click();
  await page.waitForTimeout(150);
  await page.locator("#play").click();
  const paused = await page.locator("#position").inputValue();
  await page.waitForTimeout(250);
  assert.equal(await page.locator("#position").inputValue(), paused);
  await page.selectOption("#speed", "100");
  await page.locator("#play").click();
  await page.waitForFunction(
    () => document.getElementById("position").value === "15",
  );
  assert.equal(await page.locator("#play").textContent(), "Reproducir");
  checks.push(
    "Pausa estable y reproducción a 100x con tiempos reales escalados",
  );
  await page.locator("#previous").click();
  assert.equal(await page.locator("#position").inputValue(), "14");
  await page.locator("#next").click();
  assert.equal(await page.locator("#position").inputValue(), "15");
  checks.push("Navegación por paso anterior y siguiente");
  const liveBase = {
    kind: "workflow",
    source: "explicit",
    sessionId: "live-qa",
    runId: "live-qa",
    cycle: 0,
  };
  emit(
    { ...liveBase, state: "CONTEXTO", title: "QA · Proceso en directo" },
    dir,
  );
  emit({ ...liveBase, state: "DESARROLLO" }, dir);
  const activity = (role, action, message) =>
    emit(
      {
        kind: "activity",
        source: "explicit",
        sessionId: "live-qa",
        runId: "live-qa",
        role,
        action,
        message,
      },
      dir,
    );
  activity("desarrollador_backend", "start", "Backend en directo.");
  activity("desarrollador_frontend", "start", "Frontend en directo.");
  await page
    .locator(".recording")
    .filter({ hasText: "Proceso en directo" })
    .click();
  await page.waitForFunction(
    () => document.querySelectorAll("#diagram .node.active").length === 2,
  );
  await page.locator("#previous").click();
  const frozen = await page.locator("#position").inputValue();
  activity(
    "desarrollador_frontend",
    "decision",
    "Nueva decisión mientras se reproduce.",
  );
  await page.waitForFunction(() =>
    document
      .getElementById("playback-note")
      .textContent.includes("1 pasos nuevos"),
  );
  assert.equal(await page.locator("#position").inputValue(), frozen);
  assert.ok(
    !(await page.locator("#history").textContent()).includes(
      "Nueva decisión mientras",
    ),
  );
  await page.locator("#live").click();
  await page.waitForFunction(() =>
    document
      .getElementById("history")
      .textContent.includes("Nueva decisión mientras"),
  );
  checks.push(
    "Directo por SSE, captura de reproducción estable y vuelta al último evento",
  );
  emit(
    {
      kind: "workflow",
      source: "demo",
      sessionId: "demo",
      runId: "demo",
      state: "CONTEXTO",
      cycle: 0,
      title: "QA · Demo aislada",
    },
    dir,
  );
  await page.selectOption("#mode", "demo");
  await page.waitForFunction(
    () => document.querySelectorAll(".recording").length === 1,
  );
  assert.ok(
    (await page.locator("#notice").textContent()).includes("DEMOSTRACIÓN"),
  );
  await page.selectOption("#mode", "real");
  await page
    .locator(".recording")
    .filter({ hasText: "Proceso en directo" })
    .click();
  checks.push("Demostraciones separadas de los procesos reales");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.setViewportSize({ width: 1440, height: 1080 });
  checks.push("Diseño móvil sin desbordamiento de página");
  await page.screenshot({
    path: resolve(out, "visor-agentes.png"),
    fullPage: true,
  });
  await stopServer();
  await page.waitForFunction(() =>
    document.getElementById("connection").textContent.includes("Sin conexión"),
  );
  assert.equal(await page.locator("#diagram .node.stale").count(), 2);
  await startServer();
  await page.waitForFunction(() =>
    document.getElementById("connection").textContent.includes("Conectado"),
  );
  const all = await fetch(`${url}/api/state`).then((r) => r.json());
  assert.equal(
    all.runs.find((r) => r.runId === "long-recording").timeline.length,
    148,
  );
  const recordings = readdirSync(resolve(dir, "recordings")).filter((f) =>
    f.endsWith(".recording.json"),
  );
  assert.equal(recordings.length, 4);
  const saved = recordings.map((f) =>
    JSON.parse(readFileSync(resolve(dir, "recordings", f), "utf8")),
  );
  assert.equal(
    saved.find((r) => r.runId === "long-recording").events.length,
    148,
  );
  checks.push(
    "Desconexión diferenciada, reconexión y grabaciones completas tras reiniciar servidor",
  );
  await page.reload();
  await page.waitForSelector("#diagram svg");
  await page
    .locator(".recording")
    .filter({ hasText: "Registro largo" })
    .click();
  assert.ok((await page.locator("#step").textContent()).includes("148"));
  await seek(0);
  assert.equal(await page.locator("#history li").count(), 1);
  checks.push(
    "Grabación de más de 100 pasos reproducible desde el principio tras recargar",
  );
  assert.equal(
    (await fetch(`${url}/api/state`, { method: "POST" })).status,
    405,
  );
  assert.equal((await fetch(`${url}/events.mjs`)).status, 404);
  assert.deepEqual(errors, []);
  const report = {
    at: new Date().toISOString(),
    result: "PASS",
    browser: "Chromium visible",
    checks,
    pageErrors: errors,
  };
  writeFileSync(
    resolve(out, "browser-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} catch (e) {
  console.error(e);
  if (browser)
    await browser
      .contexts()[0]
      ?.pages()[0]
      ?.screenshot({ path: resolve(out, "failure.png"), fullPage: true });
  process.exitCode = 1;
} finally {
  await browser?.close();
  await stopServer();
  assert.ok(dir.startsWith(join(tmpdir(), "orchestrator-browser-")));
  rmSync(dir, { recursive: true, force: true });
}
