# Dimensions Stacks — Regras e dinâmica (GDD v0.7)

> Estado: **rascunho de design**, 12/10/2026. Documenta as regras das fotografias do jogo original e os esclarecimentos do autor. Qualquer regra não inteiramente determinada está identificada como **PENDENTE** ou **PROPOSTA**, nunca tratada como cânone.

## 1. Conceito

Jogo de cartas digital para PC, competitivo e com personagens das diferentes séries de **Dimensões Infinitas**. Cada carta futura receberá seu próprio nome, descrição, atributos e um ataque especial temático, de acordo com o cânone literário. **Os nomes, biografias e valores das cartas antigas não serão reaproveitados como base**. Os ataques especiais antigos são referências de design, não habilidades já atribuídas aos novos personagens.

- Modalidades: **2, 3 ou 4 jogadores**, todos contra todos (formato proposto para o PC; sem equipes nesta versão).
- Objetivo: **eliminar todas as cartas disponíveis dos adversários**, incluindo, quando aplicável, o meio de reserva.
- Vitória: último jogador que ainda possui cartas utilizáveis (interpretação operacional proposta; validar quando reservas e efeitos especiais interagem).
- Escopo atual: regras, fluxo, balanceamento, inventário de habilidades e elenco. **Não implementar o jogo nesta fase.**

## 2. Componentes e zonas

1. **Baralho ativo:** pilha ordenada do jogador; a carta do topo é a próxima em combate. Capturas e cartas preservadas vão para o final dessa pilha. Pode aumentar ou diminuir.
2. **Meio de reserva:** cartas restantes distribuídas em partes iguais entre jogadores após a mão/baralho inicial. Não é livremente acessível.
3. **Campo de combate:** 1 carta do topo do baralho ativo por jogador em cada disputa normal.
4. **Área de ataques especiais:** à esquerda do jogador, comporta **até 2 cartas** preparadas e viradas para baixo.
5. **Buraco Negro:** descarte comum, ordenado pela sequência real dos descartes. Cartas ali não voltam ao jogo sem ataque especial que permita expressamente.
6. **Cartas capturadas:** deixam o campo e entram no final do baralho ativo de quem as capturou.

**PENDENTE:** total inicial de cartas em jogo, distribuição do resto quando não divisível por 2/3/4, visibilidade da quantidade e da ordem da reserva, e se o jogador pode examinar as cartas depois da preparação.

## 3. Preparação

1. Cada jogador recebe **7 cartas**.
2. Pode vê-las e **escolher a ordem** em que serão empilhadas.
3. As demais são distribuídas em partes iguais como **meio de reserva** de cada jogador.
4. Define-se o jogador inicial; os turnos de escolha avançam no **sentido horário**.
5. A primeira rodada se encerra quando **todos os participantes tiverem iniciado uma disputa uma vez**.

**PENDENTE:** como escolher o iniciador (sorteio é PROPOSTA); tamanho e composição do baralho global; se as 7 cartas iniciais são provenientes de um baralho comum embaralhado.

## 4. Atributos

Cada carta possui exatamente quatro atributos numéricos:

| Atributo | Tipo | Pode confrontar |
| --- | --- | --- |
| Poder | Ataque | Poder ou Defesa |
| Defesa | Defesa | Poder ou Defesa |
| Inteligência | Ataque | Inteligência ou Velocidade |
| Velocidade | Defesa | Inteligência ou Velocidade |

O iniciador seleciona **qualquer dos quatro** atributos. Os demais escolhem um atributo do **mesmo par**. Cada jogador utiliza sua **primeira carta do baralho ativo**, sem passar à segunda ou terceira.

A escolha simultânea ou secreta do atributo pelos demais é **PROPOSTA de interface** para evitar vantagem de informação; no manual físico a revelação das cartas ocorre após todas as escolhas.

## 5. Resolução do combate (núcleo original)

