# Dimensions Stacks — Matriz das fichas das cartas (rascunho v0.1)

> **79 personagens candidatos**, conforme [elenco aprovado para avaliação](ELENCO_CANDIDATO.md), mas **0 fichas numéricas preenchidas**. Este documento é uma matriz para preencher progressivamente; não é um baralho pronto nem atribui habilidades automaticamente.

## 1. Padrão recomendado, aguardando aprovação do autor

**Quatro atributos inteiros de 0 a 100** (valor NATURAL da carta, sem bônus de combate). A mudança de nome abaixo é **proposta**:

| Campo | Nome original | Nome recomendado para interface | Definição |
| --- | --- | --- | --- |
| `ATQ` | Poder (`POD`) | **Ataque** | Capacidade ofensiva física, mágica, tecnológica ou sobrenatural |
| `DEF` | Defesa | **Defesa** | Bloqueio, proteção, resistência e sobrevivência |
| `INT` | Inteligência | **Inteligência** | Antecipação, raciocínio, tática, análise e conhecimento |
| `VEL` | Velocidade | **Velocidade** | Reflexos, movimentação, agilidade e evasão |

**Pares de combate preservados:** Ataque/Defesa; Inteligência/Velocidade. Ataque e Inteligência são tipos ofensivos; Defesa e Velocidade são defensivos. A renomeação de Poder para Ataque **não foi ratificada**; antes de aprovar, todas as tabelas são preparatórias.

**Duas escalas separadas:** valor natural da carta entre 0–100, modificador especial temporário pode exceder 100 na comparação (sujeito a confirmação). Não normalizar automaticamente um bônus de +20 para manter abaixo de 100: isso enfraqueceria habilidades.

**Orientação de balanceamento, NÃO limite fixo:** totais naturais na ordem de 195–245 como ponto inicial para a maioria dos candidatos; totais acima de 245 exigem contrapartida no perfil ou no especial. **Não igualar a soma de todas as cartas**, porque a soma dos quatro atributos é o primeiro desempate. Depois vem a soma Ataque + Inteligência, conforme regra já aprovada (originalmente Poder + Inteligência).

**Atribuição dos especiais:** preencher `Especial (AE)` só após avaliar coerência narrativa, total de atributos e papel estratégico. O catálogo contém [128 habilidades candidatas](BIBLIOTECA_ATAQUES_ESPECIAIS.md), e a coluna de atribuição do catálogo permanece vazia.

## 2. Matriz de personagens por série

### Ciclo de Jesed (23)

**Cor-base:** `#eab308` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| J01 | Jokara | — | — | — | — | — | — | — | A definir |
| J02 | Nestira | — | — | — | — | — | — | — | A definir |
| J03 | Mark Polar | — | — | — | — | — | — | Sim | A definir |
| J04 | Gabasteri | — | — | — | — | — | — | — | A definir |
| J05 | Maletar | — | — | — | — | — | — | — | A definir |
| J06 | Platisa | — | — | — | — | — | — | — | A definir |
| J07 | Mariv | — | — | — | — | — | — | — | A definir |
| J08 | Kaelina | — | — | — | — | — | — | — | A definir |
| J09 | Alyra | — | — | — | — | — | — | — | A definir |
| J10 | Daryon Polar | — | — | — | — | — | — | — | A definir |
| J11 | Cal Edran | — | — | — | — | — | — | — | A definir |
| J12 | Rendar | — | — | — | — | — | — | — | A definir |
| J13 | Nynestra | — | — | — | — | — | — | — | A definir |
| J14 | Cal Kadrir | — | — | — | — | — | — | — | A definir |
| J15 | Dareth Quatro-Dedos | — | — | — | — | — | — | — | A definir |
| J16 | Elis | — | — | — | — | — | — | — | A definir |
| J17 | Selina | — | — | — | — | — | — | — | A definir |
| J18 | Vetarius Polar | — | — | — | — | — | — | — | A definir |
| J19 | Kerath Polar | — | — | — | — | — | — | — | A definir |
| J20 | Jelatira | — | — | — | — | — | — | — | A definir |
| J21 | Nefestra | — | — | — | — | — | — | — | A definir |
| J22 | Sefter | — | — | — | — | — | — | — | A definir |
| J23 | Kedran | — | — | — | — | — | — | — | A definir |

