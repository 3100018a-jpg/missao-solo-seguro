# Missão Solo Seguro

**Investigação no Assentamento Pastorinhas (Brumadinho/MG)**

Jogo investigativo para estudantes do **Técnico em Meio Ambiente**, ligado ao componente *Normas CETESB*, Unidade 4, Aula 1: *Parâmetros da qualidade do solo*.

A ideia central do estudo de caso: **aparência não garante qualidade do solo**. Para saber se um solo está contaminado é preciso levantar o histórico do terreno, verificar os poluentes suspeitos e comparar o laudo com os valores orientadores (VRQ, VP e VI) da Resolução CONAMA nº 420/2009.

---

## Como o jogo funciona

| Fase | Nome | O que a turma faz | Medalha |
| --- | --- | --- | --- |
| 1 | O teste cego | Escolhe entre dois potes de solo, vê o laudo e separa pistas de **fertilidade** e de **segurança ambiental** | Olhar Crítico |
| 2 | Histórico e uso da terra (Eixo 1) | Assiste à animação do rompimento da barragem, monta a linha do tempo e escolhe a pergunta de mediação | Detetive do Histórico |
| 3 | Poluentes suspeitos e fonte (Eixo 2) | Liga fontes aos poluentes e monta um pedido de análises com orçamento limitado | Rastreador de Fontes |
| 4 | Critérios da CONAMA 420 (Eixo 3) | Explora a régua VRQ / VP / VI, enquadra 5 amostras nas classes 1 a 4 e responde a uma pergunta bônus | Guardião da Norma |
| 5 | Decisão técnica | Resolve 3 casos com cronômetro (bônus por rapidez) | Decisão Responsável |
| Final | Relatório de campo | Escreve as 3 perguntas do Roteiro de Mediação e a frase-síntese; copia, baixa ou imprime o relatório | — |

**Gamificação:** pontos de experiência (XP), barra de *Confiança da comunidade* (cai a cada erro), 5 medalhas, cronômetro na fase final, níveis de desempenho e recorde salvo no aparelho.

**Duração:** 20 a 30 minutos. Funciona individualmente, em grupos (papéis: facilitador, relator, controlador do tempo e porta-voz) ou projetado para a turma toda.

**Guia do professor:** botão no rodapé do jogo. Ele também permite pular direto para qualquer fase.

---

## Publicar no GitHub Pages (passo a passo, sem programar)

1. Entre em [github.com](https://github.com) e clique em **New repository**.
2. Dê um nome (ex.: `missao-solo-seguro`), deixe como **Public** e clique em **Create repository**.
3. Na página do repositório, clique em **uploading an existing file**.
4. Descompacte o arquivo `.zip` no seu computador e **arraste todo o conteúdo da pasta** (o `index.html` e as pastas `css`, `js`, `audio` e `ferramentas`) para a área de upload. Clique em **Commit changes**.
5. Vá em **Settings → Pages**. Em *Build and deployment*, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e clique em **Save**.
6. Aguarde 1 a 2 minutos. O endereço do jogo aparecerá no topo da página de configurações, no formato:
   `https://SEU-USUARIO.github.io/missao-solo-seguro/`

> Importante: o arquivo `index.html` precisa ficar na **raiz** do repositório, e não dentro de uma subpasta.

### Usar sem internet
Também dá para abrir o `index.html` direto do computador (duplo clique). O jogo e o áudio funcionam; apenas as fontes tipográficas especiais são trocadas por fontes do sistema.

---

## Áudio

| Arquivo | Uso |
| --- | --- |
| `audio/tema_campo.mp3` | Música de fundo (abertura, mapa e fases de campo), em loop |
| `audio/tema_laboratorio.mp3` | Música de fundo (laboratório e decisões), em loop |
| `audio/acerto.mp3`, `erro.mp3`, `clique.mp3`, `selecionar.mp3` | Retorno das ações |
| `audio/conquista.mp3`, `fase.mp3`, `vitoria.mp3` | Medalhas e final |
| `audio/lama.mp3`, `carimbo.mp3`, `papel.mp3`, `tique.mp3`, `transicao.mp3` | Efeitos das cenas |

- Formato **MP3**, compatível com Chrome, Edge, Firefox e Safari, no computador, Android e iPhone.
- Todos os sons foram **sintetizados por código** (script em `ferramentas/gerar_audio.py`). Não há amostras de terceiros: podem ser usados e publicados livremente.
- Pela regra dos navegadores, o som só começa **depois do primeiro clique** na tela.
- Botões no canto inferior direito ligam e desligam **música**, **efeitos** e **narração**.
- A **narração** lê os textos em voz alta com a voz em português instalada no aparelho (Web Speech API). Ela vem desligada, para que vários computadores na mesma sala não falem ao mesmo tempo. Cada tela também tem um botão **Ouvir**.

---

## Estrutura dos arquivos

```
index.html              página do jogo
css/estilo.css          visual e animações
js/conteudo.js          TODOS os textos, perguntas e valores (edite aqui)
js/cenas.js             ilustrações animadas em SVG
js/audio.js             música, efeitos e narração
js/jogo.js              lógica do jogo
audio/                  arquivos MP3
ferramentas/            script que gerou os sons (opcional)
```

### Como adaptar o conteúdo
Abra `js/conteudo.js` no próprio GitHub (ícone de lápis) e altere textos, alternativas (`certa: true` marca a correta), valores dos laudos ou os casos da fase 5. Salve com **Commit changes**; o site se atualiza em 1 a 2 minutos.

---

## Sobre os dados técnicos

- **VP e VI (uso agrícola):** Resolução CONAMA nº 420/2009, Anexo II (mg/kg de peso seco). Níquel: VP 30, VI 70. Chumbo: VP 72, VI 180.
- **VRQ:** definido por cada estado. Como o caso fica em Minas Gerais, o jogo usa a DN COPAM nº 166/2011 (Níquel 21,5; Chumbo 19,5 mg/kg).
- **Ferro e manganês:** a CONAMA 420 não traz VP nem VI para solo, apenas Valor de Investigação para água subterrânea (Fe 2.450 µg/L; Mn 400 µg/L). O jogo usa isso numa pergunta bônus.
- **Os laudos dos potes A e B e dos pontos P1 a P5 são fictícios**, criados para fins didáticos.
- Em São Paulo, a CETESB tem valores orientadores próprios (Decisão de Diretoria nº 125/2021/E). Vale propor à turma a comparação.

## Referências

- BRASIL. CONAMA. Resolução nº 420, de 28 de dezembro de 2009.
- MINAS GERAIS. COPAM. Deliberação Normativa nº 166, de 29 de junho de 2011.
- CETESB. Decisão de Diretoria nº 125/2021/E. Valores Orientadores para Solo e Água Subterrânea no Estado de São Paulo.
- DAMASCENO, R. O.; QUINTÃO, F. D. M.; TEODÓSIO, A. S. S. Desastres & agricultura familiar: análise no assentamento Pastorinhas em Brumadinho/MG. *Retratos de Assentamentos*, v. 27, n. 2, p. 77-92, 2024.
- SCHNEIDER, J.; PICANÇO, J.; SILVA, M. Contaminação do solo em Brumadinho e recuperação da vegetação. Grupo Criab/Unicamp, 2026.
- SÃO PAULO (Estado). SEDUC. Material Digital do Professor: Técnico em Meio Ambiente, Aula 1 (MABANO1C2B4S23A1).
