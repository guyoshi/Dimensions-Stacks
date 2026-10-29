# Minigames do modo história: como funcionam (estado atual do protótipo)

Todos usam a mesma casca: tela cheia, botão ✕ (sair = 0%), resultado em % → faixa (Sem prêmio / Bom / Ótimo / Perfeito) → pêndulos. Prêmio padrão por faixa: **0 / 5 / 10 / 20 pêndulos**. Cortes de cada jogo (pct mínimo para Bom / Ótimo / Perfeito) entre colchetes. Dificuldade `dif` (0,5 a 2) ajustável no painel do admin.

## 10 de base (becos do mapa)
1. **Portas da sorte** [37/63/88%]: 3 rodadas, 3 portas cada. Rodadas 1 e 2: uma porta dá pêndulos (+25%), outra "passagem livre" (sem ganho) e outra "nada" (encerra com 0). Última: pêndulos (+50%), uma carta (100% + carta sorteada) ou nada (0).
2. **Memória estelar** [30/60/90%]: 6 pares de cartas virados. % cai com jogadas extras: 100% = 6 jogadas (mínimo); 0% = 14 jogadas a mais (÷ dif).
3. **Quem é quem** [37/63/88%]: 8 perguntas de 10 s (÷ dif). Silhueta escura de uma carta; escolha o nome entre 4. % = acertos/8.
4. **Agilidade** [40/70/95%]: 8 perguntas de 4 s (÷ dif). Quatro cartas na tela; toque na de maior/menor atributo pedido. % = acertos/8.
5. **Contágio** [37/63/88%]: 12 bolinhas azuis e 4 bombinhas vermelhas que perseguem a azul mais próxima (26 px/s × dif). Arraste as vermelhas para longe; azul tocada vira vermelha. 30 s; todas vermelhas = 0. % = azuis restantes/12.
6. **Campo de asteroides** [33/60/87%]: 30 s, 3 vidas. Arraste a nave, desvie das rochas, pegue os pêndulos. % = pêndulos/14. Perde as 3 vidas: acaba.
7. **Cofre de Jasmey** [34/50/83%]: código de 4 símbolos entre 6, 6 tentativas. Símbolo no lugar certo fica fixo na linha seguinte. % = (7 − tentativa)/6; sem abrir = 0.
8. **Sequência de sons** [30/60/95%]: 4 instrumentos (flauta, harpa, sino, tambor) com tom próprio; cada rodada soma um som à sequência; repita. Até 8 rodadas; errou: acaba. % = rodadas/8.
9. **Raspadinha estelar** [30/60/95%]: raspe 3 de 6 quadrados. O resultado é sorteado antes (sorte, ajustada por dif): ◆●▲ = 0%, ▲▲◆ = 40%, ●●● = 70%, ★★★ = 100%.
10. **Caça ao pêndulo** [33/60/87%]: tela escura, uma luz segue o dedo (raio 80). Pêndulos cruzam a tela; toque neles sob a luz. 25 s. % = pegos/12.

## 7 de série (1 broche cada, nos ramos dos Arautos)
11. **Elos das Sombras** (Diário Sobrenatural) [40/70/100%]: Simon com os 6 sentidos. 5 rodadas, sequências de 3 a 7. Errou: acaba. % = sequências certas/5.
12. **Duas luas** (Ciclo de Jesed) [35/65/90%]: duas luas giram em órbitas diferentes; toque "Alinhar!" quando alinhadas. 5 toques; alinhada = 1 ponto, quase = meio. % = pontos/5.
13. **Poderes dos Lins** (Viajantes Dimensionais) [40/70/90%]: 10 obstáculos, 3 s cada (÷ dif). Cada um pede o poder certo: Breno atravessa, Bruno congela, Beatriz queima, Banjo move à distância. % = acertos/10.
14. **Símbolos estelares** (Spacetheft) [34/67/84%]: 8 quadrados; símbolos espaciais aparecem rápido (0,8 s ÷ dif). Acerto +1, caveira −2. 25 s. % = pontos/18.
15. **Quem é o culpado?** (Mistério Oculto) [34/67/99%]: 3 casos, pistas para deduzir o culpado. Acerto de primeira = 1 ponto; depois de errar = meio. % = pontos/3.
16. **Mar, fogo e gelo** (Édelin Lys) [40/70/90%]: jogo de ritmo, 20 notas em 3 pistas (um elemento por pista); toque quando a nota chega à linha. % = notas/20.
17. **Formação da União** (A União) [34/67/99%]: 3 casos com tempo. Escolha 3 heróis cujos atributos somados cubram o desafio (dois atributos mínimos). % = casos vencidos/3.

## Propostas aprovadas (29/10) — os minigames em si ainda estão em ajuste pelo autor
- **Broche:** dar ao atingir **Ótimo ou melhor** (≥ faixa 2), com repetição liberada; abaixo disso só pêndulos.
- **Base (10):** cada beco joga uma vez por ponto (o prêmio não se repete); depois fica "visitado".
- **Série (7):** ficam no ramo do Arauto de cada setor; abrem ao vencer o Arauto; o contador de broches (x/7) já aparece no mapa, sem explicar o uso.
- Cada Arauto precisa de **um setor e uma série** (hoje: ainda não atribuídos aos 8 pontos).
