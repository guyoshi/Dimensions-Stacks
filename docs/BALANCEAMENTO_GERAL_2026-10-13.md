# Balanceamento geral — 2026-10-13

Status: **A, B e C APLICADOS com autorização do autor em 13/10/2026** (ver seção "Aplicado" no fim). Análise original abaixo.

Escopo: 97 cartas (Manu/D19 entrou depois e não foi simulada) × 78 habilidades. Scripts e dados brutos em `prototipo/tests/balanco/`.

## Método
- Força da carta: taxa de vitória da carta isolada (habilidades desligadas) e em baralhos reais (com taxa de sacrifício), via motor real (`engine.js`).
- Valor da habilidade: `tests/bot_per_special.js` (todas as cartas com a habilidade X; um bot usa, o outro nunca). Valor = ganho de vitória.
- Percentis: `pc` = força da carta, `ps` = valor da habilidade, `gap = ps − pc`. Regra do autor: carta muito boa só deve ser sacrificada por habilidade muito boa, e vice-versa. Gap muito positivo = bateria barata (carta fraca com habilidade forte); gap muito negativo = carta forte sem habilidade que compense.

## Achados
1. **O perfil por soma não prevê força real.** Taxa média de vitória por perfil: Elite 70,9 · Forte 54,4 · Padrão 38,8 · Frágil 39,3 · Modesta 33,6 · Azar 28,0. Frágil empata com Padrão e supera Modesta.
2. **A causa é o pico de atributo, não a soma.** Quem inicia escolhe qualquer um dos 4 atributos, então um INT 95+ vence quase toda disputa nesse atributo. Cartas acima do que a soma indica: Velho-Sábio (Padrão, INT 96, pc 96), James Harrow (Padrão, INT 96, pc 94), X (Frágil, soma 171, INT 99, pc 90), Lias Hardman (Frágil, INT 96, pc 85), Hyde (INT 100).
3. **Mais fortes (pc):** Korvo 100, Agouro 99, William McCroys 98, Grande Pai Gaia 97, Velho-Sábio 96, Agente Sete 95, Harrow 94, Agente Seis 93, Lanigiah 92, Hyde 91, X 90, Édelin Lys 89.
4. **Mais fracas (pc):** Diego Tavolieri 1, Tio Frank 2, A Mãe 3, Filipo Brandolini 4, Gary 5, Diana 6, O Pai 7, Suéten 8, Mariv 9, Nicolas Corvane 10.
5. **Inversões graves (carta forte, habilidade fraca):** Hyde (−73), X (−72), Agente Sete (−71), Mark Polar (−68), Lias Hardman (−67), Vivian (−63), Alekta (−58), Ricochet (−55), Brenda (−48).
6. **Inversões graves (carta fraca, habilidade forte = bateria barata):** Vek (+77), Luna Stellar (+68), Diana (+68), Alyra (+60), O'reilly (+59), Nicolas Corvane (+59), Erick Corvane (+59), Kord (+55), O Pai (+53), Erla (+51).
7. **Habilidades reativas subestimadas:** o bot quase não usa habilidades reativas (uso ≈ 0), então o valor medido delas é um piso. Vários "ps baixos" acima (AE-115, 116, 120, 130, 113, 073) podem ser artefato do bot, não fraqueza real. Validar com bot que use reativas antes de concluir.
8. **Dados fora de sincronia:** `habilidades_129.json` → `cartas_atribuidas` está desatualizado em relação a `cartas_87.json` (41 de 78 habilidades divergem). Não corrigido.

## Propostas (não aplicadas)
**A. Trocas de habilidade entre pares invertidos** (nenhum atributo muda; só o especial troca de dono):

