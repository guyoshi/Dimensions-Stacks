# Dimensions Stacks — 87 cartas do baralho aprovado (v1.0)

> **APROVAÇÃO AUTORAL: 12/10/2026, escopo das 87 cartas.** Os 87 nomes/IDs, as descrições impressas, os atributos ATQ/DEF/INT/VEL e os IDs de Habilidade Especial atribuídos na tabela estão **APROVADOS como dados do jogo**. Isto **não** transforma descrições especulativas em fatos dos romances, nem dispensa testes de balanceamento e legibilidade. Fonte de autoridade: [CONTRATO_PARA_IA_IMPLEMENTADORA.md](CONTRATO_PARA_IA_IMPLEMENTADORA.md).

## 1. Contrato de tamanho e campos

- **Descrição curta:** máximo de **120 caracteres Unicode**, incluindo espaços e pontuação. A tabela registra `Tamanho` para facilitar verificação. Este limite é **regra editorial aprovada para as fichas** inspirada no espaço de texto das cartas físicas antigas, que apresentavam biografias em fonte muito pequena. O tamanho real depende de fonte, imagem e proporção da carta: **validar visualmente antes da arte final**.
- **Atributos naturais inteiros:** `ATQ`, `DEF`, `INT`, `VEL` entre 0 e 100. O autor **aprovou definitivamente o nome Ataque no lugar de Poder**. Manter os confrontos Ataque/Defesa e Inteligência/Velocidade; ATQ e INT são ofensivos.
- **Soma** é a soma dos 4 números naturais. Desempate: atributo escolhido, depois soma dos 4, depois soma ATQ + INT, conforme a regra confirmada.
- **Classes abaixo** são rótulos internos **aprovados como classificação analítica** para acompanhamento do equilíbrio, sem criar classe de personagem nem bônus: `Azar` (soma <150), `Frágil` (150–194), `Modesta` (195–239), `Padrão` (240–284), `Forte` (285–319), `Elite` (320+). **Somas não precisam ser iguais**: cartas deliberadamente ruins são parte do jogo e podem ser trocadas com habilidades.
- **União:** os 7 integrantes confirmados e Jennifer futura **receberam habilidades especiais de maior impacto, aprovadas pelo autor** ou controle, mas nem todos precisam ser fortes em todos os atributos. A atribuição registrada é **aprovada**, mas não significa exclusividade de habilidades: podem ser reaproveitadas em outras cartas futuras.
- **Fonte/Grau:** `Alta` = identidade/traço fundamentado em fonte canônica; `Média` = informação escassa ou material classificado como misto/histórico; `Baixa` = apenas nome/referência autoral, **não inventar feitos ou capacidades**. **Todos os valores, classes e especiais são decisões aprovadas para o jogo**, mesmo nas linhas com grau `Alta`, que indica confiança sobre a **biografia**, não a força no jogo.
- **Spoilers:** descrições de frente de carta evitam mortes, reviravoltas e identidades secretas. A conexão de Mark com fases temporais consta em fontes de autor e necessita aprovação editorial antes de aparecer publicamente.
- **Coluna da biblioteca:** por solicitação anterior do autor, **não preencher ainda a coluna `Carta atribuída` na biblioteca central dos especiais**, que continua vazia. Esta matriz contém uma **primeira sugestão reversível** de pareamento `carta ↔ habilidade`, não uma atribuição confirmada.

## 2. Fichas oficiais do baralho (87)