### Viajantes Dimensionais (15)

**Cor-base:** `#2563eb` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| V01 | Breno Lins | — | — | — | — | — | — | — | A definir |
| V02 | Bruno Lins | — | — | — | — | — | — | Sim | A definir |
| V03 | Banjo Lins | — | — | — | — | — | — | — | A definir |
| V04 | Beatriz Lins | — | — | — | — | — | — | — | A definir |
| V05 | Velho-Sábio / Auream | — | — | — | — | — | — | — | A definir |
| V06 | Erla | — | — | — | — | — | — | — | A definir |
| V07 | Lucas Veline | — | — | — | — | — | — | — | A definir |
| V08 | Garmand | — | — | — | — | — | — | — | A definir |
| V09 | Ricochet Bombergue | — | — | — | — | — | — | — | A definir |
| V10 | Korvo | — | — | — | — | — | — | — | A definir |
| V11 | Gary | — | — | — | — | — | — | — | A definir |
| V12 | Anasin | — | — | — | — | — | — | — | A definir |
| V13 | Saliens | — | — | — | — | — | — | — | A definir |
| V14 | Tio Frank | — | — | — | — | — | — | — | A definir |
| V15 | Brenda | — | — | — | — | — | — | Sim | A definir |

### Spacetheft (14)

**Cor-base:** `#111111` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| S01 | Jasmey Badrock | — | — | — | — | — | — | Sim | A definir |
| S02 | Amanda | — | — | — | — | — | — | — | A definir |
| S03 | Eric | — | — | — | — | — | — | — | A definir |
| S04 | Lias Hardman | — | — | — | — | — | — | — | A definir |
| S05 | Kord | — | — | — | — | — | — | — | A definir |
| S06 | O'reilly | — | — | — | — | — | — | — | A definir |
| S07 | Buni | — | — | — | — | — | — | — | A definir |
| S08 | Vivian | — | — | — | — | — | — | — | A definir |
| S09 | Capitã Nastácia | — | — | — | — | — | — | — | A definir |
| S10 | Jelles | — | — | — | — | — | — | — | A definir |
| S11 | A Besta (Aurora) | — | — | — | — | — | — | — | A definir |
| S12 | Vek | — | — | — | — | — | — | — | A definir |
| S13 | Capitão Tzough | — | — | — | — | — | — | — | A definir |
| S14 | Genrir | — | — | — | — | — | — | — | A definir |

### Diário Sobrenatural (14)

**Cor-base:** `#7e22ce` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| D01 | Junior | — | — | — | — | — | — | — | A definir |
| D02 | Priscila | — | — | — | — | — | — | — | A definir |
| D03 | Pedro | — | — | — | — | — | — | — | A definir |
| D04 | Kelly | — | — | — | — | — | — | — | A definir |
| D05 | Vinicius (Vini) | — | — | — | — | — | — | — | A definir |
| D06 | Jennifer | — | — | — | — | — | — | Futura | A definir |
| D07 | Ingrid Carnam | — | — | — | — | — | — | — | A definir |
| D08 | Glenda | — | — | — | — | — | — | — | A definir |
| D09 | Diego | — | — | — | — | — | — | — | A definir |
| D10 | Avó de Kelly | — | — | — | — | — | — | — | A definir |
| D11 | Cara-de-Larva | — | — | — | — | — | — | — | A definir |
| D12 | Agouro | — | — | — | — | — | — | — | A definir |
| D13 | Suéten | — | — | — | — | — | — | — | A definir |
| D14 | Filippo (Filipo, grafia a confirmar) | — | — | — | — | — | — | — | A definir |