1. Todos colocam a carta do topo no campo, virada para baixo.
2. O iniciador escolhe seu atributo; os adversários escolhem atributos legalmente compatíveis.
3. Revelam-se as cartas; compara-se o **valor numérico do atributo escolhido por cada jogador**.
4. Se o maior valor vencedor for um **atributo de ataque**, o vencedor recolhe **as cartas de combate dos adversários** e as coloca no final de seu baralho ativo, incluindo a própria carta que jogou.
5. Se o maior valor vencedor for um **atributo de defesa**, os adversários perdem suas cartas de combate para o **Buraco Negro**; o defensor vencedor preserva sua própria carta no final do seu baralho ativo, mas não captura as outras.
6. Avança o iniciador no sentido horário e repete.

### Empates — sequência confirmada pelo autor (12/10/2026)

Quando **dois ou mais valores de atributos individuais empatarem**, aplicar os desempates nesta ordem **aos participantes empatados**:

1. **Maior valor do atributo escolhido no confronto.** Se empatar, prosseguir.
2. **Maior soma dos quatro atributos da carta**: Poder + Defesa + Inteligência + Velocidade.
3. **Se a soma total também empatar:** vence a maior soma de **Poder + Inteligência** (os dois atributos de ataque).

O critério **Poder + Inteligência** tem precedência sobre Defesa + Velocidade em igualdade das somas totais, conforme decisão do autor.