| ID | Nome da carta | Descrição curta (até 120) | Tamanho | ATQ | DEF | INT | VEL | Soma | Perfil | Especial sugerido | A União | Fonte | Grau |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| J01 | Jokara | Eterí inquieta e observadora, Jokara transforma perdas e dificuldades em caminhos de sobrevivência. | 99 | 43 | 65 | 83 | 22 | 213 | Modesta | AE-110 |  | J1 | Alta |
| J02 | Nestira | Irmã de Jokara, mantém o cuidado e a esperança enquanto adapta o grupo à vida na superfície. | 92 | 24 | 82 | 75 | 38 | 219 | Modesta | AE-087 |  | J1 | Alta |
| J03 | Mark Polar | Viajante marcado pelo Ciclo, atravessa épocas e identidades carregando memórias incompletas. | 92 | 72 | 70 | 94 | 74 | 310 | Forte | AE-116 | ⭐ União | J1/J3/J4 | Alta |
| J04 | Gabasteri | Sobrevivente experiente de Nadirion, conduz os outros pelo medo e pelo próprio desejo de controle. | 98 | 83 | 72 | 66 | 52 | 273 | Padrão | AE-069 |  | J1 | Alta |
| J05 | Maletar | Construtor vigoroso, aprende a erguer abrigos numa terra onde as antigas técnicas já não bastam. | 96 | 78 | 87 | 58 | 30 | 253 | Padrão | AE-076 |  | J1 | Alta |
| J06 | Platisa | Ecoante conhecedora de plantas e remédios, enfrenta o desconhecido sem deixar de cuidar dos outros. | 99 | 12 | 35 | 83 | 19 | 149 | Azar | AE-083 |  | J1 | Alta |
| J07 | Mariv | Jovem sobrevivente, encontra coragem no cuidado mútuo e aprende a seguir mesmo diante da perda. | 95 | 48 | 51 | 62 | 73 | 234 | Modesta | AE-090 |  | J1 | Alta |
| J08 | Kaelina | Soberana Polar diplomática, prefere acordos à violência e luta para preservar seu povo. | 87 | 47 | 68 | 91 | 48 | 254 | Padrão | AE-030 |  | J2 | Alta |
| J09 | Alyra | Soberana orgulhosa e determinada, responde à ameaça com força e exige obediência. | 81 | 80 | 70 | 63 | 61 | 274 | Padrão | AE-037 |  | J2 | Alta |
| J10 | Daryon Polar | Conselheiro hábil em fabricar versões dos fatos, usa o medo e a política para mover uma guerra. | 95 | 38 | 44 | 90 | 47 | 219 | Modesta | AE-096 |  | J2 | Alta |
| J11 | Cal Edran | Calandrir leal às soberanas, coloca o dever de protegê-las acima da própria segurança. | 86 | 87 | 88 | 57 | 72 | 304 | Forte | AE-074 |  | J2 | Alta |
| J12 | Rendar | Caçador Fendelar experiente, transforma a destruição de seu povo em resistência determinada. | 92 | 86 | 64 | 72 | 78 | 300 | Forte | AE-105 |  | J2 | Alta |
| J13 | Nynestra | Liderança Buldar, organiza alianças com os olhos voltados à água, à colheita e às famílias. | 91 | 40 | 70 | 89 | 61 | 260 | Padrão | AE-061 |  | J2 | Alta |
| J14 | Cal Kadrir | Jovem Calandrir disciplinado, mantém os ritos e o dever mesmo quando a política muda de rumo. | 93 | 79 | 83 | 55 | 59 | 276 | Padrão | AE-002 |  | J2 | Alta |
| J15 | Dareth Quatro-Dedos | Veterano de quatro dedos, retorna à arena para impedir que uma nova guerra destrua os civis. | 92 | 92 | 86 | 68 | 45 | 291 | Forte | AE-010 |  | J3 | Alta |
| J16 | Elis | Jovem Nular curiosa e veloz, memoriza passagens e descobre os segredos esquecidos de Kaeliran. | 94 | 36 | 41 | 90 | 93 | 260 | Padrão | AE-100 |  | J3 | Alta |
| J17 | Selina | Conselheira sagaz, lê as engrenagens do poder e aprende a agir antes de ter todas as certezas. | 94 | 29 | 43 | 96 | 52 | 220 | Modesta | AE-113 |  | J3 | Alta |
| J18 | Vetarius Polar | Soberano carismático de Kaeliran, confia na continuidade de sua dinastia e adia decisões difíceis. | 98 | 57 | 76 | 84 | 44 | 261 | Padrão | AE-022 |  | J3 | Alta |
| J19 | Kerath Polar | Calandrir firme e disciplinada, protege Kaeliran com coragem e um sentido inflexível do dever. | 94 | 84 | 91 | 74 | 64 | 313 | Forte | AE-072 |  | J3 | Alta |
| J20 | Jelatira | Anciã guardiã da memória familiar, preserva antigas histórias sem revelar todos os seus segredos. | 97 | 8 | 24 | 87 | 12 | 131 | Azar | AE-091 |  | J4 | Alta |
| J21 | Nefestra | Jovem sem um braço, busca nas lembranças respostas para a origem e a perda de sua família. | 90 | 16 | 30 | 91 | 37 | 174 | Frágil | AE-093 |  | J4 | Alta |
| J22 | Sefter | Jovem ágil e leal, sonha reconstruir o futuro e não aceita perder quem ama. | 75 | 50 | 53 | 72 | 85 | 260 | Padrão | AE-089 |  | J4 | Alta |
| J23 | Kedran | Irmão forte e protetor, prefere defender a vida presente a reabrir feridas do passado. | 86 | 82 | 79 | 57 | 70 | 288 | Forte | AE-017 |  | J4 | Alta |
| V01 | Breno Lins | Irmão mais velho dos Lins, controla a própria densidade e assume riscos para proteger os irmãos. | 96 | 85 | 90 | 58 | 52 | 285 | Forte | AE-078 |  | V | Alta |
| V02 | Bruno Lins Lee | Competitivo e sarcástico, Bruno usa gelo e frio com ousadia, mesmo quando o orgulho o atrapalha. | 96 | 94 | 70 | 74 | 78 | 316 | Forte | AE-021 | ⭐ União | V | Alta |
| V03 | Banjo Lins | Imaginativo e inseguro, Banjo descobre na telecinese uma coragem que julgava não possuir. | 89 | 80 | 38 | 73 | 64 | 255 | Padrão | AE-039 |  | V | Alta |
| V04 | Beatriz Lins | A mais nova dos Lins, manifesta fogo e caos em um poder difícil de controlar. | 77 | 93 | 31 | 48 | 55 | 227 | Modesta | AE-067 |  | V | Alta |
| V05 | Velho-Sábio / Auream | Mentor dos irmãos em Belfex, guarda conhecimento antigo sobre Korvo e a Sociedade de Tayo. | 90 | 62 | 83 | 96 | 39 | 280 | Padrão | AE-097 |  | V | Alta |
| V06 | Erla | Édion da Vigilância, enfrenta Korvo com disciplina e desconfiança mesmo contra a própria instituição. | 101 | 78 | 79 | 83 | 73 | 313 | Forte | AE-079 |  | V | Alta |
| V07 | Lucas Veline | Governante de Tayo, lida com os interesses e responsabilidades de uma cidade ameaçada. | 86 | 35 | 65 | 86 | 42 | 228 | Modesta | AE-062 |  | V | Média |
| V08 | Garmand | Mentor e integrante de Tayo, acompanha os primeiros passos de novos aprendizes. | 79 | 69 | 79 | 72 | 59 | 279 | Padrão | AE-095 |  | V-manuscrito | Alta |
| V09 | Ricochet Bombergue | Aliado da Sociedade de Tayo, participa das ações contra as ameaças que cercam Belfex. | 85 | 76 | 48 | 62 | 91 | 277 | Padrão | AE-041 |  | V | Baixa |
| V10 | Korvo | Dimensal e mago negro, recruta seguidores para impor sua visão de poder sem limites. | 84 | 98 | 79 | 94 | 72 | 343 | Elite | AE-068 |  | V | Alta |
| V11 | Gary | Ligado à Vigilância, serve secretamente aos interesses do mago Korvo. | 69 | 51 | 47 | 60 | 70 | 228 | Modesta | AE-055 |  | V | Alta |
| V12 | Anasin | Integrante da Patrulha de Korvo, usa ameaças e ilusões para desconcertar seus alvos. | 84 | 85 | 58 | 80 | 70 | 293 | Forte | AE-114 |  | V-manuscrito | Média |
| V13 | Saliens | Predador de presença intimidadora, atrai os irmãos para os planos da Patrulha de Korvo. | 87 | 83 | 68 | 59 | 76 | 286 | Forte | AE-046 |  | V-manuscrito | Alta |
| V14 | Tio Frank | Tio responsável pelos irmãos órfãos, representa a vida comum que eles deixam para trás. | 87 | 11 | 39 | 38 | 20 | 108 | Azar | AE-051 |  | V | Alta |
| V15 | Brenda | Aprendiz em Tayo, destaca-se pela confiança e pela atitude provocadora diante dos colegas. | 90 | 66 | 76 | 86 | 92 | 320 | Elite | AE-073 | ⭐ União | V-manuscrito | Média |
| V16 | Facka | Jovem Aracna curiosa e falante, guia os irmãos Lins pelos túneis subterrâneos de Belfex. | 88 | 36 | 40 | 75 | 89 | 240 | Padrão | AE-100 |  | V-manuscrito | Alta |
| V17 | Lanigiah | Rainha das Aracnas, combina imponência e astúcia ao testar a coragem de Banjo na grande caverna. | 96 | 76 | 82 | 95 | 43 | 296 | Forte | AE-096 |  | V-manuscrito | Alta |
| V18 | Grande Pai Gaia | Líder dos Obbs de Pinesoto, ergue raízes e troncos vivos para proteger seu povo dos invasores. | 94 | 80 | 99 | 89 | 34 | 302 | Forte | AE-103 |  | V-manuscrito | Alta |
| V19 | Seti | Líder de guerra dos Obbs, supera a desconfiança inicial e ajuda os irmãos durante o ataque a Pinesoto. | 102 | 79 | 85 | 66 | 82 | 312 | Forte | AE-105 |  | V-manuscrito | Alta |
| S01 | Jasmey Badrock | Pirata Dale impulsivo e carismático, sobrevive com um braço metálico e desafia o código da Lebargan. | 100 | 92 | 76 | 72 | 88 | 328 | Elite | AE-129 | ⭐ União | S | Alta |
| S02 | Amanda | Aliada de Jasmey, questiona as ordens de Jelles e ajuda a desafiar o domínio da Lebargan. | 89 | 56 | 82 | 73 | 65 | 276 | Padrão | AE-075 |  | S | Alta |
| S03 | Eric | Irmão de Amanda, sarcástico e curioso, arrisca tudo ao disputar o Olho de Domongo. | 82 | 48 | 47 | 77 | 86 | 258 | Padrão | AE-069 |  | S | Alta |
| S04 | Lias Hardman | Engenheiro inventivo, transforma sucata em soluções e mantém a esperança entre companheiros. | 92 | 18 | 41 | 96 | 30 | 185 | Frágil | AE-120 |  | S-misto | Alta |
| S05 | Kord | Companheiro vigoroso da tripulação de Jasmey, oferece proteção quando a força é necessária. | 91 | 78 | 81 | 51 | 51 | 261 | Padrão | AE-006 |  | S-misto | Média |
| S06 | O'reilly | Mecânico leal e aliado de Hardman, enfrenta os perigos do espaço ao lado dos companheiros. | 90 | 69 | 79 | 65 | 44 | 257 | Padrão | AE-080 |  | S-misto | Média |
| S07 | Buni | Integrante da equipe de Jasmey, enfrenta o cativeiro e a fuga com seus aliados. | 79 | 55 | 76 | 65 | 51 | 247 | Padrão | AE-099 |  | S-misto | Média |
| S08 | Vivian | Aliada com capacidades ligadas à manipulação atômica e genética, desafia os limites do corpo. | 93 | 83 | 70 | 89 | 65 | 307 | Forte | AE-101 |  | S | Média |
| S09 | Capitã Nastácia | Capitã lendária da Lebargan, comanda com discrição uma das naves mais temidas do espaço. | 88 | 91 | 93 | 82 | 75 | 341 | Elite | AE-048 |  | S-misto | Alta |
| S10 | Jelles | Comandante brutal da Lebargan, governa pelo medo e busca o poder escondido na Aurora. | 85 | 93 | 82 | 80 | 65 | 320 | Elite | AE-047 |  | S-misto | Alta |
| S11 | A Besta (Aurora) | Criatura despertada na Aurora, alvo da obsessão de Jelles e ameaça envolta em mistério. | 87 | 100 | 100 | 22 | 32 | 254 | Padrão | AE-024 |  | S/autor | Média |
| S12 | Vek | Dale leal ao antigo código, deixa o ressentimento transformar sua relação com Jasmey. | 85 | 75 | 64 | 59 | 68 | 266 | Padrão | AE-032 |  | S-misto | Alta |
| S13 | Capitão Tzough | Capitão pirata rival, negocia sob pressão e disputa vantagens nos perigos do espaço. | 84 | 81 | 74 | 84 | 57 | 296 | Forte | AE-059 |  | S | Média |
| S14 | Genrir | Rival provocador de Jasmey, surpreende ao participar da ruptura contra Jelles. | 78 | 80 | 53 | 49 | 85 | 267 | Padrão | AE-053 |  | S-misto | Alta |
| D01 | Junior | Escritor e amigo de Pedro, tenta organizar relatos marcados por culpa e eventos sobrenaturais. | 94 | 21 | 35 | 82 | 46 | 184 | Frágil | AE-098 |  | D1 | Alta |
| D02 | Priscila | Irmã mais velha de Kelly, enfrenta perdas e conflitos ao seguir os rastros do sobrenatural. | 91 | 39 | 77 | 75 | 58 | 249 | Padrão | AE-028 |  | D1 | Alta |
| D03 | Pedro | Amigo impulsivo de Junior, desafia o medo e o luto enquanto busca proteger quem ama. | 84 | 52 | 39 | 59 | 74 | 224 | Modesta | AE-071 |  | D1 | Alta |
| D04 | Kelly | Leitora inteligente, investiga segredos sobrenaturais na tentativa de reparar antigas culpas. | 93 | 14 | 26 | 91 | 38 | 169 | Frágil | AE-085 |  | D1 | Alta |
| D05 | Vinicius (Vini) | Jovem manco e marcado pela violência, tenta escapar do peso do passado e da reputação familiar. | 95 | 78 | 52 | 62 | 48 | 240 | Padrão | AE-031 |  | D1 | Alta |
| D06 | Jennifer | Sensível aos espíritos e às visões, Jennifer procura compreender o dom que a isola dos outros. | 94 | 71 | 77 | 91 | 70 | 309 | Forte | AE-112 | ⭐ União | D1 | Alta |
| D07 | Ingrid Carnam | Espírito da família Carnam, carrega uma história de sofrimento e manipulação sobrenatural. | 90 | 74 | 75 | 68 | 53 | 270 | Padrão | AE-084 |  | D1 | Alta |
| D08 | Glenda | Jovem que deseja ser jornalista, investiga acontecimentos estranhos para encontrar respostas. | 93 | 27 | 38 | 82 | 64 | 211 | Modesta | AE-092 |  | D2-histórico | Média |
| D09 | Diego | Personagem de Diário Sobrenatural ainda sem perfil narrativo verificável nos materiais consultados. | 99 | 36 | 42 | 46 | 48 | 172 | Frágil | AE-004 |  | Autor | Baixa |
| D10 | Avó de Kelly | Avó de Kelly, conhece acontecimentos antigos e mistérios ligados à proteção de Alvorada Alegre. | 95 | 8 | 34 | 90 | 13 | 145 | Azar | AE-086 |  | D2-histórico | Média |
| D11 | Cara-de-Larva | Demônio executor ligado à Besta da Carnificina, explora o medo das suas vítimas. | 80 | 90 | 69 | 54 | 71 | 284 | Padrão | AE-066 |  | D2-histórico | Média |
| D12 | Agouro | Entidade manipuladora, Agouro se alimenta do sofrimento e influencia os vivos e os espíritos. | 93 | 97 | 87 | 92 | 70 | 346 | Elite | AE-081 |  | D1/D2 | Alta |
| D13 | Suéten | Espírito da família Carnam, um dos elos de uma tragédia que atravessa gerações. | 79 | 62 | 71 | 55 | 35 | 223 | Modesta | AE-108 |  | D1 | Média |
| D14 | Filippo (Filipo, grafia a confirmar) | Jovem ligado à história de Manu, procura enfrentar os perigos que a cercam. | 75 | 34 | 46 | 63 | 65 | 208 | Modesta | AE-077 |  | D2-histórico | Média |
| D15 | Carnam (pai) | Espírito do pai da Família Carnam, relacionado a um Elo marcado pela violência e por uma arma. | 94 | 68 | 52 | 52 | 31 | 203 | Modesta | AE-106 |  | D1-Carnam | Alta |
| D16 | Isabela | Espírito da Família Carnam, cujo Elo é um álbum de fotografias ligado às lembranças do passado. | 95 | 23 | 39 | 66 | 46 | 174 | Frágil | AE-092 |  | D1-Carnam | Alta |
| D17 | Avó Carnam | Avó da Família Carnam, ligada à lente dos óculos que preserva seu vínculo sobrenatural. | 87 | 8 | 35 | 81 | 16 | 140 | Azar | AE-093 |  | D1-Carnam | Alta |
| D18 | Ibliso (cão) | Cão da Família Carnam, ligado à coleira que integra os misteriosos Elos manipulados por Agouro. | 95 | 54 | 42 | 25 | 92 | 213 | Modesta | AE-004 |  | D1-Carnam | Alta |
| M01 | Hyde | Detetive observador e obstinado, conecta pistas improváveis enquanto enfrenta suas próprias sombras. | 100 | 53 | 58 | 100 | 76 | 287 | Forte | AE-115 | ⭐ União | M | Alta |
| M02 | Agente Sete | Agente altamente treinada da SPAGE, combina disciplina, estratégia e convicções morais. | 87 | 83 | 96 | 90 | 80 | 349 | Elite | AE-130 |  | M | Alta |
| M03 | Diana | Figura decisiva no passado de Hyde, enfrenta a dor com humor, curiosidade e humanidade. | 87 | 18 | 31 | 72 | 78 | 199 | Modesta | AE-094 |  | M | Alta |
| M04 | Matt Pontas | Advogado habilidoso e sarcástico, abre caminhos por favores, influência e brechas jurídicas. | 92 | 24 | 38 | 91 | 61 | 214 | Modesta | AE-063 |  | M | Alta |
| M05 | Padre Tomas | Mentor moral de Hyde, ensina a fazer perguntas difíceis antes de condenar os outros. | 84 | 12 | 42 | 84 | 20 | 158 | Frágil | AE-008 |  | M | Alta |
| M06 | Benjamin Karnudo | Nome de um inimigo cuja perseguição conduz Hyde por uma trama de segredos e identidades. | 88 | 68 | 53 | 86 | 59 | 266 | Padrão | AE-117 |  | M | Alta |
| M07 | Agente Seis | Antigo mentor de Sete na SPAGE, conhece as operações e os segredos da organização. | 82 | 77 | 94 | 88 | 59 | 318 | Forte | AE-118 |  | M | Média |
| M08 | Dra. Helena Valença | Cientista da SPAGE, desenvolveu uma interface para acompanhar a saúde cerebral de astronautas. | 94 | 19 | 32 | 96 | 39 | 186 | Frágil | AE-012 |  | M | Alta |
| M09 | Richard Falkner (Bulldog) | Richard Falkner, chamado Bulldog, integra o universo investigativo de Mistério Oculto. | 86 | 81 | 86 | 66 | 54 | 287 | Forte | AE-082 |  | Autor | Baixa |
| M10 | Releuz (nome temporário) | Luzitano deixado na Terra pela Luz após os eventos de Órbita Oráculo. | 69 | 76 | 92 | 87 | 82 | 337 | Elite | AE-111 | ⭐ União | Autor | Baixa |
| M11 | X | Hacker anônimo e aliado de Sete, rastreia informações e sistemas que outros não conseguem acessar. | 98 | 8 | 19 | 99 | 45 | 171 | Frágil | AE-093 |  | M | Alta |
| M12 | James | Sobrevivente de uma missão secreta a Marte, sustenta uma visão radical de organização humana. | 93 | 75 | 62 | 96 | 51 | 284 | Padrão | AE-026 |  | M | Alta |
| B01 | Édelin Fils | Édelin Fils pertence à história de Belfex, cuja documentação narrativa ainda está em desenvolvimento. | 101 | 92 | 83 | 86 | 80 | 341 | Elite | AE-103 | ⭐ União | Autor | Baixa |

