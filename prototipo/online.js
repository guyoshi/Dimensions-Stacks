/* Dimensions Stacks — multiplayer online: conexão (capability "room" do Claude, ou BroadcastChannel local para teste),
   sala com código, lobby e início da partida. A mesa em rede (anfitrião/convidado) fica em game.js (U.startOnline). */
(function () {
  'use strict';
  const U = window.DSUI;
  const { $, $$, el, esc, PCOL, SND } = U;
  const store = U.store;
  const TOPICS = ['ev', 'ask', 'ans', 'go', 'msg'];
  const CODE_CH = 'ACDEFGHJKMNPRTVWXY3469'; // sem caracteres parecidos (I/L/1, O/Q/0, S/5, Z/2, B/8, U/V)
  const enc = new TextEncoder();

  // versão dos dados/regras: anfitrião e convidados precisam ter o mesmo jogo
  function dataVersion() {
    let h = 2166136261; const s = U.D.CARTAS.map(c => c.id + c.stats.pod + c.stats.def + c.stats.int + c.stats.vel + c.especial).join('|') + Object.keys(U.E.SPECIALS).length;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  const VER = dataVersion();

  // ---------------------------------------------------------------- sala: real (room) ou local (BroadcastChannel)
  async function realRoom(name) {
    try {
      if (!window.claude || !window.claude.use) { U.roomWhy = 'sem runtime'; return null; }
      const room = await window.claude.use('room'); if (!room) { U.roomWhy = 'room indisponível (use retornou null)'; return null; }
      return await room.join(name);
    } catch (e) { console.warn('room', e); U.roomWhy = 'join: ' + ((e && (e.code || e.message)) || e); return null; }
  }
  function mockRoom(name) {
    if (typeof BroadcastChannel === 'undefined') return null;
    const id = 'm' + Math.random().toString(36).slice(2, 10), bc = new BroadcastChannel('dsmock-' + name);
    const hs = {}, subs = new Set(), peers = new Map(); let pres = {}, alive = true, connSubs = new Set();
    const mk = (pid, p) => Object.freeze({ peer: pid, by: null, isMe: pid === id, sameTab: pid === id, kind: 'viewer', guest: false, presence: p.presence, updatedAt: p.at });
    const list = () => Array.from(peers.entries()).map(([k, v]) => mk(k, v));
    const fire = (joined, left, updated) => { const ps = list(); subs.forEach(f => { try { f({ peers: ps, joined, left, updated }); } catch (e) { } }); };
    const setP = (pid, presence) => { const old = peers.get(pid); const same = old && JSON.stringify(old.presence) === JSON.stringify(presence); peers.set(pid, { presence, at: same ? old.at : Date.now(), seen: Date.now() }); if (!old) fire([mk(pid, peers.get(pid))], [], []); else if (!same) fire([], [], [mk(pid, peers.get(pid))]); };
    const sendP = () => bc.postMessage({ t: 'pres', from: id, presence: pres });
    bc.onmessage = e => {
      const m = e.data; if (!alive || !m) return;
      if (m.t === 'ev') (hs[m.topic] || []).forEach(h => { try { h({ topic: m.topic, data: m.data, peer: m.from, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false }); } catch (er) { console.error(er); } });
      else if (m.t === 'pres') { const first = !peers.has(m.from); setP(m.from, m.presence); if (first) sendP(); }
      else if (m.t === 'bye') { const o = peers.get(m.from); if (o) { const pe = mk(m.from, o); peers.delete(m.from); fire([], [pe], []); } }
    };
    setP(id, pres); sendP();
    const hb = setInterval(() => { sendP(); const now = Date.now(); peers.forEach((v, k) => { if (k !== id && now - v.seen > 9000) { const pe = mk(k, v); peers.delete(k); fire([], [pe], []); } }); }, 2500);
    const bye = () => { try { bc.postMessage({ t: 'bye', from: id }); } catch (e) { } };
    window.addEventListener('pagehide', bye);
    return {
      name, mock: true, myPeer: id,
      async emit(topic, data) { const L = JSON.stringify(data == null ? null : data).length; window.__dsMax = Math.max(window.__dsMax || 0, L); if (alive) bc.postMessage({ t: 'ev', topic, data: JSON.parse(JSON.stringify(data == null ? null : data)), from: id }); },
      on(topic, h) { (hs[topic] = hs[topic] || []).push(h); return () => { hs[topic] = (hs[topic] || []).filter(x => x !== h); }; },
      async presence(patch) { pres = Object.assign({}, pres); for (const k in patch) { if (patch[k] === null) delete pres[k]; else pres[k] = patch[k]; } setP(id, pres); sendP(); },
      peers: () => list(),
      onPeers(h) { subs.add(h); return () => subs.delete(h); },
      connected: () => true, onConnection(h) { h(true); return () => { }; },
      async leave() { if (!alive) return; alive = false; clearInterval(hb); bye(); window.removeEventListener('pagehide', bye); bc.close(); },
    };
  }

  // ---------------------------------------------------------------- link: mensagens tipadas, com destinatário opcional e fragmentação (limite de 4 KiB por mensagem)
  async function openLink(code) {
    const name = 'ds-' + code.toLowerCase();
    let room = await realRoom(name), mode = 'room';
    if (!room) { room = mockRoom(name); mode = 'local'; }
    if (!room) return null;
    let myPeer = room.myPeer || null; const hs = {}, off = [], chunks = new Map(); let cid = 0, seen = new Set();
    const link = {
      code, mode, VER,
      get me() { if (!myPeer) { const p = room.peers().find(x => x.isMe && x.sameTab); if (p) myPeer = p.peer; } return myPeer; },
      peers: () => room.peers(),
      onPeers: f => room.onPeers(f),
      presence: p => room.presence(p),
      connected: () => room.connected(),
      async send(topic, obj, to) {
        const s = JSON.stringify(obj); const body = to ? { to } : {};
        if (enc.encode(s).length < 3300) return room.emit(topic, Object.assign(body, { d: obj }));
        const id = ++cid, n = Math.ceil(s.length / 1400);
        for (let i = 0; i < n; i++) await room.emit(topic, Object.assign({}, body, { c: id, i, n, s: s.slice(i * 1400, (i + 1) * 1400) }));
      },
      on(topic, fn) { // fn(obj, msg)
        (hs[topic] = hs[topic] || []).push(fn);
        if (hs[topic].length === 1) off.push(room.on(topic, msg => {
          if (msg.sameTab) return; const x = msg.data; if (!x || typeof x !== 'object') return;
          if (x.to && x.to !== link.me) return;
          let obj;
          if ('d' in x) obj = x.d;
          else if (x.c != null) {
            const key = msg.peer + ':' + x.c; let c = chunks.get(key); if (!c) { c = { parts: [], got: 0 }; chunks.set(key, c); if (chunks.size > 40) chunks.delete(chunks.keys().next().value); }
            if (c.parts[x.i] == null) { c.parts[x.i] = x.s; c.got++; }
            if (c.got < x.n) return; chunks.delete(key); try { obj = JSON.parse(c.parts.join('')); } catch (e) { return; }
          } else return;
          (hs[topic] || []).slice().forEach(f => { try { f(obj, msg); } catch (e) { console.error(e); } });
        }));
        return () => { hs[topic] = (hs[topic] || []).filter(f => f !== fn); };
      },
      async leave() { off.forEach(f => { try { f(); } catch (e) { } }); try { await room.leave(); } catch (e) { } },
    };
    return link;
  }

  // ---------------------------------------------------------------- tela online
  const NAMEK = 'onlineName';
  let sess = null; // { link, role, code, name, join:[peerIds em ordem de entrada], cfg, unsub[] }
  const myName = () => (U.profileName && U.profileName()) || '';
  const myUid = () => (window.DSSTATS && window.DSSTATS.uid()) || '';
  function section() { return $('#online'); }
  function genCode() { let s = ''; for (let i = 0; i < 4; i++) s += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; return s; }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function lastRoom() { try { const r = store.get('lastRoom', null); return r && r.code && Date.now() - r.t < 6 * 3600e3 ? r.code : ''; } catch (e) { return ''; } }
  function entry(msg, kind) {
    const s = section(); const nm = myName();
    const canReal = !!(window.claude && window.claude.use);
    const L = U.lobbyIcon;
    s.classList.add('lbs');
    s.innerHTML = `<div class="lb-app"><div class="lb-hd"><button type="button" class="lb-back" data-a="back" aria-label="Voltar">${L('back')}</button><h1>Multiplayer</h1></div>
      <div class="lb-entry">
        <div class="lb-me">${nm ? `${U.avatarHTML ? U.avatarHTML(window.DSSTATS.profile().avatar, nm, 40) : ''}<div class="t"><b>${esc(nm)}</b><small>${esc(myUid())}</small></div>` : '<div class="t"><b>Sem nome</b><small>Defina no Perfil</small></div>'}<button type="button" class="lb-btn" data-a="prof">${nm ? 'Editar' : 'Perfil'}</button></div>
        <button type="button" class="lb-go" data-a="create">Criar sala</button>
        ${lastRoom() ? `<button type="button" class="lb-btn" data-a="back2" style="align-self:center">↩ Voltar à sala ${esc(lastRoom())}</button>` : ''}
        <div class="lb-or">ou entre com o código</div>
        <div class="lb-join"><input type="text" id="onCode" maxlength="4" placeholder="KX7Q" autocapitalize="characters" autocomplete="off" aria-label="Código da sala"><button type="button" class="lb-btn" data-a="join">Entrar</button></div>
        <div class="lb-msg ${kind || ''}" id="onMsg">${esc(msg || '')}</div>
      </div>${canReal ? '' : '<div class="lb-sum">Modo local · só entre abas deste navegador</div>'}</div>`;
    const inp = $('#onCode', s); if (lastRoom()) inp.value = lastRoom(); inp.oninput = () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    s.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return; SND.init(); SND.play('click');
      const a = b.dataset.a;
      if (a === 'back') return U.show('menu');
      if (a === 'prof') return U.show('prof');
      const name = myName();
      if (!name) return flash('Defina seu nome no Perfil primeiro.', 'err');
      if (a === 'create') return doCreate(name);
      if (a === 'back2') { inp.value = lastRoom(); return doJoin(name, lastRoom()); }
      if (a === 'join') { const c = inp.value.trim(); if (c.length !== 4) return flash('O código tem 4 letras/números.', 'err'); return doJoin(name, c); }
    };
  }
const NOCONN = 'Sem conexão online: este acesso não foi admitido na sala (o Claude só libera multiplayer para quem tem permissão de Colaborador ou Editor no jogo, logado). Peça ao dono para convidar seu e-mail como Editor e abra o jogo de novo pelo convite.';
  function noReal(link) { return !!(link && link.mode === 'local' && window.claude && window.claude.use); }
  function flash(t, kind) { const m = $('#onMsg'); if (m) { m.textContent = t; m.className = 'lb-msg ' + (kind || ''); } }
  function busy(on) { $$('#online button').forEach(b => { b.disabled = !!on; }); }

  async function doCreate(name) {
    busy(true); flash('Criando sala…');
    for (let t = 0; t < 6; t++) {
      const code = genCode(); const link = await openLink(code);
      if (!link) { busy(false); return flash('Não foi possível abrir a conexão online neste aparelho.', 'err'); }
      if (noReal(link)) { await link.leave(); busy(false); return flash(NOCONN + ' [detalhe: ' + (U.roomWhy || '?') + ']', 'err'); }
      await link.presence({ n: name, u: myUid(), v: VER }); await sleep(1100);
      if (link.peers().some(p => !p.sameTab && p.presence && p.presence.h)) { await link.leave(); continue; } // código já em uso
      return lobbyHost(link, code, name);
    }
    busy(false); flash('Não consegui criar uma sala livre. Tente de novo.', 'err');
  }
  async function doJoin(name, code) {
    busy(true); flash('Procurando a sala…');
    const link = await openLink(code);
    if (!link) { busy(false); return flash('Não foi possível abrir a conexão online neste aparelho.', 'err'); }
    if (noReal(link)) { await link.leave(); busy(false); return flash(NOCONN + ' [detalhe: ' + (U.roomWhy || '?') + ']', 'err'); }
    await link.presence({ n: name, u: myUid(), v: VER });
    let host = null; const t0 = Date.now();
    while (Date.now() - t0 < 6000) { host = link.peers().find(p => !p.sameTab && p.presence && p.presence.h); if (host) break; await sleep(250); }
    if (!host) { await link.leave(); busy(false); return flash('Sala não encontrada. Confira o código (e se o anfitrião ainda está nela).', 'err'); }
    if (host.presence.v !== VER) { await link.leave(); busy(false); return flash('Versões diferentes do jogo. Recarregue a página e tente de novo.', 'err'); }
    if (host.presence.go) {
      let rj = (host.presence.rj || []).find(x => (x.u && x.u === myUid()) || x.n === name), take = false;
      if (!rj) {   // pessoa nova: pode assumir o lugar de uma CPU, se o anfitrião permitir
        const open = host.presence.open || [];
        if (!open.length) { await link.leave(); busy(false); return flash('Essa partida já começou e não há lugar livre para você (a entrada pode estar desligada pelo anfitrião).', 'err'); }
        const pick = await new Promise(res => {
          const w = el(`<div><h2 style="color:var(--gold2);margin-bottom:6px">Partida em andamento</h2><p class="hint">Escolha o lugar de qual CPU você quer assumir. Você herda o baralho dela.</p><div class="row" style="flex-direction:column;gap:8px;margin-top:10px">${open.map(x => `<button class="btn" data-i="${x.i}">⚙ ${esc(x.n)}</button>`).join('')}<button class="btn ghost" data-i="-1">Cancelar</button></div></div>`);
          const m = U.modal(w); w.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; m.close(); res(+b.dataset.i); };
        });
        if (pick < 0) { await link.leave(); busy(false); return flash('Entrada cancelada.'); }
        rj = { i: pick }; take = true;
      }
      lobbyGuest(link, code, name, host.peer); sess.rejoining = true; renderLobby();
      sess.unsub.push(link.on('msg', (d, m) => { if (d && d.t === 'rejoinNo' && m.peer === host.peer && sess && !sess.started) { leaveRoom(false).then(() => { entry('Esse lugar não está mais disponível (outra pessoa entrou, o jogador foi eliminado ou o anfitrião desligou a entrada).', 'err'); U.show('online'); }); } }));
      const ask = () => link.send('msg', { t: 'rejoin', u: myUid(), n: name, i: rj.i, take }, host.peer).catch(() => { });
      ask(); let tries = 0; const iv = setInterval(() => { if (!sess || sess.started || ++tries > 8) return clearInterval(iv); ask(); }, 2500);
      sess.unsub.push(() => clearInterval(iv)); return;
    }
    const humans = link.peers().filter(p => p.presence && p.presence.n).length;
    if (humans > 4) { await link.leave(); busy(false); return flash('Sala cheia (máximo 4 jogadores).', 'err'); }
    lobbyGuest(link, code, name, host.peer);
  }

  // ---------------------------------------------------------------- lobby
  function stopSess() { if (sess) { sess.unsub.forEach(f => { try { f(); } catch (e) { } }); sess = null; } }
  function humansOrdered() { // anfitrião primeiro, depois ordem de entrada
    const ps = sess.link.peers().filter(p => p.presence && p.presence.n && (p.isMe && p.sameTab || !p.isMe || true));
    const byId = Object.fromEntries(ps.map(p => [p.peer, p]));
    sess.join = sess.join.filter(id => byId[id]); ps.forEach(p => { if (!sess.join.includes(p.peer)) sess.join.push(p.peer); });
    const host = ps.find(p => p.presence.h); const rest = sess.join.filter(id => !host || id !== host.peer).map(id => byId[id]).filter(Boolean);
    return (host ? [host] : []).concat(rest).slice(0, 4);
  }
  async function leaveRoom(toMenu) { const s = sess; stopSess(); if (s) await s.link.leave(); if (toMenu !== false) { U.show('menu'); } }
  U.onlineLeave = () => leaveRoom(true);

  const remember = code => { try { store.set('lastRoom', { code, t: Date.now() }); } catch (e) { } };
  function lobbyHost(link, code, name) {
    remember(code);
    const saved = store.get('onlineCfg', {}), used = [name], sd = (saved.cpu || []).map(c => c && c.d);
    const cpu = [0, 1, 2].map(k => { const n = U.randBot(used); used.push(n); return { n, d: sd[k] || (saved.bd && saved.bd[k]) || 'normal' }; });
    sess = { link, role: 'host', code, name, join: [], unsub: [], ui: { sel: null, swap: false, pop: null }, cfg: { mode: saved.mode === 'duo' ? 'duo' : 'ffa', n: saved.n || 2, per: saved.perV === 2 ? (saved.per || 14) : 14, perV: 2, ev: saved.ev === 0 ? 0 : 1, diff: 'normal', arr: [], cpu, sf: window.__dsSf === 1 ? 1 : 2 } };
    link.presence({ n: name, u: myUid(), h: 1, v: VER, cfg: sess.cfg });
    sess.unsub.push(link.onPeers(() => renderLobby()));
    U.show('online'); renderLobby();
  }
  function lobbyGuest(link, code, name, hostPeer) {
    remember(code);
    sess = { link, role: 'guest', code, name, hostPeer, join: [], unsub: [], ui: { sel: null, swap: false, pop: null } };
    sess.unsub.push(link.onPeers(ch => {
      const h = link.peers().find(p => p.peer === hostPeer);
      if (!h) { const s = sess; if (s && !s.started) { leaveRoom(false).then(() => { entry('O anfitrião saiu da sala.', 'err'); U.show('online'); }); } return; }
      renderLobby();
    }));
    sess.unsub.push(link.on('go', (d, m) => { if (m.peer !== sess.hostPeer) return; begin(d); }));
    U.show('online'); renderLobby();
  }

  // assentos da sala: arr guarda quem senta onde (id do jogador ou '#0'..'#2' = CPU); é normalizado a cada desenho
  function layoutOf(hum, cfg) {
    const duo = cfg.mode === 'duo', N = duo ? 4 : Math.max(cfg.n || 2, Math.min(4, hum.length));
    const ids = hum.map(p => p.peer), isC = t => t[0] === '#';
    let arr = (cfg.arr || []).filter((t, i, a) => a.indexOf(t) === i && (isC(t) ? +t.slice(1) < 3 : ids.includes(t)));
    const lastC = () => { for (let k = arr.length - 1; k >= 0; k--) if (isC(arr[k])) return k; return -1; };
    ids.forEach(id => { if (!arr.includes(id)) { if (arr.length < N) arr.push(id); else { const k = lastC(); if (k >= 0) arr[k] = id; } } });
    while (arr.length > N) { const k = lastC(); if (k < 0) break; arr.splice(k, 1); }
    for (let c = 0; arr.length < N; c++) if (!arr.includes('#' + c)) arr.push('#' + c);
    return { N, arr };
  }
  const cpuOf = (cfg, t) => (cfg.cpu || [])[+t.slice(1)] || { n: 'CPU', d: 'normal' };
  function renderLobby() {
    if (!sess) return; const s = section(), isHost = sess.role === 'host', ui = sess.ui;
    const hum = humansOrdered(); const cfg = sess.cfg || (hum[0] && hum[0].presence.cfg) || { mode: 'ffa', n: 2, per: 14, ev: 1, arr: [], cpu: [] };
    const lay = layoutOf(hum, cfg), N = lay.N, duo = cfg.mode === 'duo', me = sess.link.me;
    if (isHost && JSON.stringify(cfg.arr) !== JSON.stringify(lay.arr)) { cfg.arr = lay.arr; sess.link.presence({ cfg }); }
    const byId = Object.fromEntries(hum.map(p => [p.peer, p]));
    const seats = lay.arr.map(t => { const p = byId[t]; return p ? { name: p.presence.n, cpu: false, me: p.peer === me, host: !!p.presence.h, live: p.peer !== me, tag: p.presence.h ? 'anfitrião' : p.peer === me ? p.presence.n : 'jogador' } : { name: cpuOf(cfg, t).n, cpu: true, diff: cpuOf(cfg, t).d }; });
    const maxPer = Math.min(24, Math.floor(U.D.CARTAS.length / N)), per = Math.max(7, Math.min(cfg.per || 14, maxPer));
    if (ui.sel == null || ui.sel >= N) { const k = seats.findIndex(p => p.cpu); ui.sel = k < 0 ? 0 : k; ui.swap = false; }
    const m = { role: sess.role, title: 'Sala', code: sess.code, mode: duo ? 'duo' : 'ffa', N, hum: hum.length, seats, sel: ui.sel, swap: ui.swap, pop: ui.pop, per, ev: cfg.ev !== 0, canStart: hum.length >= 1, wait: sess.rejoining ? 'Voltando para a partida' : 'Aguardando o anfitrião' };
    ui.pop = null;
    const push = () => { store.set('onlineCfg', sess.cfg); sess.link.presence({ cfg: sess.cfg }); renderLobby(); };
    U.lobby.mount(s, m, (a, v) => {
      if (a === 'leave') return leaveRoom(true);
      if (!isHost) return;
      const c = sess.cfg; c.arr = lay.arr;
      if (a === 'start') return start();
      if (a === 'mode') { c.mode = v; ui.sel = null; ui.pop = [0, 1, 2, 3]; return push(); }
      if (a === 'n') { c.n = v; ui.sel = null; return push(); }
      if (a === 'per') { c.per = Math.max(7, Math.min(maxPer, per + v)); return push(); }
      if (a === 'ev') { c.ev = c.ev === 0 ? 1 : 0; return push(); }
      if (a === 'seat') { ui.sel = v; return renderLobby(); }
      if (a === 'move') { const [x, y] = v, r = c.arr.slice(); [r[x], r[y]] = [r[y], r[x]]; c.arr = r; ui.pop = [x, y]; ui.swap = false; ui.sel = y; return push(); }
      if (a === 'shuffle') { const r = c.arr.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } c.arr = r; ui.pop = [0, 1, 2, 3]; ui.swap = false; return push(); }
      const t = c.arr[ui.sel]; if (!t || t[0] !== '#') return;
      if (a === 'dice') { const used = hum.map(p => p.presence.n).concat(c.cpu.map(x => x.n)); c.cpu[+t.slice(1)].n = U.randBot(used); return push(); }
      if (a === 'diff') { c.cpu[+t.slice(1)].d = v; return push(); }
    });
  }

  // ---------------------------------------------------------------- início
  function seatsFor(hum, lay, cfg) {
    const used = []; const uniq = n => { let x = n || 'Jogador', k = 2; while (used.includes(x)) x = (n || 'Jogador') + ' ' + (k++); used.push(x); return x; };
    const byId = Object.fromEntries(hum.map(p => [p.peer, p]));
    return lay.arr.map(t => { const p = byId[t]; return p ? { name: uniq(p.presence.n), bot: false, peer: p.peer, u: p.presence.u || '' } : { name: uniq(cpuOf(cfg, t).n), bot: true, peer: null, diff: cpuOf(cfg, t).d }; });
  }
  async function start(again) {
    if (!sess || sess.role !== 'host') return;
    const hum = humansOrdered(); const cfg = sess.cfg; const lay = layoutOf(hum, cfg), N = lay.N;
    const maxPer = Math.min(24, Math.floor(U.D.CARTAS.length / N)); const per = Math.max(7, Math.min(cfg.per || 14, maxPer));
    const seats = again && sess.lastSeats ? again : seatsFor(hum, lay, cfg);
    const go = { seats, per, diff: cfg.diff || 'normal', sf: cfg.sf === 1 ? 1 : 2, ev: cfg.ev !== 0, teams: cfg.mode === 'duo' && seats.length === 4 ? [[0, 2], [1, 3]] : null, seed: (Math.random() * 2 ** 32) >>> 0, ver: VER };
    sess.lastSeats = seats; sess.started = true; sess.link.presence({ go: 1 });
    await sess.link.send('go', go); await sleep(250);
    begin(go);
  }
  // uma partida (anfitrião ou convidado): hand-off para game.js
  function begin(go) {
    if (!sess) return; const link = sess.link; const me = link.me;
    const viewer = go.rejoin != null ? go.rejoin : go.seats.findIndex(x => x.peer === me); if (viewer < 0) return;
    sess.started = true;
    const ctl = {
      role: sess.role, link, seats: go.seats, viewer, cfg: go, rejoin: go.rejoin != null, hostPeer: sess.hostPeer || me,
      leave: () => leaveRoom(true),
      again: sess.role === 'host' ? () => {
        const present = new Set(link.peers().map(p => p.peer));
        const seats = go.seats.map(s => s.peer && !present.has(s.peer) ? { name: s.name, bot: true, peer: null, diff: 'normal' } : s);
        sess.lastSeats = seats; start(seats);
      } : null,
    };
    U.startOnline(ctl);
  }

  U.online = { open() { const s = section(); if (!s) return; stopSess(); entry(); U.show('online'); }, VER, openLink };
})();