| Carta forte (recebe) | Carta fraca (recebe) | Especiais trocados |
|---|---|---|
| Hyde | Vek | AE-115 ↔ AE-032 |
| Agente Sete | Erla | AE-130 ↔ AE-031 |
| Mark Polar | Alyra | AE-116 ↔ AE-037 |
| Vivian | Kord | AE-113 ↔ AE-006 |
| X | Luna Stellar | AE-093 ↔ AE-039 |
| Lias Hardman | Diana | AE-120 ↔ AE-041 |

Risco: a habilidade pode ter relação narrativa com o personagem; decisão do autor. Não validada por simulação completa.

**B. Teto de pico de atributo** (opção): limitar atributos a 95 (ou reduzir 3–5 pontos de INT em Hyde, X, Harrow, Velho-Sábio, McCroys, Hardman). Efeito esperado: reduz o domínio por INT. Não validado; o otimizador (`tests/balanco/run_opt.py`) não terminou.

**C. Perfil visual:** como o perfil (soma) não reflete a força real, considerar basear a raridade visual (◆) em força real ou em soma + pico. Decisão de design do autor.

## Pendências
- Rodar o otimizador em segundo plano e validar A e B no motor (sobrescrevendo `E.CARDS[id].stats` e `.especial`).
- Simular com bot que use habilidades reativas.
- Simular Manu (D19).

## Aplicado (autorizado pelo autor, 13/10/2026)
- **A. Trocas de habilidade** (6 pares): Hyde AE-032, Vek AE-115 · Agente Sete AE-031, Erla AE-130 · Mark Polar AE-037, Alyra AE-116 · Vivian AE-006, Kord AE-113 · X AE-039, Luna Stellar AE-093 · Lias Hardman AE-041, Diana AE-120.
- **B. Teto de 95 por atributo.** Alterou 13 cartas (J17, V05, V10, V18, S04, S11, D12, M01, M02, M08, M11, M12, V20); soma e perfil recalculados. Hyde passou de Forte para Padrão. Validação: o efeito sobre a dispersão de força é pequeno (desvio-padrão da taxa de vitória 18,4 → 18,9; a força é relativa, então baixar picos isolados quase não muda o ranking). O teto vale como regra de design, não como correção de equilíbrio.
- **C. Raridade visual (losangos) por poder** = soma + 16 × maior atributo (regressão sobre a força simulada: r ≈ 0,90; no motor, correlação 0,84 contra 0,58 da soma). Cortes: Lendária ≥ 1810 (11 cartas), Épica ≥ 1710 (21), Rara ≥ 1560 (32), Comum abaixo (34). Taxa de vitória média por raridade no motor: Lendária 75%, Épica 57%, Rara 45%, Comum 25%, agora monotônica. O rótulo "Perfil" (soma) segue como informação separada.
- **Manu (D19)** aprovada pelo autor (atributos 28/44/78/52, AE-093). Faixa "PRÉVIA" removida do jogo (opção e selo).
- Dados: `dados/oficial/cartas_87.json` (metadata `revisao_13_10_2026_balanceamento`).

## Especiais repetidos (aplicado, 13/10/2026, autorizado pelo autor)

**Pedido:** nenhuma habilidade repetida entre cartas; usar as que estavam sem carta, sem deixar nenhuma carta apelar, e conferir o equilíbrio.

**Antes:** 98 cartas, 78 especiais distintos; 18 especiais repetidos (AE-093 em 4 cartas, outros 17 em 2) e 51 especiais da biblioteca sem carta.

**Método:**
1. Valor dos 51 especiais livres medido por simulação (`tests/bot_per_special.js`, duelo e 4 jogadores, bot difícil: % de vitória de quem usa × quem nunca usa).
2. Força de cada carta medida por simulação com especiais desligados (`tests/balanco/cardsim.js`).
3. Em cada grupo repetido, o especial ficou com quem já combinava melhor (integrantes da União e Manu ficaram com o deles); as outras 20 cartas receberam especiais livres por atribuição ótima (percentil da carta ≈ percentil do especial, regra do autor).
4. Excluídos do sorteio: **AE-054** (99% de vitória em duelo: apela) e **AE-023** (valor negativo).

