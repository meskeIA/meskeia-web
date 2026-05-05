import type { HistoriaData } from './types';

export const historiaDerecho: HistoriaData = {
  slug: 'historia-derecho',
  titulo: 'Historia del Derecho: De Hammurabi al Derecho Digital',
  subtitulo: 'Cuatro mil años de normas, códigos y justicia que ordenaron la convivencia humana',
  descripcionSEO: 'Cronología interactiva de la historia del derecho: del Código de Hammurabi (1754 a.C.) al RGPD y el derecho digital. Derecho romano, Corpus Iuris Civilis, Código Napoleónico, Nuremberg y la integración jurídica europea en 10 hitos y 6 eras.',
  keywords: [
    'historia del derecho cronología',
    'código de hammurabi derecho antiguo babilonia',
    'derecho romano corpus iuris civilis justiniano',
    'código napoleónico codificaciones derecho civil',
    'juicios nuremberg derechos humanos internacionales',
    'RGPD derecho digital protección datos internet',
  ],
  anioInicio: -1754,
  anioFin: 2020,

  hitos: [
    {
      id: 'hammurabi-antiguo',
      nombre: 'Código de Hammurabi y el Derecho Antiguo',
      anioInicio: -1754,
      anioFin: -500,
      color: '#8B4513',
      categoria: 'antiguo',
      descripcion: 'El rey Hammurabi de Babilonia codifica 282 leyes (~1754 a.C.): la más antigua compilación legal conservada. Principio del "ojo por ojo" (lex talionis) como sistema de proporcionalidad. El Código de Ur-Nammu (~2100 a.C.) es aún anterior. El derecho hebreo (Torá, ~1000 a.C.) y el derecho persa (Ciro, ~539 a.C.) muestran la universalidad del impulso regulador en las primeras civilizaciones. El derecho como base del orden social surge simultáneamente en Mesopotamia, Egipto, India y China.',
      obraIconica: 'Código de Hammurabi (~1754 a.C.): primera gran codificación legal de la historia conservada',
      paises: ['Mesopotamia', 'Babilonia', 'Próximo Oriente Antiguo'],
    },
    {
      id: 'derecho-romano-clasico',
      nombre: 'Derecho Romano Clásico',
      anioInicio: -450,
      anioFin: 235,
      color: '#1E90FF',
      categoria: 'romano',
      descripcion: 'Las XII Tablas (450 a.C.) son el primer código escrito romano: derechos procesales, propiedad, familia, herencia. El ius civile (para ciudadanos) y el ius gentium (para extranjeros) muestran la universalización progresiva del derecho. Los grandes juristas clásicos —Gayo, Ulpiano, Papiniano, Paulo— elaboran doctrinas que siguen vigentes: buena fe, equidad, dolo, culpa, responsabilidad. El derecho romano es el mayor legado jurídico de la Antigüedad.',
      obraIconica: 'Las XII Tablas (450 a.C.) y la jurisprudencia de Ulpiano (siglo II d.C.): base del derecho civil moderno',
      paises: ['Roma', 'Imperio Romano', 'Mediterráneo'],
    },
    {
      id: 'corpus-iuris',
      nombre: 'Corpus Iuris Civilis de Justiniano',
      anioInicio: 529,
      anioFin: 534,
      color: '#1E90FF',
      categoria: 'romano',
      descripcion: 'El emperador Justiniano ordena compilar todo el derecho romano en cuatro partes: el Código (leyes imperiales), el Digesto (jurisprudencia clásica), las Instituciones (manual universitario) y las Novelas (nuevas constituciones). Terminado en apenas 5 años (529-534), es la compilación jurídica más influyente de la historia: base del derecho civil en Europa continental, América Latina, Quebec y Luisiana. Preservó el 90% del derecho romano que de otro modo se habría perdido.',
      obraIconica: 'Corpus Iuris Civilis (529-534 d.C.): la compilación jurídica más influyente de la historia occidental',
      paises: ['Imperio Bizantino', 'Constantinopla', 'Mediterráneo Oriental'],
    },
    {
      id: 'derecho-canonico',
      nombre: 'Derecho Canónico y Universidades Medievales',
      anioInicio: 1140,
      anioFin: 1300,
      color: '#8B0000',
      categoria: 'medieval',
      descripcion: 'Graciano compila el Decretum (1140), primera sistematización del derecho canónico, en Bolonia. La Universidad de Bolonia (1088) es la primera del mundo, fundada para enseñar derecho. Los glosadores (Irnerio) y comentaristas (Bartolo de Saxoferrato) redescubren el Corpus Iuris y lo adaptan a la Europa medieval. El derecho canónico y el derecho romano rivalizan y se influyen mutuamente. Las primeras Facultades de Derecho crean la profesión jurídica como la conocemos.',
      obraIconica: 'Decreto de Graciano (1140) y Universidad de Bolonia (1088): origen de la educación jurídica europea',
      paises: ['Italia', 'Europa Medieval', 'Iglesia Católica'],
    },
    {
      id: 'derecho-natural',
      nombre: 'Derecho Natural y Humanismo Jurídico',
      anioInicio: 1500,
      anioFin: 1689,
      color: '#2E8B57',
      categoria: 'moderno',
      descripcion: 'Francisco de Vitoria (Salamanca) y la Escuela de Salamanca desarrollan el derecho de gentes y los primeros principios del derecho internacional tras la conquista de América. Hugo Grocio (De Iure Belli ac Pacis, 1625) funda el derecho internacional moderno, separado de la teología. Samuel Pufendorf y John Locke desarrollan el iusnaturalismo laico. La idea de derechos naturales inalienables —previos al Estado— prepara el terreno para las Declaraciones del siglo XVIII.',
      obraIconica: 'De Iure Belli ac Pacis de Hugo Grocio (1625): fundamento del derecho internacional moderno',
      paises: ['España', 'Holanda', 'Europa Occidental'],
    },
    {
      id: 'codigo-napoleon',
      nombre: 'Código Napoleónico y Codificaciones Nacionales',
      anioInicio: 1804,
      anioFin: 1900,
      color: '#0000CD',
      categoria: 'codificaciones',
      descripcion: 'El Código Civil francés (1804) —el Código Napoleón— unifica el derecho privado en Francia bajo principios ilustrados: igualdad civil, propiedad privada, libertad contractual. Es el modelo para más de 40 códigos civiles en Europa, América Latina y África del Norte. El BGB alemán (1900) y el Código Civil español (1889) completan las grandes codificaciones continentales. La codificación reemplaza el caos del derecho consuetudinario por sistemas racionales y accesibles.',
      obraIconica: 'Código Civil Napoleónico (1804): modelo de más de 40 códigos civiles en todo el mundo',
      paises: ['Francia', 'Europa Continental', 'América Latina'],
    },
    {
      id: 'derecho-laboral',
      nombre: 'Derecho Laboral e Industrialización',
      anioInicio: 1832,
      anioFin: 1919,
      color: '#DC143C',
      categoria: 'social',
      descripcion: 'La Revolución Industrial crea condiciones de trabajo brutales que provocan la reacción legal: Factory Acts inglesas (1832-1844) limitan el trabajo infantil y la jornada. Los movimientos obreros conquistan la jornada de 8 horas (Haymarket, 1886). La Constitución de Weimar (1919) constitucionaliza por primera vez los derechos laborales. La Organización Internacional del Trabajo (OIT, 1919) establece estándares internacionales. El derecho laboral transforma el trabajo de mercancía en relación jurídica protegida.',
      obraIconica: 'Constitución de Weimar (1919) y OIT (1919): constitucionalización de los derechos laborales',
      paises: ['Reino Unido', 'Alemania', 'Estados Unidos', 'Europa Industrial'],
    },
    {
      id: 'nuremberg-ddhh',
      nombre: 'Nuremberg y Derechos Humanos Internacionales',
      anioInicio: 1945,
      anioFin: 1998,
      color: '#4B0082',
      categoria: 'internacional',
      descripcion: 'Los Juicios de Núremberg (1945-46) crean el primer tribunal penal internacional y los crímenes contra la humanidad como categoría jurídica. La Declaración Universal de DDHH (1948), el Convenio Europeo (1950), los Pactos de la ONU (1966) y la Convención contra la Tortura (1984) construyen el derecho internacional de los derechos humanos. El Estatuto de Roma (1998) crea la Corte Penal Internacional: responsabilidad penal individual en el ámbito internacional.',
      obraIconica: 'Juicios de Núremberg (1945-46) y Estatuto de Roma (1998): justicia penal internacional',
      paises: ['Alemania', 'ONU', 'Europa', 'Global'],
    },
    {
      id: 'integracion-europea',
      nombre: 'Integración Jurídica Europea',
      anioInicio: 1957,
      anioFin: 2007,
      color: '#4B0082',
      categoria: 'internacional',
      descripcion: 'El Tratado de Roma (1957) crea la CEE y un nuevo orden jurídico supranacional. La sentencia Van Gend en Loos del TJUE (1963) establece la primacía y el efecto directo del derecho comunitario sobre los ordenamientos nacionales. El Tribunal Europeo de Derechos Humanos garantiza los derechos fundamentales en 47 países. El Tratado de Lisboa (2007) y la Carta de Derechos Fundamentales de la UE consolidan el mayor experimento de integración jurídica transnacional de la historia.',
      obraIconica: 'Sentencia Van Gend en Loos del TJUE (1963): primacía del derecho europeo sobre el nacional',
      paises: ['Unión Europea', 'Europa', 'Consejo de Europa'],
    },
    {
      id: 'derecho-digital',
      nombre: 'Derecho Digital y Globalización Jurídica',
      anioInicio: 1995,
      anioFin: 2020,
      color: '#696969',
      categoria: 'digital',
      descripcion: 'Internet crea un espacio jurídico sin precedentes que desafía la soberanía estatal. El RGPD europeo (2016-2018) es el primer marco legal global de protección de datos, con efecto extraterritorial: cualquier empresa que trate datos de europeos debe cumplirlo. El Convenio de Budapest (2001) sobre cibercrimen y los debates sobre regulación de la IA, propiedad intelectual digital y plataformas definen la frontera del derecho del siglo XXI. La globalización crea un derecho transnacional emergente sin Estado que lo respalde.',
      obraIconica: 'RGPD europeo (2016-2018): primer marco legal global de protección de datos personales',
      paises: ['Unión Europea', 'Global', 'Internet'],
    },
  ],

  eras: [
    {
      nombre: 'Derecho Antiguo',
      desde: -1754,
      hasta: 476,
      icono: '⚖️',
      hitosDestacados: [
        'Código de Hammurabi y el Derecho Antiguo',
        'Derecho Romano Clásico',
      ],
      eventos: [
        'Código de Ur-Nammu (~2100 a.C.): primera codificación legal conocida de la historia',
        'Código de Hammurabi (1754 a.C.): 282 leyes grabadas en una estela de diorita',
        'Las XII Tablas (450 a.C.): primer código de derecho escrito romano expuesto en el Foro',
        'El ius gentium romano: derecho aplicable a extranjeros, germen del derecho internacional',
        'Juristas clásicos —Ulpiano, Papiniano, Gayo— sistematizan el derecho romano (ss. I-III d.C.)',
      ],
    },
    {
      nombre: 'Derecho Tardoantiguo y Compilaciones',
      desde: 476,
      hasta: 1100,
      icono: '📖',
      hitosDestacados: [
        'Corpus Iuris Civilis de Justiniano',
      ],
      eventos: [
        'El Breviario de Alarico (506): compendio visigodo que transmitió el derecho romano a Occidente',
        'Corpus Iuris Civilis de Justiniano (529-534): cuatro volúmenes que preservan el derecho romano',
        'El Digesto: compilación de jurisprudencia clásica, 9.123 fragmentos de 38 juristas',
        'Las Novelas: nuevas constituciones imperiales en griego, lengua franca del Imperio oriental',
      ],
    },
    {
      nombre: 'Derecho Medieval y Canónico',
      desde: 1100,
      hasta: 1500,
      icono: '⛪',
      hitosDestacados: [
        'Derecho Canónico y Universidades Medievales',
      ],
      eventos: [
        'Universidad de Bolonia (1088): primera universidad del mundo, fundada para enseñar derecho',
        'Irnerio redescubre el Digesto de Justiniano y funda la escuela de los glosadores (1100)',
        'Decreto de Graciano (1140): primera sistematización del derecho canónico en Bolonia',
        'Magna Carta (1215): el rey de Inglaterra limita su poder ante los barones: germen del constitucionalismo',
      ],
    },
    {
      nombre: 'Derecho Natural e Ilustrado',
      desde: 1500,
      hasta: 1804,
      icono: '📜',
      hitosDestacados: [
        'Derecho Natural y Humanismo Jurídico',
      ],
      eventos: [
        'Escuela de Salamanca: Francisco de Vitoria define los derechos de los pueblos indígenas (1539)',
        'Hugo Grocio publica De Iure Belli ac Pacis (1625): fundamento del derecho internacional moderno',
        'Habeas Corpus Act inglesa (1679): protección contra detenciones arbitrarias',
        'Montesquieu publica El espíritu de las leyes (1748): separación de poderes como principio constitucional',
        'Declaración de Independencia de EE.UU. (1776) y Declaración de Derechos del Hombre (1789): iusnaturalismo en acción',
      ],
    },
    {
      nombre: 'Codificaciones y Derecho Social',
      desde: 1804,
      hasta: 1945,
      icono: '🏭',
      hitosDestacados: [
        'Código Napoleónico y Codificaciones Nacionales',
        'Derecho Laboral e Industrialización',
      ],
      eventos: [
        'Código Civil Napoleónico (1804): igualdad ante la ley, propiedad privada, libertad contractual',
        'Código Civil español (1889) y BGB alemán (1900): grandes codificaciones continentales',
        'Factory Acts británicas (1832-1844): primeras leyes que limitan el trabajo infantil en fábricas',
        'Constitución de Weimar (1919): primera constitución que garantiza derechos sociales y laborales',
        'Fundación de la OIT (1919): primer organismo internacional de regulación del trabajo',
      ],
    },
    {
      nombre: 'Derecho Internacional y Digital',
      desde: 1945,
      hasta: 2020,
      icono: '🌐',
      hitosDestacados: [
        'Nuremberg y Derechos Humanos Internacionales',
        'Integración Jurídica Europea',
        'Derecho Digital y Globalización Jurídica',
      ],
      eventos: [
        'Juicios de Núremberg (1945-46): primera vez que individuos son juzgados por crímenes contra la humanidad',
        'Declaración Universal de Derechos Humanos (1948): universalización de los derechos fundamentales',
        'Sentencia Van Gend en Loos del TJUE (1963): primacía del derecho europeo sobre el nacional',
        'Estatuto de Roma (1998): crea la Corte Penal Internacional permanente',
        'RGPD europeo (2018): primer marco legal global con efecto extraterritorial en protección de datos',
      ],
    },
  ],

  categorias: {
    antiguo: 'Derecho Antiguo',
    romano: 'Derecho Romano',
    medieval: 'Derecho Medieval',
    moderno: 'Derecho Moderno',
    codificaciones: 'Era de las Codificaciones',
    social: 'Derecho Social',
    internacional: 'Derecho Internacional',
    digital: 'Derecho Digital',
  },

  colores: {
    antiguo: '#8B4513',
    romano: '#1E90FF',
    medieval: '#8B0000',
    moderno: '#2E8B57',
    codificaciones: '#0000CD',
    social: '#DC143C',
    internacional: '#4B0082',
    digital: '#696969',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'El derecho no es solo normas escritas: es el relato de cómo las sociedades han organizado la convivencia, resuelto conflictos y protegido a sus miembros durante cuatro mil años. Desde las 282 leyes de Hammurabi hasta el RGPD europeo, cada gran código jurídico refleja los valores y tensiones de su época. El derecho romano sigue siendo la columna vertebral del derecho civil de más de 50 países. Comprender su historia es entender el fundamento de los derechos y obligaciones que nos rigen hoy.',

    tablaComparativa: [
      {
        hito: 'Código de Hammurabi',
        periodo: '1754 a.C.',
        categoria: 'Derecho Antiguo',
        personaje: 'Rey Hammurabi de Babilonia',
        aportacion: 'Primer gran código legal conservado: 282 leyes con principio de proporcionalidad (lex talionis)',
      },
      {
        hito: 'Las XII Tablas',
        periodo: '450 a.C.',
        categoria: 'Derecho Romano',
        personaje: 'Decenviros romanos',
        aportacion: 'Primer código escrito romano: igualdad ante la ley, procedimiento judicial público y accesible',
      },
      {
        hito: 'Corpus Iuris Civilis',
        periodo: '529-534 d.C.',
        categoria: 'Derecho Romano',
        personaje: 'Emperador Justiniano / Triboniano',
        aportacion: 'Compilación completa del derecho romano: base del derecho civil continental hasta hoy',
      },
      {
        hito: 'Código Napoleónico',
        periodo: '1804',
        categoria: 'Era de las Codificaciones',
        personaje: 'Napoleón Bonaparte / Portalis',
        aportacion: 'Igualdad civil, propiedad privada y libertad contractual: modelo para más de 40 códigos civiles',
      },
      {
        hito: 'Juicios de Núremberg',
        periodo: '1945-1946',
        categoria: 'Derecho Internacional',
        personaje: 'Tribunal Militar Internacional',
        aportacion: 'Primer tribunal penal internacional: crea la categoría de crímenes contra la humanidad',
      },
      {
        hito: 'RGPD europeo',
        periodo: '2016-2018',
        categoria: 'Derecho Digital',
        personaje: 'Parlamento Europeo / Comisión',
        aportacion: 'Primer marco legal global de protección de datos con efecto extraterritorial universal',
      },
    ],

    escenarios: [
      {
        icono: '🎓',
        titulo: 'Estudiante de Derecho',
        perfil: 'Facultades de Derecho, primeros cursos',
        texto: 'Esta cronología es el mapa conceptual que conecta el Derecho Romano del primer año con el Derecho Internacional del último. Ver cómo las XII Tablas se convierten en el Corpus Iuris y este en el Código Civil español ayuda a entender por qué estudiamos Derecho Romano antes que cualquier otra asignatura.',
      },
      {
        icono: '⚖️',
        titulo: 'Abogado en ejercicio',
        perfil: 'Práctica jurídica diaria',
        texto: 'Los conceptos que usas cada día —buena fe, culpa, enriquecimiento injusto, dolo— tienen 2.000 años. Esta cronología sitúa históricamente las instituciones jurídicas que aplicas: cuándo surgieron, por qué y cómo llegaron al derecho español actual a través del Código Civil de 1889.',
      },
      {
        icono: '🏛️',
        titulo: 'Ciudadano curioso',
        perfil: 'Interés general por la historia y los derechos',
        texto: '¿Por qué tienes derechos laborales? ¿Por qué no te pueden detener indefinidamente? ¿Por qué la empresa que usa tus datos debe pedirte permiso? Esta cronología explica cómo cada uno de esos derechos fue conquistado jurídicamente, a veces con siglos de lucha, y cuándo entró en vigor.',
      },
      {
        icono: '🌍',
        titulo: 'Empresario internacional',
        perfil: 'Negocios con presencia en múltiples jurisdicciones',
        texto: 'El RGPD afecta a cualquier empresa que trate datos de ciudadanos europeos, independientemente de dónde esté ubicada. Esta cronología muestra cómo el derecho ha evolucionado de local a global: entender su lógica histórica ayuda a anticipar hacia dónde se dirigirá la regulación digital en los próximos años.',
      },
    ],

    faq: [
      {
        pregunta: '¿Por qué se dice que el derecho romano es la base del derecho actual?',
        respuesta: 'Porque el Corpus Iuris Civilis de Justiniano (529-534) preservó 1.000 años de jurisprudencia romana que fue redescubierta en Bolonia en el siglo XII y adaptada a toda Europa continental. Conceptos como contrato, propiedad, herencia, responsabilidad civil, buena fe o dolo provienen directamente del derecho romano. El Código Civil español de 1889 es, en esencia, una adaptación del Código Napoleónico que a su vez sistematizó el derecho romano.',
        tip: 'El artículo 1.902 del Código Civil español ("El que por acción u omisión causa daño a otro...") es casi una traducción de la fórmula romana de Ulpiano del siglo II d.C.',
      },
      {
        pregunta: '¿Qué es el common law y en qué se diferencia del derecho civil continental?',
        respuesta: 'El common law (derecho anglosajón) se basa en la jurisprudencia: los jueces crean derecho al resolver casos y sus decisiones vinculan a los tribunales futuros (precedente obligatorio o stare decisis). El derecho civil continental (Europa, América Latina) se basa en códigos escritos: el juez aplica la ley, no crea derecho. Reino Unido, EE.UU., Canadá y Australia siguen el common law. España, Francia, Italia y toda América Latina siguen el derecho civil de origen romano.',
        tip: 'El derecho de la UE mezcla ambas tradiciones: tiene tratados escritos (civil law) pero el TJUE crea jurisprudencia vinculante (common law influence).',
      },
      {
        pregunta: '¿Cuándo surgió la idea de derechos humanos universales?',
        respuesta: 'La idea filosófica surge con el iusnaturalismo del siglo XVII (Locke, Pufendorf): existen derechos previos al Estado. Las primeras declaraciones jurídicas son la Declaración de Independencia de EE.UU. (1776) y la Declaración de Derechos del Hombre (1789). Pero la universalización legal ocurre después de la II Guerra Mundial: la Declaración Universal (1948) y los Pactos de la ONU (1966). Los crímenes nazis demostraron que sin protección jurídica internacional, los derechos son papel mojado.',
        tip: 'La Declaración Universal no es un tratado vinculante: es una declaración de principios. Los Pactos de 1966 sí son tratados con obligación legal para los Estados firmantes.',
      },
      {
        pregunta: '¿Qué significó el Código de Hammurabi para su época?',
        respuesta: 'Fue una revolución: por primera vez, las normas no eran secretas ni arbitrarias sino públicas y escritas. La estela se exponía para que todos pudieran leerla (o que un escriba se la leyera). El principio del "ojo por ojo" no era crueldad sino proporcionalidad: antes, el poderoso podía imponer castigos desproporcionados. Hammurabi también reguló salarios, alquileres, préstamos y contratos: el derecho mercantil nació en Babilonia hace 3.800 años.',
        tip: 'El Código diferencia castigos según la clase social: la pena por herir a un aristócrata era mayor que por herir a un esclavo. La igualdad ante la ley llegó mucho después.',
      },
      {
        pregunta: '¿Qué es el RGPD y por qué es importante para todo el mundo?',
        respuesta: 'El Reglamento General de Protección de Datos (RGPD) europeo, en vigor desde 2018, es el primer marco legal con efecto extraterritorial real en la historia del derecho: cualquier empresa del mundo que trate datos de ciudadanos europeos debe cumplirlo, bajo pena de multas de hasta el 4% de su facturación global. Ha forzado a Google, Facebook, Amazon y miles de empresas no europeas a cambiar sus prácticas. Es el primer caso en que la UE ha exportado su estándar jurídico al resto del mundo de forma efectiva.',
        tip: 'El modelo del RGPD ha sido replicado o inspirado en leyes de más de 100 países: Brasil (LGPD), California (CCPA), Japón, Corea del Sur. Europa exportó su derecho al mundo sin disparar un tiro.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la escala: 3.800 años en una línea',
        cuerpo: 'Antes de leer nada, observa la línea del tiempo completa. El período más largo es el del Derecho Antiguo (1754 a.C. - 500 a.C.): más de 1.200 años. El más corto es el Corpus Iuris Civilis (solo 5 años). La velocidad del cambio jurídico se acelera enormemente a partir del siglo XIX. ¿Ves ese patrón en la distribución visual de los bloques?',
      },
      {
        titulo: 'Compara el derecho romano en dos momentos',
        cuerpo: 'Haz clic en "Derecho Romano Clásico" (450 a.C. - 235 d.C.) y luego en "Corpus Iuris Civilis de Justiniano" (529-534). Son el mismo sistema jurídico separado por tres siglos. Justiniano compiló lo que los juristas clásicos habían creado. Esta continuidad es única en la historia: ningún otro sistema legal ha sido codificado siglos después de su creación y ha seguido vigente hasta hoy.',
      },
      {
        titulo: 'Sigue el hilo de los derechos laborales',
        cuerpo: 'El hito "Derecho Laboral e Industrialización" (1832-1919) es la respuesta jurídica a la Revolución Industrial. Compáralo con "Nuremberg y Derechos Humanos" (1945-1998). Ambos son derechos conquistados por presión social y tragedia: sin las condiciones brutales de las fábricas no habría OIT; sin el Holocausto no habría Declaración Universal. El derecho suele ir detrás de la realidad.',
      },
      {
        titulo: 'Usa la Comparativa para ver el impacto de cada código',
        cuerpo: 'En la tabla Comparativa, filtra por "Derecho Romano" para ver los dos momentos clave del sistema legal que hoy usas. Luego filtra por "Derecho Internacional" para ver cómo el siglo XX construyó un orden jurídico global de la nada. El contraste entre la codificación romana (local) y los tratados internacionales (global) es la gran transformación jurídica del último siglo.',
      },
      {
        titulo: 'Termina con el Contexto Histórico para ver las eras completas',
        cuerpo: 'Las 6 eras muestran cómo cada período jurídico respondió a su contexto histórico: el derecho antiguo al surgimiento del Estado, el derecho medieval a la Iglesia, el derecho natural a la conquista de América, las codificaciones a la Revolución Francesa, el derecho social a la industrialización y el derecho digital a Internet. El derecho siempre llega después de la realidad que debe regular.',
      },
    ],

    tips: [
      {
        icono: '📜',
        texto: 'El Código de Hammurabi original está en el Museo del Louvre en París. Mide 2,25 metros de altura, está grabado en diorita negra y se conserva casi intacto desde el siglo XVIII a.C. En la parte superior, una imagen muestra a Hammurabi recibiendo las leyes del dios Shamash: el derecho como mandato divino.',
      },
      {
        icono: '🏛️',
        texto: 'El Corpus Iuris Civilis se redactó en 3 años: la comisión de Triboniano completó el Digesto (el libro más complejo, con 9.123 fragmentos) en solo 3 años. Justiniano lo consideró un milagro. Sin esa compilación, el 90% del derecho romano clásico se habría perdido para siempre en el caos de la caída del Imperio Occidental.',
      },
      {
        icono: '⚖️',
        texto: 'El Código Civil Napoleónico (1804) fue redactado en solo 4 meses de trabajo intensivo. Napoleón presidió personalmente varias sesiones de debate. Se ha traducido a más idiomas que cualquier otro texto legal de la historia y sigue vigente en Francia —con modificaciones— más de 200 años después de su promulgación.',
      },
      {
        icono: '🌍',
        texto: 'El RGPD europeo ha generado más de 4.000 millones de euros en multas desde 2018, con casos contra Google (150M€), Meta (1.200M€) e Instagram (405M€). Una regulación nacida en Bruselas se ha convertido en el estándar global de facto para la protección de datos, sin que ningún tratado internacional la impusiera.',
      },
    ],

    errores: [
      {
        titulo: 'Creer que el "ojo por ojo" de Hammurabi era solo crueldad',
        cuerpo: 'La lex talionis (ojo por ojo) era en realidad un principio de proporcionalidad: el castigo no podía superar al daño causado. Antes, el poderoso podía imponer penas arbitrarias e ilimitadas. Hammurabi introdujo la proporcionalidad como límite al poder punitivo. El talión fue un avance jurídico, no una barbaridad: garantizaba que la víctima no podría exigir más de lo que sufrió.',
      },
      {
        titulo: 'Pensar que el derecho romano desapareció con Roma',
        cuerpo: 'El derecho romano sobrevivió la caída del Imperio Occidental (476 d.C.) de dos formas: en Oriente, el Corpus Iuris de Justiniano (529-534) lo codificó; en Occidente, el Breviario de Alarico (506) lo transmitió. Su redescubrimiento en Bolonia en el siglo XII inició la tradición jurídica universitaria. El Código Civil español de 1889 es, en gran parte, derecho romano adaptado.',
      },
      {
        titulo: 'Confundir la Declaración Universal de DDHH con un tratado vinculante',
        cuerpo: 'La Declaración Universal de Derechos Humanos (1948) es una resolución de la Asamblea General de la ONU: no tiene fuerza vinculante directa. Los tratados que sí obligan jurídicamente a los Estados son los Pactos Internacionales de 1966 (Derechos Civiles y Políticos + Derechos Económicos, Sociales y Culturales). Muchos países han ratificado la Declaración pero no los Pactos, lo que tiene consecuencias jurídicas prácticas.',
      },
      {
        titulo: 'Asumir que el common law y el derecho civil son sistemas incompatibles',
        cuerpo: 'Ambos sistemas se han influido mutuamente durante siglos. El derecho de equidad inglés (equity) adoptó principios romanos. El derecho administrativo continental ha incorporado la revisión judicial de estilo anglosajón. La UE mezcla ambas tradiciones. Hoy, la globalización jurídica está produciendo una convergencia progresiva: los abogados de ambos sistemas trabajan juntos en arbitrajes internacionales usando principios compartidos.',
      },
    ],
  },
};
