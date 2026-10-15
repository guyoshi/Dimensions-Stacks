/* Dimensions Stacks — 5 versões de cada efeito sonoro, para escolher no Painel do Administrador (Sons do jogo).
   Versão 1 = som original (SND.synth); 2 = Cristal (sinos, agudo, limpo); 3 = Orgânico (madeira, papel, couro, tambor);
   4 = Neon (sintético, ficção científica); 5 = Épico (grave, cinematográfico).
   A escolha gravada fica em localStorage ('dsstacks.sfx') e vale como som oficial; as versões não escolhidas podem ser removidas depois. */
(function (root) {
  'use strict';
  const S = root.Sound; if (!S) return;
  const T = (...a) => S.tone(...a), N = (...a) => S.noise(...a), nt = n => S.note(n);
  const seq = (notes, step, fn) => notes.forEach((n, i) => fn(n, i * step, i));
  const V = {
    click: [
      () => { T(nt(96), .09, 'sine', .12); T(nt(103), .12, 'sine', .05, .01); },
      () => { N(.03, 'bandpass', 1800, 900, .22, 0, 3); T(200, .04, 'triangle', .12, 0, 120); },
      () => { T(1500, .04, 'square', .05, 0, 2200); T(2200, .03, 'square', .04, .03); },
      () => { T(120, .09, 'sine', .3, 0, 70); N(.04, 'lowpass', 1500, 400, .14); },
    ],
    tick: [
      () => T(nt(100), .05, 'sine', .05),
      () => N(.02, 'bandpass', 2500, 1800, .1, 0, 4),
      () => T(2600, .025, 'square', .03),
      () => T(220, .04, 'triangle', .07, 0, 150),
    ],
    banner: [
      () => { seq([84, 88, 91], .08, (n, t) => T(nt(n), .5, 'sine', .07, t)); N(.3, 'highpass', 6000, 9000, .03); },
      () => { N(.3, 'bandpass', 400, 1500, .08, 0, 1.5); T(nt(67), .3, 'triangle', .08, .05); T(nt(72), .4, 'triangle', .07, .14); },
      () => { T(300, .35, 'sawtooth', .05, 0, 1800); T(1800, .1, 'square', .04, .33); },
      () => { T(nt(48), .6, 'sawtooth', .07, 0, nt(55)); T(nt(60), .7, 'triangle', .08, .04); T(nt(67), .7, 'triangle', .07, .12); },
    ],
    phenom: [
      () => { seq([88, 91, 95, 100, 103], .1, (n, t) => T(nt(n), 1.2, 'sine', .06, t)); T(nt(52), 1.4, 'sine', .18, 0, nt(47)); },
      () => { T(60, 1.0, 'sine', .35, 0, 40); N(.9, 'lowpass', 500, 100, .25); T(110, .5, 'triangle', .1, .2, 70); },
      () => { T(100, 1.2, 'sawtooth', .09, 0, 1500); T(nt(76), .9, 'square', .04, .5); N(.8, 'bandpass', 200, 6000, .1, 0, 2); },
      () => { T(nt(36), 1.8, 'sine', .3, 0, nt(33)); seq([48, 55, 60, 64], .05, (n, t) => T(nt(n), 1.4, 'sawtooth', .045, t)); N(1, 'bandpass', 200, 3000, .1, 0, 1); },
    ],
    deal: [
      () => { T(nt(100), .1, 'sine', .1, 0, nt(95)); N(.04, 'highpass', 5000, 7000, .06); },
      () => { N(.08, 'lowpass', 3000, 1200, .2); T(90, .07, 'triangle', .12, 0, 60); },
      () => { T(900, .08, 'square', .05, 0, 300); N(.05, 'highpass', 4000, 8000, .08); },
      () => { N(.1, 'lowpass', 1800, 500, .22); T(80, .12, 'sine', .3, 0, 45); },
    ],
    place: [
      () => { T(nt(72), .3, 'sine', .14); T(nt(79), .25, 'sine', .06, .01); N(.04, 'highpass', 6000, 8000, .05); },
      () => { N(.1, 'lowpass', 1200, 300, .3); T(70, .14, 'sine', .35, 0, 45); },
      () => { T(300, .12, 'square', .07, 0, 80); T(1200, .05, 'sawtooth', .05, 0, 300); },
      () => { T(55, .35, 'sine', .45, 0, 35); N(.2, 'lowpass', 900, 150, .3); T(nt(48), .3, 'triangle', .08); },
    ],
    flip: [
      () => { T(nt(88), .25, 'sine', .08, 0, nt(95)); N(.12, 'highpass', 5000, 9000, .06); },
      () => { N(.14, 'bandpass', 500, 2500, .22, 0, 1.5); N(.05, 'lowpass', 1500, 600, .15, .12); },
      () => { T(300, .2, 'sawtooth', .06, 0, 2400); T(2400, .06, 'square', .04, .2); },
      () => { N(.2, 'bandpass', 300, 3000, .2, 0, 2); T(100, .2, 'sine', .2, .05, 60); T(nt(79), .3, 'triangle', .06, .12); },
    ],
    suspense: [
      () => { [0, .5, .95, 1.35, 1.7, 2, 2.25, 2.5, 2.7].forEach(t => T(70, .15, 'sine', .25, t, 45)); seq([79, 81, 83, 85, 87, 89, 91, 93], .35, (n, t) => T(nt(n), .5, 'sine', .05, t)); },
      () => { [0, .7, 1.3, 1.8, 2.2, 2.55, 2.85].forEach(t => { T(60, .14, 'sine', .45, t, 40); T(60, .12, 'sine', .3, t + .16, 40); }); N(2.8, 'lowpass', 200, 900, .05); },
      () => { T(80, 2.9, 'sawtooth', .08, 0, 1400); [0, .6, 1.1, 1.5, 1.85, 2.15, 2.4, 2.6, 2.78].forEach(t => T(800, .05, 'square', .04, t)); },
      () => { T(nt(33), 2.9, 'sawtooth', .1, 0, nt(45)); [0, .8, 1.5, 2.05, 2.5, 2.85].forEach(t => T(70, .3, 'sine', .4, t, 45)); N(2.8, 'bandpass', 200, 2500, .07); },
    ],
    reveal: [
      () => { T(nt(72), .6, 'sine', .12); T(nt(84), .8, 'sine', .08, .02); N(.4, 'highpass', 6000, 10000, .05); },
      () => { T(70, .4, 'sine', .4, 0, 40); N(.25, 'lowpass', 2500, 500, .2); },
      () => { T(200, .4, 'sawtooth', .08, 0, 1800); T(60, .4, 'sine', .3, .3, 40); },
      () => { T(nt(36), .8, 'sine', .4, 0, nt(31)); T(nt(60), .7, 'sawtooth', .06, .02); N(.5, 'bandpass', 800, 5000, .12, 0, 1.5); },
    ],
    win: [
      () => seq([84, 88, 91, 96], .07, (n, t) => T(nt(n), .5, 'sine', .12, t)),
      () => { T(nt(72), .2, 'triangle', .18); T(nt(79), .3, 'triangle', .18, .1); N(.05, 'bandpass', 2500, 2000, .1); },
      () => seq([72, 76, 79, 84], .06, (n, t) => T(nt(n), .12, 'square', .06, t)),
      () => { [60, 67, 72].forEach(n => T(nt(n), .9, 'sawtooth', .06)); T(nt(48), 1, 'sine', .2); N(.3, 'highpass', 3000, 8000, .05, .02); },
    ],
    lose: [
      () => { T(nt(70), .5, 'sine', .12, 0, nt(60)); T(nt(63), .7, 'sine', .1, .15, nt(55)); },
      () => { T(150, .3, 'triangle', .2, 0, 80); N(.15, 'lowpass', 800, 200, .18); },
      () => { T(600, .4, 'sawtooth', .08, 0, 80); T(100, .4, 'square', .05, 0, 50); },
      () => { T(nt(45), .9, 'sawtooth', .1, 0, nt(38)); T(nt(52), 1, 'sine', .15, .1, nt(45)); },
    ],
    capture: [
      () => { seq([79, 84, 88], .1, (n, t) => T(nt(n), .4, 'sine', .1, t)); N(.3, 'highpass', 5000, 9000, .05); },
      () => { N(.25, 'bandpass', 600, 2000, .22, 0, 2); T(100, .2, 'triangle', .2, .2, 60); T(nt(76), .3, 'triangle', .1, .25); },
      () => { T(1500, .25, 'sawtooth', .07, 0, 300); T(nt(88), .2, 'square', .05, .22); T(nt(95), .3, 'square', .05, .3); },
      () => { T(nt(43), .6, 'sawtooth', .12, 0, nt(50)); N(.4, 'bandpass', 300, 3000, .18, 0, 2); T(nt(67), .5, 'triangle', .1, .2); },
    ],
    blackhole: [
      () => { T(nt(88), 1.2, 'sine', .1, 0, nt(40)); T(nt(95), 1.2, 'sine', .06, 0, nt(45)); N(1, 'highpass', 6000, 500, .05); },
      () => { N(1, 'lowpass', 900, 60, .3); T(80, 1, 'sine', .4, 0, 30); },
      () => { T(1800, 1.0, 'sawtooth', .08, 0, 40); T(900, 1.0, 'square', .04, 0, 30); N(.9, 'bandpass', 4000, 200, .12, 0, 3); },
      () => { T(nt(40), 1.4, 'sine', .35, 0, nt(28)); T(nt(52), 1.2, 'sawtooth', .08, 0, nt(30)); N(1.2, 'lowpass', 1000, 50, .28); },
    ],
    special: [
      () => { seq([91, 95, 98], .06, (n, t) => T(nt(n), .5, 'sine', .07, t)); N(.3, 'highpass', 7000, 10000, .04); },
      () => { N(.12, 'bandpass', 1200, 2400, .15, 0, 3); T(nt(70), .2, 'triangle', .1, .08); },
      () => { T(500, .25, 'sawtooth', .06, 0, 1800); T(1800, .08, 'square', .04, .25); },
      () => { seq([55, 62, 67], .08, (n, t) => T(nt(n), .8, 'triangle', .08, t)); T(nt(43), .8, 'sine', .2); },
    ],
    legend: [
      () => { seq([91, 95, 98, 103, 107], .08, (n, t) => T(nt(n), 1, 'sine', .08, t)); N(.8, 'highpass', 7000, 11000, .04); },
      () => { T(nt(48), .8, 'sine', .3); seq([60, 64, 67], .05, (n, t) => T(nt(n), .9, 'triangle', .1, t)); N(.3, 'bandpass', 2000, 4000, .08); },
      () => { seq([60, 67, 72, 79, 84, 91], .06, (n, t) => T(nt(n), .3, 'sawtooth', .05, t)); T(nt(36), .9, 'sine', .2); },
      () => { seq([48, 55, 60, 64, 67, 72], .07, (n, t) => T(nt(n), 1.5, 'sawtooth', .045, t)); T(nt(36), 1.6, 'sine', .3); N(1, 'highpass', 3000, 9000, .06, .1); },
    ],
    specialFlip: [
      () => { T(nt(72), .9, 'sine', .1, 0, nt(96)); seq([91, 95], .05, (n, t) => T(nt(n), .9, 'sine', .07, .3 + t)); },
      () => { N(.5, 'bandpass', 500, 4000, .2, 0, 2); T(80, .4, 'sine', .35, .35, 45); },
      () => { T(150, .8, 'sawtooth', .09, 0, 2500); T(nt(91), .5, 'square', .05, .5); N(.6, 'highpass', 3000, 9000, .08, .2); },
      () => { T(nt(36), 1, 'sine', .3, 0, nt(60)); N(.9, 'bandpass', 300, 6000, .14, 0, 3); seq([60, 67, 72], .04, (n, t) => T(nt(n), .9, 'sawtooth', .05, .55 + t)); },
    ],
    slash: [
      () => { T(nt(100), .2, 'sine', .08, 0, nt(80)); N(.12, 'highpass', 6000, 10000, .1); },
      () => { N(.14, 'bandpass', 900, 3500, .3, 0, 1.5); T(200, .1, 'triangle', .1, 0, 80); },
      () => { T(2000, .15, 'sawtooth', .07, 0, 200); N(.1, 'highpass', 5000, 9000, .18); },
      () => { N(.25, 'bandpass', 600, 5000, .3, 0, 2); T(nt(43), .25, 'sawtooth', .1, 0, nt(36)); },
    ],
    shield: [
      () => { seq([88, 95], .02, (n, t) => T(nt(n), .8, 'sine', .09, t)); N(.08, 'highpass', 7000, 9000, .1); },
      () => { T(120, .2, 'triangle', .25, 0, 90); N(.08, 'bandpass', 1500, 800, .2); T(nt(67), .3, 'triangle', .08, .03); },
      () => { T(1000, .3, 'square', .06, 0, 700); T(1500, .4, 'sawtooth', .04, 0, 1000); N(.1, 'highpass', 6000, 9000, .12); },
      () => { T(nt(48), .6, 'sawtooth', .1); T(nt(55), .8, 'triangle', .1); T(330, .5, 'square', .05, 0, 300); N(.15, 'bandpass', 2000, 1000, .2, 0, 3); },
    ],
    round: [
      () => { seq([72, 79, 84], .12, (n, t) => T(nt(n), 1.2, 'sine', .08, t)); N(.3, 'highpass', 6000, 9000, .03); },
      () => { T(100, .5, 'sine', .35, 0, 60); T(100, .5, 'sine', .3, .3, 60); N(.3, 'lowpass', 600, 150, .1); },
      () => { [220, 330, 440].forEach((f, i) => T(f, .4, 'square', .05, i * .1, f * 2)); },
      () => { [48, 55, 60, 64].forEach(n => T(nt(n), 2, 'sawtooth', .05)); T(nt(36), 2, 'sine', .25); },
    ],
    refill: [
      () => seq([88, 90, 92], .08, (n, t) => T(nt(n), .15, 'sine', .07, t)),
      () => [0, 1, 2].forEach(i => { N(.05, 'lowpass', 2800, 1200, .16, i * .08); T(90 + i * 10, .08, 'triangle', .1, i * .08); }),
      () => [0, 1, 2].forEach(i => T(800 + i * 300, .06, 'square', .04, i * .07)),
      () => [0, 1, 2].forEach(i => { N(.07, 'lowpass', 2000, 600, .18, i * .1); T(70 + i * 8, .1, 'sine', .25, i * .1); }),
    ],
    elim: [
      () => { T(nt(79), 1, 'sine', .1, 0, nt(60)); T(nt(72), 1.2, 'sine', .08, .1, nt(55)); },
      () => { N(1, 'lowpass', 500, 60, .3); T(70, 1, 'sine', .35, 0, 35); },
      () => { T(1200, 1.2, 'sawtooth', .07, 0, 50); N(1, 'bandpass', 3000, 100, .1, 0, 2); },
      () => { T(nt(40), 1.6, 'sawtooth', .12, 0, nt(30)); T(nt(47), 1.6, 'sine', .2, .1, nt(33)); N(1.3, 'lowpass', 700, 50, .2); },
    ],
    victory: [
      () => { seq([84, 88, 91, 96, 100], .14, (n, t) => T(nt(n), .6, 'sine', .1, t)); [72, 76, 79].forEach(n => T(nt(n), 2.2, 'sine', .05, .7)); },
      () => { seq([67, 72, 76, 79, 84], .14, (n, t) => { T(nt(n), .4, 'triangle', .18, t); T(nt(n + 12), .25, 'sine', .05, t); }); T(nt(60), 1.6, 'sine', .12, .7); },
      () => { seq([72, 76, 79, 84, 79, 84, 88, 91], .1, (n, t) => T(nt(n), .14, 'square', .06, t)); T(nt(60), 1.2, 'sawtooth', .05, .8); },
      () => { seq([55, 60, 64, 67, 72], .2, (n, t) => { T(nt(n), .7, 'sawtooth', .07, t); T(nt(n - 12), .7, 'sine', .1, t); }); [60, 64, 67, 72].forEach(n => T(nt(n), 2.4, 'sawtooth', .05, 1.1)); N(1, 'highpass', 4000, 9000, .05, 1.1); },
    ],
    defeat: [
      () => seq([76, 72, 67, 64], .3, (n, t) => T(nt(n), .9, 'sine', .1, t, nt(n - 1))),
      () => { seq([57, 53, 50, 45], .3, (n, t) => T(nt(n), .8, 'triangle', .14, t)); N(.5, 'lowpass', 500, 100, .08, .9); },
      () => seq([72, 67, 62, 55], .25, (n, t) => T(nt(n), .5, 'square', .05, t, nt(n - 3))),
      () => seq([50, 47, 43, 38], .35, (n, t) => { T(nt(n), 1.2, 'sawtooth', .08, t, nt(n - 1)); T(nt(n - 12), 1.2, 'sine', .14, t); }),
    ],
    steal: [
      () => { T(nt(95), .2, 'sine', .08, 0, nt(84)); N(.15, 'highpass', 6000, 9000, .06); },
      () => { N(.2, 'bandpass', 2500, 600, .2, 0, 2); T(nt(64), .12, 'triangle', .08, .05); },
      () => { T(1500, .2, 'sawtooth', .06, 0, 300); T(400, .1, 'square', .04, .15, 800); },
      () => { N(.25, 'bandpass', 2000, 400, .22, 0, 2); T(nt(52), .3, 'sawtooth', .09, 0, nt(45)); },
    ],
    bonus: [
      () => seq([91, 98], .08, (n, t) => T(nt(n), .3, 'sine', .09, t)),
      () => { T(nt(76), .15, 'triangle', .18); T(nt(83), .25, 'triangle', .16, .08); },
      () => seq([84, 91, 96], .06, (n, t) => T(nt(n), .08, 'square', .05, t)),
      () => { T(nt(60), .5, 'sawtooth', .08); T(nt(67), .6, 'triangle', .1, .1); T(nt(48), .5, 'sine', .2); },
    ],
  };
  // versão 1 = original (synth); as demais vêm de V
  S.NOMES_VARIANTES = ['Original', 'Cristal', 'Orgânico', 'Neon', 'Épico'];
  S.variants = {};
  Object.keys(V).forEach(k => { S.variants[k] = [S.synth[k]].concat(V[k]); });
})(typeof window !== 'undefined' ? window : globalThis);