## 3. Efeito legível da habilidade indicada

| Especial | Nome na biblioteca | Cartas candidatas que o utilizam | Texto de regra integral (referência) |
| --- | --- | --- | --- |
| AE-002 | Muralha de Defesa | J14 | Sua carta de combate recebe +15 em Defesa nesta disputa. |
| AE-004 | Arrancada | D09, D18 | Sua carta de combate recebe +15 em Velocidade nesta disputa. |
| AE-006 | Dupla resistência | S05 | Uma carta de combate sua recebe +15 Defesa e +20 Velocidade nesta disputa. |
| AE-008 | Guarda equilibrada | M05 | Sua carta de combate recebe +10 Defesa e +10 Velocidade nesta disputa. |
| AE-010 | Ataque em dupla | J15 | Jogue as duas primeiras cartas consecutivas de seu baralho ativo; some o mesmo atributo das duas para obter um único valor de combate. |
| AE-012 | Inteligência → Ataque | M08 | Substitua o valor de Ataque pelo valor que a carta possui em Inteligência; Inteligência permanece igual. |
| AE-017 | Ataque → Defesa | J23 | Substitua o valor de Defesa pelo valor que sua carta possui em Ataque; Ataque permanece igual. |
| AE-021 | Atributo universal | V02 | Escolha um atributo: todos, inclusive você, devem disputar nele. Conflitos de imposição seguem o GDD. |
| AE-022 | Par ofensivo | J18 | Antes de declarar atributos, determine que todos usem o par Ataque/Defesa nesta disputa. |
| AE-024 | Ataque obrigatório | S11 | Dentro do par vigente, todos devem usar o atributo de ataque correspondente, inclusive você. |
| AE-026 | Forçar ataque rival | M12 | Escolha um adversário: ele deve usar o atributo de ataque do par vigente. |
| AE-028 | Proibir o ataque rival | D02 | Escolha um adversário: ele não pode usar o atributo de ataque do par vigente nesta disputa. |
| AE-030 | Escolha transferida | J08 | Nesta disputa, escolha qual dos dois atributos do par vigente um adversário utilizará; você continua escolhendo o seu normalmente. |
| AE-031 | Primeira à direita | D05 | Pegue a próxima carta do topo do baralho ativo do adversário à direita, exceto a já comprometida em combate. |
| AE-032 | Primeira à esquerda | S12 | Pegue a próxima carta do topo do baralho ativo do adversário à esquerda, exceto a já comprometida em combate. |
| AE-037 | Recompensa ofensiva | J09 | Se vencer atacando, tome também a próxima carta do topo do baralho ativo de um adversário derrotado. |
| AE-039 | Saque revelado | V03 | Revele até 2 cartas seguintes do baralho ativo de um adversário e escolha 1 para capturar; devolva a outra sem alterar a ordem. |
| AE-041 | Última da direita | V09 | Pegue a última carta do meio de reserva do adversário à direita. |
| AE-046 | Reserva dupla à esquerda | V13 | Pegue 2 cartas aleatórias do meio de reserva do adversário à esquerda, se disponíveis. |
| AE-047 | Tributo coletivo | S10 | Pegue 1 carta aleatória da reserva de cada adversário ativo que possua reserva. |
| AE-048 | Última de cada reserva | S09 | Pegue a última carta do meio de reserva de cada adversário ativo que tenha cartas nessa zona. |
| AE-051 | Troca escolhida | V14 | Troque 1 carta de seu baralho ativo, escolhida por você, por 1 carta aleatória do baralho ativo de um adversário. |
| AE-053 | Combatente da direita | S14 | Troque sua carta de combate pela do adversário à direita antes da comparação. |
| AE-055 | Troca de topos à direita | V11 | Troque a próxima carta do topo de seu baralho ativo com a próxima do adversário à direita. |
| AE-059 | Permuta das reservas à esquerda | S13 | Troque todo o seu meio de reserva pelo do adversário à esquerda. |
| AE-061 | Reservas giratórias à direita | J13 | Cada jogador ativo passa simultaneamente toda a própria reserva ao jogador ativo à direita. |
| AE-062 | Reservas giratórias à esquerda | V07 | Cada jogador ativo passa simultaneamente toda a própria reserva ao jogador ativo à esquerda. |
| AE-063 | Troca entre vizinhos | M04 | Faça o jogador à esquerda trocar 1 carta ativa escolhida com o da direita. Em duelo são a mesma pessoa: a troca não produz ganho líquido, mas o especial ainda pode ser gasto. |
| AE-066 | Descarte coletivo | D11 | Cada jogador ativo, inclusive você, envia 1 carta aleatória de seu baralho ativo ao Buraco Negro. |
| AE-067 | Descarte adversário | V04 | Cada adversário ativo envia 1 carta aleatória de seu baralho ativo ao Buraco Negro; você não descarta outra carta além da especial. |
| AE-068 | Tributo por sacrifício | V10 | Sacrifique uma carta normal sua com algum atributo acima de 90; tome 1 carta aleatória do baralho ativo de cada adversário ativo. |
| AE-069 | Doação escolhida | J04, S03 | Escolha um adversário: ele deve escolher uma carta de seu próprio baralho ativo para entregar ao fim do seu. |
| AE-071 | Ausência tática | D03 | Retire apenas sua carta de combate desta disputa; devolva-a ao fim do baralho ativo sem vitória ou derrota. |
| AE-072 | Não perder a carta | J19 | Mesmo que perca, sua carta de combate volta ao fim do próprio baralho ativo, em vez de ser capturada ou descartada. |
| AE-073 | Silêncio de especiais | V15 | Anule os ataques especiais ainda não resolvidos dos adversários nesta disputa; as cartas especiais ativadas são descartadas. |
| AE-074 | Imunidade pessoal | J11 | Cancele um ataque ou especial direcionado especificamente a você nesta disputa; não anule ações que afetem os demais. |
| AE-075 | Captura negada | S02 | Escolha um rival: mesmo que ele vença, ele não poderá capturar sua carta de combate nesta disputa. |
| AE-076 | Guardião do baralho | J05 | Anule a próxima tentativa de roubar uma carta de seu baralho ativo nesta disputa. |
| AE-077 | Guardião da reserva | D14 | Anule a próxima tentativa de roubar uma carta de sua reserva nesta disputa. |
| AE-078 | Reflexo de roubo | V01 | Se um rival tentar roubar exatamente 1 carta sua, cancele esse roubo e tome 1 carta aleatória do baralho ativo dele. |
| AE-079 | Escudo antecipado | V06 | Seu próximo combatente normal não pode ser enviado ao Buraco Negro por uma habilidade especial nesta disputa. |
| AE-080 | Anular modificador | S06 | Cancele até 1 bônus ou redução numérica que tenha sido aplicado à sua carta de combate nesta disputa. |
| AE-081 | Resgate extremo | D12 | Sacrifique 1 carta normal sua que tenha atributo original acima de 90; receba as 3 primeiras cartas do Buraco Negro, se existirem. |
| AE-082 | Resgate aleatório duplo | M09 | Recupere até 2 cartas aleatórias do Buraco Negro e coloque-as no fim de seu baralho ativo. |
| AE-083 | Resgate do topo | J06 | Recupere a carta normal mais recente do Buraco Negro para o fim de seu baralho ativo. |
| AE-084 | Resgate antigo | D07 | Recupere a carta normal mais antiga do Buraco Negro para o fim de seu baralho ativo. |
| AE-085 | Resgate escolhido | D04 | Escolha 1 carta normal do Buraco Negro para recuperar ao final de seu baralho ativo. |
| AE-086 | Troca pelo descarte | D10 | Envie 1 carta normal escolhida do seu baralho ativo ao Buraco Negro e recupere até 2 cartas normais aleatórias de lá. |
| AE-087 | Reabastecimento da reserva | J02 | Pegue até 2 cartas aleatórias do Buraco Negro e deposite-as no fim do seu meio de reserva. Não há restrição a cartas normais na redação original; tratar ciclos pelo regulamento geral. |
| AE-089 | Sacrifício duplo | J22 | Envie 2 cartas normais escolhidas de seu baralho ativo ao Buraco Negro e recupere até 3 cartas normais aleatórias. |
| AE-090 | Segunda chance | J07 | Se sua carta de combate fosse para o Buraco Negro nesta disputa, coloque-a em vez disso no fim de sua reserva; não preserve vitória nem capture. |
| AE-091 | Revelar a mão | J20 | Um adversário revela a ordem de todas as cartas de seu baralho ativo para você até o fim desta disputa. |
| AE-092 | Próximas três | D08, D16 | Veja as 3 próximas cartas de seu baralho ativo e coloque-as no topo na ordem que preferir. |
| AE-093 | Espionagem tripla | J21, M11, D17 | Veja as 3 próximas cartas do baralho ativo de um adversário sem alterá-las. |
| AE-094 | Inversão de fila | M03 | Inverta apenas a ordem das 3 próximas cartas de seu baralho ativo. |
| AE-095 | Atrasar a próxima | V08 | Mova a próxima carta do topo do baralho ativo de um adversário para o final do próprio baralho. |
| AE-096 | Quebrar o plano | J10, V17 | Misture as cartas do baralho ativo de um adversário com sua reserva; depois ele separa as primeiras 5 para formar seu novo baralho ativo. |
| AE-097 | Escolha de sete | V05 | Veja sua reserva e escolha até 7 cartas para colocar na ordem escolhida no topo de seu baralho ativo. |
| AE-098 | Organizar reserva | D01 | Veja as 4 primeiras cartas de sua reserva e reorganize-as na ordem desejada. |
| AE-099 | Reforçar o fim | S07 | Mova a primeira carta de sua reserva para o fim do seu baralho ativo, sem ver seu conteúdo. |
| AE-100 | Confundir próximo turno | J16, V16 | Veja até 3 cartas seguintes do baralho ativo de um adversário; escolha qual ficará no topo, preservando a ordem relativa das demais. |
| AE-101 | Capturar atacante | S08 | Se Ataque + Inteligência da carta de combate de um adversário for maior que Defesa + Velocidade, capture essa carta quando o combate terminar, se ainda estiver em jogo. |
| AE-103 | Ruína de campo | B01, V18 | Impeça ataques contra você nesta disputa e envie ao Buraco Negro somente as cartas normais que os adversários colocaram em combate; preserve a sua carta de combate. Não descarta as cartas especiais preparadas. A interação com especiais ativados continua pendente. |
| AE-105 | Defesa que captura | J12, V19 | Se vencer usando Defesa ou Velocidade, capture a carta de combate de 1 adversário derrotado, em vez de descartá-la. |
| AE-108 | Negar captura inimiga | D13 | Se perder para um atributo de ataque, sua carta de combate vai ao Buraco Negro, não ao baralho do vencedor. |
| AE-110 | Margem estreita | J01 | Se perder por diferença de até 10 pontos no atributo disputado, trate o confronto com você como empate e aplique os desempates usuais. |
| AE-111 | Ativação forçada | M10 | Escolha um adversário: ele é obrigado a ativar todas as suas cartas especiais já preparadas, até duas, nesta disputa, mesmo que a regra geral permita somente uma ativação voluntária. |
| AE-112 | Repetição onerosa | D06 | Repita uma única vez o efeito de outro especial seu já ativado nesta disputa; descarte 2 cartas adicionais de seu baralho ativo à sua escolha no Buraco Negro. Não repita esta habilidade, outra repetição ou uma cópia de habilidade. Repetir um efeito não autoriza virar outra carta especial preparada. |
| AE-113 | Interrupção precisa | J17 | Cancele 1 ataque especial de um adversário antes de sua resolução; o especial cancelado é descartado normalmente. |
| AE-114 | Desvio de alvo | V12 | Redirecione para outro adversário elegível 1 especial de alvo único que estava dirigido a você. |
| AE-115 | Eco de habilidade | M01 | Copie o efeito de 1 especial adversária já ativada nesta disputa, sem ganhar a carta física; não pode copiar outra cópia. |
| AE-116 | Apropriar especial usado | J03 | Ganhe a carta de ataque especial usada por um adversário nesta disputa, em vez de ela permanecer no Buraco Negro; ponha-a ao fim do seu baralho ativo. |
| AE-117 | Preparação exposta | M06 | Um adversário revela até 2 especiais que já preparou; elas permanecem preparadas e não são ativadas. |
| AE-118 | Blindagem de especial | M07 | Um especial seu preparado fica imune a 1 tentativa de cancelamento nesta disputa; não impede custos nem ativações forçadas. |
| AE-120 | Remover alteração | S04 | Anule todas as alterações numéricas temporárias aplicadas a uma carta de combate à sua escolha antes da comparação. |
| AE-129 | Triunfo raro | S01 | Vença automaticamente a comparação de atributos desta disputa, desde que esse especial não seja anulado. O destino das cartas segue o atributo que você declarou: ataque captura e defesa descarta. **Candidato a pouquíssimas cartas raras**, ainda não aprovado como habilidade final. |
| AE-130 | Anular a última habilidade | M02 | **REAÇÃO DEFENSIVA.** Quando uma habilidade especial for ativada e ainda não tiver resolvido seu efeito, anule a **última habilidade pendente**. A carta anulada é consumida e vai ao Buraco Negro. Não desfaz efeitos já concluídos. |

