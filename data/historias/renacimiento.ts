import type { HistoriaData } from './types';

export const renacimiento: HistoriaData = {
  slug: 'renacimiento',
  titulo: 'El Renacimiento: Del Humanismo a la Revolución Científica',
  subtitulo:
    'El renacer de Europa: los Medici, Leonardo, la imprenta, Copérnico y Shakespeare transforman la civilización occidental entre 1400 y 1600',
  descripcionSEO:
    'Cronología interactiva del Renacimiento (1397–1600): humanismo, Florencia y los Medici, Leonardo da Vinci, Miguel Ángel, la imprenta de Gutenberg, los grandes descubrimientos geográficos, Copérnico, Shakespeare y el nacimiento del mundo moderno.',
  keywords: [
    'Renacimiento',
    'humanismo',
    'Leonardo da Vinci',
    'Miguel Ángel',
    'Gutenberg',
    'imprenta',
    'Medici',
    'Florencia',
    'Copérnico',
    'heliocentrismo',
    'descubrimientos geográficos',
    'Shakespeare',
    'Cervantes',
    'historia del arte',
    'revolución científica',
    'siglo XV',
    'siglo XVI',
    'Erasmo',
    'arquitectura renacentista',
    'Brunelleschi',
  ],
  anioInicio: 1397,
  anioFin: 1600,

  hitos: [
    {
      id: 'medici-florencia',
      nombre: 'Los Medici y Florencia: La Cuna del Renacimiento',
      anioInicio: 1397,
      anioFin: 1492,
      color: '#DAA520',
      categoria: 'humanismo',
      descripcion:
        'Cosimo de Medici funda el Banco Medici en 1397 e instaura el mecenazgo artístico sistemático. Bajo su familia, Florencia se convierte en la capital cultural del mundo: Brunelleschi levanta la cúpula de Santa María del Fiore (1436), Donatello revoluciona la escultura, Botticelli pinta "La primavera" y Lorenzo el Magnífico reúne a los mejores artistas e intelectuales de Europa en su corte. La riqueza bancaria convierte el ideal humanista en arte visible.',
      obraIconica: 'Cúpula de Santa María del Fiore, Brunelleschi (1436)',
      paises: ['Italia'],
    },
    {
      id: 'humanismo',
      nombre: 'El Humanismo: El Hombre como Medida',
      anioInicio: 1350,
      anioFin: 1500,
      color: '#DAA520',
      categoria: 'humanismo',
      descripcion:
        'Petrarca redescubre a Cicerón y sienta las bases del humanismo: el ser humano, no Dios, como medida de todas las cosas. Pico della Mirandola proclama en 1486 la dignidad absoluta del hombre en su célebre "Oratio de dignitate hominis". Erasmo de Rotterdam extiende el humanismo al norte de Europa con "Elogio de la Locura" (1511), criticando la Iglesia desde dentro con ironía y erudición. El pensamiento vuelve su mirada hacia la Antigüedad greco-latina para construir un nuevo ideal de humanidad.',
      obraIconica: 'Oratio de dignitate hominis, Pico della Mirandola (1486)',
      paises: ['Italia', 'Países Bajos', 'Alemania'],
    },
    {
      id: 'imprenta-gutenberg',
      nombre: 'La Imprenta de Gutenberg: La Revolución del Conocimiento',
      anioInicio: 1450,
      anioFin: 1500,
      color: '#1E90FF',
      categoria: 'ciencia',
      descripcion:
        'Johannes Gutenberg perfecciona los tipos móviles metálicos hacia 1450 e imprime la Biblia de Gutenberg en 1455. En apenas cincuenta años, Europa pasa de unos pocos miles de manuscritos copiados a mano a más de 20 millones de libros impresos. El saber deja de ser monopolio del clero y las universidades: las ideas humanistas, científicas y reformistas se difunden a una velocidad sin precedentes. Es la primera revolución mediática de Occidente.',
      obraIconica: 'Biblia de Gutenberg (1455)',
      paises: ['Alemania', 'Francia', 'Países Bajos', 'Italia'],
    },
    {
      id: 'leonardo-miguelangel',
      nombre: 'Leonardo y Miguel Ángel: La Cima del Arte',
      anioInicio: 1480,
      anioFin: 1520,
      color: '#DC143C',
      categoria: 'arte',
      descripcion:
        'Leonardo da Vinci encarna el ideal del "hombre universal": pinta La Gioconda y La Última Cena, diseña el Hombre de Vitruvio y llena miles de páginas con inventos, anatomía y observaciones científicas. Miguel Ángel pinta la Capilla Sixtina (1508–1512), talla el David y La Pietà. Rafael completa la Trinidad con sus serenas Madonnas y las Estancias del Vaticano. El Alto Renacimiento italiano alcanza una cima de perfección técnica y profundidad humana que no se repetirá.',
      obraIconica: 'Capilla Sixtina, Miguel Ángel (1508–1512)',
      paises: ['Italia'],
    },
    {
      id: 'descubrimientos-geograficos',
      nombre: 'Los Grandes Descubrimientos Geográficos',
      anioInicio: 1488,
      anioFin: 1522,
      color: '#1E90FF',
      categoria: 'ciencia',
      descripcion:
        'En treinta y cuatro años, los europeos doblan el continente africano, cruzan el Atlántico, llegan a la India por mar y circunnavegan el globo. Bartolomeu Dias dobla el Cabo de Buena Esperanza en 1488. Colón arriba a América en 1492. Vasco de Gama alcanza la India en 1498. La expedición de Magallanes-Elcano completa la primera vuelta al mundo entre 1519 y 1522. El mundo se revela enorme, redondo y lleno de civilizaciones desconocidas.',
      obraIconica: 'Primera vuelta al mundo, Magallanes-Elcano (1519–1522)',
      paises: ['España', 'Portugal'],
    },
    {
      id: 'revolucion-cientifica',
      nombre: 'Copérnico y el Inicio de la Revolución Científica',
      anioInicio: 1543,
      anioFin: 1610,
      color: '#1E90FF',
      categoria: 'ciencia',
      descripcion:
        'Nicolás Copérnico publica "De revolutionibus orbium coelestium" en 1543 y coloca al Sol —no a la Tierra— en el centro del universo. Tycho Brahe acumula las observaciones astronómicas más precisas de la historia sin telescopio. Johannes Kepler formula las tres leyes del movimiento planetario. Galileo apunta su telescopio al cielo en 1609 y confirma el heliocentrismo. La Tierra deja de ser el centro del cosmos y la ciencia empieza a desplazar a la teología como fuente de verdad sobre el mundo natural.',
      obraIconica: 'De revolutionibus orbium coelestium, Copérnico (1543)',
      paises: ['Polonia', 'Dinamarca', 'Alemania', 'Italia'],
    },
    {
      id: 'arquitectura-renacentista',
      nombre: 'La Arquitectura Renacentista: De Brunelleschi a Palladio',
      anioInicio: 1420,
      anioFin: 1580,
      color: '#8B4513',
      categoria: 'arquitectura',
      descripcion:
        'Filippo Brunelleschi reinterpreta la antigüedad clásica con proporciones matemáticas y perspectiva lineal en la cúpula florentina. Leon Battista Alberti teoriza la arquitectura como arte liberal en "De re aedificatoria". Bramante diseña la nueva basílica de San Pedro en Roma. Andrea Palladio sistematiza el lenguaje clásico en sus "Cuatro Libros de Arquitectura" (1570) creando el "palladianismo", que influirá durante siglos en Europa y América del Norte.',
      obraIconica: 'Villa Rotonda, Andrea Palladio (1567)',
      paises: ['Italia'],
    },
    {
      id: 'renacimiento-nordico',
      nombre: 'El Renacimiento Nórdico: Erasmo, Shakespeare, Cervantes',
      anioInicio: 1500,
      anioFin: 1616,
      color: '#228B22',
      categoria: 'nordico',
      descripcion:
        'El humanismo viaja al norte y florece en nuevas formas. Thomas Moro imagina una sociedad ideal en "Utopía" (1516). William Shakespeare (1564–1616) lleva al teatro la complejidad del ser humano con una profundidad psicológica sin precedentes. Miguel de Cervantes publica el "Quijote" en 1605, la primera novela moderna. El Renacimiento nórdico produce la literatura que, junto con la italiana, define la cultura occidental.',
      obraIconica: 'Don Quijote de la Mancha, Miguel de Cervantes (1605)',
      paises: ['Inglaterra', 'España', 'Países Bajos', 'Alemania'],
    },
    {
      id: 'saqueo-roma-manierismo',
      nombre: 'El Saqueo de Roma y el Manierismo',
      anioInicio: 1527,
      anioFin: 1560,
      color: '#708090',
      categoria: 'crepusculo',
      descripcion:
        'Las tropas de Carlos V saquean Roma en 1527 en un trauma colectivo que sacude el centro cultural italiano. El Manierismo surge como respuesta angustiada al ideal renacentista: figuras alargadas, perspectivas imposibles, colores ácidos y tensión psicológica en lugar de la serenidad clásica. El Greco, Tintoretto y Pontormo expresan una visión del mundo en crisis. El arte pierde la confianza y la claridad que caracterizaron el Alto Renacimiento.',
      obraIconica: 'El entierro del Conde de Orgaz, El Greco (ca. 1586)',
      paises: ['Italia', 'España'],
    },
    {
      id: 'crepusculo-renacimiento',
      nombre: 'El Crepúsculo del Renacimiento',
      anioInicio: 1560,
      anioFin: 1600,
      color: '#708090',
      categoria: 'crepusculo',
      descripcion:
        'El Renacimiento se transforma en algo nuevo. Caravaggio anticipa el Barroco con su tenebrismo radical. La Contrarreforma y los decretos del Concilio de Trento reconfiguran el arte religioso. Claudio Monteverdi lleva la polifonía hacia la ópera. El teatro isabelino inglés vive su época dorada. Las primeras academias científicas esbozan una nueva institución para el conocimiento. El espíritu renacentista, en lugar de morir, muta en la Reforma, la Revolución Científica y el Barroco.',
      obraIconica: 'Vocación de san Mateo, Caravaggio (ca. 1600)',
      paises: ['Italia', 'Inglaterra', 'Francia', 'España'],
    },
  ],

  eras: [
    {
      nombre: 'Las Raíces: Humanismo y los Medici',
      desde: 1350,
      hasta: 1450,
      icono: '🌿',
      hitosDestacados: [
        'El Humanismo: El Hombre como Medida',
        'Los Medici y Florencia: La Cuna del Renacimiento',
      ],
      eventos: [
        'Petrarca redescubre a Cicerón y funda el humanismo literario (ca. 1350)',
        'Cosimo de Medici funda el Banco Medici en Florencia (1397)',
        'Brunelleschi y Ghiberti compiten por las puertas del Baptisterio (1401)',
        'Concilio de Florencia: contacto entre la cultura griega byzantina y la occidental (1439)',
        'Donatello esculpe el primer desnudo masculino en bronce desde la Antigüedad (1440s)',
      ],
    },
    {
      nombre: 'El Florecimiento Italiano',
      desde: 1450,
      hasta: 1527,
      icono: '🎨',
      hitosDestacados: [
        'Los Medici y Florencia: La Cuna del Renacimiento',
        'Leonardo y Miguel Ángel: La Cima del Arte',
        'La Arquitectura Renacentista: De Brunelleschi a Palladio',
      ],
      eventos: [
        'Lorenzo el Magnífico convierte Florencia en la capital cultural de Europa (1469–1492)',
        'Botticelli pinta "La primavera" y "El nacimiento de Venus" (1480s)',
        'Leonardo da Vinci pinta "La Última Cena" en Milán (1495–1498)',
        'El papa Julio II encarga a Miguel Ángel la Capilla Sixtina (1508)',
        'Rafael decora las Estancias del Vaticano (1508–1520)',
      ],
    },
    {
      nombre: 'La Revolución del Conocimiento',
      desde: 1450,
      hasta: 1522,
      icono: '📚',
      hitosDestacados: [
        'La Imprenta de Gutenberg: La Revolución del Conocimiento',
        'Los Grandes Descubrimientos Geográficos',
      ],
      eventos: [
        'Gutenberg imprime la Biblia con tipos móviles (1455)',
        'Colón llega a América abriendo un nuevo mundo (1492)',
        'Vasco de Gama abre la ruta marítima a la India (1498)',
        'Amerigo Vespucci reconoce que América es un continente nuevo (1502)',
        'Magallanes-Elcano completa la primera circunnavegación del globo (1519–1522)',
      ],
    },
    {
      nombre: 'La Revolución Científica',
      desde: 1543,
      hasta: 1610,
      icono: '🔭',
      hitosDestacados: [
        'Copérnico y el Inicio de la Revolución Científica',
      ],
      eventos: [
        'Copérnico publica el modelo heliocéntrico (1543)',
        'Vesalio publica la primera anatomía moderna "De humani corporis fabrica" (1543)',
        'Tycho Brahe construye el observatorio de Uraniborg (1576)',
        'Kepler formula las leyes del movimiento planetario (1609–1619)',
        'Galileo apunta el telescopio al cielo y descubre los satélites de Júpiter (1610)',
      ],
    },
    {
      nombre: 'El Renacimiento Nórdico',
      desde: 1500,
      hasta: 1600,
      icono: '✍️',
      hitosDestacados: [
        'El Renacimiento Nórdico: Erasmo, Shakespeare, Cervantes',
      ],
      eventos: [
        'Erasmo de Rotterdam publica "Elogio de la Locura" (1511)',
        'Thomas Moro publica "Utopía" (1516)',
        'Lutero inicia la Reforma Protestante con sus 95 tesis (1517)',
        'Shakespeare escribe Hamlet, Macbeth y El Rey Lear (1600–1606)',
        'Cervantes publica la primera parte del Quijote (1605)',
      ],
    },
    {
      nombre: 'El Crepúsculo: Manierismo y Barroco Emergente',
      desde: 1527,
      hasta: 1600,
      icono: '🌅',
      hitosDestacados: [
        'El Saqueo de Roma y el Manierismo',
        'El Crepúsculo del Renacimiento',
      ],
      eventos: [
        'El Sacco di Roma sacude el centro cultural italiano (1527)',
        'El Concilio de Trento define el arte de la Contrarreforma (1545–1563)',
        'Palladio publica los "Cuatro Libros de Arquitectura" (1570)',
        'Claudio Monteverdi compone los primeros madrigales (1580s)',
        'Caravaggio revoluciona la pintura con el tenebrismo (ca. 1600)',
      ],
    },
  ],

  categorias: {
    humanismo: 'Humanismo y Mecenazgo',
    arte: 'Arte y Escultura',
    ciencia: 'Ciencia y Descubrimientos',
    arquitectura: 'Arquitectura',
    nordico: 'Renacimiento Nórdico',
    crepusculo: 'Manierismo y Crepúsculo',
  },

  colores: {
    humanismo: '#DAA520',
    arte: '#DC143C',
    ciencia: '#1E90FF',
    arquitectura: '#8B4513',
    nordico: '#228B22',
    crepusculo: '#708090',
  },

  disclaimer: 'exempt',

  educativo: {
    intro:
      'El Renacimiento (siglos XIV–XVII) no fue una ruptura repentina sino un proceso de redescubrimiento y reinterpretación de la Antigüedad greco-latina que transformó la civilización occidental. Nacido en las ciudades-estado italianas, alimentado por el mecenazgo de los Medici y acelerado por la imprenta de Gutenberg, el Renacimiento desplazó el centro de gravedad cultural de Dios hacia el ser humano. Produjo las mayores obras de arte de la historia occidental, los primeros mapas del mundo moderno, el heliocentrismo y el nacimiento de la novela. Cuando se extinguió, había transformado la filosofía, la ciencia, la literatura y las artes de forma irreversible.',

    tablaComparativa: [
      {
        hito: 'Los Medici y Florencia',
        periodo: '1397–1492',
        categoria: 'Humanismo y Mecenazgo',
        personaje: 'Lorenzo el Magnífico',
        aportacion:
          'El mecenazgo sistemático convierte Florencia en capital cultural; financia a Botticelli, Leonardo y la Academia Platónica',
      },
      {
        hito: 'La Imprenta de Gutenberg',
        periodo: '1450–1500',
        categoria: 'Ciencia y Descubrimientos',
        personaje: 'Johannes Gutenberg',
        aportacion:
          'Los tipos móviles metálicos multiplican el saber: 20 millones de libros en Europa en 50 años; primera revolución mediática',
      },
      {
        hito: 'Leonardo y Miguel Ángel',
        periodo: '1480–1520',
        categoria: 'Arte y Escultura',
        personaje: 'Leonardo da Vinci',
        aportacion:
          'La Gioconda, La Última Cena, la Capilla Sixtina: arte como síntesis de ciencia, filosofía y técnica en el Alto Renacimiento',
      },
      {
        hito: 'Los Grandes Descubrimientos',
        periodo: '1488–1522',
        categoria: 'Ciencia y Descubrimientos',
        personaje: 'Colón / Magallanes-Elcano',
        aportacion:
          'América, la ruta a la India, la primera vuelta al mundo: el planisferio se completa y la visión europea del mundo se transforma',
      },
      {
        hito: 'Copérnico y la Revolución Científica',
        periodo: '1543–1610',
        categoria: 'Ciencia y Descubrimientos',
        personaje: 'Nicolás Copérnico',
        aportacion:
          'El heliocentrismo desplaza a la Tierra del centro del cosmos; Kepler y Galileo confirman y amplían el modelo',
      },
      {
        hito: 'El Renacimiento Nórdico',
        periodo: '1500–1616',
        categoria: 'Renacimiento Nórdico',
        personaje: 'William Shakespeare',
        aportacion:
          'El humanismo italiano viaja al norte: Erasmo, Moro, Shakespeare y Cervantes crean la literatura moderna europea',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'El estudiante de historia del arte',
        perfil: 'Estudiante universitario preparando un trabajo sobre el Quattrocento',
        texto:
          'La cronología te permite comprender que el Renacimiento italiano no fue un movimiento uniforme: el Trecento tardío de Petrarca, el Quattrocento de Brunelleschi y Donatello, y el Cinquecento de Leonardo y Miguel Ángel tienen ritmos distintos. Puedes ver cómo el mecenazgo de los Medici precede y alimenta el florecimiento artístico, y cómo el Manierismo surge como reacción al trauma del Sacco di Roma.',
      },
      {
        icono: '📖',
        titulo: 'El lector curioso de historia',
        perfil: 'Aficionado a la historia que quiere entender el período en su conjunto',
        texto:
          'El visualizador te muestra que el Renacimiento y los Grandes Descubrimientos Geográficos son simultáneos: mientras Miguel Ángel pinta la Sixtina, Magallanes circunnavega el globo. Y que la Reforma Protestante de Lutero (1517) ocurre justo cuando el Renacimiento italiano está en su cénit. Contextos que los libros suelen narrar por separado aquí aparecen en su relación temporal real.',
      },
      {
        icono: '🏫',
        titulo: 'El profesor de bachillerato',
        perfil: 'Docente que imparte Historia del Arte o Historia Universal',
        texto:
          'La tabla comparativa y las seis categorías te permiten organizar el contenido en bloques temáticos: humanismo, arte, ciencia, arquitectura, Renacimiento nórdico y ocaso. Puedes usar los hitos para estructurar las unidades didácticas y los escenarios para contextualizar cada período. La cronología de eras facilita la visión diacrónica que los alumnos suelen perder en los temarios.',
      },
      {
        icono: '🌍',
        titulo: 'El viajero cultural',
        perfil: 'Persona que planea visitar Florencia, Roma o el sur de Inglaterra',
        texto:
          'Antes de visitar la Capilla Sixtina o los Uffizi, esta cronología te sitúa en el contexto: cuándo se construyó cada obra, quién la encargó y por qué. Entenderás que la cúpula de Brunelleschi (1436) fue un prodigio de ingeniería que nadie sabía cómo construir, o que la Galería Uffizi fue en origen los "uffici" (oficinas) del gobierno florentino, no un museo.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué el Renacimiento nació en Italia y no en otro lugar?',
        respuesta:
          'Varios factores convergieron en la Italia del siglo XIV: las ciudades-estado italianas (Florencia, Venecia, Milán) eran centros comerciales prósperos que generaron una burguesía culta con dinero para gastar en arte; la proximidad geográfica con Bizancio facilitó la llegada de manuscritos griegos clásicos; y la herencia romana estaba literalmente bajo tierra —las ciudades italianas eran excavaciones accidentales de la Antigüedad. Los humanistas redescubrieron ese legado y construyeron sobre él una nueva cultura.',
        tip: 'Clave: riqueza comercial + legado romano + llegada de eruditos griegos tras la caída de Constantinopla (1453)',
      },
      {
        pregunta: '¿Qué significa exactamente "humanismo" en el Renacimiento?',
        respuesta:
          'El humanismo renacentista no es el humanismo filosófico contemporáneo. En el siglo XV, los "humanistas" eran estudiosos que se dedicaban a las "humanae litterae": gramática, retórica, poesía, historia y filosofía moral, tomadas de los textos clásicos greco-latinos. La clave del giro es que colocaron al ser humano —su dignidad, su capacidad racional, su potencial creativo— en el centro del pensamiento, desplazando la visión medieval centrada exclusivamente en Dios y la salvación.',
      },
      {
        pregunta: '¿La imprenta de Gutenberg fue realmente tan importante?',
        respuesta:
          'Sí, y la comparación más útil es con internet. Antes de Gutenberg, un libro tardaba meses en copiarse y costaba el equivalente a un año de salario de un artesano. Tras la imprenta, el precio de los libros cayó un 80% en cincuenta años y la producción se multiplicó por miles. Esto permitió que las ideas humanistas, científicas y reformistas (Lutero fijó sus 95 tesis en 1517 y eran conocidas en toda Europa en dos semanas) se difundieran a una velocidad sin precedentes históricos.',
        tip: 'En 1450: unas decenas de miles de manuscritos en Europa. En 1500: más de 20 millones de libros impresos.',
      },
      {
        pregunta: '¿Qué relación tiene el Renacimiento con la Reforma Protestante?',
        respuesta:
          'La relación es directa: el humanismo renacentista creó las herramientas intelectuales que hicieron posible la Reforma. Los humanistas como Erasmo aplicaron la filología clásica a los textos bíblicos y descubrieron errores en la Vulgata latina. La imprenta permitió que las tesis de Lutero se difundieran en semanas por toda Europa. Sin embargo, hay una paradoja: Erasmo, el mayor humanista nórdico, se negó a seguir a Lutero porque valoraba la unidad de la Iglesia. El Renacimiento alumbró la Reforma, pero no todos sus protagonistas la apoyaron.',
      },
      {
        pregunta: '¿Cuándo terminó el Renacimiento y por qué?',
        respuesta:
          'No existe una fecha única. El Sacco di Roma de 1527 es el momento traumático que muchos historiadores consideran el fin del Renacimiento italiano. En el norte de Europa, el Renacimiento se prolonga hasta las primeras décadas del siglo XVII con Shakespeare (muerto en 1616) y Cervantes (también 1616). En la ciencia, la "muerte" del Renacimiento es en realidad su transformación en Revolución Científica. El Renacimiento no terminó: se convirtió en el mundo moderno.',
        tip: 'Fecha clave: 1527 (Sacco di Roma) para Italia; 1616 (Shakespeare y Cervantes) para la literatura.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por el contexto económico y político',
        cuerpo:
          'Para entender el Renacimiento es esencial comprender el papel de los Medici y del sistema bancario florentino. La riqueza generada por el comercio y las finanzas fue la condición material que hizo posible el mecenazgo artístico a escala. Sin el Banco Medici, probablemente no habría existido Botticelli ni Brunelleschi tal como los conocemos.',
      },
      {
        titulo: 'Distingue el Quattrocento del Cinquecento',
        cuerpo:
          'El Quattrocento (siglo XV) es el período experimental: Brunelleschi reinventa la perspectiva, Donatello revive la escultura clásica, los humanistas redescubren textos griegos. El Cinquecento (siglo XVI) es la síntesis y el clímax: Leonardo, Miguel Ángel y Rafael llevan los hallazgos del siglo anterior a su perfección. Mantener esta distinción ayuda a comprender la lógica interna del movimiento.',
      },
      {
        titulo: 'Conecta el arte con la ciencia y los descubrimientos',
        cuerpo:
          'El Renacimiento no fue solo un movimiento artístico. La perspectiva lineal es geometría aplicada. El Hombre de Vitruvio de Leonardo es anatomía y matemáticas. Los mapas que permiten los descubrimientos son cartografía científica. Copérnico y Galileo son parte del mismo movimiento intelectual que Leonardo: la observación directa de la naturaleza frente a la autoridad de los textos medievales.',
      },
      {
        titulo: 'Sigue el viaje del Renacimiento al norte',
        cuerpo:
          'El Renacimiento italiano viajó al norte a través de libros impresos, artistas itinerantes y eruditos que estudiaron en Italia. En el norte tomó formas distintas: más literaria y filosófica (Erasmo, Moro, Shakespeare) y más vinculada a la crítica religiosa. La Reforma Protestante es inseparable del humanismo nórdico. Sin Erasmo no hay Lutero, aunque los dos acabaran enfrentados.',
      },
      {
        titulo: 'Observa cómo el Renacimiento se transforma, no muere',
        cuerpo:
          'El "fin" del Renacimiento es en realidad una metamorfosis múltiple: en arte se convierte en Manierismo y luego en Barroco; en filosofía y ciencia, en la Revolución Científica de Kepler, Galileo y Newton; en religión, en la Reforma y la Contrarreforma. Comprender el Renacimiento como proceso continuo —y no como era cerrada— es la clave para entender la historia cultural de Europa entre 1400 y 1700.',
      },
    ],

    tips: [
      {
        icono: '🔑',
        texto:
          'La palabra "Renacimiento" fue inventada en el siglo XIX por el historiador Jules Michelet. Los propios hombres del siglo XV creían que estaban "renaciendo" después de las "tinieblas medievales", pero la denominación fue posterior. Hoy los historiadores discuten si la Edad Media fue tan oscura y si el corte es tan neto.',
      },
      {
        icono: '🏛️',
        texto:
          'La caída de Constantinopla en manos otomanas (1453) aceleró el Renacimiento: miles de eruditos griegos emigraron a Italia llevando manuscritos clásicos desconocidos en Occidente. La biblioteca griega medieval llegó a Florencia precisamente cuando los humanistas buscaban textos clásicos. El trauma político de Bizancio fue el combustible intelectual del humanismo italiano.',
      },
      {
        icono: '👩‍🎨',
        texto:
          'El Renacimiento tiene muchas voces femeninas olvidadas: Sofonisba Anguissola (pintora en la corte de Felipe II), Artemisia Gentileschi (una generación después, pero formada en la tradición renacentista-barroca), Lucrezia Tornabuoni (poetisa mecenas florentina). Las restricciones sociales limitaron su participación, pero no la eliminaron.',
      },
      {
        icono: '🌐',
        texto:
          'El Renacimiento fue un fenómeno global antes de que existiera el concepto: los Grandes Descubrimientos pusieron en contacto civilizaciones que no sabían de la existencia de las otras. Mientras Miguel Ángel pintaba la Sixtina, el Imperio azteca estaba en su apogeo. La historia del Renacimiento es también la historia del primer encuentro —y choque— entre el Viejo y el Nuevo Mundo.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que la Edad Media fue completamente oscura',
        cuerpo:
          'El mito de la "Edad Oscura" fue creado por los propios humanistas renacentistas para valorizar su propio período. En realidad, la Edad Media produjo las catedrales góticas, la escolástica, Dante, Chaucer y las universidades europeas. El Renacimiento no surgió de la nada: se construyó sobre una herencia medieval mucho más rica de lo que sus protagonistas reconocían.',
      },
      {
        titulo: 'Confundir el Renacimiento con el Arte Renacentista',
        cuerpo:
          'El Renacimiento fue mucho más que un movimiento artístico. Abarcó la filosofía humanista, la nueva ciencia observacional, los descubrimientos geográficos, la imprenta, la reforma religiosa y el nacimiento de la literatura en lenguas vernáculas. Reducirlo a Leonardo y Miguel Ángel es perder los tres cuartos más transformadores del fenómeno.',
      },
      {
        titulo: 'Pensar que el Renacimiento fue un movimiento uniforme',
        cuerpo:
          'El Renacimiento italiano, el nórdico, el español y el inglés son fenómenos relacionados pero distintos. El italiano fue fundamentalmente artístico y filosófico; el nórdico, literario y religioso; el español estuvo marcado por el descubrimiento de América y la Contrarreforma. Hablar de "el Renacimiento" como bloque homogéneo oscurece diferencias cruciales de ritmo, forma y contenido.',
      },
      {
        titulo: 'Separar los Grandes Descubrimientos del Renacimiento',
        cuerpo:
          'Los libros de texto suelen separar el Renacimiento artístico-cultural de los Descubrimientos geográficos como si fueran fenómenos distintos. Pero son parte del mismo impulso: la observación directa frente a la autoridad de los textos, el interés por lo empírico, la confianza en la razón humana. Colón y Copérnico son tan renacentistas como Leonardo o Erasmo.',
      },
    ],
  },
};
