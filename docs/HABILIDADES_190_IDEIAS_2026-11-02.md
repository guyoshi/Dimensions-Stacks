# Rumo às 190 habilidades: ideias e reforma das 27 de uso zero (02/11/2026)

**Situação medida no motor:** 141 habilidades `AE` em uso por 154 cartas (+8 Chamados da União, só no Boss). Seis habilidades repetem em 19 cartas (AE-001×3, AE-007×4, AE-011×3, AE-021×3, AE-049×2, AE-103×4): sobram 13 cartas para receber habilidade nova. Para chegar a **190** faltam **49**. Abaixo há **58 ideias** (9 de folga). Nada foi implementado; aguarda aprovação.

## 1. Por que 27 habilidades têm "uso zero"
Medido em 400 partidas de bots (cada uma delas foi distribuída ~85 vezes, usada 0). Não é bug: `engine.js` guarda `val` (quanto vale gastar uma carta para prepará-la) calibrado por simulação, e nessas 27 o valor medido é **0**, isto é, o bot rende mais lutando com a carta do que preparando-a. Resultado: ninguém (bot) as prepara e o contador fica em zero. Em teste forçado (`sim_esp.js`) todas funcionam; o problema é que são **fracas**. Humanos podem usá-las, mas hoje não compensam.

**Cada habilidade abaixo com a carta que a tem hoje, o texto atual e a proposta (ao aprovar, aplico e meço de novo até o bot passar a usá-las):**

