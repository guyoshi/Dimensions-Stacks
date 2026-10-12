# Dimensions Stacks — Biblioteca de 129 habilidades especiais, catálogo aprovado (v2.0)

> **APROVAÇÃO AUTORAL (12/10/2026):** 129 habilidades permanecem como repertório do jogo, das quais **78 têm atribuição aprovada em 87 cartas** e **51 ainda não equipam nenhuma carta**. A coluna `Carta atribuída (ID)` indica as associações oficiais. A aceitação do catálogo não equivale a comprovação de balanceamento e não autoriza inventar procedimentos pendentes. Os nomes físicos antigos são somente referências históricas.

## Princípios obrigatórios e cuidados

1. **Original ≠ proposta ≠ aprovado.** Os textos físicos encontram-se em [transcrições confirmadas](TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md) e [leituras provisórias](LEITURAS_IA_PENDENTES_2026-10-12.md); as decisões ratificadas estão em [REGRAS.md](REGRAS.md). Este documento propõe versões funcionais, com alternativas que o autor ainda precisará aprovar.
2. **Todo especial ativado é consumido e vai ao Buraco Negro.** O seu efeito não salva automaticamente a carta normal de combate. Custos adicionais e exceções são explicitados em cada texto.
3. **Jogo 2, 3 ou 4 jogadores.** `Adversário à esquerda/direita` significa o jogador **ativo mais próximo no sentido indicado**, em círculo; em duelos, ambos os sentidos levam ao único adversário. **Isso é uma convenção proposta, não ainda aprovada.** Efeitos que exigem dois adversários distintos precisam de uma versão própria para duelos.
4. **Zonas:** `baralho ativo` = sequência de combate; `meio de reserva` = pilha separada; `campo de combate` = cartas já comprometidas para a disputa; `área preparada` = até duas especiais à esquerda; `Buraco Negro` = descarte comum. *Carta normal* = carta não comprometida naquele momento como um especial.
5. **Alvos válidos:** salvo texto expresso, não roubar carta normal já comprometida em combate nem especial preparada; seleção **aleatória é cega**; nunca criar uma cópia física ou recurso extra sem custo previsto; se não existirem cartas na zona alvo, a ativação fica **ineficaz** e **deve haver uma regra de cancelamento pré-ativação a aprovar** (não cobrar especial por erro de interface).
6. **Destino proposto:** cartas capturadas/roubadas vão **ao fim do baralho ativo de quem recebeu**, salvo se a própria habilidade mandar à reserva; cartas de combate retornam/descartam conforme ataque ou defesa. Trocas de reservas movimentam todas as cartas conservando a quantidade total da partida.
7. **Tempo/ordem de efeitos ainda requer regra global**, antes do protótipo. Alguns efeitos requerem ativação antes da escolha/revelação dos atributos, outros depois e antes do resultado, e outros na resolução. Não tentar implementar todos num único momento indistinto.
8. **Risco:** `Teste` = efeito plausível para primeira rodada de protótipos; `Atenção` = efeito viável, mas pode escalar ou exigir regra; `Experimental` = alto risco de quebrar equilíbrio, prioridade ou condição de vitória; `Regra-base` = mecânica essencial ratificada pelo autor; `Condicional 3+` = precisa adaptação para duelos.
9. **Cores por origem:** Viajantes Dimensionais **azul**; Mistério Oculto **vermelho**; Ciclo de Jesed **amarelo**; série de Édelin/Belfex **verde**; Diário Sobrenatural **roxo**; Spacetheft **preta**. A União recebe **selo independente**, não é cor ou categoria de ataque. **Nenhuma habilidade deve exigir cor de série como requisito de força ou captura.**
10. **Ativação por combate, regra aprovada:** o jogador pode ativar voluntariamente **somente 1 especial preparado por combate**. **Exceção:** uma habilidade específica pode permitir 2 ativações voluntárias no mesmo combate. **AE-111 (#59)** força todas as especiais já preparadas do alvo, até 2, mesmo sem consentimento. **AE-112** repete um efeito e **não concede ativação genérica de outra carta preparada**. Ainda estão em discussão: origem das cartas preparadas, janelas e prioridade, destino quando faltarem cartas, empate final e efeitos sobre duas cartas normais do AE-010.

**Legendas de origem:** `#NN` = inspiração de carta física; `novo` = habilidade proposta; `#NN (adaptação)` = propositalmente diferente do original. As escolhas de bônus, limiares e quantidades propostas precisam ser testadas.

## A. Bônus, penalidades e soma (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-001 | Impulso de Ataque | Sua carta de combate recebe +15 em Ataque nesta disputa. | novo | Teste | — |
| AE-002 | Muralha de Defesa | Sua carta de combate recebe +15 em Defesa nesta disputa. | novo | Teste | J14 |
| AE-003 | Clarividência | Sua carta de combate recebe +15 em Inteligência nesta disputa. | novo | Teste | — |
| AE-004 | Arrancada | Sua carta de combate recebe +15 em Velocidade nesta disputa. | novo | Teste | V08, D18 |
| AE-005 | Reforço flexível | Sua carta de combate recebe +15 em um atributo à sua escolha nesta disputa. | #15 | Teste | — |
| AE-006 | Dupla resistência | Uma carta de combate sua recebe +15 Defesa e +20 Velocidade nesta disputa. | #27 | Teste | S05 |
| AE-007 | Ímpeto ofensivo | Sua carta de combate recebe +10 Ataque e +10 Inteligência nesta disputa. | novo | Teste | — |
| AE-008 | Guarda equilibrada | Sua carta de combate recebe +10 Defesa e +10 Velocidade nesta disputa. | novo | Teste | V05 |
| AE-009 | Superação | Se o valor original escolhido da sua carta de combate for 40 ou menos, adicione +25 a esse atributo nesta disputa. | novo | Teste | — |
| AE-010 | Ataque em dupla | Jogue as duas primeiras cartas consecutivas de seu baralho ativo; some o mesmo atributo das duas para obter um único valor de combate. | #09 | Regra-base | J15 |

## B. Conversões direcionais de atributos (10)

**Regra de leitura:** `Origem → Destino` = copiar o número da Origem para o Destino **sem alterar o atributo de origem**. Isso não é uma permuta: a inversa é outra habilidade, garantindo os espelhos solicitados.

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-011 | Ataque → Inteligência | Substitua o valor de Inteligência de sua carta de combate pelo valor que ela possui em Ataque; Ataque permanece igual. | #22 (adaptação) | Teste | — |
| AE-012 | Inteligência → Ataque | Substitua o valor de Ataque pelo valor que a carta possui em Inteligência; Inteligência permanece igual. | novo | Teste | D11 |
| AE-013 | Ataque → Velocidade | Substitua o valor de Velocidade pelo valor que sua carta possui em Ataque; Ataque permanece igual. | #21 (adaptação) | Teste | — |
| AE-014 | Velocidade → Ataque | Substitua o valor de Ataque pelo valor que sua carta possui em Velocidade; Velocidade permanece igual. | novo | Teste | — |
| AE-015 | Defesa → Inteligência | Substitua o valor de Inteligência pelo valor que sua carta possui em Defesa; Defesa permanece igual. | novo | Teste | — |
| AE-016 | Inteligência → Defesa | Substitua o valor de Defesa pelo valor que sua carta possui em Inteligência; Inteligência permanece igual. | #20 (adaptação) | Teste | — |
| AE-017 | Ataque → Defesa | Substitua o valor de Defesa pelo valor que sua carta possui em Ataque; Ataque permanece igual. | novo | Teste | V09 |
| AE-018 | Defesa → Ataque | Substitua o valor de Ataque pelo valor que sua carta possui em Defesa; Defesa permanece igual. | novo | Teste | — |
| AE-019 | Inteligência → Velocidade | Substitua o valor de Velocidade pelo valor que sua carta possui em Inteligência; Inteligência permanece igual. | novo | Teste | — |
| AE-020 | Velocidade → Inteligência | Substitua o valor de Inteligência pelo valor que sua carta possui em Velocidade; Velocidade permanece igual. | novo | Teste | — |

## C. Controle do confronto e do atributo (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-021 | Atributo universal | Escolha um atributo: todos, inclusive você, devem disputar nele. Conflitos de imposição seguem o GDD. | #57/#58/#04 | Regra-base | V02 |
| AE-022 | Par ofensivo | Antes de declarar atributos, determine que todos usem o par Ataque/Defesa nesta disputa. | novo | Teste | D05 |
| AE-023 | Par mental | Antes de declarar atributos, determine que todos usem o par Inteligência/Velocidade nesta disputa. | novo | Teste | — |
| AE-024 | Ataque obrigatório | Dentro do par vigente, todos devem usar o atributo de ataque correspondente, inclusive você. | novo | Teste | S07 |
| AE-025 | Defesa obrigatória | Dentro do par vigente, todos devem usar o atributo de defesa correspondente, inclusive você. | novo | Teste | — |
| AE-026 | Forçar ataque rival | Escolha um adversário: ele deve usar o atributo de ataque do par vigente. | novo | Teste | D02 |
| AE-027 | Forçar defesa rival | Escolha um adversário: ele deve usar o atributo de defesa do par vigente. | novo | Teste | — |
| AE-028 | Proibir o ataque rival | Escolha um adversário: ele não pode usar o atributo de ataque do par vigente nesta disputa. | novo | Teste | M08 |
| AE-029 | Proibir a defesa rival | Escolha um adversário: ele não pode usar o atributo de defesa do par vigente nesta disputa. | novo | Teste | — |
| AE-030 | Escolha transferida | Nesta disputa, escolha qual dos dois atributos do par vigente um adversário utilizará; você continua escolhendo o seu normalmente. | novo | Teste | J08 |

## D. Roubo do baralho ativo (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-031 | Primeira à direita | Pegue a próxima carta do topo do baralho ativo do adversário à direita, exceto a já comprometida em combate. | novo | Teste | V06 |
| AE-032 | Primeira à esquerda | Pegue a próxima carta do topo do baralho ativo do adversário à esquerda, exceto a já comprometida em combate. | novo | Teste | S12 |
| AE-033 | Sorte à direita | Pegue 1 carta aleatória do baralho ativo do adversário à direita, excluindo cartas comprometidas. | novo | Teste | — |
| AE-034 | Sorte à esquerda | Pegue 1 carta aleatória do baralho ativo do adversário à esquerda, excluindo cartas comprometidas. | novo | Teste | — |
| AE-035 | Saque livre | Escolha um adversário e tome 1 carta aleatória de seu baralho ativo, sem afetar cartas preparadas. | #02 | Teste | — |
| AE-036 | Saque de dois rivais | Roube uma carta aleatória do baralho ativo de cada um de dois adversários distintos; cartas de combate e especiais preparados não são alvos. Sem dois adversários distintos, a condição integral não é atendida. | #34 (adaptação) | Condicional 3+ | — |
| AE-037 | Recompensa ofensiva | Se vencer atacando, tome também a próxima carta do topo do baralho ativo de um adversário derrotado. | novo | Atenção | J09 |
| AE-038 | Recompensa defensiva | Se vencer defendendo, tome a próxima carta do topo do baralho ativo de um adversário derrotado, sem modificar o destino das cartas de combate. | novo | Atenção | — |
| AE-039 | Saque revelado | Revele até 2 cartas seguintes do baralho ativo de um adversário e escolha 1 para capturar; devolva a outra sem alterar a ordem. | novo | Atenção | M07 |
| AE-040 | Apreensão limitada | Escolha um adversário com ao menos 4 cartas ativas fora do combate; pegue 1 carta aleatória de seu baralho ativo. | novo | Teste | — |

## E. Roubo do meio de reserva (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-041 | Última da direita | Pegue a última carta do meio de reserva do adversário à direita. | #38 | Teste | M03 |
| AE-042 | Última da esquerda | Pegue a última carta do meio de reserva do adversário à esquerda. | novo | Teste | — |
| AE-043 | Primeira da direita | Pegue a primeira carta do meio de reserva do adversário à direita. | novo | Teste | — |
| AE-044 | Primeira da esquerda | Pegue a primeira carta do meio de reserva do adversário à esquerda. | novo | Teste | — |
| AE-045 | Reserva dupla à direita | Pegue 2 cartas aleatórias do meio de reserva do adversário à direita, se disponíveis. | #17 | Teste | — |
| AE-046 | Reserva dupla à esquerda | Pegue 2 cartas aleatórias do meio de reserva do adversário à esquerda, se disponíveis. | novo | Teste | V13 |
| AE-047 | Tributo coletivo | Pegue 1 carta aleatória da reserva de cada adversário ativo que possua reserva. | novo | Atenção | S10 |
| AE-048 | Última de cada reserva | Pegue a última carta do meio de reserva de cada adversário ativo que tenha cartas nessa zona. | ideia do autor (frase cortada) | Teste | S09 |
| AE-049 | Escolha da reserva | Escolha um adversário e pegue até 2 cartas aleatórias de sua reserva. | novo | Atenção | — |
| AE-050 | Reserva em perigo | Se um adversário tiver até 3 cartas no baralho ativo, tome a última carta de sua reserva, caso exista. | novo | Teste | — |

## F. Trocas diretas e circulação de cartas (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-051 | Troca escolhida | Troque 1 carta de seu baralho ativo, escolhida por você, por 1 carta aleatória do baralho ativo de um adversário. | #01/#30 | Teste | D07 |
| AE-052 | Troca de combatente | Tome a carta de combate de um adversário e entregue-lhe 1 carta aleatória do seu baralho ativo; a troca antecede a comparação. | #13 | Atenção | — |
| AE-053 | Combatente da direita | Troque sua carta de combate pela do adversário à direita antes da comparação. | #10 | Atenção | S14 |
| AE-054 | Combatente da esquerda | Troque sua carta de combate pela do adversário à esquerda antes da comparação. | novo | Atenção | — |
| AE-055 | Troca de topos à direita | Troque a próxima carta do topo de seu baralho ativo com a próxima do adversário à direita. | #25 | Teste | D15 |
| AE-056 | Troca de topos à esquerda | Troque a próxima carta do topo de seu baralho ativo com a próxima do adversário à esquerda. | novo | Teste | — |
| AE-057 | Passe à esquerda | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à esquerda. | #11 | Teste | — |
| AE-058 | Passe à direita | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à direita. | novo | Teste | — |
| AE-059 | Permuta das reservas à esquerda | Troque todo o seu meio de reserva pelo do adversário à esquerda. | #46 | Atenção | S13 |
| AE-060 | Permuta das reservas à direita | Troque todo o seu meio de reserva pelo do adversário à direita. | novo | Atenção | — |

## G. Redistribuição coletiva e sacrifício (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-061 | Reservas giratórias à direita | Cada jogador ativo passa simultaneamente toda a própria reserva ao jogador ativo à direita. | #35 | Atenção | J13 |
| AE-062 | Reservas giratórias à esquerda | Cada jogador ativo passa simultaneamente toda a própria reserva ao jogador ativo à esquerda. | novo | Atenção | J19 |
| AE-063 | Troca entre vizinhos | Faça o jogador à esquerda trocar 1 carta ativa escolhida com o da direita. Em duelo são a mesma pessoa: a troca não produz ganho líquido, mas o especial ainda pode ser gasto. | #40 | Sem ganho em duelos | V14 |
| AE-064 | Transferência de reserva | Transfira 1 carta aleatória da reserva do rival à esquerda para a reserva do rival à direita, sem ficar com ela. Em duelo, ela volta ao mesmo rival e não há vantagem. | #43 (var.) | Sem ganho em duelos | — |
| AE-065 | Tríplice transferência | Transfira até 3 cartas aleatórias do baralho ativo do rival à esquerda ao do rival à direita. Em duelo, origem e destino são o mesmo rival, de modo que a transferência não gera ganho líquido. | #43 | Sem ganho em duelos | — |
| AE-066 | Descarte coletivo | Cada jogador ativo, inclusive você, envia 1 carta aleatória de seu baralho ativo ao Buraco Negro. | #37/#50 | Teste | D13 |
| AE-067 | Descarte adversário | Cada adversário ativo envia 1 carta aleatória de seu baralho ativo ao Buraco Negro; você não descarta outra carta além da especial. | #50 (var.) | Atenção | V04 |
| AE-068 | Tributo por sacrifício | Sacrifique uma carta normal sua com algum atributo acima de 90; tome 1 carta aleatória do baralho ativo de cada adversário ativo. | #42 | Atenção | S11 |
| AE-069 | Doação escolhida | Escolha um adversário: ele deve escolher uma carta de seu próprio baralho ativo para entregar ao fim do seu. | #28 | Teste | J04, S03 |
| AE-070 | Conquista compensada | Capture as cartas normais em combate, mas entregue 1 carta escolhida de seu baralho ativo a cada adversário ativo envolvido. | #23 | Experimental | — |

## H. Defesas, bloqueios e salvamentos (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-071 | Ausência tática | Retire apenas sua carta de combate desta disputa; devolva-a ao fim do baralho ativo sem vitória ou derrota. | #31 | Teste | J22 |
| AE-072 | Não perder a carta | Mesmo que perca, sua carta de combate volta ao fim do próprio baralho ativo, em vez de ser capturada ou descartada. | #32 | Teste | J18 |
| AE-073 | Silêncio de especiais | Anule as habilidades especiais ainda não resolvidos dos adversários nesta disputa; as cartas especiais ativadas são descartadas. | #47 | Atenção | V15 |
| AE-074 | Imunidade pessoal | Cancele um ataque ou especial direcionado especificamente a você nesta disputa; não anule ações que afetem os demais. | #48 | Teste | J11 |
| AE-075 | Captura negada | Escolha um rival: mesmo que ele vença, ele não poderá capturar sua carta de combate nesta disputa. | #49 (adaptação) | Teste | S02 |
| AE-076 | Guardião do baralho | Anule a próxima tentativa de roubar uma carta de seu baralho ativo nesta disputa. | novo | Teste | J05 |
| AE-077 | Guardião da reserva | Anule a próxima tentativa de roubar uma carta de sua reserva nesta disputa. | novo | Teste | D14 |
| AE-078 | Reflexo de roubo | Se um rival tentar roubar exatamente 1 carta sua, cancele esse roubo e tome 1 carta aleatória do baralho ativo dele. | novo | Atenção | V01 |
| AE-079 | Escudo antecipado | Seu próximo combatente normal não pode ser enviado ao Buraco Negro por uma habilidade especial nesta disputa. | novo | Teste | J23 |
| AE-080 | Anular modificador | Cancele até 1 bônus ou redução numérica que tenha sido aplicado à sua carta de combate nesta disputa. | novo | Teste | V03 |

## I. Recuperação e manipulação do Buraco Negro (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-081 | Resgate extremo | Sacrifique 1 carta normal sua que tenha atributo original acima de 90; receba as 3 primeiras cartas do Buraco Negro, se existirem. | #19 | Atenção | D12 |
| AE-082 | Resgate aleatório duplo | Recupere até 2 cartas aleatórias do Buraco Negro e coloque-as no fim de seu baralho ativo. | #56 | Atenção | S06 |
| AE-083 | Resgate do topo | Recupere a carta normal mais recente do Buraco Negro para o fim de seu baralho ativo. | novo | Teste | J06 |
| AE-084 | Resgate antigo | Recupere a carta normal mais antiga do Buraco Negro para o fim de seu baralho ativo. | novo | Teste | D03 |
| AE-085 | Resgate escolhido | Escolha 1 carta normal do Buraco Negro para recuperar ao final de seu baralho ativo. | novo | Atenção | D04 |
| AE-086 | Troca pelo descarte | Envie 1 carta normal escolhida do seu baralho ativo ao Buraco Negro e recupere até 2 cartas normais aleatórias de lá. | novo | Teste | M12 |
| AE-087 | Reabastecimento da reserva | Pegue até 2 cartas aleatórias do Buraco Negro e deposite-as no fim do seu meio de reserva. Não há restrição a cartas normais na redação original; tratar ciclos pelo regulamento geral. | #12 (texto corrigido pelo autor) | Teste | V10 |
| AE-088 | Retorno imediato | Recupere 1 carta normal aleatória do Buraco Negro para o fim de seu baralho ativo; se seu baralho estava vazio, ela será sua próxima carta. | novo | Teste | — |
| AE-089 | Sacrifício duplo | Envie 2 cartas normais escolhidas de seu baralho ativo ao Buraco Negro e recupere até 3 cartas normais aleatórias. | novo | Atenção | J16 |
| AE-090 | Segunda chance | Se sua carta de combate fosse para o Buraco Negro nesta disputa, coloque-a em vez disso no fim de sua reserva; não preserve vitória nem capture. | novo | Teste | J07 |

## J. Informação e manipulação de ordem (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-091 | Revelar a mão | Um adversário revela a ordem de todas as cartas de seu baralho ativo para você até o fim desta disputa. | #41 | Teste | D08 |
| AE-092 | Próximas três | Veja as 3 próximas cartas de seu baralho ativo e coloque-as no topo na ordem que preferir. | novo | Teste | D10, M05 |
| AE-093 | Espionagem tripla | Veja as 3 próximas cartas do baralho ativo de um adversário sem alterá-las. | novo | Teste | J21, D17, M11 |
| AE-094 | Inversão de fila | Inverta apenas a ordem das 3 próximas cartas de seu baralho ativo. | novo | Teste | D09 |
| AE-095 | Atrasar a próxima | Mova a próxima carta do topo do baralho ativo de um adversário para o final do próprio baralho. | novo | Teste | V11 |
| AE-096 | Quebrar o plano | Misture as cartas do baralho ativo de um adversário com sua reserva; depois ele separa as primeiras 5 para formar seu novo baralho ativo. | #33 | Atenção | J02, J10 |
| AE-097 | Escolha de sete | Veja sua reserva e escolha até 7 cartas para colocar na ordem escolhida no topo de seu baralho ativo. | #36 (adaptação) | Atenção | V07 |
| AE-098 | Organizar reserva | Veja as 4 primeiras cartas de sua reserva e reorganize-as na ordem desejada. | novo | Teste | D16 |
| AE-099 | Reforçar o fim | Mova a primeira carta de sua reserva para o fim do seu baralho ativo, sem ver seu conteúdo. | novo | Teste | D01 |
| AE-100 | Confundir próximo turno | Veja até 3 cartas seguintes do baralho ativo de um adversário; escolha qual ficará no topo, preservando a ordem relativa das demais. | novo | Atenção | V16, M04 |

## K. Capturas condicionais e efeitos decisivos (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-101 | Capturar atacante | Se Ataque + Inteligência da carta de combate de um adversário for maior que Defesa + Velocidade, capture essa carta quando o combate terminar, se ainda estiver em jogo. | #60 (adaptação) | Atenção | M06 |
| AE-102 | Capturar defensor | Se Defesa + Velocidade da carta de combate de um adversário for maior ou igual a Ataque + Inteligência, capture essa carta quando o combate terminar, se ainda estiver em jogo. | #61 (adaptação) | Atenção | — |
| AE-103 | Ruína de campo | Impeça ataques contra você nesta disputa e envie ao Buraco Negro somente as cartas normais que os adversários colocaram em combate; preserve a sua carta de combate. Não descarta as cartas especiais preparadas. A interação com especiais ativados continua pendente. | #54 (escopo aprovado) | Atenção | V18, B01 |

| AE-105 | Defesa que captura | Se vencer usando Defesa ou Velocidade, capture a carta de combate de 1 adversário derrotado, em vez de descartá-la. | novo | Teste | J12, V19 |
| AE-106 | Ataque que bane | Se vencer usando Ataque ou Inteligência, escolha 1 adversário derrotado: a carta dele vai ao Buraco Negro em vez de ser capturada. | novo | Teste | J20 |
| AE-107 | Iniciativa contra fracos | Se a carta de combate de um rival tiver 30 ou menos no atributo escolhido, ela não poderá se proteger contra o seu próximo efeito de roubo nesta disputa. | novo | Atenção | — |
| AE-108 | Negar captura inimiga | Se perder para um atributo de ataque, sua carta de combate vai ao Buraco Negro, não ao baralho do vencedor. | novo | Teste | V17 |
| AE-109 | Duelo condicionado | Antes da revelação, escolha um adversário e um atributo: se ele tiver 80 ou mais nesse atributo, capture sua carta de combate após a disputa; caso contrário, nada acontece. | novo | Experimental | — |
| AE-110 | Margem estreita | Se perder por diferença de até 10 pontos no atributo disputado, trate o confronto com você como empate e aplique os desempates usuais. | novo | Atenção | J01 |
| AE-129 | Triunfo raro | Vença automaticamente a comparação de atributos desta disputa, desde que esse especial não seja anulado. O destino das cartas segue o atributo que você declarou: ataque captura e defesa descarta. **Candidato a pouquíssimas cartas raras**, aprovado para Jasmey como habilidade rara, sujeito a testes de equilíbrio. | novo; não é o antigo #52 | Rara, experimental | S01 |

## L. Interações entre habilidades especiais (10)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-111 | Ativação forçada | Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas, até duas, nesta disputa, mesmo que a regra geral permita somente uma ativação voluntária. | #59 | Regra-base | M10 |
| AE-112 | Repetição onerosa | Repita uma única vez o efeito de outro especial seu já ativado nesta disputa; descarte 2 cartas adicionais de seu baralho ativo à sua escolha no Buraco Negro. Não repita esta habilidade, outra repetição ou uma cópia de habilidade. Repetir um efeito não autoriza virar outra carta especial preparada. | #62 (ciclos proibidos) | Atenção | D06 |
| AE-113 | Interrupção precisa | Cancele 1 habilidade especial de um adversário antes de sua resolução; o especial cancelado é descartado normalmente. | novo | Teste | S08 |
| AE-114 | Desvio de alvo | Redirecione para outro adversário elegível 1 especial de alvo único que estava dirigido a você. | novo | Teste | V12 |
| AE-115 | Eco de habilidade | Copie o efeito de 1 especial adversária já ativada nesta disputa, sem ganhar a carta física; não pode copiar outra cópia. | novo | Atenção | M01 |
| AE-116 | Apropriar especial usado | Ganhe a carta de habilidade especial usada por um adversário nesta disputa, em vez de ela permanecer no Buraco Negro; ponha-a ao fim do seu baralho ativo. | #06 (adaptação) | Atenção | J03 |
| AE-117 | Preparação exposta | Um adversário revela até 2 especiais que já preparou; elas permanecem preparadas e não são ativadas. | novo | Teste | J17 |
| AE-118 | Blindagem de especial | Um especial seu preparado fica imune a 1 tentativa de cancelamento nesta disputa; não impede custos nem ativações forçadas. | novo | Atenção | M09 |
| AE-119 | Preparação urgente | Se a regra de preparação permitir, prepare imediatamente a próxima carta de seu baralho ativo como especial, sem poder ativá-la nesta disputa. | novo | Experimental | — |
| AE-120 | Remover alteração | Anule todas as alterações numéricas temporárias aplicadas a uma carta de combate à sua escolha antes da comparação. | novo | Teste | S04 |
## M. Conversões faltantes e permutas completas (8)

**Por que este grupo existe:** há **12 conversões direcionais possíveis** entre os quatro atributos (cada um dos 4 pode substituir qualquer um dos outros 3) e **6 permutas bidirecionais**. O grupo B cobre as 10 primeiras conversões; este grupo completa as duas faltantes e oferece as seis permutas para não confundir *trocar números entre si* com *copiar um número sobre outro*.

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-121 | Defesa → Velocidade | Substitua o valor de Velocidade pelo valor que sua carta possui em Defesa; Defesa permanece igual. | novo | Teste | — |
| AE-122 | Velocidade → Defesa | Substitua o valor de Defesa pelo valor que sua carta possui em Velocidade; Velocidade permanece igual. | novo | Teste | — |
| AE-123 | Permutar Ataque e Inteligência | Troque entre si os números de Ataque e Inteligência da mesma carta; ambos mudam. | novo | Teste | — |
| AE-124 | Permutar Ataque e Velocidade | Troque entre si os números de Ataque e Velocidade da mesma carta; ambos mudam. | novo | Teste | — |
| AE-125 | Permutar Ataque e Defesa | Troque entre si os números de Ataque e Defesa da mesma carta; ambos mudam. | novo | Teste | — |
| AE-126 | Permutar Inteligência e Velocidade | Troque entre si os números de Inteligência e Velocidade da mesma carta; ambos mudam. | novo | Teste | — |
| AE-127 | Permutar Inteligência e Defesa | Troque entre si os números de Inteligência e Defesa da mesma carta; ambos mudam. | novo | Teste | — |
| AE-128 | Permutar Defesa e Velocidade | Troque entre si os números de Defesa e Velocidade da mesma carta; ambos mudam. | novo | Teste | — |

**Registro de exclusão:** o efeito incondicional da carta física **#52** e seu ID anterior **AE-104** foram removidos deste catálogo atribuído. O ID foi reservado para não renumerar as habilidades. **AE-129** é uma habilidade rara diferente, **aprovada para S01 Jasmey**, mas segue sujeita a testes.

**Reação defensiva:** a habilidade **AE-130** foi adicionada para cancelar a última habilidade especial ainda pendente. A resposta pode entrar quando surgir uma ameaça, **antes de sua resolução**; não desfaz efeitos já concluídos. A janela detalhada de reações defensivas permanece uma proposta no GDD. Ter timing de resposta não cria segunda ativação voluntária gratuita, salvo habilidade expressa.

**Ativação voluntária confirmada:** **1 carta especial preparada por combate**, escolhida e ativada no turno desejado. Somente habilidades com permissão explícita podem permitir duas. **Nenhuma das 129 entradas atuais é automaticamente uma autorização genérica para ativar duas cartas**: esta eventual mecânica deve ser proposta/aprovada explicitamente. A especial **AE-111** força todas as especiais preparadas do alvo (até duas), criando exceção não voluntária; **AE-112** repete um efeito sem autorizar virar uma segunda especial. A ordem entre jogadores e a janela precisa ainda precisam de definição no GDD.


## N. Reações e contramedidas novas (1)

| ID | Nome da habilidade | Efeito definido no catálogo (requer testes) | Referência física | Situação | Carta atribuída (ID) |
| --- | --- | --- | --- | --- | --- |
| AE-130 | Anular a última habilidade | **REAÇÃO DEFENSIVA.** Quando uma habilidade especial for ativada e ainda não tiver resolvido seu efeito, anule a **última habilidade pendente**. A carta anulada é consumida e vai ao Buraco Negro. Não desfaz efeitos já concluídos. | novo, solicitado pelo autor | Teste; texto proposto | M02 |

## Regras propostas de integridade (antes de programar)

- **Carta sem habilidade recuperada:** não inventar texto físico; poderá receber qualquer AE aprovada conforme coerência narrativa.
- **Efeitos de roubo por lado:** todas as famílias que roubam `da direita` possuem pelo menos uma variante `da esquerda`. O lado deve permanecer visível no texto da carta.
- **Permuta ou cópia:** uma *permuta* entre atributos move ambos os valores; uma *cópia* substitui apenas um valor. Isso evita a ambiguidade dos especiais antigos #20–22.
- **Efeitos coletivos:** nunca repetir um efeito mais de uma vez por adversário na mesma ativação sem texto expresso. Quando faltar carta em alguma reserva/baralho, afetar somente os alvos válidos (proposta).
- **Repetição do AE-112 (direção aprovada: impedir ciclos):** uma ativação repete no máximo uma vez um efeito que não seja repetição/cópia; não pode mirar a si própria ou gerar nova repetição; custos adicionais são pagos integralmente. Especificação operacional sujeita a teste.
- **Antigo #52 excluído:** o ID **AE-104 foi aposentado**, não recebe carta atribuída. **AE-129** é uma **proposta nova e rara**, com vitória automática que respeita a natureza ataque/defesa do atributo declarado, não o antigo efeito de captura incondicional. **AE-103** afeta só as cartas normais de combate, jamais a área de especiais preparadas.
- **Efeitos de recuperar especial usada (AE-116):** a carta recuperada não pode ser reativada naquela disputa; entra ao fim do baralho ativo do novo dono. Isso reduz ciclos e precisa ser ratificado.
- **Efeitos com 2/3/4 jogadores:** em duelo, direita e esquerda apontam ao mesmo oponente. AE-063/064/065 podem ser gastas mesmo sem vantagem; não serão convertidas obrigatoriamente em novas habilidades. AE-036 exige dois adversários distintos para seu efeito completo.
- **Atribuição aprovada:** **78 habilidades distintas** estão equipadas nas **87 cartas oficiais**; **51 seguem sem carta atribuída**, preservadas para futuras expansões. Duplicações de uma mesma habilidade em personagens diferentes são permitidas. Consulte [CARTAS_87_PROPOSTAS.md](CARTAS_87_PROPOSTAS.md), cujo conteúdo passou ao estado **APROVADO**, e [o JSON oficial](../dados/oficial/habilidades_129.json).

## Documentos associados

- [Auditoria detalhada dos especiais antigos](AUDITORIA_BALANCEAMENTO_ESPECIAIS.md).
- [GDD de regras e condições de vitória](REGRAS.md).
- [Elenco de 87 candidatos](ELENCO_CANDIDATO.md).
- [Fichas oficiais das 87 cartas](CARTAS_87_PROPOSTAS.md).
- [Contrato de implementação que separa aprovações e propostas](CONTRATO_PARA_IA_IMPLEMENTADORA.md).
- [Registro dos 23 ataques diretamente transcritos](TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md).
- [Leituras adicionais, ainda provisórias](LEITURAS_IA_PENDENTES_2026-10-12.md).

## Aprovação e controle de mudanças

**Autor aprovou todos os dados existentes em 12/10/2026.** As 78 habilidades utilizadas no baralho são parte integrante das fichas oficiais, cada uma associada às cartas indicadas na coluna final. As outras 51 habilidades estão aprovadas como repertório de expansão, **não equipadas**. Textos historicamente contraditórios ou casos-limite que ainda não têm procedimento especificado continuam indicados como necessidade de teste/definição: aprovar um texto de habilidade **não resolve sozinho sua implementação operacional**.

**Fontes de dados de produção:** [87 cartas](../dados/oficial/cartas_87.json) e [129 habilidades](../dados/oficial/habilidades_129.json). Não utilizar `dados/propostas` como estado atual.
