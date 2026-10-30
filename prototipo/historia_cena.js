/* Cinemática inicial do modo história. SÓ DADOS: edite aqui (ou me envie o texto que eu preencho).
   Cada cena tem uma imagem (opcional) e uma lista de falas; cada toque mostra a próxima fala (digitada letra por letra).
   Campos da cena:  img: caminho da imagem ou null (fica só o preto)
                    mov: 'zoom' | 'zoomout' | 'esq' | 'dir' | 'fixo'   (movimento lento da imagem)
                    fotos: ['photos/X.webp', ...]  até 8 fotos que aparecem uma a uma em cantos diferentes da tela
                    cor: cor de fundo atrás da imagem (padrão preto) · pos: enquadramento da imagem
                    textos: ['fala 1', ...]  ({nome} vira o nome que o jogador digitou)
                    tom: 'narr' (padrão) | 'fala' | 'grito' (grande, tremendo)
                    pergunta: { chave:'nome', rotulo:'Seu nome', max:16, padrao:'Viajante' }  → campo de texto depois da última fala
   O jogador toca para avançar; "Pular" leva direto ao mapa. */
window.DS_CINEMATICA = {
  musica: 'intro',          // trilha: musica/historia_intro.mp3
  cenas: [
    { img: null, textos: ['Existe um silêncio que só o espaço conhece.', 'Foi nele que a Besta dormiu por eras.'] },
    { img: 'cena/gerbe.webp', mov: 'zoom', pos: 'center', textos: [
      'Há muito tempo, a Besta foi aprisionada em um planeta conhecido como Aurora, feito de gerbe, um dos materiais mais valiosos de todo o universo.',
      'O metal a cobriu como uma tumba. Ninguém soube o que dormia lá dentro. Ninguém quis saber.'] },
    { img: 'cena/chegada-aurora.png', mov: 'zoomout', pos: 'center', fotos: ['photos/S01.webp'], textos: [
      'Até que Jasmey Badrock e sua equipe, caçadores de tesouros em busca do próximo grande achado, pousaram na Aurora.',
      'Eles viram riqueza. Cavaram fundo. E cavaram demais.'] },
    { img: 'cena/besta.webp', mov: 'zoom', pos: 'center', tom: 'grito', textos: ['Ela acordou.'] },
    { img: 'cena/besta.webp', mov: 'esq', pos: 'center', textos: [
      'A Besta engoliu estrelas. Depois, sistemas inteiros.',
      'E então começou a rasgar as paredes entre as dimensões.'] },
    { img: null, fotos: ['photos/M01.webp', 'photos/S01.webp', 'photos/V02.webp', 'photos/V15.webp', 'photos/D06.webp', 'photos/M10.webp', 'photos/J03.webp', 'photos/B01.webp'], textos: [
      'Sem saída, Jasmey pediu ajuda à União: heróis de todos os cantos do universo, o único grupo que talvez pudesse deter a Besta.',
      'Eles atenderam ao chamado.'] },
    { img: 'cena/uniao-dispersao.png', mov: 'dir', pos: 'center', textos: [
      'Não foi o bastante.',
      'A Besta derrotou todos, um a um, e os espalhou pela galáxia como cinzas ao vento.',
      'Depois, saciada, fez do núcleo da galáxia o seu trono.'] },
    { img: null, textos: [
      'Mas um deles sobreviveu.',
      'Ferido, perdido entre estrelas que já nem têm nome, restou uma última chance.',
      'Qual é o seu nome?'], pergunta: { chave: 'nome', rotulo: 'Seu nome', max: 16, padrao: 'Viajante' } },
    { img: 'cena/gerbe.webp', mov: 'zoomout', pos: 'center', textos: [
      '{nome}. A galáxia inteira espera por você.',
      'Encontre os heróis. Reúna a União. Derrote a Besta.'] },
    { img: null, tom: 'grito', textos: ['Que a jornada comece.'] },
  ],
};

/* Cinemática final: aparece quando o Boss é vencido (mesmo formato; {nome} = nome do jogador). */
window.DS_CINEMATICA_FINAL = {
  musica: 'final',
  cenas: [
    { img: null, textos: ['No núcleo da galáxia, o silêncio voltou a ser só silêncio.'] },
    { img: 'cena/besta.webp', mov: 'zoomout', pos: 'center', textos: [
      '{nome} enfrentou a Besta onde ninguém mais ousou chegar.',
      'Foi a batalha mais longa que a galáxia já viu. E, no fim, a Besta caiu.'] },
    { img: null, fotos: ['photos/M01.webp', 'photos/S01.webp', 'photos/V02.webp', 'photos/V15.webp', 'photos/D06.webp', 'photos/M10.webp', 'photos/J03.webp', 'photos/B01.webp'], textos: [
      'Com ela, caíram as correntes que prendiam a União.',
      'Um a um, os heróis foram libertados, e todos voltaram a se erguer ao lado de {nome}.'] },
    { img: 'photos/S01.webp', mov: 'zoom', pos: 'top', textos: [
      'Jasmey Badrock olhou para a Aurora, o planeta que um dia cavou, e desta vez deixou o gerbe em paz.'] },
    { img: 'cena/gerbe.webp', mov: 'zoomout', pos: 'center', textos: [
      'As dimensões voltaram a se fechar. As estrelas que restaram voltaram a brilhar.',
      'A galáxia inteira soube o nome de quem não desistiu.'] },
    { img: null, tom: 'grito', textos: ['{nome} libertou a União.'] },
    { img: 'selo.png', mov: 'zoom', pos: 'center', textos: ['Fim.'] },
  ],
};

/* Final alternativo (só com os 7 broches): toca depois do "Fim." — um MAS… e Korvo em Quasar 2. Texto provisório: o autor escreve o definitivo. */
window.DS_CINEMATICA_SECRETA = {
  musica: 'final',
  cenas: [
    { img: null, tom: 'grito', textos: ['Mas…'] },
    { img: 'cena/korvo_quasar2.webp', mov: 'zoom', pos: 'top', textos: [''] },
  ],
};

/* Falas curtas de cada membro da União quando é libertado num miniboss (rascunho do assistente: o autor pode reescrever no tom de cada personagem). {nome} = jogador. */
window.DS_FALAS_UNIAO = {
  D06: ['Eu senti você chegando, {nome}. Os espíritos sussurraram o seu nome.', 'Obrigada por me libertar.'],
  M01: ['Interessante. Todas as pistas apontavam para você, {nome}.', 'Estou dentro. Vamos juntar as peças sobre a Besta.'],
  J03: ['Já atravessei muitas eras, mas poucas vezes fui resgatado.', 'Conte comigo, {nome}.'],
  B01: ['Dois mil anos, e nunca fui libertada por alguém tão determinado.', 'Obrigada, {nome}. Lutarei ao seu lado.'],
  S01: ['Fui eu quem abriu aquela tumba, e paguei caro por isso.', 'Eu devo isso a você, {nome}. Vamos consertar o que eu fiz.'],
  M10: ['A Luz me deixou aqui por um motivo.', 'Acho que agora eu sei qual. Vamos, {nome}.'],
  V15: ['Demorou, hein? Brincadeira! Valeu por me tirar dessa, {nome}.', 'Agora é a minha vez de brilhar.'],
  V02: ['Frio demais lá dentro, até para mim.', 'Vamos, {nome}: ainda temos uma Besta para congelar.'],
};
