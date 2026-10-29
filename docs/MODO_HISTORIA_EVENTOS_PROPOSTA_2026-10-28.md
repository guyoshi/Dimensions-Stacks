# Modo história: proposta de eventos (Etapa 3, 28/10/2026)

**PROPOSTA aguardando aprovação.** Nada foi alterado no mapa nem no jogo. Respeita as decisões anteriores: fenômenos não acontecem; todo evento é fixo por ponto; nenhum evento pode impedir a partida de terminar (cada um passa por teste de término, 300 partidas simuladas, antes de entrar).

## Problema e solução

O mapa tem **53 batalhas normais** e só **24 eventos**. Proponho **19 normais + 58 eventos** (o resto do mapa não muda: 10 elites, 8 minibosses, 4 guardiões, 1 boss, 5 lojas). Os eventos usam **36 regras diferentes** (abaixo); cada regra aparece 1 a 3 vezes, e as mais fortes só nas regiões internas. Normal fica como "respiro" e quase só na região 1.

| Região | Normal (hoje → proposta) | Evento (hoje → proposta) |
|---|---|---|
| 1 externa | 24 → 13 | 8 → 19 |
| 2 média | 18 → 5 | 8 → 21 |
| 3 interna | 9 → 1 | 7 → 14 |
| 4 núcleo | 2 → 0 | 1 → 4 |

(Contagens por região aproximadas; confirmo ao aplicar, sem mexer em ids nem ligações.)

**Ícone (aprovado, simplificado):** todos os eventos usam o mesmo ícone de raio no mapa. O que muda é o painel do ponto, que mostra **o nome do evento e a regra em uma linha** (ex.: "Inversão: vence o menor valor"). Seis ícones por categoria deixariam o mapa confuso.

## Catálogo de eventos

Dificuldade técnica: **F** = só ligar o que o motor já tem; **M** = pequena mudança no motor; **G** = mudança maior (precisa de mais teste).

### Tempo
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 1 | **Pressa cósmica** | 3 segundos para escolher o atributo; sem escolha, sai um aleatório | 1–2 | F |
| 2 | **Contagem final** | Começa com 5 s e cai 0,3 s por rodada, até 1,5 s | 2–3 | F |
| 3 | **Relógio de Gerbe** | A batalha dura 4 minutos; ao fim, vence quem tem mais cartas (desempate: soma base) | 1–3 | M |
| 4 | **Limite de rodadas** | 15 rodadas; ao fim, vence quem tem mais cartas | 1–2 | F |

### Informação
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 5 | **Névoa estelar** | Todos os números ficam "?" até revelar (já existe, como a Névoa de Dados) | 1–3 | F |
| 6 | **Cartas abertas** | Você vê as 7 cartas do inimigo, na ordem, antes de organizar as suas | 1–2 | F |
| 7 | **Espelho** | O inimigo tem **as mesmas cartas que você**; é preciso organizar na ordem certa (as cartas dele aparecem abertas) | 2–3 | M |
| 8 | **Memória curta** | Você vê o baralho dos dois só antes de começar; depois tudo vira "?" | 2–3 | M |
| 9 | **Inimigo clarividente** | O inimigo sempre escolhe o melhor atributo possível (nada de aleatório); você vê as cartas dele | 3–4 | M |

### Regra de vitória
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 10 | **Inversão** | Vence o **menor** valor | 1–3 | F |
| 11 | **Meio-termo** | Vence o valor **mais próximo de 50** | 1–3 | F |
| 12 | **Alvo do dia** | A cada rodada sorteia-se um alvo (30 a 70); vence o mais próximo | 2–3 | M |
| 13 | **Status invertidos** | ATQ↔DEF e INT↔VEL trocados em todas as cartas | 1–3 | M |
| 14 | **Dupla soma** | Vale a média de **dois** atributos do par (ex.: ATQ e DEF) em vez de um | 2–3 | G |
| 15 | **Maioria vence** | Em vez de um atributo, os dois lados comparam os **quatro**; vence quem ganhar em mais deles | 3–4 | G |

