# Maestria por carta, "Ver cálculo" e privacidade online

## Maestria por carta (só reconhecimento)
- Cada carta que **o jogador local** usa acumula XP no perfil (`mast` em `dsstacks.profile`): **1 por uso** na mesa, **3 por disputa vencida**, **2 por especial resolvido** (ativado voluntariamente e não anulado).
- Níveis (emblemas): Iniciado 12 XP · Veterano 38 · Mestre 88 · Lenda 210 · Dimensional 460 (ajustado em 14/10/2026). Meta de design: 5 usos para Iniciado, +10 para Veterano, +20 Mestre, +50 Lenda, +100 Dimensional (acumulado 5/15/35/85/185 usos). Medição em simulação (2–4 jogadores, bots mistos): 0,32–0,51 vitórias e 0,15–0,17 especiais por uso → ≈2,5 XP por uso (2,26 com 4 jogadores, 2,85 com 2). O nível é calculado dos contadores salvos (usos/vitórias/especiais), então a mudança vale retroativamente para todos os perfis: quem tinha nível sob a tabela antiga (3/8/18/35/60) pode descer.
- **Nenhum bônus de atributo ou regra**: não afeta o equilíbrio nem o multiplayer. Emblemas aparecem na Coleção, no zoom da carta (com progresso), no Perfil (top 6 e legenda) e na tela final (subidas de nível). Não aparecem nas cartas da mesa, para não confundir com cartas de adversários.
- Coleção: ordenação "Maestria". Conquistas novas: Primeiro emblema, Mestre de carta, Elenco veterano.
- Código: `stats.js` (`mastery`, `masteryList`, recorder), `ui.js` (`U.emblem`, bloco no zoom), `home.js`. Teste: `tests/mastery.js`, `tests/run_mast.py`.

## Ver cálculo ("Por que perdi?")
- Após cada disputa aparece o botão 🧮 (e um atalho flutuante) com: base de cada carta no atributo usado, bônus/modificadores com origem, cartas extras, total, especiais usados/anulados, efeitos aplicados, desempate e uma frase "você perdeu porque…".
- O motor gera `calc` no evento `resolved` (`Game.calcSummary`); no online o convidado recebe o mesmo resumo (mascarado se a disputa não chegou à revelação). Teste: `tests/calc.js`.

## Privacidade no online
- O anfitrião envia a cada convidado só as próprias cartas privadas e, dos rivais, quantidades e o que já foi revelado (`privacy.js`). Limitação: o anfitrião roda o motor e pode inspecionar o próprio estado (confiança no anfitrião). Teste: `tests/privacy.js`.
