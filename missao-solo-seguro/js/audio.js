/*
 * MISSÃO SOLO SEGURO — áudio
 * - Em http/https (GitHub Pages): usa Web Audio API (baixa latência, volume funciona no iPhone).
 * - Aberto direto do computador (file://): usa <audio> do HTML5, que funciona sem servidor.
 * - Narração: Web Speech API com voz em português do próprio aparelho.
 * Os navegadores só liberam som depois do primeiro toque/clique: por isso existe desbloquear().
 */
window.Som = (() => {
  const PASTA = "audio/";
  const EFEITOS = {
    clique: 0.45, selecionar: 0.5, acerto: 0.7, erro: 0.4, conquista: 0.8, fase: 0.7,
    vitoria: 0.85, transicao: 0.5, carimbo: 0.75, lama: 0.8, tique: 0.55, papel: 0.6
  };
  const TRILHAS = { campo: "tema_campo.mp3", laboratorio: "tema_laboratorio.mp3" };
  const VOL_MUSICA = 0.32;
  const VOL_MUSICA_FALA = 0.1;

  const prefs = { musica: true, efeitos: true, narracao: false };
  try {
    const salvo = JSON.parse(localStorage.getItem("mss-som") || "null");
    if (salvo) Object.assign(prefs, salvo);
  } catch (e) { /* armazenamento indisponível: segue com o padrão */ }
  const salvar = () => { try { localStorage.setItem("mss-som", JSON.stringify(prefs)); } catch (e) {} };

  const usarWebAudio = /^https?:$/.test(location.protocol) && !!(window.AudioContext || window.webkitAudioContext);
  let ctx = null, ganhoMestre = null, ganhoMusica = null;
  const buffers = {};
  const pool = {};
  let desbloqueado = false;
  let trilhaAtual = null;
  let trilhaPedida = "campo";
  const elMusica = {};
  const fontesMusica = {};
  let falando = false;

  function criarElementoMusica(nome) {
    if (elMusica[nome]) return elMusica[nome];
    const a = new Audio(PASTA + TRILHAS[nome]);
    a.loop = true;
    a.preload = "auto";
    a.volume = 0;
    elMusica[nome] = a;
    if (usarWebAudio && ctx) {
      try {
        const g = ctx.createGain();
        g.gain.value = 0;
        ctx.createMediaElementSource(a).connect(g).connect(ganhoMusica);
        fontesMusica[nome] = g;
        a.volume = 1;
      } catch (e) { fontesMusica[nome] = null; a.volume = 0; }
    }
    return a;
  }

  function iniciarContexto() {
    if (!usarWebAudio || ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      ganhoMestre = ctx.createGain();
      ganhoMestre.connect(ctx.destination);
      ganhoMusica = ctx.createGain();
      ganhoMusica.gain.value = VOL_MUSICA;
      ganhoMusica.connect(ganhoMestre);
      Object.keys(EFEITOS).forEach((nome) => {
        fetch(PASTA + nome + ".mp3")
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
          .then((ab) => new Promise((ok, falha) => ctx.decodeAudioData(ab, ok, falha)))
          .then((buf) => { buffers[nome] = buf; })
          .catch(() => { /* cai no <audio> */ });
      });
    } catch (e) { ctx = null; }
  }

  function desbloquear() {
    if (desbloqueado) return;
    desbloqueado = true;
    iniciarContexto();
    if (ctx && ctx.state === "suspended") ctx.resume();
    trilha(trilhaPedida);
  }

  function tocar(nome) {
    if (!prefs.efeitos || !desbloqueado || !(nome in EFEITOS)) return;
    const vol = EFEITOS[nome];
    if (ctx && buffers[nome]) {
      const src = ctx.createBufferSource();
      src.buffer = buffers[nome];
      const g = ctx.createGain();
      g.gain.value = vol;
      src.connect(g).connect(ganhoMestre);
      src.start();
      return;
    }
    // alternativa: elementos <audio> reaproveitados
    const lista = (pool[nome] = pool[nome] || []);
    let a = lista.find((x) => x.paused || x.ended);
    if (!a) {
      if (lista.length >= 4) a = lista[0];
      else { a = new Audio(PASTA + nome + ".mp3"); lista.push(a); }
    }
    try { a.currentTime = 0; } catch (e) {}
    a.volume = vol;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  }

  function rampa(nome, alvo, ms = 900) {
    const a = elMusica[nome];
    if (!a) return;
    if (fontesMusica[nome] && ctx) {
      const g = fontesMusica[nome].gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(g.value, ctx.currentTime);
      g.linearRampToValueAtTime(alvo, ctx.currentTime + ms / 1000);
      if (alvo === 0) setTimeout(() => { if (trilhaAtual !== nome) a.pause(); }, ms + 50);
      return;
    }
    const inicio = a.volume, t0 = performance.now();
    const alvoReal = alvo * VOL_MUSICA * (falando ? VOL_MUSICA_FALA / VOL_MUSICA : 1);
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / ms);
      try { a.volume = Math.max(0, Math.min(1, inicio + (alvoReal - inicio) * k)); } catch (e) {}
      if (k < 1) requestAnimationFrame(passo);
      else if (alvo === 0 && trilhaAtual !== nome) a.pause();
    };
    requestAnimationFrame(passo);
  }

  function trilha(nome) {
    trilhaPedida = nome;
    if (!desbloqueado) return;
    if (!prefs.musica) { Object.keys(elMusica).forEach((n) => rampa(n, 0, 400)); trilhaAtual = null; return; }
    if (trilhaAtual === nome && elMusica[nome] && !elMusica[nome].paused) return;
    const anterior = trilhaAtual;
    trilhaAtual = nome;
    if (anterior && anterior !== nome) rampa(anterior, 0, 1200);
    const a = criarElementoMusica(nome);
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
    rampa(nome, 1, 1400);
  }

  function abaixarMusica(sim) {
    falando = sim;
    if (ctx && ganhoMusica) {
      const g = ganhoMusica.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(g.value, ctx.currentTime);
      g.linearRampToValueAtTime(sim ? VOL_MUSICA_FALA : VOL_MUSICA, ctx.currentTime + 0.4);
    } else if (trilhaAtual && elMusica[trilhaAtual]) {
      try { elMusica[trilhaAtual].volume = sim ? VOL_MUSICA_FALA : VOL_MUSICA; } catch (e) {}
    }
  }

  /* ---------------- narração ---------------- */
  const synth = window.speechSynthesis || null;
  let voz = null;
  function escolherVoz() {
    if (!synth) return;
    const vozes = synth.getVoices();
    const pt = vozes.filter((v) => /^pt/i.test(v.lang));
    voz = pt.find((v) => /pt[-_]BR/i.test(v.lang) && /natural|online|google|luciana|francisca|maria|thalita/i.test(v.name)) ||
      pt.find((v) => /pt[-_]BR/i.test(v.lang)) || pt[0] || null;
  }
  if (synth) {
    escolherVoz();
    if ("onvoiceschanged" in synth) synth.onvoiceschanged = escolherVoz;
  }

  function falar(texto) {
    if (!synth || !texto) return false;
    synth.cancel();
    // frases curtas evitam que alguns navegadores cortem a fala no meio
    const frases = texto.replace(/\s+/g, " ").match(/[^.!?:;]+[.!?:;]*/g) || [texto];
    frases.forEach((f, i) => {
      const u = new SpeechSynthesisUtterance(f.trim());
      u.lang = "pt-BR";
      if (voz) u.voice = voz;
      u.rate = 1.03;
      if (i === 0) u.onstart = () => abaixarMusica(true);
      if (i === frases.length - 1) { u.onend = () => abaixarMusica(false); u.onerror = () => abaixarMusica(false); }
      synth.speak(u);
    });
    return true;
  }
  function narrar(texto) { if (prefs.narracao) falar(texto); }
  function calar() { if (synth) synth.cancel(); abaixarMusica(false); }

  function alternar(tipo) {
    prefs[tipo] = !prefs[tipo];
    salvar();
    if (tipo === "musica") {
      if (prefs.musica) { const n = trilhaPedida; trilhaAtual = null; trilha(n); }
      else trilha(trilhaPedida);
    }
    if (tipo === "narracao" && !prefs.narracao) calar();
    return prefs[tipo];
  }

  return {
    prefs, desbloquear, tocar, trilha, narrar, falar, calar, alternar,
    temVoz: () => !!synth,
    get modo() { return ctx ? "webaudio" : "html5"; }
  };
})();
