# Dimensions Stacks — Proposta de prioridade de ataques especiais (v0.1)

> **Documento de design para aprovação, não regra oficial.** Preserva os limites **já confirmados**: no máximo **1 carta especial voluntária por combate por jogador**, a menos que uma habilidade específica permita duas; #59 obriga usar todas as especiais já preparadas do alvo (até 2); especiais ativadas são descartadas no Buraco Negro; e conflito entre imposições diferentes de atributo é decidido pelo valor do atributo imposto na carta normal do respectivo jogador. A maneira de organizar **prioridade e janelas** abaixo é **proposta**, aguardando aprovação.

## 1. Conceitos

- **Iniciador:** jogador cujo turno é escolher primeiro o atributo nesta disputa.
- **Prioridade:** direito temporário de usar uma habilidade especial preparada elegível **ou passar**. Ter prioridade não garante vitória no combate.
- **Pilha de resolução:** sequência de especiais ativadas ainda não resolvidas. O **último efeito colocado na pilha resolve primeiro** (*LIFO*).
- **Passar:** não ativa especial nem consome o limite voluntário. Depois de qualquer nova ativação, a contagem de passes consecutivos reinicia.
- **Acesso:** jogadores ativos recebem prioridade a partir do iniciador, em ordem horária. Quem já ativou seu limite voluntário não pode ativar voluntariamente outra, salvo habilidade que permita.
- **Custo:** especial ativada vai ao Buraco Negro ainda que tenha sido anulada antes da resolução. O baralho normal é resolvido depois, sujeito a vitória/derrota.
- **Habilidade cancelada:** não produz seu efeito. Cartas já consumidas não voltam por cancelamento, salvo exceção expressa.

## 2. Etapas sugeridas de um combate

1. **Preparação da disputa:** cada jogador compromete sua carta normal de combate; selecionam-se os atributos legais, mantendo as restrições de pares já definidas no GDD.
2. **Revelação das cartas e atributos.**
3. **Janela de especiais (proposta principal):** o iniciador recebe prioridade. Cada pessoa, ao receber a vez, pode ativar uma especial preparada válida ou passar. O processo continua em círculo até que todos os elegíveis tenham passado **consecutivamente** sem nova ativação.
4. **Resolução da pilha:** resolver os efeitos na ordem **inversa** à ativação (último primeiro). Exceções de bloqueio, alteração de cartas, recuperação, imposição, ativação forçada e repetição são aplicadas conforme os textos e custos.
5. **Confronto normal:** com os efeitos concluídos, fixar atributo válido, considerar modificadores e determinar o vencedor por valor individual. Em empate: soma dos quatro atributos, depois soma dos dois ofensivos (Poder + Inteligência no GDD original, ou Ataque + Inteligência se o autor aprovar renomeação).
6. **Destino das cartas:** aplicar captura se vencedor usou ofensiva, ou descarte ao Buraco Negro se venceu defendendo, salvo modificação específica de uma habilidade; especiais utilizadas são descartadas como previsto.

**Exceção ainda pendente:** a carta física #10 dizia “Antes do combate iniciar, troque sua carta de combate com a do adversário à direita”. A leitura mais conservadora exigiria uma **janela pré-revelação exclusiva** para efeitos que explicitamente dizem *antes do combate*. A janela única pós-revelação é uma **simplificação alternativa**, mas mudaria a informação disponível quando o jogador ativa essa carta. **Não decidir sem aprovação do autor.**

## 3. Por que resolver de trás para frente?

Exemplo: A ativa **Impor Ataque**, B ativa **Impor Inteligência**, C ativa **Anular o especial de B**. C é a última ativada, portanto é resolvida primeiro e impede que a imposição de B entre em vigor. A continua valendo; todas as três cartas especiais ativadas são consumidas.

**Imposição de atributos não é sobreposição pela ordem:** se A e B impõem atributos diferentes **e ambas as imposições permanecem válidas depois da pilha**, a regra oficial compara **o valor do atributo imposto na carta de combate de cada autor**. O maior determina o atributo que todos devem usar. Se houver empate, o GDD prevê soma dos quatro atributos e depois soma dos ofensivos; a aplicação direta desses desempates ao conflito de imposições deve ser confirmada. Uma mudança de atributo resolvida antes pode alterar os valores, logo **propõe-se avaliar os valores atuais depois dos modificadores**.

