# Somas únicas — ajuste dos atributos (15/10/2026)

**Pedido do autor (15/10/2026):** o terceiro desempate (Força + Inteligência) deixou de existir; só resta o desempate pela **soma dos 4 atributos**. Para a soma sempre decidir, **nenhuma carta pode ter o mesmo total que outra**.

**Como foi feito:** os totais repetidos (24 grupos, 56 cartas) foram espalhados para valores livres com o menor deslocamento possível (atribuição ótima, mínimo de pontos mexidos). O ajuste foi aplicado **no atributo mais baixo que não é o pico da carta**, para não mexer na identidade dela. Resultado: 102 cartas, 102 totais diferentes. Nenhuma raridade mudou.

Estado anterior guardado em `dados/historico/cartas_87_antes_unicidade_2026-10-15.json`. Fonte: `dados/oficial/cartas_87.json` (depois `tools/importar_propostas.py` e `tools/gerar_lista_cartas.py`).

**55 cartas alteradas** (47 ficaram como estavam):

| Carta | Nome | Atributo | Antes | Depois | Soma nova |
| --- | --- | --- | --- | --- | --- |
| B01 | Édelin Lys | Velocidade | 56 | 58 | 281 |
| B03 | Jork Caravel | Força | 29 | 30 | 218 |
| B04 | Peredun | Resistência | 45 | 44 | 249 |
| B05 | Primus Senan | Velocidade | 27 | 25 | 235 |
| D01 | Junior Quissama | Força | 18 | 19 | 241 |
| D02 | Priscila Fontenelle | Velocidade | 33 | 31 | 233 |
| D03 | Pedro Souza | Velocidade | 35 | 34 | 236 |
| D05 | Vinícius Silva | Resistência | 53 | 52 | 273 |
| D07 | Ingrid Marques | Velocidade | 42 | 43 | 275 |
| D08 | Glenda Mendes | Força | 59 | 58 | 284 |
| D09 | Diego Tavolieri | Resistência | 45 | 44 | 238 |
| D10 | Sra. Olívia | Velocidade | 27 | 25 | 232 |
| D11 | Cara-de-Larva | Inteligência | 57 | 56 | 272 |
| D13 | Suéten Marques | Força | 35 | 36 | 217 |
| D14 | Filipo Brandolini | Força | 29 | 28 | 223 |
| D18 | O Cão | Inteligência | 31 | 30 | 215 |
| D19 | Manu | Força | 35 | 34 | 206 |
| J02 | Nestira Amarëa | Força | 24 | 23 | 213 |
| J04 | Gabasteri | Força | 64 | 65 | 283 |
| J09 | Alyra Polar | Resistência | 48 | 47 | 259 |
| J11 | Cal Edran | Velocidade | 61 | 60 | 278 |
| J13 | Nynestra | Velocidade | 35 | 36 | 221 |
| J21 | Nefestra | Força | 49 | 48 | 260 |
| J22 | Sefter | Resistência | 40 | 41 | 222 |
| M01 | Hyde | Força | 64 | 65 | 304 |
| M02 | Agente Sete | Inteligência | 68 | 66 | 300 |
| M04 | Matt Pontas | Força | 40 | 38 | 208 |
| M06 | Benjamin Karnudo | Inteligência | 43 | 44 | 240 |
| M07 | Agente Seis | Resistência | 49 | 48 | 246 |
| M11 | X | Força | 51 | 49 | 271 |
| M12 | James Harrow | Velocidade | 48 | 49 | 263 |
| S02 | Amanda | Força | 48 | 50 | 282 |
| S03 | Eric | Resistência | 24 | 22 | 211 |
| S06 | O'reilly | Resistência | 67 | 66 | 289 |
| S08 | Vivian | Força | 9 | 8 | 212 |
| S09 | Capitã Nastácia | Velocidade | 64 | 63 | 291 |
| S10 | Jelles | Velocidade | 46 | 45 | 230 |
| S12 | Vek | Velocidade | 23 | 25 | 219 |
| S13 | Capitão Tzough | Velocidade | 38 | 37 | 250 |
| S14 | Genrir | Força | 43 | 41 | 231 |
| S15 | Tersário | Inteligência | 51 | 52 | 264 |
| S17 | Luna Stellar | Velocidade | 51 | 53 | 243 |
| V04 | Beatriz Lins | Inteligência | 68 | 67 | 314 |
| V05 | Velho-Sábio / Auream | Velocidade | 44 | 45 | 276 |
| V06 | Erla | Inteligência | 70 | 69 | 301 |
| V07 | Lucas Veline | Força | 31 | 29 | 210 |
| V12 | Anasin | Resistência | 52 | 51 | 270 |
| V13 | Saliens | Inteligência | 56 | 57 | 280 |
| V19 | Seti | Velocidade | 35 | 32 | 209 |
| V20 | William McCroys | Velocidade | 54 | 55 | 277 |
| V21 | Shirley Ainsworth | Resistência | 45 | 47 | 244 |
| V22 | Nicolas Corvane | Força | 46 | 48 | 242 |
| V23 | Erick Corvane | Força | 39 | 38 | 196 |
| V24 | Maria Santoro | Força | 24 | 25 | 220 |
| V25 | Eshley Damaris | Força | 45 | 43 | 234 |

Regra para cartas novas: antes de entrar no baralho, conferir que a soma dos 4 atributos não repete nenhuma outra (teste `tests/somas_unicas.js`).
