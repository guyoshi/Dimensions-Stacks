/* Dimensions Stacks — desafios relâmpago do Boss final (3 a 5 s).
   DSBossMini.play(kind) → Promise<boolean>   kind: 'asteroides' | 'elos' | 'luas' (sorteado por DSBossMini.sorteia())
   DSBossMini.salvar(cardId) → Promise<boolean>   (Fase 3: toque 6 vezes no orbe em 3 s para salvar a carta da União) */
(function () {
  'use strict';
  const U = window.DSUI; if (!U) return;
  const mk = h => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstElementChild; };
  const rnd = n => Math.floor(Math.random() * n);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const NOMES = { asteroides: ['Chuva de asteroides', 'Toque na faixa para desviar'], elos: ['Elos', 'Memorize e repita os 3 símbolos'], luas: ['Duas luas', 'Toque quando as luas se alinharem'] };
  const sorteia = () => ['asteroides', 'elos', 'luas'][rnd(3)];
  function caixa(titulo, sub, seg) {
    const ov = mk(`<div class="bm-ov"><div class="bm-box"><b class="bm-t">${titulo}</b><small class="bm-s">${sub}</small><div class="bm-area"></div><div class="bm-bar"><i style="transition-duration:${seg}s"></i></div><div class="bm-res"></div></div></div>`);
    document.body.appendChild(ov); requestAnimationFrame(() => requestAnimationFrame(() => { const i = ov.querySelector('.bm-bar i'); if (i) i.style.width = '0%'; }));
    return ov;
  }
  async function fecha(ov, ok) {
    const r = ov.querySelector('.bm-res'); r.textContent = ok ? 'Acertou! +10' : 'Falhou! −10'; r.className = 'bm-res ' + (ok ? 'ok' : 'no');
    try { U.SND.play(ok ? 'capture' : 'tick'); } catch (e) { }
    await wait(650); ov.remove();
  }
  // ---- Chuva de asteroides: 3 faixas, 3 a 4 pedras caem; tocar numa faixa move a nave para lá
  function asteroides(area, fim, seg) {
    area.innerHTML = '<div class="bm-ast"><div class="bm-lane"></div><div class="bm-lane"></div><div class="bm-lane"></div></div>';
    const box = area.firstElementChild, W = () => box.clientWidth, H = 150; box.style.height = H + 'px';
    let lane = 1, vivo = true; const ship = mk('<div class="bm-ship">▲</div>'); box.append(ship);
    const place = () => { ship.style.left = (lane + .5) * W() / 3 + 'px'; }; place();
    box.onpointerdown = e => { const r = box.getBoundingClientRect(); lane = Math.max(0, Math.min(2, Math.floor((e.clientX - r.left) / (r.width / 3)))); place(); };
    const rocks = []; const n = 4; for (let i = 0; i < n; i++) { const el = mk('<div class="bm-rock">●</div>'); box.append(el); rocks.push({ el, lane: rnd(3), t0: 350 + i * (seg * 1000 - 1400) / n + rnd(120), dur: 900 }); }
    rocks[0].lane = 1;   // a primeira cai na faixa da nave: obriga a reagir
    const t0 = performance.now(); let raf;
    const loop = () => { const t = performance.now() - t0; let hit = false;
      rocks.forEach(r => { const k = (t - r.t0) / r.dur; if (k < 0 || k > 1.1) { r.el.style.display = k < 0 ? 'none' : 'none'; return; } r.el.style.display = 'block'; r.el.style.left = (r.lane + .5) * W() / 3 + 'px'; r.el.style.top = k * (H - 18) + 'px'; if (r.lane === lane && k > .78 && k < .98) hit = true; });
      if (hit && vivo) { vivo = false; cancelAnimationFrame(raf); return fim(false); }
      if (t >= seg * 1000) return fim(true); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  // ---- Elos: mostra 3 símbolos em sequência; repita tocando nos botões
  function elos(area, fim, seg) {
    const S = ['◆', '●', '▲', '■'], seq = [rnd(4), rnd(4), rnd(4)];
    area.innerHTML = '<div class="bm-elos"><div class="bm-show">…</div><div class="bm-pad">' + S.map((s, i) => `<button class="bm-k" data-i="${i}" disabled>${s}</button>`).join('') + '</div></div>';
    const show = area.querySelector('.bm-show'), ks = [...area.querySelectorAll('.bm-k')]; let pos = 0, fase = 0;
    (async () => { for (const i of seq) { show.textContent = S[i]; show.classList.add('on'); await wait(380); show.classList.remove('on'); show.textContent = ''; await wait(150); } show.textContent = 'repita'; ks.forEach(k => { k.disabled = false; }); fase = 1; })();
    area.onclick = e => { const k = e.target.closest('.bm-k'); if (!k || !fase) return; const i = +k.dataset.i; if (i !== seq[pos]) { fase = 0; return fim(false); } pos++; show.textContent = '✓'.repeat(pos); if (pos >= seq.length) { fase = 0; fim(true); } };
    setTimeout(() => { if (fase !== 2) { fase = 0; fim(false); } }, seg * 1000);
  }
  // ---- Duas luas: toque quando estiverem alinhadas
  function luas(area, fim, seg) {
    area.innerHTML = '<div class="bm-luas"><div class="bm-moon a"></div><div class="bm-moon b"></div><button class="bm-go">Alinhar</button></div>';
    const box = area.firstElementChild, a = box.querySelector('.a'), b = box.querySelector('.b'), w1 = 3.1 + Math.random() * .8, w2 = 4.9 + Math.random() * 1.2, ph = Math.random() * 6;
    const t0 = performance.now(); let raf, fim_ = false;
    const pos = t => { const W = box.clientWidth - 36; return [(.5 + .5 * Math.sin(t * w1)) * W, (.5 + .5 * Math.sin(t * w2 + ph)) * W]; };
    const loop = () => { const t = (performance.now() - t0) / 1000, [x, y] = pos(t); a.style.left = x + 'px'; b.style.left = y + 'px'; if (t >= seg) { if (!fim_) { fim_ = true; fim(false); } return; } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    box.querySelector('.bm-go').onclick = () => { if (fim_) return; fim_ = true; cancelAnimationFrame(raf); const [x, y] = pos((performance.now() - t0) / 1000); fim(Math.abs(x - y) < 22); };
  }
  const JOGOS = { asteroides, elos, luas };
  async function play(kind) {
    kind = kind || sorteia(); const seg = kind === 'elos' ? 5 : 3.8, [t, s] = NOMES[kind], ov = caixa(t, s, seg), area = ov.querySelector('.bm-area');
    const ok = await new Promise(res => { let done = false; const fim = v => { if (done) return; done = true; res(v); }; JOGOS[kind](area, fim, seg); setTimeout(() => fim(false), seg * 1000 + 400); });
    await fecha(ov, ok); return ok;
  }
  async function salvar(cardId) {
    const c = U.CARDS && U.CARDS[cardId], ov = caixa('Buraco negro!', (c ? c.nome : 'Uma carta da União') + ' está sendo puxada: toque no orbe 6 vezes', 3);
    const area = ov.querySelector('.bm-area'); area.innerHTML = '<div class="bm-orb"><b>0</b>/6</div>';
    const ok = await new Promise(res => { let n = 0, done = false; const orb = area.firstElementChild;
      orb.onpointerdown = () => { if (done) return; n++; orb.querySelector('b').textContent = n; orb.classList.add('hit'); setTimeout(() => orb.classList.remove('hit'), 80); try { U.SND.play('tick'); } catch (e) { } if (n >= 6) { done = true; res(true); } };
      setTimeout(() => { if (!done) { done = true; res(false); } }, 3000); });
    const r = ov.querySelector('.bm-res'); r.textContent = ok ? 'Carta salva!' : 'Carta perdida'; r.className = 'bm-res ' + (ok ? 'ok' : 'no'); await wait(700); ov.remove(); return ok;
  }
  window.DSBossMini = { play, salvar, sorteia };
})();
