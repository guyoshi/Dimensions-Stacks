# Dimensions Stacks

Jogo competitivo de cartas para PC, baseado em personagens das séries interligadas de **Dimensões Infinitas**. **Estado atual: pré-produção e documentação**, não há implementação de jogo neste repositório.

> **PARA QUALQUER IA OU DESENVOLVEDOR: LEIA PRIMEIRO [CONTRATO_PARA_IA_IMPLEMENTADORA.md](docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md).** Não transforme propostas em regras já aprovadas.

## Onde encontrar cada decisão

| Documento | Finalidade e autoridade |
| --- | --- |
| **[Contrato de implementação](docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md)** | **Comece aqui**: separa o que o autor confirmou de propostas e dúvidas ainda abertas |
| [Regras do jogo, GDD v0.9](docs/REGRAS.md) | Mecânicas aprovadas e questões pendentes; atributo **Ataque** substituiu **Poder** |
| **[79 cartas com descrições, atributos e especial sugerido](docs/CARTAS_79_PROPOSTAS.md)** | **79 propostas para revisão do autor**, não números definitivos |
| [Biblioteca de 129 habilidades especiais](docs/BIBLIOTECA_ATAQUES_ESPECIAIS.md) | Mecânicas candidatas por tipo; **129 colunas de atribuição definitiva vazias** |
| [Reações defensivas, prioridades e anulação do último especial](docs/PRIORIDADE_ESPECIAIS_PROPOSTA.md) | **Proposta técnica** para permitir respostas defensivas enquanto ataques ainda não foram resolvidos |
| [Elenco das 79 cartas e A União](docs/ELENCO_CANDIDATO.md) | Identidades, origens e integrantes da União sem duplicações |
| [Auditoria dos ataques físicos](docs/AUDITORIA_BALANCEAMENTO_ESPECIAIS.md) | Avaliação histórica dos efeitos antigos, úteis apenas como inspiração mecânica |
| [Transcrições de cartas físicas confirmadas](docs/TRANSCRICOES_ESPECIAIS_CONFIRMADAS.md) | Arquivo de referência histórica; não copiar nomes e atributos das cartas físicas |
| [Leituras de IA das cartas antigas](docs/LEITURAS_IA_PENDENTES_2026-10-12.md) | Dados provisórios/ilegíveis, nunca cânone para implementar |

## Visão de design

- **79 cartas candidatas**, seis cores por série, filiação a **A União por selo** adicional.
- **Quatro atributos**: **Ataque (ATQ)**, Defesa, Inteligência, Velocidade; pares ATQ/DEF e INT/VEL.
- **Partidas de 2, 3 ou 4 jogadores**, com 7 cartas em baralho ativo inicial e meio de reserva.
- **129 habilidades especiais candidatas** para distribuir, incluindo a **AE-130: Anular a última habilidade pendente**, solicitada pelo autor.
- Diferenças deliberadas entre cartas ruins, especialistas e elites. **Os integrantes de A União devem receber habilidades marcantes de maior impacto.**
- **Carta especial voluntária: 1 por combate**, salvo habilidade excepcional; especiais defensivas devem poder responder a ataques em qualquer janela ainda útil. A ordem operacional detalhada **está em discussão**.
- A biblioteca de efeitos é **independente dos nomes das cartas físicas antigas**. Origem narrativa: [guyoshi/dimensoesinfinitas](https://github.com/guyoshi/dimensoesinfinitas).

## Próximas aprovações

Revisar os **79 perfis propostos**, confirmar a especificação das **reações defensivas** e solucionar pendências estruturais do GDD (preparação da especial, desempate absoluto, destino de carta dupla, distribuição de início da partida, prioridades de efeitos). Somente depois esses dados podem ser tratados como baralho final, com validação de layout e testes de balanceamento.
