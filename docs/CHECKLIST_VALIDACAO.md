# Dimensions Stacks — Checklist de validação do baralho aprovado (v1.0)

> **Conteúdo das 87 cartas e atribuições de habilidades: APROVADO em 12/10/2026.** O checklist separa testes de consistência já realizados dos testes de jogo ainda necessários. Não rebaixar a aprovação autoral para “proposta” em razão de testes técnicos pendentes.

## 1. Invariantes verificáveis dos arquivos oficiais

- [x] **87** IDs de carta únicos, com séries **J 23, V 19, S 14, D 18, M 12, B 1**.
- [x] Cada carta possui `nome`, `descricao_curta`, `atributos.{ATQ,DEF,INT,VEL}`, `soma_atributos`, `habilidade_especial_id` e `status: APROVADA_PELO_AUTOR`.
- [x] Atributos naturais em **0–100**, inteiros; `soma_atributos` é a soma correta dos quatro.
- [x] Descrição de frente de carta com **até 120 caracteres**.
- [x] Cada `habilidade_especial_id` das 87 cartas existe no catálogo de **129 IDs**.
- [x] A biblioteca distingue **78 efeitos diferentes equipados** (87 relações carta→habilidade) e **51 sem carta**, guardados para futuras expansões.
- [x] O ID **AE-104** não aparece no catálogo; **AE-129** (Jasmey) e **AE-130** (Agente Sete) existem.
- [x] A União possui **7 membros originais + Jennifer futura**, sem duplicar cartas nem criar cor exclusiva.
- [x] Cores: V azul, M vermelho, J amarelo, B verde, D roxo, S preto.
- [x] Núcleo Carnam: D07 Ingrid, D13 Suéten, D15 Carnam (pai), D16 Isabela, D17 Avó Carnam e D18 Ibliso; D17 ≠ D10 Avó de Kelly.
- [x] Núcleo Viajantes adicional: V16 Facka (Faka no manuscrito), V17 Lanigiah, V18 Grande Pai Gaia e V19 Seti.
- [x] [JSON oficial de cartas](../dados/oficial/cartas_87.json) e [tabela Markdown aprovada](CARTAS_E_ESPECIAIS.md) devem manter a mesma identidade, textos, atributos e IDs de especial.
- [x] [JSON oficial de habilidades](../dados/oficial/habilidades_129.json) e [biblioteca Markdown](BIBLIOTECA_ATAQUES_ESPECIAIS.md) devem registrar as mesmas cartas por habilidade.

**[x] significa validação documental e de dados**, não simulação do combate nem teste de layout.

## 2. Regras aprovadas que precisam de testes de execução

1. Partidas para **2–4 jogadores**, configuração inicial de **18 cartas por jogador**, 7 ativas e 11 na reserva.
2. Pares de atributos **ATQ/DEF** e **INT/VEL**. Desempate: atributo usado → soma dos quatro → ATQ+INT. Empate ainda persistente **PENDENTE**.
3. Ataque vencedor captura; Defesa/Velocidade vencedoras protegem a própria e enviam derrotadas ao Buraco Negro.
4. Até duas especiais preparadas; **uma ativação voluntária por combate**, salvo autorização textual expressa para duas. AE-111 força todas as preparadas, até duas.
5. **Reações defensivas aprovadas:** podem interromper efeitos ainda pendentes; resolução inversa de respostas; custo mesmo da especial anulada. Não alterar efeitos já concluídos.
6. **AE-130** anula a última especial pendente. **AE-103** só interfere nas cartas normais em combate.
7. **AE-010** soma o mesmo atributo de duas cartas consecutivas (o destino de ambas ainda não está especificado).
8. **AE-129** permite triunfo raro da carta S01, sujeito à janela de contrajogo aprovada.
9. Histórico físico **#18, #24 e #52** eliminado do jogo ativo; não restaurar.

## 3. Casos-limite ainda PENDENTES

- [ ] Origem de uma carta especial antes de prepará-la e a janela de preparação.
- [ ] Como selecionar e distribuir sem viés as 18 cartas a cada jogador, retiradas da coleção de 87.
- [ ] Destino individual das duas cartas de AE-010 após vitória, derrota e empate.
- [ ] Resolução de empate absoluto mesmo depois da soma ATQ+INT.
- [ ] Habilidades que precisam agir antes de revelar cartas: janela pré-revelação.
- [ ] Ordem/alvos das duas especiais forçadas pelo AE-111 quando há duas preparadas, e oportunidade de resposta entre elas.
- [ ] Efeitos cujo alvo some ou cuja zona tem menos cartas que o necessário.
- [ ] Prioridade de ações simultâneas e timeout da interface online.
- [ ] Simulações e testes de balanceamento para 2, 3 e 4 jogadores, incluindo diferenças intencionais de força.
- [ ] Conferência visual de texto de 120 caracteres e visualização ampliada de Habilidades Especiais.
- [ ] Revisão canônica das descrições com fonte narrativa fraca; nenhuma mudança automática de números sem nova autorização.

## 4. Próxima IA deve evitar

**Não declarar jogo terminado**, não transformar os 51 efeitos da reserva em novas cartas automaticamente, não copiar biografias de cartas físicas antigas, não criar efeitos para eliminar a variação de poder entre cartas, não inventar uma solução para empate irredutível e não confundir **aprovação do conteúdo** com **testes satisfatórios**.

[Baralho oficial](BARALHO_OFICIAL.md) · [GDD](REGRAS.md) · [Contrato para IA](CONTRATO_PARA_IA_IMPLEMENTADORA.md).
