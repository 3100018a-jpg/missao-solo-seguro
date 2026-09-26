/*
 * MISSÃO SOLO SEGURO — ilustrações animadas (SVG)
 * Cada função devolve o SVG de uma cena. As animações ficam em css/estilo.css
 * e algumas são disparadas pelo js/jogo.js trocando classes no <svg>.
 */
window.Cenas = (() => {
  const plantas = (x0, x1, y, passo, cor = "#3f7d45") => {
    let s = "";
    for (let x = x0, i = 0; x <= x1; x += passo, i++) {
      s += `<g transform="translate(${x} ${y})"><g class="planta" style="animation-delay:${(i % 5) * -0.4}s">
        <path d="M0 0 C-5 -6 -6 -12 -2 -16 C0 -10 1 -6 0 0Z" fill="${cor}"/>
        <path d="M0 0 C5 -5 8 -10 4 -15 C1 -9 0 -5 0 0Z" fill="#5c9a4f"/>
      </g></g>`;
    }
    return s;
  };

  const pontos = (n, x0, x1, y0, y1, seed = 3, cls = "metal") => {
    let s = "";
    let r = seed;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * (x1 - x0);
      const y = y0 + rnd() * (y1 - y0);
      s += `<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.6 + rnd() * 1.8).toFixed(1)}" style="animation-delay:${(-rnd() * 3).toFixed(2)}s"/>`;
    }
    return s;
  };

  /* ------------------------------------------------------------ ABERTURA */
  function abertura() {
    return `
<svg class="cena-svg cena-abertura" viewBox="0 0 480 330" role="img" aria-label="Paisagem rural com rio e plantação; abaixo, o corte do solo mostra uma camada de rejeito sobre os horizontes O, A, B e C, com partículas de metal invisíveis a olho nu.">
  <defs>
    <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6cf"/><stop offset="1" stop-color="#e9f0e8"/></linearGradient>
    <pattern id="areia" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="#00000022"/><circle cx="6" cy="5" r="0.7" fill="#ffffff22"/></pattern>
  </defs>
  <rect width="480" height="140" fill="url(#ceu)"/>
  <circle cx="408" cy="46" r="20" fill="#f2c14e"/>
  <g class="nuvem" style="animation-duration:38s"><ellipse cx="90" cy="38" rx="30" ry="9" fill="#fff" opacity=".85"/><ellipse cx="110" cy="33" rx="18" ry="9" fill="#fff" opacity=".85"/></g>
  <g class="nuvem" style="animation-duration:52s;animation-delay:-20s"><ellipse cx="260" cy="24" rx="26" ry="7" fill="#fff" opacity=".7"/><ellipse cx="276" cy="20" rx="14" ry="7" fill="#fff" opacity=".7"/></g>
  <path d="M0 100 C60 70 120 78 170 92 C230 108 280 66 350 74 C410 80 450 92 480 88 V140 H0Z" fill="#88a983"/>
  <path d="M0 118 C80 100 150 108 220 116 C300 124 380 104 480 112 V140 H0Z" fill="#6b9463"/>
  <path d="M300 128 C340 124 400 126 480 122 V140 H290Z" fill="#6f95a3"/>
  <g class="agua"><path d="M312 132 H340 M360 130 H380 M405 129 H430 M448 127 H470" stroke="#d7e7ec" stroke-width="1.6" stroke-linecap="round"/></g>
  ${plantas(24, 250, 138, 13)}
  <text x="300" y="118" class="rotulo-cena">Rio Paraopeba</text>

  <!-- corte do solo -->
  <rect y="140" width="480" height="20" fill="#b4532a"/>
  <rect y="140" width="480" height="20" fill="url(#areia)"/>
  <rect y="160" width="480" height="14" fill="#2e2118"/>
  <rect y="174" width="480" height="46" fill="#4a3325"/>
  <rect y="220" width="480" height="52" fill="#76503a"/>
  <rect y="272" width="480" height="58" fill="#a07e57"/>
  <g fill="#8a6947"><ellipse cx="60" cy="300" rx="18" ry="9"/><ellipse cx="190" cy="312" rx="24" ry="10"/><ellipse cx="410" cy="296" rx="20" ry="8"/><ellipse cx="300" cy="318" rx="14" ry="6"/></g>
  <g class="metais">${pontos(34, 20, 460, 164, 268, 11)}</g>
  <g class="horizontes">
    <text x="10" y="154">REJEITO</text><text x="10" y="171">O</text><text x="10" y="201">A</text><text x="10" y="250">B</text><text x="10" y="304">C</text>
  </g>
  <g class="profundidade">
    <line x1="462" y1="140" x2="462" y2="326" />
    <text x="456" y="146" text-anchor="end">0 cm</text><text x="456" y="224" text-anchor="end">40</text><text x="456" y="320" text-anchor="end">100</text>
  </g>
  <!-- trado -->
  <g class="trado">
    <rect x="352" y="60" width="44" height="6" rx="3" fill="#39433d"/>
    <rect x="371" y="62" width="6" height="150" fill="#6c7771"/>
    <path d="M368 200 l12 5 l-12 5 l12 5 l-12 5 l6 10 l6 -10" fill="none" stroke="#39433d" stroke-width="2.4"/>
  </g>
  <g class="estaca" transform="translate(120 138)"><line y1="0" y2="-24" stroke="#f1f4ee" stroke-width="2"/><path d="M0 -24 h16 l-4 5 l4 5 h-16z" fill="#e3a21a"/><text x="3" y="-15" class="estaca-t">P1</text></g>
  <g class="estaca" transform="translate(236 138)"><line y1="0" y2="-24" stroke="#f1f4ee" stroke-width="2"/><path d="M0 -24 h16 l-4 5 l4 5 h-16z" fill="#c4372c"/><text x="3" y="-15" class="estaca-t">P4</text></g>
</svg>`;
  }

  /* ------------------------------------------------------------ FASE 1: LABORATÓRIO */
  function lab() {
    return `
<svg class="cena-svg cena-lab" viewBox="0 0 480 330" role="img" aria-label="Bancada de laboratório com dois potes de solo: o Pote A, escuro e fofo, e o Pote B, claro e arenoso.">
  <rect width="480" height="330" fill="#dfe7e1"/>
  <rect y="0" width="480" height="210" fill="#e7eee8"/>
  <g opacity=".55"><rect x="40" y="40" width="150" height="6" fill="#9aa9a0"/><rect x="290" y="40" width="150" height="6" fill="#9aa9a0"/></g>
  <g class="vidraria">
    <path d="M58 40 v-18 h10 v18 l10 0 z" fill="#b9d4cf"/><rect x="56" y="12" width="14" height="10" fill="#9fb9b4"/>
    <path d="M96 40 l6 -26 h10 l6 26z" fill="#cfe1d9"/><path d="M99 34 l3 -12 h10 l3 12z" fill="#89b69f"/>
    <rect x="140" y="16" width="12" height="24" rx="2" fill="#c9d9e0"/><rect x="140" y="28" width="12" height="12" rx="2" fill="#e3a21a" opacity=".7"/>
    <rect x="300" y="18" width="30" height="22" rx="3" fill="#c7d3cc"/><rect x="340" y="10" width="16" height="30" rx="3" fill="#b8c9c1"/>
    <path d="M380 40 v-22 a10 10 0 0 1 20 0 v22z" fill="#d3e2da"/>
  </g>
  <rect y="210" width="480" height="18" fill="#6d5a45"/>
  <rect y="228" width="480" height="102" fill="#8a7358"/>
  <!-- Pote A -->
  <g class="pote pote-a" transform="translate(120 96)">
    <ellipse cx="60" cy="116" rx="62" ry="8" fill="#00000026"/>
    <rect x="4" y="0" width="112" height="16" rx="4" fill="#9fb0a6"/>
    <path d="M8 16 h104 v84 a14 14 0 0 1 -14 14 h-76 a14 14 0 0 1 -14 -14z" fill="#e9f3f0" opacity=".55"/>
    <path d="M12 40 q10 -10 20 0 q10 -12 22 0 q10 -10 22 0 q12 -10 24 0 v58 a10 10 0 0 1 -10 10 h-68 a10 10 0 0 1 -10 -10z" fill="#33251b"/>
    <g fill="#4d3627">${pontos(18, 16, 104, 46, 104, 5, "grao")}</g>
    <path d="M18 22 v70" stroke="#ffffff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
    <rect x="38" y="60" width="44" height="26" rx="4" fill="#f1f4ee"/><text x="60" y="80" text-anchor="middle" class="pote-letra">A</text>
    <g transform="translate(-6 -44)"><g class="tag-laudo tag-perigo">
      <rect width="132" height="34" rx="6" fill="#c4372c"/><text x="66" y="15" text-anchor="middle" class="tag-t1">Pb 210 mg/kg</text><text x="66" y="28" text-anchor="middle" class="tag-t2">ACIMA DO VI</text>
    </g></g>
  </g>
  <!-- Pote B -->
  <g class="pote pote-b" transform="translate(262 96)">
    <ellipse cx="60" cy="116" rx="62" ry="8" fill="#00000026"/>
    <rect x="4" y="0" width="112" height="16" rx="4" fill="#9fb0a6"/>
    <path d="M8 16 h104 v84 a14 14 0 0 1 -14 14 h-76 a14 14 0 0 1 -14 -14z" fill="#e9f3f0" opacity=".55"/>
    <path d="M12 52 h96 v46 a10 10 0 0 1 -10 10 h-76 a10 10 0 0 1 -10 -10z" fill="#d9c197"/>
    <g fill="#bda172">${pontos(26, 16, 104, 56, 104, 17, "grao")}</g>
    <path d="M18 22 v70" stroke="#ffffff" stroke-width="4" opacity=".35" stroke-linecap="round"/>
    <rect x="38" y="66" width="44" height="26" rx="4" fill="#f1f4ee"/><text x="60" y="86" text-anchor="middle" class="pote-letra">B</text>
    <g transform="translate(-6 -44)"><g class="tag-laudo tag-ok">
      <rect width="132" height="34" rx="6" fill="#2f8f5b"/><text x="66" y="15" text-anchor="middle" class="tag-t1">Pb 12 mg/kg</text><text x="66" y="28" text-anchor="middle" class="tag-t2">ABAIXO DO VRQ</text>
    </g></g>
  </g>
  <text x="240" y="318" text-anchor="middle" class="rotulo-cena claro">Qual deles é seguro para a horta da escola?</text>
</svg>`;
  }

  /* ------------------------------------------------------------ FASE 2: VALE DO PARAOPEBA */
  function vale() {
    return `
<svg class="cena-svg cena-vale" viewBox="0 0 480 330" role="img" aria-label="Esquema do vale: a mina e a barragem no alto, o córrego Ferro-Carvão descendo até o rio Paraopeba e, às margens, as lavouras do assentamento.">
  <rect width="480" height="330" fill="#a9c29b"/>
  <path d="M0 0 H480 V70 C400 90 330 60 250 80 C170 100 90 70 0 90Z" fill="#8fae83"/>
  <path d="M0 150 C80 130 150 160 220 150 C300 140 380 170 480 150 V330 H0Z" fill="#b7cda6"/>
  <!-- mina -->
  <g class="mina">
    <ellipse cx="78" cy="48" rx="62" ry="30" fill="#9b8a78"/>
    <ellipse cx="78" cy="48" rx="46" ry="21" fill="#86725f"/>
    <ellipse cx="78" cy="48" rx="30" ry="12" fill="#6e5a48"/>
  </g>
  <!-- barragem -->
  <g class="barragem">
    <path d="M110 92 L176 84 L186 112 L118 122Z" fill="#b98a5c"/>
    <path d="M114 96 L172 89 L178 104 L119 112Z" fill="#c9a071"/>
  </g>
  <!-- córrego e rio -->
  <path id="corrego" d="M150 118 C170 150 150 180 190 200 C230 220 250 236 262 262" fill="none" stroke="#6f95a3" stroke-width="5" stroke-linecap="round"/>
  <path class="rio" d="M0 272 C80 258 160 280 262 266 C350 254 420 276 480 262 V292 C420 304 350 284 262 296 C160 308 80 288 0 300Z" fill="#6f95a3"/>
  <path class="rio-lama" d="M0 272 C80 258 160 280 262 266 C350 254 420 276 480 262 V292 C420 304 350 284 262 296 C160 308 80 288 0 300Z" fill="#8e5433"/>
  <!-- assentamento -->
  <g class="assentamento">
    <rect x="300" y="186" width="70" height="44" fill="#6f9a52"/>
    <rect x="376" y="182" width="84" height="48" fill="#86ab5b"/>
    <rect x="300" y="236" width="60" height="22" fill="#94b563"/>
    <g stroke="#4f7a3a" stroke-width="2">
      <path d="M306 194 h58 M306 204 h58 M306 214 h58 M306 224 h58"/>
      <path d="M382 190 h72 M382 200 h72 M382 210 h72 M382 220 h72"/>
    </g>
    <g fill="#f1f4ee"><rect x="408" y="150" width="18" height="14"/><rect x="432" y="154" width="16" height="12"/></g>
    <g fill="#8c3b26"><path d="M405 150 l12 -9 l12 9z"/><path d="M430 154 l10 -8 l10 8z"/></g>
  </g>
  <!-- lama -->
  <path class="lama-fluxo" pathLength="1" d="M146 110 C170 150 150 180 190 200 C230 220 250 236 262 268 C300 282 360 272 480 270" fill="none" stroke="#8e5433" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <path class="lama-borda" d="M298 232 C320 240 350 244 372 236 L372 262 L298 264Z" fill="#8e5433"/>
  <path class="barragem-rota" d="M112 100 L176 90" stroke="#8e5433" stroke-width="10" stroke-linecap="round"/>
  <g class="metais-vale">${pontos(16, 290, 380, 234, 262, 21, "metal")}</g>
  <g class="rotulos">
    <text x="78" y="16" text-anchor="middle" class="rotulo-cena">Mina Córrego do Feijão</text>
    <text x="196" y="96" class="rotulo-cena">Barragem B1</text>
    <text x="84" y="170" class="rotulo-cena">Córrego Ferro-Carvão</text>
    <text x="24" y="320" class="rotulo-cena">Rio Paraopeba</text>
    <text x="300" y="176" class="rotulo-cena">Assentamento Pastorinhas</text>
  </g>
  <text x="470" y="14" text-anchor="end" class="rotulo-cena nota">Esquema ilustrativo, fora de escala</text>
</svg>`;
  }

  /* ------------------------------------------------------------ FASE 3: FONTES */
  function fontes() {
    return `
<svg class="cena-svg cena-fontes" viewBox="0 0 480 330" role="img" aria-label="Quatro fontes possíveis de contaminação: posto de combustíveis, oficina de baterias, rejeito de mineração de ferro e lavoura com pulverização de agrotóxicos.">
  <rect width="480" height="330" fill="#dfe7e1"/>
  <g class="fonte" data-fonte="0" transform="translate(20 20)">
    <rect width="210" height="135" rx="12" fill="#e9efe9"/>
    <rect x="20" y="106" width="170" height="10" fill="#9aa39d"/>
    <rect x="40" y="36" width="44" height="70" rx="6" fill="#c4372c"/><rect x="48" y="46" width="28" height="18" rx="2" fill="#f1f4ee"/>
    <path d="M84 50 h14 v40 a6 6 0 0 0 12 0 v-24" fill="none" stroke="#39433d" stroke-width="4"/>
    <rect x="120" y="30" width="70" height="12" fill="#39433d"/><rect x="126" y="42" width="6" height="64" fill="#6c7771"/><rect x="178" y="42" width="6" height="64" fill="#6c7771"/>
    <text x="105" y="130" text-anchor="middle" class="rotulo-cena">Posto desativado</text>
    <g transform="translate(190 20)"><g class="fonte-ok"><circle r="12" fill="#2f8f5b"/><path d="M-5 0 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
  </g>
  <g class="fonte" data-fonte="1" transform="translate(250 20)">
    <rect width="210" height="135" rx="12" fill="#e9efe9"/>
    <rect x="30" y="50" width="70" height="46" rx="4" fill="#39433d"/><rect x="42" y="42" width="12" height="8" fill="#8f9a92"/><rect x="76" y="42" width="12" height="8" fill="#8f9a92"/>
    <text x="48" y="80" class="bateria-t">+</text><text x="78" y="80" class="bateria-t">−</text>
    <rect x="112" y="60" width="70" height="36" rx="4" fill="#4f5a54"/><rect x="122" y="54" width="10" height="6" fill="#8f9a92"/><rect x="162" y="54" width="10" height="6" fill="#8f9a92"/>
    <ellipse cx="100" cy="104" rx="70" ry="6" fill="#6d6a5a" opacity=".6"/>
    <text x="105" y="130" text-anchor="middle" class="rotulo-cena">Oficina de baterias</text>
    <g transform="translate(190 20)"><g class="fonte-ok"><circle r="12" fill="#2f8f5b"/><path d="M-5 0 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
  </g>
  <g class="fonte fonte-mineracao" data-fonte="2" transform="translate(20 175)">
    <rect width="210" height="135" rx="12" fill="#e9efe9"/>
    <path d="M20 106 C50 60 90 50 120 70 C150 88 170 90 190 106Z" fill="#b4532a"/>
    <path d="M40 106 C60 80 90 76 110 88 C130 98 150 100 170 106Z" fill="#9c4524"/>
    <g transform="translate(118 50)"><rect x="0" y="10" width="54" height="26" rx="3" fill="#e3a21a"/><path d="M54 16 h16 l8 12 v8 h-24z" fill="#e3a21a"/><circle cx="12" cy="40" r="7" fill="#39433d"/><circle cx="62" cy="40" r="7" fill="#39433d"/></g>
    <text x="105" y="130" text-anchor="middle" class="rotulo-cena">Rejeito de minério de ferro</text>
    <g transform="translate(190 20)"><g class="fonte-ok"><circle r="12" fill="#2f8f5b"/><path d="M-5 0 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
  </g>
  <g class="fonte" data-fonte="3" transform="translate(250 175)">
    <rect width="210" height="135" rx="12" fill="#e9efe9"/>
    ${plantas(30, 180, 104, 15)}
    <g class="pulverizador" transform="translate(40 30)"><rect x="0" y="14" width="40" height="22" rx="4" fill="#1f6b4a"/><rect x="40" y="20" width="60" height="4" fill="#39433d"/>
      <g class="gotas" fill="#9fc2d8"><circle cx="50" cy="34" r="2"/><circle cx="62" cy="40" r="2"/><circle cx="74" cy="34" r="2"/><circle cx="86" cy="42" r="2"/><circle cx="96" cy="36" r="2"/></g></g>
    <text x="105" y="130" text-anchor="middle" class="rotulo-cena">Lavoura com agrotóxicos</text>
    <g transform="translate(190 20)"><g class="fonte-ok"><circle r="12" fill="#2f8f5b"/><path d="M-5 0 l3.5 3.5 l6.5 -7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g></g>
  </g>
</svg>`;
  }

  /* ------------------------------------------------------------ FASE 4: PERFIL + SINALIZADOR */
  function perfil() {
    const estacas = [
      { id: "P1", x: 50 }, { id: "P2", x: 130 }, { id: "P3", x: 210 }, { id: "P4", x: 290 }, { id: "P5", x: 360 }
    ];
    return `
<svg class="cena-svg cena-perfil" viewBox="0 0 480 330" role="img" aria-label="Corte do solo com cinco pontos de amostragem, P1 a P5, e um sinalizador de quatro luzes para as classes de qualidade do solo.">
  <rect width="480" height="330" fill="#dfe7e1"/>
  <rect width="400" height="96" fill="#cfe0d6"/>
  <path d="M0 80 C60 70 120 84 200 78 C280 72 340 86 400 80 V96 H0Z" fill="#88a983"/>
  ${plantas(170, 240, 96, 12)}
  <rect y="96" width="400" height="16" fill="#b4532a"/>
  <rect y="112" width="400" height="40" fill="#4a3325"/>
  <rect y="152" width="400" height="60" fill="#76503a"/>
  <rect y="212" width="400" height="118" fill="#a07e57"/>
  <g class="metais">${pontos(22, 10, 390, 116, 208, 29)}</g>
  ${estacas.map((e) => `
  <g class="estaca amostra" data-ponto="${e.id}" transform="translate(${e.x} 96)">
    <line y1="0" y2="-30" stroke="#18241d" stroke-width="2"/>
    <path class="bandeira" d="M0 -30 h24 l-5 6 l5 6 h-24z"/>
    <text x="3" y="-20" class="estaca-t">${e.id}</text>
    <rect class="furo" x="-3" y="0" width="6" height="70" rx="2" fill="#18241d" opacity=".25"/>
  </g>`).join("")}
  <!-- sinalizador de classes -->
  <g class="sinalizador" transform="translate(412 60)">
    <rect x="0" y="0" width="56" height="226" rx="14" fill="#18241d"/>
    <g class="luz" data-classe="4"><circle cx="28" cy="32" r="19" fill="#c4372c"/><text x="28" y="37" text-anchor="middle">4</text></g>
    <g class="luz" data-classe="3"><circle cx="28" cy="86" r="19" fill="#e3a21a"/><text x="28" y="91" text-anchor="middle">3</text></g>
    <g class="luz" data-classe="2"><circle cx="28" cy="140" r="19" fill="#8db33a"/><text x="28" y="145" text-anchor="middle">2</text></g>
    <g class="luz" data-classe="1"><circle cx="28" cy="194" r="19" fill="#2f8f5b"/><text x="28" y="199" text-anchor="middle">1</text></g>
    <rect x="22" y="226" width="12" height="90" fill="#39433d"/>
    <text x="28" y="-8" text-anchor="middle" class="rotulo-cena">Classe</text>
  </g>
</svg>`;
  }

  /* ------------------------------------------------------------ FASE 5: HORTA */
  function horta() {
    return `
<svg class="cena-svg cena-horta" viewBox="0 0 480 330" role="img" aria-label="Quintal e horta do assentamento às margens de um córrego, com mata ciliar e uma agricultora aguardando a orientação técnica.">
  <rect width="480" height="330" fill="#cfe0d6"/>
  <path d="M0 110 C90 96 170 116 260 104 C350 92 420 110 480 100 V330 H0Z" fill="#a8c28f"/>
  <!-- mata ciliar P1 -->
  <g class="zona" data-ponto="P1">
    <g fill="#3f7d45"><circle cx="40" cy="92" r="26"/><circle cx="78" cy="80" r="30"/><circle cx="118" cy="94" r="24"/></g>
    <g fill="#5d4633"><rect x="37" y="110" width="6" height="18"/><rect x="75" y="104" width="7" height="24"/><rect x="115" y="112" width="6" height="16"/></g>
    <text x="78" y="44" text-anchor="middle" class="rotulo-cena">P1 · mata ciliar</text>
  </g>
  <!-- córrego -->
  <path d="M0 200 C80 186 150 214 240 200 C320 188 400 214 480 196 V222 C400 238 320 214 240 226 C150 240 80 212 0 226Z" fill="#6f95a3"/>
  <g class="agua"><path d="M40 212 H70 M150 218 H180 M280 210 H310 M400 214 H430" stroke="#d7e7ec" stroke-width="1.6" stroke-linecap="round"/></g>
  <!-- horta P4 -->
  <g class="zona" data-ponto="P4">
    <rect x="150" y="140" width="150" height="50" rx="4" fill="#5c3f2c"/>
    <g fill="#7cc26b">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle class="alface" cx="${164 + i * 20}" cy="154" r="7"/><circle class="alface" cx="${164 + i * 20}" cy="176" r="7"/>`).join("")}</g>
    <text x="225" y="134" text-anchor="middle" class="rotulo-cena">P4 · horta</text>
  </g>
  <!-- quintal P5 -->
  <g class="zona" data-ponto="P5">
    <rect x="360" y="96" width="70" height="44" fill="#f1f4ee"/><path d="M352 98 l43 -28 l43 28z" fill="#8c3b26"/>
    <rect x="386" y="114" width="16" height="26" fill="#6d5a45"/>
    <rect x="330" y="150" width="120" height="34" rx="4" fill="#4a3325"/>
    ${plantas(340, 440, 176, 14)}
    <text x="400" y="60" text-anchor="middle" class="rotulo-cena">P5 · quintal</text>
  </g>
  <!-- agricultora -->
  <g transform="translate(96 250)"><g class="pessoa">
    <ellipse cx="0" cy="58" rx="22" ry="5" fill="#00000026"/>
    <path d="M-16 56 v-34 a16 16 0 0 1 32 0 v34z" fill="#1f6b4a"/>
    <circle cx="0" cy="0" r="12" fill="#8a5a3c"/>
    <ellipse cx="0" cy="-8" rx="20" ry="5" fill="#d9b25a"/><path d="M-10 -9 a10 8 0 0 1 20 0z" fill="#d9b25a"/>
    <path d="M16 26 l18 -10" stroke="#8a5a3c" stroke-width="5" stroke-linecap="round"/>
  </g></g>
  <g transform="translate(390 252)"><g class="pessoa tecnico">
    <ellipse cx="0" cy="56" rx="22" ry="5" fill="#00000026"/>
    <path d="M-16 54 v-32 a16 16 0 0 1 32 0 v32z" fill="#e3a21a"/>
    <path d="M-16 30 h32 M-16 40 h32" stroke="#f1f4ee" stroke-width="3"/>
    <circle cx="0" cy="0" r="12" fill="#c68d62"/>
    <path d="M-13 -4 a13 12 0 0 1 26 0z" fill="#f1f4ee"/>
    <rect x="-30" y="18" width="16" height="22" rx="2" fill="#f1f4ee" stroke="#39433d"/>
  </g></g>
