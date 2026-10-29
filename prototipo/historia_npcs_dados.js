/* Dados dos NPCs do modo história (aprovado 29/10): cadeia de 12 em ordem cíclica, 19 missões de conquista, vendedores e extras das lojas. Posições = ligação entre dois pontos (a-b); mudar o mapa é editar a linha. */
window.DS_NPCS = {
 "cadeia": [
  {
   "id": "hardman",
   "nome": "Lias Hardman",
   "card": "S04",
   "a": "B013",
   "b": "B022",
   "ini": false,
   "pede": "Planta do plano perfeito",
   "da": "Engenhoca que apita sozinha",
   "reg": null,
   "f": {
    "pedir": [
     "Preciso construir uma coisa, mas a planta sumiu. Sem planta eu improviso, e improviso me dá dor de cabeça e fusível queimado.",
     "Alguém por aí deve ter uma Planta do plano perfeito, ou pelo menos uma bem rabiscada. Eu aceito rabisco.",
     "Traga uma e eu lhe dou uma Engenhoca que apita sozinha. Não pergunte para que serve. Ela mesma ainda não decidiu."
    ],
    "lembrar": [
     "Sem planta, nada de engenhoca. Estou em dúvida se isso é engenharia ou filosofia."
    ],
    "entrega": [
     "Rabiscada, mas serve. Dá para ver as linhas por baixo dos desenhos de setas.",
     "A Engenhoca é sua. Funciona em 70% dos casos. Os outros 30% são estatística criativa."
    ],
    "depois": [
     "A engenhoca voltou a apitar. Bom sinal, acho.",
     "Se ouvir um estalo, afaste. Se ouvir dois, corra."
    ]
   }
  },
  {
   "id": "efepar",
   "nome": "Efepar",
   "card": "J34",
   "a": "B043",
   "b": "B004",
   "ini": true,
   "pede": "Engenhoca que apita sozinha",
   "da": "Pena do Primeiro Voo",
   "reg": null,
   "f": {
    "abrir": [
     "Ah, você parece útil. Eu tenho uma Pena do Primeiro Voo na gaveta e ela só sai para quem aguenta o céu.",
     "Mostre que aguenta: vença 3 batalhas e volte. Aí a pena é sua.",
     "Se perder, eu rio um pouco. Se ganhar, também. Eu rio de tudo."
    ],
    "abrirLembrar": [
     "Três batalhas. Se ainda não deu, o céu espera. Ele é paciente. Eu não."
    ],
    "abrirEntrega": [
     "Três! Eu tinha apostado em duas. Perdi a aposta comigo mesmo, que ironia.",
     "Aqui está a Pena. Ela voa sozinha melhor do que eu voei no meu primeiro voo."
    ],
    "pedir": [
     "Etérea tinha tanta solenidade que a gente andava de ombros duros. Alguém precisa aliviar isso.",
     "Preciso de algo que faça barulho sem motivo, uma Engenhoca que apita sozinha, para pôr no meio de uma cerimônia séria.",
     "Traga uma e eu lhe dou a Pena do Primeiro Voo. É um péssimo motivo, eu sei. É o único que eu tenho."
    ],
    "lembrar": [
     "Nada de engenhoca ainda? As cerimônias seguem sérias. É horrível."
    ],
    "entrega": [
     "Ouça só! Ela apita no pior momento possível. É perfeita.",
     "A pena é sua, como combinado. Trate-a bem, ela já salvou gente de cair."
    ],
    "depois": [
     "A cerimônia parou por três minutos de pura confusão. Foi o melhor dia do ano.",
     "Se a vida pesar, ria dela. Ela odeia."
    ]
   }
  },
  {
   "id": "buni",
   "nome": "Buni",
   "card": "S07",
   "a": "B048",
   "b": "B012",
   "ini": true,
   "pede": "Pena do Primeiro Voo",
   "da": "Anel de lata",
   "reg": null,
   "f": {
    "abrir": [
     "Moço, preciso de coragem para entregar este Anel de lata para a Madame, e coragem eu não tenho.",
     "Se você vencer 3 batalhas, eu pego emprestada a sua. Aí o anel é seu, de coração. Eu não vou precisar dele, porque vou ter coragem.",
     "Prometo. Eu era da fazenda, e na fazenda a gente cumpre o que fala."
    ],
    "abrirLembrar": [
     "Três batalhas, moço. Eu sei, é muita coisa. Mas é a minha coragem que está na mesa."
    ],
    "abrirEntrega": [
     "Você voltou! E eu sinto a coragem passando para cá. Ou é o café de ontem.",
     "O Anel de lata é seu. Cuide bem dele, que ele já viu coisa."
    ],
    "pedir": [
     "Moço, ajuda um coração? Vou dar um presente à Madame e quero que seja diferente de tudo que ela já viu.",
     "Uma Pena do Primeiro Voo, dessas bonitas, dessas que parecem ter sido soltas por um anjo. Onde acha eu não sei, só sei que ela merece.",
     "Traga uma e meu Anel de lata é seu. Eu pagaria com o tesouro, mas já gastei tudo em esperança."
    ],
    "lembrar": [
     "Ainda sem pena? Eu aguardo. Aguardar é a minha especialidade."
    ],
    "entrega": [
     "Linda! Ela vai chorar. Ou rir. Em geral os dois.",
     "O Anel de lata é seu, como prometi."
    ],
    "depois": [
     "Fui lá, falei meia frase, ela riu. Já é progresso.",
     "Se amar fosse fácil, a fazenda estaria cheia de poesia."
    ]
   }
  },
  {
   "id": "denis",
   "nome": "Denis, o Cachorro",
   "card": null,
   "a": "B079",
   "b": "B063",
   "ini": false,
   "pede": "Anel de lata",
   "da": "Bilhete de fofoca embrulhado",
   "reg": null,
   "f": {
    "pedir": [
     "Psiu! Chega mais. Eu sei de tudo que acontece em Tayo, mas ontem alguém me contou que tem um pedido de casamento por aí e eu não tenho detalhes.",
     "Um Anel de lata serve de prova. Sem prova, fofoca é só boato, e boato não paga o jantar.",
     "Me traga um e eu lhe dou um Bilhete de fofoca, bem embrulhado. Não vou dizer o que tem. Só que muita gente pagaria caro."
    ],
    "lembrar": [
     "Sem anel é só boato. E boato eu tenho de graça."
    ],
    "entrega": [
     "Um anel de lata! É verdade, então. Isso vale uma semana de conversa.",
     "O bilhete é seu. Não abra no meio da rua, tem gente que lê por cima do ombro."
    ],
    "depois": [
     "Soube de tudo. Não conto. Tá, conto. Me pergunta.",
     "Cachorro é apelido, tá? Mas eu atendo."
    ]
   }
  },
  {
   "id": "sete",
   "nome": "Agente Sete",
   "card": "M02",
   "a": "B036",
   "b": "B030",
   "ini": false,
   "pede": "Bilhete de fofoca embrulhado",
   "da": "Pasta sem rótulo (SPAGE)",
   "reg": null,
   "f": {
    "pedir": [
     "Tenho um caso parado há três dias. O suspeito não fala, e as fontes oficiais não ajudam.",
     "Preciso de um Bilhete de fofoca. Boato bem embrulhado é o tipo de informação que a burocracia não registra.",
     "Traga um e eu lhe entrego uma Pasta sem rótulo. Não pergunte o que tem dentro. Nem de quem era."
    ],
    "lembrar": [
     "Um bilhete de fofoca. O caso continua parado."
    ],
    "entrega": [
     "Perfeito. Boato é a melhor fonte quando todo o resto está bloqueado.",
     "A pasta é sua. Foi uma troca justa, e eu raramente digo isso."
    ],
    "depois": [
     "O caso andou. O suspeito confessou até o que não fez. Anotei como sucesso.",
     "Se alguém perguntar, eu nunca li fofoca. Nem esta."
    ]
   }
  },
  {
   "id": "platisa",
   "nome": "Platisa",
   "card": "J06",
   "a": "B020",
   "b": "B005",
   "ini": false,
   "pede": "Pasta sem rótulo (SPAGE)",
   "da": "Frasco de erva calmante",
   "reg": null,
   "f": {
    "pedir": [
     "Eu anoto o que cada planta faz, para não ter que arrancar nenhuma só para testar. Meus papéis estão espalhados e alguns já voaram com o vento.",
     "Preciso de uma Pasta, dessas sem rótulo, firme, para guardar meus registros sem que se percam.",
     "Se me trouxer uma, lhe dou um Frasco de erva calmante. Já testei duas vezes, devagar, e é seguro."
    ],
    "lembrar": [
     "Ainda sem pasta. Os papéis continuam voando. Já aprendi a correr atrás deles."
    ],
    "entrega": [
     "É perfeita. Firme, discreta. Meus registros vão ficar em ordem.",
     "O frasco é seu. Duas gotas num copo e o mundo desacelera um pouco."
    ],
    "depois": [
     "Registrei três ervas novas. Todas gentis, nenhuma me queimou. Dia bom.",
     "Plantas ensinam a esperar. Eu ainda aprendo."
    ]
   }
  },
  {
   "id": "olivia",
   "nome": "Sra. Olívia",
   "card": "D10",
   "a": "B040",
   "b": "B029",
   "ini": false,
   "pede": "Frasco de erva calmante",
   "da": "Chá de camomila da serra",
   "reg": null,
   "f": {
    "pedir": [
     "Sente, sente. Aqui a casa é calma, e eu faço questão de que ela continue assim.",
     "Meu chá de camomila ficou sem a erva calmante que dá o toque final, e uma casa sem chá fica sem alma. Preciso de um Frasco de erva calmante.",
     "Traga um e eu lhe dou o Chá de camomila da serra, do que eu mesma colho. O primeiro copo é por minha conta."
    ],
    "lembrar": [
     "Sem a erva, o chá fica sem fim. Eu tricoto mais alto para compensar."
    ],
    "entrega": [
     "Ah, a erva. Agora o chá volta a ser chá, e a casa volta a respirar.",
     "Aqui está o seu chá. Ele cheira a madeira e a calma. Dois cheiros que nunca falharam comigo."
    ],
    "depois": [
     "A casa está calma. É o mais perto de felicidade que a gente chega por aqui.",
     "Volte quando quiser. O chá sempre esfria, mas a hospitalidade não."
    ]
   }
  },
  {
   "id": "taliver",
   "nome": "Taliver",
   "card": "J36",
   "a": "B027",
   "b": "B006",
   "ini": false,
   "pede": "Chá de camomila da serra",
   "da": "Quadro e giz de lições",
   "reg": null,
   "f": {
    "pedir": [
     "Ah, aluno! Quer dizer, viajante. Mas o hábito é difícil de largar.",
     "Estou preparando uma lição longa e noites de estudo pedem Chá de camomila da serra. Sem ele as ideias fogem, e sem ideias a aula vira só barulho.",
     "Traga o chá e eu lhe dou meu Quadro e giz de lições. Já me serviu por anos e merece quem o use bem."
    ],
    "lembrar": [
     "Sem chá, sem lição. É um raciocínio impecável, aliás."
    ],
    "entrega": [
     "Excelente! Com isso a lição de hoje vira a lição de amanhã.",
     "O quadro é seu. Cuidado com o giz, que ele sempre quebra no ponto mais importante."
    ],
    "depois": [
     "Hoje a aula foi sobre paciência. Os alunos aprenderam a esperar. Eu também.",
     "Se quiser aprender algo, pergunte. Se não quiser, eu explico assim mesmo."
    ]
   }
  },
  {
   "id": "pedro",
   "nome": "Pedro Souza",
   "card": "D03",
   "a": "B035",
   "b": "B015",
   "ini": true,
   "pede": "Quadro e giz de lições",
   "da": "Caixa de brigadeiros da doceria",
   "reg": null,
   "f": {
    "abrir": [
     "Mano, a doceria dos meus pais tem uma regra: brigadeiro de vitrine só sai com escolta.",
     "Escolta é gente que sabe lutar, tá ligado? Então faz assim: vença 3 batalhas e volte aqui.",
     "Em troca eu te dou uma Caixa de brigadeiros. Eu juro que não comi cinquenta. Foram quarenta e nove."
    ],
    "abrirLembrar": [
     "Três batalhas, lembra? Eu contaria com você, mas eu conto tudo duas vezes. É a ansiedade."
    ],
    "abrirEntrega": [
     "Três vitórias! Contei duas vezes, claro.",
     "Aqui está a Caixa de brigadeiros, como combinado. Uma coisa que aprendi na igreja: o que a gente ganha, a gente passa pra frente."
    ],
    "pedir": [
     "Mano, amanhã é a feira da doceria. Duzentas pessoas, e meu estômago já ensaiou três vezes.",
     "O preço dos doces está escrito num papel e já foi comido pela Dedé. Preciso de um Quadro e giz, desses de escola, pra escrever tudo em letra grande.",
     "Traz o quadro e eu te dou uma Caixa de brigadeiros. Da boa, não da vitrine. Palavra de quem frequenta culto."
    ],
    "lembrar": [
     "Quadro e giz, lembra? Sem ele eu grito os preços. E eu grito mal."
    ],
    "entrega": [
     "Um quadro! Agora todo mundo vai ler os preços. Menos a Dedé, que só quer o giz.",
     "Aqui estão os brigadeiros. Não conta pra ninguém que eu comi quatro no caminho."
    ],
    "depois": [
     "A feira foi um sucesso. Quer dizer, o estômago ainda opina.",
     "Se precisar de açúcar eu tenho. Se precisar de coragem, também, mas é mais cara."
    ]
   }
  },
  {
   "id": "kali",
   "nome": "Kali",
   "card": null,
   "a": "B033",
   "b": "B002",
   "ini": true,
   "pede": "Caixa de brigadeiros da doceria",
   "da": "Saco de café de Tayo",
   "reg": null,
   "f": {
    "abrir": [
     "Entra, entra. Aqui o café é bom, mas o Saco de café de Tayo que eu guardo no fundo só sai para quem tem lastro.",
     "Vença 3 batalhas e passe aqui. O saco é seu, e a xícara também, por minha conta.",
     "Lastro é isso: voltar inteiro e ainda querer café."
    ],
    "abrirLembrar": [
     "Ainda não são 3 batalhas. O café esfria, mas o saco espera."
    ],
    "abrirEntrega": [
     "Voltou inteiro! Já preparo a xícara.",
     "Aqui está o saco. Faça bom uso, ou pelo menos um uso curioso."
    ],
    "pedir": [
     "O café vende bem, mas o pessoal sempre pede um docinho junto, e a minha padaria parceira fechou por reforma.",
     "Preciso de uma Caixa de brigadeiros. Brigadeiro de doceria, não de lata.",
     "Traga uma e eu lhe entrego um Saco de café de Tayo. Do bom, daquele que a gente guarda para o dia difícil."
    ],
    "lembrar": [
     "Sem docinho, o café vende metade. O povo é cruel."
    ],
    "entrega": [
     "Brigadeiros! Vão acabar em dez minutos, eu conheço a clientela.",
     "O saco é seu. Rende vinte xícaras, ou quarenta se você mentir sobre o tamanho."
    ],
    "depois": [
     "Sente. Toda missão fica melhor com café. As que dão errado ficam suportáveis.",
     "O pessoal pediu mais brigadeiro. Eu pedi mais paciência."
    ]
   }
  },
  {
   "id": "matt",
   "nome": "Matt Pontas",
   "card": "M04",
   "a": "B017",
   "b": "B003",
   "ini": false,
   "pede": "Saco de café de Tayo",
   "da": "Procuração com carimbo duvidoso",
   "reg": null,
   "f": {
    "pedir": [
     "Querido, negociação boa começa com bom café, e negociação ruim termina com ele frio. Hoje eu tenho uma das duas e prefiro a primeira.",
     "Preciso de um Saco de café de Tayo, daqueles que fazem qualquer sala parecer amigável.",
     "Traga um e eu lhe entrego uma Procuração com carimbo duvidoso. E mais: fico lhe devendo um favor. Favor vale mais que dinheiro."
    ],
    "lembrar": [
     "Sem café, a sala fica hostil. É questão de estratégia, querido."
    ],
    "entrega": [
     "Magnífico! Vê como o aroma já desarma qualquer adversário?",
     "A procuração é sua. O carimbo é duvidoso, sim. Mas duvidar custa caro."
    ],
    "depois": [
     "Duvidoso? Eu prefiro dizer criativo. Está dentro da lei, só em outra página.",
     "Quando precisar de uma brecha, me procure. Cobro em favores."
    ]
   }
  },
  {
   "id": "ricochet",
   "nome": "Ricochet Bombergue",
   "card": "V09",
   "a": "B092",
   "b": "B087",
   "ini": false,
   "pede": "Procuração com carimbo duvidoso",
   "da": "Planta do plano perfeito",
   "reg": "V02",
   "f": {
    "pedir": [
     "Ouça bem, amigo: eu tenho um plano perfeito. Só tem um defeito, ninguém leva a sério sem papel oficial.",
     "Preciso de uma Procuração, dessas com carimbo, mesmo que seja duvidoso. Papel com carimbo convence qualquer um, até o plano mais torto.",
     "Me traga uma e eu lhe entrego a Planta do plano perfeito, com todas as setas desenhadas. Vale mais do que parece."
    ],
    "lembrar": [
     "Sem carimbo o plano é só uma ideia animada. Preciso de papel."
    ],
    "entrega": [
     "Olha esse carimbo! O plano agora tem respeito.",
     "A planta é sua. Cuidado com as setas, elas apontam em todas as direções."
    ],
    "depois": [
     "O plano deu errado, mas desenhado ficou lindo. Pelo menos isso.",
     "Se um dia você precisar de um plano, eu tenho cinco. Quatro são ruins. O quinto é segredo."
    ]
   }
  }
 ],
 "quests": [
  {
   "id": "priscila",
   "nome": "Priscila Fontenelle",
   "card": "D02",
   "a": "B023",
   "b": "B014",
   "t": "evento",
   "m": 3,
   "d": "Vença 3 batalhas de Evento",
   "pend": 30,
   "f": {
    "pedir": [
     "Para de me olhar assim. Eu não preciso de ajuda.",
     "O que eu preciso é de prova. Prova de que você sabe se virar quando o plano dá errado. Plano sempre dá errado.",
     "Vença 3 batalhas de Evento, aquelas com regra esquisita. Volte aqui e eu pago 30 pêndulos. Óbvio."
    ],
    "lembrar": [
     "Eventos. Três. Quantos você fez? Esquece, eu vejo na sua cara."
    ],
    "entrega": [
     "Passou. Não vou elogiar. Toma os pêndulos.",
     "Pronto."
    ],
    "depois": [
     "Se meu pai perguntar, eu estava ouvindo música. Sempre estou.",
     "Não gosto de gente que fala demais. Você até que não fala."
    ]
   }
  },
  {
   "id": "garmande",
   "nome": "Garmande Koraveli",
   "card": "V08",
   "a": "B032",
   "b": "B007",
   "t": "capt",
   "m": 3,
   "d": "Capture 3 cartas de inimigos",
   "pend": 30,
   "f": {
    "pedir": [
     "Veja o Coronel. Está velho, dorme demais, mas reconhece quem sabe ficar com o que ganhou.",
     "Quero que me prove isso: capture 3 cartas de inimigos. Capturar é ganhar e levar, não só vencer.",
     "Faça isso e eu entrego 30 pêndulos pelo trabalho. O Coronel também aprova, se estiver acordado."
    ],
    "lembrar": [
     "Três cartas capturadas. Quantas até agora? O Coronel é paciente. Eu menos."
    ],
    "entrega": [
     "Três capturas. O Coronel acordou para olhar. É um elogio.",
     "Aqui estão os pêndulos. Gaste com juízo."
    ],
    "depois": [
     "O Coronel dorme sobre as botas. Sinal de confiança.",
     "Minha filha Brenda cresce rápido. Que ela herde a calma do cão."
    ]
   }
  },
  {
   "id": "kord",
   "nome": "Kord",
   "card": "S05",
   "a": "B055",
   "b": "B028",
   "t": "semhab",
   "m": 1,
   "d": "Vença uma batalha sem usar habilidade especial",
   "pend": 30,
   "f": {
    "pedir": [
     "Quero voltar pro meu planeta, só que a viagem é longa e eu preciso de confiança no que faço.",
     "Provar que não preciso de truque nenhum: vença uma batalha sem usar nenhuma habilidade especial.",
     "Quando conseguir, volte. Eu pago 30 pêndulos, que é o que me sobrou."
    ],
    "lembrar": [
     "Sem habilidade especial, lembra? Truque é para quem não sabe jogar."
    ],
    "entrega": [
     "Sem truque nenhum. Respeito.",
     "Toma os pêndulos. Casa continua longe, mas o dia melhorou."
    ],
    "depois": [
     "Se um dia eu voltar, vou fazer um churrasco. Você entra na lista.",
     "Planeta natal é igual a mãe: a gente só entende depois que vai embora."
    ]
   }
  },
  {
   "id": "maletar",
   "nome": "Maletar",
   "card": "J05",
   "a": "B067",
   "b": "B044",
   "t": "libertar",
   "m": 2,
   "d": "Liberte 2 membros da União",
   "pend": 40,
   "reg": "B01",
   "f": {
    "pedir": [
     "Uma ponte só aguenta se cada junta segura a vizinha. Foi assim que aprendi, falhando primeiro.",
     "Há dois presos que precisam voltar para a ponte da União. Liberte 2 membros da União, vencendo os arautos que os prendem.",
     "Faça isso e eu lhe entrego 40 pêndulos e um Registro de Édelin Lys, de quem sou amigo."
    ],
    "lembrar": [
     "Dois presos. Uma ponte. Quantas juntas você já pôs de volta?"
    ],
    "entrega": [
     "Duas juntas novas. A ponte aguenta mais do que eu esperava.",
     "Pegue o registro e os pêndulos. Merecido."
    ],
    "depois": [
     "Madeira nova ainda pede cuidado. Gente também.",
     "Se ouvir a ponte estalar, não corra. Ouça o que ela diz."
    ]
   }
  },
  {
   "id": "amanda",
   "nome": "Amanda",
   "card": "S02",
   "a": "B047",
   "b": "B034",
   "t": "seq",
   "m": 5,
   "d": "Vença 5 batalhas seguidas sem derrota",
   "pend": 40,
   "reg": "V15",
   "f": {
    "pedir": [
     "Todo mundo promete lealdade e some quando o plano muda. Eu prefiro constância.",
     "Vença 5 batalhas seguidas, sem perder nenhuma. Se perder uma, a contagem recomeça.",
     "Se conseguir, eu entrego 40 pêndulos e um Registro de Brenda Koraveli. Eu cumpro o que digo."
    ],
    "lembrar": [
     "Cinco seguidas. Sem escorregão. Quantas até agora?"
    ],
    "entrega": [
     "Constância. Não é glamour, mas é o que segura uma fuga.",
     "Pegue o registro e os pêndulos."
    ],
    "depois": [
     "Eu critico o regime porque conheço os porões. Não é rebeldia, é inventário.",
     "Se precisar de uma amiga, eu estou por aí. Com sarcasmo incluso."
    ]
   }
  },
  {
   "id": "oreilly",
   "nome": "O'reilly",
   "card": "S06",
   "a": "B073",
   "b": "B064",
   "t": "elite",
   "m": 2,
   "d": "Vença 2 batalhas de Elite",
   "pend": 40,
   "reg": "M10",
   "f": {
    "pedir": [
     "Eu negocio qualquer coisa. Prazo, preço, dívida, até clima. Mas elite não negocia, elite só entende de derrota.",
     "Vença 2 batalhas de Elite e eu fecho um acordo com você.",
     "O acordo vale 40 pêndulos e um Registro de Releuz. Eu consegui o prazo mais longo da história do grupo, então confie."
    ],
    "lembrar": [
     "Duas elites. Sem elas, sem acordo."
    ],
    "entrega": [
     "Duas elites caídas. Acordo fechado.",
     "Pegue o registro e os pêndulos. Eu avisei que ia dar certo, mas ninguém me escuta."
    ],
    "depois": [
     "Quando o prazo apertar, me chame. Eu esticarei até a última hora.",
     "Negociar é arte. Quem diz o contrário nunca perdeu uma dívida."
    ]
   }
  },
  {
   "id": "eric",
   "nome": "Eric",
   "card": "S03",
   "a": "B086",
   "b": "L1",
   "t": "evento",
   "m": 8,
   "d": "Vença 8 batalhas de Evento",
   "pend": 60,
   "frag": "N:eric",
   "f": {
    "pedir": [
     "Eventos são tão imprevisíveis que dá quase para tomar café assistindo. Quase.",
     "Vença 8 batalhas de Evento no total. Não precisa ser seguido, mas precisa ser inteiro.",
     "Faça isso e eu lhe dou 60 pêndulos e um Fragmento dimensional. Aquele que reluz quando ninguém olha."
    ],
    "lembrar": [
     "Oito eventos. Ainda não? Que decepção previsível."
    ],
    "entrega": [
     "Oito. Quase me impressionou. Quase.",
     "Pegue o fragmento e os pêndulos. Não deixe o Olho ver."
    ],
    "depois": [
     "Eu roubei o Olho uma vez. Não recomendo, mas foi elegante.",
     "Minha irmã me tolera. Já é mais do que a maioria faz."
    ]
   }
  },
  {
   "id": "junior",
   "nome": "Junior Quissama",
   "card": "D01",
   "a": "B075",
   "b": "B076",
   "t": "guard",
   "m": 2,
   "d": "Derrote 2 guardiões",
   "pend": 60,
   "frag": "N:junior",
   "f": {
    "pedir": [
     "Se isso fosse um livro, seria o capítulo dos guardiões. Quer dizer, dois capítulos. Ou melhor, duas cenas fortes.",
     "Derrote 2 guardiões, por favor. Eu preciso desses capítulos para o roteiro ficar completo.",
     "Em troca eu entrego 60 pêndulos e um Fragmento dimensional. Desculpa se é pouco. Ou melhor, se não é."
    ],
    "lembrar": [
     "Dois guardiões. Eu ainda estou escrevendo a introdução deles."
    ],
    "entrega": [
     "Escrevi tudo. Fiquei bem na história, o que já é raro.",
     "Pegue o fragmento e os pêndulos. Obrigado. Desculpa."
    ],
    "depois": [
     "Se minha mãe soubesse que virei personagem, pediria direitos autorais.",
     "Quase todo capítulo meu termina com um pedido de desculpa. Esse também."
    ]
   }
  },
  {
   "id": "velho",
   "nome": "Velho-Sábio",
   "card": "V05",
   "a": "B095",
   "b": "B088",
   "t": "uniao",
   "m": 8,
   "d": "Tenha as 8 cartas da União",
   "pend": 100,
   "frag": "N:velho",
   "f": {
    "pedir": [
     "Átila sente quando as coisas estão próximas do lugar certo, e ultimamente ele está inquieto.",
     "Reúna os oito da União na sua equipe e ele sossega. Não é superstição. É a forma de ele dizer que algo faltava.",
     "Faça isso e eu lhe entrego 100 pêndulos e um Fragmento dimensional, que guardo há mais tempo do que gostaria."
    ],
    "lembrar": [
     "Oito. Átila ainda rosna baixinho. Quando faltar pouco, ele para."
    ],
    "entrega": [
     "Átila dormiu. Isso diz mais do que qualquer profecia.",
     "O fragmento e os pêndulos são seus. Use-os com juízo."
    ],
    "depois": [
     "Korvo ainda existe, e quem o conhece sabe que a calma é a primeira defesa.",
     "Se Átila quiser brincar, deixe. É sinal de que tudo vai bem."
    ]
   }
  },
  {
   "id": "banjo",
   "nome": "Banjo Lins",
   "card": "V03",
   "a": "B056",
   "b": "B077",
   "t": "cartas",
   "m": 20,
   "d": "Tenha 20 cartas na coleção",
   "pend": 30,
   "f": {
    "pedir": [
     "Eu inventei um exército pro Átila, o supercachorro mais veloz do universo. Só que exército precisa de soldados, e os meus são todos imaginários.",
     "Junte 20 cartas na sua coleção, no total. Soldado de verdade conta mais.",
     "Quando tiver as 20, volta aqui. Eu te dou 30 pêndulos. Estavam debaixo do meu travesseiro, o Bruno não sabe."
    ],
    "lembrar": [
     "Vinte cartas, lembra? O Átila já ensaiou o discurso de boas-vindas pra elas."
    ],
    "entrega": [
     "Vinte! O exército está completo. O Átila latiu duas vezes, que é aplauso.",
     "Toma os 30 pêndulos. E não conta pro Bruno do travesseiro."
    ],
    "depois": [
     "Eu estou fazendo uma canção nova pro Átila. Ainda não está pronta, mas o refrão é bom.",
     "Às vezes eu acho que o Átila é real. Aí eu lembro. Aí acho de novo."
    ]
   }
  },
  {
   "id": "frank",
   "nome": "Tio Frank",
   "card": "V14",
   "a": "B011",
   "b": "B012",
   "t": "ganho",
   "m": 500,
   "d": "Ganhe 500 pêndulos no total",
   "pend": 40,
   "f": {
    "pedir": [
     "Criar sobrinho dá mais trabalho do que parece, e a conta no fim do mês nunca fecha. Quem cuida dos meninos aprende a contar moeda.",
     "Quero ver se você sabe levantar dinheiro. Ganhe 500 pêndulos no total, de batalhas e baús.",
     "Quando chegar lá, volta aqui. Eu pago 40 pêndulos de bônus. Não é muito, mas é de coração."
    ],
    "lembrar": [
     "Quinhentos pêndulos ganhos. Não vale gastar e contar de novo, viu? Isso eu aprendi com os meninos."
    ],
    "entrega": [
     "Quinhentos! Isso é que é gente responsável.",
     "Aqui estão os 40 pêndulos. Guarda um pouco, que dia de chuva sempre chega."
    ],
    "depois": [
     "Os meninos estão bem. Digo isso todo dia, pra ver se vira verdade.",
     "A vida comum é cheia de conta, comida e roupa suja. Sinto falta, às vezes."
    ]
   }
  },
  {
   "id": "eshley",
   "nome": "Eshley",
   "card": "V25",
   "a": "B083",
   "b": "B089",
   "t": "derrota",
   "n": "B067",
   "d": "Encontre e derrote Mariv",
   "pend": 50,
   "f": {
    "pedir": [
     "Eu sonhava em treinar com Tayo, e nada treina mais do que um bom duelo. Ouvi falar de alguém chamado Mariv e quero saber se ele é tão bom quanto dizem.",
     "Encontre Mariv e derrote-o. Eu não sei onde ele está, descubra por aí.",
     "Depois me conta como foi. Eu pago 50 pêndulos pela história."
    ],
    "lembrar": [
     "Já derrotou o Mariv? Eu fico girando em volta esperando a notícia."
    ],
    "entrega": [
     "Você ganhou do Mariv! Conta de novo, devagar, com gestos.",
     "Toma os 50 pêndulos. Foi o melhor jogo de passes que eu não vi!"
    ],
    "depois": [
     "A Maria disse que eu falo demais. Mas ela fala de menos, então dá certo.",
     "Quando eu crescer vou fazer passe certeiro até de olho fechado."
    ]
   }
  },
  {
   "id": "helena",
   "nome": "Dra. Helena Valença",
   "card": "M08",
   "a": "B097",
   "b": "B099",
   "t": "capt",
   "m": 10,
   "d": "Capture 10 cartas de inimigos no total",
   "pend": 40,
   "f": {
    "pedir": [
     "Estudo o que fica registrado no cérebro, e cartas que viveram em baralhos inimigos guardam traços das batalhas que viram.",
     "Capture 10 cartas de inimigos no total. Capturar é ganhar e levar a carta.",
     "Quando juntar as 10, volte aqui. A pesquisa paga 40 pêndulos."
    ],
    "lembrar": [
     "Ainda faltam espécimes. Dez capturas, nem uma a menos."
    ],
    "entrega": [
     "Dez cartas capturadas. Dados excelentes.",
     "Aqui estão os 40 pêndulos. Prometo que o financiamento é legítimo."
    ],
    "depois": [
     "A interface que criei deveria só monitorar astronautas. Deveria.",
     "Ciência é paciência com um bloco de anotações. O resto é entusiasmo e cafeína."
    ]
   }
  },
  {
   "id": "erla",
   "nome": "Erla",
   "card": "V06",
   "a": "B081",
   "b": "B093",
   "t": "derrota",
   "n": "B068",
   "d": "Encontre e derrote Saliens",
   "pend": 50,
   "f": {
    "pedir": [
     "A Vigilância tem uma lista. Um nome ainda está sem risco ao lado: Saliens, da Patrulha de Korvo.",
     "Encontre Saliens e derrote-o. Não vou dizer onde. Quem procura aprende o caminho.",
     "Volte depois. Eu pago 50 pêndulos e não faço perguntas sobre o método."
    ],
    "lembrar": [
     "Saliens continua na lista. Sem risco ao lado do nome."
    ],
    "entrega": [
     "Risco feito. Um a menos.",
     "Toma os 50 pêndulos. Disciplina também se paga."
    ],
    "depois": [
     "Eu desconfio da Vigilância tanto quanto de Korvo. Você pode me citar.",
     "Vigiar é mais cansativo do que lutar. Mas alguém tem que fazer."
    ]
   }
  },
  {
   "id": "tzough",
   "nome": "Capitão Tzough",
   "card": "S13",
   "a": "B050",
   "b": "B074",
   "t": "gasto",
   "m": 500,
   "d": "Gaste 500 pêndulos no total",
   "pend": 60,
   "f": {
    "pedir": [
     "Pirata que guarda moeda é pirata que enferruja. Dinheiro bom é dinheiro que roda.",
     "Gaste 500 pêndulos no total, nas lojas ou descansando cartas. Eu quero ver você negociar.",
     "Quando passar dos 500 gastos, volta aqui. Eu pago 60 pêndulos. Não é caridade, é investimento."
    ],
    "lembrar": [
     "Ainda não gastou o suficiente. Mão fechada nunca fez fortuna."
    ],
    "entrega": [
     "Quinhentos gastos. Agora sim você pensa como pirata.",
     "Aqui estão os 60 pêndulos. Já gastou? Eu sabia que ia gastar."
    ],
    "depois": [
     "Negociar sob pressão é onde se separa o capitão do passageiro.",
     "Eu e Jasmey ainda temos contas abertas. Me lembre de não pagar."
    ]
   }
  },
  {
   "id": "beatriz",
   "nome": "Beatriz Lins",
   "card": "V04",
   "a": "B060",
   "b": "B076",
   "t": "vit",
   "m": 30,
   "d": "Vença 30 batalhas no total",
   "pend": 60,
   "f": {
    "pedir": [
     "Eu vou ficar forte que nem a minha mãe. Mas meu fogo ainda sai quando quer, e eu preciso aprender com quem sabe ganhar.",
     "Vença 30 batalhas no total. Eu vou contando nos dedos, e quando acabam os dedos eu começo de novo.",
     "Volta aqui quando chegar em 30. Eu pago 60 pêndulos. Prometo não queimar nada no caminho."
    ],
    "lembrar": [
     "Ainda não são 30. Eu contei nos dedos duas vezes. Faltam."
    ],
    "entrega": [
     "Trinta! Eu perdi a conta em vinte e dois, mas confio em você.",
     "Toma os 60 pêndulos. Só um pouquinho chamuscados."
    ],
    "depois": [
     "Eu quase queimei a mesa hoje. Quase. Foi uma chama bem pequenininha.",
     "Quando eu crescer vou ser forte e controlar tudo. Só que ainda estou crescendo."
    ]
   }
  },
  {
   "id": "nastacia",
   "nome": "Capitã Nastácia",
   "card": "S09",
   "a": "B009",
   "b": "B046",
   "t": "lendaria",
   "c": "J12",
   "d": "Tenha a carta lendária Rendar",
   "pend": 70,
   "f": {
    "pedir": [
     "Há cartas que não se compram nem se esquecem. Uma delas é Rendar, lendária.",
     "Quero Rendar na sua coleção. Quem a carrega, eu não direi. Isso é parte do trabalho.",
     "Traga-a até você e volte aqui. Eu pago 70 pêndulos. Discrição em troca de ouro."
    ],
    "lembrar": [
     "Rendar ainda não está com você. Procure em quem a segura."
    ],
    "entrega": [
     "Rendar. Bom olho e boa mão.",
     "Toma os 70 pêndulos. Uma capitã paga o que deve."
    ],
    "depois": [
     "Comando é feito de silêncio. O resto é barulho.",
     "Quando eu estava de pé, o espaço tremia. Agora ele me ouve do mesmo jeito."
    ]
   }
  },
  {
   "id": "lucan",
   "nome": "Lucan Veline",
   "card": "V07",
   "a": "B065",
   "b": "B074",
   "t": "compras",
   "m": 4,
   "d": "Compre 4 cartas nas lojas",
   "pend": 40,
   "f": {
    "pedir": [
     "Uma cidade ameaçada precisa de comércio vivo, e comércio vivo precisa de clientes que se arrisquem.",
     "Compre 4 cartas nas lojas. Qualquer carta, em qualquer loja.",
     "Volte quando tiver comprado. O conselho paga 40 pêndulos pela confiança na economia."
    ],
    "lembrar": [
     "Ainda não são 4 compras. O comerciante espera, mas não para de olhar."
    ],
    "entrega": [
     "Quatro compras. O conselho agradece.",
     "Aqui estão os 40 pêndulos. Os impostos já foram descontados, infelizmente."
    ],
    "depois": [
     "Governar Tayo é decidir com a cabeça fria e dormir com a cabeça quente.",
     "Ameaça lá fora, burocracia aqui dentro. Prefiro a ameaça."
    ]
   }
  },
  {
   "id": "vivian",
   "nome": "Vivian",
   "card": "S08",
   "a": "B001",
   "b": "B026",
   "t": "cartas",
   "m": 40,
   "d": "Tenha 40 cartas na coleção",
   "pend": 80,
   "f": {
    "pedir": [
     "Eu estudo como as coisas se montam, átomo por átomo. Uma coleção funciona igual: quanto mais peças, mais combinações.",
     "Chegue a 40 cartas na sua coleção.",
     "Volte quando tiver as 40. Eu pago 80 pêndulos, que é o que a minha pesquisa aguenta."
    ],
    "lembrar": [
     "Ainda não são 40 peças. Combinação boa precisa de material."
    ],
    "entrega": [
     "Quarenta peças. Agora dá pra montar coisa interessante.",
     "Toma os 80 pêndulos. E tente não me perguntar o que eu faço com os átomos."
    ],
    "depois": [
     "O corpo é só o começo. Eu ainda estou aprendendo o que dá para fazer com ele.",
     "Se algum dia o Buni disser que sou perigosa, ele tem razão."
    ]
   }
  }
 ],
 "vend": {
  "L1": {
   "nome": "Genrir",
   "card": "S14",
   "oi": "Entra. Eu provoco, mas não cobro de graça.",
   "obr": [
    "Boa compra. Não conta que fui simpático.",
    "Levou a melhor. Dessa vez.",
    "Volta sempre. Eu tenho mais piadas e mais cartas."
   ]
  },
  "L2": {
   "nome": "Faka",
   "card": "V16",
   "oi": "Oi, oi! Pode olhar tudo, eu falo enquanto você olha!",
   "obr": [
    "Ótima escolha! Eu sabia que você ia gostar, eu sempre sei!",
    "Valeu! Quer que eu embrulhe? Não tenho papel, mas embrulho com palavras!",
    "Volta logo, eu tenho muito mais história pra contar!"
   ]
  },
  "L3": {
   "nome": "Vek",
   "card": "S12",
   "oi": "Código é código: aqui se paga o que se leva.",
   "obr": [
    "Negócio justo. Isso eu respeito.",
    "Fechado. Leal é quem paga em dia.",
    "Pode voltar. A porta fica aberta pra quem joga limpo."
   ]
  },
  "L4": {
   "nome": "Glenda Mendes",
   "card": "D08",
   "oi": "Bem-vindo! Posso fazer uma pergunta enquanto você olha?",
   "obr": [
    "Compra anotada! Qual foi o motivo? É pra matéria.",
    "Obrigada! Isso vai render uma manchete.",
    "Volta depois e me conta o que descobriu."
   ]
  },
  "L5": {
   "nome": "Maria Santoro",
   "card": "V24",
   "oi": "Ah, oi... pode olhar com calma, eu não mordo.",
   "obr": [
    "Obrigada. De verdade. Espero que ajude.",
    "Que bom que gostou... eu fiquei feliz.",
    "Volte quando quiser, tá? Eu fico aqui."
   ]
  }
 },
 "lojasExtra": {
  "L1": {
   "frag": [
    160,
    160
   ],
   "reg": [
    [
     "M01",
     140
    ]
   ]
  },
  "L2": {
   "frag": [
    100,
    100
   ],
   "reg": [
    [
     "J03",
     100
    ]
   ]
  },
  "L3": {
   "frag": [
    50
   ],
   "reg": []
  },
  "L4": {
   "frag": [
    160,
    160
   ],
   "reg": [
    [
     "S01",
     140
    ]
   ]
  },
  "L5": {
   "frag": [
    50
   ],
   "reg": [
    [
     "D06",
     80
    ]
   ]
  }
 },
 "fragBaus": [
  "B010",
  "B028",
  "B049",
  "B070",
  "B085",
  "B096"
 ]
};
