import type { HistoriaData } from './types';

export const maya: HistoriaData = {
  slug: 'maya',
  titulo: 'Historia de los Mayas: De las Primeras Aldeas al Fin del Mundo Clásico',
  subtitulo:
    'Tres mil años de una civilización que inventó el cero, predijo eclipses y escribió el Popol Vuh sin contacto con el Viejo Mundo',
  descripcionSEO:
    'Cronología interactiva de la civilización maya: desde las primeras aldeas preclásicas (-2000) hasta las ciudades-estado postclásicas (1500). El Período Clásico, Tikal, Palenque, el colapso del siglo IX, Chichén Itzá, la escritura jeroglífica, el cero matemático y el Popol Vuh en 10 hitos y 6 eras.',
  keywords: [
    'historia maya cronología interactiva',
    'civilización maya Tikal Palenque Chichén Itzá',
    'colapso clásico maya siglo IX sequías',
    'escritura jeroglífica maya cero matemático',
    'Popol Vuh cosmovisión maya',
    'período clásico maya apogeo Calakmul',
    'Mayas preclásico El Mirador La Danta',
    'postclásico maya Mayapán ciudades-estado yucatecas',
  ],
  anioInicio: -2000,
  anioFin: 1500,

  hitos: [
    {
      id: 'preclasico-aldeas',
      nombre: 'Orígenes Mayas y el Pre-Clásico Temprano',
      anioInicio: -2000,
      anioFin: -400,
      color: '#8B4513',
      categoria: 'preclasico',
      descripcion:
        'Las primeras comunidades agrícolas mayas se establecen en las tierras bajas de Guatemala y México hacia el 2000 a.C. Cultivaban maíz, frijol y calabaza con un sistema de roza y quema. Las aldeas del Pre-Clásico Temprano, como Cuello (Belice) y Nakbé (Guatemala), comenzaron a establecer las bases de la cultura que florecería siglos después. Hacia el 1000 a.C. surgían aldeas permanentes con cerámica monocroma. Entre 1000 y 400 a.C. (Pre-Clásico Medio) aparecen las primeras plataformas ceremoniales y el intercambio regional de obsidiana, jade y conchas. Izapa (Chiapas), Nakbé y El Mirador del Pre-Clásico Tardío prefiguran ya la monumentalidad clásica. Los mayas desarrollaron temprano una economía agrícola intensiva, redes de intercambio y una jerarquía social visible en la cerámica y la arquitectura. Este período sentó las bases de todo lo que vendría: la ciudad, el templo, el calendario y la escritura.',
      obraIconica:
        'Cuello, Belice — uno de los asentamientos mayas más antiguos conocidos (2000 a.C.)',
      paises: ['Guatemala', 'México (Chiapas, Yucatán)', 'Belice', 'Honduras'],
    },
    {
      id: 'el-mirador',
      nombre: 'El Mirador: La Primera Gran Ciudad Maya',
      anioInicio: -400,
      anioFin: 150,
      color: '#2E8B57',
      categoria: 'preclasico',
      descripcion:
        'El Mirador, en el norte de Guatemala, fue la primera gran metrópoli maya, floreciendo entre el 300 a.C. y el 150 d.C. Albergó entre 100.000 y 250.000 personas en su apogeo, más que Roma en la misma época. La Danta, su pirámide más alta, alcanza 72 metros y es por volumen una de las mayores estructuras del mundo antiguo. Su construcción requirió millones de jornadas de trabajo organizado, lo que prueba una organización política y social avanzada siglos antes del Período Clásico. El complejo de pirámides Triádico —tres templos sobre una plataforma— es el formato arquitectónico que definiría las ciudades mayas clásicas. Las calzadas (sacbés) conectaban El Mirador con ciudades vecinas. Hacia el 150 d.C., El Mirador declinó misteriosamente, posiblemente por la misma combinación de sequías y agotamiento ambiental que devastaría el Clásico siglos después. Su caída coincide aproximadamente con el auge de Teotihuacán y la reestructuración del poder en Mesoamérica. El Mirador demuestra que la complejidad civilizatoria maya surgió mucho antes de lo que se pensaba.',
      obraIconica:
        'La Danta — pirámide de 72 metros, una de las mayores del mundo por volumen (300-100 a.C.)',
      paises: ['Guatemala (Petén)'],
    },
    {
      id: 'clasico-temprano',
      nombre: 'El Período Clásico Temprano y Teotihuacán',
      anioInicio: 250,
      anioFin: 400,
      color: '#1E90FF',
      categoria: 'clasico',
      descripcion:
        'El inicio del Período Clásico Maya (convencionalmente 250 d.C.) coincide con la aparición de las primeras inscripciones con la cuenta larga (el sistema de fechado absoluto maya) y la consolidación de las primeras dinásticamente rastreables en Tikal (Guatemala) y Copán (Honduras). La influencia de Teotihuacán (el gigante del Altiplano Central) fue determinante en este período temprano: en el año 378 d.C., un representante de Teotihuacán llamado Siyaj K\'ahk\' ("Búho de Fuego") llegó a Tikal y depuso o reemplazó a su gobernante, instalando la primera dinastía foránea documentada en la historia maya. La iconografía guerrera teotihuacana (el Tláloc-Venus, el Búho) se difundió por Tikal, Kaminaljuyú (Guatemala) y otras ciudades. Este período fijó el patrón que definiría el Clásico: ciudades-estado independientes gobernadas por reyes divinos (k\'uhul ajaw), sistemas de alianzas y guerras entre linajes, y una sofisticada cultura material: cerámica policroma, escultura, arquitectura monumental.',
      obraIconica:
        'Estela 31 de Tikal — retrato del rey Siyaj Chan K\'awiil con iconografía de Teotihuacán (378 d.C.)',
      paises: ['Guatemala', 'Honduras', 'México (altiplano central)'],
    },
    {
      id: 'clasico-tardio-apogeo',
      nombre: 'El Apogeo Clásico: Tikal contra Calakmul',
      anioInicio: 400,
      anioFin: 750,
      color: '#FFD700',
      categoria: 'clasico',
      descripcion:
        'El Período Clásico Tardío (600-800 d.C.) es la cima de la civilización maya. Las ciudades-estado de Tikal (Guatemala) y Calakmul (Campeche, México) compitieron por la hegemonía del mundo maya en una rivalidad que los arqueólogos llaman la "Guerra de los Reinos Serpiente". Cada una construía alianzas con ciudades menores, organizaba guerras de captura ritual y erigía estelas para conmemorar victorias y fechas calendáricas. Tikal fue sometida por Calakmul durante décadas hasta que el gran rey Siyaj Chan K\'awiil (Tormenta del Cielo) y luego Jasaw Chan K\'awiil I (682-734) revirtieron el equilibrio. Las pirámides Templo I y Templo II de Tikal se construyeron en este período de renacimiento. Palenque, bajo Pacal el Grande (615-683) y su hijo K\'inich Kan Bahlam II, alcanzó su máximo esplendor: el Templo de las Inscripciones contiene el sarcófago de Pacal, la obra escultórica más extraordinaria del mundo maya. Copán (Honduras), bajo el mecenazgo del rey 18 Conejo, produjo las estelas más refinadas del mundo maya. La producción artística de este período —cerámica policroma, escultura, arquitectura, joyería en jade— es de una calidad insuperable.',
      obraIconica:
        'Templo de las Inscripciones de Palenque — tumba de Pacal el Grande con sarcófago esculpido (692 d.C.)',
      paises: [
        'Guatemala',
        'México (Chiapas, Campeche, Yucatán)',
        'Honduras',
        'Belice',
      ],
    },
    {
      id: 'escritura-ciencia-maya',
      nombre: 'Escritura Jeroglífica y Astronomía Maya',
      anioInicio: 250,
      anioFin: 900,
      color: '#9932CC',
      categoria: 'conocimiento',
      descripcion:
        'La escritura maya es el único sistema de escritura completamente desarrollado de América precolombina. Combinaba logogramas (signos que representan palabras) con signos silábicos, permitiendo representar prácticamente cualquier expresión oral. Los glifos se inscriben en estelas de piedra, en los cuatro códices supervivientes (Madrid, Dresde, París y el recién confirmado Grolier) y en cerámica y arquitectura. El desciframiento moderno, iniciado por Yuri Knorozov en los años 50 y consolidado en las décadas siguientes, reveló que las inscripciones no son solo calendáricas sino históricas: narran batallas, alianzas matrimoniales, ascensos al trono y rituales de linajes reales. La astronomía maya era extraordinariamente precisa: el Códice de Dresde contiene tablas de Venus y eclipses de una exactitud asombrosa. Calcularon el ciclo sinódico de Venus (584,92 días) con un error de 14 segundos por año. El sistema calendárico combinaba el Tzolkín (260 días, probablemente vinculado al embarazo y al ciclo agrícola) con el Haab (365 días solar). La Rueda Calendárica —combinación de ambos ciclos— creaba un período de 52 años antes de repetirse. Además usaban la Cuenta Larga para fechas absolutas: el 0.0.0.0.0 equivale al 11 de agosto de 3114 a.C., inicio de la era actual maya.',
      obraIconica:
        'Códice de Dresde — el libro maya más completo, con tablas astronómicas de Venus (siglo XII-XIII)',
      paises: [
        'México (Yucatán, Chiapas)',
        'Guatemala',
        'Belice',
        'Honduras',
      ],
    },
    {
      id: 'colapso-clasico',
      nombre: 'El Colapso del Período Clásico',
      anioInicio: 800,
      anioFin: 950,
      color: '#708090',
      categoria: 'colapso',
      descripcion:
        'Entre los años 800 y 950 d.C., casi todas las grandes ciudades mayas del sur (las Tierras Bajas del Sur) fueron abandonadas. Tikal dejó de erigir estelas en el 869. Copán, en el 822. Palenque, en el 799. El colapso maya es uno de los fenómenos históricos más estudiados y debatidos de la arqueología americana. Los investigadores señalan una confluencia de factores: sequías prolongadas y graves documentadas por isótopos del lago de Cariaco (Venezuela) y en espeleotemas de cuevas; colapso agrícola por deforestación y erosión de suelos; guerras endémicas entre ciudades-estado que destruyeron redes comerciales; y desintegración del sistema político centralizado en reyes divinos. Ninguna causa única explica el fenómeno; fue un colapso en cascada sistémico. Ciudades que habían florecido durante 600 años cayeron en pocas décadas. Pero la civilización maya no desapareció: se reconfiguró geográficamente hacia el norte, en la Península de Yucatán, donde nuevas potencias emergerían.',
      obraIconica:
        'Las ruinas de Tikal entre la selva — ciudad abandonada tras el último registro en el 869 d.C.',
      paises: ['Guatemala (Petén)', 'Honduras', 'México (Chiapas)'],
    },
    {
      id: 'chichenitza-norte',
      nombre: 'Chichén Itzá y el Postclásico Temprano',
      anioInicio: 900,
      anioFin: 1200,
      color: '#DC143C',
      categoria: 'postclasico',
      descripcion:
        'Mientras el sur se hundía, Chichén Itzá (Yucatán, México) emergió como el gran centro del mundo maya norteño. Su arquitectura es un fascinante híbrido: elementos del estilo Puuc yucateco se combinan con iconografía del Altiplano Central (posiblemente tolteca o de Teotihuacán tardía). El Castillo —la pirámide de Kukulcán— es un reloj solar perfecto: durante los equinoccios, el juego de luz y sombra crea la imagen de una serpiente descendiendo por las escalinatas. El Caracol, el observatorio circular, alineaba sus ventanas con ortos y ocasos de Venus y otros puntos astronómicos relevantes. El juego de pelota de Chichén Itzá es el mayor de toda Mesoamérica. Las tzompantli (plataformas de cráneos) y los relieves del Templo de los Guerreros testimonian la importancia del ritual del sacrificio. Uxmal, con su magnífica Pirámide del Adivino y el Cuadrángulo de las Monjas, representó el estilo Puuc más puro y fue rival de Chichén Itzá. La Liga de Mayapán —una alianza entre ciudades yucatecas encabezada por los linajes Cocom y Xiu— eventualmente sucedió a Chichén Itzá como poder dominante del norte.',
      obraIconica:
        'El Castillo (Pirámide de Kukulcán) en Chichén Itzá — reloj solar perfecto con efecto serpiente en los equinoccios',
      paises: ['México (Yucatán)'],
    },
    {
      id: 'mayapan-postclasico',
      nombre: 'Mayapán y las Ciudades-Estado Tardías',
      anioInicio: 1200,
      anioFin: 1450,
      color: '#2E8B57',
      categoria: 'postclasico',
      descripcion:
        'Tras la caída de Chichén Itzá hacia el 1200, Mayapán se convirtió en la capital política del norte de Yucatán durante dos siglos. El sistema político era novedoso: los gobernantes de las ciudades aliadas debían residir en Mayapán como rehenes/consejeros, asegurando la lealtad mediante coerción. Esta concentración de poder político en una sola ciudad fue inusual en la historia maya, que había favorecido el sistema de ciudades-estado independientes. Mayapán fue destruida por una revuelta de los linajes Xiu hacia el 1441-1461, fragmentando el norte yucateco en 16-18 ciudades-estado rivales. En este período, los mayas quichés de Guatemala alcanzaron su propio apogeo: la ciudad de Utatlán fue su capital, y el Popol Vuh —el gran texto cosmogónico maya— fue escrito o transcrito en este período. La ciudad costera de Tulum (Quintana Roo) fue uno de los últimos asentamientos mayas en pie cuando llegaron los europeos: su arquitectura pintada con murales impresionó a los marineros españoles que la avistaron desde el mar en 1518.',
      obraIconica:
        'Tulum — ciudad maya costera en el Caribe mexicano, avistada por los españoles en 1518 con sus murales en pie',
      paises: ['México (Yucatán, Quintana Roo)', 'Guatemala'],
    },
    {
      id: 'popol-vuh-cultura',
      nombre: 'El Popol Vuh y la Cosmovisión Maya',
      anioInicio: 250,
      anioFin: 1500,
      color: '#8B4513',
      categoria: 'cultura',
      descripcion:
        'El Popol Vuh es el texto sagrado del pueblo quiché (kiche\') de Guatemala y una de las obras literarias más extraordinarias de la humanidad precolombina. Compuesto en lengua quiché con grafía latina en el siglo XVI pero basado en tradiciones orales e inscripciones de siglos anteriores, narra la creación del universo maya y la historia de los Héroes Gemelos Hunahpú e Ixbalanqué, que descienden al inframundo (Xibalbá), vencen a sus señores y se convierten en el Sol y la Luna. La cosmovisión maya era profundamente compleja: el universo tenía 13 capas celestiales y 9 inframundos; el mundo actual era el cuarto intento de los dioses por crear seres humanos (los tres anteriores fallaron —hechos de barro, luego de madera, luego de oro—; el cuarto éxito fue la humanidad de maíz). El tiempo era cíclico, no lineal: los calendarios servían para navegar los ciclos del destino colectivo e individual. Esta cosmovisión impregnaba cada aspecto de la vida: la arquitectura de los templos replicaba el cosmos, las guerras eran rituales cósmicos, los reyes eran mediadores entre mundos.',
      obraIconica:
        'Páginas del Códice de Madrid — uno de los cuatro libros mayas supervivientes (siglo XIV-XV)',
      paises: [
        'Guatemala',
        'México (Yucatán, Chiapas)',
        'Belice',
        'Honduras',
      ],
    },
    {
      id: 'ciudades-estado-tardia',
      nombre: 'Las Ciudades-Estado Mayas y la Llegada Española',
      anioInicio: 1441,
      anioFin: 1500,
      color: '#708090',
      categoria: 'postclasico',
      descripcion:
        'Tras la caída de Mayapán, el norte de Yucatán quedó fragmentado en 16-18 ciudades-estado independientes —los cacicazgos yucatecos— que guerreaban entre sí. Las principales: Mani (linaje Xiu), Sotuta (linaje Cocom), Ah Kin Chel, Ekab y Chikinchel. La fragmentación política hacía imposible una respuesta unificada ante amenazas externas. Paralelamente, en las tierras altas de Guatemala, los mayas quichés, cakchiqueles y tzutujiles mantenían sus propios reinos con sus capitales —Utatlán, Iximché, Atitlán— en activo proceso de conflicto y expansión. Cuando Juan de Grijalva avistó Tulum en 1518 y Hernández de Córdoba llegó a Yucatán en 1517, encontraron una región fragmentada pero culturalmente vibrante. La conquista de Yucatán fue extraordinariamente difícil: Francisco de Montejo tardó casi 20 años en someter la región (1527-1546). Los mayas de las tierras bajas de Guatemala no fueron conquistados hasta 1697. La resistencia maya fue tenaz: la cultura y las lenguas mayas sobrevivieron a la conquista y siguen vivas en más de 6 millones de personas en el siglo XXI.',
      obraIconica:
        'Iximché — capital cakchiquel en Guatemala, aliada temporalmente con los españoles en 1524',
      paises: ['México (Yucatán)', 'Guatemala', 'Belice', 'Honduras'],
    },
  ],

  eras: [
    {
      nombre: 'El Pre-Clásico: Raíces de la Civilización Maya',
      desde: -2000,
      hasta: 150,
      icono: '🌽',
      hitosDestacados: [
        'Orígenes Mayas y el Pre-Clásico Temprano',
        'El Mirador: La Primera Gran Ciudad Maya',
      ],
      eventos: [
        'Primeras aldeas mayas con cerámica monocroma en las tierras bajas (2000 a.C.)',
        'Sistema agrícola de roza y quema: maíz, frijol y calabaza como base alimentaria',
        'Nakbé y Cival: los primeros asentamientos con arquitectura ceremonial (1000-600 a.C.)',
        'El Mirador alcanza 100.000-250.000 habitantes: primera gran metrópoli americana',
        'La pirámide La Danta: 72 metros de altura, una de las mayores del mundo por volumen',
        'Primeras inscripciones con escritura y calendarios en Izapa (Chiapas)',
        'Las calzadas (sacbés) conectan El Mirador con ciudades vecinas del Petén',
        'Declive de El Mirador hacia 150 d.C., posiblemente por sequías y agotamiento ambiental',
      ],
    },
    {
      nombre: 'El Período Clásico Temprano: Los Primeros Reinos',
      desde: 150,
      hasta: 600,
      icono: '🏛️',
      hitosDestacados: ['El Período Clásico Temprano y Teotihuacán'],
      eventos: [
        'Primera inscripción con la Cuenta Larga: fecha absoluta del calendario maya (292 d.C.)',
        'Siyaj K\'ahk\' ("Búho de Fuego") llega de Teotihuacán a Tikal e instala nueva dinastía (378 d.C.)',
        'La Estela 31 de Tikal documenta por primera vez la intervención teotihuacana',
        'Kaminaljuyú (Guatemala) se convierte en enclave de Teotihuacán en las tierras altas',
        'Las ciudades mayas establecen el sistema de k\'uhul ajaw: el rey como dios encarnado',
        'Primer juego de pelota monumental en ciudades del Clásico Temprano',
        'Red de rutas comerciales de jade, obsidiana y plumas de quetzal entre ciudades',
      ],
    },
    {
      nombre: 'El Apogeo Clásico: La Edad de Oro Maya',
      desde: 600,
      hasta: 800,
      icono: '⭐',
      hitosDestacados: [
        'El Apogeo Clásico: Tikal contra Calakmul',
        'Escritura Jeroglífica y Astronomía Maya',
      ],
      eventos: [
        'Pacal el Grande sube al trono de Palenque a los 12 años (615 d.C.)',
        'Tikal sometida por Calakmul y el "Sistema Estrella de la Serpiente" de alianzas',
        'Jasaw Chan K\'awiil I rompe el dominio de Calakmul y revitaliza Tikal (695 d.C.)',
        'Construcción del Templo I y Templo II de Tikal (c. 700 d.C.)',
        'K\'inich Kan Bahlam II finaliza el Templo de las Inscripciones con la tumba de Pacal (692 d.C.)',
        '18 Conejo de Copán crea las estelas más refinadas del mundo maya (700-738 d.C.)',
        'El Códice de Dresde registra tablas astronómicas de Venus y predicciones de eclipses',
        'Cerámica policroma: narrativa visual equiparable a la mejor cerámica griega',
      ],
    },
    {
      nombre: 'El Colapso: Fin de las Ciudades del Sur',
      desde: 800,
      hasta: 950,
      icono: '🌙',
      hitosDestacados: ['El Colapso del Período Clásico'],
      eventos: [
        'Tikal erige su última estela en el 869 d.C., luego silencio total',
        'Copán registra su último monumento en el 822 d.C.',
        'Palenque, su último en el 799 d.C.',
        'Sequías prolongadas documentadas en núcleos de sedimento del lago Chichancanab',
        'Deforestación masiva del Petén: colapso agrícola por erosión de suelos',
        'Guerras entre ciudades-estado destruyen redes de intercambio y abastecimiento',
        'Población de las Tierras Bajas del Sur cae un 80-90% en pocas décadas',
        'La cultura maya continúa en el norte de Yucatán: Chichén Itzá emerge como nueva capital',
      ],
    },
    {
      nombre: 'El Post-Clásico: Reconfiguración y Resistencia',
      desde: 950,
      hasta: 1441,
      icono: '🦅',
      hitosDestacados: [
        'Chichén Itzá y el Postclásico Temprano',
        'Mayapán y las Ciudades-Estado Tardías',
        'El Popol Vuh y la Cosmovisión Maya',
      ],
      eventos: [
        'Chichén Itzá se convierte en la capital política del norte yucateco (c. 900-1200)',
        'El Castillo (pirámide de Kukulcán) construida con perfecta alineación astronómica',
        'La Liga de Mayapán controla el norte de Yucatán (c. 1200-1441)',
        'Los mayas quichés de Guatemala alcanzan su apogeo con el reino de Utatlán',
        'El Popol Vuh quiché: cosmovisión, mitos de creación y los Héroes Gemelos',
        'Composición y copia de los códices de Madrid, París y Grolier',
        'La liga de Mayapán cae por la rebelión Xiu: fragmentación en 16 ciudades-estado (1441)',
      ],
    },
    {
      nombre: 'Las Ciudades-Estado Tardías y el Contacto Europeo',
      desde: 1441,
      hasta: 1500,
      icono: '🌅',
      hitosDestacados: [
        'Las Ciudades-Estado Mayas y la Llegada Española',
      ],
      eventos: [
        'Fragmentación del norte yucateco en 16 cacicazgos independientes rivales',
        'Los reinos mayas de las tierras altas de Guatemala: quichés, cakchiqueles, tzutujiles',
        'Tulum: ciudad maya costera todavía habitada y pintada con murales vivos en 1518',
        'Juan de Grijalva avista Tulum desde el mar (1518): los españoles ven una ciudad maya en pie',
        'Francisco Hernández de Córdoba llega a Yucatán: primera expedición española al mundo maya (1517)',
        'Inicio de la larga guerra de conquista de Yucatán (1527): tardará 20 años en completarse',
        'Los mayas de Tayasal (Guatemala) resistirán hasta 1697: los últimos independientes de América',
      ],
    },
  ],

  categorias: {
    preclasico: 'Pre-Clásico Maya',
    clasico: 'Período Clásico',
    conocimiento: 'Ciencia y Escritura',
    colapso: 'Colapso Clásico',
    postclasico: 'Período Postclásico',
    cultura: 'Cultura y Religión',
  },

  colores: {
    preclasico: '#8B4513',
    clasico: '#1E90FF',
    conocimiento: '#9932CC',
    colapso: '#708090',
    postclasico: '#DC143C',
    cultura: '#2E8B57',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La civilización maya abarca más de 3.000 años de historia continua en las tierras bajas y altas de Mesoamérica, desde las primeras aldeas del 2000 a.C. hasta las ciudades-estado que encontraron los exploradores europeos en 1517. Los mayas desarrollaron de forma independiente la única escritura completamente funcional de América, el concepto matemático del cero siglos antes que Europa lo adoptara, y un sistema calendárico de una precisión asombrosa para su época. Su período de mayor esplendor —el Clásico Tardío (600-800 d.C.)— produjo ciudades de hasta 100.000 habitantes, arte escultórico sin igual y tablas astronómicas de Venus con un error de apenas 14 segundos al año. Y, lo más importante: los mayas nunca desaparecieron. Más de 6 millones de personas hablan hoy lenguas mayas en México, Guatemala, Belice y Honduras.',

    tablaComparativa: [
      {
        hito: 'El Mirador: La Primera Gran Ciudad Maya',
        periodo: '400 a.C. - 150 d.C.',
        categoria: 'Pre-Clásico Maya',
        personaje: 'Constructores anónimos',
        aportacion:
          'Primera metrópoli americana: 100.000-250.000 hab.; La Danta, una de las pirámides más grandes del mundo por volumen',
      },
      {
        hito: 'El Período Clásico Temprano y Teotihuacán',
        periodo: '250-400',
        categoria: 'Período Clásico',
        personaje: "Siyaj K'ahk' (Búho de Fuego)",
        aportacion:
          'Introducción de la escritura dinástica completa y la cuenta larga; influencia de Teotihuacán en Tikal',
      },
      {
        hito: 'El Apogeo Clásico: Tikal contra Calakmul',
        periodo: '400-750',
        categoria: 'Período Clásico',
        personaje: "Pacal el Grande (615-683) / Jasaw Chan K'awiil",
        aportacion:
          'Máxima expresión artística y política maya; Templo de las Inscripciones; rivalidad hegemónica entre superpotencias',
      },
      {
        hito: 'Escritura Jeroglífica y Astronomía Maya',
        periodo: '250-900',
        categoria: 'Ciencia y Escritura',
        personaje: 'Astrónomos y escribas mayas (anónimos)',
        aportacion:
          'Única escritura completa de América; cero matemático; tablas astronómicas de Venus con error de 14 segundos/año',
      },
      {
        hito: 'Chichén Itzá y el Postclásico Temprano',
        periodo: '900-1200',
        categoria: 'Período Postclásico',
        personaje: 'Linaje Itzá (gobernantes de Chichén)',
        aportacion:
          'Nueva capital política del norte yucateco; El Castillo como reloj solar; mayor juego de pelota de Mesoamérica',
      },
      {
        hito: 'El Popol Vuh y la Cosmovisión Maya',
        periodo: '250-1500',
        categoria: 'Cultura y Religión',
        personaje: 'Escribas quichés anónimos',
        aportacion:
          'El Popol Vuh: cosmogonía, los Héroes Gemelos, la humanidad de maíz; cosmovisión de 13 cielos y 9 inframundos',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Historia',
        perfil:
          'Preparatoria, bachillerato o universidad, prepara examen o trabajo sobre civilizaciones antiguas',
        texto:
          'Usa la Línea del Tiempo para ubicar los cuatro grandes períodos (Pre-Clásico, Clásico, Colapso, Postclásico) y sus fechas clave. La Tab Comparativa te permite filtrar por categorías y construir una visión estructurada ideal para un examen o trabajo. Empieza por El Mirador para entender que la grandeza maya precede siglos al Clásico, y termina con el Colapso para explicar cómo y por qué desaparecieron las grandes ciudades del sur.',
      },
      {
        icono: '✈️',
        titulo: 'Viajero a México o Guatemala',
        perfil:
          'Planea visitar Chichén Itzá, Tikal, Palenque, Copán u otros sitios mayas',
        texto:
          'Antes de tu viaje, haz clic en el hito que corresponde al sitio que vas a visitar: Tikal y Palenque en "El Apogeo Clásico", Chichén Itzá en "El Postclásico Temprano", El Mirador en "La Primera Gran Ciudad Maya". La Tab de Contexto Histórico te da la cronología completa de cada era con los eventos que ocurrieron en ese lugar. Llegarás al sitio sabiendo exactamente qué estás viendo y cuándo se construyó.',
      },
      {
        icono: '🔭',
        titulo: 'Aficionado a la astronomía',
        perfil: 'Le fascinan los logros científicos de civilizaciones antiguas',
        texto:
          'El hito "Escritura Jeroglífica y Astronomía Maya" es el punto de partida. Los mayas calcularon el ciclo sinódico de Venus (584,92 días) con un error de solo 14 segundos al año, sin telescopio y sin álgebra europea. El Códice de Dresde contiene tablas de predicción de eclipses que siguen siendo precisas. El Castillo de Chichén Itzá es un reloj solar que marca los equinoccios con el efecto de la serpiente descendiendo por las escalinatas. Usa la Tab Comparativa filtrando por "Ciencia y Escritura" para ver todos sus logros en contexto.',
      },
      {
        icono: '📚',
        titulo: 'Curioso por la diversidad cultural',
        perfil:
          'Quiere entender por qué los mayas son únicos en la historia humana',
        texto:
          'Los mayas son la única civilización que desarrolló una escritura completamente funcional en América, el cero de forma independiente, y un sistema calendárico más preciso que el europeo de la misma época, todo sin contacto con el Viejo Mundo. El hito del Popol Vuh abre la puerta a una cosmovisión radicalmente distinta: el tiempo cíclico, la humanidad hecha de maíz, los 13 cielos y 9 inframundos. La Tab de Contexto Histórico ofrece el cuadro completo de 3.500 años que muestra por qué esta civilización sigue siendo estudiada y admirada hoy.',
      },
    ],

    faq: [
      {
        pregunta: '¿Los mayas desaparecieron?',
        respuesta:
          'No. Más de 6 millones de personas hablan hoy lenguas mayas en México, Guatemala, Belice y Honduras. Lo que ocurrió en el siglo IX fue el abandono de las grandes ciudades del sur —un colapso político y demográfico—, no la extinción del pueblo. Las comunidades mayas sobrevivieron la conquista española del siglo XVI, mantuvieron sus lenguas, tradiciones y parte de su cosmovisión, y siguen siendo una presencia vital en el sureste mexicano y América Central.',
        tip: 'El yucateco, el tzotzil, el quiché y el mam son lenguas mayas con millones de hablantes activos en el siglo XXI.',
      },
      {
        pregunta: '¿Qué es el cero maya y por qué es importante?',
        respuesta:
          'Los mayas desarrollaron de forma independiente el concepto de cero como valor posicional, probablemente antes del siglo IV d.C. Europa adoptó el cero del sistema hindú-árabe mucho más tarde, alrededor del siglo XII. El cero maya se representaba con una concha o un glifo ovoide y era esencial para su sistema vigesimal (base 20) y para los cálculos astronómicos. Sin el cero, la Cuenta Larga y las tablas de Venus del Códice de Dresde habrían sido imposibles.',
        tip: 'El sistema maya era vigesimal (base 20), posiblemente porque contaban con los 20 dedos de manos y pies.',
      },
      {
        pregunta: '¿Por qué colapsaron las ciudades mayas en el siglo IX?',
        respuesta:
          'No hay una causa única: fue un colapso sistémico en cascada. Las evidencias apuntan a sequías prolongadas documentadas en sedimentos de lagos y cuevas de la región, deforestación masiva que agotó los suelos agrícolas, guerras endémicas entre ciudades-estado que destruyeron redes de comercio e intercambio, y la desintegración del sistema político basado en reyes divinos. Ciudades como Tikal, Copán y Palenque dejaron de erigir monumentos en un lapso de pocas décadas entre el 799 y el 869 d.C.',
        tip: 'La misma combinación de sequías, deforestación y guerras que acabó con El Mirador en el 150 d.C. se repitió 700 años después en el Clásico.',
      },
      {
        pregunta: '¿Cuál es el significado del Popol Vuh?',
        respuesta:
          'El Popol Vuh es el texto sagrado del pueblo quiché de Guatemala y una de las obras literarias más importantes de la humanidad precolombina. Narra la creación del universo, los intentos fallidos de los dioses por crear seres humanos (de barro, luego de madera) hasta lograr la humanidad de maíz, y las aventuras de los Héroes Gemelos Hunahpú e Ixbalanqué en el inframundo Xibalbá. Refleja la cosmovisión maya de un tiempo cíclico, un universo de 13 cielos y 9 inframundos, y el maíz como sustancia sagrada de la vida humana.',
        tip: 'El Popol Vuh fue transcrito al alfabeto latino en el siglo XVI, posiblemente para preservarlo de la destrucción de textos ordenada por los conquistadores.',
      },
      {
        pregunta: '¿Cuándo fue el apogeo de la civilización maya?',
        respuesta:
          'El Período Clásico Tardío (600-800 d.C.) representa la cima de la civilización maya: las ciudades de Tikal, Palenque, Copán y Calakmul alcanzaron su mayor extensión y producción artística. Tikal y Calakmul protagonizaron la "Guerra de los Reinos Serpiente", la mayor rivalidad hegemónica del mundo maya. Pacal el Grande reinó en Palenque de 615 a 683 d.C. y dejó el Templo de las Inscripciones. Simultáneamente, los astrónomos y escribas mayas producían los textos científicos más precisos del mundo precolombino.',
        tip: 'En el siglo VII d.C., Tikal y Calakmul eran rivales con influencia sobre docenas de ciudades, un sistema de alianzas comparable al de los estados europeos medievales.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por El Mirador para sorprenderte',
        cuerpo:
          'Haz clic en "El Mirador: La Primera Gran Ciudad Maya" en la Línea del Tiempo. Muchos visitantes desconocen que una metrópoli de 100.000-250.000 personas existía en el Petén guatemalteco tres siglos antes de nuestra era, con una pirámide más grande por volumen que las de Egipto. Esto cambia la percepción de cuándo comenzó realmente la grandeza maya.',
      },
      {
        titulo: 'Sigue la rivalidad Tikal-Calakmul en el Apogeo Clásico',
        cuerpo:
          'El hito "El Apogeo Clásico: Tikal contra Calakmul" es el corazón político del visualizador. Dos superpotencias, decenas de ciudades-estado aliadas, guerras de captura ritual y una producción artística insuperable. Compara este hito con "El Período Clásico Temprano" para ver cómo evolucionó el sistema político maya en 400 años.',
      },
      {
        titulo: 'Comprende el Colapso como fenómeno sistémico',
        cuerpo:
          'Evita el misterio: el colapso del siglo IX tiene explicaciones claras. Usa la Tab Comparativa filtrando por "Colapso Clásico" y lee las evidencias: sequías, deforestación, guerras, desintegración política. La clave es que no es misterioso sino multicausal. Y recuerda: la civilización continuó en el norte de Yucatán.',
      },
      {
        titulo: 'Filtra por categorías en la Tabla Comparativa',
        cuerpo:
          'En la Tab Comparativa, filtra por "Ciencia y Escritura" para ver el legado intelectual maya concentrado: el único sistema de escritura completo de América, el cero, las tablas astronómicas de Venus. Luego filtra por "Cultura y Religión" para pasar al Popol Vuh y la cosmovisión. El cambio de filtro permite comparar las dimensiones de la civilización.',
      },
      {
        titulo: 'Termina con el Contexto Histórico para el cuadro completo',
        cuerpo:
          'La Tab Contexto muestra las 6 eras apiladas en columna: desde el Pre-Clásico hasta el contacto europeo, 3.500 años en una sola vista. Presta especial atención a la era "El Post-Clásico: Reconfiguración y Resistencia", que desmonta el mito de que los mayas desaparecieron con el Colapso Clásico y muestra la vitalidad de Chichén Itzá, Mayapán y los reinos de Guatemala.',
      },
    ],

    tips: [
      {
        icono: '📅',
        texto:
          'Las fechas negativas son años antes de nuestra era: -2000 significa 2000 a.C. En la línea de tiempo, la barra más a la izquierda es siempre la más antigua. Los hitos "Escritura Jeroglífica" y "El Popol Vuh" tienen rangos muy amplios porque son fenómenos de larga duración, no eventos puntuales.',
      },
      {
        icono: '🗺️',
        texto:
          'El mundo maya se divide en dos zonas principales: las Tierras Bajas del Sur (Petén guatemalteco, Chiapas, Belice, Honduras), donde florecieron las grandes ciudades clásicas que luego colapsaron, y la Península de Yucatán (norte), donde la cultura maya continuó con Chichén Itzá, Uxmal y Mayapán. Esta distinción geográfica es clave para entender por qué el "colapso" solo afectó a parte del mundo maya.',
      },
      {
        icono: '📚',
        texto:
          'Solo sobreviven 4 códices mayas completos o fragmentarios: el de Dresde, el de Madrid, el de París y el Grolier (recientemente autenticado). Miles de manuscritos fueron destruidos por el obispo Diego de Landa en Maní, Yucatán, en julio de 1562 en un auto de fe. Landa mismo redactó décadas después un relato del alfabeto maya que fue clave para el desciframiento moderno.',
      },
      {
        icono: '🌽',
        texto:
          'El maíz no es solo un cultivo para los mayas: según el Popol Vuh, la humanidad fue creada a partir de masa de maíz blanco y amarillo. Esta centralidad cosmológica explica por qué el ciclo agrícola del maíz estructuraba el calendario, los rituales y la identidad cultural maya. El Tzolkín de 260 días se vincula al período de gestación humana y al ciclo del maíz en las tierras altas.',
      },
    ],

    errores: [
      {
        titulo: 'Los mayas vivieron solo en México',
        cuerpo:
          'El mundo maya abarcaba también Guatemala, Belice, Honduras occidental y El Salvador. Las grandes ciudades del Período Clásico —Tikal, El Mirador, Copán— están en Guatemala y Honduras. Chichén Itzá y Uxmal sí están en México (Yucatán), pero son del Postclásico. La confusión es comprensible porque Chichén Itzá es la ciudad maya más visitada, pero no es representativa de toda la historia.',
      },
      {
        titulo: 'El calendario maya predijo el fin del mundo en 2012',
        cuerpo:
          'El 21 de diciembre de 2012 fue el fin de un b\'ak\'tun, un ciclo de 144.000 días (394 años) en la Cuenta Larga maya. Los propios mayas no lo interpretaron como un apocalipsis: varias inscripciones mayas hacen referencia a fechas posteriores al 2012. La idea del "fin del mundo" fue una construcción mediática occidental, no una doctrina maya. Para los mayas, el fin de un ciclo era el inicio del siguiente.',
      },
      {
        titulo: 'El colapso del siglo IX fue un misterio inexplicable',
        cuerpo:
          'Hay evidencias paleoclimáticas sólidas de sequías prolongadas en los siglos VIII-IX en la región (documentadas en espeleotemas de cuevas y sedimentos de lagos). A esto se suma la deforestación por demanda de cal para construcción y agricultura, los conflictos bélicos entre ciudades-estado, y el agotamiento del sistema político de reyes divinos. No es un misterio: es un colapso sistémico bien documentado, aunque multicausal.',
      },
      {
        titulo: 'Los aztecas y los mayas eran el mismo pueblo',
        cuerpo:
          'Son civilizaciones distintas, separadas geográficamente y temporalmente. Los aztecas (mexicas) surgieron en el Altiplano Central mexicano (Valle de México) varios siglos después del apogeo maya, fundando Tenochtitlán hacia 1325. Los mayas son una familia de pueblos de Mesoamérica del sur con lenguas, arquitectura y cosmovisión propias. Aunque hubo contactos e intercambios culturales, nunca formaron parte del mismo estado ni la misma etnia.',
      },
    ],
  },
};
