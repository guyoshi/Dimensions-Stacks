# Modo história: proposta das 100 batalhas (Etapa 2, 28/10/2026)

**PROPOSTA aguardando aprovação.** Gerada por `prototipo/tools/gerar_batalhas_historia.py` (semente fixa, `dados/historia_batalhas.json`). Os ids dos pontos são os do mapa; nada aqui muda o mapa.

## Regras propostas

- **Tema por região:** esquerda = Diário Sobrenatural · cima = Ciclo de Jesed · direita = Viajantes Dimensionais · baixo = Spacetheft. Mistério Oculto e Édelin Lys aparecem como visitantes nas regiões média e interna; da região 3 em diante também entram cartas de outras séries.
- **Receita de raridades por inimigo (7 cartas)** cresce da região 1 (quase só comuns) à 4 (épicas e lendárias): ver tabela abaixo. O jogador começa com 6 comuns e 1 épica.
- **Inimigo = um personagem das cartas**, o de maior poder do baralho dele; o avatar é a foto dessa carta. Miniboss: 2 ou 3 oponentes (duelo de 3 ou 4). Guardiões: 2 oponentes (duelo de 3). Boss: **A Besta + as 6 lendárias mais fortes** (a Besta é exclusiva do Boss; as 8 cartas da União são libertadas nos minibosses e ficam com o jogador).
- **Ordem de jogo do inimigo:** da mais fraca para a mais forte (a mais forte no fim). Proposta, ajustável.
- **A Besta** só aparece no Boss. As **8 cartas da União** não aparecem em inimigos: cada uma é libertada em um miniboss (regra nova) e entra na equipe do jogador.
- **Distribuição equilibrada:** cada escolha pega a carta menos usada da raridade pedida, e um passo de reparo garante que **toda carta fora da União apareça em pelo menos 3 batalhas** (sem isso, o jogador nunca veria a carta).
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

- Batalhas: **100** (Counter({'normal': 53, 'evento': 24, 'elite': 10, 'miniboss': 8, 'guardiao': 4, 'boss': 1})); substituíveis: **87**.
- Cartas que aparecem em inimigos: **108 de 116** (a Besta só no Boss).
- Cartas com menos aparições (mais exclusivas): Édelin Lys (B01, 0x), Jennifer de Morais (D06, 0x), Mark Polar (J03, 0x), Hyde (M01, 0x), Releuz (M10, 0x), Jasmey Badrock (S01, 0x), Bruno Lins (V02, 0x), Brenda Koraveli (V15, 0x), A Besta (S11, 1x), Peredun (B04, 3x), Rendar (J12, 3x), Alveris Polar (J25, 3x).
- Cartas com mais aparições: Seti (V19, 13x), Shirley Ainsworth (V21, 13x), Vek (S12, 14x), Buni (S07, 15x), Jelles (S10, 15x), Genrir (S14, 15x), Luna Stellar (S17, 15x), Alekta (S18, 15x).

## Repetições por carta

