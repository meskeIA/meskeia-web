/**
 * Base de datos de preguntas — Quiz Historia de España
 * Período cubierto: época prerromana → Constitución de 1978, más un bloque breve de hitos
 * de la democracia (23-F, CEE, 1992, euro).
 * Total: 81 preguntas
 * Actualizado: 26/09/2026 — revisión de hechos del Inspector (hallazgos 2101-2124): cada
 * enunciado admite UNA sola respuesta correcta y las fechas se han cotejado con la fuente.
 *
 * Solo lo consume app/quiz-historia-espana/ (y su test de regresión).
 */

export type EpocaHistoria =
  | 'prerromana-romana'
  | 'visigoda'
  | 'al-andalus-reconquista'
  | 'reyes-catolicos-descubrimiento'
  | 'habsburgos'
  | 'borbones-siglo-xviii'
  | 'siglo-xix'
  | 'alfonso-xiii'
  | 'republica-guerra-civil'
  | 'franquismo-transicion'
  | 'democracia';

export type DificultadHistoria = 'facil' | 'medio' | 'dificil';

export interface PreguntaHistoria {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
  epoca: EpocaHistoria;
  dificultad: DificultadHistoria;
}

export const PREGUNTAS_HISTORIA: PreguntaHistoria[] = [
  // ============================================
  // ÉPOCA PRERROMANA Y ROMANA
  // ============================================
  {
    id: 1,
    pregunta: '¿Cómo llamaban los romanos a la Península Ibérica?',
    opciones: ['Hispania', 'Iberia', 'Lusitania', 'Gallia'],
    correcta: 'Hispania',
    explicacion: 'Roma dividió la Península en provincias bajo el nombre general de Hispania. Iberia era el nombre griego más antiguo; Lusitania era una provincia romana que abarcaba buena parte del actual Portugal y de Extremadura.',
    epoca: 'prerromana-romana',
    dificultad: 'facil',
  },
  {
    id: 2,
    pregunta: '¿Qué pueblo construyó el famoso acueducto de Segovia?',
    opciones: ['Los romanos', 'Los visigodos', 'Los árabes', 'Los celtas'],
    correcta: 'Los romanos',
    explicacion: 'El acueducto de Segovia fue construido por los romanos, probablemente en el siglo I o II d.C. Es uno de los monumentos romanos mejor conservados de España.',
    epoca: 'prerromana-romana',
    dificultad: 'facil',
  },
  {
    id: 3,
    pregunta: '¿Qué general cartaginés cruzó los Alpes con elefantes partiendo desde Hispania?',
    opciones: ['Aníbal Barca', 'Amílcar Barca', 'Asdrúbal', 'Escipión'],
    correcta: 'Aníbal Barca',
    explicacion: 'Aníbal Barca partió desde Carthago Nova (Cartagena) en el año 218 a.C. con su ejército y elefantes para atacar Roma cruzando los Alpes, en lo que se conoce como la Segunda Guerra Púnica.',
    epoca: 'prerromana-romana',
    dificultad: 'medio',
  },
  {
    id: 4,
    pregunta: '¿En qué año fue destruida Numancia por el general romano Escipión Emiliano?',
    opciones: ['133 a.C.', '218 a.C.', '45 a.C.', '19 a.C.'],
    correcta: '133 a.C.',
    explicacion: 'Numancia, ciudad celtíbera situada cerca de la actual Soria, resistió durante años el asedio romano. En el 133 a.C., Escipión Emiliano la tomó tras un largo cerco y la arrasó. Su resistencia se convirtió en un símbolo recurrente en la literatura y el arte posteriores.',
    epoca: 'prerromana-romana',
    dificultad: 'dificil',
  },
  {
    id: 5,
    pregunta: '¿En qué ciudad hispanorromana nació el emperador romano Trajano?',
    opciones: ['Itálica (cerca de Sevilla)', 'Carthago Nova (Cartagena)', 'Caesar Augusta (Zaragoza)', 'Emerita Augusta (Mérida)'],
    correcta: 'Itálica (cerca de Sevilla)',
    explicacion: 'El emperador Trajano (53-117 d.C.), bajo cuyo mandato el Imperio Romano alcanzó su máxima extensión, nació en Itálica, ciudad romana situada cerca de la actual Santiponce (Sevilla). También el emperador Adriano era originario de esta ciudad.',
    epoca: 'prerromana-romana',
    dificultad: 'medio',
  },

  // ============================================
  // ÉPOCA VISIGODA
  // ============================================
  {
    id: 6,
    // Antes: «¿Qué pueblo germánico estableció un reino en la Península…?» con «Los suevos» como
    // opción errónea, cuando los suevos tuvieron su reino en Gallaecia (409-585): dos correctas.
    pregunta: '¿Qué pueblo germánico formó el reino que dominó la mayor parte de la Península Ibérica entre los siglos VI y VIII?',
    opciones: ['Los visigodos', 'Los vándalos', 'Los francos', 'Los ostrogodos'],
    correcta: 'Los visigodos',
    explicacion: 'Los visigodos se asentaron en la Península a partir del siglo V y, desde mediados del VI, gobernaron con capital en Toledo. En 585 Leovigildo incorporó el reino suevo de Gallaecia, el otro reino germánico peninsular. El reino visigodo se mantuvo hasta la invasión musulmana del año 711. Los vándalos solo pasaron por la Península (409-429) antes de instalarse en el norte de África.',
    epoca: 'visigoda',
    dificultad: 'facil',
  },
  {
    id: 7,
    pregunta: '¿Cuál fue la capital del reino visigodo en la Península Ibérica?',
    opciones: ['Toledo', 'Sevilla', 'Mérida', 'Zaragoza'],
    correcta: 'Toledo',
    explicacion: 'Toledo fue la capital del reino visigodo desde el siglo VI hasta la conquista musulmana en 711. Durante este período celebró importantes concilios eclesiásticos que regularon la vida del reino.',
    epoca: 'visigoda',
    dificultad: 'medio',
  },
  {
    id: 8,
    pregunta: '¿En qué año los árabes cruzaron el estrecho de Gibraltar y derrotaron al último rey visigodo, Rodrigo?',
    opciones: ['711', '732', '622', '800'],
    correcta: '711',
    explicacion: 'En el año 711, el caudillo bereber Tariq ibn Ziyad cruzó el estrecho (que hoy lleva su nombre, Jabal Tariq = Gibraltar) y derrotó al rey visigodo Rodrigo en la batalla de Guadalete. En pocos años, los musulmanes controlaron casi toda la Península.',
    epoca: 'visigoda',
    dificultad: 'facil',
  },

  // ============================================
  // AL-ÁNDALUS Y RECONQUISTA
  // ============================================
  {
    id: 9,
    pregunta: '¿Qué nombre recibió la España árabe durante la Edad Media?',
    opciones: ['Al-Ándalus', 'Califato', 'Morería', 'Al-Magreb'],
    correcta: 'Al-Ándalus',
    explicacion: 'Al-Ándalus fue el nombre que los musulmanes dieron a los territorios de la Península Ibérica que controlaron entre los siglos VIII y XV. La palabra es de origen incierto, posiblemente relacionada con los vándalos.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 10,
    pregunta: '¿Cuál fue la capital del Califato de Córdoba?',
    opciones: ['Córdoba', 'Granada', 'Sevilla', 'Toledo'],
    correcta: 'Córdoba',
    explicacion: 'Córdoba fue la capital del Califato de Córdoba, uno de los centros culturales y científicos más importantes de Europa y del mundo islámico. El Califato duró de 929 (proclamación de Abderramán III) a 1031, es decir, el siglo X y los comienzos del XI. Córdoba fue una de las ciudades más pobladas de Europa en su época.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 11,
    pregunta: '¿En qué batalla de 722 comenzó la Reconquista según la tradición cristiana?',
    opciones: ['Covadonga', 'Las Navas de Tolosa', 'El Guadalete', 'Poitiers'],
    correcta: 'Covadonga',
    explicacion: 'La batalla de Covadonga (722), en Asturias, donde el noble visigodo Pelayo derrotó a una expedición musulmana, es considerada el inicio simbólico de la Reconquista. Pelayo fundó el Reino de Asturias.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 12,
    pregunta: '¿Cómo se llamaba el héroe castellano del siglo XI conocido como "El Cid Campeador"?',
    opciones: ['Rodrigo Díaz de Vivar', 'Fernán González', 'Sancho de Castilla', 'Bernardo del Carpio'],
    correcta: 'Rodrigo Díaz de Vivar',
    explicacion: 'Rodrigo Díaz de Vivar (c. 1043-1099), conocido como El Cid, fue un noble y militar castellano que conquistó Valencia. Sus hazañas se inmortalizaron en el "Cantar de Mio Cid", la obra más importante del mester de juglaría en castellano.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 13,
    pregunta: '¿En qué siglo tuvo lugar la decisiva Batalla de las Navas de Tolosa que debilitó el poder almohade?',
    opciones: ['Siglo XIII (1212)', 'Siglo XII (1150)', 'Siglo XIV (1340)', 'Siglo XI (1085)'],
    correcta: 'Siglo XIII (1212)',
    explicacion: 'La Batalla de Las Navas de Tolosa (1212) fue una victoria decisiva de los reinos cristianos de Castilla, Aragón y Navarra contra los almohades. Esta derrota aceleró el declive del poder musulmán en la Península.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'medio',
  },
  {
    id: 14,
    pregunta: '¿Qué monumento islámico fue construido en Granada entre los siglos XIII y XIV?',
    opciones: ['La Alhambra', 'La Mezquita de Córdoba', 'La Giralda', 'El Alcázar de Sevilla'],
    correcta: 'La Alhambra',
    explicacion: 'La Alhambra de Granada fue construida principalmente en los siglos XIII y XIV por los reyes nazaríes. Es el monumento árabe mejor conservado de España y uno de los destinos turísticos más visitados del mundo.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 15,
    pregunta: '¿En qué año se completó la Reconquista con la toma de Granada por los Reyes Católicos?',
    opciones: ['1492', '1479', '1512', '1500'],
    correcta: '1492',
    explicacion: 'El 2 de enero de 1492, el rey Boabdil entregó las llaves de Granada a los Reyes Católicos, poniendo fin al último reino musulmán en la Península y completando la Reconquista tras casi ocho siglos.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'facil',
  },
  {
    id: 16,
    pregunta: '¿En qué año Alfonso VI de Castilla conquistó Toledo, antigua capital visigoda?',
    opciones: ['1085', '1099', '1150', '1050'],
    correcta: '1085',
    explicacion: 'La conquista de Toledo en 1085 por Alfonso VI fue un hito fundamental de la Reconquista. Toledo se convirtió en un centro de traducción del árabe al latín, transmitiendo el saber clásico a Europa.',
    epoca: 'al-andalus-reconquista',
    dificultad: 'dificil',
  },

  // ============================================
  // REYES CATÓLICOS Y DESCUBRIMIENTO
  // ============================================
  {
    id: 17,
    pregunta: '¿Quiénes eran los Reyes Católicos?',
    opciones: ['Fernando de Aragón e Isabel de Castilla', 'Carlos I y Juana la Loca', 'Alfonso X y Leonor', 'Felipe II y Ana de Austria'],
    correcta: 'Fernando de Aragón e Isabel de Castilla',
    explicacion: 'Los Reyes Católicos, Fernando II de Aragón e Isabel I de Castilla, unieron las dos coronas más poderosas de la Península con su matrimonio (1469). Bajo su reinado se completó la Reconquista, se descubrió América y se expulsó a los judíos.',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'facil',
  },
  {
    id: 18,
    pregunta: '¿En qué año llegó Cristóbal Colón a América?',
    opciones: ['1492', '1498', '1482', '1502'],
    correcta: '1492',
    explicacion: 'El 12 de octubre de 1492, Cristóbal Colón llegó a una isla caribeña que los nativos llamaban Guanahaní y que él bautizó como San Salvador, en las actuales Bahamas. Aquel viaje abrió la conquista y colonización europeas de América, con consecuencias muy graves para sus pueblos indígenas. La fecha se conmemora de forma distinta a cada lado del Atlántico: en España es la Fiesta Nacional (Ley 18/1987), tradicionalmente llamada Día de la Hispanidad; en Argentina es el Día del Respeto a la Diversidad Cultural (desde 2010) y en Venezuela el Día de la Resistencia Indígena (desde 2002).',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'facil',
  },
  {
    id: 19,
    pregunta: '¿Qué institución crearon los Reyes Católicos en 1478 para vigilar la ortodoxia religiosa?',
    opciones: ['La Inquisición española', 'El Consejo de Castilla', 'La Santa Hermandad', 'El Tribunal de Valladolid'],
    correcta: 'La Inquisición española',
    explicacion: 'La Inquisición española, fundada en 1478 con bula del papa Sixto IV, se encargó de perseguir la herejía, especialmente entre los conversos del judaísmo y el islam. Fue abolida definitivamente en 1834.',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'medio',
  },
  {
    id: 20,
    // Antes: «…el matrimonio que unió ambas coronas», con 1479 entre las erróneas: el matrimonio
    // no unió las coronas; eso ocurrió en 1479. Se pregunta solo por la boda.
    pregunta: '¿En qué año se casaron Fernando de Aragón e Isabel de Castilla?',
    opciones: ['1469', '1479', '1460', '1492'],
    correcta: '1469',
    explicacion: 'Fernando e Isabel se casaron el 19 de octubre de 1469 en Valladolid. Las dos coronas no quedaron en manos de la misma pareja real hasta que ambos heredaron: Isabel la de Castilla en 1474 y Fernando la de Aragón en 1479. Fue una unión dinástica: cada reino conservó sus leyes e instituciones.',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'medio',
  },
  {
    id: 21,
    pregunta: '¿Qué navegante completó la primera vuelta al mundo tras la muerte de Magallanes?',
    opciones: ['Juan Sebastián Elcano', 'Vasco de Gama', 'Américo Vespucio', 'Hernán Cortés'],
    correcta: 'Juan Sebastián Elcano',
    explicacion: 'Juan Sebastián Elcano, marino vasco, completó la primera circunnavegación de la Tierra en 1522 tras la muerte de Magallanes en Filipinas. Carlos I le concedió el escudo con el lema "Primus circumdedisti me" (El primero que me rodeaste).',
    // 1519-1522: reinado de Carlos I, no de los Reyes Católicos.
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 22,
    pregunta: '¿Qué conquistador español sometió el Imperio Azteca entre 1519 y 1521?',
    opciones: ['Hernán Cortés', 'Francisco Pizarro', 'Bernal Díaz del Castillo', 'Diego de Almagro'],
    correcta: 'Hernán Cortés',
    explicacion: 'Hernán Cortés, con un pequeño ejército y el apoyo de pueblos indígenas enemigos de los aztecas, conquistó Tenochtitlán (actual Ciudad de México) entre 1519 y 1521, poniendo fin al Imperio Azteca de Moctezuma.',
    epoca: 'habsburgos',
    dificultad: 'facil',
  },
  {
    id: 23,
    pregunta: '¿Qué conquistador español sometió el Imperio Inca en la década de 1530?',
    opciones: ['Francisco Pizarro', 'Hernán Cortés', 'Pedro de Alvarado', 'Vasco Núñez de Balboa'],
    correcta: 'Francisco Pizarro',
    explicacion: 'Francisco Pizarro conquistó el Imperio Inca entre 1532 y 1535. Capturó y ejecutó al inca Atahualpa, obteniendo un enorme rescate en oro y plata antes de matarle. Fundó la ciudad de Lima en 1535.',
    epoca: 'habsburgos',
    dificultad: 'facil',
  },
  {
    id: 24,
    pregunta: '¿En qué año se firmó el Tratado de Tordesillas que dividió el mundo entre España y Portugal?',
    opciones: ['1494', '1492', '1500', '1510'],
    correcta: '1494',
    explicacion: 'El Tratado de Tordesillas (1494) dividió las zonas de exploración y colonización del mundo entre Castilla y Portugal mediante una línea a 370 leguas al oeste de Cabo Verde. Esta división ayuda a explicar por qué en Brasil se habla portugués.',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'dificil',
  },

  // ============================================
  // HABSBURGOS (SIGLOS XVI-XVII)
  // ============================================
  {
    id: 25,
    // Antes: «primer rey de la dinastía Habsburgo en gobernar España», con Felipe I el Hermoso
    // como opción errónea sin matiz, cuando reinó en Castilla en 1506. Se pregunta por las dos
    // coronas a la vez, que es lo que solo cumple Carlos I.
    pregunta: '¿Quién fue el primer rey de la dinastía Habsburgo que reinó a la vez en las coronas de Castilla y de Aragón?',
    opciones: ['Carlos I (Carlos V del Sacro Imperio)', 'Felipe II', 'Felipe I "el Hermoso"', 'Fernando I de Austria'],
    correcta: 'Carlos I (Carlos V del Sacro Imperio)',
    explicacion: 'Carlos I (rey desde 1516, junto a su madre Juana, hasta 1556), nieto de los Reyes Católicos, fue el primer Habsburgo que reinó en Castilla y en Aragón a la vez. Su padre, Felipe I el Hermoso, ya había sido rey de Castilla junto a Juana en 1506, durante unos meses y solo en Castilla: fue quien introdujo la casa de Habsburgo en la Península. Carlos heredó además el Sacro Imperio Romano Germánico como Carlos V.',
    epoca: 'habsburgos',
    dificultad: 'facil',
  },
  {
    id: 26,
    // Antes: «…siendo "el rey en cuyos dominios nunca se ponía el sol"», frase que se aplicó
    // también a Carlos I (opción errónea), y «mayor extensión», que depende de cómo se mida.
    pregunta: '¿Qué rey incorporó en 1580 la corona de Portugal y su imperio a la Monarquía Hispánica?',
    opciones: ['Felipe II', 'Carlos I', 'Felipe III', 'Felipe IV'],
    correcta: 'Felipe II',
    explicacion: 'Felipe II (1556-1598) heredó de su padre Carlos I un vasto conjunto de territorios. En 1580, tras la muerte sin descendencia del rey Sebastián y de su tío Enrique, hizo valer sus derechos al trono portugués y sumó los dominios portugueses de África, Asia y Brasil. La unión de ambas coronas duró hasta 1640. De ahí la frase de que en sus dominios «nunca se ponía el sol», que también se aplicó a Carlos I.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 27,
    pregunta: '¿En qué batalla de 1571 la flota española y sus aliados derrotaron al Imperio Otomano?',
    opciones: ['Batalla de Lepanto', 'Batalla de Gravelines', 'Batalla de San Quintín', 'Batalla de Mühlberg'],
    correcta: 'Batalla de Lepanto',
    explicacion: 'La batalla de Lepanto (7 de octubre de 1571) fue la mayor victoria naval del siglo XVI. La Liga Santa, liderada por don Juan de Austria (hijo natural de Carlos I), derrotó a la flota otomana, frenando su expansión en el Mediterráneo occidental.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 28,
    // Antes: «¿Cómo se conoce la gran flota…?» con «La Gran Armada» como opción errónea, cuando
    // es el nombre que usa la historiografía: dos correctas. Se pregunta por el APODO posterior.
    pregunta: '¿Con qué sobrenombre, surgido después de su fracaso, se conoce popularmente la «Grande y Felicísima Armada» que Felipe II envió contra Inglaterra en 1588?',
    opciones: ['La Armada Invencible', 'La Flota de Indias', 'La Liga Santa', 'La Escuadra de Levante'],
    correcta: 'La Armada Invencible',
    explicacion: 'Su nombre oficial era «Grande y Felicísima Armada», y los historiadores suelen llamarla Gran Armada; el sobrenombre de «Invencible» se popularizó después, con ironía, tras la derrota. Con unos 130 barcos y cerca de 30.000 hombres, fue enviada por Felipe II para invadir la Inglaterra de Isabel I y fracasó por la acción de la flota inglesa y por los temporales. La Flota de Indias era el sistema de convoyes con América y la Liga Santa, la alianza que venció en Lepanto (1571).',
    epoca: 'habsburgos',
    dificultad: 'facil',
  },
  {
    id: 29,
    pregunta: '¿Qué pintor español del Siglo de Oro fue el principal retratista de la corte de Felipe IV?',
    opciones: ['Diego Velázquez', 'El Greco', 'Francisco Zurbarán', 'Bartolomé Esteban Murillo'],
    correcta: 'Diego Velázquez',
    explicacion: 'Diego Velázquez (1599-1660) fue el pintor de cámara de Felipe IV. Sus obras más célebres incluyen "Las Meninas", "La rendición de Breda" y numerosos retratos reales. Es considerado uno de los más grandes pintores de la historia.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 30,
    pregunta: '¿En qué año se firmó el Tratado de Westfalia que marcó el inicio del declive del poder español en Europa?',
    opciones: ['1648', '1659', '1700', '1665'],
    correcta: '1648',
    explicacion: 'El Tratado de Westfalia (1648) puso fin a la Guerra de los Treinta Años. España reconoció la independencia de los Países Bajos y cedió territorios. Marcó el inicio de la hegemonía francesa sobre la española en Europa.',
    epoca: 'habsburgos',
    dificultad: 'dificil',
  },
  {
    id: 31,
    pregunta: '¿En qué año se publicó la primera parte de "Don Quijote de la Mancha" de Miguel de Cervantes?',
    opciones: ['1605', '1615', '1580', '1621'],
    correcta: '1605',
    explicacion: 'La primera parte del "Don Quijote" fue publicada en 1605; la segunda en 1615. Considerada la primera novela moderna, es la obra más traducida y editada de la literatura en español y una de las más importantes de la literatura universal.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },

  // ============================================
  // BORBONES Y SIGLO XVIII
  // ============================================
  {
    id: 32,
    pregunta: '¿Qué guerra estalló en España al morir Carlos II (el Hechizado) sin heredero en 1700?',
    opciones: ['Guerra de Sucesión española', 'Guerra de los Treinta Años', 'Guerra de la Cuádruple Alianza', 'Guerra del Norte'],
    correcta: 'Guerra de Sucesión española',
    explicacion: 'La Guerra de Sucesión española (1701-1714) enfrentó a los partidarios del archiduque Carlos de Austria contra los del duque de Anjou (Felipe V de Borbón). Terminó con el Tratado de Utrecht, que reconoció a Felipe V como rey pero España perdió territorios europeos.',
    epoca: 'borbones-siglo-xviii',
    dificultad: 'medio',
  },
  {
    id: 33,
    pregunta: '¿Qué tratado (1713) reconoció a Felipe V como primer rey Borbón de España a cambio de ceder Gibraltar?',
    opciones: ['Tratado de Utrecht', 'Tratado de Westfalia', 'Tratado de Rastatt', 'Tratado de París'],
    correcta: 'Tratado de Utrecht',
    explicacion: 'El Tratado de Utrecht (1713) puso fin a la Guerra de Sucesión española. Felipe V fue reconocido rey de España a cambio de renunciar al trono francés, y la monarquía perdió sus posesiones europeas: Gibraltar y Menorca pasaron a Gran Bretaña y Sicilia a Saboya; los Países Bajos españoles, Milán, Nápoles y Cerdeña quedaron para Austria (acuerdos de Utrecht y Rastatt, 1713-1714). Gran Bretaña obtuvo además el «asiento», el monopolio del tráfico de personas esclavizadas africanas hacia la América española, y el navío de permiso.',
    epoca: 'borbones-siglo-xviii',
    dificultad: 'medio',
  },
  {
    id: 34,
    pregunta: '¿Qué rey borbónico del siglo XVIII fue conocido como el "mejor alcalde de Madrid" por sus reformas ilustradas?',
    opciones: ['Carlos III', 'Felipe V', 'Fernando VI', 'Carlos IV'],
    correcta: 'Carlos III',
    explicacion: 'Carlos III (1759-1788) fue el rey ilustrado por excelencia en España. Modernizó Madrid con alumbrado público, alcantarillas y el Paseo del Prado. También impulsó reformas en la administración, economía y enseñanza, con ministros como Campomanes y Floridablanca.',
    epoca: 'borbones-siglo-xviii',
    dificultad: 'medio',
  },
  {
    id: 35,
    pregunta: '¿Qué documento legal unificó las leyes de Aragón y Castilla, aboliendo los fueros aragoneses tras la Guerra de Sucesión?',
    opciones: ['Decretos de Nueva Planta', 'Constitución de Cádiz', 'Recopilación de Leyes', 'Estatuto de Bayona'],
    correcta: 'Decretos de Nueva Planta',
    explicacion: 'Los Decretos de Nueva Planta (1707-1716) emitidos por Felipe V abolieron los fueros e instituciones propias de Aragón y Valencia (1707), Mallorca (1715) y Cataluña (1716), imponiendo el modelo administrativo castellano en la Corona de Aragón como castigo a su apoyo al archiduque Carlos. Navarra y las provincias vascas, que apoyaron a Felipe V, conservaron sus fueros.',
    epoca: 'borbones-siglo-xviii',
    dificultad: 'dificil',
  },

  // ============================================
  // SIGLO XIX
  // ============================================
  {
    id: 36,
    pregunta: '¿En qué año comenzó la Guerra de la Independencia española contra las tropas de Napoleón?',
    opciones: ['1808', '1812', '1814', '1805'],
    correcta: '1808',
    explicacion: 'El 2 de mayo de 1808, el pueblo de Madrid se levantó contra las tropas francesas. Este hecho, inmortalizado por Goya en sus pinturas, marca el inicio de la Guerra de la Independencia española (1808-1814), que anticipó la guerrilla moderna.',
    epoca: 'siglo-xix',
    dificultad: 'facil',
  },
  {
    id: 37,
    // Antes: «¿Cuál fue la primera constitución española, aprobada en Cádiz en 1812?»: el propio
    // enunciado daba la respuesta y el Estatuto de Bayona (1808), opción errónea, se cita a menudo
    // como el primer texto constitucional. Se pregunta por el apodo.
    pregunta: '¿Con qué nombre popular se conoce la Constitución aprobada por las Cortes de Cádiz en 1812?',
    opciones: ['La Pepa', 'La Gloriosa', 'La Non Nata', 'La Niña Bonita'],
    correcta: 'La Pepa',
    explicacion: 'La Constitución de 1812 fue apodada "La Pepa" por promulgarse el día de San José (19 de marzo). Es la primera constitución aprobada en España por una asamblea que se atribuía la soberanía nacional; el Estatuto de Bayona (1808) fue una carta otorgada por José I. Estableció la soberanía nacional, la separación de poderes y la monarquía constitucional, y fue un referente del liberalismo europeo e hispanoamericano. «La Gloriosa» es la revolución de 1868, «La Non Nata» la constitución de 1856, que no llegó a promulgarse, y «La Niña Bonita», el apodo popular de la Segunda República.',
    epoca: 'siglo-xix',
    dificultad: 'medio',
  },
  {
    id: 38,
    pregunta: '¿Cómo se denomina la serie de guerras civiles entre liberales y absolutistas carlistas en el siglo XIX español?',
    opciones: ['Guerras Carlistas', 'Guerras Civiles Decimonónicas', 'Guerras Dinásticas', 'Guerras de Religión'],
    correcta: 'Guerras Carlistas',
    explicacion: 'Las Guerras Carlistas (tres conflictos: 1833-40, 1846-49 y 1872-76) enfrentaron a los partidarios de don Carlos (absolutistas, Iglesia, fueros vascos y navarros) contra los liberales que apoyaban a Isabel II y la monarquía constitucional.',
    epoca: 'siglo-xix',
    dificultad: 'medio',
  },
  {
    id: 39,
    pregunta: '¿Qué revolución de 1868 destronó a la reina Isabel II?',
    opciones: ['La Gloriosa (La Revolución Gloriosa)', 'La Primera República', 'El Sexenio Liberal', 'La Revolución de Julio'],
    correcta: 'La Gloriosa (La Revolución Gloriosa)',
    explicacion: 'La Gloriosa (septiembre de 1868) fue un pronunciamiento militar liderado por los generales Prim y Serrano que obligó a Isabel II a exiliarse en Francia. Abrió el Sexenio Democrático (1868-1874), que incluyó la Primera República española.',
    epoca: 'siglo-xix',
    dificultad: 'medio',
  },
  {
    id: 40,
    pregunta: '¿En qué año se proclamó la Primera República Española?',
    opciones: ['1873', '1868', '1875', '1869'],
    correcta: '1873',
    explicacion: 'La Primera República española fue proclamada el 11 de febrero de 1873 tras la abdicación de Amadeo I. Duró menos de un año (hasta enero de 1874) y tuvo cuatro presidentes. Fue muy inestable, con el problema cantonal y las guerras carlista y cubana.',
    epoca: 'siglo-xix',
    dificultad: 'dificil',
  },
  {
    id: 41,
    // Antes: «…sus últimas colonias» y «cedió Cuba… a Estados Unidos»: ni fueron las últimas ni
    // Cuba se cedió (Tratado de París, art. I: España RENUNCIA a la soberanía sobre Cuba).
    pregunta: '¿En qué año perdió España Cuba, Puerto Rico y Filipinas tras su guerra con Estados Unidos?',
    opciones: ['1898', '1868', '1895', '1902'],
    correcta: '1898',
    explicacion: 'Tras la guerra de independencia cubana (iniciada en 1895) y la intervención de Estados Unidos en 1898, el Tratado de París (10 de diciembre de 1898) puso fin al conflicto: España renunció a la soberanía sobre Cuba y cedió a Estados Unidos Puerto Rico, Guam y Filipinas. No fueron sus últimos territorios coloniales: en 1899 vendió a Alemania las Carolinas, las Marianas y Palaos, y mantuvo posesiones en África hasta el siglo XX (Guinea Ecuatorial se independizó en 1968). El llamado «Desastre del 98» abrió una profunda crisis intelectual y política, de la que surgió la Generación del 98.',
    epoca: 'siglo-xix',
    dificultad: 'facil',
  },
  {
    id: 42,
    // Antes: «período… basado en la alternancia de partidos (1874-1931)», con «El Turno Pacífico»
    // (la alternancia misma) y «El Reinado de Alfonso XII» como erróneas: ambas encajaban a medias.
    pregunta: '¿Qué nombre recibe el período que comenzó en 1874 con el regreso de los Borbones al trono en la persona de Alfonso XII?',
    opciones: ['La Restauración', 'La Regencia', 'El Sexenio Democrático', 'La Década Moderada'],
    correcta: 'La Restauración',
    explicacion: 'La Restauración borbónica comenzó en diciembre de 1874 con el pronunciamiento de Martínez Campos en Sagunto, que devolvió el trono a Alfonso XII, hijo de Isabel II, y se prolongó con Alfonso XIII (hasta 1923, o hasta 1931 según se cuente la dictadura de Primo de Rivera). Su arquitecto, Cánovas del Castillo, ideó el "turno pacífico": la alternancia pactada entre conservadores y liberales, sostenida en buena medida por el caciquismo y el fraude electoral.',
    epoca: 'siglo-xix',
    dificultad: 'dificil',
  },
  {
    id: 43,
    pregunta: '¿Qué fue la Semana Trágica de Barcelona en 1909?',
    opciones: ['Una revuelta popular contra el reclutamiento para la guerra de Marruecos', 'Un atentado anarquista contra el rey', 'Una huelga general revolucionaria', 'Un bombardeo naval francés'],
    correcta: 'Una revuelta popular contra el reclutamiento para la guerra de Marruecos',
    explicacion: 'La Semana Trágica (26-31 julio 1909) fue una insurrección popular en Barcelona provocada por el envío de reservistas a la guerra de Marruecos. Hubo quema de conventos, enfrentamientos y más de 100 muertos. La represión incluyó la ejecución de Francisco Ferrer Guardia.',
    epoca: 'alfonso-xiii',
    dificultad: 'dificil',
  },

  // ============================================
  // SEGUNDA REPÚBLICA Y GUERRA CIVIL
  // ============================================
  {
    id: 44,
    pregunta: '¿Cuándo se proclamó la Segunda República Española?',
    opciones: ['14 de abril de 1931', '12 de octubre de 1930', '1 de enero de 1932', '18 de julio de 1936'],
    correcta: '14 de abril de 1931',
    explicacion: 'El 14 de abril de 1931, tras la victoria de los partidos republicanos en las elecciones municipales, Alfonso XIII abandonó España y se proclamó la Segunda República. Niceto Alcalá-Zamora fue su primer presidente.',
    epoca: 'republica-guerra-civil',
    dificultad: 'medio',
  },
  {
    id: 45,
    pregunta: '¿En qué año comenzó la Guerra Civil Española?',
    opciones: ['1936', '1934', '1938', '1931'],
    correcta: '1936',
    explicacion: 'La Guerra Civil española comenzó con el alzamiento militar del 17-18 de julio de 1936 contra el gobierno de la Segunda República. El conflicto duró hasta el 1 de abril de 1939, cuando Franco declaró su victoria.',
    epoca: 'republica-guerra-civil',
    dificultad: 'facil',
  },
  {
    id: 46,
    pregunta: '¿Qué ciudad vasca fue bombardeada por la aviación alemana en 1937, inspirando un famoso cuadro de Picasso?',
    opciones: ['Guernica', 'Bilbao', 'Vitoria', 'San Sebastián'],
    correcta: 'Guernica',
    explicacion: 'El 26 de abril de 1937, la Legión Cóndor alemana y la Aviación Legionaria italiana bombardearon Guernica, villa de gran valor simbólico para los vascos por su árbol, emblema de los fueros. El cuadro "Guernica" de Pablo Picasso, expuesto ese mismo año en París, se convirtió en el símbolo universal contra la barbarie de la guerra.',
    epoca: 'republica-guerra-civil',
    dificultad: 'facil',
  },
  {
    id: 47,
    pregunta: '¿Qué potencia extranjera apoyó principalmente al bando republicano durante la Guerra Civil?',
    opciones: ['La Unión Soviética', 'Francia', 'México y Francia', 'Gran Bretaña'],
    correcta: 'La Unión Soviética',
    explicacion: 'La URSS fue el principal proveedor de armas al bando republicano, a cambio de las reservas de oro del Banco de España. Brigadas Internacionales de voluntarios de todo el mundo también combatieron por la República. Alemania e Italia apoyaron a Franco.',
    epoca: 'republica-guerra-civil',
    dificultad: 'medio',
  },
  {
    id: 48,
    pregunta: '¿Cómo se llamó el cuerpo de aviación alemana que apoyó a Franco durante la Guerra Civil?',
    opciones: ['La Legión Cóndor', 'La Luftwaffe', 'El Cuerpo de Aviación del Reich', 'La Escuadrilla Aérea'],
    correcta: 'La Legión Cóndor',
    explicacion: 'La Legión Cóndor fue la unidad de las fuerzas aéreas alemanas (Luftwaffe) enviada por Hitler para apoyar a Franco. Usó España como campo de pruebas para nuevas tácticas y armas, incluyendo el bombardeo de Guernica.',
    epoca: 'republica-guerra-civil',
    dificultad: 'medio',
  },
  {
    id: 49,
    pregunta: '¿Cuál fue la gran batalla de 1938 que supuso el último gran intento ofensivo republicano?',
    opciones: ['Batalla del Ebro', 'Batalla de Madrid', 'Batalla de Guadalajara', 'Batalla del Jarama'],
    correcta: 'Batalla del Ebro',
    explicacion: 'La Batalla del Ebro (julio-noviembre 1938) fue la batalla más larga y sangrienta de la Guerra Civil. El ejército republicano cruzó el río Ebro en un último intento de revertir la guerra. Tras cuatro meses de combates, los republicanos fueron derrotados.',
    epoca: 'republica-guerra-civil',
    dificultad: 'dificil',
  },
  {
    id: 50,
    pregunta: '¿En qué año terminó la Guerra Civil Española?',
    opciones: ['1939', '1940', '1938', '1941'],
    correcta: '1939',
    explicacion: 'La Guerra Civil española terminó el 1 de abril de 1939 con el último parte de guerra de Franco: "En el día de hoy, cautivo y desarmado el ejército rojo, han alcanzado las tropas nacionales sus últimos objetivos militares. La guerra ha terminado."',
    epoca: 'republica-guerra-civil',
    dificultad: 'facil',
  },
  {
    id: 51,
    // Antes: «¿Qué Estatuto… fue aprobado en 1932?» → «Estatuto de Nuria»: el de Núria fue el
    // PROYECTO de 1931; las Cortes aprobaron en 1932 otro texto. Se pregunta por el proyecto.
    pregunta: '¿Cómo se conoce el proyecto de Estatuto de Autonomía de Cataluña refrendado en 1931, del que salió el Estatuto aprobado por las Cortes en 1932?',
    opciones: ['Estatuto de Núria', 'Estatuto de Sau', 'Bases de Manresa', 'Estatuto de Gernika'],
    correcta: 'Estatuto de Núria',
    explicacion: 'El proyecto redactado en Núria fue aprobado en referéndum en Cataluña el 2 de agosto de 1931. Las Cortes de la Segunda República lo reformaron a fondo (de 52 a 18 artículos) y aprobaron el Estatuto de Autonomía de Cataluña el 9 de septiembre de 1932, que estableció la Generalitat como gobierno autonómico. Fue suspendido en 1934, tras los hechos de octubre, restablecido en 1936 y derogado por Franco el 5 de abril de 1938. En la Transición no se recuperó ese texto: se restableció provisionalmente la Generalitat (1977) y se aprobó un estatuto nuevo, el de Sau (1979). Las Bases de Manresa (1892) fueron un programa catalanista, no un estatuto.',
    epoca: 'republica-guerra-civil',
    dificultad: 'dificil',
  },

  // ============================================
  // FRANQUISMO Y TRANSICIÓN
  // ============================================
  {
    id: 52,
    pregunta: '¿En qué año murió el dictador Francisco Franco?',
    opciones: ['1975', '1973', '1977', '1969'],
    correcta: '1975',
    explicacion: 'Francisco Franco murió el 20 de noviembre de 1975 tras una larga agonía. El mismo día murió el líder falangista José Antonio Primo de Rivera en 1936, fecha que el franquismo conmemoraba como "el día de los caídos".',
    epoca: 'franquismo-transicion',
    dificultad: 'facil',
  },
  {
    id: 53,
    pregunta: '¿Quién fue el rey de España designado por Franco como su sucesor?',
    opciones: ['Juan Carlos I', 'Alfonso XIII', 'Juan de Borbón', 'Felipe VI'],
    correcta: 'Juan Carlos I',
    explicacion: 'Franco designó a Juan Carlos I como su sucesor en 1969, saltándose a su padre Juan de Borbón (conde de Barcelona). Ya como rey, Juan Carlos I se apartó de la continuidad que esperaban los sectores franquistas e impulsó la transición a la democracia.',
    epoca: 'franquismo-transicion',
    dificultad: 'facil',
  },
  {
    id: 54,
    pregunta: '¿Quién fue el primer presidente del Gobierno de la democracia española?',
    opciones: ['Adolfo Suárez', 'Leopoldo Calvo-Sotelo', 'Felipe González', 'Manuel Fraga'],
    correcta: 'Adolfo Suárez',
    explicacion: 'Adolfo Suárez fue nombrado presidente del Gobierno por Juan Carlos I en julio de 1976. Fue el artífice de la transición democrática: legalizó los partidos políticos, convocó elecciones y negoció la Constitución de 1978. Ganó las elecciones de 1977 con la UCD.',
    epoca: 'franquismo-transicion',
    dificultad: 'facil',
  },
  {
    id: 55,
    pregunta: '¿Qué partido político ganó las primeras elecciones democráticas de junio de 1977?',
    opciones: ['Unión de Centro Democrático (UCD)', 'Partido Socialista Obrero Español (PSOE)', 'Alianza Popular (AP)', 'Partido Comunista de España (PCE)'],
    correcta: 'Unión de Centro Democrático (UCD)',
    explicacion: 'La Unión de Centro Democrático (UCD) de Adolfo Suárez ganó las elecciones del 15 de junio de 1977, las primeras elecciones democráticas en España desde 1936. El PSOE fue el segundo partido más votado, con Felipe González al frente.',
    epoca: 'franquismo-transicion',
    dificultad: 'medio',
  },
  {
    id: 56,
    pregunta: '¿En qué año fue aprobada la actual Constitución española?',
    opciones: ['1978', '1977', '1979', '1976'],
    correcta: '1978',
    explicacion: 'La Constitución española fue aprobada en referéndum el 6 de diciembre de 1978, con un 87,9\u00A0% de votos a favor y una participación del 67,1\u00A0%. Estableció España como un Estado social y democrático de Derecho con monarquía parlamentaria y reconoció las autonomías.',
    epoca: 'franquismo-transicion',
    dificultad: 'facil',
  },
  {
    id: 57,
    pregunta: '¿Qué acontecimiento histórico ocurrió el 23 de febrero de 1981 en España?',
    opciones: ['Un intento de golpe de estado en el Congreso de los Diputados', 'La legalización del Partido Comunista', 'La aprobación de los Estatutos de Autonomía', 'La muerte de Adolfo Suárez'],
    correcta: 'Un intento de golpe de estado en el Congreso de los Diputados',
    explicacion: 'El 23-F fue el intento de golpe de estado del teniente coronel Antonio Tejero, que irrumpió con guardias civiles en el Congreso durante la votación de investidura de Calvo-Sotelo. El rey Juan Carlos I apareció en televisión de madrugada rechazando el golpe, lo que fue decisivo para su fracaso.',
    epoca: 'democracia',
    dificultad: 'facil',
  },
  {
    id: 58,
    pregunta: '¿Cómo se llaman los acuerdos económicos y sociales firmados en octubre de 1977 para estabilizar la Transición?',
    opciones: ['Pactos de la Moncloa', 'Acuerdos de Madrid', 'Pactos de Suárez', 'Convenio de Transición'],
    correcta: 'Pactos de la Moncloa',
    explicacion: 'Los Pactos de la Moncloa (octubre 1977) fueron acuerdos firmados en el Palacio de la Moncloa por el Gobierno y los principales partidos con representación parlamentaria (Alianza Popular suscribió el acuerdo económico, pero no el político). Incluyeron medidas económicas para combatir la inflación y reformas políticas y sociales para consolidar la democracia.',
    epoca: 'franquismo-transicion',
    dificultad: 'medio',
  },
  {
    id: 59,
    pregunta: '¿En qué año fue legalizado el Partido Comunista de España (PCE) durante la Transición?',
    opciones: ['1977', '1976', '1978', '1975'],
    correcta: '1977',
    explicacion: 'El PCE fue legalizado el 9 de abril de 1977 (Sábado Santo), en una decisión que provocó malestar en el ejército y permitió al PCE concurrir a las elecciones de junio de 1977. Pocos días después, el Comité Central del PCE, con Santiago Carrillo como secretario general, aceptó la monarquía y la bandera rojigualda; el abandono formal del leninismo llegó más tarde, en su IX Congreso (abril de 1978).',
    epoca: 'franquismo-transicion',
    dificultad: 'dificil',
  },
  {
    id: 60,
    pregunta: '¿Cuál fue la forma de Estado que estableció la Constitución de 1978?',
    opciones: ['Monarquía parlamentaria', 'República federal', 'Monarquía absoluta', 'República parlamentaria'],
    correcta: 'Monarquía parlamentaria',
    explicacion: 'El artículo 1.3 de la Constitución española establece: "La forma política del Estado español es la Monarquía parlamentaria." El rey reina pero no gobierna; el poder ejecutivo lo ejerce el Gobierno y el legislativo las Cortes Generales.',
    epoca: 'franquismo-transicion',
    dificultad: 'facil',
  },
  {
    id: 61,
    pregunta: '¿En qué año ingresó España en la Comunidad Económica Europea (actual Unión Europea)?',
    opciones: ['1986', '1977', '1982', '1992'],
    correcta: '1986',
    explicacion: 'España ingresó en la Comunidad Económica Europea el 1 de enero de 1986, junto con Portugal. La solicitud la presentó el Gobierno de Adolfo Suárez en 1977, las negociaciones se prolongaron con los de Calvo-Sotelo y Felipe González, y el tratado de adhesión se firmó el 12 de junio de 1985.',
    epoca: 'democracia',
    dificultad: 'medio',
  },
  {
    id: 62,
    pregunta: '¿Quién fue asesinado por ETA en 1973 en un atentado con bomba bajo su coche en Madrid?',
    opciones: ['Luis Carrero Blanco', 'Adolfo Suárez', 'Manuel Fraga', 'Fernando Herrero Tejedor'],
    correcta: 'Luis Carrero Blanco',
    explicacion: 'El almirante Luis Carrero Blanco, presidente del Gobierno y delfín designado por Franco, fue asesinado el 20 de diciembre de 1973 en la calle Claudio Coello de Madrid. La bomba lanzó su coche por encima del edificio de cinco plantas. ETA lo denominó Operación Ogro.',
    epoca: 'franquismo-transicion',
    dificultad: 'dificil',
  },
  {
    id: 63,
    pregunta: '¿Cómo se denomina el período de crecimiento económico español en los años 60 bajo el franquismo?',
    opciones: ['El Desarrollismo (Milagro Económico Español)', 'El Plan de Estabilización', 'El Boom Industrial', 'La Autarquía Tardía'],
    correcta: 'El Desarrollismo (Milagro Económico Español)',
    explicacion: 'El "Desarrollismo" de los años 60 fue un período de rápido crecimiento económico impulsado por ministros tecnócratas, varios de ellos vinculados al Opus Dei, tras el Plan de Estabilización de 1959. Los Planes de Desarrollo (1964-1975) acompañaron el paso de España de una economía predominantemente agraria a otra industrial y de servicios. El turismo, las remesas de la emigración y la inversión extranjera fueron claves.',
    epoca: 'franquismo-transicion',
    dificultad: 'dificil',
  },
  {
    id: 64,
    pregunta: '¿Qué fue la Generación del 98?',
    opciones: ['Un movimiento intelectual y literario español tras el Desastre colonial de 1898', 'Un partido político republicano', 'Un grupo de pintores vanguardistas', 'Un movimiento obrero anarquista'],
    correcta: 'Un movimiento intelectual y literario español tras el Desastre colonial de 1898',
    explicacion: 'La Generación del 98 fue un grupo de escritores e intelectuales (Unamuno, Azorín, Baroja, Machado, Valle-Inclán) que reflexionaron sobre la crisis nacional tras la pérdida de Cuba, Puerto Rico y Filipinas. Criticaron el atraso español y buscaron la "esencia" de España.',
    epoca: 'siglo-xix',
    dificultad: 'medio',
  },
  {
    id: 65,
    pregunta: '¿En qué año comenzó la dictadura de Miguel Primo de Rivera, con el apoyo del rey Alfonso XIII?',
    opciones: ['1923', '1917', '1931', '1919'],
    correcta: '1923',
    explicacion: 'Miguel Primo de Rivera dio un golpe de estado el 13 de septiembre de 1923 con el beneplácito de Alfonso XIII. Su dictadura duró hasta 1930. Fue la primera dictadura del siglo XX en España, y el apoyo del rey a ella contribuyó al desprestigio de la monarquía que precedió a la proclamación de la República en 1931.',
    epoca: 'alfonso-xiii',
    dificultad: 'dificil',
  },
  {
    id: 66,
    // Antes: «la pintura más famosa… relacionada con la resistencia contra Napoleón», con «El
    // dos de mayo de 1808» (el levantamiento, del mismo Goya) como errónea: dos correctas.
    pregunta: '¿Qué cuadro de Goya representa la ejecución de madrileños por soldados franceses tras el levantamiento de 1808?',
    opciones: ['Los fusilamientos del 3 de mayo', 'La maja desnuda', 'El dos de mayo de 1808', 'Saturno devorando a su hijo'],
    correcta: 'Los fusilamientos del 3 de mayo',
    explicacion: '"El 3 de mayo en Madrid" o "Los fusilamientos" (1814), de Francisco de Goya, representa la ejecución de madrileños por tropas francesas la madrugada siguiente al levantamiento. Su pareja, "El 2 de mayo de 1808 en Madrid" (o "La lucha con los mamelucos"), pinta el levantamiento mismo. Se considera una de las obras precursoras del arte moderno y una denuncia de la violencia de la guerra.',
    epoca: 'siglo-xix',
    dificultad: 'medio',
  },
  {
    id: 67,
    // Antes: «¿Qué reformas religiosas llevaron… antes de 1492?» con la expulsión de 1492 como
    // correcta: el enunciado contradecía su propia respuesta.
    pregunta: '¿Qué medida religiosa decretaron los Reyes Católicos en 1492, el mismo año de la toma de Granada?',
    opciones: ['Expulsaron a los judíos que no se convirtieran al cristianismo', 'Crearon la Iglesia Española independiente de Roma', 'Promovieron el protestantismo', 'Abolieron la Inquisición medieval'],
    correcta: 'Expulsaron a los judíos que no se convirtieran al cristianismo',
    explicacion: 'El Edicto de Granada, firmado el 31 de marzo de 1492, ordenó la expulsión de los judíos de las coronas de Castilla y Aragón que no se convirtieran al cristianismo. Las estimaciones sobre cuántos se marcharon varían mucho según los historiadores (de unas decenas de miles a más de cien mil). Sus descendientes, los sefardíes, conservaron durante siglos el judeoespañol.',
    epoca: 'reyes-catolicos-descubrimiento',
    dificultad: 'medio',
  },
  {
    id: 68,
    pregunta: '¿Qué pintor greco-cretense fue el más importante de la escuela toledana del Renacimiento tardío español?',
    opciones: ['El Greco', 'Velázquez', 'Zurbarán', 'Ribera'],
    correcta: 'El Greco',
    explicacion: 'El Greco (Doménikos Theotokópoulos, 1541-1614), nacido en Creta, desarrolló su obra más importante en Toledo. Su estilo alargado y expresivo, mezcla de manierismo italiano y tradición bizantina, fue redescubierto en el siglo XX y ejerció gran influencia en el arte moderno.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 69,
    pregunta: '¿Qué fue el "Expediente Picasso" de 1921 en España?',
    opciones: ['Una investigación militar sobre el desastre de Annual en Marruecos', 'Una persecución al pintor Pablo Picasso', 'Un proceso judicial contra el rey Alfonso XIII', 'Una reforma del ejército español'],
    correcta: 'Una investigación militar sobre el desastre de Annual en Marruecos',
    explicacion: 'En julio de 1921, el ejército español sufrió una catastrófica derrota en Annual (Marruecos), con miles de soldados muertos. El general Juan Picasso fue encargado de investigar las responsabilidades. El debate sobre ellas, que alcanzaba al Gobierno y a la Corona, suele citarse entre los factores que precipitaron el golpe de Primo de Rivera en 1923.',
    epoca: 'alfonso-xiii',
    dificultad: 'dificil',
  },
  {
    id: 70,
    pregunta: '¿En qué ciudad se celebraron los Juegos Olímpicos de 1992, en el mismo año que la Expo de Sevilla?',
    opciones: ['Barcelona', 'Madrid', 'Valencia', 'Bilbao'],
    correcta: 'Barcelona',
    explicacion: 'En 1992, España celebró dos eventos de proyección mundial: los Juegos Olímpicos de Barcelona (25 julio - 9 agosto) y la Expo de Sevilla. Ese mismo año abrió el AVE Madrid-Sevilla. El 92 suele recordarse como el año de la proyección internacional de la España democrática.',
    epoca: 'democracia',
    dificultad: 'facil',
  },
  {
    id: 71,
    pregunta: '¿Qué fue la Mancomunitat de Catalunya, creada en 1914?',
    opciones: ['La primera institución común a toda Cataluña desde el siglo XVIII', 'Un sindicato de trabajadores catalanes', 'Un partido político catalanista', 'Un tribunal de justicia regional'],
    correcta: 'La primera institución común a toda Cataluña desde el siglo XVIII',
    explicacion: 'La Mancomunitat de Catalunya (1914-1925) agrupó las cuatro diputaciones provinciales catalanas: fue la primera institución común a toda Cataluña desde la supresión de las instituciones propias tras la caída de Barcelona en 1714, formalizada por el Decreto de Nueva Planta de Cataluña (16 de enero de 1716). Tenía competencias administrativas, no legislativas, y promovió la cultura, la lengua y las infraestructuras. Fue suprimida por la dictadura de Primo de Rivera.',
    epoca: 'alfonso-xiii',
    dificultad: 'dificil',
  },
  {
    id: 72,
    pregunta: '¿Cuál fue el papel de las Brigadas Internacionales en la Guerra Civil española?',
    opciones: ['Combatir por la República contra el franquismo', 'Apoyar al ejército de Franco', 'Mediar entre los dos bandos', 'Evacuar a la población civil'],
    correcta: 'Combatir por la República contra el franquismo',
    explicacion: 'Las Brigadas Internacionales fueron unidades militares formadas por voluntarios extranjeros (de más de 50 países) que lucharon por la República española. Entre 1936 y 1938, unos 35.000 voluntarios —escritores, obreros, comunistas, antifascistas— combatieron en España.',
    epoca: 'republica-guerra-civil',
    dificultad: 'medio',
  },
  {
    id: 73,
    pregunta: '¿Qué fue el "Motín de Aranjuez" de 1808 que forzó la abdicación de Carlos IV?',
    opciones: ['Una revuelta popular que depuso al valido Godoy y forzó a Carlos IV a abdicar en su hijo Fernando VII', 'Un golpe militar bonapartista', 'Una conspiración nobiliaria contra el rey', 'Un levantamiento popular contra los franceses'],
    correcta: 'Una revuelta popular que depuso al valido Godoy y forzó a Carlos IV a abdicar en su hijo Fernando VII',
    explicacion: 'El Motín de Aranjuez (17-19 marzo 1808) fue un levantamiento de nobles y pueblo llano que forzó la destitución del valido Manuel Godoy y la abdicación de Carlos IV en su hijo Fernando VII. Napoleón aprovechó la situación para llamar a ambos a Bayona y obligarles a ceder el trono a su hermano José.',
    epoca: 'siglo-xix',
    dificultad: 'dificil',
  },
  {
    id: 74,
    // Antes: «¿En qué año España adoptó el euro como moneda oficial?» → 2002, dando por mala 1999,
    // que es la respuesta según la Ley 46/1998. Se pregunta por lo que ocurrió en 2002.
    pregunta: '¿En qué año empezaron a circular en España los billetes y monedas de euro?',
    opciones: ['2002', '1999', '2001', '2004'],
    correcta: '2002',
    explicacion: 'El euro es la moneda oficial de España desde el 1 de enero de 1999 (Ley 46/1998, art. 3.1), cuando se fijó el cambio en 166,386 pesetas por euro; durante tres años se usó como moneda de cuenta, y la peseta siguió circulando como expresión suya. Los billetes y monedas de euro entraron en circulación el 1 de enero de 2002 y convivieron con los de peseta hasta el 28 de febrero de ese año. La peseta había sido la moneda española desde 1868.',
    epoca: 'democracia',
    dificultad: 'medio',
  },
  {
    id: 75,
    pregunta: '¿Qué fue la Autarquía económica en la España de posguerra (años 40)?',
    opciones: ['Una política de autosuficiencia económica que aisló a España del comercio internacional', 'Un sistema de libre mercado', 'Un plan de ayuda económica extranjera', 'Una política de industrialización acelerada'],
    correcta: 'Una política de autosuficiencia económica que aisló a España del comercio internacional',
    explicacion: 'La Autarquía fue la política económica franquista de los años 40 que intentó hacer a España autosuficiente, limitando las importaciones y la inversión extranjera. Fue un fracaso: provocó escasez, mercado negro (estraperlo) y hambre. Fue abandonada con el Plan de Estabilización de 1959.',
    epoca: 'franquismo-transicion',
    dificultad: 'dificil',
  },
  {
    id: 76,
    pregunta: '¿Qué figura política romana fue asesinada en Hispania en el año 72 a.C. mientras lideraba una rebelión contra Roma?',
    opciones: ['Quinto Sertorio', 'Viriato', 'Indíbil', 'Mandonio'],
    correcta: 'Quinto Sertorio',
    explicacion: 'Quinto Sertorio fue un general romano del bando de Mario que controló buena parte de Hispania durante casi una década (80-72 a.C.), enfrentado al gobierno silano de Roma y apoyado por pueblos locales. Fue asesinado por sus propios aliados (Perpenna). Viriato fue un caudillo lusitano asesinado en 139 a.C.',
    epoca: 'prerromana-romana',
    dificultad: 'dificil',
  },
  {
    id: 77,
    // Antes: «líder celtíbero»; Viriato fue caudillo LUSITANO (RAH, Historia Hispánica).
    pregunta: '¿Qué caudillo lusitano del siglo II a.C. resistió durante años a Roma hasta ser asesinado por sus propios lugartenientes, sobornados?',
    opciones: ['Viriato', 'Aníbal', 'Indíbil', 'Asdrúbal'],
    correcta: 'Viriato',
    explicacion: 'Viriato fue el líder lusitano que resistió la conquista romana entre el 147 y el 139 a.C., infligiendo varias derrotas a los ejércitos de Roma. Los romanos, incapaces de vencerle en el campo de batalla, sobornaron a sus propios colaboradores para que le asesinaran mientras dormía.',
    epoca: 'prerromana-romana',
    dificultad: 'medio',
  },
  {
    id: 78,
    pregunta: '¿Cuál fue el nombre de la operación de rescate durante la Guerra Civil que llevó a miles de niños españoles al extranjero?',
    opciones: ['Los niños de la guerra (evacuación a la URSS, México y otros países)', 'Operación Cóndor', 'Plan de Evacuación de la Cruz Roja', 'Misión Humanitaria de la Liga de Naciones'],
    correcta: 'Los niños de la guerra (evacuación a la URSS, México y otros países)',
    explicacion: 'Durante la Guerra Civil, miles de niños españoles fueron evacuados al extranjero para protegerlos. Unos 34.000 fueron a la URSS, Francia, México, Bélgica y Gran Bretaña, entre otros países. Muchos de estos "niños de la guerra" vivieron el exilio durante años o décadas; los que llegaron a México en 1937 son conocidos como los "niños de Morelia".',
    epoca: 'republica-guerra-civil',
    dificultad: 'dificil',
  },
  {
    id: 79,
    // Antes: «…la primera expedición que demostró que América era un continente distinto de Asia»
    // y, en la explicación, «demostrando que la Tierra era redonda»: un mito (la esfericidad se
    // conocía desde la Antigüedad).
    pregunta: '¿Qué expedición, partida de Sanlúcar de Barrameda en 1519, fue la primera en dar la vuelta al mundo?',
    opciones: ['La expedición de Magallanes-Elcano', 'El cuarto viaje de Colón', 'La expedición de Vespucio', 'La expedición de Cabral'],
    correcta: 'La expedición de Magallanes-Elcano',
    explicacion: 'La expedición de Magallanes-Elcano (1519-1522) partió de Sanlúcar de Barrameda con 5 naves y en torno a 250 hombres (las cifras varían según las fuentes). Solo regresó una nave (la Victoria) con 18 supervivientes al mando de Juan Sebastián Elcano. Que la Tierra es esférica se sabía desde la Antigüedad (Eratóstenes estimó su circunferencia en el siglo III a.C.); lo que el viaje mostró en la práctica fue que se podía rodear navegando y la enorme anchura del océano Pacífico que separa América de Asia.',
    epoca: 'habsburgos',
    dificultad: 'medio',
  },
  {
    id: 80,
    pregunta: '¿Qué fue la "Ley para la Reforma Política" de 1977, impulsada por Adolfo Suárez y aprobada en referéndum?',
    opciones: ['La ley que desmanteló las instituciones franquistas y abrió el camino a la democracia', 'La Constitución española de 1978', 'El decreto de amnistía para los presos políticos', 'La ley que legalizó los partidos políticos'],
    correcta: 'La ley que desmanteló las instituciones franquistas y abrió el camino a la democracia',
    explicacion: 'La Ley para la Reforma Política (noviembre 1976) fue aprobada por las Cortes el 18 de noviembre de 1976 y en referéndum el 15 de diciembre, con el 94,2\u00A0% de votos a favor; se publicó como Ley 1/1977. Suárez logró que las propias Cortes franquistas votaran su propia disolución. Fue la "ley que hizo la reforma desde la legalidad", permitiendo las primeras elecciones democráticas de 1977.',
    epoca: 'franquismo-transicion',
    dificultad: 'dificil',
  },
  {
    id: 81,
    // Antes: «¿Cuántas provincias establece la Constitución…?»: la CE no fija su número
    // (arts. 137 y 141, BOE-A-1978-31229). Premisa falsa.
    pregunta: '¿En cuántas provincias se divide hoy el territorio español?',
    opciones: ['50 provincias', '17 comunidades autónomas', '47 provincias', '52 provincias con Ceuta y Melilla'],
    correcta: '50 provincias',
    explicacion: 'España tiene 50 provincias. El mapa procede, en lo esencial, de la división de Javier de Burgos (1833), que creó 49; Canarias se dividió en dos en 1927. La Constitución de 1978 (arts. 137 y 141) reconoce la provincia como entidad local y exige ley orgánica para alterar sus límites, pero no fija su número. Las provincias se agrupan en 17 comunidades autónomas, a las que se suman las ciudades autónomas de Ceuta y Melilla, que no son provincias.',
    epoca: 'democracia',
    dificultad: 'facil',
  },
];

// Exportar grupos por dificultad
export const PREGUNTAS_FACIL = PREGUNTAS_HISTORIA.filter(p => p.dificultad === 'facil');
export const PREGUNTAS_MEDIO = PREGUNTAS_HISTORIA.filter(p => p.dificultad === 'medio');
export const PREGUNTAS_DIFICIL = PREGUNTAS_HISTORIA.filter(p => p.dificultad === 'dificil');

// Configuración de preguntas por dificultad
export const CONFIG_DIFICULTAD = {
  facil:   { preguntas: 10, pool: 'facil' as DificultadHistoria },
  medio:   { preguntas: 15, pool: 'medio' as DificultadHistoria },
  dificil: { preguntas: 20, pool: 'dificil' as DificultadHistoria },
};
