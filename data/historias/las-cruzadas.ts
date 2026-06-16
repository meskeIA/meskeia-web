import type { HistoriaData } from './types';

export const lasCruzadas: HistoriaData = {
  slug: 'las-cruzadas',
  titulo: 'Las Cruzadas: De Clermont a la Caída de Acre',
  subtitulo: 'Dos siglos de guerra, fe y diplomacia entre Occidente e Islam: la Primera Cruzada, Saladino, Ricardo Corazón de León y el fin de Ultramar',
  descripcionSEO: 'Cronología interactiva de las Cruzadas (1095–1291): desde el llamamiento del papa Urbano II en Clermont hasta la caída de Acre. Explora la Primera Cruzada, Saladino, la Tercera Cruzada y el legado de los reinos de Ultramar.',
  keywords: [
    'cruzadas', 'historia medieval', 'Jerusalén', 'Saladino', 'Ricardo Corazón de León',
    'Primera Cruzada', 'reinos de Ultramar', 'Templarios', 'Antioquía', 'Acre',
    'Cuarta Cruzada', 'Constantinopla', 'Tierra Santa', 'Godofredo de Bouillón',
    'batalla de Hattin', 'órdenes militares', 'medievo cristiano', 'islam medieval',
  ],
  anioInicio: 1095,
  anioFin: 1291,

  hitos: [
    {
      id: 'llamamiento-clermont',
      nombre: 'El Llamamiento de Clermont',
      anioInicio: 1095,
      anioFin: 1096,
      color: '#4B0082',
      categoria: 'llamamiento',
      descripcion: 'En noviembre de 1095, el papa Urbano II pronuncia en el Concilio de Clermont el discurso que desencadena el movimiento cruzado. La frase "Dieu le veult" (Dios lo quiere) resume el fervor que moviliza a decenas de miles de europeos. Se promete indulgencia plenaria a quienes participen. La Cruzada Popular de Pedro el Ermitaño parte primero: mal equipada, es masacrada al llegar a Anatolia por los turcos selyúcidas. La cruzada feudal, convocada en paralelo, organiza cuatro grandes ejércitos bajo la dirección de nobles de Francia, Lorena y el sur de Italia, y parte a finales de 1096.',
      obraIconica: 'Discurso de Clermont de Urbano II (1095)',
      paises: ['Francia', 'Lorena', 'Italia del Sur', 'Sacro Imperio Romano'],
    },
    {
      id: 'primera-cruzada-jerusalen',
      nombre: 'La Primera Cruzada: Conquista de Jerusalén',
      anioInicio: 1096,
      anioFin: 1099,
      color: '#4B0082',
      categoria: 'llamamiento',
      descripcion: 'Los cuatro ejércitos cruzados convergen en Constantinopla y luego cruzan Anatolia enfrentando grandes dificultades. El sitio de Antioquía dura nueve meses y está a punto de fracasar antes de que la ciudad caiga en junio de 1098. El 15 de julio de 1099, las tropas cruzadas conquistan Jerusalén tras poco más de un mes de asedio. La toma va seguida de una masacre de la población musulmana y judía de la ciudad que las fuentes contemporáneas describen con crudeza. Godofredo de Bouillón asume el gobierno como "Guardián del Santo Sepulcro" rehusando el título real, y los estados cruzados en el Levante quedan fundados.',
      obraIconica: 'Gesta Dei per Francos de Guiberto de Nogent (h. 1108)',
      paises: ['Francia', 'Lorena', 'Italia del Sur', 'Flandes'],
    },
    {
      id: 'reinos-ultramar-ordenes',
      nombre: 'Los Reinos de Ultramar y las Órdenes Militares',
      anioInicio: 1099,
      anioFin: 1187,
      color: '#DAA520',
      categoria: 'ultramar',
      descripcion: 'Se consolidan cuatro estados cruzados: el Reino de Jerusalén, el Principado de Antioquía, el Condado de Edesa y el Condado de Trípoli. En 1119 Hugues de Payns funda la Orden del Temple (Templarios) para proteger a los peregrinos; poco después surge la Orden del Hospital (Hospitalarios). Ambas se convierten en el primer ejército permanente profesional de Occidente medieval. La Segunda Cruzada (1147–1149), convocada tras la caída de Edesa (1144), fracasa ante las murallas de Damasco por falta de coordinación y tensiones internas. Los estados cruzados sobreviven apoyados en las fortalezas costeras y en el aprovisionamiento marítimo de las repúblicas italianas.',
      obraIconica: 'Regla de la Orden del Temple (aprobada en el Concilio de Troyes, 1129)',
      paises: ['Francia', 'Italia (Venecia, Génova, Pisa)', 'Bizancio', 'Siria'],
    },
    {
      id: 'saladino-hattin',
      nombre: 'Saladino: La Respuesta Islámica',
      anioInicio: 1169,
      anioFin: 1187,
      color: '#228B22',
      categoria: 'saladino',
      descripcion: 'Saladino (Salah ad-Din Yusuf ibn Ayyub) asciende al poder en Egipto en 1169 y progresivamente unifica bajo su mando Egipto y Siria, poniendo fin a la fragmentación política que había permitido la supervivencia de los estados cruzados. El 4 de julio de 1187, en la batalla de los Cuernos de Hattin (junto al lago Tiberiades), Saladino tiende una trampa magistral: corta el agua al ejército cruzado, lo desgasta con acoso y caballería ligera, y lo aniquila. El rey Guido de Lusignan es capturado, así como la reliquia de la Vera Cruz. En octubre de 1187, Jerusalén cae. A diferencia del 1099 cristiano, Saladino garantiza la vida de los civiles pagando un rescate o marchando en libertad, hecho que sus contemporáneos europeos elogian.',
      obraIconica: 'Bataille des Cornes de Hattin (miniaturas de las crónicas de Guillermo de Tiro)',
      paises: ['Egipto', 'Siria', 'Irak', 'Yemen'],
    },
    {
      id: 'tercera-cruzada-ricardo',
      nombre: 'La Tercera Cruzada: Ricardo vs. Saladino',
      anioInicio: 1189,
      anioFin: 1192,
      color: '#1E90FF',
      categoria: 'tercera-cruzada',
      descripcion: 'La caída de Jerusalén convulsiona Europa. Tres monarcas responden: Federico I Barbarroja del Sacro Imperio, Felipe II de Francia y Ricardo I Corazón de León de Inglaterra. Barbarroja muere ahogado al cruzar el río Saleph en Cilicia (1190) y su ejército se disgrega. Felipe y Ricardo reconquistan Acre (1191) tras un prolongado asedio conjunto. En Arsuf, Ricardo derrota a Saladino en campo abierto. Sin embargo, Ricardo decide dos veces no marchar sobre Jerusalén al evaluar que no podría mantenerla. La campaña termina con el Tratado de Jaffa (1192): los cruzados retienen la franja costera y los peregrinos cristianos pueden acceder a Jerusalén desarmados. Un equilibrio frágil pero real.',
      obraIconica: 'Itinerarium Peregrinorum et Gesta Regis Ricardi (h. 1220)',
      paises: ['Inglaterra', 'Francia', 'Sacro Imperio', 'Austria'],
    },
    {
      id: 'cuarta-cruzada-constantinopla',
      nombre: 'La Cuarta Cruzada: Saqueo de Constantinopla',
      anioInicio: 1202,
      anioFin: 1204,
      color: '#DC143C',
      categoria: 'cuarta-cruzada',
      descripcion: 'La Cuarta Cruzada es convocada por el papa Inocencio III con destino a Egipto. Venecia construye la flota a cambio de la participación cruzada en la reconquista de Zara (cristiana, dálmata). Una disputa sucesoria en Bizancio ofrece a los cruzados el pretexto para desviar la expedición a Constantinopla. En abril de 1204, la capital del Imperio Romano de Oriente es saqueada durante tres días. Muere más arte y cultura que en cualquier acontecimiento anterior de la historia medieval. Se funda el efímero Imperio Latino de Oriente (1204–1261). El papa Inocencio III condena el saqueo; aun así, lo instrumentaliza. La fractura entre las Iglesias de Roma y Constantinopla, iniciada en 1054, se vuelve irreparable.',
      obraIconica: 'Conquête de Constantinople de Geoffroy de Villehardouin (h. 1207)',
      paises: ['Francia', 'Flandes', 'Venecia', 'Imperio Romano de Oriente'],
    },
    {
      id: 'cruzadas-siglo-xiii',
      nombre: 'Las Cruzadas del Siglo XIII: Diplomacia y Fracasos',
      anioInicio: 1212,
      anioFin: 1250,
      color: '#DAA520',
      categoria: 'ultramar',
      descripcion: 'El siglo XIII muestra una gran variedad de estrategias. La llamada Cruzada de los Niños (1212) acaba en tragedia: los grupos de jóvenes que parten de Francia y Alemania son dispersados, vendidos como esclavos o mueren sin llegar a Tierra Santa. La Quinta Cruzada (1217–1221) intenta atacar Egipto como base de operaciones y fracasa en Damieta. La Sexta Cruzada protagoniza el episodio más insólito: Federico II de Hohenstaufen, excomulgado, negocia directamente con el sultán al-Kamil y recupera Jerusalén sin combatir (1229). La Iglesia y los cruzados residentes en Tierra Santa reciben el acuerdo con escándalo. Luis IX de Francia lidera la Séptima Cruzada (1248–1254): cae prisionero en la batalla de Mansura (1250) y debe ser rescatado por un cuantioso botín.',
      obraIconica: 'Vie de Saint Louis de Joinville (h. 1305)',
      paises: ['Sacro Imperio', 'Francia', 'Hungría', 'Egipto (Ayyubíes)'],
    },
    {
      id: 'templarios-poder',
      nombre: 'El Poder de los Templarios',
      anioInicio: 1119,
      anioFin: 1307,
      color: '#DAA520',
      categoria: 'ultramar',
      descripcion: 'La Orden del Temple evoluciona de escolta de peregrinos a entidad financiera paneuropea. Sus preceptorías distribuidas por toda Europa crean el primer sistema de crédito transferible (la letra de crédito): los peregrinos depositan oro en Europa y reciben una nota que canjean en Tierra Santa, evitando el riesgo de viajar con metálico. Los Templarios acumulan riqueza, deudas de reyes y poder político que genera recelo. Felipe IV de Francia, endeudado con la Orden, la acusa de herejía y sodomía. En octubre de 1307, ordena el arresto simultáneo de todos los Templarios en Francia. Clemente V disuelve la Orden en el Concilio de Vienne (1312). En 1314 el último gran maestre, Jacques de Molay, es quemado en París.',
      obraIconica: 'Proceso contra los Templarios (archivos papales, 1307–1312)',
      paises: ['Francia', 'España', 'Portugal', 'Inglaterra', 'Tierra Santa'],
    },
    {
      id: 'caida-estados-cruzados',
      nombre: 'La Caída de los Estados Cruzados',
      anioInicio: 1261,
      anioFin: 1291,
      color: '#708090',
      categoria: 'declive',
      descripcion: 'Con la restauración del Imperio Bizantino (1261) y el auge del sultanato mameluco en Egipto, los estados cruzados quedan cada vez más aislados. El sultán Baybars inicia una sistemática campaña de reconquista: toma Cesarea, Arsuf y Jaffa entre 1265 y 1268; Antioquía cae en 1268 con gran violencia. Luis IX lidera una última cruzada (Octava, 1270) pero muere de enfermedad en Túnez antes de llegar a Tierra Santa. Las ciudades costeras caen una a una. El 18 de mayo de 1291, Acre, el último gran bastión cruzado, es tomado por el ejército del sultán al-Ashraf Khalil. Los supervivientes evacuados por mar ponen fin a dos siglos de presencia cruzada en el Levante.',
      obraIconica: 'Crónica de la caída de Acre (Anónimo, h. 1291)',
      paises: ['Egipto (Mamelucos)', 'Francia', 'Inglaterra', 'Órdenes Militares'],
    },
    {
      id: 'legado-cruzadas',
      nombre: 'El Legado de las Cruzadas',
      anioInicio: 1291,
      anioFin: 1400,
      color: '#708090',
      categoria: 'declive',
      descripcion: 'Las Cruzadas dejan una herencia compleja y duradera. En el plano intelectual, el contacto con el mundo árabe activa la transmisión de Aristóteles, Averroes, álgebra, medicina galénica y astronomía a Occidente, contribuyendo al nacimiento de las universidades. El comercio de especias y la Ruta de la Seda, reactivados por las repúblicas italianas, sientan bases del capitalismo mercantil. En el plano sombrío, los pogromos contra judíos en el Rin (1096) y a lo largo de las rutas cruzadas inauguran una tradición de persecución sistemática. Las órdenes militares sobreviven: los Teutónicos se desplazan al Báltico y crean un estado en Prusia. El imaginario orientalista y la memoria de las Cruzadas —invocada por ambos lados— sigue moldeando las relaciones entre Occidente e Islam en el siglo XXI.',
      obraIconica: 'De Recuperatione Terrae Sanctae de Pierre Dubois (h. 1306)',
      paises: ['Europa occidental', 'Imperio Otomano', 'Prusia', 'España'],
    },
  ],

  eras: [
    {
      nombre: 'La Primera Cruzada: El Llamamiento y la Conquista',
      desde: 1095,
      hasta: 1099,
      icono: '✝️',
      hitosDestacados: [
        'El Llamamiento de Clermont',
        'La Primera Cruzada: Conquista de Jerusalén',
      ],
      eventos: [
        'Noviembre 1095: Discurso de Urbano II en Clermont — "Dieu le veult"',
        'Cruzada Popular de Pedro el Ermitaño: masacrada en Anatolia (1096)',
        'Cuatro grandes ejércitos feudales parten desde Europa occidental',
        'Llegada a Constantinopla y paso por el Bósforo (1096–1097)',
        'Batalla de Dorilea: primera victoria cruzada sobre los selyúcidas (1097)',
        'Sitio de Antioquía: nueve meses, caída en junio de 1098',
        'Conquista de Jerusalén: 15 de julio de 1099',
        'Godofredo de Bouillón: primer gobernante latino de Jerusalén',
      ],
    },
    {
      nombre: 'Los Reinos de Ultramar',
      desde: 1099,
      hasta: 1187,
      icono: '🏰',
      hitosDestacados: [
        'Los Reinos de Ultramar y las Órdenes Militares',
        'El Poder de los Templarios',
      ],
      eventos: [
        'Fundación del Reino de Jerusalén, Principado de Antioquía, Condados de Edesa y Trípoli',
        'Fundación de la Orden del Temple por Hugues de Payns (1119)',
        'Concilio de Troyes: aprobación de la Regla Templaria (1129)',
        'Caída del Condado de Edesa ante Zengi (1144): detonante de la Segunda Cruzada',
        'Segunda Cruzada (1147–1149): fracasa ante Damasco',
        'Las repúblicas italianas (Venecia, Génova, Pisa) dominan el comercio levantino',
        'Auge de la arquitectura cruzada: castillos del Krak de los Caballeros y Belvoir',
        'Creciente presión de los principados turcos y el emirato de Mosul',
      ],
    },
    {
      nombre: 'Saladino y el Contraataque Islámico',
      desde: 1169,
      hasta: 1193,
      icono: '⚔️',
      hitosDestacados: [
        'Saladino: La Respuesta Islámica',
        'La Tercera Cruzada: Ricardo vs. Saladino',
      ],
      eventos: [
        'Saladino toma el poder en Egipto (1169) como visir del último califa fatimí',
        'Abolición del califato fatimí: Saladino proclama la autoridad del califato abasí (1171)',
        'Unificación de Egipto y Siria bajo la dinastía Ayyubí',
        'Batalla de los Cuernos de Hattin: destrucción del ejército cruzado (julio 1187)',
        'Caída de Jerusalén con clemencia hacia los civiles (octubre 1187)',
        'Tercera Cruzada: Ricardo y Felipe II reconquistan Acre (1191)',
        'Batalla de Arsuf: victoria táctica de Ricardo sobre Saladino',
        'Tratado de Jaffa: acceso cristiano a Jerusalén sin control militar (1192)',
        'Muerte de Saladino en Damasco (marzo 1193)',
      ],
    },
    {
      nombre: 'Las Grandes Cruzadas del Siglo XII',
      desde: 1187,
      hasta: 1212,
      icono: '⛵',
      hitosDestacados: [
        'La Cuarta Cruzada: Saqueo de Constantinopla',
      ],
      eventos: [
        'El papa Gregorio VIII convoca la Tercera Cruzada tras Hattin (1187)',
        'Muerte de Federico Barbarroja ahogado en el río Saleph (1190)',
        'Ricardo I y Felipe II de Francia llegan a Tierra Santa (1191)',
        'Tensiones entre Ricardo y Felipe: Felipe regresa a Francia',
        'Cuarta Cruzada convocada por Inocencio III (1198)',
        'Desviación a Zara (cristiana) por deudas con Venecia (1202)',
        'Primer asedio de Constantinopla: restauración efímera del emperador Alejo IV (1203)',
        'Saqueo de Constantinopla: tres días de destrucción (abril 1204)',
        'Fundación del Imperio Latino de Oriente (1204–1261)',
        'El papa Inocencio III condena el saqueo pero reconoce el Imperio Latino',
      ],
    },
    {
      nombre: 'Las Cruzadas del Siglo XIII: Diplomacia y Fracasos',
      desde: 1212,
      hasta: 1260,
      icono: '📜',
      hitosDestacados: [
        'Las Cruzadas del Siglo XIII: Diplomacia y Fracasos',
      ],
      eventos: [
        'Cruzada de los Niños (1212): doble fracaso en Francia y Alemania',
        'Quinta Cruzada: toma y pérdida de Damieta (1217–1221)',
        'Sexta Cruzada de Federico II: recuperación diplomática de Jerusalén (1229)',
        'Escándalo eclesiástico: un emperador excomulgado negocia con "infieles"',
        'Jeraquismo cruzado local rechaza el acuerdo y boicotea a Federico II',
        'Caída definitiva de Jerusalén ante los turcos jázaros (1244)',
        'Séptima Cruzada de Luis IX: derrota en Mansura y captura del rey (1250)',
        'Rescate de Luis IX por enorme botín; retira sus fuerzas a San Juan de Acre',
        'Los mamelucos desplazan a los ayyubíes en Egipto (1250): nuevo poder hostil',
        'Mongoles saquean Bagdad, fin del califato abasí (1258)',
      ],
    },
    {
      nombre: 'El Declive y la Caída de Ultramar',
      desde: 1260,
      hasta: 1291,
      icono: '🌅',
      hitosDestacados: [
        'La Caída de los Estados Cruzados',
        'El Legado de las Cruzadas',
      ],
      eventos: [
        'Restauración del Imperio Bizantino: Miguel VIII toma Constantinopla (1261)',
        'Baybars, sultán mameluco: campaña sistemática de reconquista',
        'Toma de Cesarea, Arsuf y Jaffa por Baybars (1265–1268)',
        'Caída de Antioquía: masacre de la población (1268)',
        'Octava Cruzada de Luis IX: muere de epidemia en Túnez (1270)',
        'Novena Cruzada de Eduardo de Inglaterra: expedición sin resultados definitivos (1271–1272)',
        'Disolución de la Orden del Temple en Francia iniciada (1307)',
        'Caída de Trípoli ante el sultán Qalawun (1289)',
        'Caída de Acre: asedio y destrucción del último bastión cruzado (18 mayo 1291)',
        'Evacuación por mar hacia Chipre: fin de la presencia cruzada en el Levante',
      ],
    },
  ],

  categorias: {
    llamamiento: 'Llamamiento y Primera Cruzada',
    ultramar: 'Reinos de Ultramar',
    saladino: 'Respuesta Islámica',
    'tercera-cruzada': 'Tercera Cruzada',
    'cuarta-cruzada': 'Cuarta Cruzada',
    declive: 'Declive y Legado',
  },

  colores: {
    llamamiento: '#4B0082',
    ultramar: '#DAA520',
    saladino: '#228B22',
    'tercera-cruzada': '#1E90FF',
    'cuarta-cruzada': '#DC143C',
    declive: '#708090',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: `Las Cruzadas (1095–1291) fueron una serie de campañas militares impulsadas principalmente por la Iglesia católica con el objetivo de recuperar y defender Tierra Santa —en especial Jerusalén— de la dominación islámica. A lo largo de dos siglos, estas expediciones implicaron a reyes, papas, órdenes militares, comerciantes italianos, comunidades judías y poblaciones musulmanas en un conflicto que redefinió las fronteras políticas, religiosas y culturales de la Edad Media.

El fenómeno cruzado no puede entenderse solo como guerra de religión. Intervinieron motivaciones muy diversas: espiritualidad sincera y búsqueda de indulgencias, ambición territorial de la nobleza, intereses comerciales de las ciudades italianas, rivalidades políticas entre reinos europeos y la fragmentación del mundo islámico que facilitó los primeros éxitos cruzados.

El estudio de las Cruzadas requiere equilibrio: ni la visión triunfalista de la historiografía medieval cristiana ni la condena anacrónica desde valores contemporáneos hacen justicia a su complejidad. La mirada académica actual busca comprender las lógicas internas de cada actor y las consecuencias —previstas e imprevistas— de sus acciones.`,

    tablaComparativa: [
      {
        hito: 'El Llamamiento de Clermont',
        periodo: '1095',
        categoria: 'Llamamiento y Primera Cruzada',
        personaje: 'Papa Urbano II',
        aportacion: 'Fundó la legitimidad ideológica del movimiento cruzado e institucionalizó la indulgencia plenaria como recompensa espiritual por la participación armada',
      },
      {
        hito: 'Conquista de Jerusalén',
        periodo: '1099',
        categoria: 'Llamamiento y Primera Cruzada',
        personaje: 'Godofredo de Bouillón',
        aportacion: 'Estableció el primer estado cruzado en Tierra Santa y el modelo de gobierno franco-oriental que perduró casi un siglo',
      },
      {
        hito: 'Fundación de los Templarios',
        periodo: '1119',
        categoria: 'Reinos de Ultramar',
        personaje: 'Hugues de Payns',
        aportacion: 'Creó el primer ejército monástico permanente de Occidente y el precursor del sistema bancario moderno mediante la letra de crédito',
      },
      {
        hito: 'Batalla de los Cuernos de Hattin',
        periodo: '1187',
        categoria: 'Respuesta Islámica',
        personaje: 'Saladino',
        aportacion: 'Demostró que la superioridad táctica y la unidad política podían derrotar a los estados cruzados, y sentó las bases para la recuperación islámica de Tierra Santa',
      },
      {
        hito: 'Tratado de Jaffa',
        periodo: '1192',
        categoria: 'Tercera Cruzada',
        personaje: 'Ricardo I de Inglaterra',
        aportacion: 'Introdujo la diplomacia como instrumento cruzado: el acceso a los lugares santos sin control territorial fue un precedente de acuerdos modernos sobre patrimonio compartido',
      },
      {
        hito: 'Saqueo de Constantinopla',
        periodo: '1204',
        categoria: 'Cuarta Cruzada',
        personaje: 'Balduino de Flandes',
        aportacion: 'Ilustró cómo las cruzadas podían ser instrumentalizadas por intereses políticos y económicos, agrietando irremediablemente la unidad del mundo cristiano medieval',
      },
    ],

    escenarios: [
      {
        icono: '📖',
        titulo: 'El estudiante de Historia Medieval',
        perfil: 'Alumno de bachillerato o universitario que prepara un trabajo sobre la Edad Media',
        texto: 'Esta cronología te permite situar cada cruzada en su contexto político y seguir los hilos de causa y efecto: la Primera Cruzada no surge de la nada, sino de la reforma gregoriana, la presión selyúcida sobre Bizancio y la crisis política en Europa. Para cada período verás las fuentes primarias más relevantes (crónicas cruzadas, crónicas árabes) que puedes buscar en ediciones anotadas.',
      },
      {
        icono: '🎮',
        titulo: 'El jugador de strategy o wargames históricos',
        perfil: 'Aficionado a juegos como Crusader Kings, Age of Empires o tabletop histórico',
        texto: 'Las Cruzadas ofrecen uno de los escenarios estratégicos más ricos del medievo: mapa fragmentado, múltiples facciones (cruzados, mamelucos, ayyubíes, selyúcidas, bizantinos, órdenes militares), recursos limitados y la variable impredecible del papado. Esta cronología te ayuda a entender por qué ciertos turnos históricos fueron decisivos y qué alternativas existían realmente.',
      },
      {
        icono: '🌍',
        titulo: 'El viajero que visita Tierra Santa o Turquía',
        perfil: 'Turista o peregrino que quiere entender los yacimientos y sitios cruzados',
        texto: 'Desde Acre (Israel) hasta el Krak de los Caballeros (Siria), pasando por Antioquía (Antakya, Turquía), los vestigios cruzados salpican el Mediterráneo oriental. Esta cronología te da el marco histórico para cada fortaleza, iglesia reconvertida o puerto medieval que visitarás, conectando piedra y fecha con los personajes que los construyeron o defendieron.',
      },
      {
        icono: '🤔',
        titulo: 'El lector que quiere contextualizar debates actuales',
        perfil: 'Persona interesada en comprender la raíz histórica de tensiones entre Occidente e Islam',
        texto: 'Las Cruzadas son invocadas con frecuencia en discursos políticos contemporáneos, a menudo de forma anacrónica o simplificada. Esta cronología ofrece hechos contrastados: cuándo hubo violencia, cuándo hubo diplomacia, cómo se comportaron distintos actores. El objetivo no es juzgar desde el presente, sino comprender la lógica medieval sin proyectar valores del siglo XXI.',
      },
    ],

    faq: [
      {
        pregunta: '¿Cuántas cruzadas hubo exactamente?',
        respuesta: 'La historiografía clásica distingue entre ocho y nueve cruzadas "numeradas" (Primera a Novena), pero el concepto es una construcción posterior: en la época simplemente se decía "peregrinar armado" o "tomar la cruz". Además de las campañas mayores, hubo decenas de expediciones menores, cruzadas del Báltico (Teutónicos contra eslavos paganos) y campañas en la Península Ibérica que también recibieron el estatus de cruzada. El número exacto depende de la definición que se use.',
        tip: 'La "Cruzada de los Niños" (1212) es hoy considerada por muchos historiadores como una peregrinación popular fallida, no una cruzada militar formal.',
      },
      {
        pregunta: '¿Por qué fracasaron las cruzadas a largo plazo?',
        respuesta: 'Las causas son múltiples y estructurales: los estados cruzados dependían de la afluencia constante de hombres y recursos de Europa, nunca desarrollaron una economía agraria autosuficiente ni integraron a la población local. La fragmentación política de las cruzadas (distintos reinos con intereses divergentes) contrasta con la creciente unidad islámica bajo Saladino y después los mamelucos. Además, el entusiasmo europeo fue decayendo: las cruzadas posteriores se enfrentaron a la apatía y a los intereses políticos de los reyes europeos que preferían guerrear entre sí.',
      },
      {
        pregunta: '¿Cómo trataban los cruzados a la población local y a los judíos?',
        respuesta: 'El comportamiento fue muy variado y no puede generalizarse. En la conquista de Jerusalén (1099) hubo una masacre extensa de musulmanes y judíos. Sin embargo, en los estados cruzados estables, las poblaciones locales (cristiana oriental, judía, musulmana) coexistían bajo dominio franco con diferentes grados de tolerancia. En la ruta europea hacia Tierra Santa, los pogromos contra comunidades judías del Rin (1096) fueron perpetrados por grupos populares sin control, y fueron condenados por obispos locales que intentaron proteger a las víctimas.',
        tip: 'Saladino, en la toma de Jerusalén de 1187, permitió la rendición pacífica y el rescate de la población frente a la violencia de 1099. Este contraste fue ampliamente señalado por cronistas medievales de ambos lados.',
      },
      {
        pregunta: '¿Qué papel tuvieron las mujeres en las Cruzadas?',
        respuesta: 'Las mujeres participaron más de lo que el relato militar convencional sugiere. Acompañaron a los ejércitos como enfermeras, aguadoras y proveedoras; algunas nobles gobernaron los estados cruzados en ausencia o muerte de sus maridos (como Melisenda de Jerusalén, 1131–1152, regente efectiva de pleno derecho). En Europa, gestionaban propiedades mientras sus maridos estaban en Tierra Santa. Sin embargo, su presencia en las crónicas es escasa porque los cronistas medievales no consideraban relevante documentarla sistemáticamente.',
      },
      {
        pregunta: '¿Cuál fue el impacto económico de las Cruzadas en Europa?',
        respuesta: 'El impacto fue transformador. Las repúblicas italianas (Venecia, Génova, Pisa) obtuvieron concesiones comerciales en los puertos levantinos y construyeron las bases del capitalismo mercantil mediterráneo. El sistema bancario templario (letras de crédito, depósitos, préstamos) anticipó instituciones financieras modernas. El flujo de especias, seda y bienes de lujo desde Oriente estimuló la demanda europea. A largo plazo, la búsqueda de rutas alternativas al Mediterráneo oriental (bloqueado por los otomanos en el siglo XV) fue un factor impulsor de los descubrimientos geográficos.',
        tip: 'Cuando los turcos otomanos tomaron Constantinopla en 1453, el comercio de especias por tierra se encareció enormemente. La búsqueda de rutas marítimas directas fue uno de los motores de la exploración portuguesa y española.',
      },
    ],

    pasos: [
      {
        titulo: 'Paso 1: Sitúa el conflicto en su contexto político europeo',
        cuerpo: 'Las Cruzadas no son comprensibles sin la Reforma Gregoriana (siglo XI): el papado buscaba reafirmar su autoridad sobre emperadores y reyes. El llamamiento de Clermont es también un movimiento político de Urbano II para consolidar el liderazgo pontificio sobre la Cristiandad occidental. Comprende esto antes de interpretar la motivación de los cruzados individuales.',
      },
      {
        titulo: 'Paso 2: Distingue las distintas motivaciones de los participantes',
        cuerpo: 'No todos los cruzados eran iguales. Los campesinos buscaban indulgencias y quizás tierra. Los nobles, combinaban fe genuina con ambición territorial y el sistema del vasallaje que los obligaba a seguir a sus señores. Las ciudades italianas perseguían privilegios comerciales. Los papas, influencia política. Separar estas motivaciones evita tanto la romantización como la demonización del movimiento.',
      },
      {
        titulo: 'Paso 3: Lee las fuentes árabes junto con las latinas',
        cuerpo: 'La historiografía de las Cruzadas fue durante siglos unilateralmente europea. Los cronistas árabes contemporáneos —como Ibn al-Athir, Imad al-Din o Usama ibn Munqidh— ofrecen perspectivas radicalmente distintas: la crueldad de la conquista de Jerusalén, la coherencia política de Saladino, el asombro ante las costumbres francas. Una comprensión completa requiere ambas tradiciones.',
      },
      {
        titulo: 'Paso 4: Analiza las Cruzadas como sistema político-económico',
        cuerpo: 'Los estados cruzados no eran islas religiosas sino entidades políticas con economía, leyes y diplomacia. El Reino de Jerusalén tenía una constitución (las Asizes de Jerusalén), relaciones comerciales con mercaderes musulmanes y judíos, y una nobleza local que a veces chocaba con los cruzados recién llegados. Estudiar su estructura interna explica tanto su relativa durabilidad como su fragilidad estructural.',
      },
      {
        titulo: 'Paso 5: Rastrear el legado hasta el presente con rigor',
        cuerpo: 'Las invocaciones modernas a las Cruzadas —desde discursos políticos de líderes occidentales hasta la propaganda de grupos armados— suelen ser anacrónicas. Para evaluar esas referencias críticamente, hay que conocer qué ocurrió realmente, cuándo y por qué, separando el hecho histórico de la memoria construida posteriormente. La historia rigurosa es la mejor vacuna contra el uso instrumental del pasado.',
      },
    ],

    tips: [
      {
        icono: '📚',
        texto: 'Para una introducción rigurosa y accesible, "Las Cruzadas" de Thomas Asbridge (2010, trad. española disponible) combina narrativa y análisis sin simplificar. Para profundizar en fuentes árabes, "Las Cruzadas vistas por los árabes" de Amin Maalouf es un punto de entrada excelente aunque no académico.',
      },
      {
        icono: '🗺️',
        texto: 'Los mapas son imprescindibles para entender las Cruzadas: las distancias, los pasos de montaña, las rutas marítimas y las posiciones de los estados cruzados respecto a los emiratos y sultanatos vecinos explican muchas decisiones estratégicas que en el texto narrativo parecen arbitrarias.',
      },
      {
        icono: '⚖️',
        texto: 'Evita el "presentismo": juzgar a Godofredo de Bouillón o Saladino con valores del siglo XXI no aporta comprensión histórica. El objetivo del historiador es comprender la lógica interna de cada actor dentro de su sistema de valores, no emitir juicios morales desde el presente.',
      },
      {
        icono: '🔍',
        texto: 'La arqueología cruzada avanza rápidamente: excavaciones en Acre, Cesarea y otros yacimientos continúan revelando datos sobre la vida cotidiana en los estados cruzados que las crónicas no documentan. Busca publicaciones recientes del Israel Antiquities Authority o del CNRS francés para hallazgos actualizados.',
      },
    ],

    errores: [
      {
        titulo: 'Error: "Las Cruzadas fueron una agresión imperialista occidental unilateral"',
        cuerpo: 'Esta lectura, aunque popular en ciertos discursos, es anacrónica. El imperialismo como sistema económico-político es un concepto del siglo XIX. Las Cruzadas respondían a lógicas medievales específicas: la ideología de la guerra justa, la noción de recuperación de territorios "usurpados", la estructura del vasallaje y la autoridad pontificia. Reconocer la violencia cruzada no requiere proyectarle categorías de otro siglo.',
      },
      {
        titulo: 'Error: "Saladino era un héroe sin defectos y los cruzados eran todos bárbaros"',
        cuerpo: 'Saladino fue un líder extraordinario y su clemencia en Jerusalén (1187) contrasta favorablemente con la masacre de 1099. Pero también ordenó la ejecución de los prisioneros Templarios y Hospitalarios tras Hattin, no por crueldad caprichosa, sino porque consideraba a las órdenes militares el núcleo de resistencia más peligroso. Los actores medievales eran complejos; la hagiografía en cualquier dirección deforma la comprensión.',
      },
      {
        titulo: 'Error: "La Cuarta Cruzada "se desvió" por accidente"',
        cuerpo: 'El desvío hacia Constantinopla involucró decisiones deliberadas de actores específicos: la aristocracia veneciana, el candidato imperial Alejo IV y facciones de la nobleza cruzada. Llamarlo "accidente" exonera a los responsables. La historiografía actual subraya que, aunque nadie planeó el saqueo desde el principio, las decisiones clave fueron tomadas con plena conciencia de sus consecuencias políticas.',
      },
      {
        titulo: 'Error: "Las Cruzadas son la raíz directa del conflicto árabe-israelí moderno"',
        cuerpo: 'El conflicto árabe-israelí tiene causas históricas directas del siglo XX (movimiento sionista, mandato británico, guerras de 1948 y posteriores) que no se reducen a las Cruzadas. Invocar las Cruzadas como explicación directa del conflicto moderno es un salto histórico de 700 años que borra las causas reales. Las Cruzadas forman parte de una memoria histórica invocada políticamente, pero no son causas estructurales del conflicto contemporáneo.',
      },
    ],
  },
};
