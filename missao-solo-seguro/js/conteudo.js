/*
 * MISSÃO SOLO SEGURO — conteúdo do jogo
 * ---------------------------------------------------------------
 * Este arquivo concentra TODOS os textos, perguntas e valores.
 * A professora ou o professor pode editar aqui sem mexer na lógica do jogo.
 *
 * Fontes normativas usadas nos valores:
 *  - Resolução CONAMA nº 420/2009, Anexo II (VP e VI para solo, mg/kg de peso seco;
 *    VI para água subterrânea, µg/L).
 *  - Deliberação Normativa COPAM nº 166/2011 (VRQ do solo em Minas Gerais).
 * Os laudos dos pontos P1–P5 e dos potes A e B são FICTÍCIOS, criados para fins didáticos.
 */
window.CONTEUDO = {
  titulo: "Missão Solo Seguro",
  subtitulo: "Investigação no Assentamento Pastorinhas",

  abertura: {
    chamada: "Solo escuro e macio é sempre solo saudável?",
    texto:
      "Você entra na equipe técnica que vai fazer a primeira leitura do território no Assentamento Pastorinhas, em Brumadinho (MG). " +
      "As famílias querem saber se podem voltar a plantar hortaliças. Para responder, você vai trocar a impressão visual pela investigação técnica."
  },

  briefing: {
    titulo: "Briefing da missão",
    texto:
      "Em 2019, a lama de rejeitos de mineração atingiu a bacia do rio Paraopeba e terras da agricultura familiar. " +
      "Sua equipe vai usar três eixos de investigação — e nunca apenas a aparência do terreno — para avaliar se a área é segura.",
    eixos: [
      { n: "Eixo 1", nome: "Histórico e uso da terra", desc: "O que aconteceu neste território?" },
      { n: "Eixo 2", nome: "Poluentes suspeitos e fonte", desc: "O que pode estar no solo, invisível?" },
      { n: "Eixo 3", nome: "Critérios da CONAMA 420", desc: "O que o laudo diz frente ao VRQ, VP e VI?" }
    ],
    regras: [
      "Acertos rendem XP. Respostas rápidas na fase final valem bônus.",
      "Cada erro reduz a confiança da comunidade no seu trabalho. Leia o retorno e tente de novo.",
      "Cada fase concluída vale uma medalha. No fim, você monta o seu roteiro de mediação."
    ]
  },

  medalhas: [
    { id: "olhar", nome: "Olhar Crítico", desc: "Separou fertilidade de segurança ambiental." },
    { id: "historico", nome: "Detetive do Histórico", desc: "Reconstituiu a história do território." },
    { id: "fontes", nome: "Rastreador de Fontes", desc: "Ligou a fonte aos poluentes suspeitos." },
    { id: "norma", nome: "Guardião da Norma", desc: "Enquadrou o laudo nas classes da CONAMA 420." },
    { id: "decisao", nome: "Decisão Responsável", desc: "Tomou a conduta técnica correta." }
  ],

  fases: [
    { id: 1, nome: "O teste cego", eixo: "Aquecimento", medalha: "olhar" },
    { id: 2, nome: "Histórico e uso da terra", eixo: "Eixo 1", medalha: "historico" },
    { id: 3, nome: "Poluentes suspeitos e fonte", eixo: "Eixo 2", medalha: "fontes" },
    { id: 4, nome: "Critérios da CONAMA 420", eixo: "Eixo 3", medalha: "norma" },
    { id: 5, nome: "Decisão técnica", eixo: "Conduta", medalha: "decisao" }
  ],

  /* ---------------------------------------------------------------- FASE 1 */
  fase1: {
    intro:
      "No laboratório da escola, a professora coloca dois potes sem identificação na bancada. " +
      "O Pote A tem solo escuro, fofo, com cheiro de terra molhada. O Pote B tem solo claro, arenoso e seco. " +
      "Ela pergunta: qual destes solos é seguro para plantar alface na horta da escola?",
    opcoes: [
      { id: "a", texto: "Pote A, porque a cor escura, a textura fofa e o cheiro de terra molhada indicam solo rico e saudável.", certa: false,
        retorno: "A cor escura e a maciez indicam matéria orgânica, que tem a ver com fertilidade. Nenhum sentido humano enxerga metais pesados." },
      { id: "b", texto: "Pote B, porque o solo claro, arenoso e seco não tem resíduos visíveis e parece mais limpo.", certa: false,
        retorno: "A aparência também engana no sentido contrário: um solo claro não é automaticamente limpo, nem contaminado." },
      { id: "c", texto: "Não dá para afirmar pela aparência. Preciso do histórico da área e do laudo de laboratório.", certa: true,
        retorno: "Isso mesmo. A decisão técnica começa pelo histórico do terreno e pelo laudo comparado aos valores orientadores." }
    ],
    laudo: [
      { pote: "Pote A", origem: "Terreno ao lado de uma antiga oficina de reforma de baterias", elemento: "Chumbo (Pb)", valor: 210,
        situacao: "Acima do VI agrícola (180 mg/kg)", classe: 4 },
      { pote: "Pote B", origem: "Barranco em área rural, sem histórico de atividade poluidora", elemento: "Chumbo (Pb)", valor: 12,
        situacao: "Abaixo do VRQ: qualidade natural", classe: 1 }
    ],
    virada:
      "O Pote A, o mais bonito, está acima do Valor de Investigação para chumbo. O Pote B pode precisar de adubação, mas é seguro. " +
      "Um solo pode ser fértil e contaminado ao mesmo tempo.",
    classificar: {
      instrucao: "Separe as pistas. Toque em uma pista e depois na coluna certa.",
      colunas: [
        { id: "fert", nome: "Fertilidade agrícola", sub: "diz se a planta cresce" },
        { id: "seg", nome: "Segurança ambiental", sub: "diz se o alimento faz mal a quem come" }
      ],
      itens: [
        { texto: "Cor escura", col: "fert" },
        { texto: "Textura fofa", col: "fert" },
        { texto: "Teores de N, P e K", col: "fert" },
        { texto: "Matéria orgânica", col: "fert" },
        { texto: "Concentração de chumbo em mg/kg", col: "seg" },
        { texto: "Histórico de uso do terreno", col: "seg" },
        { texto: "Comparação com VRQ, VP e VI", col: "seg" },
        { texto: "Presença de metais pesados", col: "seg" }
      ],
      sintese:
        "Fertilidade (cor, textura, NPK, matéria orgânica) responde se a planta cresce. " +
        "Segurança ambiental (histórico, contaminantes e valores orientadores) responde se o alimento pode fazer mal a quem come."
    }
  },

  /* ---------------------------------------------------------------- FASE 2 */
  fase2: {
    intro:
      "Antes de qualquer análise, a pergunta é: o que aconteceu neste território? " +
      "Toque em Reproduzir para ver a sequência dos fatos no vale do rio Paraopeba.",
    legendas: [
      "Antes de 2019: famílias do Assentamento Pastorinhas vivem da agricultura familiar, com hortas e lavouras às margens dos cursos d'água.",
      "25 de janeiro de 2019: rompe-se a barragem B1 da Mina Córrego do Feijão, em Brumadinho (MG).",
      "A lama de rejeitos de minério de ferro desce o vale e atinge o rio Paraopeba. 272 pessoas perderam a vida.",
      "Anos depois, estudos ainda encontram ferro, manganês e níquel no solo, que prejudicam o banco de sementes e a recuperação da vegetação."
    ],
    linhaTempo: {
      instrucao: "Monte a linha do tempo: toque nos fatos na ordem em que aconteceram.",
      itens: [
        "Famílias do assentamento cultivam hortaliças e lavouras: agricultura familiar.",
        "25/01/2019: rompimento da barragem B1 da Mina Córrego do Feijão.",
        "Rejeitos de minério de ferro chegam ao rio Paraopeba e às terras agrícolas.",
        "Estudos detectam ferro, manganês e níquel no solo; o banco de sementes é prejudicado.",
        "Hoje: sua equipe faz a primeira leitura técnica do território."
      ]
    },
    pergunta: {
      enunciado: "Qual pergunta de mediação abre melhor o Eixo 1 com a turma?",
      opcoes: [
        { id: "a", texto: "Ao analisar as terras do Assentamento Pastorinhas, qual é o histórico de uso desse solo e qual desastre-crime sociotecnológico alterou, radicalmente, esse território em 2019?", certa: true,
          retorno: "Objetivo técnico: mostrar que o solo recebia produção agrícola familiar antes de ser atingido pelos rejeitos." },
        { id: "b", texto: "Ao visitar as terras do Assentamento Pastorinhas, a cor, a textura e o aspecto do solo que vemos hoje mostram que a terra já se recuperou e está boa para voltar a plantar hortaliças?", certa: false,
          retorno: "Essa pergunta leva a turma de volta à aparência, que não revela contaminação." },
        { id: "c", texto: "Para que as famílias do Assentamento Pastorinhas retomem logo o plantio, quantos quilos de adubo NPK e de calcário precisamos comprar para recuperar a produtividade das hortas e lavouras?", certa: false,
          retorno: "Adubo trata de fertilidade. Antes de pensar em produção, é preciso saber se a área é segura." }
      ]
    }
  },

  /* ---------------------------------------------------------------- FASE 3 */
  fase3: {
    intro:
      "Cada atividade deixa uma assinatura química. Quem conhece a fonte sabe o que procurar no laudo. " +
      "Ligue cada fonte ao poluente suspeito: toque na fonte e depois no poluente.",
    pares: [
      { fonte: "Posto de combustíveis desativado", poluente: "Hidrocarbonetos: benzeno, tolueno, etilbenzeno e xilenos (BTEX)" },
      { fonte: "Oficina de reforma de baterias", poluente: "Chumbo (Pb)" },
      { fonte: "Rejeito de mineração de ferro", poluente: "Ferro (Fe), manganês (Mn) e níquel (Ni)" },
      { fonte: "Lavoura com uso intensivo de agrotóxicos", poluente: "Resíduos de agrotóxicos" }
    ],
    pedido: {
      instrucao:
        "Agora monte o pedido de análises para o Assentamento Pastorinhas. Você tem 100 créditos. Escolha o que responde à pergunta: a área é segura?",
      orcamento: 100,
      itens: [
        { id: "metais", nome: "Metais no solo: Fe, Mn e Ni", custo: 40, tipo: "essencial",
          retorno: "Essencial: são os metais associados ao rejeito de minério de ferro." },
        { id: "agua", nome: "Fe e Mn na água do poço e da irrigação", custo: 30, tipo: "essencial",
          retorno: "Essencial: a CONAMA 420 não traz VP nem VI de ferro e manganês para solo, mas traz Valor de Investigação para água subterrânea (Fe 2.450 µg/L; Mn 400 µg/L)." },
        { id: "varredura", nome: "Varredura de outros metais (Cr, Ba, Co, Pb, Cd)", custo: 30, tipo: "bom",
          retorno: "Boa escolha: estudos na bacia do Paraopeba também registraram cromo, bário, cobalto e outros metais acima de valores de referência." },
        { id: "npk", nome: "Fertilidade: N, P, K e matéria orgânica", custo: 20, tipo: "errado",
          retorno: "NPK mede nutrição da planta, não segurança toxicológica. Fica para depois, se a área for liberada." },
        { id: "btex", nome: "Hidrocarbonetos (BTEX)", custo: 30, tipo: "errado",
          retorno: "Não há posto nem vazamento de combustível no histórico da área. Seria gastar crédito sem fonte suspeita." },
        { id: "visual", nome: "Avaliação visual de cor e textura", custo: 0, tipo: "errado",
          retorno: "Não custa nada e também não detecta nada: metais pesados são invisíveis." }
      ]
    },
    pergunta: {
      enunciado: "Qual pergunta de mediação abre melhor o Eixo 2 com a turma?",
      opcoes: [
        { id: "a", texto: "Considerando que as famílias costumam avaliar a terra pela cor, por que o solo escuro é sempre mais saudável e mais seguro para o cultivo de hortaliças do que o solo claro e arenoso?", certa: false,
          retorno: "A pergunta parte de uma premissa falsa e reforça a ilusão visual." },
        { id: "b", texto: "Sabendo que a área foi coberta por rejeitos de mineração de ferro, quais metais pesados invisíveis na subsuperfície devemos investigar como poluentes suspeitos?", certa: true,
          retorno: "Objetivo técnico: associar a atividade minerária à presença de metais pesados no solo e na água." },
        { id: "c", texto: "Partindo da suspeita de que houve vazamento de combustível no assentamento, qual produto atingiu o solo e quais hidrocarbonetos (como benzeno, tolueno e xilenos) devemos investigar como poluentes suspeitos?", certa: false,
          retorno: "A fonte está errada. O histórico aponta rejeito de mineração, não combustível." }
      ]
    }
  },

  /* ---------------------------------------------------------------- FASE 4 */
  fase4: {
    intro:
      "A Resolução CONAMA nº 420/2009 separa o solo em quatro classes, conforme a concentração de cada substância. " +
      "Arraste o marcador de níquel na régua e veja o que muda.",
    // Valores de referência (mg/kg, peso seco). VP e VI: CONAMA 420/2009. VRQ: DN COPAM 166/2011 (MG).
    referencias: {
      Ni: { nome: "Níquel", simbolo: "Ni", vrq: 21.5, vp: 30, vi: 70 },
      Pb: { nome: "Chumbo", simbolo: "Pb", vrq: 19.5, vp: 72, vi: 180 }
    },
    classes: [
      { n: 1, nome: "Classe 1", faixa: "até o VRQ", sentido: "Qualidade natural do solo.",
        acao: "Não requer ações." },
      { n: 2, nome: "Classe 2", faixa: "acima do VRQ até o VP", sentido: "Alteração, mas o solo ainda sustenta suas funções.",
        acao: "Pode exigir avaliação do órgão ambiental: verificar ocorrência natural ou fontes de poluição, com ações preventivas de controle." },
      { n: 3, nome: "Classe 3", faixa: "acima do VP até o VI", sentido: "Alerta: luz amarela.",
        acao: "Identificar a fonte, avaliar a ocorrência natural, controlar a fonte e monitorar solo e água subterrânea." },
      { n: 4, nome: "Classe 4", faixa: "acima do VI", sentido: "Risco potencial à saúde humana: luz vermelha.",
        acao: "Exige ações de gerenciamento de área contaminada: comunicar o órgão ambiental, investigação detalhada, avaliação de risco e intervenção." }
    ],
    laudo: {
      instrucao: "Laudo do Assentamento Pastorinhas. Classifique cada amostra tocando na classe correta.",
      amostras: [
        { id: "P1", local: "Mata ciliar fora da mancha de rejeito (ponto de controle)", el: "Ni", valor: 14, classe: 1 },
        { id: "P2", local: "Borda da área atingida", el: "Ni", valor: 26, classe: 2 },
        { id: "P3", local: "Lavoura de milho atingida", el: "Ni", valor: 48, classe: 3 },
        { id: "P4", local: "Horta às margens do córrego", el: "Ni", valor: 92, classe: 4 },
        { id: "P5", local: "Quintal agroecológico", el: "Pb", valor: 95, classe: 3 }
      ]
    },
    bonus: {
      enunciado:
        "Pergunta bônus. O laudo mostra ferro no solo da horta cinco vezes maior que no ponto de controle. Em que classe da CONAMA 420 ele se enquadra?",
      opcoes: [
        { id: "a", texto: "Classe 4: um teor cinco vezes maior que o do ponto de controle já ultrapassa o VI agrícola e exige gerenciamento como área contaminada.", certa: false,
          retorno: "Para enquadrar em classe é preciso ter VP e VI definidos para a substância no solo. Para o ferro, a CONAMA 420 não define." },
        { id: "b", texto: "Nenhuma: a CONAMA 420 não define VP nem VI de ferro para solo. Avalio a água subterrânea (VI do Fe: 2.450 µg/L) e busco estudos complementares.", certa: true,
          retorno: "Exato. Nem toda substância tem valor orientador para solo. O técnico sabe o que a norma cobre e o que exige outra evidência." },
        { id: "c", texto: "Nenhuma, e não há o que investigar: o ferro é micronutriente essencial às plantas e, mesmo em excesso, não prejudica o cultivo.", certa: false,
          retorno: "Em excesso, o ferro forma uma camada sobre as sementes e dificulta a germinação, como mostram os estudos em Brumadinho." }
      ]
    },
    pergunta: {
      enunciado: "Qual pergunta de mediação abre melhor o Eixo 3 com a turma?",
      opcoes: [
        { id: "a", texto: "Para a avaliação da unidade, quais valores de VRQ, VP e VI da tabela da Resolução CONAMA nº 420/2009 precisamos decorar, substância por substância, para responder às questões sobre o Assentamento Pastorinhas?", certa: false,
          retorno: "Decorar números não ensina o significado ambiental de estar acima do VP ou do VI." },
        { id: "b", texto: "Se o solo da horta estiver macio, bem estruturado e com boa drenagem, podemos dispensar o laudo laboratorial e a consulta aos valores orientadores da CONAMA 420 antes de autorizar o plantio de hortaliças?", certa: false,
          retorno: "A textura não substitui a análise laboratorial." },
        { id: "c", texto: "Para garantir a segurança alimentar da comunidade e dos consumidores, quais limites da Resolução CONAMA nº 420/2009 devem ser verificados nos laudos antes de autorizar o plantio de hortaliças?", certa: true,
          retorno: "Objetivo técnico: exigir a análise laboratorial baseada em norma ambiental oficial." }
      ]
    }
  },

  /* ---------------------------------------------------------------- FASE 5 */
  fase5: {
    intro: "Hora de decidir. Cada caso tem 40 segundos. Responder rápido vale bônus, mas acertar vale mais.",
    tempo: 40,
    casos: [
      {
        titulo: "Quintal agroecológico (P5)",
        texto:
          "Uma colega apresenta o laudo de um solo agrícola: chumbo (Pb) = 95 mg/kg, acima do VP (72) e abaixo do VI agrícola (180). " +
          "O solo é escuro, macio e visualmente perfeito. Ela pergunta se a área deve ser interditada imediatamente. Qual é a orientação correta?",
        opcoes: [
          { id: "A", texto: "Interditar imediatamente toda a área, porque ultrapassar o VRQ já caracteriza risco grave à saúde humana.", certa: false,
            retorno: "O VRQ é a referência natural do solo. Passar dele não exige interdição." },
          { id: "B", texto: "Liberar o cultivo sem restrições, porque a cor escura, a textura macia e o bom aspecto do solo comprovam a segurança.", certa: false,
            retorno: "A aparência escura não garante ausência de metais pesados." },
          { id: "C", texto: "Orientar monitoramento e controle das fontes, sem interdição, pois o teor está acima do VP e abaixo do VI.", certa: true,
            retorno: "Correto. Entre o VP e o VI o solo ainda mantém suas funções: exige alerta, monitoramento e controle das fontes. A interdição entra em cena acima do VI." },
          { id: "D", texto: "Pedir apenas um laudo de fertilidade (NPK e matéria orgânica) e, se estiver adequado, liberar o plantio de hortaliças.", certa: false,
            retorno: "NPK mede nutrição vegetal, não segurança toxicológica." }
        ]
      },
      {
        titulo: "Horta às margens do córrego (P4)",
        texto:
          "Níquel (Ni) = 92 mg/kg, acima do VI agrícola (70). As alfaces estão verdes e a família quer colher na semana que vem. O que você recomenda?",
        opcoes: [
          { id: "A", texto: "Liberar a colheita na semana que vem, porque alfaces verdes, viçosas e sem manchas nas folhas mostram que as plantas não estão absorvendo o níquel do solo.", certa: false,
            retorno: "Planta bonita não prova alimento seguro. Hortaliças podem absorver metais do solo." },
          { id: "B", texto: "Suspender o cultivo e o consumo, comunicar o órgão ambiental (em MG, a FEAM; em SP, a CETESB) e pedir investigação detalhada, avaliação de risco e plano de intervenção.", certa: true,
            retorno: "Correto. Acima do VI há risco potencial à saúde: a área passa a ser gerenciada como área contaminada, protegendo quem consome." },
          { id: "C", texto: "Aplicar mais adubo NPK e matéria orgânica para diluir o níquel no solo, seguir plantando normalmente e repetir a análise depois da próxima adubação.", certa: false,
            retorno: "Adubo não remove nem dilui metal pesado. É confundir fertilidade com segurança." },
          { id: "D", texto: "Manter a horta como está, esperar que as chuvas lavem o níquel do solo e repetir a análise daqui a cinco anos, sem acionar o órgão ambiental por enquanto.", certa: false,
            retorno: "Metais não se degradam com a chuva e podem migrar para a água. Esperar expõe a família ao risco." }
        ]
      },
      {
        titulo: "Ponto de controle (P1)",
        texto:
          "Níquel (Ni) = 14 mg/kg, abaixo do VRQ de Minas Gerais (21,5). Um morador, assustado, pede para interditar tudo porque ouviu que existe níquel no solo. Como você responde?",
        opcoes: [
          { id: "A", texto: "Interditar a área por precaução e comunicar o órgão ambiental, já que qualquer teor de níquel no solo representa risco.", certa: false,
            retorno: "Metais existem naturalmente no solo. Abaixo do VRQ, a CONAMA 420 não exige ações." },
          { id: "B", texto: "Explicar que o valor está na faixa natural (Classe 1), registrar o resultado e usar o ponto como referência de comparação.", certa: true,
            retorno: "Correto. Comunicar risco com clareza também é trabalho técnico: nem alarme falso, nem descuido." },
          { id: "C", texto: "Pedir só uma nova análise de fertilidade (NPK e matéria orgânica) para confirmar se o solo está bom para o plantio.", certa: false,
            retorno: "NPK não responde sobre contaminação." }
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------- FINAL */
  final: {
    titulo: "Missão cumprida",
    sintese:
      "Aparência não garante qualidade do solo. Para saber se ele está contaminado, é preciso levantar o histórico do terreno, " +
      "verificar os poluentes suspeitos e comparar o laudo com os valores orientadores (VRQ, VP e VI) da Resolução CONAMA nº 420/2009.",
    tarefa:
      "Agora é a sua vez. Escreva, com suas palavras, uma reflexão objetiva sobre cada um dos três eixos. " +
      "Esse é o Roteiro de Mediação da sua equipe técnica para a Primeira Leitura do Território.",
    niveis: [
      { min: 0, nome: "Técnica(o) em formação" },
      { min: 800, nome: "Técnica(o) de campo" },
      { min: 1300, nome: "Técnica(o) investigador(a)" },
      { min: 1650, nome: "Referência técnica do território" }
    ]
  },

  guia: {
    titulo: "Guia do professor",
    blocos: [
      { t: "Para quem", d: "Estudantes do curso Técnico em Meio Ambiente. Componente Normas CETESB, Unidade 4, Aula 1: Parâmetros da qualidade do solo." },
      { t: "Objetivo", d: "Reconhecer que a avaliação da qualidade do solo depende do histórico da área, dos poluentes suspeitos e dos critérios técnicos (VRQ, VP e VI), nunca apenas da aparência." },
      { t: "Duração", d: "De 20 a 30 minutos. Pode ser jogado individualmente ou em grupos, projetado para a turma ou em computadores e celulares." },
      { t: "Em grupos", d: "Combine os papéis: facilitador(a), relator(a), controlador(a) do tempo e porta-voz. O relator registra as 3 reflexões e a frase-síntese da tela final; o porta-voz apresenta na plenária." },
      { t: "Sobre os dados", d: "VP e VI: Resolução CONAMA nº 420/2009, Anexo II (mg/kg de peso seco, uso agrícola). VRQ de Minas Gerais: DN COPAM nº 166/2011. Os laudos dos potes e dos pontos P1 a P5 são fictícios, criados para o exercício. Em São Paulo, a CETESB tem valores orientadores próprios (Decisão de Diretoria nº 125/2021/E): vale comparar com a turma." },
      { t: "Áudio", d: "Música e efeitos ligam depois do primeiro toque na tela (regra dos navegadores). A narração usa a voz em português instalada no aparelho; se não houver, o botão fica desativado." }
    ],
    fontes: [
      "BRASIL. CONAMA. Resolução nº 420, de 28 de dezembro de 2009.",
      "MINAS GERAIS. COPAM. Deliberação Normativa nº 166, de 29 de junho de 2011.",
      "CETESB. Decisão de Diretoria nº 125/2021/E. Valores Orientadores para Solo e Água Subterrânea no Estado de São Paulo.",
      "DAMASCENO, R. O.; QUINTÃO, F. D. M.; TEODÓSIO, A. S. S. Desastres & agricultura familiar: análise no assentamento Pastorinhas em Brumadinho/MG. Retratos de Assentamentos, v. 27, n. 2, p. 77-92, 2024.",
      "SCHNEIDER, J.; PICANÇO, J.; SILVA, M. Contaminação do solo em Brumadinho e recuperação da vegetação. Grupo Criab/Unicamp, 2026.",
      "SÃO PAULO (Estado). SEDUC. Material Digital do Professor: Técnico em Meio Ambiente, Aula 1 (MABANO1C2B4S23A1)."
    ]
  }
};
