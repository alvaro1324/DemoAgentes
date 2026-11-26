// Observación únicamente: nunca devuelve decisiones ni inspecciona conversaciones.
import { emit, root, roles } from './events.mjs';
import { resolve, relative, isAbsolute } from 'node:path';
let input = '';
try {
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 65536) throw Error('Hook demasiado grande');
  }
  const data = JSON.parse(input);
  const rel = relative(root, resolve(data.cwd || '.'));
  if (rel.startsWith('..') || isAbsolute(rel)) throw Error('Otro proyecto');
  if (!data.session_id) throw Error('Sesión ausente');
  const role = roles.includes(data.agent_type) ? data.agent_type : undefined;
  emit({ kind: 'lifecycle', source: 'native', sessionId: data.session_id,
    runId: process.env.ORCHESTRATOR_RUN_ID || data.session_id,
    event: data.hook_event_name, role, agentId: data.agent_id });
} catch (error) { console.error(`Monitor: ${error.message}`); }
// SubagentStop requiere JSON; una avería del monitor nunca bloquea al agente.
console.log('{}');
