import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { validate } from "./public/model.js";
export { validate, reduce, roles, states } from "./public/model.js";
export const root = fileURLToPath(new URL("../../", import.meta.url));
export const eventDir =
  process.env.ORCHESTRATOR_EVENTS_DIR ||
  resolve(root, ".runtime/orchestrator-monitor/events");
export function emit(event, directory = eventDir) {
  const e = {
    ...validate(event),
    id: randomUUID(),
    at: new Date().toISOString(),
  };
  mkdirSync(directory, { recursive: true });
  const name = resolve(
    directory,
    `${Date.now()}-${process.hrtime.bigint().toString().padStart(24, "0")}-${e.id}.json`,
  );
  writeFileSync(`${name}.tmp`, JSON.stringify(e), { flag: "wx" });
  renameSync(`${name}.tmp`, name);
  return e;
}
