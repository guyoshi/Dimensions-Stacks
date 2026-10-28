# Modo história: proposta das 100 batalhas (Etapa 2, 28/10/2026)

**PROPOSTA aguardando aprovação.** Gerada por `prototipo/tools/gerar_batalhas_historia.py` (semente fixa, `dados/historia_batalhas.json`). Os ids dos pontos são os do mapa; nada aqui muda o mapa.

## Regras propostas

- **Tema por região:** esquerda = Diário Sobrenatural · cima = Ciclo de Jesed · direita = Viajantes Dimensionais · baixo = Spacetheft. Mistério Oculto e Édelin Lys aparecem como visitantes nas regiões média e interna; da região 3 em diante também entram cartas de outras séries.
- **Receita de raridades por inimigo (7 cartas)** cresce da região 1 (quase só comuns) à 4 (épicas e lendárias): ver tabela abaixo. O jogador começa com 6 comuns e 1 épica.
- **Inimigo = um personagem das cartas**, o de maior poder do baralho dele; o avatar é a foto dessa carta. Miniboss: 2 ou 3 oponentes (duelo de 3 ou 4). Guardiões: 2 oponentes (duelo de 3). Boss: **A Besta + 6 cartas da União** (a Besta é exclusiva do Boss).
- **Ordem de jogo do inimigo:** da mais fraca para a mais forte (a mais forte no fim). Proposta, ajustável.
- **Distribuição equilibrada:** cada escolha pega a carta menos usada da raridade pedida, para que todas apareçam.
- **Substituível:** batalha comum, evento ou elite em que **todas as cartas do inimigo aparecem em pelo menos 3 batalhas**; dá para trocar o baralho dela sem sumir nenhuma carta do mapa.

| Tipo | Região | Comum | Rara | Épica | Lendária |
|---|---|---|---|---|---|
| elite | 1 | 3 | 3 | 1 | 0 |
| evento | 1 | 5 | 2 | 0 | 0 |
| normal | 1 | 6 | 1 | 0 | 0 |
| elite | 2 | 2 | 3 | 2 | 0 |
| evento | 2 | 3 | 3 | 1 | 0 |
| miniboss | 2 | 2 | 3 | 2 | 0 |
| normal | 2 | 4 | 3 | 0 | 0 |
| elite | 3 | 1 | 2 | 3 | 1 |
| evento | 3 | 2 | 2 | 2 | 1 |
| miniboss | 3 | 1 | 2 | 3 | 1 |
| normal | 3 | 2 | 3 | 2 | 0 |
| elite | 4 | 0 | 1 | 3 | 3 |
| evento | 4 | 0 | 2 | 3 | 2 |
| guardiao | 4 | 0 | 1 | 3 | 3 |

## Resumo

- Batalhas: **100** (Counter({'normal': 53, 'evento': 24, 'elite': 10, 'miniboss': 8, 'guardiao': 4, 'boss': 1})); substituíveis: **83**.
- Cartas que aparecem em inimigos: **99 de 116** (a Besta só no Boss).
- Cartas com menos aparições (mais exclusivas): Gabasteri (J04, 0x), Platisa (J06, 0x), Kaelina Polar (J08, 0x), Alyra Polar (J09, 0x), Rendar (J12, 0x), Vetarius Polar (J18, 0x), Nefestra (J21, 0x), Alveris Polar (J25, 0x), Sumo Vigia (J26, 0x), Tair Nular (J27, 0x), Kalan Nular (J28, 0x), Orionus Polar (J31, 0x).
- Cartas com mais aparições: Selina Polar (J17, 21x), Efepar (J34, 22x), Tack Ergson (B02, 23x), Peredun (B04, 23x), Benjamin Karnudo (M06, 23x), Diana (M03, 24x), Matt Pontas (M04, 24x), Agente Seis (M07, 24x).

## Repetições por carta

