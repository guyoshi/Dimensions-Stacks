# Dados de prévia para desenvolvimento (NÃO APROVADOS)

Este diretório guarda uma **exportação estruturada** das propostas de jogo. **Não é a base oficial definitiva de produção.** Os dados contêm marcações `status: PROPOSTA_NAO_APROVADA`, para impedir que outra IA ou ferramenta publique atributos e habilidades ainda não ratificados.

- [cartas_87.json](cartas_87.json): 87 personagens e seus atributos, descrições curtas e habilidades candidatas.
- [habilidades_129.json](habilidades_129.json): 129 habilidades com textos propostos, família, status de teste e **nenhuma atribuição definitiva**. O antigo ID `AE-104` foi aposentado e não aparece na lista.
- [Contrato principal](../../docs/CONTRATO_PARA_IA_IMPLEMENTADORA.md): hierarquia e regras confirmadas.

## Como usar com segurança

1. Aplicar `status` por dado; não promover propostas a regras.
2. Usar os JSON **para prévias, comparações e ferramentas internas de revisão**, não para gerar um baralho definitivo sem aprovação do autor.
3. Consultar as descrições e fontes no [Markdown da matriz](../../docs/CARTAS_87_PROPOSTAS.md) e os efeitos na [biblioteca](../../docs/BIBLIOTECA_ATAQUES_ESPECIAIS.md).
4. Ao editar sugestões, atualizar **documentação e JSON correspondente juntos**. Se divergirem, interromper e reconciliar, não escolher silenciosamente.
5. O nome oficial do atributo ofensivo principal é `ATQ` (**Ataque**); `Poder/POD` pertence somente às transcrições antigas.

Nada aqui autoriza que uma IA deduza poderes narrativos não descritos no cânone.
