# Dimensions Stacks — Checklist de consistência e testes futuros (v0.1)

> **Propósito:** impedir que uma IA implemente decisões que o autor não tomou. Cada caso abaixo distingue **invariante de dados**, **regra confirmada** e **comportamento a definir**. Não executar como se o jogo já estivesse funcional.

## 1. Invariantes para prévia (dados ainda não aprovados)

| Teste | Esperado | Status |
| --- | --- | --- |
| Identidades de cartas | **83 IDs distintos**, séries J/V/S/D/M/B, sem duplicata por selo de A União | Estrutura conhecida |
| Fichas propostas | 83 entradas em `docs/CARTAS_83_PROPOSTAS.md` e `dados/propostas/cartas_83.json` | Proposta |
| Faixa de atributos | ATQ, DEF, INT, VEL são inteiros de 0–100 nas **propostas** | Proposta de escala |
| Soma | Igual a ATQ + DEF + INT + VEL em cada carta candidata | Consistência matemática |
| Descrição curta | Comprimento <=120 caracteres na tabela candidata | Proposta visual; conferir layout |
| Habilidades | **129 IDs únicos**, sem AE-104 (aposentado), com AE-129 e AE-130 | Catálogo candidato |
| Atribuição definitiva | **0 atribuições definitivas** na biblioteca; pareamentos só em tabela de propostas | Estado do projeto |
| A União | 7 integrantes informados + Jennifer futura, **8 selos**, sem duplicar cartas | Confirmado |
| Origem por cor | V azul; M vermelho; J amarelo; B verde; D roxo; S preto | Confirmado |
| Português | Nomes, descrições e interface em PT-BR | Padrão editorial |

## 2. Testes de regras já confirmadas

1. **Empate de atributo:** dois combatentes com mesmo valor eleito. Vence quem possuir maior soma ATQ+DEF+INT+VEL; se empatar novamente, comparar ATQ+INT. Se persistir empate, marcar como **PENDENTE**, não decidir automaticamente.
2. **Imposição simultânea:** jogador A impõe ATQ 94, jogador B impõe INT 91; se ambos os efeitos estão válidos, todos usam ATQ. Se algum foi anulado **antes** de resolver, só considerar imposições remanescentes.
3. **Vitória ofensiva:** vencedor por ATQ/INT captura cartas normais adversárias de combate; vitória por DEF/VEL preserva sua carta mas descarta cartas rivais no Buraco Negro.
4. **Ativação voluntária:** com duas especiais preparadas, o jogador pode virar apenas uma voluntariamente naquele combate, salvo habilidade explícita; a outra permanece.
5. **Uso forçado (#59):** o alvo com duas preparadas é obrigado a gastar ambas; com uma preparada, gasta uma; sem preparadas, não se inventa carta.
6. **Ataque em dupla (#09):** soma do mesmo atributo de duas cartas **consecutivas**, nunca maior de duas. Desfecho da dupla ainda **PENDENTE**.
7. **Recuperar (#12):** duas cartas aleatórias do Buraco Negro para **o fim da reserva**, não para o baralho ativo. O caso com menos de duas cartas no descarte ainda exige regra.
8. **Limpeza (#54):** pode afetar somente as cartas **normais em combate**. Não descartar as especiais **preparadas** por esse efeito.
9. **Repetição (#62):** impedir ciclos infinitos. A mecânica proposta limita novas repetições do mesmo tipo, mas o algoritmo exato deve ser ratificado.
10. **Dois jogadores esquerda/direita:** ambos os sentidos conduzem ao mesmo rival; transferência de cartas dele para ele mesmo pode consumir a habilidade sem vantagem, sem mudar o efeito automaticamente.
11. **Efeitos históricos removidos:** não restabelecer os antigos #18, #24 ou #52 como habilidades ativas.

## 3. Testes para a PROPOSTA de reações defensivas

- Uma habilidade defensiva preparada pode responder a ataque **pendente de resolução**, antes de captura, descarte ou roubo.
- **AE-130** cancela a **última habilidade especial ainda pendente**; o recurso usado é consumido. Não reverte efeito já concluído.
- Se A ativa bônus, B ativa ataque especial e C cancela B, B não produz efeito, mas A pode continuar válido.
- Se B já gastou seu único especial voluntário, não consegue usar outra carta defensiva voluntariamente na mesma disputa, salvo uma habilidade que expressamente permita 2.
- Se uma defesa é ativada enquanto um efeito está prestes a resolver, ela precisa resolver antes **sem processar retroativamente** o resultado.
- Se o efeito forçado #59 coloca duas especiais na pilha, estabelecer prioridade e ordem do proprietário **antes de implementar**.

Todos os itens deste grupo validam **o modelo proposto**, não decisões finalizadas pelo autor.

## 4. Alertas de balanceamento que não devem ser 'corrigidos' automaticamente

- Existem cartas intencionalmente fracas, como **V14**, que podem ganhar utilidade por troca, além de especialistas extremos e elites.
- A soma total não é padronizada: ela faz parte do desempate.
- Personagens de A União devem receber habilidades especialmente marcantes, mas seus **IDs AE atuais são propostas**, não poderes canônicos aprovados.
- ATAQUE e INTELIGÊNCIA são ofensivos e podem capturar; DEFESA e VELOCIDADE defendem mas descartam o oponente. Comparar sua eficiência em teste: não concluir só com médias aritméticas.
- Testar partidas com 2, 3 e 4 jogadores separadamente. Efeitos em “cada adversário” aumentam de impacto com o número de participantes.
- **Ato de usar especial tem custo real**, incluindo o descarte da própria carta especial, mesmo quando efeito é anulado.

## 5. Bloqueios de lançamento ainda abertos

**Não considerar uma versão competitiva concluída sem:** definir de onde saem especiais preparadas; determinar a janela prioritária e as reações; aprovar destino de duas cartas do ataque em dupla; resolver empate absoluto; definir tamanho do baralho efetivamente distribuído por jogador e seleção em 2/3/4; validar raridade/custos de vitória automática; aprovar explicitamente as 83 fichas e o texto integral/categoria das habilidades destinadas aos personagens; testar legibilidade real das descrições e habilidades no design visual.

[Contrato de implementação](CONTRATO_PARA_IA_IMPLEMENTADORA.md) · [83 cartas propostas](CARTAS_83_PROPOSTAS.md) · [Biblioteca de 129 habilidades](BIBLIOTECA_ATAQUES_ESPECIAIS.md).
