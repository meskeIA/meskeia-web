import type { HistoriaData } from './types';

export const historiaPortugalUltramar: HistoriaData = {
  slug: 'historia-portugal-ultramar',
  titulo: 'El Imperio Portugués: De Ceuta a la Ruta de las Especias',
  subtitulo:
    'Cómo el país más pequeño de la Península Ibérica construyó el primer Imperio global de la historia y cambió el mundo para siempre',
  descripcionSEO:
    'Cronología interactiva del Imperio Portugués: de la conquista de Ceuta (1415) a la Revolución de los Claveles (1974). Enrique el Navegante, Vasco da Gama, Cabral, el Estado da India, Brasil, la Unión Ibérica y el fin del último Imperio colonial europeo en 10 hitos y 6 eras.',
  keywords: [
    'historia portugal imperio ultramar cronología',
    'enrique el navegante descubrimientos portugueses',
    'vasco da gama india ruta especias',
    'pedro álvares cabral brasil descubrimiento',
    'estado da india albuquerque malaca goa',
    'revolución de los claveles 25 abril 1974',
  ],
  anioInicio: 1415,
  anioFin: 9999,

  hitos: [
    {
      id: 'ceuta-infante',
      nombre: 'Ceuta y el Infante Enrique el Navegante',
      anioInicio: 1415,
      anioFin: 1440,
      color: '#003399',
      categoria: 'exploracion',
      descripcion:
        'Conquista de Ceuta (1415): primer territorio europeo en África, punto de partida del Imperio. El Infante Enrique el Navegante funda en Sagres la primera escuela de navegación y cartografía del mundo. Financia sistemáticamente expediciones por la costa africana. Portugal inventa la exploración organizada por el Estado.',
      obraIconica:
        'Toma de Ceuta — 21 agosto 1415. El pequeño Portugal cruza el Mediterráneo: el primer paso del mayor Imperio proporcional de la historia',
      paises: ['Portugal', 'Marruecos'],
    },
    {
      id: 'africa-occidental',
      nombre: 'La Costa de África: El Avance Sistemático',
      anioInicio: 1440,
      anioFin: 1488,
      color: '#003399',
      categoria: 'exploracion',
      descripcion:
        'Los navegantes portugueses avanzan metódicamente por la costa africana: Cabo Verde (1456), Costa de Marfil, Costa de Oro (Ghana), el Congo. Bartolomeu Dias dobla el Cabo de Buena Esperanza (1488): la ruta a India está abierta. El padrão (pilar de piedra con las armas de Portugal): Portugal marca lo que descubre.',
      obraIconica:
        'Bartolomeu Dias dobla el Cabo de Buena Esperanza — 1488. La demostración de que se puede llegar a India rodeando África',
      paises: ['Portugal', 'Senegal', 'Guinea', 'Ghana', 'Sudáfrica'],
    },
    {
      id: 'vasco-gama-india',
      nombre: 'Vasco da Gama: La Ruta a India',
      anioInicio: 1497,
      anioFin: 1499,
      color: '#003399',
      categoria: 'exploracion',
      descripcion:
        'Vasco da Gama parte de Lisboa (julio 1497) y llega a Calicut, India (mayo 1498): la primera vez en la historia que un europeo alcanza India por mar. La ruta de las especias está abierta. La vuelta con pimienta y canela multiplica por 60 la inversión. Portugal rompe el monopolio árabe y veneciano del comercio con Oriente.',
      obraIconica:
        'Llegada de Vasco da Gama a Calicut — 20 mayo 1498. El viaje que cambió la economía mundial: el monopolio de las especias pasa a Portugal',
      paises: ['Portugal', 'India', 'Mozambique'],
    },
    {
      id: 'brasil-cabral',
      nombre: 'Pedro Álvares Cabral y el Descubrimiento de Brasil',
      anioInicio: 1500,
      anioFin: 1530,
      color: '#003399',
      categoria: 'exploracion',
      descripcion:
        'Pedro Álvares Cabral, en ruta a India, avista Brasil (22 abril 1500) — quizás no fue accidental. El Tratado de Tordesillas (1494) ya le había asignado ese territorio a Portugal. Brasil será el legado más duradero del Imperio: el mayor país de América del Sur, de lengua portuguesa, con 215 millones de habitantes hoy.',
      obraIconica:
        "Carta de Pero Vaz de Caminha — 1 mayo 1500. La primera descripción de Brasil: 'en ella, en queriendo labrarse, todo dará'",
      paises: ['Portugal', 'Brasil', 'India'],
    },
    {
      id: 'estado-da-india',
      nombre: 'El Estado da India: El Imperio de los Mares',
      anioInicio: 1505,
      anioFin: 1560,
      color: '#1B5E20',
      categoria: 'imperio',
      descripcion:
        'Afonso de Albuquerque conquista Goa (1510), Malaca (1511), Ormuz (1515): Portugal controla los tres grandes nodos del comercio mundial. El Estado da India es un Imperio de fortalezas y factorías costeras, no de conquista territorial. Carracas y galeones armados imponen los primeros peajes marítimos de la historia.',
      obraIconica:
        'Conquista de Malaca — agosto 1511. Portugal controla el estrecho más estratégico del mundo: el comercio de las especias entre el Índico y el Pacífico',
      paises: ['Portugal', 'India', 'Malasia', 'Irán', 'Mozambique', 'Indonesia'],
    },
    {
      id: 'japon-china',
      nombre: 'Japón, China y el Primer Imperio Global',
      anioInicio: 1543,
      anioFin: 1580,
      color: '#1B5E20',
      categoria: 'imperio',
      descripcion:
        'Los portugueses llegan a Japón (1543): primera presencia europea en el archipiélago, introducen las armas de fuego. Macau (1557): base comercial en China que durará hasta 1999. Portugal construye el primer Imperio verdaderamente global: factorías desde Brasil a Japón, pasando por África, India y el sudeste asiático.',
      obraIconica:
        'Llegada portuguesa a Japón — 1543. Los europeos traen las armas de fuego a Japón. El inicio de la era Sengoku final',
      paises: ['Portugal', 'Japón', 'China', 'Brasil', 'Mozambique', 'India'],
    },
    {
      id: 'union-iberica',
      nombre: 'La Unión Ibérica: Sesenta Años Bajo España',
      anioInicio: 1580,
      anioFin: 1640,
      color: '#C62828',
      categoria: 'declive',
      descripcion:
        'Felipe II de España hereda Portugal (1580): la Unión Ibérica. Portugal mantiene sus colonias pero las comparte de facto con España. Los enemigos de España atacan el Imperio portugués: holandeses toman Brasil (1630), las Molucas, Ceilán. La pérdida de aliados y el abandono español aceleran el declive. Portugal se independiza el 1 diciembre 1640 (Día de Portugal).',
      obraIconica:
        'Restauración de la independencia portuguesa — 1 diciembre 1640. La noche en que Portugal recupera la independencia tras 60 años de dominio español',
      paises: ['Portugal', 'España', 'Brasil', 'India', 'Indonesia'],
    },
    {
      id: 'brazil-joia',
      nombre: 'Brasil: La Joya del Imperio',
      anioInicio: 1640,
      anioFin: 1822,
      color: '#1B5E20',
      categoria: 'imperio',
      descripcion:
        'Portugal independiente reconstruye su Imperio centrado en Brasil: el oro y los diamantes de Minas Gerais financian el siglo XVIII portugués. El Pombal moderniza Portugal y Brasil. La corte real huye a Río de Janeiro ante Napoleón (1808): Brasil se convierte en sede del Imperio. La independencia de Brasil (1822) es el golpe definitivo al Imperio.',
      obraIconica:
        'Traslado de la Corte a Río de Janeiro — noviembre 1807. Por primera vez en la historia, una metrópolis europea gobierna desde su colonia',
      paises: ['Portugal', 'Brasil', 'Angola', 'Mozambique'],
    },
    {
      id: 'africa-colonial',
      nombre: 'África Colonial: El Último Imperio',
      anioInicio: 1822,
      anioFin: 1974,
      color: '#C62828',
      categoria: 'declive',
      descripcion:
        'Tras perder Brasil, Portugal se aferra a sus colonias africanas: Angola, Mozambique, Guinea-Bissau, Cabo Verde. El Imperio africano sobrevive gracias a la debilidad diplomática de Portugal para negociar en el siglo XX. Las guerras coloniales (1961-1974) contra los movimientos independentistas desangran el país.',
      obraIconica:
        'Inicio de la guerra colonial en Angola — 15 marzo 1961. El principio del fin: Portugal intentará mantener el Imperio a cualquier precio',
      paises: ['Portugal', 'Angola', 'Mozambique', 'Guinea-Bissau', 'Cabo Verde'],
    },
    {
      id: 'revolucion-claveles',
      nombre: 'La Revolución de los Claveles y el Fin del Imperio',
      anioInicio: 1974,
      anioFin: 9999,
      color: '#003399',
      categoria: 'exploracion',
      descripcion:
        'El 25 de abril de 1974, los militares derrocan la dictadura de Caetano (sucesor de Salazar): la Revolución de los Claveles, la más pacífica del siglo XX. La descolonización rápida (1974-1975): Angola, Mozambique, Guinea-Bissau independientes. Macao devuelta a China en 1999. El Imperio termina, pero la lengua portuguesa vincula a 260 millones de personas en 9 países.',
      obraIconica:
        'La Revolución de los Claveles, 25 de abril de 1974',
      paises: ['Portugal', 'Angola', 'Mozambique', 'Brasil', 'Macao', 'China'],
    },
  ],

  eras: [
    {
      nombre: 'Los Descubrimientos: De Ceuta al Cabo',
      desde: 1415,
      hasta: 1498,
      icono: '⛵',
      hitosDestacados: [
        'Ceuta y el Infante Enrique el Navegante',
        'La Costa de África: El Avance Sistemático',
      ],
      eventos: [
        '1415: Conquista de Ceuta — inicio del Imperio',
        '1456: Cabo Verde: primera colonia atlántica portuguesa',
        '1488: Bartolomeu Dias dobla el Cabo de Buena Esperanza',
      ],
    },
    {
      nombre: 'La Ruta a India y el Imperio Global',
      desde: 1498,
      hasta: 1560,
      icono: '🌏',
      hitosDestacados: [
        'Vasco da Gama: La Ruta a India',
        'Pedro Álvares Cabral y el Descubrimiento de Brasil',
        'El Estado da India: El Imperio de los Mares',
      ],
      eventos: [
        '1498: Vasco da Gama llega a India',
        '1500: Cabral avista Brasil (22 abril)',
        '1511: Portugal conquista Malaca — controla el comercio de las especias',
      ],
    },
    {
      nombre: 'El Apogeo: El Primer Imperio Global',
      desde: 1560,
      hasta: 1580,
      icono: '🌐',
      hitosDestacados: ['Japón, China y el Primer Imperio Global'],
      eventos: [
        '1543: Portugueses llegan a Japón — introducen las armas de fuego',
        '1557: Macau: base permanente en China',
        '1578: Batalla de Alcazarquivir — muere el rey Sebastián sin heredero',
      ],
    },
    {
      nombre: 'La Unión Ibérica y el Declive',
      desde: 1580,
      hasta: 1640,
      icono: '⚔️',
      hitosDestacados: ['La Unión Ibérica: Sesenta Años Bajo España'],
      eventos: [
        '1580: Felipe II hereda Portugal — Unión Ibérica',
        '1630: Holandeses toman el nordeste de Brasil',
        '1640: Restauración portuguesa (1 diciembre) — fin de la Unión Ibérica',
      ],
    },
    {
      nombre: 'Brasil y el Imperio Tardío',
      desde: 1640,
      hasta: 1822,
      icono: '🌴',
      hitosDestacados: ['Brasil: La Joya del Imperio'],
      eventos: [
        '1693: Descubrimiento del oro en Minas Gerais',
        '1755: Terremoto de Lisboa — Pombal reconstruye Portugal',
        '1808: La corte real huye a Río de Janeiro ante Napoleón',
      ],
    },
    {
      nombre: 'África Colonial y el Fin del Imperio',
      desde: 1822,
      hasta: 9999,
      icono: '🕊️',
      hitosDestacados: [
        'África Colonial: El Último Imperio',
        'La Revolución de los Claveles y el Fin del Imperio',
      ],
      eventos: [
        '1822: Independencia de Brasil — el Imperio pierde su joya',
        '1961: Inicio de las guerras coloniales africanas',
        '1974: Revolución de los Claveles — descolonización rápida',
      ],
    },
  ],

  categorias: {
    exploracion: 'Exploración y Descubrimientos',
    imperio: 'Imperio y Comercio',
    declive: 'Declive y Crisis',
  },

  colores: {
    exploracion: '#003399',
    imperio: '#1B5E20',
    declive: '#C62828',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'Portugal es la mayor paradoja de la historia: el país más pequeño de la Península Ibérica construyó el primer Imperio verdaderamente global de la historia, conectó por primera vez todos los continentes y mantuvo colonias durante 560 años (1415-1975). Vasco da Gama, Bartolomeu Dias y Álvares Cabral cambiaron la economía mundial más que ningún otro explorador. Y la Revolución de los Claveles (1974) fue una de las transiciones más pacíficas del siglo XX, con mínimo derramamiento de sangre.',

    tablaComparativa: [
      {
        hito: 'Los Descubrimientos: De Ceuta al Cabo',
        periodo: '1415-1498',
        categoria: 'Exploración',
        personaje: 'Enrique el Navegante / Bartolomeu Dias',
        aportacion: 'Escuela de navegación de Sagres, exploración sistemática de la costa africana',
      },
      {
        hito: 'La Ruta a India y el Imperio Global',
        periodo: '1498-1560',
        categoria: 'Exploración',
        personaje: 'Vasco da Gama / Cabral / Albuquerque',
        aportacion: 'Ruta marítima a India, descubrimiento de Brasil, control de los nodos del comercio mundial',
      },
      {
        hito: 'El Apogeo: El Primer Imperio Global',
        periodo: '1560-1580',
        categoria: 'Imperio y Comercio',
        personaje: 'João III / Sebastián I',
        aportacion: 'Primer Imperio con presencia en todos los continentes habitados; Macau en China, factorías en Japón',
      },
      {
        hito: 'La Unión Ibérica y el Declive',
        periodo: '1580-1640',
        categoria: 'Declive y Crisis',
        personaje: 'Felipe II / João IV',
        aportacion: 'Pérdida de aliados y colonias ante Holanda; restauración de la independencia en 1640',
      },
      {
        hito: 'Brasil y el Imperio Tardío',
        periodo: '1640-1822',
        categoria: 'Imperio y Comercio',
        personaje: 'Pombal / João VI',
        aportacion: 'Oro y diamantes de Brasil financian Portugal; la corte real gobierna desde Río de Janeiro',
      },
      {
        hito: 'África Colonial y el Fin del Imperio',
        periodo: '1822-1974',
        categoria: 'Declive y Crisis',
        personaje: 'Salazar / Spínola',
        aportacion: 'Guerras coloniales africanas; Revolución de los Claveles y descolonización rápida',
      },
    ],

    escenarios: [
      {
        icono: '🗺️',
        titulo: '¿Cómo pudo Portugal, con 1 millón de habitantes, construir un Imperio global?',
        perfil: 'Historia política y económica',
        texto:
          'Portugal no necesitaba conquistar territorios: le bastaba con controlar los puertos y los estrechos clave. El Estado da India era un Imperio de factorías y fortalezas costeras, no de colonización masiva. Con 50-100 hombres en una fortaleza bien artillada y una flota de carracas, Portugal podía cobrar peajes a todo el comercio que pasara por el Índico. El tamaño del país fue irrelevante: el arma fue la tecnología naval y la voluntad política de invertir en exploración.',
      },
      {
        icono: '🌶️',
        titulo: 'La ruta de las especias: ¿por qué cambió el mundo?',
        perfil: 'Historia económica',
        texto:
          'En el siglo XV, la pimienta valía su peso en plata en Europa. El monopolio árabe y veneciano sobre el comercio con Oriente hacía que los precios se multiplicaran por 10 en cada intermediario. Cuando Vasco da Gama llegó a Calicut y volvió con especias, el primer viaje multiplicó por 60 la inversión. Portugal rompió el monopolio árabe-veneciano y durante décadas controló los precios mundiales de la pimienta, la canela, la nuez moscada y el clavo. El eje comercial del mundo se desplazó del Mediterráneo al Atlántico.',
      },
      {
        icono: '⚔️',
        titulo: 'La Unión Ibérica: ¿fue la ruina de Portugal?',
        perfil: 'Historia política',
        texto:
          'Cuando Felipe II de España heredó Portugal en 1580, los portugueses conservaron sus leyes, colonias y administración propias. Pero los enemigos de España se convirtieron automáticamente en enemigos de Portugal. Los holandeses, aliados con Inglaterra, atacaron sistemáticamente el Imperio portugués: tomaron Brasil, Ceilán, las Molucas y gran parte de las rutas asiáticas. Cuando Portugal recuperó la independencia en 1640, ya había perdido lo que nunca podría recuperar: el control del comercio asiático.',
      },
      {
        icono: '🌍',
        titulo: '¿Por qué duró tanto el Imperio portugués en África?',
        perfil: 'Historia colonial',
        texto:
          'Portugal mantuvo sus colonias africanas (Angola, Mozambique, Guinea-Bissau) hasta 1975, décadas después de que el resto de potencias europeas descolonizaran. La razón es paradójica: Portugal era demasiado débil para negociar desde la fuerza (como hizo Gran Bretaña) y demasiado orgulloso para soltar voluntariamente los territorios que consideraba "provincias ultramarinas". La dictadura de Salazar convirtió las colonias en símbolo de grandeza nacional. Solo la Revolución de los Claveles de 1974 pudo romper ese bloqueo.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué fue el Estado da India?',
        respuesta:
          'El Estado da India (Estado da Índia) fue el sistema de control portugués sobre el comercio del Océano Índico entre los siglos XVI y XVIII. No era un territorio continuo, sino una red de fortalezas, factorías y rutas marítimas que controlaban los puntos clave del comercio: Goa (India), Malaca (sudeste asiático), Ormuz (Golfo Pérsico) y la costa de África Oriental. Con flotas armadas, Portugal cobraba "cartazes" (licencias de navegación) a todos los barcos que cruzaran sus rutas.',
        tip: 'El Estado da India fue el primer sistema de control de rutas comerciales marítimas a escala global de la historia.',
      },
      {
        pregunta: '¿Quién fue Enrique el Navegante?',
        respuesta:
          'Enrique el Navegante (1394-1460) fue el infante portugués que financió y organizó sistemáticamente las exploraciones de la costa africana. Nunca navegó personalmente (de ahí la ironía de su apodo), pero fundó en el Cabo de Sagres lo que puede considerarse la primera institución estatal de investigación geográfica y náutica del mundo. Reunió cartógrafos, navegantes, matemáticos y astrónomos para mejorar los métodos de navegación y la calidad de los mapas.',
        tip: 'Sin Enrique el Navegante, las exploraciones habrían dependido de iniciativas privadas dispersas. Fue quien convirtió la exploración en política de Estado.',
      },
      {
        pregunta: '¿Cuándo se independizó Brasil?',
        respuesta:
          'Brasil se independizó el 7 de septiembre de 1822, proclamado por el príncipe Pedro (hijo del rey João VI de Portugal) como "Grito do Ipiranga". La independencia fue relativamente pacífica: Pedro se convirtió en Pedro I de Brasil. Lo paradójico es que la corte portuguesa llevaba viviendo en Río de Janeiro desde 1808, huyendo de Napoleón. Brasil fue la única colonia americana que albergó la metrópolis, y la independencia la proclamó el hijo del propio rey de Portugal.',
        tip: 'Brasil fue el último país de América del Sur en independizarse, 11 años después de la mayoría de las repúblicas hispanoamericanas.',
      },
      {
        pregunta: '¿Qué es la Revolución de los Claveles?',
        respuesta:
          'La Revolución de los Claveles fue el golpe militar del 25 de abril de 1974 que derrocó la dictadura portuguesa de Caetano (sucesor de Salazar). Fue extraordinariamente pacífica: los soldados pusieron claveles (la flor de temporada) en los cañones de sus tanques. La dictadura cayó sin resistencia armada. La revolución terminó con 48 años de Estado Novo y aceleró la descolonización de Angola, Mozambique y Guinea-Bissau. Se celebra cada año en Portugal como Día de la Libertad.',
        tip: 'La señal para iniciar el golpe fue la emisión de la canción "Grândola, Vila Morena" de Zeca Afonso por Radio Renascença a las 00:20 del 25 de abril.',
      },
      {
        pregunta: '¿Por qué hay tantos países de habla portuguesa?',
        respuesta:
          'El portugués es lengua oficial de 9 países (Portugal, Brasil, Angola, Mozambique, Cabo Verde, Guinea-Bissau, Santo Tomé y Príncipe, Guinea Ecuatorial y Timor-Leste) con un total de 260 millones de hablantes. Es la herencia directa del Imperio portugués: allí donde Portugal estableció colonias duraderas, el idioma arraigó. Brasil representa el 80% de los hispanohablantes; los países africanos lusófonos son los de mayor crecimiento demográfico, por lo que en 2100 podría ser la cuarta lengua más hablada del mundo.',
        tip: 'La Comunidade dos Países de Língua Portuguesa (CPLP) une a los 9 países lusófonos en una organización similar a la Commonwealth británica.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por los Descubrimientos',
        cuerpo:
          'Haz clic en "Ceuta y el Infante Enrique el Navegante" en la línea de tiempo. Observa cómo en solo 75 años (1415-1488) Portugal cartografió toda la costa africana desde Marruecos hasta Sudáfrica. Es la exploración geográfica más sistemática de la historia hasta ese momento: un avance de cientos de kilómetros cada pocos años.',
      },
      {
        titulo: 'Comprende la revolución del comercio mundial',
        cuerpo:
          'Haz clic en "Vasco da Gama: La Ruta a India" y en "El Estado da India: El Imperio de los Mares". Observa cómo en apenas 15 años (1498-1511) Portugal pasó de no tener presencia en Asia a controlar los tres grandes nodos del comercio mundial: Goa (India), Malaca (sudeste asiático) y Ormuz (Golfo Pérsico). El eje económico del mundo cambió.',
      },
      {
        titulo: 'Sigue la paradoja del Imperio global',
        cuerpo:
          'En la comparativa, filtra por "Imperio y Comercio". Verás la paradoja: Portugal tenía factorías en Japón y Brasil simultáneamente, con una población de apenas 1-2 millones de personas. Ningún otro país ha construido nunca un Imperio tan desproporcionado respecto a su tamaño. La clave fue el control de las rutas marítimas, no la ocupación territorial.',
      },
      {
        titulo: 'Analiza el declive en dos fases',
        cuerpo:
          'Filtra por "Declive y Crisis" en la comparativa. Observa las dos fases distintas del declive: la Unión Ibérica (1580-1640) donde Portugal pierde las colonias asiáticas ante Holanda, y el período africano (1822-1974) donde se aferra a Angola y Mozambique durante 150 años más. Dos declives separados por dos siglos.',
      },
      {
        titulo: 'Termina con el legado en el Contexto Histórico',
        cuerpo:
          'La última era muestra que el Imperio no terminó solo con la descolonización: el legado vive en 260 millones de hispanohablantes y en la Comunidade dos Países de Língua Portuguesa. La lengua portuguesa, exportada entre 1415 y 1975, es ahora una de las más habladas del mundo y la de mayor crecimiento demográfico.',
      },
    ],

    tips: [
      {
        icono: '📐',
        texto:
          'Para entender la escala, imagina que España (con 47 millones de habitantes hoy) construyera un Imperio que controlara el comercio de toda Asia, América y África simultáneamente. Portugal lo hizo con 1-2 millones de habitantes en el siglo XVI. El secreto: no conquistar territorios sino controlar rutas y puertos clave.',
      },
      {
        icono: '🌍',
        texto:
          'El Tratado de Tordesillas (1494) dividió el mundo entre Portugal y España por un meridiano: Portugal al este (África, India, Brasil), España al oeste (América). Fue el primer tratado geopolítico global de la historia, negociado antes de que ninguno de los dos países supiera exactamente qué había en esos territorios.',
      },
      {
        icono: '⏳',
        texto:
          'Portugal mantuvo su último territorio colonial (Macao, en China) hasta el 20 de diciembre de 1999: 584 años después de la conquista de Ceuta. Ningún otro Imperio occidental duró tanto. Y lo más paradójico: la devolución de Macao fue negociada pacíficamente con China, casi como un acto simbólico de cierre de una era.',
      },
      {
        icono: '🗣️',
        texto:
          'El portugués es hoy la única lengua europea que, en términos demográficos, crece más rápido que el inglés. Los países africanos lusófonos (Angola, Mozambique) tienen las tasas de crecimiento más altas del mundo. En 2100, Brasil y África podrían tener más de 400 millones de hispanohablantes. El Imperio lingüístico supera al Imperio político.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que Portugal fue solo un socio menor de España',
        cuerpo:
          'Durante la Unión Ibérica (1580-1640), Portugal mantuvo su administración, leyes y colonias propias. Pero lo más importante: antes de la Unión, Portugal ya era la mayor potencia comercial del mundo durante casi un siglo. El Estado da India, Brasil y las rutas africanas fueron creación exclusivamente portuguesa, sin ayuda española. España y Portugal fueron imperios paralelos y competidores, no una relación de jerarquía.',
      },
      {
        titulo: 'Pensar que los descubrimientos fueron casuales',
        cuerpo:
          'Las exploraciones portuguesas no fueron accidentales: fueron el resultado de décadas de inversión estatal sistemática en tecnología naval, cartografía y formación de navegantes. Enrique el Navegante creó la primera institución pública de investigación geográfica de la historia. Cada expedición usaba los mapas y datos de la anterior. El Cabo de Buena Esperanza no se "descubrió": se alcanzó después de 75 años de avance planificado kilómetro a kilómetro.',
      },
      {
        titulo: 'Asumir que el Imperio terminó con la independencia de Brasil',
        cuerpo:
          'La independencia de Brasil en 1822 fue un golpe enorme, pero Portugal siguió siendo una potencia colonial en África durante 150 años más. Angola y Mozambique eran territorios enormes y ricos. Portugal los perdió en 1975, no en 1822. El Imperio portugués fue, de hecho, el último Imperio colonial europeo en desaparecer, décadas después de que Gran Bretaña, Francia y Holanda descolonizaran.',
      },
      {
        titulo: 'Creer que la Revolución de los Claveles fue violenta',
        cuerpo:
          'La Revolución del 25 de abril de 1974 fue una de las transiciones más pacíficas de la historia: los militares dieron el golpe sin disparar un solo tiro, la dictadura no opuso resistencia armada, y los soldados pusieron claveles en los cañones. Hubo exactamente 4 muertos (disparados por la PIDE, policía política), no por los militares revolucionarios. Es el modelo histórico de transición pacífica a la democracia.',
      },
    ],
  },
};