## 4. Combate com jogadores 2, 3 ou 4

- O iniciador obtém a primeira oportunidade de ação; em sentido horário todos poderão responder enquanto tiverem especiais preparadas e autorização para ativar.
- O máximo voluntário base de cada jogador é 1, e o número de cartas preparadas por jogador é 2.
- Um jogador que **passou** pode receber prioridade novamente quando outra pessoa ativar um efeito; passar não é renúncia permanente.
- Jogadores eliminados não participam; a prioridade percorre somente os ativos.
- Dois especiais que exigem o mesmo alvo são resolvidos um após outro. Se o alvo deixar de ser elegível antes do efeito seguinte, é necessário definir o destino do efeito inválido (não inventar recuperação da carta consumida).
- **Em duelo, direita e esquerda são o mesmo adversário.** Efeitos que simplesmente devolvem cartas a esse adversário podem ser ativados sem vantagem, como o autor aprovou.

## 5. Casos especiais

### 5.1 Habilidade de ativação forçada (#59 / AE-111)

**Confirmado:** o alvo deve ativar **todas as especiais já preparadas** (até duas), mesmo que o limite voluntário seja um. **Proposta operacional:** quando o efeito forçado resolver, exibir as cartas preparadas e permitir ao proprietário **decidir a ordem e os alvos legais** de suas duas ativações, que entram na pilha para resolução, sem reiniciar o limite voluntário. Se o efeito #59 tiver sido anulado antes de resolver, não acontece o gasto forçado. **A ordem escolhida pelo alvo e o momento de novas respostas continuam propostos**, não aprovados.

### 5.2 Bloqueio de especiais (antigo #47 / AE-073)

Um efeito que cancela especiais ainda pendentes pode anulá-las antes da resolução. As cartas especiais que já foram ativadas e depois anuladas continuam consumidas. Definir alcance (um alvo ou todas as demais), e se cancela efeitos de outras janelas, antes de aprovar a habilidade definitiva.

### 5.3 Repetição (antigo #62 / AE-112)

**Aprovado:** impedir ciclos infinitos. **Proposta:** repetir o efeito de um outro especial já usado **uma única vez por ativação**, pagando os 2 descartes exigidos. O efeito de repetição não pode gerar outra repetição, copiar-se a si mesmo, copiar uma cópia ou reativar outra carta especial preparada. Repetir **efeito** é diferente de ativar uma **segunda carta**.

### 5.4 Ruína de campo (antigo #54 / AE-103)

**Confirmado:** “cartas em jogo” são **somente as cartas normais comprometidas em combate**. Especiais preparadas não são descartadas por esse efeito. Distinguir negar dano normal de negar efeitos de especiais; proteção das especiais não deve ser removida silenciosamente.

### 5.5 Vitórias automáticas raras

**Confirmado:** o antigo #52 foi removido. Futuramente podem existir **poucas habilidades novas e raras** de vitória automática, sujeitas a balanceamento. A ativação forçada (#59) é possível contrajogo, porque pode obrigar gasto antecipado. Uma vitória antecipada forçada **ainda pode vencer a disputa atual**; o custo estratégico é perder a escolha do melhor momento.

## 6. Decisões abertas antes da implementação

1. Uma janela principal **após revelação** para todos os efeitos ou janelas adicionais **pré-revelação** para habilidades textualmente anteriores ao combate?
2. Quando dois jogadores disputarem prioridade em condições especiais, seguir estritamente a ordem horária iniciando pelo iniciador ou uma outra regra?
3. Quando #59 obriga dois especiais, **quem escolhe a ordem** e os alvos de cada uma?
4. Se uma habilidade já ativada perder seu alvo antes da resolução, é apenas consumida ou existe comportamento alternativo específico?
5. Empate definitivo após soma de todos e soma dos ofensivos, ainda pendente no GDD.

[Voltar ao GDD](REGRAS.md) · [Biblioteca dos especiais](BIBLIOTECA_ATAQUES_ESPECIAIS.md) · [Matriz das cartas](FICHAS_CARTAS_BASE.md).
