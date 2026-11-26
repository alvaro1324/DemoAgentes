import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, Footer, PageNumber, ImageRun, AlignmentType, PageBreak } from 'docx';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { root } from './events.mjs';
import JSZip from 'jszip';
const runtime=resolve(root,'.runtime/orchestrator-monitor');
const reportPath=resolve(runtime,'browser-report.json');
const report=existsSync(reportPath)?JSON.parse(readFileSync(reportPath,'utf8')):null;
const p=text=>new Paragraph({children:[new TextRun(text)],spacing:{after:140}});
const h=text=>new Paragraph({text,heading:HeadingLevel.HEADING_1});
const sub=text=>new Paragraph({text,heading:HeadingLevel.HEADING_2});
const code=text=>new Paragraph({children:[new TextRun({text,font:'Consolas',size:17,color:'163C58'})],spacing:{after:90},shading:{type:ShadingType.CLEAR,fill:'EEF4F8'}});
const next=()=>new Paragraph({children:[new PageBreak()]});
function table(headers,rows,widths){return new Table({width:{size:9900,type:WidthType.DXA},columnWidths:widths,rows:[headers,...rows].map((row,i)=>new TableRow({children:row.map((text,j)=>new TableCell({width:{size:widths[j],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:i===0?'12364D':i%2?'F1F5F8':'FFFFFF'},margins:{top:90,bottom:90,left:110,right:110},children:[new Paragraph({children:[new TextRun({text,bold:i===0,color:i===0?'FFFFFF':'233746',size:19})],spacing:{after:40}})]}))}))});}
const children=[
  new Paragraph({text:'DEMOAGENTES / INGENIERÍA',spacing:{before:900,after:400},children:[new TextRun({text:'',color:'177D77'})]}),
  new Paragraph({text:'El orquestador, en directo',heading:HeadingLevel.TITLE}),
  p('Visor HTML con Mermaid, hooks de ciclo de vida y estados explícitos.'),
  p('Proceso de diseño, implementación, comprobación y puesta en marcha'),
  new Paragraph({text:'26 de noviembre de 2026 · Europe/Madrid',spacing:{before:500,after:360}}),
  table(['Entrega','Resultado'],[
    ['Artefacto','HTML local con diagrama, estados, sesiones, agentes e historial'],
    ['Integración','Hooks del proyecto y emisión explícita del orquestador'],
    ['Verificación','Pruebas Node y Chromium sobre un almacén temporal'],
    ['Pendiente nativo','Cargar y confiar hooks en una nueva sesión Codex'],
  ],[2600,7300]),
  p('El visor observa el último estado comunicado. La demostración utiliza eventos ficticios identificados y no acredita una ejecución de los agentes.'),
  next(),
  h('1. Necesidad y estado de partida'),
  p('El usuario solicitó ver en marcha el diagrama Mermaid del orquestador, conocer su estado en tiempo real, implementar la conexión mediante hooks y disponer de un documento Word de todo el proceso.'),
  p('Se contrastaron AGENTS.md, la bitácora, Git, el análisis y el contrato de la versión 0.1, la guía del orquestador y sus instrucciones TOML. El Mermaid histórico pertenece a una referencia de reservas; se adaptó al flujo vigente de DemoAgentes.'),
  p('El estado inicial incluía cambios locales anteriores en los agentes, el prompt y documentación. Se conservaron. No se modificaron el MVP Symfony/Angular, sus datos o sus dependencias.'),
  sub('Criterios verificables'),
  p('Actualizar el nodo activo sin recargar; separar sesiones, encargos y demo; mostrar desconexión; conservar eventos al reconectar; limitar a tres correcciones globales; exigir evidencia y versión coincidente para una aprobación comunicada; no registrar conversaciones ni bloquear al agente si falla el observador.'),
  sub('Decisiones de implementación'),
  table(['Decisión','Motivo'],[
    ['HTML/JS y Node local','Conectar con procesos locales sin desplegar datos de sesiones'],
    ['Mermaid 11.12.2 local','Diagrama descargable; visualización sin CDN'],
    ['Archivos JSON atómicos','Escritura concurrente sin un estado compartido mutable'],
    ['SSE y lectura cada 400 ms','Actualización automática y recuperación con instantáneas'],
    ['docx 9.5.1','Word reproducible mediante script versionado'],
  ],[3300,6600]),
  next(),
  h('2. Arquitectura y flujo observable'),
  code('Codex hooks -> hook.mjs -> JSON atómico -> servidor -> SSE -> HTML'),
  code('Orquestador -> emit.mjs --------------------^'),
  code('Demo -> demo.mjs (origen separado) ----------^'),
  p('El navegador es un observador de lectura. Selecciona el origen y el encargo, resalta nodos activos y visitados, y muestra ciclo global, revisión comunicada, agentes y evidencia. El historial presenta hasta 100 eventos y 20 rechazos por encargo.'),
  ...(existsSync(resolve(runtime,'diagram.png'))?[new Paragraph({children:[new ImageRun({type:'png',data:readFileSync(resolve(runtime,'diagram.png')),transformation:{width:490,height:305}})]}),p('Captura de una demostración durante las pruebas de navegador: desarrollo activo; no se ejecutaron agentes reales.')]:[p('Captura pendiente: ejecutar la prueba de navegador para incorporarla.')]),
  sub('Identidad y conservación'),
  p('Cada evento incluye id UUID, fecha UTC, sessionId y runId. La pareja sesión/encargo aísla ejecuciones; el origen demo está separado de las fuentes reales. Los eventos permanecen bajo .runtime/orchestrator-monitor/events, ignorado por Git; no existe rotación automática. El servidor reconstruye el estado desde esos archivos.'),
  next(),
  h('3. Hooks y semántica del estado'),
  p('La configuración .codex/hooks.json registra SessionStart, SessionEnd, SubagentStart, SubagentStop, Stop e Interrupt. El lanzador resuelve la raíz con Git desde cualquier subcarpeta. hook.mjs recibe JSON por stdin, comprueba el proyecto, filtra campos y devuelve {} con código 0.'),
  p('No se inspeccionan transcripts ni contenidos de herramientas. Los metadatos nativos sirven para observar el ciclo de vida. El fin de un turno o de un verificador no constituye un dictamen.'),
  table(['Estado','Regla'],[
    ['CONTEXTO / PLANIFICACION','Inicio en ciclo 0 y planificación opcional'],
    ['DESARROLLO','Implementación según contrato'],
    ['VERIFICACION','Incluye identificador de la versión revisada'],
    ['CORRECCION','Incrementa el contador global; máximo 3'],
    ['APROBADO','Exige dictamen, evidencia y versión coincidente'],
    ['BLOQUEADO / PLAN_ENTREGADO','Cierre por impedimento o encargo de solo planificación'],
  ],[3400,6500]),
  p('El orquestador comunica cada transición con emit.mjs y conserva la sesión padre y el runId. Un cambio tras aprobación invalida el dictamen: consume otro ciclo de corrección o comunica bloqueo si no queda margen. El reductor rechaza saltos y contadores incoherentes sin alterar el estado válido anterior.'),
  sub('Alcance de la evidencia'),
  p('El observador comprueba la coherencia del mensaje; no certifica el contenido del informe, el hash del diff ni la independencia de su autor. La aprobación y su vigencia siguen siendo responsabilidad del verificador y del orquestador.'),
  next(),
  h('4. Instalación y uso paso a paso'),
  p('Desde D:/Sourcetree/DemoAgentes, con Node 20.19 o compatible:'),
  code('npm --prefix tools/orchestrator-monitor ci'),
  code('npm --prefix tools/orchestrator-monitor start'),
  p('Abrir http://127.0.0.1:8790. El proceso escucha solo en loopback. Ctrl+C lo detiene. ORCHESTRATOR_PORT permite otro puerto.'),
  sub('Ver el diagrama en marcha'),
  code('npm --prefix tools/orchestrator-monitor run demo'),
  p('En el visor, seleccionar Demostración. El recorrido incluye una corrección y un cierre ficticio. El navegador también permite descargar la fuente Mermaid.'),
  sub('Activar recepción nativa'),
  p('Abrir una nueva sesión Codex en el repositorio. Revisar y confiar los hooks desde /hooks en CLI o desde la interfaz de hooks del cliente compatible. La documentación oficial requiere esa confianza para hooks no administrados. No se cambia la configuración personal ni se elude la revisión.'),
  p('Antes de iniciar el cliente, ORCHESTRATOR_RUN_ID puede fijar el encargo. Los eventos explícitos deben usar el mismo --run y el --session real de los hooks. Sin esa variable, el hook utiliza sessionId como runId. No inventar ids; sin ellos debe declararse el límite de correlación.'),
  code('node tools/orchestrator-monitor/emit.mjs --session SESSION'),
  code('  --run ENCARGO --state CONTEXTO --cycle 0'),
  p('El comando anterior se escribe en una sola línea, sustituyendo los identificadores reales. En VERIFICACION se añade --revision; APROBADO requiere además --verdict APROBADO y --evidence con la referencia al informe vigente.'),
  p('Guía completa y ejemplos: docs/orquestador-monitor.md. No cargar esta configuración retroactivamente ni interpretar una demo como un encargo ejecutado.'),
  next(),
  h('5. Comprobaciones y correcciones'),
  p('Se ejecutaron 13 pruebas Node del contrato, ciclos y versiones, aislamiento, archivos atómicos, sanitización del adaptador, entrada malformada y resolución del lanzador desde frontend/. Resultado: 13 superadas, 0 fallidas.'),
  p(report?`Prueba Chromium: ${report.result}, ${report.checks.length} comprobaciones, ${report.pageErrors.length} errores JavaScript. Informe: .runtime/orchestrator-monitor/browser-report.json; fecha registrada: ${report.at}.`:'Prueba Chromium: no hay informe disponible; no se presume ejecutada.'),
  ...(report?.checks || []).map((text,i)=>p(`${i+1}. ${text}.`)),
  sub('Incidencias corregidas durante el proceso'),
  p('Node 20 en Windows no expandió test/*.test.mjs: se sustituyó por la ruta explícita del archivo. Chromium detectó un desbordamiento en móvil causado por el ancho mínimo de las celdas: se corrigió con min-width:0. Se ajustó el peso de las etiquetas activas para respetar su anchura calculada en Mermaid.'),
  p('Los tests utilizan carpetas temporales y servidor propio. No se ejecutaron PHPUnit, Vitest ni el E2E del MVP; este encargo no modifica la aplicación o su base de datos. Estos controles propios no son una revisión independiente del agente verificador.'),
  next(),
  h('6. Archivos, mantenimiento y límites'),
  table(['Archivo','Responsabilidad'],[
    ['.codex/hooks.json','Configuración de hooks locales'],
    ['.codex/agents/orquestador.toml','Instrucciones aditivas para comunicar transiciones'],
    ['events.mjs / emit.mjs / hook.mjs','Contrato, persistencia y adaptadores'],
    ['server.mjs / public/*','Servidor de lectura y visor Mermaid'],
    ['demo.mjs / test/*','Simulación y verificaciones reproducibles'],
    ['make-word.mjs','Generación del documento Word'],
    ['docs/orquestador-monitor.md','Guía operativa y contrato detallado'],
  ],[4200,5700]),
  p('Salvo las rutas explícitas, los scripts de la tabla pertenecen a tools/orchestrator-monitor. El análisis se amplía en su sección 11; el historial permanece en docs/bitacora.md.'),
  sub('Repetir comprobaciones y generar Word'),
  code('npm --prefix tools/orchestrator-monitor test'),
  code('npm --prefix tools/orchestrator-monitor run test:browser'),
  code('npm --prefix tools/orchestrator-monitor run word'),
  p('Playwright se reutiliza desde frontend/node_modules. La captura e informe generados se incorporan al Word si existen. La visualización no depende de Word ni de la instalación de docx en tiempo de ejecución.'),
  sub('Pendiente y límites operativos'),
  p('Falta comprobar el despacho nativo de los hooks y un encargo delegado completo en una nueva sesión que cargue y confíe la configuración. Los tests por stdin y el lanzador sí se ejecutaron; no equivalen a ese ensayo. El visor representa la última comunicación, no puede inferir qué hace un agente entre eventos.'),
  p('Uso local y volúmenes pequeños. Los eventos se conservan hasta limpieza manual; no hay autenticación remota, rotación ni despliegue. Los campos libres explícitos no deben contener secretos. No se hacen commits, PR, push ni cambios en servicios externos.'),
  p('Fuente oficial consultada: https://learn.chatgpt.com/docs/hooks. Registro del trabajo y evidencias finales: docs/bitacora.md, entradas 56 y siguientes.'),
];
const doc=new Document({creator:'DemoAgentes',title:'Proceso del visor del orquestador con hooks',description:'Diseño, implementación, pruebas y operación local',styles:{default:{document:{run:{font:'Calibri',size:21,color:'263A49'},paragraph:{spacing:{line:270}}},title:{run:{font:'Calibri',size:48,bold:true,color:'12364D'},paragraph:{spacing:{before:0,after:260},keepNext:true}},heading1:{run:{font:'Calibri',size:31,bold:true,color:'12364D'},paragraph:{spacing:{before:0,after:200},keepNext:true}},heading2:{run:{font:'Calibri',size:24,bold:true,color:'167A74'},paragraph:{spacing:{before:200,after:100},keepNext:true}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:950,bottom:950,left:1000,right:1000}}},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'DemoAgentes · Proceso del visor | ',size:17,color:'657B89'}),new TextRun({children:[PageNumber.CURRENT],size:17})]})]})},children}]});
const zip=await JSZip.loadAsync(await Packer.toBuffer(doc));
for(const name of Object.keys(zip.files)) if(zip.files[name].dir) delete zip.files[name];
const file=resolve(root,'docs/proceso-orquestador-monitor.docx');writeFileSync(file,await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));console.log(file);
