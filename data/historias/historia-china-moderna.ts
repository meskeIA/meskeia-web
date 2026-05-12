import type { HistoriaData } from './types';

export const historiaChinaModerna: HistoriaData = {
  slug: 'historia-china-moderna',
  titulo: 'China Moderna',
  subtitulo: 'De la caída del Imperio a la superpotencia del siglo XXI (1912 - hoy)',
  descripcionSEO:
    'Cronología visual de la historia de China moderna: desde la República de China y los Señores de la Guerra hasta Mao Zedong, la Reforma de Deng Xiaoping, la Plaza de Tiananmen y el ascenso de Xi Jinping como superpotencia global.',
  keywords: [
    'historia china moderna',
    'República Popular China',
    'Mao Zedong',
    'Deng Xiaoping',
    'Xi Jinping',
    'Gran Salto Adelante',
    'Revolución Cultural',
    'Tiananmen',
    'reforma económica China',
    'guerra civil china',
    'guerra sino-japonesa',
  ],
  anioInicio: 1912,
  anioFin: 9999,

  hitos: [
    {
      id: 'republica-china-warlords',
      nombre: 'República de China y Era Warlords',
      anioInicio: 1912,
      anioFin: 1928,
      color: '#8B4513',
      categoria: 'republica',
      descripcion:
        'La abdicación del último emperador Puyi en febrero de 1912 pone fin a más de dos milenios de gobierno imperial en China. Sun Yat-sen proclama la República de China, pero la nueva nación nace fragmentada y débil. Yuan Shikai, el hombre fuerte del norte, asume la presidencia y pronto intenta restaurar la monarquía con él mismo como emperador, lo que provoca la rebelión de las provincias del sur. Tras la muerte de Yuan en 1916, China se fragmenta en decenas de feudos controlados por Señores de la Guerra (warlords), generales militares que cobran impuestos, mantienen ejércitos propios y libran guerras perpetuas entre sí. Mientras tanto, el Partido Comunista Chino se funda en Shanghái en 1921 con apoyo soviético, y el Partido Nacionalista (Kuomintang, KMT) de Sun Yat-sen busca reunificar el país desde Cantón. La debilidad del Estado central permite que potencias extranjeras —Japón, Gran Bretaña, Francia— mantengan sus concesiones coloniales y humillen a China en sucesivos tratados desiguales.',
      obraIconica: 'Proclamación de la República de China por Sun Yat-sen, 1912',
      paises: ['China', 'Japón', 'Unión Soviética'],
    },
    {
      id: 'unificacion-kmt-guerra-civil',
      nombre: 'Unificación KMT y Guerra Civil',
      anioInicio: 1927,
      anioFin: 1937,
      color: '#1E3A8A',
      categoria: 'guerra_civil',
      descripcion:
        'Tras la muerte de Sun Yat-sen en 1925, Chiang Kai-shek toma el liderazgo del KMT y lanza la Expedición del Norte (1926-1928), una campaña militar que logra reunificar nominalmente China bajo el gobierno nacionalista con capital en Nankín. Sin embargo, Chiang rompe violentamente con sus aliados comunistas en la Masacre de Shanghái de abril de 1927, ejecutando a miles de militantes y obreros. El Partido Comunista, diezmado, huye hacia las zonas rurales del interior donde Mao Zedong va ganando protagonismo al apostar por el campesinado como base de la revolución. El Ejército Rojo establece "soviets" en Jiangxi, y el KMT lanza cinco campañas de cerco para eliminarlo. Ante la derrota inminente, los comunistas emprenden la célebre Larga Marcha (1934-1935): una retirada épica de más de 12.000 kilómetros hasta Yan\'an, en el noroeste, en la que mueren las tres cuartas partes de los combatientes pero forja la leyenda de Mao y consolida su liderazgo sobre el partido.',
      obraIconica: 'La Larga Marcha (1934-1935) — 12.500 km a través de China',
      paises: ['China'],
    },
    {
      id: 'guerra-sino-japonesa',
      nombre: 'Guerra Sino-Japonesa y II Guerra Mundial',
      anioInicio: 1937,
      anioFin: 1945,
      color: '#DC143C',
      categoria: 'guerra_japon',
      descripcion:
        'El incidente del Puente de Marco Polo en julio de 1937 desencadena la guerra total entre China y Japón. Las fuerzas japonesas avanzan con brutalidad extrema: la Masacre de Nankín (diciembre de 1937) causa entre 100.000 y 300.000 muertos civiles y militares en pocas semanas, convirtiéndose en uno de los episodios más horrorosos de la historia contemporánea. El gobierno de Chiang Kai-shek se refugia en Chongqing, en el interior del país, mientras Japón ocupa la costa y las grandes ciudades. KMT y comunistas forman un frente unido antinipón de facto, aunque la colaboración es tensa y ambos aprovechan la guerra para fortalecer sus propias fuerzas. Los comunistas ganan enormemente en legitimidad popular al organizar la resistencia guerrillera en las zonas rurales ocupadas. La rendición japonesa en agosto de 1945 —acelerada por las bombas atómicas de Hiroshima y Nagasaki y la entrada soviética en Manchuria— deja a China devastada: entre 15 y 20 millones de muertos, la economía destruida y una guerra civil a punto de reanudarse.',
      obraIconica: 'Masacre de Nankín (diciembre 1937) — crimen de guerra imperial japonés',
      paises: ['China', 'Japón', 'Estados Unidos', 'Unión Soviética'],
    },
    {
      id: 'fundacion-republica-popular',
      nombre: 'Fundación de la República Popular China',
      anioInicio: 1945,
      anioFin: 1956,
      color: '#DC2626',
      categoria: 'mao_fundacion',
      descripcion:
        'Concluida la guerra con Japón, KMT y Partido Comunista reanudan la guerra civil con renovada intensidad. A pesar de la superioridad numérica y del apoyo militar estadounidense al KMT, los comunistas liderados por Mao Zedong cosechan victoria tras victoria. La corrupción del gobierno de Chiang, la hiperinflación desbocada y el agotamiento popular tras años de guerra provocan el colapso del ejército nacionalista. En octubre de 1949, Mao proclama desde la Ciudad Prohibida la fundación de la República Popular China ante una multitud en la Plaza de Tiananmen, mientras Chiang Kai-shek y el KMT huyen a la isla de Taiwán, donde establecen la "República de China" que persiste hasta hoy. El nuevo gobierno comunista acomete la reforma agraria redistributiva, que beneficia a cientos de millones de campesinos pero acarrea la ejecución de entre 1 y 2 millones de terratenientes. China firma el Tratado de Amistad Sino-Soviético, interviene en la Guerra de Corea (1950-1953) y lanza el Primer Plan Quinquenal (1953-1957) con asesoramiento soviético, priorizando la industria pesada.',
      obraIconica: 'Proclamación de la República Popular China, Plaza de Tiananmen, 1 octubre 1949',
      paises: ['China', 'Unión Soviética', 'Estados Unidos', 'Taiwán'],
    },
    {
      id: 'gran-salto-adelante',
      nombre: 'Gran Salto Adelante',
      anioInicio: 1958,
      anioFin: 1962,
      color: '#7C2D12',
      categoria: 'gran_salto',
      descripcion:
        'Convencido de que China puede superar a Gran Bretaña en producción industrial en quince años, Mao lanza en 1958 el Gran Salto Adelante, una campaña de colectivización agraria e industrialización acelerada sin precedentes. El campo se reorganiza en comunas populares que suprimen la propiedad privada y coordinan la producción agrícola, mientras decenas de millones de campesinos son movilizados para fundir acero en hornos domésticos —produciendo metal inservible— en lugar de cosechar. Las cuotas de producción se fijan en niveles irreales y los funcionarios locales, aterrorizados ante las consecuencias de reportar fracasos, falsifican cifras. El resultado es catastrófico: la mayor hambruna de la historia humana, con entre 15 y 55 millones de muertos entre 1959 y 1962, según distintas estimaciones académicas. La ruptura sino-soviética (1960), cuando Nikita Jruschov retira los asesores técnicos soviéticos tras denunciar el stalinismo, agrava la crisis. Mao cede terreno político a figuras como Liu Shaoqi y Deng Xiaoping, que introducen reformas pragmáticas para estabilizar la economía, pero jamás reconoce su responsabilidad en el desastre.',
      obraIconica: 'La Gran Hambruna China (1959-1961) — la mayor en la historia de la humanidad',
      paises: ['China', 'Unión Soviética'],
    },
    {
      id: 'revolucion-cultural',
      nombre: 'Revolución Cultural',
      anioInicio: 1966,
      anioFin: 1976,
      color: '#B22222',
      categoria: 'revolucion_cultural',
      descripcion:
        'En 1966, Mao Zedong, sintiéndose marginado del poder por los "pragmáticos" del partido, desata la Gran Revolución Cultural Proletaria para purgar a sus rivales y reavivar el fervor revolucionario. Llama a la juventud a rebelarse contra "los cuatro viejos" (ideas, cultura, costumbres y hábitos antiguos) y a destruir la burguesía dentro del propio partido. Los Guardias Rojos, millones de jóvenes movilizados por las Guardias Rojas, recorren el país humillando públicamente a profesores, médicos, intelectuales y funcionarios, saqueando templos, quemando libros y destruyendo patrimonio cultural milenario. Figuras como Liu Shaoqi mueren en prisión y Deng Xiaoping es enviado a trabajar en una fábrica. Las universidades cierran durante años, privando a toda una generación de educación. El caos extremo obliga a Mao a movilizar el Ejército Popular de Liberación para restablecer el orden desde 1967, y en 1968 envía a los Guardias Rojos "al campo a reeducarse". La Banda de los Cuatro, liderada por la esposa de Mao, Jiang Qing, controla la cultura y la política hasta la muerte de Mao en septiembre de 1976. El balance: entre 500.000 y 2 millones de muertos directos, decenas de millones perseguidos y una economía y tejido social gravemente dañados.',
      obraIconica: 'Libro Rojo de Mao Zedong — el texto más impreso de la historia con 6.500 millones de ejemplares',
      paises: ['China'],
    },
    {
      id: 'reforma-deng-xiaoping',
      nombre: 'Deng Xiaoping y la Reforma',
      anioInicio: 1978,
      anioFin: 1989,
      color: '#166534',
      categoria: 'reforma_deng',
      descripcion:
        'Tras la muerte de Mao y la detención de la Banda de los Cuatro (1976), Deng Xiaoping emerge como líder supremo hacia 1978, aunque nunca ostenta los títulos más altos formalmente. En el Tercer Pleno del XI Comité Central (diciembre de 1978), Deng impulsa las "Cuatro Modernizaciones" —agricultura, industria, defensa y ciencia-tecnología— y anuncia la política de reforma y apertura. Se establecen las primeras Zonas Económicas Especiales (Shenzhen, Zhuhai, Shantou, Xiamen) donde se permite la inversión extranjera y la empresa privada bajo reglas de mercado. La agricultura se descomuniza: el sistema de responsabilidad familiar devuelve la tierra a los campesinos, disparando la producción. El comercio exterior se abre, las universidades se reabren, miles de estudiantes se marchan a estudiar al extranjero y se importa tecnología occidental masivamente. La economía crece a ritmos del 9-10% anual sostenidos. Deng resume su filosofía con frases célebres: "No importa si el gato es blanco o negro, mientras cace ratones" y "Enriquecerse es glorioso". China recupera la membresía en el FMI y el Banco Mundial, y en 1997 negocia con Gran Bretaña la devolución de Hong Kong bajo la fórmula "un país, dos sistemas".',
      obraIconica: 'Zonas Económicas Especiales de Shenzhen — de pueblo pesquero a megalópolis en una generación',
      paises: ['China', 'Estados Unidos', 'Reino Unido', 'Japón'],
    },
    {
      id: 'tiananmen-nuevo-orden',
      nombre: 'Tiananmen y el Nuevo Orden',
      anioInicio: 1989,
      anioFin: 2001,
      color: '#374151',
      categoria: 'tiananmen',
      descripcion:
        'La primavera de 1989 trae una oleada de protestas estudiantiles y obreras que confluyen en la Plaza de Tiananmen de Pekín, inspiradas por la glasnost soviética y el anhelo de mayor libertad política. Durante semanas, hasta un millón de personas ocupan la plaza bajo la mirada del mundo. La imagen de la "Diosa de la Democracia", erigida frente al retrato de Mao, se convierte en el símbolo de la protesta. El 4 de junio, Deng Xiaoping ordena al ejército disolver las manifestaciones: los tanques del Ejército Popular de Liberación entran en la plaza y el número de muertos —censurado en China hasta hoy— oscila entre cientos y miles según las fuentes. El "Hombre del Tanque" es la fotografía icónica del siglo XX. La represión provoca sanciones occidentales temporales pero no detiene la reforma económica: Deng reafirma el rumbo capitalista en su "Gira al Sur" de 1992. Los años noventa ven la creación de la Bolsa de Shanghái, la privatización de empresas estatales, el ingreso masivo de inversión extranjera directa y el inicio del "taller del mundo". En 1997 China recupera Hong Kong; en 1999, Macao. La economía se convierte en la segunda del mundo en paridad de poder adquisitivo.',
      obraIconica: 'El Hombre del Tanque — Plaza de Tiananmen, 5 de junio de 1989',
      paises: ['China', 'Estados Unidos', 'Hong Kong'],
    },
    {
      id: 'china-potencia-global',
      nombre: 'China como Potencia Global',
      anioInicio: 2001,
      anioFin: 2012,
      color: '#D97706',
      categoria: 'potencia',
      descripcion:
        'La entrada de China en la Organización Mundial del Comercio en diciembre de 2001 marca el inicio de su integración plena en la economía global. La avalancha de exportaciones chinas transforma las cadenas de suministro mundiales y genera un superávit comercial colosal con Estados Unidos y Europa. En 2008 China exhibe su renacimiento al mundo con los fastuosos Juegos Olímpicos de Pekín, cuya ceremonia de apertura diseñada por Zhang Yimou impresiona al planeta. Ese mismo año, la crisis financiera global golpea a Occidente pero China responde con un estímulo fiscal de 586.000 millones de dólares que sostiene el crecimiento en torno al 9%. En 2010 China supera a Japón y se convierte en la segunda economía del mundo por PIB nominal. Lanza programas espaciales propios (la estación Tiangong), desarrolla su primer portaaviones, construye la red de trenes de alta velocidad más extensa del mundo —más de 40.000 km— y comienza a proyectar influencia global a través de inversiones masivas en África, América Latina y Asia Central. La política exterior bajo Hu Jintao proclama el "ascenso pacífico" de China, pero el aumento del gasto militar y las disputas territoriales en el Mar de China Meridional apuntan a una China cada vez más asertiva.',
      obraIconica: 'Juegos Olímpicos de Pekín 2008 — la presentación de China al mundo moderno',
      paises: ['China', 'Estados Unidos', 'África', 'Asia Central'],
    },
    {
      id: 'era-xi-jinping',
      nombre: 'Era Xi Jinping',
      anioInicio: 2012,
      anioFin: 9999,
      color: '#4338CA',
      categoria: 'xi_jinping',
      descripcion:
        'Xi Jinping asume la secretaría general del PCCh en noviembre de 2012 y la presidencia en marzo de 2013, acumulando un poder personal sin precedentes desde Mao. Lanza la campaña anticorrupción más extensa de la historia china, que investiga a más de un millón de funcionarios —incluyendo exmiembros del Buró Político— y que sus críticos ven también como una herramienta para eliminar rivales políticos. En política exterior anuncia la Iniciativa del Cinturón y la Ruta de la Seda (Belt and Road Initiative, 2013), un proyecto de infraestructura global valorado en billones de dólares que conecta Asia, África y Europa. Militariza los arrecifes del Mar de China Meridional construyendo islas artificiales y reclama la soberanía sobre Taiwán con creciente firmeza. En 2017, el Congreso del Partido incorpora el "Pensamiento de Xi Jinping" a la Constitución del PCCh —solo Mao había logrado esto en vida—. En 2018 se elimina el límite de dos mandatos presidenciales, abriendo la puerta a un mandato indefinido. La pandemia de COVID-19 (2019-2022) revela tanto la capacidad organizativa del Estado chino como los límites de su opacidad informativa. La represión en Hong Kong mediante la Ley de Seguridad Nacional (2020) y las denuncias internacionales sobre los campos de internamiento de uigures en Xinjiang tensan las relaciones con Occidente. En 2023 China supera a Japón y Alemania como primer exportador de automóviles del mundo, consagrando su liderazgo en vehículos eléctricos.',
      obraIconica: 'Iniciativa del Cinturón y la Ruta de la Seda — la mayor inversión en infraestructura global de la historia',
      paises: ['China', 'Estados Unidos', 'Taiwán', 'Hong Kong', 'África', 'Europa'],
    },
  ],

  eras: [
    {
      nombre: 'República frágil (1912-1937)',
      desde: 1912,
      hasta: 1937,
      icono: '🏛️',
      hitosDestacados: [
        'República de China y Era Warlords',
        'Unificación KMT y Guerra Civil',
      ],
      eventos: [
        'Abdicación del emperador Puyi y fin del Imperio Qing (1912)',
        'Fundación del Partido Comunista Chino en Shanghái (1921)',
        'Muerte de Sun Yat-sen y ascenso de Chiang Kai-shek (1925)',
        'Masacre de Shanghái: ruptura KMT-PCCh (1927)',
        'Larga Marcha del Ejército Rojo a Yan\'an (1934-1935)',
        'Incidente de Mukden: Japón ocupa Manchuria (1931)',
      ],
    },
    {
      nombre: 'Guerras y Revolución (1937-1949)',
      desde: 1937,
      hasta: 1949,
      icono: '⚔️',
      hitosDestacados: [
        'Guerra Sino-Japonesa y II Guerra Mundial',
      ],
      eventos: [
        'Incidente del Puente de Marco Polo: inicio guerra sino-japonesa (1937)',
        'Masacre de Nankín: más de 100.000 muertos en seis semanas (1937)',
        'Frente Unido KMT-PCCh contra Japón (1937-1945)',
        'Rendición japonesa tras bombas atómicas y entrada soviética (1945)',
        'Reanudación de la guerra civil con apoyo soviético al PCCh (1946)',
        'Inflación desbocada y derrumbe del KMT continental (1947-1949)',
      ],
    },
    {
      nombre: 'Construcción maoísta (1949-1966)',
      desde: 1949,
      hasta: 1966,
      icono: '⭐',
      hitosDestacados: [
        'Fundación de la República Popular China',
        'Gran Salto Adelante',
      ],
      eventos: [
        'Proclamación de la República Popular China, 1 de octubre de 1949',
        'KMT se retira a Taiwán con 2 millones de personas',
        'Reforma agraria: redistribución de tierras y ejecución de terratenientes',
        'Intervención china en la Guerra de Corea (1950-1953)',
        'Primer Plan Quinquenal con asesoramiento soviético (1953-1957)',
        'Ruptura sino-soviética: retirada de asesores soviéticos (1960)',
        'Gran Hambruna: 15-55 millones de muertos (1959-1962)',
      ],
    },
    {
      nombre: 'Revolución Cultural y fin de Mao (1966-1978)',
      desde: 1966,
      hasta: 1978,
      icono: '📕',
      hitosDestacados: [
        'Revolución Cultural',
      ],
      eventos: [
        'Lanzamiento de la Gran Revolución Cultural Proletaria por Mao (1966)',
        'Guardias Rojos destruyen patrimonio cultural y persiguen intelectuales',
        'Deng Xiaoping enviado a trabajar en fábrica durante la purga',
        'Restablecimiento del orden por el Ejército Popular de Liberación (1967)',
        'Visita histórica de Nixon a China: inicio deshielo con EEUU (1972)',
        'Muerte de Mao Zedong y detención de la Banda de los Cuatro (1976)',
        'Rehabilitación de Deng Xiaoping como líder supremo (1977-1978)',
      ],
    },
    {
      nombre: 'Reforma y apertura (1978-2002)',
      desde: 1978,
      hasta: 2002,
      icono: '🔓',
      hitosDestacados: [
        'Deng Xiaoping y la Reforma',
        'Tiananmen y el Nuevo Orden',
      ],
      eventos: [
        'Tercer Pleno XI Comité Central: inicio de la reforma y apertura (1978)',
        'Zonas Económicas Especiales: Shenzhen pasa de 30.000 a 14 millones de habitantes',
        'Descomunización agrícola: sistema de responsabilidad familiar',
        'Masacre de la Plaza de Tiananmen: represión de protestas democráticas (1989)',
        '"Gira al Sur" de Deng: reafirma las reformas de mercado (1992)',
        'Creación de la Bolsa de Shanghái (1990) y privatizaciones',
        'Devolución de Hong Kong por Gran Bretaña (1997) y Macao por Portugal (1999)',
      ],
    },
    {
      nombre: 'Superpotencia del siglo XXI (2002-hoy)',
      desde: 2002,
      hasta: 9999,
      icono: '🌏',
      hitosDestacados: [
        'China como Potencia Global',
        'Era Xi Jinping',
      ],
      eventos: [
        'Entrada en la OMC: China se convierte en el taller del mundo (2001)',
        'Juegos Olímpicos de Pekín 2008: presentación al mundo moderno',
        'China supera a Japón como 2.ª economía mundial (2010)',
        'Xi Jinping: "Sueño Chino" e Iniciativa del Cinturón y la Ruta de la Seda (2013)',
        'Eliminación del límite de mandatos presidenciales (2018)',
        'Ley de Seguridad Nacional: supresión de la autonomía de Hong Kong (2020)',
        'China primer exportador mundial de automóviles eléctricos (2023)',
      ],
    },
  ],

  categorias: {
    republica: 'República de China',
    guerra_civil: 'Guerra Civil',
    guerra_japon: 'Guerra Sino-Japonesa',
    mao_fundacion: 'Fundación Maoísta',
    gran_salto: 'Gran Salto Adelante',
    revolucion_cultural: 'Revolución Cultural',
    reforma_deng: 'Reforma de Deng',
    tiananmen: 'Plaza de Tiananmen',
    potencia: 'Ascenso como Potencia',
    xi_jinping: 'Era Xi Jinping',
  },

  colores: {
    republica: '#8B4513',
    guerra_civil: '#1E3A8A',
    guerra_japon: '#DC143C',
    mao_fundacion: '#DC2626',
    gran_salto: '#7C2D12',
    revolucion_cultural: '#B22222',
    reforma_deng: '#166534',
    tiananmen: '#374151',
    potencia: '#D97706',
    xi_jinping: '#4338CA',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La historia de China en el siglo XX y XXI es una de las transformaciones más radicales y dramáticas jamás vividas por una civilización. En menos de cien años, China pasó de ser un Imperio milenario humillado por potencias extranjeras a convertirse en la segunda economía del mundo y un actor geopolítico de primer orden. Esa transformación fue brutal: guerras civiles, invasión extranjera, hambrunas provocadas por políticas erróneas, represión política y una revolución económica sin precedentes que sacó de la pobreza a más de 800 millones de personas. Comprender la China moderna exige conocer las tensiones entre tradición e innovación, entre control político y crecimiento económico, y entre el deseo de modernización y el orgullo de una civilización de 5.000 años que no quiere ser subordinada a Occidente. Esta cronología ofrece las claves para entender cómo el país más poblado de la historia llegó a ser la superpotencia que define el siglo XXI.',

    tablaComparativa: [
      {
        hito: 'República de China y Era Warlords',
        periodo: '1912-1928',
        categoria: 'República de China',
        personaje: 'Sun Yat-sen',
        aportacion:
          'Fundó la primera república china y articuló los "Tres Principios del Pueblo" (nacionalismo, democracia y bienestar popular), que siguen siendo la base ideológica del KMT en Taiwán.',
      },
      {
        hito: 'Fundación de la República Popular China',
        periodo: '1945-1956',
        categoria: 'Fundación Maoísta',
        personaje: 'Mao Zedong',
        aportacion:
          'Proclamó la República Popular China en 1949 y unificó el país bajo el partido comunista. Su modelo de revolución campesina fue adoptado como referencia en decenas de movimientos de liberación nacional en África y América Latina.',
      },
      {
        hito: 'Gran Salto Adelante',
        periodo: '1958-1962',
        categoria: 'Gran Salto Adelante',
        personaje: 'Mao Zedong',
        aportacion:
          'Aunque causó la mayor hambruna de la historia, la movilización masiva y la industrialización forzada sentaron algunas bases industriales que China aprovecharía décadas después, siendo también una lección global sobre los peligros de la planificación centralizada dogmática.',
      },
      {
        hito: 'Deng Xiaoping y la Reforma',
        periodo: '1978-1989',
        categoria: 'Reforma de Deng',
        personaje: 'Deng Xiaoping',
        aportacion:
          'Diseñó el modelo de "economía socialista de mercado" que combinó control político del PCCh con mecanismos de mercado capitalistas, sacando a 800 millones de personas de la pobreza extrema en el mayor avance social de la historia humana.',
      },
      {
        hito: 'China como Potencia Global',
        periodo: '2001-2012',
        categoria: 'Ascenso como Potencia',
        personaje: 'Hu Jintao',
        aportacion:
          'Presidió el periodo de mayor crecimiento sostenido de China, convirtiendo al país en la segunda economía del mundo y el principal socio comercial de más de 120 países. Los Juegos de Pekín 2008 simbolizaron el "regreso de China al centro del mundo".',
      },
      {
        hito: 'Era Xi Jinping',
        periodo: '2012-hoy',
        categoria: 'Era Xi Jinping',
        personaje: 'Xi Jinping',
        aportacion:
          'Ha centralizado el poder como ningún líder chino desde Mao, proyectando la influencia global de China a través del Cinturón y la Ruta de la Seda y convirtiendo al país en líder mundial en tecnología de inteligencia artificial, energías renovables y vehículos eléctricos.',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'El estudiante de Historia',
        perfil: 'Universitario preparando un trabajo sobre el siglo XX asiático',
        texto:
          'Para un estudiante de Historia, esta cronología ofrece el marco temporal imprescindible para entender cómo China pasó del colapso imperial a la hegemonía global. Es especialmente útil visualizar las conexiones entre el Gran Salto Adelante y la Revolución Cultural como dos episodios de la misma tensión: la voluntad de Mao de imponer su modelo ideológico sobre la realidad económica. La comparativa de categorías permite situar cada hito en su dimensión (política, económica, social) y relacionarlo con el contexto internacional de la Guerra Fría.',
      },
      {
        icono: '💼',
        titulo: 'El analista de negocios internacionales',
        perfil: 'Profesional que trabaja con empresas chinas o mercados asiáticos',
        texto:
          'Para quien trabaja con China, comprender la historia de la reforma de Deng es esencial: las Zonas Económicas Especiales, el sistema de responsabilidad familiar y la apertura a la inversión extranjera no fueron cambios graduales, sino una ruptura radical diseñada con precisión táctica. La era Xi Jinping representa un giro hacia mayor intervención estatal, nacionalismo económico y "autosuficiencia tecnológica" (Made in China 2025), factores que todo profesional con negocios en o con China debe integrar en su análisis de riesgo.',
      },
      {
        icono: '📰',
        titulo: 'El ciudadano curioso de actualidad',
        perfil: 'Persona que quiere entender las noticias sobre China',
        texto:
          'Muchas noticias sobre China —las tensiones con Taiwán, Hong Kong, los uigures, el Mar de China Meridional o la competencia tecnológica con EEUU— son incomprensibles sin el contexto histórico. Esta cronología permite entender que Taiwán es el último capítulo de la guerra civil de 1949, que Hong Kong es el resultado de los "tratados desiguales" del siglo XIX y que la obsesión china con la "soberanía" es inseparable del llamado "siglo de humillación" (1839-1949).',
      },
      {
        icono: '🌍',
        titulo: 'El geopolítico aficionado',
        perfil: 'Interesado en relaciones internacionales y el orden mundial',
        texto:
          'La ascensión de China como superpotencia es el hecho geopolítico más importante del siglo XXI. Esta cronología muestra que ese ascenso no fue lineal ni inevitable: pasó por la hambruna de los años sesenta, el aislamiento internacional tras Tiananmen y la integración en el orden liberal que China luego busca remodelar. La Iniciativa del Cinturón y la Ruta de la Seda, el desarrollo de la marina de guerra y la competencia en inteligencia artificial son la culminación de décadas de acumulación de poder y de la voluntad de no repetir el "siglo de humillación".',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué ganaron los comunistas la guerra civil en 1949 si el KMT tenía más recursos?',
        respuesta:
          'El KMT contaba con mayor apoyo internacional (EEUU) y más armamento, pero sufrió varios factores que erosionaron su base: corrupción sistémica en el gobierno y el ejército, una hiperinflación desbocada que destruyó el ahorro de las clases medias urbanas y la incapacidad de realizar una reforma agraria real. El PCCh, en cambio, ganó legitimidad en el campo al repartir tierras y organizar la resistencia guerrillera contra Japón. Mao aplicó con maestría la guerra de maniobra, evitando batallas frontales hasta contar con superioridad. Para 1948-1949, ejércitos enteros del KMT se rindieron o se pasaron al bando comunista.',
        tip: 'La guerra civil china es un caso de estudio clásico sobre cómo la legitimidad social y la disciplina organizativa pueden superar la superioridad en recursos materiales.',
      },
      {
        pregunta: '¿Cuántas personas murieron realmente en el Gran Salto Adelante?',
        respuesta:
          'Las estimaciones varían enormemente según la fuente y la metodología: desde 15 millones (cifras más conservadoras de demógrafos chinos oficiales) hasta 55 millones (estimación alta de Frank Dikötter en "Mao\'s Great Famine"). La cifra más citada en la historiografía académica occidental es de entre 30 y 45 millones de muertos por hambruna entre 1959 y 1961. La dificultad radica en que China mantuvo los datos censurados durante décadas y los registros locales eran falsificados por los propios funcionarios aterrorizados ante el régimen.',
        tip: 'El libro "Tombstone" del periodista chino Yang Jisheng, que dedicó 15 años a investigar la hambruna entrevistando supervivientes y funcionarios, es la fuente más completa disponible en español.',
      },
      {
        pregunta: '¿Qué ocurrió exactamente el 4 de junio de 1989 en Tiananmen?',
        respuesta:
          'El gobierno declaró la ley marcial el 20 de mayo. En la noche del 3 al 4 de junio, unidades del Ejército Popular de Liberación con blindados avanzaron hacia el centro de Pekín. Los manifestantes que bloqueaban las calles fueron disparados. La plaza en sí fue evacuada sin masacre —los estudiantes que quedaban salieron negociando con los militares—, pero las calles de acceso al centro de la ciudad fueron el escenario de la mayor violencia. El número oficial chino (200-300 muertos) contrasta con estimaciones de Cruz Roja (2.600) y documentos del gobierno británico recientemente desclasificados que apuntan a 10.000. La cifra exacta sigue siendo desconocida.',
        tip: 'El "Hombre del Tanque", fotografiado por cinco fotógrafos simultáneamente el 5 de junio, sigue siendo una de las imágenes más reproducidas del siglo XX. Su identidad nunca ha sido confirmada.',
      },
      {
        pregunta: '¿En qué consiste exactamente la Iniciativa del Cinturón y la Ruta de la Seda?',
        respuesta:
          'Anunciada por Xi Jinping en 2013, es el mayor proyecto de inversión en infraestructura internacional de la historia: ferrocarriles, puertos, carreteras, oleoductos y parques industriales que conectan China con Asia Central, Europa, África y América Latina. Agrupa dos rutas: el "Cinturón Económico de la Ruta de la Seda" terrestre y la "Ruta de la Seda Marítima del siglo XXI". La inversión comprometida supera los 4 billones de dólares en más de 140 países. Sus críticos señalan el riesgo de "trampa de deuda" para los países receptores y la proyección de influencia política china; sus defensores destacan que financia infraestructuras que el Banco Mundial y el FMI no financiaban.',
      },
      {
        pregunta: '¿Por qué Taiwán y China siguen sin reunificarse?',
        respuesta:
          'Taiwán es el último capítulo de la guerra civil china de 1945-1949: el KMT de Chiang Kai-shek se refugió allí con 2 millones de personas y continuó gobernando la isla como "República de China", reclamando ser el gobierno legítimo de toda China. La Guerra de Corea llevó a EEUU a desplegar la Séptima Flota en el Estrecho de Taiwán, protegiendo de facto a la isla. Taiwán se democratizó a partir de los años noventa, desarrollando una identidad propia taiwanesa distinta de la continental. Hoy, la mayoría de la población de Taiwán se opone a la reunificación bajo el modelo actual de la República Popular, y China considera la isla una "provincia rebelde" cuya reunificación es inevitable e innegociable.',
        tip: 'El "status quo" del Estrecho de Taiwán —China no ataca, Taiwán no declara independencia formal, EEUU vende armas pero no reconoce la independencia— es uno de los equilibrios diplomáticos más delicados del mundo.',
      },
    ],

    pasos: [
      {
        titulo: 'El siglo de humillación (1839-1912): el contexto olvidado',
        cuerpo:
          'Para entender la China moderna hay que empezar por el siglo anterior: las Guerras del Opio con Gran Bretaña (1839-1842 y 1856-1860), la derrota ante Japón en 1895, la rebelión de los Bóxers aplastada por ocho potencias extranjeras en 1900, y decenas de "tratados desiguales" que cedían territorios y derechos a potencias extranjeras. Este período fue bautizado como el "siglo de humillación" y sigue siendo el trauma fundacional de la identidad política china contemporánea. La obsesión con la soberanía, la aversión a la interferencia extranjera y el deseo de "restaurar la grandeza" son consecuencia directa de esa experiencia histórica.',
      },
      {
        titulo: 'El papel clave del campesinado en la revolución maoísta',
        cuerpo:
          'A diferencia del marxismo-leninismo soviético, que colocaba al proletariado industrial como motor de la revolución, Mao Zedong adaptó el marxismo a la realidad china: un país agrario con 400 millones de campesinos y un proletariado industrial minúsculo. La estrategia de "cercar las ciudades desde el campo", las bases de guerrilla en zonas rurales y la reforma agraria que convirtió a millones de campesinos en propietarios fueron las claves del éxito comunista. Esta "sinización del marxismo" fue la aportación ideológica original de Mao y el modelo que inspiró movimientos revolucionarios agrarios en Vietnam, Cuba, Angola y otros países.',
      },
      {
        titulo: 'La paradoja de Deng: capitalismo con control de partido',
        cuerpo:
          'Deng Xiaoping resolvió la aparente contradicción entre economía de mercado y partido comunista con una fórmula pragmática: "Socialismo con características chinas". El partido mantiene el control político absoluto —no hay competencia electoral, no hay separación de poderes, no hay prensa libre— pero permite la iniciativa privada, la inversión extranjera, las bolsas de valores y el enriquecimiento individual. Esta combinación, que muchos economistas occidentales consideraban inestable, ha demostrado una extraordinaria resiliencia durante 45 años, aunque genera tensiones crecientes entre una clase media educada y un estado que restringe las libertades civiles.',
      },
      {
        titulo: 'China y la globalización: el "taller del mundo"',
        cuerpo:
          'La entrada de China en la OMC en 2001 desencadenó la mayor integración económica de la historia. Los salarios bajos, la infraestructura masiva, las cadenas de suministro integradas y la enorme mano de obra convirtieron a China en el fabricante dominante de bienes manufacturados mundiales. Entre 2001 y 2012, las exportaciones chinas se multiplicaron por diez, transformando los precios de los bienes de consumo a nivel global y destruyendo empleos industriales en EEUU y Europa. Este proceso —bautizado como "China shock" por los economistas David Autor, David Dorn y Gordon Hanson— tuvo consecuencias políticas en Occidente que contribuyen a explicar el auge del populismo de los años 2010.',
      },
      {
        titulo: 'El giro de Xi: del "ascenso pacífico" a la asertividad global',
        cuerpo:
          'Durante los años noventa y dos mil, China adoptó oficialmente la doctrina del "ascenso pacífico": integrarse en el orden internacional existente, no desafiar la hegemonía de EEUU y crecer en silencio. Con Xi Jinping este paradigma cambia. El "Sueño Chino" proclama el rejuvenecimiento de la nación china como la gran potencia que históricamente le corresponde ser. China militariza el Mar de China Meridional, lanza la Iniciativa del Cinturón y la Ruta de la Seda como alternativa al orden liderado por Occidente, compite abiertamente con EEUU en inteligencia artificial y semiconductores, y expresa con más claridad que la reunificación con Taiwán es un objetivo irrenunciable. El debate académico es si China quiere reformar el orden internacional existente o sustituirlo.',
      },
    ],

    tips: [
      {
        icono: '📚',
        texto:
          'Para profundizar en la historia del siglo XX chino, tres libros esenciales: "El Cisne Negro de China" de Peter Nolan para la economía; "Mao, la historia desconocida" de Jung Chang y Jon Halliday para la era maoísta (con cautela crítica, es muy parcial); y "El partido" de Richard McGregor para entender el PCCh contemporáneo.',
      },
      {
        icono: '🗺️',
        texto:
          'La geografía es clave en la historia china: las zonas costeras siempre fueron más prósperas y abiertas al mundo que el interior continental. Las Zonas Económicas Especiales de Deng se crearon todas en la costa; Shanghái y Guangzhou fueron las ciudades más internacionalizadas. Hoy la brecha entre costa e interior es uno de los mayores desafíos sociales de China.',
      },
      {
        icono: '🔢',
        texto:
          'Las cifras de la historia china son de otra escala. La hambruna del Gran Salto Adelante mató más personas que toda la II Guerra Mundial en Europa. La migración campo-ciudad de los últimos 40 años —400 millones de personas— es la mayor migración interna de la historia. Tener estos números en mente ayuda a comprender por qué China piensa en términos distintos al resto del mundo.',
      },
      {
        icono: '🌐',
        texto:
          'Para seguir la actualidad china con perspectiva, recomendamos: el podcast "Sinica Podcast" (en inglés), la newsletter "China Media Project" y los análisis del Mercator Institute for China Studies (MERICS). En español, el trabajo de Xulio Ríos en el IGADI (Instituto Galego de Análise e Documentación Internacional) es de referencia.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir China continental con Taiwán',
        cuerpo:
          'La República Popular China (continental, capital Pekín) y la República de China (Taiwán, capital Taipéi) son entidades políticas separadas desde 1949. Tienen sistemas de gobierno completamente distintos: Taiwán es una democracia pluripartidista con plenas libertades civiles; China continental es un Estado de partido único. Aunque China reclama Taiwán como provincia propia, Taiwán no está bajo su jurisdicción. Confundir ambas en contextos políticos o empresariales puede generar malentendidos serios.',
      },
      {
        titulo: 'Creer que la reforma económica fue una apertura política',
        cuerpo:
          'La reforma de Deng Xiaoping fue exclusivamente económica: nunca implicó liberalización política. El PCCh mantuvo siempre el monopolio del poder y reprimió cualquier movimiento que reclamara democracia, como demostró Tiananmen en 1989. Un error frecuente en analistas occidentales de los años noventa fue asumir que el crecimiento económico y la integración global llevarían inevitablemente a China hacia la democracia liberal. No ha sido así, y muchos académicos argumentan que el modelo chino demuestra que el desarrollo económico y la autocracia son perfectamente compatibles.',
      },
      {
        titulo: 'Subestimar el "siglo de humillación" como factor político',
        cuerpo:
          'En Occidente se tiende a analizar la política exterior china desde una lógica puramente estratégica y racional. Pero el "siglo de humillación" (1839-1949) es un factor emocional y político real que permea la cultura y la narrativa oficial china. La sensibilidad ante cualquier crítica extranjera a la soberanía china, la obsesión con el reconocimiento internacional y la retórica sobre "restaurar la grandeza" son más comprensibles cuando se conoce ese trauma histórico. No comprender esto lleva a interpretar erróneamente comportamientos chinos que desde fuera parecen irracionales o desproporcionados.',
      },
      {
        titulo: 'Considerar al PCCh como un bloque monolítico',
        cuerpo:
          'Aunque el Partido Comunista Chino no tiene competencia electoral externa, internamente alberga facciones, debates y tensiones. Las pugnas entre "reformistas" y "conservadores", entre economistas de mercado y planificadores centrales, o entre distintas generaciones de líderes son reales y con consecuencias políticas. La campaña anticorrupción de Xi ha eliminado rivales políticos bajo ese paraguas. Conocer la política interna del PCCh —a través del sistema de facciones, el Comité Permanente del Buró Político y la Conferencia Consultiva— es esencial para cualquier análisis serio de la política china.',
      },
    ],
  },
};
