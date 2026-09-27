/*
 * MISSÃO SOLO SEGURO — lógica do jogo
 * Telas: abertura → briefing → mapa → fases 1 a 5 (com medalhas) → relatório final.
 * Textos e valores ficam em js/conteudo.js; ilustrações em js/cenas.js; som em js/audio.js.
 */
(() => {
  "use strict";
  const C = window.CONTEUDO;
  const S = window.Som;
  const K = window.Cenas;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const palco = $("#palco");
  const reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esperar = (ms) => new Promise((r) => setTimeout(r, reduzido ? Math.min(ms, 120) : ms));
  const embaralhar = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => Number(n).toLocaleString("pt-BR");
  const html = (str) => { const t = document.createElement("template"); t.innerHTML = str.trim(); return t.content.firstElementChild; };
  const noTopo = window.self === window.top;
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const ler = (k, padrao) => { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? padrao : v; } catch (e) { return padrao; } };

  const ICONE_OUVIR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
  const OK_TXT = ["Na mosca!", "Isso!", "Perfeito.", "Muito bem."];
  const ERRO_TXT = ["Ainda não.", "Quase.", "Repense."];
  const sorteio = (a) => a[Math.floor(Math.random() * a.length)];

  /* ================================================================ ESTADO */
  const novoEstado = () => ({
    nome: "", equipe: "", xp: 0, conf: 100, medalhas: [], faseAtual: 0, concluidas: 0,
    acertos1: 0, itens: 0, erros: 0, perguntasModelo: {}
  });
  let estado = novoEstado();

  /* ================================================================ HUD */
  function atualizarHUD() {
    $("#hud-nome").textContent = estado.nome || "—";
    $("#hud-xp").textContent = num(estado.xp);
    const fill = $("#hud-conf-fill");
    fill.style.width = estado.conf + "%";
    fill.dataset.nivel = estado.conf >= 70 ? "alto" : estado.conf >= 45 ? "medio" : "baixo";
    $("#hud-conf-meter").setAttribute("aria-valuenow", String(estado.conf));
    $("#hud-conf-meter").setAttribute("aria-valuetext", estado.conf + "%");
    $("#hud-fase-label").textContent = estado.faseAtual ? `Fase ${estado.faseAtual} de 5` : "Fases";
    $("#hud-trilha").innerHTML = C.fases.map((f, i) => {
      const cls = estado.concluidas > i ? "feita" : estado.faseAtual === i + 1 ? "atual" : "";
      return `<li class="${cls}" title="${esc(f.nome)}"><span class="sr">Fase ${i + 1}: ${esc(f.nome)}${cls === "feita" ? " (concluída)" : ""}</span></li>`;
    }).join("");
    $("#hud-medalhas").innerHTML = C.medalhas.map((m) =>
      estado.medalhas.includes(m.id)
        ? `<span class="hud-medalha" title="${esc(m.nome)}">${K.medalha(m.id, 30)}<span class="sr">${esc(m.nome)}</span></span>`
        : `<span class="hud-medalha vazia" title="Medalha a conquistar"></span>`
    ).join("");
  }

  function pulsar(el, cls = "pulsar") {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function ganharXP(n, origem) {
    if (!n) return;
    estado.xp += n;
    atualizarHUD();
    pulsar($(".hud-xp"));
    const pop = html(`<div class="xp-pop" aria-hidden="true">+${n} XP</div>`);
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    if (origem && origem.getBoundingClientRect) {
      const r = origem.getBoundingClientRect();
      x = r.left + r.width / 2; y = r.top + 8;
    }
    pop.style.left = x + "px";
    pop.style.top = y + "px";
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 1300);
  }

  function perderConfianca(n = 6) {
    estado.conf = Math.max(10, estado.conf - n);
    estado.erros++;
    atualizarHUD();
    pulsar($(".hud-conf"), "tremer");
  }

  function registrarItem(dePrimeira) {
    estado.itens++;
    if (dePrimeira) estado.acertos1++;
  }

  /* ================================================================ TELAS */
  let textoNarracao = "";
  function definirNarracao(t) { textoNarracao = t; S.narrar(t); }

  function montarTela(el) {
    S.calar();
    palco.innerHTML = "";
    palco.appendChild(el);
    window.scrollTo(0, 0);
    const alvo = el.querySelector("h1, h2");
    if (alvo) { alvo.setAttribute("tabindex", "-1"); alvo.focus({ preventScroll: true }); }
    const ouvir = el.querySelector(".ouvir");
    if (ouvir) {
      if (!S.temVoz()) ouvir.hidden = true;
      ouvir.addEventListener("click", () => { S.desbloquear(); S.falar(textoNarracao); });
    }
  }

  function montarFase(n, svg, trilha) {
    const f = C.fases[n - 1];
    estado.faseAtual = n;
    S.trilha(trilha);
    const tela = html(`
      <section class="tela tela-fase fase-${n}">
        <figure class="cena">${svg}</figure>
        <div class="prancheta">
          <div class="prancheta-topo">
            <div>
              <p class="eyebrow">Fase ${n} de 5 · ${esc(f.eixo)}</p>
              <h2>${esc(f.nome)}</h2>
            </div>
            <button type="button" class="ouvir">${ICONE_OUVIR}<span>Ouvir</span></button>
          </div>
          <div class="etapa"></div>
        </div>
      </section>`);
    montarTela(tela);
    atualizarHUD();
    return { tela, cena: tela.querySelector(".cena-svg"), etapa: tela.querySelector(".etapa") };
  }

  function trocarEtapa(ctx, el) {
    ctx.etapa.innerHTML = "";
    ctx.etapa.appendChild(el);
    if (!reduzido) pulsar(el, "entrar");
    const r = ctx.etapa.getBoundingClientRect();
    const topoHud = ($("#hud") && !$("#hud").hidden) ? $("#hud").getBoundingClientRect().bottom : 0;
    if (r.top < topoHud) window.scrollBy({ top: r.top - topoHud - 12, behavior: reduzido ? "auto" : "smooth" });
  }

  const blocoRetorno = () => `<div class="retorno" role="status" aria-live="polite" hidden></div>`;
  function mostrarRetorno(el, tipo, titulo, texto) {
    el.className = "retorno " + tipo;
    el.innerHTML = `<strong>${esc(titulo)}</strong> ${esc(texto)}`;
    el.hidden = false;
  }

  /* ---------------------------------------------------------- mensagem simples */
  function passoMensagem(ctx, { conteudo, botao = "Continuar", narrar, aoMostrar, classe = "" }) {
    return new Promise((resolve) => {
      const bloco = html(`<div class="passo ${classe}">${conteudo}<div class="acoes"><button type="button" class="btn">${esc(botao)}</button></div></div>`);
      bloco.querySelector(".acoes .btn").addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      if (narrar) definirNarracao(narrar);
      if (aoMostrar) aoMostrar(bloco);
    });
  }

  /* ---------------------------------------------------------- múltipla escolha */
  function passoEscolha(ctx, cfg) {
    return new Promise((resolve) => {
      const bloco = html(`
        <div class="passo">
          ${cfg.antes || ""}
          ${cfg.tempo ? `<div class="cronometro" aria-hidden="true"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="crono-fundo"/><circle cx="22" cy="22" r="19" class="crono-arco" pathLength="100"/></svg><span class="crono-n">${cfg.tempo}</span></div>` : ""}
          <p class="enunciado">${esc(cfg.enunciado)}</p>
          <div class="opcoes" role="group" aria-label="Alternativas"></div>
          ${blocoRetorno()}
          <div class="acoes" hidden><button type="button" class="btn">${esc(cfg.botao || "Continuar")}</button></div>
        </div>`);
      const lista = bloco.querySelector(".opcoes");
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      let tentativas = 0, resolvido = false;

      // cronômetro (fase 5)
      let restante = cfg.tempo || 0, timer = null;
      const arco = bloco.querySelector(".crono-arco");
      const crN = bloco.querySelector(".crono-n");
      const crono = bloco.querySelector(".cronometro");
      if (cfg.tempo) {
        timer = setInterval(() => {
          if (!bloco.isConnected) { clearInterval(timer); return; }
          restante = Math.max(0, restante - 1);
          crN.textContent = restante;
          arco.style.strokeDashoffset = String(100 - (restante / cfg.tempo) * 100);
          if (restante <= 5 && restante > 0) { S.tocar("tique"); crono.classList.add("alerta"); }
          if (restante === 0) {
            clearInterval(timer);
            crono.classList.add("esgotado");
            if (!resolvido) mostrarRetorno(retorno, "aviso", "Tempo esgotado.", "O bônus de rapidez acabou, mas a decisão ainda é sua. Responda com calma.");
          }
        }, 1000);
      }

      const opcoes = cfg.embaralhar ? embaralhar(cfg.opcoes) : cfg.opcoes;
      opcoes.forEach((op, i) => {
        const letra = cfg.embaralhar ? String.fromCharCode(65 + i) : op.id.toUpperCase();
        const b = html(`<button type="button" class="opcao"><span class="opcao-letra">${letra}</span><span class="opcao-texto">${esc(op.texto)}</span></button>`);
        b.addEventListener("click", () => {
          if (resolvido || b.disabled) return;
          tentativas++;
          if (op.certa) {
            resolvido = true;
            if (timer) clearInterval(timer);
            b.classList.add("certa");
            S.tocar("acerto");
            let pts = tentativas === 1 ? (cfg.xp ?? 100) : (cfg.xpDepois ?? 40);
            let extra = "";
            if (cfg.tempo && restante > 0) {
              const bonus = Math.round(50 * restante / cfg.tempo);
              pts += bonus;
              extra = ` Bônus de rapidez: +${bonus} XP.`;
            }
            ganharXP(pts, b);
            registrarItem(tentativas === 1);
            $$(".opcao", lista).forEach((o) => { if (o !== b) { o.disabled = true; o.classList.add("apagada"); } });
            mostrarRetorno(retorno, "ok", tentativas === 1 ? sorteio(OK_TXT) : "Agora sim.", op.retorno + extra);
            if (cfg.aoAcertar) cfg.aoAcertar(op, tentativas);
            acoes.hidden = false;
            acoes.querySelector(".btn").focus({ preventScroll: true });
            S.narrar(op.retorno);
          } else {
            b.classList.add("errada");
            b.disabled = true;
            S.tocar("erro");
            perderConfianca();
            mostrarRetorno(retorno, "erro", sorteio(ERRO_TXT), op.retorno + " Tente outra alternativa.");
            S.narrar(op.retorno);
          }
        });
        lista.appendChild(b);
      });
      acoes.querySelector(".btn").addEventListener("click", () => { S.tocar("clique"); resolve(tentativas); });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.narrar || (cfg.enunciado + " " + opcoes.map((o, i) => (cfg.embaralhar ? String.fromCharCode(65 + i) : o.id.toUpperCase()) + ": " + o.texto).join(" ")));
    });
  }

  /* ---------------------------------------------------------- separar em colunas (fase 1) */
  function passoClassificar(ctx, cfg) {
    return new Promise((resolve) => {
      const itens = embaralhar(cfg.itens.map((it, i) => ({ ...it, i })));
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.instrucao)}</p>
          <div class="fichas" role="group" aria-label="Pistas para separar">
            ${itens.map((it) => `<button type="button" class="ficha" draggable="true" data-i="${it.i}" aria-pressed="false">${esc(it.texto)}</button>`).join("")}
          </div>
          <div class="colunas">
            ${cfg.colunas.map((c) => `
              <div class="coluna" data-col="${c.id}">
                <button type="button" class="coluna-alvo" data-col="${c.id}"><span class="coluna-nome">${esc(c.nome)}</span><span class="coluna-sub">${esc(c.sub)}</span></button>
                <ul class="coluna-lista" aria-label="${esc(c.nome)}"></ul>
              </div>`).join("")}
          </div>
          ${blocoRetorno()}
          <div class="acoes" hidden><button type="button" class="btn">Continuar</button></div>
        </div>`);
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      let selecionada = null;
      const errou = new Set();
      let colocadas = 0;

      const selecionar = (f) => {
        $$(".ficha", bloco).forEach((x) => x.setAttribute("aria-pressed", "false"));
        selecionada = f;
        if (f) { f.setAttribute("aria-pressed", "true"); S.tocar("selecionar"); }
        bloco.classList.toggle("escolhendo", !!f);
      };
      const colocar = (f, col) => {
        const idx = +f.dataset.i;
        const it = cfg.itens[idx];
        if (it.col === col) {
          const li = html(`<li class="ficha-colocada">${esc(it.texto)}</li>`);
          bloco.querySelector(`.coluna[data-col="${col}"] .coluna-lista`).appendChild(li);
          const primeira = !errou.has(idx);
          ganharXP(primeira ? 20 : 5, li);
          registrarItem(primeira);
          f.remove();
          S.tocar("acerto");
          colocadas++;
          selecionar(null);
          retorno.hidden = true;
          if (colocadas === cfg.itens.length) {
            mostrarRetorno(retorno, "ok", "Tudo separado.", cfg.sintese);
            acoes.hidden = false;
            acoes.querySelector(".btn").focus({ preventScroll: true });
            S.narrar(cfg.sintese);
          }
        } else {
          errou.add(idx);
          S.tocar("erro");
          perderConfianca(3);
          pulsar(f, "tremer");
          mostrarRetorno(retorno, "erro", "Repense.", `Pergunte-se: “${it.texto}” diz se a planta cresce ou se o alimento é seguro para quem come?`);
        }
      };

      $$(".ficha", bloco).forEach((f) => {
        f.addEventListener("click", () => selecionar(selecionada === f ? null : f));
        f.addEventListener("dragstart", (e) => { selecionar(f); try { e.dataTransfer.setData("text/plain", f.dataset.i); } catch (er) {} });
      });
      $$(".coluna", bloco).forEach((col) => {
        const id = col.dataset.col;
        col.querySelector(".coluna-alvo").addEventListener("click", () => {
          if (!selecionada) { mostrarRetorno(retorno, "aviso", "Primeiro,", "toque em uma pista acima e depois na coluna."); return; }
          colocar(selecionada, id);
        });
        col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("sobre"); });
        col.addEventListener("dragleave", () => col.classList.remove("sobre"));
        col.addEventListener("drop", (e) => { e.preventDefault(); col.classList.remove("sobre"); if (selecionada) colocar(selecionada, id); });
      });
      acoes.querySelector(".btn").addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.instrucao + " As colunas são: " + cfg.colunas.map((c) => c.nome + ", que " + c.sub).join("; e ") + ".");
    });
  }

  /* ---------------------------------------------------------- linha do tempo (fase 2) */
  function passoSequencia(ctx, cfg) {
    return new Promise((resolve) => {
      const ordem = cfg.itens.map((t, i) => ({ t, i }));
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.instrucao)}</p>
          <ol class="linha-tempo">
            ${ordem.map((o) => `<li class="slot" data-i="${o.i}"><span class="slot-n">${o.i + 1}</span><span class="slot-t">?</span></li>`).join("")}
          </ol>
          <div class="fichas fichas-tempo" role="group" aria-label="Fatos embaralhados">
            ${embaralhar(ordem).map((o) => `<button type="button" class="ficha" data-i="${o.i}">${esc(o.t)}</button>`).join("")}
          </div>
          ${blocoRetorno()}
          <div class="acoes" hidden><button type="button" class="btn">Continuar</button></div>
        </div>`);
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      let proximo = 0;
      let errouAtual = false;
      $$(".ficha", bloco).forEach((f) => {
        f.addEventListener("click", () => {
          const i = +f.dataset.i;
          if (i === proximo) {
            const slot = bloco.querySelector(`.slot[data-i="${i}"]`);
            slot.querySelector(".slot-t").textContent = cfg.itens[i];
            slot.classList.add("preenchido");
            f.remove();
            S.tocar("acerto");
            ganharXP(errouAtual ? 5 : 20, slot);
            registrarItem(!errouAtual);
            errouAtual = false;
            proximo++;
            retorno.hidden = true;
            if (proximo === cfg.itens.length) {
              mostrarRetorno(retorno, "ok", "Linha do tempo completa.", "O histórico mostra que era uma área de produção de alimentos atingida por rejeitos de mineração. Isso define o que investigar.");
              acoes.hidden = false;
              acoes.querySelector(".btn").focus({ preventScroll: true });
            }
          } else {
            errouAtual = true;
            S.tocar("erro");
            perderConfianca(3);
            pulsar(f, "tremer");
            mostrarRetorno(retorno, "erro", "Fora de ordem.", proximo === 0 ? "Comece pelo que havia no território antes do desastre-crime sociotecnológico." : "Esse fato vem depois. O que aconteceu logo em seguida?");
          }
        });
      });
      acoes.querySelector(".btn").addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.instrucao);
    });
  }

  /* ---------------------------------------------------------- ligar fonte e poluente (fase 3) */
  function passoLigar(ctx, cfg) {
    return new Promise((resolve) => {
      const polu = embaralhar(cfg.pares.map((p, i) => ({ t: p.poluente, i })));
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.instrucao)}</p>
          <div class="ligar">
            <div class="ligar-col">
              <p class="rotulo">Fonte</p>
              ${cfg.pares.map((p, i) => `<div class="par" data-i="${i}"><button type="button" class="ficha ficha-fonte" data-i="${i}" aria-pressed="false">${esc(p.fonte)}</button><div class="par-encaixe"></div></div>`).join("")}
            </div>
            <div class="ligar-col">
              <p class="rotulo">Poluente suspeito</p>
              <div class="fichas-polu">
                ${polu.map((p) => `<button type="button" class="ficha ficha-polu" data-i="${p.i}">${esc(p.t)}</button>`).join("")}
              </div>
            </div>
          </div>
          ${blocoRetorno()}
          <div class="acoes" hidden><button type="button" class="btn">Continuar</button></div>
        </div>`);
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      let fonteSel = null, feitos = 0;
      const errou = new Set();
      const marcarCena = (i, cls, ligar) => {
        const g = ctx.cena && ctx.cena.querySelector(`.fonte[data-fonte="${i}"]`);
        if (g) g.classList.toggle(cls, ligar);
      };
      $$(".ficha-fonte", bloco).forEach((f) => {
        f.addEventListener("click", () => {
          if (f.disabled) return;
          $$(".ficha-fonte", bloco).forEach((x) => { x.setAttribute("aria-pressed", "false"); marcarCena(x.dataset.i, "ativa", false); });
          if (fonteSel === f) { fonteSel = null; bloco.classList.remove("escolhendo"); return; }
          fonteSel = f;
          f.setAttribute("aria-pressed", "true");
          marcarCena(f.dataset.i, "ativa", true);
          bloco.classList.add("escolhendo");
          S.tocar("selecionar");
        });
      });
      $$(".ficha-polu", bloco).forEach((p) => {
        p.addEventListener("click", () => {
          if (!fonteSel) { mostrarRetorno(retorno, "aviso", "Primeiro,", "toque em uma fonte na coluna da esquerda."); return; }
          const fi = +fonteSel.dataset.i;
          if (+p.dataset.i === fi) {
            const encaixe = bloco.querySelector(`.par[data-i="${fi}"] .par-encaixe`);
            encaixe.appendChild(html(`<span class="encaixado">${esc(cfg.pares[fi].poluente)}</span>`));
            bloco.querySelector(`.par[data-i="${fi}"]`).classList.add("feito");
            fonteSel.disabled = true;
            fonteSel.setAttribute("aria-pressed", "false");
            marcarCena(fi, "ativa", false);
            marcarCena(fi, "ok", true);
            p.remove();
            S.tocar("acerto");
            const primeira = !errou.has(fi);
            ganharXP(primeira ? 30 : 10, encaixe);
            registrarItem(primeira);
            fonteSel = null;
            bloco.classList.remove("escolhendo");
            feitos++;
            retorno.hidden = true;
            if (feitos === cfg.pares.length) {
              mostrarRetorno(retorno, "ok", "Assinaturas reconhecidas.", "Quem conhece a fonte sabe o que pedir ao laboratório. No Assentamento Pastorinhas, a fonte é o rejeito de mineração de ferro.");
              acoes.hidden = false;
              acoes.querySelector(".btn").focus({ preventScroll: true });
            }
          } else {
            errou.add(fi);
            S.tocar("erro");
            perderConfianca(3);
            pulsar(p, "tremer");
            mostrarRetorno(retorno, "erro", "Não combina.", "Pense no que essa atividade usa, armazena ou descarta.");
          }
        });
      });
      acoes.querySelector(".btn").addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.instrucao);
    });
  }

  /* ---------------------------------------------------------- pedido com orçamento (fase 3) */
  function passoPedido(ctx, cfg) {
    return new Promise((resolve) => {
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.instrucao)}</p>
          <div class="orcamento">
            <div class="orc-topo"><span class="rotulo">Créditos usados</span><span class="orc-n num"><b>0</b> / ${cfg.orcamento}</span></div>
            <div class="orc-barra"><span></span></div>
          </div>
          <div class="pedido-itens">
            ${cfg.itens.map((it) => `
              <button type="button" class="item-pedido" data-id="${it.id}" aria-pressed="false">
                <span class="caixa" aria-hidden="true"></span>
                <span class="item-nome">${esc(it.nome)}</span>
                <span class="item-custo num">${it.custo} cr</span>
              </button>`).join("")}
          </div>
          ${blocoRetorno()}
          <div class="acoes"><button type="button" class="btn" data-acao="enviar">Enviar pedido ao laboratório</button></div>
        </div>`);
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      const selec = new Set();
      let envios = 0, concluido = false;
      const total = () => [...selec].reduce((s, id) => s + cfg.itens.find((x) => x.id === id).custo, 0);
      const atualizar = () => {
        const t = total();
        bloco.querySelector(".orc-n b").textContent = t;
        bloco.querySelector(".orc-barra span").style.width = Math.min(100, (t / cfg.orcamento) * 100) + "%";
        bloco.querySelector(".orcamento").classList.toggle("cheio", t === cfg.orcamento);
      };
      $$(".item-pedido", bloco).forEach((b) => {
        b.addEventListener("click", () => {
          if (concluido) return;
          const id = b.dataset.id;
          const it = cfg.itens.find((x) => x.id === id);
          if (selec.has(id)) { selec.delete(id); b.setAttribute("aria-pressed", "false"); S.tocar("clique"); }
          else {
            if (total() + it.custo > cfg.orcamento) {
              S.tocar("erro");
              pulsar(bloco.querySelector(".orcamento"), "tremer");
              mostrarRetorno(retorno, "aviso", "Orçamento estourado.", `Esse item custa ${it.custo} créditos. Retire algo menos importante para caber.`);
              return;
            }
            selec.add(id); b.setAttribute("aria-pressed", "true"); S.tocar("selecionar");
          }
          $$(".item-pedido", bloco).forEach((x) => x.classList.remove("certo", "errado"));
          atualizar();
        });
      });
      acoes.querySelector(".btn").addEventListener("click", (ev) => {
        if (concluido) { S.tocar("clique"); resolve(); return; }
        envios++;
        const escolhidos = cfg.itens.filter((x) => selec.has(x.id));
        const errados = escolhidos.filter((x) => x.tipo === "errado");
        const faltam = cfg.itens.filter((x) => x.tipo === "essencial" && !selec.has(x.id));
        $$(".item-pedido", bloco).forEach((b) => {
          const it = cfg.itens.find((x) => x.id === b.dataset.id);
          b.classList.toggle("errado", selec.has(it.id) && it.tipo === "errado");
          b.classList.toggle("certo", selec.has(it.id) && it.tipo !== "errado");
        });
        if (errados.length || faltam.length) {
          S.tocar("erro");
          perderConfianca(5);
          let msg = "";
          if (errados.length) msg += errados.map((x) => x.retorno).join(" ") + " ";
          if (faltam.length) msg += faltam.length === 2
            ? "Faltam as duas análises essenciais: pense no rejeito e na água que a família usa."
            : faltam[0].id === "metais" ? "Falta a análise principal do solo: quais metais vêm do rejeito?" : "Falta pensar na água: a CONAMA 420 também traz valores para água subterrânea.";
          mostrarRetorno(retorno, "erro", "O laboratório devolveu o pedido.", msg.trim());
          S.narrar(msg);
          return;
        }
        concluido = true;
        const temVarredura = selec.has("varredura");
        const pts = (envios === 1 ? 100 : 40) + (temVarredura ? 50 : 0);
        registrarItem(envios === 1);
        S.tocar("carimbo");
        ganharXP(pts, ev.currentTarget);
        const carimbo = html(`<div class="carimbo" aria-hidden="true">Pedido aceito</div>`);
        bloco.querySelector(".orcamento").appendChild(carimbo);
        const msg = escolhidos.map((x) => x.retorno).join(" ") + (temVarredura ? "" : " Dica: sobrou crédito para uma varredura de outros metais registrados na bacia.");
        mostrarRetorno(retorno, "ok", "Pedido aceito.", msg);
        S.narrar(msg);
        acoes.querySelector(".btn").textContent = "Continuar";
        $$(".item-pedido", bloco).forEach((b) => (b.disabled = true));
      });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.instrucao);
    });
  }

  /* ---------------------------------------------------------- régua dos valores (fase 4) */
  function classeDe(valor, ref) {
    if (valor <= ref.vrq) return 1;
    if (valor <= ref.vp) return 2;
    if (valor <= ref.vi) return 3;
    return 4;
  }
  const fmtVal = (v) => num(v).replace(/\.0$/, "");

  function acenderSinal(ctx, classe) {
    if (!ctx.cena) return;
    $$(".luz", ctx.cena).forEach((l) => l.classList.toggle("acesa", +l.dataset.classe === classe));
  }

  function passoRegua(ctx, cfg) {
    return new Promise((resolve) => {
      const ref = cfg.referencias.Ni;
      const max = 120;
      const pct = (v) => (v / max) * 100;
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.intro)}</p>
          <div class="regua">
            <div class="regua-cab"><span class="rotulo">${ref.nome} (${ref.simbolo}) no solo · mg/kg de peso seco</span></div>
            <div class="regua-trilho">
              <span class="marca acima" style="left:${pct(ref.vrq)}%" aria-hidden="true"><b>VRQ</b> ${fmtVal(ref.vrq)}</span>
              <span class="marca abaixo" style="left:${pct(ref.vp)}%" aria-hidden="true"><b>VP</b> ${fmtVal(ref.vp)}</span>
              <span class="marca acima" style="left:${pct(ref.vi)}%" aria-hidden="true"><b>VI agrícola</b> ${fmtVal(ref.vi)}</span>
              <span class="marca abaixo ponta" style="left:0%" aria-hidden="true">0</span>
              <span class="marca abaixo ponta" style="left:100%" aria-hidden="true">${max}</span>
              <div class="regua-faixas" aria-hidden="true">
                <span class="faixa c1" style="width:${pct(ref.vrq)}%"></span>
                <span class="faixa c2" style="width:${pct(ref.vp - ref.vrq)}%"></span>
                <span class="faixa c3" style="width:${pct(ref.vi - ref.vp)}%"></span>
                <span class="faixa c4" style="width:${pct(max - ref.vi)}%"></span>
              </div>
              <label class="sr" for="regua-ni">Concentração de níquel em mg/kg</label>
              <input type="range" id="regua-ni" min="0" max="${max}" step="0.5" value="10">
            </div>
            <div class="regua-leitura"><output for="regua-ni" class="num">Ni = 10 mg/kg</output><span class="pilula">Classe 1</span></div>
          </div>
          <div class="classe-card" aria-live="polite"></div>
          <p class="progresso-classes">Passe o marcador pelas 4 classes: <b>1</b>/4</p>
          <div class="acoes"><button type="button" class="btn" disabled>Ir para o laudo</button></div>
        </div>`);
      const input = bloco.querySelector("#regua-ni");
      const out = bloco.querySelector("output");
      const pil = bloco.querySelector(".pilula");
      const card = bloco.querySelector(".classe-card");
      const prog = bloco.querySelector(".progresso-classes b");
      const btn = bloco.querySelector(".acoes .btn");
      const vistas = new Set();
      let atual = 0, premiado = false;
      const ref2 = ref;
      const mostrar = () => {
        const v = parseFloat(input.value);
        const c = classeDe(v, ref2);
        out.textContent = `Ni = ${fmtVal(v)} mg/kg`;
        pil.textContent = `Classe ${c}`;
        pil.className = "pilula c" + c;
        input.setAttribute("aria-valuetext", `${fmtVal(v)} miligramas por quilo, classe ${c}`);
        if (c !== atual) {
          atual = c;
          const k = cfg.classes[c - 1];
          card.className = "classe-card c" + c;
          card.innerHTML = `<p class="rotulo">${esc(k.nome)} · ${esc(k.faixa)}</p><p class="classe-sentido">${esc(k.sentido)}</p><p class="classe-acao"><b>O que fazer:</b> ${esc(k.acao)}</p>`;
          acenderSinal(ctx, c);
          if (vistas.size) S.tocar("tique");
          vistas.add(c);
          prog.textContent = vistas.size;
          if (vistas.size === 4 && !premiado) {
            premiado = true;
            btn.disabled = false;
            bloco.querySelector(".progresso-classes").innerHTML = "Você passou pelas 4 classes.";
            S.tocar("acerto");
            ganharXP(40, btn);
          }
        }
      };
      input.addEventListener("input", mostrar);
      btn.addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      mostrar();
      definirNarracao(cfg.intro + " VRQ, valor de referência de qualidade: 21 vírgula 5. VP, valor de prevenção: 30. VI, valor de investigação para uso agrícola: 70 miligramas por quilo.");
    });
  }

  /* ---------------------------------------------------------- laudo (fase 4) */
  function passoLaudo(ctx, cfg, refs) {
    return new Promise((resolve) => {
      const bloco = html(`
        <div class="passo">
          <p class="enunciado">${esc(cfg.instrucao)}</p>
          <div class="laudo">
            <div class="laudo-cab">
              <span class="rotulo">Laudo analítico · solo · mg/kg (peso seco)</span>
              <span class="rotulo">Dados fictícios para fins didáticos</span>
            </div>
            <div class="laudo-ref">
              ${Object.values(refs).map((r) => `<div><b>${r.simbolo}</b><span>VRQ-MG ${fmtVal(r.vrq)}</span><span>VP ${fmtVal(r.vp)}</span><span>VI agrícola ${fmtVal(r.vi)}</span></div>`).join("")}
            </div>
            <ul class="amostras">
              ${cfg.amostras.map((a) => `
                <li class="amostra-linha" data-id="${a.id}">
                  <span class="amostra-id">${a.id}</span>
                  <span class="amostra-local">${esc(a.local)}</span>
                  <span class="amostra-valor num">${a.el} = ${fmtVal(a.valor)}</span>
                  <span class="amostra-classes" role="group" aria-label="Classe da amostra ${a.id}">
                    ${[1, 2, 3, 4].map((c) => `<button type="button" class="btn-classe c${c}" data-c="${c}" aria-label="Classe ${c}">${c}</button>`).join("")}
                  </span>
                </li>`).join("")}
            </ul>
          </div>
          ${blocoRetorno()}
          <div class="acoes" hidden><button type="button" class="btn">Continuar</button></div>
        </div>`);
      const retorno = bloco.querySelector(".retorno");
      const acoes = bloco.querySelector(".acoes");
      let feitas = 0;
      $$(".amostra-linha", bloco).forEach((linha) => {
        const a = cfg.amostras.find((x) => x.id === linha.dataset.id);
        let erros = 0;
        $$(".btn-classe", linha).forEach((b) => {
          b.addEventListener("click", () => {
            if (linha.classList.contains("feita") || b.disabled) return;
            const c = +b.dataset.c;
            if (c === a.classe) {
              linha.classList.add("feita", "c" + c);
              $$(".btn-classe", linha).forEach((x) => { x.disabled = true; if (x !== b) x.classList.add("apagada"); });
              b.classList.add("escolhida");
              S.tocar("carimbo");
              ganharXP(erros ? 10 : 30, b);
              registrarItem(!erros);
              acenderSinal(ctx, c);
              const est = ctx.cena && ctx.cena.querySelector(`.amostra[data-ponto="${a.id}"]`);
              if (est) { est.classList.add("c" + c, "marcada"); }
              feitas++;
              retorno.hidden = true;
              if (feitas === cfg.amostras.length) {
                mostrarRetorno(retorno, "ok", "Laudo enquadrado.", "Mesmo solo, cinco realidades: o ponto de controle está natural, a horta passou do VI. Sem o laudo, todos pareciam iguais.");
                acoes.hidden = false;
                acoes.querySelector(".btn").focus({ preventScroll: true });
              }
            } else {
              erros++;
              b.disabled = true;
              b.classList.add("errada");
              S.tocar("erro");
              perderConfianca(3);
              const r = refs[a.el];
              mostrarRetorno(retorno, "erro", `${a.id}: repense.`, `Compare ${fmtVal(a.valor)} mg/kg com VRQ ${fmtVal(r.vrq)}, VP ${fmtVal(r.vp)} e VI ${fmtVal(r.vi)}. Em qual intervalo o valor cai?`);
            }
          });
        });
      });
      acoes.querySelector(".btn").addEventListener("click", () => { S.tocar("clique"); resolve(); });
      trocarEtapa(ctx, bloco);
      definirNarracao(cfg.instrucao);
    });
  }

  /* ================================================================ MEDALHA E MAPA */
  function concluirFase(n) {
    return new Promise((resolve) => {
      const f = C.fases[n - 1];
      const m = C.medalhas.find((x) => x.id === f.medalha);
      if (!estado.medalhas.includes(m.id)) estado.medalhas.push(m.id);
      estado.concluidas = Math.max(estado.concluidas, n);
      ganharXP(50);
      atualizarHUD();
      S.tocar("conquista");
      Folhas.soltar();
      const ov = html(`
        <div class="medalha-overlay" role="dialog" aria-modal="true" aria-labelledby="medalha-nome">
          <div class="medalha-caixa">
            <div class="medalha-grande">${K.medalha(m.id, 132)}</div>
            <p class="eyebrow">Fase ${n} concluída · medalha conquistada</p>
            <h3 id="medalha-nome">${esc(m.nome)}</h3>
            <p>${esc(m.desc)} Bônus de fase: +50 XP.</p>
            <button type="button" class="btn">${n < 5 ? "Voltar ao mapa" : "Ver meu relatório"}</button>
          </div>
        </div>`);
      document.body.appendChild(ov);
      const btn = ov.querySelector(".btn");
      btn.focus({ preventScroll: true });
      S.narrar(`Medalha conquistada: ${m.nome}. ${m.desc}`);
      btn.addEventListener("click", () => {
        S.tocar("transicao");
        ov.classList.add("saindo");
        setTimeout(() => { ov.remove(); resolve(); }, reduzido ? 0 : 280);
      });
    });
  }

  function telaMapa(concluidas) {
    return new Promise((resolve) => {
      S.trilha("campo");
      estado.faseAtual = 0;
      const prox = C.fases[concluidas];
      const est = K.estacoes[concluidas];
      const tela = html(`
        <section class="tela tela-fase tela-mapa">
          <figure class="cena">${K.mapa(concluidas)}</figure>
          <div class="prancheta">
            <div class="prancheta-topo">
              <div>
                <p class="eyebrow">Mapa da missão · parada ${concluidas + 1} de 5</p>
                <h2>${esc(est.nome)}</h2>
              </div>
              <button type="button" class="ouvir">${ICONE_OUVIR}<span>Ouvir</span></button>
            </div>
            <div class="etapa">
              <div class="passo">
                <p class="rotulo">${esc(prox.eixo)}</p>
                <p class="enunciado">Fase ${concluidas + 1}: ${esc(prox.nome)}</p>
                <ul class="medalhas-mapa">
                  ${C.medalhas.map((m, i) => `<li class="${estado.medalhas.includes(m.id) ? "tem" : ""}">${estado.medalhas.includes(m.id) ? K.medalha(m.id, 40) : `<span class="medalha-vazia">${i + 1}</span>`}<span>${esc(m.nome)}</span></li>`).join("")}
                </ul>
                <div class="acoes"><button type="button" class="btn">Entrar na fase ${concluidas + 1}</button></div>
              </div>
            </div>
          </div>
        </section>`);
      montarTela(tela);
      atualizarHUD();
      definirNarracao(`Próxima parada: ${est.nome}. Fase ${concluidas + 1}: ${prox.nome}.`);
      animarCaminhao(tela.querySelector(".cena-svg"), concluidas);
      tela.querySelector(".acoes .btn").addEventListener("click", () => { S.tocar("transicao"); resolve(); });
    });
  }

  function animarCaminhao(svg, alvoIdx) {
    const estrada = svg.querySelector("#estrada");
    const cam = svg.querySelector("#caminhao");
    if (!estrada || !cam || !estrada.getTotalLength) return;
    const L = estrada.getTotalLength();
    const perto = (e) => {
      let melhor = 0, dist = Infinity;
      for (let s = 0; s <= 300; s++) {
        const p = estrada.getPointAtLength((s / 300) * L);
        const d = (p.x - e.x) ** 2 + (p.y - e.y) ** 2;
        if (d < dist) { dist = d; melhor = (s / 300) * L; }
      }
      return melhor;
    };
    const ini = alvoIdx === 0 ? 0 : perto(K.estacoes[alvoIdx - 1]);
    const fim = perto(K.estacoes[alvoIdx]);
    const pos = (l) => {
      const p = estrada.getPointAtLength(l);
      const q = estrada.getPointAtLength(Math.min(L, l + 2));
      const vira = q.x < p.x ? -1 : 1;
      cam.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${vira} 1)`);
    };
    if (reduzido) { pos(fim); return; }
    pos(ini);
    S.tocar("transicao");
    const dur = 2200, t0 = performance.now();
    const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      pos(ini + (fim - ini) * ease(k));
      if (k < 1) requestAnimationFrame(passo);
    };
    setTimeout(() => requestAnimationFrame(passo), 350);
  }

  /* ================================================================ FASES */
  async function fase1() {
    const F = C.fase1;
    const ctx = montarFase(1, K.lab(), "laboratorio");
    await passoEscolha(ctx, {
      antes: `<p class="contexto">${esc(F.intro)}</p>`,
      enunciado: "Qual é a sua resposta técnica?",
      opcoes: F.opcoes,
      narrar: F.intro + " Alternativas: " + F.opcoes.map((o) => o.id.toUpperCase() + ": " + o.texto).join(" ")
    });
    // revelação do laudo
    S.tocar("papel");
    await passoMensagem(ctx, {
      conteudo: `
        <div class="laudo laudo-potes">
          <div class="laudo-cab"><span class="rotulo">Laudo analítico · chumbo (Pb) no solo</span><span class="rotulo">mg/kg (peso seco)</span></div>
          ${F.laudo.map((l) => `
            <div class="laudo-pote c${l.classe}">
              <div><b>${esc(l.pote)}</b><span class="laudo-origem">${esc(l.origem)}</span></div>
              <div class="laudo-num num">${l.valor}</div>
              <div class="pilula c${l.classe}">${esc(l.situacao)}</div>
            </div>`).join("")}
        </div>
        <p class="virada">${esc(F.virada)}</p>`,
      botao: "Separar as pistas",
      narrar: "Resultado do laudo. " + F.laudo.map((l) => `${l.pote}: ${l.origem}. Chumbo: ${l.valor} miligramas por quilo. ${l.situacao}.`).join(" ") + " " + F.virada,
      aoMostrar: async () => {
        await esperar(250);
        ctx.cena.classList.add("revelado");
        S.tocar("carimbo");
      }
    });
    await passoClassificar(ctx, F.classificar);
    await concluirFase(1);
  }

  async function fase2() {
    const F = C.fase2;
    const ctx = montarFase(2, K.vale(), "campo");
    // animação do histórico, com legendas controladas por quem joga
    await new Promise((resolve) => {
      const bloco = html(`
        <div class="passo">
          <p class="contexto">${esc(F.intro)}</p>
          <div class="legenda-box">
            <ol class="legenda-pontos" aria-hidden="true">${F.legendas.map((_, i) => `<li class="${i === 0 ? "ativo" : ""}"></li>`).join("")}</ol>
            <p class="legenda" aria-live="polite">${esc(F.legendas[0])}</p>
          </div>
          <div class="acoes"><button type="button" class="btn" data-acao="avancar">Reproduzir 25/01/2019</button><button type="button" class="btn btn-sec" data-acao="rever" hidden>Rever animação</button></div>
        </div>`);
      const leg = bloco.querySelector(".legenda");
      const btn = bloco.querySelector('[data-acao="avancar"]');
      const rever = bloco.querySelector('[data-acao="rever"]');
      let i = 0;
      const mostrar = (k) => {
        leg.textContent = F.legendas[k];
        $$(".legenda-pontos li", bloco).forEach((li, j) => li.classList.toggle("ativo", j <= k));
        pulsar(leg, "entrar");
        S.narrar(F.legendas[k]);
      };
      const romper = () => {
        ctx.cena.classList.add("sem-transicao");
        ctx.cena.classList.remove("rompeu", "anos");
        void ctx.cena.getBoundingClientRect();
        ctx.cena.classList.remove("sem-transicao");
        void ctx.cena.getBoundingClientRect();
        ctx.cena.classList.add("rompeu");
        S.tocar("lama");
      };
      btn.addEventListener("click", () => {
        i++;
        if (i === 1) { romper(); btn.textContent = "Próximo fato"; }
        if (i === 3) { ctx.cena.classList.add("anos"); btn.textContent = "Montar a linha do tempo"; rever.hidden = false; }
        if (i >= F.legendas.length) {
          S.tocar("clique");
          ganharXP(20, btn);
          resolve();
          return;
        }
        S.tocar("clique");
        mostrar(i);
      });
      rever.addEventListener("click", () => { romper(); setTimeout(() => ctx.cena.classList.add("anos"), reduzido ? 0 : 3600); });
      trocarEtapa(ctx, bloco);
      definirNarracao(F.intro + " " + F.legendas[0]);
    });
    await passoSequencia(ctx, F.linhaTempo);
    await passoEscolha(ctx, {
      ...F.pergunta,
      antes: `<p class="rotulo">Pergunta de mediação · Eixo 1</p>`,
      aoAcertar: (op) => { estado.perguntasModelo[1] = op.texto; }
    });
    await concluirFase(2);
  }

  async function fase3() {
    const F = C.fase3;
    const ctx = montarFase(3, K.fontes(), "campo");
    await passoLigar(ctx, { instrucao: F.intro, pares: F.pares });
    ctx.cena.classList.add("foco-mineracao");
    await passoPedido(ctx, F.pedido);
    await passoEscolha(ctx, {
      ...F.pergunta,
      antes: `<p class="rotulo">Pergunta de mediação · Eixo 2</p>`,
      aoAcertar: (op) => { estado.perguntasModelo[2] = op.texto; }
    });
    await concluirFase(3);
  }

  async function fase4() {
    const F = C.fase4;
    const ctx = montarFase(4, K.perfil(), "laboratorio");
    await passoRegua(ctx, F);
    await passoLaudo(ctx, F.laudo, F.referencias);
    await passoEscolha(ctx, { ...F.bonus, xp: 80, xpDepois: 20, antes: `<p class="rotulo">Pergunta bônus</p>` });
    await passoEscolha(ctx, {
      ...F.pergunta,
      antes: `<p class="rotulo">Pergunta de mediação · Eixo 3</p>`,
      aoAcertar: (op) => { estado.perguntasModelo[3] = op.texto; }
    });
    await concluirFase(4);
  }

  async function fase5() {
    const F = C.fase5;
    const ctx = montarFase(5, K.horta(), "laboratorio");
    await passoMensagem(ctx, {
      conteudo: `<p class="contexto">${esc(F.intro)}</p><p class="rotulo">3 casos · ${F.tempo} segundos cada</p>`,
      botao: "Começar os casos",
      narrar: F.intro
    });
    const pontos = ["P5", "P4", "P1"];
    for (let i = 0; i < F.casos.length; i++) {
      const caso = F.casos[i];
      $$(".zona", ctx.cena).forEach((z) => z.classList.toggle("ativa", z.dataset.ponto === pontos[i]));
      ctx.cena.classList.add("focando");
      await passoEscolha(ctx, {
        antes: `<p class="rotulo">Caso ${i + 1} de ${F.casos.length} · ${esc(caso.titulo)}</p>`,
        enunciado: caso.texto,
        opcoes: caso.opcoes,
        tempo: F.tempo,
        botao: i < F.casos.length - 1 ? "Próximo caso" : "Concluir a missão"
      });
    }
    await concluirFase(5);
  }

  /* ================================================================ ABERTURA / BRIEFING / FINAL */
  function telaAbertura() {
    estado = novoEstado();
    $("#hud").hidden = true;
    S.trilha("campo");
    const A = C.abertura;
    const recorde = ler("mss-recorde", 0);
    const tela = html(`
      <section class="tela tela-abertura">
        <div class="abertura-texto">
          <p class="eyebrow">Técnico em Meio Ambiente · Estudo de caso</p>
          <h1 class="titulo-estrato"><span>Missão</span> <span>Solo Seguro</span></h1>
          <p class="chamada">${esc(A.chamada)}</p>
          <p class="lead">${esc(A.texto)}</p>
          <form class="form-inicio" id="form-inicio" novalidate>
            <div class="campo">
              <label for="nome-jogador">Seu nome ou apelido</label>
              <input id="nome-jogador" name="nome" maxlength="40" autocomplete="nickname" placeholder="Ex.: Ana">
            </div>
            <div class="campo">
              <label for="nome-equipe">Equipe <span class="opcional">(opcional)</span></label>
              <input id="nome-equipe" name="equipe" maxlength="40" placeholder="Ex.: Grupo 3">
            </div>
            <button class="btn btn-grande" type="submit">Começar a missão</button>
          </form>
          <p class="dica-som">O jogo tem música, efeitos e narração. Use os botões no canto da tela para ligar ou desligar.${recorde ? ` Recorde neste aparelho: <b class="num">${num(recorde)} XP</b>.` : ""}</p>
        </div>
        <figure class="cena cena-hero">
          ${K.abertura()}
          <figcaption><span>Rejeito, horizontes O, A, B e C.</span> <span>Os pontos que brilham são o que o olho não vê.</span></figcaption>
        </figure>
      </section>`);
    montarTela(tela);
    const n = ler("mss-nome", "");
    if (n) tela.querySelector("#nome-jogador").value = n;
    definirNarracao(`${C.titulo}. ${A.chamada} ${A.texto}`);
    tela.querySelector("#form-inicio").addEventListener("submit", (e) => {
      e.preventDefault();
      S.desbloquear();
      S.tocar("clique");
      estado.nome = tela.querySelector("#nome-jogador").value.trim() || "Equipe técnica";
      estado.equipe = tela.querySelector("#nome-equipe").value.trim();
      guardar("mss-nome", tela.querySelector("#nome-jogador").value.trim());
      telaBriefing();
    });
  }

  function telaBriefing() {
    $("#hud").hidden = false;
    atualizarHUD();
    const B = C.briefing;
    const tela = html(`
      <section class="tela tela-fase tela-briefing">
        <figure class="cena">${K.vale()}</figure>
        <div class="prancheta">
          <div class="prancheta-topo">
            <div>
              <p class="eyebrow">Ordem de serviço de campo · Brumadinho (MG)</p>
              <h2>${esc(B.titulo)}</h2>
            </div>
            <button type="button" class="ouvir">${ICONE_OUVIR}<span>Ouvir</span></button>
          </div>
          <div class="etapa">
            <div class="passo">
              <p class="contexto">${esc(B.texto)}</p>
              <ol class="eixos">
                ${B.eixos.map((e) => `<li><span class="rotulo">${esc(e.n)}</span><b>${esc(e.nome)}</b><span>${esc(e.desc)}</span></li>`).join("")}
              </ol>
              <ul class="regras">${B.regras.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
              <div class="acoes"><button type="button" class="btn">Aceitar a missão</button></div>
            </div>
          </div>
        </div>
      </section>`);
    montarTela(tela);
    definirNarracao(`${B.titulo}. ${B.texto} ` + B.eixos.map((e) => `${e.n}: ${e.nome}. ${e.desc}`).join(" ") + " " + B.regras.join(" "));
    tela.querySelector(".acoes .btn").addEventListener("click", () => { S.tocar("transicao"); jogar(0); });
  }

  const FASES = [fase1, fase2, fase3, fase4, fase5];
  async function jogar(inicio) {
    for (let i = inicio; i < FASES.length; i++) {
      await telaMapa(i);
      await FASES[i]();
    }
    telaFinal();
  }

  function nivelAtual() {
    return C.final.niveis.filter((n) => estado.xp >= n.min).pop().nome;
  }

  function textoRelatorio(tela) {
    const v = (id) => (tela.querySelector("#" + id).value.trim() || "(não preenchido)");
    const hoje = new Date().toLocaleDateString("pt-BR");
    const nomesMed = C.medalhas.filter((m) => estado.medalhas.includes(m.id)).map((m) => m.nome).join(", ") || "nenhuma";
    return [
      "MISSÃO SOLO SEGURO — RELATÓRIO DE CAMPO",
      `Técnica(o): ${estado.nome}${estado.equipe ? " | Equipe: " + estado.equipe : ""} | Data: ${hoje}`,
      `XP: ${estado.xp} | Confiança da comunidade: ${estado.conf}% | Acertos de primeira: ${estado.acertos1}/${estado.itens} | Nível: ${nivelAtual()}`,
      `Medalhas: ${nomesMed}`,
      "",
      "ROTEIRO DE MEDIAÇÃO — Primeira Leitura do Território (Assentamento Pastorinhas, Brumadinho/MG)",
      `Eixo 1 · Histórico e uso da terra: ${v("minha-p1")}`,
      `Eixo 2 · Poluentes suspeitos e fonte: ${v("minha-p2")}`,
      `Eixo 3 · Critérios da CONAMA 420: ${v("minha-p3")}`,
      `Frase-síntese: ${v("minha-sintese")}`,
      "",
      `Síntese de referência: ${C.final.sintese}`
    ].join("\n");
  }

  function telaFinal() {
    S.trilha("campo");
    estado.faseAtual = 0;
    atualizarHUD();
    const recordeAnt = ler("mss-recorde", 0);
    const novoRecorde = estado.xp > recordeAnt;
    if (novoRecorde) guardar("mss-recorde", estado.xp);
    const rascunho = ler("mss-rascunho", {});
    const F = C.final;
    const eixos = [
      { n: 1, nome: "Histórico e uso da terra" },
      { n: 2, nome: "Poluentes suspeitos e fonte" },
      { n: 3, nome: "Critérios da CONAMA 420" }
    ];
    const precisao = estado.itens ? Math.round((estado.acertos1 / estado.itens) * 100) : 0;
    const tela = html(`
      <section class="tela tela-final">
        <header class="final-topo">
          <div>
            <p class="eyebrow">Relatório de campo · Assentamento Pastorinhas</p>
            <h1>${esc(F.titulo)}, ${esc(estado.nome)}</h1>
            <p class="nivel">Nível alcançado: <b>${esc(nivelAtual())}</b>${novoRecorde ? ` <span class="pilula c1">Novo recorde neste aparelho</span>` : ""}</p>
          </div>
          <dl class="placar">
            <div><dt>XP</dt><dd class="num">${num(estado.xp)}</dd></div>
            <div><dt>Confiança da comunidade</dt><dd class="num">${estado.conf}%</dd></div>
            <div><dt>Acertos de primeira</dt><dd class="num">${precisao}%</dd></div>
            <div><dt>Medalhas</dt><dd class="num">${estado.medalhas.length}/5</dd></div>
          </dl>
          <ul class="medalhas-final">
            ${C.medalhas.map((m) => `<li class="${estado.medalhas.includes(m.id) ? "" : "falta"}">${K.medalha(m.id, 64)}<span>${esc(m.nome)}</span></li>`).join("")}
          </ul>
        </header>
        <div class="final-grid">
          <div class="prancheta">
            <div class="prancheta-topo">
              <div><p class="eyebrow">Tarefa da equipe</p><h2>Roteiro de mediação</h2></div>
              <button type="button" class="ouvir">${ICONE_OUVIR}<span>Ouvir</span></button>
            </div>
            <p class="contexto">${esc(F.tarefa)}</p>
            <form class="roteiro" id="form-roteiro" novalidate>
              ${eixos.map((e) => `
                <div class="campo-eixo">
                  <label for="minha-p${e.n}"><span class="rotulo">Eixo ${e.n}</span> ${esc(e.nome)}</label>
                  ${estado.perguntasModelo[e.n] ? `<p class="modelo"><span>Pergunta-modelo que você escolheu:</span> ${esc(estado.perguntasModelo[e.n])}</p>` : ""}
                  <textarea id="minha-p${e.n}" rows="3" placeholder="Escreva aqui a pergunta da sua equipe para o Eixo ${e.n}">${esc(rascunho["minha-p" + e.n] || "")}</textarea>
                </div>`).join("")}
              <div class="campo-eixo">
                <label for="minha-sintese"><span class="rotulo">Síntese</span> Frase-síntese da equipe</label>
                <textarea id="minha-sintese" rows="2" placeholder="Ex.: Aparência não garante qualidade do solo porque...">${esc(rascunho["minha-sintese"] || "")}</textarea>
              </div>
              <div class="acoes acoes-final">
                <button type="button" class="btn" data-acao="copiar">Copiar relatório</button>
                ${noTopo ? `<button type="button" class="btn btn-sec" data-acao="baixar">Baixar .txt</button><button type="button" class="btn btn-sec" data-acao="imprimir">Imprimir ou salvar PDF</button>` : ""}
                <button type="button" class="btn btn-sec" data-acao="reiniciar">Jogar de novo</button>
              </div>
              <p class="retorno" role="status" aria-live="polite" hidden></p>
              <textarea class="copia-manual" id="copia-manual" rows="8" readonly hidden aria-label="Texto do relatório para copiar"></textarea>
            </form>
          </div>
          <aside class="sintese-card">
            <p class="eyebrow">Para levar da missão</p>
            <p class="sintese-texto">${esc(F.sintese)}</p>
            <div class="sintese-eixos">
              <span>Histórico</span><span>Poluentes suspeitos</span><span>VRQ · VP · VI</span>
            </div>
          </aside>
        </div>
      </section>`);
    montarTela(tela);
    S.tocar("vitoria");
    Folhas.soltar(120);
    definirNarracao(`${F.titulo}. Você fez ${estado.xp} pontos de experiência e alcançou o nível ${nivelAtual()}. ${F.sintese} ${F.tarefa}`);

    const retorno = tela.querySelector(".retorno");
    $$("textarea[id^=minha]", tela).forEach((t) => t.addEventListener("input", () => {
      const r = {};
      $$("textarea[id^=minha]", tela).forEach((x) => (r[x.id] = x.value));
      guardar("mss-rascunho", r);
    }));
    tela.querySelector('[data-acao="copiar"]').addEventListener("click", () => {
      const txt = textoRelatorio(tela);
      const manual = tela.querySelector("#copia-manual");
      const fallback = () => {
        manual.hidden = false;
        manual.value = txt;
        manual.focus();
        manual.select();
        mostrarRetorno(retorno, "aviso", "Copie manualmente:", "o texto está selecionado abaixo. Use Ctrl+C (ou toque e segure no celular).");
      };
      try {
        navigator.clipboard.writeText(txt).then(() => {
          S.tocar("acerto");
          mostrarRetorno(retorno, "ok", "Relatório copiado.", "Cole no chat, no e-mail ou no documento da turma.");
        }, fallback);
      } catch (e) { fallback(); }
    });
    const baixar = tela.querySelector('[data-acao="baixar"]');
    if (baixar) baixar.addEventListener("click", () => {
      const blob = new Blob([textoRelatorio(tela)], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `relatorio-missao-solo-seguro-${(estado.nome || "equipe").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      S.tocar("clique");
    });
    const imprimir = tela.querySelector('[data-acao="imprimir"]');
    if (imprimir) imprimir.addEventListener("click", () => { S.tocar("clique"); window.print(); });
    tela.querySelector('[data-acao="reiniciar"]').addEventListener("click", () => {
      S.tocar("transicao");
      guardar("mss-rascunho", {});
      telaAbertura();
    });
  }

  /* ================================================================ GUIA DO PROFESSOR */
  function abrirGuia() {
    const G = C.guia;
    const modal = $("#modal-guia");
    $("#guia-conteudo").innerHTML = `
      <p class="eyebrow">Missão Solo Seguro</p>
      <h2 id="guia-titulo">${esc(G.titulo)}</h2>
      <dl class="guia-lista">${G.blocos.map((b) => `<div><dt>${esc(b.t)}</dt><dd>${esc(b.d)}</dd></div>`).join("")}</dl>
      <h3>Ir direto para uma fase</h3>
      <p class="guia-nota">Útil para retomar a discussão com a turma. A pontuação continua a partir de onde você entrar.</p>
      <div class="guia-fases">${C.fases.map((f, i) => `<button type="button" class="btn btn-sec" data-fase="${i}">${i + 1}. ${esc(f.nome)}</button>`).join("")}</div>
      <h3>Referências</h3>
      <ul class="guia-fontes">${G.fontes.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
    modal.hidden = false;
    const anterior = document.activeElement;
    $("#guia-fechar").focus();
    const fechar = () => {
      modal.hidden = true;
      document.removeEventListener("keydown", tecla);
      if (anterior && anterior.focus) anterior.focus({ preventScroll: true });
    };
    const tecla = (e) => { if (e.key === "Escape") fechar(); };
    document.addEventListener("keydown", tecla);
    $("#guia-fechar").onclick = fechar;
    modal.onclick = (e) => { if (e.target === modal) fechar(); };
    $$("[data-fase]", modal).forEach((b) => b.addEventListener("click", () => {
      fechar();
      S.desbloquear();
      if (!estado.nome) estado.nome = "Turma";
      $("#hud").hidden = false;
      $$(".medalha-overlay").forEach((o) => o.remove());
      const i = +b.dataset.fase;
      estado.concluidas = Math.max(estado.concluidas, i);
      jogar(i);
    }));
  }

  /* ================================================================ FOLHAS (celebração) */
  const Folhas = (() => {
    const cv = $("#folhas");
    const g = cv.getContext && cv.getContext("2d");
    let parts = [], rodando = false;
    const cores = ["#2f8f5b", "#8db33a", "#e3a21a", "#b4532a", "#5c9a4f", "#f1f4ee"];
    const ajustar = () => { cv.width = window.innerWidth * (window.devicePixelRatio || 1); cv.height = window.innerHeight * (window.devicePixelRatio || 1); };
    window.addEventListener("resize", ajustar);
    ajustar();
    function soltar(n = 70) {
      if (reduzido || !g) return;
      const d = window.devicePixelRatio || 1;
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.4 - 20 * d,
          vx: (Math.random() - 0.5) * 1.2 * d, vy: (2.2 + Math.random() * 2.8) * d, idade: 0,
          r: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.12,
          w: (5 + Math.random() * 6) * d, h: (10 + Math.random() * 10) * d,
          cor: cores[i % cores.length], fase: Math.random() * 6
        });
      }
      if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
    }
    function quadro() {
      g.clearRect(0, 0, cv.width, cv.height);
      parts.forEach((p) => {
        p.idade++;
        p.fase += 0.05;
        p.x += p.vx + Math.sin(p.fase) * 0.8;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.globalAlpha = Math.max(0, 1 - Math.max(0, p.idade - 150) / 50);
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.cor;
        g.beginPath();
        g.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "rgba(0,0,0,.25)";
        g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, -p.h / 2); g.lineTo(0, p.h / 2); g.stroke();
        g.restore();
      });
      parts = parts.filter((p) => p.y < cv.height + 30 && p.idade < 200);
      if (parts.length) requestAnimationFrame(quadro);
      else { rodando = false; g.clearRect(0, 0, cv.width, cv.height); }
    }
    return { soltar };
  })();

  /* ================================================================ CONTROLES DE SOM */
  function sincronizarBotoesSom() {
    $("#btn-musica").setAttribute("aria-pressed", String(S.prefs.musica));
    $("#btn-efeitos").setAttribute("aria-pressed", String(S.prefs.efeitos));
    $("#btn-narracao").setAttribute("aria-pressed", String(S.prefs.narracao));
    if (!S.temVoz()) { $("#btn-narracao").disabled = true; $("#btn-narracao").title = "Narração indisponível neste navegador"; }
  }
  function avisar(txt) {
    const a = $("#aviso");
    a.textContent = txt;
    a.classList.add("mostrar");
    clearTimeout(avisar.t);
    avisar.t = setTimeout(() => a.classList.remove("mostrar"), 1800);
  }
  $("#btn-musica").addEventListener("click", () => { S.desbloquear(); const on = S.alternar("musica"); sincronizarBotoesSom(); avisar(on ? "Música ligada" : "Música desligada"); });
  $("#btn-efeitos").addEventListener("click", () => { S.desbloquear(); const on = S.alternar("efeitos"); sincronizarBotoesSom(); S.tocar("clique"); avisar(on ? "Efeitos ligados" : "Efeitos desligados"); });
  $("#btn-narracao").addEventListener("click", () => {
    S.desbloquear();
    const on = S.alternar("narracao");
    sincronizarBotoesSom();
    avisar(on ? "Narração ligada" : "Narração desligada");
    if (on) S.falar(textoNarracao);
  });
  $("#btn-guia").addEventListener("click", abrirGuia);
  // primeiro toque em qualquer lugar libera o áudio
  const liberar = () => { S.desbloquear(); document.removeEventListener("pointerdown", liberar); document.removeEventListener("keydown", liberar); };
  document.addEventListener("pointerdown", liberar);
  document.addEventListener("keydown", liberar);

  sincronizarBotoesSom();
  telaAbertura();
})();
