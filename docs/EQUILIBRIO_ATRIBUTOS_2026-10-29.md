# Equilíbrio entre atributos — medição e proposta (29/10/2026)

Status: **proposta, nada aplicado**. Script: `prototipo/tests/balanco/atributos.js`.

## Medição (CPU difícil, 2/3/4 jogadores, 60 partidas de cada)
A regra da disputa é simétrica: vence o maior valor do atributo escolhido, qualquer que seja o atributo. Taxa de vitória de quem escolhe cada atributo, por faixa de valor:

| Faixa | FOR | RES | INT | VEL |
|---|---|---|---|---|
| 85+ | 73% | 70% | 73% | 75% |
| 70–84 | 40% | 41% | 32% | 38% |
| 55–69 | 16% | 17% | 10% | 11% |

Valores altos (85+) já são equivalentes. Nas faixas médias a Inteligência perde 6–8 pontos percentuais com o mesmo valor, porque o conjunto de cartas tem INT mais alta (o mesmo valor vale menos contra os adversários).

Média de cada atributo nas 133 cartas: FOR 55,2 · RES 60,7 · INT 65,8 · VEL 59,8. Cartas com o atributo como melhor da carta: FOR 32 · RES 32 · INT 37 · VEL 36.

## Proposta
Mover até 8 pontos de INT para FOR em 54 cartas em que INT não é o pico (soma e pico da carta não mudam, então raridade e totais ficam iguais; carta forte em INT/VEL mantém FOR ≤ 70). Efeito: média FOR 55,2→58,1 e INT 65,8→62,9, reduzindo a diferença pela metade. Para igualar totalmente seria preciso mexer também no pico de cartas, o que decide a identidade da carta; deixado para você.

| Id | Carta | Antes (FOR/RES/INT/VEL) | Depois | Pontos |
|---|---|---|---|---|
| J01 | Jokara Amarëa | 54/92/67/24 | 62/92/59/24 | 8 |
| J02 | Nestira Amarëa | 23/70/61/59 | 31/70/53/59 | 8 |
| J04 | Gabasteri | 65/68/69/81 | 70/68/64/81 | 5 |
| J07 | Mariv | 38/65/59/83 | 46/65/51/83 | 8 |
| J21 | Nefestra | 48/67/69/76 | 56/67/61/76 | 8 |
| J22 | Sefter | 58/41/54/69 | 66/41/46/69 | 8 |
| J23 | Kedran | 33/22/54/72 | 41/22/46/72 | 8 |
| J24 | Litara | 34/58/62/71 | 42/58/54/71 | 8 |
| J26 | Sumo Vigia | 40/99/87/29 | 48/99/79/29 | 8 |
| J28 | Kalan Nular | 52/86/56/62 | 60/86/48/62 | 8 |
| J34 | Efepar | 40/48/60/79 | 48/48/52/79 | 8 |
| J35 | Liri | 12/30/52/61 | 20/30/44/61 | 8 |
| J37 | Yndra | 34/92/64/39 | 42/92/56/39 | 8 |
| V01 | Breno Lins | 77/90/70/65 | 85/90/62/65 | 8 |
| V02 | Bruno Lins | 67/69/64/95 | 70/69/61/95 | 3 |
| V07 | Lucan Veline | 29/38/71/72 | 37/38/63/72 | 8 |
| V08 | Garmande Koraveli | 72/80/70/47 | 80/80/62/47 | 8 |
| V09 | Ricochet Bombergue | 67/57/76/90 | 70/57/73/90 | 3 |
| V11 | Garien | 64/70/63/65 | 70/70/57/65 | 6 |
| V21 | Shirley Ainsworth | 58/47/68/71 | 66/47/60/71 | 8 |
| V22 | Nicolas Corvane | 48/69/65/60 | 56/69/57/60 | 8 |
| V24 | Maria Santoro | 25/53/61/81 | 33/53/53/81 | 8 |
| V25 | Eshley | 43/69/68/54 | 51/69/60/54 | 8 |
| V26 | Átila | 44/66/88/95 | 52/66/80/95 | 8 |
| V27 | Farol | 12/30/55/78 | 20/30/47/78 | 8 |
| V28 | Ferris Montfort | 55/66/82/93 | 63/66/74/93 | 8 |
| V30 | Jack Lins | 55/58/47/44 | 58/58/44/44 | 3 |
| V36 | Karoli Morger | 82/95/62/60 | 90/95/54/60 | 8 |
| V42 | Mereditha | 58/85/66/48 | 66/85/58/48 | 8 |
| S02 | Amanda | 50/70/73/89 | 58/70/65/89 | 8 |
| S03 | Eric | 27/22/74/88 | 35/22/66/88 | 8 |
| S05 | Kord | 77/82/54/52 | 82/82/49/52 | 5 |
| S07 | Buni | 53/73/50/21 | 61/73/42/21 | 8 |
| S08 | Vivian | 8/35/83/86 | 16/35/75/86 | 8 |
| S09 | Capitã Nastácia | 69/89/70/63 | 77/89/62/63 | 8 |
| S12 | Vek | 58/71/65/25 | 66/71/57/25 | 8 |
| S13 | Capitão Tzough | 66/78/69/37 | 74/78/61/37 | 8 |
| S15 | Tersário | 69/90/52/53 | 77/90/44/53 | 8 |
| S17 | Luna Stellar | 66/69/55/53 | 69/69/52/53 | 3 |
| S18 | Alekta | 65/37/54/70 | 70/37/49/70 | 5 |
| D02 | Priscila Fontenelle | 65/69/68/31 | 69/69/64/31 | 4 |
| D03 | Pedro Souza | 53/79/70/34 | 61/79/62/34 | 8 |
| D07 | Ingrid Marques | 73/92/67/43 | 81/92/59/43 | 8 |
| D08 | Glenda Mendes | 58/64/76/86 | 66/64/68/86 | 8 |
| D09 | Diego Tavolieri | 67/44/46/81 | 70/44/43/81 | 3 |
| D10 | Sra. Olívia | 60/80/67/25 | 68/80/59/25 | 8 |
| D19 | Manu | 34/67/57/48 | 42/67/49/48 | 8 |
| M01 | Hyde | 65/88/86/65 | 73/88/78/65 | 8 |
| M02 | Agente Sete | 78/88/66/68 | 86/88/58/68 | 8 |
| M05 | Padre Tomas | 27/71/53/26 | 35/71/45/26 | 8 |
| M12 | James Harrow | 68/81/65/49 | 76/81/57/49 | 8 |
| B02 | Tack Ergson | 19/36/54/71 | 27/36/46/71 | 8 |
| B03 | Jork Caravel | 30/62/54/72 | 38/62/46/72 | 8 |
| B05 | Primus Senan | 62/82/66/25 | 70/82/58/25 | 8 |

## Especiais
As 133 cartas base têm especiais únicos (149 definidos, 16 livres). As 13 cartas Quasar usam o especial da carta base (6 especiais compartilhados); os 8 príncipes lendários precisarão de 8 especiais novos e só sobram 16 livres, que são conversões fracas.
