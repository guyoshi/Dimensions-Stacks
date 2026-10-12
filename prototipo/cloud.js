/* Dimensions Stacks — perfil público na nuvem: cada jogador tem um ID próprio (DS-XXXXXX) e pode ser achado por ele ou pelo nome.
   Usa a capability db (coleção "players", um documento por pessoa, chave = id da conta) e depende do claude.ai; fora dele, o ID continua existindo localmente. */
(function () {
  'use strict';
  const U = window.DSUI, ST = window.DSSTATS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let C = null;
  async function caps() {
    if (C) return C; C = { db: null, me: null };
    const cl = window.claude; if (!cl || !cl.use) return C;
    try { const [db, user] = await Promise.all([cl.use('db'), cl.use('user')]); C.db = db; C.me = user ? await user.id() : null; } catch (e) { }
    if (!C.me) C.db = null; return C;
  }
  const pub = () => { const p = ST.profile(), t = p.t; return { code: p.uid, name: p.name || '', nameLc: (p.name || '').toLowerCase(), avatar: p.avatar || null, g: t.g, w: t.w, best: t.best, ach: Object.keys(p.ach || {}).length, at: Date.now() }; };
  let timer = null, busy = false;
  async function sync() {
    const c = await caps(); if (!c.db || busy) return; busy = true;
    try {
      const col = c.db.collection('players');
      for (let k = 0; k < 4; k++) { const q = await col.where('code', '==', ST.uid()).get(); if (q.docs.some(d => d.id !== c.me)) ST.regenUid(); else break; }
      if (ST.profile().name) await col.doc(c.me).set(pub());
    } catch (e) { console.warn('players', e && e.code || e); }
    busy = false;
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(sync, 2500); };
  ST.onChange(later); later();

  U.findHook = function (host) {
    host.innerHTML = `<div class="row"><input type="text" class="txtin" id="fq" maxlength="20" placeholder="ID (DS-XXXXXX) ou nome exato" autocomplete="off"><button class="btn" id="fgo">Buscar</button></div><div id="fout"></div>`;
    const out = host.querySelector('#fout'), inp = host.querySelector('#fq');
    const go = async () => {
      const q = inp.value.trim(); if (!q) return; const c = await caps();
      if (!c.db) { out.innerHTML = '<p class="hint">Busca indisponível aqui (só ao abrir pelo claude.ai, logado).</p>'; return; }
      out.innerHTML = '<p class="hint">Buscando…</p>';
      try {
        const col = c.db.collection('players'); const seen = new Map();
        const up = q.toUpperCase().replace(/\s+/g, '');
        for (const qq of [col.where('code', '==', up), col.where('nameLc', '==', q.toLowerCase())]) { (await qq.limit(10).get()).docs.forEach(d => seen.set(d.id, d.data())); }
        const L = Array.from(seen.entries());
        out.innerHTML = L.length ? L.map(([id, d]) => `<div class="fres">${U.avatarHTML ? U.avatarHTML(d.avatar, d.name || '?', 44) : ''}<div class="ft"><b>${esc(d.name || 'Sem nome')}${id === c.me ? ' <span class="pill me">você</span>' : ''}</b><small>${esc(d.code)} · ${d.w || 0} vitória${d.w === 1 ? '' : 's'} em ${d.g || 0} partida${d.g === 1 ? '' : 's'} · ${d.ach || 0} conquistas</small></div></div>`).join('') : '<p class="hint">Ninguém encontrado. Confira o ID (o outro jogador precisa ter aberto o jogo e definido um nome).</p>';
      } catch (e) { out.innerHTML = '<p class="hint">Não foi possível buscar agora.</p>'; }
    };
    host.querySelector('#fgo').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
  };
})();