**As versões curtas do texto especial para imprimir no layout AINDA NÃO FORAM ESCRITAS.** Exibir na carta o nome da habilidade e, em tooltip/verso/ampliação, o texto integral da biblioteca até a equipe validar uma versão compacta com o mesmo sentido. Não reduzir condições em segredo para caber.

## 4. Fontes e limitações de cânone

- **J1:** `Ciclo de Jesed/1 - Ruínas dos Céus/01 - Canon/02 - Personagens.md`
- **J2:** `Ciclo de Jesed/2 - Guerras de Sangue/01 - Canon/02 - Personagens.md`
- **J3:** `Ciclo de Jesed/3 - Dinastia Polar/01 - Canon/02 - Personagens.md`
- **J4:** `Ciclo de Jesed/4 - Herdeiros das Cinzas/01 - Canon/02 - Personagens.md`
- **V:** `Viajantes Dimensionais/1 - A Patrulha de Korvo/01 - Canon/02 - Personagens.md`
- **V-manuscrito:** `Manuscrito enviado: Viajantes dimensionais - A Patrulha de Korvo.docx`
- **S:** `Spacetheft/1 - A Lenda da Aurora/01 - Canon/02 - Personagens.md`
- **S-misto:** `Spacetheft/1 - A Lenda da Aurora/01 - Canon/12 - Planejamento e Referencia/Fontes Convertidas/Personagens - Fonte Oficial.md (status misto)`
- **S/autor:** `Cânone Spacetheft + confirmação específica do autor sobre o despertar da Besta na Aurora`
- **D1-Carnam:** `Diário Sobrenatural/1 - Os Elos das Sombras/01 - Canon/02 - Personagens.md` e `07 - Elos e Artefatos.md` (**status da lista dos Elos: misto**); identidades verificadas, atributos e habilidades criados como propostas de jogo, não talentos canônicos.
- **D1:** `Diário Sobrenatural/1 - Os Elos das Sombras/01 - Canon/02 - Personagens.md`
- **D2-histórico:** `Diário Sobrenatural/2 - A Alvorada das Ilusões/01 - Canon/12 - Planejamento e Referencia/Resumo de Desenvolvimento.md (HISTÓRICO, não cânone fechado)`
- **D1/D2:** `Personagens do livro 1 (cânone) + desenvolvimento histórico do livro 2`
- **M:** `Mistério Oculto/1 - Órbita Oráculo/01 - Canon/90 - Materiais reorganizados/02 - Personagens.md`
- **Autor:** `Nome/identidade fornecido(a) pelo autor, sem perfil narrativo seguro localizado`
- **J1/J3/J4:** `Cânones de Ruínas dos Céus, Dinastia Polar e Herdeiros das Cinzas; identidade temporal de Mark`

