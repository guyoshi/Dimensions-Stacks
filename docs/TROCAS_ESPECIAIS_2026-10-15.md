# Trocas de especial — efeitos fracos (15/10/2026)

**Pedido do autor (15/10/2026):** a Preparação urgente (Saliens) era inútil, e trocas/conversões entre atributos do **mesmo par** quase não ajudam (cada jogador já escolhe o maior dos dois). Regra de escolha: nada de especiais parecidos ou variações entre as cartas; pode usar efeitos que mudem mais o jogo.

| Carta | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| V13 Saliens | AE-119 Preparação urgente | **AE-141 Intimidar** (rival perde 12 em Força e Inteligência) | aprovado pelo autor; combina com a presença intimidadora |
| J14 Cal Kadrir | AE-019 Inteligência → Velocidade | **AE-135 Vigor** (+12 Força e +12 Resistência) | Força 69 e Resistência 51 aproveitam o bônus; o autor pediu o Vigor para outra carta |
| J16 Elis Nular | AE-020 Velocidade → Inteligência | **AE-132 Quebrar o melhor** (maior atributo do rival cai 25) | carta mais fraca do baralho (soma 160): recebe um efeito forte |
| S18 Alekta | AE-017 Força → Resistência | **AE-136 Lucidez veloz** (+12 Inteligência e +12 Velocidade) | Velocidade 70 e Inteligência 54 aproveitam |
| J13 Nynestra | AE-018 Resistência → Força | **AE-047 Tributo coletivo** (1 carta aleatória da reserva de cada rival) | efeito que muda o jogo, sem repetir nenhum outro |
| J23 Kedran | AE-125 Permutar Força e Resistência | **AE-131 Enfraquecer** (rival perde 15 em todos os atributos) | segunda carta mais fraca (soma 181): recebe um efeito forte |

Os seis efeitos novos estavam sem dono (reserva); nenhum se repete em outra carta. Os antigos (AE-017, 018, 019, 020, 125, 119) voltaram à reserva.

**Medição (bots, 500 partidas por modo, antes → depois):** desvio entre as taxas de vitória das cartas 15,9 → 15,5 (2 jogadores) e 16,4 → 15,7 (4 jogadores); a maior taxa de uma carta 79% → 79% (2) e 75% → 70% (4). Agora os bots passam a preparar essas cartas como especial (antes ficavam sem uso). As cartas J14, J23 e J16 seguem entre as mais fracas como carta de combate; o ganho vem do especial.

Estado anterior em `dados/historico/*_antes_trocas_2026-10-15.json`.

## Permuta das reservas limitada a 3 cartas (15/10/2026)

**Decisão do autor:** trocar a reserva inteira com o vizinho (AE-059 à esquerda, AE-060 à direita; cartas S13 e D18) era pesado demais. As **Reservas giratórias** (AE-061/062) ficam como estão (afetam todos por igual; quem não tem reserva não passa nada e só recebe).

**Nova regra:** cada lado entrega até **3 cartas** da própria reserva (as 3 primeiras) e recebe as até 3 do outro. Quem tiver menos de 3, ou nenhuma, entrega só o que tem, e **a troca é executada mesmo assim** (o outro lado pode ficar sem receber nada). Os bots avaliam o ganho já com esse limite.

Medição (bots, 4 jogadores): AE-059 25% e AE-060 27% de vitória de quem usa (base 25%): neutro, como antes (24%). Teste `audit_esp` dos dois cenários atualizado (esquerda = próximo jogador, como no motor desde a correção de 15/10).