| Carta | Nome | Série | Raridade | Aparições | Batalhas |
|---|---|---|---|---|---|
| J01 | Jokara Amarëa | jesed | comum | 7 | B086, B042, B070, B017, B018, B020, B026 |
| J02 | Nestira Amarëa | jesed | lendaria | 1 | B086 |
| J03 | Mark Polar | jesed | lendaria | 1 | B100 |
| J04 | Gabasteri | jesed | lendaria | 0 |  |
| J05 | Maletar | jesed | comum | 8 | B086, B062, B003, B004, B018, B020, B037, B043 |
| J06 | Platisa | jesed | lendaria | 0 |  |
| J07 | Mariv | jesed | comum | 7 | B080, B042, B066, B004, B019, B021, B043 |
| J08 | Kaelina Polar | jesed | lendaria | 0 |  |
| J09 | Alyra Polar | jesed | lendaria | 0 |  |
| J10 | Daryon Polar | jesed | lendaria | 1 | B097 |
| J11 | Cal Edran | jesed | lendaria | 1 | B099 |
| J12 | Rendar | jesed | lendaria | 0 |  |
| J13 | Nynestra | jesed | comum | 7 | B079, B044, B004, B005, B018, B020, B026 |
| J14 | Cal Kadrir | jesed | comum | 8 | B092, B062, B070, B017, B019, B021, B026, B043 |
| J15 | Dareth Polar | jesed | comum | 7 | B083, B042, B003, B017, B019, B021, B037 |
| J16 | Elis Nular | jesed | comum | 7 | B090, B062, B066, B017, B018, B020, B043 |
| J17 | Selina Polar | jesed | rara | 21 | B097, B083, B086, B086, B086, B089, B044, B051… |
| J18 | Vetarius Polar | jesed | lendaria | 0 |  |
| J19 | Cal Kerath | jesed | comum | 7 | B089, B062, B070, B005, B017, B021, B037 |
| J20 | Jelatira | jesed | comum | 7 | B087, B044, B004, B005, B018, B021, B037 |
| J21 | Nefestra | jesed | lendaria | 0 |  |
| J22 | Sefter | jesed | comum | 7 | B083, B051, B004, B005, B019, B021, B026 |
| J23 | Kedran | jesed | comum | 8 | B075, B044, B003, B017, B018, B026, B037, B043 |
| J24 | Litara | jesed | lendaria | 1 | B097 |
| J25 | Alveris Polar | jesed | lendaria | 0 |  |
| J26 | Sumo Vigia | jesed | lendaria | 0 |  |
| J27 | Tair Nular | jesed | lendaria | 0 |  |
| J28 | Kalan Nular | jesed | lendaria | 0 |  |
| J29 | Orel Nular | jesed | comum | 7 | B088, B052, B066, B005, B019, B020, B026 |
| J30 | Kharvok | jesed | lendaria | 1 | B086 |
| J31 | Orionus Polar | jesed | lendaria | 0 |  |
| J32 | Raukhar | jesed | lendaria | 0 |  |
| J33 | Tavra Vendrar | jesed | comum | 7 | B089, B062, B067, B004, B019, B020, B043 |
| J34 | Efepar | jesed | rara | 22 | B096, B081, B083, B086, B086, B042, B044, B051… |
| J35 | Liri | jesed | lendaria | 0 |  |
| J36 | Professor Taliver | jesed | lendaria | 1 | B099 |
| J37 | Yndra | jesed | lendaria | 1 | B088 |
| V01 | Breno Lins | viajantes | lendaria | 1 | B091 |
| V02 | Bruno Lins | viajantes | lendaria | 2 | B097, B100 |
| V03 | Banjo Lins | viajantes | lendaria | 1 | B097 |
| V04 | Beatriz Lins | viajantes | lendaria | 1 | B096 |
| V05 | Velho-Sábio | viajantes | lendaria | 1 | B098 |
| V06 | Erla | viajantes | lendaria | 1 | B085 |
| V07 | Lucan Veline | viajantes | lendaria | 1 | B096 |
| V08 | Garmande Koraveli | viajantes | lendaria | 0 |  |
| V09 | Ricochet Bombergue | viajantes | lendaria | 1 | B086 |
| V10 | Korvo | viajantes | lendaria | 1 | B097 |
| V11 | Garien | viajantes | lendaria | 0 |  |
| V12 | Anasin | viajantes | lendaria | 1 | B095 |
| V13 | Saliens | viajantes | lendaria | 1 | B098 |
| V14 | Tio Frank | viajantes | lendaria | 1 | B097 |
| V15 | Brenda Koraveli | viajantes | lendaria | 2 | B098, B100 |
| V16 | Faka | viajantes | lendaria | 1 | B098 |
| V17 | Lanigiah | viajantes | lendaria | 1 | B078 |
| V18 | Grande Pai Gaia | viajantes | lendaria | 1 | B098 |
| V19 | Seti | viajantes | lendaria | 1 | B094 |
| V20 | William McCroys | viajantes | lendaria | 1 | B095 |
| V21 | Shirley Ainsworth | viajantes | lendaria | 1 | B078 |
| V22 | Nicolas Corvane | viajantes | lendaria | 0 |  |
| V23 | Erick Corvane | viajantes | lendaria | 1 | B098 |
| V24 | Maria Santoro | viajantes | lendaria | 1 | B094 |
| V25 | Eshley | viajantes | lendaria | 1 | B078 |
| S01 | Jasmey Badrock | spacetheft | comum | 16 | B080, B047, B055, B064, B064, B072, B011, B012… |
| S02 | Amanda | spacetheft | comum | 16 | B087, B047, B054, B058, B072, B072, B011, B012… |
| S03 | Eric | spacetheft | rara | 11 | B078, B081, B088, B047, B055, B064, B065, B072… |
| S04 | Lias Hardman | spacetheft | epica | 10 | B095, B098, B099, B081, B081, B084, B088, B091… |
| S05 | Kord | spacetheft | rara | 11 | B094, B079, B089, B047, B058, B064, B064, B072… |
| S06 | O'reilly | spacetheft | epica | 11 | B094, B098, B078, B078, B082, B086, B088, B093… |
| S07 | Buni | spacetheft | comum | 16 | B081, B047, B055, B064, B064, B073, B011, B012… |
| S08 | Vivian | spacetheft | rara | 11 | B098, B080, B084, B093, B054, B064, B064, B072… |
| S09 | Capitã Nastácia | spacetheft | epica | 11 | B094, B097, B075, B079, B081, B086, B087, B064… |
| S10 | Jelles | spacetheft | lendaria | 5 | B094, B094, B081, B081, B093 |
| S11 | A Besta | spacetheft | comum | 1 | B100 |
| S12 | Vek | spacetheft | epica | 10 | B094, B095, B098, B078, B081, B084, B088, B064… |
| S13 | Capitão Tzough | spacetheft | comum | 16 | B079, B054, B055, B058, B064, B073, B011, B012… |
| S14 | Genrir | spacetheft | rara | 11 | B094, B079, B088, B093, B058, B064, B065, B072… |
| S15 | Tersário | spacetheft | lendaria | 4 | B094, B094, B095, B084 |
| S16 | A Engenheira | spacetheft | comum | 16 | B078, B093, B055, B064, B065, B073, B011, B012… |
| S17 | Luna Stellar | spacetheft | rara | 11 | B075, B081, B091, B054, B058, B064, B072, B072… |
| S18 | Alekta | spacetheft | rara | 10 | B095, B079, B090, B047, B055, B064, B065, B072… |
| D01 | Junior Quissama | diario | rara | 9 | B078, B085, B088, B092, B060, B061, B076, B024… |
| D02 | Priscila Fontenelle | diario | rara | 9 | B078, B085, B088, B059, B060, B069, B015, B030… |
| D03 | Pedro Souza | diario | epica | 10 | B096, B096, B099, B078, B085, B086, B088, B092… |
| D04 | Kelly Fontenelle | diario | rara | 9 | B075, B081, B087, B059, B059, B061, B016, B025… |
| D05 | Vinícius Silva | diario | lendaria | 3 | B096, B082, B088 |
| D06 | Jennifer de Morais | diario | comum | 13 | B084, B060, B074, B015, B016, B024, B025, B030… |
| D07 | Ingrid Marques | diario | comum | 12 | B085, B059, B061, B074, B016, B024, B025, B029… |
| D08 | Glenda Mendes | diario | rara | 9 | B097, B082, B088, B059, B060, B069, B074, B030… |
| D09 | Diego Tavolieri | diario | epica | 9 | B094, B096, B078, B079, B085, B086, B088, B059… |
| D10 | Sra. Olívia | diario | lendaria | 3 | B096, B075, B088 |
| D11 | Cara-de-Larva | diario | rara | 10 | B099, B082, B087, B059, B061, B069, B074, B029… |
| D12 | Agouro | diario | epica | 9 | B096, B097, B078, B081, B084, B088, B090, B059… |
| D13 | Suéten Marques | diario | comum | 13 | B082, B060, B069, B076, B015, B016, B025, B029… |
| D14 | Filipo Brandolini | diario | comum | 12 | B082, B059, B069, B076, B015, B024, B025, B029… |
| D15 | O Pai | diario | comum | 12 | B081, B088, B061, B015, B016, B024, B025, B029… |
| D16 | A Mãe | diario | rara | 9 | B096, B086, B090, B092, B059, B074, B076, B035… |
| D17 | A Avó | diario | comum | 12 | B088, B059, B074, B076, B015, B016, B024, B029… |
| D18 | O Cão | diario | epica | 9 | B094, B096, B078, B080, B086, B087, B089, B093… |
| D19 | Manu | diario | comum | 12 | B078, B092, B061, B015, B016, B024, B025, B029… |
| M01 | Hyde | misterio | epica | 14 | B097, B097, B098, B081, B082, B086, B088, B091… |
| M02 | Agente Sete | misterio | rara | 16 | B098, B084, B092, B046, B053, B055, B062, B063… |
| M03 | Diana | misterio | comum | 24 | B091, B046, B053, B054, B057, B063, B065, B068… |
| M04 | Matt Pontas | misterio | comum | 24 | B078, B046, B052, B053, B058, B063, B067, B071… |
| M05 | Padre Tomas | misterio | rara | 16 | B099, B087, B090, B046, B052, B056, B057, B062… |
| M06 | Benjamin Karnudo | misterio | comum | 23 | B086, B042, B053, B056, B057, B063, B068, B069… |
| M07 | Agente Seis | misterio | comum | 24 | B090, B046, B051, B054, B057, B062, B067, B068… |
| M08 | Dra. Helena Valença | misterio | epica | 13 | B096, B098, B075, B078, B083, B086, B089, B090… |
| M09 | Richard Falkner | misterio | rara | 15 | B078, B080, B088, B042, B053, B056, B057, B063… |
| M10 | Releuz | misterio | lendaria | 2 | B096, B100 |
| M11 | X | misterio | rara | 15 | B078, B083, B091, B044, B051, B053, B056, B063… |
| M12 | James Harrow | misterio | epica | 13 | B095, B097, B098, B078, B083, B086, B088, B093… |
| B01 | Édelin Lys | belfex | rara | 16 | B078, B080, B089, B042, B046, B054, B057, B062… |
| B02 | Tack Ergson | belfex | comum | 23 | B075, B044, B047, B053, B056, B059, B065, B068… |
| B03 | Jork Caravel | belfex | lendaria | 1 | B096 |
| B04 | Peredun | belfex | comum | 23 | B091, B046, B052, B056, B058, B063, B067, B069… |
| B05 | Primus Senan | belfex | epica | 14 | B094, B097, B099, B080, B085, B086, B088, B092… |