### Mistério Oculto (12)

**Cor-base:** `#b91c1c` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| M01 | Hyde | — | — | — | — | — | — | Sim, líder | A definir |
| M02 | Agente Sete | — | — | — | — | — | — | — | A definir |
| M03 | Diana | — | — | — | — | — | — | — | A definir |
| M04 | Matt Pontas | — | — | — | — | — | — | — | A definir |
| M05 | Padre Tomas | — | — | — | — | — | — | — | A definir |
| M06 | Benjamin Karnudo | — | — | — | — | — | — | — | A definir |
| M07 | Agente Seis | — | — | — | — | — | — | — | A definir |
| M08 | Dra. Helena Valença | — | — | — | — | — | — | — | A definir |
| M09 | Richard Falkner (Bulldog) | — | — | — | — | — | — | — | A definir |
| M10 | Releuz (nome temporário) | — | — | — | — | — | — | Sim | A definir |
| M11 | X | — | — | — | — | — | — | — | A definir |
| M12 | James | — | — | — | — | — | — | — | A definir |

### Belfex / série de Édelin (1)

**Cor-base:** `#15803d` (referência ilustrativa do tom; o autor aprovou a cor, não o código hexadecimal exato).

| ID | Personagem | ATQ* | DEF | INT | VEL | Soma | Especial (AE) | Selo União | Estado |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| B01 | Édelin Fils | — | — | — | — | — | — | Sim | A definir |

## 3. Campos adicionais para ficha individual definitiva

Além dos números, cada carta terá:

- **ID canônico da carta:** `J01`, `V02`, `S01`, `D06`, `M01`, `B01`, etc.
- **Nome e série de origem**, sempre do cânone atual; sem duplicar o mesmo personagem por integrar A União.
- **Biografia curta sem spoilers desnecessários**, com fonte/capítulo da documentação do livro.
- **ATQ*/DEF/INT/VEL naturais**, soma dos quatro para desempate (e soma de ATQ*+INT se necessário).
- **Papel estratégico** (por exemplo ofensivo, defensivo, equilibrado, controle, suporte), categoria analítica e não classe fixa com novas regras.
- **Especial `AE-###`** atribuído pelo autor, nome definitivo e texto conciso para exibição.
- **Raridade**, determinada independentemente de força total ou da série. Se algumas cartas tiverem vitória automática rara, precisam de contrajogo e validação.
- **Selo de A União**, sem duplicar a carta, para membros confirmados e futuros.
- **Status de aprovação** de valores, texto e habilidade, com controle de versão.

`ATQ*`: se o autor preferir manter o nome original, renomear a coluna para `POD` antes de preencher dados; **nenhum atributo foi renomeado oficialmente ainda**.

## 4. Proposta de quantidade por partida (não aprovada)

Para evitar que o conjunto atual de 79 personagens seja dividido desigualmente, testar **18 cartas por jogador** em partidas todos-contra-todos:

| Jogadores | Cartas selecionadas para a partida | Baralho ativo inicial por jogador | Reserva por jogador |
| ---: | ---: | ---: | ---: |
| 2 | 36 | 7 | 11 |
| 3 | 54 | 7 | 11 |
| 4 | 72 | 7 | 11 |

Com isso, as cartas restantes entre as 79 não entram naquela partida. O tamanho 18 é **proposta de teste**; ajustes de duração da partida poderão mudar o número. Não confundir as **79 cartas candidatas da coleção** com a quantidade de cartas **efetivamente distribuídas numa partida**.

## 5. Referências

- [Elenco das 79 cartas](ELENCO_CANDIDATO.md).
- [Regras originais e decisões aprovadas](REGRAS.md).
- [128 ataques especiais candidatos](BIBLIOTECA_ATAQUES_ESPECIAIS.md).
- [Proposta de prioridade e ordem de resolução](PRIORIDADE_ESPECIAIS_PROPOSTA.md).
