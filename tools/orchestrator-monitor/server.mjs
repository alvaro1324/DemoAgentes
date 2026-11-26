import { createServer } from "node:http";
import {
  readFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { resolve, extname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { eventDir, reduce, validate } from "./events.mjs";
import { recording } from "./public/model.js";
const here = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.ORCHESTRATOR_PORT || 8790);
const recordingDir = resolve(eventDir, "recordings");
const clients = new Set();
const saved = new Map();
let snapshot = "",
  runs = [];
function refresh() {
  let files = [],
    invalidFiles = 0,
    storageError = "";
  try {
    files = readdirSync(eventDir)
      .filter((f) => f.endsWith(".json"))
      .sort();
  } catch (e) {
    if (e.code !== "ENOENT")
      storageError = `No se pueden leer eventos (${e.code})`;
  }
  const events = files.flatMap((f) => {
    try {
      const e = JSON.parse(readFileSync(resolve(eventDir, f), "utf8"));
      validate(e);
      return [e];
    } catch {
      invalidFiles++;
      return [];
    }
  });
  runs = reduce(events);
  for (const run of runs) {
    const data = JSON.stringify(recording(run));
    const file = resolve(
      recordingDir,
      `${createHash("sha256").update(run.key).digest("hex")}.recording.json`,
    );
    try {
      if (saved.get(run.key) !== data || !existsSync(file)) {
        mkdirSync(recordingDir, { recursive: true });
        writeFileSync(`${file}.tmp`, data);
        renameSync(`${file}.tmp`, file);
        saved.set(run.key, data);
      }
      run.saved = true;
    } catch (e) {
      storageError = `No se puede guardar la grabación (${e.code})`;
      run.saved = false;
    }
  }
  const next = JSON.stringify({ runs, invalidFiles, storageError });
  if (next !== snapshot) {
    snapshot = next;
    for (const c of clients) c.write(`data: ${snapshot}\n\n`);
  }
}
refresh();
const timer = setInterval(refresh, 400);
const heartbeat = setInterval(() => {
  for (const c of clients) c.write(": heartbeat\n\n");
}, 10000);
const server = createServer((req, res) => {
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) {
    res.writeHead(403).end();
    return;
  }
  if (req.method !== "GET") {
    res.writeHead(405).end();
    return;
  }
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (path === "/api/state") {
    res.setHeader("Content-Type", "application/json");
    res.end(snapshot);
    return;
  }
  if (path === "/api/recording") {
    const run = runs.find((r) => r.key === url.searchParams.get("key"));
    if (!run) {
      res.writeHead(404).end();
      return;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${run.runId}.recording.json"`,
    );
    res.end(JSON.stringify(recording(run), null, 2));
    return;
  }
  if (path === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
    });
    res.write(`retry: 1000\ndata: ${snapshot}\n\n`);
    clients.add(res);
    res.on("close", () => clients.delete(res));
    return;
  }
  let file;
  if (path.startsWith("/vendor/")) {
    const base = resolve(here, "node_modules/mermaid/dist");
    file = resolve(base, path.slice(8));
    const rel = relative(base, file);
    if (rel.startsWith("..") || isAbsolute(rel)) {
      res.writeHead(403).end();
      return;
    }
  } else
    file = {
      "/": "public/index.html",
      "/app.js": "public/app.js",
      "/model.js": "public/model.js",
      "/style.css": "public/style.css",
      "/flow.mmd": "public/flow.mmd",
    }[path];
  if (!file || !existsSync(resolve(here, file))) {
    res.writeHead(404).end();
    return;
  }
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css",
    ".mmd": "text/plain; charset=utf-8",
  };
  res.setHeader(
    "Content-Type",
    mime[extname(file)] || "application/octet-stream",
  );
  try {
    res.end(readFileSync(resolve(here, file)));
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Visor del orquestador: http://127.0.0.1:${port}`),
);
server.on("error", (e) => {
  console.error(e.message);
  clearInterval(timer);
  clearInterval(heartbeat);
  process.exitCode = 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    clearInterval(timer);
    clearInterval(heartbeat);
    for (const c of clients) c.end();
    server.close();
  });
