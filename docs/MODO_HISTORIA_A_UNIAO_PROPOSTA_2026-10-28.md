# A União — Modo História: proposta de design (28/10/2026)

> Estado: **PROPOSTA, nada implementado.** Reúne o que entendi do pedido, sugestões, problemas a resolver e números estimados. Itens marcados **[DECIDIR]** precisam da sua resposta antes de criar.

## 1. Veredito

**Dá certo e encaixa bem no motor atual.** O jogo já tem tudo o que um modo história precisa: partidas 1×1 a 4 jogadores, nível de CPU por jogador, eventos (fenômenos), especiais desligáveis, atributo bloqueado e captura de cartas. Faltam três peças pequenas no motor (baralhos fixos, regras de batalha extras, "atributo proibido" fixo) e todo o resto é conteúdo, tela do mapa e balanceamento.

O maior risco não é técnico: é **o conteúdo** (cerca de 49 baralhos de inimigos com tema, nome e fala) e **o equilíbrio** (nenhum inimigo apelão). Os dois têm solução com o que já temos: os livros do projeto para os temas e as simulações CPU × CPU para o equilíbrio.

## 2. O que entendi

1. Mapa em forma de **teia**: círculos concêntricos ligados por raios, com **bifurcações**. Cada nó é uma batalha.
2. **4 pontos de partida** possíveis (nas bordas), sorteados.
3. Vencer um inimigo **abre o caminho** (único ou bifurcado). Caminhos fechados ficam **escuros**.
4. Cada inimigo tem um **baralho fixo de 7 cartas** com um **tema**. Antes do duelo, o jogador vê 7 cartas escuras com "?". Depois de duelar (ganhando ou perdendo), o mapa passa a mostrar as cartas do inimigo.
5. O jogador **ganha as cartas que capturar**, mas **só se derrotar o inimigo**. Vale a carta capturada mesmo que ele a perca de volta durante a partida.
6. As cartas vão para a **coleção do modo história** (bestiário). Dá para **reenfrentar** um inimigo para pegar uma carta que falta.
7. Objetivo: reunir **todas as cartas** e então enfrentar o **Boss final**, na **área central** da teia.
8. **Minibosses**: duelos de 2, 3 ou 4 participantes, mais difíceis, com mais cartas, que funcionam como **travas** entre áreas.
9. Raridade: as mais raras aparecem pouco. **Toda lendária fica com exatamente um inimigo.** Cartas comuns se repetem entre inimigos.
10. Batalhas **variadas**: algumas com fenômenos, outras sem especiais, outras sem Inteligência etc., mas **a maioria normal**, principalmente no começo.
11. O jogador escolhe quais cartas leva, e precisamos de um motivo para **não usar sempre as mesmas fortes**.
12. Cartas que o jogador **não possui** aparecem marcadas nos duelos. Capturar uma carta nova gera **feedback**, com **som diferente por raridade**.

## 3. Pontos a corrigir ou esclarecer antes de criar

| # | Ponto | Minha sugestão |
|---|---|---|
| 1 | **Quantas cartas por lado: 6 ou 7?** Você escreveu 7 para o inimigo e 6 na mão do jogador e nas cartas escuras. O motor hoje trabalha com **mínimo de 7** (7 no baralho, o resto na reserva). | **7 contra 7**, como no jogo normal. Com 6, preciso mexer na regra de preparação. **[DECIDIR]** |
| 2 | **Captura só vale com ataque.** Nas regras, quem vence por Força ou Inteligência **captura** as cartas; quem vence por Resistência ou Velocidade **manda as cartas do rival ao Buraco Negro**. Cartas no Buraco Negro não são capturadas. Se vale só captura, vencer defendendo não rende nada. | **Valer toda carta que você tirar do inimigo**, capturada ou mandada ao Buraco Negro, desde que você vença a partida. Evita a frustração de vencer sem ganhar nada. **[DECIDIR]** |
| 3 | **Como abre o Boss.** "Pegar todas as cartas e depois ir ao Boss" colide com o Boss ter cartas que só ele tem. | O centro abre ao vencer os **4 guardiões** (um por quadrante). O Boss usa **7 cartas exclusivas dele**, e o **100% do bestiário** vira a conquista final (a coleção completa depois de vencê-lo). **[DECIDIR]** |
| 4 | **Coleção do modo história é separada da coleção normal?** | **Separada.** As partidas livres e online dão cartas aleatórias, então desbloquear cartas lá não mudaria nada. O bestiário vale só para a jornada. |
| 5 | **Cartas iniciais.** | **14 cartas** (comuns e raras, sem lendárias), para sempre poder escolher 7 e ainda montar reserva nos minibosses. **[DECIDIR]** se é igual nos 4 cantos ou muda por canto (mais rejogabilidade). |
| 6 | **Minibosses "mais cartas".** | Inimigo com **14 cartas** (7 no baralho + 7 na reserva), igual à partida normal. O jogador também leva 14. |

