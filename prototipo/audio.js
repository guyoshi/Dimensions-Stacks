/* Dimensions Stacks — áudio. Tudo sintetizado por padrão (WebAudio).
   Para usar seus próprios sons, preencha window.SOUND_FILES = { nome: 'data:audio/mpeg;base64,...' }
   com os NOMES de SLOTS abaixo; o arquivo substitui o som sintetizado daquele slot. */
(function (root) {
  'use strict';
  const SLOTS = {
    click: 'clique de botão', deal: 'carta distribuída ao baralho', place: 'carta colocada no campo', flip: 'virar carta',
    suspense: 'tensão antes de virar (batidas)', reveal: 'revelação do atributo', win: 'carta vencedora', lose: 'carta derrotada',
    capture: 'captura de carta', blackhole: 'carta engolida pelo Buraco Negro', special: 'ataque especial preparado',
    specialFlip: 'ataque especial virado', slash: 'ataque vencedor', shield: 'defesa vencedora', round: 'nova rodada',
    refill: 'compra da reserva', elim: 'jogador eliminado', victory: 'vitória na partida', defeat: 'derrota na partida',
    steal: 'carta roubada', tick: 'contagem / hover', bonus: 'bônus aplicado', menu: 'ambiente do menu / mesa (loop)',
  };

  const S = {
    ctx: null, master: null, sfx: null, musicGain: null, buffers: {}, enabled: true, musicOn: true,
    vol: { master: 0.8, sfx: 1, music: 0.35 }, musicNodes: null, SLOTS: SLOTS,

    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = root.AudioContext || root.webkitAudioContext; if (!AC) { this.enabled = false; return; }
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.vol.master;
      const comp = this.ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = this.vol.sfx;
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = this.vol.music;
      // reverb curto
      this.verb = this.ctx.createConvolver(); this.verb.buffer = this.impulse(1.6, 2.6);
      const vg = this.ctx.createGain(); vg.gain.value = 0.22; this.verb.connect(vg); vg.connect(this.master);
      this.sfx.connect(this.master); this.sfx.connect(this.verb); this.musicGain.connect(this.master); this.musicGain.connect(this.verb);
      this.master.connect(comp); comp.connect(this.ctx.destination);
      this.loadFiles();
      if (this.musicOn) this.startMusic();
    },
    impulse(sec, decay) {
      const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
      return b;
    },
    async loadFiles() {
      const files = root.SOUND_FILES || {};
      for (const name in files) {
        try {
          const src = files[name]; let ab;
          if (src.startsWith('data:')) { const bin = atob(src.split(',')[1]); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); ab = u.buffer; }
          else ab = await (await fetch(src)).arrayBuffer();
          this.buffers[name] = await this.ctx.decodeAudioData(ab);
        } catch (e) { /* mantém o som sintetizado */ }
      }
      if (this.musicOn && this.buffers.menu) this.startMusic();
    },
    setVol(k, v) { this.vol[k] = v; if (!this.ctx) return; if (k === 'master') this.master.gain.value = v; if (k === 'sfx') this.sfx.gain.value = v; if (k === 'music') this.musicGain.gain.value = v; },
    setMusic(on) { this.musicOn = on; if (!this.ctx) return; if (on) this.startMusic(); else this.stopMusic(); },

    // ---------- primitivas
    tone(f, dur, type, vol, when, glideTo, dest) {
      const c = this.ctx, t = c.currentTime + (when || 0); const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (glideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + Math.min(0.02, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.05); return o;
    },
    noise(dur, ftype, f1, f2, vol, when, q) {
      const c = this.ctx, t = c.currentTime + (when || 0), n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = ftype || 'bandpass'; f.Q.value = q || 1;
      f.frequency.setValueAtTime(f1, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
      const g = c.createGain(); g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t);
    },
    note(n) { return 440 * Math.pow(2, (n - 69) / 12); },

    // ---------- sons sintetizados
    synth: {
      click() { S.tone(1200, 0.05, 'triangle', 0.12, 0, 700); },
      tick() { S.tone(1800, 0.03, 'sine', 0.06); },
      deal() { S.noise(0.07, 'lowpass', 2400, 900, 0.18); S.tone(130, 0.08, 'sine', 0.18, 0, 70); },
      place() { S.noise(0.09, 'lowpass', 1800, 500, 0.22); S.tone(95, 0.14, 'sine', 0.3, 0, 55); },
      flip() { S.noise(0.16, 'bandpass', 700, 3800, 0.2, 0, 2); S.tone(420, 0.06, 'triangle', 0.08, 0.1, 880); },
      suspense() { [0, 0.34, 0.62, 0.84, 1.02, 1.16].forEach((t, i) => { S.tone(68 + i * 4, 0.16, 'sine', 0.3 + i * 0.03, t, 40); S.noise(0.05, 'lowpass', 300, 100, 0.12, t); }); },
      reveal() { S.tone(90, 0.5, 'sine', 0.4, 0, 38); S.noise(0.35, 'bandpass', 3000, 6000, 0.1, 0.02, 3); S.tone(S.note(76), 0.5, 'triangle', 0.08, 0.04); },
      win() { [72, 76, 79, 84].forEach((n, i) => { S.tone(S.note(n), 0.5, 'triangle', 0.2, i * 0.09); S.tone(S.note(n + 12), 0.4, 'sine', 0.06, i * 0.09 + 0.02); }); S.tone(S.note(60), 1.4, 'sine', 0.16, 0); S.tone(S.note(67), 1.4, 'sine', 0.1, 0); [88, 91, 95, 100].forEach((n, i) => S.tone(S.note(n), 0.3, 'sine', 0.05, 0.4 + i * 0.07)); },
      lose() { S.tone(S.note(62), 0.45, 'sawtooth', 0.09, 0, S.note(55)); S.tone(S.note(55), 0.7, 'sine', 0.16, 0.2, S.note(48)); },
      capture() { S.noise(0.28, 'bandpass', 500, 2600, 0.18, 0, 2); S.tone(S.note(79), 0.3, 'triangle', 0.14, 0.18); S.tone(S.note(84), 0.45, 'triangle', 0.12, 0.27); },
      blackhole() { S.tone(520, 1.0, 'sine', 0.2, 0, 35); S.tone(260, 1.0, 'sawtooth', 0.07, 0, 30); S.noise(0.95, 'lowpass', 1400, 80, 0.22); S.tone(46, 0.9, 'sine', 0.35, 0.1); },
      special() { [0, 1, 2, 3].forEach(i => S.tone(S.note(76 + i * 3), 0.5, 'sine', 0.08, i * 0.07)); S.noise(0.5, 'highpass', 4000, 8000, 0.05, 0, 1); },
      specialFlip() { S.tone(200, 0.9, 'sine', 0.2, 0, 1600); S.tone(S.note(84), 0.9, 'triangle', 0.1, 0.3); S.tone(S.note(91), 0.9, 'triangle', 0.08, 0.34); S.noise(0.8, 'bandpass', 800, 7000, 0.12, 0, 4); S.tone(70, 0.6, 'sine', 0.35, 0.65, 40); },
      slash() { S.noise(0.2, 'highpass', 2200, 7000, 0.3, 0, 1); S.tone(900, 0.12, 'sawtooth', 0.1, 0, 200); },
      shield() { S.tone(S.note(81), 0.7, 'square', 0.07); S.tone(S.note(81) * 1.505, 0.6, 'square', 0.05); S.tone(S.note(93), 0.9, 'sine', 0.1, 0.01); S.noise(0.1, 'highpass', 5000, 8000, 0.14); },
      round() { [110, 220, 330, 440, 660].forEach((f, i) => S.tone(f, 2.2 - i * 0.2, 'sine', 0.2 / (i + 1), 0)); S.noise(0.5, 'lowpass', 400, 120, 0.1); },
      refill() { [0, 1, 2].forEach(i => { S.noise(0.06, 'lowpass', 2400, 900, 0.14, i * 0.09); S.tone(110 + i * 12, 0.1, 'sine', 0.14, i * 0.09); }); },
      elim() { S.tone(S.note(50), 1.4, 'sawtooth', 0.12, 0, S.note(38)); S.tone(S.note(43), 1.6, 'sine', 0.2, 0.1, S.note(36)); S.noise(1.1, 'lowpass', 600, 60, 0.18); },
      victory() { const m = [67, 72, 76, 79, 84, 79, 84, 88]; m.forEach((n, i) => { S.tone(S.note(n), 0.55, 'triangle', 0.2, i * 0.13); S.tone(S.note(n - 12), 0.55, 'sine', 0.1, i * 0.13); }); [60, 64, 67, 72].forEach(n => S.tone(S.note(n), 2.2, 'sine', 0.1, 1.0)); },
      defeat() { [62, 58, 55, 50].forEach((n, i) => S.tone(S.note(n), 0.8, 'sine', 0.16, i * 0.28, S.note(n - 1))); },
      steal() { S.noise(0.2, 'bandpass', 3000, 700, 0.14, 0, 3); S.tone(S.note(70), 0.15, 'triangle', 0.1, 0.05, S.note(64)); },
      bonus() { S.tone(S.note(79), 0.16, 'triangle', 0.12); S.tone(S.note(86), 0.26, 'triangle', 0.1, 0.09); },
      menu() { },
    },

    play(name, o) {
      if (!this.enabled) return; this.init(); if (!this.ctx) return;
      try {
        const b = this.buffers[name];
        if (b && name !== 'menu') { const s = this.ctx.createBufferSource(); s.buffer = b; s.connect(this.sfx); s.start(); return; }
        const f = this.synth[name]; if (f) f();
      } catch (e) { }
    },

    // ---------- música ambiente
    startMusic() {
      if (!this.ctx || this.musicNodes) return;
      const c = this.ctx;
      if (this.buffers.menu) { const s = c.createBufferSource(); s.buffer = this.buffers.menu; s.loop = true; s.connect(this.musicGain); s.start(); this.musicNodes = { stop: () => { try { s.stop(); } catch (e) { } } }; return; }
      const nodes = [], g = c.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.5, c.currentTime + 3); g.connect(this.musicGain);
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 0.7; lp.connect(g);
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 260; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); nodes.push(lfo);
      [[45, 0], [52, 0], [57, 4], [60, -5], [64, 3]].forEach(([n, det]) => { const o = c.createOscillator(); o.type = n < 50 ? 'sine' : 'sawtooth'; o.frequency.value = this.note(n); o.detune.value = det; const og = c.createGain(); og.gain.value = n < 50 ? 0.5 : 0.07; o.connect(og); og.connect(lp); o.start(); nodes.push(o); });
      // notas esparsas
      const seq = [69, 72, 76, 74, 71, 67]; let i = 0;
      const timer = setInterval(() => { if (!this.musicOn) return; this.tone(this.note(seq[i++ % seq.length] + 12), 2.8, 'sine', 0.06, 0, null, this.musicGain); }, 4200);
      this.musicNodes = { stop: () => { clearInterval(timer); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1); setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch (e) { } }), 1100); } };
    },
    stopMusic() { if (this.musicNodes) { this.musicNodes.stop(); this.musicNodes = null; } },
  };
  root.Sound = S;
})(typeof window !== 'undefined' ? window : globalThis);
