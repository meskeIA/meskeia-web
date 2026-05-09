import type { HistoriaData } from './types';

export const historiaPeriodismo: HistoriaData = {
  slug: 'historia-periodismo',
  titulo: 'Historia del Periodismo: De las Actas Romanas a la Era Digital',
  subtitulo: 'Más de 2.000 años de información pública: de las tablillas del Foro romano a los algoritmos de IA que redactan noticias en tiempo real',
  descripcionSEO: 'Cronología interactiva de la historia del periodismo: desde las Acta Diurna de Julio César (59 a.C.) hasta la inteligencia artificial y la desinformación digital. 10 hitos, 6 eras, modelos de prensa y recursos de verificación.',
  keywords: [
    'historia del periodismo cronología',
    'prensa impresa Gutenberg periódico primer diario',
    'libertad de prensa ilustración Primera Enmienda',
    'penny press masas Associated Press Reuters',
    'periodismo de investigación Watergate Woodward Bernstein',
    'fake news desinformación redes sociales fact-checking',
    'inteligencia artificial periodismo futuro medios digitales',
  ],
  anioInicio: -59,
  anioFin: 9999,

  hitos: [
    {
      id: 'acta-diurna-roma',
      nombre: 'Acta Diurna de Roma',
      anioInicio: -59,
      anioFin: 1450,
      color: '#374151',
      categoria: 'origen',
      descripcion: `Julio César ordenó en el año 59 a.C. la publicación de las Acta Diurna Populi Romani (Actas Diarias del Pueblo Romano): tablillas escritas a mano expuestas en el Foro con debates del Senado, decisiones imperiales, resultados de combates de gladiadores, nacimientos, matrimonios y presagios. No eran un periódico en el sentido moderno —carecían de periodicidad completamente regular y de libertad editorial— pero establecieron el precedente fundamental de la información pública institucionalizada. Por primera vez, una autoridad política reconocía explícitamente el derecho de los ciudadanos a conocer los asuntos del gobierno.

En la Edad Media, la información circulaba principalmente a través de pregoneros oficiales, cartas privadas y los llamados avvisi (avisos manuscritos) que mercaderes y diplomáticos intercambiaban en las ciudades italianas desde el siglo XIV. La Gaceta de Venecia (Gazeta, hacia 1566) es el primer boletín de noticias de pago documentado en Europa: hojas manuscritas copiadas a mano que informaban sobre comercio, política y guerras y costaban una gazzeta (moneda veneciana de escaso valor), palabra que acabaría dando nombre al término "gaceta" en todas las lenguas romances.

Las cartas de noticias (newsletters) de la familia Fugger —la gran dinastía bancaria alemana— recopiladas entre 1568 y 1605 son el primer archivo privado de información periodística sistemática que se conserva. Cubrían noticias de toda Europa y el Imperio Otomano y demuestran que existía una demanda real y solvente de información regular antes de que la imprenta la hiciera accesible a un público más amplio. La invención de la imprenta de tipos móviles por Gutenberg (hacia 1450) fue el umbral tecnológico que transformó estos precedentes en algo cualitativamente nuevo: la posibilidad de reproducir información de manera idéntica, rápida y a escala.`,
      obraIconica: 'Acta Diurna Populi Romani (59 a.C.) — primer boletín oficial de la historia',
      paises: ['Roma', 'Imperio Romano', 'Venecia', 'Alemania'],
    },
    {
      id: 'primer-periodico-impreso',
      nombre: 'Primer Periódico Impreso',
      anioInicio: 1605,
      anioFin: 1700,
      color: '#92400E',
      categoria: 'nacimiento',
      descripcion: `La Relation aller Fürnemmen und gedenckwürdigen Historien (Relación de todas las noticias distinguidas y memorables) publicada en Estrasburgo en 1605 por Johann Carolus es el primer periódico impreso regular documentado en la historia: publicación semanal con noticias de política, comercio y eventos de toda Europa recogidas mediante una red de corresponsales. Carolus había comenzado recopilando avvisi manuscritos para clientes privados y decidió rentabilizar su red pasando a la imprenta. La British Library y la UNESCO reconocen 1605 como el año de nacimiento del periódico moderno.

La Gazette de France (1631), fundada por Théophraste Renaudot con el apoyo explícito del Cardenal Richelieu y del propio rey Luis XIII —que contribuía personalmente con artículos—, fue el primer periódico gubernamental europeo a gran escala. Ilustra desde el inicio la tensión estructural del periodismo: la dependencia del poder político para sobrevivir frente a la independencia necesaria para informar con veracidad. El Mercure François (1611) y otras publicaciones francesas ya existían antes, pero la Gazette tuvo mayor difusión y longevidad.

La libertad de prensa fue limitada desde los primeros años: la mayoría de los estados europeos exigían licencias de publicación (imprimatur, privilege royal, Druckprivileg) que controlaban los contenidos y otorgaban monopolios de impresión. La censura previa fue la norma en casi toda Europa hasta el siglo XVIII. En este contexto restrictivo, el Daily Courant (Londres, 1702) se convirtió en el primer periódico diario en lengua inglesa, con la novedad de declarar explícitamente que solo reproducía hechos y dejaba al lector el juicio sobre ellos —un principio editorial que anticipaba el periodismo moderno.`,
      obraIconica: 'Relation aller Fürnemmen und gedenckwürdigen Historien (Estrasburgo, 1605)',
      paises: ['Alemania', 'Francia', 'Reino Unido', 'Países Bajos'],
    },
    {
      id: 'ilustracion-libertad-prensa',
      nombre: 'Ilustración y Libertad de Prensa',
      anioInicio: 1700,
      anioFin: 1830,
      color: '#1E3A8A',
      categoria: 'libertad',
      descripcion: `El siglo XVIII convirtió la prensa en herramienta política central de la Ilustración. John Milton había argumentado en Areopagitica (1644) contra la censura previa con un argumento que resonaría durante siglos: la verdad emerge del libre debate de ideas, no de su supresión. Pero fue Suecia quien materializó ese principio antes que ningún otro Estado: la Freedom of the Press Act (1766) es la primera ley de libertad de prensa del mundo y sigue vigente, adaptada, como parte de la Constitución sueca actual —la más antigua en vigor en el mundo sobre esta materia.

En los Estados Unidos nacientes, la Primera Enmienda (1791) garantizó que el Congreso no podría legislar para restringir la libertad de prensa. The Federalist Papers (1787-1788), firmados colectivamente como "Publius" por Alexander Hamilton, James Madison y John Jay en los periódicos de Nueva York, representan el ejemplo más célebre de cómo la prensa moldeó un debate político constituyente: 85 artículos argumentando a favor de la ratificación de la Constitución federal publicados como tribuna abierta.

La Revolución Francesa mostró tanto el poder transformador de la prensa libre como su vulnerabilidad: L'Ami du peuple de Jean-Paul Marat (1789) radicalizó la opinión popular con un periodismo inflamado que él mismo reconocía como propaganda política. En América Latina, los periódicos ilustrados —la Gazeta de Lima (1715), el Mercurio Peruano (1791), el Semanario de Nueva Granada (1808)— jugaron un papel documentado en la gestación de las ideas independentistas al difundir las ideas de Locke, Montesquieu y los revolucionarios norteamericanos entre las élites criollas. La tensión entre prensa como herramienta de poder y como contrapoder al poder ha estado presente desde el primer día.`,
      obraIconica: `Freedom of the Press Act, Suecia (1766) — primera ley de libertad de prensa del mundo`,
      paises: ['Suecia', 'Reino Unido', 'Estados Unidos', 'Francia', 'América Latina'],
    },
    {
      id: 'prensa-penny-masas',
      nombre: 'Prensa de un Penique y Masas',
      anioInicio: 1830,
      anioFin: 1900,
      color: '#D97706',
      categoria: 'masas',
      descripcion: `La revolución industrial de la prensa llegó en los años 1830 con la "penny press" (prensa de un penique) norteamericana. Hasta entonces, los periódicos costaban entre 6 y 10 centavos y se dirigían principalmente a comerciantes y élites. El New York Sun (1833) de Benjamin Day y el New York Herald (1835) de James Gordon Bennett abarataron el precio a 1 céntimo financiándose con publicidad en lugar de suscripciones. La circulación se disparó: el New York Herald pasó de cero a más de 60.000 lectores en su primer año, una cifra sin precedentes. La prensa dejó de ser un lujo y se convirtió en un producto de consumo masivo.

Dos innovaciones tecnológicas multiplicaron este efecto. Primero, la prensa rotativa de vapor (Richard Hoe, 1843) permitió imprimir 8.000 hojas por hora frente a las 200 de las prensas manuales anteriores. Segundo, el telégrafo eléctrico (patentado por Morse en 1840, operativo comercialmente desde 1844) permitió transmitir noticias entre ciudades en minutos en lugar de días, redefiniendo el concepto de "noticia de última hora". La entrevista periodística como género —el periodista que busca activamente declaraciones de protagonistas— nació en el New York Herald hacia 1836.

Surgieron las agencias de noticias internacionales que estructuran el periodismo global hasta hoy: Havas (1835, París), Associated Press (1846, Nueva York, cooperativa de periódicos), Reuters (1851, Londres, que comenzó transmitiendo cotizaciones bursátiles por paloma mensajera). El concepto de "cuarto poder" —la prensa como contrapoder institucional junto al legislativo, ejecutivo y judicial— se popularizó en este período, atribuido a Edmund Burke (~1787) refiriéndose a los periodistas en la tribuna del Parlamento británico, aunque la atribución exacta es debatida por los historiadores.`,
      obraIconica: 'New York Sun (1833) — primer periódico de masas a 1 centavo',
      paises: ['Estados Unidos', 'Reino Unido', 'Francia', 'Alemania'],
    },
    {
      id: 'prensa-amarilla-guerra-cuba',
      nombre: 'Periodismo Amarillo y Guerras',
      anioInicio: 1895,
      anioFin: 1920,
      color: '#B45309',
      categoria: 'masas',
      descripcion: `El término "periodismo amarillo" (yellow journalism) nació de la feroz rivalidad comercial entre William Randolph Hearst (New York Journal, adquirido en 1895) y Joseph Pulitzer (New York World): ambos usaron titulares sensacionalistas, ilustraciones dramatizadas y narrativas emocionalmente manipuladoras para aumentar la circulación a toda costa. El nombre procede de la tira cómica "Yellow Kid" de Richard Outcault, por cuya publicación ambos periódicos se disputaron los derechos en los tribunales.

Su cobertura de la insurrección cubana (1895-1898) y especialmente de la explosión del acorazado USS Maine en La Habana (15 de febrero de 1898, 266 muertos) fue acusada de avivar el conflicto con España y de presionar al gobierno McKinley hacia la guerra. La frase atribuida a Hearst —"Tú pon las fotos, yo pondré la guerra"— es probablemente apócrifa pero captura la percepción de la época. Los historiadores contemporáneos debaten el alcance real de la influencia mediática en la declaración de guerra; el consenso actual es que la prensa reflejó y amplificó el belicismo preexistente más que lo creó.

La Primera Guerra Mundial mostró a escala industrial el poder de la propaganda institucional: el Committee on Public Information (CPI) de EEUU (1917-1919), dirigido por George Creel, movilizó a más de 75.000 "cuatro minutos" —oradores que daban discursos patrióticos en salas de cine— y produjo 75 millones de folletos. Los periodistas en el frente trabajaban bajo censura militar estricta. Paradójicamente, el Premio Pulitzer —símbolo del periodismo de calidad— fue creado en 1917 por el testamento del mismo Joseph Pulitzer cuyo periódico había protagonizado los peores excesos del amarillismo dos décadas antes.`,
      obraIconica: 'Rivalidad Hearst-Pulitzer y la guerra hispano-estadounidense (1898)',
      paises: ['Estados Unidos', 'Cuba', 'Reino Unido', 'Francia', 'Alemania'],
    },
    {
      id: 'radio-television-nuevos-medios',
      nombre: 'Radio y Televisión',
      anioInicio: 1920,
      anioFin: 1980,
      color: '#7C3AED',
      categoria: 'medios',
      descripcion: `La radio transformó el periodismo en los años 1920 de manera más profunda que cualquier tecnología anterior: por primera vez en la historia, las noticias llegaban en tiempo real a los hogares de millones de personas simultáneamente, sin necesidad de saber leer. KDKA Pittsburgh (1920) es considerada la primera emisora comercial de radio en emitir regularmente. La BBC fue fundada en 1922 como servicio público de radiodifusión sin publicidad —un modelo que influiría en decenas de emisoras públicas en todo el mundo.

Orson Welles demostró involuntariamente el poder hipnótico del medio el 30 de octubre de 1938: su adaptación radiofónica de La Guerra de los Mundos de H.G. Wells, emitida en el formato de boletín de noticias de última hora, causó pánico real en parte de la audiencia que creyó que una invasión marciana estaba ocurriendo. El incidente fue analizado por el sociólogo Hadley Cantril en The Invasion from Mars (1940), el primer estudio empírico sobre los efectos psicológicos de los medios de comunicación.

La televisión añadió la imagen permanente al sonido. El debate Kennedy-Nixon (26 de septiembre de 1960) es el primer caso documentado de influencia televisiva en un resultado electoral: los encuestados que lo siguieron por radio tendían a dar por ganador a Nixon; los que lo vieron por televisión a Kennedy, cuya presencia visual era más atractiva. La cobertura en directo del asesinato de Kennedy (22 de noviembre de 1963) durante cuatro días ininterrumpidos y del primer alunizaje del Apolo 11 (20 de julio de 1969) convirtieron a la televisión en el medio dominante del siglo XX. CNN (1980) fue la primera cadena de noticias 24 horas del mundo, estableciendo el modelo de cobertura continua que hoy dan por supuesto todas las plataformas digitales.`,
      obraIconica: 'Debate Kennedy-Nixon por televisión (1960) — primer impacto electoral documentado de la TV',
      paises: ['Estados Unidos', 'Reino Unido', 'Francia', 'Alemania', 'Global'],
    },
    {
      id: 'periodismo-investigacion-watergate',
      nombre: 'Periodismo de Investigación',
      anioInicio: 1960,
      anioFin: 1990,
      color: '#059669',
      categoria: 'investigacion',
      descripcion: `El periodismo de investigación —el periodismo que dedica tiempo y recursos a descubrir verdades que el poder prefiere mantener ocultas— alcanzó su cénit simbólico con el caso Watergate. Bob Woodward y Carl Bernstein del Washington Post investigaron durante más de dos años el escándalo que comenzó con el robo en la sede del Partido Demócrata el 17 de junio de 1972 y terminó con la renuncia del presidente Richard Nixon el 9 de agosto de 1974 —el único presidente en ejercicio que ha dimitido en la historia de EEUU.

Su metodología —verificación de tres fuentes independientes, nunca una sola fuente, siempre contrastar con los acusados antes de publicar— y sus fuentes, incluido el legendario "Garganta Profunda" (Deep Throat), cuya identidad permaneció secreta durante 33 años hasta que Mark Felt, subdirector del FBI, lo reveló en 2005, se convirtieron en el estándar pedagógico del periodismo de investigación en todo el mundo. Su libro Todos los hombres del presidente (1974) y la película homónima (1976) hicieron del periodismo de investigación un ideal cultural.

Otros hitos del mismo período: la publicación de los Pentagon Papers (New York Times y Washington Post, junio de 1971), 7.000 páginas de documentos clasificados sobre el engaño sistemático del gobierno en la guerra de Vietnam, que el presidente Nixon intentó bloquear judicialmente sin éxito (el Tribunal Supremo falló 6-3 a favor de la prensa). El reportaje de Seymour Hersh sobre la masacre de My Lai (noviembre de 1969), en que soldados estadounidenses mataron entre 347 y 504 civiles vietnamitas, ganó el Premio Pulitzer en 1970. El periodismo de investigación requería tiempo, recursos institucionales y respaldo editorial —condiciones que se volverían progresivamente más difíciles con la crisis del modelo de negocio de la prensa escrita.`,
      obraIconica: 'Caso Watergate (Washington Post, 1972-1974) — renuncia de Nixon',
      paises: ['Estados Unidos', 'Reino Unido', 'Europa occidental'],
    },
    {
      id: 'crisis-prensa-internet',
      nombre: 'Crisis de la Prensa e Internet',
      anioInicio: 1995,
      anioFin: 2015,
      color: '#DC2626',
      categoria: 'digital',
      descripcion: `Internet destruyó en menos de dos décadas el modelo de negocio de la prensa escrita que había funcionado durante 150 años. El mecanismo fue doble. Por el lado de los ingresos, los clasificados —que representaban entre el 30% y el 40% de los ingresos publicitarios de muchos periódicos— desaparecieron con Craigslist (1995) y eBay; la publicidad gráfica migró masivamente a Google AdWords (2000) y Facebook Ads (2007), que ofrecían segmentación y métricas de efectividad que el papel no podía igualar. Por el lado de la distribución, los lectores podían acceder gratuitamente a los contenidos en la web, eliminando el incentivo para pagar por el papel.

Los datos son contundentes: según el Pew Research Center, el empleo en redacciones de noticias en EEUU cayó de aproximadamente 114.000 puestos en 2008 a 85.000 en 2020 —una reducción del 26% en doce años. La circulación de periódicos en papel cayó más del 70% entre 1990 y 2020 en los mercados occidentales. Centenares de periódicos locales cerraron, generando lo que los investigadores denominaron "news deserts" (desiertos informativos): condados y municipios sin ninguna cobertura periodística local.

En este contexto de crisis surgió el periodismo digital nativo: The Huffington Post (Arianna Huffington, 2005), BuzzFeed (Jonah Peretti, 2006) con su modelo de contenido viral, El Español (Pedro J. Ramírez, 2015) en España. También el periodismo sin ánimo de lucro: ProPublica (2008), The Bureau of Investigative Journalism (2010, Reino Unido), El Confidencial (2001, España). El modelo freemium —contenido gratuito con suscripción premium para contenidos exclusivos o sin publicidad— emergió como la respuesta más extendida: el New York Times lanzó su muro de pago en 2011 y superó los 10 millones de suscriptores digitales en 2022.`,
      obraIconica: 'Caída del empleo periodístico: de 114.000 a 85.000 empleos en EEUU (2008-2020)',
      paises: ['Estados Unidos', 'Reino Unido', 'España', 'Europa', 'Global'],
    },
    {
      id: 'redes-sociales-desinformacion',
      nombre: 'Redes Sociales y Desinformación',
      anioInicio: 2010,
      anioFin: 2020,
      color: '#9333EA',
      categoria: 'digital',
      descripcion: `Las redes sociales convirtieron a cualquier persona con un teléfono en un potencial emisor de noticias, con consecuencias ampliamente documentadas en ambas direcciones. Por un lado, la Primavera Árabe (2010-2012) mostró cómo Twitter, Facebook y YouTube permitieron coordinar protestas y difundir información sobre represión gubernamental que los medios oficiales de Túnez, Egipto y Libia censuraban activamente. Por otro, las elecciones presidenciales de EEUU en 2016 y el referéndum del Brexit en el Reino Unido (también 2016) documentaron el papel a escala industrial de la desinformación en debates democráticos centrales.

Un estudio publicado en Science en marzo de 2018 por investigadores del MIT Media Lab (Vosoughi, Roy y Aral) analizó 126.000 cadenas de noticias compartidas en Twitter entre 2006 y 2017 y concluyó que las noticias falsas se difundían entre 6 y 20 veces más rápido que las verdaderas, llegaban a más personas y penetraban más profundamente en la red —y que los humanos eran más responsables de esta difusión que los bots. El diccionario Collins eligió "fake news" como palabra del año en 2017. En su comparecencia ante el Congreso de EEUU en abril de 2018, Mark Zuckerberg reconoció que contenido fabricado por la Agencia de Investigación de Internet rusa (IRA) alcanzó aproximadamente 126 millones de estadounidenses durante las elecciones de 2016.

La verificación de hechos (fact-checking) se institucionalizó como respuesta: Snopes (fundada en 1994, reconvertida al fact-checking político), FactCheck.org (2003, Universidad de Pensilvania), PolitiFact (2007, Tampa Bay Times, Premio Pulitzer 2009), Newtral y Maldita.es (ambas fundadas en España en 2018). La IFCLA (International Fact-Checking Network) acredita a más de 100 organizaciones de verificación en más de 50 países.`,
      obraIconica: `Estudio MIT sobre desinformación en Twitter — Science, 2018`,
      paises: ['Global', 'Estados Unidos', 'Reino Unido', 'España', 'Oriente Medio'],
    },
    {
      id: 'ia-periodismo-futuro',
      nombre: 'IA y el Futuro del Periodismo',
      anioInicio: 2020,
      anioFin: 9999,
      color: '#0369A1',
      categoria: 'digital',
      descripcion: `La inteligencia artificial generativa está transformando el periodismo de múltiples formas simultáneas y con efectos que los investigadores están documentando en tiempo real. Associated Press colabora desde 2014 con Automated Insights para generar automáticamente crónicas de resultados deportivos y financieros a partir de datos estructurados —produciendo decenas de miles de artículos por trimestre que ninguna redacción humana podría cubrir. La Washington Post usa su sistema Heliograf para noticias locales automatizadas desde 2016. En 2023, CNET publicó decenas de artículos generados total o parcialmente por IA sin declararlo claramente, generando un debate sobre transparencia y estándares editoriales que recorrió toda la industria.

Al mismo tiempo, el periodismo enfrenta lo que los investigadores denominan "crisis de confianza" estructural. El Reuters Institute Digital News Report (2023), que encuesta a más de 93.000 personas en 46 países, mide el porcentaje de personas que confían en las noticias en general: cayó del 44% en 2015 al 40% en 2023, con variaciones muy significativas por país (Finlandia lidera con más del 69%, Hungría y Grecia están por debajo del 20%). Reporteros Sin Fronteras (RSF) documenta en su Índice Mundial de Libertad de Prensa, publicado anualmente desde 2002, el nivel de libertad periodística en 180 países: en el índice de 2024, los países nórdicos encabezan la clasificación y Corea del Norte, Eritrea y Rusia ocupan los últimos puestos.

Los modelos de negocio emergentes documentados incluyen el periodismo de membresía (The Guardian, con 1 millón de suscriptores de pago en 2023; El País+ en España), el periodismo de servicios especializado (The Athletic para deportes, Zetland en Dinamarca), los boletines de autor (Substack, fundado en 2017), y el periodismo sin ánimo de lucro financiado por fundaciones. Ninguno ha alcanzado la escala del viejo modelo publicitario, pero el ecosistema se ha diversificado estructuralmente.`,
      obraIconica: 'Reuters Institute Digital News Report 2023 — análisis de confianza mediática en 46 países',
      paises: ['Global', 'Estados Unidos', 'Europa', 'España'],
    },
  ],

  eras: [
    {
      nombre: 'Antecedentes y Primer Periodismo Impreso',
      desde: -59,
      hasta: 1700,
      icono: '📜',
      hitosDestacados: ['Acta Diurna de Roma', 'Primer Periódico Impreso'],
      eventos: [
        'Acta Diurna de Julio César (59 a.C.): primera información pública oficial',
        'Avvisi manuscritos en ciudades italianas (ss. XIV-XVI)',
        'Invención de la imprenta de tipos móviles por Gutenberg (~1450)',
        'Gaceta de Venecia (~1566): primer boletín de noticias de pago',
        'Cartas de noticias de los Fugger (1568-1605): primer archivo privado periodístico',
        'Relation aller Fürnemmen... de Johann Carolus (Estrasburgo, 1605): primer periódico impreso',
        'Gazette de France (1631): primer periódico gubernamental de gran escala',
        'Daily Courant (Londres, 1702): primer periódico diario en inglés',
      ],
    },
    {
      nombre: 'Ilustración y Libertad de Prensa',
      desde: 1700,
      hasta: 1830,
      icono: '🕯️',
      hitosDestacados: ['Ilustración y Libertad de Prensa'],
      eventos: [
        'Freedom of the Press Act sueca (1766): primera ley de libertad de prensa del mundo',
        'Primera Enmienda de EEUU (1791): garantía constitucional de la libertad de prensa',
        'The Federalist Papers en prensa neoyorquina (1787-1788)',
        `L'Ami du peuple de Marat durante la Revolución Francesa (1789)`,
        'Periódicos ilustrados en América Latina y su papel en las independencias (1791-1820)',
        'Concepto del "cuarto poder" popularizado (~1787, atribuido a Burke)',
      ],
    },
    {
      nombre: 'Prensa de Masas e Industrialización',
      desde: 1830,
      hasta: 1920,
      icono: '🗞️',
      hitosDestacados: ['Prensa de un Penique y Masas', 'Periodismo Amarillo y Guerras'],
      eventos: [
        'New York Sun (1833): primer periódico de masas a 1 centavo',
        'Agencia Havas (1835, París): primera agencia de noticias internacional',
        'Prensa rotativa de vapor de Richard Hoe (1843): 8.000 páginas por hora',
        'Associated Press (1846): cooperativa de periódicos norteamericanos',
        'Reuters (1851, Londres): inicio con cotizaciones bursátiles por paloma mensajera',
        'Telégrafo comercial (1844): noticias intercontinentales en minutos',
        'Rivalidad Hearst-Pulitzer y periodismo amarillo (1895-1900)',
        'Committee on Public Information de EEUU en la Primera Guerra Mundial (1917-1919)',
        'Premio Pulitzer (fundado 1917 por testamento de Joseph Pulitzer)',
      ],
    },
    {
      nombre: 'Radio, Televisión y el Cuarto Poder',
      desde: 1920,
      hasta: 1990,
      icono: '📺',
      hitosDestacados: ['Radio y Televisión', 'Periodismo de Investigación'],
      eventos: [
        'KDKA Pittsburgh (1920): primera emisora comercial de radio regular',
        'BBC fundada como servicio público sin publicidad (1922)',
        `Pánico radiofónico por "La Guerra de los Mundos" de Orson Welles (1938)`,
        'Debate Kennedy-Nixon por televisión (1960): primer impacto electoral documentado',
        'Cobertura en directo del asesinato de Kennedy (1963, 4 días continuos)',
        'Seymour Hersh desvela la masacre de My Lai, Premio Pulitzer (1969-1970)',
        'Pentagon Papers: New York Times y Washington Post vs. Nixon (1971)',
        'Watergate: Woodward y Bernstein fuerzan la renuncia de Nixon (1972-1974)',
        'CNN: primera cadena de noticias 24 horas del mundo (1980)',
      ],
    },
    {
      nombre: 'Crisis del Modelo e Internet',
      desde: 1990,
      hasta: 2015,
      icono: '💻',
      hitosDestacados: ['Crisis de la Prensa e Internet'],
      eventos: [
        'World Wide Web pública (1991): noticias accesibles gratis en red',
        'Craigslist (1995): destrucción de los clasificados de prensa',
        'Snopes (1994): pionero del fact-checking digital',
        'Google AdWords (2000): migración masiva de publicidad digital',
        'The Huffington Post (2005): primer gran nativo digital generalista',
        'Facebook Ads (2007): segmentación que el papel no puede igualar',
        'ProPublica (2008): periodismo de investigación sin ánimo de lucro',
        'Caída de empleo periodístico: de 114.000 a 85.000 en EEUU (2008-2020)',
        'New York Times muro de pago (2011): modelo freemium como respuesta',
        'El Español (2015): gran nativo digital en España',
      ],
    },
    {
      nombre: 'Redes Sociales, IA y Futuro',
      desde: 2015,
      hasta: 9999,
      icono: '🤖',
      hitosDestacados: ['Redes Sociales y Desinformación', 'IA y el Futuro del Periodismo'],
      eventos: [
        'Primavera Árabe (2010-2012): redes sociales como herramienta informativa contra censura',
        'Desinformación en elecciones EEUU y Brexit (2016)',
        `"Fake news" elegida palabra del año por Collins Dictionary (2017)`,
        'Estudio MIT en Science: las noticias falsas se difunden 6x más rápido (2018)',
        'Comparecencia de Zuckerberg ante el Congreso de EEUU (2018)',
        'Newtral y Maldita.es fundadas en España (2018)',
        'AP genera decenas de miles de crónicas automáticas por trimestre (desde 2014)',
        'Substack (2017): boletines de autor como modelo de periodismo de nicho',
        'Debate sobre IA en redacciones sin declaración de autoría (CNET, 2023)',
        'Reuters Institute: confianza en noticias cae al 40% en 46 países (2023)',
        'RSF Índice de Libertad de Prensa 2024: nórdicos lideran, Corea del Norte última',
      ],
    },
  ],

  categorias: {
    origen: 'Orígenes',
    nacimiento: 'Nacimiento de la Prensa',
    libertad: 'Libertad de Prensa',
    masas: 'Prensa de Masas',
    medios: 'Nuevos Medios',
    investigacion: 'Periodismo de Investigación',
    digital: 'Era Digital',
  },

  colores: {
    origen: '#374151',
    nacimiento: '#92400E',
    libertad: '#1E3A8A',
    masas: '#D97706',
    medios: '#7C3AED',
    investigacion: '#059669',
    digital: '#DC2626',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: `Desde las Acta Diurna de Julio César hasta los algoritmos de IA que redactan noticias en tiempo real, el periodismo lleva más de 2.000 años siendo el dispositivo con el que las sociedades se informan sobre sí mismas. Su historia es también la historia de la libertad de expresión, la propaganda, el negocio, la tecnología y la confianza pública. Cada revolución tecnológica —la imprenta, el telégrafo, la radio, la televisión, internet, las redes sociales, la IA— ha transformado radicalmente quién puede informar, a quién, con qué rapidez y con qué coste. Lo que no ha cambiado es la tensión estructural entre el periodismo como servicio público y como negocio, y entre el periodismo como contrapoder y como instrumento del poder.`,

    tablaComparativa: [
      {
        hito: 'Prensa de partido (s.XIX)',
        periodo: '1800-1900',
        categoria: 'masas',
        personaje: 'Partidos políticos financiadores',
        aportacion: 'Política',
      },
      {
        hito: 'Prensa comercial (s.XX)',
        periodo: '1900-1990',
        categoria: 'masas',
        personaje: 'Hearst, Pulitzer, grandes editores',
        aportacion: 'Publicidad',
      },
      {
        hito: 'Servicio público (BBC model)',
        periodo: '1922-presente',
        categoria: 'medios',
        personaje: 'BBC, France Télévisions, RTVE',
        aportacion: 'Canon/Estado',
      },
      {
        hito: 'Periodismo de investigación',
        periodo: '1960-presente',
        categoria: 'investigacion',
        personaje: 'Washington Post, NYT, ProPublica',
        aportacion: 'Publicidad + mecenazgo',
      },
      {
        hito: 'Nativo digital (HuffPost/BuzzFeed)',
        periodo: '2005-presente',
        categoria: 'digital',
        personaje: 'Arianna Huffington, Jonah Peretti',
        aportacion: 'Publicidad digital + viral',
      },
      {
        hito: 'Membresía (The Guardian, El País+)',
        periodo: '2010-presente',
        categoria: 'digital',
        personaje: 'The Guardian, Substack, Zetland',
        aportacion: 'Suscripción directa + donaciones',
      },
    ],

    escenarios: [
      {
        icono: '🔍',
        titulo: 'La prensa como cuarto poder: Watergate y los límites del periodismo',
        perfil: 'Ciudadano interesado en el papel democrático de la prensa',
        texto: `El caso Watergate (1972-1974) es el ejemplo canónico de periodismo como contrapoder institucional: dos reporteros de un periódico privado investigaron durante dos años y obligaron a dimitir al presidente más poderoso del mundo. Pero también ilustra sus condicionantes: necesitaron el respaldo pleno de la editora Katharine Graham y del director Ben Bradlee (que arriesgaron la empresa); una fuente privilegiada dentro del FBI; y dos años de trabajo sin resultado publicado. El periodismo de investigación es caro, lento y requiere instituciones que lo respalden. La pregunta actual es si los modelos de negocio digitales permiten financiar ese tipo de periodismo a escala suficiente.`,
      },
      {
        icono: '💰',
        titulo: 'El modelo de negocio de la publicidad y por qué internet lo destruyó',
        perfil: 'Interesado en economía de los medios',
        texto: `Durante 150 años, el modelo funcionó así: los periódicos atraían lectores con contenido informativo y cobraban a los anunciantes por el acceso a esa audiencia. Los clasificados (compra-venta, empleo, inmobiliaria) eran el segmento más lucrativo. Internet rompió las dos patas: Craigslist y eBay eliminaron los clasificados sin cobrar por ello; Google y Facebook ofrecían publicidad más efectiva (medible, segmentable) a menor coste. El contenido informativo seguía disponible gratis en la web. El resultado: los periódicos perdieron ingresos sin perder costes de producción. El modelo freemium (muro de pago poroso) y la membresía directa son la respuesta más documentada, pero ninguno ha recuperado la escala del viejo modelo.`,
      },
      {
        icono: '🚨',
        titulo: 'Fake news: cómo se difunde la desinformación y qué herramientas existen para combatirla',
        perfil: 'Usuario de redes sociales que quiere verificar noticias',
        texto: `El estudio del MIT (Science, 2018) documentó que las noticias falsas se difunden más rápido que las verdaderas porque son más novedosas y sorprendentes —activan emociones como indignación o miedo que generan más comparticiones. Los fact-checkers (Snopes, FactCheck, PolitiFact, Newtral, Maldita.es) verifican afirmaciones concretas usando fuentes primarias, bases de datos oficiales y consultas a expertos. Ningún sistema es infalible: la verificación es más lenta que la difusión; y el "efecto de retroceso" (backfire effect, debatido en la literatura académica) sugiere que las correcciones no siempre deshacen la creencia errónea inicial. Las plataformas han implementado etiquetas de contexto, reducción algorítmica de viralidad de contenido no verificado y acuerdos con fact-checkers, con efectividad documentada pero limitada.`,
      },
      {
        icono: '🌍',
        titulo: 'El periodismo en países sin libertad de prensa',
        perfil: 'Interesado en derechos humanos y geopolítica',
        texto: `El Índice Mundial de Libertad de Prensa de RSF (Reporteros Sin Fronteras), publicado anualmente desde 2002, clasifica 180 países según cinco indicadores: seguridad de los periodistas, entorno económico, contexto legislativo, entorno político y entorno sociocultural. En 2024, los cinco primeros son países nórdicos (Noruega, Dinamarca, Suecia, Finlandia, Países Bajos); los cinco últimos son Corea del Norte, Eritrea, Irán, China y Rusia. El Comité para la Protección de los Periodistas (CPJ) documenta cada año los periodistas asesinados o encarcelados por su trabajo: en 2023, documentó al menos 99 periodistas encarcelados (China, Myanmar e Israel encabezaban la lista). El periodismo en contextos represivos ha encontrado en las redes de mensajería cifrada (Signal) y en los medios en el exilio nuevos mecanismos de resistencia.`,
      },
    ],

    faq: [
      {
        pregunta: '¿Qué diferencia hay entre periodismo y opinión?',
        respuesta: `La distinción clásica entre noticia y opinión —separar hechos de valoraciones— es un principio editorial del periodismo anglosajón del siglo XX. Una noticia describe hechos verificables con fuentes identificables; una columna de opinión o un editorial expresan la posición del autor o del medio. En la práctica, la distinción es más compleja: la elección de qué cubrir, con qué énfasis y con qué fuentes implica criterios editoriales que no son neutrales. El periodismo de análisis e interpretación ocupa un espacio intermedio. Los libros de estilo de los grandes medios (El País, NYT, BBC) dedican secciones extensas a regular esta distinción. En el entorno digital, los géneros se han hibridado y los contenidos de opinión generan más engagement en redes, lo que ha generado presión hacia la opinión en muchas redacciones.`,
        tip: 'Fíjate en si el texto incluye fuentes identificables y citas textuales (noticia) o si predomina el análisis del autor (opinión).',
      },
      {
        pregunta: '¿Cómo se financia el periodismo de calidad en la era digital?',
        respuesta: `No existe un único modelo dominante. Los más documentados son: (1) Muros de pago (New York Times, The Times, El Mundo): el NYT superó 10 millones de suscriptores digitales en 2022. (2) Membresía voluntaria (The Guardian): más de 1 millón de contribuyentes regulares sin muro de pago obligatorio. (3) Boletines de autor (Substack): ingresos directos de suscriptores a autores individuales, sin intermediario editorial. (4) Fundaciones sin ánimo de lucro (ProPublica, Bureau of Investigative Journalism): financiadas por donaciones de fundaciones privadas y ciudadanos. (5) Modelos híbridos: combinación de publicidad digital (ya reducida), suscripciones, eventos y formación. Los estudios de Reuters Institute indican que la disposición a pagar por noticias digitales es mayor entre lectores de mayor edad, mayor nivel educativo y en países nórdicos.`,
      },
      {
        pregunta: '¿Qué es el fact-checking y cómo funciona?',
        respuesta: `El fact-checking (verificación de hechos) es la práctica periodística de contrastar afirmaciones públicas concretas —declaraciones políticas, datos estadísticos, afirmaciones virales— contra fuentes primarias verificables. La metodología estándar incluye: identificar la afirmación exacta a verificar, buscar la fuente original de la afirmación, contrastarla con bases de datos oficiales, publicaciones científicas o documentos primarios, consultar expertos cuando sea necesario, y publicar el resultado con la cadena de evidencia completa. Organizaciones como FactCheck.org, PolitiFact y Maldita.es publican sus metodologías de forma transparente. El fact-checking institucionalizado como práctica periodística diferenciada surgió en EEUU en los años 2000; la IFCLA (International Fact-Checking Network) acredita desde 2015 a organizaciones que cumplen un código de principios que incluye no partidismo, transparencia de fuentes y método, y política de correcciones.`,
      },
      {
        pregunta: '¿Es legal que la IA escriba noticias sin declararlo?',
        respuesta: `En 2023-2024, no existe en la mayoría de países una ley que obligue específicamente a declarar el uso de IA en la redacción de noticias. Sin embargo, la mayoría de libros de estilo de medios de referencia actualizados (AP, BBC, NYT) incluyen ya políticas de transparencia sobre uso de IA: hay que declararlo cuando la IA genera el texto de forma sustancial, no cuando se usa como herramienta de apoyo. El caso de CNET (2023), que publicó artículos generados por IA sin declararlo y que contenían errores factuales, generó un debate industria-wide sobre estándares. La Unión Europea está desarrollando regulación sobre transparencia en sistemas de IA (AI Act, 2024) que podría establecer obligaciones de etiquetado. El debate sobre autoría, responsabilidad editorial y estándares de calidad en periodismo generado por IA es uno de los centrales de la industria en este momento.`,
        tip: 'Busca en los artículos notas al pie o avisos editoriales sobre uso de IA, y comprueba si el medio tiene política pública al respecto.',
      },
      {
        pregunta: '¿Cuántos periodistas son asesinados o encarcelados cada año?',
        respuesta: `El Comité para la Protección de los Periodistas (CPJ) documenta sistemáticamente los casos desde 1992. En 2023, el CPJ contabilizó al menos 99 periodistas encarcelados al final del año (el número más alto desde que llevan el registro) y 24 periodistas muertos en relación directa con su trabajo. China, Myanmar e Israel encabezaban la lista de países con más periodistas encarcelados. Reporteros Sin Fronteras (RSF) documenta cifras similares con metodología ligeramente diferente. Las regiones más peligrosas varían por año: México tiene históricamente uno de los índices más altos de periodistas asesinados con impunidad entre países formalmente democráticos. La cobertura de corrupción, crimen organizado y conflictos armados es la que mayor riesgo conlleva para los periodistas.`,
      },
    ],

    pasos: [
      {
        titulo: 'Identifica la fuente original',
        cuerpo: `Antes de compartir o dar por válida una noticia, busca quién la publicó primero. Las noticias virales frecuentemente atribuyen la información a "medios" sin especificar cuál. Busca el nombre del medio, el autor, la fecha y si hay un enlace a la fuente primaria (documento oficial, declaración institucional, estudio científico). Los agregadores y las redes sociales tienden a descontextualizar y a eliminar la atribución original.`,
      },
      {
        titulo: 'Verifica las fuentes citadas en el texto',
        cuerpo: `Un buen artículo periodístico cita fuentes verificables: nombres completos con cargo y organización, documentos con enlace o referencia precisa, estadísticas con su origen (estudio, informe, organización). Haz clic en los enlaces o busca los documentos citados. Comprueba que la fuente dice lo que el artículo afirma que dice —la descontextualización de citas y estadísticas es uno de los vectores más frecuentes de desinformación incluso en medios establecidos.`,
      },
      {
        titulo: 'Contrasta con medios de referencia independientes',
        cuerpo: `Si la noticia es relevante, es probable que más de un medio la haya cubierto. Busca si medios de referencia con distintas orientaciones editoriales (para reducir el sesgo de confirmación) cubren la misma historia y con qué datos y enfoque. Si solo un medio poco conocido cubre una historia que debería ser importante, es una señal de alerta. Los medios de referencia se equivocan, pero tienen mecanismos de verificación y de corrección que los medios oportunistas no tienen.`,
      },
      {
        titulo: 'Comprueba si fact-checkers han analizado la historia',
        cuerpo: `Para afirmaciones virales o polémicas, busca en organizaciones de verificación: Snopes (snopes.com), FactCheck.org, PolitiFact para el ámbito anglosajón; Newtral (newtral.es) y Maldita.es para España; AFP Factual, Les Décodeurs (Le Monde) para el ámbito francófono. Escribe en el buscador la afirmación concreta + "fact check" o visita directamente estas webs. La IFCLA mantiene un directorio de fact-checkers acreditados por país en ifcncodeofprinciples.poynter.org.`,
      },
      {
        titulo: 'Evalúa el contexto: fecha, imágenes y datos estadísticos',
        cuerpo: `Tres vectores frecuentes de desinformación: (1) Fechas: fotografías e informaciones verídicas presentadas fuera de contexto temporal (una foto de 2015 presentada como de 2024). Usa Google Images o TinEye para buscar el origen de imágenes. (2) Imágenes manipuladas: herramientas como FotoForensics.com o la búsqueda inversa de imágenes permiten detectar manipulaciones básicas. (3) Estadísticas descontextualizadas: un porcentaje sin denominar (¿de qué total?), una media sin distribución, o una comparación entre magnitudes distintas pueden generar impresiones falsas con datos técnicamente ciertos. Siempre pregunta: ¿respecto a qué? ¿durante qué período? ¿con qué metodología?`,
      },
    ],

    tips: [
      {
        icono: '🔎',
        texto: `Para distinguir noticia, análisis, opinión y publicidad en un medio digital: las noticias deben tener byline (firma), fecha, fuentes identificadas y hechos verificables; el análisis añade interpretación pero con base empírica documentada; la opinión expresa la posición del autor y lo indica explícitamente; la publicidad nativa (branded content, patrocinado, contenido de marca) debe estar etiquetada como tal por ley en la UE —si no lo está, es una práctica irregular. En móvil, el formato de tarjeta o carrusel de redes sociales tiende a eliminar todos estos identificadores; cuando tengas dudas, ve directamente a la web del medio.`,
      },
      {
        icono: '✅',
        texto: `Recursos de verificación esenciales: Snopes (snopes.com) para bulos globales; FactCheck.org para política estadounidense; PolitiFact para declaraciones políticas con escala de veracidad; Newtral (newtral.es) y Maldita.es para España; AFP Factual para cobertura internacional en español; EFE Verifica para América Latina. Para imágenes: Google Images búsqueda inversa, TinEye, InVID-WeVerify (extensión de navegador especializada en vídeos). Para estadísticas: busca siempre el informe o base de datos original antes de confiar en la cifra tal como aparece en el titular.`,
      },
      {
        icono: '🗺️',
        texto: `El Índice Mundial de Libertad de Prensa de RSF (rsf.org/ranking) se publica cada mayo y clasifica 180 países en cinco dimensiones: seguridad de periodistas, entorno económico, marco legislativo, entorno político y entorno sociocultural. Es una herramienta imprescindible para contextualizar noticias de países con restricciones a la prensa: si un gobierno dice algo sobre sí mismo y ese país está en el tercio inferior del ranking, la información requiere fuentes adicionales independientes.`,
      },
      {
        icono: '💡',
        texto: `La financiación cruzada y la propiedad de los medios son factores de contexto relevantes para interpretar su cobertura. En España, la Comisión Nacional de los Mercados y la Competencia (CNMC) publica el registro de operadores de comunicación audiovisual; Civio y Maldita.es han documentado los grupos de comunicación y sus vínculos con otros sectores económicos. No implica que todo lo que publiquen sea falso, pero permite identificar posibles conflictos de interés en la cobertura de sectores en los que su propietario tiene intereses económicos.`,
      },
    ],

    errores: [
      {
        titulo: '"Si está en internet, es verdad"',
        cuerpo: `La viralidad no implica veracidad. El estudio del MIT (Science, 2018) demostró que las noticias falsas se difunden más rápido que las verdaderas en redes sociales precisamente porque activan emociones más intensas (indignación, miedo, sorpresa) que generan más comparticiones. El número de "me gusta" o retuits de una afirmación no tiene correlación con su veracidad. La comprobación sistemática con fuentes primarias —aunque sea más lenta y aburrida— es el único antídoto documentado.`,
      },
      {
        titulo: '"La objetividad periodística total es posible"',
        cuerpo: `El ideal de "objetividad" —la idea de que el periodismo puede y debe reportar hechos sin ningún sesgo— es una construcción histórica del periodismo norteamericano del siglo XX, no una realidad alcanzable. Toda selección de qué cubrir, con qué fuentes, con qué énfasis y con qué encuadre (framing) implica criterios editoriales que no son neutros. El estándar más riguroso no es la "objetividad" sino la verificabilidad, la transparencia sobre fuentes y método, la corrección de errores, y el contraste activo de perspectivas distintas. Conocer el marco ideológico de un medio no le invalida, pero obliga a leerlo con mayor sentido crítico.`,
      },
      {
        titulo: '"Los medios públicos son siempre más fiables"',
        cuerpo: `Los medios de servicio público tienen modelos de financiación que, en principio, les hacen menos dependientes de los intereses de anunciantes privados. Pero su independencia editorial real depende críticamente del marco legal de cada país y de la composición de sus órganos de gobierno. La BBC, NRK (Noruega) o ARTE (Francia-Alemania) tienen sólidas tradiciones de independencia editorial documentadas. Medios públicos en países con baja puntuación en el Índice RSF de libertad de prensa son frecuentemente instrumentalizados por los gobiernos. La forma jurídica (público vs. privado) no determina por sí sola la independencia editorial.`,
      },
      {
        titulo: '"El periodismo ciudadano puede sustituir al periodismo profesional"',
        cuerpo: `El periodismo ciudadano —la información producida por personas sin formación periodística formal usando sus dispositivos personales— ha demostrado un valor documentado en contextos donde los medios profesionales no llegan: la Primavera Árabe, catástrofes naturales, protestas. Pero complementa, no sustituye, al periodismo profesional. La verificación sistemática de fuentes, el contraste con afectados, el conocimiento de contexto y de derechos (acceso a documentos, protección de fuentes), y los mecanismos de rendición de cuentas editoriales son capacidades que requieren formación, tiempo e instituciones. La proliferación de "periodismo ciudadano" sin estas salvaguardas es también uno de los vectores de desinformación más documentados.`,
      },
    ],
  },
};