## 4. O mapa

### 4.1 Estrutura

```
              Borda externa: 4 pontos de partida (sorteados)
                     |         |         |         |
   Quadrante A   Quadrante B   Quadrante C   Quadrante D      (8 nós cada)
        \             |            |             /
         '-- guardião (miniboss) fecha cada quadrante --'
                         |
                 Anel interno (8 nós)
                         |
                   BOSS (centro)
```

- A teia tem **3 anéis**: borda (quadrantes), anel interno e centro. Entre os anéis há **raios** com bifurcações. Em cada quadrante, depois do 3º nó, o caminho se divide em dois ramos que voltam a se unir antes do guardião. Um ramo tem batalha de regra especial, o outro tem um elite.
- Você começa num dos 4 quadrantes e **pode migrar** pelo anel externo para outro quadrante depois de passar o guardião do seu.
- Fluxo por quadrante: 4 batalhas normais, 2 batalhas de regra, 1 elite (baralho forte, geralmente com épica ou lendária) e 1 guardião.

### 4.2 Quantas batalhas

| Tipo | Por quadrante | Total | Quem enfrenta |
|---|---|---|---|
| Normal | 4 | 16 | você × 1 inimigo (7 cartas) |
| Regra especial | 2 | 8 | você × 1 inimigo |
| Elite | 1 | 4 | você × 1 inimigo, com carta épica ou lendária |
| Guardião (miniboss) | 1 | 4 | você × 2 inimigos (3 jogadores), 14 cartas cada |
| Anel interno: regras difíceis | n/a | 4 | você × 1 inimigo |
| Anel interno: elites com lendária | n/a | 2 | você × 1 inimigo |
| Anel interno: minibosses | n/a | 2 | você × 3 inimigos (4 jogadores), 14 cartas cada |
| **Boss final** | n/a | 1 | você × 1 inimigo, 7 cartas exclusivas |
| **Total** | | **41 batalhas** | **49 baralhos de inimigos** |

- **Cobertura de cartas.** 49 baralhos × 7 cartas dão cerca de 340 vagas para 102 cartas, em média 3,3 cópias por carta. A distribuição por raridade seria: lendária 1 cópia (13 no total, uma por inimigo), épica cerca de 2 (40 vagas), rara cerca de 3 (100 vagas), comum cerca de 4 a 5 (160 vagas).
- **Duração.** Um duelo 1×1 de 7 cartas dura cerca de 3 a 5 minutos. A jornada completa leva **de 3 a 4 horas**, sem contar repetições para pegar cartas.
- **Versão enxuta para o primeiro teste (corte vertical):** 1 quadrante completo (8 nós) com guardião, bestiário e salvamento. Valida a ideia antes de fazer os outros 3 e o centro.

### 4.3 Inspiração Smash Ultimate

- Do **modo Clássico:** caminho em ramos e confrontos com regras diferentes por nó.
- Do **Mundo das Luzes:** mapa grande que vai se abrindo, com trava por chefe.
- Dos **Espíritos:** regras de batalha como modificadores (sem especiais, atributo proibido). É exatamente a sua ideia de batalhas variadas.

## 5. Inimigos e temas

Cada inimigo tem **nome, avatar (a carta líder dele), tema, 7 cartas fixas, nível de CPU e uma fala de abertura e fechamento**. O baralho é **sempre o mesmo**, e a ordem das cartas muda a cada tentativa para a repetição não ser decorada.

### 5.1 Temas possíveis (do elenco atual; os livros vão refinar)