## Batalhas

| Ponto | Tipo | Região | Lado | Inimigo(s) | Cartas (ordem de jogo) | Poder médio | Substituível |
|---|---|---|---|---|---|---|---|
| B001 | evento | 1 | dir | Padre Tomas | M04 M06 M03 M07 B04 M09 M05 | 1427 | sim |
| B002 | normal | 1 | dir | Agente Sete | M04 M06 M03 M07 B04 B02 M02 | 1405 | sim |
| B003 | elite | 1 | cima | Primus Senan | J05 J23 J15 J34 J17 B01 B05 | 1415 | sim |
| B004 | normal | 1 | cima | Selina Polar | J05 J22 J13 J20 J33 J07 J17 | 1368 | sim |
| B005 | evento | 1 | cima | Selina Polar | J19 J22 J29 J13 J20 J34 J17 | 1348 | sim |
| B006 | elite | 1 | dir | Richard Falkner | M03 B04 B02 M02 M11 B05 M09 | 1498 | sim |
| B007 | normal | 1 | dir | Padre Tomas | M04 M06 M03 M07 B04 B02 M05 | 1418 | sim |
| B008 | normal | 1 | dir | Édelin Lys | M04 M06 M03 M07 B04 B02 B01 | 1408 | sim |
| B009 | normal | 1 | dir | Agente Sete | M04 M06 M03 M07 B04 B02 M02 | 1405 | sim |
| B010 | evento | 1 | dir | Padre Tomas | M04 M06 M03 M07 B04 M11 M05 | 1419 | sim |
| B011 | normal | 1 | baixo | Genrir | S13 S16 S01 S02 S07 B02 S14 | 1376 | sim |
| B012 | evento | 1 | baixo | Kord | S13 S16 S01 S02 S07 S17 S05 | 1365 | sim |
| B013 | normal | 1 | baixo | Genrir | S13 S16 S01 M06 S02 S07 S14 | 1350 | sim |
| B014 | normal | 1 | baixo | Vivian | S13 S16 S01 M04 S02 S07 S08 | 1328 | sim |
| B015 | normal | 1 | esq | Priscila Fontenelle | D13 D15 D06 D17 D19 D14 D02 | 1375 | sim |
| B016 | normal | 1 | esq | Kelly Fontenelle | D13 D15 D06 D17 D07 D19 D04 | 1353 | sim |
| B017 | normal | 1 | cima | Efepar | J19 J14 J23 J01 J15 J16 J34 | 1322 | sim |
| B018 | normal | 1 | cima | Selina Polar | J05 J23 J01 J13 J20 J16 J17 | 1360 | sim |
| B019 | normal | 1 | cima | Selina Polar | J14 J22 J15 J29 J33 J07 J17 | 1360 | sim |
| B020 | normal | 1 | cima | Efepar | J05 J01 J29 J13 J33 J16 J34 | 1361 | sim |
| B021 | normal | 1 | cima | Selina Polar | J19 J14 J22 J15 J20 J07 J17 | 1333 | sim |
| B022 | normal | 1 | baixo | Alekta | S13 S16 S01 M06 S02 S07 S18 | 1347 | sim |
| B023 | normal | 1 | baixo | Luna Stellar | S13 S16 S01 S02 S07 M03 S17 | 1328 | sim |
| B024 | normal | 1 | esq | Junior Quissama | D15 D06 D17 D07 D19 D14 D01 | 1371 | sim |
| B025 | normal | 1 | esq | Kelly Fontenelle | D13 D15 D06 D07 D19 D14 D04 | 1369 | sim |
| B026 | normal | 1 | cima | Efepar | J14 J22 J23 J01 J29 J13 J34 | 1336 | sim |
| B027 | normal | 1 | dir | Richard Falkner | M04 M06 M03 M07 B04 B02 M09 | 1413 | sim |
| B028 | normal | 1 | baixo | Eric | S13 S16 S01 S02 S07 B04 S03 | 1343 | sim |
| B029 | normal | 1 | esq | Cara-de-Larva | D13 D15 D17 D07 D19 D14 D11 | 1364 | sim |
| B030 | evento | 1 | esq | Priscila Fontenelle | D15 D06 D07 D19 D14 D08 D02 | 1418 | sim |
| B031 | evento | 1 | dir | Édelin Lys | M04 M03 M07 B04 B02 M02 B01 | 1435 | sim |
| B032 | normal | 1 | dir | Richard Falkner | M04 M06 M03 M07 B04 B02 M09 | 1413 | sim |
| B033 | normal | 1 | dir | Édelin Lys | M04 M06 M03 M07 B04 B02 B01 | 1408 | sim |
| B034 | normal | 1 | dir | Padre Tomas | M04 M06 M03 M07 B04 B02 M05 | 1418 | sim |
| B035 | normal | 1 | esq | A Mãe | D13 D15 D06 D17 D07 D14 D16 | 1347 | sim |
| B036 | normal | 1 | esq | Priscila Fontenelle | D13 D15 D06 D17 D19 D14 D02 | 1375 | sim |
| B037 | evento | 1 | cima | Selina Polar | J19 J05 J23 J15 J20 J34 J17 | 1338 | sim |
| B038 | normal | 1 | dir | X | M04 M06 M03 M07 B04 B02 M11 | 1405 | sim |
| B039 | normal | 1 | baixo | Kord | S13 S16 S01 S02 S07 M07 S05 | 1349 | sim |
| B040 | elite | 1 | esq | Pedro Souza | D13 D06 D17 D08 D11 D04 D03 | 1457 | sim |
| B041 | normal | 1 | esq | A Mãe | D13 D06 D17 D07 D19 D14 D16 | 1366 | sim |
| B042 | normal | 2 | cima | Richard Falkner | M06 J01 J15 J07 J34 B01 M09 | 1419 | sim |
| B043 | normal | 1 | cima | Efepar | J14 J05 J23 J33 J16 J07 J34 | 1354 | sim |
| B044 | normal | 2 | cima | X | J23 J13 J20 J34 J17 B02 M11 | 1421 | sim |
| B045 | evento | 1 | dir | Padre Tomas | M04 M06 M03 M07 B02 M02 M05 | 1425 | sim |
| B046 | normal | 2 | dir | Padre Tomas | M04 M03 M07 B04 M02 B01 M05 | 1448 | sim |
| B047 | normal | 2 | baixo | Alekta | S01 S02 S07 B02 S03 S05 S18 | 1484 | sim |
| B048 | evento | 1 | baixo | Genrir | S13 S16 S01 S02 S07 S17 S14 | 1378 | sim |
| B049 | evento | 1 | baixo | Vivian | S13 S16 S01 S02 S07 S03 S08 | 1371 | sim |
| B050 | evento | 1 | esq | Cara-de-Larva | D13 D15 D06 D07 D19 D01 D11 | 1369 | sim |
| B051 | elite | 2 | cima | Hyde | J22 M07 J34 J17 M11 M08 M01 | 1512 | sim |
| B052 | evento | 2 | cima | James Harrow | M04 J29 J34 B04 J17 M05 M12 | 1464 | sim |
| B053 | normal | 2 | dir | Richard Falkner | M04 M06 M03 B02 M02 M11 M09 | 1435 | sim |
| B054 | normal | 2 | baixo | Vivian | S13 S02 M03 M07 S17 B01 S08 | 1434 | sim |
| B055 | normal | 2 | baixo | Alekta | S13 S16 S01 S07 M02 S03 S18 | 1400 | sim |
| B056 | evento | 2 | dir | Padre Tomas | M06 B04 B02 M11 B05 M09 M05 | 1502 | sim |
| B057 | evento | 2 | dir | Dra. Helena Valença | M06 M03 M07 B01 M09 M05 M08 | 1504 | sim |
| B058 | normal | 2 | baixo | Genrir | S13 M04 S02 B04 S17 S05 S14 | 1448 | sim |
| B059 | miniboss | 2 | esq | Diego Tavolieri / O Cão | D14 D08 B02 D04 D02 D12 D09 · D17 D07 D16 D11 D04 D12 D18 | 1536 | não |
| B060 | elite | 2 | esq | Hyde | D13 D06 D01 D08 B05 D02 M01 | 1500 | sim |
| B061 | evento | 2 | esq | Diego Tavolieri | D15 D07 D19 D01 D11 D04 D09 | 1477 | sim |
| B062 | miniboss | 2 | cima | James Harrow / James Harrow / Hyde | J19 J14 J34 J17 M02 M08 M12 · J05 J33 J34 J17 B05 M05 M12 · J16 M07 J34 J17 B01 M08 M01 | 1495 | não |
| B063 | normal | 2 | dir | Richard Falkner | M04 M06 M03 B04 M02 M11 M09 | 1429 | sim |
| B064 | miniboss | 2 | baixo | Capitã Nastácia / Capitã Nastácia / Lias Hardman | S01 S07 S17 S18 S14 S12 S09 · S16 S07 S03 B05 S05 S08 S09 · S13 S01 M11 S05 S08 S06 S04 | 1555 | não |
| B065 | evento | 2 | baixo | Vek | S16 M03 B02 S03 S18 S14 S12 | 1553 | sim |
| B066 | evento | 2 | cima | Hyde | J29 J16 J07 J34 J17 M02 M01 | 1473 | sim |
| B067 | normal | 2 | cima | Richard Falkner | M04 J33 M07 J34 B04 J17 M09 | 1421 | sim |
| B068 | normal | 2 | dir | Padre Tomas | M06 M03 M07 B02 M02 B01 M05 | 1465 | sim |
| B069 | normal | 2 | esq | Priscila Fontenelle | D13 M06 D14 B04 D08 D11 D02 | 1441 | sim |
| B070 | evento | 2 | cima | James Harrow | J19 J14 J01 J34 M11 M05 M12 | 1433 | sim |
| B071 | elite | 2 | dir | James Harrow | M04 M06 B01 M09 M05 M08 M12 | 1528 | sim |
| B072 | miniboss | 2 | baixo | Capitã Nastácia / Lias Hardman / Capitã Nastácia | M07 B04 M11 S17 S03 S06 S09 · S01 S02 S05 S08 S18 S12 S04 · S02 M03 S17 S08 S14 S06 S09 | 1585 | não |
| B073 | normal | 2 | baixo | Alekta | S13 S16 M04 S07 S03 S05 S18 | 1420 | sim |
| B074 | normal | 2 | esq | Cara-de-Larva | D06 D17 D07 D16 D08 B02 D11 | 1426 | sim |
| B075 | evento | 3 | esq | Sra. Olívia | J23 B02 S17 D04 M08 S09 D10 | 1592 | sim |
| B076 | evento | 2 | esq | Pedro Souza | D13 D17 D14 D01 D16 M09 D03 | 1470 | sim |
| B077 | evento | 2 | dir | Hyde | M04 M07 B02 M02 M11 B01 M01 | 1499 | sim |
| B078 | miniboss | 3 | dir | Diego Tavolieri / James Harrow / Pedro Souza | V21 D19 M11 S03 D18 S06 D09 · M04 V17 B01 D02 D12 M08 M12 · S16 V25 D01 M09 S06 S12 D03 | 1565 | não |
| B079 | normal | 3 | baixo | Capitã Nastácia | S13 J13 S05 S18 S14 D09 S09 | 1597 | sim |
| B080 | normal | 3 | cima | Vivian | S01 J07 B01 B05 M09 D18 S08 | 1515 | sim |
| B081 | miniboss | 3 | baixo | Jelles / Jelles | D15 J34 S03 S12 S04 M01 S10 · S07 S17 D04 D12 S09 S04 S10 | 1630 | não |
| B082 | evento | 3 | esq | Vinícius Silva | D13 D14 D08 D11 S06 M01 D05 | 1570 | sim |
| B083 | normal | 3 | cima | James Harrow | J22 J15 J34 J17 M11 M08 M12 | 1494 | sim |
| B084 | elite | 3 | baixo | Tersário | D06 M02 D12 S08 S12 S04 S15 | 1637 | sim |
| B085 | elite | 3 | esq | Pedro Souza | D07 V06 D01 B05 D02 D09 D03 | 1565 | não |
| B086 | miniboss | 3 | cima | Pedro Souza / Capitã Nastácia / Hyde | J01 J17 D16 J02 D18 M08 D03 · J05 J34 J17 J30 B05 S06 S09 · M06 J34 J17 V09 M12 D09 M01 | 1551 | não |
| B087 | normal | 3 | baixo | Capitã Nastácia | S02 J20 D11 D04 M05 D18 S09 | 1544 | sim |
| B088 | miniboss | 3 | esq | O'reilly / Vinícius Silva / Sra. Olívia | J29 B05 D02 M12 J37 S14 S06 · D17 D01 D08 D12 D09 M01 D05 · D15 S03 M09 S12 D03 S04 D10 | 1629 | não |
| B089 | normal | 3 | cima | Dra. Helena Valença | J19 J33 J17 B01 S05 D18 M08 | 1507 | sim |
| B090 | normal | 3 | dir | Alekta | J16 M07 D16 M05 D12 M08 S18 | 1562 | sim |
| B091 | evento | 3 | dir | Hyde | M03 B04 V01 M11 S17 S04 M01 | 1563 | não |
| B092 | normal | 3 | dir | Pedro Souza | J14 D19 D01 D16 M02 B05 D03 | 1497 | sim |
| B093 | elite | 3 | baixo | Jelles | S16 D18 S08 M12 S14 S06 S10 | 1646 | sim |
| B094 | guardiao | 4 | baixo | Tersário / Tersário | V19 B05 S14 S06 S09 S10 S15 · V24 S05 D18 D09 S12 S10 S15 | 1699 | não |
| B095 | elite | 4 | baixo | Tersário | V12 V20 S18 M12 S12 S04 S15 | 1699 | não |
| B096 | guardiao | 4 | esq | Releuz / Sra. Olívia | V04 D16 D12 D18 D03 B03 M10 · J34 V07 M08 D09 D03 D10 D05 | 1667 | não |
| B097 | guardiao | 4 | cima | Hyde / Hyde | V02 J17 D12 J24 V10 S09 M01 · V03 D08 B05 V14 J10 M12 M01 | 1626 | não |
| B098 | guardiao | 4 | dir | Lias Hardman / Hyde | V18 V13 S08 V16 M08 S06 S04 · V05 M02 V23 M12 S12 V15 M01 | 1645 | não |
| B099 | evento | 4 | cima | Professor Taliver | D11 B05 M05 J11 D03 S04 J36 | 1684 | não |
| B100 | boss | 4 | centro | A Besta | V02 J03 S11 B01 V15 M01 M10 | 1598 | não |
