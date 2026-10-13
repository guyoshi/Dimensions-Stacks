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
    s.innerHTML = `<div class="center"><div class="panel">
      <h2>Multiplayer</h2>
      <p class="hint">Cada jogador no seu aparelho. Um cria a sala e passa o código; os outros entram com ele.${canReal ? '' : '<br><b>Modo local:</b> aqui só funciona entre abas do mesmo navegador (útil para testar). Online de verdade, só abrindo pelo link do Claude.'}</p>
      <div class="who">${nm ? `${U.avatarHTML ? U.avatarHTML(window.DSSTATS.profile().avatar, nm, 40) : ''}<div class="whot"><b>${esc(nm)}</b><small>${esc(myUid())}</small></div>` : '<div class="whot"><b>Você ainda não tem um nome</b><small>Defina no Perfil para jogar online.</small></div>'}<button class="btn sm" data-a="prof">${nm ? 'Editar no Perfil' : 'Ir ao Perfil'}</button></div>
      <div class="row" style="margin-top:14px"><button class="btn primary" data-a="create">Criar sala</button>${lastRoom() ? `<button class="btn" data-a="back2">↩ Voltar à sala ${esc(lastRoom())}</button>` : ''}</div>
      <div class="lbl" style="margin-top:16px">Ou entrar com um código</div>
      <div class="row"><input type="text" id="onCode" maxlength="4" placeholder="KX7Q" class="txtin codein" autocapitalize="characters" autocomplete="off"><button class="btn" data-a="join">Entrar</button></div>
      <div class="onmsg ${kind || ''}" id="onMsg">${esc(msg || '')}</div>
      <div class="row" style="margin-top:12px"><button class="btn ghost" data-a="back">← Voltar</button></div></div></div>`;
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
  function flash(t, kind) { const m = $('#onMsg'); if (m) { m.textContent = t; m.className = 'onmsg ' + (kind || ''); } }
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
      const rj = (host.presence.rj || []).find(x => (x.u && x.u === myUid()) || x.n === name);
      if (!rj) { await link.leave(); busy(false); return flash('Essa partida já começou e não há lugar livre para você (só quem estava jogando pode voltar).', 'err'); }
      lobbyGuest(link, code, name, host.peer); sess.rejoining = true; renderLobby();
      const ask = () => link.send('msg', { t: 'rejoin', u: myUid(), n: name, i: rj.i }, host.peer).catch(() => { });
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
    sess = { link, role: 'host', code, name, join: [], unsub: [], cfg: Object.assign({ n: 2, per: 12, diff: 'normal', bd: ['normal', 'normal', 'normal'] }, store.get('onlineCfg', {}), { sf: window.__dsSf === 1 ? 1 : 2 }) };
    link.presence({ n: name, u: myUid(), h: 1, v: VER, cfg: sess.cfg });
    sess.unsub.push(link.onPeers(() => renderLobby()));
    U.show('online'); renderLobby();
  }
  function lobbyGuest(link, code, name, hostPeer) {
    remember(code);
    sess = { link, role: 'guest', code, name, hostPeer, join: [], unsub: [] };
    sess.unsub.push(link.onPeers(ch => {
      const h = link.peers().find(p => p.peer === hostPeer);
      if (!h) { const s = sess; if (s && !s.started) { leaveRoom(false).then(() => { entry('O anfitrião saiu da sala.', 'err'); U.show('online'); }); } return; }
      renderLobby();
    }));
    sess.unsub.push(link.on('go', (d, m) => { if (m.peer !== sess.hostPeer) return; begin(d); }));
    U.show('online'); renderLobby();
  }

  function renderLobby() {
    if (!sess) return; const s = section(), isHost = sess.role === 'host';
    const hum = humansOrdered(); const cfg = sess.cfg || (hum[0] && hum[0].presence.cfg) || { n: 2, per: 12, diff: 'normal', bd: ['normal', 'normal', 'normal'], sf: 2 };
    const bdOf = k => ((cfg.bd || [])[k]) || cfg.diff || 'normal'; const DF = [['facil', 'Fácil'], ['normal', 'Normal'], ['dificil', 'Difícil']];
    const N = Math.max(cfg.n || 2, Math.min(4, hum.length));
    const slots = []; for (let i = 0; i < N; i++) slots.push(hum[i] || null);
    const maxPer = Math.min(24, Math.floor(U.D.CARTAS.length / N));
    const per = Math.max(7, Math.min(cfg.per || 12, maxPer));
    const canStart = isHost && hum.length >= 1 && N >= 2;
    s.innerHTML = `<div class="center"><div class="panel">
      <h2>🌐 Sala <span class="roomcode" title="Código da sala">${esc(sess.code)}</span></h2>
      <div class="row" style="margin-bottom:6px"><button class="btn sm" data-a="copy">📋 Copiar código</button><span class="hint">${sess.link.mode === 'local' ? 'modo local (mesmo navegador)' : 'passe este código para quem vai jogar'}</span></div>
      <div class="lbl">Jogadores (${hum.length} humano${hum.length === 1 ? '' : 's'})</div>
      <div class="seats">${slots.map((p, i) => `<div class="seatcfg onseat"><div class="avatar" style="--pc:${PCOL[i]}">${p ? esc((p.presence.n || '?')[0].toUpperCase()) : '🤖'}</div>
        <div class="onnm"><b>${p ? esc(p.presence.n) : 'Bot'}</b>${p && p.presence.u ? ` <small class="uid">${esc(p.presence.u)}</small>` : ''}${p ? (p.presence.h ? ' <span class="pill">anfitrião</span>' : '') + (p.sameTab ? ' <span class="pill me">você</span>' : '') : ' <span class="hint">completa a vaga</span>'}</div>${p ? '<span></span>' : isHost ? `<div class="seg sm" data-k="bd" data-i="${i - hum.length}">${DF.map(([v, t]) => `<button data-v="${v}" class="${bdOf(i - hum.length) === v ? 'on' : ''}">${t}</button>`).join('')}</div>` : `<span class="pill">${(DF.find(x => x[0] === bdOf(i - hum.length)) || DF[1])[1]}</span>`}</div>`).join('')}</div>
      ${isHost ? `<div class="lbl">Lugares na mesa</div>
      <div class="seg" data-k="n">${[2, 3, 4].map(n => `<button data-v="${n}" class="${N === n ? 'on' : ''}" ${hum.length > n ? 'disabled' : ''}>${n}</button>`).join('')}</div>
      <div class="hint">Vagas sem humano são preenchidas por bots; escolha a dificuldade de cada um na lista acima.</div>
      <div class="lbl">Cartas por jogador: <b id="perv">${per}</b></div>
      <input type="range" min="7" max="${maxPer}" value="${per}" id="per">`
        : `<div class="onwait">${sess.rejoining ? 'Voltando para a partida em andamento…' : 'Aguardando o anfitrião iniciar a partida…'}</div><div class="hint">Mesa de ${N} · ${per} cartas por jogador</div>`}
      <div class="row" style="margin-top:16px;justify-content:space-between"><button class="btn ghost" data-a="leave">← Sair da sala</button>${isHost ? `<button class="btn primary" data-a="start" ${canStart ? '' : 'disabled'}>Começar ▶</button>` : ''}</div>
    </div></div>`;
    s.onclick = async e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return; SND.init(); SND.play('click');
      const a = b.dataset.a;
      if (a === 'leave') return leaveRoom(true);
      if (a === 'copy') { try { await navigator.clipboard.writeText(sess.code); b.textContent = '✔ Copiado'; } catch (er) { b.textContent = sess.code; } return; }
      if (a === 'start') return start();
      const seg = b.closest('.seg'); if (seg && isHost) {
        const k = seg.dataset.k, v = b.dataset.v; if (k === 'bd') { const bd = (sess.cfg.bd || ['normal', 'normal', 'normal']).slice(); bd[+b.closest('.seg').dataset.i] = v; sess.cfg.bd = bd; } else sess.cfg[k] = +v; store.set('onlineCfg', sess.cfg);
        sess.link.presence({ cfg: sess.cfg }); renderLobby();
      }
    };
    s.oninput = e => { if (e.target.id === 'per' && isHost) { sess.cfg.per = +e.target.value; $('#perv', s).textContent = sess.cfg.per; store.set('onlineCfg', sess.cfg); sess.link.presence({ cfg: sess.cfg }); } };
  }

  // ---------------------------------------------------------------- início
  function seatsFor(hum, N) {
    const used = []; const uniq = n => { let x = n || 'Jogador', k = 2; while (used.includes(x)) x = (n || 'Jogador') + ' ' + (k++); used.push(x); return x; };
    const seats = hum.map(p => ({ name: uniq(p.presence.n), bot: false, peer: p.peer, u: p.presence.u || '' }));
    const bd = (sess && sess.cfg && sess.cfg.bd) || []; let k = 0;
    while (seats.length < N) seats.push({ name: uniq(U.randBot(used)), bot: true, peer: null, diff: bd[k++] || 'normal' });
    return seats;
  }
  async function start(again) {
    if (!sess || sess.role !== 'host') return;
    const hum = humansOrdered(); const cfg = sess.cfg; const N = Math.max(cfg.n || 2, Math.min(4, hum.length));
    const maxPer = Math.min(24, Math.floor(U.D.CARTAS.length / N)); const per = Math.max(7, Math.min(cfg.per || 12, maxPer));
    const seats = again && sess.lastSeats ? again : seatsFor(hum, N);
    const go = { seats, per, diff: cfg.diff || 'normal', sf: cfg.sf === 1 ? 1 : 2, seed: (Math.random() * 2 ** 32) >>> 0, ver: VER };
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
