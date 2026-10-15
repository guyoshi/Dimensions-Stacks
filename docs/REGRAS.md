# Dimensions Stacks — Regras e dinâmica (GDD v1.2)

> **CONSOLIDAÇÃO ATUAL (12/10/2026):** o autor aprovou as **87 cartas com descrições, atributos e habilidades atribuídas**, aceitou **129 habilidades** como catálogo de design (78 equipadas, 51 livres), e ratificou as opções descritas na seção **24**. Avisos anteriores “proposta” em seções históricas são substituídos por essa decisão **somente quanto aos itens que já possuíam opção explícita**. Pendências sem solução continuam abertas. A autoridade operacional está no [contrato para IA](CONTRATO_PARA_IA_IMPLEMENTADORA.md).

> Estado: **rascunho de design**, 12/10/2026. Documenta as regras das fotografias do jogo original e os esclarecimentos do autor. Qualquer regra não inteiramente determinada está identificada como **PENDENTE** ou **PROPOSTA**, nunca tratada como cânone.

## 1. Conceito

Jogo de cartas digital para PC, competitivo e com personagens das diferentes séries de **Dimensões Infinitas**. Cada carta futura receberá seu próprio nome, descrição, atributos e uma habilidade especial temática, de acordo com o cânone literário. **Os nomes, biografias e valores das cartas antigas não serão reaproveitados como base**. As habilidades especiais antigos são referências de design, não habilidades já atribuídas aos novos personagens.

- Modalidades: **2, 3 ou 4 jogadores**, todos contra todos, e **Duplas 2×2** (4 jogadores, assentos alternados A1, B1, A2, B2: o parceiro fica à frente). Regras das duplas em `MODO_DUPLAS_2026-10-14.md`: a carta do parceiro nunca é capturada nem vai ao Buraco Negro; quem fica sem cartas recebe metade das cartas do parceiro (pool da dupla) e só cai se o parceiro também não puder; efeitos hostis dos especiais nunca atingem o parceiro; vence a dupla que eliminar os dois adversários.
- Objetivo: **eliminar todas as cartas disponíveis dos adversários**, incluindo, quando aplicável, o meio de reserva.
- Vitória: último jogador que ainda possui cartas utilizáveis (interpretação operacional proposta; validar quando reservas e efeitos especiais interagem).
- Escopo atual: regras, fluxo, balanceamento, inventário de habilidades e elenco. **Não implementar o jogo nesta fase.**

## 2. Componentes e zonas

1. **Baralho ativo:** pilha ordenada do jogador; a carta do topo é a próxima em combate. Capturas e cartas preservadas vão para o final dessa pilha. Pode aumentar ou diminuir.
2. **Meio de reserva:** cartas restantes distribuídas em partes iguais entre jogadores após a mão/baralho inicial. Não é livremente acessível.
3. **Campo de combate:** 1 carta do topo do baralho ativo por jogador em cada disputa normal.
4. **Área de habilidades especiais:** à esquerda do jogador, comporta **até 2 cartas** preparadas e viradas para baixo.
5. **Buraco Negro:** descarte comum, ordenado pela sequência real dos descartes. Cartas ali não voltam ao jogo sem habilidade especial que permita expressamente.
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
| **Ataque (ATQ)** | Ataque | **Ataque ou Defesa** |
| **Defesa (DEF)** | Defesa | **Ataque ou Defesa** |
| **Inteligência (INT)** | Ataque | **Inteligência ou Velocidade** |
| **Velocidade (VEL)** | Defesa | **Inteligência ou Velocidade** |

O iniciador seleciona **qualquer dos quatro** atributos. Os demais escolhem um atributo do **mesmo par**. Cada jogador utiliza sua **primeira carta do baralho ativo**, sem passar à segunda ou terceira.

A escolha simultânea ou secreta do atributo pelos demais é **PROPOSTA de interface** para evitar vantagem de informação; no manual físico a revelação das cartas ocorre após todas as escolhas.

## 5. Resolução do combate (núcleo original)

1. Todos colocam a carta do topo no campo, virada para baixo.
2. O iniciador escolhe seu atributo; os adversários escolhem atributos legalmente compatíveis.
3. Revelam-se as cartas; compara-se o **valor numérico do atributo escolhido por cada jogador**.
4. Se o maior valor vencedor for um **atributo de ataque**, o vencedor recolhe **as cartas de combate dos adversários** e as coloca no final de seu baralho ativo, incluindo a própria carta que jogou.
5. Se o maior valor vencedor for um **atributo de defesa**, os adversários perdem suas cartas de combate para o **Buraco Negro**; o defensor vencedor preserva sua própria carta no final do seu baralho ativo, mas não captura as outras.
6. Avança o iniciador no sentido horário e repete.

### Empates — sequência confirmada pelo autor (12/10/2026; terceiro critério removido em 15/10/2026)

Quando **dois ou mais valores de atributos individuais empatarem**, aplicar os desempates nesta ordem **aos participantes empatados**:

1. **Maior valor do atributo escolhido no confronto.** Se empatar, prosseguir.
2. **Maior soma dos quatro atributos da carta**: Ataque + Defesa + Inteligência + Velocidade.
3. **Se a soma total também empatar:** empate absoluto — ninguém vence e as cartas voltam aos donos.

**Decisão do autor (15/10/2026):** o antigo terceiro critério (Ataque + Inteligência) deixa de existir. Para que a soma sempre decida, **nenhuma carta do baralho tem o mesmo total de pontos que outra** (diferença mínima de 1 ponto). Só um evento ou especial que altere os atributos pode, em casos raros, igualar duas somas durante a disputa; aí vale o empate absoluto (item 3).