| Tema | Cartas candidatas |
|---|---|
| Patrulha de Korvo | Korvo, Anasin, Saliens, Gary, Velho-Sábio |
| Os Irmãos Lins | Breno, Bruno, Banjo, Beatriz, Tio Frank |
| A Sociedade de Tayo | Erla, Lucan Veline, Garmande Koraveli, Ricochet, Brenda Koraveli |
| Aprendizes de Belfex | Maria Santoro, Eshley, Nicolas, Erick, Shirley, McCroys |
| Aracnas e Obbs | Facka, Lanigiah, Grande Pai Gaia, Seti |
| Casa Polar | Kaelina, Alyra, Selina, Dareth, Daryon, Vetarius |
| Os Três Eixos *(miniboss de 3)* | Nefestra (passado), Kedran (presente), Sefter (futuro) |
| Calandrir | Cal Edran, Cal Kadrir, Cal Kerath, Rendar |
| Tripulação de Jasmey | Jasmey, Amanda, Eric, Hardman, Kord, O'reilly, Buni, Vivian |
| Piratas rivais | Genrir, Vek, Tzough, Alekta, Luna Stellar |
| Lebargan | Nastácia, Jelles, Tersário, A Besta |
| **A Família** *(miniboss de 4)* | O Pai, A Mãe, A Avó, O Cão (demônios dos sentidos, cada um com seu baralho) |
| Jovens investigadores | Junior, Priscila, Pedro, Kelly, Vinícius, Glenda |
| Espíritos | Jennifer, Ingrid, Suéten, Manu |
| SPAGE | Agente Sete, Agente Seis, Helena Valença, Hyde |
| Conspiração | Falkner, X, Harrow, Benjamin Karnudo |
| Irmãos senantes *(guardião de 2)* | Peredun e Primus Senan |
| **Vilãs** *(tema transversal)* | Alyra, Luna Stellar, Alekta, Nastácia, A Mãe, Lanigiah |

Temas transversais como "Vilãs", "Mentores", "Irmãos" e "Criaturas" juntam séries diferentes e dão variedade. Um inimigo pode misturar **tema** (3 a 4 cartas) com **cartas de apoio** de raridade comum para completar as 7.

### 5.2 Pesquisa nos livros

Vou usar os documentos do projeto (relatórios dos livros, guias de voz e propostas) para tirar de cada personagem: traço de personalidade, relações, conflitos e frases típicas. Isso vira (a) o agrupamento em temas, (b) o nome e a fala do inimigo e (c) o estilo da CPU (por exemplo, "pirata prefere Força", "investigador prefere Inteligência"). É a próxima etapa depois da sua aprovação.

### 5.3 Boss final

Sugestão: **7 das 8 cartas da União** (J03, V02, V15, S01, D06, M01, M10, B01 menos uma, escolhida por você). O selo da União é o símbolo do jogo, então o centro da teia é o lugar natural dele.

## 6. Regras de batalha

| Regra | Como funciona no motor | Quando aparece |
|---|---|---|
| Normal | partida padrão | maioria, 100% no começo |
| Com fenômenos | eventos ligados (já existe) | regras especiais e elites |
| Sem fenômenos | eventos desligados (já existe) | normais |
| Sem especiais | especiais desligados (já existe) | regras especiais |
| Atributo proibido | **fixo** (Inteligência, Força etc.), parecido com o Bloqueio Dimensional | regras especiais e difíceis |
| Só uma série | filtro no baralho do jogador | regras especiais |
| Limite de poder | soma máxima do poder das 7 cartas | veja seção 7 |
| Sem lendárias | filtro de raridade | regras difíceis |

Os dois primeiros nós de cada quadrante são sempre **normais**. Regras só começam do 3º nó em diante.

## 7. Como evitar que o jogador use sempre as mesmas cartas fortes

Combinar estas peças, da mais importante para a menos:

1. **Limite de poder por batalha (recomendado).** O "poder" de cada carta já existe (soma dos atributos + 16 × maior atributo). Mediana por raridade: comum 1.334, rara 1.549, épica 1.712, lendária 1.775. Sete lendárias somam cerca de 12.400, uma mistura típica cerca de 10.800. Um limite por batalha obriga a misturar fortes e fracas. Ele aparece como um **medidor no montador de baralho**, com valores sugeridos (sem limite nas primeiras, 11.000 no meio, 10.000 nas difíceis; a calibrar por simulação).
2. **Exigências temáticas.** "Pelo menos 3 cartas de Viajantes", "sem lendárias", "só uma série". Forçam a olhar o bestiário inteiro.
3. **Descanso (opcional).** As cartas usadas na última batalha ficam "descansando" na próxima. Só vale quando a coleção tiver 21 ou mais cartas, para não travar o começo.
4. **Incentivo, sem mexer em atributos.** Usar 3 ou mais cartas que você nunca usou na jornada dá o **dobro de XP de maestria**. Empurra a variedade sem punir.

