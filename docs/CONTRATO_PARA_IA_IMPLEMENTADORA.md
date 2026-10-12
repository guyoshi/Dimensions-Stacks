# Dimensions Stacks — Contrato de leitura para IA implementadora (v1.0)

> **LEIA PRIMEIRO.** O repositório está em **fase de definição de design**, não contém protótipo de jogo completo. Este contrato impede que outra IA confunda **decisões aprovadas pelo autor** com **propostas do assistente**. A implementação só deve assumir regras classificadas **CONFIRMADO**. Para recursos não aprovados, preservar o estado `pendente`, pedir validação e não inventar comportamento silenciosamente.

## 1. Hierarquia das fontes e atualização

1. **Este contrato** = índice dos estados, travas e dependências.
2. [REGRAS.md](REGRAS.md) = regras já aprovadas e lacunas explícitas. Passagens históricas/alternativas anteriores ficam subordinadas a **decisões posteriores do autor**.
3. [CARTAS_79_PROPOSTAS.md](CARTAS_79_PROPOSTAS.md) = **79 fichas propostas, ainda não aprovadas**, com fontes narrativas e 120 caracteres máximos de descrição curta.
4. [BIBLIOTECA_ATAQUES_ESPECIAIS.md](BIBLIOTECA_ATAQUES_ESPECIAIS.md) = **129 habilidades candidatas**, com 129 células vazias de `Carta atribuída (ID)`. Cada ID é uma mecânica candidata, não poder automaticamente conferido à personagem de mesmo nome histórico.
5. [PRIORIDADE_ESPECIAIS_PROPOSTA.md](PRIORIDADE_ESPECIAIS_PROPOSTA.md) = proposta de janela de reação defensiva, ordem e cancelamentos. **Não é regra consolidada**.
6. [ELENCO_CANDIDATO.md](ELENCO_CANDIDATO.md) = identidades das 79 cartas/personagens, procedência e formação da União.
7. [TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md](TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md), [LEITURAS_IA_PENDENTES_2026-10-12.md](LEITURAS_IA_PENDENTES_2026-10-12.md) e [INVENTARIO_FOTOGRAFICO_LEGADO.md](INVENTARIO_FOTOGRAFICO_LEGADO.md) = **somente histórico de ideias mecânicas e referência física**, não nome, biografia, atributo ou habilidade definitiva das novas cartas.

