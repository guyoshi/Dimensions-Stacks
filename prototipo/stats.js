/* Dimensions Stacks — estatísticas: perfil local, conquistas, desafio do dia e registro de partidas.
   O gravador recebe os mesmos eventos que a mesa (offline, anfitrião e convidado) e monta o resumo de cada partida. */
(function (root) {
  'use strict';
  const KEY = 'dsstacks.profile', MKEY = 'dsstacks.matches';
  const AT = ['pod', 'def', 'int', 'vel'];
  const rd = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const att0 = () => ({ pod: 0, def: 0, int: 0, vel: 0 });
  // sem caracteres parecidos: I/L/1, O/Q/0, S/5, Z/2, B/8, U/V
  const ALPHA = 'ACDEFGHJKMNPRTVWXY3469';
  const UID_RE = /^DS-[ACDEFGHJKMNPRTVWXY3469]{6}$/;
  const mkUid = () => { let x = 'DS-'; for (let i = 0; i < 6; i++) x += ALPHA[Math.floor(Math.random() * ALPHA.length)]; return x; };
  const blank = () => ({ v: 1, uid: mkUid(), name: '', avatar: null, fav: [], since: Date.now(),
    t: { g: 0, w: 0, l: 0, streak: 0, best: 0, disp: 0, dispW: 0, esp: 0, att: att0(), online: { g: 0, w: 0 }, pvb: { g: 0, w: 0 }, pvp: { g: 0, w: 0 }, rounds: 0, dur: 0 },
    cards: {}, mast: {}, ach: {}, daily: {}, weekly: {}, hist: [] });

  let P = null;
  function load() {
    const d = blank(), s = rd(KEY, null); P = d;
    if (s && typeof s === 'object') { Object.assign(d, s); d.t = Object.assign(blank().t, s.t || {}); d.t.att = Object.assign(att0(), (s.t || {}).att || {}); ['online', 'pvb', 'pvp'].forEach(k => { d.t[k] = Object.assign({ g: 0, w: 0 }, (s.t || {})[k] || {}); }); }
    if (!d.uid || !UID_RE.test(d.uid)) d.uid = mkUid();
    return P;
  }
  const profile = () => P || load();
  const changeL = [];
  const save = () => { wr(KEY, profile()); changeL.forEach(f => { try { f(); } catch (e) { } }); };
  const onChange = f => { changeL.push(f); };
  const regenUid = () => { const p = profile(); p.uid = mkUid(); save(); return p.uid; };
  const uid = () => profile().uid;

  // ---------------------------------------------------------------- datas
  const dayKey = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const dayIdx = (d) => { d = d || new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
  const weekKey = (d) => { d = d || new Date(); const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = (x.getUTCDay() + 6) % 7; x.setUTCDate(x.getUTCDate() - day); return dayKey(new Date(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate())); };

  // ---------------------------------------------------------------- desafio do dia
  // my = resumo do jogador humano na partida (ver finish)
  const DAILY = [
    { id: 'int2', texto: 'Vença uma partida ganhando 2 disputas com Inteligência.', ok: m => m.won && m.my.att.int >= 2 },
    { id: 'esp1', texto: 'Vença uma partida usando um especial.', ok: m => m.won && m.my.esp >= 1 },
    { id: 'vd', texto: 'Na mesma partida, ganhe uma disputa com Velocidade e outra com Resistência.', ok: m => m.my.att.vel >= 1 && m.my.att.def >= 1 },
    { id: 'n3', texto: 'Vença uma partida de 3 ou mais jogadores.', ok: m => m.won && m.n >= 3 },
    { id: 'r11', texto: 'Vença uma partida em até 11 rodadas.', ok: m => m.won && m.rounds <= 11 },
    { id: 'd8', texto: 'Ganhe 8 disputas em uma única partida.', ok: m => m.my.disp >= 8 },
    { id: 'esp3', texto: 'Use 3 especiais em uma partida.', ok: m => m.my.esp >= 3 },
    { id: 'hard', texto: 'Vença uma partida contra a CPU no nível Difícil.', ok: m => m.won && m.diff === 'dificil' && m.humans === 1 },
    { id: 'pod2', texto: 'Vença uma partida ganhando 2 disputas com Força.', ok: m => m.won && m.my.att.pod >= 2 },
  ];
  function dailyToday() { const k = dayKey(); const p = profile(); const def = DAILY[dayIdx() % DAILY.length]; if (!p.daily || p.daily.key !== k) { p.daily = { key: k, id: def.id, done: false, streak: (p.daily && p.daily.streak) || 0, last: (p.daily && p.daily.last) || null }; } return Object.assign({}, def, { done: !!p.daily.done, streak: p.daily.streak || 0 }); }

  // ---------------------------------------------------------------- missões da semana
  const WEEKLY = [
    { id: 'w_win', texto: 'Vença 3 partidas', meta: 3, get: t => t.win },
    { id: 'w_esp', texto: 'Use 6 especiais', meta: 6, get: t => t.esp },
    { id: 'w_disp', texto: 'Ganhe 20 disputas', meta: 20, get: t => t.disp },
    { id: 'w_play', texto: 'Jogue 5 partidas', meta: 5, get: t => t.g },
  ];
  function weekly() { const k = weekKey(); const p = profile(); if (!p.weekly || p.weekly.key !== k) p.weekly = { key: k, win: 0, esp: 0, disp: 0, g: 0 }; return WEEKLY.map(w => ({ id: w.id, texto: w.texto, meta: w.meta, val: Math.min(w.meta, w.get(p.weekly) || 0) })); }

  // ---------------------------------------------------------------- conquistas
  // ---------------------------------------------------------------- maestria por carta
  // Reconhecimento e personalização apenas: não altera nenhum atributo nem regra. XP = usos×1 + disputas vencidas×3 + especiais resolvidos×2 (média real ≈ 2,5 XP por uso). Limiares ≈ 5 / 15 / 35 / 85 / 185 usos acumulados.
  const MAST_AT = [12, 38, 88, 210, 460], MAST_NOME = ['Sem emblema', 'Iniciado', 'Veterano', 'Mestre', 'Lenda', 'Dimensional'], MAST_XP = { u: 1, w: 3, s: 2 };
  function masteryOf(id, pr) {
    const p = pr || profile(), m = (p.mast && p.mast[id]) || { u: 0, w: 0, s: 0 }, xp = m.u * MAST_XP.u + m.w * MAST_XP.w + m.s * MAST_XP.s; let lv = 0;
    MAST_AT.forEach((t, i) => { if (xp >= t) lv = i + 1; });
    return { id, xp, lv, u: m.u, w: m.w, s: m.s, from: lv ? MAST_AT[lv - 1] : 0, to: lv < MAST_AT.length ? MAST_AT[lv] : null, nome: MAST_NOME[lv] };
  }
  const masteryList = () => { const p = profile(); return Object.keys(p.mast || {}).map(id => masteryOf(id, p)).filter(m => m.xp > 0).sort((a, b) => b.xp - a.xp); };
  const masteryCount = lv => masteryList().filter(m => m.lv >= lv).length;
  const ACH = [
    { id: 'first_game', nome: 'Primeiro salto', desc: 'Jogue sua primeira partida.', prog: p => [p.t.g, 1] },
    { id: 'first_win', nome: 'Nexo aberto', desc: 'Vença uma partida.', prog: p => [p.t.w, 1] },
    { id: 'wins_5', nome: 'Veterana dimensional', desc: 'Vença 5 partidas.', prog: p => [p.t.w, 5] },
    { id: 'wins_25', nome: 'Campeã do Nexo', desc: 'Vença 25 partidas.', prog: p => [p.t.w, 25] },
    { id: 'streak_3', nome: 'Maré alta', desc: 'Vença 3 partidas seguidas.', prog: p => [p.t.best, 3] },
    { id: 'special_1', nome: 'Faísca especial', desc: 'Use um especial.', prog: p => [p.t.esp, 1] },
    { id: 'special_25', nome: 'Mestre dos especiais', desc: 'Use 25 especiais.', prog: p => [p.t.esp, 25] },
    { id: 'four_win', nome: 'Mesa cheia', desc: 'Vença uma partida com 4 jogadores.', flag: true },
    { id: 'online_play', nome: 'Convite aceito', desc: 'Jogue uma partida online.', prog: p => [p.t.online.g, 1] },
    { id: 'online_win', nome: 'Rival de verdade', desc: 'Vença uma partida contra outra pessoa.', prog: p => [p.t.pvp.w, 1] },
    { id: 'hard_win', nome: 'Domadora de CPUs', desc: 'Vença a CPU no nível Difícil.', flag: true },
    { id: 'attrs_all', nome: 'Quatro dimensões', desc: 'Ganhe disputas com Força, Resistência, Inteligência e Velocidade.', prog: p => [AT.filter(a => p.t.att[a] > 0).length, 4] },
    { id: 'fast_win', nome: 'Relâmpago', desc: 'Vença uma partida em até 9 rodadas.', flag: true },
    { id: 'comeback', nome: 'Virada épica', desc: 'Vença depois de chegar a 3 cartas ou menos.', flag: true },
    { id: 'fav_5', nome: 'Colecionadora', desc: 'Favorite 5 cartas.', prog: p => [p.fav.length, 5] },
    { id: 'cards_30', nome: 'Elenco amplo', desc: 'Jogue com 30 cartas diferentes.', prog: p => [Object.keys(p.used || {}).length, 30] },
    { id: 'mast_1', nome: 'Primeiro emblema', desc: 'Leve uma carta ao nível Iniciado de maestria.', prog: p => [Object.keys(p.mast || {}).filter(id => masteryOf(id, p).lv >= 1).length, 1] },
    { id: 'mast_3', nome: 'Mestre de carta', desc: 'Leve uma carta ao nível Mestre de maestria.', prog: p => [Object.keys(p.mast || {}).filter(id => masteryOf(id, p).lv >= 3).length, 1] },
    { id: 'mast_10', nome: 'Elenco veterano', desc: 'Tenha 10 cartas com emblema de maestria.', prog: p => [Object.keys(p.mast || {}).filter(id => masteryOf(id, p).lv >= 1).length, 10] },
  ];
  function achievements() { const p = profile(); return ACH.map(a => { const pr = a.prog ? a.prog(p) : null; return { id: a.id, nome: a.nome, desc: a.desc, done: !!p.ach[a.id], at: p.ach[a.id] || null, val: pr ? Math.min(pr[0], pr[1]) : (p.ach[a.id] ? 1 : 0), meta: pr ? pr[1] : 1 }; }); }
  function checkAch(m, out) {
    const p = profile(); const got = (id) => { if (!p.ach[id]) { p.ach[id] = Date.now(); const a = ACH.find(x => x.id === id); out.push({ id, nome: a.nome }); } };
    ACH.forEach(a => { if (a.prog && !p.ach[a.id]) { const [v, n] = a.prog(p); if (v >= n) got(a.id); } });
    if (m) {
      if (m.won && m.n >= 4) got('four_win');
      if (m.won && m.diff === 'dificil' && m.humans === 1) got('hard_win');
      if (m.won && m.rounds <= 9) got('fast_win');
      if (m.won && m.my.min <= 3) got('comeback');
    }
  }

  // ---------------------------------------------------------------- favoritos
  function isFav(id) { return profile().fav.includes(id); }
  function toggleFav(id) { const p = profile(); const i = p.fav.indexOf(id); if (i >= 0) p.fav.splice(i, 1); else p.fav.push(id); const out = []; checkAch(null, out); save(); return { fav: i < 0, unlocked: out }; }
  function setName(n) { const p = profile(); p.name = String(n || '').trim().slice(0, 14); save(); }
  function setAvatar(a) { const p = profile(); p.avatar = a; save(); }

  // ---------------------------------------------------------------- registro de partidas
  const listeners = [];
  const onMatch = f => { listeners.push(f); };
  const matches = () => rd(MKEY, []);

  // ctx: { viewer (índice do jogador local ou -1), online, role, humans, n, diff, per, sf, getG }
  function recorder(ctx) {
    const m = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t0: Date.now(), n: ctx.n, humans: ctx.humans, mode: ctx.humans >= 2 ? 'pvp' : ctx.humans === 1 ? 'pvb' : 'bvb', online: !!ctx.online,
      diff: ctx.diff, per: ctx.per, sf: ctx.sf, duo: !!ctx.duo, ev: ctx.ev !== false, v: 1, cards: {}, att: {}, spec: 0, combats: 0, ties: 0, rounds: 1, winner: null, dur: 0, bh: 0, players: [], left: [], first: null };
    const me = { att: att0(), esp: 0, disp: 0, min: 99, used: {}, cards: {} };
    const mc = id => (me.cards[id] = me.cards[id] || { u: 0, w: 0, s: 0 });
    const cd = id => (m.cards[id] = m.cards[id] || { p: 0, w: 0, l: 0, s: 0 });
    const pa = pid => (m.att[pid] = m.att[pid] || att0());
    let done = false; const counted = new Set();
    return {
      m,
      ev(type, data, G) {
        if (done) return; data = data || {};
        try {
          if (type === 'setup' && G) { m.players = G.s.players.map(p => ({ name: p.name, bot: !!p.bot })); }
          else if (type === 'ready' && G) { m.first = G.s.initiator; }
          else if (type === 'combatStart') { counted.clear(); }
          else if (type === 'commit' || type === 'reveal') { (data.combat.entries || []).forEach(e => { if (!e.card || e.card[0] === '?' || counted.has(e.pid)) return; counted.add(e.pid); cd(e.card).p++; if (e.pid === ctx.viewer) { me.used[e.card] = 1; mc(e.card).u++; } }); }   // online: a carta do rival só é conhecida na revelação
          else if (type === 'specialsFlip') { (data.acts || []).forEach(a => { cd(a.card).s++; m.spec++; if (a.pid === ctx.viewer) me.esp++; }); }
          else if (type === 'effectEnd') { const a = data.act; if (a && a.pid === ctx.viewer && !a.forced && a.card && a.card[0] !== '?') mc(a.card).s++; }   // habilidade própria resolvida (não anulada)
          else if (type === 'resolved') {
            m.combats++; const r = data.result || {}; const w = r.winnerPid;
            if (w == null || r.type === 'tie' || r.type === 'none') m.ties++;
            else {
              pa(w)[r.attr]++; if (w === ctx.viewer) { me.att[r.attr]++; me.disp++; }
              (data.combat.entries || []).forEach(e => { if (e.pid === w) { cd(e.card).w++; if (w === ctx.viewer) mc(e.card).w++; } else cd(e.card).l++; });
            }
          }
          else if (type === 'combatEnd' && G && ctx.viewer >= 0) { const p = G.p(ctx.viewer); if (p) me.min = Math.min(me.min, p.deck.length + p.reserve.length + p.prepared.length); }
          else if (type === 'end' && G) {
            done = true; m.dur = Math.round((Date.now() - m.t0) / 1000); m.winner = data.winner == null ? null : data.winner; m.rounds = G.s.round; m.combats = Math.max(m.combats, G.s.combats); m.bh = G.s.bh.length;
            m.left = G.s.players.map(p => p.deck.length + p.reserve.length + p.prepared.length); m.limit = !!G.s.byLimit;
            return finish(m, me, ctx);
          }
        } catch (e) { console.error('stats', e); }
      },
    };
  }

  function finish(m, me, ctx) {
    const out = { ach: [], daily: false, m };
    const summary = { id: m.id, at: m.t0, mode: m.mode, online: m.online, n: m.n, diff: m.diff, per: m.per, rounds: m.rounds, combats: m.combats, dur: m.dur, winner: m.winner, bh: m.bh, spec: m.spec, ties: m.ties, limit: !!m.limit, sf: m.sf, duo: m.duo, ev: m.ev, left: m.left, players: m.players, att: m.att, cards: m.cards, first: m.first, v: m.v };
    // histórico local (resumo enxuto)
    if (ctx.sim) summary.sim = true; out.summary = summary;
    if (!ctx.sim) { const h = matches(); h.push(summary); while (h.length > 60) h.shift(); wr(MKEY, h); }
    if (ctx.viewer >= 0 && ctx.humans >= 1) {
      const p = profile(), t = p.t; const won = m.winner === ctx.viewer;
      t.g++; if (won) { t.w++; t.streak++; t.best = Math.max(t.best, t.streak); } else { t.l++; t.streak = 0; }
      t.disp += me.disp; t.dispW += me.disp; t.esp += me.esp; AT.forEach(a => { t.att[a] += me.att[a]; });
      t.rounds += m.rounds; t.dur += m.dur;
      const md = m.mode === 'pvp' ? t.pvp : t.pvb; md.g++; if (won) md.w++;
      if (m.online) { t.online.g++; if (won) t.online.w++; }
      // uso de cartas do jogador: aproximação pelas cartas que apareceram para ele (todas as disputas)
      Object.keys(m.cards).forEach(id => { const c = p.cards[id] = p.cards[id] || { p: 0, w: 0, l: 0, s: 0 }; c.p += m.cards[id].p; c.w += m.cards[id].w; c.l += m.cards[id].l; c.s += m.cards[id].s; });
      if (!p.weekly || p.weekly.key !== weekKey()) p.weekly = { key: weekKey(), win: 0, esp: 0, disp: 0, g: 0 };
      p.weekly.g++; if (won) p.weekly.win++; p.weekly.esp += me.esp; p.weekly.disp += me.disp;
      const mm = { won, n: m.n, humans: m.humans, diff: m.diff, rounds: m.rounds, my: { att: me.att, esp: me.esp, disp: me.disp, min: me.min } };
      // desafio do dia
      const dl = dailyToday(), def = DAILY.find(x => x.id === dl.id);
      if (!p.daily.done && def && def.ok(mm)) { p.daily.done = true; out.daily = true; const y = dayKey(new Date(Date.now() - 864e5)); p.daily.streak = (p.daily.last === y ? p.daily.streak : 0) + 1; p.daily.last = dayKey(); }
      p.used = p.used || {}; Object.keys(me.used).forEach(id => { p.used[id] = 1; });
      p.mast = p.mast || {}; out.mast = [];
      Object.keys(me.cards).forEach(id => { const m0 = masteryOf(id, p), b = m0.lv, c = p.mast[id] = p.mast[id] || { u: 0, w: 0, s: 0 }; c.u += me.cards[id].u; c.w += me.cards[id].w; c.s += me.cards[id].s; const a = masteryOf(id, p); if (a.lv > b) out.mast.push({ id, from: b, to: a.lv, nome: a.nome }); if (a.xp > m0.xp) (out.xp = out.xp || []).push({ id, a: m0, b: a }); });
      p.hist.push({ at: m.t0, won, mode: m.mode, n: m.n, rounds: m.rounds }); while (p.hist.length > 30) p.hist.shift();
      out.mm = mm; checkAch(mm, out.ach); save(); out.won = won;
    }
    if (!ctx.sim) listeners.forEach(f => { try { f(summary, ctx); } catch (e) { console.error(e); } });
    return out;
  }

  root.DSSTATS = { MAST_AT, MAST_NOME, MAST_XP, mastery: masteryOf, masteryList, masteryCount, uid, regenUid, onChange, profile, save, setName, setAvatar, toggleFav, isFav, achievements, dailyToday, weekly, recorder, matches, onMatch, dayKey, DAILY, ACH, WEEKLY, reset() { const u = P && P.uid; P = blank(); if (u) P.uid = u; save(); wr(MKEY, []); } };
})(typeof window !== 'undefined' ? window : globalThis);
