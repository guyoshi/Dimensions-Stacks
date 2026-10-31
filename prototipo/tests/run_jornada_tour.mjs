// Regressão sem dependências: usa o protocolo de depuração do Chrome instalado.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const project = dirname(dirname(fileURLToPath(import.meta.url)));
const profile = mkdtempSync(join(tmpdir(), 'ds-jornada-'));
const screenshot = join(tmpdir(), 'ds-jornada-tour.png');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const rel = decodeURIComponent((req.url || '/').split('?')[0]) === '/' ? 'index.html' : decodeURIComponent((req.url || '').split('?')[0]).replace(/^\/+/, '');
  const file = resolve(project, rel);
  if (!file.startsWith(resolve(project) + sep)) { res.writeHead(403).end(); return; }
  try { const data = readFileSync(file); res.writeHead(200, { 'Content-Type': mime[extname(file).toLowerCase()] || 'application/octet-stream' }); res.end(data); } catch (_) { res.writeHead(404).end(); }
});
await new Promise((ok, fail) => server.listen(8781, '127.0.0.1', err => err ? fail(err) : ok()));
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=9231', '--remote-allow-origins=*', `--user-data-dir=${profile}`,
  '--window-size=390,844', 'http://127.0.0.1:8781/index.html'
], { stdio: 'ignore' });

let socket, seq = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((ok, fail) => {
  const id = ++seq; pending.set(id, { ok, fail }); socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const out = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (out.result.exceptionDetails) throw new Error(out.result.exceptionDetails.exception?.description || out.result.exceptionDetails.text);
  return out.result.result.value;
};
const waitDebug = async () => {
  for (let i = 0; i < 80; i++) {
    try { const pages = await (await fetch('http://127.0.0.1:9231/json')).json(); const game = pages.find(p => p.type === 'page' && p.url.includes('127.0.0.1:8781')); if (game) return game; } catch (_) { }
    await sleep(100);
  }
  throw new Error('Chrome não abriu a porta de verificação.');
};

try {
  const page = await waitDebug();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok, fail) => { socket.onopen = ok; socket.onerror = fail; });
  socket.onmessage = event => { const msg = JSON.parse(event.data); if (!msg.id || !pending.has(msg.id)) return; const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.fail(new Error(msg.error.message)) : p.ok(msg); };
  await send('Runtime.enable'); await send('Page.enable');
  await evaluate(`(async()=>{for(let i=0;i<100&&document.readyState!=='complete';i++)await new Promise(r=>setTimeout(r,50));localStorage.setItem('dsstacks.opts',JSON.stringify({musicOn:false,help:false}));localStorage.setItem('dsstacks.historia.prefs',JSON.stringify({aberto:true,escuro:false,v2:1}));return true})()`);
  await send('Page.reload');
  const result = await evaluate(`(async()=>{
    const wait=async s=>{for(let i=0;i<200;i++){const e=document.querySelector(s);if(e)return e;await new Promise(r=>setTimeout(r,50))}throw Error('Não apareceu: '+s)};
    (await wait('#nav [data-tab=uniao]')).click();(await wait('[data-a=novo]')).click();(await wait('.cin-skip')).click();(await wait('.cin-qs button')).click();await wait('.hs-svg');
    document.querySelector('.hs-pause').click();await wait('.jornada-tour');
    const out={titulo:document.querySelector('.hs-pausa>header h2').textContent,antigo:document.querySelector('.hs-pausa').textContent.includes('Menu de pausa'),simbolo:!!document.querySelector('.hs-pause svg circle'),guias:[]};
    for(const nome of ['status','talentos','temas','config','registros','missoes']){out.guias.push(document.querySelector('.hs-pausa>nav button.on').dataset.a==='t:'+nome);if(nome!=='missoes'){document.querySelector('[data-tour=next]').click();await new Promise(r=>setTimeout(r,80))}}
    return out;
  })()`);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(screenshot, Buffer.from(shot.result.data, 'base64'));
  const ending = await evaluate(`(async()=>{document.querySelector('[data-tour=next]').click();await new Promise(r=>setTimeout(r,220));const terminou=!document.querySelector('.jornada-tour');document.querySelector('.hs-pausa-modal .x').click();document.querySelector('.hs-pause').click();await new Promise(r=>setTimeout(r,120));return{terminou,naoRepete:!document.querySelector('.jornada-tour'),salvou:window.DSHistoria.state().tutJornada===1}})()`);
  const checks = {
    'o painel se chama somente Jornada': result.titulo === 'Jornada',
    'o nome antigo não aparece': !result.antigo,
    'o botão usa o símbolo de Jornada': result.simbolo,
    'o NPC abre as seis guias': result.guias.every(Boolean),
    'a apresentação termina em Entendi': ending.terminou,
    'a apresentação não se repete': ending.naoRepete,
    'o save registra a apresentação': ending.salvou
  };
  let failed = false; for (const [name, ok] of Object.entries(checks)) { console.log((ok ? 'ok    ' : 'FALHA ') + name); failed ||= !ok; }
  console.log('captura:', screenshot); if (failed) process.exitCode = 1;
} finally {
  if (socket) socket.close(); chrome.kill(); server.close();
  await sleep(500);
  const base = resolve(tmpdir()) + sep, target = resolve(profile);
  if (target.startsWith(base) && basename(target).startsWith('ds-jornada-')) {
    try { rmSync(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch (_) { }
  }
}