## 8. Captura, recompensa e bestiário

- **Durante o duelo:** cartas que o jogador **não possui** ganham uma **faixa dourada "NOVA"** e contorno tracejado, nas duas mãos e na mesa. Isso deixa claro quais capturar. Tutorial do primeiro duelo: "Vença com Força ou Inteligência para capturar".
- **Recompensa:** só entra na coleção se o jogador **vencer** a partida. Se perder, as cartas do inimigo passam a aparecer reveladas no mapa, para planejar a próxima tentativa.
- **Repetidas:** carta que o jogador já tem vira **XP de maestria** da própria carta, em vez de se perder.
- **Bestiário (tela própria):**
  - Cartas que você tem: normais.
  - Cartas vistas num inimigo, mas sem posse: aparecem **escurecidas**, com "Em: nome do inimigo" e botão que **leva ao nó no mapa**.
  - Cartas nunca vistas: silhueta com **"???"**.
  - Contador **x / 102**, com divisão por raridade e por série.
- **Dica após 3 derrotas:** o mapa mostra a **ordem do baralho** do inimigo naquela tentativa, para quem trava numa carta.

## 9. Interface e feedback

### 9.1 Mapa

- Desenhado em **SVG** com arrastar e zoom por pinça. O quadrante atual abre centralizado, e o botão **"Continuar"** leva ao nó disponível.
- **Nós:** círculo normal, ícones de regra (raio para fenômenos, ✕ para sem especiais, ícone do atributo proibido), **hexágono** para elite, **hexágono grande com silhuetas de 2 a 4 rostos** para minibosses, **selo da União** no centro.
- **Estados:** fechado (escuro, linha fina apagada), disponível (pulsando), vencido (aceso, com marca de cartas ganhas), repetível.
- **Fios:** o caminho vencido **acende em fio de teia** com um brilho que corre até o próximo nó. Quando um guardião cai, o anel interno se **ilumina por inteiro**, uma animação mais longa.
- **Toque num nó:** painel inferior com nome e avatar do inimigo, tema, chips de regra (limite de poder, atributo proibido), as **7 cartas** (reveladas ou "?", marcadas com **NOVA** as que faltam), resultado dos duelos anteriores e botão **Montar baralho**.
- **Cabeçalho fixo:** contador x / 102 e atalho para o bestiário.
- Respeita o modo "reduzir movimento" que o jogo já tem.

### 9.2 Montagem do baralho

- Lista das cartas que você possui, com filtros (série, raridade) e busca. **Medidor de poder** quando houver limite. Avisos das exigências temáticas. Botão **"Sugerir"** que monta um baralho válido, para quem não quer escolher.

### 9.3 Recompensas após a vitória

- Tela "Recompensas": a pilha de cartas capturadas **vira uma a uma**, da mais comum para a mais rara (suspense crescente). Cada carta mostra **NOVA** ou **"Já tinha +XP"**. Fecha com o contador do bestiário.

### 9.4 Som e efeito por raridade

| Raridade | Som | Visual |
|---|---|---|
| Comum | toque curto e claro | clarão branco discreto |
| Rara | dois toques ascendentes | brilho azul e partículas |
| Épica | crescendo com reverberação | brilho roxo, ondas, partículas |
| Lendária | fanfarra longa de sintetizador | dourado, tela inteira, tremor, carta ampliada |
| União (selo) | acorde iridescente sobre a fanfarra | arco-íris, como a aura atual |

Os sons são sintetizados (Web Audio, como os atuais). Posso gerar **2 a 3 variantes por raridade** na tela de sons do admin para você escolher, como fizemos com os efeitos.

## 10. Mudanças técnicas no motor

| Mudança | Esforço |
|---|---|
| Baralhos fixos (`decks:[[ids],[ids]]`) no lugar do sorteio, com ordem embaralhada por tentativa | pequeno |
| Atributo proibido fixo, reaproveitando o mecanismo do Bloqueio Dimensional | pequeno |
| Filtro de poder, série e raridade no montador | pequeno (só interface) |
| CPU com nível e estilo próprios por inimigo (o motor já guarda nível por jogador) | pequeno |
| Registro de "cartas tiradas do inimigo" durante a partida, para a recompensa | médio |
| Salvamento da jornada (mapa, vitórias, bestiário, canto de partida) no aparelho e na nuvem do perfil | médio |
| Tela do mapa, painel de nó, montador, recompensas, bestiário | **maior parte do trabalho** |
| Conteúdo: 49 baralhos, nomes, falas | maior parte do trabalho |

