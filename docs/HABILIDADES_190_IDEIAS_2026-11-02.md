# Rumo às 190 habilidades: ideias e reforma das 27 de uso zero (02/11/2026)

**Situação medida no motor:** 141 habilidades `AE` em uso por 154 cartas (+8 Chamados da União, só no Boss). Seis habilidades repetem em 19 cartas (AE-001×3, AE-007×4, AE-011×3, AE-021×3, AE-049×2, AE-103×4): sobram 13 cartas para receber habilidade nova. Para chegar a **190** faltam **49**. Abaixo há **63 ideias** (14 de folga). Nada foi implementado; aguarda aprovação.

## 1. Por que 27 habilidades têm "uso zero"
Medido em 400 partidas de bots (cada uma delas foi distribuída ~85 vezes, usada 0). Não é bug: `engine.js` guarda `val` (quanto vale gastar uma carta para prepará-la) calibrado por simulação, e nessas 27 o valor medido é **0**, isto é, o bot rende mais lutando com a carta do que preparando-a. Resultado: ninguém (bot) as prepara e o contador fica em zero. Em teste forçado (`sim_esp.js`) todas funcionam; o problema é que são **fracas**. Humanos podem usá-las, mas hoje não compensam.

**Cada habilidade abaixo com a carta que a tem hoje, o texto atual e a proposta (ao aprovar, aplico e meço de novo até o bot passar a usá-las):**