**Resultado (20 cartas):**

| Carta | Antes | Agora |
|---|---|---|
| J10 Daryon Polar | AE-096 — Quebrar o plano | AE-060 — Permuta das reservas à direita |
| S03 Eric | AE-069 — Doação escolhida | AE-016 — Inteligência → Resistência |
| J05 Maletar | AE-076 — Guardião do baralho | AE-124 — Permutar Força e Velocidade |
| S18 Alekta | AE-116 — Apropriar especial usado | AE-123 — Permutar Força e Inteligência |
| J12 Rendar | AE-105 — Defesa que captura | AE-052 — Troca de combatente |
| V23 Erick Corvane | AE-106 — Ataque que bane | AE-009 — Superação |
| J21 Nefestra | AE-093 — Espionagem tripla | AE-038 — Recompensa defensiva |
| D17 A Avó | AE-093 — Espionagem tripla | AE-058 — Passe à direita |
| S17 Luna Stellar | AE-093 — Espionagem tripla | AE-056 — Troca de topos à esquerda |
| V03 Banjo Lins | AE-080 — Anular modificador | AE-011 — Força → Inteligência |
| V04 Beatriz Lins | AE-067 — Descarte adversário | AE-127 — Permutar Inteligência e Resistência |
| V08 Garmand | AE-004 — Arrancada | AE-088 — Retorno imediato |
| M04 Matt Pontas | AE-100 — Confundir próximo turno | AE-015 — Resistência → Inteligência |
| V18 Grande Pai Gaia | AE-103 — Ruína de campo | AE-007 — Ímpeto ofensivo |
| S16 A Engenheira | AE-085 — Resgate escolhido | AE-070 — Conquista compensada |
| D07 Ingrid Marques | AE-051 — Troca escolhida | AE-029 — Proibir a defesa rival |
| D10 Sra. Olívia | AE-092 — Próximas três | AE-027 — Forçar defesa rival |
| M11 X | AE-039 — Saque revelado | AE-042 — Última da esquerda |
| V22 Nicolas Corvane | AE-028 — Proibir o ataque rival | AE-057 — Passe à esquerda |
| V20 William McCroys | AE-111 — Ativação forçada | AE-005 — Reforço flexível |

**Verificação de equilíbrio (700 partidas reais de 2 e de 4 jogadores, antes × depois, motor igual):**
- Desvio padrão da taxa de vitória entre as cartas: duelo 17,7 → 18,6; 4 jogadores 18,2 → 18,2 (sem piora).
- Carta mais forte continua a mesma (Korvo, 91% no duelo); nenhuma das 20 cartas mudadas virou exceção. As mais altas: Grande Pai Gaia 81 → 84% (duelo), William McCroys 82 → 82%, Alekta 61 → 65%.
- Auditoria de especiais: 144 cenários, 0 falhas; simulação dos 129 especiais: 0 falhas; privacidade online: 0 vazamentos.
- **Ressalva:** 4 cartas fracas (Erick Corvane AE-009, A Avó AE-058, A Engenheira AE-070, Nicolas Corvane AE-057) receberam especiais de impacto baixo; o bot nunca os prepara. Isso é intencional (carta fraca, especial fraco), mas, se o autor quiser que eles tenham mais utilidade, a troca é por especiais mais fortes e deve ser decidida à parte.

## Par forte e especiais apelões (aplicado, 13/10/2026, autorizado pelo autor)

**Regra do par forte.** Fora de A União, uma carta é forte em **um** par (FOR/RES **ou** INT/VEL), nunca nos dois: quem é forte nos dois pares vence quase sempre, seja qual for o atributo sorteado. O par mais fraco de 8 cartas foi comprimido para no máximo 70 (valores acima de 60 comprimidos proporcionalmente; o par forte não mudou). Integrantes de A União ficam como o autor aprovou. O par forte de cada carta foi escolhido pela narrativa (magos e mentes: INT/VEL; corpo e disciplina: FOR/RES) e pode ser trocado.

