import mermaid from "/vendor/mermaid.esm.min.mjs";
import {
  reduce,
  roles,
  roleNames,
  stateNames,
  responsibilities,
  phaseRoles,
  describe,
  playbackDelay,
} from "/model.js";
const $ = (id) => document.getElementById(id);
if (new URL(location.href).searchParams.get("mode") === "demo")
  $("mode").value = "demo";
let runs = [],
  selectedKey = "",
  connected = false,
  following = true;
let frames = [],
  cursor = 0,
  playing = false,
  timer = null,
  remaining = null,
  timerStarted = 0,
  timerSpeed = 1;
let librarySignature = "";
const selected = () => runs.find((r) => r.key === selectedKey);
const element = (tag, text, className) => {
  const e = document.createElement(tag);
  e.textContent = text;
  if (className) e.className = className;
  return e;
};
const time = (at) => new Date(at).toLocaleTimeString("es-ES");
const duration = (ms) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
};
function preserveRemaining() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
    if (remaining !== null)
      remaining = Math.max(
        0,
        remaining - (performance.now() - timerStarted) * timerSpeed,
      );
  }
}
function pause() {
  preserveRemaining();
  playing = false;
}
function freeze() {
  if (!following) return;
  frames = [...(selected()?.timeline || [])];
  cursor = Math.max(0, frames.length - 1);
  following = false;
  remaining = null;
}
function schedule() {
  if (!playing) return;
  if (cursor >= frames.length - 1) {
    playing = false;
    render();
    return;
  }
  const speed = Number($("speed").value);
  if (remaining === null) remaining = playbackDelay(frames, cursor, 1);
  timerStarted = performance.now();
  timerSpeed = speed;
  timer = setTimeout(
    () => {
      timer = null;
      remaining = null;
      cursor++;
      render();
      schedule();
    },
    Math.max(1, remaining / speed),
  );
}
function selectRun(key) {
  pause();
  selectedKey = key;
  remaining = null;
  const run = selected();
  following = !run?.closed;
  frames = [...(run?.timeline || [])];
  cursor = Math.max(0, frames.length - 1);
  $("log-role").value = "all";
  render();
  renderLibrary();
}
function renderLibrary() {
  const list = runs
    .filter((r) => r.mode === $("mode").value)
    .slice()
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const signature = JSON.stringify(
    list.map((r) => [
      r.key,
      r.title,
      r.state,
      r.timeline.length,
      r.saved,
      selectedKey,
    ]),
  );
  $("recording-count").textContent = list.length;
  $("empty-library").hidden = list.length > 0;
  if (signature === librarySignature) return;
  librarySignature = signature;
  const focused = document.activeElement?.dataset.key;
  const scrollLeft = $("recordings").scrollLeft;
  $("recordings").replaceChildren(
    ...list.map((r) => {
      const button = element(
        "button",
        "",
        `recording${r.key === selectedKey ? " selected" : ""}`,
      );
      button.type = "button";
      button.dataset.key = r.key;
      button.setAttribute("aria-pressed", String(r.key === selectedKey));
      button.append(
        element("strong", r.title),
        element(
          "span",
          `${r.closed ? "Grabación" : "Registro abierto"} · ${stateNames[r.state] || "Sesión"}`,
          "recording-state",
        ),
        element(
          "small",
          `${new Date(r.startedAt).toLocaleString("es-ES")} · ${r.timeline.length} pasos`,
        ),
      );
      button.addEventListener("click", () => selectRun(r.key));
      return button;
    }),
  );
  $("recordings").scrollLeft = scrollLeft;
  if (focused)
    [...$("recordings").children]
      .find((e) => e.dataset.key === focused)
      ?.focus({ preventScroll: true });
}
function renderLog(events) {
  const history = $("history");
  const expanded = new Set(
    [...history.querySelectorAll("details[open]")].map((d) => d.dataset.event),
  );
  const stick =
    history.scrollHeight - history.scrollTop - history.clientHeight < 50;
  const previousScroll = history.scrollTop;
  const filtered = events.filter(
    (e) => $("log-role").value === "all" || e.role === $("log-role").value,
  );
  history.replaceChildren(
    ...filtered.map((e) => {
      const li = element("li", "", e.accepted === false ? "rejected" : "");
      if (e.id === events.at(-1)?.id) li.classList.add("current-step");
      const content = element("div", "");
      const heading = element("div", "", "event-heading");
      heading.append(
        element("strong", e.role ? roleNames[e.role] : "Proceso"),
        element("span", describe(e)),
        element(
          "span",
          { native: "Hook", explicit: "Comunicado", demo: "Demo" }[e.source],
          "event-source",
        ),
      );
      content.append(heading);
      if (e.message) content.append(element("p", e.message));
      if (e.decision)
        content.append(element("p", `Decisión: ${e.decision}`, "decision"));
      if (e.accepted === false)
        content.append(element("p", `Evento rechazado: ${e.rejection}`));
      if (e.detail || e.evidence || e.revision) {
        const details = element("details", "");
        details.append(element("summary", "Ver detalle"));
        details.dataset.event = e.id;
        details.open = expanded.has(e.id);
        if (e.detail) details.append(element("p", e.detail));
        if (e.evidence)
          details.append(element("p", `Evidencia: ${e.evidence}`));
        if (e.revision) details.append(element("p", `Versión: ${e.revision}`));
        content.append(details);
      }
      const timestamp = element("time", time(e.at));
      timestamp.dateTime = e.at;
      li.append(timestamp, content);
      return li;
    }),
  );
  $("empty-log").hidden = filtered.length > 0;
  if ((following && stick) || playing) history.scrollTop = history.scrollHeight;
  else history.scrollTop = previousScroll;
}
function render() {
  const latest = selected();
  const all = following ? latest?.timeline || [] : frames;
  const index = following ? all.length - 1 : cursor;
  const shown = all.slice(0, index + 1);
  const run = following
    ? latest
    : reduce(shown).find((r) => r.key === selectedKey);
  const last = shown.at(-1);
  const active = run?.activeRoles || [];
  const stages = phaseRoles(run);
  const stale = following && !connected;
  const participated = new Set(
    (run?.events || []).filter((e) => e.role).map((e) => e.role),
  );
  for (const node of document.querySelectorAll("#diagram .node")) {
    const role = roles.find((r) => node.id.startsWith(`flowchart-${r}-`));
    node.classList.toggle("active", active.includes(role) && !stale);
    node.classList.toggle("stale", active.includes(role) && stale);
    node.classList.toggle(
      "visited",
      participated.has(role) && !active.includes(role),
    );
    node.classList.toggle("stage", !active.length && stages.includes(role));
  }
  $("process-title").textContent =
    run?.title || latest?.title || "Elige un proceso";
  $("process-meta").textContent = latest
    ? `${latest.mode === "demo" ? "Demostración" : "Proceso real"} · ${latest.timeline.length} pasos recibidos · ${latest.saved ? "Grabación guardada" : "Guardado pendiente"}`
    : "En directo o paso a paso, a tu ritmo.";
  $("download").hidden = !latest;
  if (latest)
    $("download").href = `/api/recording?key=${encodeURIComponent(latest.key)}`;
  $("view-mode").textContent = following
    ? latest?.closed
      ? "Proceso finalizado"
      : "En directo"
    : playing
      ? "Reproduciendo"
      : "Grabación · pausada";
  $("state").textContent = stateNames[run?.state] || "Sin estado comunicado";
  $("updated").textContent = last ? time(last.at) : "";
  $("updated").dateTime = last?.at || "";
  let now = "Esperando actividad";
  if (run?.closed)
    now = `Proceso ${run.state === "APROBADO" ? "aprobado" : run.state === "BLOQUEADO" ? "bloqueado" : run.state === "PLAN_ENTREGADO" ? "con plan entregado" : "finalizado"}`;
  else if (active.length)
    now = `${active.map((r) => roleNames[r]).join(" y ")}${stale ? " · última actividad conocida" : active.length > 1 ? " están trabajando" : " está trabajando"}`;
  else if (last?.role)
    now = `${roleNames[last.role]} · ${describe(last).toLowerCase()}`;
  else if (stages.length) now = `Etapa: ${stateNames[run.state]}`;
  $("now-role").textContent = now;
  $("now-message").textContent =
    last?.message ||
    (last
      ? describe(last)
      : "Selecciona un proceso de la biblioteca para ver qué hace cada agente.");
  $("now-decision").hidden = !last?.decision;
  $("now-decision").textContent = last?.decision
    ? `Decisión: ${last.decision}`
    : "";
  $("activity-origin").textContent = active.length
    ? active.map((r) => `${roleNames[r]}: ${responsibilities[r]}`).join(" · ")
    : run?.closed
      ? "Cierre comunicado. Puedes reproducir todo el recorrido."
      : stages.length
        ? "Las cajas discontinuas indican responsables de etapa; no confirman ejecución de agentes."
        : "Sin actividad en curso registrada.";
  $("active-summary").textContent = active.length
    ? `${stale ? "Última actividad conocida" : "Actividad registrada"}: ${active.map((r) => roleNames[r]).join(", ")}`
    : run?.closed
      ? "Proceso cerrado. Reproduce la grabación para ver la participación de cada agente."
      : "Ningún agente activo registrado.";
  const legacy =
    latest &&
    !latest.timeline.some(
      (e) => e.kind === "activity" || (e.kind === "lifecycle" && e.role),
    );
  $("notice").hidden = !latest || (latest.mode !== "demo" && !legacy);
  $("notice").textContent =
    latest?.mode === "demo"
      ? "DEMOSTRACIÓN · Actividad y decisiones simuladas, separadas de los procesos reales."
      : legacy
        ? "Esta grabación solo contiene etapas. No se registraron las acciones de cada agente."
        : "";
  const count = all.length;
  $("step").textContent = `Paso ${count ? index + 1 : 0} de ${count}`;
  const total = count ? Date.parse(all.at(-1).at) - Date.parse(all[0].at) : 0;
  const elapsed = last ? Date.parse(last.at) - Date.parse(all[0].at) : 0;
  $("elapsed").textContent = `${duration(elapsed)} / ${duration(total)}`;
  $("position").max = Math.max(0, count - 1);
  $("position").value = Math.max(0, index);
  $("position").setAttribute("aria-valuetext", $("step").textContent);
  $("position").disabled = !count;
  $("play").disabled = count < 2;
  $("play").textContent = playing ? "Pausar" : "Reproducir";
  $("previous").disabled = index <= 0;
  $("next").disabled = !count || index >= count - 1;
  $("live").disabled = following || !latest;
  const extra =
    latest && !following ? latest.timeline.length - frames.length : 0;
  $("playback-note").textContent = following
    ? "La grabación se guarda mientras sigues el directo. Puedes reproducirla en cualquier momento."
    : `${extra > 0 ? `${extra} pasos nuevos siguen guardándose. ` : ""}La reproducción no altera el proceso. La velocidad escala el tiempo real entre pasos.`;
  $("session-id").textContent = latest?.sessionId || "—";
  $("run-id").textContent = latest?.runId || "—";
  $("cycle").textContent = `${run?.cycle || 0} / 3`;
  $("revision").textContent = run?.revision || "Sin dictamen";
  $("evidence").textContent = run?.evidence || "Sin evidencia comunicada";
  $("rejected").replaceChildren(
    ...(run?.rejected || []).map((e) =>
      element("li", `${e.state}: ${e.rejection}`),
    ),
  );
  renderLog(shown);
}
$("mode").addEventListener("change", () => {
  pause();
  selectedKey = "";
  receive();
});
$("log-role").addEventListener("change", render);
$("play").addEventListener("click", () => {
  if (playing) {
    pause();
    render();
    return;
  }
  freeze();
  if (cursor >= frames.length - 1) {
    cursor = 0;
    remaining = null;
  }
  playing = true;
  render();
  schedule();
});
function move(index) {
  pause();
  freeze();
  cursor = Math.max(0, Math.min(frames.length - 1, index));
  remaining = null;
  render();
}
$("previous").addEventListener("click", () =>
  move((following ? selected().timeline.length - 1 : cursor) - 1),
);
$("next").addEventListener("click", () => move(cursor + 1));
$("position").addEventListener("input", () =>
  move(Number($("position").value)),
);
$("speed").addEventListener("change", () => {
  if (playing) {
    preserveRemaining();
    schedule();
  }
});
$("live").addEventListener("click", () => {
  pause();
  remaining = null;
  following = true;
  render();
});
function receive() {
  const list = runs.filter((r) => r.mode === $("mode").value);
  if (!list.some((r) => r.key === selectedKey)) {
    list.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    if (list[0]) {
      selectRun(list[0].key);
      return;
    }
    pause();
    selectedKey = "";
    frames = [];
    cursor = 0;
    following = true;
  }
  renderLibrary();
  render();
}
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "base",
  themeVariables: {
    fontFamily: "Segoe UI, Arial",
    fontSize: "16px",
    primaryColor: "#f8fafc",
    primaryTextColor: "#20344b",
    primaryBorderColor: "#cbd6e3",
    lineColor: "#9aacbf",
    edgeLabelBackground: "#ffffff",
  },
  flowchart: {
    htmlLabels: false,
    useMaxWidth: true,
    nodeSpacing: 45,
    rankSpacing: 28,
  },
});
try {
  const graph = await fetch("/flow.mmd").then((r) => {
    if (!r.ok) throw Error("No se pudo cargar el diagrama");
    return r.text();
  });
  const { svg } = await mermaid.render("agents-flow", graph);
  $("diagram").innerHTML = svg;
} catch (e) {
  $("diagram-error").hidden = false;
  $("diagram-error").textContent =
    `Diagrama no disponible: ${e.message}. El log y las grabaciones siguen disponibles.`;
}
const stream = new EventSource("/events");
stream.onopen = () => {
  connected = true;
  $("connection").textContent = "Conectado al directo";
  render();
};
stream.onerror = () => {
  connected = false;
  $("connection").textContent = "Sin conexión · reconectando";
  render();
};
stream.onmessage = (e) => {
  try {
    const data = JSON.parse(e.data);
    runs = data.runs;
    $("storage-error").hidden = !data.storageError && !data.invalidFiles;
    $("storage-error").textContent =
      data.storageError ||
      (data.invalidFiles
        ? `${data.invalidFiles} archivos de eventos no se pudieron leer.`
        : "");
    receive();
  } catch {
    $("connection").textContent = "No se pudo leer la actualización";
  }
};
render();