</svg>`;
  }

  /* ------------------------------------------------------------ MAPA DA TRILHA */
  const estacoes = [
    { x: 60, y: 250, nome: "Laboratório da escola" },
    { x: 150, y: 150, nome: "Vale do Paraopeba" },
    { x: 250, y: 215, nome: "Fontes e amostragem" },
    { x: 340, y: 110, nome: "Laboratório de análises" },
    { x: 425, y: 200, nome: "Assentamento Pastorinhas" }
  ];
  function mapa(concluidas) {
    const d = "M30 290 C40 270 50 262 60 250 C90 212 110 160 150 150 C200 138 210 210 250 215 C300 222 300 120 340 110 C390 98 400 170 425 200 C440 220 450 240 470 250";
    return `
<svg class="cena-svg cena-mapa" viewBox="0 0 480 330" role="img" aria-label="Mapa da missão com cinco paradas ligadas por uma estrada.">
  <rect width="480" height="330" fill="#b8cda8"/>
  <path d="M0 60 C80 40 160 80 240 60 C320 40 400 70 480 50 V0 H0Z" fill="#9fbb90"/>
  <path d="M0 300 C120 280 200 320 300 300 C380 284 440 310 480 300 V330 H0Z" fill="#6f95a3"/>
  <g fill="#8fae83" opacity=".8"><circle cx="100" cy="80" r="16"/><circle cx="118" cy="88" r="12"/><circle cx="410" cy="90" r="14"/><circle cx="200" cy="280" r="10"/><circle cx="300" cy="170" r="12"/></g>
  <path id="estrada" d="${d}" fill="none" stroke="#6d5a45" stroke-width="16" stroke-linecap="round"/>
  <path d="${d}" fill="none" stroke="#e8dcc0" stroke-width="2" stroke-dasharray="8 8"/>
  ${estacoes.map((e, i) => `
  <g class="estacao ${concluidas > i ? "feita" : ""} ${concluidas === i ? "proxima" : ""}" transform="translate(${e.x} ${e.y})">
    <circle r="17" class="estacao-fundo"/>
    <text y="6" text-anchor="middle" class="estacao-n">${i + 1}</text>
    <text x="${i === 0 ? -14 : i === 4 ? 14 : 0}" y="${i % 2 ? -26 : 34}" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}" class="rotulo-cena">${e.nome}</text>
  </g>`).join("")}
  <g id="caminhao" class="caminhao">
    <g transform="translate(-16 -22)">
      <rect x="0" y="6" width="22" height="14" rx="2" fill="#f1f4ee" stroke="#18241d" stroke-width="1.5"/>
      <path d="M22 9 h7 l4 6 v5 h-11z" fill="#e3a21a" stroke="#18241d" stroke-width="1.5"/>
      <circle cx="7" cy="21" r="3.5" fill="#18241d"/><circle cx="26" cy="21" r="3.5" fill="#18241d"/>
      <path d="M4 10 h10" stroke="#1f6b4a" stroke-width="2"/>
    </g>
  </g>