| Nº | Carta | Par forte | FOR/RES/INT/VEL | Perfil |
| --- | --- | --- | --- | --- |
| V05 | Velho-Sábio / Auream | INT/VEL | 62/83/95/39 → 61/70/95/39 | Padrão → Padrão |
| V10 | Korvo | INT/VEL | 95/79/94/72 → 70/65/94/72 | Elite → Forte |
| V17 | Lanigiah | INT/VEL | 76/82/95/43 → 67/70/95/43 | Forte → Padrão |
| V18 | Grande Pai Gaia | FOR/RES | 80/95/89/34 → 80/95/70/34 | Forte → Padrão |
| D12 | Agouro | INT/VEL | 95/87/92/70 → 70/68/92/70 | Elite → Forte |
| M02 | Agente Sete | FOR/RES | 83/95/90/80 → 83/95/70/67 | Elite → Forte |
| M07 | Agente Seis | FOR/RES | 77/94/88/59 → 77/94/70/59 | Forte → Forte |
| V20 | William McCroys | INT/VEL | 82/78/95/78 → 70/68/95/78 | Elite → Forte |

Vitórias por disputa nas simulações de bots (700 partidas por modo): **maior taxa de uma carta 91% → 77%** (2 jogadores) e 79% → 63% (4 jogadores); desvio entre cartas 18,6 → 16,3 e 18,2 → 15,7. Korvo 91 → 67, Agouro 91 → 61, Agente Sete 85 → 69, Gaia 84 → 68, Velho-Sábio 79 → 67, Agente Seis 78 → 66, McCroys 82 → 74, Lanigiah 83 → 70 (2 jogadores).

**Segunda leva (autorizada pelo autor em 14/10/2026):** a mesma regra aplicada a Capitã Nastácia, Jelles, Vivian, Alekta, Jennifer de Morais e aos integrantes de A União Jasmey, Releuz e Édelin Lys.

| Nº | Carta | Par forte | FOR/RES/INT/VEL | Perfil |
| --- | --- | --- | --- | --- |
| S01 | Jasmey Badrock | FOR/RES | 92/76/72/88 → 92/76/64/70 | Elite → Forte |
| S08 | Vivian | INT/VEL | 83/70/89/65 → 70/64/89/65 | Forte → Forte |
| S09 | Capitã Nastácia | FOR/RES | 91/93/82/75 → 91/93/70/67 | Elite → Elite |
| S10 | Jelles | FOR/RES | 93/82/80/65 → 93/82/70/62 | Elite → Forte |
| D06 | Jennifer de Morais | INT/VEL | 71/77/91/70 → 66/70/91/70 | Forte → Forte |
| M10 | Releuz (nome temporário) | INT/VEL | 76/92/87/82 → 65/70/87/82 | Elite → Forte |
| B01 | Édelin Lys | FOR/RES | 92/83/86/80 → 92/83/70/68 | Elite → Forte |
| S18 | Alekta | INT/VEL | 84/70/68/88 → 70/64/68/88 | Forte → Forte |

Resultado final (700 partidas por modo, bots): maior taxa de uma carta 91% → 74% (2 jogadores) e 79% → 62% (4 jogadores); desvio entre cartas 18,6 → 14,3 e 18,2 → 14,0. Releuz caiu de 62% para 49% (2 jogadores), e Nastácia de 69% para 56%.

**Especiais mudados (alterações de balanceamento):**

| Especial | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| AE-005 Reforço flexível (V20) | +15 | +10 | 89% de vitórias do bot que a usa |
| AE-007 Ímpeto ofensivo (V18) | +10 FOR e +10 INT | +7 e +7 | 83% |