| ID | Habilidade | Carta que a tem | O que faz hoje | Proposta |
|---|---|---|---|---|
| AE-009 | Superação | J07 Mariv | Se o valor original escolhido da sua carta de combate for 40 ou menos, adicione +25 a esse atributo nesta disputa. | +10 no atributo mais fraco e +10 no escolhido (além do +25 atual quando ≤40) |
| AE-024 | Ataque obrigatório | S07 Buni | Dentro do par vigente, todos devem usar o atributo de ataque correspondente, inclusive você. | além de obrigar você, a carta ganha +12 no atributo obrigado |
| AE-025 | Defesa obrigatória | J21 Nefestra | Dentro do par vigente, todos devem usar o atributo de defesa correspondente, inclusive você. | além de obrigar você, a carta ganha +12 no atributo obrigado |
| AE-026 | Forçar ataque rival | D02 Priscila Fontenelle | Escolha um adversário: ele deve usar o atributo de ataque do par vigente. | o rival forçado também perde 8 no atributo |
| AE-029 | Proibir a defesa rival | S12 Vek | Escolha um adversário: ele não pode usar o atributo de defesa do par vigente nesta disputa. | o rival que não pode defender também perde 8 no atributo |
| AE-051 | Troca escolhida | V25 Eshley | Troque 1 carta de seu baralho ativo, escolhida por você, por 1 carta aleatória do baralho ativo de um adversário. | troca sua carta do topo por qualquer carta da sua reserva e ganha +8 nesta disputa |
| AE-057 | Passe à esquerda | J18 Vetarius Polar | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à esquerda. | o passe devolve 1 carta do vizinho (troca 1 por 1, não 1 por 0) |
| AE-058 | Passe à direita | V11 Garien | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à direita. | o passe devolve 1 carta do vizinho (troca 1 por 1, não 1 por 0) |
| AE-063 | Troca entre vizinhos | V14 Tio Frank | Escolha, às cegas (pela posição no baralho ativo), 1 carta do jogador à esquerda e 1 do jogador à direita: elas trocam de dono. Em duelo são a mesma pessoa: a troca não produz ganho líquido, mas o especial ainda pode ser gasto. | também vê as cartas trocadas |
| AE-064 | Transferência de reserva | B03 Jork Caravel | Transfira 1 carta aleatória da reserva do rival à esquerda para a reserva do rival à direita, sem ficar com ela. Em duelo, ela volta ao mesmo rival e não há vantagem. | a carta recebida entra no topo do seu baralho |
| AE-065 | Tríplice transferência | J19 Cal Kerath | Transfira até 3 cartas aleatórias do baralho ativo do rival à esquerda ao do rival à direita. Em duelo, origem e destino são o mesmo rival, de modo que a transferência não gera ganho líquido. | a carta recebida entra no topo do seu baralho |
| AE-070 | Conquista compensada | V07 Lucan Veline | Capture as cartas normais em combate, mas entregue 1 carta escolhida de seu baralho ativo a cada adversário ativo envolvido. | quem perde a captura recebe 1 carta do Buraco Negro |
| AE-091 | Revelar a mão | D08 Glenda Mendes | Um adversário revela a ordem de todas as cartas de seu baralho ativo para você até o fim desta disputa. | revela e marca: a carta marcada do rival perde 10 |
| AE-092 | Próximas três | S14 Genrir | Veja as 3 próximas cartas de seu baralho ativo e coloque-as no topo na ordem que preferir. | reordena as 3 cartas do topo do seu baralho |
| AE-094 | Inversão de fila | V27 Farol | Inverta apenas a ordem das 3 próximas cartas de seu baralho ativo. | inverte a fila do rival |
| AE-096 | Quebrar o plano | J02 Nestira Amarëa | Misture as cartas do baralho ativo de um adversário com sua reserva; depois ele separa as primeiras 5 para formar seu novo baralho ativo. | cancela as cartas preparadas do rival (voltam ao fundo) |
| AE-098 | Organizar reserva | D16 A Mãe | Veja as 4 primeiras cartas de sua reserva e reorganize-as na ordem desejada. | a reserva vira o topo e a carta ganha +6 em tudo |
| AE-099 | Reforçar o fim | V23 Erick Corvane | Mova a primeira carta de sua reserva para o fim do seu baralho ativo, sem ver seu conteúdo. | +15 em todos os atributos se o baralho tem ≤4 cartas |
| AE-100 | Confundir próximo turno | V16 Faka | Veja até 3 cartas seguintes do baralho ativo de um adversário; escolha qual ficará no topo, preservando a ordem relativa das demais. | o rival embaralha o topo e perde 8 na próxima |
| AE-102 | Capturar defensor | S10 Jelles | Se Resistência + Velocidade da carta de combate de um adversário for maior ou igual a Força + Inteligência, capture essa carta quando o combate terminar, se ainda estiver em jogo. | captura o defensor mesmo sem vencer por margem |
| AE-107 | Iniciativa contra fracos | V37 Lioro | Se a carta de combate de um rival tiver 30 ou menos no atributo escolhido, ela não poderá se proteger contra o seu próximo efeito de roubo nesta disputa. | o roubo vale contra qualquer rival com menos cartas |
| AE-108 | Negar captura inimiga | V17 Lanigiah | Se perder para um atributo de ataque, sua carta de combate vai ao Buraco Negro, não ao baralho do vencedor. | também devolve a carta capturada ao topo |
| AE-111 | Ativação forçada | M10 Releuz | Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas, até duas, nesta disputa, mesmo que a regra geral permita somente uma ativação voluntária. | o rival ativa a habilidade e você ganha +8 |
| AE-118 | Blindagem de especial | J27 Tair Nular | Um especial seu preparado fica imune a 1 tentativa de cancelamento nesta disputa; não impede custos nem ativações forçadas. | a blindagem também reflete 50% do efeito |
| AE-119 | Preparação urgente | V41 Elowen | Se a regra de preparação permitir, prepare imediatamente a próxima carta de seu baralho ativo como especial, sem poder ativá-la nesta disputa. | prepara 2 cartas de uma vez |
| AE-121 | Resistência → Velocidade | D10 Sra. Olívia | Substitua o valor de Velocidade pelo valor que sua carta possui em Resistência; Resistência permanece igual. | converte 100% e mantém 30% do valor original |
| AE-122 | Velocidade → Resistência | V35 Lárida Celeste | Substitua o valor de Resistência pelo valor que sua carta possui em Velocidade; Velocidade permanece igual. | converte 100% e mantém 30% do valor original |

(Todas são mudança de balanceamento; só aplico com sua aprovação.)