| ID | Habilidade | Carta que a tem | O que faz hoje | Proposta |
|---|---|---|---|---|
| AE-009 | Superação | J07 Mariv | Se o valor original escolhido da sua carta de combate for 40 ou menos, adicione +25 a esse atributo nesta disputa. | limiar sobe de ≤40 para ≤55 e o bônus de +25 para +30 |
| AE-024 | Ataque obrigatório | S07 Buni | Dentro do par vigente, todos devem usar o atributo de ataque correspondente, inclusive você. | além de obrigar todos, sua carta ganha +12 nesse atributo |
| AE-025 | Defesa obrigatória | J21 Nefestra | Dentro do par vigente, todos devem usar o atributo de defesa correspondente, inclusive você. | além de obrigar todos, sua carta ganha +12 nesse atributo |
| AE-026 | Forçar ataque rival | D02 Priscila Fontenelle | Escolha um adversário: ele deve usar o atributo de ataque do par vigente. | o rival forçado também perde 8 nesse atributo |
| AE-029 | Proibir a defesa rival | S12 Vek | Escolha um adversário: ele não pode usar o atributo de defesa do par vigente nesta disputa. | o rival que não pode defender também perde 8 no atributo de ataque do par |
| AE-051 | Troca escolhida | V25 Eshley | Troque 1 carta de seu baralho ativo, escolhida por você, por 1 carta aleatória do baralho ativo de um adversário. | você escolhe a carta do rival entre 2 sorteadas, em vez de receber 1 aleatória |
| AE-057 | Passe à esquerda | J18 Vetarius Polar | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à esquerda. | ao passar, sua carta de combate ganha +10 nesta disputa |
| AE-058 | Passe à direita | V11 Garien | Cada jogador ativo escolhe 1 carta de seu baralho ativo e a passa simultaneamente ao jogador ativo à direita. | ao passar, sua carta de combate ganha +10 nesta disputa |
| AE-063 | Troca entre vizinhos | V14 Tio Frank | Escolha, às cegas (pela posição no baralho ativo), 1 carta do jogador à esquerda e 1 do jogador à direita: elas trocam de dono. Em duelo são a mesma pessoa: a troca não produz ganho líquido, mas o especial ainda pode ser gasto. | uma das duas cartas trocadas vai para a sua reserva, em vez de ficar entre os vizinhos |
| AE-064 | Transferência de reserva | B03 Jork Caravel | Transfira 1 carta aleatória da reserva do rival à esquerda para a reserva do rival à direita, sem ficar com ela. Em duelo, ela volta ao mesmo rival e não há vantagem. | em vez de passar ao outro rival, a carta vai para a sua reserva |
| AE-065 | Tríplice transferência | J19 Cal Kerath | Transfira até 3 cartas aleatórias do baralho ativo do rival à esquerda ao do rival à direita. Em duelo, origem e destino são o mesmo rival, de modo que a transferência não gera ganho líquido. | 1 das cartas transferidas vai para a sua reserva; as outras 2 seguem como hoje |
| AE-070 | Conquista compensada | V07 Lucan Veline | Capture as cartas normais em combate, mas entregue 1 carta escolhida de seu baralho ativo a cada adversário ativo envolvido. | entrega 1 carta da reserva (não do baralho ativo) a cada adversário envolvido |
| AE-091 | Revelar a mão | D08 Glenda Mendes | Um adversário revela a ordem de todas as cartas de seu baralho ativo para você até o fim desta disputa. | além de ver a ordem, a carta do topo do rival perde 10 nesta disputa |
| AE-092 | Próximas três | S14 Genrir | Veja as 3 próximas cartas de seu baralho ativo e coloque-as no topo na ordem que preferir. | vê 5 cartas e reordena as 3 do topo |
| AE-094 | Inversão de fila | V27 Farol | Inverta apenas a ordem das 3 próximas cartas de seu baralho ativo. | inverte as 5 próximas cartas e você as vê |
| AE-096 | Quebrar o plano | J02 Nestira Amarëa | Misture as cartas do baralho ativo de um adversário com sua reserva; depois ele separa as primeiras 5 para formar seu novo baralho ativo. | o novo baralho ativo do rival tem 4 cartas em vez de 5 |
| AE-098 | Organizar reserva | D16 A Mãe | Veja as 4 primeiras cartas de sua reserva e reorganize-as na ordem desejada. | depois de reorganizar, 1 das 4 vai ao topo do baralho ativo |
| AE-099 | Reforçar o fim | V23 Erick Corvane | Mova a primeira carta de sua reserva para o fim do seu baralho ativo, sem ver seu conteúdo. | move 2 cartas da reserva (e não 1) ao fim do baralho, e você vê a primeira |
| AE-100 | Confundir próximo turno | V16 Faka | Veja até 3 cartas seguintes do baralho ativo de um adversário; escolha qual ficará no topo, preservando a ordem relativa das demais. | além de escolher o topo, a carta escolhida perde 10 na disputa |
| AE-102 | Capturar defensor | S10 Jelles | Se Resistência + Velocidade da carta de combate de um adversário for maior ou igual a Força + Inteligência, capture essa carta quando o combate terminar, se ainda estiver em jogo. | a condição vale também para FOR+RES contra INT+VEL (qualquer par maior ou igual) |
| AE-107 | Iniciativa contra fracos | V37 Lioro | Se a carta de combate de um rival tiver 30 ou menos no atributo escolhido, ela não poderá se proteger contra o seu próximo efeito de roubo nesta disputa. | o limiar sobe de 30 para 45 no atributo escolhido |
| AE-108 | Negar captura inimiga | V17 Lanigiah | Se perder para um atributo de ataque, sua carta de combate vai ao Buraco Negro, não ao baralho do vencedor. | a carta que iria ao Buraco Negro volta ao fundo do seu baralho |
| AE-111 | Ativação forçada | M10 Releuz | Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas, até duas, nesta disputa, mesmo que a regra geral permita somente uma ativação voluntária. | o rival ativa os especiais e você ganha +8 em tudo nesta disputa |
| AE-118 | Blindagem de especial | J27 Tair Nular | Um especial seu preparado fica imune a 1 tentativa de cancelamento nesta disputa; não impede custos nem ativações forçadas. | a blindagem resiste a 2 tentativas de cancelamento |
| AE-119 | Preparação urgente | V41 Elowen | Se a regra de preparação permitir, prepare imediatamente a próxima carta de seu baralho ativo como especial, sem poder ativá-la nesta disputa. | a carta preparada pode ser ativada já nesta disputa |
| AE-121 | Resistência → Velocidade | D10 Sra. Olívia | Substitua o valor de Velocidade pelo valor que sua carta possui em Resistência; Resistência permanece igual. | Velocidade = Resistência + 30% da Velocidade original |
| AE-122 | Velocidade → Resistência | V35 Lárida Celeste | Substitua o valor de Resistência pelo valor que sua carta possui em Velocidade; Velocidade permanece igual. | Resistência = Velocidade + 30% da Resistência original |

(Todas são mudança de balanceamento; só aplico com sua aprovação.)

## 2. Ideias novas — decisão de 02/11 (13:47): só as aprovadas e as sem decisão permanecem; as não aprovadas foram removidas
 (cada uma usa mecânicas que o motor já tem: atributos, reserva, preparar, Buraco Negro, captura, fenômenos)

