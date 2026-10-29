# Modo história: temas por setor e colocação de minigames, baús, NPCs (PROPOSTA, 29/10/2026)

Só documento. Nada no jogo muda até aprovação. Ids de pontos são os de `historia_mapa.js` (não mudam).

## 1. Temas por setor

| Setor | Série | Clima | Inimigos (tema das 7 cartas) | Eventos típicos | Minigame de série |
|---|---|---|---|---|---|
| Esquerda | Diário Sobrenatural | sombras, ilusões, casas assombradas | personagens do Diário; visitantes do Mistério Oculto | status invertidos, cartas "?" (ocultas), 3 s para decidir | Diário Sobrenatural |
| Cima | Ciclo de Jesed | gelo, dinastia, política polar | personagens do Ciclo; visitantes de Édelin Lys | ganha o menor, ganha o mais próximo de 50 | Ciclo de Jesed |
| Direita | Viajantes Dimensionais | patrulha, portais, dimensões | personagens da Patrulha de Korvo | inimigo com mais cartas, mesmas cartas que você | Viajantes Dimensionais |
| Baixo | Spacetheft | piratas, gerbe, naves, Aurora | tripulação de Jasmey, caçadores de tesouro | pêndulos extras, você com menos cartas | Spacetheft |
| Núcleo (tier 4) | A Besta | ruínas da galáxia | guardiões + Besta (exclusiva do Boss) | só regras já definidas | nenhum |

Regras de mistura: visitantes (Mistério Oculto, Édelin Lys, União) aparecem como elites e minibosses fora do setor deles, no máximo 1 em cada 4 inimigos. Cartas da União podem aparecer em inimigos comuns, nunca a Besta.

## 2. Minigames de série (7), em ramos de miniboss

Regra do autor: o minigame de cada série fica num ramo de miniboss; a recompensa é 1 broche da série (contador x/7).

| Miniboss | Setor | Minigame de série |
|---|---|---|
| B059 | esq | Diário Sobrenatural |
| B088 | esq | Mistério Oculto |
| B062 | cima | Ciclo de Jesed |
| B086 | cima | Édelin Lys |
| B078 | dir (beco) | Viajantes Dimensionais |
| B064 | baixo | Spacetheft |
| B081 | baixo | União |
| B072 | baixo | (sem minigame) |

O minigame abre em um nó-ramo ligado ao miniboss (o próprio nó se for beco, como B078). Fica disponível depois de vencer o miniboss. Opcional, não bloqueia o Boss.

## 3. Minigames base (10) em becos

Becos de tier 2 e 3 (mais longe do início), um minigame por beco:
esq B085, B016, B030 · cima B042, B044, B070 · dir B071, B010 · baixo B087, B028.
Os 10 jogos escolhidos entre os 10 já existentes, casados com o clima do setor (ex.: mineração em baixo, quebra-cabeça de espelhos na esquerda).

## 4. Baús

Os demais becos (B001, B002, B003, B005, B006, B019, B022, B034, B038, B049, B051, B084 e outros que sobrarem): 60% pêndulos, 40% cartas (1 a 3). Becos de tier 1 dão baús pequenos; tier 3, grandes.

## 5. NPCs

- 1 NPC a cada 6 a 8 pontos, em nós normais fora de becos de baú: ~12 no mapa, 3 por setor.
- Tipos: vendedor de atalho, colecionador (pede carta específica), desafiante (duelo em troca de algo), cobrador (pedágio), mensageiro (revela baú/minigame), curandeiro (descansa cartas por 1 vitória), apostador.
- Perks de venda (os 7 já propostos) só em vendedores; preço em pêndulos a calibrar no admin. **Nada de preço é definitivo.**
- Todos fixos por id, como as batalhas.

## 6. Lojas

As 5 lojas existentes (L1 esq, L2 cima, L3 e L4 baixo, L5 esq) ficam. Falta loja na direita: proposta de transformar um evento de tier 2 da direita em loja (a escolher), para 1 loja por setor, e L4 vira a do núcleo. **Muda posição de loja: precisa de aprovação.**

## Pendências para aprovar
1. Quadro de temas (seção 1).
2. Distribuição dos 7 minigames de série (seção 2) e dos 10 base (seção 3).
3. Mudança de loja na direita (seção 6).
4. Depois: Etapa 4 (fatia vertical: um quadrante de ponta a ponta).
