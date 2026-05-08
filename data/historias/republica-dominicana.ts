import type { HistoriaData } from './types';

export const republicaDominicana: HistoriaData = {
  slug: 'republica-dominicana',
  titulo: 'Historia de la República Dominicana: De la Independencia al Caribe del Siglo XXI',
  subtitulo: 'Del grito del 27 de febrero de 1844 al Caribe contemporáneo: independencia, caudillismo, dictadura y democracia en la isla de La Española',
  descripcionSEO: 'Cronología interactiva de la República Dominicana: desde la independencia de Haití (1844) liderada por Juan Pablo Duarte hasta la actualidad (2025). Trujillo, Balaguer, Juan Bosch, intervenciones estadounidenses, boom turístico y relaciones con Haití en 10 hitos y 6 eras.',
  keywords: [
    'historia república dominicana cronología',
    'juan pablo duarte independencia 1844 haití',
    'trujillo dictadura masacre perejil 1937',
    'juan bosch democracia intervención eeuu 1965',
    'balaguer era democracia dominicana',
    'turismo punta cana economía dominicana',
    'relaciones haití república dominicana migración',
  ],
  anioInicio: 1844,
  anioFin: 2025,

  hitos: [
    {
      id: 'independencia-primeras-decadas',
      nombre: 'Independencia y Primeras Décadas',
      anioInicio: 1844,
      anioFin: 1865,
      color: '#1a7a4a',
      categoria: 'independencia',
      descripcion: 'El 27 de febrero de 1844, la proclamación de independencia de Haití marcó el nacimiento de la República Dominicana. Juan Pablo Duarte, Francisco del Rosario Sánchez y Ramón Mella —los Padres de la Patria— lideraron el movimiento independentista a través de la sociedad secreta La Trinitaria. Sin embargo, las primeras décadas fueron convulsas: Pedro Santana y Buenaventura Báez se alternaron en el poder a través de golpes y maniobras. En 1861, Santana firmó la reincorporación voluntaria a España, único caso de un país independiente que solicitó volver a ser colonia. La resistencia popular encabezada por líderes como Gregorio Luperón desencadenó la Guerra de la Restauración (1863-1865), que culminó con la definitiva expulsión española y la restauración de la república.',
      obraIconica: 'Proclamación de independencia en La Puerta del Conde, Santo Domingo (27 febrero 1844)',
      paises: ['República Dominicana', 'España'],
    },
    {
      id: 'inestabilidad-caudillismo',
      nombre: 'Inestabilidad y Caudillismo',
      anioInicio: 1865,
      anioFin: 1916,
      color: '#8B6914',
      categoria: 'caudillismo',
      descripcion: 'Tras la Restauración, la República Dominicana entró en un período de profunda inestabilidad con sucesivos gobiernos de corta duración. Ulises Heureaux, conocido como "Lilís", gobernó de manera autoritaria entre 1882 y 1899 y modernizó parcialmente el país, pero acumuló una deuda externa insostenible con acreedores europeos y estadounidenses. Su asesinato en 1899 dejó un país en bancarrota. La crisis de la deuda atrajo la atención de Estados Unidos: en 1905, el gobierno dominicano aceptó que Washington administrase sus aduanas para garantizar el pago a los acreedores. Esta intervención económica preparó el terreno para la ocupación militar posterior. Los caudillos regionales y las guerras civiles fragmentaban el poder sin que ningún proyecto de nación lograra consolidarse.',
      obraIconica: 'Convención domínico-americana de 1905: EEUU asume administración de las aduanas dominicanas',
      paises: ['República Dominicana', 'Estados Unidos'],
    },
    {
      id: 'primera-ocupacion-estadounidense',
      nombre: 'Primera Ocupación Estadounidense',
      anioInicio: 1916,
      anioFin: 1924,
      color: '#4169E1',
      categoria: 'ocupacion',
      descripcion: 'En mayo de 1916, la Infantería de Marina de Estados Unidos desembarcó en Santo Domingo e instauró un gobierno militar que duró ocho años. La ocupación se justificó en el marco de la Doctrina Monroe y la inestabilidad política dominicana. Los marines reorganizaron las finanzas públicas, construyeron infraestructuras (carreteras, escuelas, sistema de salud pública) y suprimieron las fuerzas armadas dominicanas. En su lugar, crearon la Guardia Nacional Dominicana, entrenada y equipada por EEUU. Esta institución sería la base de poder que permitiría a Rafael Leónidas Trujillo, graduado de la Guardia Nacional, ascender hasta hacerse con el control del Estado. La ocupación concluyó en 1924 bajo el presidente Horacio Vásquez, pero las consecuencias institucionales se prolongarían décadas.',
      obraIconica: 'Desembarco de la Infantería de Marina de EEUU en Santo Domingo (mayo 1916)',
      paises: ['República Dominicana', 'Estados Unidos'],
    },
    {
      id: 'era-trujillo',
      nombre: 'La Era de Trujillo',
      anioInicio: 1930,
      anioFin: 1961,
      color: '#8B0000',
      categoria: 'trujillato',
      descripcion: 'Rafael Leónidas Trujillo llegó al poder mediante un golpe de Estado en 1930, tras manipular las elecciones con apoyo del ejército. Durante 31 años ejerció un control total sobre la política, la economía y la sociedad dominicanas. El régimen se caracterizó por la represión sistemática de la disidencia, el culto a la personalidad y el dominio de los principales sectores económicos por parte de Trujillo y su familia. En octubre de 1937, fuerzas bajo órdenes de Trujillo masacraron a haitianos en la zona fronteriza; estimaciones históricas sitúan las víctimas entre 5.000 y 20.000, con una cifra central de aproximadamente 12.000, en lo que se conoce como la Masacre del Perejil o Masacre de Palomazo. El régimen también modernizó infraestructuras, promovió la industria y saldó la deuda externa, pero bajo una represión que incluyó el asesinato de opositores dentro y fuera del país. Trujillo fue asesinado el 30 de mayo de 1961 por un grupo de conspiradores con conexiones con la CIA.',
      obraIconica: 'Masacre del Perejil (octubre 1937): aproximadamente 12.000 víctimas haitianas según estimaciones históricas',
      paises: ['República Dominicana', 'Haití'],
    },
    {
      id: 'transicion-bosch-segunda-intervencion',
      nombre: 'Transición, Bosch y Segunda Intervención',
      anioInicio: 1961,
      anioFin: 1966,
      color: '#FF6B35',
      categoria: 'transicion',
      descripcion: 'Tras el asesinato de Trujillo, Joaquín Balaguer —ligado al régimen— dirigió la transición mientras la familia Trujillo intentaba mantener el control. La presión popular y estadounidense los forzó al exilio. En diciembre de 1962 se celebraron las primeras elecciones libres, ganadas por Juan Bosch, fundador del Partido Revolucionario Dominicano (PRD). Bosch asumió en febrero de 1963 el primer gobierno democrático de la historia dominicana, pero fue derrocado en septiembre de ese año por un golpe militar respaldado por sectores conservadores y empresariales. El Triunvirato civil que lo sustituyó fue incapaz de gobernar. En abril de 1965 estalló una guerra civil entre los constitucionalistas —que exigían la restitución de Bosch— y las fuerzas militares. El presidente Lyndon B. Johnson ordenó el desembarco de unos 28.000 soldados estadounidenses el 28 de abril de 1965, la mayor intervención militar en América Latina desde la Segunda Guerra Mundial, alegando el riesgo de una "segunda Cuba".',
      obraIconica: 'Revolución de Abril de 1965 y segunda intervención militar estadounidense (28 abril 1965)',
      paises: ['República Dominicana', 'Estados Unidos'],
    },
    {
      id: 'era-balaguer-transicion-democratica',
      nombre: 'Era Balaguer y Transición Democrática',
      anioInicio: 1966,
      anioFin: 1996,
      color: '#9B59B6',
      categoria: 'democracia',
      descripcion: 'Joaquín Balaguer, con respaldo estadounidense, ganó las elecciones de 1966 en un clima de represión contra el PRD y los sectores constitucionalistas. Gobernó en seis períodos presidenciales (1966-1978 y 1986-1996). Su gobierno combinó programas de infraestructura y desarrollo económico con autoritarismo y violencia política. En 1978 se produjo la primera transferencia pacífica del poder a la oposición: Antonio Guzmán del PRD ganó las elecciones en un proceso en que Balaguer intentó el fraude pero cedió ante la presión internacional. El período 1978-1986 supuso la consolidación de la alternancia democrática, aunque con tensiones y graves problemas económicos. Balaguer regresó al poder en 1986. Las elecciones de 1994 fueron documentadas como fraudulentas por observadores internacionales; el acuerdo resultante (Pacto por la Democracia) redujo el mandato de Balaguer a dos años y estableció la reforma constitucional que prohibió la reelección inmediata.',
      obraIconica: 'Pacto por la Democracia (1994): Balaguer acepta reducir su mandato tras fraude electoral documentado',
      paises: ['República Dominicana'],
    },
    {
      id: 'democracia-crecimiento-economico',
      nombre: 'Democracia y Crecimiento Económico',
      anioInicio: 1996,
      anioFin: 2004,
      color: '#27AE60',
      categoria: 'democracia',
      descripcion: 'Leonel Fernández, del Partido de la Liberación Dominicana (PLD), ganó las elecciones de 1996 con 51 años de edad, convirtiéndose en el primer presidente elegido sin la sombra de Balaguer o Bosch en décadas. Su gobierno impulsó la modernización económica y las telecomunicaciones. En 2000, Hipólito Mejía del PRD ganó las elecciones con promesas de continuidad democrática. Sin embargo, el período de Mejía estuvo marcado por el mayor escándalo bancario de la historia dominicana: en 2003, el Banco Intercontinental (Baninter) colapsó por fraude masivo, arrasando los ahorros de miles de ciudadanos y generando una crisis que disparó la inflación al 100 % y llevó al 42 % de la población por debajo de la línea de pobreza. La crisis Baninter fue el mayor escándalo bancario de la historia dominicana y devastó la credibilidad del gobierno de Mejía.',
      obraIconica: 'Crisis bancaria de 2003: colapso del Banco Intercontinental (Baninter), el mayor escándalo bancario dominicano',
      paises: ['República Dominicana'],
    },
    {
      id: 'boom-turistico-fernandez',
      nombre: 'Boom Turístico y Fernández',
      anioInicio: 2004,
      anioFin: 2012,
      color: '#F39C12',
      categoria: 'contemporanea',
      descripcion: 'Leonel Fernández regresó al poder en 2004, reelegido nuevamente en 2008. Su segundo y tercer mandato coincidieron con el boom turístico que consolidó a la República Dominicana como el principal destino del Caribe: Punta Cana se transformó en un referente internacional del turismo de masas. En 2007, el país suscribió el acuerdo de libre comercio DR-CAFTA con Estados Unidos y Centroamérica. El crecimiento económico fue consistente, impulsado por el turismo, las zonas francas y las remesas de la diáspora dominicana. Sin embargo, el problema crónico de los apagones eléctricos —con cortes que podían superar las 12 horas diarias en zonas rurales— persistió como uno de los principales déficits del modelo de desarrollo. El PLD dominó la política dominicana durante este período.',
      obraIconica: 'Punta Cana: consolidación como destino turístico internacional con más de 5 millones de visitantes anuales',
      paises: ['República Dominicana', 'Estados Unidos'],
    },
    {
      id: 'medina-abinader-haiti',
      nombre: 'Medina, Abinader y Relaciones con Haití',
      anioInicio: 2012,
      anioFin: 2020,
      color: '#16A085',
      categoria: 'contemporanea',
      descripcion: 'Danilo Medina, del PLD, gobernó entre 2012 y 2020 en dos mandatos. Su gobierno impulsó programas sociales (Quisqueya Aprende Contigo, comedores económicos) y mantuvo el crecimiento económico, pero fue criticado por corrupción y por la resolución TC-168-13 del Tribunal Constitucional (2013), que retroactivamente negó la ciudadanía a descendientes de haitianos nacidos en el país, afectando potencialmente a más de 200.000 personas y generando una fuerte controversia internacional. Las relaciones con Haití se volvieron un eje central de la política dominicana: la inestabilidad política haitiana (crisis postelectoral, asesinato del presidente Jovenel Moïse en julio de 2021, terremoto de agosto de 2021) generó flujos migratorios que dominaron el debate público.',
      obraIconica: 'Resolución TC-168-13 (2013): el Tribunal Constitucional cuestiona la ciudadanía de descendientes de haitianos',
      paises: ['República Dominicana', 'Haití'],
    },
    {
      id: 'republica-dominicana-contemporanea',
      nombre: 'República Dominicana Contemporánea',
      anioInicio: 2020,
      anioFin: 2025,
      color: '#2E86AB',
      categoria: 'contemporanea',
      descripcion: 'Luis Abinader, del Partido Revolucionario Moderno (PRM), ganó las elecciones de 2020 con mayoría absoluta, poniendo fin a 20 años de hegemonía del PLD. La pandemia de COVID-19 golpeó duramente al sector turístico, aunque la recuperación fue rápida. En 2024, Abinader fue reelecto con más del 57 % de los votos en primera vuelta. Su gobierno intensificó la política de control de la migración haitiana: en septiembre de 2023, se cerró temporalmente la frontera con Haití en respuesta a la construcción del canal sobre el río Masacre por parte haitiana; la medida se mantuvo meses. Las deportaciones masivas de nacionales haitianos y el debate sobre la gestión migratoria dominaron la agenda. La economía dominicana, basada en turismo (más de 10 millones de visitantes anuales), remesas (más de 10.000 millones de dólares anuales) y zonas francas, mantuvo tasas de crecimiento de entre el 4 % y el 5 % anual, entre las más altas de América Latina.',
      obraIconica: 'Reelección de Luis Abinader (2024) y cierre de frontera con Haití: turismo supera los 10 millones de visitantes anuales',
      paises: ['República Dominicana', 'Haití'],
    },
  ],

  eras: [
    {
      nombre: 'Independencia y Caudillismo',
      desde: 1844,
      hasta: 1916,
      icono: '🗡️',
      hitosDestacados: [
        'Independencia y Primeras Décadas',
        'Inestabilidad y Caudillismo',
      ],
      eventos: [
        'Proclamación de independencia de Haití (27 febrero 1844)',
        'Juan Pablo Duarte y La Trinitaria como motor independentista',
        'Anexión voluntaria a España impulsada por Pedro Santana (1861)',
        'Guerra de la Restauración y expulsión definitiva de España (1863-1865)',
        'Gobierno autoritario de Ulises Heureaux "Lilís" (1882-1899)',
        'Crisis de la deuda externa y convención domínico-americana de 1905',
      ],
    },
    {
      nombre: 'Ocupación Estadounidense y Trujillato',
      desde: 1916,
      hasta: 1961,
      icono: '🪖',
      hitosDestacados: [
        'Primera Ocupación Estadounidense',
        'La Era de Trujillo',
      ],
      eventos: [
        'Desembarco de marines estadounidenses y gobierno militar (1916)',
        'Creación de la Guardia Nacional Dominicana por EEUU (1917)',
        'Retirada de los marines y elecciones de 1924',
        'Golpe de Estado de Trujillo y ascenso al poder (1930)',
        'Masacre del Perejil: haitianos asesinados en la frontera (1937)',
        'Asesinato de Trujillo por grupo de conspiradores (30 mayo 1961)',
      ],
    },
    {
      nombre: 'Transición, Intervención y Era Balaguer',
      desde: 1961,
      hasta: 1996,
      icono: '⚖️',
      hitosDestacados: [
        'Transición, Bosch y Segunda Intervención',
        'Era Balaguer y Transición Democrática',
      ],
      eventos: [
        'Exilio de la familia Trujillo y transición democrática (1961-1962)',
        'Juan Bosch: primer gobierno democrático electo (febrero 1963)',
        'Golpe militar contra Bosch (septiembre 1963)',
        'Guerra Civil de Abril y segunda intervención de EEUU (28 abril 1965)',
        'Primer gobierno de Balaguer con respaldo estadounidense (1966)',
        'Primera transferencia pacífica del poder: victoria del PRD (1978)',
        'Regreso de Balaguer al poder (1986)',
        'Pacto por la Democracia tras fraude electoral documentado (1994)',
      ],
    },
    {
      nombre: 'Consolidación Democrática y Crecimiento',
      desde: 1996,
      hasta: 2012,
      icono: '🌱',
      hitosDestacados: [
        'Democracia y Crecimiento Económico',
        'Boom Turístico y Fernández',
      ],
      eventos: [
        'Primer gobierno de Leonel Fernández: modernización económica (1996-2000)',
        'Victoria de Hipólito Mejía y el PRD (2000)',
        'Crisis bancaria de Baninter: mayor escándalo financiero dominicano (2003)',
        'Regreso de Fernández al poder: recuperación económica (2004)',
        'DR-CAFTA: acuerdo de libre comercio con EEUU y Centroamérica (2007)',
        'Tercer mandato de Fernández: Punta Cana como destino turístico global (2008-2012)',
      ],
    },
    {
      nombre: 'Medina y Tensiones con Haití',
      desde: 2012,
      hasta: 2020,
      icono: '🤝',
      hitosDestacados: [
        'Medina, Abinader y Relaciones con Haití',
      ],
      eventos: [
        'Danilo Medina (PLD) gana las elecciones de 2012',
        'Resolución TC-168-13: debate sobre ciudadanía de descendientes haitianos (2013)',
        'Plan Nacional de Regularización de Extranjeros (2014-2015)',
        'Reelección de Medina y continúa el crecimiento turístico (2016)',
        'Asesinato del presidente haitiano Jovenel Moïse (julio 2021)',
        'Terremoto de Haití (agosto 2021) y nuevas oleadas migratorias',
      ],
    },
    {
      nombre: 'República Dominicana Contemporánea',
      desde: 2020,
      hasta: 2025,
      icono: '🌅',
      hitosDestacados: [
        'República Dominicana Contemporánea',
      ],
      eventos: [
        'Luis Abinader (PRM) gana las elecciones de 2020: fin de hegemonía del PLD',
        'Pandemia de COVID-19: caída del turismo y rápida recuperación',
        'Cierre de la frontera con Haití por disputa del canal del río Masacre (2023)',
        'Reelección de Abinader con más del 57 % en primera vuelta (2024)',
        'Turismo supera 10 millones de visitantes anuales',
        'Remesas: más de 10.000 millones de dólares anuales (primer rubro de ingresos)',
      ],
    },
  ],

  categorias: {
    independencia: 'Independencia',
    caudillismo: 'Caudillismo',
    ocupacion: 'Ocupación Extranjera',
    trujillato: 'Trujillato',
    transicion: 'Transición',
    democracia: 'Democracia',
    contemporanea: 'Contemporánea',
  },

  colores: {
    independencia: '#1a7a4a',
    caudillismo: '#8B6914',
    ocupacion: '#4169E1',
    trujillato: '#8B0000',
    transicion: '#FF6B35',
    democracia: '#9B59B6',
    contemporanea: '#2E86AB',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'La República Dominicana comparte la isla de La Española con Haití y tiene una historia marcada por la búsqueda de identidad propia: independencia simultánea de Haití y de la herencia colonial española, décadas de inestabilidad y caudillismo, treinta años de dictadura bajo Trujillo, dos intervenciones militares estadounidenses y una lenta consolidación democrática que arrancó realmente en los años noventa. Hoy el país es la economía más grande del Caribe, con un sector turístico que supera los diez millones de visitantes anuales, pero también enfrenta el reto de gestionar una de las mayores presiones migratorias del hemisferio, procedente de un Haití en crisis estructural.',

    tablaComparativa: [
      { hito: 'Independencia y Primeras Décadas', periodo: '1844-1865', categoria: 'Independencia', personaje: 'Juan Pablo Duarte / Pedro Santana', aportacion: 'Independencia de Haití, Anexión a España y Guerra de la Restauración' },
      { hito: 'Inestabilidad y Caudillismo', periodo: '1865-1916', categoria: 'Caudillismo', personaje: 'Ulises Heureaux "Lilís"', aportacion: 'Crisis de la deuda externa y dependencia económica de EEUU' },
      { hito: 'Primera Ocupación Estadounidense', periodo: '1916-1924', categoria: 'Ocupación Extranjera', personaje: 'General Knapp / Rafael Trujillo (formado)', aportacion: 'Guardia Nacional: base institucional del trujillato' },
      { hito: 'La Era de Trujillo', periodo: '1930-1961', categoria: 'Trujillato', personaje: 'Rafael Leónidas Trujillo', aportacion: 'Dictadura total, Masacre del Perejil, modernización autoritaria' },
      { hito: 'Transición, Bosch y Segunda Intervención', periodo: '1961-1966', categoria: 'Transición', personaje: 'Juan Bosch / Joaquín Balaguer', aportacion: 'Primera democracia dominicana, golpe y segunda intervención de EEUU' },
      { hito: 'Era Balaguer y Transición Democrática', periodo: '1966-1996', categoria: 'Democracia', personaje: 'Joaquín Balaguer / Antonio Guzmán', aportacion: 'Desarrollo con autoritarismo y primera alternancia pacífica (1978)' },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiantes de Historia',
        perfil: 'Secundaria, preparatoria, universidad',
        texto: 'Cronología completa de la historia dominicana desde la independencia hasta la actualidad. Útil para contextualizar las dictaduras latinoamericanas del siglo XX, las intervenciones estadounidenses en el Caribe y los procesos de democratización en América Latina.',
      },
      {
        icono: '🌍',
        titulo: 'Interesados en el Caribe',
        perfil: 'Viajeros, periodistas, investigadores',
        texto: 'La República Dominicana es hoy la primera economía del Caribe y el destino turístico de la región. Entender su historia —Trujillo, las intervenciones de EEUU, la relación con Haití— es clave para comprender la actualidad política y social del país.',
      },
      {
        icono: '🤝',
        titulo: 'Relaciones Internacionales',
        perfil: 'Analistas, diplomáticos, académicos',
        texto: 'La República Dominicana ilustra dinámicas clásicas de la política caribeña: el papel de EEUU en la región, las tensiones entre países que comparten una isla, la gestión de la migración masiva y el equilibrio entre soberanía y dependencia económica.',
      },
      {
        icono: '📊',
        titulo: 'Economía y Desarrollo',
        perfil: 'Economistas, estudiantes de ciencias sociales',
        texto: 'El caso dominicano es un ejemplo estudiado de economía basada en turismo, remesas y zonas francas. La crisis bancaria de 2003 y la recuperación posterior son un caso de libro sobre regulación financiera y gestión de crisis en economías emergentes.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué la República Dominicana se independizó de Haití y no de España?',
        respuesta: 'En 1822, el presidente haitiano Jean-Pierre Boyer unificó toda la isla de La Española bajo control haitiano, poniendo fin al período colonial español. La independencia dominicana de 1844 fue, por tanto, una separación de Haití, no de España. Paradójicamente, en 1861 Pedro Santana solicitó la reincorporación voluntaria a España, único caso histórico en América Latina, aunque duró solo cuatro años antes de que la Guerra de la Restauración expulsara de nuevo a los españoles.',
        tip: 'La fecha nacional dominicana (27 de febrero) celebra la independencia de Haití, no de España.',
      },
      {
        pregunta: '¿Qué fue la Masacre del Perejil y por qué se llama así?',
        respuesta: 'En octubre de 1937, fuerzas bajo órdenes de Trujillo masacraron a haitianos en la zona fronteriza. El nombre "Perejil" proviene de que —según algunos relatos históricos— los soldados dominicanos pedían a los sospechosos que pronunciaran la palabra "perejil" (cuya "r" fuerte los haitianos de habla criolla pronunciaban de forma diferente) para identificar a los haitianos. Estimaciones históricas sitúan las víctimas entre 5.000 y 20.000, con una cifra central de aproximadamente 12.000.',
        tip: 'Trujillo pagó una indemnización de 750.000 dólares al gobierno haitiano para cerrar el incidente diplomáticamente.',
      },
      {
        pregunta: '¿Por qué EEUU intervino militarmente en la República Dominicana dos veces?',
        respuesta: 'La primera intervención (1916-1924) respondió a la inestabilidad política y la incapacidad de pagar la deuda externa, enmarcada en la Doctrina Monroe y la política de EEUU de evitar intervenciones europeas en el Caribe. La segunda (1965) se produjo durante la Guerra Fría: el presidente Johnson argumentó que existía riesgo de que la Revolución de Abril generara "una segunda Cuba" comunista en el Caribe, aunque los documentos desclasificados posteriores muestran que la amenaza real era mucho menor que la argumentada.',
        tip: 'La segunda intervención contó con 28.000 soldados, más de los que EEUU tenía entonces en Vietnam.',
      },
      {
        pregunta: '¿En qué se basa la economía dominicana hoy?',
        respuesta: 'La economía dominicana se sostiene sobre tres pilares: el turismo (más de 10 millones de visitantes anuales, concentrado en Punta Cana, La Romana y Santo Domingo), las remesas de la diáspora dominicana (más de 10.000 millones de dólares anuales, el primer rubro de divisas del país) y las zonas francas industriales (textil, tabaco, electrónica). Esta combinación ha permitido tasas de crecimiento entre el 4 % y el 6 % anual, entre las más altas de América Latina.',
        tip: 'La República Dominicana es el mayor receptor de turistas de todo el Caribe, superando a Cuba, Jamaica y Puerto Rico.',
      },
      {
        pregunta: '¿Por qué las relaciones con Haití son tan complejas?',
        respuesta: 'España y Francia dividieron la isla de La Española en el siglo XVIII entre sus colonias, creando dos países con historias, idiomas y culturas radicalmente diferentes. La Masacre del Perejil de 1937 dejó una herida histórica profunda. En la actualidad, la crisis política, económica y de seguridad de Haití genera flujos migratorios masivos hacia la República Dominicana, generando tensiones sobre empleo, servicios públicos y ciudadanía. La construcción del canal haitiano sobre el río Masacre en 2023 desencadenó el cierre temporal de la frontera.',
        tip: 'Haití y la República Dominicana son los dos únicos países del mundo que comparten una isla como territorios nacionales soberanos.',
      },
    ],

    pasos: [
      {
        titulo: 'Observa el peso del trujillato en la línea del tiempo',
        cuerpo: 'El bloque rojo oscuro de La Era de Trujillo abarca 31 años (1930-1961), más de un cuarto de toda la historia del país. Antes de leer nada, fíjate visualmente en su proporción respecto al resto: es la clave para entender por qué la República Dominicana tardó décadas en consolidar una democracia funcional.',
      },
      {
        titulo: 'Compara las dos intervenciones de EEUU',
        cuerpo: 'Haz clic en "Primera Ocupación Estadounidense" y luego en "Transición, Bosch y Segunda Intervención". Observa el contexto diferente: la primera responde a la inestabilidad y la deuda (marco Monroe), la segunda a la Guerra Fría. Ambas cambiaron el curso político dominicano de formas distintas.',
      },
      {
        titulo: 'Sigue el hilo de las relaciones con Haití',
        cuerpo: 'La Masacre del Perejil (1937), la Resolución TC-168-13 (2013) y el cierre de la frontera (2023) son puntos de la misma tensión histórica. Busca en la Comparativa los hitos en los que aparece Haití como país y traza la evolución de las relaciones entre ambos vecinos.',
      },
      {
        titulo: 'Usa el filtro de democracia en la Comparativa',
        cuerpo: 'Filtra la tabla por categoría "Democracia". Verás que los primeros hitos de este tipo no aparecen hasta los años sesenta, y que el proceso de consolidación democrática real se prolonga hasta los noventa. Compara con otros países de América Latina para contextualizar el ritmo dominicano.',
      },
      {
        titulo: 'Termina con el Contexto Histórico para el cuadro completo',
        cuerpo: 'Las 6 eras muestran cómo la República Dominicana pasó de la inestabilidad permanente del siglo XIX a la dictadura del XX y a la democracia del XXI. La era "Medina y Tensiones con Haití" (2012-2020) es especialmente densa: concentra la mayor controversia jurídica de la democracia dominicana junto a la crisis humanitaria haitiana.',
      },
    ],

    tips: [
      {
        icono: '🗓️',
        texto: 'El 27 de febrero es el Día de la Independencia dominicana, pero no conmemora la independencia de España, sino de Haití. Es una fecha única en América Latina: ningún otro país tiene como hito fundacional la separación de un vecino que lo había absorbido, y no de una metrópoli colonial.',
      },
      {
        icono: '🌴',
        texto: 'Punta Cana era una aldea de pescadores con un pequeño aeropuerto privado en los años ochenta. Hoy tiene el aeropuerto con más tráfico internacional de todo el Caribe. El boom turístico dominicano, concentrado en las costas del este, es uno de los mayores procesos de desarrollo turístico del hemisferio occidental en el siglo XX.',
      },
      {
        icono: '💸',
        texto: 'Las remesas de dominicanos en el exterior (principalmente en EEUU, especialmente en Nueva York) superan los 10.000 millones de dólares anuales. Eso equivale a más del 8 % del PIB dominicano. La comunidad dominicana en Nueva York es la cuarta más numerosa de América Latina en esa ciudad, después de puertorriqueños, mexicanos y ecuatorianos.',
      },
      {
        icono: '🏝️',
        texto: 'La isla de La Española fue el primer asentamiento europeo permanente en América: la ciudad de La Navidad (1492) y luego la propia Santo Domingo (1496) son las fundaciones europeas más antiguas del continente. La catedral de Santa María la Menor en Santo Domingo (1540) es la más antigua de América. Este pasado colonial convive hoy con el país turístico y migratorio del siglo XXI.',
      },
    ],

    errores: [
      {
        titulo: 'Confundir "independencia" con "independencia de España"',
        cuerpo: 'La independencia dominicana de 1844 fue de Haití, no de España. El período colonial español terminó en 1821 con la efímera "Independencia Efímera" y luego con la anexión haitiana de 1822. Cuando los dominicanos proclamaron su independencia el 27 de febrero de 1844, se separaban de 22 años de dominio haitiano, no de siglos de colonia española.',
      },
      {
        titulo: 'Creer que la democracia dominicana llegó con la muerte de Trujillo',
        cuerpo: 'El asesinato de Trujillo en 1961 abrió un período de transición, pero no instauró la democracia. El primer gobierno elegido libremente (Juan Bosch, 1963) duró solo siete meses antes del golpe militar. La primera transferencia pacífica del poder a la oposición no ocurrió hasta 1978, y la consolidación democrática real no llegó hasta los años noventa, con la reforma constitucional de 1994.',
      },
      {
        titulo: 'Subestimar el impacto institucional de la ocupación de 1916-1924',
        cuerpo: 'La primera ocupación estadounidense no fue solo una intromisión temporal: la Guardia Nacional creada por los marines fue la institución que permitió el ascenso de Trujillo. Sin la ocupación, Trujillo no habría tenido la plataforma institucional para dar su golpe de 1930. La lógica de intervenir para estabilizar y luego abandonar sin resolver las causas estructurales de la inestabilidad es una constante en la historia de las intervenciones estadounidenses en el Caribe.',
      },
      {
        titulo: 'Ver la crisis haitiana solo como un problema dominicano',
        cuerpo: 'El colapso del Estado haitiano —asesinato de su presidente (2021), terremotos, pandillas que controlan el 80 % de Puerto Príncipe (2024)— es una crisis de gobernanza regional con causas históricas complejas (deuda de independencia a Francia, ocupación estadounidense 1915-1934, dictadura de los Duvalier). La presión migratoria sobre la República Dominicana es la consecuencia visible de un problema estructural que trasciende las políticas de cualquiera de los dos gobiernos.',
      },
    ],
  },
};
