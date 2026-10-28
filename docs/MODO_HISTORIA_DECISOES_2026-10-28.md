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
