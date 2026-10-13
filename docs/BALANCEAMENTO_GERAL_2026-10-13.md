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