A entrada **D09 Diego** não tem perfil verificável no material consultado; por isso sua descrição **não atribui feitos**, e números/especial são placeholders deliberadamente especulativos. **M09 Richard Falkner (Bulldog), M10 Releuz e B01 Édelin Fils** dependem de descrição canônica adicional para que seus poderes e especiais sejam fundamentados; características de espécie ou importância narrativa não são automaticamente poderes de combate. O roteiro do segundo Diário é um documento **histórico**: mudanças futuras podem alterar as descrições e atribuições.

## 5. Diretrizes de balanceamento e validação

1. **Nunca equalizar automaticamente a soma dos quatro atributos.** Fortes, equilibradas, especialistas e cartas ruins são escolhas autorais. A fraquíssima **V14 Tio Frank**, com soma **108**, foi proposta para criar o efeito “ah, não, veio essa!”, mas seu especial de troca **AE-051** dá utilidade ocasional.
2. **Não supor que todo personagem tenha força física elevada.** Investigadores, eruditos e espíritos têm perfis de atributos segundo sua atuação narrativa, com grau de interpretação transparente.
3. **União deve ter os especiais mais memoráveis**, mas raridade e poder continuam distintos. Distribuir raridade depois da prova de combos; por exemplo, o raro **AE-129 Triunfo Raro** é somente candidato, ainda não ratificado como carta definitiva.
4. **Efeitos de especial são independentes dos nomes físicos das cartas antigas.** IDs AE-### citam a nova biblioteca; não há obrigação de manter a habilidade antiga com a personagem de mesmo nome.
5. **Sem gráfico determinístico de vitória ainda:** os números acima foram desenhados para criar perfis variados, mas não são balanceamento estatisticamente testado. Gerar simulações de 2/3/4 jogadores quando o regulamento estiver fechado.
6. **Não aplicar modificadores especiais permanentemente** aos valores naturais. Os modificadores temporários poderão ultrapassar 100, mas o limite de apresentação e o destino das cartas ainda devem ser aprovados.