O bônus pequeno ainda rende muito para o bot porque ele usa a habilidade só quando sabe que vira o resultado; o ganho vem da informação, não do número. Humanos devem sentir menos.

**Apelões na reserva (não atribuir sem reequilibrar):** AE-054 (99%), AE-033/034/035 (89%), AE-109 (84%), AE-003 (80%) estão marcados no campo `revisao` de `habilidades_129.json`. Apelões equipados e não alterados, para o autor decidir: AE-053 (S14), AE-010 (J15), AE-031 (M02), AE-039 (M07), AE-087 (V10), AE-101 (M06) e, em integrantes de A União, AE-129, AE-103, AE-032.

**Quatro cartas com especial que o bot nunca usava** (0 usos por disputa) receberam especiais úteis: Erick Corvane AE-009 → **AE-043**, A Avó AE-058 → **AE-049**, A Engenheira AE-070 → **AE-045**, Nicolas Corvane AE-057 → **AE-050**. Os especiais originais dessas cartas, retirados antes, foram AE-106, AE-093, AE-085 e AE-028 (nessa ordem).

## Especiais de baixo valor trocados e especiais novos (14/10/2026, autorizado pelo autor)

**Critério:** valor medido abaixo de 47% de vitórias para o bot que usa o especial (quem nunca usa vence 48%). O AE-068 Tributo por sacrifício saiu de S11 A Besta e foi para M05 Padre Tomas, o personagem mais fraco, a pedido do autor. Ficaram de fora o AE-073 de V15 Brenda (integrante de A União), o AE-093 de D19 Manu (aprovado pelo autor) e o AE-130 de V06 Erla (pedido do autor).

**Especiais novos criados (12; texto completo na seção O da biblioteca):**

| ID | Nome | Efeito | Valor 2 jog. | Carta |
| --- | --- | --- | ---: | --- |
| AE-131 | Enfraquecer | Rival perde 15 em todos os atributos | 94% | D14 Filipo |
| AE-132 | Quebrar o melhor | Maior atributo do rival cai 25 | 88% | D03 Pedro |
| AE-133 | Desgaste coletivo | Todos os rivais perdem 8 no atributo que você usa | 56% | S11 A Besta |
| AE-134 | Cortar o par | Reação, após a revelação: rival perde 20 no atributo que escolheu | 97% | M03 Diana |
| AE-135 | Vigor | +12 Força e +12 Resistência | 64% | S12 Vek |
| AE-136 | Lucidez veloz | +12 Inteligência e +12 Velocidade | 73% | J07 Mariv |
| AE-137 | Golpe pesado | +20 Força | 65% | S05 Kord |
| AE-138 | Rocha | +20 Resistência | 54% | V24 Maria Santoro |
| AE-139 | Disparada | +20 Velocidade | 55% | V09 Ricochet |
| AE-140 | Mente afiada | +20 Inteligência | 78% | V07 Lucas |
| AE-141 | Intimidar | Rival perde 12 em Força e Inteligência | 71% | V21 Shirley |
| AE-142 | Reflexos de aço | +15 Resistência e +15 Velocidade | 61% | V19 Seti |

AE-131, AE-132 e AE-134 têm valor alto no bot porque ele só os usa quando sabe que viram o resultado; por isso foram para as cartas mais fracas, e nenhuma carta com eles passou de 35% de vitórias. O AE-134 é o primeiro especial de reação que não depende de um especial rival: a janela de reação abre para quem o tem preparado.

