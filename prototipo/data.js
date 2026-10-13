/* Dimensions Stacks — dados do jogo.
   TUDO que está marcado "provisorio" é dado de TESTE gerado automaticamente.
   Para definir um personagem de verdade, preencha CARTAS_DEFINITIVAS[id] (ver fim do arquivo). */
(function (root) {
  'use strict';

  const SERIES = {
    jesed:      { nome: 'Ciclo de Jesed',         titulo: 'Ciclo de Jesed', marca: 'JESED',               cor: '#e9b923', escuro: '#7a5a00', texto: '#1d1400', cor2: '#fff1b0' },
    viajantes:  { nome: 'Viajantes Dimensionais', titulo: 'Viajantes Dimensionais', marca: 'VIAJANTES',           cor: '#2f7bf0', escuro: '#12337a', texto: '#ffffff', cor2: '#a9ccff' },
    misterio:   { nome: 'Mistério Oculto',        titulo: 'Mistério Oculto', marca: 'MISTÉRIO OCULTO',     cor: '#d8332f', escuro: '#6d100e', texto: '#ffffff', cor2: '#ffb3ad' },
    belfex:     { nome: 'Série de Édelin', titulo: 'Série de Édelin', marca: 'SÉRIE DE ÉDELIN', cor: '#2faa5a', escuro: '#0f4a26', texto: '#ffffff', cor2: '#aef0c3' },
    diario:     { nome: 'Diário Sobrenatural',    titulo: 'Diário Sobrenatural', marca: 'DIÁRIO SOBRENATURAL', cor: '#8a4fd6', escuro: '#391768', texto: '#ffffff', cor2: '#d9c0ff' },
    spacetheft: { nome: 'Spacetheft',             titulo: 'Spacetheft', marca: 'SPACETHEFT',          cor: '#1b1b22', escuro: '#000000', texto: '#ffffff', cor2: '#9a9aa8' },
  };

  const ATRIBUTOS = [
    { id: 'pod', nome: 'Ataque',       abre: 'ATQ', tipo: 'ataque', par: 0 },
    { id: 'def', nome: 'Defesa',       abre: 'DEF', tipo: 'defesa', par: 0 },
    { id: 'int', nome: 'Inteligência', abre: 'INT', tipo: 'ataque', par: 1 },
    { id: 'vel', nome: 'Velocidade',   abre: 'VEL', tipo: 'defesa', par: 1 },
  ];

  // Prévia: propostas do repositório (cartas_NN.json / habilidades_129.json) — NÃO APROVADAS pelo autor.
  if (typeof require !== 'undefined' && typeof window === 'undefined') { try { require('./propostas.js'); } catch (e) { /* sem propostas */ } }
  const PROP = root.DS_PROPOSTAS || null;
  // perfil proposto -> estilo visual da carta (efeito cosmético; raridade oficial ainda pendente)
  const PERFIL_ESTILO = { 'Elite': 'lendaria', 'Forte': 'epica', 'Padrão': 'rara', 'Modesta': 'comum', 'Frágil': 'comum', 'Azar': 'comum' };
  // Raridade visual (autorizada em 13/10/2026): poder real = soma dos 4 atributos + 16 x maior atributo (o pico decide mais que a soma).
  // Cortes: Lendária >= 1810 (~10%), Épica >= 1710 (~21%), Rara >= 1560 (~34%), Comum abaixo.
  const poder = st => st[0] + st[1] + st[2] + st[3] + 16 * Math.max(st[0], st[1], st[2], st[3]);
  const raridadePoder = st => { const p = poder(st); return p >= 1810 ? 'lendaria' : p >= 1710 ? 'epica' : p >= 1560 ? 'rara' : 'comum'; };

  const RARIDADES = {
    comum:    { nome: 'Comum' },
    rara:     { nome: 'Rara' },
    epica:    { nome: 'Épica' },
    lendaria: { nome: 'Lendária' },
  };

  // Elenco candidato (docs/ELENCO_CANDIDATO.md). nota = "referência narrativa" do seu próprio documento.
  // u = selo A União.
  const R = [
    // Ciclo de Jesed
    ['J01', 'Jokara Amarëa', 'jesed', 'Protagonista eterí; observadora e perseverante'],
    ['J02', 'Nestira Amarëa', 'jesed', 'Sobrevivência, espiritualidade e cuidado prático'],
    ['J03', 'Mark Polar', 'jesed', 'Identidade principal da carta', 1],
    ['J04', 'Gabasteri', 'jesed', 'Sobrevivente experiente e controlador'],
    ['J05', 'Maletar', 'jesed', 'Construtor e referência protetora'],
    ['J06', 'Platisa', 'jesed', 'Ecoante e conhecedora de plantas'],
    ['J07', 'Mariv', 'jesed', 'Sobrevivente, precursor de linhagem futura'],
    ['J08', 'Kaelina', 'jesed', 'Soberana diplomática e estrategista'],
    ['J09', 'Alyra', 'jesed', 'Soberana impulsiva e belicosa'],
    ['J10', 'Daryon Polar', 'jesed', 'Conselheiro manipulador'],
    ['J11', 'Cal Edran', 'jesed', 'Protetor das soberanas'],
    ['J12', 'Rendar', 'jesed', 'Guerreiro ligado aos conflitos e ao clímax'],
    ['J13', 'Nynestra', 'jesed', 'Personagem do elenco canônico do livro 2'],
    ['J14', 'Cal Kadrir', 'jesed', 'Calandrir e Primeiro Kae'],
    ['J15', 'Dareth Quatro-Dedos', 'jesed', 'Personagem central da linha política'],
    ['J16', 'Elis', 'jesed', 'Núcleo principal, integrante da linha familiar'],
    ['J17', 'Selina', 'jesed', 'Núcleo principal'],
    ['J18', 'Vetarius Polar', 'jesed', 'Conspiração e poder Polar'],
    ['J19', 'Kerath Polar', 'jesed', 'Núcleo de Kaendar'],
    ['J20', 'Jelatira', 'jesed', 'Núcleo familiar inicial do livro 4'],
    ['J21', 'Nefestra', 'jesed', 'Eixo temático do passado e da memória'],
    ['J22', 'Sefter', 'jesed', 'Eixo temático do futuro e da reconstrução'],
    ['J23', 'Kedran', 'jesed', 'Eixo temático do presente'],
    // Viajantes Dimensionais
    ['V01', 'Breno Lins', 'viajantes', 'Irmão protetor; densidade e tangibilidade'],
    ['V02', 'Bruno Lins', 'viajantes', 'Gelo e frio; impulsivo e competitivo', 1],
    ['V03', 'Banjo Lins', 'viajantes', 'Telecinese; imaginativo'],
    ['V04', 'Beatriz Lins', 'viajantes', 'Fogo/caos, difícil de controlar'],
    ['V05', 'Velho-Sábio', 'viajantes', 'Mentor e conhecedor de Korvo'],
    ['V06', 'Erla', 'viajantes', 'Liderança da Vigilância de Tayo'],
    ['V07', 'Lucas Veline', 'viajantes', 'Governante de Tayo'],
    ['V08', 'Garmand', 'viajantes', 'Aliado/Sociedade de Tayo'],
    ['V09', 'Ricochet Bombergue', 'viajantes', 'Aliado/Sociedade de Tayo'],
    ['V10', 'Korvo', 'viajantes', 'Dimensal e mago negro'],
    ['V11', 'Gary', 'viajantes', 'Ligado à Vigilância e a Korvo'],
    ['V12', 'Anasin', 'viajantes', 'Integrante da Patrulha de Korvo'],
    ['V13', 'Saliens', 'viajantes', 'Integrante da Patrulha de Korvo'],
    ['V14', 'Tio Frank', 'viajantes', 'Responsável pelos irmãos Lins'],
    ['V15', 'Brenda', 'viajantes', 'Aprendiz de Tayo', 1],
    ['V16', 'Facka', 'viajantes', 'Jovem Aracna, guia dos irmãos Lins em Belfex'],
    ['V17', 'Lanigiah', 'viajantes', 'Rainha das Aracnas'],
    ['V18', 'Grande Pai Gaia', 'viajantes', 'Líder dos Obbs de Pinesoto'],
    ['V19', 'Seti', 'viajantes', 'Líder de guerra dos Obbs'],
    ['V20', 'William McCroys', 'viajantes', 'Mago tutor de Belfex, mentor dos gêmeos Corvane'],
    ['V21', 'Shirley Ainsworth', 'viajantes', 'Senavelita de luz e amiga de Banjo'],
    ['V22', 'Nicolas Corvane', 'viajantes', 'Gêmeo de Erick, aprendiz de McCroys'],
    ['V23', 'Erick Corvane', 'viajantes', 'Gêmeo de Nicolas, aprendiz de McCroys'],
    ['V24', 'Maria Santoro', 'viajantes', 'Aprendiz de Belfex e melhor amiga de Eshley'],
    ['V25', 'Eshley Damaris', 'viajantes', 'Aprendiz veloz criada pela avó dimensal'],
    // Spacetheft
    ['S01', 'Jasmey Badrock', 'spacetheft', 'Pirata Dale e protagonista; braço metálico', 1],
    ['S02', 'Amanda', 'spacetheft', 'Aliada de Jasmey, crítica do regime da Lebargan'],
    ['S03', 'Eric', 'spacetheft', 'Irmão de Amanda; ligado ao Olho de Domongo'],
    ['S04', 'Lias Hardman', 'spacetheft', 'Engenheiro e inventor'],
    ['S05', 'Kord', 'spacetheft', 'Integrante do grupo de Jasmey'],
    ['S06', "O'reilly", 'spacetheft', 'Integrante do grupo e aliado de Hardman'],
    ['S07', 'Buni', 'spacetheft', 'Integrante do grupo e aliado de Hardman'],
    ['S08', 'Vivian', 'spacetheft', 'Manipulação atômica/genética ligada ao Olho'],
    ['S09', 'Capitã Nastácia', 'spacetheft', 'Capitã lendária da Lebargan'],
    ['S10', 'Jelles', 'spacetheft', 'Líder brutal e controlador'],
    ['S11', 'A Besta', 'spacetheft', 'Criatura despertada na Aurora'],
    ['S12', 'Vek', 'spacetheft', 'Pirata, companheiro ligado à Saezi'],
    ['S13', 'Capitão Tzough', 'spacetheft', 'Capitão pirata rival'],
    ['S14', 'Genrir', 'spacetheft', 'Rival de Jasmey'],
    ['S15', 'Tersário', 'spacetheft', 'Predador cósmico solto na doca da Lebargan'],
    ['S16', 'A Engenheira', 'spacetheft', 'Cientista de biotecnologia que revive Jasmey'],
    ['S17', 'Luna Stellar', 'spacetheft', 'Sedutora ambígua que rouba a nave de Jasmey'],
    ['S18', 'Alekta', 'spacetheft', 'Pirata feroz da Fera Sideral'],
    // Diário Sobrenatural
    ['D01', 'Junior Quissama', 'diario', 'Escritor e organizador futuro dos relatos'],
    ['D02', 'Priscila Fontenelle', 'diario', 'Irmã de Kelly e protagonista'],
    ['D03', 'Pedro Souza', 'diario', 'Melhor amigo de Junior'],
    ['D04', 'Kelly Fontenelle', 'diario', 'Investigação sobrenatural'],
    ['D05', 'Vinícius Silva', 'diario', 'Protagonista marcado por conflitos familiares'],
    ['D06', 'Jennifer de Morais', 'diario', 'Visões e sensibilidade a espíritos', 1],
    ['D07', 'Ingrid Marques', 'diario', 'Espírito, integrante da família Carnam'],
    ['D08', 'Glenda Mendes', 'diario', 'Deseja ser jornalista e investiga o sobrenatural'],
    ['D09', 'Diego Tavolieri', 'diario', 'Nome selecionado pelo autor'],
    ['D10', 'Sra. Olívia', 'diario', 'Senhora da casa na serra; ligada ao passado de Alvorada Alegre'],
    ['D11', 'Cara-de-Larva', 'diario', 'Demônio executor ligado à Besta da Carnificina'],
    ['D12', 'Agouro', 'diario', 'Entidade sobrenatural e agente de manipulação'],
    ['D13', 'Suéten Marques', 'diario', 'Integrante do conjunto de espíritos/Elos Carnam'],
    ['D14', 'Filipo Brandolini', 'diario', 'Personagem do livro 2; ligado a Manu'],
    ['D15', 'O Pai', 'diario', 'Demônio dos sentidos com a forma do pai Carnam'],
    ['D16', 'A Mãe', 'diario', 'Demônio dos sentidos com a forma da mãe Isabela; Elo no álbum de fotografias'],
    ['D17', 'A Avó', 'diario', 'Demônio dos sentidos com a forma da avó; Elo nas lentes dos óculos'],
    ['D18', 'O Cão', 'diario', 'Demônio dos sentidos com a forma do cão Ibliso; Elo na coleira'],
    ['D19', 'Manu', 'diario', 'Jovem sem memória ligada a Alvorada Alegre'],
    // Mistério Oculto
    ['M01', 'Hyde', 'misterio', 'Investigador, observação e raciocínio lógico', 1],
    ['M02', 'Agente Sete', 'misterio', 'Ex-SPAGE, investigação e estratégia operacional'],
    ['M03', 'Diana', 'misterio', 'Figura central do passado emocional de Hyde'],
    ['M04', 'Matt Pontas', 'misterio', 'Advogado e solucionador de problemas'],
    ['M05', 'Padre Tomas', 'misterio', 'Mentor moral de Hyde'],
    ['M06', 'Benjamin Karnudo', 'misterio', 'Identidade central à investigação'],
    ['M07', 'Agente Seis', 'misterio', 'Ex-mentor de Sete e figura da SPAGE'],
    ['M08', 'Dra. Helena Valença', 'misterio', 'Cientista envolvida no eixo investigativo'],
    ['M09', 'Richard Falkner', 'misterio', 'Também chamado Bulldog'],
    ['M10', 'Releuz', 'misterio', 'Luzitano deixado na Terra pela Luz', 1],
    ['M11', 'X', 'misterio', 'Figura do núcleo investigativo/conspiratório'],
    ['M12', 'James Harrow', 'misterio', 'Personagem de relevância ideológica na trama'],
    // Belfex
    ['B01', 'Édelin Lys', 'belfex', 'Série de Édelin', 1],
  ];

  // ---------- gerador de dados PROVISÓRIOS (determinístico por id) ----------
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // especiais implementados no motor, usados como placeholders (ver engine.js)
  const ESPECIAIS_PLACEHOLDER = ['AE-001','AE-002','AE-003','AE-004','AE-005','AE-006','AE-007','AE-008','AE-009','AE-010',
    'AE-011','AE-012','AE-013','AE-014','AE-015','AE-016','AE-017','AE-018','AE-019','AE-020',
    'AE-035','AE-041','AE-049','AE-066','AE-071','AE-072','AE-082','AE-083','AE-090','AE-093','AE-105','AE-106','AE-108','AE-111','AE-113'];

  function gerarProvisorio(id) {
    const r = rng(hash(id));
    const alvo = 195 + Math.floor(r() * 80);           // soma total ~195–275
    let p = [0, 0, 0, 0].map(() => 0.35 + r());
    const s = p.reduce((a, b) => a + b, 0);
    p = p.map(v => Math.max(12, Math.min(96, Math.round(v / s * alvo))));
    const q = r();
    const raridade = q < 0.58 ? 'comum' : q < 0.84 ? 'rara' : q < 0.96 ? 'epica' : 'lendaria';
    const especial = ESPECIAIS_PLACEHOLDER[Math.floor(r() * ESPECIAIS_PLACEHOLDER.length)];
    return { stats: p, raridade, especial };
  }

  // ---------- DADOS DEFINITIVOS (preencher aqui quando estiverem prontos) ----------
  // Exemplo:
  // J08: { stats: [48, 70, 86, 60], raridade: 'epica', especial: 'AE-113',
  //        descricao: 'Texto da carta.', imagem: 'Ciclo de Jesed/.../Kaelina.png' }
  const CARTAS_DEFINITIVAS = {
  };

  function montarCartas() {
    return R.map(function (row) {
      const id = row[0], nome = row[1], serie = row[2], nota = row[3], uniao = !!row[4];
      const g = gerarProvisorio(id);
      const d = CARTAS_DEFINITIVAS[id] || {};
      const definitiva = !!d.stats;
      const pr = !definitiva && PROP && PROP.cartas[id] ? PROP.cartas[id] : null;
      const st = d.stats || (pr ? pr.s : g.stats);
      return {
        id: id, nome: nome, serie: serie, nota: nota, uniao: uniao,
        descricao: d.descricao || (pr ? pr.d : ''),
        perfil: pr ? pr.p : null,
        proposta: !!pr && !pr.a,
        aprovada: !!(pr && pr.a),
        stats: { pod: st[0], def: st[1], int: st[2], vel: st[3] },
        raridade: d.raridade || (pr ? raridadePoder(st) : g.raridade),
        especial: d.especial || (pr ? pr.e : g.especial),
        provisorio: !definitiva && !(pr && pr.a),
      };
    });
  }

  root.DS_DATA = { poder: poder, SERIES: SERIES, ATRIBUTOS: ATRIBUTOS, RARIDADES: RARIDADES, CARTAS: montarCartas(), HABILIDADES: PROP ? PROP.hab : {}, hash: hash, rng: rng };
})(typeof window !== 'undefined' ? window : globalThis);
