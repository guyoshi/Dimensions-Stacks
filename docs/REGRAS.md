# Dimensions Stacks — Regras e dinâmica (GDD v0.1)

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

### Empates

O manual físico prevê um primeiro desempate pela **soma dos quatro atributos** de cada carta empatada; vence quem tiver maior soma. No material existe ainda uma observação específica para empate de defesa, cujo efeito precisa ser validado antes de se tornar regra digital.

- **PENDENTE:** empate também na soma; empate em jogos com 3/4 jogadores; empate envolvendo ataque e defesa no mesmo valor; efeito definitivo do empate defensivo.
- **PROPOSTA para testar:** preservar tipo (ataque/defesa) do vencedor do desempate. Se persistir igualdade, descartar as cartas empatadas no Buraco Negro sem captura, mas **não adotar sem aprovação**.

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

**CONTRADIÇÃO NO MANUAL:** uma passagem diz que somente **um especial** pode ser usado durante o combate; outra diz que é possível usar **os dois** no mesmo turno. **PENDENTE de decisão do autor** antes da implementação.

**PENDENTE:** se preparar a carta a retira obrigatoriamente do topo do baralho ativo ou de outra zona; se preparar substitui a participação normal daquela carta no turno; quem decide a ordem de ativação simultânea; limites temporais exatos de reação, escolha de alvo e efeitos que se anulam.

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

## 9. Identidade visual: proposta para a versão PC

**Substituir as cores como julgamento moral** ('verde = herói', 'vermelho = vilão') por uma **identidade de série/universo**. Evita classificar ambiguamente personagens de Jesed. Exemplo de proposta, **não final**:

| Origem | Cor-base sugerida | Marca textual |
| --- | --- | --- |
| Ciclo de Jesed | bronze / verde profundo | JESED |
| Viajantes Dimensionais | turquesa | VIAJANTES |
| Spacetheft | azul interestelar | SPACETHEFT |
| Diário Sobrenatural | vinho / ameixa | DIÁRIO |
| Mistério Oculto | grafite / violeta | MISTÉRIO |
| A União | prata / branco | UNIÃO |
| Édelin | âmbar | ÉDELIN |

Usar **ícones/selos separados** para raridade, papel mecânico e filiação à União. Personagens que aparecem em mais de uma série mantêm uma origem principal e podem receber selo de crossover. A cor **não muda regras de combate**. Efeitos antigos baseados em 'cartas azuis/vermelhas' precisam ser reescritos para critério funcional (ver ATAQUES_ESPECIAIS.md).

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

**Filiação oficial de A União:** Bruno Lins Lee, Brenda, Hyde, Releuz (provisório), Jasmey Badrock, Mark Pollar, Édelin Fils; Jennifer ingressa futuramente. Ver [elenco candidato](ELENCO_CANDIDATO.md#10-atualização-oficial-a-união-12102026).
