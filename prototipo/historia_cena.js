/* Cinemática inicial do modo história. SÓ DADOS: edite aqui (ou me envie o texto que eu preencho).
   Cada cena tem uma imagem (opcional) e uma lista de falas; cada toque mostra a próxima fala (digitada letra por letra).
   Campos da cena:  img: caminho da imagem (ex.: 'photos/S11.webp', 'selo.png') ou null (fica só o preto)
                    mov: 'zoom' | 'zoomout' | 'esq' | 'dir' | 'fixo'   (movimento lento da imagem)
                    cor: cor de fundo atrás da imagem (padrão preto) · pos: 'center' | 'top' | 'bottom' (enquadramento)
                    textos: ['fala 1', 'fala 2', ...]   ·  tom: 'narr' (padrão, itálico suave) | 'fala' | 'grito' (grande, tremendo)
   O jogador pode tocar para avançar, e "Pular" leva direto ao mapa. */
window.DS_CINEMATICA = {
  musica: 'intro',          // trilha: musica/historia_intro.mp3 (opcional)
  cenas: [
    { img: null, mov: 'fixo', textos: ['[TEXTO DE EXEMPLO] A história de A União ainda será escrita aqui.', 'Toque para continuar.'] },
    { img: 'selo.png', mov: 'zoom', pos: 'center', textos: ['[TEXTO DE EXEMPLO] Esta imagem é só um teste do movimento.'] },
    { img: null, mov: 'fixo', textos: ['[TEXTO DE EXEMPLO] E então você abriu os olhos.'], tom: 'grito' },
  ],
};
