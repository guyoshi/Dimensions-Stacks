# APROVADA E APLICADA (02/11/2026, 16:58) — Proposta: distribuição das 53 habilidades novas (02/11/2026)

**Situação:** o jogo tem 154 cartas e 141 habilidades distintas. Só há **21 vagas** para habilidades novas hoje: as 13 cartas Quasar que repetem a habilidade da carta-base e os 8 Príncipes Elementais (que usam habilidades provisórias). As outras 32 ficam num **banco** para cartas futuras (ou para trocar habilidades fracas).

## A. Príncipes Elementais (8, lendárias): habilidade própria
| Carta | Hoje (provisória) | Proposta | Taxa de vitória do portador no teste |
|---|---|---|---|
| P01 Príncipe das Águas | AE-018 | **AE-190 Mistura geral** (a correnteza embaralha todos os baralhos) | 33% |
| P02 Princesa do Fogo | AE-020 | **AE-152 Fúria** (+30 Força, −15 Resistência) | 78% |
| P03 Princesa da Natureza | AE-053 | **AE-167 Eco protetor** (a carta capturada volta ao fundo do baralho) | 59% |
| P04 Princesa dos Ventos | AE-054 | **AE-196 Caos de atributos** (embaralha os atributos de todos) | 34% |
| P05 Princesa da Luz | AE-125 | **AE-175 Espiar especiais** (revela os especiais de todos) | 46% |
| P06 Príncipe do Tempo | AE-126 | **AE-182 Pausa** (um rival pula a próxima disputa) | 42% |
| P07 Príncipe do Espaço | AE-127 | **AE-197 Troca do destino** (dois jogadores sorteados trocam as cartas) | 46% |
| P08 Príncipe das Trevas | AE-128 | **AE-172 Colapso** (o topo do baralho de um rival vai ao Buraco Negro) | 46% |

As 8 provisórias (AE-018, 020, 053, 054, 125–128) deixam de ser usadas e vão ao banco.

## B. Cartas Quasar (13): troca da habilidade repetida
| Grupo (carta-base) | Quasar | Proposta |
|---|---|---|
| V01 (AE-001, +15 Força) | Q09 | AE-146 Maré alta |
| | Q10 | AE-148 Foco duplo |
| V02 (AE-021, atributo universal) | Q07 | AE-155 Atributo vetado |
| | Q08 | AE-157 Silêncio de Força |
| V03 (AE-011, Força→Inteligência) | Q11 | AE-154 Reciclagem |
| | Q12 | AE-198 Virada de tipo |
| V04 (AE-007, +7/+7) | Q04 | AE-147 Segundo fôlego |
| | Q05 | AE-149 Último suspiro |
| | Q06 | AE-150 Veterano |
| V10 (AE-049, reserva) | Q13 | AE-163 Mão leve |
| B01 (AE-103, ninguém ataca) | Q01 | AE-168 Casca grossa |
| | Q02 | AE-166 Armadilha |
| | Q03 | AE-165 Fortaleza |

## C. Banco (32 habilidades sem carta)
AE-151 Aposta, 153 Inversão do rival, 156 Sorteio viciado, 158/159 Mesa dos vizinhos, 160 Pular a rodada, 161 Furto do líder, 162 Taxa do vencedor, 164 Troca justa, 169 Retirada, 170 Ressonância, 171 Oferenda, 173 Marca, 174 Rastreio, 176 Roubo de preparo, 177 Atraso, 178 Dividir o butim, 179 Contragolpe, 180 Margem larga, 181 Embaralhar reservas, 183 Convocar, 184 Cancelar e 185 Escolher fenômeno, 186 Carta fantasma, 187 Sacrifício heroico, 188 Reflexo, 189 Mistura pessoal, 191/192/193 anti-roubo, 194/195 inversões.
Opção: trocar nelas as habilidades de uso zero/baixo de cartas existentes (hoje 096, 102, 119 nova, 121, 122, 012, 016, 017, 019).

## Observações
- **Balanço:** nenhuma das três mais fortes (Aposta, Furto do líder, Dividir o butim) entra nesta distribuição; ficam no banco. Depois de atribuir, medimos de novo com as cartas reais (meta: portador entre 47% e 55%).
- **Fracas atribuídas:** Mistura geral, Caos de atributos e Fortaleza ficam abaixo de 47% no teste; para lendárias/Quasar talvez valha subir o efeito. Decida após ver em jogo.
- **Limite por habilidade** = quantas cartas podem carregar a mesma habilidade. Nesta proposta cada uma vai a **uma só** carta, então o limite não é usado.


**Aplicado** em `prototipo/data.js` (QUASAR_ESP e PRINCIPES_DEF). Banco restante: 32 habilidades sem carta (+ AE-199 Troca de reservas, AE-018/020/053/054/125–128 liberadas).
