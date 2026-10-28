/* Dimensions Stacks — cinemática do modo história: fundo preto, imagens que entram devagar, texto digitado, avançar por toque.
   Dados em historia_cena.js (window.DS_CINEMATICA). Uso: DSCinema.play(() => ...) chama o callback ao terminar ou ao pular. */
(function () {
  'use strict';
  const U = window.DSUI; if (!U) return;
  const { SND } = U;
  const reduce = () => document.body.classList.contains('reduce');
  function play(done, data) {
    const D = data || window.DS_CINEMATICA; if (!D || !D.cenas || !D.cenas.length) { done && done(); return; }
    const ov = document.createElement('div'); ov.className = 'cin'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Introdução');
    ov.innerHTML = '<div class="cin-img a"></div><div class="cin-img b"></div><div class="cin-shade"></div><div class="cin-txt"><p></p><i class="cin-next" aria-hidden="true">▾</i></div><button class="cin-skip" type="button">Pular ›</button><div class="cin-bar"><b></b></div>';
    document.body.appendChild(ov);
    const layers = [ov.querySelector('.a'), ov.querySelector('.b')], P = ov.querySelector('.cin-txt p'), nx = ov.querySelector('.cin-next'), bar = ov.querySelector('.cin-bar b');
    const total = D.cenas.reduce((s, c) => s + (c.textos || ['']).length, 0);
    let ci = -1, ti = 0, vez = 0, digit = null, pronto = false, fim = false, feitos = 0, imgAtual = undefined;
    try { if (SND.histPlay && D.musica) SND.histPlay(D.musica); } catch (e) { }
    function fecha(pulou) {
      if (fim) return; fim = true; clearInterval(digit); document.removeEventListener('keydown', key, true);
      ov.classList.add('out'); setTimeout(() => { ov.remove(); done && done(pulou); }, reduce() ? 30 : 700);
    }
    function mostraImg(c) {
      if (c.img === imgAtual && c.cor === undefined) return; imgAtual = c.img;
      const nova = layers[vez ^= 1], velha = layers[vez ^ 1];
      nova.style.background = c.img ? `${c.cor || '#000'} url(${c.img}) ${c.pos || 'center'} / cover no-repeat` : (c.cor || '#000');
      nova.className = 'cin-img ' + (vez ? 'b' : 'a') + ' ' + (c.img ? 'mov-' + (c.mov || 'zoom') : '') + ' in';
      velha.classList.remove('in');
    }
    function fala(txt, tom) {
      clearInterval(digit); pronto = false; nx.classList.remove('on'); P.className = 'tom-' + (tom || 'narr'); P.textContent = '';
      const cs = [...txt]; let i = 0;
      const termina = () => { clearInterval(digit); P.textContent = txt; pronto = true; nx.classList.add('on'); };
      if (reduce()) { termina(); return; }
      const sp = tom === 'grito' ? 55 : 32;
      digit = setInterval(() => { i++; P.textContent = cs.slice(0, i).join(''); if (i % 3 === 0) { try { SND.play('tick'); } catch (e) { } } if (i >= cs.length) termina(); }, sp);
    }
    function avanca() {
      if (fim) return;
      if (!pronto && ci >= 0) { clearInterval(digit); const c = D.cenas[ci]; P.textContent = c.textos[ti]; pronto = true; nx.classList.add('on'); return; }
      const c0 = D.cenas[ci];
      if (c0 && ti + 1 < c0.textos.length) { ti++; feitos++; }
      else { ci++; ti = 0; if (ci >= D.cenas.length) { fecha(false); return; } if (c0) feitos++; mostraImg(D.cenas[ci]); }
      bar.style.width = Math.min(100, feitos / total * 100) + '%';
      const c = D.cenas[ci]; fala(c.textos[ti], c.tom);
    }
    function key(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); avanca(); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fecha(true); } }
    document.addEventListener('keydown', key, true);
    ov.addEventListener('click', e => { if (e.target.closest('.cin-skip')) { fecha(true); return; } avanca(); });
    setTimeout(avanca, reduce() ? 0 : 900);       // começa no preto, um instante de silêncio
  }
  window.DSCinema = { play };
})();