| Carta | Nome | Série | Raridade | Aparições | Batalhas |
|---|---|---|---|---|---|
| J01 | Jokara Amarëa | jesed | epica | 6 | B095, B099, B081, B086, B062, B062 |
| J02 | Nestira Amarëa | jesed | comum | 7 | B044, B052, B070, B018, B019, B026, B037 |
| J03 | Mark Polar | jesed | lendaria | 0 |  |
| J04 | Gabasteri | jesed | rara | 4 | B079, B088, B052, B004 |
| J05 | Maletar | jesed | rara | 4 | B082, B051, B066, B003 |
| J06 | Platisa | jesed | rara | 5 | B081, B092, B062, B017, B043 |
| J07 | Mariv | jesed | rara | 5 | B080, B086, B051, B067, B021 |
| J08 | Kaelina Polar | jesed | epica | 6 | B095, B099, B085, B086, B062, B066 |
| J09 | Alyra Polar | jesed | epica | 6 | B094, B099, B082, B086, B089, B062 |
| J10 | Daryon Polar | jesed | lendaria | 4 | B096, B097, B086, B100 |
| J11 | Cal Edran | jesed | rara | 4 | B082, B044, B062, B003 |
| J12 | Rendar | jesed | lendaria | 3 | B094, B078, B093 |
| J13 | Nynestra | jesed | comum | 7 | B080, B066, B004, B005, B018, B020, B043 |
| J14 | Cal Kadrir | jesed | comum | 7 | B083, B062, B004, B017, B018, B021, B037 |
| J15 | Dareth Polar | jesed | epica | 7 | B097, B098, B083, B086, B052, B070, B003 |
| J16 | Elis Nular | jesed | comum | 7 | B042, B062, B004, B017, B019, B021, B043 |
| J17 | Selina Polar | jesed | rara | 5 | B097, B089, B062, B070, B037 |
| J18 | Vetarius Polar | jesed | comum | 7 | B044, B062, B003, B017, B018, B026, B037 |
| J19 | Cal Kerath | jesed | comum | 7 | B091, B062, B070, B017, B020, B026, B037 |
| J20 | Jelatira | jesed | rara | 5 | B097, B042, B062, B067, B019 |
| J21 | Nefestra | jesed | rara | 5 | B075, B044, B062, B005, B020 |
| J22 | Sefter | jesed | comum | 7 | B087, B062, B004, B017, B019, B021, B043 |
| J23 | Kedran | jesed | comum | 7 | B044, B052, B003, B005, B020, B026, B043 |
| J24 | Litara | jesed | comum | 7 | B086, B066, B003, B005, B019, B021, B026 |
| J25 | Alveris Polar | jesed | lendaria | 3 | B097, B099, B086 |
| J26 | Sumo Vigia | jesed | lendaria | 3 | B096, B078, B100 |
| J27 | Tair Nular | jesed | comum | 7 | B086, B062, B067, B005, B018, B021, B026 |
| J28 | Kalan Nular | jesed | comum | 7 | B044, B051, B004, B018, B019, B020, B043 |
| J29 | Orel Nular | jesed | comum | 7 | B089, B066, B004, B005, B020, B021, B037 |
| J30 | Kharvok | jesed | rara | 5 | B080, B086, B062, B067, B037 |
| J31 | Orionus Polar | jesed | lendaria | 3 | B096, B098, B100 |
| J32 | Raukhar | jesed | lendaria | 4 | B096, B075, B086, B100 |
| J33 | Tavra Vendrar | jesed | rara | 5 | B078, B087, B062, B003, B026 |
| J34 | Efepar | jesed | rara | 4 | B085, B044, B051, B018 |
| J35 | Liri | jesed | comum | 7 | B051, B052, B070, B017, B019, B020, B043 |
| J36 | Professor Taliver | jesed | rara | 4 | B078, B086, B066, B005 |
| J37 | Yndra | jesed | epica | 6 | B097, B079, B085, B086, B093, B062 |
| V01 | Breno Lins | viajantes | epica | 6 | B097, B098, B078, B078, B090, B056 |
| V02 | Bruno Lins | viajantes | lendaria | 0 |  |
| V03 | Banjo Lins | viajantes | epica | 7 | B094, B098, B078, B078, B091, B057, B077 |
| V04 | Beatriz Lins | viajantes | lendaria | 5 | B094, B097, B098, B078, B100 |
| V05 | Velho-Sábio | viajantes | lendaria | 5 | B095, B097, B098, B098, B091 |
| V06 | Erla | viajantes | epica | 7 | B094, B098, B078, B088, B093, B071, B006 |
| V07 | Lucan Veline | viajantes | comum | 13 | B075, B046, B063, B068, B002, B007, B009, B010… |
| V08 | Garmande Koraveli | viajantes | rara | 8 | B078, B086, B046, B068, B077, B008, B031, B034 |
| V09 | Ricochet Bombergue | viajantes | epica | 6 | B097, B098, B078, B078, B091, B071 |
| V10 | Korvo | viajantes | lendaria | 5 | B094, B097, B098, B098, B100 |
| V11 | Garien | viajantes | comum | 12 | B083, B053, B063, B001, B002, B006, B008, B027… |
| V12 | Anasin | viajantes | rara | 8 | B098, B088, B090, B056, B068, B001, B010, B045 |
| V13 | Saliens | viajantes | rara | 7 | B081, B088, B092, B056, B068, B006, B010 |
| V14 | Tio Frank | viajantes | rara | 8 | B083, B086, B046, B053, B071, B002, B027, B038 |
| V15 | Brenda Koraveli | viajantes | rara | 0 |  |
| V16 | Faka | viajantes | comum | 12 | B078, B056, B057, B077, B001, B007, B009, B010… |
| V17 | Lanigiah | viajantes | rara | 7 | B083, B090, B092, B053, B077, B006, B032 |
| V18 | Grande Pai Gaia | viajantes | comum | 12 | B080, B046, B056, B068, B002, B007, B009, B010… |
| V19 | Seti | viajantes | comum | 13 | B091, B053, B057, B071, B002, B007, B008, B010… |
| V20 | William McCroys | viajantes | rara | 8 | B098, B087, B046, B056, B071, B006, B009, B033 |
| V21 | Shirley Ainsworth | viajantes | comum | 13 | B089, B053, B056, B071, B001, B007, B008, B009… |
| V22 | Nicolas Corvane | viajantes | comum | 12 | B078, B046, B063, B077, B001, B006, B008, B009… |
| V23 | Erick Corvane | viajantes | comum | 12 | B078, B092, B057, B068, B002, B006, B008, B010… |
| V24 | Maria Santoro | viajantes | rara | 8 | B078, B089, B091, B063, B001, B007, B031, B045 |
| V25 | Eshley | viajantes | comum | 12 | B090, B053, B063, B001, B002, B007, B008, B009… |
| S01 | Jasmey Badrock | spacetheft | rara | 0 |  |
| S02 | Amanda | spacetheft | epica | 7 | B095, B079, B081, B084, B064, B064, B072 |
| S03 | Eric | spacetheft | rara | 10 | B079, B081, B093, B054, B064, B064, B072, B072… |
| S04 | Lias Hardman | spacetheft | epica | 8 | B094, B080, B081, B084, B064, B065, B072, B072 |
| S05 | Kord | spacetheft | rara | 11 | B094, B081, B047, B054, B058, B064, B065, B072… |
| S06 | O'reilly | spacetheft | rara | 11 | B079, B084, B093, B058, B064, B065, B072, B073… |
| S07 | Buni | spacetheft | comum | 15 | B084, B054, B058, B064, B073, B011, B012, B013… |
| S08 | Vivian | spacetheft | rara | 10 | B094, B084, B054, B058, B064, B064, B065, B011… |
| S09 | Capitã Nastácia | spacetheft | epica | 7 | B094, B075, B081, B084, B064, B072, B072 |
| S10 | Jelles | spacetheft | comum | 15 | B079, B047, B055, B064, B073, B011, B012, B013… |
| S11 | A Besta | spacetheft | lendaria | 1 | B100 |
| S12 | Vek | spacetheft | comum | 14 | B081, B047, B055, B064, B065, B011, B012, B013… |
| S13 | Capitão Tzough | spacetheft | rara | 10 | B095, B087, B047, B055, B064, B064, B072, B073… |
| S14 | Genrir | spacetheft | comum | 15 | B079, B054, B058, B064, B072, B073, B011, B012… |
| S15 | Tersário | spacetheft | epica | 7 | B094, B098, B081, B086, B092, B064, B072 |
| S16 | A Engenheira | spacetheft | lendaria | 6 | B094, B094, B095, B081, B081, B084 |
| S17 | Luna Stellar | spacetheft | comum | 15 | B093, B054, B055, B064, B072, B011, B012, B013… |
| S18 | Alekta | spacetheft | comum | 15 | B081, B047, B058, B064, B072, B073, B011, B013… |
| D01 | Junior Quissama | diario | epica | 8 | B096, B096, B086, B087, B088, B059, B060, B040 |
| D02 | Priscila Fontenelle | diario | comum | 13 | B082, B088, B074, B015, B016, B024, B025, B029… |
| D03 | Pedro Souza | diario | rara | 8 | B083, B059, B060, B061, B076, B035, B036, B050 |
| D04 | Kelly Fontenelle | diario | epica | 7 | B096, B078, B086, B086, B088, B088, B059 |
| D05 | Vinícius Silva | diario | epica | 7 | B096, B075, B082, B087, B088, B088, B059 |
| D06 | Jennifer de Morais | diario | lendaria | 0 |  |
| D07 | Ingrid Marques | diario | lendaria | 8 | B095, B096, B096, B082, B085, B088, B088, B088 |
| D08 | Glenda Mendes | diario | rara | 7 | B099, B088, B059, B069, B076, B025, B041 |
| D09 | Diego Tavolieri | diario | rara | 7 | B078, B088, B059, B069, B016, B030, B050 |
| D10 | Sra. Olívia | diario | rara | 7 | B086, B059, B060, B069, B015, B024, B040 |
| D11 | Cara-de-Larva | diario | rara | 7 | B096, B091, B059, B061, B074, B030, B040 |
| D12 | Agouro | diario | epica | 8 | B096, B096, B081, B088, B088, B088, B059, B061 |
| D13 | Suéten Marques | diario | comum | 12 | B085, B060, B074, B076, B015, B016, B024, B029… |
| D14 | Filipo Brandolini | diario | comum | 12 | B088, B060, B069, B074, B015, B016, B025, B029… |
| D15 | O Pai | diario | comum | 12 | B088, B059, B061, B015, B016, B024, B025, B029… |
| D16 | A Mãe | diario | comum | 12 | B086, B059, B074, B076, B016, B024, B025, B029… |
| D17 | A Avó | diario | comum | 12 | B082, B059, B061, B015, B016, B024, B025, B029… |
| D18 | O Cão | diario | rara | 7 | B099, B088, B059, B074, B076, B029, B040 |
| D19 | Manu | diario | comum | 13 | B075, B061, B069, B076, B015, B024, B025, B030… |
| M01 | Hyde | misterio | epica | 0 |  |
| M02 | Agente Sete | misterio | epica | 8 | B097, B078, B085, B089, B093, B051, B062, B076 |
| M03 | Diana | misterio | rara | 7 | B078, B090, B052, B060, B063, B070, B072 |
| M04 | Matt Pontas | misterio | comum | 4 | B042, B055, B065, B072 |
| M05 | Padre Tomas | misterio | comum | 4 | B090, B046, B067, B072 |
| M06 | Benjamin Karnudo | misterio | rara | 7 | B080, B047, B055, B057, B062, B066, B072 |
| M07 | Agente Seis | misterio | rara | 8 | B096, B089, B055, B057, B064, B072, B073, B077 |
| M08 | Dra. Helena Valença | misterio | comum | 4 | B042, B054, B068, B069 |
| M09 | Richard Falkner | misterio | comum | 4 | B042, B058, B067, B072 |
| M10 | Releuz | misterio | lendaria | 0 |  |
| M11 | X | misterio | epica | 8 | B097, B080, B083, B090, B092, B051, B060, B064 |
| M12 | James Harrow | misterio | rara | 7 | B075, B042, B052, B057, B063, B070, B072 |
| B01 | Édelin Lys | belfex | epica | 0 |  |
| B02 | Tack Ergson | belfex | comum | 4 | B092, B059, B065, B077 |
| B03 | Jork Caravel | belfex | comum | 4 | B087, B047, B067, B069 |
| B04 | Peredun | belfex | lendaria | 3 | B094, B097, B099 |
| B05 | Primus Senan | belfex | rara | 7 | B085, B042, B053, B061, B062, B071, B074 |

