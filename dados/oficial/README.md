# Dimensions Stacks — Dados oficiais v1.0

> **AUTORIZAÇÃO DO AUTOR: 12/10/2026.** Este diretório é o **ponto único de importação do conteúdo aprovado** do baralho digital. Os documentos em `dados/propostas` estão descontinuados e não devem ser usados.

## Fontes

| Arquivo | Status | Conteúdo |
| --- | --- | --- |
| [cartas_87.json](cartas_87.json) | `APROVADO_PELO_AUTOR` | **98 cartas** (o nome do arquivo ficou de quando eram 87), cada uma com ID, nome, origem, descrição curta, atributos FOR/RES/INT/VEL, soma, perfil, especial e se integra A União. |
| [habilidades_129.json](habilidades_129.json) | `CATALOGO_APROVADO_COM_TESTES_PENDENTES` | **138 Habilidades Especiais** (129 originais − 3 retiradas + 12 criadas), sendo 98 efeitos diferentes equipados (um por carta) e 40 sem nenhuma atribuição, reservados a expansões. |

**Chaves do JSON das cartas:** `cartas[].id`, `nome`, `origem`, `descricao_curta`, `atributos.{FOR,RES,INT,VEL}`, `soma_atributos`, `perfil_balanceamento`, `habilidade_especial_id`, `uniao`, `base_narrativa`, `status`.

**Chaves do JSON das habilidades:** `habilidades[].id`, `nome`, `categoria`, `texto_efeito`, `avaliacao_de_risco`, `cartas_atribuidas[]`, `situacao_uso`, `aprovacao` e `validacao_balanceamento`.

## Instruções obrigatórias para a próxima IA

1. **Não alterar silenciosamente nenhum valor, descrição, nome ou atribuição aprovada**. Sugestões futuras devem ser apresentadas separadamente até nova autorização do autor.
2. **Usar somente os 78 efeitos equipados no baralho inicial**; não criar cartas extras a partir dos 51 efeitos de reserva.
3. **Não afirmar balanceamento concluído**: os dados estão aprovados, mas não passaram por simulações rigorosas. Testes podem gerar recomendações, não alterações automáticas.
4. **Não confundir cartas físicas antigas com o baralho digital**. Antigo #52 continua excluído; AE-129 é novo e pertence à carta S01.
5. **Respeitar os casos-limite ainda em aberto**, detalhados no [contrato](../../docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md) e no [checklist](../../docs/CHECKLIST_VALIDACAO.md).
6. **Sincronizar JSON e documentos Markdown** quando o autor aprovar qualquer revisão.

[Baralho oficial](../../docs/BARALHO_OFICIAL.md) · [Regras](../../docs/REGRAS.md) · [Elenco](../../docs/ELENCO_CANDIDATO.md).
