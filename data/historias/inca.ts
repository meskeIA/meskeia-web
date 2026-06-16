import type { HistoriaData } from './types';

export const inca: HistoriaData = {
  slug: 'inca',
  titulo: 'Historia del Imperio Inca: Del Lago Titicaca al Tawantinsuyu',
  subtitulo:
    'El mayor estado precolombino de América: 4.000 kilómetros de cordillera unificada sin escritura, con caminos que superaban a los romanos y una ciudad colgada de los Andes',
  descripcionSEO:
    'Cronología interactiva del Imperio Inca: desde el origen en el Cusco (1200) hasta la caída del Estado Neo-Inca de Vilcabamba (1572). Pachacútec y la fundación del Tawantinsuyu, Machu Picchu, los quipus, la red de caminos y la captura de Atahualpa en 10 hitos y 6 eras.',
  keywords: [
    'historia imperio inca cronología',
    'tawantinsuyu pachacutec inca cusco',
    'machu picchu arquitectura inca',
    'qhapaq ñan caminos incas quipus',
    'conquista peru pizarro atahualpa cajamarca',
    'vilcabamba resistencia inca tupac amaru',
    'civilizacion precolombina america del sur',
    'cultura andina peru bolivia ecuador',
  ],
  anioInicio: 1200,
  anioFin: 1572,

  hitos: [
    {
      id: 'origen-cusco',
      nombre: 'El Origen Legendario y el Primer Inca',
      anioInicio: 1200,
      anioFin: 1400,
      color: '#DAA520',
      categoria: 'origen',
      descripcion:
        'La tradición oral inca narrada a los españoles en el siglo XVI cuenta que el dios Sol (Inti) envió a sus hijos Manco Cápac y Mama Ocllo desde las aguas del lago Titicaca —el lago sagrado de los Andes, a 3.800 metros de altitud— con la misión de enseñar la civilización a los pueblos andinos y fundar la ciudad sagrada del Cusco ("ombligo del mundo" en quechua). Los primeros incas (del siglo XIII al XV) no fueron conquistadores sino organizadores de un territorio con una larga tradición cultural: los Andes habían visto civilizaciones sofisticadas desde Chavín de Huántar (900 a.C.), los Moche, los Nazca, los Wari y los Tiwanaku (Tihuanaco). El Cusco se desarrolló como centro ceremonial y político de un reino de mediana dimensión en el Valle del Urubamba. Los primeros ocho incas son figuras históricas o semilegendarias; la historia documentada y verificable comienza con el octavo inca, Viracocha (c. 1400), y sobre todo con su sucesor Pachacútec, el verdadero fundador del Imperio. La extraordinaria tradición textil andina, los trabajos en cerámica y metal de las culturas preincaicas del área son el sustrato cultural sobre el que se construyó el Tawantinsuyu.',
      obraIconica:
        'Lago Titicaca (Bolivia/Perú) — el lago sagrado de los Andes, lugar mítico del origen de los incas',
      paises: ['Perú', 'Bolivia'],
    },
    {
      id: 'pachacutec-tawantinsuyu',
      nombre: 'Pachacútec y la Fundación del Tawantinsuyu',
      anioInicio: 1438,
      anioFin: 1471,
      color: '#DC143C',
      categoria: 'expansion',
      descripcion:
        'Pachacútec Inca Yupanqui (1438-1471) es el personaje más importante de la historia inca: transformó un reino regional del Cusco en el mayor estado de América precolombina. Su primer acto de gobierno fue en sí mismo legendario: cuando los chankas —pueblo rival— atacaron el Cusco, su padre Viracocha huyó; Pachacútec organizó la defensa y derrotó a los chankas en una batalla que la tradición describió como asistida por piedras que se convertían en guerreros (los pururaucas). Esa victoria le dio la legitimidad para deponer a su padre y asumir el poder. En 33 años de reinado, Pachacútec expandió el Tawantinsuyu hacia el norte (Quito), el sur (Chile central), el este (amazonia) y el oeste (costa peruana). Reorganizó el Estado en sus cuatro suyos (regiones): Chinchaysuyu (norte), Collasuyu (sur), Antisuyu (este), Contisuyu (oeste). Reconstruyó el Cusco como una ciudad monumental, con el Coricancha (Templo del Sol) como centro sagrado. Mandó construir Machu Picchu. Los quipus y los chasquis fueron sistematizados bajo su reinado. Pachacútec es al Tawantinsuyu lo que Alejandro Magno fue al Imperio macedónico o Qin Shi Huang a China.',
      obraIconica:
        'Coricancha (Templo del Sol) en Cusco — el templo más sagrado del Imperio Inca, sobre el que se construyó la iglesia de Santo Domingo',
      paises: ['Perú', 'Bolivia', 'Ecuador', 'Chile'],
    },
    {
      id: 'machu-picchu',
      nombre: 'Machu Picchu: La Ciudad en las Nubes',
      anioInicio: 1450,
      anioFin: 1532,
      color: '#2E8B57',
      categoria: 'arquitectura',
      descripcion:
        'Machu Picchu, construida por orden de Pachacútec hacia 1450 en una cresta montañosa a 2.430 metros sobre el nivel del mar en la Cordillera de los Andes (Perú), es el monumento más visitado de América del Sur y uno de los más extraordinarios del mundo. Su emplazamiento es ya en sí una proeza: entre los picos de Huayna Picchu y Machu Picchu, rodeada por un meandro del río Urubamba 600 metros más abajo, la ciudad parece flotar entre las nubes. La arquitectura inca en Machu Picchu es su rasgo más asombroso: bloques de granito perfectamente encajados sin mortero, con una precisión tal que no cabe una hoja de papel entre ellos. Esta técnica de "piedra encajada" (ashlar inca) hace los muros sísmicamente resilientes: se mueven ligeramente en los terremotos andinos en vez de derrumbarse. El Intihuatana ("lugar donde se amarra el sol") es un reloj solar ritual. El Templo del Sol, con su ventana trapezoidal alineada con el solsticio de junio, y el Cuarto de los Tres Ventanas son joyas de la arquitectura inca. La función exacta de Machu Picchu —¿llacta (ciudad planificada), santuario real, centro administrativo?— sigue siendo debatida. Fue "redescubierta" por el mundo académico por Hiram Bingham en 1911; nunca fue "descubierta" por los españoles.',
      obraIconica:
        'Machu Picchu, Perú — la ciudadela inca a 2.430 m de altitud, patrimonio de la humanidad desde 1983',
      paises: ['Perú'],
    },
    {
      id: 'red-caminos-qhapaq-nan',
      nombre: 'El Qhapaq Ñan: La Red de Caminos del Imperio',
      anioInicio: 1438,
      anioFin: 1532,
      color: '#1E90FF',
      categoria: 'organizacion',
      descripcion:
        'El Qhapaq Ñan ("camino real" en quechua) es una red de más de 30.000 kilómetros de caminos que unificaron el Tawantinsuyu desde la actual Colombia hasta el centro de Chile y el noroeste de Argentina, atravesando desiertos costeros, valles andinos y selva tropical. Fue declarado Patrimonio Mundial de la UNESCO en 2014 por seis países conjuntamente (Perú, Bolivia, Ecuador, Colombia, Chile, Argentina). Los ingenieros incas construyeron puentes colgantes de fibra vegetal sobre los cañones andinos —el más famoso, el puente de Q\'eswachaka sobre el río Apurímac, sigue construyéndose y manteniéndose según la técnica ancestral—. Escaleras talladas en la roca, túneles, aqueductos y depósitos de suministros (tampus) cada 20-25 km completaban la infraestructura. El sistema de chasquis (correos a pie) permitía transmitir mensajes orales desde Cusco hasta Quito (2.000 km) en 5-7 días —una velocidad que el servicio postal español tardó siglos en igualar. Este sistema de comunicación sin escritura era posible gracias a la memoria entrenada de los chasquis y a los quipus: cuerdas de distintos colores y nudos que codificaban información numérica y posiblemente narrativa.',
      obraIconica:
        'Puente de Q\'eswachaka (Cusco) — puente colgante inca de fibra trenzada reconstruido anualmente por la comunidad local',
      paises: ['Perú', 'Bolivia', 'Ecuador', 'Colombia', 'Chile', 'Argentina'],
    },
    {
      id: 'quipus-organizacion',
      nombre: 'Los Quipus y la Administración del Tawantinsuyu',
      anioInicio: 1438,
      anioFin: 1532,
      color: '#9932CC',
      categoria: 'organizacion',
      descripcion:
        'El Tawantinsuyu fue el mayor estado del mundo en su época que funcionó sin escritura alfabética. Su solución fue el quipu (khipu en quechua): un sistema de cuerdas de distintos colores, longitudes y materiales, con nudos de distintos tipos, posiciones y disposiciones. Los quipucamayocs (especialistas en quipus) registraban censos de población, tributos, calendarios agrícolas, inventarios de almacenes y datos militares. El sistema decimal (en base 10) del quipu permitía operaciones matemáticas complejas. Los colores codificaban categorías (tipo de producto, región geográfica, categoría social). Más controvertido es si los quipus también contenían información narrativa: algunos investigadores, como Gary Urton y Marcia y Robert Ascher, argumentan que ciertos quipus podrían codificar historia o rituales mediante convenciones no numéricas, lo que los convertiría en una forma de escritura. El mit\'a era el sistema de trabajo obligatorio del Imperio: cada comunidad debía proporcionar trabajo (no dinero ni tributo en especie directamente) al Estado durante un período del año para la construcción de caminos, edificios y terrazas agrícolas, así como para el ejército. El Estado a cambio proporcionaba comida, vestimenta y herramientas durante el período de trabajo.',
      obraIconica:
        'Quipu del Museo Larco, Lima — el instrumento de registro más sofisticado del mundo sin escritura',
      paises: ['Perú', 'Bolivia', 'Ecuador'],
    },
    {
      id: 'expansion-maxima',
      nombre: 'La Expansión Máxima del Tawantinsuyu',
      anioInicio: 1471,
      anioFin: 1527,
      color: '#DC143C',
      categoria: 'expansion',
      descripcion:
        'Los sucesores de Pachacútec —Túpac Inca Yupanqui (1471-1493) y Huayna Cápac (1493-1527)— completaron la expansión hasta los límites naturales del Imperio. Túpac Inca conquistó el reino Chimú (la gran civilización costera de Chan Chan), expandió el Tawantinsuyu hasta el río Maule en Chile (frontera con los guerreros mapuches, que resistieron la expansión) y lanzó una expedición marítima desde el Perú, posiblemente hasta las Galápagos o las Marquesas. Huayna Cápac extendió el control hacia el norte hasta el actual Ecuador, donde la resistencia de los pueblos caranquis fue especialmente tenaz. En su apogeo, el Tawantinsuyu abarcaba más de 2 millones de km² con una población estimada entre 9 y 16 millones de personas. El Imperio administraba más de 2.000 almacenes de suministros (qollqas) distribuidos a lo largo de la red de caminos, asegurando el abastecimiento del ejército y la redistribución ante hambrunas. Huayna Cápac murió en 1527 de una epidemia desconocida (probablemente viruela llegada con los primeros contactos europeos), antes de ver a ningún europeo en persona. Su muerte sin designar sucesor claro fue el origen de la guerra civil que facilitó la conquista española.',
      obraIconica:
        'Chan Chan (La Libertad, Perú) — la mayor ciudad de adobe del mundo, capital del reino Chimú conquistado por los incas',
      paises: ['Perú', 'Bolivia', 'Ecuador', 'Colombia', 'Chile', 'Argentina'],
    },
    {
      id: 'sociedad-religion-inca',
      nombre: 'La Sociedad Inca y la Religión Solar',
      anioInicio: 1438,
      anioFin: 1532,
      color: '#8B4513',
      categoria: 'cultura',
      descripcion:
        'La sociedad inca era altamente jerarquizada pero con mecanismos de cohesión social notables. En la cúspide, el Sapa Inca ("único inca", el gobernante) era considerado hijo del Sol (Inti), vivo en la tierra. Su consorte principal (la Coya) era típicamente su hermana, para mantener la pureza del linaje solar. Los nobles de Cusco (la "oreja grande" u orejones, por sus adornos auditivos) formaban la élite administrativa. La mita, el trabajo obligatorio para el Estado, era la base del sistema económico: el Estado redistribuía lo producido por el trabajo colectivo mediante los almacenes estatales (qollqas) distribuidos por todo el Imperio. La religión giraba alrededor de Inti, el dios sol, cuya representación en oro (el Punchao) estaba en el Coricancha. El Inti Raymi (Fiesta del Sol), celebrado en el solsticio de junio, era la festividad más importante del calendario inca. Los apus (espíritus de las montañas) y los huacas (lugares y objetos sagrados) formaban una red de sacralidad que integraba el territorio natural con el espiritual. Los sacrificios humanos eran excepcionales (a diferencia de los aztecas); se practicaba principalmente el capacocha, sacrificios de niños en momentos de crisis imperial o muerte del Sapa Inca.',
      obraIconica:
        'Inti Raymi en Sacsayhuamán, Cusco — recreación del festival del sol inca, celebrado cada año en el solsticio de junio',
      paises: ['Perú', 'Bolivia', 'Ecuador'],
    },
    {
      id: 'guerra-civil-inca',
      nombre: 'La Guerra Civil entre Huáscar y Atahualpa',
      anioInicio: 1527,
      anioFin: 1532,
      color: '#708090',
      categoria: 'caida',
      descripcion:
        'La muerte de Huayna Cápac en 1527 sin designar formalmente su sucesor desencadenó una guerra civil devastadora entre sus dos hijos principales: Huáscar (desde Cusco, sur) y Atahualpa (desde Quito, norte). La guerra duró cinco años y fue extraordinariamente destructiva: destruyó infraestructuras, agotó los almacenes y desangró al ejército inca. Las epidemias que precedieron a la llegada española —viruela y posiblemente sarampión, transmitidas a través de redes comerciales indígenas antes de la llegada física de los europeos— ya habían matado a una fracción significativa de la población, incluido el propio Huayna Cápac. Los generales de Atahualpa (Quizquiz y Chalcuchimac) finalmente derrotaron al ejército de Huáscar en la batalla de Quipaipan (1532) y capturaron y ejecutaron a Huáscar. Atahualpa, victorioso, se encontraba en Cajamarca (norte del Perú) descansando con su ejército cuando Francisco Pizarro llegó con sus 168 hombres. El Tawantinsuyu, devastado por la guerra civil y las epidemias, era un gigante debilitado cuando se produjo el encuentro en Cajamarca.',
      obraIconica:
        'Torreón de Sacsayhuamán (Cusco) — fortaleza inca construida con bloques de hasta 125 toneladas sin mortero',
      paises: ['Perú', 'Ecuador', 'Bolivia'],
    },
    {
      id: 'captura-atahualpa',
      nombre: 'La Captura de Atahualpa en Cajamarca',
      anioInicio: 1532,
      anioFin: 1535,
      color: '#4B0082',
      categoria: 'caida',
      descripcion:
        'El 16 de noviembre de 1532, en la plaza de Cajamarca (norte del Perú), Francisco Pizarro tendió una emboscada a Atahualpa, Sapa Inca del Tawantinsuyu. El inca se presentó en la plaza con unos 6.000-8.000 acompañantes sin armas como señal de paz. Pizarro había apostado sus 168 hombres (con armas de fuego, cañones y caballos) ocultos en los edificios del perímetro. El fraile Vicente de Valverde se acercó a Atahualpa con una Biblia y le habló a través de intérprete de la fe cristiana. Según la crónica española, Atahualpa tomó la Biblia, la llevó a su oído (no sabía leer), no escuchó nada, la lanzó al suelo. Valverde declaró que los indios rechazaban la fe cristiana y Pizarro ordenó el ataque. En pocas horas, los 168 españoles mataron a miles de incas desarmados (las crónicas dan cifras de 2.000 a 6.000 muertos) sin perder un solo hombre. Atahualpa fue capturado vivo. Ofreció a Pizarro llenar un cuarto de 6x5 metros hasta donde llegara el brazo extendido de oro, y dos cuartos más de plata, a cambio de su libertad. El rescate se cumplió; sin embargo, Pizarro ejecutó a Atahualpa en 1533 bajo cargos fabricados. La captura de Cajamarca es el evento pivote de la conquista del Perú.',
      obraIconica:
        'Cuarto del Rescate en Cajamarca — la habitación donde Atahualpa prometió llenar de oro a cambio de su libertad',
      paises: ['Perú'],
    },
    {
      id: 'resistencia-vilcabamba',
      nombre: 'El Estado Neo-Inca de Vilcabamba',
      anioInicio: 1536,
      anioFin: 1572,
      color: '#228B22',
      categoria: 'resistencia',
      descripcion:
        'La resistencia inca a la conquista española no terminó con la captura de Atahualpa en 1532. Manco Inca, otro hijo de Huayna Cápac, fue inicialmente apoyado por los españoles como gobernante títere, pero en 1536 se rebeló y organizó el Gran Cerco del Cusco: un ejército inca de más de 100.000 guerreros sitió el Cusco y Lima simultáneamente durante meses. El cerco falló en parte por las cargas de caballería española (los caballos seguían siendo un arma psicológica y táctica devastadora en campo abierto) y por la intervención de aliados indígenas de los conquistadores. Manco Inca se retiró a la selva, en la región inaccesible de Vilcabamba, donde estableció un Estado Neo-Inca que sobrevivió durante 36 años más (1536-1572). Desde Vilcabamba, los incas resistentes realizaron incursiones y mantuvieron la soberanía sobre un territorio de montaña. El último Sapa Inca, Túpac Amaru I, fue capturado por el virrey Francisco de Toledo en 1572 y ejecutado públicamente en el Cusco. La ejecución de Túpac Amaru I fue un traumático fin de la resistencia organizada; pero su nombre fue recuperado dos siglos después por el gran líder rebelde José Gabriel Condorcanqui (Túpac Amaru II, 1780-1781) en la mayor rebelión andina de la era colonial.',
      obraIconica:
        'Ollantaytambo (Cusco) — fortaleza inca donde Manco Inca derrotó a Hernando Pizarro en 1537, la mayor victoria indígena de la conquista',
      paises: ['Perú', 'Bolivia'],
    },
  ],

  eras: [
    {
      nombre: 'Los Orígenes Andinos y el Primer Cusco',
      desde: 1200,
      hasta: 1438,
      icono: '🌊',
      hitosDestacados: ['El Origen Legendario y el Primer Inca'],
      eventos: [
        'Manco Cápac y Mama Ocllo: la leyenda del lago Titicaca y la fundación del Cusco',
        'El Coricancha: el primer gran templo del Sol en Cusco',
        'Los 8 primeros incas: reyes del pequeño reino del Cusco',
        'La tradición textil y cerámica andina: sustrato de la cultura inca',
        'El ataque chanka al Cusco (c. 1438): la crisis que dio poder a Pachacútec',
        'Viracocha (octavo inca): primer gobernante histórico verificable',
      ],
    },
    {
      nombre: 'Pachacútec y la Creación del Tawantinsuyu',
      desde: 1438,
      hasta: 1471,
      icono: '🏔️',
      hitosDestacados: [
        'Pachacútec y la Fundación del Tawantinsuyu',
        'Machu Picchu: La Ciudad en las Nubes',
      ],
      eventos: [
        'Victoria de Pachacútec sobre los chankas: legitimidad para fundar el Imperio',
        'División del Imperio en 4 suyos (regiones del mundo): el Tawantinsuyu',
        'Reconstrucción del Cusco como capital imperial monumental',
        'Construcción de Machu Picchu (c. 1450): la ciudad sagrada en los Andes',
        'Sistematización del Qhapaq Ñan y los tampus',
        'Los quipus como sistema de administración centralizado',
      ],
    },
    {
      nombre: 'El Imperio en Expansión',
      desde: 1471,
      hasta: 1527,
      icono: '⭐',
      hitosDestacados: [
        'El Qhapaq Ñan: La Red de Caminos del Imperio',
        'Los Quipus y la Administración del Tawantinsuyu',
        'La Expansión Máxima del Tawantinsuyu',
      ],
      eventos: [
        'Túpac Inca conquista el reino Chimú: Chan Chan y la costa norte de Perú',
        'El Tawantinsuyu alcanza 2 millones de km²: 9-16 millones de habitantes',
        'Los chasquis: mensajes de Cusco a Quito en 5-7 días',
        'Los qollqas (almacenes): red de redistribución ante hambrunas y guerras',
        'Huayna Cápac lleva el Imperio hasta Ecuador y la frontera con los mapuches en Chile',
        'Muerte de Huayna Cápac (1527): probable viruela, sin sucesor designado',
      ],
    },
    {
      nombre: 'La Sociedad y el Pensamiento Inca',
      desde: 1471,
      hasta: 1527,
      icono: '☀️',
      hitosDestacados: ['La Sociedad Inca y la Religión Solar'],
      eventos: [
        'El Sapa Inca como hijo del Sol: el sistema de legitimidad divina',
        'El Inti Raymi (Fiesta del Sol) en el solsticio de junio: la celebración más importante',
        'El mit\'a: trabajo obligatorio para el Estado a cambio de redistribución',
        'Los apus: espíritus de las montañas como entidades sagradas del territorio',
        'La capacocha: sacrificios de niños en momentos de crisis o muerte del Sapa Inca',
        'La cerámica inca (aríbalo, platos ornitomorfos) y los textiles de cumbi: artesanías de alta calidad',
      ],
    },
    {
      nombre: 'La Crisis: Guerra Civil y Epidemias',
      desde: 1527,
      hasta: 1535,
      icono: '🌙',
      hitosDestacados: [
        'La Guerra Civil entre Huáscar y Atahualpa',
        'La Captura de Atahualpa en Cajamarca',
      ],
      eventos: [
        'La guerra civil entre Huáscar y Atahualpa devasta el Imperio (1527-1532)',
        'Las epidemias europeas llegan antes que los propios europeos, matando a millones',
        'Batalla de Quipaipan (1532): victoria final de Atahualpa sobre Huáscar',
        'Pizarro llega a Cajamarca con 168 hombres (noviembre 1532)',
        'La emboscada de Cajamarca: captura de Atahualpa sin perder un español',
        'Ejecución de Atahualpa (1533): fin simbólico del Tawantinsuyu',
      ],
    },
    {
      nombre: 'La Resistencia: El Estado Neo-Inca de Vilcabamba',
      desde: 1535,
      hasta: 1572,
      icono: '🌅',
      hitosDestacados: ['El Estado Neo-Inca de Vilcabamba'],
      eventos: [
        'Manco Inca: el gobernante títere que se convierte en líder de la resistencia (1536)',
        'El Gran Cerco del Cusco: 100.000 guerreros incas sitian la capital (1536)',
        'Victoria inca en Ollantaytambo: la mayor derrota española de la conquista andina',
        'Retirada a Vilcabamba: el Estado neo-inca en las montañas selváticas',
        '36 años de resistencia desde Vilcabamba: cuatro Sapa Incas en el exilio',
        'Captura y ejecución de Túpac Amaru I: fin de la resistencia organizada inca (1572)',
      ],
    },
  ],

  categorias: {
    origen: 'Orígenes Andinos',
    expansion: 'Expansión Imperial',
    arquitectura: 'Arquitectura Inca',
    organizacion: 'Organización y Tecnología',
    cultura: 'Sociedad y Religión',
    caida: 'La Caída del Imperio',
    resistencia: 'La Resistencia',
  },

  colores: {
    origen: '#DAA520',
    expansion: '#DC143C',
    arquitectura: '#2E8B57',
    organizacion: '#1E90FF',
    cultura: '#8B4513',
    caida: '#4B0082',
    resistencia: '#228B22',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'El Imperio Inca —el Tawantinsuyu o "las cuatro regiones del mundo"— fue el mayor estado de América precolombina. En menos de un siglo, desde Pachacútec (1438) hasta la conquista española (1532), construyó una red de 30.000 kilómetros de caminos, administró 2 millones de km² sin escritura alfabética, y levantó Machu Picchu en una cresta andina a 2.430 metros sin mortero ni rueda. Los quipus —cuerdas con nudos que codificaban información decimal— permitieron gobernar un Imperio de 9 a 16 millones de personas desde el Cusco. La mita, el sistema de trabajo comunitario obligatorio para el Estado, era la columna vertebral de la cohesión social: cada familia aportaba trabajo y el Estado redistribuía recursos. La conquista española no borró la cultura andina: el quechua sigue siendo hablado por más de 10 millones de personas en seis países, el Camino Inca continúa siendo transitado, y el nombre Túpac Amaru resonó de nuevo en la gran rebelión de 1780. El legado inca permanece vivo en los Andes del siglo XXI.',

    tablaComparativa: [
      {
        hito: 'El Origen Legendario y el Primer Inca',
        periodo: '1200-1438',
        categoria: 'Orígenes Andinos',
        personaje: 'Manco Cápac (mítico) / Viracocha (histórico)',
        aportacion:
          'Formación del reino del Cusco sobre una tradición cultural andina de 2.000 años',
      },
      {
        hito: 'Pachacútec y la Fundación del Tawantinsuyu',
        periodo: '1438-1471',
        categoria: 'Expansión Imperial',
        personaje: 'Pachacútec Inca Yupanqui',
        aportacion:
          'Creación del mayor estado de América precolombina en 33 años de reinado',
      },
      {
        hito: 'Machu Picchu: La Ciudad en las Nubes',
        periodo: '1450-1532',
        categoria: 'Arquitectura Inca',
        personaje: 'Arquitectos e ingenieros de Pachacútec',
        aportacion:
          'La mayor proeza de ingeniería andina: muros sin mortero que resisten terremotos a 2.430 m de altitud',
      },
      {
        hito: 'El Qhapaq Ñan: La Red de Caminos del Imperio',
        periodo: '1438-1532',
        categoria: 'Organización y Tecnología',
        personaje: 'Ingenieros y constructores incas',
        aportacion:
          '30.000 km de caminos en 6 países actuales; puentes colgantes; chasquis a 400 km/día',
      },
      {
        hito: 'Los Quipus y la Administración del Tawantinsuyu',
        periodo: '1438-1532',
        categoria: 'Organización y Tecnología',
        personaje: 'Quipucamayocs (especialistas en quipus)',
        aportacion:
          'Administración de 2 millones de km² sin escritura; sistema decimal de cuerdas y nudos',
      },
      {
        hito: 'El Estado Neo-Inca de Vilcabamba',
        periodo: '1536-1572',
        categoria: 'La Resistencia',
        personaje: 'Manco Inca / Túpac Amaru I',
        aportacion:
          '36 años de resistencia organizada; el nombre Túpac Amaru resurge con la gran rebelión de 1780',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Historia',
        perfil: 'Estudia civilizaciones precolombinas o la conquista de América',
        texto:
          'Esta cronología ofrece la visión completa del Imperio Inca desde sus orígenes hasta la resistencia final. Útil para contextualizar la conquista española en el estado real del Tawantinsuyu: debilitado por epidemias y guerra civil, no en pleno apogeo.',
      },
      {
        icono: '🥾',
        titulo: 'Viajero al Perú',
        perfil: 'Planea visitar Machu Picchu, Cusco, el Camino Inca o el Lago Titicaca',
        texto:
          'Cada lugar que vas a visitar tiene un contexto histórico preciso en esta línea del tiempo. El Coricancha, Sacsayhuamán, Machu Picchu, Ollantaytambo y el Qhapaq Ñan cobran otro significado cuando sabes quién los construyó y por qué.',
      },
      {
        icono: '🔬',
        titulo: 'Curioso por la ingeniería andina',
        perfil: 'Le fascina la arquitectura inca, los quipus o el sistema de caminos',
        texto:
          'Los bloques de Sacsayhuamán sin mortero de hasta 125 toneladas, el sistema de chasquis que transmitía mensajes a 400 km/día, y los quipus como base de datos decimal: la ingeniería inca plantea preguntas que la arqueología aún está respondiendo.',
      },
      {
        icono: '📚',
        titulo: 'Interesado en la resistencia indígena',
        perfil: 'Quiere entender la resistencia inca más allá de la conquista',
        texto:
          'El Estado Neo-Inca de Vilcabamba es uno de los episodios menos conocidos de la historia andina: 36 años de soberanía real en las montañas selváticas. El nombre Túpac Amaru tuvo una segunda vida poderosa en 1780, dos siglos después.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué Machu Picchu es tan impresionante arquitectónicamente?',
        respuesta:
          'Machu Picchu fue construida hacia 1450 a 2.430 metros de altitud con la técnica inca de "piedra encajada": bloques de granito de hasta varias toneladas ensamblados sin mortero con una precisión que no permite introducir una hoja de papel entre ellos. Esta técnica hace los muros sísmicamente resilientes, moviéndose ligeramente en los terremotos andinos en vez de derrumbarse. El emplazamiento —una cresta entre dos picos con el río Urubamba 600 metros abajo— y la alineación astronómica del Templo del Sol con el solsticio de junio añaden complejidad a la ya extraordinaria proeza constructiva. Fue "redescubierta" por Hiram Bingham en 1911, aunque las comunidades locales conocían su existencia.',
        tip: 'La función exacta de Machu Picchu —ciudad planificada, santuario real o centro administrativo— sigue siendo debatida por los arqueólogos.',
      },
      {
        pregunta: '¿Cómo funcionaban los quipus?',
        respuesta:
          'Los quipus eran dispositivos de cuerdas de distintos colores, longitudes y materiales, con nudos de distintos tipos, posiciones y orientaciones. Los quipucamayocs (especialistas) los usaban para registrar datos en base decimal: censos, tributos, inventarios de almacenes y calendarios agrícolas. El color de la cuerda indicaba la categoría (tipo de producto, región, categoría social); la posición y tipo del nudo indicaba el valor numérico (unidades, decenas, centenas). La controversia actual es si algunos quipus también codificaban información narrativa o histórica, lo que los convertiría en una forma de escritura. De los aproximadamente 900 quipus conservados, la mayoría son de contenido numérico claramente descifrado.',
        tip: 'El Tawantinsuyu fue el mayor estado del mundo en su época que funcionó sin escritura alfabética.',
      },
      {
        pregunta: '¿Cómo pudo Pizarro capturar a Atahualpa con solo 168 hombres?',
        respuesta:
          'La captura de Cajamarca (1532) fue posible por la convergencia de varios factores: la emboscada cuidadosamente preparada por Pizarro con armas de fuego, cañones y caballos (desconocidos para los incas) en un espacio cerrado; el estado debilitado del Tawantinsuyu tras cinco años de guerra civil entre Huáscar y Atahualpa; las epidemias de viruela y sarampión que habían matado ya a millones de personas incluyendo al inca Huayna Cápac; y el efecto psicológico devastador de los caballos, percibidos inicialmente como seres sobrenaturales. Atahualpa acudió a la plaza sin armas confiando en la superioridad numérica de sus 6.000-8.000 acompañantes. La estrategia de Pizarro fue simple pero brutal: concentrar el fuego y el ataque de caballería en el espacio donde los incas no podían maniobrar.',
        tip: 'Atahualpa pagó el mayor rescate en metales preciosos de la historia: una habitación de 6x5 m llena de oro más dos habitaciones de plata.',
      },
      {
        pregunta: '¿Por qué el Imperio Inca duró tan poco?',
        respuesta:
          'El Tawantinsuyu en su forma imperial duró menos de 100 años: desde la expansión de Pachacútec (1438) hasta la conquista española (1532). La velocidad de expansión fue también su debilidad: el Imperio creció más rápido de lo que podía consolidarse culturalmente. Las poblaciones conquistadas mantenían identidades propias y algunos se aliaron con los españoles durante la conquista. La ausencia de un mecanismo claro de sucesión —el Sapa Inca designaba sucesor entre sus hijos— generó conflictos recurrentes. La guerra civil de 1527-1532 fue el factor decisivo: cuando llegaron los españoles, el Imperio estaba dividido, agotado y diezmado por epidemias europeas que se propagaron antes que los propios europeos.',
        tip: 'Paradójicamente, el Imperio Inca fue tan eficiente en expansión que no tuvo tiempo de crear la cohesión cultural profunda que habría hecho más difícil su conquista.',
      },
      {
        pregunta: '¿Qué quedó del Imperio Inca después de la conquista?',
        respuesta:
          'El legado inca es profundo y vivo. El quechua sigue siendo hablado por más de 10 millones de personas en Perú, Bolivia, Ecuador, Colombia, Chile y Argentina. El Qhapaq Ñan (Camino Inca) fue declarado Patrimonio Mundial de la UNESCO en 2014. El Inti Raymi se celebra anualmente en el solsticio de junio en Sacsayhuamán. El puente de Q\'eswachaka se reconstruye ritualmente cada año con fibra de ichu según la técnica ancestral. El nombre Túpac Amaru resonó de nuevo en la gran rebelión andina de 1780-1781, liderada por José Gabriel Condorcanqui. La arquitectura inca sigue siendo parte del paisaje urbano del Cusco, donde los cimientos incas sostienen edificios coloniales. Las comunidades andinas mantienen prácticas agrícolas, textiles y rituales de raíz precolombina.',
        tip: 'El Cusco actual tiene el trazado urbano inca: las calles coloniales siguen el plan de la ciudad diseñada por Pachacútec en el siglo XV.',
      },
    ],

    pasos: [
      {
        titulo: 'Observa los bloques de color en la Línea del Tiempo',
        cuerpo:
          'El dorado representa los orígenes, el rojo la expansión imperial, el verde Machu Picchu y la resistencia, el azul los caminos, el morado la administración y la conquista. Antes de leer los detalles, identifica visualmente la proporción de cada fase: el Imperio en su apogeo (expansión) duró apenas 90 años antes de la conquista.',
      },
      {
        titulo: 'Compara Pachacútec con sus sucesores',
        cuerpo:
          'Haz clic en "Pachacútec y la Fundación del Tawantinsuyu" y luego en "La Expansión Máxima del Tawantinsuyu". Observa cómo en solo 33 años Pachacútec construyó el Imperio, y sus sucesores tardaron 56 años más en expandirlo hasta sus límites naturales. La velocidad de la construcción imperial explica también su fragilidad.',
      },
      {
        titulo: 'Sigue el hilo de la organización sin escritura',
        cuerpo:
          'Explora los hitos "El Qhapaq Ñan" y "Los Quipus" para entender cómo el Tawantinsuyu administró 2 millones de km² sin escritura alfabética. Los caminos, los chasquis y los quipus formaban un sistema de información que en velocidad de transmisión tardó siglos en ser igualado por los europeos.',
      },
      {
        titulo: 'Analiza las causas de la caída en la Comparativa',
        cuerpo:
          'En la tabla Comparativa, filtra por "La Caída del Imperio" para ver los dos hitos de la crisis: la guerra civil y la captura de Atahualpa. Observa que entre la muerte de Huayna Cápac (1527) y la captura en Cajamarca (1532) solo pasaron 5 años: la vulnerabilidad del Imperio fue rapidísima.',
      },
      {
        titulo: 'No olvides la Resistencia: el final más olvidado',
        cuerpo:
          'El hito "El Estado Neo-Inca de Vilcabamba" muestra que la conquista no fue instantánea. Desde 1536 hasta 1572 existió un Estado inca soberano en las montañas. El Contexto Histórico (Tab 4) muestra la era de Vilcabamba como una de las 6 grandes eras del Imperio, con sus propios gobernantes y eventos.',
      },
    ],

    tips: [
      {
        icono: '🏔️',
        texto:
          'El Tawantinsuyu nunca usó la rueda ni los animales de carga pesados (los llamas pueden cargar hasta 25 kg, mucho menos que un buey). Todos sus monumentos —Machu Picchu, Sacsayhuamán, el Coricancha— fueron construidos con fuerza humana y organización colectiva mediante la mita.',
      },
      {
        icono: '🌽',
        texto:
          'Los ingenieros incas transformaron los Andes en tierra agrícola mediante terrazas (andenes) que aún se usan hoy. El sistema de andenes en Moray (Cusco) tiene una diferencia de temperatura de 15°C entre el nivel superior y el inferior, y se cree que fue usado como laboratorio agrícola para desarrollar variedades de plantas adaptadas a distintas altitudes.',
      },
      {
        icono: '🦙',
        texto:
          'Los incas tenían cuatro animales domésticos exclusivos de América del Sur: la llama (carga y lana), la alpaca (lana fina), el cuy (fuente de proteína) y el perro. Sin caballos, bueyes ni rueda, el Tawantinsuyu construyó la mayor red de caminos de América. La ventaja militar española con caballos y armas de fuego fue, en este contexto, tecnológicamente abrumadora.',
      },
      {
        icono: '📅',
        texto:
          'El Imperio Inca duró oficialmente menos que la vida de Leonardo da Vinci (1452-1519): la expansión de Pachacútec comenzó en 1438 y la conquista española llegó en 1532. Sin embargo, el Estado Neo-Inca de Vilcabamba resistió hasta 1572, lo que significa que la conquista completa del Perú tardó 40 años desde Cajamarca.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir el Imperio Inca con toda la civilización andina',
        cuerpo:
          'Los incas fueron la última de una larga serie de civilizaciones andinas sofisticadas. Antes que ellos: los Chavín (900 a.C.), los Moche (100-800 d.C.), los Nazca (famosos por sus geoglifos), los Wari y los Tiwanaku. El Tawantinsuyu duró menos de 100 años en su forma imperial; la civilización andina lleva más de 3.000 años. Los incas heredaron y sintetizaron logros culturales de todas estas tradiciones previas.',
      },
      {
        titulo: 'Creer que Machu Picchu era la capital del Imperio',
        cuerpo:
          'La capital del Tawantinsuyu era el Cusco (Qosqo), el "ombligo del mundo". Machu Picchu era una llacta (ciudad planificada), posiblemente una residencia real o santuario de Pachacútec, nunca un centro administrativo principal. El Coricancha (Templo del Sol) del Cusco era el corazón religioso del Imperio. Machu Picchu fue "olvidada" por los españoles —posiblemente porque nunca llegaron— y redescubierta por Hiram Bingham en 1911.',
      },
      {
        titulo: 'Pensar que la conquista de Pizarro fue inevitable o fácil',
        cuerpo:
          'La conquista del Tawantinsuyu no fue una marcha triunfal. La resistencia inca fue real y prolongada: el Gran Cerco del Cusco (1536) casi expulsó a los españoles; la batalla de Ollantaytambo (1537) fue la mayor derrota española de la conquista andina; y el Estado Neo-Inca de Vilcabamba sobrevivió 36 años más. La conquista completa requirió 40 años (1532-1572), alianzas con pueblos indígenas enemigos de los incas, y una devastación demográfica por epidemias que fue el factor más determinante.',
      },
      {
        titulo: 'Asumir que los quipus eran solo herramientas contables',
        cuerpo:
          'Aunque los quipus con contenido numérico están bien documentados y descifrados, existe debate académico sobre si algunos quipus también codificaban información narrativa o histórica. Investigadores como Gary Urton argumentan que el sistema de colores, tipos de nudos y disposiciones puede codificar información no numérica. De los ~900 quipus conservados, una fracción tiene propiedades que no encajan en el modelo puramente numérico. La cuestión de si los incas tuvieron una forma de escritura sigue abierta en la arqueología del siglo XXI.',
      },
    ],
  },
};