Sem mudança em online, duplas ou privacidade: **o modo história é só offline**, um jogador.

## 11. Equilíbrio (nenhum inimigo apelão)

- Cada nó tem um **alvo de vitória** para um jogador "médio" (CPU nível Normal com baralho montado das cartas que ele teria naquele ponto): normais iniciais 75%, normais 65%, regras 55%, elites 50%, guardiões 45%, anel interno 40%, Boss 30% (CPU Difícil).
- Calibro por **simulação CPU × CPU** (a mesma que já usamos), ajustando nível da CPU e composição das 7 cartas até bater o alvo. Cartas lendárias nos inimigos fortes, mas nunca 7 delas no mesmo baralho antes do Boss.
- Teste automático que **falha** se um nó sair da faixa do alvo, para qualquer troca futura de cartas ou especiais não quebrar a jornada.

## 12. Riscos e como tratar

| Risco | Tratamento |
|---|---|
| Azar impede capturar uma carta específica | ordem embaralhada por tentativa + dica da ordem após 3 derrotas |
| Vencer defendendo e não ganhar nada | valer toda carta tirada do inimigo (ponto 2 da seção 3) |
| Mapa pesado ou apertado no celular | SVG simples, sem imagem de fundo pesada, testado em 400 px |
| Muito conteúdo a escrever | gerar rascunhos dos 49 inimigos pelos livros, você aprova por tema |
| Jogador travado sem cartas boas | guardião sempre tem caminho alternativo de nível menor no anel externo |
| Regras que se contradizem (ex.: "sem especiais" num baralho cheio de especiais) | teste automático valida cada nó antes de entrar no jogo |

## 13. Ordem sugerida

1. **Aprovação deste documento** (você responde os pontos **[DECIDIR]**).
2. **Corte vertical:** 1 quadrante, mapa, painel, montador, duelo com baralho fixo, recompensa, bestiário e salvamento. Você testa a sensação.
3. **Conteúdo e equilíbrio** dos outros 3 quadrantes e do anel interno.
4. **Boss, minibosses de 4 e o centro.**
5. **Polimento:** sons por raridade, animações do mapa, falas, tutorial do primeiro duelo.

## 14. Dois especiais novos para o jogo base

> Ainda não criei: as duas ideias mexem em regra e têm pontos em aberto. Preciso das suas respostas abaixo.

### 14.1 Névoa de Dados *(nome provisório)*

- **Efeito:** nesta disputa, **os rivais não veem os valores da própria carta** ao escolher o atributo; só quem usa o especial vê. O atributo continua tendo que ser do par permitido.
- **Quando age:** antes da escolha dos atributos (fase de controle, como os outros especiais desse tipo).
- **CPU:** não vê os valores, então escolhe o atributo **ao acaso** dentro das opções legais.
- **Perguntas:**
  1. "Só você" significa **você vê os valores de todos** ou **só os seus**? Sugiro que você veja só os seus e os rivais fiquem sem nenhum.
  2. Na dupla, o parceiro **continua vendo** (sugiro que sim).
  3. É um efeito de informação, sem mexer em números. Sugiro dá-lo a uma carta com especial fraco hoje; **qual carta?**

### 14.2 Clone *(nome provisório)*

- **Efeito:** ao fim da disputa, a **carta vencedora de um rival** (o jogo mostra qual) é **copiada para o final do seu baralho**, com a legenda **CLONE**. Uma **carta clone não pode ser clonada**.
- **Problemas a resolver:**
  1. O motor assume que **cada carta existe uma vez** (testes de conservação e de duplicata, privacidade, interface). O clone precisa de um identificador próprio (por exemplo `J08*`) que aponta para a carta original. É a parte de risco.
  2. Se **você** vence a disputa, não há carta rival vencedora: sugiro que o especial **não faça nada** (ou clone a melhor carta perdedora; **[DECIDIR]**).
  3. O clone **usa o especial** da carta original? Sugiro que sim.
  4. Clonar **lendária** é permitido? Sugiro que sim, já que a disputa foi disputada e perdida por você.
  5. Se o clone for capturado ou for ao Buraco Negro, vale como carta normal (sugestão).
  6. No modo história, o clone **nunca entra na coleção**.
- **Qual carta recebe o especial?** Depende do equilíbrio: faço a simulação antes de propor.

Quando você responder a seção 3 e a seção 14, crio o corte vertical do modo história e os dois especiais, nessa ordem.