## 6. Estado do projeto e próximo passo

**87 fichas de cartas aprovadas; 87/87 possuem atributos e especial atribuído.** Atribuições podem mudar para adequar cânone, raridade, coerência e equilíbrio. O GDD separa regras confirmadas de propostas em [CONTRATO_PARA_IA_IMPLEMENTADORA.md](CONTRATO_PARA_IA_IMPLEMENTADORA.md). [Elenco original](ELENCO_CANDIDATO.md) · [Catálogo de habilidades](BIBLIOTECA_ATAQUES_ESPECIAIS.md) · [Reações defensivas](PRIORIDADE_ESPECIAIS_PROPOSTA.md).

## 7. Correção da primeira distribuição após auditoria de atributos

A primeira versão concentrava o maior atributo de **43/79 cartas em Inteligência**, o que pode reduzir a variedade de confrontos INT/VEL e tornar Defesa/Velocidade pouco atraentes. Nesta segunda passagem, foram **reajustadas 16 fichas propostas** para equilibrar perfis narrativamente plausíveis: proteção, mobilidade, reflexos e força física também se tornaram características principais. **Não houve mudança em descrições, habilidades sugeridas ou decisões oficiais do autor.**

Distribuição atual do maior atributo por carta: **ATQ 19, DEF 20, INT 28, VEL 12**. A distribuição **não precisa ser simétrica**, pois os personagens têm histórias e competências distintas. É um diagnóstico pré-teste, sem simulação completa das regras ainda pendentes.


