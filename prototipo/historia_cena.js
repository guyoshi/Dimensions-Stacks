/* Cinemática inicial do modo história. SÓ DADOS: edite aqui (ou me envie o texto que eu preencho).
   Cada cena tem uma imagem (opcional) e uma lista de falas; cada toque mostra a próxima fala (digitada letra por letra).
   Campos da cena:  img: caminho da imagem ou null (fica só o preto)
                    mov: 'zoom' | 'zoomout' | 'esq' | 'dir' | 'fixo'   (movimento lento da imagem)
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
      'Há muito tempo, a Besta foi aprisionada no coração de um planeta de gerbe, um dos materiais mais valiosos de todo o universo.',
      'O metal a cobriu como uma tumba. Ninguém soube o que dormia lá dentro. Ninguém quis saber.'] },
    { img: 'photos/S01.webp', mov: 'zoomout', pos: 'top', textos: [
      'Até que Jasmey Badrock e sua equipe, caçadores de tesouros em busca do próximo grande achado, pousaram em Gerbe.',
      'Eles viram riqueza. Cavaram fundo. E cavaram demais.'] },
    { img: 'cena/besta.webp', mov: 'zoom', pos: 'center', tom: 'grito', textos: ['Ela acordou.'] },
    { img: 'cena/besta.webp', mov: 'esq', pos: 'center', textos: [
      'A Besta engoliu estrelas. Depois, sistemas inteiros.',
      'E então começou a rasgar as paredes entre as dimensões.'] },
    { img: 'photos/J03.webp', mov: 'zoomout', pos: 'top', textos: [
      'Sem saída, Jasmey pediu ajuda à União: heróis de todos os cantos do universo, o único grupo que talvez pudesse deter a Besta.',
      'Eles atenderam ao chamado.'] },
    { img: 'cena/besta.webp', mov: 'dir', pos: 'center', textos: [
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
