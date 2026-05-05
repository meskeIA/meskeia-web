import type { HistoriaData } from './types';

export const historiaIslamClasico: HistoriaData = {
  slug: 'historia-islam-clasico',
  titulo: 'El Islam Clásico: De la Hégira a la Edad de Oro',
  subtitulo: 'Cómo en seis siglos la civilización islámica unificó Arabia, construyó el mayor Imperio del mundo y preservó y expandió el conocimiento humano',
  descripcionSEO: 'Cronología interactiva de la civilización islámica clásica: de la Hégira (622) al saco de Bagdad por los mongoles (1258). Los califatos, la Casa de la Sabiduría, Al-Ándalus, las Cruzadas y Saladino en 10 hitos y 6 eras.',
  keywords: [
    'islam clasico historia cronologia',
    'califato abasida bagdad casa de la sabiduria',
    'hegira mahoma unificacion arabia',
    'al-andalus cordoba averroes',
    'califato omeya expansion islamica',
    'saladino cruzadas jerusalem',
    'algebra al-khwarizmi edad de oro islamica',
    'mongoles saco bagdad fin califato',
  ],
  anioInicio: 622,
  anioFin: 1258,

  hitos: [
    {
      id: 'hegira-meca',
      nombre: 'La Hégira y la Unificación de Arabia',
      anioInicio: 622,
      anioFin: 632,
      color: '#1B5E20',
      categoria: 'fundacion',
      descripcion: 'La Hégira (622): Muhammad emigra de La Meca a Medina, punto de partida del calendario islámico. En 10 años, unifica militaria y políticamente la península arábiga, entonces fragmentada en tribus. A su muerte (632), Arabia está unificada bajo un sistema político-religioso inédito. El punto de partida de una de las mayores transformaciones de la historia.',
      obraIconica: 'La Hégira — 622. La emigración de La Meca a Medina: el año cero del calendario islámico y de la civilización islámica',
      paises: ['Arabia Saudí', 'Irak', 'Siria'],
    },
    {
      id: 'califas-rashidun',
      nombre: 'Los Califas Rashidun: La Expansión Relámpago',
      anioInicio: 632,
      anioFin: 661,
      color: '#2E7D32',
      categoria: 'fundacion',
      descripcion: 'Los cuatro califas "bien guiados" (Abu Bakr, Umar, Uthmán, Alí) dirigen la expansión más rápida de la historia: en 29 años conquistan Persia (Sasánida), Siria, Palestina, Egipto y el norte de África. El Imperio Romano de Oriente pierde sus provincias más ricas. La administración persa y bizantina es absorbida y adaptada.',
      obraIconica: 'Batalla de al-Qadisiyya — 636. El ejército árabe derrota al Imperio Persa Sasánida: cae la mayor potencia de Asia occidental',
      paises: ['Arabia', 'Irak', 'Siria', 'Palestina', 'Egipto', 'Irán'],
    },
    {
      id: 'califato-omeya',
      nombre: 'El Califato Omeya: Del Atlántico al Indo',
      anioInicio: 661,
      anioFin: 750,
      color: '#0277BD',
      categoria: 'califato',
      descripcion: 'Los omeyas trasladan la capital a Damasco y crean el mayor Imperio del mundo de su época. La expansión alcanza sus límites máximos: Al-Ándalus (711, cruzando Gibraltar), Asia Central (hasta el Indo), el Cáucaso. Detenidos en Poitiers por Carlos Martel (732) en Occidente y en Anatolia por Bizancio. La mezquita de Damasco, el Domo de la Roca en Jerusalén.',
      obraIconica: 'Domo de la Roca, Jerusalén — 691. El primer gran monumento arquitectónico islámico, construido sobre el monte del Templo',
      paises: ['Siria', 'España', 'Uzbekistán', 'Paquistán', 'Argelia'],
    },
    {
      id: 'califato-abasida',
      nombre: 'El Califato Abasí y la Fundación de Bagdad',
      anioInicio: 750,
      anioFin: 850,
      color: '#1565C0',
      categoria: 'califato',
      descripcion: 'Los abasíes derrocan a los omeyas y trasladan la capital a Bagdad (762), ciudad circular diseñada como centro del mundo. El califato incorpora la herencia persa y griega: administración sofisticada, mecenazgo intelectual, cosmopolitismo. Harún al-Rashid (califa de las Mil y Una Noches) simboliza el esplendor de la corte abasí.',
      obraIconica: 'Fundación de Bagdad — 762. La "Ciudad de la Paz": diseñada como círculo perfecto, capital del mundo durante 500 años',
      paises: ['Irak', 'Irán', 'Siria', 'Egipto'],
    },
    {
      id: 'bayt-al-hikma',
      nombre: 'La Casa de la Sabiduría: La Mayor Revolución Científica',
      anioInicio: 800,
      anioFin: 1000,
      color: '#FF8C00',
      categoria: 'ciencia',
      descripcion: 'El Califato abasí financia la traducción masiva del conocimiento griego, persa e indio al árabe. Al-Khwarizmi inventa el álgebra (820) y el algoritmo. Ibn al-Haytham funda la óptica experimental. Al-Biruni calcula el radio de la Tierra. Al-Razi (Rhazes) escribe la primera enciclopedia médica. Los números arábigos (origen indio) llegan a Europa. La civilización islámica salva y expande el conocimiento humano.',
      obraIconica: 'Kitab al-Mukhtasar — Al-Khwarizmi, ~820. El libro del álgebra: la palabra "álgebra" viene del árabe al-jabr',
      paises: ['Irak', 'Irán', 'Uzbekistán', 'Siria'],
    },
    {
      id: 'al-andalus',
      nombre: 'Al-Ándalus: La Joya de Occidente',
      anioInicio: 711,
      anioFin: 1031,
      color: '#7B1FA2',
      categoria: 'cultura',
      descripcion: 'El Califato de Córdoba bajo Abd al-Rahman III (929) es la ciudad más grande y culta de Europa: 500.000 habitantes, 70 bibliotecas, alumbrado público. Averroes (Ibn Rushd) comenta a Aristóteles y transmite la filosofía griega a Europa medieval. Maimónides, judío cordobés, escribe en árabe. La mezquita de Córdoba. El esplendor que la Reconquista irá deshaciendo.',
      obraIconica: 'Mezquita de Córdoba — comenzada 785. El bosque de columnas más hermoso de la arquitectura islámica, en el corazón de España',
      paises: ['España', 'Portugal', 'Marruecos'],
    },
    {
      id: 'fragmentacion-fatimies',
      nombre: 'La Fragmentación: Fatimíes, Buyíes y Selyúcidas',
      anioInicio: 900,
      anioFin: 1100,
      color: '#5D4037',
      categoria: 'califato',
      descripcion: 'El Califato abasí pierde poder político real: los Buyíes (persas chiíes) controlan Bagdad. Los Fatimíes (chiíes ismaelíes) fundan El Cairo (969) y crean un califato rival. Los turcos Selyúcidas conquistan Bagdad (1055) y se convierten en los protectores suníes del califato. El Islam se fragmenta políticamente pero mantiene su unidad cultural.',
      obraIconica: 'Fundación de El Cairo por los Fatimíes — 969. La ciudad que rivaliza con Bagdad como capital del mundo islámico',
      paises: ['Irak', 'Egipto', 'Siria', 'Irán', 'Turquía'],
    },
    {
      id: 'cruzadas-saladin',
      nombre: 'Las Cruzadas y la Respuesta de Saladino',
      anioInicio: 1096,
      anioFin: 1193,
      color: '#C62828',
      categoria: 'conflicto',
      descripcion: 'Las Cruzadas (desde 1096) son respondidas por Saladino (Salah al-Din), kurdo al servicio de los selyúcidas: reconquista Jerusalén (1187) en la batalla de Hattin. Saladino es famoso por su caballerosidad con los vencidos. Ricardo Corazón de León lo respeta como adversario. Las Cruzadas aceleran la transferencia de conocimiento islámico a Europa Occidental.',
      obraIconica: 'Batalla de Hattin — 4 julio 1187. Saladino derrota a los cruzados y reconquista Jerusalén: 88 años del Reino Cruzado terminan',
      paises: ['Palestina', 'Siria', 'Irak', 'Egipto', 'Francia', 'Inglaterra'],
    },
    {
      id: 'ayyubies-mamelucos',
      nombre: 'Los Ayubíes y el Esplendor Final',
      anioInicio: 1171,
      anioFin: 1250,
      color: '#0288D1',
      categoria: 'califato',
      descripcion: 'La dinastía ayubí de Saladino consolida el poder en Egipto y Siria. Proliferan las madrasas, hospitales (bimaristanes) y caravanseráis. Los mamelucos (soldados-esclavos turcos) toman el poder en Egipto (1250): el último gran refugio antes de la tormenta mongola. Ibn Battuta y Marco Polo testimoniarán el esplendor de las ciudades islámicas.',
      obraIconica: 'La Ciudadela de El Cairo — Saladino, 1176. La mayor fortaleza medieval de Oriente Próximo, símbolo del poder ayubí',
      paises: ['Egipto', 'Siria', 'Irak', 'Arabia'],
    },
    {
      id: 'mongoles-bagdad',
      nombre: 'El Saco de Bagdad: El Fin de la Edad de Oro',
      anioInicio: 1256,
      anioFin: 1258,
      color: '#880E4F',
      categoria: 'conflicto',
      descripcion: 'El nieto de Gengis Kan, Hulagu, derroca el califato abasí y destruye Bagdad (febrero 1258): el califa Al-Mustasim es ejecutado, la Casa de la Sabiduría incendiada, el Tigris tiñe de sangre durante días. 800.000 muertos según las crónicas. Fin del califato que duró 500 años. Los mamelucos egipcios detienen a los mongoles en Ain Jalut (1260): el Islam sobrevive.',
      obraIconica: 'Saco de Bagdad — febrero 1258. Los mongoles destruyen la capital del saber: el Tigris teñido de tinta de los libros quemados',
      paises: ['Irak', 'Irán', 'Siria', 'Egipto'],
    },
  ],

  eras: [
    {
      nombre: 'Arabia y los Primeros Califas',
      desde: 622,
      hasta: 661,
      icono: '🌙',
      hitosDestacados: [
        'La Hégira y la Unificación de Arabia',
        'Los Califas Rashidun: La Expansión Relámpago',
      ],
      eventos: [
        '622: La Hégira — año cero del calendario islámico',
        '630: Mahoma entra en La Meca sin derramamiento de sangre',
        '636: Batalla de al-Qadisiyya — cae el Imperio Persa Sasánida',
      ],
    },
    {
      nombre: 'La Expansión Omeya',
      desde: 661,
      hasta: 750,
      icono: '🌍',
      hitosDestacados: ['El Califato Omeya: Del Atlántico al Indo'],
      eventos: [
        '661: Muawiya funda el Califato Omeya con capital en Damasco',
        '691: Construcción del Domo de la Roca en Jerusalén',
        '711: Tariq ibn Ziyad cruza el estrecho de Gibraltar — comienza Al-Ándalus',
      ],
    },
    {
      nombre: 'El Califato Abasí: Bagdad y la Casa de la Sabiduría',
      desde: 750,
      hasta: 900,
      icono: '📚',
      hitosDestacados: [
        'El Califato Abasí y la Fundación de Bagdad',
        'La Casa de la Sabiduría: La Mayor Revolución Científica',
      ],
      eventos: [
        '762: Fundación de Bagdad como capital circular',
        '786: Harún al-Rashid — el califa de las Mil y Una Noches',
        '820: Al-Khwarizmi escribe el primer libro de álgebra',
      ],
    },
    {
      nombre: 'La Edad de Oro del Islam',
      desde: 900,
      hasta: 1100,
      icono: '⭐',
      hitosDestacados: [
        'Al-Ándalus: La Joya de Occidente',
        'La Fragmentación: Fatimíes, Buyíes y Selyúcidas',
      ],
      eventos: [
        '929: Abd al-Rahman III proclama el Califato de Córdoba',
        '965: Ibn al-Haytham funda la óptica experimental',
        '1055: Los selyúcidas turcos toman el control de Bagdad',
      ],
    },
    {
      nombre: 'Las Cruzadas y la Resistencia',
      desde: 1100,
      hasta: 1200,
      icono: '⚔️',
      hitosDestacados: ['Las Cruzadas y la Respuesta de Saladino'],
      eventos: [
        '1099: Los cruzados toman Jerusalén — masacre de la población',
        '1187: Saladino derrota a los cruzados en Hattin y toma Jerusalén',
        '1193: Muerte de Saladino — el adversario más respetado de las Cruzadas',
      ],
    },
    {
      nombre: 'El Crepúsculo y los Mongoles',
      desde: 1200,
      hasta: 1258,
      icono: '💀',
      hitosDestacados: [
        'Los Ayubíes y el Esplendor Final',
        'El Saco de Bagdad: El Fin de la Edad de Oro',
      ],
      eventos: [
        '1220: Los mongoles devastan Samarcanda y Bujará',
        '1250: Los mamelucos toman el poder en Egipto',
        '1258: Hulagu destruye Bagdad — fin del califato abasí',
      ],
    },
  ],

  categorias: {
    fundacion: 'Fundación y Expansión',
    califato: 'Los Califatos',
    ciencia: 'Ciencia y Filosofía',
    cultura: 'Arte y Cultura',
    conflicto: 'Guerras y Conflictos',
  },

  colores: {
    fundacion: '#1B5E20',
    califato: '#0277BD',
    ciencia: '#FF8C00',
    cultura: '#7B1FA2',
    conflicto: '#C62828',
  },

  disclaimer: 'exempt',

  educativo: {
    intro: 'Entre los siglos VII y XIII, la civilización islámica fue el centro del mundo intelectual: preservó y expandió el conocimiento griego, persa e indio cuando Europa vivía su Edad Oscura. El álgebra, los algoritmos, la óptica moderna, la medicina clínica y la filosofía aristotélica llegaron a Europa medieval a través de los traductores árabes. Sin la Edad de Oro islámica, el Renacimiento europeo habría tardado siglos más.',

    tablaComparativa: [
      {
        hito: 'Arabia y los Primeros Califas',
        periodo: '622-661',
        categoria: 'Fundación y Expansión',
        personaje: 'Muhammad / Abu Bakr / Umar',
        aportacion: 'Unificación de Arabia y conquista de Persia, Siria y Egipto en menos de 30 años',
      },
      {
        hito: 'La Expansión Omeya',
        periodo: '661-750',
        categoria: 'Los Califatos',
        personaje: 'Muawiya / Abd al-Malik / Tariq ibn Ziyad',
        aportacion: 'Mayor Imperio del mundo: del Atlántico al Indo. Domo de la Roca. Al-Ándalus',
      },
      {
        hito: 'El Califato Abasí',
        periodo: '750-900',
        categoria: 'Los Califatos',
        personaje: 'Al-Mansur / Harún al-Rashid / Al-Mamún',
        aportacion: 'Bagdad como capital del mundo. Casa de la Sabiduría. Álgebra y astronomía',
      },
      {
        hito: 'La Edad de Oro',
        periodo: '900-1100',
        categoria: 'Ciencia y Filosofía',
        personaje: 'Al-Khwarizmi / Ibn al-Haytham / Averroes',
        aportacion: 'Revolución científica global. Óptica, medicina, filosofía. Córdoba la más culta de Europa',
      },
      {
        hito: 'Las Cruzadas y la Resistencia',
        periodo: '1100-1200',
        categoria: 'Guerras y Conflictos',
        personaje: 'Saladino / Ricardo I de Inglaterra',
        aportacion: 'Reconquista de Jerusalén (1187). Transferencia del saber islámico a Europa vía Cruzadas',
      },
      {
        hito: 'El Crepúsculo y los Mongoles',
        periodo: '1200-1258',
        categoria: 'Guerras y Conflictos',
        personaje: 'Hulagu Khan / Al-Mustasim',
        aportacion: 'Destrucción de Bagdad (1258). Los mamelucos detienen a los mongoles en Ain Jalut (1260)',
      },
    ],

    escenarios: [
      {
        icono: '🐪',
        titulo: '¿Cómo pudo Arabia conquistar Persia y Bizancio en 30 años?',
        perfil: 'Estudiantes de historia y geopolítica',
        texto: 'Dos factores convergieron: el agotamiento mutuo de Persia y Bizancio tras décadas de guerra entre ellos, y la cohesión política y motivacional de las tribus árabes recién unificadas. Los ejércitos islámicos eran más ligeros, motivados y adaptados al terreno. Las provincias conquistadas recibieron una fiscalidad más baja que la romana o persa, facilitando la colaboración local.',
      },
      {
        icono: '📖',
        titulo: 'La Casa de la Sabiduría: el mayor proyecto intelectual antes de internet',
        perfil: 'Curiosos por la historia de la ciencia',
        texto: 'Entre los siglos VIII y X, Bagdad financió la traducción de todo el conocimiento griego, persa e indio al árabe: Aristóteles, Euclides, Ptolomeo, Galeno, el cero indio. Los sabios no solo tradujeron: corrigieron errores, añadieron descubrimientos propios y exportaron el resultado a Europa. El álgebra, los algoritmos y la trigonometría esférica son invenciones de esta era.',
      },
      {
        icono: '🏰',
        titulo: 'Al-Ándalus: ¿convivencia o tolerancia forzada?',
        perfil: 'Interesados en historia medieval española',
        texto: 'Al-Ándalus fue compleja: dhimmis (judíos y cristianos) pagaban un impuesto especial y tenían restricciones, pero gozaban de autonomía religiosa y podían alcanzar puestos de relevancia. Maimónides (judío) y Averroes (filósofo) prosperaron bajo mecenazgo islámico. No fue ni utopía ni infierno: fue una sociedad medieval con sus jerarquías, más tolerante que gran parte de Europa en la misma época.',
      },
      {
        icono: '🔥',
        titulo: '¿Qué habría pasado si los mongoles no destruyen Bagdad?',
        perfil: 'Aficionados a la historia contrafactual',
        texto: 'La destrucción de la Casa de la Sabiduría en 1258 interrumpió una tradición científica acumulada durante 500 años. Sin ese colapso, la revolución científica islámica podría haberse adelantado siglos. Irónicamente, gran parte del saber conservado en copias llegó a Europa gracias a las traducciones medievales anteriores al saco. Los mamelucos detuvieron a los mongoles en Ain Jalut (1260): sin esa victoria, Egipto habría caído y el Islam mediterráneo podría haber desaparecido.',
      },
    ],

    faq: [
      {
        pregunta: '¿Qué significa califato?',
        respuesta: 'Califato (del árabe "khalifa", sucesor) es el sistema de gobierno islámico en el que un califa actúa como sucesor político y religioso de Muhammad. Los califatos más importantes fueron el Rashidun (632-661), el Omeya (661-750) y el Abasí (750-1258). El título implicaba liderazgo sobre toda la comunidad islámica, aunque en la práctica el poder se fragmentó pronto.',
        tip: 'El término "califa" designaba al gobernante político, no a un líder espiritual equivalente al Papa católico.',
      },
      {
        pregunta: '¿Cuál fue la diferencia entre suníes y chiíes?',
        respuesta: 'La división surgió tras la muerte de Muhammad (632) sobre quién debía sucederle. Los suníes aceptaron a Abu Bakr como primer califa por consenso de la comunidad. Los chiíes consideraban que el liderazgo debía pertenecer a Alí, primo y yerno de Muhammad, y a sus descendientes. La batalla de Kerbala (680), donde el hijo de Alí, Husein, fue asesinado, consolidó la división que perdura hoy.',
        tip: 'Hoy el 85-90% de los musulmanes son suníes. Irán, Irak y Baréin tienen mayorías chiíes.',
      },
      {
        pregunta: '¿Por qué el árabe se convirtió en lengua del conocimiento?',
        respuesta: 'Cuando el Califato abasí financió la traducción masiva del conocimiento antiguo al árabe (siglos VIII-X), el árabe se convirtió en la lingua franca de la ciencia mundial durante 500 años. Las obras de Aristóteles, Galeno, Euclides o Ptolomeo sobrevivieron en árabe cuando los originales griegos se perdieron. Europa medieval recuperó gran parte del pensamiento griego clásico mediante traducciones del árabe al latín.',
        tip: 'Palabras como álgebra, algoritmo, cifra, cenit, cénit o alcohol vienen del árabe.',
      },
      {
        pregunta: '¿Qué es la Hégira?',
        respuesta: 'La Hégira (del árabe "hijra", emigración) es la huida de Muhammad de La Meca a Medina en el año 622 d.C. para escapar de la persecución de los clanes quraysíes. Este evento marca el año 1 del calendario lunar islámico (AH, Anno Hegirae). No fue solo una huida: en Medina Muhammad estableció la primera comunidad política islámica y la Constitución de Medina, base del Estado islámico.',
        tip: 'El año islámico es lunar (354 días), por lo que no coincide exactamente con el gregoriano solar.',
      },
      {
        pregunta: '¿Cuándo terminó la Edad de Oro islámica?',
        respuesta: 'No hay una fecha única: el proceso fue gradual. El saco de Bagdad por los mongoles (1258) destruyó el centro intelectual más importante. La Reconquista española eliminó progresivamente Al-Ándalus (1492, caída de Granada). Las pestes del siglo XIV, la fragmentación política y el desplazamiento de las rutas comerciales hacia el Atlántico completaron el declive. Sin embargo, el Imperio Otomano (siglos XIV-XVII) produjo su propia Edad de Oro cultural.',
        tip: 'La imprenta de Gutenberg (1450) aceleró la difusión del conocimiento europeo justo cuando el mundo islámico se fragmentaba.',
      },
    ],

    pasos: [
      {
        titulo: 'Empieza por la Hégira: el punto cero',
        cuerpo: 'En 622, Arabia era un mosaico de tribus sin unidad política. En 30 años, un sistema político nuevo unificó la península y conquistó dos imperios. Haz clic en "La Hégira y la Unificación de Arabia" para entender el punto de partida: qué hacía tan especial el modelo político que surgió en Medina.',
      },
      {
        titulo: 'Sigue la expansión en el mapa mental',
        cuerpo: 'Del 622 al 750 (128 años), el Islam pasó de una ciudad a controlar desde el Atlántico hasta el Indo. Compara los hitos "Califas Rashidun" y "Califato Omeya": el primero conquistó el corazón del mundo antiguo (Persia, Siria, Egipto); el segundo llegó a los extremos (Hispania, Uzbekistán). La velocidad de expansión no tiene paralelo en la historia.',
      },
      {
        titulo: 'Descubre la revolución científica de Bagdad',
        cuerpo: 'El hito "Casa de la Sabiduría" es el más sorprendente: mientras Europa vivía siglos oscuros, Bagdad era la capital mundial de la ciencia. Álgebra, algoritmos, óptica experimental, geografía matemática y enciclopedias médicas. Sin este período, el Renacimiento europeo habría tardado siglos más.',
      },
      {
        titulo: 'Explora Al-Ándalus: la Europa que pudo ser',
        cuerpo: 'Córdoba en el siglo X era la ciudad más grande y culta de Europa. Usa la tabla Comparativa para ver qué produjeron culturalmente en cada era. El contraste entre Al-Ándalus (siglo X) y la Europa carolingia contemporánea es uno de los paralelos más reveladores de la historia medieval.',
      },
      {
        titulo: 'Cierra con el colapso mongol para entender el legado',
        cuerpo: 'El saco de Bagdad (1258) no borró el legado: lo dispersó. El conocimiento ya había viajado a Europa vía Al-Ándalus y las Cruzadas. Los mamelucos sobrevivieron. El Islam se reconstruyó. La Era de las Eras te muestra cómo cada período dejó una capa de herencia que llega hasta hoy.',
      },
    ],

    tips: [
      {
        icono: '🔢',
        texto: 'Los "números arábigos" (0, 1, 2... 9) que usamos hoy son en realidad de origen indio. Los matemáticos árabes los adoptaron en el siglo IX y los transmitieron a Europa. Antes de ellos, Europa usaba los números romanos (I, V, X...) — hacer multiplicaciones con números romanos es extraordinariamente difícil.',
      },
      {
        icono: '🗺️',
        texto: 'El Islam clásico fue el sistema de comercio global más extenso de su época: desde el Atlántico hasta China. Las rutas de la seda, el comercio del Índico y las caravanas del Sahara convergían en Bagdad y El Cairo. Esa red comercial fue también una red de transmisión de ideas, técnicas y culturas.',
      },
      {
        icono: '📐',
        texto: 'La palabra "algoritmo" viene de "Al-Khwarizmi", el matemático de Bagdad que en el 820 describió el procedimiento paso a paso para resolver ecuaciones. La palabra "álgebra" viene de su obra "Al-Kitab al-mukhtasar fi hisab al-jabr": al-jabr significa "restauración", la operación de pasar términos de un lado al otro de la ecuación.',
      },
      {
        icono: '🌐',
        texto: 'En el momento de máximo esplendor del Califato abasí (siglo IX), Bagdad tenía entre 500.000 y 1.000.000 de habitantes — comparable a Roma en su apogeo. Era una ciudad multicultural: árabes, persas, griegos, judíos, nestorianos y zoroástricos convivían y colaboraban en el proyecto intelectual más ambicioso de la historia hasta entonces.',
      },
    ],

    errores: [
      {
        titulo: 'El Islam siempre fue homogéneo y unido',
        cuerpo: 'La división suní-chií surgió en los primeros 50 años del Islam (batalla de Kerbala, 680). A partir del siglo X, el Califato abasí era un título nominal: el poder real lo tenían los Buyíes chiíes, los Fatimíes en Egipto o los Selyúcidas turcos. Nunca hubo un "Islam unido" político: la unidad fue cultural, lingüística y religiosa, pero los estados siempre compitieron entre sí.',
      },
      {
        titulo: 'La ciencia islámica solo copió y transmitió a los griegos',
        cuerpo: 'Los sabios islámicos no solo tradujeron: innovaron. Al-Khwarizmi inventó el álgebra (no existía en Grecia). Ibn al-Haytham fundó la óptica experimental moderna rechazando la teoría griega de la visión. Al-Biruni calculó el radio de la Tierra con un método geométrico propio. Al-Razi clasificó las enfermedades clínicamente por primera vez. El progreso fue genuino, no mera copia.',
      },
      {
        titulo: 'Las Cruzadas fueron una respuesta al Islam agresivo',
        cuerpo: 'Las Cruzadas (1096-1291) fueron convocadas por el Papa Urbano II en un contexto específico: la conquista selyúcida de Anatolia (antes cristiana) y las dificultades de los peregrinos en Jerusalén. El Islam llevaba 400 años en Palestina sin que Europa reaccionara. La motivación fue compleja: religiosa, política y económica. Los cruzados masacraron judíos, griegos ortodoxos y musulmanes por igual en su camino.',
      },
      {
        titulo: 'Los mongoles destruyeron toda la civilización islámica',
        cuerpo: 'El saco de Bagdad (1258) fue catastrófico pero no definitivo. Egipto, bajo los mamelucos, resistió: en la batalla de Ain Jalut (1260) derrotaron a los mongoles por primera vez. Al-Ándalus continuó hasta 1492. El Imperio Otomano (siglo XIV en adelante) produjo su propia Edad de Oro. Los propios mongoles se islamizaron: el Ilkanato persa abrazó el Islam en el siglo XIV.',
      },
    ],
  },
};
