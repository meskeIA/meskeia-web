import type { HistoriaData } from './types';

export const modaEspanola: HistoriaData = {
  slug: 'moda-espanola',
  titulo: 'Historia de la Moda Española: De los Reyes Católicos a Zara e Inditex',
  subtitulo: 'De la Corte de los Reyes Católicos a Balenciaga, Loewe e Inditex — 600 años de moda en 10 períodos interactivos',
  descripcionSEO: 'Cronología interactiva de la historia de la moda española: desde la moda medieval castellana y el Siglo de Oro hasta Balenciaga en París, la Movida Madrileña, la revolución fast fashion de Zara y el lujo global de Loewe. 10 hitos y 6 eras.',
  keywords: [
    'historia moda española cronología',
    'balenciaga español getaria paris',
    'inditex zara fast fashion historia',
    'siglo de oro moda gorguera felipe II',
    'movida madrileña moda agatha ruiz prada',
    'moda gallega adolfo domínguez arruga bella',
    'loewe jonathan anderson lujo español',
    'fortuny delphos dress diseñador español',
    'alta costura española historia',
    'moda sostenible circular España',
  ],
  anioInicio: 1400,
  anioFin: 9999,

  hitos: [
    {
      id: 'indumentaria-medieval',
      nombre: 'Indumentaria Medieval y Castellana',
      anioInicio: 1400,
      anioFin: 1516,
      color: '#8B4513',
      categoria: 'medieval',
      descripcion: 'La Corte de los Reyes Católicos establece los cánones de la moda peninsular. El brial y la saya son las prendas femeninas principales, mientras que los hombres visten jubón y capa. La influencia mora y judía enriquece los bordados y los tejidos. Toledo produce los mejores paños de lana, Valencia exporta sedas a toda Europa y Burgos es el centro de los bordados castellanos.',
      obraIconica: 'Retratos de Isabel I de Castilla — más de 200 vestidos en su guardarropa, algunos superando los 10 kilos por bordados en oro',
      paises: ['España'],
    },
    {
      id: 'siglo-oro-moda',
      nombre: 'El Siglo de Oro: España Dicta la Moda Europea',
      anioInicio: 1516,
      anioFin: 1600,
      color: '#4B0082',
      categoria: 'siglo_oro',
      descripcion: 'Felipe II impone el negro a toda Europa como color de la elegancia máxima. La gorguera, cuello rígido de encaje que enmarca el rostro, se convierte en el símbolo del poder español. La ropilla, la capa y las calzas completan el traje masculino. La Corte española es el árbitro de elegancia de todo el continente durante casi un siglo.',
      obraIconica: 'Gorguera de encaje de Felipe II — hasta 15 metros de encaje por pieza; su mantenimiento diario equivalía al salario semanal de un artesano',
      paises: ['España'],
    },
    {
      id: 'barroco-guardainfante',
      nombre: 'El Barroco y los Excesos Cortesanos',
      anioInicio: 1600,
      anioFin: 1700,
      color: '#D2691E',
      categoria: 'barroco',
      descripcion: 'Velázquez inmortaliza la moda de su época en Las Meninas (1656): la infanta Margarita viste el guardainfante, estructura que extiende la falda lateralmente hasta extremos grotescos. Los encajes flamencos sustituyen a la gorguera rígida. Francia, bajo Luis XIV, comienza a disputar a España el liderazgo de la moda europea.',
      obraIconica: 'Las Meninas — Diego Velázquez (1656) — el mejor documento visual de la moda barroca española; el guardainfante podía alcanzar 1,5 metros de anchura',
      paises: ['España'],
    },
    {
      id: 'borbones-maja',
      nombre: 'Los Borbones, la Maja y la Resistencia Popular',
      anioInicio: 1700,
      anioFin: 1874,
      color: '#DAA520',
      categoria: 'borbones',
      descripcion: 'Felipe V trae la moda francesa (casacas, pelucas, tacones rojos), pero el pueblo español resiste: majas y majos lucen chaquetilla corta, basquiña y mantilla como afirmación de identidad popular. Goya retrata esta dualidad en sus pinturas. El Romanticismo europeo exotiza la imagen española (Carmen de Mérimée, 1845) y los trajes regionales se consolidan como identidad nacional.',
      obraIconica: 'La maja vestida y La maja desnuda — Francisco de Goya (c. 1800–1808) — la Duquesa de Alba como maja, acto político de reivindicación de la moda popular',
      paises: ['España'],
    },
    {
      id: 'modistos-paris',
      nombre: 'Los Grandes Modistos Españoles en París',
      anioInicio: 1874,
      anioFin: 1936,
      color: '#228B22',
      categoria: 'modistos',
      descripcion: 'Mariano Fortuny revoluciona la moda con el Delphos dress (1909), vestido plisado que libera el cuerpo femenino del corsé. Es el primer diseñador español con reconocimiento internacional. En España, Pedro Rodríguez y Manuel Pertegaz fundan las bases de la Alta Costura española. El joven Cristóbal Balenciaga abre sus primeras casas en San Sebastián, Madrid y Barcelona.',
      obraIconica: 'Delphos dress — Mariano Fortuny (patentado 1909) — revolución equiparable a Chanel; el secreto de su plisado nunca se reveló y sigue sin reproducirse fielmente',
      paises: ['España', 'Italia', 'Francia'],
    },
    {
      id: 'autarquia-balenciaga',
      nombre: 'Autarquía, Posguerra y Balenciaga en París',
      anioInicio: 1936,
      anioFin: 1959,
      color: '#696969',
      categoria: 'autarquia',
      descripcion: 'La Guerra Civil y la posguerra imponen escasez de tejidos y racionamiento de ropa. Mientras España sufre la autarquía, Cristóbal Balenciaga abre su casa en París en 1937 y se convierte en el "Rey de la Moda" entre 1947 y 1968. Dior lo considera "el único maestro de todos nosotros". La silueta semiesférica, el traje de saco y el vestido globo definen una era.',
      obraIconica: 'Silueta Balenciaga (1947–1968) — Dior: "Es el único de nosotros que es un couturier en el verdadero sentido de la palabra"; muere en Jávea (Alicante) en 1972',
      paises: ['España', 'Francia'],
    },
    {
      id: 'desarrollismo-pret-a-porter',
      nombre: 'El Desarrollismo y el Prêt-à-Porter',
      anioInicio: 1959,
      anioFin: 1975,
      color: '#FF8C00',
      categoria: 'desarrollismo',
      descripcion: 'El Plan de Estabilización (1959) abre España al exterior: turismo, televisión y revistas internacionales traen nuevas modas. Pedro Rodríguez y Elio Berhanyer establecen la Alta Costura española. Loewe consolida su posición como casa de lujo con sus bolsos de piel. La llegada del prêt-à-porter democratiza la moda: deja de ser solo para la élite.',
      obraIconica: 'Bolso Amazona de Loewe (1970s) — fundada en Madrid en 1846, primer icono del lujo español; en 1996 LVMH la adquiere',
      paises: ['España'],
    },
    {
      id: 'movida-pasarela-cibeles',
      nombre: 'La Movida y la Explosión Creativa',
      anioInicio: 1975,
      anioFin: 1992,
      color: '#FF1493',
      categoria: 'movida',
      descripcion: 'Con la muerte de Franco y la Transición, la moda española explota en creatividad. Agatha Ruiz de la Prada (1981) presenta colecciones de colores desbordantes que convierten la moda en arte. Francis Montesinos redefine el diseño conceptual. La Pasarela Cibeles se inaugura en 1985 como plataforma del diseño español. La Movida Madrileña es tanto fenómeno musical como estético.',
      obraIconica: 'Primera colección de Agatha Ruiz de la Prada (1981) — 23 vestidos hechos con telas del rastro; hoy tiene más de 40 licencias internacionales',
      paises: ['España'],
    },
    {
      id: 'zara-fast-fashion',
      nombre: 'Zara, la Moda Gallega y la Revolución Fast Fashion',
      anioInicio: 1992,
      anioFin: 2010,
      color: '#2E86AB',
      categoria: 'fast_fashion',
      descripcion: 'Adolfo Domínguez lanza "La arruga es bella" (1984) y consolida el minimalismo gallego junto a Purificación García y Roberto Verino. Inditex se convierte en la primera empresa de moda del mundo por capitalización en 2001. El modelo Zara —del diseño a la tienda en dos semanas— revoluciona la industria global. La moda democratiza pero genera sobreproducción.',
      obraIconica: 'Zara / Inditex (2001) — Amancio Ortega desde A Coruña; en 2001 supera a H&M y Gap como empresa de moda más valiosa del mundo; 71.000 millones de patrimonio en su pico',
      paises: ['España'],
    },
    {
      id: 'lujo-global-sostenible',
      nombre: 'Lujo Global, Moda Sin Género y Sostenibilidad',
      anioInicio: 2010,
      anioFin: 9999,
      color: '#9370DB',
      categoria: 'lujo',
      descripcion: 'Jonathan Anderson transforma Loewe en la marca de lujo de más rápido crecimiento del mundo (2013). Demna Gvasalia hace lo mismo en Balenciaga (2015). Palomo Spain redefine la masculinidad con volantes y referencias flamencas. La pandemia acelera la reflexión sobre consumo: Zara lanza Join Life. El Museo Balenciaga en Getaria recibe más de 100.000 visitantes al año.',
      obraIconica: 'Bolso Puzzle de Loewe — diseñado por Jonathan Anderson en 2015; valor 2.000–5.000€; en segunda mano hasta 8.000€; el bolso español más deseado de la historia',
      paises: ['España', 'Global'],
    },
  ],

  eras: [
    {
      nombre: 'Moda Imperial Española',
      desde: 1400,
      hasta: 1700,
      icono: '👑',
      hitosDestacados: [
        'Indumentaria Medieval y Castellana',
        'El Siglo de Oro: España Dicta la Moda Europea',
        'El Barroco y los Excesos Cortesanos',
      ],
      eventos: [
        '1516 — Carlos I hereda la Corona española: la Corte española se convierte en árbitro de la moda europea',
        '1556 — Felipe II impone el negro y la gorguera como canon de elegancia en toda Europa',
        '1600 — Francia bajo Luis XIV comienza a disputar a España el liderazgo de la moda continental',
        '1656 — Las Meninas de Velázquez: el mejor documento visual de la moda barroca española',
      ],
    },
    {
      nombre: 'Del Barroco al Romanticismo',
      desde: 1700,
      hasta: 1874,
      icono: '🌹',
      hitosDestacados: [
        'Los Borbones, la Maja y la Resistencia Popular',
      ],
      eventos: [
        '1700 — Felipe V llega de Versalles e impone la moda francesa en la aristocracia española',
        '1797 — Goya pinta La maja vestida y La maja desnuda: dualidad maja-aristocracia como identidad nacional',
        '1845 — Prosper Mérimée publica Carmen: imagen romántica de España exportada a toda Europa',
        '1860 — Primeras casas de modistería en Madrid: calles del Carmen y Preciados',
      ],
    },
    {
      nombre: 'La Alta Costura Española',
      desde: 1874,
      hasta: 1959,
      icono: '✂️',
      hitosDestacados: [
        'Los Grandes Modistos Españoles en París',
        'Autarquía, Posguerra y Balenciaga en París',
      ],
      eventos: [
        '1909 — Mariano Fortuny patenta el Delphos dress: primer diseñador español de alcance global',
        '1927 — Cristóbal Balenciaga abre su primera casa en San Sebastián',
        '1937 — Balenciaga abre su maison en París tras la Guerra Civil española',
        '1947 — Balenciaga crea la silueta semiesférica: "el único maestro" según Dior',
      ],
    },
    {
      nombre: 'Desarrollismo y Movida',
      desde: 1959,
      hasta: 1992,
      icono: '🎨',
      hitosDestacados: [
        'El Desarrollismo y el Prêt-à-Porter',
        'La Movida y la Explosión Creativa',
      ],
      eventos: [
        '1959 — Plan de Estabilización: apertura exterior y llegada del prêt-à-porter a España',
        '1975 — Muerte de Franco: la Transición libera la creatividad y nace la moda española moderna',
        '1981 — Primera colección de Agatha Ruiz de la Prada: 23 vestidos hechos con telas del rastro',
        '1985 — Inauguración de la Pasarela Cibeles: escaparate del diseño español al mundo',
      ],
    },
    {
      nombre: 'Revolución Inditex y Moda Gallega',
      desde: 1992,
      hasta: 2010,
      icono: '🏪',
      hitosDestacados: [
        'Zara, la Moda Gallega y la Revolución Fast Fashion',
      ],
      eventos: [
        '1984 — "La arruga es bella" de Adolfo Domínguez: el minimalismo gallego conquista Europa',
        '1996 — LVMH adquiere Loewe, consolidando el lujo español en el mercado internacional',
        '2001 — Inditex supera a H&M y Gap como empresa de moda más valiosa del mundo',
        '2007 — Inditex supera las 3.000 tiendas en más de 60 países',
      ],
    },
    {
      nombre: 'Lujo Global y Sostenibilidad',
      desde: 2010,
      hasta: 9999,
      icono: '🌱',
      hitosDestacados: [
        'Lujo Global, Moda Sin Género y Sostenibilidad',
      ],
      eventos: [
        '2011 — Inauguración del Museo Cristóbal Balenciaga en Getaria: más de 100.000 visitantes al año',
        '2013 — Jonathan Anderson asume la dirección creativa de Loewe: inicio de la nueva era dorada',
        '2015 — Palomo Spain redefine la moda masculina española con referencias flamencas',
        '2020 — La pandemia acelera la moda circular; Zara lanza Join Life con materiales sostenibles',
      ],
    },
  ],

  categorias: {
    medieval: 'Medieval',
    siglo_oro: 'Siglo de Oro',
    barroco: 'Barroco',
    borbones: 'Borbones y Romanticismo',
    modistos: 'Modistos en París',
    autarquia: 'Autarquía',
    desarrollismo: 'Desarrollismo',
    movida: 'La Movida',
    fast_fashion: 'Fast Fashion',
    lujo: 'Lujo Global',
  },

  colores: {
    medieval: '#8B4513',
    siglo_oro: '#4B0082',
    barroco: '#D2691E',
    borbones: '#DAA520',
    modistos: '#228B22',
    autarquia: '#696969',
    desarrollismo: '#FF8C00',
    movida: '#FF1493',
    fast_fashion: '#2E86AB',
    lujo: '#9370DB',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La moda española no ha sido lineal: ha alternado períodos de máxima influencia global —cuando España mandaba en la moda europea, cuando Balenciaga era el rey indiscutido de París, cuando Inditex reinventaba la industria global— con períodos de absorción de tendencias externas. Cada momento de poder político o económico español se ha reflejado en su moda.',

    tablaComparativa: [
      { hito: 'El Siglo de Oro', periodo: '1516–1600', categoria: 'Siglo de Oro', personaje: 'Felipe II', aportacion: 'España dicta la moda europea: negro, gorguera y austeridad elegante' },
      { hito: 'El Barroco', periodo: '1600–1700', categoria: 'Barroco', personaje: 'Diego Velázquez', aportacion: 'Guardainfante e iconografía visual inmortalizada en Las Meninas' },
      { hito: 'Borbones y Maja', periodo: '1700–1874', categoria: 'Borbones', personaje: 'Francisco de Goya', aportacion: 'Resistencia popular: la maja como identidad nacional frente a la moda afrancesada' },
      { hito: 'Modistos en París', periodo: '1874–1959', categoria: 'Modistos', personaje: 'Cristóbal Balenciaga', aportacion: 'Alta Costura española con proyección global; "el único maestro" según Dior' },
      { hito: 'La Movida', periodo: '1975–1992', categoria: 'Movida', personaje: 'Agatha Ruiz de la Prada', aportacion: 'Moda como arte y activismo: color desbordante, transgresión democrática' },
      { hito: 'Fast Fashion / Lujo', periodo: '1992–hoy', categoria: 'Fast Fashion / Lujo', personaje: 'Amancio Ortega / Jonathan Anderson', aportacion: 'España lidera simultáneamente los dos extremos: fast fashion (Inditex) y lujo global (Loewe)' },
    ],

    escenarios: [
      {
        icono: '👑',
        titulo: 'Entender la moda como lenguaje de poder',
        perfil: 'Estudiante de historia, arte o comunicación',
        texto: 'La moda española ha sido siempre lenguaje político: Felipe II usó el negro como señal de poder y control, la maja fue resistencia cultural frente a la aristocracia afrancesada, y la Movida Madrileña usó la transgresión visual como declaración de libertad tras 40 años de franquismo. Estudiar la moda española es estudiar la historia de España.',
      },
      {
        icono: '💼',
        titulo: 'Comprender el modelo de negocio Inditex',
        perfil: 'Estudiante de empresariales, emprendedor o consultor',
        texto: 'Zara no inventó la ropa barata: inventó la velocidad. Al integrar verticalmente diseño, producción y venta, Inditex redujo el tiempo de respuesta de meses a semanas. Este modelo, replicado por H&M, Primark y Shein, transformó para siempre la economía global de la moda. Entender Inditex es entender la innovación empresarial del siglo XX en España.',
      },
      {
        icono: '🎨',
        titulo: 'Profundizar en el legado de Balenciaga',
        perfil: 'Aficionado a la moda, visitante del museo o turista cultural',
        texto: 'Cristóbal Balenciaga nació en Getaria (Guipúzcoa) en 1895 y se convirtió en el diseñador más influyente del siglo XX según muchos críticos. Su museo en Getaria conserva más de 1.200 piezas originales. Para entender por qué Dior lo llamaba "el único maestro", hay que visitar el museo y conocer la silueta semiesférica, el traje de saco y el vestido globo que creó.',
      },
      {
        icono: '🌍',
        titulo: 'Explorar la paradoja del lujo español contemporáneo',
        perfil: 'Periodista, investigador cultural o profesional de la moda',
        texto: 'La paradoja del lujo español: Loewe (española desde 1846) es dirigida por Jonathan Anderson (irlandés) y Balenciaga (española) por Demna Gvasalia (georgiano). Pero ambos reinterpretan referencias españolas: artesanía, flamenco, el Prado, la cerámica. Lo español es la materia prima que talentos internacionales convierten en producto global. ¿Es eso fortaleza o debilidad?',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué Balenciaga es español si está en París?',
        respuesta: 'Cristóbal Balenciaga nació en Getaria (Guipúzcoa) en 1895 y abrió sus primeras casas en San Sebastián, Madrid y Barcelona en los años 20 y 30. La Guerra Civil le obligó a cerrar sus casas españolas y trasladarse a París en 1937. Aunque trabajó en París, sus colecciones estaban impregnadas de referencias españolas: flamencas, religiosas, populares. Cerró su casa en 1968 y murió en Jávea (Alicante) en 1972.',
        tip: 'El Museo Cristóbal Balenciaga en Getaria (inaugurado en 2011) conserva más de 1.200 piezas originales y recibe más de 100.000 visitantes al año. Es uno de los museos de moda más importantes de Europa.',
      },
      {
        pregunta: '¿Por qué Felipe II impuso el negro en toda Europa?',
        respuesta: 'El color negro en la Corte española del siglo XVI combinaba influencias borgoñonas con la austeridad del catolicismo severo post-Trento. Su asociación con el poder, la seriedad y el control se convirtió en un estándar que todas las cortes europeas copiaron. La gorguera de encaje (hasta 15 metros de encaje por pieza) completaba este canon de elegancia austera pero costosísima.',
        tip: 'La ironía del negro como símbolo de poder: el negro no era barato ni fácil de teñir con los tintes de la época. Era, de hecho, un color caro que demostraba riqueza precisamente por su apariencia austera.',
      },
      {
        pregunta: '¿Qué es el fast fashion y por qué es problemático?',
        respuesta: 'El fast fashion es el modelo de producción de ropa de tendencia a bajo coste con rotación ultrarrápida (20+ colecciones al año vs. 2 tradicionales). Lo que democratizó el acceso a la moda también generó externalidades: la industria textil es responsable del 10% de las emisiones globales de CO2, consume 93.000 millones de litros de agua al año y genera 92 millones de toneladas de residuos textiles. Inditex fue pionero; Shein ha llevado el modelo al extremo.',
        tip: 'Una camiseta de algodón requiere 2.700 litros de agua para producirse (el equivalente a lo que bebe una persona en 2,5 años). Un vaquero, entre 7.000 y 10.000 litros.',
      },
      {
        pregunta: '¿Por qué la moda gallega es un fenómeno propio?',
        respuesta: 'La concentración de grandes diseñadores en Galicia (Adolfo Domínguez, Purificación García, Roberto Verino, y la sede de Inditex en A Coruña) no es accidental. La industria textil gallega tiene raíces históricas en la producción de lino y lana. La cercanía a Portugal y la cultura de la confección familiar crearon un ecosistema favorable. El minimalismo "gallego" es también una respuesta cultural: austeridad y calidad frente al exceso mediterráneo.',
        tip: 'Adolfo Domínguez abrió su primera tienda en Ourense en 1976. Tardó 8 años en llegar a Madrid (1984). El eslogan "La arruga es bella" fue un escándalo en la industria textil española, que presionó para que lo retirase.',
      },
      {
        pregunta: '¿Qué es la moda circular y cuál es el papel de España?',
        respuesta: 'La moda circular busca que las prendas se diseñen para durar, repararse, reutilizarse y reciclarse al final de su vida, en lugar de acabar en vertederos. Inditex tiene el mayor programa de recogida textil del mundo (más de 30.000 toneladas/año), pero solo el 1% de la ropa mundial se recicla en nuevas fibras. España tiene potencial: artesanía, diseñadores comprometidos y una cultura emergente de segunda mano.',
        tip: 'La plataforma Vinted, usada por millones de españoles, es hoy el mayor escaparate de segunda mano de Europa. En 2023 superó en usuarios a muchas plataformas de moda nueva.',
      },
    ],

    pasos: [
      {
        titulo: 'Visita el Museo Cristóbal Balenciaga en Getaria',
        cuerpo: 'El museo, inaugurado en 2011 en el pueblo natal del diseñador, conserva más de 1.200 piezas originales: vestidos, trajes de noche, bocetos y materiales. Integrado en el palacio de los Aldamar, es imprescindible para entender por qué Dior llamaba a Balenciaga "el único maestro". Reserva entrada online con antelación, especialmente en temporada alta (verano).',
      },
      {
        titulo: 'Sigue la Mercedes-Benz Fashion Week Madrid',
        cuerpo: 'La Semana de la Moda de Madrid (heredera de la Pasarela Cibeles, inaugurada en 1985) se celebra dos veces al año en IFEMA. Es el principal escaparate del diseño español emergente y consolidado. Las colecciones de Agatha Ruiz de la Prada son un espectáculo en sí mismas. Algunas entradas son públicas o se retransmiten en streaming oficial.',
      },
      {
        titulo: 'Explora las colecciones históricas en museos',
        cuerpo: 'El Museo del Traje en Madrid (CIPE) conserva prendas desde el siglo XV hasta hoy. El Museo de Historia de Catalunya tiene colecciones textiles medievales. El Museu Tèxtil i d\'Indumentària de Barcelona documenta la industria textil catalana. Todos tienen fondos digitalizados accesibles online para quienes no puedan visitar presencialmente.',
      },
      {
        titulo: 'Descubre la segunda mano y la moda circular española',
        cuerpo: 'El Rastro de Madrid (domingo, La Latina) tiene vendedores especializados en moda vintage española de los años 70-90. En Barcelona, el mercado de Sant Antoni tiene sección de ropa vintage. Las plataformas Vinted y Wallapop tienen miles de piezas de diseñadores españoles a precios muy accesibles. La segunda mano es también una forma de aprender historia de la moda.',
      },
      {
        titulo: 'Lee las fuentes primarias de cada época',
        cuerpo: 'Para el Siglo de Oro: los inventarios reales publicados por archivos históricos. Para el barroco: el catálogo del Prado con Las Meninas y otros retratos de corte. Para el siglo XX: los memoriales de modistas y couturiers en las hemerotecas nacionales. Para Inditex: el libro "El mundo de Zara" de Covadonga O\'Shea, con testimonios directos.',
      },
    ],

    tips: [
      {
        icono: '👗',
        texto: 'La moda española no ha sido lineal: ha alternado períodos de máxima influencia global (Siglo de Oro, Balenciaga, Inditex) con períodos de absorción de tendencias externas. Cada vez que España ha tenido poder político o económico, su moda ha trascendido sus fronteras. La moda es el espejo más fiel de la historia.',
      },
      {
        icono: '✂️',
        texto: 'El flamenco no es solo música y baile: el traje flamenco (bata de cola, volantes, lunares) es uno de los pocos trajes populares que ha influido directamente en la Alta Costura internacional. Balenciaga, Dior y John Galliano han citado explícitamente el flamenco como inspiración. Y el "traje de gitana" es, paradójicamente, una construcción romántica del siglo XIX inventada por viajeros franceses.',
      },
      {
        icono: '🏭',
        texto: 'España tiene dos modelos de moda completamente opuestos y ambos exitosos: el artesanal de alta calidad (Loewe, Balenciaga) y el industrial de alta velocidad (Inditex, Mango). Pocos países del mundo han logrado ser líderes globales en los dos extremos simultáneamente. Esta dualidad define la identidad de la moda española.',
      },
      {
        icono: '🌐',
        texto: 'Las marcas de moda española más icónicas del siglo XXI son dirigidas por talentos extranjeros que reinterpretan lo español: Jonathan Anderson (Loewe, irlandés), Demna Gvasalia (Balenciaga, georgiano). España ha sido siempre buena absorbiendo talento exterior y convirtiéndolo en algo propio. Lo español es la materia prima; el talento global, el catalizador.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que el "traje español" es histórico y no una construcción romántica',
        cuerpo: 'El traje de flamenca o "traje de gitana" que hoy se asocia con España no es un traje regional histórico: es una construcción romántica del siglo XIX popularizada por los viajeros europeos, especialmente los franceses, a partir de la publicación de Carmen de Mérimée (1845). La mantilla y la peineta sí tienen raíces históricas más profundas.',
      },
      {
        titulo: 'Pensar que Balenciaga es una marca francesa',
        cuerpo: 'Cristóbal Balenciaga nació en Getaria (Guipúzcoa) y es el diseñador español más influyente de la historia. Trabajó en París por circunstancias históricas (la Guerra Civil), pero sus colecciones siempre estuvieron impregnadas de referencias españolas. El director creativo actual, Demna Gvasalia, es georgiano; la marca, sin embargo, lleva el nombre de un español.',
      },
      {
        titulo: 'Reducir Inditex a "ropa barata"',
        cuerpo: 'Inditex no inventó la ropa barata: inventó la velocidad y la integración vertical. Su innovación no fue de precio sino de proceso: pasar del diseño a la tienda en dos semanas integrando diseño, producción y distribución propios. Este modelo ha sido replicado por toda la industria global y ha transformado para siempre la economía de la moda.',
      },
      {
        titulo: 'Olvidar que la moda gallega precedió a Inditex',
        cuerpo: 'Adolfo Domínguez, Purificación García y Roberto Verino construyeron el concepto de "moda gallega" (minimalismo, lino natural, calidad artesanal) desde los años 70 y 80, antes de que Inditex se convirtiera en gigante global. El ecosistema textil gallego tiene raíces en la producción histórica de lino y en una cultura de confección local que precede en décadas al fast fashion.',
      },
    ],
  },
};
