# XP, níveis, talentos e menu de pausa (30/10/2026)

Status: **implementado e revisado em 31/10/2026.** A progressão foi integrada ao modo História, incluindo migração automática dos saves antigos. “Fragmentos de Rosto” permaneceu sem alterações, conforme pedido do autor.

## 1. Aviso de dificuldade
- Selo "Nv X recomendado" no painel de Elite, Arauto, Guardião e Boss (verde: no nível ou acima; amarelo: até 2 níveis abaixo; vermelho: mais).
- Anel pulsante discreto no mapa enquanto o jogador estiver abaixo do recomendado.
- Diálogo (mentor, 2 botões: Voltar / Lutar mesmo assim) só **uma vez por ponto**, quando o jogador está mais de 2 níveis abaixo. Não bloqueia. Arauto avisa dos 3 ou 4 jogadores; Guardião avisa da regra especial.
- Besta: pode ser enfrentada a qualquer momento (cada guardião vivo dá +30 nos atributos dela). Diálogo na chegada avisa que ela está acima do nível; o jogador pode lutar mesmo assim.
- Níveis recomendados: Arauto 1 = Nv 4; Guardiões = Nv 9 a 10 no primeiro e subindo; Boss = Nv 28; Besta = Nv 30. Falas dos NPCs dizem "volte no Nv X", nunca "faltam X batalhas".

## 2. XP e níveis
- 30 níveis. XP de n para n+1 = 30 + 6 × (n − 1). Total até o Nv 30 ≈ 3.300 XP. Depois do teto o XP só acumula.
- XP por vitória = 20 + 2 × (nível da batalha). Multiplicador: normal/evento ×1, elite/arauto ×1,5, guardião ×2, boss ×3.
- Batalha mais de 5 níveis abaixo do jogador: 25% do XP. Derrota: 40%.
- Nível da batalha = 1 + 0,29 × `nBat` (fixo por ponto, calibrado pela escala `nivelBot`). Guardião em `nBat` 31 = Nv 10.
- Ritmo: 2 a 2,5 vitórias por nível. Saves antigos convertem vitórias em XP.
- HUD do menu mostra nível e barra fina. Tela de resultado: "+XP", barra enchendo, "Nível N!" com pulso. Tela de saves mostra % de cartas e nível.

## 3. Fila de eventos após a batalha
Resultado e XP, depois animação do baú até o fim, pausa leve (~0,6 s), depois diálogos em sequência (NPC, aviso, Besta). Nunca sobrepostos.

## 4. Talentos
- 1 ponto por nível (30 no total). Três barras de 5 passos; cada passo só ativa depois do anterior.
- Custo por passo: 1, 2, 2, 3, 4 (12 por barra, 36 para as três: o jogador não completa tudo).
- Nomes: barras **Vigor**, **Fortuna**, **Estratégia**; cada passo é um **Dom**. Redistribuir custa `30 + 5 × pontos já investidos`, limitado a 150 pêndulos.
- Ativação e desativação no menu de pausa.

### Vigor (do mais fraco ao mais forte)
Resistência +2, Força +2, Velocidade +2, Inteligência +2 (todas as cartas do jogador, máx. 99), depois todos os atributos das cartas inimigas −1.
Simulação (motor real, CPU contra CPU, ±3 pontos): base 47%; +5 só em Resistência 51%, Força 52%, Velocidade 53%, Inteligência 54%; inimigos −1 52%, −2 57%; barra completa (+2 e −1) 60%; +3/−2 63%; +4/−2 66% (forte demais).

### Fortuna
1. Dobrar pêndulos ao vencer (10% por batalha; não soma com Bolsa cheia).
2. Inimigo confunde e escolhe o atributo perdedor (2,5% por disputa).
3. Inimigo deixa uma carta cair e perde sem lutar (1,8%).
4. Carta aleatória do Buraco Negro vem para o jogador (1,2%; sem efeito se o Buraco Negro estiver vazio).
5. Terremoto: carta do inimigo vem para o jogador (0,8%).
Os valores iniciais de 5%/4%/3%/2% elevaram a vitória de 53% para 74,2% no motor real e foram rejeitados por excesso. Com 2,5%/1,8%/1,2%/0,8%, a barra completa ficou em 63,4% em 500 partidas, sem falhas de conservação. Em dez disputas, a chance acumulada de cada efeito é aproximadamente 22,4%, 16,6%, 11,4% e 7,7%; os eventos continuam condicionados a existir alvo válido.

### Estratégia (do mais fraco ao mais forte)
1. Descontos nas lojas mais comuns.
2. Cartas paradas descansam 2 pontos por vitória (sai das melhorias de fragmentos).
3. 1 pêndulo a cada 2 disputas vencidas. Com prêmio médio base de 20,1 pêndulos nas batalhas comuns, uma luta típica de dez disputas acrescenta cerca de 2 a 3 pêndulos — ganho perceptível, mas insuficiente para dobrar a renda.
4. Começa a batalha com **1** carta a mais (8). Não vale no Boss nem nos Guardiões. Não haverá versão com 2 (simulação: 7×7 42%, 8×7 55%, 9×7 62%).
5. Arautos e Guardiões começam com 1 carta a menos (7×6: 58%, ≈ +16 pontos, só nas lutas difíceis).

## 5. Fragmentos (melhorias das lojas)
- Saem "Mão ampliada" (12) e "Descanso veloz" (4).
- Entra **Modo Hard dos minigames** (aba Normal/Hard, dificuldade maior e prêmios 50% maiores). Preço: 8.
- Entra **Carta de reserva**: uma vez por partida, permite enviar a carta do topo para o fim do baralho antes da disputa. Preço: 8.
- Preços das outras 8 ficam: Preços menores 6, Bolsa cheia 4, Mapa revelado 4, Olho vivo 3, Iniciativa 8, Sorte de combate 10, Segunda tentativa 3, Aluguel de cartas 8. Total 62 para 48 fontes.

## 6. Menu de pausa e fundos de carta
- Menu novo com abas: Status, Talentos, Temas, Configurações (as atuais), Registros, Missões.
- 10 fundos de carta, comprados nas lojas: cada loja vende sempre 1 fixo; os outros 5 aparecem às vezes (~25% por visita) como segundo item. 40 a 150 pêndulos, os mais raros mais caros. Escolha na aba Temas, com pré-visualização.

## Decisões de equilíbrio fechadas na implementação
- **Redistribuição:** custo progressivo de 30 a 150 pêndulos. No início custa aproximadamente duas batalhas; com muitas escolhas investidas chega a cerca de sete batalhas. Assim, experimentar é viável, mas trocar a configuração inteira antes de cada combate não compensa.
- **Economia da Estratégia:** a auditoria encontrou prêmio médio de 20,1 pêndulos nas batalhas comuns. O terceiro Dom paga apenas metade das disputas vencidas, o que mantém seu acréscimo típico perto de 10% a 15% do prêmio.
- **Fortuna:** os cinco Dons usam rolagens independentes e respeitam alvo válido, Buraco Negro disponível e a regra de a Bolsa cheia não acumular com o prêmio dobrado. A barra completa passou de 74,2% com as chances propostas inicialmente para 63,4% após o ajuste.
- **Fragmentos:** as duas substituições custam 8; as dez melhorias somam 62 fragmentos para 48 fontes, preservando escolhas irreversíveis de construção.
- **Temas:** dez traseiras compráveis foram adicionadas. As cinco lojas sempre oferecem uma própria; os cinco temas raros têm 25% de chance de aparecer como segundo item, somente enquanto ainda não foram comprados.
