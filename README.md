# Dimensions Stacks

Jogo competitivo de cartas para PC ambientado nas séries interligadas de **Dimensões Infinitas**.

> **STATUS: BARALHO APROVADO PELO AUTOR (12/10/2026).** O conteúdo inicial tem **87 cartas oficiais e 129 habilidades no catálogo**. O jogo **ainda não está programado ou balanceado por testes**. Leia o [contrato para outra IA](docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md) antes de modificar qualquer dado.

## Documentação principal

| Documento | Finalidade |
| --- | --- |
| **[Baralho oficial v1.0](docs/BARALHO_OFICIAL.md)** | **Comece aqui:** status da aprovação, 87 cartas, distribuição e links de produção |
| **[Contrato de regras para IA](docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md)** | Distingue o que foi aprovado de questões operacionais ainda pendentes |
| [Regras e GDD v1.2](docs/REGRAS.md) | Mecânicas confirmadas, última seção de ratificação e pendências |
| **[87 cartas aprovadas, fichas completas](docs/CARTAS_87_PROPOSTAS.md)** | Tabela de descrições, atributos e habilidades. O nome `PROPOSTAS` é histórico; **conteúdo aprovado** |
| **[129 Habilidades Especiais](docs/BIBLIOTECA_ATAQUES_ESPECIAIS.md)** | **78 efeitos diferentes equipados em 87 cartas**, 51 guardados para expansões |
| [Modelo-base aprovado de reações defensivas](docs/PRIORIDADE_ESPECIAIS_PROPOSTA.md) | Prioridade circular, reações antes da resolução e contraespecial AE-130 |
| [Elenco das 87 cartas](docs/ELENCO_CANDIDATO.md) | Origem narrativa, identidade e membros da União |
| [Checklist de validação](docs/CHECKLIST_VALIDACAO.md) | Validação documental e testes de partidas ainda necessários |
| [Auditoria do baralho físico](docs/AUDITORIA_BALANCEAMENTO_ESPECIAIS.md) | Material histórico apenas para inspiração, não a versão final das cartas |

## Dados oficiais para implementação

- **[dados/oficial/cartas_87.json](dados/oficial/cartas_87.json)**: 87 cartas com status `APROVADA_PELO_AUTOR`, ATQ/DEF/INT/VEL e Habilidade Especial atribuída.
- **[dados/oficial/habilidades_129.json](dados/oficial/habilidades_129.json)**: 129 habilidades aprovadas como catálogo de design; 78 equipadas, 51 reservadas para futuras cartas.

**Arquivos antigos em `dados/propostas` não são dados de produção.** Não importar nem reconstruir dados finais a partir deles.

## Diretrizes aprovadas

- **87 cartas**: 23 Ciclo de Jesed (amarelo), 19 Viajantes (azul), 14 Spacetheft (preto), 18 Diário Sobrenatural (roxo), 12 Mistério Oculto (vermelho) e 1 Belfex/Édelin (verde).
- Quatro atributos naturais de **0 a 100**: **Ataque (ATQ), Defesa (DEF), Inteligência (INT), Velocidade (VEL)**.
- **Habilidade Especial (ESP)** é o nome geral, incluindo ataques e defesas, com reações permitidas enquanto a ameaça ainda estiver pendente.
- **18 cartas por jogador** como configuração inicial para testes (7 ativas, 11 na reserva); partidas de 2–4 jogadores.
- **A União** preserva a cor original de cada série e recebe selo adicional; sem duplicação. Suas habilidades marcantes estão atribuídas e aprovadas.
- Cartas fracas, fortes, especializadas e elites com totais desiguais são **intencionais**.
- As especializações antigas **#18, #24 e #52** foram retiradas. O **AE-129** é um efeito raro novo, distinto do #52, e está atribuído à carta S01.
- As fontes literárias estão no repositório [dimensoesinfinitas](https://github.com/guyoshi/dimensoesinfinitas); aprovação de uma carta digital **não autentica afirmações não verificadas sobre o cânone**.

## Trabalho técnico restante

Ainda precisamos resolver casos específicos **que não foram definidos**: origem/preparo das especiais, empate após todos os desempates, destino das duas cartas de AE-010, momentos pré-revelação, alvos impossíveis, distribuição imparcial e partidas online. Também faltam simulações e testes de interface. **Não inventar respostas apenas porque o autor aprovou as fichas.**
