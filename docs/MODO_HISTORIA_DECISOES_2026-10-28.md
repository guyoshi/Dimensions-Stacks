# Modo história "A União": decisões do autor e plano por etapas (28/10/2026)

Complementa `MODO_HISTORIA_A_UNIAO_PROPOSTA_2026-10-28.md`. Onde há diferença, **vale este documento**.

## Decisões

- **Mapa:** grande, **assimétrico** (como um passeio), com nós de 1, 2 ou 3 caminhos. **100 batalhas** por ora, mais **5 lojas**. Posição, inimigo, cartas e evento de cada ponto são **sempre os mesmos**. Boss no **centro**.
- **Partida:** esquerda, cima, direita ou baixo, **sorteada** ao começar uma jornada nova.
- **Boss:** a **Besta é exclusiva do Boss**; as cartas da União (mesmo lendárias) podem aparecer também em outros inimigos. O Boss abre ao derrotar os **4 guardiões**, com feedback visual dele "abrindo" ao cair o último.
- **Cartas:** cada inimigo tem **7 cartas**. Cartas iniciais do jogador: **7 aleatórias fracas**, com inimigos iniciais igualmente fracos.
- **Captura:** só vale carta **realmente capturada** (ataque ou especial que captura). Carta que o inimigo usou como especial, ou que você derrotou sem capturar, não vem para você.
- **Coleção do modo história é separada da coleção do online.**
- **Nós:** círculos com **cores por tipo de batalha**; selo da União no centro.
- **Fenômenos não acontecem** nas batalhas. Cada batalha tem **eventos fixos** (3 segundos para decidir, inimigo com mais cartas, você com menos, status invertidos, ganha o menor, ganha o mais próximo de 50 etc.). Os bons podem virar fenômenos no futuro. **Cuidado de equilíbrio:** nenhum evento pode impedir a partida de terminar (ex.: Buraco Negro dando cartas sem fim); cada evento passa por teste de término.
- **Variedade de cartas:** limite de poder, exigências temáticas (sempre cumpríveis com as cartas que o jogador já tem, para nunca travar a jornada), **inimigos fortes na defesa** em batalhas sem ataque, e **descanso de carta** (barra por carta; quanto mais rara, mais cansa; carta não cansa em batalha perdida).
- **Pêndulos** (moeda vermelha com furo hexagonal, vinda de Viajantes Dimensionais): ganhos nas batalhas, mais nas difíceis. Servem para **descansar cartas** e **comprar cartas em 5 lojas** (caro, mas não proibitivo; promoção quando o jogador perde muito). Pontos a decidir: batalha já vencida paga? (sugestão: uns 25%).
- **Tela de entrada:** só **Novo jogo** e **Continuar**; a barra inferior some, como "um jogo dentro do outro".
- **Dados dos personagens:** buscar no GitHub "dimensões infinitas".
- Ao criar cartas novas, o sistema precisa saber **quantas vezes cada carta aparece no mapa** e **quais batalhas são substituíveis** para encaixá-las.

- **Batalhas de defesa** (sem ataque, não dá para capturar): servem para dar **pêndulos** e **avançar o caminho**; nunca guardam cartas exclusivas.
- **Becos sem saída:** vários, nem todo nó precisa ter continuação. Alguns becos têm **baús**: uns com **cartas** (quantidade aleatória, 1, 2 ou 3, a definir), outros com **pêndulos**.
- **Cartas iniciais (substitui "7 fracas aleatórias"):** **6 comuns e 1 épica**.

## Etapas

1. **Mapa navegável todo aberto, interface do mapa e tela inicial (Novo jogo / Continuar).** *Feita nesta versão.*
2. Coletar dados dos livros e **propor todas as batalhas** (inimigo, avatar, tema, 7 cartas), com o sistema contando as repetições de cada carta e marcando batalhas substituíveis.
3. **Eventos de cada batalha** (variedade, sem quebrar o equilíbrio).
4. **Corte vertical:** um quadrante jogável de ponta a ponta.

## Etapa 1: o que existe

