# Minigames: Modo Hard (02/11/2026)

Liberado pela melhoria de fragmentos "Modo Hard dos minigames" (8 fragmentos, loja L5). Cada minigame tem abas Normal e Hard. O teste do menu de administrador também abre as duas abas.

## Regras gerais
- Prêmio do Hard: ×1,5 sobre a tabela do jogo. Só paga a melhora sobre o melhor resultado já feito no Hard (recorde separado por modo).
- Falhar no Hard nunca tranca a casa. Passar no Hard não conta como vitória do ponto e não dá broche (isso continua valendo só pelo Normal).
- O Hard de cada jogo tem regras próprias (parâmetros em `minigames.js`: `HARD_PROPRIO`, `HARD_CORTES`, `c.hard`). Os cortes de nota são os do Normal, salvo a Fechadura.
- A música do menu para ao iniciar o minigame e volta ao sair; jogos sem trilha ficam em silêncio.

## Regras por jogo (Hard)
| Jogo | Hard |
|---|---|
| Três Portais | 4 portais, 2 vazios (rodadas 1-2: pêndulos, passagem, 2 vazios; última: pêndulos, carta, 2 vazios) |
| Ecos Estelares | 8 pares, 100 s, folga de jogadas 24 |
| Fragmentos de Rosto | 12 cartas, 67 s no total, trechos menores (3 de 28-38 px) |
| Dança das Cartas | 5,5,6,6,7,8 cartas, trocas 30% mais rápidas, mais pares trocando; nas 2 últimas rodadas cruzam cometas, nebulosas e naves |
| Maré Rubra | todas as bolinhas mais rápidas (+12% vermelhas, +15% azuis); 2 amarelas (longe das demais, maiores, mais lentas, perseguem azuis; azul tocada vira amarela; amarela tocando vermelha a acelera até ×1,7) |
| Rota dos Meteoros | rochas 30% mais rápidas e 12% mais frequentes |
| Fechadura de Jasmey | 5 encaixes, 7 tentativas, 150 s; cortes .42/.56/.71 (Bom ≤5, Ótimo ≤4, Perfeito ≤3) |
| Eco das Notas | começa com 3 sons, 45% mais rápido, barra de tempo (0,85 s por som + 2,2 s), sem repetição nem escadinha |
| Relâmpago Dimensional | 5 cartas (+1, −1, −2, 2 vazias), cada rodada 1000→560 ms, meta 13 |
| Pêndulos Fugitivos | luz de 56 px (80 no Normal), +33% de itens, 27% deles "corrompidos" (apagam a tela por 2,6 s, com som ruim) |
| Sussurro dos Elos | 2 bombas enterradas (zumbido grave e áspero); confirmar em bomba zera a rodada |
| Resgate no Céu | 38 pessoas (28), mais gordos e diagonais, colisão entre os que caem |
| Cores dos Irmãos | começa com 4 bolinhas; encostar em outra bolinha perde a rodada; 2-3 barreiras com caminho garantido; mais tempo (34 s) |
| Constelação Pirata | 12 quadrados, 4-6 caveiras, meta 105; bomba (fim imediato, mantém os pontos) nos 75% finais, sempre colada em símbolos bons |
| Vigília Escura | 60 olhos, abre já com 3-4 abertos, mais olhos simultâneos |
| Maré, Chama e Gelo | 4ª pista (Vento, tecla F), 50 notas, queda 20% mais rápida |
| Chamado da União | ver abaixo |

## Mudanças no Normal (autorizadas pelo autor)
- **Dança**: 3 a 5 cartas aumentando a velocidade (antes 3 a 8).
- **Rota**: vão garantido de 54 px entre rochas que chegam quase juntas.
- **Resgate**: o tipo "rápido" virou o personagem **gordo** (cai mais rápido; sprite temporário).
- **Fechadura**: encaixes numerados, brilho dourado nos acertos e anel azul nos símbolos presentes, mais espaço para a lista de tentativas.
- **Chamado da União**: novo objetivo (proteger o Estírio). Calibrado em simulação.

## Chamado da União: Estírio
- O Estírio é uma bolinha brilhante, arrastável com velocidade limitada (200 px/s). Os 8 heróis também são arrastáveis e atacam sozinhos.
- Se um inimigo tocar o Estírio, os inimigos ganham: o resultado fica em no máximo 30% (pelo progresso das ondas).
- Sobreviver às 7 ondas: 40% + 60% × heróis vivos / 8 (qualquer sobrevivência já é "Bom").
- **Normal**: 40% dos inimigos vão ao Estírio, o resto aos heróis. **Hard**: todos vão ao Estírio.
- Novo inimigo **veloz**: vai direto ao Estírio. Normal: a partir da onda 4 (1-2 por onda). Hard: a partir da onda 2 (1-3 por onda).
- Calibração (`prototipo/tools/sim_uniao.js`, bot que forma anel ao redor do Estírio): Normal (contagem ×0,45, velocidade ×0,7) vence cerca de 70%; Hard (×0,55, ×0,8) cerca de 30%. Um jogador humano deve ir pior que o bot.