## 2. 58 ideias novas (cada uma usa mecânicas que o motor já tem: atributos, reserva, preparar, BN, captura, eventos)
**Bônus (7):** Maré alta (+15 no atributo mais fraco) · Segundo fôlego (+20 se perdeu a disputa anterior) · Foco duplo (+12 em 2 atributos) · Último suspiro (+25 com ≤3 cartas) · Veterano (+2 por carta capturada, máx. +20) · Aposta (+25 no atributo; se perder vai ao BN) · Fúria (+30 Força, −15 Resistência).
**Conversão (6):** Espelho (copia o maior atributo do rival num atributo seu) · Média nivelada (todos viram a média) · Escudo mental (Resistência = Inteligência se maior) · Inversão do rival (maior ↔ menor atributo dele) · Ouro do tolo (soma dois atributos num só, o outro vira 0) · Reciclagem (maior atributo −10, os outros +6).
**Controle (5):** Atributo vetado (o melhor atributo do rival não pode ser escolhido) · Duelo de mãos (escolha o atributo; empate vence você) · Sorteio viciado (rola atributo aleatório, +15 nele) · Silêncio de Força (Força de todos −10) · Mesa dos vizinhos (só você e quem está à direita disputam).
**Roubo (5):** Furto do líder (carta do topo de quem tem mais cartas) · Taxa do vencedor (rouba 1 de quem venceu a última) · Mão leve (1 da reserva, sem ver) · Saque em cadeia (rouba e, se a carta for maior, rouba de novo) · Troca justa (1 por 1 com o líder).
**Defesa (5):** Fortaleza (imune a redução) · Armadilha (quem captura sua carta perde a do topo) · Eco protetor (carta capturada volta ao fundo) · Casca grossa (+15 Resistência se rival ataca) · Retirada (devolve sua carta ao topo e joga a próxima).
**Buraco Negro (5):** Ressonância (2 cartas do BN com atributo ≥ X) · Oferenda (reserva ao BN, traga 2) · Colapso (topo do rival ao BN, sem disputa) · Maré do vazio (troque uma da reserva por qualquer do BN) · Eco do vazio (quando algo cai no BN, +5 na sua próxima carta).
**Informação (5):** Previsão (vê o atributo que o rival escolherá) · Marca (próxima carta do rival −10) · Rastreio (vê a reserva de um rival) · Contagem (vê quantos especiais ele tem preparados) · Memória (vê os últimos 3 pares jogados).
**Interação (5):** Contra-feitiço (copia o especial do rival se a carta dele for menor) · Roubo de preparo (pega 1 carta preparada) · Preparação dupla · Atraso (carta preparada do rival fica travada 1 rodada) · Espelho reativo (quem usar especial contra você sofre metade).
**Captura (4):** Dividir o butim (captura 2, entrega 1 ao mais fraco) · Caça ao líder (captura dobrada contra quem tem mais cartas) · Contragolpe (se capturada, recaptura) · Margem larga (vence por ≥30: captura +1).
**Troca/Redistribuição (4):** Embaralhar reservas (todos) · Equalizar (todos terminam com a mesma reserva) · Passe coletivo · Rotação do baralho (todos passam o topo à direita).
**Tempo e eventos (5):** Relógio (você inicia a próxima rodada) · Pausa (rival pula a vez) · Convocar fenômeno · Cancelar fenômeno · Escolher fenômeno entre 2.
**Misto (7):** Aliança (por 1 rodada você soma o menor atributo do rival à direita) · Carta fantasma (clone da carta do rival −10) · Sacrifício heroico (descarte 1 reserva: +30) · Dívida (rival entrega 1 reserva agora e devolve 2 em 3 rodadas) · Contagem regressiva (+5 por rodada que ficou preparada) · Oráculo (escolha a carta do topo) · Reflexo (devolve ao rival a primeira redução recebida).

## 3. Variantes baratas de habilidades que já existem (se faltar)
- **Versão "Mestre"** (mesma habilidade com valor ×1,5 e custo de preparar maior): Impulso, Muralha, Arrancada, Clarividência, Vigor, Golpe pesado.
- **Versão "Dupla"** (aplica a 2 atributos): Reflexos de aço, Rocha, Disparada, Mente afiada.
- **Versão "Condicional"** (efeito dobrado se estiver perdendo / com mais cartas): Saque livre, Resgate do topo, Escolha da reserva, Resgate aleatório duplo.
- **Direita/esquerda**: toda habilidade com lado ganha o espelho (já feito em Roubo/Troca; falta em Informação e Defesa).

## 4. Como chegar ao 190
141 em uso + reforma das 27 (mantém o número) + **49 novas** escolhidas das 58. As 13 cartas que hoje repetem habilidade receberiam 13 delas; as 8 príncipes Quasar trocariam as provisórias (AE-018, 020, 053, 054, 125-128) por habilidades próprias. Quando você escolher, implemento em lotes de 10 com teste de segurança (`sim_esp.js`) e calibração de uso (`tests/uso_especiais.js`).