**Trocas de especial (antes → depois):** M03 Diana AE-120 → AE-134 · D14 Filipo AE-077 → AE-131 · D03 Pedro AE-084 → AE-132 · V07 Lucas AE-097 → AE-140 · J07 Mariv AE-090 → AE-136 · S11 A Besta AE-068 → AE-133 · V21 Shirley AE-076 → AE-141 · V24 Maria Santoro AE-080 → AE-138 · S05 Kord AE-113 → AE-137 · S12 Vek AE-115 → AE-135 · J09 Alyra AE-116 → AE-040 · V09 Ricochet AE-017 → AE-139 · V08 Garmand AE-088 → AE-044 · V01 Breno AE-078 → AE-001 · M09 Richard AE-118 → AE-036 · J23 Kedran AE-079 → AE-125 · J11 Cal Edran AE-074 → AE-014 · V19 Seti AE-105 → AE-142 · M05 Padre Tomas AE-092 → AE-068.

Os 18 especiais que saíram voltam à reserva (campo `revisao` em `habilidades_129.json`).

## Ajustes de 14/10/2026 (autorizados pelo autor)

- **AE-094 Inversão de fila** mantido.
- **AE-089 Sacrifício duplo → Sacrifício por três (J16 Elis):** agora envia **1 carta escolhida** do baralho ativo ao Buraco Negro e recupera **até 3 aleatórias** de lá (antes: mandava 2 e recuperava até 3).
- **Especiais retirados** (removidos do catálogo e dos docs de AE; voltam apenas se o autor quiser): **AE-112** Repetição onerosa (repetir um especial descartando 2 cartas), **AE-095** Atrasar a próxima (mover a próxima carta do rival ao fim do baralho) e **AE-086** Troca pelo descarte (1 carta ao Buraco Negro, recuperar até 2). Catálogo: 129 − 3 + 12 = **138 habilidades**; 102 equipadas, 36 na reserva.
- **Substitutos nas cartas que os tinham:** D06 Jennifer de Morais AE-109 · V11 Gary AE-003 · M12 James Harrow AE-102.
- **Prévia de conversão:** em especiais que convertem ou somam atributos (Resistência passa a valer a Inteligência etc.), a folha de escolha mostra "Sua carta: atributo a → b" com os valores resultantes antes de o jogador confirmar.
- **Reordenar ao comprar da reserva:** o jogador reordena as cartas que acabou de comprar (até 7; era 6 até 14/10/2026). O bot ordena sozinho. Início da partida: a ordem da reserva segue aleatória (a mão inicial já é ordenada pelo jogador).


## Fenômenos dimensionais — teste de estresse (14/10/2026)
`tests/sim_eventos.js`: 4 bots (fácil/normal/difícil/difícil), 14 cartas, 150 jogos por linha, com o evento FORÇADO em todas as rodadas (muito mais severo que o real, ~15% das rodadas).

| Evento | Rodadas méd. | Vence fácil/normal/difícil | Iniciador vence | Ataque/Defesa |
|---|---|---|---|---|
| base (sem evento) | 13,4 | 9% / 25% / 66% | 56% | 63/36 |
| Maré de Força | 18,3 | 8 / 18 / 74 | 57% | 77/22 |
| Névoa Mental | 17,9 | 7 / 19 / 73 | 56% | 78/21 |
| Eco | 13,4 | 7 / 27 / 67 | 56% | 63/36 |
| Batalha Aberta | 15,3 | 11 / 17 / 72 | 40% | 68/31 |
| Tempestade | 14,0 | 11 / 19 / 69 | 54% | 64/35 |
| Buraco Negro | 15,8 | 11 / 21 / 68 | 55% | 64/36 |
| Eclipse | 10,8 | 14 / 27 / 59 | 45% | 49/51 |
| Avesso | 13,8 | 15 / 23 / 63 | 44% | 54/46 |
| Troca | 13,0 | 4 / 21 / 75 | 56% | 62/37 |

Resultado: 0 falhas, conservação de cartas e duplicatas OK, nenhuma partida chegou ao limite. Nada decide a partida sozinho; o nível do jogador continua mandando (difícil sempre ≥59%). Observações: Força/Névoa alongam a partida ~35% quando forçadas todas as rodadas (ataque ganha mais); Eclipse encurta; Avesso e Aberta reduzem a vantagem do iniciador (de 56% para 44% e 40%). Achado e corrigido: os bots ignoravam o Avesso (jogavam para o maior) — agora invertem a previsão; antes o fácil vencia 31% e o iniciador só 19%.