## Batalhas

| Ponto | Tipo | Região | Lado | Inimigo(s) | Cartas (ordem de jogo) | Poder médio | Substituível |
|---|---|---|---|---|---|---|---|
| B001 | evento | 1 | dir | Maria Santoro | V16 V25 V22 V21 V11 V12 V24 | 1395 | sim |
| B002 | normal | 1 | dir | Tio Frank | V19 V18 V23 V25 V07 V11 V14 | 1355 | sim |
| B003 | elite | 1 | cima | Dareth Polar | J18 J23 J24 J05 J11 J33 J15 | 1493 | sim |
| B004 | normal | 1 | cima | Gabasteri | J29 J22 J14 J16 J28 J13 J04 | 1323 | sim |
| B005 | evento | 1 | cima | Professor Taliver | J29 J23 J13 J24 J27 J21 J36 | 1365 | sim |
| B006 | elite | 1 | dir | Erla | V23 V22 V11 V20 V17 V13 V06 | 1486 | sim |
| B007 | normal | 1 | dir | Maria Santoro | V19 V18 V16 V25 V07 V21 V24 | 1353 | sim |
| B008 | normal | 1 | dir | Garmande Koraveli | V19 V23 V25 V22 V21 V11 V08 | 1368 | sim |
| B009 | normal | 1 | dir | William McCroys | V18 V16 V25 V22 V07 V21 V20 | 1366 | sim |
| B010 | evento | 1 | dir | Saliens | V19 V18 V16 V23 V07 V12 V13 | 1374 | sim |
| B011 | normal | 1 | baixo | Vivian | S14 S18 S17 S10 S12 S07 S08 | 1384 | sim |
| B012 | evento | 1 | baixo | Eric | S14 S17 S10 S12 S07 S08 S03 | 1423 | sim |
| B013 | normal | 1 | baixo | Capitão Tzough | S14 S18 S17 S10 S12 S07 S13 | 1371 | sim |
| B014 | normal | 1 | baixo | O'reilly | S14 S18 S17 S10 S12 S07 S06 | 1388 | sim |
| B015 | normal | 1 | esq | Sra. Olívia | D17 D19 D15 D02 D13 D14 D10 | 1337 | sim |
| B016 | normal | 1 | esq | Diego Tavolieri | D17 D16 D15 D02 D13 D14 D09 | 1348 | sim |
| B017 | normal | 1 | cima | Platisa | J35 J18 J19 J22 J14 J16 J06 | 1321 | sim |
| B018 | normal | 1 | cima | Efepar | J18 J14 J02 J28 J13 J27 J34 | 1369 | sim |
| B019 | normal | 1 | cima | Jelatira | J35 J22 J02 J28 J16 J24 J20 | 1344 | sim |
| B020 | normal | 1 | cima | Nefestra | J29 J35 J19 J23 J28 J13 J21 | 1279 | sim |
| B021 | normal | 1 | cima | Mariv | J29 J22 J14 J16 J24 J27 J07 | 1332 | sim |
| B022 | normal | 1 | baixo | Kord | S14 S18 S17 S10 S12 S07 S05 | 1382 | sim |
| B023 | normal | 1 | baixo | Eric | S14 S18 S17 S10 S12 S07 S03 | 1388 | sim |
| B024 | normal | 1 | esq | Sra. Olívia | D17 D19 D16 D15 D02 D13 D10 | 1333 | sim |
| B025 | normal | 1 | esq | Glenda Mendes | D17 D19 D16 D15 D02 D14 D08 | 1358 | sim |
| B026 | normal | 1 | cima | Tavra Vendrar | J18 J19 J02 J23 J24 J27 J33 | 1383 | sim |
| B027 | normal | 1 | dir | Tio Frank | V18 V25 V22 V07 V21 V11 V14 | 1376 | sim |
| B028 | normal | 1 | baixo | Capitão Tzough | S14 S18 S17 S10 S12 S07 S13 | 1371 | sim |
| B029 | normal | 1 | esq | O Cão | D17 D16 D15 D13 D02 D14 D18 | 1345 | sim |
| B030 | evento | 1 | esq | Cara-de-Larva | D17 D19 D16 D15 D13 D09 D11 | 1381 | sim |
| B031 | evento | 1 | dir | Garmande Koraveli | V19 V16 V23 V21 V11 V24 V08 | 1389 | sim |
| B032 | normal | 1 | dir | Lanigiah | V19 V18 V16 V23 V22 V07 V17 | 1353 | sim |
| B033 | normal | 1 | dir | William McCroys | V19 V25 V22 V07 V21 V11 V20 | 1367 | sim |
| B034 | normal | 1 | dir | Garmande Koraveli | V19 V18 V16 V23 V25 V11 V08 | 1354 | sim |
| B035 | normal | 1 | esq | Pedro Souza | D17 D19 D15 D02 D13 D14 D03 | 1335 | sim |
| B036 | normal | 1 | esq | Pedro Souza | D17 D19 D16 D02 D13 D14 D03 | 1335 | sim |
| B037 | evento | 1 | cima | Kharvok | J29 J19 J18 J14 J02 J17 J30 | 1358 | sim |
| B038 | normal | 1 | dir | Tio Frank | V16 V23 V25 V22 V07 V21 V14 | 1369 | sim |
| B039 | normal | 1 | baixo | Vivian | S14 S18 S17 S10 S12 S07 S08 | 1384 | sim |
| B040 | elite | 1 | esq | Junior Quissama | D19 D16 D02 D18 D10 D11 D01 | 1476 | sim |
| B041 | normal | 1 | esq | Glenda Mendes | D19 D16 D15 D13 D02 D14 D08 | 1377 | sim |
| B042 | normal | 2 | cima | Jelatira | M09 M04 M08 J16 B05 M12 J20 | 1416 | sim |
| B043 | normal | 1 | cima | Platisa | J35 J22 J23 J16 J28 J13 J06 | 1330 | sim |
| B044 | normal | 2 | cima | Cal Edran | J18 J02 J23 J28 J21 J34 J11 | 1411 | sim |
| B045 | evento | 1 | dir | Maria Santoro | V19 V18 V07 V21 V11 V12 V24 | 1384 | sim |
| B046 | normal | 2 | dir | Garmande Koraveli | V18 M05 V22 V07 V20 V14 V08 | 1414 | sim |
| B047 | normal | 2 | baixo | Kord | S18 S10 S12 B03 S13 M06 S05 | 1433 | sim |
| B048 | evento | 1 | baixo | O'reilly | S18 S17 S10 S12 S07 S05 S06 | 1422 | sim |
| B049 | evento | 1 | baixo | O'reilly | S14 S18 S17 S10 S07 S05 S06 | 1420 | sim |
| B050 | evento | 1 | esq | Diego Tavolieri | D17 D19 D15 D02 D14 D03 D09 | 1364 | sim |
| B051 | elite | 2 | cima | X | J35 J28 J34 J05 J07 M02 M11 | 1502 | sim |
| B052 | evento | 2 | cima | Dareth Polar | J35 J02 J23 M03 M12 J04 J15 | 1447 | sim |
| B053 | normal | 2 | dir | Lanigiah | V19 V25 V21 V11 V14 B05 V17 | 1422 | sim |
| B054 | normal | 2 | baixo | Eric | M08 S14 S17 S07 S05 S08 S03 | 1448 | sim |
| B055 | normal | 2 | baixo | Agente Seis | M04 S17 S10 S12 S13 M06 M07 | 1418 | sim |
| B056 | evento | 2 | dir | Breno Lins | V18 V16 V21 V12 V20 V13 V01 | 1472 | sim |
| B057 | evento | 2 | dir | Banjo Lins | V19 V16 V23 M06 M07 M12 V03 | 1468 | sim |
| B058 | normal | 2 | baixo | O'reilly | M09 S14 S18 S07 S05 S08 S06 | 1446 | sim |
| B059 | miniboss | 2 | esq | Kelly Fontenelle / Agouro | B02 D15 D03 D10 D11 D01 D04 · D17 D16 D18 D09 D08 D05 D12 | 1530 | não |
| B060 | elite | 2 | esq | Junior Quissama | D13 D14 M03 D03 D10 M11 D01 | 1518 | sim |
| B061 | evento | 2 | esq | Agouro | D17 D19 D15 D03 B05 D11 D12 | 1462 | sim |
| B062 | miniboss | 2 | cima | Kaelina Polar / Agente Sete / Jokara Amarëa | J14 J16 M06 J17 J11 J08 J01 · J18 J22 J06 B05 J20 J37 M02 · J19 J27 J21 J33 J30 J09 J01 | 1536 | não |
| B063 | normal | 2 | dir | James Harrow | V25 V22 V07 V11 M03 V24 M12 | 1428 | sim |
| B064 | miniboss | 2 | baixo | Capitã Nastácia / X / Amanda | S12 S07 S13 S08 S06 S04 S09 · S14 S17 S13 S08 S03 S02 M11 · S18 S10 M07 S05 S03 S15 S02 | 1547 | não |
| B065 | evento | 2 | baixo | Lias Hardman | M04 B02 S12 S05 S08 S06 S04 | 1493 | sim |
| B066 | evento | 2 | cima | Kaelina Polar | J29 J13 J24 M06 J05 J36 J08 | 1449 | sim |
| B067 | normal | 2 | cima | Kharvok | M09 M05 B03 J27 J20 J07 J30 | 1452 | sim |
| B068 | normal | 2 | dir | Saliens | M08 V18 V23 V07 V12 V08 V13 | 1415 | sim |
| B069 | normal | 2 | esq | Glenda Mendes | D19 M08 D14 B03 D10 D09 D08 | 1431 | sim |
| B070 | evento | 2 | cima | Dareth Polar | J35 J19 J02 M03 M12 J17 J15 | 1444 | sim |
| B071 | elite | 2 | dir | Ricochet Bombergue | V19 V21 V20 V14 B05 V06 V09 | 1521 | sim |
| B072 | miniboss | 2 | baixo | Capitã Nastácia / Capitã Nastácia / Amanda | M09 M05 S13 M07 M12 S04 S09 · S14 S18 M06 S06 S03 S15 S09 · M04 S17 M03 S05 S03 S04 S02 | 1535 | não |
| B073 | normal | 2 | baixo | O'reilly | S14 S18 S10 S07 S13 M07 S06 | 1436 | sim |
| B074 | normal | 2 | esq | Cara-de-Larva | D16 D02 D13 D14 D18 B05 D11 | 1439 | sim |
| B075 | evento | 3 | esq | Raukhar | D19 V07 J21 M12 D05 S09 J32 | 1562 | sim |
| B076 | evento | 2 | esq | Agente Sete | D19 D16 D13 D03 D18 D08 M02 | 1475 | sim |
| B077 | evento | 2 | dir | Banjo Lins | B02 V16 V22 M07 V08 V17 V03 | 1480 | sim |
| B078 | miniboss | 3 | dir | Sumo Vigia / Beatriz Lins / Rendar | V16 D09 J33 M02 V09 V03 J26 · V22 V24 V08 V06 V03 V01 V04 · V23 M03 J36 D04 V09 V01 J12 | 1634 | não |
| B079 | normal | 3 | baixo | Amanda | S14 S10 J04 S06 S03 J37 S02 | 1558 | sim |
| B080 | normal | 3 | cima | X | V18 J13 M06 J07 J30 S04 M11 | 1548 | sim |
| B081 | miniboss | 3 | baixo | A Engenheira / A Engenheira | S12 V13 S03 S15 S02 S09 S16 · S18 J06 S05 S04 J01 D12 S16 | 1619 | não |
| B082 | evento | 3 | esq | Ingrid Marques | D17 D02 J05 J11 J09 D05 D07 | 1545 | sim |
| B083 | normal | 3 | cima | X | J14 V11 D03 V14 V17 J15 M11 | 1526 | sim |
| B084 | elite | 3 | baixo | A Engenheira | S07 S08 S06 S04 S02 S09 S16 | 1633 | sim |
| B085 | elite | 3 | esq | Ingrid Marques | D13 J34 B05 J37 M02 J08 D07 | 1606 | sim |
| B086 | miniboss | 3 | cima | Alveris Polar / Raukhar / Daryon Polar | D16 D10 J36 J37 J08 D01 J25 · J27 V08 J07 J09 J01 D04 J32 · J24 V14 J30 J15 S15 D04 J10 | 1631 | não |
| B087 | normal | 3 | baixo | Junior Quissama | J22 B03 S13 V20 J33 D01 D05 | 1533 | sim |
| B088 | miniboss | 3 | esq | Ingrid Marques / Ingrid Marques / Ingrid Marques | D14 V13 D08 D05 D04 D12 D07 · D15 V12 D18 D01 D04 D12 D07 · D02 D09 J04 D05 D12 V06 D07 | 1623 | não |
| B089 | normal | 3 | cima | Agente Sete | J29 V21 V24 M07 J17 J09 M02 | 1483 | sim |
| B090 | normal | 3 | dir | Breno Lins | M05 V25 V12 M03 V17 M11 V01 | 1519 | sim |
| B091 | evento | 3 | dir | Velho-Sábio | V19 J19 V24 D11 V09 V03 V05 | 1567 | sim |
| B092 | normal | 3 | dir | X | B02 V23 J06 V17 V13 S15 M11 | 1521 | sim |
| B093 | elite | 3 | baixo | Rendar | S17 S06 S03 J37 M02 V06 J12 | 1642 | sim |
| B094 | guardiao | 4 | baixo | Beatriz Lins / Korvo | S08 S04 S09 B04 V06 S16 V04 · S05 J09 S15 S16 V03 J12 V10 | 1716 | não |
| B095 | elite | 4 | baixo | Velho-Sábio | S13 S02 J08 J01 S16 D07 V05 | 1696 | sim |
| B096 | guardiao | 4 | esq | Orionus Polar / Sumo Vigia | D11 D01 D04 D12 D07 J10 J31 · M07 D05 D01 D12 D07 J32 J26 | 1733 | não |
| B097 | guardiao | 4 | cima | Korvo / Beatriz Lins | J20 J37 J15 M02 B04 J25 V10 · J17 M11 V09 V01 V05 J10 V04 | 1718 | não |
| B098 | guardiao | 4 | dir | Korvo / Korvo | V12 J15 S15 V01 V05 V04 V10 · V20 V06 V09 V03 V05 J31 V10 | 1724 | não |
| B099 | evento | 4 | cima | Alveris Polar | D18 D08 J09 J01 J08 B04 J25 | 1676 | sim |
| B100 | boss | 4 | centro | A Besta | J10 V04 J31 J32 V10 J26 S11 | 1819 | não |
