# Modo História — Economia (auditoria e proposta)

Fonte: `tools/audit_economia.js`. **Preços, baús e promoção aprovados e implementados em 29/10** (v34 do historia.js). Baús ficam nos becos B003, B006, B010, B022, B028, B034, B049 (tier 1), B042, B044, B070 (tier 2), B085, B087 (tier 3), B096, B099 (tier 4) e abrem na primeira vitória do ponto; 9 de pêndulos (15–140) e 5 de carta (B099 lendária).

## 1. Auditoria: pêndulos entregues hoje

| Fonte | Completista | Jogador médio |
|---|---|---|
| Batalhas (evento 1099, normal 225, elite 429, guardião 500, miniboss 458) | 2711 | ~1660 (8 arautos + 4 guardiões + 40% das demais) |
| Minigames (25 becos) | 170 (Ótimo) a 340 (Perfeito) | ~90 |
| Baús | 0 (não definidos) | 0 |
| **Total** | **~2900–3050** | **~1750** |

Gastos hoje: cartas compráveis somam 13 990 pêndulos (41 comuns, 35 raras, 19 épicas, 12 lendárias) com PRECO 40/90/200/450. Descansar custa 6 por ponto de fadiga; uma vitória com 7 cartas cansa ≈ 15 pontos (~90 pêndulos para descansar tudo).

Diagnóstico:
- Descansar tudo após cada vitória custa 90, ou 5% da renda média por batalha vencida: pune demais. Alvo: ≤ 2–3% da renda por batalha.
- Comprar o catálogo todo custa 4,6x a renda do completista: nunca fecha. Alvo: completista compra ~70% do catálogo (somando baús), médio ~25%.

## 2. Proposta de preços

| Item | Hoje | Proposto |
|---|---|---|
| Descansar 1 ponto | 6 | 4 (tudo ≈ 60) |
| Comum | 40 | 25 |
| Rara | 90 | 60 |
| Épica | 200 | 130 |
| Lendária | 450 | 300 |

Catálogo todo: ≈ 9 200. Completista (≈ 3 000 + baús ≈ 3 800) compra ~40% em pêndulos; o resto vem de baús de carta, prêmios de batalha e boss. Médio (~1 750 + baús ≈ 2 200) compra ~6 raras + 10 comuns, sem esvaziar o bolso para descansar.

Prêmios de batalha e minigames: manter. O saldo médio fecha com os novos preços; só rever depois de teste humano.

## 3. Baús

25 becos; 14 recebem baú (um por beco longo, nunca no caminho principal). Conteúdo por tier do setor:

| Tier | Baú de pêndulos | Baú de carta |
|---|---|---|
| 1 | 15–25 | comum |
| 2 | 30–50 | comum ou rara |
| 3 | 60–90 | rara ou épica |
| 4 | 100–140 | épica (lendária só 1 baú, no último setor) |

Divisão: 9 baús de pêndulos e 5 de carta. Total de pêndulos em baús ≈ 650 (completista) e ≈ 300 (médio, acha metade).

## 4. Promoção: o sistema atual é justo?

Não existe promoção implementada. A ideia anterior (desconto após derrota) é explorável: derrota não custa nada, então o jogador perde de propósito para comprar barato.

Proposta:
1. Cada loja tem 1 item em promoção fixa (−30%), rotativo por setor. Sem gatilho de derrota.
2. Ajuda para quem está atrás: se o saldo for menor que o preço da carta mais barata da loja, ela sai −20% (uma vez por loja).
3. Cartas que o jogador já possui não entram na promoção.

## 5. NPCs

Ficam para depois. Entram em encruzilhadas; o mapa ainda vai mudar e ganhar nós novos para eles.

## 6. Decisões necessárias

- Aprovar tabela de preços (seção 2).
- Aprovar 14 baús e valores (seção 3).
- Aprovar promoção fixa + ajuda para pobres (seção 4).
