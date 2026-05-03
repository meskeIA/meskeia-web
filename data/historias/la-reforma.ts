import type { HistoriaData } from './types';

export const laReforma: HistoriaData = {
  slug: 'la-reforma',
  titulo: 'La Reforma Protestante: De Lutero a la Paz de Westfalia',
  subtitulo: 'La fractura de la cristiandad occidental: 130 años de teología, guerras de religión y diplomacia que crearon la Europa moderna',
  descripcionSEO: 'Cronología interactiva de la Reforma Protestante (1517–1648): desde las 95 Tesis de Lutero hasta la Paz de Westfalia. Hitos, guerras de religión, Contrarreforma y el nacimiento del sistema de estados moderno.',
  keywords: [
    'Reforma Protestante', 'Martín Lutero', '95 Tesis', 'Calvino', 'Anglicanismo',
    'Contrarreforma', 'Concilio de Trento', 'Guerras de Religión', 'Guerra de los Treinta Años',
    'Paz de Westfalia', 'hugonotes', 'Enrique VIII', 'historia Europa siglo XVI XVII',
  ],
  anioInicio: 1517,
  anioFin: 1648,

  // ─────────────────────────────────────────────
  // HITOS (10)
  // ─────────────────────────────────────────────
  hitos: [
    {
      id: '95-tesis-lutero',
      nombre: 'Las 95 Tesis de Lutero',
      anioInicio: 1517,
      anioFin: 1521,
      color: '#8B4513',
      categoria: 'luteranismo',
      descripcion: 'El 31 de octubre de 1517 Martín Lutero fija sus 95 Tesis en la puerta de la iglesia del castillo de Wittenberg, cuestionando la práctica de las indulgencias. La imprenta propaga el texto por toda Europa en semanas. Las disputas con Johann Eck y la Dieta de Worms (1521) —donde Lutero declara "Aquí estoy, no puedo hacer otra cosa"— acaban en su excomunión papal. Refugiado en el castillo de Wartburg, traduce el Nuevo Testamento al alemán en tan solo once semanas, poniendo la Biblia en manos del pueblo.',
      obraIconica: 'Las 95 Tesis (1517) y traducción alemana del Nuevo Testamento (1522)',
      paises: ['Alemania', 'Sacro Imperio Romano Germánico'],
    },
    {
      id: 'zuinglio-calvino',
      nombre: 'Zuinglio y Calvino: El Protestantismo se Diversifica',
      anioInicio: 1519,
      anioFin: 1564,
      color: '#1E3A5F',
      categoria: 'calvinismo',
      descripcion: 'Ulrico Zuinglio predica en Zúrich desde 1519 una reforma más radical que la luterana: elimina imágenes, reliquias y la misa. Juan Calvino llega a Ginebra en 1536 y publica la "Institutio Christianae Religionis", sistematizando la teología reformada en torno a la predestinación y la soberanía divina absoluta. La "ética protestante del trabajo" (Max Weber) vinculará el calvinismo al ascenso del capitalismo. Desde Ginebra, el calvinismo irradia hacia Francia (hugonotes), Escocia (presbiterianismo) y los Países Bajos.',
      obraIconica: 'Institutio Christianae Religionis de Calvino (1536)',
      paises: ['Suiza', 'Francia', 'Países Bajos', 'Escocia'],
    },
    {
      id: 'anglicanismo-enrique-viii',
      nombre: 'La Reforma en Inglaterra: Enrique VIII y el Anglicanismo',
      anioInicio: 1527,
      anioFin: 1558,
      color: '#DC143C',
      categoria: 'anglicanismo',
      descripcion: 'Enrique VIII solicita al Papa Clemente VII la anulación de su matrimonio con Catalina de Aragón. La negativa papal, condicionada por el poder de Carlos V, lleva al rey inglés a promulgar el Acta de Supremacía (1534): el monarca inglés sustituye al Papa como cabeza de la Iglesia de Inglaterra. Thomas Moro es ejecutado por negarse a jurar el acta. La disolución de los monasterios transfiere riquezas inmensas a la corona. Eduardo VI radicaliza el protestantismo; María I intenta la reconquista católica con persecuciones que le valdrán el apodo "La Sanguinaria".',
      obraIconica: 'Acta de Supremacía (1534)',
      paises: ['Inglaterra', 'Irlanda'],
    },
    {
      id: 'contrarreforma-trento',
      nombre: 'La Contrarreforma: El Concilio de Trento',
      anioInicio: 1540,
      anioFin: 1563,
      color: '#4B0082',
      categoria: 'contrarreforma',
      descripcion: 'La Iglesia católica responde con una doble estrategia: reforma interna y defensa doctrinal. Ignacio de Loyola funda la Compañía de Jesús (1540), una orden de élite educativa y misionera que se convierte en el brazo intelectual de la Contrarreforma. El Concilio de Trento (1545–1563) reafirma todos los dogmas cuestionados por los protestantes —las indulgencias, el purgatorio, la tradición como fuente de fe— pero introduce disciplina interna y mejora la formación del clero. El Index de libros prohibidos, la renovada Inquisición romana y el arte barroco como instrumento de persuasión visual completan el esfuerzo.',
      obraIconica: 'Decretos del Concilio de Trento (1563)',
      paises: ['Italia', 'España', 'Sacro Imperio Romano Germánico'],
    },
    {
      id: 'guerras-religion-francia',
      nombre: 'Las Guerras de Religión en Francia',
      anioInicio: 1562,
      anioFin: 1598,
      color: '#708090',
      categoria: 'guerras',
      descripcion: 'Francia se fractura entre una minoría protestante (hugonotes, el 10% de la población) y una mayoría católica. Ocho guerras civiles salpican el reino. El punto culminante es la Masacre de San Bartolomé (24 de agosto de 1572): miles de hugonotes son asesinados en París y en toda Francia en pocos días, con estimaciones que van de 5.000 a 30.000 víctimas. El rey Enrique IV, hugonote convertido al catolicismo para acceder al trono ("París bien vale una misa"), promulga el Edicto de Nantes (1598), la primera ley de tolerancia religiosa en Europa occidental, que garantiza a los protestantes libertad de culto y plazas fuertes.',
      obraIconica: 'Edicto de Nantes (1598)',
      paises: ['Francia'],
    },
    {
      id: 'paises-bajos-protestantes',
      nombre: 'Los Países Bajos: La Primera República Protestante',
      anioInicio: 1568,
      anioFin: 1609,
      color: '#1E3A5F',
      categoria: 'calvinismo',
      descripcion: 'Las provincias calvinistas de los Países Bajos se rebelan contra la dominación española de Felipe II. El Duque de Alba instaura el "Tribunal de los Tumultos" (llamado "Tribunal de la Sangre"), ejecutando a miles. Guillermo de Orange lidera la resistencia. La Unión de Utrecht (1579) une a las siete provincias del norte; en 1581 declaran la independencia como República de las Provincias Unidas. Esta entidad —la primera república moderna de facto, con libertad de prensa y tolerancia religiosa relativa— se convierte en el centro financiero y comercial de Europa, cuna del capitalismo y del pensamiento liberal.',
      obraIconica: 'Acta de Abjuración (1581)',
      paises: ['Países Bajos', 'Bélgica', 'España'],
    },
    {
      id: 'armada-invencible',
      nombre: 'La Armada Invencible',
      anioInicio: 1588,
      anioFin: 1588,
      color: '#708090',
      categoria: 'guerras',
      descripcion: 'Felipe II de España envía 130 barcos y 30.000 hombres a invadir la Inglaterra protestante de Isabel I, con el objetivo de restaurar el catolicismo. La flota española es derrotada en el Canal de la Mancha por la táctica naval inglesa —el uso de brulotes y el cañón a distancia— y posteriormente diezmada por tormentas atlánticas en la costa escocesa e irlandesa. Solo 67 barcos regresan a España. La derrota señala el declive de la hegemonía naval española y consolida el protestantismo en Inglaterra. El dominio atlántico queda progresivamente abierto a las potencias protestantes.',
      obraIconica: 'Derrota de la Armada Invencible (julio-agosto 1588)',
      paises: ['España', 'Inglaterra'],
    },
    {
      id: 'guerra-treinta-anos',
      nombre: 'La Guerra de los Treinta Años',
      anioInicio: 1618,
      anioFin: 1648,
      color: '#708090',
      categoria: 'guerras',
      descripcion: 'La Defenestración de Praga (1618) —nobles protestantes arrojan a representantes del emperador por una ventana del castillo— desencadena el conflicto más devastador de la historia europea hasta el siglo XX. Se desarrolla en cuatro fases: la bohemia (1618–1625), la danesa (1625–1629), la sueca (1630–1635) y la francesa (1635–1648), cuando Francia católica entra del lado protestante por razones geopolíticas, marcando el fin de las guerras puramente religiosas. Alemania pierde entre el 25 y el 40% de su población. La devastación es comparada con la Peste Negra del siglo XIV.',
      obraIconica: 'Defenestración de Praga (1618)',
      paises: ['Sacro Imperio Romano Germánico', 'Francia', 'Suecia', 'Dinamarca', 'España'],
    },
    {
      id: 'paz-westfalia',
      nombre: 'La Paz de Westfalia',
      anioInicio: 1648,
      anioFin: 1648,
      color: '#228B22',
      categoria: 'paz',
      descripcion: 'Los Tratados de Osnabrück y Münster (1648) ponen fin a la Guerra de los Treinta Años y a la Guerra de los Ochenta Años entre España y los Países Bajos. Representan el primer congreso diplomático multilateral moderno de la historia. El principio "cuius regio, eius religio" queda definitivamente consagrado con el reconocimiento del calvinismo. La soberanía territorial de los estados es reconocida internacionalmente, limitando la autoridad del Papa y del Emperador en asuntos seculares. El sistema westfaliano de estados soberanos e igualdad jurídica entre ellos define las relaciones internacionales durante los siguientes tres siglos.',
      obraIconica: 'Tratados de Osnabrück y Münster (1648)',
      paises: ['Sacro Imperio Romano Germánico', 'Francia', 'Suecia', 'España', 'Países Bajos'],
    },
    {
      id: 'legado-reforma',
      nombre: 'El Legado de la Reforma',
      anioInicio: 1620,
      anioFin: 1700,
      color: '#8B4513',
      categoria: 'luteranismo',
      descripcion: 'La Reforma transforma Europa más allá de lo religioso. La Biblia en lenguas vernáculas —alemán, inglés, francés— impulsa la alfabetización masiva y estandariza las lenguas nacionales. Max Weber argumentará en 1905 que la "ética protestante del trabajo" (austeridad, laboriosidad, vocación mundana) es un factor clave en el surgimiento del capitalismo. Los puritanos ingleses que huyen de la persecución anglicana embarcan en el Mayflower (1620) y fundan las colonias de Nueva Inglaterra, sembrando las bases de los futuros Estados Unidos. Baruch Spinoza y John Locke elaboran las primeras defensas filosóficas de la tolerancia religiosa como valor político universal.',
      obraIconica: 'El Mayflower zarpa hacia América (1620)',
      paises: ['Europa', 'América del Norte'],
    },
  ],

  // ─────────────────────────────────────────────
  // ERAS (6 exactamente)
  // ─────────────────────────────────────────────
  eras: [
    {
      nombre: 'El Estallido Luterano',
      desde: 1517,
      hasta: 1530,
      icono: '📜',
      hitosDestacados: [
        'Las 95 Tesis de Lutero',
      ],
      eventos: [
        '1517: Martín Lutero fija las 95 Tesis en Wittenberg el 31 de octubre',
        '1519: Debate de Leipzig entre Lutero y Johann Eck; Zuinglio inicia su reforma en Zúrich',
        '1520: Lutero publica tres tratados programáticos; la bula Exsurge Domine le amenaza con la excomunión',
        '1521: Dieta de Worms — Lutero se niega a retractarse ante el Emperador Carlos V; excomunión definitiva',
        '1521–1522: Refugiado en el castillo de Wartburg, Lutero traduce el Nuevo Testamento al alemán',
        '1524–1525: Guerra de los Campesinos en Alemania; Lutero condena la revuelta, perdiendo apoyo popular',
        '1530: Confesión de Augsburgo — primera declaración sistemática de la fe luterana ante el Emperador',
      ],
    },
    {
      nombre: 'La Diversificación Protestante y el Anglicanismo',
      desde: 1519,
      hasta: 1558,
      icono: '✝️',
      hitosDestacados: [
        'Zuinglio y Calvino: El Protestantismo se Diversifica',
        'La Reforma en Inglaterra: Enrique VIII y el Anglicanismo',
      ],
      eventos: [
        '1531: Muerte de Zuinglio en la batalla de Kappel; el protestantismo suizo se reorganiza',
        '1534: Acta de Supremacía en Inglaterra — Enrique VIII se proclama jefe de la Iglesia',
        '1534: Fundación en París de la Compañía de Jesús por Ignacio de Loyola (aprobada por el Papa en 1540)',
        '1536: Calvino publica la "Institutio Christianae Religionis" y se instala en Ginebra',
        '1545: Apertura del Concilio de Trento, primera gran respuesta católica organizada',
        '1547–1553: Eduardo VI radicaliza la Reforma anglicana; se introduce el Libro de Oración Común',
        '1553–1558: María I restaura el catolicismo en Inglaterra con persecuciones violentas',
      ],
    },
    {
      nombre: 'La Respuesta Católica: Contrarreforma',
      desde: 1540,
      hasta: 1563,
      icono: '⛪',
      hitosDestacados: [
        'La Contrarreforma: El Concilio de Trento',
      ],
      eventos: [
        '1540: Aprobación papal de la Compañía de Jesús; los jesuitas inician su expansión educativa y misionera',
        '1542: Restauración de la Inquisición romana (Santo Oficio) por Pablo III',
        '1545–1547: Primera fase del Concilio de Trento; se afirma la tradición junto a la Escritura como fuente de fe',
        '1551–1552: Segunda fase del Concilio; se reafirman los siete sacramentos y la transubstanciación',
        '1559: Primer Index de libros prohibidos publicado por Pablo IV',
        '1562–1563: Tercera y última fase del Concilio de Trento; se aprueban los decretos de reforma disciplinar del clero',
        '1568: Teresa de Ávila funda las Carmelitas Descalzas; el misticismo español florece como respuesta interior a la Reforma',
      ],
    },
    {
      nombre: 'Las Guerras de Religión en Europa Occidental',
      desde: 1562,
      hasta: 1609,
      icono: '⚔️',
      hitosDestacados: [
        'Las Guerras de Religión en Francia',
        'Los Países Bajos: La Primera República Protestante',
        'La Armada Invencible',
      ],
      eventos: [
        '1562: Primera guerra de religión en Francia; masacre de hugonotes en Vassy por el Duque de Guisa',
        '1567: El Duque de Alba instaura el "Tribunal de los Tumultos" en los Países Bajos',
        '1572: Masacre de San Bartolomé (24 agosto); miles de hugonotes asesinados en París y toda Francia',
        '1576: Edicto de Beaulieu — Enrique III concede libertades a los hugonotes bajo presión militar',
        '1579: Unión de Utrecht — siete provincias protestantes del norte de los Países Bajos se alían',
        '1581: Acta de Abjuración; las Provincias Unidas declaran la independencia de España',
        '1588: Derrota de la Armada Invencible en el Canal de la Mancha',
        '1598: Edicto de Nantes — primera ley de tolerancia religiosa en Europa occidental',
        '1609: Tregua de los Doce Años entre España y las Provincias Unidas',
      ],
    },
    {
      nombre: 'La Guerra de los Treinta Años',
      desde: 1618,
      hasta: 1648,
      icono: '💀',
      hitosDestacados: [
        'La Guerra de los Treinta Años',
        'La Armada Invencible',
      ],
      eventos: [
        '1618: Defenestración de Praga — inicio de la fase bohemia de la guerra',
        '1620: Batalla de la Montaña Blanca; los protestantes bohemios son aplastados',
        '1620: El Mayflower transporta a los puritanos ingleses a las costas de América del Norte',
        '1625: Fase danesa — el rey Cristián IV de Dinamarca interviene en favor de los protestantes',
        '1630: Suecia entra en la guerra bajo Gustavo II Adolfo; derrota al ejército imperial en Breitenfeld (1631)',
        '1632: Muerte de Gustavo II Adolfo en la batalla de Lützen; Suecia continúa la guerra',
        '1635: Francia interviene militarmente del lado protestante, convirtiendo la guerra en lucha geopolítica',
        '1643–1645: Negociaciones de paz en Osnabrück y Münster; primer congreso diplomático multilateral',
        '1648: Firma de los Tratados de Westfalia (24 octubre); fin de la Guerra de los Treinta Años',
      ],
    },
    {
      nombre: 'La Paz de Westfalia y el Nuevo Orden',
      desde: 1648,
      hasta: 1648,
      icono: '🕊️',
      hitosDestacados: [
        'La Paz de Westfalia',
        'El Legado de la Reforma',
      ],
      eventos: [
        '1648: Tratado de Osnabrück — regula las cuestiones religiosas y las relaciones entre los príncipes del Imperio',
        '1648: Tratado de Münster — España reconoce la soberanía de las Provincias Unidas',
        '1648: Reconocimiento internacional del calvinismo junto al luteranismo y el catolicismo',
        '1648: El principio de soberanía estatal limita definitivamente la autoridad del Papado en política internacional',
        '1648: Inicio del "sistema westfaliano" que organizará las relaciones internacionales hasta el siglo XX',
        '1689: Tratado de Tolerancia de John Locke — sistematización filosófica de la libertad religiosa',
        'Legado duradero: la Reforma impulsa la educación universal, las lenguas vernáculas y el pensamiento moderno',
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // CATEGORÍAS Y COLORES
  // ─────────────────────────────────────────────
  categorias: {
    luteranismo: 'Luteranismo',
    calvinismo: 'Calvinismo',
    anglicanismo: 'Anglicanismo',
    contrarreforma: 'Contrarreforma',
    guerras: 'Guerras de Religión',
    paz: 'Paz y Diplomacia',
  },

  colores: {
    luteranismo: '#8B4513',
    calvinismo: '#1E3A5F',
    anglicanismo: '#DC143C',
    contrarreforma: '#4B0082',
    guerras: '#708090',
    paz: '#228B22',
  },

  disclaimer: 'exempt',

  // ─────────────────────────────────────────────
  // EDUCATIVO v2.0
  // ─────────────────────────────────────────────
  educativo: {
    intro: 'La Reforma Protestante (1517–1648) es uno de los procesos de transformación más profundos de la historia occidental. Nació como un debate teológico sobre las indulgencias y se convirtió en una revolución que fracturó la unidad cristiana de Europa, desencadenó décadas de guerras de religión y, paradójicamente, sentó las bases del mundo moderno: el estado soberano, la tolerancia religiosa, la alfabetización masiva y el pensamiento crítico. Entender la Reforma es entender cómo la civilización europea llegó a ser lo que es hoy.',

    tablaComparativa: [
      {
        hito: 'Las 95 Tesis',
        periodo: '1517–1521',
        categoria: 'Luteranismo',
        personaje: 'Martín Lutero',
        aportacion: 'Cuestionó las indulgencias y la autoridad papal; propuso la "sola fide" (salvación solo por fe)',
      },
      {
        hito: 'Reforma en Zúrich y Ginebra',
        periodo: '1519–1564',
        categoria: 'Calvinismo',
        personaje: 'Zuinglio / Calvino',
        aportacion: 'Teología de la predestinación; ética protestante del trabajo; modelo republicano de Iglesia',
      },
      {
        hito: 'Acta de Supremacía inglesa',
        periodo: '1534',
        categoria: 'Anglicanismo',
        personaje: 'Enrique VIII',
        aportacion: 'Ruptura con Roma por motivos dinásticos; el monarca como jefe de la Iglesia nacional',
      },
      {
        hito: 'Concilio de Trento',
        periodo: '1545–1563',
        categoria: 'Contrarreforma',
        personaje: 'Pablo III / Ignacio de Loyola',
        aportacion: 'Reafirmación dogmática y reforma disciplinar interna de la Iglesia católica',
      },
      {
        hito: 'Edicto de Nantes',
        periodo: '1598',
        categoria: 'Paz y Diplomacia',
        personaje: 'Enrique IV de Francia',
        aportacion: 'Primera ley de tolerancia religiosa en Europa; fin de las guerras civiles francesas',
      },
      {
        hito: 'Paz de Westfalia',
        periodo: '1648',
        categoria: 'Paz y Diplomacia',
        personaje: 'Diplomáticos europeos',
        aportacion: 'Sistema de estados soberanos; tolerancia triconfesional; fin de la supremacía papal en política',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'El estudiante de historia',
        perfil: 'Alumno de bachillerato o universidad preparando un examen',
        texto: 'Esta cronología interactiva te permite visualizar la secuencia completa de la Reforma: desde las 95 Tesis hasta Westfalia. Usa el Tab "Período en Detalle" para estudiar cada hito con fechas exactas, actores y consecuencias. La tabla comparativa del Tab "Comparativa" es ideal para preparar esquemas de examen.',
      },
      {
        icono: '📚',
        titulo: 'El lector curioso',
        perfil: 'Persona interesada en historia sin formación académica especializada',
        texto: 'Descubrirás que la Reforma no fue solo un debate religioso sino una revolución social completa: cambió cómo los europeos leían, trabajaban, gobernaban y pensaban. El Tab "Línea del Tiempo" te da una visión de conjunto; haz clic en cada período para profundizar en los episodios más apasionantes.',
      },
      {
        icono: '🏛️',
        titulo: 'El docente',
        perfil: 'Profesor de Historia, Filosofía o Religión en secundaria o bachillerato',
        texto: 'Esta herramienta puede usarse en el aula como recurso visual complementario. El Tab "Contexto Histórico" organiza el período en seis eras con eventos contextuales que facilitan la comprensión sistémica. La tabla comparativa de seis hitos permite actividades de análisis comparado.',
      },
      {
        icono: '🔍',
        titulo: 'El investigador',
        perfil: 'Estudiante de posgrado o investigador en historia moderna',
        texto: 'El visualizador sintetiza los hitos canónicos desde una perspectiva académica neutral, describiendo a todos los actores —protestantes y católicos— con equidad analítica. Los campos "obraIconica" y "paises" de cada hito facilitan el rastreo de fuentes primarias para investigaciones comparadas.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se dice que la Reforma Protestante creó el mundo moderno?',
        respuesta: 'La Reforma desencadenó una cadena de consecuencias que van mucho más allá de lo religioso: la Biblia en lenguas vernáculas impulsó la alfabetización masiva y estandarizó los idiomas nacionales; la doctrina de la "vocación" (todo trabajo honesto como servicio a Dios) contribuyó a la ética del trabajo capitalista; la fragmentación religiosa forzó la tolerancia como necesidad política; y el cuestionamiento de la autoridad eclesiástica abrió el camino al pensamiento crítico ilustrado.',
        tip: 'La tesis de Max Weber en "La ética protestante y el espíritu del capitalismo" (1905) es el texto clásico sobre esta conexión.',
      },
      {
        pregunta: '¿Cuál fue la diferencia real entre luteranos, calvinistas y anglicanos?',
        respuesta: 'Los tres rechazaron la autoridad del Papa, pero divergieron en puntos teológicos y organizativos clave. Lutero mantuvo más elementos del catolicismo (imágenes, liturgia) y rechazó el libre albedrío frente a la gracia divina. Calvino fue más radical: eliminó todo vestigio litúrgico, instauró la predestinación absoluta y organizó la Iglesia en torno a un consistorio de ancianos (presbiterianismo). El anglicanismo fue inicialmente una ruptura política más que teológica —Enrique VIII mantuvo la doctrina católica pero rechazó al Papa—, evolucionando después hacia posiciones protestantes moderadas bajo Eduardo VI.',
        tip: 'El Colloquy de Marburgo (1529) entre Lutero y Zuinglio fracasó porque no lograron acordar la naturaleza de la Eucaristía, mostrando cuán profundas eran las diferencias dentro del propio protestantismo.',
      },
      {
        pregunta: '¿Por qué fue tan devastadora la Guerra de los Treinta Años?',
        respuesta: 'Fue devastadora por una combinación de factores: duración (30 años de conflicto casi ininterrumpido), extensión geográfica (involucró a casi toda Europa), carácter mixto (comenzó religiosa y acabó siendo geopolítica, lo que eliminó toda posibilidad de solución teológica), y el método de financiación de los ejércitos mediante el saqueo sistemático de las poblaciones civiles. Algunas regiones de Alemania perdieron hasta el 60% de su población por combates, hambre, enfermedades y emigración. Las ciudades de Magdeburgo, Augsburgo o Nördlingen quedaron prácticamente arrasadas.',
        tip: 'La novela "La madre Coraje y sus hijos" de Bertolt Brecht (1939) es una radiografía literaria de la brutalidad cotidiana de esta guerra.',
      },
      {
        pregunta: '¿Qué cambió exactamente con la Paz de Westfalia?',
        respuesta: 'Westfalia estableció tres principios fundacionales del orden internacional moderno: (1) soberanía estatal — ningún poder exterior (incluido el Papa o el Emperador) puede interferir en los asuntos internos de un estado reconocido; (2) igualdad jurídica de los estados con independencia de su tamaño o religión; (3) tolerancia triconfesional — catolicismo, luteranismo y calvinismo quedan reconocidos como legítimos en el Imperio. El Papa Inocencio X protestó contra el tratado en la bula "Zelo Domus Dei" (1648), que fue universalmente ignorada — señal elocuente del nuevo equilibrio de poder.',
      },
      {
        pregunta: '¿Fue la Contrarreforma simplemente una reacción defensiva?',
        respuesta: 'La historiografía contemporánea prefiere hablar de "Reforma Católica" para subrayar que el proceso de renovación interno de la Iglesia había comenzado antes de Lutero (con figuras como Erasmo de Róterdam o el Cardenal Cisneros en España). La Contrarreforma fue simultáneamente una respuesta a los protestantes y una reforma genuina: el Concilio de Trento mejoró efectivamente la formación del clero, redujo la corrupción y clarificó la doctrina. Los jesuitas fundaron centenares de colegios que elevaron notablemente el nivel educativo en los países católicos. La expansión misionera en América, África y Asia fue otro rasgo propio, no meramente defensivo.',
        tip: 'El arte barroco —desde Bernini hasta El Greco— fue el instrumento visual de la Contrarreforma: diseñado para provocar emoción, devoción y certeza frente al austerismo protestante.',
      },
    ],

    pasos: [
      {
        titulo: 'Comprender el contexto previo: ¿por qué estalló en 1517?',
        cuerpo: 'La Reforma no surgió de la nada. A finales del siglo XV, la Iglesia acumulaba graves problemas: el nepotismo de los papas renacentistas (Alejandro VI, Julio II), la venta masiva de cargos eclesiásticos (simonía), la ignorancia del clero rural y la corrupción generalizada. Las indulgencias eran un negocio lucrativo: el arzobispo Alberto de Brandeburgo había comprado su cargo endeudándose con los Fugger y vendía indulgencias para devolver el préstamo. Erasmo de Róterdam y otros humanistas criticaban estos abusos desde dentro. Lutero fue la chispa en un barril de pólvora ya cargado.',
      },
      {
        titulo: 'Distinguir las ramas del protestantismo',
        cuerpo: 'El protestantismo nunca fue monolítico. Ya en vida de Lutero surgieron divisiones: los reformados zuinglianos y calvinistas (más radicales en liturgia y teología), los anabaptistas (que rechazaban el bautismo infantil y cualquier alianza con el poder civil), y el anglicanismo inglés (político en su origen). Esta pluralidad fue al mismo tiempo una fortaleza (adaptabilidad local) y una debilidad (imposibilidad de presentar un frente unido frente a Roma). Calvino intentó sistematizar la teología protestante, pero la diversidad continuó multiplicándose.',
      },
      {
        titulo: 'Seguir la escalada: de la teología a la guerra',
        cuerpo: 'El paso de la controversia teológica a la guerra militar fue gradual pero inevitable en un sistema donde la religión y la política eran inseparables. La Paz de Augsburgo (1555) intentó estabilizar la situación con el principio "cuius regio, eius religio" (cada príncipe decide la religión de su territorio), pero dejó fuera al calvinismo y no resolvió la cuestión de los territorios eclesiásticos secularizados. La tensión acumulada durante décadas explotó en la Defenestración de Praga (1618).',
      },
      {
        titulo: 'Analizar la Paz de Westfalia como punto de inflexión',
        cuerpo: 'Westfalia (1648) no fue solo el fin de una guerra sino el nacimiento de un nuevo sistema político. Por primera vez, representantes de casi todos los estados europeos se reunieron durante cinco años en una negociación multilateral. Los tratados reconocieron la soberanía de entidades políticas muy distintas en tamaño y religión, estableciendo un precedente de igualdad jurídica internacional. Este "sistema westfaliano" persistirá hasta la creación de la ONU en 1945, que introduce el principio adicional de la protección internacional de los derechos humanos.',
      },
      {
        titulo: 'Evaluar el legado a largo plazo',
        cuerpo: 'El legado de la Reforma es complejo y debatido. En el haber: la alfabetización masiva (la Biblia vernácula exigía lectores), el desarrollo de las lenguas nacionales, la tolerancia religiosa como valor político, la crítica de la autoridad y el individualismo espiritual que alimenta la Ilustración. En el debe: más de un siglo de guerras devastadoras, la destrucción de patrimonio artístico medieval en los territorios iconoclastas, y la fractura comunitaria en sociedades que tardaron generaciones en cicatrizar. La historiografía actual tiende a evitar los relatos triunfalistas de cualquiera de los dos lados.',
      },
    ],

    tips: [
      {
        icono: '📖',
        texto: 'Para profundizar en Lutero, la biografía de Lyndal Roper "Martin Lutero: Renegado y Profeta" (2016) es la más completa y equilibrada en castellano disponible.',
      },
      {
        icono: '🗺️',
        texto: 'Un mapa de la distribución confesional de Europa en 1600 es imprescindible para visualizar la Reforma: el norte protestante vs. el sur y el este católicos no fue casual, sino el resultado de decenas de decisiones políticas locales.',
      },
      {
        icono: '⚖️',
        texto: 'Al estudiar la Masacre de San Bartolomé o la Inquisición, conviene comparar las cifras con fuentes académicas recientes: la historiografía ha revisado notablemente a la baja muchas estimaciones clásicas del siglo XIX, que estaban teñidas de sesgo confesional.',
      },
      {
        icono: '🎨',
        texto: 'Comparar una iglesia luterana del siglo XVII con una iglesia barroca jesuita del mismo período es un ejercicio visual extraordinario: las diferencias arquitectónicas reflejan con precisión las diferencias teológicas sobre la imagen, los sentidos y la experiencia religiosa.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir la Reforma con una revolución democrática',
        cuerpo: 'Lutero era profundamente conservador en política: condenó duramente la Guerra de los Campesinos (1524–1525) y defendió la autoridad de los príncipes. Calvino instauró en Ginebra una teocracia estricta con vigilancia moral de los ciudadanos. La tolerancia religiosa y la separación Iglesia-Estado fueron consecuencias no intencionadas de la Reforma, logradas después de décadas de guerras, no objetivos originales de los reformadores.',
      },
      {
        titulo: 'Presentar la Contrarreforma como mero conservadurismo reaccionario',
        cuerpo: 'La Reforma Católica fue un proceso genuino de renovación que mejoró efectivamente la Iglesia en muchos ámbitos. Los jesuitas fundaron los mejores sistemas educativos de su época. El misticismo español (Teresa de Ávila, Juan de la Cruz) produjo literatura espiritual de primerísimo nivel. El arte barroco es uno de los períodos más creativos de la historia del arte occidental. Reducir la Contrarreforma a "represión" es un simplismo heredado de la historiografía protestante del siglo XIX.',
      },
      {
        titulo: 'Creer que la Paz de Westfalia estableció la libertad religiosa moderna',
        cuerpo: 'Westfalia estableció tolerancia entre estados (cada príncipe elige su religión oficial) y cierta protección de las minorías confesionales existentes en 1624, pero no la libertad religiosa individual moderna. Un súbdito luterano en un territorio católico tenía algunos derechos, pero la plena libertad de conciencia individual como derecho subjetivo llegará mucho después, con la Ilustración y las revoluciones atlánticas del siglo XVIII.',
      },
      {
        titulo: 'Subestimar el papel de la imprenta en la Reforma',
        cuerpo: 'Sin la imprenta de tipos móviles de Gutenberg (c. 1450), la Reforma no habría sido posible tal como la conocemos. Las 95 Tesis se propagaron por toda Alemania en dos semanas; en dos meses, por toda Europa. Lutero fue el primer "bestseller" de la historia: sus textos representaron quizás un tercio de todos los libros vendidos en Alemania entre 1517 y 1524. La imprenta democratizó el acceso a las ideas, rompió el monopolio clerical sobre la lectura y aceleró irreversiblemente el ritmo del cambio histórico.',
      },
    ],
  },
};
