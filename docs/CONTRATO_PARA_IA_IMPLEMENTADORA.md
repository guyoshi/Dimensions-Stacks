# Dimensions Stacks — Contrato oficial para IA implementadora (v2.0)

> **LEIA PRIMEIRO. APROVAÇÃO AUTORAL: 12/10/2026.** O autor disse **“Aprove tudo”** após a inclusão dos quatro últimos integrantes da Família Carnam. Estão **APROVADOS os 87 registros de cartas, seus textos, atributos e habilidades atribuídas**. Também foi aceito o catálogo de **129 habilidades** como repertório de design, as regras anteriormente definidas e as propostas estruturadas documentadas abaixo. Isso **não** afirma que o jogo está programado, testado ou que situações não especificadas possuam solução automática.

## 1. Ordem de autoridade e dados de produção

1. **Este contrato e as decisões mais recentes do autor** têm prioridade sobre avisos históricos “proposto” espalhados em documentos anteriores.
2. [REGRAS.md](REGRAS.md): mecânicas, aprovações e **pendências operacionais**.
3. [CARTAS_87_PROPOSTAS.md](CARTAS_E_ESPECIAIS.md): apesar do nome antigo do arquivo, é a **tabela de 87 cartas APROVADAS**.
4. [BIBLIOTECA_ATAQUES_ESPECIAIS.md](BIBLIOTECA_ATAQUES_ESPECIAIS.md): **129 habilidades**, com coluna final preenchida para 78 efeitos distintos utilizados nas 87 cartas. As outras **51 permanecem no catálogo para expansão**.
5. [PRIORIDADE_ESPECIAIS_PROPOSTA.md](PRIORIDADE_ESPECIAIS_PROPOSTA.md): o nome do arquivo é histórico; **a pilha de reações defensivas e prioridade circular fica aprovada como modelo-base**, com os casos-limite indicados mais adiante pendentes de especificação.
6. **JSON oficial:** [87 cartas](../dados/oficial/cartas_87.json) e [129 habilidades](../dados/oficial/habilidades_129.json), ambos com status de aprovação. São os dados estruturados atuais para outra IA.
7. [ELENCO_CANDIDATO.md](ELENCO_CANDIDATO.md): preserva fontes literárias e identidades, mas a inclusão das **87 cartas** foi aprovada como baralho.
8. [CHECKLIST_VALIDACAO.md](CHECKLIST_VALIDACAO.md): testes, cenários e bloqueios ainda abertos.