</svg>`;
  }

  /* ------------------------------------------------------------ MEDALHAS */
  const glifos = {
    olhar: `<circle cx="32" cy="32" r="11" fill="none" stroke="currentColor" stroke-width="4"/><path d="M40 40 l10 10" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>`,
    historico: `<circle cx="32" cy="32" r="15" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 22 v11 l7 5" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
    fontes: `<path d="M32 16 c-8 0 -13 6 -13 13 c0 10 13 21 13 21 s13 -11 13 -21 c0 -7 -5 -13 -13 -13z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="29" r="4" fill="currentColor"/>`,
    norma: `<path d="M32 14 l15 6 v11 c0 10 -7 16 -15 19 c-8 -3 -15 -9 -15 -19 v-11z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M25 32 l5 5 l9 -10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
    decisao: `<rect x="24" y="14" width="16" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="22" r="3" fill="currentColor"/><circle cx="32" cy="32" r="3" fill="currentColor"/><circle cx="32" cy="42" r="3" fill="currentColor"/>`
  };
  const coresMedalha = { olhar: "#2f8f5b", historico: "#b4532a", fontes: "#e3a21a", norma: "#1f6b4a", decisao: "#c4372c" };
  function medalha(id, tamanho = 64) {
    return `<svg class="medalha-svg" viewBox="0 0 64 64" width="${tamanho}" height="${tamanho}" aria-hidden="true">
      <path d="M20 2 h10 l4 14 h-10z M34 2 h10 l-4 14 h-10z" fill="#39433d"/>
      <circle cx="32" cy="34" r="27" fill="${coresMedalha[id]}"/>
      <circle cx="32" cy="34" r="22" fill="none" stroke="#f1f4ee" stroke-opacity=".45" stroke-width="2" stroke-dasharray="3 3"/>
      <g color="#f1f4ee" transform="translate(0 2)">${glifos[id]}</g>
    </svg>`;
  }

  return { abertura, lab, vale, fontes, perfil, horta, mapa, estacoes, medalha };
})();