## 8. Inclusões verificadas no manuscrito: Aracnas e Obbs (V16–V19)

| ID | Nome usado nas cartas | Fonte efetiva no manuscrito | Interpretação da habilidade sugerida |
| --- | --- | --- | --- |
| Carta V16 | **Facka** | No texto aparece como **Faka**, uma **Aracna jovem**, extrovertida e guia dos irmãos pelos túneis | **AE-100, Confundir próximo turno:** aproveita conhecimento dos caminhos e do ambiente subterrâneo; é abstração lúdica, não prova de magia de confusão |
| Carta V17 | **Lanigiah** | É **rainha das Aracnas**, de porte gigantesco, e submete Banjo a uma experiência ligada a seus temores e lembranças | **AE-096, Quebrar o plano:** representação estratégica de desorientação e controle; não afirmar que ela altera pilhas de cartas no cânone |
| Carta V18 | **Grande Pai Gaia** | **Líder dos Obbs de Pinesoto**; usa raízes, troncos e escudos naturais para tentar conter o ataque à aldeia | **AE-103, Ruína de campo:** efeito excepcional inspirado na defesa coletiva de seu povo; ele só atinge cartas normais em combate, nunca especiais preparadas |
| Carta V19 | **Seti** | **Líder de guerra dos Obbs**; prende os irmãos inicialmente, depois os alimenta, combate invasores e indica caminho de fuga | **AE-105, Defesa que captura:** raízes que prendem inimigos representam captura defensiva |