## Fechadura: tentativas (simulação com jogador que chuta código compatível com as dicas)
| Configuração | Média | em 5 | em 6 | em 7 |
|---|---|---|---|---|
| 4 encaixes, 6 símbolos (Normal) | 4,7 | 84% | 99% | 100% |
| 5 encaixes, 6 símbolos (Hard) | 5,1 | 71% | 96% | 100% |
| 5 encaixes, 7 símbolos | 5,5 | 49% | 86% | 99% |

Achado: no Normal, Bom e Ótimo exigem as mesmas 4 tentativas (cortes .34/.5 sobre (7 − tentativas)/6). Pendente de decisão do autor.

## Pendências de arte
- Disco da Fechadura com 5 encaixes (hoje os 5 encaixes ficam num pentágono sobre a imagem de 4).
- Sprite do personagem gordo (Resgate) e nota do Vento (Maré, Chama e Gelo): hoje temporários.
- Sprite do inimigo veloz (Chamado): hoje usa a mesma imagem da horda.


## Ajustes 02/11 (lote 11:32)
- **Todos os minigames**: ao terminar aparece "FIM!" (1,7 s, gongo) e só depois a pontuação. Abandonar pula o FIM.
- **Sons oficiais de resultado** (sintetizados): perdeu (descendente triste), Bom (2 notas), Ótimo (arpejo + brilho), Perfeito (fanfarra com brilho). Substituem os sons antigos do baú.
- **Dança** (ambos os modos): fim menos veloz (piso de velocidade 55 -> 105 ms; Hard 42 -> 81 ms).
- **Eco das Notas Hard**: 6 notas (grade 3x2); escolhe as menos usadas, sem repetir nota, par de notas já ouvido ou escadinha.
- **Relâmpago**: Hard com 6 cartas (1 +1, 1 -1, 1 -2, 3 vazias). **Normal mais lento no final** (abertura piso 300 -> 430 ms, intervalo piso 160 -> 230 ms) — mudança de balanceamento no Normal.
- **Vigília** (ambos): olhos nascem sem intervalo (sempre que faltam abertos); simultâneos Normal 2 a 4, Hard 3 a 5; tempo final dos olhos maior (Normal ~1,7 s, Hard ~1,6 s) — mudança de balanceamento nos dois modos.
- **Maré Rubra Hard**: amarelas nascem nas pontas laterais, dormem 3 s (sem mover nem converter) e as azuis nascem a >=115 px delas.
- **Rota**: dano da nave (som, flash vermelho, tremor, faíscas, piscada com 1,3 s de invulnerabilidade) e explosão ao perder (1,4 s) antes do FIM. **Hard**: meteoros grandes (16% das rochas, mais lentos) que, ao atingirem a nave, soltam 2 fragmentos diagonais; o vão mínimo (54 px) continua garantido e a invulnerabilidade cobre os fragmentos.

## Ajustes 02/11 (lote 11:45)
- **Pêndulos Fugitivos Hard**: luz do mesmo tamanho do Normal (80; antes 56).
- **Constelação Pirata Hard**: meta de pontos 105 -> 80 (igual ao Normal, para dar notas altas); bombas mais frequentes (a partir de 12% do tempo) e uma segunda bomba na metade final.
- **Cores dos Irmãos**: tempo TOTAL para as 6 rodadas (Normal 70 s, Hard 85 s, dividido pela dificuldade), sem limite por rodada; a pontuação continua por rapidez. **Hard**: barreiras ficam no caminho entre o centro (bolinhas) e cada alvo distante, nunca nos cantos; deslizam até 55 px (começam paradas por 2,5 s), nunca entram na zona central, sobre alvos ou perto de bolinhas, e não empurram ninguém. Bolinhas encostando uma na outra continuam perdendo a rodada.
- **Maré, Chama e Gelo**: um som musical por elemento ao acertar, com brilho/pulso na pista e no botão; Hard com janela de acerto menor (Perfeito 24 -> 18 px, Bom 68 -> 46 px).
- **Chamado da União**: bolinhas vermelhas piscando nas bordas indicam, 2,4 s antes, de onde vem a próxima horda (inclusive as velozes).
- **Admin**: cada minigame tem "Testar" (Normal) e "Testar Hard" (sem escolha dentro do jogo); botão "Zerar testes" no topo da tela de minigames.

## Lote 12:30 (02/11)
- **Mapa:** removido o brilho animado (filtro) de cada ponto e o blur 90 da máscara do fundo; só pontos disponíveis/selecionados flutuam. 29→60 fps no teste de arrasto. Visual igual.
- **Fechadura (Normal):** cortes .30/.45/.62 (Bom ≤5 tentativas, Ótimo ≤4, Perfeito ≤3 de 6). Hard igual.
- **BALANÇO Boss final:** Chamado Visão passa a dar +8 em todos os atributos na disputa; Elo +10. Simulação (`tests/sim_boss.js`, `sim_boss_chamados.js`): 8 União + melhores cartas ≈ 49–53% de vitória do bot nas 3 fases; 4 União 14%; sem União 1%; 3 guardiões vivos 0%. Todos os Chamados pesam 9–18 pontos.
- **BALANÇO Guardiões Cassiopeia/Orion (Dupla somada):** os dois guardiões fazem uma única escolha de atributo (antes cada um escolhia).
- Testes: `run_npcs.py` e `run_historia.py` atualizados.
