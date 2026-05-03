import type { HistoriaData } from './types';

export const japon: HistoriaData = {
  slug: 'japon',
  titulo: 'Historia de Japón: De la Corte Imperial a la Restauración Meiji',
  subtitulo: 'Mil años de samurái, shogunatos, paz Tokugawa y modernización: el arco histórico más singular de Asia',
  descripcionSEO: 'Cronología interactiva de la historia de Japón desde la primera capital permanente en Nara (710) hasta la Restauración Meiji (1868). Explora la corte Heian, el bushido samurái, las guerras Sengoku, la paz Tokugawa y la apertura forzosa al mundo occidental.',
  keywords: [
    'historia de Japón', 'período Heian', 'shogunato', 'samurái', 'período Sengoku',
    'Tokugawa', 'sakoku', 'Restauración Meiji', 'Oda Nobunaga', 'bushido',
    'kabuki', 'ukiyo-e', 'Matsuo Bashō', 'naves negras Perry', 'cronología japonesa',
  ],
  anioInicio: 710,
  anioFin: 1868,

  hitos: [
    {
      id: 'periodo-nara',
      nombre: 'Período Nara: La Primera Capital',
      anioInicio: 710,
      anioFin: 794,
      color: '#C8A96E',
      categoria: 'corte',
      descripcion:
        'Nara se convierte en la primera capital permanente de Japón. El budismo se adopta como religión de Estado y se construyen grandes templos, incluido el Tōdai-ji con la Gran Buda de bronce. Se redactan las primeras crónicas históricas, el Kojiki y el Nihon Shoki, y se implanta el sistema administrativo centralizado ritsuryō al estilo chino.',
      obraIconica: 'Tōdai-ji y el Gran Buda de Nara (752)',
      paises: ['Japón'],
    },
    {
      id: 'periodo-heian',
      nombre: 'Período Heian: La Corte de Kioto',
      anioInicio: 794,
      anioFin: 1185,
      color: '#C8A96E',
      categoria: 'corte',
      descripcion:
        'La capital se traslada a Heian-kyō (Kioto), inaugurando cuatro siglos de apogeo aristocrático. Se desarrolla el silabario kana, nacen obras maestras de la literatura como "El Libro de la Almohada" de Sei Shōnagon y "Genji Monogatari" de Murasaki Shikibu. El clan Fujiwara domina la política imperial mediante el matrimonio y la regencia.',
      obraIconica: 'Genji Monogatari de Murasaki Shikibu (ca. 1010)',
      paises: ['Japón'],
    },
    {
      id: 'ascenso-samurai',
      nombre: 'El Ascenso de los Samurái: Clanes Taira y Minamoto',
      anioInicio: 1156,
      anioFin: 1185,
      color: '#DC143C',
      categoria: 'samurai',
      descripcion:
        'Las guerras Hōgen y Heiji marcan el fin del dominio cortesano y el ascenso de los clanes guerreros. Taira no Kiyomori alcanza el poder absoluto, pero la Guerra Genpei (1180–1185) enfrenta a Taira y Minamoto. La batalla naval de Dan-no-ura sella la derrota Taira y eleva a Minamoto no Yoritomo como amo de Japón.',
      obraIconica: 'Batalla de Dan-no-ura (1185)',
      paises: ['Japón'],
    },
    {
      id: 'shogunato-kamakura',
      nombre: 'El Shogunato Kamakura: El Gobierno Guerrero',
      anioInicio: 1185,
      anioFin: 1333,
      color: '#DC143C',
      categoria: 'samurai',
      descripcion:
        'Minamoto no Yoritomo se convierte en el primer shōgun y establece en Kamakura un gobierno militar (bakufu) paralelo al emperador en Kioto. Nace el bushido como código de honor guerrero. Las invasiones mongolas de Kublai Kan (1274 y 1281) son repelidas por tormentas devastadoras que los japoneses llamarán kamikaze, "vientos divinos".',
      obraIconica: 'Defensa contra los mongoles y los kamikaze (1281)',
      paises: ['Japón', 'Mongolia', 'China'],
    },
    {
      id: 'sengoku-muromachi',
      nombre: 'Período Muromachi y las Guerras Civiles (Sengoku)',
      anioInicio: 1336,
      anioFin: 1573,
      color: '#4B0082',
      categoria: 'guerracivil',
      descripcion:
        'El shogunato Ashikaga gobierna con autoridad decreciente hasta que la "Época de los Estados en Guerra" (Sengoku Jidai) fragmenta Japón en dominios en lucha. Oda Nobunaga emerge como el señor de la guerra más poderoso: introduce armas de fuego europeas, destruye el poder militar budista en el Monte Hiei y unifica un tercio del país antes de ser asesinado en 1582.',
      obraIconica: 'Batalla de Nagashino y las armas de fuego (1575)',
      paises: ['Japón'],
    },
    {
      id: 'reunificacion-hideyoshi',
      nombre: 'Toyotomi Hideyoshi: La Reunificación',
      anioInicio: 1582,
      anioFin: 1598,
      color: '#4B0082',
      categoria: 'guerracivil',
      descripcion:
        'El antiguo campesino Toyotomi Hideyoshi hereda el proyecto de Nobunaga y completa la unificación de Japón. Realiza el taikō kenchi (catastro nacional), congela el sistema de clases y expulsa a los misioneros jesuitas. Lanza dos invasiones a Corea (1592 y 1597) que fracasan y muere en 1598 sin haber asegurado una sucesión estable.',
      obraIconica: 'Invasiones de Corea: la "Guerra Imjin" (1592)',
      paises: ['Japón', 'Corea', 'China'],
    },
    {
      id: 'shogunato-edo',
      nombre: 'Tokugawa Ieyasu y el Shogunato Edo',
      anioInicio: 1600,
      anioFin: 1651,
      color: '#1E3A5F',
      categoria: 'shogunato',
      descripcion:
        'Tokugawa Ieyasu vence en la batalla de Sekigahara (1600) y funda el shogunato Tokugawa en Edo (futura Tokio). En 1635 promulga el sakoku, cerrando Japón al comercio y la influencia exterior salvo un pequeño corredor con los holandeses en Nagasaki. El sistema de clases rígido (samurái, campesinos, artesanos, comerciantes) consolida el orden social.',
      obraIconica: 'Batalla de Sekigahara (1600)',
      paises: ['Japón'],
    },
    {
      id: 'paz-edo',
      nombre: 'La Paz de Edo: Cultura y Prosperidad',
      anioInicio: 1651,
      anioFin: 1800,
      color: '#1E3A5F',
      categoria: 'shogunato',
      descripcion:
        'Japón disfruta de 250 años de paz interna bajo la Pax Tokugawa. Florece la cultura popular urbana: teatro kabuki, haiku (Matsuo Bashō), ukiyo-e con maestros como Hokusai e Hiroshige. Edo crece hasta convertirse en una de las ciudades más pobladas del mundo, y Osaka se consolida como el mayor centro comercial del archipiélago.',
      obraIconica: 'La Gran Ola de Hokusai (ca. 1831)',
      paises: ['Japón'],
    },
    {
      id: 'naves-negras',
      nombre: 'Crisis del Shogunato: Las Naves Negras',
      anioInicio: 1800,
      anioFin: 1854,
      color: '#708090',
      categoria: 'apertura',
      descripcion:
        'La presión occidental se intensifica: Rusia, Gran Bretaña y EE. UU. exigen acceso a los puertos japoneses. En julio de 1853 el comodoro Matthew Perry ancla frente a Uraga con cuatro naves de vapor ("naves negras"), entregando una carta del presidente Fillmore. La Convención de Kanagawa (1854) obliga a Japón a abrir dos puertos, rompiendo el sakoku tras 220 años.',
      obraIconica: 'Llegada de las naves negras del comodoro Perry (1853)',
      paises: ['Japón', 'Estados Unidos', 'Reino Unido', 'Rusia'],
    },
    {
      id: 'restauracion-meiji',
      nombre: 'La Restauración Meiji',
      anioInicio: 1854,
      anioFin: 1868,
      color: '#228B22',
      categoria: 'meiji',
      descripcion:
        'La apertura forzosa desata el movimiento sonnō jōi ("reverenciar al emperador, expulsar al bárbaro"). Señores feudales del sur (Satsuma, Chōshū) se alían contra el shogunato y estallan las guerras Boshin. En enero de 1868 el último shōgun, Yoshinobu, abdica y se restaura el poder imperial en la persona del joven Meiji: Japón abre las puertas a la modernización acelerada.',
      obraIconica: 'Carta Jurada de Cinco Artículos del Emperador Meiji (1868)',
      paises: ['Japón'],
    },
  ],

  eras: [
    {
      nombre: 'La Corte Clásica: Nara y Heian',
      desde: 710,
      hasta: 1185,
      icono: '🌸',
      hitosDestacados: [
        'Período Nara: La Primera Capital',
        'Período Heian: La Corte de Kioto',
      ],
      eventos: [
        'Primer templo budista de Estado: Tōdai-ji (745)',
        'Primeras crónicas históricas: Kojiki (712) y Nihon Shoki (720)',
        'Desarrollo del silabario kana (s. IX)',
        'Genji Monogatari, primera novela del mundo (ca. 1010)',
        'Dominio político del clan Fujiwara mediante regencias',
      ],
    },
    {
      nombre: 'El Ascenso del Bushido',
      desde: 1185,
      hasta: 1336,
      icono: '⚔️',
      hitosDestacados: [
        'El Ascenso de los Samurái: Clanes Taira y Minamoto',
        'El Shogunato Kamakura: El Gobierno Guerrero',
      ],
      eventos: [
        'Primer shogunato: Kamakura (1185)',
        'Codificación del bushido como código de honor',
        'Primera invasión mongola repelida (1274)',
        'Segunda invasión mongola destruida por el kamikaze (1281)',
        'Caída del shogunato Kamakura por el emperador Go-Daigo (1333)',
      ],
    },
    {
      nombre: 'Las Guerras Civiles: El Período Sengoku',
      desde: 1336,
      hasta: 1600,
      icono: '🔥',
      hitosDestacados: [
        'Período Muromachi y las Guerras Civiles (Sengoku)',
        'Toyotomi Hideyoshi: La Reunificación',
      ],
      eventos: [
        'Shogunato Ashikaga en Muromachi, Kioto (1338)',
        'Guerra Ōnin: inicio del Sengoku (1467)',
        'Llegada de los portugueses con armas de fuego (1543)',
        'Oda Nobunaga vence en Nagashino con arcabuceros (1575)',
        'Seppuku de Nobunaga en Honnō-ji (1582)',
        'Toyotomi Hideyoshi completa la unificación (1590)',
      ],
    },
    {
      nombre: 'La Paz Tokugawa: El Shogunato Edo',
      desde: 1600,
      hasta: 1800,
      icono: '🏯',
      hitosDestacados: [
        'Tokugawa Ieyasu y el Shogunato Edo',
        'La Paz de Edo: Cultura y Prosperidad',
      ],
      eventos: [
        'Batalla de Sekigahara: victoria Tokugawa (1600)',
        'Sakoku: cierre del país al exterior (1635)',
        'Solo holandeses y chinos autorizados en Nagasaki (Dejima)',
        'Apogeo del haiku con Matsuo Bashō (1660–1694)',
        'Edo supera el millón de habitantes (s. XVIII)',
        'Ukiyo-e de Hokusai e Hiroshige alcanzan fama mundial',
      ],
    },
    {
      nombre: 'Apertura Forzosa y Crisis del Shogunato',
      desde: 1800,
      hasta: 1854,
      icono: '⚓',
      hitosDestacados: [
        'Crisis del Shogunato: Las Naves Negras',
      ],
      eventos: [
        'Rusia exige relaciones comerciales (1804)',
        'Gran Bretaña y EE. UU. presionan con incidentes navales',
        'Llegada del comodoro Perry con naves de vapor (julio 1853)',
        'Convención de Kanagawa abre puertos de Shimoda y Hakodate (1854)',
        'Tratados de Ansei: apertura comercial forzada (1858)',
        'Debate interno: apertura vs. expulsión del extranjero',
      ],
    },
    {
      nombre: 'La Restauración Meiji',
      desde: 1854,
      hasta: 1868,
      icono: '🌅',
      hitosDestacados: [
        'La Restauración Meiji',
      ],
      eventos: [
        'Movimiento sonnō jōi gana fuerza (1858–1863)',
        'Bombardeo occidental de Shimonoseki y Kagoshima (1863–1864)',
        'Alianza Satsuma-Chōshū contra el shogunato (1866)',
        'Inicio de las guerras Boshin (enero 1868)',
        'El shōgun Yoshinobu abdica el poder (noviembre 1867)',
        'Carta Jurada de Cinco Artículos: inicio de la Era Meiji (abril 1868)',
      ],
    },
  ],

  categorias: {
    corte: 'Corte Imperial',
    samurai: 'Mundo Samurái',
    guerracivil: 'Guerras Civiles',
    shogunato: 'Shogunato Edo',
    apertura: 'Apertura al Exterior',
    meiji: 'Restauración Meiji',
  },

  colores: {
    corte: '#C8A96E',
    samurai: '#DC143C',
    guerracivil: '#4B0082',
    shogunato: '#1E3A5F',
    apertura: '#708090',
    meiji: '#228B22',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La historia de Japón entre 710 y 1868 es un fascinante recorrido desde la elegancia cortesana de Heian hasta el impacto brutal de las naves negras. En poco más de un milenio, el archipiélago pasó del gobierno de nobles poetas al código de honor guerrero, de 250 años de aislamiento autoimpuesto a la sacudida de la modernidad occidental. Este visualizador te permite explorar los hitos más decisivos de esa transformación.',

    tablaComparativa: [
      {
        hito: 'Período Nara',
        periodo: '710–794',
        categoria: 'Corte Imperial',
        personaje: 'Emperador Shōmu',
        aportacion: 'Primera capital permanente; crónicas Kojiki y Nihon Shoki; budismo de Estado',
      },
      {
        hito: 'Período Heian',
        periodo: '794–1185',
        categoria: 'Corte Imperial',
        personaje: 'Murasaki Shikibu',
        aportacion: 'Escritura kana; "Genji Monogatari"; apogeo de la cultura aristocrática',
      },
      {
        hito: 'Shogunato Kamakura',
        periodo: '1185–1333',
        categoria: 'Mundo Samurái',
        personaje: 'Minamoto no Yoritomo',
        aportacion: 'Primer bakufu; bushido; rechazo de las invasiones mongolas',
      },
      {
        hito: 'Período Sengoku',
        periodo: '1336–1573',
        categoria: 'Guerras Civiles',
        personaje: 'Oda Nobunaga',
        aportacion: 'Armas de fuego en combate; destrucción del poder budista militar; unificación parcial',
      },
      {
        hito: 'Shogunato Edo',
        periodo: '1600–1868',
        categoria: 'Shogunato Edo',
        personaje: 'Tokugawa Ieyasu',
        aportacion: 'Sakoku; 250 años de paz; kabuki, ukiyo-e, haiku; Edo como megaciudad',
      },
      {
        hito: 'Restauración Meiji',
        periodo: '1854–1868',
        categoria: 'Restauración Meiji',
        personaje: 'Emperador Meiji / Satsuma-Chōshū',
        aportacion: 'Fin del shogunato; apertura a Occidente; inicio de la modernización acelerada',
      },
    ],

    escenarios: [
      {
        icono: '📜',
        titulo: 'El cortesano de Heian',
        perfil: 'Aristócrata en la corte imperial de Kioto, siglo XI',
        texto:
          'Tu día comienza con la composición de un poema waka para la dama a la que pretendes. El rango social se mide por la sutileza del verso y la elección del color de las capas. El mundo exterior —guerras, campesinos, impuestos— es invisible desde los jardines del palacio. La belleza transitoria (mono no aware) impregna cada conversación. Ignoras que los clanes guerreros que custodian la corte están acumulando un poder que terminará por eclipsar el tuyo.',
      },
      {
        icono: '⚔️',
        titulo: 'El samurái de Kamakura',
        perfil: 'Guerrero al servicio del shōgun, siglo XIII',
        texto:
          'Eres un bushi —un guerrero— con tierras concedidas por el shōgun a cambio de lealtad y servicio militar. Tu vida gira en torno al perfeccionamiento con la espada, el arco y el caballo. Cuando llegan los mensajeros anunciando una nueva invasión mongola, sabes que debes luchar aunque el enemigo traiga armas que desconoces. El viento que destruye la flota invasora es interpretado como prueba de que los dioses protegen Japón. Tu nombre en los anales dependerá del honor con que mueras.',
      },
      {
        icono: '🏙️',
        titulo: 'El comerciante de Edo',
        perfil: 'Mercader adinerado en Edo durante la paz Tokugawa, siglo XVIII',
        texto:
          'Perteneces formalmente al rango más bajo del sistema de cuatro clases, pero tu riqueza supera con creces a la de muchos samurái endeudados. Tu dinero financia los teatros kabuki donde actúan los grandes actores del momento y pagas precios astronómicos por las estampas ukiyo-e de Hokusai. Aunque el sakoku prohíbe viajar al exterior, los libros ranhan-gaku traen noticias de la ciencia occidental. Algo está cambiando al otro lado del mar, pero nadie sabe exactamente qué.',
      },
      {
        icono: '🚢',
        titulo: 'El samurái ante las naves negras',
        perfil: 'Funcionario del shogunato en la bahía de Edo, verano de 1853',
        texto:
          'Cuatro barcos de vapor aparecen en el horizonte escupiendo humo negro. Nunca habías visto nada igual. El comodoro Perry entrega una carta exigiendo comercio y trato humano para los náufragos americanos. Reportas al rojo vivo al shogunato, que pide un año de prórroga. El debate interno es brutal: rendirse sería una vergüenza, resistir militarmente una temeridad. Cuando Japón firma la Convención de Kanagawa en 1854, sientes que el mundo que conocías se derrumba.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué Japón estuvo cerrado al mundo durante el sakoku?',
        respuesta:
          'El shogunato Tokugawa temía que el comercio con Europa y la evangelización cristiana desestabilizaran su control político. Los comerciantes y los misioneros podían crear lealtades alternativas al shōgun. El cierre (1635) no fue total: los holandeses, percibidos como puramente comerciales y sin interés misionero, mantuvieron un acceso muy restringido desde la isla artificial de Dejima en Nagasaki.',
        tip: 'El conocimiento occidental que entró por Nagasaki se llamó rangaku ("estudio holandés") y sirvió de base para la modernización Meiji.',
      },
      {
        pregunta: '¿Qué fue exactamente el bushido?',
        respuesta:
          'El bushido ("camino del guerrero") no fue un código escrito y uniforme hasta la época Edo, sino una síntesis posterior de valores que los samurái habían practicado durante siglos: lealtad al señor, honor personal, disposición a morir antes que rendirse, frugalidad y rectitud. El texto "Hagakure" (1716) y posteriormente "El Libro de los Cinco Anillos" de Miyamoto Musashi contribuyeron a codificarlo. La imagen romántica del samurái que conocemos es en parte una elaboración del período Edo, cuando los guerreros ya no guerreaban.',
      },
      {
        pregunta: '¿Por qué se llama "Restauración" Meiji si era algo nuevo?',
        respuesta:
          'El movimiento que derrocó al shogunato utilizó la retórica de "restaurar" el poder imperial directo, apelando a un pasado mítico anterior a los shōgunes. En realidad fue una revolución modernizadora: los nuevos líderes abolieron el feudalismo, enviaron estudiantes al extranjero, construyeron ferrocarriles y adoptaron constituciones occidentales. La palabra "restauración" legitimó el cambio radical con vocabulario conservador.',
      },
      {
        pregunta: '¿Fue Genji Monogatari realmente la primera novela del mundo?',
        respuesta:
          'Es el candidato más sólido. Escrita hacia el año 1010 por Murasaki Shikibu, dama de la corte Heian, narra la vida amorosa y política de Hikaru Genji con una profundidad psicológica y estructura narrativa que anticipan la novela moderna. Aunque existen textos narrativos anteriores (el Satyricon romano, obras sánscritas), ninguno alcanza la coherencia y extensión de Genji. Su autoría femenina es en sí misma extraordinaria para la época.',
        tip: 'La obra tiene 54 capítulos y unos 70 personajes principales. La traducción al inglés de Edward Seidensticker supera las 1.000 páginas.',
      },
      {
        pregunta: '¿Hubo alguna posibilidad de que Japón resistiera a las naves negras?',
        respuesta:
          'Militarmente, muy poca. El armamento del shogunato era esencialmente el mismo que en el siglo XVII, mientras que las naves de Perry usaban vapor y artillería moderna. Varios señores feudales del sur (tozama daimyō) lo intentaron: Chōshū disparó contra naves occidentales en 1863 y fue bombardeado en represalia. Esta derrota aceleró paradójicamente la conclusión correcta: había que modernizarse al estilo occidental para sobrevivir como nación independiente.',
      },
    ],

    pasos: [
      {
        titulo: 'Explora la Línea del Tiempo (Tab 1)',
        cuerpo:
          'En la primera pestaña encontrarás todos los hitos ordenados cronológicamente sobre una línea visual. Haz clic en cualquier período coloreado para desplegar un panel con la descripción completa, la obra icónica y el contexto del momento. Es el mejor punto de partida para hacerse una idea general del arco histórico.',
      },
      {
        titulo: 'Sumérgete en cada período (Tab 2)',
        cuerpo:
          'La segunda pestaña te permite navegar hito a hito con detalle. Selecciona un período con los botones de fecha y lee la información ampliada. Usa los botones "Anterior" y "Siguiente" para recorrer la cronología en orden. El encabezado de cada tarjeta se colorea según la categoría del hito.',
      },
      {
        titulo: 'Compara entre categorías (Tab 3)',
        cuerpo:
          'La tabla comparativa agrupa los hitos por categoría temática (corte, samurái, guerras civiles, shogunato, apertura, Meiji). Puedes filtrar por categoría con los botones superiores o usar el buscador para localizar un término concreto. Esta vista es ideal para analizar la evolución de cada dimensión histórica por separado.',
      },
      {
        titulo: 'Visualiza el contexto por eras (Tab 4)',
        cuerpo:
          'La cuarta pestaña organiza la historia en seis grandes eras, cada una con los hitos destacados, los eventos contextuales y el icono representativo. Es útil para entender las tendencias de largo plazo y los grandes períodos de transición, más allá de los hitos individuales.',
      },
      {
        titulo: 'Lee los escenarios y reflexiona',
        cuerpo:
          'En la sección educativa encontrarás cuatro perfiles históricos que te sitúan "dentro" de la época: el cortesano de Heian, el samurái de Kamakura, el comerciante de Edo y el funcionario ante las naves negras. Estos relatos en segunda persona ayudan a interiorizar los valores y dilemas de cada período más allá de las fechas.',
      },
    ],

    tips: [
      {
        icono: '🗾',
        texto:
          'La geografía importa: Japón es un archipiélago montañoso que favoreció el desarrollo de dominios locales semi-independientes (han). Sin fronteras terrestres con potencias continentales, pudo mantener el sakoku durante dos siglos sin invasión. Eso no era posible en Europa o China.',
      },
      {
        icono: '📖',
        texto:
          'Para entender la era Heian, lee aunque sea fragmentos de "Genji Monogatari". Para el Sengoku, prueba "El Libro de los Cinco Anillos" de Miyamoto Musashi. Para la Restauración, "Samurai!" de Saburō Sakai o las novelas históricas de Eiji Yoshikawa son accesibles y rigorosas.',
      },
      {
        icono: '🎬',
        texto:
          'El cine de Akira Kurosawa es la mejor introducción visual a la cultura samurái: "Los Siete Samurái" (1954) refleja el fin del Sengoku y el inicio de Edo; "Kagemusha" (1980) recrea la batalla de Nagashino. "El Último Samurái" (2003) aborda, con licencias, el contexto de la Restauración Meiji.',
      },
      {
        icono: '🔗',
        texto:
          'El período Meiji (1868–1912) que comienza donde termina este visualizador es uno de los mayores casos de modernización acelerada de la historia: en 40 años Japón pasó de feudalismo a potencia industrial capaz de derrotar a Rusia (1905). Explorar ese período da sentido pleno a la Restauración.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir al emperador con el gobernante real',
        cuerpo:
          'Durante la mayor parte de este período, el emperador era una figura sagrada y legitimadora pero sin poder ejecutivo real. Gobernaban los regentes Fujiwara (Heian), los shōgunes (Kamakura, Muromachi, Edo) o los señores de la guerra (Sengoku). El objetivo de la Restauración Meiji fue precisamente revertir esta situación y devolver el poder efectivo al trono, aunque en la práctica el gobierno siguió en manos de oligarcas como Ōkubo, Kido e Itō.',
      },
      {
        titulo: 'Creer que el sakoku fue un aislamiento total',
        cuerpo:
          'Japón mantuvo relaciones comerciales con China, Corea (a través del dominio de Tsushima) y los Países Bajos (en Nagasaki-Dejima). Lo que prohibió fue la emigración japonesa, el regreso de japoneses que habían viajado al extranjero, la entrada de naves europeas fuera de Nagasaki y la evangelización cristiana. El conocimiento científico occidental entró de forma filtrada y fue estudiado activamente por el movimiento rangaku.',
      },
      {
        titulo: 'Ver el período Sengoku solo como caos y violencia',
        cuerpo:
          'Las guerras civiles también fueron un período de intensa innovación: se adoptaron armas de fuego europeas, surgieron nuevas estructuras administrativas, florecieron las artes del teatro nō y la ceremonia del té (chado), y se construyeron algunos de los castillos más impresionantes del mundo. Señores como Nobunaga eran también mecenas culturales. El Sengoku transformó profundamente la sociedad japonesa incluso donde no hubo batalla.',
      },
      {
        titulo: 'Pensar que la Restauración Meiji fue una revolución popular',
        cuerpo:
          'La Restauración fue obra de un reducido grupo de samurái de los dominios del sur (especialmente Satsuma y Chōshū) que usaron al joven emperador como símbolo legitimador. El pueblo común apenas participó en la decisión. La transformación fue impuesta desde arriba por una nueva oligarcha que, paradójicamente, abolió el sistema de clases que les había dado privilegios, pero retuvo el poder en sus propias manos durante décadas.',
      },
    ],
  },
};
