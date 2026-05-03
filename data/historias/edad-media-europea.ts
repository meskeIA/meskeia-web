import type { HistoriaData } from './types';

export const edadMediaEuropea: HistoriaData = {
  slug: 'edad-media-europea',
  titulo: 'La Edad Media Europea: De la Caída de Roma a Constantinopla',
  subtitulo: 'Mil años de historia europea: reinos bárbaros, Carlomagno, el feudalismo, las catedrales góticas, la Peste Negra y el fin de un mundo',
  descripcionSEO: 'Explora la Edad Media europea (476–1453): la caída de Roma, el Imperio Carolingio, las Cruzadas, la Peste Negra, la Guerra de los Cien Años y la caída de Constantinopla. Cronología interactiva con períodos, personajes y obras icónicas.',
  keywords: [
    'Edad Media',
    'historia medieval',
    'Carlomagno',
    'feudalismo',
    'Peste Negra',
    'Juana de Arco',
    'Constantinopla',
    'caída de Roma',
    'catedrales góticas',
    'cruzadas',
    'Reforma Gregoriana',
    'universidades medievales',
    'reinos bárbaros',
    'Guerra de los Cien Años',
    'Imperio Carolingio',
  ],
  anioInicio: 476,
  anioFin: 1453,

  hitos: [
    {
      id: 'caida-roma-reinos-barbaros',
      nombre: 'La Caída de Roma y los Reinos Bárbaros',
      anioInicio: 476,
      anioFin: 568,
      color: '#8B4513',
      categoria: 'barbaros',
      descripcion:
        'Odoacro depone a Rómulo Augústulo en 476, poniendo fin simbólico al Imperio Romano de Occidente. Surgen los reinos visigodo (con capital en Toledo), franco, ostrogodo y lombardo. Los bárbaros se convierten en herederos y transformadores del legado romano. Boecio escribe la Consolación de la Filosofía en prisión y Casiodoro funda su scriptorium, preservando el saber clásico para la posteridad. El inicio del medievo europeo marca el tránsito de un mundo mediterráneo unificado a una fragmentada Europa de reinos.',
      obraIconica: 'Consolación de la Filosofía (Boecio, 524)',
      paises: ['Italia', 'Francia', 'España', 'Alemania'],
    },
    {
      id: 'imperio-carolingio',
      nombre: 'El Imperio Carolingio: Carlomagno',
      anioInicio: 768,
      anioFin: 843,
      color: '#8B4513',
      categoria: 'barbaros',
      descripcion:
        'Carlos Magno (768–814) unifica los francos y conquista Sajonia, Bavaria, la Marca Hispánica y parte de Italia. El papa León III le corona emperador en Roma el día de Navidad del año 800, resucitando simbólicamente el Imperio. Carlomagno promulga capitulares administrativas, fomenta las escuelas catedralicias y reúne a sabios como Alcuino de York, inaugurando el llamado Renacimiento Carolingio. El Tratado de Verdún de 843 divide el Imperio entre sus tres nietos, trazando los contornos geopolíticos de Francia, Alemania e Italia.',
      obraIconica: 'Coronación imperial de Carlomagno (Roma, 800)',
      paises: ['Francia', 'Alemania', 'Italia', 'Bélgica'],
    },
    {
      id: 'invasiones-siglo-ix',
      nombre: 'Las Invasiones del Siglo IX',
      anioInicio: 800,
      anioFin: 1000,
      color: '#708090',
      categoria: 'feudalismo',
      descripcion:
        'Europa sufre una amenaza múltiple y simultánea: vikingos que navegan del Atlántico al Mediterráneo y fundan Normandía y Kiev, magiares desde las estepas que aterrorizan el centro de Europa hasta ser derrotados en Lechfeld (955) por Otón I, y sarracenos que atacan el Mediterráneo sur. La respuesta política es la descentralización feudal: ante la incapacidad de los reyes de proteger sus dominios, los señores locales construyen castillos y reciben la fidelidad de sus vasallos. El feudalismo nace como sistema de defensa mutua.',
      obraIconica: 'Fundación de Normandía (911, Rollón y Carlos el Simple)',
      paises: ['Francia', 'Alemania', 'Inglaterra', 'Rusia', 'Italia'],
    },
    {
      id: 'ano-mil-romanico',
      nombre: 'El Año Mil y el Románico',
      anioInicio: 980,
      anioFin: 1100,
      color: '#708090',
      categoria: 'feudalismo',
      descripcion:
        'Superado el llamado "terror del año mil", Europa vive una explosión demográfica y agrícola: el collar de caballo, el molino de agua y el arado de vertedera multiplicando la productividad. La deforestación masiva abre nuevas tierras de cultivo. Se construyen iglesias románicas por toda Europa con sus arcos de medio punto y muros gruesos. Las peregrinaciones se popularizan —el Camino de Santiago se convierte en ruta espiritual y económica— y Europa se repuebla y construye. La abadía de Cluny lidera la reforma monástica.',
      obraIconica: 'Catedral de Santiago de Compostela (1075–1211)',
      paises: ['España', 'Francia', 'Italia', 'Alemania', 'Inglaterra'],
    },
    {
      id: 'papado-reforma-gregoriana',
      nombre: 'El Papado en su Apogeo: Reforma Gregoriana',
      anioInicio: 1050,
      anioFin: 1200,
      color: '#4B0082',
      categoria: 'iglesia',
      descripcion:
        'Gregorio VII (1073–1085) lanza la Reforma Gregoriana: los papas deben controlar los nombramientos eclesiásticos frente a los emperadores. La Querella de las Investiduras enfrenta al papado con el Sacro Imperio. El episodio de Enrique IV humillado en Canossa (1077) simboliza la victoria temporal del papado. Inocencio III (1198–1216) lleva el poder papal a su cénit. Las Cruzadas (desde 1096) son el brazo militar de la Iglesia. Las órdenes mendicantes —franciscanos y dominicos— refuerzan la presencia clerical en las ciudades del siglo XIII.',
      obraIconica: 'Penitencia de Enrique IV en Canossa (1077)',
      paises: ['Italia', 'Alemania', 'Francia', 'Tierra Santa'],
    },
    {
      id: 'gotico-universidades',
      nombre: 'El Gótico y las Universidades',
      anioInicio: 1140,
      anioFin: 1300,
      color: '#1E3A5F',
      categoria: 'gotico',
      descripcion:
        'El abad Suger de Saint-Denis impulsa el estilo gótico con sus arcos apuntados, arbotantes y vidrieras que inundan los templos de luz. Notre-Dame de París (iniciada en 1163) se convierte en el símbolo de la nueva arquitectura. Las catedrales son "biblias de piedra" para un pueblo analfabeto. Paralelamente surgen las primeras universidades: Bolonia (1088) para derecho, París (c. 1150) para teología y filosofía. La escolástica —Alberto Magno, Tomás de Aquino— fusiona el aristotelismo recuperado (vía los árabes) con la teología cristiana.',
      obraIconica: 'Catedral de Notre-Dame de París (iniciada en 1163)',
      paises: ['Francia', 'Italia', 'Inglaterra', 'Alemania'],
    },
    {
      id: 'guerra-cien-anos-peste-negra',
      nombre: 'La Guerra de los Cien Años y la Peste Negra',
      anioInicio: 1337,
      anioFin: 1400,
      color: '#DC143C',
      categoria: 'crisis',
      descripcion:
        'Eduardo III de Inglaterra reclama la corona de Francia en 1337, iniciando un conflicto que durará más de un siglo. Las batallas de Crécy (1346) y Poitiers (1356) humillan a la caballería francesa. En 1347 la Peste Negra llega a Sicilia desde el mar Negro y en cinco años mata entre el 30 % y el 60 % de la población europea. Los flagelantes recorren las ciudades castigándose y los pogromos contra los judíos se multiplican. La Jacquerie (1358) es la gran revuelta campesina francesa. El papado se traslada a Aviñón (1309–1377), dependiente del rey de Francia.',
      obraIconica: 'El Triunfo de la Muerte (Pieter Bruegel el Viejo, inspirado en la época)',
      paises: ['Francia', 'Inglaterra', 'Italia', 'Alemania', 'España'],
    },
    {
      id: 'juana-de-arco-fin-guerra',
      nombre: 'Juana de Arco y el Fin de la Guerra',
      anioInicio: 1400,
      anioFin: 1453,
      color: '#DC143C',
      categoria: 'crisis',
      descripcion:
        'Enrique V de Inglaterra aplasta a los franceses en Agincourt (1415) y se convierte en heredero al trono de Francia. Juana de Arco, una joven campesina de Domrémy que afirma recibir voces divinas, levanta el sitio de Orléans (1429) y conduce al delfín a Reims para su coronación como Carlos VII. Capturada por los borgoñones, es vendida a los ingleses y quemada en Rúan (1431). Sin embargo, la marea ha cambiado: Francia expulsa a los ingleses y la victoria definitiva en 1453 consolida el reino y sienta las bases del nacionalismo francés.',
      obraIconica: 'Juana de Arco en el sitio de Orléans (1429)',
      paises: ['Francia', 'Inglaterra'],
    },
    {
      id: 'sacro-imperio-reinos-norte',
      nombre: 'El Sacro Imperio y los Reinos del Norte',
      anioInicio: 1200,
      anioFin: 1450,
      color: '#4B0082',
      categoria: 'iglesia',
      descripcion:
        'Federico II Hohenstaufen (1194–1250), el "Stupor Mundi", gobierna el Sacro Imperio desde Sicilia y choca constantemente con el papado. La Bula de Oro de 1356 fija el sistema de príncipes electores que elegirán al emperador. En el norte, la Liga Hanseática —red comercial de ciudades alemanas del Báltico y el Mar del Norte— domina el comercio europeo durante dos siglos. En Inglaterra, la Guerra de las Dos Rosas (1455–1485) enfrenta a York y Lancaster por la corona. En la Península Ibérica, Castilla, Aragón, Portugal y Navarra consolidan sus reinos mediante guerras y matrimonios dinásticos.',
      obraIconica: 'Bula de Oro (Carlos IV, 1356)',
      paises: ['Alemania', 'Italia', 'Inglaterra', 'España', 'Portugal'],
    },
    {
      id: 'caida-constantinopla',
      nombre: 'La Caída de Constantinopla',
      anioInicio: 1453,
      anioFin: 1453,
      color: '#DAA520',
      categoria: 'ocaso',
      descripcion:
        'El 29 de mayo de 1453, el sultán otomano Mehmed II conquista Constantinopla tras un asedio de 53 días usando cañones gigantes fundidos por el ingeniero Urbano. El último emperador, Constantino XI Paleólogo, muere combatiendo en las murallas. Más de mil años del Imperio Romano de Oriente llegan a su fin. Los eruditos griegos que huyen con sus manuscritos hacia Italia contribuyen al florecimiento del humanismo renacentista. La noticia sacude toda Europa y marca convencionalmente el fin de la Edad Media.',
      obraIconica: 'Toma de Constantinopla por Mehmed II (29 mayo 1453)',
      paises: ['Turquía', 'Grecia', 'Italia'],
    },
  ],

  eras: [
    {
      nombre: 'El Legado de Roma: Reinos Bárbaros y Carolingios',
      desde: 476,
      hasta: 900,
      icono: '🏰',
      hitosDestacados: [
        'La Caída de Roma y los Reinos Bárbaros',
        'El Imperio Carolingio: Carlomagno',
      ],
      eventos: [
        'Odoacro depone a Rómulo Augústulo (476)',
        'Reino visigodo de Toledo: conversión de Recaredo al catolicismo (589)',
        'San Benito de Nursia funda Montecasino y redacta su Regla monástica (529)',
        'Gregorio Magno reorganiza la Iglesia romana y evangeliza a los anglosajones (590–604)',
        'Carlomagno corona emperador por el papa León III en Roma (800)',
        'Renacimiento Carolingio: Alcuino de York y las escuelas palatinas',
        'Tratado de Verdún divide el Imperio en tres reinos (843)',
        'Vikingos saquean Lindisfarne, primer gran ataque a las costas británicas (793)',
      ],
    },
    {
      nombre: 'Las Invasiones y el Feudalismo',
      desde: 800,
      hasta: 1000,
      icono: '⚔️',
      hitosDestacados: [
        'Las Invasiones del Siglo IX',
      ],
      eventos: [
        'Vikingos fundan Dublín (841) y navegan hasta el Mediterráneo',
        'Rollón obtiene Normandía del rey carolingio Carlos el Simple (911)',
        'Magiares devastan Europa central hasta Lechfeld: Otón I los derrota (955)',
        'Sarracenos saquean Roma y Mont-Cassino (846)',
        'El feudalismo consolida la jerarquía vasallática: señor, vasallo, siervo',
        'Otón I es coronado Sacro Emperador Romano (962)',
        'El islam avanza en Sicilia y en el sur de Italia',
        'Se construyen los primeros castillos de piedra como respuesta defensiva',
      ],
    },
    {
      nombre: 'El Románico y el Papado Triunfante',
      desde: 1000,
      hasta: 1200,
      icono: '✝️',
      hitosDestacados: [
        'El Año Mil y el Románico',
        'El Papado en su Apogeo: Reforma Gregoriana',
      ],
      eventos: [
        'Reforma cluniacense: la abadía de Cluny lidera la renovación monástica',
        'El Camino de Santiago se convierte en la gran ruta de peregrinación europea',
        'Cisma de Oriente y Occidente: Roma y Constantinopla se separan (1054)',
        'Guillermo el Conquistador invade Inglaterra y gana en Hastings (1066)',
        'Primera Cruzada: Godofredo de Bouillón toma Jerusalén (1099)',
        'Enrique IV humillado ante Gregorio VII en Canossa (1077)',
        'Concordato de Worms resuelve la Querella de las Investiduras (1122)',
        'Bernardo de Claraval predica la Segunda Cruzada y funda el Císter',
      ],
    },
    {
      nombre: 'El Gótico y la Escolástica',
      desde: 1140,
      hasta: 1300,
      icono: '🏛️',
      hitosDestacados: [
        'El Gótico y las Universidades',
        'El Sacro Imperio y los Reinos del Norte',
      ],
      eventos: [
        'Abad Suger reconstruye Saint-Denis con el nuevo estilo gótico (1140–1144)',
        'Inicio de Notre-Dame de París (1163)',
        'Universidad de París obtiene su carta fundacional (c. 1200)',
        'Francisco de Asís funda la orden mendicante franciscana (1209)',
        'Carta Magna: los barones ingleses limitan el poder del rey Juan (1215)',
        'Tomás de Aquino escribe la Suma Teológica (1265–1274)',
        'Marco Polo viaja a China y escribe El libro de las maravillas (1271–1295)',
        'Federico II Hohenstaufen, el Stupor Mundi, gobierna desde Palermo',
      ],
    },
    {
      nombre: 'La Gran Crisis del Siglo XIV',
      desde: 1300,
      hasta: 1400,
      icono: '☠️',
      hitosDestacados: [
        'La Guerra de los Cien Años y la Peste Negra',
      ],
      eventos: [
        'El papado se traslada a Aviñón, dependiente del rey de Francia (1309)',
        'Eduardo III reivindica la corona de Francia, inicia la Guerra de los Cien Años (1337)',
        'La Peste Negra llega a Sicilia desde el mar Negro (1347)',
        'Batalla de Crécy: los arcos largos galeses humillan a la caballería francesa (1346)',
        'La Jacquerie: gran revuelta campesina en Francia (1358)',
        'Cisma de Occidente: dos papas simultáneos en Roma y Aviñón (1378–1417)',
        'Guillermo de Occam y el nominalismo rompen con la escolástica tomista',
        'Dante Alighieri escribe la Divina Comedia (1308–1320)',
      ],
    },
    {
      nombre: 'El Ocaso Medieval',
      desde: 1400,
      hasta: 1453,
      icono: '🌅',
      hitosDestacados: [
        'Juana de Arco y el Fin de la Guerra',
        'La Caída de Constantinopla',
      ],
      eventos: [
        'Jan Hus quemado en el Concilio de Constanza: precursor de la Reforma (1415)',
        'Enrique V aplasta a los franceses en Agincourt (1415)',
        'Juana de Arco levanta el sitio de Orléans y conduce a Carlos VII a Reims (1429)',
        'Juana de Arco quemada en Rúan por los ingleses (1431)',
        'Concilio de Florencia: efímera unión entre Roma y Constantinopla (1439)',
        'Gutenberg inventa la imprenta de tipos móviles (c. 1440)',
        'Mehmed II conquista Constantinopla: fin del Imperio Romano de Oriente (1453)',
        'Los eruditos griegos huyen a Italia con manuscritos y alimentan el humanismo renacentista',
      ],
    },
  ],

  categorias: {
    barbaros: 'Reinos Bárbaros y Carolingios',
    feudalismo: 'Feudalismo y Sociedad',
    iglesia: 'Iglesia y Papado',
    gotico: 'Gótico y Cultura',
    crisis: 'Crisis y Guerras',
    ocaso: 'Ocaso Medieval',
  },

  colores: {
    barbaros: '#8B4513',
    feudalismo: '#708090',
    iglesia: '#4B0082',
    gotico: '#1E3A5F',
    crisis: '#DC143C',
    ocaso: '#DAA520',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'La Edad Media europea (476–1453) abarca casi mil años de historia que configuraron la civilización occidental. Lejos de ser una época oscura y estancada —como la llamaron despectivamente los humanistas del Renacimiento—, fue un período de profunda transformación: surgieron los estados nacionales, las universidades, las catedrales góticas, el derecho canónico y la escolástica. El feudalismo organizó la sociedad en torno a la tierra y la lealtad personal; la Iglesia actuó como poder supranacional que unificaba a pueblos de diferentes lenguas; las ciudades medievales crecieron como centros de artesanía, comercio y cultura. Las catástrofes del siglo XIV —la Peste Negra, las guerras, el Cisma— prepararon paradójicamente el terreno para el Renacimiento.',

    tablaComparativa: [
      {
        hito: 'La Caída de Roma y los Reinos Bárbaros',
        periodo: '476–568',
        categoria: 'Reinos Bárbaros y Carolingios',
        personaje: 'Odoacro / Boecio',
        aportacion: 'Fin del Imperio romano de Occidente; preservación del saber clásico en los scriptoria',
      },
      {
        hito: 'El Imperio Carolingio: Carlomagno',
        periodo: '768–843',
        categoria: 'Reinos Bárbaros y Carolingios',
        personaje: 'Carlomagno / Alcuino de York',
        aportacion: 'Primera unificación de Europa occidental; renacimiento cultural carolingio; trazado de las fronteras de Francia, Alemania e Italia',
      },
      {
        hito: 'Las Invasiones del Siglo IX',
        periodo: '800–1000',
        categoria: 'Feudalismo y Sociedad',
        personaje: 'Rollón de Normandía / Otón I',
        aportacion: 'Nacimiento del feudalismo como sistema de defensa descentralizada; expansión vikinga hasta Kiev y el Mediterráneo',
      },
      {
        hito: 'El Año Mil y el Románico',
        periodo: '980–1100',
        categoria: 'Feudalismo y Sociedad',
        personaje: 'Abad de Cluny',
        aportacion: 'Explosión demográfica y agrícola; arquitectura románica; consolidación de la peregrinación jacobea',
      },
      {
        hito: 'El Papado en su Apogeo: Reforma Gregoriana',
        periodo: '1050–1200',
        categoria: 'Iglesia y Papado',
        personaje: 'Gregorio VII / Inocencio III',
        aportacion: 'Supremacía papal sobre el poder temporal; Cruzadas; control de los nombramientos eclesiásticos',
      },
      {
        hito: 'La Caída de Constantinopla',
        periodo: '1453',
        categoria: 'Ocaso Medieval',
        personaje: 'Mehmed II / Constantino XI',
        aportacion: 'Fin del Imperio Romano de Oriente; difusión de los manuscritos griegos en Italia; inicio convencional del Renacimiento',
      },
    ],

    escenarios: [
      {
        icono: '🏰',
        titulo: 'El señor feudal en su castillo',
        perfil: 'Noble medieval del siglo X',
        texto:
          'Imagina que eres un barón de la Francia carolingia en torno al año 900. Los vikingos han saqueado tu comarca dos veces este siglo. El rey es demasiado lejano para protegerte. Así que construyes un castillo de madera sobre una colina, rodeas de muralla tu aldea y pides la lealtad de los campesinos a cambio de protección y tierra. Ellos te deben servicio militar y una parte de su cosecha; tú les debes defensa. Este pacto tácito, repetido miles de veces por toda Europa, da nacimiento al feudalismo: la pirámide de lealtades personales que organizará la sociedad medieval durante cuatro siglos.',
      },
      {
        icono: '✝️',
        titulo: 'El monje copista en el scriptorium',
        perfil: 'Monje benedictino del siglo IX',
        texto:
          'En el scriptorium de Fulda, sentado bajo una lámpara de aceite, copias pacientemente un manuscrito de Cicerón con pluma de ganso. La Regla de San Benito —"ora et labora"— estructura tu día: oración, trabajo manual, lectura. Sin ti y tus compañeros de claustro, no sobrevivirían Virgilio, Tito Livio ni los padres de la Iglesia. Los monasterios son las únicas instituciones capaces de preservar libros en un mundo donde las ciudades han encogido y la alfabetización ha caído casi a cero. El scriptorium es la universidad, la biblioteca y la editorial de la Edad Media.',
      },
      {
        icono: '☠️',
        titulo: 'Superviviente de la Peste Negra',
        perfil: 'Comerciante florentino de 1348',
        texto:
          'Eres un mercader de Florencia. En primavera de 1348, los barcos que llegan del Levante traen una carga mortal: la Yersinia pestis. En pocos meses, la mitad de tu ciudad ha muerto. Los cadáveres se amontonan en las calles porque no hay suficientes covachones para enterrarlos. Los médicos nada pueden hacer. Algunos acusan a los judíos de envenenar los pozos y los pogromos se extienden por Europa. La estructura social se tambalea: los supervivientes reclaman mejores salarios, los siervos huyen de los manors. El mundo que conocías ha muerto con ellos.',
      },
      {
        icono: '🌅',
        titulo: 'Erudito griego en la Florencia de 1453',
        perfil: 'Filósofo bizantino tras la caída de Constantinopla',
        texto:
          'Has escapado de Constantinopla a tiempo, con un baúl de manuscritos griegos: Platón, Aristóteles, los neoplatónicos. Los Médici te abren las puertas de Florencia y te ofrecen una cátedra. En los salones florentinos, tus ideas sobre la academia platónica caen en terreno fértil: hay dinero, hay mecenas, hay curiosidad intelectual. Lo que la caída de tu ciudad ha destruido, esos manuscritos que cruzaste el Mediterráneo para salvar van a construir algo nuevo: el humanismo que llamarán Renacimiento.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se llama "Edad Media" y quién le dio ese nombre?',
        respuesta:
          'El término fue acuñado por los humanistas italianos del siglo XV (especialmente Flavio Biondo) para describir el período "intermedio" entre la grandeza de Grecia y Roma (Antigüedad) y el renacer de esa grandeza que ellos creían estar protagonizando (Renacimiento). Era, pues, un término despectivo que implicaba una larga noche cultural. Los historiadores modernos rechazan esta valoración negativa y reconocen la Edad Media como un período de intensa creatividad y transformación.',
        tip: 'La periodización clásica es 476–1453, pero en la práctica las transiciones fueron graduales: el mundo romano tardío se prolongó en Bizancio y en la Iglesia, y el "Renacimiento" ya germinaba en las universidades medievales.',
      },
      {
        pregunta: '¿Qué fue exactamente el feudalismo?',
        respuesta:
          'El feudalismo fue un sistema político-social basado en lazos de lealtad personal entre señores y vasallos, y en la tenencia de la tierra como pago por servicios militares. Un vasallo recibía un feudo (tierra) de su señor a cambio de jurarle fidelidad y servicio armado. En la base de la pirámide estaban los siervos, que trabajaban la tierra a cambio de protección pero no podían abandonarla libremente. Este sistema respondió a la necesidad de orden y defensa local en un mundo donde el Estado central era débil o inexistente.',
        tip: 'El feudalismo no fue uniforme en toda Europa: fue más fuerte en Francia, Alemania e Inglaterra, y más débil en Italia y la Península Ibérica, donde las ciudades y la Reconquista generaron estructuras diferentes.',
      },
      {
        pregunta: '¿Cuánta gente mató la Peste Negra?',
        respuesta:
          'Las estimaciones modernas sitúan la mortalidad de la Peste Negra (1347–1351) entre el 30 % y el 60 % de la población europea, con picos del 60–70 % en algunas ciudades del Mediterráneo. En términos absolutos, Europa pasó de unos 75 millones de habitantes a 50 millones. No se recuperó demográficamente hasta mediados del siglo XV. Las recurrencias posteriores (1361, 1374, 1400…) siguieron diezmando la población durante décadas. Fue la mayor catástrofe demográfica de la historia europea hasta entonces.',
        tip: 'La Yersinia pestis que causó la Peste Negra fue identificada gracias al análisis de ADN de restos medievales en el siglo XXI. El reservorio animal (roedores) explica por qué la enfermedad regresó en oleadas durante dos siglos.',
      },
      {
        pregunta: '¿Por qué Juana de Arco fue quemada si fue ella quien ganó la guerra?',
        respuesta:
          'Juana fue capturada por los borgoñones —aliados de Inglaterra— en 1430 y vendida a los ingleses por 10.000 libras tornesas. Fue juzgada por un tribunal eclesiástico controlado por obispos collaboracionistas, acusada de herejía y de vestir ropa de hombre. La condena fue política: los ingleses necesitaban deslegitimar la coronación de Carlos VII demostrando que la mujer que la había hecho posible era una hereje. Carlos VII no hizo nada para rescatarla. En 1456, un proceso de rehabilitación la declaró inocente. Fue canonizada en 1920.',
        tip: 'El proceso de rehabilitación de 1456 fue impulsado por el propio Carlos VII, en parte para limpiar su imagen de rey coronado gracias a una hereje.',
      },
      {
        pregunta: '¿Por qué la caída de Constantinopla marca el "fin" de la Edad Media?',
        respuesta:
          'La periodización es convencional y discutida entre los historiadores. Se eligió 1453 porque la caída de Constantinopla es un evento dramático, bien fechado y de enorme repercusión simbólica: puso fin al Imperio Romano de Oriente (heredero ininterrumpido desde Augusto), cerró la ruta terrestre a Asia impulsando la exploración marítima, y difundió el humanismo greco-bizantino por Italia. Pero en muchos sentidos el mundo medieval ya estaba cambiando antes: la imprenta de Gutenberg (c. 1440) y el Renacimiento italiano venían gestándose desde el siglo XIV.',
        tip: 'Otras fechas propuestas para el fin de la Edad Media incluyen 1492 (Descubrimiento de América y fin de la Reconquista), 1517 (inicio de la Reforma protestante) o incluso 1600.',
      },
    ],

    pasos: [
      {
        titulo: '1. Sitúate en el mapa mental: los tres poderes medievales',
        cuerpo:
          'Para entender la Edad Media, identifica los tres poderes en permanente tensión: el rey (poder secular central, a menudo débil), el señor feudal (poder local armado) y el obispo o abad (poder eclesiástico con tierras y hombres). Europa medieval no es un Estado-nación moderno: es un mosaico de lealtades superpuestas donde un duque puede tener más poder que su rey pero menos que el papa. Esta fragmentación explica tanto el feudalismo como las guerras de los Cien Años.',
      },
      {
        titulo: '2. Sigue la cronología en tres bloques',
        cuerpo:
          'Divide mentalmente la Edad Media en tres bloques. Alta Edad Media (476–1000): caos, invasiones, Carlomagno, reconstrucción lenta. Plena Edad Media (1000–1300): explosión demográfica, cruzadas, gótico, escolástica, el papado en su cénit. Baja Edad Media (1300–1453): la gran crisis —Peste Negra, guerras, cisma eclesiástico— y el germen del mundo moderno. Cada bloque tiene un pulso diferente: caída, renacimiento, crisis.',
      },
      {
        titulo: '3. Lee los edificios como documentos históricos',
        cuerpo:
          'La arquitectura medieval es el mejor testigo visual de cada época. El románico (arcos de medio punto, muros gruesos, interior oscuro) refleja una sociedad feudal defensiva y teocéntrica. El gótico (arcos apuntados, arbotantes, vidrieras, altura vertiginosa) habla de una sociedad con excedente económico, técnica sofisticada y ambición de elevar la mirada al cielo. Visitar una catedral románica como Santiago de Compostela y una gótica como Chartres es ver con los ojos dos mundos distintos.',
      },
      {
        titulo: '4. Conecta los personajes con sus contextos',
        cuerpo:
          'Carlomagno no puede entenderse sin el vacío de poder tras la disgregación carolingia; Gregorio VII sin la corrupción del clero que quiso reformar; Tomás de Aquino sin la llegada de Aristóteles vía el árabe; Juana de Arco sin el agotamiento francés de cien años de guerra. La historia medieval tiene más sentido como cadena de causas y efectos que como galería de figuras aisladas. Pregúntate siempre: ¿qué problema resolvía este personaje o este evento?',
      },
      {
        titulo: '5. Distingue el mito de la historia',
        cuerpo:
          'La Edad Media está llena de mitos populares que conviene desmontar: los medievales no creían que la Tierra era plana (lo sabían desde los griegos), la mayoría no vivían en castillos (el 90 % eran campesinos en aldeas de madera), los caballeros no llevaban armaduras de pies a cabeza hasta el siglo XIV, y la Inquisición medieval fue mucho menos mortífera que la del siglo XVI. Separar el mito romántico (Hollywood, novela histórica) de la realidad arqueológica e historiográfica es el primer paso para entender el período.',
      },
    ],

    tips: [
      {
        icono: '📚',
        texto: 'Para sumergirte en la Edad Media, empieza por el Nombre de la Rosa de Umberto Eco: novela policiaca ambientada en 1327 que captura con precisión la vida monástica, el escolasticismo y las tensiones políticas de la Baja Edad Media.',
      },
      {
        icono: '🗺️',
        texto: 'Estudia siempre la Edad Media con un mapa a mano. Las fronteras cambiaban constantemente: el reino de Francia en 1000 era una franja estrecha alrededor de París, no el hexágono actual. Los mapas históricos del National Geographic o del Shepherd\'s Historical Atlas son imprescindibles.',
      },
      {
        icono: '🏛️',
        texto: 'La mejor forma de visualizar el poder de la Iglesia medieval es calcular cuántas catedrales góticas se construyeron en Francia entre 1150 y 1300: más de ochenta, en un siglo y medio, con la tecnología y los recursos de la época. Equivaldría a construir hoy ochenta estaciones espaciales.',
      },
      {
        icono: '⚕️',
        texto: 'La Peste Negra no fue solo una catástrofe demográfica: fue también un motor de cambio social. Con un tercio de la población muerta, los supervivientes negociaron mejores condiciones laborales, los precios de la tierra cayeron, la servidumbre se debilitó y la Iglesia perdió autoridad moral al no poder explicar la catástrofe. La modernidad tiene deudas insospechadas con la epidemia.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la Edad Media fue una época de ignorancia total',
        cuerpo:
          'Los medievales no eran ignorantes: crearon las primeras universidades de Europa (Bolonia, París, Oxford), preservaron el saber clásico grecolatino cuando Occidente estuvo a punto de perderlo, desarrollaron la teología escolástica, la arquitectura gótica, el derecho canónico y la filosofía natural. La imagen de oscuridad proviene del desprecio humanista renacentista, interesado en marcar una ruptura con el pasado para valorizar su propio presente.',
      },
      {
        titulo: 'Confundir el feudalismo con el absolutismo o el esclavismo',
        cuerpo:
          'El feudalismo no es ni esclavitud ni monarquía absoluta. El siervo medieval no era esclavo: tenía derechos consuetudinarios, no podía ser vendido separado de la tierra y en muchos casos podía comprar su libertad. El rey medieval tampoco era absoluto: estaba limitado por las costumbres, el poder feudal de sus barones y la autoridad de la Iglesia. El Absolutismo llegó con el Estado moderno del siglo XVII.',
      },
      {
        titulo: 'Pensar que las Cruzadas fueron solo conquistas militares',
        cuerpo:
          'Las Cruzadas fueron también movimientos de masas populares, rutas de intercambio cultural y comercial, conflictos internos entre poderes europeos y catalizadores de las ciudades italianas (Venecia, Génova). Las Cruzadas pusieron a Europa en contacto con la civilización islámica y bizantina, a través de la cual recuperó buena parte del saber griego perdido, incluyendo la filosofía aristotélica que dominará la escolástica medieval.',
      },
      {
        titulo: 'Asumir que la Edad Media terminó de golpe en 1453',
        cuerpo:
          'Las periodizaciones históricas son herramientas pedagógicas, no muros reales. El "Renacimiento" ya germinaba en las universidades y ciudades italianas del siglo XIV; la "Edad Media" se prolongó en muchas regiones de Europa hasta bien entrado el siglo XVI. La imprenta (c. 1440), el Descubrimiento de América (1492) y la Reforma protestante (1517) son hitos que completan la transición. Pensar en términos de décadas de solapamiento es más preciso que en cortes tajantes.',
      },
    ],
  },
};
