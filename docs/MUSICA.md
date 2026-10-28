# Música

## Trilhas atuais (15/10/2026)
| Uso | Arquivo | Origem |
|---|---|---|
| Menu | `prototipo/musica/menu.mp3` | "The Upside Down" (Luis Humanoide) — `dados/musica_originais/menu_the-upside-down_luis-humanoide.mp3` |
| Partida | `prototipo/musica/partida.mp3` | "Spacewalker" (Berrydeep) — `dados/musica_originais/partida_spacewalker_berrydeep.mp3` |
| Partida, tensão (arriscado) | `partida_110.mp3` | mesma música a 1,10x, **sem mudar o tom** (rubberband) |
| Partida, clímax (quase acabando) | `partida_120.mp3` | mesma música a 1,20x, **sem mudar o tom** |

**Loop com crossfade:** cada arquivo traz o crossfade embutido no fim do trecho que repete (equal-power, 2,5 s no menu e 3 s na partida). A introdução toca uma vez; depois repete só entre `a` e `b` (valores em `MUS` no `audio.js`). Os pontos foram achados por correlação, alinhados ao tempo musical (menu: 12 compassos = 39,78 s; partida: 48 compassos = 96 s, incluindo o trecho calmo do meio). O salto no ponto de repetição foi medido no navegador e é igual ao de qualquer outro ponto da música.

**Níveis na partida:** nível 0 = normal, 1 = 1,10x, 2 = 1,20x (mesmos gatilhos de antes: `matchLevel`). A troca é um crossfade de 1,2 s (subindo) ou 1,8 s (descendo) para a versão certa, **na mesma posição musical**. O Início/partida não sobem mais de tom no clímax (a modulação de +2 semitons só existe na trilha clássica).

Regerar: `prototipo/tools/musica_bake.py` (usa ffmpeg com rubberband e numpy) e `musica_loop_busca.py` (busca dos pontos de loop).

## Trilha clássica (as sintetizadas originais)
Continuam no código (`audio.js`: ambiente do menu, groove procedural da partida com níveis 98/112/126 bpm e modulação no clímax, e a trilha de derrota). Opções → **Trilha sonora → Clássica** volta a elas. Também são o reserva automático se os arquivos não carregarem. A trilha de derrota segue sintetizada nas duas opções.

## Trilhas do Modo História (a fornecer)
| Uso | Arquivo esperado em `prototipo/musica/` |
|---|---|
| Mapa | `historia_mapa.mp3` |
| Batalha normal | `historia_batalha.mp3` |
| Miniboss | `historia_miniboss.mp3` |
| Boss final | `historia_boss.mp3` |
| Abertura da história (cinemática) | `historia_intro.mp3` (Alex Morgan) |
| Miniboss | `historia_miniboss.mp3` (Nastelborn) |
| Loja | `historia_loja.mp3` (Toucan Music) |

Trocas sempre com fade (cruzado ~1 s). A trilha do mapa guarda onde parou e continua dali ao voltar da loja ou de uma batalha.

Loop do arquivo inteiro (ou entre `a` e `b` em `audio.js` › `HIST`). Sem o arquivo, a trilha não toca e o resto segue igual.