**PENDENTE:** empate absoluto depois do terceiro critério. **PENDENTE:** em confrontos com especiais que envolvem **duas cartas simultâneas**, como somar a totalidade dos atributos para desempate (#09, cuja soma principal já está aprovada). A documentação antiga mencionava um possível empate defensivo especial; a instrução nova de três etapas prevalece na regra geral.

Para choque de **especiais de imposição de atributo** que empatem no valor usado para impor, **PROPOSTA**: aplicar a mesma sequência de desempate por soma dos quatro atributos e depois Poder + Inteligência. A aplicação automática à disputa de imposição não foi confirmada expressamente pelo autor, então permanece como proposta.

### Confrontos com 3 ou 4 jogadores

O combate é coletivo: um único iniciador e todos os jogadores ainda ativos participam, com um único maior valor vencedor. A regra geral acima continua aplicável. **PENDENTE:** como processar vencedores empatados e especiais que escolhem 'o adversário à direita/esquerda' quando este estiver eliminado.

## 6. Ataques especiais (núcleo original)

- Só podem ser usados **a partir da segunda rodada**.
- Antes de uma disputa, o jogador anuncia/prepara uma carta de ataque especial, colocando-a **virada para baixo à esquerda**.
- É permitido deixar **até 2 cartas** preparadas por jogador.
- Ficam protegidas: não podem ser roubadas nem atacadas por efeitos comuns.
- O jogador pode **virá-las no momento escolhido**, no contexto de combate (o manual descreve a ativação depois da revelação dos atributos).
- A carta preparada fica **comprometida**: não pode ser recolhida voluntariamente para o baralho.
- Depois de utilizada, **vai obrigatoriamente ao Buraco Negro**.
- Ataques especiais podem expressamente abrir exceções, como recuperar carta do Buraco Negro, retirar da reserva ou afetar cartas de combate.
- 'Aleatório': seleção sem ver o conteúdo. 'À sua escolha': seleção após ver as opções autorizadas.

**MANUAL ANTIGO (HISTÓRICO):** há passagens contraditórias sobre usar um ou dois especiais voluntariamente no mesmo combate. **ESCLARECIMENTO DO AUTOR:** o jogador escolhe qual especial já preparado deseja ativar e em qual rodada. **PENDENTE:** se também poderá ativar voluntariamente ambos na mesma disputa; não inferir uma quantidade máxima de ativações voluntárias por essa frase.

**PENDENTE:** se preparar a carta a retira obrigatoriamente do topo do baralho ativo ou de outra zona; se preparar substitui a participação normal daquela carta no turno; prioridade entre jogadores que desejam ativar especiais na mesma janela; limites temporais exatos de reação, escolha de alvo e efeitos que se anulam. **A escolha de qual especial preparado ativar e em qual rodada pertence ao seu proprietário**, salvo uso forçado da habilidade #59.

**PROPOSTA de sequência de interface:** preparação pré-combate → escolha de atributos → revelação → janela de especiais → recálculo do combate → resolução de captura/defesa → descarte dos especiais ativados.

## 7. Meio de reserva

- Quando o baralho ativo de alguém acabar, o jogador compra **mais 7 cartas da própria reserva**, como estabelece o manual.
- Ataques especiais específicos podem permitir retirar cartas da própria reserva ou da de um adversário.
- **PENDENTE:** quando restarem menos de 7 na reserva; reposição durante uma disputa; se o jogador fica temporariamente sem carta de combate; quando se declara eliminação na presença de cartas especiais preparadas.

## 8. Proibições e restrições originais

- Não trocar livremente cartas com a própria reserva ou com outro jogador.
- Não consultar/pular a segunda e demais cartas do baralho ativo para jogar uma posterior.
- Não usar atributos fora do par Poder/Defesa ou Inteligência/Velocidade.
- Não recuperar ataques especiais preparados sem regra expressa.
- Não roubar cartas já colocadas no campo de combate, **salvo efeito de carta explicitamente autorizado**.

## 9. Identidade visual aprovada para a versão PC (12/10/2026)

**Decisão definitiva do autor para a cor-base por série, não por heroísmo/vilania:**

| Série de origem | Cor aprovada | Marca na carta |
| --- | --- | --- |
| Viajantes Dimensionais | **Azul** | VIAJANTES |
| Mistério Oculto | **Vermelha** | MISTÉRIO OCULTO |
| Ciclo de Jesed | **Amarela** | JESED |
| Série de Édelin / Belfex (nome da série pendente) | **Verde** | BELFEX |
| Diário Sobrenatural | **Roxo** | DIÁRIO SOBRENATURAL |
| Spacetheft | **Preta** | SPACETHEFT |

**A União não tem cor-base exclusiva**: seus integrantes conservam a cor da própria série e recebem um **selo sobreposto de filiação**. Raridade, status mecânico e filiação são atributos visuais independentes. O uso de cores **não modifica regras**, não oferece bônus, não determina se personagem é herói/vilão e **não pode ser usado literalmente** pelos ataques físicos antigos #60 (azul) e #61 (vermelho); esses precisam de nova condição mecânica.

Cuidar da acessibilidade: moldura preta com texto de alto contraste, moldura amarela com texto escuro, e não depender apenas de cor para identificar origem.

## 10. Princípios de balanceamento para testes

- Preservar a estratégia **atacar captura / defender elimina**.
- Balancear em separado 2, 3 e 4 jogadores: um especial 'todos' escala com a mesa.
- Não presumir que soma maior dos quatro atributos significa carta melhor: especial e distribuição de atributos contam.
- Limitar efeitos que quebram ordem do topo, removem várias cartas ou trazem oponente à eliminação antes de poder reagir.
- Não vincular raridade a vantagem absoluta.
- Favorecer contra-jogo claro, efeito curto, alvo declarado e momento de resolução inequívoco.

## 11. Questões a fechar com o autor

1. Preparação de especial: origem exata da carta e se sua preparação consome a jogada.
2. Quantos especiais podem ser ativados numa mesma disputa: 1 ou 2?
3. Empate após a soma dos quatro atributos e regra específica da defesa.
4. Reserva com menos de 7 cartas e condição exata de eliminação.
5. Efeitos 'à esquerda/direita' com jogadores eliminados.
6. Tamanho de baralho global e modo de distribuição de cartas ao iniciar.

## 12. Fontes

- Fotografias do manual original fornecidas pelo autor (outubro de 2026).
- Esclarecimentos do autor: vitória por eliminação, combate com primeira carta, confronto defesa x defesa, até duas cartas especiais preparadas e baralho ativo crescente.
- Cânone narrativo: [Dimensões Infinitas](https://github.com/guyoshi/dimensoesinfinitas).

Documentos complementares: [Ataques especiais](ATAQUES_ESPECIAIS.md) · [Elenco candidato](ELENCO_CANDIDATO.md).


## 13. Esclarecimento do autor sobre custo de especiais (12/10/2026)

**Confirmação:** o **ataque especial utilizado vai ao Buraco Negro**; a carta **normal de combate** não recebe proteção extra por esse uso. Se vencer, seguirá a regra normal (inclusive indo ao fim do baralho quando apropriado); se perder, pode ser capturada ou descartada conforme a resolução. Obrigar a mesa ao mesmo atributo **não garante vitória**. Portanto, custo da carta especial e possibilidade de derrota da carta comum devem ser contabilizados antes de classificar uma habilidade como excessiva.

**Decisão editorial visual confirmada:** o autor aprovou **cores por série**, deixando de associar verde a heróis e vermelho a vilões. Selos identificam A União e raridade sem duplicar obrigatoriamente personagens.

**Filiação oficial de A União:** Bruno Lins Lee, Brenda, Hyde, Releuz (provisório), Jasmey Badrock, Mark Polar (também grafado Pollar em registros antigos), Édelin Fils; Jennifer ingressa futuramente. Hyde é a cabeça/liderança indicada para o grupo; **identidade do fundador ainda não fechada**. Ver [elenco candidato](ELENCO_CANDIDATO.md#7-a-união--filiação-oficial-sem-duplicar-cartas).

## 14. Decisões confirmadas: especiais 09 e 59 e choque de atributos (12/10/2026)

### 14.1 Ataque especial 09 — duas cartas somadas

**APROVADO:** ao ativar o especial, o jogador usa **duas cartas consecutivas do topo de seu baralho ativo**, somando o valor **do mesmo atributo escolhido em ambas** para produzir **um único total no confronto**. A razão estratégica original é permitir que uma primeira carta fraca ganhe força com a segunda. **Há um custo real:** consome-se uma carta de ataque especial (que vai ao Buraco Negro) e duas cartas normais ficam comprometidas com a disputa, em vez de uma. Não substituir automaticamente por “pegar o maior dos dois valores”, nem aplicar teto de soma sem testes.

**PROPOSTA operacional até confirmação:** as duas cartas normais seguem juntas o desfecho do combate: se a dupla vence atacando, ambas retornam ao final do baralho ativo do vencedor junto das cartas capturadas; se vence defendendo, ambas retornam ao final de seu baralho ativo; se perde, ambas são capturadas ou descartadas segundo a regra comum. **PENDENTE:** quando só há uma carta ativa e menos de duas disponíveis para formar a dupla; desempate com duas cartas e forma de calcular a soma de todos os atributos (se aplicável).

### 14.2 Ataque especial 59 — ativação forçada

**APROVADO:** obriga um adversário a usar uma carta de ataque especial **somente se ela já estiver preparada na área de especiais à esquerda (virada para baixo, esperando ativação)**. Não obriga tirar uma carta nova do baralho ou da reserva. A carta forçada é ativada e descartada como qualquer especial utilizado.

**APROVADO (12/10/2026):** deve **usar todas as cartas especiais que já estiverem preparadas na sua área à esquerda**, até duas. O autor usou a expressão 'todas em mãos'; em conjunto com a decisão anterior, isso significa as cartas **já disponíveis/preparadas para ativação**, não cartas ainda escondidas no baralho ativo ou na reserva. **PENDENTE:** como resolver a ordem de ativação das duas, escolhas de alvo internas e eventual janela de resposta.

### 14.3 Choque de imposições de atributos

**APROVADO:** quando dois jogadores ativam especiais que impõem **atributos diferentes** (por exemplo, Poder e Inteligência) no mesmo combate, compara-se **o valor de cada atributo imposto na carta normal de combate de quem o impôs**. **O maior valor determina o atributo obrigatório para todos os jogadores naquela disputa**.

**Exemplo:** jogador A impõe Poder e sua carta normal possui Poder 91; jogador B impõe Inteligência e a sua carta normal tem Inteligência 82. **Poder vence a disputa de imposição**. Todos jogam em Poder, inclusive o jogador B. Os dois especiais ativados são descartados no Buraco Negro, conforme a regra geral.

A disputa de imposição **não é a resolução do combate**: depois dela, todos ainda comparam seus valores no atributo vencedor, e a carta comum pode ganhar ou perder normalmente.

**PENDENTE:** empate exato entre valores de imposição (propõe-se aplicar a ordem de desempate geral desta seção), conflito com 3 ou mais especiais diferentes (viável com 3/4 jogadores ou duplas se aprovadas), e interação com efeitos que modificam atributos antes da imposição.

### 14.4 Convenção de nomeação e identidade (aprovada)

- A identidade visual **usa cores por série**, não herói versus vilão.
- Integrantes de A União **recebem um selo** sem carta duplicada obrigatória.
- A série de Édelin terá **numeração B, de Belfex**; o título ainda está em desenvolvimento.
- No conjunto de cartas de Ciclo de Jesed, a identidade da carta deve ser **Mark Polar**. **Karesis é Mark** segundo o autor e não deve surgir como carta única adicional. O alias Loutes não aparece no nome exibido.


## 15. Transcrição direta de ataques especiais recuperados (12/10/2026, 14:20–14:22)

O autor transcreveu **23 cartas físicas distintas**, consideradas fonte de texto original mais confiável do que a leitura anterior de fotos. Ver [lista com textos literais e auditoria individual](TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md). Não aplicar automaticamente os nomes e as classificações cromáticas antigas às cartas novas.

Destaques para especificação futura:

1. **#06 — Mark Pollar (nome antigo na carta):** *Ganhe a carta que o inimigo usou no ataque especial.* Isso se refere a especial **já utilizado**, não a carta esperando preparada. Definir destino da carta ganha e a interação excepcional com o descarte.
2. **#18 — Ricochett Bombargue:** *Inverta os papéis de vencedor e perdedor uma vez.* Em combate com mais de dois jogadores, definir explicitamente a correspondência de vários perdedores com o vencedor único. Não enfraquecer o efeito antes da regra operacional/testes.
3. **#19 — Sagrado Senhor da Morte:** *Sacrifique uma carta com algum status acima de 90 em troca das três primeiras cartas do Baralho Negro.* **TERMO CORRIGIDO PELO AUTOR:** trata-se do **Buraco Negro**; não existe indicação de uma segunda zona chamada 'Baralho Negro'. Definir quem escolhe a carta sacrificada, a zona de destino, e se os três itens podem incluir especiais.
4. **#24 — Primus Tenesy:** *Jogue duas cartas, uma em Inteligência e outra em Poder.* Exceção intencional ao par normal ataque/defesa; **RETIRADO DO JOGO:** especial #24 removido por decisão do autor, preservado somente como registro histórico.
5. **#27 — Kiw Tenesy:** *Adicione 15 de Defesa e 20 de Velocidade a uma carta.* Definir duração e zona válida; não presumir bônus permanente.
6. **#34 — Master Kang:** *Roube duas cartas, uma de cada jogador.* Com dois jogadores não há dois adversários. **PENDENTE:** versão de duelo ou restrição de uso.
7. **#35 — Cap. Zoddie:** *Troque os maços de reserva dos jogadores, da esquerda para a direita, começando por você.* Diferenciar da troca apenas com a esquerda (#46) e definir rotação simultânea da mesa.
8. **#36 — Luna Stellar:** *Veja suas cartas do monte de reserva e separe 7 para usar na ordem.* Definir onde entram essas 7 e como proceder quando restarem menos de 7 na reserva.
9. **#59 — William McCroys:** *Obrigue um jogador a usar suas cartas de ataque especial nessa rodada.* **Já confirmado:** somente as cartas especiais preparadas na mesa podem ser forçadas; **APROVADO:** todas as cartas especiais já preparadas devem ser usadas; ordem e alvos individuais ainda pendentes.
10. **#60 e #61:** as condições literais se referem a carta **azul** e carta **vermelha**. As cores do jogo digital identificarão séries, não União ou vilania. **PENDENTE:** identificar a carta-alvo e aprovar uma nova condição funcional sem alterar silenciosamente as regras antigas.

**Separação metodológica:** texto transcrito é a fonte original, o que o autor confirmou é a decisão do GDD; aplicações concretas ainda não definidas são hipóteses de design e devem ficar rotuladas **PENDENTE** ou **PROPOSTA**.


## 16. Decisões subsequentes — retirada, terminologia e desempates (12/10/2026)

- **Especial #18 (Ricochett Bombargue): RETIRADO** do conjunto de ataques especiais previstos para o jogo de PC. O texto físico permanece preservado no arquivo histórico, sem efeitos ativos.
- **Especial #24 (Primus Tenesy): RETIRADO** do conjunto de ataques especiais previstos para PC. A carta física continua documentada, mas a mecânica não deve ser replicada.
- **Especial #19 (Sagrado Senhor da Morte):** o autor confirmou que **'Baralho Negro' significa Buraco Negro**. Usar apenas **Buraco Negro** na documentação funcional; preservar nota de divergência com a transcrição anterior. A regra de sacrificar uma carta com atributo superior a 90 em troca das três primeiras do Buraco Negro continua disponível para análise.
- **Especial #59 (William McCroys):** obriga o jogador escolhido a **usar todas as cartas de ataque especial que já tiver preparado à esquerda na mesa**, no máximo duas. A formulação nova 'todas em mãos' **não autoriza puxar cartas não preparadas de outras zonas**.
- **Desempate geral:** valor individual → soma dos quatro atributos → soma **Poder + Inteligência**. Empate persistente depois desses três critérios continua pendente.
- **Leituras por IA de outras cartas:** registrar como **provisórias**, nunca como texto confirmado. Consultar [LEITURAS_IA_PENDENTES_2026-10-12.md](LEITURAS_IA_PENDENTES_2026-10-12.md).


## 17. Inventário ampliado e novas questões mecânicas (12/10/2026)

**Atualização de numeração:** 59 dos possíveis 62 números de cartas físicas identificados; faltam **16, 26 e 55**. Identificações oficiais adicionais fornecidas pelo autor: **03 Édelin, 05 Brenda, 08 Breno, 39 Capitã Nastácia**. Essas quatro cartas continuam com ataques especiais **não recuperados**. Ver [inventário principal](ATAQUES_ESPECIAIS.md) e [tabela de leituras ainda provisórias](LEITURAS_IA_PENDENTES_2026-10-12.md).

### Efeitos recentemente ampliados (origem: texto reconstruído por IA e fornecido pelo autor)

**NÃO APROVADOS AUTOMATICAMENTE PARA O JOGO NOVO.** Estes textos representam o acervo original reconstruído, e seu funcionamento digital ainda precisa ser desenhado e, quando necessário, confirmado.

- **#20 Agente Sete —** trocar o valor de Defesa pela Inteligência da própria carta. **PENDENTE:** a redação indica troca/substituição, não está claro se intercambia ambos os números ou copia apenas um, e qual efeito nos pares legais.
- **#37 D. Lesort —** cada jogador envia uma carta aleatória ao Buraco Negro. **PENDENTE:** de qual zona sai a carta, se o próprio ativador participa e quando ocorre o descarte.
- **#47 Kate Fira —** carta de defesa que impede todos os ataques especiais do turno. **PENDENTE:** prioridade contra especiais já iniciados e relação com #59 que força múltiplas ativações.
- **#49 Temi Lokat —** carta de defesa que impede o rival de vencer neste turno. **PENDENTE:** se impede derrota do usuário apenas ou impede vitória do alvo, e como funciona em 3–4 jogadores.
- **#50 Raum Cedar —** obriga cada jogador a descartar uma carta aleatória ao Buraco Negro. **PENDENTE:** fragmento de início perdido depois de “CARTA ATAQUE...”; aparentemente semelhante a #37, verificar se são duplicados ou têm tempos diferentes.
- **#52 Luar Engeal — RETIRADO:** não usar a habilidade física original no novo catálogo. **Outra possibilidade, independente e ainda candidata:** algumas cartas raras podem possuir vitória automática; o custo de gastar o especial antecipadamente por ativação forçada #59 é um contrajogo importante. Não considerar a raridade ou esse contrajogo uma regra que garante equilíbrio sem testes.
- **#62 Anasin —** repetir uma habilidade pagando duas cartas escolhidas. **DECISÃO DO AUTOR:** impedir ciclos de repetição. **Especificação de segurança proposta:** não repetir o próprio especial 62 nem outro especial de repetição/cópia em cadeia; resolver no máximo uma repetição por ativação; bloquear reativação de efeitos ressuscitados na mesma disputa. Janela e cartas elegíveis ainda requerem definição.

### Riscos transversais a estudar

1. **Ataques defensivos não são iguais:** #31 anula o turno só para o jogador; #32 impede perda, #47 anula especiais, #48 bloqueia ataques dirigidos ao usuário, #49 impede rival de vencer. São hipóteses de interpretação diferentes e não devem ser fundidas sem teste.
2. **Efeitos de vitória forçada e proteção total:** o antigo #52 foi retirado. Candidatos raros novos e a proteção/eliminações do #54 precisam de regras de prioridade e reação, sobretudo em partidas com quatro jogadores. **#54 afeta somente as cartas normais colocadas em combate**, não cartas especiais preparadas.
3. **Especial repetido** (#62) tem custo alto (duas cartas), e o autor determinou **não permitir ciclos infinitos**. Não repetir a própria repetição, não encadear cópias/repetições sem limite nem reativar na mesma disputa cartas retornadas do Buraco Negro.
4. **Itens identificados vs. elenco definitivo:** #03 Édelin é um número da carta de infância, não substitui o código B01 da carta digital. Nenhuma atribuição de habilidade à personagem do novo elenco está aprovada por mera coincidência de nome físico.
5. **Ativação voluntária:** cada jogador decide qual de seus especiais preparados ativar e em que rodada. Continua pendente se ele pode usar voluntariamente os dois no mesmo combate. A habilidade #59 **obriga ativar todas as preparadas**, até duas, independentemente da preferência do alvo.


## 18. Biblioteca estratégica desacoplada do elenco (12/10/2026)

- O autor **não reutilizará os nomes, atributos e descrições** das cartas físicas antigas. Elas servem **somente como fonte de inspiração mecânica**. Os **79 personagens candidatos** das séries serão distribuídos posteriormente.
- Foi criada a [biblioteca de **128 ataques especiais candidatos**](BIBLIOTECA_ATAQUES_ESPECIAIS.md), agrupados em 13 famílias, com coluna `Carta atribuída (ID)` vazia em todas as habilidades, para que nenhuma seja atribuída a personagem por acidente.
- A [auditoria de **62 posições do baralho físico**](AUDITORIA_BALANCEAMENTO_ESPECIAIS.md) registra, para cada habilidade identificada, se recomendamos manter, ajustar, redesenhar, testar experimentalmente ou retirar. Não confundir recomendação com decisão aprovada.
- Há **conversões espelhadas de todos os pares de atributos**: das 4 propriedades podem ocorrer 12 cópias direcionais e 6 permutas de valores. "Trocar" em textos legados é ambíguo; nas propostas digitais distingue-se **substituição de um número** de **troca bilateral de dois números**.
- **Habilidade proposta pelo autor, texto parcial:** “roube a última carta do meio de reserva de cada adversário”; consta como **AE-048**, aguardando confirmação do trecho cortado ao final da mensagem.
- **Fatores para balanceamento:** custo irreversível do próprio especial, risco para a carta normal, alcance do efeito com 2/3/4 jogadores, zonas afetadas, janela de ativação, direito a contra-ataque e prevenção de cadeias infinitas de recuperação/cópia.
- **Não começar programando os casos perigosos:** vitória automática rara proposta, limpeza do campo com escopo definido, repetição com bloqueio de ciclos e uso forçado combinado com anulação precisam de modelo de prioridade/reação, antes de qualquer decisão final.


## 19. Decisões consolidadas sobre especiais (12/10/2026, tarde)

| Referência histórica | Estado atualizado | Regra funcional |
| --- | --- | --- |
| #12 Pecker | **Texto esclarecido diretamente pelo autor** | Pegue **duas cartas aleatórias do Buraco Negro** e deposite-as **ao fim do seu meio de reserva**. O Buraco Negro é a zona única de descarte. Faltando menos de duas, comportamento ainda a fechar. O usuário não restringiu a cartas normais, portanto não acrescentar esse filtro silenciosamente. |
| #52 Luar Engeal | **Efeito físico original retirado** | Não atribuir a ninguém a habilidade incondicional original dessa carta. Podem existir **outras** habilidades de vitória automática em poucas cartas **raras**, desde que estudadas separadamente. |
| #54 Angia Lux | **Escopo de descarte confirmado** | “Cartas em jogo” = **somente as cartas normais de combate** que os jogadores colocaram na disputa. O efeito NÃO manda cartas especiais preparadas ao Buraco Negro; o descarte de especiais ativadas segue suas próprias regras. A frase “impeça qualquer ataque” ainda exige regras de interação com outros especiais. |
| #62 Anasin | **Repetição permitida sem ciclos** | Repetir efeito de especial pagando o custo, mas proibir autorreferência, repetições de repetições ou sequências ilimitadas. Texto técnico e momento da nova resolução ainda a ratificar. |
| #34 Master Kang | **Manter a peculiaridade multijogador** | Se o texto requer duas pessoas distintas para roubos, o duelo com um único adversário não oferece dois alvos diferentes. **Não inventar roubo duplo do mesmo rival automaticamente.** A impossibilidade de ativar o efeito integral no duelo deve ser apresentada com clareza ao jogador, até adaptação expressa. |
| #40 / #43 | **Permitir efeitos sem vantagem em duelos** | Em partida com dois jogadores, o adversário à esquerda e à direita é a **mesma pessoa**. Se um efeito move recursos desse adversário para ele mesmo, a movimentação resulta em nenhuma alteração líquida. **Não trocar automaticamente o efeito por outro**; o jogador decide se deseja gastar a habilidade assim. |

### 19.1 Ativação voluntária versus ativação forçada

**APROVADO:** o jogador decide **qual** ataque especial que já preparou ativar e **em qual rodada** deseja utilizá-lo. Não se cria um cronograma automático nem uma ordem obrigatória entre suas cartas. Uma habilidade de força como #59 pode consumir **todas** as cartas já preparadas por seu alvo, mesmo se o momento for ruim para ele. Isso pode desperdiçar um especial raro que garantiria vitória num confronto mais importante.

**AINDA PENDENTE:** limite de ativações voluntárias na mesma disputa (uma ou duas); prioridade quando dois ou mais jogadores desejam ativar simultaneamente; fase exata de ativação do especial em relação à revelação das cartas. “A qualquer rodada” não equivale a “em qualquer fase do combate”.

### 19.2 Prevenção de ciclos de repetição (direção aprovada; mecanismos técnicos propostos)

1. A mesma habilidade não pode gerar um novo direito de repetição indefinidamente.
2. Efeito do tipo **repetir/copy** não pode repetir a si próprio nem usar outro **repetir/copy** como alvo para encadear a mesma família.
3. A repetição adicional gerada por uma única ativação é **finita, uma vez**; custos de cartas devem ser pagos integralmente, antes do resultado.
4. Uma carta especial que tenha retornado do Buraco Negro durante uma disputa não pode ser reativada **nessa mesma disputa**.
5. Em todos os casos, a interface mostra quais cartas são alvo válido; se não houver, não deve oferecer uma ativação impossível.

Os cinco itens são uma especificação **proposta para operacionalizar o “impedir ciclos”**, não uma mudança nos textos históricos.

### 19.3 Vitórias automáticas raras, não atribuídas

O autor aceita que **pouquíssimas cartas** possam ter um especial de vitória automática; isso **não restaura** o original da carta física #52. A habilidade nova deve ser identificada separadamente, e o custo de uso antecipado/forçado será relevante ao balanceamento. Como o critério de raridade, o efeito exato e a resposta defensiva ainda não foram fechados, não inventar regra universal de imunidade/cancelamento.