### Bônus (7)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 1 | Maré alta | +15 no atributo mais fraco da sua carta nesta disputa. | Aprovada |
| 2 | Segundo fôlego | +20 no atributo escolhido se você perdeu a disputa anterior. | Aprovada |
| 3 | Foco duplo | +12 em dois atributos à sua escolha. | Aprovada |
| 4 | Último suspiro | +25 no atributo escolhido se seu baralho tem 3 cartas ou menos. | Aprovada |
| 5 | Veterano | +2 no atributo escolhido por carta que você já capturou (máx. +20). | Aprovada |
| 6 | Aposta | +25 no atributo escolhido; se perder a disputa, a carta vai ao Buraco Negro. | Aprovada |
| 7 | Fúria | +30 em Força e −15 em Resistência nesta disputa. | Sem decisão |

### Conversão (6)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 11 | Inversão do rival | Na carta do rival, o maior e o menor atributo trocam de valor. | Aprovada |
| 13 | Reciclagem | O maior atributo da sua carta perde 10 e os outros três ganham 6. | Aprovada |

### Controle (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 14 | Atributo vetado | O melhor atributo da carta do rival não pode ser escolhido. | Aprovada |
| 16 | Sorteio viciado | Um atributo é sorteado e sua carta ganha +15 nele. | Aprovada |
| 17 | Silêncio de Força | A Força de todas as cartas perde 10 nesta disputa. | Aprovada |
| 18 | Mesa dos vizinhos | Só você e o jogador à direita disputam; os demais ficam de fora. **Versão espelho:** também existe para o jogador à esquerda. **Nova "Pular rodada":** você não participa desta rodada (só com 3+ jogadores; com 2, o rival apenas passa a carta ao fim do baralho, como se tivesse jogado sozinho e empatado). | Aprovada (alterada) |

### Roubo (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 19 | Furto do líder | Pega a carta do topo do jogador que tem mais cartas. | Aprovada |
| 20 | Taxa do vencedor | Pega 1 carta de quem venceu a última disputa. | Aprovada |
| 21 | Mão leve | Pega 1 carta da reserva de um rival, sem ver qual. | Aprovada |
| 23 | Troca justa | Você escolhe 1 carta sua; a do jogador com mais cartas é aleatória, e as duas trocam. | Aprovada (alterada) |

### Defesa (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 24 | Fortaleza | Sua carta fica imune a reduções nesta disputa. **Até 3 cartas podem ter essa habilidade.** | Aprovada (alterada) |
| 25 | Armadilha | Quem capturar sua carta perde a carta do topo do baralho. | Aprovada |
| 26 | Eco protetor | Se sua carta for capturada, ela volta ao fundo do seu baralho. | Aprovada |
| 27 | Casca grossa | +15 em Resistência quando o rival ataca. | Aprovada |
| 28 | Retirada | Devolve sua carta ao topo e joga a próxima no lugar. Você escolhe se a nova joga ataque ou defesa do atributo escolhido. | Aprovada (alterada) |

### Buraco Negro (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 29 | Ressonância | Traz do Buraco Negro as 2 cartas de maior valor no atributo da disputa. | Aprovada |
| 30 | Oferenda | Manda uma carta da reserva ao Buraco Negro e traz 2 de lá. | Aprovada |
| 31 | Colapso | Manda a carta do topo do rival ao Buraco Negro, sem disputa. | Aprovada |

### Informação (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 35 | Marca | A próxima carta do rival perde 10 em tudo. | Aprovada |
| 36 | Rastreio | Mostra a reserva de um rival. | Aprovada |
| 37 | Espiar especiais | Mostra qual é o especial preparado de todos os rivais. (substitui "Contagem") | Aprovada (alterada) |

### Interação (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 40 | Roubo de preparo | Pega uma carta preparada (com especial) do rival. | Aprovada (alterada) |
| 42 | Atraso | Impede qualquer jogador de usar habilidade nesta rodada. | Aprovada (alterada) |

### Captura (4)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 44 | Dividir o butim | Dá 3 cartas do jogador mais forte ao mais fraco (podendo ser você). Forte/fraco = quem tem mais/menos cartas; em empate numérico as 3 se dividem, com a maioria para você. (substitui a versão antiga) | Aprovada (alterada) |
| 45 | Caça ao líder | A captura vale em dobro contra quem tem mais cartas. | Sem decisão |
| 46 | Contragolpe | Se sua carta for capturada, você recaptura outra. | Sem decisão |
| 47 | Margem larga | Se vencer por 30 ou mais, captura 1 carta a mais. | Aprovada |

### Troca e redistribuição (4)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 48 | Embaralhar reservas | Todos ficam com 4 cartas na reserva; as excedentes (de quem tem mais de 4) são embaralhadas de volta ao baralho/reserva. | Aprovada (alterada) |