Repositório de fontes literárias: [guyoshi/dimensoesinfinitas](https://github.com/guyoshi/dimensoesinfinitas). Parte do cânone dos livros em andamento pode mudar; materiais com status `histórico` ou `misto` não devem ser elevados a cânone final.

## 2. Decisões CONFIRMADAS

| Domínio | Status | Decisão |
| --- | --- | --- |
| Formato | CONFIRMADO | Partidas todos contra todos com 2, 3 ou 4 jogadores; vencer eliminando as cartas utilizáveis dos demais. |
| Mão inicial | CONFIRMADO | 7 cartas no baralho ativo inicial, que o jogador pode ordenar; cartas restantes em meios de reserva. |
| Carta normal | CONFIRMADO | Só a primeira carta do baralho ativo participa da disputa, salvo habilidade que autorize outra. |
| Pares | CONFIRMADO | **Ataque (ATQ)/Defesa (DEF)** e **Inteligência (INT)/Velocidade (VEL)**. **Poder** é o nome histórico substituído por **Ataque**. |
| Tipos de vitória | CONFIRMADO | Se maior atributo vencedor é **ATQ ou INT**, captura cartas de combate rivais. Se é **DEF ou VEL**, salva a própria e descarta as demais no Buraco Negro. Exceções somente por habilidades expressas. |
| Desempate | CONFIRMADO | Valor individual; depois **soma ATQ+DEF+INT+VEL**; depois **soma ATQ+INT**. Empate posterior permanece em aberto. |
| Primeira rodada | CONFIRMADO | Cada jogador inicia uma vez, sem especiais usados. |
| Área preparada | CONFIRMADO | Até 2 especiais preparadas, viradas para baixo à esquerda, protegidas dos efeitos comuns. |
| Especial voluntário | CONFIRMADO | Ativar **no máximo 1 carta especial voluntariamente por combate**, salvo habilidade que permita 2 explicitamente. O jogador escolhe qual especial preparado usar e em qual rodada. |
| Custo especial | CONFIRMADO | Carta de especial ativada vai ao Buraco Negro, salvo exceção expressa já definida. A carta normal continua podendo perder. |
| Conflito de atributos | CONFIRMADO | Se habilidades impuserem status diferentes, comparar o atributo imposto na carta de combate de cada usuário: vence o **valor maior**, e todos usam esse atributo. Empate específico após os critérios gerais ainda pendente. |
| Ataque em dupla | CONFIRMADO | Efeito antigo #09: usar duas cartas normais consecutivas, somando o **mesmo atributo**. Destino da dupla no desfecho exige especificação adicional. |
| Uso forçado | CONFIRMADO | Efeito antigo #59 / candidato AE-111: alvo ativa **todas as suas especiais já preparadas**, até 2, mesmo sem querer. Não puxa carta não preparada. |
| Recuperação | CONFIRMADO | Efeito antigo #12: 2 cartas **aleatórias** do Buraco Negro ao **fim da própria reserva**. |
| Limpeza de campo | CONFIRMADO | Efeito antigo #54: somente cartas **normais colocadas em combate**, **não** especiais preparadas. |
| Repetição | CONFIRMADO | Efeito antigo #62: pode repetir pagando custo, **não permitir ciclos infinitos**. A especificação de limite interno exato ainda é proposta. |
| Históricos retirados | CONFIRMADO | Efeitos antigos #18, #24 e #52 não fazem parte da seleção ativa nova. Isso **não elimina** a possibilidade de outros efeitos de vitória automática raros. |
| Reação de defesa | CONFIRMADO (INTENÇÃO) | Defesas devem responder a ataques **enquanto ainda possam impedi-los**, mesmo em janelas tardias do combate. A prioridade exata e a sequência de eventos estão **PROPOSTAS**. |
| Cores | CONFIRMADO | Viajantes **azul**; Mistério Oculto **vermelha**; Ciclo de Jesed **amarela**; Belfex/Édelin **verde**; Diário Sobrenatural **roxo**; Spacetheft **preta**. |
| A União | CONFIRMADO | Integrantes ficam em suas séries, com **selo sobreposto** sem duplicar cartas. Equipe: Bruno Lins Lee, Brenda, Hyde (cabeça, fundador ainda em aberto), Releuz (temporário), Jasmey, Mark Polar, Édelin; Jennifer futura. |
| Força intencional | CONFIRMADO (DIRETRIZ) | Haverá cartas fracas, especialistas, fortes e elites; cartas ruins podem ser úteis para trocas. União deve receber **as melhores e mais marcantes habilidades**, sem implicar números definitivos aprovados. |
| Novo cancelamento | CONFIRMADO (IDEIA) | Incluir habilidade que **anula a última habilidade especial jogada**; texto concreto `AE-130` ainda candidato. |

## 3. Dados e ideias PROPOSTOS (não usar como definitivos sem aprovação)

| Item | Estado | Conteúdo |
| --- | --- | --- |
| Intervalo de atributos | **PROPOSTO** | Valores naturais inteiros de **0 a 100** e bônus temporários possivelmente acima de 100. |
| Fichas dos 79 personagens | **PROPOSTO** | Nome, descrição curta (até 120 caracteres), ATQ/DEF/INT/VEL, soma, perfil e habilidade. Todas as 79 sugestões aguardam aprovação. |
| Texto curto | **PROPOSTO** | **Máximo de 120 caracteres** por descrição de frente de carta, validado mecanicamente; precisa de teste de layout final. |
| 129 habilidades | **PROPOSTO** | Catálogo por família, alguns itens ainda arriscados. Não atribuir a personagens sem aceite. |
| Especial raro AE-129 | **PROPOSTO** | Vitória automática de comparação, diferente da mecânica física #52, retirada. Pode haver pouquíssimas cartas raras assim, conforme diretriz do autor. |
| Defesa reativa | **PROPOSTO (MECANISMO)** | Pilha de prioridade, oportunidade de resposta antes da resolução do ataque, efeitos cancelados consumidos, sem retroatividade; ver documento separado. |
| AE-130 | **PROPOSTO (TEXTO)** | Anular último especial **pendente**, não efeito já concluído. Origina-se de ideia confirmada, mas implementação detalhada precisa de aprovação. |
| Nome guarda-chuva | **PROPOSTO** | Chamar o conjunto de **Habilidades Especiais (ESP)**, pois há ataques, defesas, controles, recuperações e coringas. O nome histórico era “Ataque Especial”. |
| Total na partida | **PROPOSTO** | 18 cartas por jogador (7 ativas e 11 na reserva), ou 36/54/72 em jogos 2/3/4. Não aprovado; **não restringir automaticamente a seleção de 79 a esse número**. |
| Habilidade de dois rivais | **PARCIAL** | Em duelo direita/esquerda são a mesma pessoa. Transferir cartas de um adversário para ele mesmo pode ser gasto sem vantagem, como aprovado. Efeitos que exigem **dois rivais distintos** não têm segundo alvo; não criar saque duplicado automaticamente. |
| Atribuições de A União | **PROPOSTO** | Oito habilidades fortes reservadas inicialmente nas fichas, todas reversíveis antes da aprovação. |

## 4. Pendências que impedem um jogo competitivo definido sem novas decisões

- **Origem da carta que será preparada como especial:** topo do ativo, escolha na pilha, reserva ou outra. Não deduzir.
- **Quando preparar especiais:** regras exatas de preparação e janelas; proteções e limites estão conhecidos.
- **Momento/ordem de resolução dos especiais e das reações defensivas:** ver proposta. Não impor LIFO como fato já confirmado.
- **Direito de reação e prioridade em simultaneidade:** quem age primeiro, janela pré-revelação e defensiva pré-resolução, como resolver vários efeitos de cancelamento.
- **Empate absolutamente completo:** quando somam iguais no atributo disputado, na soma dos quatro e na soma ATQ+INT.
- **Destino das duas cartas normais do ataque especial de soma:** captura/descarte/retorno, especialmente em empate.
- **Limite e destino quando Buraco Negro ou reserva não oferecem cartas suficientes** para uma habilidade; não substituir zonas arbitrariamente.
- **Raridade, distribuição de cartas e número inicial total** da partida ainda não aprovados.
- **Como selecionar as cartas para 2/3/4 participantes sem vantagem** (as 79 candidatas não se dividem igualmente).
- **Exceções e custos de recuperações de cartas especiais** sem reativação infinita.
- **Origem e poderes canônicos** de Édelin Fils, Releuz e Richard Falkner, bem como detalhes de Diego, ainda insuficientes para afirmar capacidades definitivas. **Filippo/Filipo** requer confirmação de grafia.

## 5. Instruções rígidas para a próxima IA

**FAÇA:** manter docs com estados explícitos `CONFIRMADO`, `PROPOSTO`, `PENDENTE`; apresentar sugestões separadas da autoridade do autor; verificar cartas e habilidades por ID; mostrar efeitos/valores no layout somente quando aprovados; perguntar antes de completar lacunas mecânicas essenciais. Usar PT-BR no texto do jogo e nos materiais.

**NÃO FAÇA:** substituir decisões do autor por conveniências de programação; copiar nomes, biografias, atributos ou cor das cartas de infância; inventar atributos canônicos sem fonte; interpretar um documento histórico como livro final; dar a A União uma cor própria; duplicar automaticamente membros da União; considerar 18 cartas por jogador uma decisão aceita; considerar 79 fichas ainda propostas como baralho final; eliminar habilidades fortes apenas por intuição.

**Ponto de partida seguro:** usar dados em rascunho para UI de prévia e ferramentas internas de edição, com avisos de `não aprovado`. Não afirmar que o jogo competitivo está finalizado ou equilibrado até que as pendências essenciais sejam decididas, simuladas e testadas.

## 6. Dados estruturados para ferramenta de prévia

O diretório [dados/propostas](../dados/propostas/README.md) contém arquivos JSON de **79 cartas** e **129 habilidades**, todos com `status: PROPOSTA_NAO_APROVADA`. A IA pode importar esses arquivos **apenas para prévia, comparação e ferramentas de revisão**, nunca para considerá-los baralho validado. Em caso de divergência entre JSON e Markdown, **interrompa para reconciliar**. Não inventar valores nem completar nomes pela própria conta.

## 7. Índice operacional

- [Decisões e GDD](REGRAS.md)
- [79 fichas propostas por personagem](CARTAS_79_PROPOSTAS.md)
- [JSON para prévia das 79 cartas](../dados/propostas/cartas_79.json)
- [JSON para prévia das 129 habilidades](../dados/propostas/habilidades_129.json)
- [129 habilidades candidatas, sem atribuição confirmada](BIBLIOTECA_ATAQUES_ESPECIAIS.md)
- [Reações defensivas e prioridade propostas](PRIORIDADE_ESPECIAIS_PROPOSTA.md)
- [79 identidades e fontes canônicas](ELENCO_CANDIDATO.md)
- [Auditoria de efeitos históricos](AUDITORIA_BALANCEAMENTO_ESPECIAIS.md)