## Ciclo de Jesed recalculado + Édelin Lys com 5 cartas (14/10/2026, autorizado pelo autor)

**Atributos de Jesed (23 cartas)** recalculados a partir dos rankings do autor (app de classificação; dados em `dados/ranking_jesed_2026-10-14.json`, resultado em `dados/proposta_atributos_jesed_2026-10-14.json`, método em `prototipo/tools/calc_atributos.js`):
- valor de cada atributo = quantil (na distribuição atual das 98 cartas) da posição da carta na lista daquele atributo; a lista Geral ajusta o total (peso 0,35); a ordem de cada lista é preservada (média nos blocos em conflito); teto de 95.
- **Regra do par forte aplicada sempre** (decisão do autor, 14/10/2026): par fraco no máximo 70, valores acima de 60 comprimidos proporcionalmente; A União isenta. Atingiu 9 cartas: Rendar 90/73/92/80→70/64/92/80, Kaelina 74/71/90/61→70/68/90/61, Cal Edran 82/69/78/63→82/69/70/62, Gabasteri 72/80/71/83→66/70/71/83, Jokara 57/95/75/27→57/95/70/27, Nynestra 80/40/76/54→70/40/76/54, Cal Kerath 77/54/69/70→70/54/69/70, Nestira 22/85/59/57→22/70/59/57, Platisa 8/86/80/34→8/70/80/34.
- **Especiais de Jesed ainda não revisados** (seguem os antigos; revisão em separado, com simulação).

**Raridade por posição de poder dentro da série** (autor, 14/10/2026): 11% Lendária, 21% Épica, 33% Rara, resto Comum. Já vale para Jesed (3 Lendárias, 4 Épicas, 8 Raras, 8 Comuns); as demais séries mantêm os cortes fixos (≥1810 / ≥1710 / ≥1560) até serem ranqueadas. `SERIES_POR_POSICAO` em `data.js`.

**Perfil (soma):** cortes usados nas cartas novas e recalculadas: Azar < 150 · Frágil < 192 · Modesta < 237 · Padrão < 285 · Forte < 318 · Elite ≥ 318.

**Édelin Lys:** B02 Tack, B03 Jork, B04 Peredun, B05 Primus (status PROPOSTA, faixa PRÉVIA). Atributos provisórios 46/50/58/62, 55/60/72/78, 40/46/82/70, 78/82/54/48; especiais provisórios AE-074, AE-092, AE-116 e AE-097 (saíram da reserva; reserva = 36). Descrições sem os desfechos de Tack e Jork. **Sem foto ainda** (não há arquivo dessas personagens na pasta de Édelin Lys).

## Viajantes Dimensionais recalculado (14/10/2026, autorizado pelo autor)

Atributos das 25 cartas recalculados pelos rankings do autor (mesmo método e mesma escala de referência congelada, `dados/escala_referencia_2026-10-14.json`), com a regra do par forte. Decisões do autor (`dados/ajustes_autor_calculo.json`): Velho-Sábio com par forte INT/VEL (70/70/95/44); Korvo continua forte em FOR/RES (89/78/70/65); **Korvo e Velho-Sábio são Lendárias (4 losangos)**, fixados e contados na cota da série. Viajantes passa a ter raridade por posição de poder (3 Lendárias, 5 Épicas, 8 Raras, 9 Comuns). Especiais de Viajantes ainda não revisados. Ferramentas: `prototipo/tools/calc_atributos.js` e `prototipo/tools/aplicar_atributos.py`.

Propostas ainda não aplicadas (aguardam decisão do autor): Mistério Oculto (12 cartas) e Édelin Lys (5 cartas), em `dados/proposta_atributos_*`.