### Tempo e fenômenos (5)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 52 | Relógio | Você inicia a próxima rodada. | Sem decisão |
| 53 | Pausa | Um rival pula a vez na próxima disputa. | Aprovada |
| 54 | Convocar fenômeno | Faz um fenômeno aleatório acontecer na próxima rodada. | Aprovada |
| 55 | Cancelar fenômeno | Anula os efeitos do fenômeno nesta disputa. | Aprovada (alterada) |
| 56 | Escolher fenômeno | Você escolhe entre 2 fenômenos sorteados para a próxima rodada. **Até 2 cartas podem ter essa habilidade.** | Aprovada (alterada) |

### Misto (7)

| # | Nome | O que faz | Situação |
|---|---|---|---|
| 57 | Aliança | Por 1 rodada, soma o menor atributo da carta do jogador à direita à sua. | Sem decisão |
| 58 | Carta fantasma | Cria um clone da carta do rival com −10 em tudo; o clone vai ao fim do seu baralho. | Aprovada (alterada) |
| 59 | Sacrifício heroico | Descarte 1 carta da reserva: +30 no atributo escolhido. | Aprovada |
| 63 | Reflexo | Devolve ao rival a primeira redução que você receber. | Aprovada |


### Pedidos novos (a desenhar e propor antes de implementar)
- 2 habilidades que embaralham todas as cartas em uso de um jogador; uma delas embaralha entre todos os jogadores (você incluído) e permite que todos reorganizem.
- +3 habilidades que impedem roubos.
- 2 habilidades que invertem o ataque contra a pessoa (se for possível).
- 1 habilidade que embaralha todos os atributos das cartas de cada jogador (usável antes de a rodada começar).
- 1 habilidade que troca os atributos de duas cartas aleatórias no fim da rodada, antes do vencedor (podendo incluir a sua).
- 1 habilidade que troca o tipo ATQ/DEF por INT/VEL (ou INT/VEL por ATQ/DEF).
- Se ainda faltar para 190: variantes baratas (seção 3).

### Removidas (não aprovadas)
8, 9, 10, 12, 15, 22, 32, 33, 34, 38, 39, 41, 43, 49, 50, 51, 60, 61, 62. Sem decisão: 7, 45, 46, 52, 57.

## 3. Variantes baratas de habilidades que já existem (se faltar)
- **Versão "Mestre"** (mesma habilidade com valor ×1,5 e custo de preparar maior): Impulso, Muralha, Arrancada, Clarividência, Vigor, Golpe pesado.
- **Versão "Dupla"** (aplica a 2 atributos): Reflexos de aço, Rocha, Disparada, Mente afiada.
- **Versão "Condicional"** (efeito dobrado se estiver perdendo / com mais cartas): Saque livre, Resgate do topo, Escolha da reserva, Resgate aleatório duplo.
- **Direita/esquerda**: toda habilidade com lado ganha o espelho (já feito em Roubo/Troca; falta em Informação e Defesa).

## 4. Como chegar ao 190
141 em uso + reforma das 27 (mantém o número) + as novas aprovadas (hoje 36 das 63, mais as alteradas 37/40/44 e os pedidos novos acima). As 13 cartas que hoje repetem habilidade receberiam 13 delas; as 8 príncipes Quasar trocariam as provisórias (AE-018, 020, 053, 054, 125-128) por habilidades próprias. Quando você escolher, implemento em lotes de 10 com teste de segurança (`sim_esp.js`) e calibração de uso (`tests/uso_especiais.js`).


## Decisão 02/11 (13:21)
Aprovadas: AE-009, 024, 025, 026, 029, 051, 063, 064, 065, 070, 091, 092, 094, 100. Modificadas pelo autor: AE-098 (reorganiza a reserva toda e escolhe 1 para o topo), AE-099 (vê as 2 primeiras, escolhe 1), AE-107 ("Pior pelo melhor"), AE-111 (obriga todos os adversários). Não aprovadas (inalteradas): AE-057, 058, 102, 108. Já implementadas no jogo.

## Decisão 02/11 (13:47)
- Aprovadas as reformas AE-118, AE-121 e AE-122 (mantêm o texto atual).
- **AE-119** (não aprovada como estava) muda para: *embaralhe a ordem das cartas de todos os jogadores, menos você.* (ainda não implementada)
- Novas mecânicas: aprovadas as marcadas "Aprovada" acima, com as alterações indicadas. Interpretações a confirmar: 37 e 44 tratadas como substituídas pela nova versão (aprovadas); 40 só vale se roubar de cartas com especial preparado.
- Nada foi implementado nesta etapa; só a documentação.