**Fontes antigas** como cartas físicas, leituras por IA, textos do livro 2 classificados como mistos, e cópias em `dados/propostas` não são fontes de dados finais de jogo. O repositório de ficção é [guyoshi/dimensoesinfinitas](https://github.com/guyoshi/dimensoesinfinitas). A **aprovação da carta para o jogo não garante a correção canônica da biografia** quando o campo de confiança narrativa é baixo: verificar o manuscrito antes de criar eventos, habilidades ou fatos literários novos.

## 2. Decisões APROVADAS como design do jogo

| Área | Regra aprovada |
| --- | --- |
| Elenco | **87 cartas oficiais**, distribuídas em **J 23, V 19, S 14, D 18, M 12, B 1**. Cada carta tem ID, nome, descrição curta, atributos naturais, soma e habilidade especial equipados e aprovados. |
| Valores naturais | **0–100**, valores inteiros para **Ataque (ATQ), Defesa (DEF), Inteligência (INT), Velocidade (VEL)**. Especiais podem elevar valores temporários acima de 100. |
| Desempate | Primeiro valor no atributo selecionado; depois **soma dos quatro atributos** (o terceiro critério ATQ + INT foi removido em 15/10/2026; cada carta tem soma diferente das demais). Empate remanescente continua **PENDENTE**, não criar moeda ou sorteio. |
| Pares | **ATQ/DEF** e **INT/VEL**. ATQ/INT são ofensivos; DEF/VEL são defensivos. |
| Vitória normal | Melhor resultado ofensivo captura as cartas normais derrotadas; melhor resultado defensivo protege sua carta e envia cartas normais derrotadas ao **Buraco Negro**. Preservar exceções expressas. |
| Formação inicial | Partidas com 2–4 jogadores, todos contra todos. **Configuração inicial aprovada para testes: 18 cartas por participante** (7 ativas, 11 na reserva): 36/54/72 cartas em partidas com 2/3/4. A seleção exata do subconjunto a partir das 87 ainda requer procedimento. |
| Preparação e uso | No máximo **2 habilidades especiais preparadas** à esquerda. Normalmente **1 ativação especial voluntária por combate**, salvo habilidade que autorize duas. O proprietário escolhe o especial e a rodada; especiais usadas vão ao Buraco Negro. |
| Ativação forçada | **AE-111**, derivada do efeito físico #59, faz o alvo ativar **todas** as suas especiais já preparadas (até duas), sem sacar novas. |
| Recuperação | Efeito #12: 2 cartas aleatórias do Buraco Negro para o fim da própria reserva. |
| Limpeza | Efeito #54/AE-103 atinge somente cartas **normais colocadas em combate**, não cartas especiais preparadas. |
| Defesa reativa | **Aprovado o modelo de janelas de resposta antes de o ataque ser concluído.** Reações podem interromper efeitos pendentes e resolver antes deles; efeitos já resolvidos não são desfeitos retroativamente. Passar não gasta especial, e reagir não cria uma segunda ativação voluntária gratuita. |
| Prioridade-base | Iniciador do combate oferece primeira oportunidade; prioridade segue **circularmente em sentido horário**; efeitos especiais respondidos entram em **pilha de resolução inversa (último a entrar, primeiro a resolver)**. Uma defesa pode interromper uma ameaça pendente no momento pertinente. Detalhes ainda não fixados estão na seção 4. |
| Contraespecial | **AE-130** anula a última habilidade especial **pendente** de resolução. Não anula habilidades já concluídas; ambas as cartas especiais ativadas são consumidas normalmente. |
| Nome da mecânica | Nome oficial: **Habilidade Especial**; forma curta, usada nos botões e textos da interface: **Especial** (`ESP`). “Ataque Especial” era só o nome histórico das cartas físicas e não deve mais aparecer na interface (decisão do autor, 13/10/2026). |
| Escopo da coleção | 129 habilidades aceitas como **catálogo de design**; **78 equipadas** entre as 87 cartas, **51 sem carta atribuída**, disponíveis para expansão. Repetir habilidade em cartas diferentes é permitido. |
| União | 7 integrantes originais e Jennifer como futura integrante. Cada carta conserva sua cor de origem com selo adicional, sem duplicar. As habilidades fortes distribuídas para os oito foram **aprovadas**. |
| Cores | Viajantes azul; Mistério Oculto vermelho; Ciclo de Jesed amarelo; Série Édelin/Belfex verde; Diário Sobrenatural roxo; Spacetheft preto. Não definir a força por cor. |
| Variedade | Cartas intencionalmente fracas, especialistas, equilibradas e elites são parte da concepção aprovada. A soma desigual faz parte do desempate. |
| Apresentação | Descrições curtas de até **120 caracteres**; o texto completo da habilidade pode aparecer em expansão/tooltip. O limite é aprovado como norma editorial, mas a diagramação precisa de teste visual. |

## 3. Baralho e habilidades: regras de implementação

- **Fonte oficial do conteúdo:** os 87 registros do JSON oficial, validados contra a tabela Markdown. Os nomes de chaves do JSON oficial (ex.: `atributos.ATQ`, `habilidade_especial_id`) prevalecem sobre chaves de arquivos antigos marcadas `_propostos`.
- **78/129 IDs de habilidade estão equipados**; 51 efeitos não possuem carta nesta versão do baralho. **Nunca distribua os 51 automaticamente**.
- **AE-104 foi aposentada; os efeitos históricos #18, #24 e #52 continuam excluídos.** A habilidade **AE-129**, uma vitória automática rara *diferente*, está aprovada para **S01 Jasmey**. Não ressuscitar o #52 antigo.
- **A União:** Bruno (V02), Brenda Koraveli (V15), Hyde (M01), Releuz (M10), Jasmey (S01), Mark Polar (J03), Édelin (B01); Jennifer (D06) entra depois, porém sua carta base já existe. Selo próprio sem cor exclusiva.
- **Família Carnam:** D07 Ingrid, D13 Suéten, D15 Carnam (pai), D16 Isabela, D17 Avó Carnam e D18 Ibliso (cão). D17 **não é** D10 Avó de Kelly. A arma associada ao Elo de Carnam não significa que Carnam seja o pai de Vini.
- **Viajantes Dimensionais adicionados:** V16 Faka (Faka no manuscrito), V17 Lanigiah (rainha Aracnas), V18 Grande Pai Gaia (líder Obbs) e V19 Seti (guerreiro Obb).
- **Cartas históricas físicas:** são fonte de ideias, mas nomes, valores e representações não são herdados automaticamente pelas cartas digitais.
- **Reatribuição de especiais (13/10/2026, autorizada pelo autor):** 42 das 79 cartas fora da União trocaram de habilidade especial para que o custo (a força da carta sacrificada) acompanhe o valor do especial; informação e ordenação ficam em cartas fracas. Antes/depois em [CARTAS_E_ESPECIAIS.md](CARTAS_E_ESPECIAIS.md); versão anterior preservada em `dados/historico/cartas_87_antes_2026-10-13.json`.
- **Balanceamento:** aprovação autoral não equivale a simulação, raridade final, acessibilidade de interface ou QA concluídos. Não reequilibrar silenciosamente uma ficha aprovada.

## 4. Pendências reais que a aprovação genérica NÃO especifica

1. **Origem e momento de preparar especiais:** a regra de duas preparadas existe, mas ainda não há um procedimento completo e inequívoco de escolha/retirada da pilha.
2. **Dupla do especial AE-010:** destino de cada uma das duas cartas normais após vitória, derrota ou empate.
3. **Empate absoluto:** o que fazer se valor eleito e soma de quatro ainda empatarem (hoje: as cartas voltam aos donos).
4. **Janelas anteriores à revelação:** habilidades cuja própria descrição exige agir “antes do combate” precisam de posicionamento explícito; não inverter arbitrariamente seu sentido.
5. **AE-111 com duas especiais obrigatórias:** ordem de ativação, alvos e possíveis respostas entre os dois efeitos. A proposta é o titular escolher ordem/alvos; a regra-base de forçar todas já está aprovada.
6. **Alvo ausente/zonas insuficientes:** comportamento quando a reserva, o Buraco Negro ou a área de alvo contiverem menos cartas que as solicitadas; não inventar roubo de outra zona.
7. **Seleção inicial justa** de 18 cartas entre as 87 em partidas de 2, 3 e 4 jogadores (aleatorização, repetição, distribuição por série e sorteio).
8. **Detalhes de relógio/rede:** duração do tempo de reação e serialização de ações simultâneas num jogo online.
9. **Raridade formal e estatísticas de testes** dos especiais de captura coletiva, anulação e vitória automática.
10. **Revisão de fonte narrativa** de Édelin, Releuz, Diego e Richard Falkner, sem confundir a aprovação *lúdica* dos textos com evidência literária.

A aprovação “Aprove tudo” ratifica as **opções propostas existentes**, mas não fornece respostas para perguntas que nunca tiveram uma opção fechada. Nesses casos a IA deve solicitar decisão, deixar como `PENDENTE` ou usar marcador explícito numa prévia. **Não afirmar jogo competitivo totalmente pronto.**

## 5. Procedimento para próxima IA

**FAÇA:** importar os arquivos em `dados/oficial`, preservar IDs e atribuições, aplicar as regras aprovadas, usar PT-BR, referenciar a origem literária e separar pendências de decisões tomadas. Atualizar Markdown e JSON juntos a cada alteração autorizada.

**NÃO FAÇA:** usar dados em `dados/propostas` como atuais, reconstruir informações do jogo com base nas cartas físicas, duplicar integrantes da União, inventar mecânica para empate irredutível, presumir que 129 habilidades são 129 cartas diferentes, alterar valores sem autorização, chamar um texto de biografia de prova sobre o cânone, ou declarar equilíbrio sem testes.

## 6. Referências

- [JSON oficial de cartas](../dados/oficial/cartas_87.json)
- [Catálogo aprovado de habilidades](BIBLIOTECA_ATAQUES_ESPECIAIS.md)
- [JSON oficial de habilidades](../dados/oficial/habilidades_129.json)
- [GDD](REGRAS.md)
- [Reações, pilha e prioridade](PRIORIDADE_ESPECIAIS_PROPOSTA.md)
- [Checklist](CHECKLIST_VALIDACAO.md)