### Atributos
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 16 | **Atributo proibido** | Um atributo fixo do evento não pode ser escolhido por ninguém | 1–3 | F |
| 17 | **Atributo único** | Só um atributo vale na batalha toda (ex.: só Velocidade) | 1–2 | F |
| 18 | **Rodízio** | O atributo é imposto na ordem ATQ → DEF → INT → VEL | 1–3 | F |
| 19 | **Campo magnético** | Se os dois escolherem o **mesmo** atributo, o vencedor captura também a carta seguinte do topo do inimigo | 2–3 | M |

### Baralho
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 20 | **Desvantagem** | Você com 5 cartas, o inimigo com 9 | 2–3 | F |
| 21 | **Horda** | O inimigo tem 10 cartas, todas comuns | 1–2 | F |
| 22 | **Duelo curto** | Cada lado joga só com 3 cartas (as 3 primeiras que você organizar) | 1–3 | F |
| 23 | **Davi e Golias** | Você joga só com 1 carta lendária contra 7 do inimigo | 3–4 | M |
| 24 | **Ordem aleatória** | Os baralhos dos dois são embaralhados; ninguém organiza | 1–3 | F |
| 25 | **Troca de campeãs** | Antes de começar, trocam-se a carta mais forte de cada lado | 2–3 | M |
| 26 | **Baralho emprestado** | Você joga com 7 cartas fixas do evento (ótimas para o tema), não as suas | 1–3 | M |
| 27 | **Sem reserva** | Ninguém tem meio de reserva: só as 7 | 1–2 | F |

### Ambiente
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 28 | **Tempestade solar** | A cada 3 rodadas, todas as cartas em campo perdem 10 em todos os atributos | 2–3 | M |
| 29 | **Maré de Gerbe** | Todos os valores de Defesa ganham +15 | 1–3 | F |
| 30 | **Sobrecarga** | A carta mais forte de cada baralho perde 20 de Velocidade | 2–3 | F |
| 31 | **Trégua** | A primeira rodada não captura nada; só mostra as cartas | 1–2 | F |
| 32 | **Morte súbita** | Vence quem capturar 3 cartas primeiro | 1–3 | F |
| 33 | **Reforços** | A cada 3 rodadas o inimigo ganha 1 carta comum do tema no fim do baralho | 2–4 | M |

### Especiais e pêndulos
| # | Evento | Regra | Região | Téc. |
|---|---|---|---|---|
| 34 | **Silêncio** | Ninguém usa habilidades especiais | 1–3 | F |
| 35 | **Arsenal** | Os dois começam com 2 especiais já preparados | 2–4 | M |
| 36 | **Aposta** | Antes de cada rodada você pode apostar 1 pêndulo: ganha 2 se vencer, perde 1 se perder | 1–3 | M |

## Segurança de término

Os eventos 3, 4 e 32 **encurtam** a batalha, então são seguros. Os que podem prolongar (Trégua, Maré de Gerbe, Reforços, Campo magnético) entram com **limite de rodadas** de segurança (60), igual ao que o jogo já usa, e passam pelo teste de término. Reforços limita o total de cartas que o inimigo pode ganhar (máx. 4).

## Como seria a distribuição (exemplo)

- **Região 1:** Pressa cósmica, Cartas abertas, Inversão, Meio-termo, Atributo proibido, Atributo único, Rodízio, Horda, Duelo curto, Ordem aleatória, Sem reserva, Trégua, Morte súbita, Silêncio, Maré de Gerbe, Aposta (16 regras, cada uma 1 a 2 vezes).
- **Região 2:** Contagem final, Névoa estelar, Espelho, Memória curta, Alvo do dia, Status invertidos, Campo magnético, Desvantagem, Troca de campeãs, Baralho emprestado, Tempestade solar, Sobrecarga, Reforços, Arsenal.
- **Região 3:** Dupla soma, Maioria vence, Inimigo clarividente, Davi e Golias e as mais duras das anteriores.
- **Região 4 (núcleo):** Davi e Golias, Reforços, Arsenal, Inimigo clarividente.

## Decisões que preciso de você

1. Aprova **19 normais + 58 eventos**? (ícone já decidido: um só, raio)
2. Quais eventos cortar ou mudar? Marque os que não gostou.
3. Os de dificuldade **G** (Dupla soma, Maioria vence) valem o trabalho, ou deixo para depois?
4. Algum evento seu que ficou de fora?
