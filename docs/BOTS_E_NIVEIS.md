# Dimensions Stacks — Bots, níveis e calibração dos especiais

> Atualizado em 13/10/2026. Complementa [CARTAS_E_ESPECIAIS](CARTAS_E_ESPECIAIS.md). Testes em `prototipo/tests/` (bot_levels, sim_niveis, calib_mirror2, bot_strength).

## Níveis dos bots

| Nível | Lê a mesa | Erra o atributo | Ruído na ordem da mão | Cartas lembradas por rival | Esquece por disputa | Erra o custo de um especial |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fácil | 75% | 14% | alto | 3 | 8% | 40% |
| Médio | 88% | 6% | médio | 5 | 3% | 15% |
| Difícil | 100% | 1% | baixo | 10 | 0,2% | 1% |

O fácil nunca gasta um especial sem utilidade na situação, mas decide pior: às vezes sacrifica uma carta forte para virar especial e, quando é roubado, nem sempre entrega a menor carta.

Confrontos diretos (300 jogos, com especiais): fácil × médio 30/70; médio × difícil 40/60; fácil × difícil 21/79; em 3 jogadores 20/36/44.

## Memória dos bots

- Cada bot guarda, para cada rival, **a ordem do baralho ativo que conhece** (fila). Cartas jogadas voltam ao fim do baralho de quem as ganha, e o bot **vê essas capturas**: depois de uma volta ele conhece a ordem sem gastar especial.
- Espiadas (AE-091, 093, 100, 117) preenchem o início da fila; o bot usa a fila para prever a carta que o rival joga, escolher o atributo, ordenar as próprias cartas e escolher alvos de troca.
- Quando algo mexe no baralho de um rival à vista de todos (roubo, descarte, reordenação), quem não participou **perde a fila** dele.
- O limite de cartas lembradas por rival é 3 (fácil), 5 (médio) e **10 (difícil)**; antes o difícil lembrava tudo.

## Calibração de dois lados

`tests/calib_mirror2.js`: todas as cartas ganham o especial X e **todos os jogadores o usam** (as reações entram na conta); um jogador testa combinações de `val` (quanto vale gastar uma carta para prepará-lo) e `aiMul` (vontade de virar) em duelo, 3 e 4 jogadores. Só se adota a combinação que supera a política anterior por margem. Isso substituiu o teste de um lado, que não media especiais reativos.

Resultado com a política final (500 jogos por mesa, um bot que usa especiais contra bots que nunca usam): **55% no duelo** (justo 50%), **38% com 3 jogadores** (justo 33%), **31% com 4 jogadores** (justo 25%).

### Especiais que gastar a carta não compensa (candidatos a reforço)

Nestes, usar o especial rende menos do que lutar com a carta; o bot só os prepara em partida longa. Nas cartas fracas continuam aceitáveis; para valerem a carta de qualquer jogador, precisam de reforço.

| Especial | Nome | Cartas |
| --- | --- | --- |
| AE-009 | Superação | — |
| AE-018 | Defesa → Ataque | — |
| AE-020 | Velocidade → Inteligência | — |
| AE-024 | Ataque obrigatório | S07 |
| AE-025 | Defesa obrigatória | — |
| AE-026 | Forçar ataque rival | D02 |
| AE-029 | Proibir a defesa rival | — |
| AE-051 | Troca escolhida | D07 |
| AE-057 | Passe à esquerda | — |
| AE-058 | Passe à direita | — |
| AE-063 | Troca entre vizinhos | V14 |
| AE-064 | Transferência de reserva | — |
| AE-065 | Tríplice transferência | — |
| AE-070 | Conquista compensada | — |
| AE-091 | Revelar a mão | D08 |
| AE-092 | Próximas três | D10, M05 |
| AE-094 | Inversão de fila | D09 |
| AE-096 | Quebrar o plano | J02, J10 |
| AE-098 | Organizar reserva | D16 |
| AE-099 | Reforçar o fim | D01 |
| AE-100 | Confundir próximo turno | V16, M04 |
| AE-102 | Capturar defensor | — |
| AE-107 | Iniciativa contra fracos | — |
| AE-108 | Negar captura inimiga | V17 |
| AE-111 | Ativação forçada | M10 |
| AE-114 | Desvio de alvo | V12 |
| AE-119 | Preparação urgente | — |
| AE-121 | Defesa → Velocidade | — |
| AE-122 | Velocidade → Defesa | — |
| AE-125 | Permutar Ataque e Defesa | — |
| AE-128 | Permutar Defesa e Velocidade | — |

## Revisões desta rodada

- **AE-106 Ataque que bane:** capturar já era melhor que banir, então ninguém o usaria. Novo efeito (autorizado pelo autor): captura normalmente e **as 2 cartas do topo** do baralho de 1 derrotado vão ao Buraco Negro. Com 1 carta o especial ainda rendia menos que a carta gasta (medido); com 2 fica positivo.
- **AE-063 Troca entre vizinhos:** quem usa escolhe, **às cegas (pela posição no baralho)**, 1 carta de cada vizinho e elas trocam de dono. O bot só usa quando lembra cartas que permitam tirar uma forte do líder; em duelo continua sem efeito. Mesmo assim o teste de dois lados a mostra fraca.
- Textos anteriores estão em `dados/historico/habilidades_129_antes_2026-10-13.json`.
