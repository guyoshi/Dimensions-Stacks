/* Dimensions Stacks — privacidade no online.
   O anfitrião roda o motor e envia a cada convidado uma visão própria: o convidado recebe só as próprias cartas privadas
   (baralho, reserva, preparados, carta na mesa antes da revelação) e, dos adversários, apenas quantidades e o que já foi revelado.
   Cartas ocultas viram o marcador "?" (a carta fechada); a quantidade é preservada. */
(function (root) {
  'use strict';
  const HID = '?', ZERO = { pod: 0, def: 0, int: 0, vel: 0 };

  function plain(v, d) {
    d = d || 0; if (v == null || typeof v === 'function') return v === undefined ? undefined : (typeof v === 'function' ? undefined : v);
    if (typeof v !== 'object') return v; if (d > 4) return undefined;
    if (v instanceof Set) return Array.from(v).map(x => plain(x, d + 1));
    if (Array.isArray(v)) return v.map(x => plain(x, d + 1));
    const o = {}; for (const k in v) { if (k === 'mods' || k === 'g' || k === 'ctx' || k === 'combat') continue; const r = plain(v[k], d + 1); if (r !== undefined) o[k] = r; } return o;
  }

  // G: partida do anfitrião. Guarda o que já foi anunciado na disputa atual (iniciador declarou, cartas reveladas).
  function create(G) {
    const f = { combatOn: false, initAnn: false, revealed: false };
    const note = type => {
      if (type === 'combatStart') { f.combatOn = true; f.initAnn = false; f.revealed = false; } else if (type === 'initiatorAttr') f.initAnn = true; else if (type === 'reveal') f.revealed = true;
    };
    // disputa em formato de rede, completa (sem ocultar nada)
    const serCombat = c => c ? ({ initiator: c.initiator, order: c.order, ev: c.ev || null, specialsAllowed: c.specialsAllowed, ctl: { universal: !!(c.ctl && c.ctl.universal) },
      entries: c.entries.map(e => ({ pid: e.pid, card: e.card, stats: e.stats, evm: e.evm || null, bonus: e.bonus, extra: e.extra, attr: (f.revealed || (f.initAnn && e.pid === c.initiator)) ? e.attr : null, withdrawn: !!e.withdrawn, gone: !!e.gone })) }) : null;
    // antes da revelação, a carta de cada rival na mesa é secreta
    const maskCombat = (c, r) => (!c || f.revealed) ? c : Object.assign({}, c, { entries: c.entries.map(e => e.pid === r ? e : Object.assign({}, e, { card: HID, stats: ZERO, evm: null, bonus: 0, extra: (e.extra || []).map(() => HID) })) });
    const cb = (c, r) => maskCombat(serCombat(c), r);
    const serEvent = (type, data) => {
      const o = {}; for (const k in data) { const v = data[k];
        if (k === 'combat') o.combat = serCombat(v); else if (k === 'usable' || k === 'ctx') continue;
        else if (k === 'act') o.act = { pid: v.pid, card: v.card, forced: !!v.forced };
        else if (k === 'acts') o.acts = v.map(a => ({ pid: a.pid, card: a.card, forced: !!a.forced }));
        else if (k === 'spec') o.spec = { nome: v.nome, texto: v.texto };
        else { const r = plain(v); if (r !== undefined) o[k] = r; } }
      if (type === 'prepare') delete o.card; return o;
    };
    // evento visto pelo jogador r
    const ev = (type, data, r) => {
      const o = serEvent(type, data);
      if (o.combat) o.combat = maskCombat(o.combat, r);
      if (type === 'resolved' && o.calc && !f.revealed) o.calc = Object.assign({}, o.calc, { rows: o.calc.rows.map(w => w.pid === r ? w : Object.assign({}, w, { card: HID, attr: null, base: null, parts: [], extra: [], bonus: 0, total: null, statsAfter: null, sum4: 0 })) });
      if (type === 'steal' && o.from !== r && o.to !== r) o.card = HID;
      else if (type === 'eventFx' && o.moves) o.moves = o.moves.map(m => (m.from === r || m.to === r) ? m : Object.assign({}, m, { card: HID }));
      else if (type === 'refill' && o.pid !== r && o.cards) o.cards = o.cards.map(() => HID);
      else if (type === 'extra' && !f.revealed && o.pid !== r) o.card = HID;
      else if (type === 'swapCard' && !f.revealed && o.pid !== r) { o.card = HID; o.old = HID; }
      return o;
    };
    // estado da mesa visto por r: dos outros só as quantidades
    const mates = (r, q) => !!(G.teams && G.teams.some(t => t.includes(r) && t.includes(q)));   // duplas: o parceiro vê baralho, reserva e especiais preparados
    const state = r => ({ players: G.s.players.map(p => { const own = p.pid === r || mates(r, p.pid), h = a => own ? a.slice() : a.map(() => HID);
        return { pid: p.pid, name: p.name, bot: p.bot, avatar: p.avatar, alive: p.alive, deck: h(p.deck), reserve: h(p.reserve), prepared: h(p.prepared) }; }),
      bh: G.s.bh.map(x => x.kind === 'normal' ? x.id : x.id + ':' + x.kind), round: G.s.round, events: G.s.events || {}, away: G.s.away || [], combats: G.s.combats, initiator: G.s.initiator, over: G.s.over, winner: G.s.winner, winnerTeam: G.s.winnerTeam, byLimit: G.s.byLimit });
    // escolha de cartas às cegas: os ids viram posições ("?0", "?1"…) e a resposta volta ao id real
    const blind = spec => { const map = {}; const cards = spec.cards.map((c, i) => { map[HID + i] = c; return HID + i; }); return { spec: Object.assign({}, spec, { cards }), map }; };
    return { f, note, serCombat, cb, ev, state, blind };
  }
  root.DSPriv = { HID, plain, create };
})(typeof window !== 'undefined' ? window : globalThis);