**PENDENTE (agora só para somas alteradas em jogo):** empate absoluto. **PENDENTE:** em confrontos com especiais que envolvem **duas cartas simultâneas**, como somar a totalidade dos atributos para desempate (#09, cuja soma principal já está aprovada). A documentação antiga mencionava um possível empate defensivo especial; a instrução nova de três etapas prevalece na regra geral.

**Animação do desempate (14/10/2026):** quando há desempate, a tela mostra os quatro atributos de cada empatado entrando um a um e somados num total; a soma decide (o segundo desempate foi removido em 15/10/2026); o vencedor é destacado antes do resultado da disputa. Nas simulações o desempate ocorre em cerca de 4% das disputas e quase sempre termina na soma dos quatro atributos.

Para choque de **especiais de imposição de atributo** que empatem no valor usado para impor, **PROPOSTA**: aplicar o mesmo desempate pela soma dos quatro atributos. A aplicação automática à disputa de imposição não foi confirmada expressamente pelo autor, então permanece como proposta.

### Confrontos com 3 ou 4 jogadores

O combate é coletivo: um único iniciador e todos os jogadores ainda ativos participam, com um único maior valor vencedor. A regra geral acima continua aplicável. **PENDENTE:** como processar vencedores empatados e especiais que escolhem 'o adversário à direita/esquerda' quando este estiver eliminado.

## 6. Habilidades especiais (núcleo original)

- Só podem ser usados **a partir da segunda rodada**.
- Antes de uma disputa, o jogador anuncia/prepara uma carta de habilidade especial, colocando-a **virada para baixo à esquerda**.
- É permitido deixar **até 2 cartas** preparadas por jogador.
- Ficam protegidas: não podem ser roubadas nem atacadas por efeitos comuns.
- O jogador pode **virá-las no momento escolhido**, no contexto de combate (o manual descreve a ativação depois da revelação dos atributos).
- A carta preparada fica **comprometida**: não pode ser recolhida voluntariamente para o baralho.
- Depois de utilizada, **vai obrigatoriamente ao Buraco Negro**.
- Habilidades especiais podem expressamente abrir exceções, como recuperar carta do Buraco Negro, retirar da reserva ou afetar cartas de combate.
- 'Aleatório': seleção sem ver o conteúdo. 'À sua escolha': seleção após ver as opções autorizadas.

**REGRA CONFIRMADA PELO AUTOR (12/10/2026):** o jogador pode ativar voluntariamente **no máximo 1 carta especial preparada por combate**, escolhendo qual usar e em qual rodada. **Exceção:** uma habilidade específica pode permitir ativar duas cartas especiais no mesmo combate. **Ativação forçada (#59):** obriga usar todas as especiais já preparadas, até duas, independentemente do limite voluntário. O manual antigo tinha passagens contraditórias; esta decisão posterior prevalece.

**PENDENTE:** se preparar a carta a retira obrigatoriamente do topo do baralho ativo ou de outra zona; se preparar substitui a participação normal daquela carta no turno; prioridade entre jogadores que desejam ativar especiais na mesma janela; limites temporais exatos de reação, escolha de alvo e efeitos que se anulam. **A escolha de qual único especial preparado ativar voluntariamente por combate e em qual rodada pertence ao proprietário**, salvo habilidade que permita dois ou ativação forçada da #59.

**SEQUÊNCIA-BASE APROVADA (pendências operacionais na seção 24):** preparação pré-combate → escolha de atributos → revelação → janela de especiais e possíveis reações defensivas → comparação → resolução de captura/defesa → descarte dos especiais ativados. A intenção confirmada pelo autor é que defesas **possam reagir a ataques enquanto ainda estão pendentes**, inclusive em janelas mais tardias. Ver o [modelo-base aprovado de prioridade](PRIORIDADE_ESPECIAIS_PROPOSTA.md); casos de pré-revelação e ações simultâneas continuam na lista de pendências.

## 7. Meio de reserva

- Quando o baralho ativo de alguém acabar, o jogador compra **até 7 cartas da própria reserva** (decisão do autor em 14/10/2026, igualando o tamanho do baralho ativo inicial; em 13/10/2026 havia sido 6, e o manual anterior dizia 7; simulações mostraram diferença desprezível de duração e de vantagem de iniciativa). **Desde 14/10/2026 o jogador reordena as cartas recém-compradas** antes de elas entrarem no baralho (o bot também as ordena); a ordem da reserva continua aleatória no início da partida. **Iniciativa (14/10/2026):** a iniciativa é sorteada **antes** da montagem dos baralhos, com animação (o destaque percorre os jogadores, desacelera e pisca no sorteado); a tela de montagem mostra a ordem de iniciativa e marca com ★ as posições do baralho em que o jogador inicia.
- Habilidades especiais específicos podem permitir retirar cartas da própria reserva ou da de um adversário.
- **Tamanho padrão e reserva visível (14/10/2026):** o padrão passou a **14 cartas por jogador** (7 no baralho ativo e 7 na reserva); o jogador pode mudar a quantidade ao configurar a partida. O dono pode **ver a própria reserva** (como conjunto, sem ordem, só para consulta) na tela de montagem do baralho e durante a partida; a reserva dos rivais continua só como número. Com 7 cartas na reserva, a primeira compra traz até 6 e a sétima fica para a compra seguinte.
- **PENDENTE:** quando restarem menos de 6 na reserva; reposição durante uma disputa; se o jogador fica temporariamente sem carta de combate; quando se declara eliminação na presença de cartas especiais preparadas.

## 8. Proibições e restrições originais

- Não trocar livremente cartas com a própria reserva ou com outro jogador.
- Não consultar/pular a segunda e demais cartas do baralho ativo para jogar uma posterior.
- Não usar atributos fora do par Ataque/Defesa ou Inteligência/Velocidade.
- Não recuperar habilidades especiais preparados sem regra expressa.
- Não roubar cartas já colocadas no campo de combate, **salvo efeito de carta explicitamente autorizado**.

## 9. Identidade visual aprovada para a versão PC (12/10/2026)

**Decisão definitiva do autor para a cor-base por série, não por heroísmo/vilania:**

| Série de origem | Cor aprovada | Marca na carta |
| --- | --- | --- |
| Viajantes Dimensionais | **Azul** | VIAJANTES |
| Mistério Oculto | **Vermelha** | MISTÉRIO OCULTO |
| Ciclo de Jesed | **Amarela** | JESED |
| Édelin Lys | **Verde** | ÉDELIN LYS |
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

Documentos complementares: [Habilidades especiais](BIBLIOTECA_ATAQUES_ESPECIAIS.md) · [Elenco candidato](ELENCO_CANDIDATO.md).


## 13. Esclarecimento do autor sobre custo de especiais (12/10/2026)

**Confirmação:** a **habilidade especial utilizada vai ao Buraco Negro**; a carta **normal de combate** não recebe proteção extra por esse uso. Se vencer, seguirá a regra normal (inclusive indo ao fim do baralho quando apropriado); se perder, pode ser capturada ou descartada conforme a resolução. Obrigar a mesa ao mesmo atributo **não garante vitória**. Portanto, custo da carta especial e possibilidade de derrota da carta comum devem ser contabilizados antes de classificar uma habilidade como excessiva.

**Decisão editorial visual confirmada:** o autor aprovou **cores por série**, deixando de associar verde a heróis e vermelho a vilões. Selos identificam A União e raridade sem duplicar obrigatoriamente personagens.

**Filiação oficial de A União:** Bruno Lins Lee, Brenda, Hyde, Releuz (provisório), Jasmey Badrock, Mark Polar (também grafado Pollar em registros antigos), Édelin Lys; Jennifer ingressa futuramente. Hyde é a cabeça/liderança indicada para o grupo; **identidade do fundador ainda não fechada**. Ver [elenco candidato](ELENCO_CANDIDATO.md#7-a-união--filiação-oficial-sem-duplicar-cartas).

## 14. Decisões confirmadas: especiais 09 e 59 e choque de atributos (12/10/2026)

### 14.1 Habilidade especial 09 — duas cartas somadas

**APROVADO:** ao ativar o especial, o jogador usa **duas cartas consecutivas do topo de seu baralho ativo**, somando o valor **do mesmo atributo escolhido em ambas** para produzir **um único total no confronto**. A razão estratégica original é permitir que uma primeira carta fraca ganhe força com a segunda. **Há um custo real:** consome-se uma carta de habilidade especial (que vai ao Buraco Negro) e duas cartas normais ficam comprometidas com a disputa, em vez de uma. Não substituir automaticamente por “pegar o maior dos dois valores”, nem aplicar teto de soma sem testes.

**PROPOSTA operacional até confirmação:** as duas cartas normais seguem juntas o desfecho do combate: se a dupla vence atacando, ambas retornam ao final do baralho ativo do vencedor junto das cartas capturadas; se vence defendendo, ambas retornam ao final de seu baralho ativo; se perde, ambas são capturadas ou descartadas segundo a regra comum. **PENDENTE:** quando só há uma carta ativa e menos de duas disponíveis para formar a dupla; desempate com duas cartas e forma de calcular a soma de todos os atributos (se aplicável).

### 14.2 Habilidade especial 59 — ativação forçada

**APROVADO:** obriga um adversário a usar uma carta de habilidade especial **somente se ela já estiver preparada na área de especiais à esquerda (virada para baixo, esperando ativação)**. Não obriga tirar uma carta nova do baralho ou da reserva. A carta forçada é ativada e descartada como qualquer especial utilizado.

**APROVADO (12/10/2026):** deve **usar todas as cartas especiais que já estiverem preparadas na sua área à esquerda**, até duas. O autor usou a expressão 'todas em mãos'; em conjunto com a decisão anterior, isso significa as cartas **já disponíveis/preparadas para ativação**, não cartas ainda escondidas no baralho ativo ou na reserva. **PENDENTE:** como resolver a ordem de ativação das duas, escolhas de alvo internas e eventual janela de resposta.

### 14.3 Choque de imposições de atributos

**APROVADO:** quando dois jogadores ativam especiais que impõem **atributos diferentes** (por exemplo, Ataque e Inteligência) no mesmo combate, compara-se **o valor de cada atributo imposto na carta normal de combate de quem o impôs**. **O maior valor determina o atributo obrigatório para todos os jogadores naquela disputa**.

**Exemplo:** jogador A impõe Ataque e sua carta normal possui Ataque 91; jogador B impõe Inteligência e a sua carta normal tem Inteligência 82. **Ataque vence a disputa de imposição**. Todos jogam em Ataque, inclusive o jogador B. Os dois especiais ativados são descartados no Buraco Negro, conforme a regra geral.

A disputa de imposição **não é a resolução do combate**: depois dela, todos ainda comparam seus valores no atributo vencedor, e a carta comum pode ganhar ou perder normalmente.

**PENDENTE:** empate exato entre valores de imposição (propõe-se aplicar a ordem de desempate geral desta seção), conflito com 3 ou mais especiais diferentes (viável com 3/4 jogadores ou duplas se aprovadas), e interação com efeitos que modificam atributos antes da imposição.

### 14.4 Convenção de nomeação e identidade (aprovada)

- A identidade visual **usa cores por série**, não herói versus vilão.
- Integrantes de A União **recebem um selo** sem carta duplicada obrigatória.
- A série de Édelin terá **numeração B, de Belfex**; o título ainda está em desenvolvimento.
- No conjunto de cartas de Ciclo de Jesed, a identidade da carta deve ser **Mark Polar**. **Karesis é Mark** segundo o autor e não deve surgir como carta única adicional. O alias Loutes não aparece no nome exibido.


## 15. Transcrição direta de habilidades especiais recuperados (12/10/2026, 14:20–14:22)

O autor transcreveu **23 cartas físicas distintas**, consideradas fonte de texto original mais confiável do que a leitura anterior de fotos. Ver [lista com textos literais e auditoria individual](TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md). Não aplicar automaticamente os nomes e as classificações cromáticas antigas às cartas novas.

Destaques para especificação futura:

1. **#06 — Mark Pollar (nome antigo na carta):** *Ganhe a carta que o inimigo usou na habilidade especial.* Isso se refere a especial **já utilizado**, não a carta esperando preparada. Definir destino da carta ganha e a interação excepcional com o descarte.
2. **#18 — Ricochett Bombargue:** *Inverta os papéis de vencedor e perdedor uma vez.* Em combate com mais de dois jogadores, definir explicitamente a correspondência de vários perdedores com o vencedor único. Não enfraquecer o efeito antes da regra operacional/testes.
3. **#19 — Sagrado Senhor da Morte:** *Sacrifique uma carta com algum status acima de 90 em troca das três primeiras cartas do Baralho Negro.* **TERMO CORRIGIDO PELO AUTOR:** trata-se do **Buraco Negro**; não existe indicação de uma segunda zona chamada 'Baralho Negro'. Definir quem escolhe a carta sacrificada, a zona de destino, e se os três itens podem incluir especiais.
4. **#24 — Primus Tenesy:** *Jogue duas cartas, uma em Inteligência e outra em Poder.* Exceção intencional ao par normal ataque/defesa; **RETIRADO DO JOGO:** especial #24 removido por decisão do autor, preservado somente como registro histórico.
5. **#27 — Kiw Tenesy:** *Adicione 15 de Defesa e 20 de Velocidade a uma carta.* Definir duração e zona válida; não presumir bônus permanente.
6. **#34 — Master Kang:** *Roube duas cartas, uma de cada jogador.* Com dois jogadores não há dois adversários. **PENDENTE:** versão de duelo ou restrição de uso.
7. **#35 — Cap. Zoddie:** *Troque os maços de reserva dos jogadores, da esquerda para a direita, começando por você.* Diferenciar da troca apenas com a esquerda (#46) e definir rotação simultânea da mesa.
8. **#36 — Luna Stellar:** *Veja suas cartas do monte de reserva e separe 7 para usar na ordem.* Definir onde entram essas 7 e como proceder quando restarem menos de 6 na reserva.
9. **#59 — William McCroys:** *Obrigue um jogador a usar suas cartas de habilidade especial nessa rodada.* **Já confirmado:** somente as cartas especiais preparadas na mesa podem ser forçadas; **APROVADO:** todas as cartas especiais já preparadas devem ser usadas; ordem e alvos individuais ainda pendentes.
10. **#60 e #61:** as condições literais se referem a carta **azul** e carta **vermelha**. As cores do jogo digital identificarão séries, não União ou vilania. **PENDENTE:** identificar a carta-alvo e aprovar uma nova condição funcional sem alterar silenciosamente as regras antigas.

**Separação metodológica:** texto transcrito é a fonte original, o que o autor confirmou é a decisão do GDD; aplicações concretas ainda não definidas são hipóteses de design e devem ficar rotuladas **PENDENTE** ou **PROPOSTA**.


## 16. Decisões subsequentes — retirada, terminologia e desempates (12/10/2026)

- **Especial #18 (Ricochett Bombargue): RETIRADO** do conjunto de habilidades especiais previstos para o jogo de PC. O texto físico permanece preservado no arquivo histórico, sem efeitos ativos.
- **Especial #24 (Primus Tenesy): RETIRADO** do conjunto de habilidades especiais previstos para PC. A carta física continua documentada, mas a mecânica não deve ser replicada.
- **Especial #19 (Sagrado Senhor da Morte):** o autor confirmou que **'Baralho Negro' significa Buraco Negro**. Usar apenas **Buraco Negro** na documentação funcional; preservar nota de divergência com a transcrição anterior. A regra de sacrificar uma carta com atributo superior a 90 em troca das três primeiras do Buraco Negro continua disponível para análise.
- **Especial #59 (William McCroys):** obriga o jogador escolhido a **usar todas as cartas de habilidade especial que já tiver preparado à esquerda na mesa**, no máximo duas. A formulação nova 'todas em mãos' **não autoriza puxar cartas não preparadas de outras zonas**.
- **Desempate geral:** valor individual → soma dos quatro atributos (o terceiro critério, Poder + Inteligência, foi removido em 15/10/2026). Empate persistente depois da soma: as cartas voltam aos donos.
- **Leituras por IA de outras cartas:** registrar como **provisórias**, nunca como texto confirmado. Consultar LEITURAS_IA_PENDENTES_2026-10-12.md.


## 17. Inventário ampliado e novas questões mecânicas (12/10/2026)

**Atualização de numeração:** 59 dos possíveis 62 números de cartas físicas identificados; faltam **16, 26 e 55**. Identificações oficiais adicionais fornecidas pelo autor: **03 Édelin, 05 Brenda, 08 Breno, 39 Capitã Nastácia**. Essas quatro cartas continuam com habilidades especiais **não recuperados**. Ver [inventário principal](BIBLIOTECA_ATAQUES_ESPECIAIS.md) e tabela de leituras ainda provisórias.

### Efeitos recentemente ampliados (origem: texto reconstruído por IA e fornecido pelo autor)

**NÃO APROVADOS AUTOMATICAMENTE PARA O JOGO NOVO.** Estes textos representam o acervo original reconstruído, e seu funcionamento digital ainda precisa ser desenhado e, quando necessário, confirmado.

- **#20 Agente Sete —** trocar o valor de Defesa pela Inteligência da própria carta. **PENDENTE:** a redação indica troca/substituição, não está claro se intercambia ambos os números ou copia apenas um, e qual efeito nos pares legais.
- **#37 D. Lesort —** cada jogador envia uma carta aleatória ao Buraco Negro. **PENDENTE:** de qual zona sai a carta, se o próprio ativador participa e quando ocorre o descarte.
- **#47 Kate Fira —** carta de defesa que impede todos as habilidades especiais do turno. **PENDENTE:** prioridade contra especiais já iniciados e relação com #59 que força múltiplas ativações.
- **#49 Temi Lokat —** carta de defesa que impede o rival de vencer neste turno. **PENDENTE:** se impede derrota do usuário apenas ou impede vitória do alvo, e como funciona em 3–4 jogadores.
- **#50 Raum Cedar —** obriga cada jogador a descartar uma carta aleatória ao Buraco Negro. **PENDENTE:** fragmento de início perdido depois de “CARTA ATAQUE...”; aparentemente semelhante a #37, verificar se são duplicados ou têm tempos diferentes.
- **#52 Luar Engeal — RETIRADO:** não usar a habilidade física original no novo catálogo. **Outra possibilidade, independente e ainda candidata:** algumas cartas raras podem possuir vitória automática; o custo de gastar o especial antecipadamente por ativação forçada #59 é um contrajogo importante. Não considerar a raridade ou esse contrajogo uma regra que garante equilíbrio sem testes.
- **#62 Anasin —** repetir uma habilidade pagando duas cartas escolhidas. **DECISÃO DO AUTOR:** impedir ciclos de repetição. **Especificação de segurança proposta:** não repetir o próprio especial 62 nem outro especial de repetição/cópia em cadeia; resolver no máximo uma repetição por ativação; bloquear reativação de efeitos ressuscitados na mesma disputa. Janela e cartas elegíveis ainda requerem definição.

### Riscos transversais a estudar

1. **Ataques defensivos não são iguais:** #31 anula o turno só para o jogador; #32 impede perda, #47 anula especiais, #48 bloqueia ataques dirigidos ao usuário, #49 impede rival de vencer. São hipóteses de interpretação diferentes e não devem ser fundidas sem teste.
2. **Efeitos de vitória forçada e proteção total:** o antigo #52 foi retirado. Candidatos raros novos e a proteção/eliminações do #54 precisam de regras de prioridade e reação, sobretudo em partidas com quatro jogadores. **#54 afeta somente as cartas normais colocadas em combate**, não cartas especiais preparadas.
3. **Especial repetido** (#62) tem custo alto (duas cartas), e o autor determinou **não permitir ciclos infinitos**. Não repetir a própria repetição, não encadear cópias/repetições sem limite nem reativar na mesma disputa cartas retornadas do Buraco Negro.
4. **Itens identificados vs. elenco definitivo:** #03 Édelin é um número da carta de infância, não substitui o código B01 da carta digital. Nenhuma atribuição de habilidade à personagem do novo elenco está aprovada por mera coincidência de nome físico.
5. **Ativação voluntária:** no máximo **uma carta especial preparada por combate**, à escolha do jogador, salvo se outra habilidade **explicitamente** autorizar duas. O #59 força usar **todas** as especiais já preparadas, até duas. A escolha de rodada permanece livre para o dono, e as questões de janela/prioridade entre jogadores continuam pendentes.


## 18. Biblioteca estratégica desacoplada do elenco (12/10/2026)

- O autor **não reutilizará os nomes, atributos e descrições** das cartas físicas antigas. Elas servem **somente como fonte de inspiração mecânica**. Os **87 personagens candidatos** das séries serão distribuídos posteriormente.
- A [biblioteca de **138 Habilidades Especiais**](BIBLIOTECA_ATAQUES_ESPECIAIS.md) foi ratificada: **102 IDs equipados em 102 cartas (um por carta)** e **40 reservados para expansão**. Esta frase atualiza a situação da biblioteca descrita nesta etapa histórica.
- A auditoria de **62 posições do baralho físico** registra, para cada habilidade identificada, se recomendamos manter, ajustar, redesenhar, testar experimentalmente ou retirar. Não confundir recomendação com decisão aprovada.
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

**APROVADO:** o jogador decide **qual** habilidade especial que já preparou ativar e **em qual rodada** deseja utilizá-lo. Não se cria um cronograma automático nem uma ordem obrigatória entre suas cartas. Uma habilidade de força como #59 pode consumir **todas** as cartas já preparadas por seu alvo, mesmo se o momento for ruim para ele. Isso pode desperdiçar um especial raro que garantiria vitória num confronto mais importante.

**LIMITAÇÃO VOLUNTÁRIA APROVADA:** **uma especial preparada por combate**, salvo autorização explícita de uma habilidade para usar duas. **A ativação forçada #59 é exceção:** o alvo usa todas as que já preparou (no máximo duas). **AINDA PENDENTE:** prioridade quando jogadores diferentes solicitarem ativações na mesma janela e fase exata da ativação perante a revelação; “em qualquer rodada” não significa “em qualquer momento do combate”.

### 19.2 Prevenção de ciclos de repetição (direção aprovada; mecanismos técnicos propostos)

1. A mesma habilidade não pode gerar um novo direito de repetição indefinidamente.
2. Efeito do tipo **repetir/copy** não pode repetir a si próprio nem usar outro **repetir/copy** como alvo para encadear a mesma família.
3. A repetição adicional gerada por uma única ativação é **finita, uma vez**; custos de cartas devem ser pagos integralmente, antes do resultado.
4. Uma carta especial que tenha retornado do Buraco Negro durante uma disputa não pode ser reativada **nessa mesma disputa**.
5. Em todos os casos, a interface mostra quais cartas são alvo válido; se não houver, não deve oferecer uma ativação impossível.

Os cinco itens são uma especificação **proposta para operacionalizar o “impedir ciclos”**, não uma mudança nos textos históricos.

### 19.3 Vitórias automáticas raras (histórico; AE-129 já atribuído a S01)

O autor aceita que **pouquíssimas cartas** possam ter um especial de vitória automática; isso **não restaura** o original da carta física #52. A habilidade nova deve ser identificada separadamente, e o custo de uso antecipado/forçado será relevante ao balanceamento. Como o critério de raridade, o efeito exato e a resposta defensiva ainda não foram fechados, não inventar regra universal de imunidade/cancelamento.



## 20. Limite de especiais voluntários por combate — decisão oficial (12/10/2026)

**CONFIRMADO PELO AUTOR:** a regra geral permite **ativar voluntariamente uma carta de habilidade especial preparada por combate**. O jogador escolhe qual carta entre as até duas preparadas deseja usar e escolhe em que rodada utilizá-la; não precisa usar um especial em todas as rodadas.

**Exceções específicas:**

1. Uma habilidade cujo texto **explicitamente permita ativar duas cartas especiais no mesmo combate** pode superar o limite normal. Ainda será necessário criar/aprovar o texto e o custo das habilidades que concederem essa exceção.
2. **AE-111 / especial antigo #59 (ativação forçada):** se outro jogador for obrigado a ativar seus especiais preparados, deverá usar **todos os que possuir preparados (até dois)** naquele confronto, mesmo ultrapassando a ativação voluntária normal. Não permite puxar cartas não preparadas.
3. *(Retirado em 14/10/2026: AE-112, o especial de repetição, deixou de existir.)*

**Exemplo:** um jogador guarda dois especiais preparados, A e B. Numa disputa, pode voluntariamente usar A **ou** B; o outro continua preparado. Poderá usar o restante numa rodada posterior. Somente um efeito específico de ativação dupla ou a imposição de #59 poderá fazê-lo consumir ambos na mesma disputa.

**PENDENTES DISTINTOS:** a ordem de resolução quando diferentes jogadores tentarem ativar efeitos, as janelas exatas de ativação e as condições de uma futura habilidade de ativação dupla. Não confundir *escolher a rodada* com prioridade absoluta ou interrupção em qualquer fase.


## 21. Terminologia de cartas, reações e conjunto de fichas (12/10/2026)

### 21.1 Nome dos quatro atributos: confirmado

O autor **aprovou trocar o nome antigo Poder por Ataque**, com sigla **ATQ**. As outras propriedades permanecem **Defesa (DEF), Inteligência (INT) e Velocidade (VEL)**. As duplas de confronto são **ATQ/DEF** e **INT/VEL**. ATQ e INT são ofensivos, DEF e VEL defensivos. O primeiro desempate continua a soma dos quatro; o segundo é **ATQ + INT**. **Documentos históricos preservam a palavra Poder como transcrição do jogo de infância**, não como nome válido na interface nova.

**Escala de 0 a 100 para atributos naturais** está **recomendada**, com bônus temporários que podem ultrapassar 100, mas ainda será validada visualmente e em testes de balanceamento.

### 21.2 “Habilidade Especial” ou “Habilidade Especial”? (APROVADO na seção 24)

Como algumas cartas **protegem, anulam ou respondem a outras**, recomendo que o termo guarda-chuva seja **Habilidade Especial** (ou o botão curto **Especial / ESP**). As habilidades ganhariam classificações apenas editoriais, como **Ataque, Defesa, Controle, Recuperação ou Coringa**. **Habilidade Especial foi aprovada** como nome na interface; o nome antigo continua registrado em materiais históricos.

### 21.3 Reações defensivas: modelo ratificado na seção 24

**Intenção do autor confirmada:** as **habilidades especiais defensivas devem poder ser utilizadas em reação aos ataques adversários em qualquer oportunidade útil do combate**, porque precisam impedir o ataque **antes que ele se conclua**. Não são obrigadas a ser ativadas junto dos ataques ofensivos. A ativação por reação **não cria um segundo uso voluntário gratuito** quando o jogador já gastou sua única especial do combate.

**Mecanismo-base aprovado posteriormente:** janelas de reação pré-resolução, pilha de efeitos e oportunidade de interromper antes de descartar/capturar. Consultar [PRIORIDADE_ESPECIAIS_PROPOSTA.md](PRIORIDADE_ESPECIAIS_PROPOSTA.md). **Não concluir retrospectivamente ações já resolvidas**; voltar uma carta capturada por anulação posterior quebraria as zonas e o histórico.

### 21.4 Novo especial AE-130 (aprovado e atribuído a M02)

**AE-130 — Anular a última habilidade:** o autor solicitou uma habilidade para **anular o último especial jogado**. Proposta de texto técnico: “**REAÇÃO: anule a última habilidade especial que esteja pendente de resolução. A carta anulada vai ao Buraco Negro normalmente. Não desfaça efeitos já resolvidos.**” Esse é um novo ID da [biblioteca de 129 habilidades candidatas](BIBLIOTECA_ATAQUES_ESPECIAIS.md). O texto da AE-130 está aprovado; a janela-base de reação também, e apenas casos-limite permanecem pendentes.

### 21.5 Fichas de personagens e balanceamento (APROVADAS para o jogo; não são cânone)

Foram elaboradas **87 sugestões de fichas**, com descrições de **até 120 caracteres**, perfis numéricos propositalmente variados, habilidades sugeridas e sinalização de fonte/risco de extrapolação: [CARTAS_87_PROPOSTAS.md](CARTAS_E_ESPECIAIS.md). O autor pediu diferenças importantes de força, incluindo cartas fracas mas negociáveis por efeitos de troca, especialistas e cartas de elite.

**Os oito membros presentes ou futuros de A União** receberam habilidades candidatas de grande impacto: essa é a **diretriz de design solicitada pelo autor**, não a aprovação dos números e AE individuais. **Todos os valores, descrições e AE distribuídos foram aprovados pelo autor** como cartas do jogo. Revisar separadamente a documentação literária dos personagens pouco descritos; não alterar números por conta própria.

**Fonte única de autorização para IA implementadora:** [CONTRATO_PARA_IA_IMPLEMENTADORA.md](CONTRATO_PARA_IA_IMPLEMENTADORA.md). Qualquer decisão ali marcada `PROPOSTA` não pode ser promovida silenciosamente a regra aprovada.

## 22. Ampliação histórica 79 → 83 cartas (a coleção atual aprovada contém 87)

O autor incluiu 4 personagens da primeira aventura: **V16 Facka** (o manuscrito escreve **Faka**), **V17 Lanigiah** (**rainha das Aracnas**), **V18 Grande Pai Gaia** (líder dos Obbs de Pinesoto) e **V19 Seti** (líder de guerra Obb que, após desconfiança inicial, ajuda os irmãos). Total do conjunto candidato passou de 79 para **83 personagens**, sendo **19 de Viajantes Dimensionais**. As fichas [CARTAS_87_PROPOSTAS.md](CARTAS_E_ESPECIAIS.md) **foram aprovadas posteriormente**, e a biblioteca contém **129 habilidades** com 78 equipadas. Esta seção registra o momento anterior à inclusão Carnam. A União continua com os mesmos 8 integrantes/futura integrante anteriormente informados.

## 23. Inclusão de quatro integrantes da Família Carnam — total atual 87

**Decisão de inclusão do autor:** o núcleo pretendido é a **Família Carnam do primeiro volume de Diário Sobrenatural**, não a família dos Lins de Viajantes Dimensionais. O documento canônico do Livro 1 identifica seis integrantes associados aos espíritos/Elos: **Carnam, Isabela, avó, Ingrid, Suéten, Ibliso (cão)**. **D07 Ingrid Carnam** e **D13 Suéten** já constavam do baralho. **Quatro cartas candidatas novas: D15 Carnam (pai), D16 Isabela, D17 Avó Carnam e D18 Ibliso (cão)**. *A avó Carnam não é D10 Avó de Kelly.*

Elos documentados: **Carnam: arma ligada ao pai de Vini; Isabela: álbum de fotografias; Avó: lente dos óculos; Ingrid: ursinho; Suéten: relógio; Ibliso: coleira**. A documentação de Elos tem status *misto*, embora os seis nomes sejam informados no documento canônico de personagens. **Não declarar que o pai de Vini é Carnam.**

**Total atualizado: 87 cartas candidatas**, das quais **18 de Diário Sobrenatural**. As descrições, valores e habilidades das quatro novas cartas constam da tabela [CARTAS_87_PROPOSTAS.md](CARTAS_E_ESPECIAIS.md) e **foram aprovadas posteriormente pelo autor**. A biblioteca segue com **129 habilidades**, 78 equipadas em 87 cartas aprovadas.

## 24. Ratificação do baralho e da biblioteca (decisão final do autor: “Aprove tudo”, 12/10/2026)

**APROVADO:** **87 cartas** com nomes/IDs, descrições, valores naturais e uma habilidade especial atribuída a cada uma. **APROVADA** a escala natural **0–100**, as siglas **ATQ/DEF/INT/VEL** e o limite editorial de **120 caracteres** para a descrição curta; bônus temporários de habilidades podem ultrapassar 100. A União conserva habilidades estratégicas marcantes. O catálogo contém **129 IDs de habilidades** aceitos como repertório, **78 equipados no baralho atual** (algumas habilidades repetidas em personagens diferentes) e **51 não equipados**, aguardando novas cartas.

**TERMINOLOGIA APROVADA:** usar **Habilidade Especial** (também “Especial”, sigla **ESP**) como nome guarda-chuva da interface; as habilidades podem atacar, defender, controlar, recuperar e agir como coringa. “Habilidade Especial” é o nome histórico das cartas antigas.

**CONFIGURAÇÃO INICIAL APROVADA PARA TESTES:** distribuir **18 cartas a cada jogador**, sendo **7 no baralho ativo** e **11 na reserva**, em partidas com 2–4 jogadores. Quantidades na partida: **36, 54 e 72** respectivamente. A coleção tem 87 cartas; **como sortear/selecionar as cartas da coleção sem viés permanece PENDENTE**. O baralho de 18 é ponto de partida autorizado, não afirmação de duração equilibrada.

**PRIORIDADE E DEFESA APROVADAS COMO MODELO:** prioridade circular a partir do iniciador em sentido horário; quando uma especial é jogada, uma defesa pode ser ativada **em resposta enquanto o efeito ainda está pendente**, entrando antes dele na pilha (resolução inversa, última a entrar é a primeira a resolver). Uma defesa pode reagir antes da captura/descarte normal se seu texto permitir. Depois de resolvido o efeito, não existe cancelamento retroativo. **Passar não consome especial.** Uma especial defensiva ativada voluntariamente **consome o único uso voluntário normal do combate**, salvo permissão explícita para uma segunda. **AE-130** anula **a última habilidade especial pendente** e não devolve a carta especial anulada. **AE-111** força todas as especiais preparadas até duas.

**EXCLUSÕES PRESERVADAS:** antigos efeitos físicos **#18, #24 e #52** retirados; **AE-104** aposentado. O novo **AE-129 Triunfo Raro** não é o antigo #52 e foi aprovado **para S01 Jasmey Badrock**, sem eliminar testes de raridade, reações e equilíbrio. A habilidade de ruína **AE-103** afeta somente **cartas normais do campo de combate**, não especiais preparadas.

**ORIGEM POR SÉRIE:** Ciclo de Jesed 23 (amarelo), Viajantes 19 (azul), Spacetheft 14 (preto), Diário Sobrenatural 18 (roxo), Mistério Oculto 12 (vermelho), Belfex/Édelin 1 (verde). **A União** é apenas selo sobre a cor própria, sem duplicação de cartas.

**PENDÊNCIAS NÃO RESOLVIDAS PELA APROVAÇÃO GENÉRICA:** como preparar exatamente cartas especiais; a janela pré-revelação exigida por certos textos; a ordem de duas ativações forçadas pela AE-111; destino das duas cartas normais do especial duplo AE-010; empate absoluto após os três critérios; tratamento de alvos/zonas com cartas insuficientes; distribuição justa das 87 cartas; tempo de reação para partidas online; testes de raridade e balanceamento. Estes comportamentos **não podem ser inventados** por outra IA.

**FONTES OFICIAIS PARA CÓDIGO:** [cartas_87.json](../dados/oficial/cartas_87.json), [habilidades_129.json](../dados/oficial/habilidades_129.json) e [contrato para IA implementadora](CONTRATO_PARA_IA_IMPLEMENTADORA.md). A [tabela de 87 cartas](CARTAS_E_ESPECIAIS.md) tem nome histórico mas **conteúdo aprovado**. Cartas físicas antigas permanecem somente referências.

## Janela de reação (13/10/2026, autorizada pelo autor)

**Problema:** um especial que responde a especiais dos rivais (anular, copiar, apropriar, proteger) era decidido às cegas e podia ser gasto em vão.

**Regra:** a janela de especiais passa a ter duas etapas.
1. **Especiais normais** (e de controle): secretos, virados juntos, como antes.
2. **Janela de reação:** só abre se **algum rival virou um especial**. Quem tem um **especial reativo** utilizável decide **sabendo o que foi virado**. As escolhas dos reagentes são **secretas e simultâneas** (um reativo não reage a outro reativo). Vale o limite de **um especial por jogador** (companheiras como antes).

Depois disso, todos os efeitos resolvem na ordem de fases de sempre (blindagem → anulações → proteções → principais → cópias → ajustes finais).

**Especiais reativos (13):** AE-073 Silêncio, AE-074 Imunidade pessoal, AE-076 Guardião do baralho, AE-077 Guardião da reserva, AE-078 Reflexo de roubo, AE-079 Escudo antecipado, AE-080 Anular modificador, AE-113 Interrupção precisa, AE-114 Desvio de alvo, AE-115 Eco, AE-116 Apropriar, AE-120 Remover alteração, AE-130 Anular a última habilidade. AE-118 Blindagem **não** é reativo: protege o próprio especial e é declarado junto com ele, como companheira.

## Nomenclatura dos atributos (13/10/2026, autorizada pelo autor)

Os atributos **Ataque** e **Defesa** passam a se chamar **Força (FOR)** e **Resistência (RES)**; **Inteligência (INT)** e **Velocidade (VEL)** não mudam. O objetivo é não confundir o atributo com o **tipo de vitória**: vencer com Força ou Inteligência é vencer **atacando** (captura as cartas); vencer com Resistência ou Velocidade é vencer **defendendo** (as cartas dos perdedores vão ao Buraco Negro). Regras e números não mudam. Onde este documento (histórico) diz "Ataque" ou "Defesa" como atributo, leia Força ou Resistência. Nos dados, as chaves `ATQ`/`DEF` viraram `FOR`/`RES`.

Os especiais de **tipo** mantêm o nome: Ataque obrigatório, Defesa obrigatória, Forçar/Proibir ataque ou defesa rival, Ataque que bane, Defesa que captura e Ataque em dupla.

## Sem especiais repetidos (13/10/2026, autorizada pelo autor)

Cada carta tem um especial diferente (102 cartas, 102 especiais). As 20 cartas que repetiam especial receberam especiais antes sem carta; a lista está em `docs/CARTAS_E_ESPECIAIS.md` e no campo `revisao_13_10_2026_especiais_repetidos` de `dados/oficial/cartas_87.json`.

## Par forte (13/10/2026, autorizada pelo autor)

Fora de A União, nenhuma carta é forte nos dois pares de atributos (FOR/RES e INT/VEL): o par fraco fica com no máximo 70. Detalhes e lista em `docs/BALANCEAMENTO_GERAL_2026-10-13.md`.

## Fenômenos dimensionais (14/10/2026, aprovados pelo autor)
Eventos de rodada, opcionais (ligar/desligar na configuração da partida, solo e online; padrão: ligados). O primeiro fenômeno cai entre as Rodadas 2 e 4; depois, o intervalo até o próximo é de 2, 3 ou 4 rodadas (chance igual: 1/3 "uma com, uma sem, uma com"; 1/3 "uma com, duas sem"; 1/3 "uma com, três sem"). Média: 1 rodada em cada 3 tem fenômeno; nunca em rodadas seguidas; nunca o mesmo tipo duas vezes seguidas. Ajustado em 14/10/2026 a pedido do autor (antes: 30% de chance por rodada, sem regra de intervalo). Sorteio determinístico pela semente da partida. A faixa no topo mostra a rodada atual e as 2 próximas (com o nome do fenômeno, se houver); toque abre a explicação. Na 1ª vez que cada fenômeno aparece, uma caixa explica. Cada fenômeno tem animação de tela própria.

| Fenômeno | Efeito |
|---|---|
| Maré de Força | Todas as cartas ganham +10 em Força na rodada. |
| Névoa Mental | Todas ganham +10 em Inteligência e −10 em Velocidade. |
| Eco dos Especiais | Bônus e reduções de especiais valem o dobro (exceto Conversão/Permuta). |
| Batalha Aberta | Todos escolhem qualquer atributo (não só o par do iniciador); ataque vencedor captura, defesa vencedora manda as demais ao Buraco Negro. |
| Tempestade Lateral | Antes de cada disputa da rodada (antes de qualquer escolha), a carta do topo de cada jogador passa para a direita ou para a esquerda (sorteado a cada disputa), e ele joga com a que recebe. (Alterado em 15/10/2026: antes só na 1ª disputa e sempre à direita.) |
| Maré do Buraco Negro | A cada disputa da rodada, quem está por último em cartas (recalculado a cada disputa; em duplas conta a dupla) recebe 1 carta normal do Buraco Negro; com 2 jogadores, 2 cartas por disputa. Total na rodada: 4 (4 jogadores), 3 (3 jogadores), 4 (2 jogadores). Empate geral ou Buraco vazio: ninguém recebe. No máx. uma vez por partida, a partir da Rodada 3. (Alterado em 15/10/2026, pedido do autor; antes eram 2 cartas de uma vez no início da rodada.) |
| Correnteza | Todas as cartas ganham +10 em Velocidade e perdem 5 em Força, Defesa e Inteligência. (Novo, 15/10/2026.) |
| Muralha Dimensional | A Defesa de cada carta passa a valer a média entre a sua Defesa e o seu maior atributo (arredondada para cima); quem já tem a Defesa como maior atributo não muda. (Novo, 15/10/2026.) |
| Eclipse | O maior atributo de cada carta vale 0 (marcado com ✕ na carta). Mantido em 0 por ter mais impacto (testado −30 em 15/10/2026: mesmo equilíbrio, menos dramático). |
| Mundo ao Avesso | Vence o MENOR valor (margem e desempates invertidos). Peso 2 (mais frequente). |
| Troca Dimensional | Dois atributos de cada carta trocam de valor; o par é sorteado e mostrado na animação. |
| Bloqueio Dimensional | (Novo, 15/10/2026, pedido do autor.) A cada **disputa** da rodada um atributo é sorteado e fica bloqueado: aparece com ✕ na tela de escolha e ninguém (nem os bots) pode escolhê-lo; o iniciador escolhe entre os 3 restantes e os demais ficam no par dele (se o parceiro do par estiver bloqueado, só resta o atributo do iniciador). O bloqueado muda a cada disputa (nunca o mesmo da disputa anterior). Se um especial impuser um atributo universal, o especial prevalece sobre o bloqueio. Peso 1. |

Pesos de sorteio (15/10/2026): todos 1, exceto Mundo ao Avesso 2 (mais frequente), Eclipse 0,5 e Correnteza 0,5 (mais raros: encurtam a partida e aumentam a sorte). Cerca de 1 evento a cada 3 rodadas; nunca o mesmo duas vezes seguidas.

Os efeitos de atributo entram na base da carta (não são anulados por especiais que removem modificadores). "Iniciativa Livre" foi descartada pelo autor.

## Reconexão e entrada em partida em andamento (14/10/2026)
- Queda de conexão: 25 s de espera (indicador amarelo no assento); depois uma CPU assume. Quem caiu volta ao próprio lugar entrando de novo na mesma sala (reconhecido pelo perfil ou pelo nome): mantém o baralho que a CPU deixou.
- Entrada de pessoa nova: o anfitrião tem o botão "Permitir entrada" (painel ⋯, ligado por padrão). Com ele ligado, quem digita o código de uma partida em andamento escolhe qual CPU substituir e herda o baralho, a reserva e os especiais preparados dela, com o nome da pessoa. O anfitrião é avisado na tela. Só lugares de CPU (vivas) podem ser assumidos.
- Dicas de texto: nas primeiras 5 partidas do perfil o painel de decisão traz o texto completo; depois, reduzido. A legenda sob a mesa fica oculta enquanto o painel de decisão está aberto.
