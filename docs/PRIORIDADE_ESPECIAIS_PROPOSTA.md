# Dimensions Stacks — Prioridade e reações defensivas (proposta v0.2)

> **STATUS: PROPOSTA, AGUARDA APROVAÇÃO DO AUTOR.** O jogador pediu explicitamente que **habilidades defensivas possam ser usadas como reação a ataques a qualquer momento em que ainda seja possível impedi-los**. O mecanismo exato abaixo resolve essa necessidade, sem tratar como aprovado tudo que ainda está em discussão.

## 1. Confirmado pelo autor; não alterar

1. No máximo **1 carta especial ativada voluntariamente por jogador, por combate**, salvo habilidade que autorize duas expressamente.
2. O jogador escolhe **qual** das especiais preparadas quer usar e **em qual rodada**. Pode guardar duas cartas especiais preparadas à sua esquerda.
3. **Uso forçado AE-111 (original #59):** o alvo é obrigado a utilizar **todas as especiais já preparadas**, até duas, mesmo violando o limite voluntário normal.
4. Depois de ativada, a carta especial vai ao **Buraco Negro**, inclusive se um efeito contrário anular sua habilidade (regra de custo e descarte).
5. **Especial de repetição AE-112 (original #62):** não permitir ciclos de repetição; repetir **efeito** não vira voluntariamente uma segunda carta especial preparada.
6. **AE-103 (original #54):** “cartas em jogo” são somente **as cartas normais apresentadas em combate**, não especiais preparadas.
7. O autor aprovou renomear **Poder** para **Ataque (ATQ)**. Os pares ficam **ATQ/DEF** e **INT/VEL**.
8. Conflito entre duas imposições de atributos diferentes: comparar nas cartas de quem impôs o valor do atributo que cada uma impõe; vence o maior. Desempate geral: valor usado → soma de quatro atributos → ATQ+INT; empate absoluto ainda aberto.

## 2. Nome das habilidades: recomendação editorial, NÃO aprovado

Como também existem cartas de proteção, reação e manipulação, **“Ataque Especial” não abrange bem todos os usos**.

**Recomendação:** rótulo geral na interface **Habilidade Especial** ou simplesmente **Especial**, abreviado **ESP**. Cada uma teria categoria **Ataque / Defesa / Controle / Recuperação / Coringa**, usada apenas para interface e janela de reação, sem gerar bônus novo. Em páginas históricas, preservar a expressão “Ataque Especial”, que é o nome do jogo de infância.

## 3. O problema da fila única

Uma fila de efeitos ativados que se resolve sem permitir interromper a resolução **inviabiliza uma defesa reativa tardia**. Por exemplo, se um ataque tenta roubar uma carta, o defensor precisa de oportunidade de **usar seu escudo antes que o roubo seja consolidado**, mesmo que todos já tenham revelado cartas e iniciado a resolução.

**Proposta recomendada: prioridade circular + janelas de reação defensiva antes de cada efeito perigoso.**

### Janela A — Preparação/Pré-combate (se a habilidade exigir)

Habilidades cujo texto exige *antes do combate* podem ter janela específica **antes da revelação ou seleção definitiva dos atributos**, com prioridade na ordem do iniciador em sentido horário. Não inferir que um texto que diz "antes" pode passar a ser jogado depois. **A necessidade exata dessa janela deve ser aprovada.**

### Janela B — Após revelação, antes da comparação

Todos os jogadores ativos têm oportunidades em sentido horário de usar **uma especial voluntária** (ou passar). Jogadores podem responder a habilidades adversárias, consumindo seu próprio limite voluntário. O iniciador oferece a primeira oportunidade, mas **não recebe vantagem automática de resolver primeiro**.

### Janela C — Reação defensiva imediata

Quando uma habilidade ameaçadora é ativada **ou está prestes a resolver**, os jogadores afetados podem usar **especial preparada do tipo Defesa/Reação**, desde que ainda possuam ativação voluntária disponível ou uma exceção que permita mais ativações.

- Uma defesa pode entrar **em resposta** a qualquer ataque especial ainda pendente ou ao resultado do confronto normal **antes de as cartas mudarem irreversivelmente de zona**.
- Não é necessário esperar a próxima rodada ou o próprio turno para responder. “A qualquer momento” significa **qualquer oportunidade legal durante o combate em que exista uma ameaça pendente**, não depois de um efeito já encerrado.
- A nova defesa entra no topo da pilha e **resolve antes** do efeito ao qual responde. Ao final das respostas sucessivas, retoma-se a resolução do efeito anterior, se ele ainda estiver válido.
- Mesmo se outro jogador já passou, ele pode responder numa janela nova se ainda tiver sua ativação disponível. Passar não consome especial.
- **Limite continua valendo:** defesa reativa **não é uma segunda ativação voluntária gratuita** se o mesmo jogador já ativou uma especial normal, salvo texto expresso de exceção. Este trade-off é intencional e deve ser apresentado claramente na interface.
- Se o jogador não tem especial defensiva preparada, ou seu limite foi consumido, não pode reagir por conveniência.
- Depois que a carta normal já foi capturada/descartada, a defesa NÃO retroage no tempo para desfazer a captura.

### Janela D — Resolução final

Se todas as ameaças e respostas tiverem sido tratadas: resolve-se a comparação de atributos, os desempates e o destino das cartas de combate. **Antes de consolidar uma captura/descartes**, disparar as últimas reações de defesa que explicitamente previnem perda/captura, se ainda houver prioridade legal.

## 4. Habilidade NOVA AE-130: Anular a última habilidade

**Redação candidata para o jogo:**

> **REAÇÃO — Anule a última habilidade especial ativada que ainda não tenha sido resolvida. A carta anulada é descartada normalmente. Não desfaz efeitos já concluídos.**

- **O que anula:** o **último especial pendente** da pilha. Se duas habilidades estiverem aguardando resolução, o alvo é aquela que está no topo, não qualquer habilidade escolhida livremente pelo defensor.
- **O que não anula:** especial já resolvida ou a própria carta de combate normal. Não pode voltar para buscar um roubo concluído em rodada anterior.
- **Se houver outra AE-130:** uma segunda anulação pode anular a primeira, desde que a nova ativação seja legal e o jogador tenha autorização para usá-la.
- **Custo:** ambas as cartas que foram ativadas e depois anuladas acabam no Buraco Negro, seguindo o custo confirmado.
- **Fonte:** solicitado expressamente pelo autor; o texto específico **ainda é proposta**.

### Exemplo prático com três jogadores

1. A ativa **atributo obrigatório ATQ**.
2. B responde impondo **INT**.
3. C ativa **AE-130**, anulando a última especial pendente (a de B).
4. Resolve-se C primeiro: B é anulada. A continua na pilha e depois impõe ATQ.
5. As três especiais ativadas são gastas. O combate normal continua usando ATQ.

### Contraexemplo importante

A já resolveu um efeito que retirou carta da reserva de B. Quando B tenta reagir depois da transferência confirmada, **AE-130 não pode desfazer essa movimentação**. B precisava responder **antes de o efeito terminar**. Uma habilidade específica de recuperação ou troca poderia intervir em momento posterior, mas seria outro efeito, não um cancelamento retroativo.

## 5. Habilidades defensivas não são intercambiáveis

| Referência | Alcance proposto | O que não faz |
| --- | --- | --- |
| AE-071 | Retira sua carta normal da disputa e a devolve ao ativo | Não cancela ataques contra outros |
| AE-072 | Se você perder, impede captura/descarte de sua carta | Não impede vitória numérica do rival |
| AE-073 | Anula habilidades adversárias ainda pendentes | Não volta atrás em efeitos já resolvidos |
| AE-074 | Bloqueia uma ação dirigida especificamente a você | Não bloqueia ataque global contra todos |
| AE-075 | Impede que o rival capture sua carta normal | Não anula atributo vencedor do rival |
| AE-103 | Protege sua carta e descarta as **cartas normais de combate** alheias | Não atinge especiais preparadas |
| AE-130 | Anula a **última habilidade pendente** | Não permite escolher livremente uma habilidade mais antiga da pilha |

Essas descrições são um modelo de interação para discutir, não prioridades aprovadas.

## 6. Efeitos especiais que exigem exceções de prioridade

**AE-111 uso forçado:** a carta que obriga uso resolve na pilha; quando resolver, coloca na pilha as até duas especiais que o alvo já preparou. **Proposta:** o dono do alvo escolhe a ordem e os alvos legais; cada efeito forçado também oferece oportunidade de resposta defensiva. Quem já gastou uma especial voluntária não ganha outra por isso: essas ativações são **forçadas**.

**AE-112 repetição:** repetir uma vez o efeito de uma especial já resolvida **não ativa uma segunda carta especial preparada**. A repetição só acontece depois de pagar o custo e não pode apontar para outra repetição ou cópia.

**Duas habilidades que impõem atributos:** se ambas permanecerem válidas após cancelamentos e reações, aplicar a regra de valor maior já aprovada, não 'a última jogada sempre vence'.

**Vitória automática rara:** se uma habilidade futura fizer alguém vencer a comparação sem olhar valores, ainda oferece janelas de defesa/cancelamento antes da resolução. O efeito antigo #52 foi retirado.

## 7. Perguntas ainda não respondidas pelo autor

1. A janela A pré-revelação será necessária para habilidades cujo texto exige *antes do combate*, ou vamos redesenhar todos os seus textos para a janela B?
2. Na janela C, todas as habilidades defensivas podem reagir à comparação normal prestes a terminar, ou algumas serão limitadas ao tipo de ataque descrito em sua própria carta? (Recomendação: respeitar a condição explícita de cada defesa.)
3. Ao obrigar duas cartas com AE-111, quem escolhe ordem e alvos? (Proposta: o dono original.)
4. Quanto tempo uma oportunidade de reação dura no jogo digital? Ainda não definir segundos nem relógio.
5. O que ocorre se o alvo de uma habilidade deixa de existir antes de ela resolver? E se dois efeitos anularem o último simultaneamente?

**Resumo:** o autor aprovou **a necessidade de defesas reativas em qualquer momento útil**; esta especificação de janelas, pilha e resposta é uma solução proposta, não autorização para programar regras indefinidas.

[Voltar ao GDD](REGRAS.md) · [Biblioteca de 129 candidatos](BIBLIOTECA_ATAQUES_ESPECIAIS.md) · [87 fichas propostas](CARTAS_87_PROPOSTAS.md).