- `tools/gerar_mapa_historia.py` gera `prototipo/historia_mapa.js` (semente 2820; **não regenerar** depois de aprovado: os ids dos pontos serão a referência de tudo). Ajustes pontuais por id vão em `dados/historia_ajustes.json`.
- Mapa: 105 pontos (53 normais, 24 de evento, 10 elites, 8 minibosses, 4 guardiões, 1 boss e 5 lojas), 112 caminhos, graus 1 a 4, distância mínima de 10 passos de qualquer partida até o Boss.
- `prototipo/historia.js`: tela inicial, sorteio da partida, mapa com arrastar, pinça e zoom, painel por ponto, vitórias de teste, abertura do Boss, caminhos acesos e escuros, progresso salvo no aparelho.
- **Modo teste (só nesta etapa):** "Mapa aberto" (todos os pontos liberados), "Marcar vencida" e "Zerar vitórias" na legenda (botão `?`).
- Teste automático: `prototipo/tests/run_historia.py`.

## Acréscimos de 28/10/2026 (noite)

- **O mapa não precisa parecer literalmente uma teia** (era só o exemplo). Pode mudar de aparência sem mexer nos ids dos pontos.
- **Música própria do modo:** mapa, batalha normal, miniboss e boss final. Ganchos prontos em `audio.js` (`HIST`, `histPlay`, `histStop`); basta colocar `historia_mapa.mp3`, `historia_batalha.mp3`, `historia_miniboss.mp3`, `historia_boss.mp3` em `prototipo/musica/`. Sem arquivo, nada muda. O mapa já chama a trilha do mapa; as demais entram na Etapa 4 (batalhas).
- **Tela de organizar cartas no início de TODA batalha:** o jogador escolhe a ordem das cartas toda vez; a interface precisa ser simples e rápida (a fazer na Etapa 4, com arrastar e atalhos "manter a ordem anterior" e "melhor ordem sugerida").
- **Evento "inimigo com as mesmas cartas que você":** é preciso organizar na ordem certa para vencer. Nesse evento a tela de organizar **não usa as cartas com "?"**: as cartas do inimigo aparecem abertas.
- **Novos especiais do jogo base (também usados no modo):** AE-143 Névoa de Dados (J22 Sefter, no lugar de AE-076) e AE-144 Clone (V22 Nicolas Corvane, no lugar de AE-078). Os especiais AE-076 e AE-078 ficaram em reserva.
- **Sem tela de sorteio:** o jogador começa em uma das 4 pontas, sorteada em silêncio.
- **O boneco anda casa por casa** (como o mapa do modo história do Smash Ultimate), sem pular para um ponto distante. Feito: boneco no mapa, caminhada animada ponto a ponto, posição salva. Regras: atravessa só pontos já vencidos (e lojas); o último passo pode ser um ponto novo, onde o boneco para e precisa duelar; parado num duelo pendente, só pode recuar para pontos vencidos. No modo teste ("mapa aberto") anda por qualquer caminho. Teste: `tests/run_historia_andar.py`.
- **Mapa sem a teia no fundo e menos redondo:** as posições passam por uma deformação suave por ângulo mais um pequeno desvio por ponto, aplicados ao carregar (`historia.js › organico`); ids e ligações não mudam. Folga mínima entre pontos: 52 unidades.

## Atualização 29/10/2026 (final, União e Boss)

- **Cinemática inicial:** história escrita em `prototipo/historia_cena.js` (Gerbe, Jasmey, Besta, União); no fim pergunta o **nome do jogador**. **Cinemática final** (`DS_CINEMATICA_FINAL`) toca ao vencer o Boss, com música própria (`historia_final.mp3`).
- **Besta no núcleo da galáxia** (o Boss fica no centro do mapa).
- **REGRA NOVA (autor): cada membro da União é libertado ao vencer um miniboss** (8 minibosses = 8 cartas da União: D06, M01, J03, B01, S01, M10, V15, V02). **O Boss só abre com os 4 guardiões vencidos E os 8 minibosses vencidos** (a União completa na equipe). Pendente de confirmação do autor: se os guardiões continuam obrigatórios além dos minibosses.
- **Boss:** difícil, inteligente e estratégico, com boas cartas. Proposta: **A Besta + as 6 lendárias mais fortes**, bot no nível mais forte (Etapa 4). As cartas da União não aparecem em inimigos.
- **Eventos:** um só ícone (raio); o painel do ponto mostra nome e regra do evento.
