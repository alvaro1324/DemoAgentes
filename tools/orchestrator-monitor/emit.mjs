import { emit } from "./events.mjs";
try {
  const args = process.argv.slice(2);
  if (args.length % 2) throw Error("Usa pares --campo valor");
  const e = { kind: "workflow", source: "explicit" };
  const names = {
    run: "runId",
    session: "sessionId",
    state: "state",
    cycle: "cycle",
    revision: "revision",
    evidence: "evidence",
    verdict: "verdict",
    message: "message",
    kind: "kind",
    role: "role",
    agent: "agentId",
    action: "action",
    detail: "detail",
    decision: "decision",
    title: "title",
  };
  for (let i = 0; i < args.length; i += 2) {
    const key = names[args[i].replace(/^--/, "")];
    if (!key) throw Error(`Argumento desconocido: ${args[i]}`);
    e[key] = key === "cycle" ? Number(args[i + 1]) : args[i + 1];
  }
  console.log(JSON.stringify(emit(e)));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