**Correção de identificação:** o rei dos Obbs indicado pelo autor é **Gaia**, cujo título narrativo exato é **Grande Pai**; Lanigiah é de outro povo (Aracnas). O Obb que ajuda os irmãos é **Seti**. **Facka/Faka:** manter a grafia solicitada pelo autor para o projeto do jogo, mas padronizar com o manuscrito quando ele decidir o nome definitivo.

**Estado:** todos os quatro campos numéricos, perfis e associações de habilidades são **APROVADA PARA O JOGO**, sujeita a testes e revisões futuras. Suas identidades, funções e relações com os irmãos foram conferidas no manuscrito. **O número de habilidades da biblioteca permanece 129**, com atribuição definitiva vazia: não são ataques físicos automaticamente transplantados.


## 9. Família Carnam: personagens e Elos do primeiro livro

**Origem narrativa:** livro 1 de *Diário Sobrenatural: Os Elos das Sombras*. Os [personagens](https://github.com/guyoshi/dimensoesinfinitas/blob/main/Di%C3%A1rio%20Sobrenatural/1%20-%20Os%20Elos%20das%20Sombras/01%20-%20Canon/02%20-%20Personagens.md) estão registrados como parte da **Família Carnam**, e os [Elos](https://github.com/guyoshi/dimensoesinfinitas/blob/main/Di%C3%A1rio%20Sobrenatural/1%20-%20Os%20Elos%20das%20Sombras/01%20-%20Canon/07%20-%20Elos%20e%20Artefatos.md) foram preservados em documento de status *misto*.

| Carta | Integrante | Elo associado | Especial sugerido | Fundamentação de design |
| --- | --- | --- | --- | --- |
| **D07** | Ingrid Carnam (já cadastrada) | Ursinho antigo | AE-084 (mantida) | Espírito ligado aos elos familiares e às memórias |
| **D13** | Suéten (já cadastrada) | Relógio dourado | AE-108 (mantida) | Espírito atrelado à tragédia histórica do grupo |
| **D15** | Carnam (pai) | Arma associada ao pai de Vini | AE-106, Ataque que bane | Alusão ao Elo envolvendo arma e violência, **não afirma que Carnam é o pai de Vini** |
| **D16** | Isabela | Álbum de fotografias | AE-092, Próximas três | Reorganização da ordem como metáfora de fotografias e memórias |
| **D17** | Avó Carnam | Lente de óculos | AE-093, Espionagem tripla | Observação e antecipação como interpretação lúdica da lente |
| **D18** | Ibliso (cão) | Coleira | AE-004, Arrancada | Velocidade de um cão; **não classificá-lo como humano nem demônio** |

**Separar núcleos:** D17 Avó Carnam não é D10 Avó de Kelly. **Não duplicar** D07 Ingrid nem D13 Suéten. **Não confundir Carnam com o pai de Vini** por causa da arma mencionada no Elo.

**Limites de conhecimento:** o cânone consultado não comprova valores de ATQ/DEF/INT/VEL nem poderes de jogo correspondentes aos objetos; são **atribuições aprovadas para o jogo**. O texto real impresso na carta terá até 120 caracteres, conforme norma visual ainda sujeita a teste.

## 10. Registro de aprovação (12/10/2026)

O autor disse **“Aprove tudo”** após a inclusão dos membros da Família Carnam. Isso ratifica **as 87 fichas completas** (identidade, texto da descrição, atributos naturais, soma correspondente, perfil de design e referência AE) como **v1.0 do baralho**. Os 8 integrantes presentes/futuros de A União conservam suas habilidades marcantes, e os 87 registros não serão alterados automaticamente por otimizações da IA. **Desempenho em partida e biografias de personagens com fonte `Baixa` exigem validação distinta.**

Há **78 IDs de habilidades distintos equipados nas 87 cartas**; repetições entre personagens são intencionais e legais. Os **51 IDs de habilidade restantes** na biblioteca de 129 estão disponíveis para futuras expansões. A coluna da biblioteca passa a mostrar as 87 atribuições confirmadas. As cartas antigas e seus nomes/efeitos físicos permanecem apenas como material histórico.
